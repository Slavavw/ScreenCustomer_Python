const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

let mode = 'development';
if (process.env.NODE_ENV === 'production') mode = 'production';
console.log(mode);

module.exports = {
  mode: mode,
  devtool: mode === 'development' ? "inline-source-map" : "none",
  devtool: "source-map",
  /*entry: {
    index: [
      'babel-polyfill', //Применяет polyfill для полной эмуляции среды ES2015  
      '/src/app.jsx' //Задает точку входа (не обязана быть файлом *.jsx)  
    ]
  },*/
  entry: "/jsx/app.jsx",
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'app.js',
    clean: true, //указываем чтобы папка dist очищалась каждый раз при сборке
    assetModuleFilename: 'assets/[hash][ext][query]' //модуль ресурсов куда будут скидываться файлы рксурсов img etc..
  },
  module: {
    rules: [
      {
        loader: 'babel-loader',
        exclude: /node_modules/,
        test: /\.jsx$|\.js$/
      },
      /*{
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },*/
      {
        test: /\.(sa|sc|c)ss$/i,
        use: [MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /\.(img|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      }
    ]
  },
  plugins: [
    new HTMLWebpackPlugin({ template: "./index.html" }),
    new MiniCssExtractPlugin({ filename: '[name][hash].css' }),
    new CleanWebpackPlugin()
  ]
}