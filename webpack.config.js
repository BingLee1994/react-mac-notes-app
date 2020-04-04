const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const path = require("path");
const Env = require('./env');
const webpack = require('webpack');

let isPrd = process.env.NODE_ENV === 'production';

const config = {
    mode: isPrd ? 'production' : 'development',
    devtool: isPrd ? 'nosources-source-map' : 'cheap-module-eval-source-map',
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
                use: 'babel-loader'
            },
            {
                test: /\.scss$/,
                loader: (function () {
                    let loader = [
                        'css-loader',
                        'resolve-url-loader',
                        'sass-loader'
                    ];
                    if (!isPrd) {
                        loader.unshift('style-loader');
                    } else {
                        loader.unshift(
                            {
                                loader: MiniCssExtractPlugin.loader,
                                options: {
                                    esModule: false,
                                },
                            })
                    }
                    return loader;
                })()
            },
            {
                test: /\.(ttf|eot|otf|woff|woff2)$/,
                use: 'file-loader?name=font/[name]-[hash].[ext]'
            },
            {
                test: /\.(png|svg|jpg)$/,
                use: 'file-loader?name=imgs/[name]-[hash].[ext]'
            }
        ]
    },
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
        }),
        new webpack.DefinePlugin({
            __ENV__: JSON.stringify(process.env.NODE_ENV),
            VERSION: JSON.stringify('1.0.0')
        })
    ]
};

if (isPrd) {
    config.plugins.push(
        new MiniCssExtractPlugin({
            filename: 'style/app[hash].css'
        })
    );

    config.optimization = {
        minimizer: [
            new UglifyJsPlugin({
                parallel: 4,
                sourceMap: false,
                uglifyOptions: {
                    output: {
                        comments: false,
                    }
                }
            })
        ],
    }
}

module.exports = config;