/**
 * BetterDiscord Guild Setting Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiscordApi } from 'modules';
import { Utils, ClientLogger as Logger } from 'common';
import Setting from './basesetting';

export default class GuildSetting extends Setting {

    constructor(args, ...merge) {
        super(args, ...merge);

        this.args.guilds = this.value ? this.value.map(id => DiscordApi.guilds.get({ id })) : [];
    }

    /**
     * The value to use when the setting doesn't have a value.
     */
    get defaultValue() {
        return [];
    }

    /**
     * An array of currently selected guilds.
     */
    get guilds() {
        return this.args.guilds;
    }

    /**
     * The minimum amount of guilds the user may select.
     * This only restricts removing guilds when there is less or equal guilds than this, and does not ensure that this number of guilds actually exists.
     */
    get min() {
        return this.args.min || 0;
    }

    /**
     * The maximum amount of guilds the user may select.
     */
    get max() {
        return this.args.max || null;
    }

    /**
     * Adds a guild to the list of selected guilds.
     * @param {Number} guild_id The ID of the guild to add
     * @return {Promise}
     */
    addGuild(guild_id) {
        return this.setValue(this.value.concat([guild_id]));
    }

    /**
     * Removes a guild from the list of selected guilds.
     * @param {Number} guild_id The ID of the guild to remove
     * @return {Promise}
     */
    removeGuild(guild_id) {
        return this.setValue(this.value.filter(g => g !== guild_id));
    }

    /**
     * Function to be called after the value changes.
     * This can be overridden by other settings types.
     * This function is used when the value needs to be updated synchronously (basically just in the constructor - so there won't be any events to emit anyway).
     * @param {SettingUpdatedEvent} updatedSetting
     */
    setValueHookSync(updatedSetting) {
        this.args.guilds = updatedSetting.value ? updatedSetting.value.map(id => DiscordApi.guilds.get({ id })) : [];
    }

    /**
     * Function to be called after the value changes.
     * This can be overridden by other settings types.
     * @param {SettingUpdatedEvent} updatedSetting
     */
    async setValueHook(updatedSetting) {
        this.value.sort();
        this.changed = !Utils.compare(this.args.value, this.args.saved_value);

        const newGuilds = [];
        let error;

        for (const newGuild of updatedSetting.value) {
            try {
                const guild = updatedSetting.old_value.find(g => g === newGuild);

                if (guild) {
                    // Guild was already selected
                    newGuilds.push(guild);
                } else {
                    // Add a new guild
                    Logger.log('GuildSetting', ['Adding guild', newGuild, 'to', this]);
                    newGuilds.push(newGuild);
                    await this.emit('guild-added', { id: newGuild });
                }
            } catch (e) { error = e; }
        }

        for (const guild_id of updatedSetting.old_value) {
            if (newGuilds.find(g => g === guild_id)) continue;

            try {
                // Guild removed
                Logger.log('GuildSetting', ['Removing guild', guild_id, 'from', this]);
                await this.emit('guild-removed', { id: guild_id });
            } catch (e) { error = e; }
        }

        this.args.guilds = newGuilds.map(id => DiscordApi.guilds.get({ id }));

        // We can't throw anything before the guilds array is updated, otherwise the guild setting would be in an inconsistent state where the values in this.guilds wouldn't match the values in this.value
        if (error) throw error;
    }

    /**
     * Returns a representation of this setting's value in SCSS.
     * @return {String}
     */
    toSCSS() {
        if (!this.value || !this.value.length) return '()';

        const guilds = [];
        for (const guild_id of this.value) {
            if (guild_id)
                guilds.push(guild_id);
        }

        return guilds.length ? guilds.join(', ') : '()';
    }

}
