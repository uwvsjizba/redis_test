const path = require("node:path");
const HtmlPlugin = require("html-webpack-plugin");
const EslingPlugin = require("eslint-webpack-plugin");


module.exports = {
    entry: "./src/index.js",
    output: {
        path: undefined,
        filename: "static/main.js",
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    "style-loader",
                    "css-loader",
                    "sass-loader"
                ]
            }
        ]
    },
    plugins: [
        new HtmlPlugin({
            template: path.resolve(__dirname, "../public/index.html")
        }),
        new EslingPlugin({
            context: path.resolve(__dirname + "../src")
        })
    ],
    devServer: {
        host: "localhost",
        port: "5173",
        open: true
    },
    mode: "development"
}