import typescript from 'rollup-plugin-typescript2';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/test/index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'es'
  },
  plugins: [
    typescript(),
    babel({
      exclude: 'node_modules/**',
      extensions: ['.js', '.ts']
    })
  ]
};
