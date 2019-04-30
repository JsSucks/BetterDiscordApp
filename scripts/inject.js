const process = require('process');
const fs = require('fs');
const path = require('path');

const args = process.argv;

const useBdRelease = args[2] && args[2].toLowerCase() === 'release';
const releaseInput = useBdRelease ? args[3] && args[3].toLowerCase() : args[2] && args[2].toLowerCase();
const release = releaseInput === 'canary' ? 'Discord Canary' : releaseInput === 'ptb' ? 'Discord PTB' : 'Discord';
console.log(`Injecting into version ${release}`);

const discordPath = (function() {
    if (process.platform === 'win32') {
        const basedir = path.join(process.env.LOCALAPPDATA, release.replace(/ /g, ''));
        if (!fs.existsSync(basedir)) throw new Error(`Cannot find directory for ${release}`);
        const version = fs.readdirSync(basedir).filter(f => fs.lstatSync(path.join(basedir, f)).isDirectory() && f.split('.').length > 1).sort().reverse()[0];
        return path.join(basedir, version, 'resources');
    } else if (process.platform === 'darwin') {
        const appPath = releaseInput === 'canary' ? path.join('/Applications', 'Discord Canary.app')
            : releaseInput === 'ptb' ? path.join('/Applications', 'Discord PTB.app')
            : useBdRelease && args[3] ? args[3] : !useBdRelease && args[2] ? args[2]
            : path.join('/Applications', 'Discord.app');

        return path.join(appPath, 'Contents', 'Resources');
    } else if (process.platform === 'linux') {
        return path.join('/usr', 'share', release.toLowerCase().replace(/ /g, '-'), 'resources');
    }
})();

if (!fs.existsSync(discordPath)) throw new Error(`Cannot find directory for ${release}`);
console.log(`Found ${release} in ${discordPath}`);

const appPath = path.join(discordPath, 'app');
const packageJson = path.join(appPath, 'package.json');
const indexJs = path.join(appPath, 'index.js');
const bdJson = path.join(appPath, 'bd.json');

if (!fs.existsSync(appPath)) fs.mkdirSync(appPath);
if (fs.existsSync(packageJson)) fs.unlinkSync(packageJson);
if (fs.existsSync(indexJs)) fs.unlinkSync(indexJs);
if (fs.existsSync(bdJson)) fs.unlinkSync(bdJson);

console.log(`Writing package.json`);
fs.writeFileSync(path.join(appPath, 'package.json'), JSON.stringify({
    name: 'betterdiscord',
    description: 'BetterDiscord',
    main: 'index.js',
    private: true
}, null, 4));

if (useBdRelease) {
    console.log(`Writing index.js`);
    fs.writeFileSync(path.join(appPath, 'index.js'), fs.readFileSync(path.resolve(__dirname, '..', 'installer', 'stub.js')));

    console.log(`Writing bd.json`);
    fs.writeFileSync(path.join(appPath, 'bd.json'), JSON.stringify({
        options: {
            autoInject: true,
            commonCore: true,
            commonData: true
        },
        paths: {
            core: path.resolve(__dirname, '..', 'release', 'core'),
            client: path.resolve(__dirname, '..', 'release', 'client'),
            editor: path.resolve(__dirname, '..', 'release', 'editor'),
            data: path.resolve(__dirname, '..', 'release', 'data'),
            // tmp: path.resolve(os.tmpdir(), 'betterdiscord', `${process.getuid()}`)
        }
    }, null, 4));
} else {
    const bdPath = path.resolve(__dirname, '..');

    console.log(`Writing index.js`);
    fs.writeFileSync(path.join(appPath, 'index.js'), `const path = require('path');
    const fs = require('fs');
    const Module = require('module');
    const electron = require('electron');
    const basePath = path.join(__dirname, '..', 'app.asar');
    electron.app.getAppPath = () => basePath;
    Module._load(basePath, null, true);
    electron.app.on('ready', () => new (require('${bdPath.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')}').BetterDiscord)());
    `);
}

console.log(`Injection successful, please restart ${release}.`);
