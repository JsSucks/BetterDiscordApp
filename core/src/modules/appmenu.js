/**
 * BetterDiscord App Menu Module
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

const { Module } = require('./modulebase');
const { BDIpc } = require('./bdipc');
const { BetterDiscord } = require('../main.js');
const { app, shell, Menu, MenuItem, BrowserWindow } = require('electron');
const process = require('process');

// This is loaded before Discord's own menu - this stops it from being overridden
const { setApplicationMenu } = Menu;
Menu.setApplicationMenu = () => {};

/* Discord's own menu uses app.emit(MenuEventConstant) to do things inside the renderer. MenuEventConstant can be:
 * - CHECK_FOR_UPDATES, which evaluates to "menu:check-for-updates",
 * - OPEN_SETTINGS, which evaluates to "menu:open-settings", and
 * - OPEN_HELP, which evaluates to "menu:open-help"
 */

class AppMenu extends Module {

    initMenu() {
        const menu = new Menu();

        if (process.platform === 'darwin')
            menu.append(this.appMenu);
        else menu.append(this.fileMenu);

        menu.append(this.editMenu);
        menu.append(this.viewMenu);
        menu.append(this.bdMenu);
        menu.append(this.windowMenu);
        menu.append(this.helpMenu);

        setApplicationMenu(this.menu = menu);
        this.initted = true;
    }

    get appMenu() {
        if (this._appMenu) return this._appMenu;

        const appMenu = new MenuItem({
            label: 'Discord',
            submenu: [
                {role: 'about', label: 'About Discord'},
                {type: 'separator'},
                {
                    label: 'Check for Updates...',
                    click: () => app.emit('menu:check-for-updates')
                },
                {
                    label: 'Preferences',
                    click: () => app.emit('menu:open-settings'),
                    accelerator: process.platform === 'darwin' ? 'Cmd+,' : 'Ctrl+,'
                },
                {type: 'separator'},
                {role: 'services', submenu: []},
                {type: 'separator'},
                {role: 'hide', label: 'Hide Discord'},
                {role: 'hideothers'},
                {role: 'unhide'},
                {type: 'separator'},
                {role: 'quit', label: 'Quit Discord'}
            ]
        });

        return this._appMenu = appMenu;
    }

    get fileMenu() {
        if (this._fileMenu) return this._fileMenu;

        const fileMenu = new MenuItem({
            label: 'Discord',
            submenu: [
                {
                    label: 'Options',
                    click: () => app.emit('menu:open-settings'),
                    accelerator: process.platform === 'darwin' ? 'Cmd+,' : 'Ctrl+,'
                },
                {type: 'separator'},
                {role: 'quit', label: 'Exit'}
            ]
        });

        return this._fileMenu = fileMenu;
    }

    get editMenu() {
        if (this._editMenu) return this._editMenu;

        const editMenu = new MenuItem({
            label: 'Edit',
            submenu: [
                {role: 'undo'},
                {role: 'redo'},
                {type: 'separator'},
                {role: 'cut'},
                {role: 'copy'},
                {role: 'paste'},
                {role: 'pasteandmatchstyle'},
                {role: 'delete'},
                {role: 'selectall'}
            ].concat(process.platform === 'darwin' ? [
                {type: 'separator'},
                {
                    label: 'Speech',
                    submenu: [
                        {role: 'startspeaking'},
                        {role: 'stopspeaking'}
                    ]
                }
            ] : [])
        });

        return this._editMenu = editMenu;
    }

    get viewMenu() {
        if (this._viewMenu) return this._viewMenu;

        const viewMenu = new MenuItem({
            label: 'View',
            submenu: [
                {role: 'reload'},
                {role: 'forcereload'},
                {role: 'toggledevtools'},
                {type: 'separator'},
                {role: 'resetzoom'},
                {role: 'zoomin'},
                {role: 'zoomout'},
                {type: 'separator'},
                {role: 'togglefullscreen'}
            ]
        });

        return this._viewMenu = viewMenu;
    }

