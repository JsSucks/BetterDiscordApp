const args = process.argv;
const fs = require('fs');
const path = require('path');

const releaseInput = args[2] ? args[2].toLowerCase() : '';
const release = releaseInput == 'canary' ? 'DiscordCanary' : releaseInput == 'ptb' ? 'DiscordPTB' : 'Discord';
console.log(`Injecting into version ${release}`);
const discordPath = (function() {
    if (process.platform === 'win32') {
        const basedir = path.join(process.env.LOCALAPPDATA, release);
        if (!fs.existsSync(basedir)) throw new Error(`Cannot find directory for ${release}`);
        const version = fs.readdirSync(basedir).filter(f => fs.lstatSync(path.join(basedir, f)).isDirectory() && f.split('.').length > 1).sort().reverse()[0];
        const dir = path.join(basedir, version, 'resources');
        if (!version || !fs.existsSync(dir)) throw new Error(`Cannot find directory for ${release}`);
        return dir;
    }
    else if (process.platform == 'darwin') {
        const dir = path.join('/Applications', `${release}.app`, 'Contents', 'Resources');
        if (!fs.existsSync(dir)) throw new Error(`Cannot find directory for ${release}`);
        return dir;
    }
    const dir = path.join('usr', 'share', release.toLowerCase(), 'resources');
    if (!fs.existsSync(dir)) throw new Error(`Cannot find directory for ${release}`);
    return dir;
})();
console.log(`Found ${release} in ${discordPath}`);

const appPath = path.join(discordPath, 'app');
const packageJson = path.join(appPath, 'package.json');
const indexJs = path.join(appPath, 'index.js');

if (!fs.existsSync(appPath)) fs.mkdirSync(appPath);
if (fs.existsSync(packageJson)) fs.unlinkSync(packageJson);
if (fs.existsSync(indexJs)) fs.unlinkSync(indexJs);

console.log(`Writing package.json`);
fs.writeFileSync(packageJson, JSON.stringify({
    name: 'betterdiscord',
    description: 'BetterDiscord',
    main: 'index.js',
    private: true,
    dependencies: {}
}, null, 4));

console.log(`Writing index.js`);
fs.writeFileSync(indexJs, `const path = require('path');
const fs = require('fs');
const Module = require('module');
const electron = require('electron');
const basePath = path.join(__dirname, '..', 'app.asar');
const pkg = require(path.join(basePath, 'package.json'));
electron.app.getAppPath = () => basePath;
Module._load(path.join(basePath, pkg.main), null, true);
electron.app.on('ready', () => {new (require('${path.join(__dirname, '..', 'core').replace(/\\/g, '/')}').BetterDiscord)();});`);

console.log(`Injection successful, please restart ${release}.`);
