/**
 * BetterDiscord Discord API
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { List } from 'structs';
import { User, Channel, Guild, Message } from 'discordstructs';
import Reflection from '../reflection';
import UserSettings from './usersettings';

export { UserSettings };

export const Modules = {
    _getModule(name) {
        const foundModule = Reflection.module.byName(name);
        if (!foundModule) return null;
        delete this[name];
        return this[name] = foundModule;
    },

    get ChannelSelector() { return this._getModule('ChannelSelector'); },
    get MessageActions() { return this._getModule('MessageActions'); },
    get MessageParser() { return this._getModule('MessageParser'); },
    get MessageStore() { return this._getModule('MessageStore'); },
    get EmojiUtils() { return this._getModule('EmojiUtils'); },
    get PermissionUtils() { return this._getModule('Permissions'); },
    get SortedGuildStore() { return this._getModule('SortedGuildStore'); },
    get PrivateChannelActions() { return this._getModule('PrivateChannelActions'); },
    get GuildMemberStore() { return this._getModule('GuildMemberStore'); },
    get GuildChannelsStore() { return this._getModule('GuildChannelsStore'); },
    get MemberCountStore() { return this._getModule('MemberCountStore'); },
    get GuildActions() { return this._getModule('GuildActions'); },
    get NavigationUtils() { return this._getModule('NavigationUtils'); },
    get GuildPermissions() { return this._getModule('GuildPermissions'); },
    get DiscordConstants() { return this._getModule('DiscordConstants'); },
    get ChannelStore() { return this._getModule('ChannelStore'); },
    get GuildStore() { return this._getModule('GuildStore'); },
    get SelectedGuildStore() { return this._getModule('SelectedGuildStore'); },
    get SelectedChannelStore() { return this._getModule('SelectedChannelStore'); },
    get UserStore() { return this._getModule('UserStore'); },
    get RelationshipStore() { return this._getModule('RelationshipStore'); },
    get RelationshipManager() { return this._getModule('RelationshipManager'); },
    get ChangeNicknameModal() { return this._getModule('ChangeNicknameModal'); },
    get UserInfoStore() { return this._getModule('UserInfoStore'); },
    get UserSettingsStore() { return this._getModule('UserSettingsStore'); },
    get UserSettingsUpdater() { return this._getModule('UserSettingsUpdater'); },
    get AccessibilityStore() { return this._getModule('AccessibilityStore'); },
    get AccessibilitySettingsUpdater() { return this._getModule('AccessibilitySettingsUpdater'); },
    get UserSettingsWindow() { return this._getModule('UserSettingsWindow'); },
    get UserStatusStore() { return this._getModule('UserStatusStore'); },
    get ChannelSettingsWindow() { return this._getModule('ChannelSettingsWindow'); },
    get GuildSettingsWindow() { return this._getModule('GuildSettingsWindow'); },
    get CreateChannelModal() { return this._getModule('CreateChannelModal'); },
    get PruneMembersModal() { return this._getModule('PruneMembersModal'); },
    get NotificationSettingsModal() { return this._getModule('NotificationSettingsModal'); },
    get PrivacySettingsModal() { return this._getModule('PrivacySettingsModal'); },
    get UserProfileModal() { return this._getModule('UserProfileModal'); },
    get APIModule() { return this._getModule('APIModule'); },
    get UserNoteStore() { return this._getModule('UserNoteStore'); },
    get KeyboardCombosModal() { return this._getModule('KeyboardCombosModal'); },

    get DiscordPermissions() { return this.DiscordConstants.Permissions; }
};

export default class DiscordApi {

    static get modules() { return Modules }
    static get User() { return User }
    static get Channel() { return Channel }
    static get Guild() { return Guild }
    static get Message() { return Message }

    /**
     * A list of loaded guilds.
     * @type {List<Guild>}
     */
    static get guilds() {
        const guilds = Modules.GuildStore.getGuilds();
        return List.from(Object.values(guilds), g => Guild.from(g));
    }

    /**
     * A list of loaded channels.
     * @type {List<Channel>}
     */
    static get channels() {
        const channels = Modules.ChannelStore.getChannels();
        return List.from(Object.values(channels), c => Channel.from(c));
    }

    /**
     * A list of loaded users.
     * @type {List<User>}
     */
    static get users() {
        const users = Modules.UserStore.getUsers();
        return List.from(Object.values(users), u => User.from(u));
    }

    /**
     * An object mapping guild IDs to their member counts.
     * @type {Object}
     */
    static get memberCounts() {
        return Modules.MemberCountStore.getMemberCounts();
    }

    /**
     * A list of guilds in the order they appear in the server list.
     * @type {List<Guild>}
     */
    static get sortedGuilds() {
        const guilds = Modules.SortedGuildStore.getSortedGuilds();
        return List.from(guilds, g => Guild.from(g));
    }

    /**
     * An array of guild IDs in the order they appear in the server list.
     * @type {Number[]}
     */
    static get guildPositions() {
        return Modules.SortedGuildStore.guildPositions;
    }

    /**
     * The currently selected guild.
     * @type {Guild}
     */
    static get currentGuild() {
        const guild = Modules.GuildStore.getGuild(Modules.SelectedGuildStore.getGuildId());
        return guild ? Guild.from(guild) : null;
    }

    /**
     * The currently selected channel.
     * @type {Channel}
     */
    static get currentChannel() {
        const channel = Modules.ChannelStore.getChannel(Modules.SelectedChannelStore.getChannelId());
        return channel ? Channel.from(channel) : null;
    }

    /**
     * The current user.
     * @type {User}
     */
    static get currentUser() {
        const user = Modules.UserStore.getCurrentUser();
        return user ? User.from(user) : null;
    }

    /**
     * A list of the current user's friends.
     * @type {List<User>}
     */
    static get friends() {
        const friends = Modules.RelationshipStore.getFriendIDs();
        return List.from(friends, id => User.fromId(id));
    }

    /**
     * Whether a user is logged in.
     */
    static get authenticated() {
        return !Modules.UserInfoStore.isGuest();
    }

    /**
     * User settings.
     */
    static get UserSettings() {
        return UserSettings;
    }

    static showKeyboardCombosModal() {
        Modules.KeyboardCombosModal.show();
    }

}
