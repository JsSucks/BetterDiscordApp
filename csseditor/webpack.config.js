const
    path = require('path'),
    webpack = require('webpack');
const vueLoader = {
    test: /\.(vue)$/,
    exclude: /node_modules/,
    loader: 'vue-loader'
}

const scssLoader = {
    test: /\.(css|scss)$/,
    loader: ['css-loader', 'sass-loader']
}

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'csseditor.js'
    },
    module: {
        loaders: [vueLoader, scssLoader]
    },
    resolve: {
        alias: {
            vue$: path.resolve('..', 'node_modules', 'vue', 'dist', 'vue.esm.js')
        }
    }
};