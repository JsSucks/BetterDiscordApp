/**
 * BetterDiscord E2EE Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Settings, Cache, Events } from 'modules';
import BuiltinModule from './BuiltinModule';
import { WebpackModules, ReactComponents, MonkeyPatch, Patcher, DiscordApi, Security } from 'modules';
import { VueInjector, Reflection, Modals, Toasts } from 'ui';
import { ClientLogger as Logger } from 'common';
import { request } from 'vendor';
import { Utils } from 'common';
import E2EEComponent from './E2EEComponent.vue';
import E2EEMessageButton from './E2EEMessageButton.vue';
import nodecrypto from 'node-crypto';

const userMentionPattern = new RegExp(`<@!?([0-9]{10,})>`, 'g');
const roleMentionPattern = new RegExp(`<@&([0-9]{10,})>`, 'g');
const everyoneMentionPattern = new RegExp(`(?:\\s+|^)@everyone(?:\\s+|$)`);

const START_DATE = new Date();
const TEMP_KEY = 'temporarymasterkey';
const ECDH_STORAGE = {};
let seed;

export default new class E2EE extends BuiltinModule {

    constructor() {
        super();
        this.encryptNewMessages = true;
        this.ecdhDate = START_DATE;
        this.handlePublicKey = this.handlePublicKey.bind(this);
    }

    async enabled(e) {
        try {
            const newMaster = await Modals.input('Open Database', 'Master Password', true).promise;
            this.setMaster(newMaster);
            this.patchDispatcher();
            this.patchMessageContent();
            const selector = `.${WebpackModules.getClassName('channelTextArea', 'emojiButton')}`;
            const cta = await ReactComponents.getComponent('ChannelTextArea', { selector });
            this.patchChannelTextArea(cta);
            this.patchChannelTextAreaSubmit(cta);
            cta.forceUpdateAll();
        } catch (err) {
            Settings.getSetting(...this.settingPath).value = false;
            Toasts.error('Invalid master password! E2EE Disabled');
        }
    }

    async disabled(e) {
        Events.off('discord:MESSAGE_CREATE', this.handlePublicKey);
        for (const patch of Patcher.getPatchesByCaller('BD:E2EE')) patch.unpatch();
        const ctaComponent = await ReactComponents.getComponent('ChannelTextArea');
        ctaComponent.forceUpdateAll();
    }

    setMaster(key) {
        seed = Security.randomBytes();
        const newMaster = Security.encrypt(seed, key);
        // TODO re-encrypt everything with new master
        return (this.master = newMaster);
    }

    get settingPath() {
        return ['security', 'default', 'e2ee'];
    }

    get database() {
        return Settings.getSetting('security', 'e2eedb', 'e2ekvps').value;
    }

    encrypt(key, content, prefix = '') {
        if (!key) {
            // Encrypt something with master
            return Security.encrypt(Security.decrypt(seed, this.master), content);
        }

        if (!content) {
            // Get key for current channel and encrypt
            const haveKey = this.getKey(DiscordApi.currentChannel.id);
            if (!haveKey) return 'nokey';
            return Security.encrypt(Security.decrypt(seed, [this.master, haveKey]), key);
        }
        return prefix + Security.encrypt(key, content);
    }

    decrypt(key, content, prefix = '') {
        return Security.decrypt(key, content, prefix);
    }

    async createHmac(data) {
        const haveKey = this.getKey(DiscordApi.currentChannel.id);
        if (!haveKey) return null;
        return Security.createHmac(Security.decrypt(seed, [this.master, haveKey]), data);
    }

    getKey(channelId) {
        const haveKey = this.database.find(kvp => kvp.value.key === channelId);
        if (!haveKey) return null;
        return haveKey.value.value;
    }

    setKey(channelId, key) {
        const items = Settings.getSetting('security', 'e2eedb', 'e2ekvps').items;
        const index = items.findIndex(kvp => kvp.value.key === channelId);
        if (index > -1) {
            items[index].value = {key: channelId, value: key};
            return;
        }
        Settings.getSetting('security', 'e2eedb', 'e2ekvps').addItem({ value: { key: channelId, value: key } });
    }

    createKeyExchange(dmChannelID) {
        if (ECDH_STORAGE.hasOwnProperty(dmChannelID)) return null;
        ECDH_STORAGE[dmChannelID] = Security.createECDH();
        setTimeout(() => {
            if (ECDH_STORAGE.hasOwnProperty(dmChannelID)) {
                delete ECDH_STORAGE[dmChannelID];
                Toasts.error('Key exchange expired!');
                if (this.preExchangeState) this.encryptNewMessages = this.preExchangeState;
                this.preExchangeState = null;
            }
        }, 30000);
        return Security.generateECDHKeys(ECDH_STORAGE[dmChannelID]);
    }

    publicKeyFor(dmChannelID) {
        return Security.getECDHPublicKey(ECDH_STORAGE[dmChannelID]);
    }

    computeSecret(dmChannelID, otherKey) {
        try {
            const secret = Security.computeECDHSecret(ECDH_STORAGE[dmChannelID], otherKey);
            delete ECDH_STORAGE[dmChannelID];
            return Security.hash('sha384', secret, 'hex');
        } catch (e) {
            throw e;
        }
    }

    // TODO Received exchange should also expire if not accepted in time
    async handlePublicKey(e) {
        if (!DiscordApi.currentChannel) return;
        if (DiscordApi.currentChannel.type !== 'DM') return;
        const { id, content, author, channelId } = e.args;
        if (author.id === DiscordApi.currentUser.id || channelId !== DiscordApi.currentChannel.id) return;

        const [tagstart, begin, key, end, tagend] = content.split('\n');
        if (begin !== '-----BEGIN PUBLIC KEY-----' || end !== '-----END PUBLIC KEY-----') return;

        try {
            await Modals.confirm('Key Exchange', `Key exchange request from: ${author.username}#${author.discriminator}`, 'Accept', 'Reject').promise;
            // We already sent our key
            if (!ECDH_STORAGE.hasOwnProperty(channelId)) {
                const publicKeyMessage = `\`\`\`\n-----BEGIN PUBLIC KEY-----\n${this.createKeyExchange(channelId)}\n-----END PUBLIC KEY-----\n\`\`\``;
                if (this.encryptNewMessages) this.encryptNewMessages = false;
                WebpackModules.getModuleByName('DraftActions').saveDraft(channelId, publicKeyMessage);
            }
            const secret = this.computeSecret(channelId, key);
            this.setKey(channelId, secret);
            Toasts.success('Key exchange complete!');
            if (this.preExchangeState) this.encryptNewMessages = this.preExchangeState;
            this.preExchangeState = null;
        } catch (err) {
            console.log(err);
            return;
        }
    }

    patchDispatcher() {
        const Dispatcher = WebpackModules.getModuleByName('Dispatcher');
        MonkeyPatch('BD:E2EE', Dispatcher).before('dispatch', (_, [event]) => {
            if (event.type !== 'MESSAGE_CREATE') return;

            const key = this.getKey(event.message.channel_id);
            if (!key) return; // We don't have a key for this channel

            if (typeof event.message.content !== 'string') return; // Ignore any non string content
            if (!event.message.content.startsWith('$:')) return; // Not an encrypted string
            let decrypt;
            try {
                decrypt = this.decrypt(this.decrypt(this.decrypt(seed, this.master), key), event.message.content);
            } catch (err) { return } // Ignore errors such as non empty

            const MessageParser = WebpackModules.getModuleByName('MessageParser');
            const Permissions = WebpackModules.getModuleByName('GuildPermissions');
            const DiscordConstants = WebpackModules.getModuleByName('DiscordConstants');
            const currentChannel = DiscordApi.Channel.fromId(event.message.channel_id).discordObject;

            // Create a generic message object to parse mentions with
            const parsed = MessageParser.parse(currentChannel, decrypt).content;

            if (userMentionPattern.test(parsed))
                event.message.mentions = parsed.match(userMentionPattern).map(m => {return {id: m.replace(/[^0-9]/g, '')}});
            if (roleMentionPattern.test(parsed))
                event.message.mention_roles = parsed.match(roleMentionPattern).map(m => m.replace(/[^0-9]/g, ''));
            if (everyoneMentionPattern.test(parsed))
                event.message.mention_everyone = Permissions.can(DiscordConstants.Permissions.MENTION_EVERYONE, currentChannel);
        });
    }

    async patchMessageContent() {
        const selector = `.${WebpackModules.getClassName('container', 'containerCozy', 'containerCompact', 'edited')}`;
        const MessageContent = await ReactComponents.getComponent('MessageContent', { selector });
        MonkeyPatch('BD:E2EE', MessageContent.component.prototype).before('render', this.beforeRenderMessageContent.bind(this));
        MonkeyPatch('BD:E2EE', MessageContent.component.prototype).after('render', this.renderMessageContent.bind(this));
        const ImageWrapper = await ReactComponents.getComponent('ImageWrapper', { selector: `.${WebpackModules.getClassName('imageWrapper')}` });
        MonkeyPatch('BD:E2EE', ImageWrapper.component.prototype).before('render', this.beforeRenderImageWrapper.bind(this));
    }

    beforeRenderMessageContent(component) {
        if (!component.props || !component.props.message) return;

        const key = this.getKey(component.props.message.channel_id);
        if (!key) return; // We don't have a key for this channel

        const Message = WebpackModules.getModuleByPrototypes(['isMentioned']);
        const MessageParser = WebpackModules.getModuleByName('MessageParser');
        const Permissions = WebpackModules.getModuleByName('GuildPermissions');
        const DiscordConstants = WebpackModules.getModuleByName('DiscordConstants');
        const currentChannel = DiscordApi.Channel.fromId(component.props.message.channel_id).discordObject;

        if (typeof component.props.message.content !== 'string') return; // Ignore any non string content
        if (!component.props.message.content.startsWith('$:')) return; // Not an encrypted string
        let decrypt;
        try {
            decrypt = Security.decrypt(seed, [this.master, key, component.props.message.content]);
        } catch (err) { return } // Ignore errors such as non empty

        component.props.message.bd_encrypted = true; // signal as encrypted

        // Create a generic message object to parse mentions with
        const message = MessageParser.createMessage(currentChannel.id, MessageParser.parse(currentChannel, decrypt).content);

        if (userMentionPattern.test(message.content))
            message.mentions = message.content.match(userMentionPattern).map(m => {return {id: m.replace(/[^0-9]/g, '')}});
        if (roleMentionPattern.test(message.content))
            message.mention_roles = message.content.match(roleMentionPattern).map(m => m.replace(/[^0-9]/g, ''));
        if (everyoneMentionPattern.test(message.content))
            message.mention_everyone = Permissions.can(DiscordConstants.Permissions.MENTION_EVERYONE, currentChannel);

        // Create a new message to parse it properly
        const create = Message.create(message);
        if (!create.content || !create.contentParsed) return;

        component.props.message.mentions = create.mentions;
        component.props.message.mentionRoles = create.mentionRoles;
        component.props.message.mentionEveryone = create.mentionEveryone;
        component.props.message.mentioned = create.mentioned;
        component.props.message.content = create.content;
        component.props.message.contentParsed = create.contentParsed;
    }

    renderMessageContent(component, args, retVal) {
        if (!component.props.message.bd_encrypted) return;
        const buttons = Utils.findInReactTree(retVal, m => Array.isArray(m) && m[1].props && m[1].props.currentUserId);
        if (!buttons) return;
        try {
            buttons.unshift(VueInjector.createReactElement(E2EEMessageButton));
        } catch (err) {
            Logger.err('E2EE', err.message);
        }
    }

    beforeRenderImageWrapper(component, args, retVal) {
        if (!component.props || !component.props.src) return;
        if (component.props.decrypting) return;
        component.props.decrypting = true;

        const src = component.props.original || component.props.src.split('?')[0];
        if (!src.includes('bde2ee')) return;
        component.props.className = 'bd-encryptedImage';

        const haveKey = this.getKey(DiscordApi.currentChannel.id);
        if (!haveKey) return;

        const cached = Cache.find('e2ee:images', item => item.src === src);
        if (cached) {
            if (cached.invalidKey) { // TODO If key has changed we should recheck all with invalid key
                component.props.className = 'bd-encryptedImage bd-encryptedImageBadKey';
                component.props.readyState = 'READY';
                return;
            }
            Logger.info('E2EE', 'Returning encrypted image from cache');
            try {
                const decrypt = Security.decrypt(seed, [this.master, haveKey, cached.image]);
                component.props.className = 'bd-decryptedImage';
                component.props.src = component.props.original = `data:;base64,${decrypt}`;
            } catch (err) { return } finally { component.props.readyState = 'READY' }
            return;
        }

        component.props.readyState = 'LOADING';
        Logger.info('E2EE', `Decrypting image: ${src}`);
        request.get(src, { encoding: 'binary' }).then(res => {
            (async () => {
                const arr = new Uint8Array(new ArrayBuffer(res.length));
                for (let i = 0; i < res.length; i++) arr[i] = res.charCodeAt(i);

                const aobindex = Utils.aobscan(arr, [73, 69, 78, 68]) + 8;
                const sliced = arr.slice(aobindex);
                const image = new TextDecoder().decode(sliced);

                const hmac = image.slice(-64);
                const data = image.slice(0, -64);
                const validateHmac = await this.createHmac(data);
                if (hmac !== validateHmac) {
                    Cache.push('e2ee:images', { src, invalidKey: true });
                    if (component && component.props) {
                        component.props.decrypting = false;
                        component.forceUpdate();
                    }
                    return;
                }

                Cache.push('e2ee:images', { src, image: data });

                if (!component || !component.props) {
                    Logger.warn('E2EE', 'Component seems to be gone');
                    return;
                }

                component.props.decrypting = false;
                component.forceUpdate();
            })();
        }).catch(err => {
            console.log('request error', err);
        });
    }

    patchChannelTextArea(cta) {
        MonkeyPatch('BD:E2EE', cta.component.prototype).after('render', this.renderChannelTextArea);
    }

    renderChannelTextArea(component, args, retVal) {
        if (!(retVal.props.children instanceof Array)) retVal.props.children = [retVal.props.children];
        const inner = retVal.props.children.find(child => child.props.className && child.props.className.includes('inner'));
        inner.props.children.splice(0, 0, VueInjector.createReactElement(E2EEComponent));
    }

    patchChannelTextAreaSubmit(cta) {
        MonkeyPatch('BD:E2EE', cta.component.prototype).before('handleSubmit', this.handleChannelTextAreaSubmit.bind(this));
    }

    handleChannelTextAreaSubmit(component, args, retVal) {
        const key = this.getKey(DiscordApi.currentChannel.id);
        if (!this.encryptNewMessages || !key) return;
        component.props.value = Security.encrypt(Security.decrypt(seed, [this.master, key]), component.props.value, '$:');
    }
}
