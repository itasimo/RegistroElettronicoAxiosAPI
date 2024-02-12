#include "rc4.h"

/************************************************************************/
/*
The original idea is to obtain one key at a time, decrypt the corresponding ciphertext, and see if the resulting plaintext satisfies a certain condition.
But the process requires too many intermediate variables, and on second thought, the plaintext and ciphertext are heterogeneous or related, so the known plaintext
If the text and the ciphertext are dissimilar, we can get the value of some position of the key stream. This saves a lot of space~~
*/
/************************************************************************/

__device__ void genKey(unsigned char *keyStartAddr, unsigned long long myKeyNum, int *key_len)
{
  /*	char p = maxKeyLen - 1;
    while (myKeyNum && p >=0) {
      keyStartAddr[p--] = (myKeyNum - 1) % keyNum + start;
      myKeyNum = (myKeyNum - 1) / keyNum;
    }
    *key_len = (maxKeyLen - p - 1);
    return keyStartAddr + p + 1;
  */
  size_t i = 0;
  while (myKeyNum && i < maxKeyLen)
  {
    keyStartAddr[i++] = (myKeyNum - 1) % keyNum + start;
    myKeyNum = (myKeyNum - 1) / keyNum;
  }
  *key_len = (i);
}

__global__ void crackRc4Kernel(unsigned char *key, volatile size_t *found)
{
  int keyLen = 0;
  const unsigned long long totalThreadNum = gridDim.x * blockDim.x;
  const unsigned long long keyNum_per_thread = maxNum / totalThreadNum;
  unsigned long long myKeyNum = (threadIdx.x + blockIdx.x * blockDim.x);
  bool justIt;
  for (unsigned long long i = 0; i <= keyNum_per_thread; myKeyNum += totalThreadNum, ++i)
  {
    // vKey is a pointer to share_memory
    unsigned char *vKey = (shared_mem + memory_per_thread * threadIdx.x);
    genKey(vKey, myKeyNum, &keyLen);

    // Add the salt if it was specified.
    if (saltLen_device > 0)
    {
      memcpy(vKey + keyLen, salt_device, saltLen_device);
      keyLen = keyLen + saltLen_device;
    }

    justIt = device_isKeyRight(vKey, keyLen);

    // Exit if one of the other blocks found it
    if (*found != 0)
      asm("exit;");

    // the current key is not the requested one
    if (justIt)
    {
      // Find the matching key, write it to Host, save the data, modify found, and exit the program
      *found = keyLen;
      memcpy(key, vKey, keyLen);
      key[keyLen] = 0;
      __threadfence();
      asm("exit;");
      break;
    }
  }
}

void cleanup(unsigned char *key_dev, size_t *found_dev)
{
  cudaFree(key_dev);
  cudaFree(found_dev);
  return;
}

