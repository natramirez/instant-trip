const path = require('path');
// const webpack = require('webpack');


module.exports = {
  // the entry file for the bundle
  entry: path.join(__dirname, '/client/src/app.js'),
  // the bundle file we will get in the result
  output: {
    path: path.join(__dirname, '/client/dist/js'),
    filename: 'app.js',
  },
  module: {
    // apply loaders to files that meet given conditions
    loaders: [
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[local]'
            }
          }
        ]
        // use: ['style-loader', 'css-loader']
      },
      {
      test: [/\.jsx?$/,/\.js?$/],
      // exclude: /node_modules/,
      include: [
        path.join(__dirname, '/client/src'),
        // path.join(__dirname, '/node_modules/react-dates'),
        // path.join(__dirname, '/node_modules/react-dates')

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
      test: /\.less$/,
      use: [ 'style-loader', // creates style nodes from JS strings
        'css-loader', // translates CSS into CommonJS
        'less-loader' // compiles Less to CSS
      ]
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
