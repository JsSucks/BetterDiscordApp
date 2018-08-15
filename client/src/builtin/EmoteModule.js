/**
 * BetterDiscord Emote Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Settings, Globals, WebpackModules, ReactComponents, MonkeyPatch } from 'modules';
import { VueInjector, Reflection } from 'ui';
import { Utils, FileUtils, ClientLogger as Logger } from 'common';
import path from 'path';
import EmoteComponent from './EmoteComponent.vue';
import Autocomplete from '../ui/components/common/Autocomplete.vue';

const enforceWrapperFrom = (new Date('2018-05-01')).valueOf();

export default new class EmoteModule {

    constructor() {
        this.emotes = new Map();
        this.favourite_emotes = [];
    }

    async init() {
        const dataPath = Globals.getPath('data');

        this.enabledSetting = Settings.getSetting('emotes', 'default', 'enable');
        this.enabledSetting.on('setting-updated', async event => {
            // Load emotes if we haven't already
            if (event.value && !this.emotes.size) await this.load(path.join(dataPath, 'emotes.json'));

            // Rerender all messages (or if we're disabling emotes, those that have emotes)
            for (const message of document.querySelectorAll(event.value ? '.message' : '.bd-emotewrapper')) {
                Reflection(event.value ? message : message.closest('.message')).forceUpdate();
            }
        });

        try {
            if (this.enabledSetting.value) await this.load(path.join(dataPath, 'emotes.json'));
            else Logger.info('EmoteModule', ['Not loading emotes as they\'re disabled.']);
        } catch (err) {
            Logger.err('EmoteModule', [`Failed to load emote data. Make sure you've downloaded the emote data and placed it in ${dataPath}:`, err]);
            return;
        }

        try {
            await Promise.all([
                this.patchMessageContent(),
                this.patchChannelTextArea()
            ]);
        } catch (err) {
            Logger.err('EmoteModule', ['Error patching Message / ChannelTextArea', err]);
        }
    }

    async load(dataPath) {
        const emotes = await FileUtils.readJsonFromFile(dataPath);
        for (const [index, emote] of emotes.entries()) {
            // Pause every 10000 emotes so the window doesn't freeze
            if ((index % 10000) === 0)
                await Utils.wait();

            const uri = emote.type === 2 ? 'https://cdn.betterttv.net/emote/:id/1x'
                : emote.type === 1 ? 'https://cdn.frankerfacez.com/emoticon/:id/1'
                    : 'https://static-cdn.jtvnw.net/emoticons/v1/:id/1.0';

            // emote.id is the emote's name
            // emote.src is the emote's URL
            emote.src = uri.replace(':id', emote.value.id || emote.value);
            this.emotes.set(emote.id, emote);
        }
    }

    /**
     * Sets an emote as favourite.
     * @param {String} emote The name of the emote
     * @param {Boolean} favourite The new favourite state
     * @param {Boolean} save Whether to save settings
     * @return {Promise}
     */
    setFavourite(emote, favourite, save = true) {
        emote = emote.id || emote;
        if (favourite && !this.favourite_emotes.includes(emote)) this.favourite_emotes.push(emote);
        if (!favourite) Utils.removeFromArray(this.favourite_emotes, emote);
        if (save) return Settings.saveSettings();
    }

    addFavourite(emote, save = true) {
        return this.setFavourite(emote, true, save);
    }

    removeFavourite(emote, save = true) {
        return this.setFavourite(emote, false, save);
    }

    isFavourite(emote) {
        emote = emote.id || emote;
        return this.favourite_emotes.includes(emote);
    }

    get searchCache() {
        return this._searchCache || (this._searchCache = {});
    }

    processMarkup(markup, timestamp) {
        timestamp = timestamp.valueOf();
        const allowNoWrapper = timestamp < enforceWrapperFrom;

        const newMarkup = [];
        for (const child of markup) {
            if (typeof child !== 'string') {
                newMarkup.push(child);
                continue;
            }
            if (!this.testWord(child) && !allowNoWrapper) {
                newMarkup.push(child);
                continue;
            }
            const words = child.split(/([^\s]+)([\s]|$)/g);
            if (!words) continue;
            let text = null;
            for (const [wordIndex, word] of words.entries()) {
                const emote = this.getEmote(word);
                if (emote) {
                    if (text !== null) {
                        newMarkup.push(text);
                        text = null;
                    }

                    newMarkup.push(VueInjector.createReactElement(EmoteComponent, {
                        src: emote.src,
                        name: emote.id,
                        hasWrapper: /;[\w]+;/gmi.test(word)
                    }));

                    continue;
                }
                if (text === null) {
                    text = word;
                } else {
                    text += word;
                }
                if (wordIndex === words.length - 1) {
                    newMarkup.push(text);
                }
            }
        }
        return newMarkup;
    }

    testWord(word) {
        return !/;[\w]+;/gmi.test(word);
    }

    findByProp(obj, what, value) {
        if (obj.hasOwnProperty(what) && obj[what] === value) return obj;
        if (obj.props && !obj.children) return this.findByProp(obj.props, what, value);
        if (!obj.children || !obj.children.length) return null;
        for (const child of obj.children) {
            if (!child) continue;
            const findInChild = this.findByProp(child, what, value);
            if (findInChild) return findInChild;
        }
        return null;
    }

    getEmote(word) {
        const name = word.replace(/;/g, '');
        return this.emotes.get(name);
    }

    filter(regex, limit, start = 0) {
        const key = `${regex}:${limit}:${start}`;
        if (this.searchCache.hasOwnProperty(key)) return this.searchCache[key];
        let index = 0;
        let startIndex = 0;

        const matching = this.searchCache[key] = [];
        for (const emote of this.emotes.values()) {
            if (index >= limit) break;
            if (regex.test(emote.id)) {
                if (startIndex < start) {
                    startIndex++;
                    continue;
                }
                index++;
                matching.push(emote);
            }
        }

        return matching;
    }

    async patchMessageContent() {
        const selector = `.${WebpackModules.getClassName('container', 'containerCozy', 'containerCompact', 'edited')}`;
        const MessageContent = await ReactComponents.getComponent('MessageContent', {selector});

        this.unpatchRender = MonkeyPatch('BD:EmoteModule', MessageContent.component.prototype).after('render', (component, args, retVal) => {
            try {
                // First child has all the actual text content, second is the edited timestamp
                const markup = retVal.props.children[1].props;
                if (!markup || !markup.children || !this.enabledSetting.value) return;
                markup.children[1] = this.processMarkup(markup.children[1], component.props.message.editedTimestamp || component.props.message.timestamp);
            } catch (err) {
                Logger.err('EmoteModule', err);
            }
        });

        MessageContent.forceUpdateAll();
    }

    async patchChannelTextArea() {
        const selector = `.${WebpackModules.getClassName('channelTextArea', 'emojiButton')}`;
        const ChannelTextArea = await ReactComponents.getComponent('ChannelTextArea', {selector});

        this.unpatchChannelTextArea = MonkeyPatch('BD:EmoteModule', ChannelTextArea.component.prototype).after('render', (component, args, retVal) => {
            if (!(retVal.props.children instanceof Array)) retVal.props.children = [retVal.props.children];

            retVal.props.children.splice(0, 0, VueInjector.createReactElement(Autocomplete, {}, true));
        });

        ChannelTextArea.forceUpdateAll();
    }

}
