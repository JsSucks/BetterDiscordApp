/**
 * BetterDiscord Menu Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Events } from 'modules';
import { Utils, ClientIPC } from 'common';

export default new class {

    constructor() {
        ClientIPC.on('bd-toggle-menu', () => Events.emit('bd-toggle-menu'));
        ClientIPC.on('bd-open-menu', (event, item) => this.open(item));
        ClientIPC.on('bd-close-menu', this.close);
    }

    open(item) {
        Events.emit('bd-open-menu', item);
    }

    close() {
        Events.emit('bd-close-menu');
    }

    get items() {
        return BdMenuItems;
    }

}

let items = 0;

export const BdMenuItems = new class {
    constructor() {
        window.bdmenu = this;

        this.items = [];

        const updater = this.add({category: 'Updates', contentid: 'updater', text: 'Updates available!', hidden: true});
        Events.on('update-check-end', () => updater.hidden = true);
        Events.on('updates-available', () => updater.hidden = false);

        this.addSettingsSet('Internal', 'core', 'Core');
        this.addSettingsSet('Internal', 'ui', 'UI');
        this.addSettingsSet('Internal', 'emotes', 'Emotes');

        this.add({category: 'Internal', contentid: 'css', text: 'CSS Editor'});
        this.add({category: 'External', contentid: 'plugins', text: 'Plugins'});
        this.add({category: 'External', contentid: 'themes', text: 'Themes'});
    }

    /**
     * Adds an item to the menu.
     * @param {Object} item The item to add to the menu
     * @return {Object}
     */
    add(item) {
        if (this.items.includes(item)) return item;

        item.id = items++;
        item.contentid = item.contentid || (items++ + '');
        item.active = false;
        item.hidden = item.hidden || false;
        item._type = item._type || 'button';

        this.items.push(item);
        return item;
    }

    /**
     * Adds a settings set to the menu.
     * @param {String} category The category to display this item under
     * @param {SettingsSet} set The settings set to display when this item is active
     * @param {String} text The text to display in the menu (optional)
     * @return {Object} The item that was added
     */
    addSettingsSet(category, set, text) {
        return this.add({
            category, set,
            text: text || set.text
        });
    }

    /**
     * Adds a Vue component to the menu.
     * @param {String} category The category to display this item under
     * @param {String} text The text to display in the menu
     * @param {Object} component The Vue component to display when this item is active
     * @return {Object} The item that was added
     */
    addVueComponent(category, text, component) {
        return this.add({
            category, text, component
        });
    }

    /**
     * Removes an item from the menu.
     * @param {Object} item The item to remove from the menu
     */
    remove(item) {
        Utils.removeFromArray(this.items, item);
    }
};
