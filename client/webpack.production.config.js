const path = require('path');

const baseconfig = require('./webpack.base.config');

const merge = require('webpack-merge');
const webpack = require('webpack');

const config = {
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'betterdiscord.client-release.js'
    },
    plugins: [
        new webpack.DefinePlugin({
            PRODUCTION: JSON.stringify(true)
        })
    ],
    externals: {
        sparkplug: 'require("../core/sparkplug")'
    }
};

module.exports = merge(baseconfig, config);
