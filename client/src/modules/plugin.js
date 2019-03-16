/**
 * BetterDiscord Plugin Base
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import PluginManager from './pluginmanager';
import Content from './content';
import Database from './database';
import { ClientLogger as Logger } from 'common';
import { Permissions } from 'modules';

export default class Plugin extends Content {

    get type() { return 'plugin' }

    get start() { return this.enable }
    get stop() { return this.disable }

    reload(force) {
        return PluginManager.reloadPlugin(this, force);
    }

    unload(force) {
        return PluginManager.unloadPlugin(this, force);
    }

    /**
     * Saves the plugin's permissions
     */
    savePermissions() {
        try {
            const permissions = Permissions.getAll(this.id);
            if (!permissions.length)
                return;

            Database.insertOrUpdate({ type: `plugin-permissions`, id: this.id }, {
                type: `plugin-permissions`,
                id: this.id,
                permissions: permissions
            });
        } catch (err) {
            Logger.err(this.name, ['Failed to save permissions', err]);
        }
    }

}
