
const electron = require('electron');
const request = require(require('path').join(electron.remote.app.getAppPath(), 'node_modules', 'request'));

const http_path = electron.ipcRenderer.sendSync('--bd-webpack-server');

function _eval() {
    eval(arguments[0]);
}

function loadScript(url) {
    console.log('[BetterDiscord] loading script', url);

    request({
        url,
        strictSSL: false
    }, function (error, response, data) {
        if (error) console.error('[BetterDiscord] webpack chunk error', error);

        _eval(data);
    });
}

loadScript(`${http_path}/betterdiscord.client.js`);

// Patch document.head.appendChild to load new chunks properly
const appendChild = document.head.appendChild;
document.head.appendChild = function (script, ...args) {
    if (script.tagName.toLowerCase() !== 'script' || !script.src.startsWith(`${http_path}/`)) {
        return appendChild.call(this, script, ...args);
    }

    loadScript(script.src);
};
