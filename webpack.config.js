const path = require('path');

module.exports = {
  entry: './src/authorize.ts',  // Your entry file
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'  // Your final single output file
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
};
