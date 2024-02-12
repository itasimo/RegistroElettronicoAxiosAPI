/* rc4.h */ 
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <iostream>
#include <fstream>
#include <time.h>
#include <math.h>
#include <Windows.h>

//This is binary so all characters are valid
#define START_CHARACTER 0x00
#define END_CHARACTER 0xFF
#define KEY (END_CHARACTER-START_CHARACTER+1)

#define BLOCK_NUM 32
#define MAX_THREAD_NUM 256

// Space for keys and S-boxen in the shared memory
#define MEMORY_PER_THREAD 276
#define MAX_KEY_LENGTH 16 //max key length
#define STATE_LEN	256
#define MAX_KNOWN_STREAM_LEN 64 //8

__constant__ unsigned long long maxNum = 0x10000000000; //This should be KEY ** MAX_KEY_LENGTH
__constant__ unsigned int maxKeyLen = MAX_KEY_LENGTH;
__constant__ unsigned int keyNum = KEY;
__constant__ unsigned int start = START_CHARACTER;
__constant__ unsigned int memory_per_thread = MEMORY_PER_THREAD;
__constant__ unsigned char knownStreamLen_device;
__constant__ unsigned char knowStream_device[MAX_KNOWN_STREAM_LEN];
__constant__ unsigned char saltLen_device;
__constant__ unsigned char salt_device[MAX_KEY_LENGTH];


const size_t host_max_key = MAX_KEY_LENGTH;
const size_t host_max_known = MAX_KNOWN_STREAM_LEN;


extern __shared__ unsigned char shared_mem[];

__device__ __host__ unsigned char rc4_single(unsigned char* x, unsigned char* y, unsigned char* s_box);
__device__ __host__ static void swap_byte(unsigned char *a, unsigned char *b);
//__device__ bool device_isKeyRight(const unsigned char *known_stream, int known_len,unsigned char *validateKey,int key_len);
__device__ __host__ unsigned char rc4_single(unsigned char*x, unsigned char * y, unsigned char *s_box);
void prepare_key(unsigned char *key_data_ptr, size_t key_data_len,unsigned char *s_box);
void rc4(unsigned char *buffer_ptr, size_t buffer_len, unsigned char *s_box);
/************************************************************************/
/* the data type is unsigned char,so the %256 is no necessary           */
/************************************************************************/

/**
 * \brief swap two bytes
 */
__device__ __host__ static void swap_byte(unsigned char *a, unsigned char *b) 
{ 
	unsigned char swapByte;  

	swapByte = *a;  
	*a = *b;      
	*b = swapByte; 
}

__device__ bool device_isKeyRight(const unsigned char *validateKey, const int key_len) 
{ 
	//KSA
  unsigned char* state = (shared_mem + (memory_per_thread * threadIdx.x) + maxKeyLen);
	unsigned char index1 = 0, index2 = 0;
	short counter = 0;

  // I've tried a couple of ways to speed up loading this (packing, copying from global literals etc.)
  // and this is the most efficent short of hand coding assembly so that each state staying in a register
	for(counter = 0; counter < STATE_LEN; counter++)
		state[counter] = counter;

	for(counter = 0; counter < STATE_LEN; counter++)      
	{             
		index2 = (validateKey[index1] + state[counter] + index2);            
		swap_byte( &state[counter], &state[index2]);
		index1 = (index1 + 1) % key_len;  
	} 

	//PRGA
	index1=0, index2=0, counter=0; 
	for (; counter < knownStreamLen_device; counter++)
	{
		if(knowStream_device[counter] != rc4_single( &index1, &index2, state))
			return false;
	}

	return true;
} 
/**
 * \brief rc4 encryption and decryption function
 * 
 * \param buffer_ptr,the data string to encryption 
 * \param buffer_len,the data length
 * \param key,rc4's s-box and the two key pointers,this was used to encryption the data
 *
 * \return void
**/
__device__ __host__ unsigned char rc4_single(unsigned char* x, unsigned char* y, unsigned char* s_box) 
{  
	unsigned char* state, xorIndex;

	state = &s_box[0];

	*x = (*x + 1);            
	*y = (state[*x] + *y);
	swap_byte(&state[*x], &state[*y]);

	xorIndex = (state[*x] + state[*y]);

	return  state[xorIndex];        
}

/**
 * \brief rc4 s-box init
 * 
 * \param key_data_ptr,the encryption key
 * \param key_data_len,the encryption key length,less than 256
 * \param key,rc4's s-box and the key two pointers
 *
 * \return void
**/
void prepare_key(unsigned char *key_data_ptr, size_t key_data_len, unsigned char* s_box) 
{ 
	unsigned char index1 = 0, index2 = 0, *state; 
	short counter; //FIXME figure out why this was a short before

	state = &s_box[0];        
	for(counter = 0; counter < STATE_LEN; counter++)          
		state[counter] = counter;   
	for(counter = 0; counter < STATE_LEN; counter++)      
	{             
		index2 = (key_data_ptr[index1] + state[counter] + index2);            
		swap_byte( &state[counter], &state[index2]);          

		index1 = (index1 + 1) % key_data_len;  
	}      
} 

void rc4(unsigned char *buffer_ptr, size_t buffer_len, unsigned char *s_box) 
{  
	unsigned char x = 0, y = 0, *state;
	short counter; 

	state = &s_box[0];        
	for(counter = 0; counter < buffer_len; counter ++)
	{  
		buffer_ptr[counter] ^= rc4_single( &x, &y, state);        
	}            
} 