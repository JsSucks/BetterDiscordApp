/**
 * BetterDiscord CSSEditor Module
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

const path = require('path');
const { BrowserWindow } = require('electron');

const { Module } = require('./modulebase');

class CSSEditor extends Module {

    openEditor(o) {
        if (this.editor) {
            if (this.editor.isFocused()) return;

            this.editor.focus();
            this.editor.flashFrame(true);
            o.reply(true);
            return;
        }

        this.editor = new BrowserWindow(this.options);
        this.editor.loadURL(`file://${this.editorPath}/index.html`);
        this.editor.webContents.toggleDevTools();
        this.editor.open = true;
        this.editor.setSheetOffset(33);

        this.editor.webContents.on('close', () => {
            this.editor = null;
        });

        this.editor.webContents.on('did-finish-load', () => {
            o.reply(true);
        });
    }

    setCSS(css) {
        this.editor.webContents.send("set-css", css);
    }

    set alwaysOnTop(state) {
        this.editor.setAlwaysOnTop(state);
    }

    //TODO user options from config
    get options() {
        return {
            width: 800,
            height: 600,
            frame: false
        };
    }

    //TODO Currently uses a development path
    get editorPath() {
        return path.resolve(__dirname, '..', '..', '..', 'csseditor', 'dist');
        return path.resolve(__dirname, '..', '..', '..', 'tests', 'csseditor');
    }

}

module.exports = { 'CSSEditor': new CSSEditor() };
