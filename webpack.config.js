const path = require('path');
// const webpack = require('webpack');


module.exports = {
  // the entry file for the bundle
  entry: path.join(__dirname, '/client/src/app.jsx'),
  // the bundle file we will get in the result
  output: {
    path: path.join(__dirname, '/client/dist/js'),
    filename: 'app.js',
  },
  module: {
    // apply loaders to files that meet given conditions
    loaders: [{
      test: /\.jsx?$/,
      // exclude: /node_modules/,
      include: [
        path.join(__dirname, '/client/src'),
        path.join(__dirname, '/node_modules/react-dates')
      ],
      loader: 'babel-loader',
      query: {
        presets: ["react", "es2015","stage-2"]
      }
    },
    {
      test: /\.(png|jpg|gif)$/,
      loader: 'url-loader',
      options: {
        limit: 8192
      }
    },
    {
      test: /\.css$/,
      use: [ 'style-loader','css-loader' ]
    },
    { 
      test: /\.json$/, 
      loaders: ['json-loader'] 
    }
  ]
  },
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  // resolve: {
  //   // extensions: ['', '.webpack.js', '.web.js', '.js']
  // },
  // target: 'node',
  // plugins: [
  //   new webpack.DefinePlugin({
  //       'process.env.NODE_ENV': JSON.stringify('development'),
  //       'global': {}, // bizarre lodash(?) webpack workaround
  //       'global.GENTLY': false // superagent client fix
  //   })
  // ],
  // start Webpack in a watch mode, so Webpack will rebuild the bundle on changes
  watch: true
};
