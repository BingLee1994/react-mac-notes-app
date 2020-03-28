const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require("path");
const Env = require('./env');

module.exports = {
    mode: 'development',
    devtool: 'cheap-module-eval-source-map',
    entry: './client/index.js',
    output: {
        publicPath: '/',
        path: path.join(__dirname, Env.clientAppPath),
        filename: 'app[hash].js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use:'babel-loader'
            },
            {
                test: /\.scss$/,
                loader:['style-loader', 'css-loader', 'resolve-url-loader', 'sass-loader']
            },
            {
                test: /\.(ttf|eot|png|svg|jpg|woff|woff2)$/,
                use: 'file-loader'
            }
        ]
    },
    mode: 'development',
    devServer: {
        historyApiFallback: true,
        port: 8000,
        contentBase: path.join(__dirname, "dist")
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: "备忘录",
            filename: 'index.html',
            template: 'index.html',
            minify: true
        })
    ]
};