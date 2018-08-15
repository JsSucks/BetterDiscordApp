/**
 * BetterDiscord Event Hook
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { WebpackModules } from './webpackmodules';
import { MonkeyPatch } from './patcher';
import Events from './events';
import EventListener from './eventlistener';

import * as SocketStructs from '../structs/socketstructs';

/**
 * Discord socket event hook
 * @extends {EventListener}
 */
export default class extends EventListener {

    init() {
        this.ignoreMultiple = -1;
        this.hook();
    }

    bindings() {
        this.hook = this.hook.bind(this);
    }

    get eventBindings() {
        return [
            { id: 'discord-ready', callback: this.hook }
        ];
    }

    hook() {
        const Events = WebpackModules.getModuleByName('Events');
        MonkeyPatch('BD:EVENTS', Events.prototype).after('emit', (obj, args, retVal) => {
            const eventId = args.length >= 3 ? args[2].id || -1 : -1;
            if (eventId === this.ignoreMultiple) return;
            this.ignoreMultiple = eventId;
            if (obj.webSocket) this.wsc = obj.webSocket;
            this.emit(...args);
        });
        /*
        const orig = Events.prototype.emit;
        Events.prototype.emit = function (...args) {
            orig.call(this, ...args);
            self.wsc = this;
            self.emit(...args);
        };*/
    }

    /**
     * Discord emit overload
     * @param {any} event
     * @param {any} action
     * @param {any} data
     */
    emit(e, action, data) {
        switch (e) {
        case 'dispatch':
            return this.dispatch(action, data);
        }
    }

    /**
     * Emit callback
     * @param {any} event Event
     * @param {any} data Event data
     */
    dispatch(type, data) {
        Events.emit('raw-event', { type, data });

        if (type === this.actions.READY || type === this.actions.RESUMED) {
            Events.emit(type, data);
            return;
        }

        if (!Object.keys(SocketStructs).includes(type)) return;
        Events.emit(`discord:${type}`, new SocketStructs[type](data));
    }

    get SocketStructs() {
        return SocketStructs;
    }

