/**
 * BetterDiscord Emote Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import BuiltinModule from '../BuiltinModule';
import path from 'path';
import { request } from 'vendor';

import { Utils, FileUtils, ClientLogger as Logger } from 'common';
import { DiscordApi, Settings, Globals, Reflection, ReactComponents, Database } from 'modules';
import { DiscordContextMenu } from 'ui';

import Emote from './EmoteComponent.js';

export const EMOTE_SOURCES = [
    'https://static-cdn.jtvnw.net/emoticons/v1/:id/1.0',
    'https://cdn.frankerfacez.com/emoticon/:id/1',
    'https://cdn.betterttv.net/emote/:id/1x'
];

export default new class EmoteModule extends BuiltinModule {

    /* Getters */

    get moduleName() { return 'EmoteModule' }

    /**
     * @returns {String} Path to local emote database
     */
    get dbpath() { return path.join(Globals.getPath('data'), 'emotes.json') }

    /**
     * @returns {Map} Cached raw emote database
     */
    get database() { return this._db || (this._db = new Map()) }

    /**
     * @returns {Array} Favourite emotes
     */
    get favourites() { return this._favourites || (this._favourites = []) }

    /**
     * @returns {Array} Most used emotes
     */
    get mostUsed() { return this._mostUsed || (this._mostUsed = []) }

    get settingPath() { return ['emotes', 'default', 'enable'] }

    async enabled() {
        // Add favourite button to context menu
        this.favCm = DiscordContextMenu.add(target => [
            {
                text: 'Favourite',
                type: 'toggle',
                checked: target && target.alt && this.isFavourite(target.alt.replace(/;/g, '')),
                onChange: (checked, target) => {
                    const { alt } = target;
                    if (!alt) return false;

                    const emote = alt.replace(/;/g, '');

                    if (!checked) return this.removeFavourite(emote), false;
                    return this.addFavourite(emote), true;
                }
            }
        ], target => target.closest('.bd-emote'));

        if (!this.database.size) {
            await this.loadLocalDb();
        }

        // Read favourites and most used from database
        await this.loadUserData();
    }

    async disabled() {
        DiscordContextMenu.remove(this.favCm);
    }

    /* Methods */

    /**
     * Adds an emote to favourites.
     * @param {Object|String} emote
     * @return {Promise}
     */
    addFavourite(emote) {
        if (this.isFavourite(emote)) return;
        if (typeof emote === 'string') emote = this.findByName(emote, true);
        this.favourites.push(emote);
        return this.saveUserData();
    }

    /**
     * Removes an emote from favourites.
     * @param {Object|String} emote
     * @return {Promise}
     */
    removeFavourite(emote) {
        if (!this.isFavourite(emote)) return;
        Utils.removeFromArray(this.favourites, e => e.name === emote || e.name === emote.name, true);
        return this.saveUserData();
    }

    /**
     * Checks if an emote is in favourites.
     * @param {Object|String} emote
     * @return {Boolean}
     */
    isFavourite(emote) {
        return !!this.favourites.find(e => e.name === emote || e.name === emote.name);
    }

    /**
     * Load emotes from local database
     */
    async loadLocalDb() {
        const emotes = await FileUtils.readJsonFromFile(this.dbpath);
        for (const [index, emote] of emotes.entries()) {
            const { type, id, src, value } = emote;
            if (index % 10000 === 0) await Utils.wait();

            this.database.set(id, { id: emote.value.id || value, type });
        }

        Logger.log('EmoteModule', ['Loaded emote database']);
    }

    async loadUserData() {
        const userData = await Database.findOne({ type: 'builtin', id: 'EmoteModule' });
        if (!userData) return;

        if (userData.hasOwnProperty('favourites')) this._favourites = userData.favourites;
        if (userData.hasOwnProperty('mostused')) this._mostUsed = userData.mostused;
    }

    async saveUserData() {
        await Database.insertOrUpdate({ type: 'builtin', id: 'EmoteModule' }, {
            type: 'builtin',
            id: 'EmoteModule',
            favourites: this.favourites,
            mostused: this.mostUsed
        });
    }

    /**
     * Add/update emote to most used
     * @param {Object} emote emote to add/update
     * @return {Promise}
     */
    addToMostUsed(emote) {
        const isMostUsed = this.mostUsed.find(mu => mu.key === emote.name);
        if (isMostUsed) {
            isMostUsed.useCount += 1;
        } else {
            this.mostUsed.push({
                key: emote.name,
                id: emote.id,
                type: emote.type,
                useCount: 1
            });
        }
        // Save most used to database
        // TODO only save first n
        return this.saveUserData();
    }

    /**
     * Find an emote by name
     * @param {String} name Emote name
     * @param {Boolean} simple Simple object or Emote instance
     * @returns {Object|Emote}
     */
    findByName(name, simple = false) {
        const emote = this.database.get(name);
        if (!emote) return null;
        return this.parseEmote(name, emote, simple);
    }

    /**
     * Parse emote object
     * @param {String} name Emote name
     * @param {Object} emote Emote object
     * @param {Boolean} simple Simple object or Emote instance
     * @returns {Object|Emote}
     */
    parseEmote(name, emote, simple = false) {
        const { type, id } = emote;
        if (type < 0 || type > 2) return null;
        return simple ? { type, id, name } : new Emote(type, id, name);
    }

    /**
     * Search for anything else
     * @param {any} regex
     * @param {any} limit
     */
    search(regex, limit = 10) {
        if (typeof regex === 'string') regex = new RegExp(regex, 'i');
        const matching = [];

        for (const [key, value] of this.database.entries()) {
            if (matching.length >= limit) break;
            if (regex.test(key)) matching.push({ key, value })
        }

        return matching;
    }

    /* Patches */
    async applyPatches() {
        this.patchMessageContent();
        this.patchSendAndEdit();
        this.patchSpoiler();

        const MessageAccessories = await ReactComponents.getComponent('MessageAccessories');
        this.patch(MessageAccessories.component.prototype, 'render', this.afterRenderMessageAccessories, 'after');
        MessageAccessories.forceUpdateAll();
    }

    /**
     * Patches MessageContent render method
     */
    async patchMessageContent() {
        const MessageContent = await ReactComponents.getComponent('MessageContent');
        this.childPatch(MessageContent.component.prototype, 'render', ['props', 'children'], this.afterRenderMessageContent);
        MessageContent.forceUpdateAll();
    }

    /**
     * Patches MessageActions send and edit
     */
    patchSendAndEdit() {
        const { MessageActions } = Reflection.modules;
        this.patch(MessageActions, 'sendMessage', this.handleSendMessage, 'instead');
        this.patch(MessageActions, 'editMessage', this.handleEditMessage, 'instead');
    }

    async patchSpoiler() {
        const Spoiler = await ReactComponents.getComponent('Spoiler');
        this.childPatch(Spoiler.component.prototype, 'render', ['props', 'children', 'props', 'children'], this.afterRenderSpoiler);
        Spoiler.forceUpdateAll();
    }

    afterRenderSpoiler(component, _childrenObject, args, retVal) {
        const markup = Utils.findInReactTree(retVal, filter =>
            filter &&
            filter.className &&
            filter.className.includes('inlineContent'));
        if (!markup) return;

        markup.children = this.processMarkup(markup.children);
    }

    /**
     * Handle message render
     */
    afterRenderMessageContent(component, _childrenObject, args, retVal) {
        const markup = Utils.findInReactTree(retVal, filter =>
            filter &&
            filter.className &&
            filter.className.includes('markup') &&
            filter.children.length >= 2);
        if (!markup) return;
        markup.children[1] = this.processMarkup(markup.children[1]);
    }

    /**
     * Handle send message
     */
    async handleSendMessage(MessageActions, args, orig) {
        if (!args.length) return orig(...args);
        const { content } = args[1];
        if (!content) return orig(...args);

        const emoteAsImage = Settings.getSetting('emotes', 'default', 'emoteasimage').value &&
            (DiscordApi.currentChannel.type === 'DM' || DiscordApi.currentChannel.type === 'GROUP_DM' || DiscordApi.currentChannel.checkPermissions(DiscordApi.modules.DiscordPermissions.ATTACH_FILES));

        if (!emoteAsImage || content.split(' ').length > 1) {
            args[1].content = args[1].content.split(' ').map(word => {
                const isEmote = /;(.*?);/g.exec(word);
                if (isEmote) {
                    const emote = this.findByName(isEmote[1], true);
                    if (!emote) return word;
                    this.addToMostUsed(emote);
                    return emote ? `;${isEmote[1]};` : word;
                }
                return word;
            }).join(' ');
            return orig(...args);
        }

        const isEmote = /;(.*?);/g.exec(content);
        if (!isEmote) return orig(...args);

        const emote = this.findByName(isEmote[1]);
        if (!emote) return orig(...args);
        this.addToMostUsed(emote);

        const FileActions = Reflection.module.byProps('makeFile');
        const Uploader = Reflection.module.byProps('instantBatchUpload');

        request.get(emote.props.src, { encoding: 'binary' }).then(res => {
            const arr = new Uint8Array(new ArrayBuffer(res.length));
            for (let i = 0; i < res.length; i++) arr[i] = res.charCodeAt(i);
            const suffix = arr[0] === 71 && arr[1] === 73 && arr[2] === 70 ? '.gif' : '.png';
            Uploader.upload(args[0], FileActions.makeFile(arr, `${emote.name}.bdemote${suffix}`));
        });
    }

    /**
     * Handle edit message
     */
    handleEditMessage(component, args, orig) {
        if (!args.length) return orig(...args);
        const { content } = args[2];
        if (!content) return orig(...args);
        args[2].content = args[2].content.split(' ').map(word => {
            const isEmote = /;(.*?);/g.exec(word);
            return isEmote ? `;${isEmote[1]};` : word;
        }).join(' ');
        return orig(...args);
    }

    /**
     * Handle MessageAccessories render
     */
    afterRenderMessageAccessories(component, args, retVal) {
        if (!component.props || !component.props.message) return;
        if (!component.props.message.attachments || component.props.message.attachments.length !== 1) return;

        const filename = component.props.message.attachments[0].filename;
        const match = filename.match(/([^/]*)\.bdemote\.(gif|png)$/i);
        if (!match) return;

        const emote = this.findByName(match[1]);
        if (!emote) return;

        emote.jumboable = true;
        retVal.props.children[2] = emote.render();
    }

    /**
     * Inject emotes into markup
     */
    processMarkup(markup) {
        const newMarkup = [];
        if (!(markup instanceof Array)) return markup;

        const jumboable = !markup.some(child => {
            if (typeof child !== 'string') return false;
            return / \w+/g.test(child);
        });

        for (const child of markup) {
            if (typeof child !== 'string') {
                if (typeof child === 'object') {
                    const isEmoji = Utils.findInReactTree(child, filter => filter && filter.emojiName);
                    if (isEmoji) isEmoji.jumboable = jumboable;
                }
                newMarkup.push(child);
                continue;
            }

            if (!/;(\w+);/g.test(child)) {
                newMarkup.push(child);
                continue;
            }

            const words = child.split(/([^\s]+)([\s]|$)/g).filter(f => f !== '');

            let s = '';
            for (const word of words) {
                const isemote = /;(.*?);/g.exec(word);
                if (!isemote) {
                    s += word;
                    continue;
                }

                const emote = this.findByName(isemote[1]);
                if (!emote) {
                    s += word;
                    continue;
                }

                newMarkup.push(s);
                s = '';

                emote.jumboable = jumboable;
                newMarkup.push(emote.render());
            }
            if (s !== '') newMarkup.push(s);
        }
        if (newMarkup.length === 1) return newMarkup[0];
        return newMarkup;
    }

}
