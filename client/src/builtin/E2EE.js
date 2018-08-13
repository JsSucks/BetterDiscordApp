/**
 * BetterDiscord E2EE Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Settings, Cache } from 'modules';
import BuiltinModule from './BuiltinModule';
import { WebpackModules, ReactComponents, MonkeyPatch, Patcher, DiscordApi, Security } from 'modules';
import { VueInjector, Reflection } from 'ui';
import { ClientLogger as Logger } from 'common';
import { request } from 'vendor';
import { Utils } from 'common';
import E2EEComponent from './E2EEComponent.vue';
import E2EEMessageButton from './E2EEMessageButton.vue';

const userMentionPattern = new RegExp(`<@!?([0-9]{10,})>`, "g");
const roleMentionPattern = new RegExp(`<@&([0-9]{10,})>`, "g");
const everyoneMentionPattern = new RegExp(`(?:\\s+|^)@everyone(?:\\s+|$)`);

const TEMP_KEY = 'temporarymasterkey';
let seed;

export default new class E2EE extends BuiltinModule {

    constructor() {
        super();
        this.encryptNewMessages = true;
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

    async enabled(e) {
        seed = Security.randomBytes();
        // TODO Input modal for key
        this.master = Security.encrypt(seed, TEMP_KEY);
        this.patchDispatcher();
        this.patchMessageContent();
        const selector = '.' + WebpackModules.getClassName('channelTextArea', 'emojiButton');
        const cta = await ReactComponents.getComponent('ChannelTextArea', { selector });
        this.patchChannelTextArea(cta);
        this.patchChannelTextAreaSubmit(cta);
        cta.forceUpdateAll();
    }

    patchDispatcher() {
        const Dispatcher = WebpackModules.getModuleByName('Dispatcher');
        MonkeyPatch('BD:E2EE', Dispatcher).before('dispatch', (_, [event]) => {
            if (event.type !== "MESSAGE_CREATE") return;

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
        const selector = '.' + WebpackModules.getClassName('container', 'containerCozy', 'containerCompact', 'edited');
        const MessageContent = await ReactComponents.getComponent('MessageContent', { selector });
        MonkeyPatch('BD:E2EE', MessageContent.component.prototype).before('render', this.beforeRenderMessageContent.bind(this));
        MonkeyPatch('BD:E2EE', MessageContent.component.prototype).after('render', this.renderMessageContent.bind(this));
        const ImageWrapper = await ReactComponents.getComponent('ImageWrapper', { selector: '.' + WebpackModules.getClassName('imageWrapper') });
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
        try {
            retVal.props.children[0].props.children.props.children.props.children.unshift(VueInjector.createReactElement(E2EEMessageButton));
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
                component.props.src = component.props.original = 'data:;base64,' + decrypt;
            } catch (err) { return } finally { component.props.readyState = 'READY' }
            return;
        }

        component.props.readyState = 'LOADING';
        Logger.info('E2EE', 'Decrypting image: ' + src);
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

    async disabled(e) {
        for (const patch of Patcher.getPatchesByCaller('BD:E2EE')) patch.unpatch();
        const ctaComponent = await ReactComponents.getComponent('ChannelTextArea');
        ctaComponent.forceUpdateAll();
    }

}
