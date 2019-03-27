const path = require('path');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const jsLoader = {
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: {
        loader: 'babel-loader'
    }
};

const vueLoader = {
    test: /\.(vue)$/,
    use: 'vue-loader'
};

const scssLoader = {
    test: /\.scss$/,
    exclude: /node_modules/,
    use: ['css-loader', 'sass-loader']
};

module.exports = {
    context: __dirname,
    entry: './src/index.js',
    module: {
        rules: [jsLoader, vueLoader, scssLoader]
    },
    externals: {
        electron: 'require("electron")',
        fs: 'require("fs")',
        path: 'require("path")',
        util: 'require("util")',
        process: 'require("process")',
        net: 'require("net")',
        request: 'require(require("path").join(require("electron").remote.app.getAppPath(), "node_modules", "request"))',
        sparkplug: 'require("../../core/dist/sparkplug")',
        'node-crypto': 'require("crypto")',
        'child_process': 'require("child_process")'
    },
    resolve: {
        alias: {
            vue$: path.resolve(__dirname, '..', 'node_modules', 'vue', 'dist', 'vue.esm.js')
        },
        modules: [
            path.resolve(__dirname, '..', 'node_modules'),
            path.resolve(__dirname, '..', 'common', 'modules'),
            path.resolve(__dirname, 'src', 'modules'),
            path.resolve(__dirname, 'src', 'ui'),
            path.resolve(__dirname, 'src', 'plugins'),
            path.resolve(__dirname, 'src', 'structs'),
            path.resolve(__dirname, 'src', 'builtin')
        ]
    },
    node: {
        process: false,
        __filename: false,
        __dirname: false
    },
    plugins: [
        new VueLoaderPlugin()
    ]
};
