const path = require('path');

module.exports = {
    entry: {
        main: './src/index.js',
        worker: './src/worker.js',
        serviceworker: './src/serviceworker.js',
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist'
    },
    resolve: {
        extensions: ['.wasm', '.mjs', '.js', '.json']
    },
    module: {
        rules: [
            {
                test: /\.mjs$/,
                include: /node_modules/,
                type: "javascript/auto",
            }
        ]
    },
    mode: 'development',
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    }
};