    get bdMenu() {
        if (this._bdMenu) return this._bdMenu;

        const bdMenu = new MenuItem({
            label: 'BetterDiscord',
            submenu: [
                {
                    label: 'Toggle BetterDiscord',
                    click: () => this.focusAndSend('bd-toggle-menu'),
                    accelerator: process.platform === 'darwin' ? 'Cmd+B' : 'Ctrl+B'
                },
                {
                    label: 'About BetterDiscord',
                    click: () => shell.openExternal('https://betterdiscord.net')
                },
                {type: 'separator'},
                {
                    label: 'Show Core Settings',
                    click: () => this.focusAndSend('bd-open-menu', 'core')
                },
                {
                    label: 'Show UI Settings',
                    click: () => this.focusAndSend('bd-open-menu', 'ui')
                },
                {
                    label: 'Show Emote Settings',
                    click: () => this.focusAndSend('bd-open-menu', 'emotes')
                },
                {
                    label: 'Show CSS Editor',
                    click: () => this.focusAndSend('bd-open-menu', 'css'),
                    accelerator: process.platform === 'darwin' ? 'Cmd+S' : 'Ctrl+S'
                },
                {type: 'separator'},
                {
                    label: 'Show Plugins',
                    click: () => this.focusAndSend('bd-open-menu', 'plugins')
                },
                {
                    label: 'Show Themes',
                    click: () => this.focusAndSend('bd-open-menu', 'themes')
                }
            ]
        });

        return this._bdMenu = bdMenu;
    }

    get windowMenu() {
        if (this._windowMenu) return this._windowMenu;

        const close = new MenuItem({
            label: 'Close',
            click: () => {
                const focusedWindow = BrowserWindow.getFocusedWindow();
                if (!focusedWindow) return;
                if (focusedWindow === this.windowUtils.window) {
                    // win.hide() is fine on Windows (Linux?) and is likely what Discord uses,
                    // but on macOS they use app.hide() on the menu item.
                    // It basically minimizes all windows but with no animation.
                    if (process.platform === 'darwin') {
                        // Main window and on macOS - if it's the only window hide the app, otherwise minimize it
                        BrowserWindow.getAllWindows().find(w => !w.isMinimized() && w !== focusedWindow) ? focusedWindow.minimize() : app.hide();
                    } else focusedWindow.hide(); // Main window but not macOS - hide
                } else focusedWindow.close(); // Not the main window - close
            },
            accelerator: process.platform === 'darwin' ? 'Cmd+W' : 'Ctrl+W'
        });

        const windowMenu = new MenuItem({
            role: 'window',
            submenu: process.platform === 'darwin' ? [
                close,
                {role: 'minimize'},
                {role: 'zoom'},
                {type: 'separator'},
                {role: 'front'}
            ] : [
                {role: 'minimize'},
                close
            ]
        });

        return this._windowMenu = windowMenu;
    }

    get helpMenu() {
        if (this._helpMenu) return this._helpMenu;

        const helpMenu = new MenuItem({
            role: 'help',
            submenu: [
                {
                    label: 'Discord Help',
                    click: () => app.emit('menu:open-help')
                },
                {
                    label: 'View the Source Code on GitHub',
                    click: () => shell.openExternal('https://github.com/JsSucks/BetterDiscordApp')
                }
            ]
        });

        return this._helpMenu = helpMenu;
    }

    stateChanged(oldState, newState) {
        if (this.initted || !newState.windowUtils) return;

        this.initMenu();
    }

    getMenu() {
        return this.menu;
    }

    focusAndSend(event, data) {
        this.webContents.focus();
        return BDIpc.send(this.window, event, data);
    }

    get windowUtils() {
        return this.state.windowUtils;
    }

    get window() {
        return this.windowUtils.window;
    }

    get webContents() {
        return this.windowUtils.webContents;
    }

}

const _instance = new AppMenu();
module.exports = { AppMenu: _instance };
