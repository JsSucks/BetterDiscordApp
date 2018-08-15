/**
 * BetterDiscord React Devtools Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import electron from 'electron';
import path from 'path';

import BuiltinModule from './BuiltinModule';

import { Globals } from 'modules';
import { Toasts } from 'ui';

export default new class ReactDevtoolsModule extends BuiltinModule {

    constructor() {
        super();
        this.devToolsOpened = this.devToolsOpened.bind(this);
    }

    get settingPath() {
        return ['core', 'advanced', 'react-devtools'];
    }

    enabled(e) {
        electron.remote.BrowserWindow.getAllWindows()[0].webContents.on('devtools-opened', this.devToolsOpened);
    }

    disabled(e) {
        electron.remote.BrowserWindow.removeDevToolsExtension('React Developer Tools');
        electron.remote.BrowserWindow.getAllWindows()[0].webContents.removeListener('devtools-opened', this.devToolsOpened);
    }

    devToolsOpened() {
        electron.remote.BrowserWindow.removeDevToolsExtension('React Developer Tools');
        electron.webFrame.registerURLSchemeAsPrivileged('chrome-extension');
        try {
            const res = electron.remote.BrowserWindow.addDevToolsExtension(path.join(Globals.getPath('ext'), 'extensions', 'rdt'));
            if (res !== undefined) {
                Toasts.success(`${res} Installed`);
                return;
            }
            Toasts.error('React Developer Tools install failed');
        } catch (err) {
            Toasts.error('React Developer Tools install failed');
        }
    }
}
