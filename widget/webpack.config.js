'use strict';
const webpack = require('webpack')
const path = require('path')
const fs = require('fs')
const glob = require("glob")

const debug = process.argv.indexOf('-d') !== -1

let plugins = [
    // new webpack.optimize.UglifyJsPlugin({
    //     compress: {
    //         warnings: debug,
    //     },
    //     output: {
    //         comments: false,
    //     },
    // }),
    new webpack.ProvidePlugin({
        $api: "$api",
        api: "api",
        // "$": "jQuery",
        // "jquery": "jQuery"
    })
]

let globmaths = glob.sync(path.join(__dirname, "./src/pages/*.js"), {
    nodir: true,
})

let entry = globmaths.reduce((obj, file) => {
    let filename = path.basename(file).split(".")[0]
    obj[filename] = ["babel-polyfill", file]
    return obj
}, {})

module.exports = {
    entry: entry,
    output: {
        path: path.join(__dirname, './lib'),
        filename: "[name].js",
    },
    externals: {
        // require("jquery") is external and available
        //  on the global var jQuery
        "api": "api",
        "$api": "$api",
        "$": "jQuery",
        "jquery": "jQuery"
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
            {
                test: /\.css$/,
                loaders: ["style-loader", 'css-loader']
            },
            {
                test: /\.(png|jpg)$/,
                loader: 'url-loader'
            }
        ]
    },
    plugins: plugins,
};