const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');

var config = {
  entry: path.resolve(__dirname + '/src/ScratchCard.vue'),
  output: {
    path: path.resolve(__dirname + '/dist/'),
    filename: 'vue-scratchcard.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: __dirname,
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ],
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin( {
      minimize : true,
      sourceMap : false,
      mangle: true,
      compress: {
        warnings: false
      }
    })
  ]
};

module.exports = [
  merge(config, {
    entry: path.resolve(__dirname + '/src/plugin.js'),
    output: {
      filename: 'vue-scratchcard.min.js',
      libraryTarget: 'window',
      library: 'VueScratchCard'
    }
  }),
  merge(config, {
    entry: path.resolve(__dirname + '/src/ScratchCard.vue'),
    output: {
      filename: 'vue-scratchcard.js',
      libraryTarget: 'umd',
      library: 'vue-scratchcard',
      umdNamedDefine: true
    }
  })
];
