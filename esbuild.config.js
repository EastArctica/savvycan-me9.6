const esbuild = require('esbuild');
const path = require('path');

esbuild.build({
  entryPoints: [path.resolve(__dirname, './src/test/index.ts')],
  bundle: true,
  outfile: './dist/bundle.js',
  loader: {
    '.ts': 'ts',
  },
  plugins: [
    require('esbuild-plugin-babel')({
      include: /\.ts$/,
      exclude: /node_modules/,
    }),
  ],
}).catch(() => process.exit(1));
