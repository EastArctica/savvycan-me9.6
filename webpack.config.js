const path = require('path');

module.exports = {
  entry: {
    //authorization: './src/authorize/index.ts',
    test: './src/test/index.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'this'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  externals: {
    can: 'can',
    hos: 'host'
  }
};
