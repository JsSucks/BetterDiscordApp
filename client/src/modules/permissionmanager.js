/**
 * BetterDiscord Permission Manager
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

const PermissionMap = {
    IDENTIFY: {
        HEADER: 'Access your account information',
        BODY: 'Allows :NAME: to read your account information (excluding user token).'
    },
    READ_MESSAGES: {
        HEADER: 'Read all messages',
        BODY: 'Allows :NAME: to read all messages accessible through your Discord account.'
    },
    SEND_MESSAGES: {
        HEADER: 'Send messages',
        BODY: 'Allows :NAME: to send messages on your behalf.'
    },
    DELETE_MESSAGES: {
        HEADER: 'Delete messages',
        BODY: 'Allows :NAME: to delete messages on your behalf.'
    },
    EDIT_MESSAGES: {
        HEADER: 'Edit messages',
        BODY: 'Allows :NAME: to edit messages on your behalf.'
    },
    JOIN_SERVERS: {
        HEADER: 'Join servers for you',
        BODY: 'Allows :NAME: to join servers on your behalf.'
    },
    GET_INSTALLED_COMPONENT: {
        HEADER: 'Use installed components',
        BODY: 'Allows :NAME: to control other plugins / themes / modules'
    }
}

export default class {

    static permissionText(permission) {
        return PermissionMap[permission];
    }

    /**
     * Add the passed permission to the plugin with the passed ID
     * @param {String} id Plugin's ID
     * @param {String} permission Permission to add
     * @return {Promise}
     */
    static add(id, permission) {
        if (!PermissionMap[permission])
            return;

        if (this.get(id, permission))
            return;

        if (!this.data)
            this.data = [];

        if (!this.data[id])
            this.data[id] = [];

        this.data[id].push(permission);
    }

    /**
     * Add all specified permissions to the plugin with the passed ID
     * @param {String} id Plugin's ID
     * @param {Array} permissions Array of permission to add
     * @return {Promise}
     */
    static addMultiple(id, permissions) {
        for (const permission of permissions)
            this.add(id, permission);
    }

    /**
     * Remove the passed permission from the plugin with the passed ID
     * @param {String} id Plugin's ID
     * @param {String} permission Permission to remove
     * @return {Promise}
     */
    static remove(id, permission) {
        if (!this.data || !this.data[id])
            return;

        for (const index in this.data[id]) {
            if (this.data[id][index] === permission) {
                this.data[id].splice(index, 1);
                break;
            }
        }
    }

    /**
     * Remove all permissions from the plugin with the passed ID
     * @param {String} id Plugin's ID
     * @return {Promise}
     */
    static removeAll(id) {
        if (!this.data || !this.data[id])
            return;

        delete this.data[id];
    }

    /**
     * Checks if the plugin with the passed ID has the passed permission
     * @param {String} id Plugin's ID
     * @param {String} permission Permission to check
     * @return {Boolean}
     */
    static get(id, permission) {
        if (!this.data || !this.data[id])
            return false;

        for (const index in this.data[id])
            if (this.data[id][index] === permission)
                return true;

        return false;
    }

    /**
     * Returns an array of permissions of the plugin with the passed ID
     * @param {String} id Plugin's ID
     * @return {Array}
     */
    static getAll(id) {
        if (!this.data || !this.data[id])
            return [];

        return this.data[id];
    }

}
