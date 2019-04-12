/**
 * BetterDiscord Module Manager
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { ClientLogger as Logger } from 'common';
import { SocketProxy, EventHook, DispatchHook } from 'modules';
import { ProfileBadges, ClassNormaliser } from 'ui';
import { UserSettings } from './discordapi';
import Updater from './updater';

/**
 * Module Manager initializes all modules when everything is ready
 */
export default class {

    /**
     * An array of modules.
     */
    static get modules() {
        return this._modules ? this._modules : (this._modules = [
            new ProfileBadges(),
            new ClassNormaliser(),
            new SocketProxy(),
            new EventHook(),
            new DispatchHook(),
            UserSettings,
            Updater
        ]);
    }

    /**
     * Initializes all modules.
     * @return {Promise}
     */
    static async initModules() {
        for (const module of this.modules) {
            try {
                if (module.init && module.init instanceof Function) module.init();
            } catch (err) {
                Logger.err('Module Manager', ['Failed to initialize module:', err]);
            }
        }
        return true;
    }

}
