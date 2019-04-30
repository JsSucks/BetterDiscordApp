const bdinfo = require('./bd');
const { app } = require('electron');
const path = require('path');
const os = require('os');
const Module = require('module');

const packagePath = path.resolve(__dirname, '..', 'app.asar');
app.getAppPath = () => packagePath;

function loadBd() {
    const userconfig = (() => {
        try {
            return require(path.resolve(os.homedir(), bdinfo.paths.userconfig));
        } catch (err) {}
    })() || {};

    const { BetterDiscord } = require(path.resolve(os.homedir(), (userconfig.paths || {}).core || bdinfo.paths.core));
    const instance = new BetterDiscord(bdinfo, userconfig);
}

app.on('ready', loadBd);

Module._load(app.getAppPath(), null, true);
