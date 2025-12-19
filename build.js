import * as esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path alias plugin with automatic index.js resolution
const aliasPlugin = {
  name: 'alias',
  setup(build) {
    build.onResolve({ filter: /^@\// }, args => {
      let resolvedPath = path.resolve(__dirname, 'src', args.path.slice(2));
      
      // If path doesn't have an extension, check if it's a directory
      if (!path.extname(resolvedPath)) {
        const indexPath = path.join(resolvedPath, 'index.js');
        if (fs.existsSync(indexPath)) {
          resolvedPath = indexPath;
        } else if (!fs.existsSync(resolvedPath)) {
          // Try adding .js extension
          resolvedPath = resolvedPath + '.js';
        }
      }
      
      return {
        path: resolvedPath
      };
    });
  }
};

const isWatch = process.argv.includes('--watch');

const buildOptions = {
  entryPoints: ['src/index.js'],
  bundle: true,
  platform: 'node',
  outfile: 'dist/index.js',
  plugins: [aliasPlugin],
  format: 'esm'
};

if (isWatch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await esbuild.build(buildOptions);
}
