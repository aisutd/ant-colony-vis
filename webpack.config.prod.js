const CopyWebpackPlugin = require('copy-webpack-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const path = require('path/posix')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const webpack = 

module.exports = {
    mode: 'production',
    module: {
        rules: [{
            test: /\.(js)$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader'
            }
        }]
    },
    optimization: {
        minimizer: [new UglifyJSPlugin({
            uglifyOptions: {
                output: {
                    comments: false //use it for removing comments like "/*! ... */"
                }
            }
        })]
    },
    plugins: [
        // new CopyWebpackPlugin({
        //     patterns: [
        //         {
        //             from: 'build/assets',
        //             to: 'assets'
        //         }
        //     ]}),
        new HTMLWebpackPlugin({
            template: 'build/index.html',
            filename: 'index.html',
            hash: false,
            minify: false
        })
    ],
    output: {
        path: path.resolve(__dirname, 'docs/'),
        filename: 'index.js'
    }
}