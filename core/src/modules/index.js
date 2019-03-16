export { default as BDIpc } from './bdipc';
export { Utils, FileUtils, WindowUtils } from './utils';
export { default as Config } from './config';
export { default as CSSEditor } from './csseditor';
export { default as Editor } from './editor';
export { default as Database } from './database';
export { default as Updater } from './updater';

export const native_module_errors = {};

try {
    exports.sass = require('node-sass');
} catch (err) {
    console.error('[BetterDiscord] Error loading node-sass', err);
    native_module_errors['node-sass'] = err instanceof Error ? {message: err.message, stack: err.stack} : err;
}

try {
    exports.keytar = require('keytar');
} catch (err) {
    console.error('[BetterDiscord] Error loading keytar', err);
    native_module_errors.keytar = err instanceof Error ? {message: err.message, stack: err.stack} : err;
}