// Helper function for using CUDA to add vectors in parallel.
cudaError_t crackRc4WithCuda(unsigned char *knownKeyStream_host, size_t knownStreamLen_host, unsigned char *key, size_t *foundLen, unsigned char *saltHost, size_t saltLenHost)
{
  cudaError_t cudaStatus;

  // Choose which GPU to run on, change this on a multi-GPU system.
  cudaStatus = cudaSetDevice(0);
  if (cudaStatus != cudaSuccess)
  {
    fprintf(stderr, "cudaSetDevice failed!  Do you have a CUDA-capable GPU installed?");
    return cudaStatus;
  }

  unsigned char *key_dev;

  cudaDeviceProp prop;
  cudaGetDeviceProperties(&prop, 0);

  cudaStatus = cudaMalloc((void **)&key_dev, (MAX_KEY_LENGTH + 1) * sizeof(unsigned char));
  if (cudaStatus != cudaSuccess)
  {
    fprintf(stderr, "cudaMalloc failed!");
    cudaFree(key_dev);
    return cudaStatus;
  }

  size_t *found_dev;

  cudaStatus = cudaMalloc((void **)&found_dev, sizeof(size_t));
  if (cudaStatus != cudaSuccess)
  {
    fprintf(stderr, "cudaMalloc failed!");
    cleanup(key_dev, found_dev);
    return cudaStatus;
  }

  // Check if the key variable is found
  cudaStatus = cudaMemcpy(found_dev, foundLen, sizeof(size_t), cudaMemcpyHostToDevice);
  if (cudaStatus != cudaSuccess)
  {
    fprintf(stderr, "cudaMemcpy failed!");
    cleanup(key_dev, found_dev);
    return cudaStatus;
  }

  // Copy constant memory
  cudaStatus = cudaMemcpyToSymbol(salt_device, saltHost, sizeof(unsigned char) * saltLenHost);
  if (cudaStatus != cudaSuccess)
  {
    fprintf(stderr, "cudaMemcpyToSymbol salt failed!");
    cleanup(key_dev, found_dev);
    return cudaStatus;
  }

  cudaStatus = cudaMemcpyToSymbol((const void *)&saltLen_device, (const void *)&saltLenHost, sizeof(unsigned char));
  if (cudaStatus != cudaSuccess)
  {
    fprintf(stderr, "cudaMemcpyToSymbol saltLen failed!");
    cleanup(key_dev, found_dev);
    return cudaStatus;
  }

  cudaStatus = cudaMemcpyToSymbol(knowStream_device, knownKeyStream_host, sizeof(unsigned char) * knownStreamLen_host);
  if (cudaStatus != cudaSuccess)
  {
    fprintf(stderr, "cudaMemcpyToSymbol stream failed!");
    cleanup(key_dev, found_dev);
    return cudaStatus;
  }

  cudaStatus = cudaMemcpyToSymbol((const void *)&knownStreamLen_device, (const void *)&knownStreamLen_host, sizeof(unsigned char));
  if (cudaStatus != cudaSuccess)
  {
    fprintf(stderr, "cudaMemcpyToSymbol streamlen failed!");
    cleanup(key_dev, found_dev);
    return cudaStatus;
  }

  // Launch a kernel on the GPU with one thread for each element.
  size_t threadNum = (prop.sharedMemPerBlock / MEMORY_PER_THREAD), share_memory = prop.sharedMemPerBlock; // FIXME double check that this works
  if (threadNum > MAX_THREAD_NUM)
  {
    threadNum = MAX_THREAD_NUM;
    share_memory = threadNum * MEMORY_PER_THREAD;
  }

  crackRc4Kernel<<<BLOCK_NUM, threadNum, share_memory>>>(key_dev, found_dev);

  // Check for any errors launching the kernel
  cudaStatus = cudaGetLastError();
  if (cudaStatus != cudaSuccess)
  {
    fprintf(stderr, "addKernel launch failed: %s\n", cudaGetErrorString(cudaStatus));
    cleanup(key_dev, found_dev);
    return cudaStatus;
  }

  // cudaDeviceSynchronize waits for the kernel to finish, and returns
  // any errors encountered during the launch.
  cudaStatus = cudaDeviceSynchronize();
  if (cudaStatus != cudaSuccess)
  {
    fprintf(stderr, "cudaDeviceSynchronize returned error code %d after launching addKernel!\n", cudaStatus);
    cleanup(key_dev, found_dev);
    return cudaStatus;
  }

  // Copy output vector from GPU buffer to host memory.
  cudaStatus = cudaMemcpy(key, key_dev, (MAX_KEY_LENGTH + 1) * sizeof(unsigned char), cudaMemcpyDeviceToHost);
  if (cudaStatus != cudaSuccess)
  {
    fprintf(stderr, "cudaMemcpy failed!");
    cleanup(key_dev, found_dev);
    return cudaStatus;
  }

  // Copy output vector from GPU buffer to host memory.
  cudaStatus = cudaMemcpy(foundLen, found_dev, sizeof(size_t), cudaMemcpyDeviceToHost);
  if (cudaStatus != cudaSuccess)
  {
    fprintf(stderr, "cudaMemcpy failed!");
    cleanup(key_dev, found_dev);
    return cudaStatus;
  }

  return cudaStatus;
}

