/**
 * BetterDiscord Updater Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Events from './events';
import Globals from './globals';
import { $ } from 'vendor';
import { ClientLogger as Logger } from 'common';

export default class {

    constructor() {
        window.updater = this;
        this.init = this.init.bind(this);
        this.checkForUpdates = this.checkForUpdates.bind(this);
    }

    get interval() {
        return 60 * 1000 * 30;
    }

    init() {
        setInterval(this.checkForUpdates, this.interval);
    }

    checkForUpdates() {
        Events.emit('update-check-start');
        Logger.info('Updater', 'Checking for updates');
        $.ajax({
            type: 'GET',
            url: 'https://rawgit.com/JsSucks/BetterDiscordApp/master/package.json',
            cache: false,
            success: e => {
                Logger.info('Updater', `Latest Version: ${e.version} - Current Version: ${Globals.getObject('version')}`);
            }
        });
    }

}