    /**
     * All known socket actions
     */
    get actions() {
        if (this._actions) return this._actions;

        return this._actions = {
            READY: 'READY', // Socket ready
            RESUMED: 'RESUMED', // Socket resumed
            TYPING_START: 'TYPING_START', // User typing start
            ACTIVITY_START: 'ACTIVITY_START', // ??
            MESSAGE_CREATE: 'MESSAGE_CREATE', // New message
            MESSAGE_UPDATE: 'MESSAGE_UPDATE', // Edit
            MESSAGE_DELETE: 'MESSAGE_DELETE', // Message deleted
            MESSAGE_DELETE_BULK: 'MESSAGE_DELETE_BULK', // Bulk messages deleted
            MESSAGE_ACK: 'MESSAGE_ACK', // Message fetch
            MESSAGE_REACTION_ADD: 'MESSAGE_REACTION_ADD', // eww reactions
            MESSAGE_REACTION_REMOVE: 'MESSAGE_REACTION_REMOVE', // ^^
            MESSAGE_REACTION_REMOVE_ALL: 'MESSAGE_REACTION_REMOVE_ALL', // ^^
            CHANNEL_PINS_ACK: 'CHANNEL_PINS_ACK', // Pinned messages fetch
            CHANNEL_PINS_UPDATE: 'CHANNEL_PINS_UPDATE',  // Message pinned/unpinned, does not trigger when message is deleted
            CHANNEL_CREATE: 'CHANNEL_CREATE', // Channel created
            CHANNEL_DELETE: 'CHANNEL_DELETE', // Channel deleted
            CHANNEL_UPDATE: 'CHANNEL_UPDATE', // Channel updated
            GUILD_CREATE: 'GUILD_CREATE', // Guild create
            GUILD_DELETE: 'GUILD_DELETE', // Guild delete
            GUILD_SYNC: 'GUILD_SYNC', // Synced when switching to server that's not loaded
            GUILD_MEMBERS_CHUNK: 'GUILD_MEMBERS_CHUNK', // ??
            GUILD_BAN_ADD: 'GUILD_BAN_ADD', // User banned
            GUILD_BAN_REMOVE: 'GUILD_BAN_REMOVE', // User unbanned
            GUILD_MEMBER_ADD: 'GUILD_MEMBER_ADD', // User joins guild
            GUILD_MEMBER_UPDATE: 'GUILD_MEMBER_UPDATE', // Roles etc
            GUILD_MEMBER_REMOVE: 'GUILD_MEMBER_REMOVE', // Kick
            GUILD_ROLE_CREATE: 'GUILD_ROLE_CREATE', // Roles
            GUILD_ROLE_UPDATE: 'GUILD_ROLE_UPDATE', // Roles
            GUILD_ROLE_DELETE: 'GUILD_ROLE_DELETE', // Roles,
            GUILD_EMOJIS_UPDATE: 'GUILD_EMOJIS_UPDATE', // No emojis pls
            GUILD_INTEGRATIONS_UPDATE: 'GUILD_INTEGRATIONS_UPDATE', // Twitch etc?
            USER_UPDATE: 'USER_UPDATE', // Name change etc?
            USER_SETTINGS_UPDATE: 'USER_SETTINGS_UPDATE', // Any setting change
            USER_GUILD_SETTINGS_UPDATE: 'USER_GUILD_SETTINGS_UPDATE', // Guild notification/privacy etc
            USER_CONNECTIONS_UPDATE: 'USER_CONNECTIONS_UPDATE', // Steam etc
            USER_REQUIRED_ACTION_UPDATE: 'USER_REQUIRED_ACTION_UPDATE', // ??
            USER_NOTE_UPDATE: 'USER_NOTE_UPDATE', // Not edits
            RELATIONSHIP_ADD: 'RELATIONSHIP_ADD', // Friends
            RELATIONSHIP_REMOVE: 'RELATIONSHIP_REMOVE', // Friends
            PRESENCE_UPDATE: 'PRESENCE_UPDATE', // Status
            PRESENCES_REPLACE: 'PRESENCES_REPLACE', // ??
            VOICE_STATE_UPDATE: 'VOICE_STATE_UPDATE', // Speaking?
            VOICE_SERVER_UPDATE: 'VOICE_SERVER_UPDATE', // ??
            CALL_CREATE: 'CALL_CREATE', // Don't call me
            CALL_UPDATE: 'CALL_UPDATE', // ^^^^^^^^^^^^
            CALL_DELETE: 'CALL_DELETE', // ^^^^^^^^^^^^
            OAUTH2_TOKEN_REVOKE: 'OAUTH2_TOKEN_REVOKE', // Logged out elsewhere?
            RECENT_MENTION_DELETE: 'RECENT_MENTION_DELETE', // No idea what triggers this?
            FRIEND_SUGGESTION_CREATE: 'FRIEND_SUGGESTION_CREATE', // Connected account stuff?
            FRIEND_SUGGESTION_DELETE: 'FRIEND_SUGGESTION_DELETE', // ^^
            WEBHOOKS_UPDATE: 'WEBHOOKS_UPDATE', // Any webhook change on any server
            USER_PAYMENTS_UPDATE: 'USER_PAYMENTS_UPDATE', // Won't test
            USER_BILLING_PROFILE_UPDATE: 'USER_BILLING_PROFILE_UPDATE', // Won't test
            ACTIVITY_JOIN_REQUEST: 'ACTIVITY_JOIN_REQUEST', // Nothing seems to trigger this
            ACTIVITY_JOIN_INVITE: 'ACTIVITY_JOIN_INVITE', // Same
            LFG_LISTING_CREATE: 'LFG_LISTING_CREATE', // No groups here
            LFG_LISTING_DELETE: 'LFG_LISTING_DELETE', // Thank you
            BRAINTREE_POPUP_BRIDGE_CALLBACK: 'BRAINTREE_POPUP_BRIDGE_CALLBACK' // What
        };
    }

}