int main(int argc, char *argv[])
{
  char *fileName = 0, *knownPlainText = 0, *knownKey = 0, *plainText = 0, *noNullSalt = 0, *saltFile = 0, *knownFile = 0;
  unsigned char *actualSalt = 0, *cipherText = 0, *actualPlainText = 0;
  unsigned char *s_box = (unsigned char *)malloc(sizeof(unsigned char) * 256);

  size_t cipherLength = 0, saltLength = 0, keyLength = 0, knownLength = 0;
  // handle options.
  for (size_t myarg = 1; myarg < argc; ++myarg) //(opt = getopt(argc, argv, "F:t:k:p:s:S:l:L:T:I:") != -1))
  {
    fprintf(stderr, "%s\n", argv[myarg]);
    if (argv[myarg][0] != '-' || strlen(argv[myarg]) != 2)
    {
      fprintf(stderr, "Unrecognized option: %s", argv[myarg]);
      return 1;
    }

    int opt = (int)argv[myarg][1];
    switch (opt)
    {
    case 'F':
      fileName = argv[++myarg];
      break;
    case 't':
      knownPlainText = argv[++myarg];
      break;
    case 'k':
      knownKey = argv[++myarg];
      break;
    case 'p':
      plainText = argv[++myarg];
      break;
    case 's':
      noNullSalt = argv[++myarg];
      break;
    case 'S':
      saltFile = argv[++myarg];
      break;
    case 'l':
      if (1 != sscanf(argv[++myarg], "%zu", &cipherLength))
      {
        fprintf(stderr, "Couldn't parse the length of the cipher text (-l)");
        return 1;
      }
      break;
    case 'L':
      if (1 != sscanf(argv[++myarg], "%zu", &saltLength))
      {
        fprintf(stderr, "Couldn't parse the length of the salt (-L)");
        return 1;
      }
      break;
    case 'T':
      knownFile = argv[++myarg];
      break;
    case 'I':
      if (1 != sscanf(argv[++myarg], "%zu", &knownLength))
      {
        fprintf(stderr, "Couldn't parse the length of known text (-T)");
        return 1;
      }
      break;
    default:
      fprintf(stderr, "Unrecognized command line argument");
      return 1;
    }
  }
  if ((knownPlainText == 0 && knownFile == 0) || (fileName == 0 && (plainText == 0 || knownKey == 0)))
  {
    fprintf(stderr, "You must specify the -t (the known plaintext) or -T (known text in a file) and either -F (a file name to decrypt) or -p (plain text to encrypt) and -k (a key to encrypt your plaintext)");
    return 1;
  }
  if (fileName != 0 && (plainText != 0 || knownKey != 0))
  {
    fprintf(stderr, "Specify either -F, for an input file, or -k and -p for a key and plaintext");
    return 1;
  }
  if (saltFile != 0 && noNullSalt != 0)
  {
    fprintf(stderr, "Specify either -S, for a salt from a file, or -s for a salt from the commandline");
  }
  if (knownFile != 0 && knownPlainText != 0)
  {
    fprintf(stderr, "Specify either -T, for a known text from a file, or -t for known text from the commandline");
  }
  // Get the salt if we have one
  if (saltFile != 0 || noNullSalt != 0) // do we have a salt specified?
  {
    if (saltFile != 0)
    {
      if (saltLength == 0)
      {
        fprintf(stderr, "Salt from file length not specified (-L) defaulting to 11 bytes");
        saltLength = 11;
      }
      FILE *saltPtr;
      saltPtr = fopen(saltFile, "rb");
      if (saltPtr == 0)
      {
        fprintf(stderr, "Could open file %s", saltFile);
        return 1;
      }
      actualSalt = (unsigned char *)malloc(sizeof(unsigned char) * saltLength);
      if (saltLength != fread(actualSalt, sizeof(unsigned char), saltLength, saltPtr))
      {
        fprintf(stderr, "Could not read all of %s", saltFile);
        return 1;
      }
      fclose(saltPtr);
    }
    else
    {
      saltLength = strlen(noNullSalt);
      actualSalt = (unsigned char *)malloc(sizeof(unsigned char) * saltLength);
      actualSalt = (unsigned char *)noNullSalt;
    }
  }
  // Get the cipher text
  if (fileName != 0)
  {
    if (cipherLength == 0)
    {
      fprintf(stderr, "Ciphertext length not specified (-l) defaulting to 128 bytes");
      cipherLength = 128;
    }
    FILE *cipherPtr;
    cipherPtr = fopen(fileName, "rb");
    if (cipherPtr == 0)
    {
      fprintf(stderr, "Could open file %s", fileName);
      return 1;
    }
    cipherText = (unsigned char *)malloc(sizeof(unsigned char) * cipherLength);
    if (cipherLength != fread(cipherText, sizeof(unsigned char), cipherLength, cipherPtr))
    {
      fprintf(stderr, "Could not read all of %s", fileName);
      return 1;
    }
    fclose(cipherPtr);
  }
  else
  {
    cipherLength = strlen(plainText);
    cipherText = (unsigned char *)malloc(cipherLength);
    cipherText = (unsigned char *)plainText;
    keyLength = strlen(knownKey);
    if (saltLength + keyLength > host_max_key)
    {
      fprintf(stderr, "The length of the specified key (or key + salt if specified) is greater than the max key length");
      return 1;
    }
    if (saltLength != 0) // if we have salt, append it
    {
      unsigned char *tempKey = (unsigned char *)malloc(sizeof(unsigned char) * (saltLength + keyLength));
      memcpy(tempKey, knownKey, keyLength);
      memcpy(tempKey + keyLength, actualSalt, saltLength);
      keyLength = keyLength + saltLength;
      prepare_key(tempKey, keyLength, s_box);
    }
    else
    {
      prepare_key((unsigned char *)knownKey, keyLength, s_box); // we know there are no nulls in the key from the command line
    }
    rc4(cipherText, cipherLength, s_box);
  }
  // Get the known plain text
  if (knownFile != 0)
  {
    if (knownLength == 0)
    {
      fprintf(stderr, "Known plain text from file length not specified (-I) defaulting to 8 bytes");
      knownLength = 8;
    }
    FILE *knownPtr;
    knownPtr = fopen(knownFile, "rb");
    if (knownPtr == 0)
    {
      fprintf(stderr, "Could open file %s", knownFile);
      return 1;
    }
    actualPlainText = (unsigned char *)malloc(sizeof(unsigned char) * knownLength);
    if (knownLength != fread(actualPlainText, sizeof(unsigned char), knownLength, knownPtr))
    {
      fprintf(stderr, "Could not read all of %s", knownFile);
      return 1;
    }
    fclose(knownPtr);
  }
  else
  {
    knownLength = strlen(knownPlainText);
    actualPlainText = (unsigned char *)malloc(sizeof(unsigned char) * knownLength);
    actualPlainText = (unsigned char *)knownPlainText;
  }
  if (knownLength >= host_max_known)
  {
    fprintf(stderr, "Known plain text is longer than MAX_KNOWN_STREAM_LEN");
    return 1;
  }

  unsigned char *knownKeyStream = (unsigned char *)malloc(sizeof(unsigned char) * knownLength);
  for (int i = 0; i < knownLength; i++)
  {
    knownKeyStream[i] = knownPlainText[i] ^ cipherText[i];
  }

  unsigned char *key = (unsigned char *)malloc(sizeof(unsigned char) * (MAX_KEY_LENGTH + 1));

  cudaEvent_t start, stop;
  cudaError_t cudaStatus = cudaEventCreate(&start);
  if (cudaStatus != cudaSuccess)
  {
    fprintf(stderr, "cudaEventCreate(start) failed!");
    return 1;
  }
  cudaStatus = cudaEventCreate(&stop);
  if (cudaStatus != cudaSuccess)
  {
    fprintf(stderr, "cudaEventCreate(stop) failed!");
    return 1;
  }

  cudaStatus = cudaEventRecord(start, 0);
  if (cudaStatus != cudaSuccess)
  {
    fprintf(stderr, "cudaEventRecord(start) failed!");
    return 1;
  }

  size_t foundKeyLen = 0;
  // Since null can be the value of any byte of the key we have to know the length
  cudaStatus = crackRc4WithCuda(knownKeyStream, knownLength, key, &foundKeyLen, actualSalt, saltLength);
  if (cudaStatus != cudaSuccess)
  {
    fprintf(stderr, "addWithCuda failed!");
    return 1;
  }

  cudaStatus = cudaEventRecord(stop, 0);
  if (cudaStatus != cudaSuccess)
  {
    fprintf(stderr, "cudaEventRecord(stop) failed!");
    return 1;
  }

  cudaStatus = cudaEventSynchronize(stop);
  if (cudaStatus != cudaSuccess)
  {
    fprintf(stderr, "cudaEventSynchronize failed!");
    return 1;
  }
  float useTime;
  cudaStatus = cudaEventElapsedTime(&useTime, start, stop);
  useTime /= 1000;
  printf("The time we used was:%fs\n", useTime);
  if (foundKeyLen != 0)
  {
    printf("The right key has been found.The right key is:%s\n", key);
    prepare_key(key, foundKeyLen, s_box);

    rc4(cipherText, cipherLength, s_box);

    std::ofstream outf("decrypted");
    outf.write((char *)cipherText, cipherLength);
    outf.close();
    std::ofstream outk("outkey");
    outk.write((char *)key, foundKeyLen);
    printf("\nThe clear text is:\n%s\n", cipherText);
  }

  cudaEventDestroy(start);
  cudaEventDestroy(stop);

  // Free all of our input variables
  free(key);
  free(knownKeyStream);
  free(s_box);

  cudaDeviceReset();
  return 0;
}
