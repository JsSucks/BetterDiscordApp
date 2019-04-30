/**
 * BetterDiscord React Component Manipulations
 * Original concept and some code by samogot - https://github.com/samogot / https://github.com/samogot/betterdiscord-plugins/tree/master/v2/1Lib%20Discord%20Internals
 *
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { DOM, Modals } from 'ui';
import { Utils, Filters, ClientLogger as Logger } from 'common';
import { MonkeyPatch } from './patcher';
import Reflection from './reflection/index';
import DiscordApi from './discordapi';
import PackageInstaller from './packageinstaller';

class Helpers {
    static get plannedActions() {
        return this._plannedActions || (this._plannedActions = new Map());
    }

    static recursiveArray(parent, key, count = 1) {
        let index = 0;
        function* innerCall(parent, key) {
            const item = parent[key];
            if (item instanceof Array) {
                for (const subKey of item.keys()) {
                    yield* innerCall(item, subKey)
                }
                return;
            }
            yield { item, parent, key, index: index++, count };
        }

        return innerCall(parent, key);
    }

    static recursiveArrayCount(parent, key) {
        let count = 0;
        // eslint-disable-next-line no-empty-pattern
        for (let {} of this.recursiveArray(parent, key))
            ++count;
        return this.recursiveArray(parent, key, count);
    }

    static get recursiveChildren() {
        return function* (parent, key, index = 0, count = 1) {
            const item = parent[key];
            yield { item, parent, key, index, count };
            if (item && item.props && item.props.children) {
                for (const { parent, key, index, count } of this.recursiveArrayCount(item.props, 'children')) {
                    yield* this.recursiveChildren(parent, key, index, count);
                }
            }
        }
    }

    static returnFirst(iterator, process) {
        for (const child of iterator) {
            const retVal = process(child);
            if (retVal !== undefined) return retVal;
        }
    }

    static getFirstChild(rootParent, rootKey, selector) {
        const getDirectChild = (item, selector) => {
            if (item && item.props && item.props.children) {
                return this.returnFirst(this.recursiveArrayCount(item.props, 'children'), checkFilter.bind(null, selector));
            }
        };
        const checkFilter = (selector, { item, parent, key, count, index }) => {
            let match = true;
            if (match && selector.type)
                match = item && selector.type === item.type;
            if (match && selector.tag)
                match = item && typeof item.type === 'string' && selector.tag === item.type;
            if (match && selector.className) {
                match = item && item.props && typeof item.props.className === 'string';
                if (match) {
                    const classes = item.props.className.split(' ');
                    if (selector.className === true)
                        match = !!classes[0];
                    else if (typeof selector.className === 'string')
                        match = classes.includes(selector.className);
                    else if (selector.className instanceof RegExp)
                        match = !!classes.find(cls => selector.className.test(cls));
                    else match = false;
                }
            }
            if (match && selector.text) {
                if (selector.text === true)
                    match = typeof item === 'string';
                else if (typeof selector.text === 'string')
                    match = item === selector.text;
                else if (selector.text instanceof RegExp)
                    match = typeof item === 'string' && selector.text.test(item);
                else match = false;
            }
            if (match && selector.nthChild)
                match = index === (selector.nthChild < 0 ? count + selector.nthChild : selector.nthChild);
            if (match && selector.hasChild)
                match = getDirectChild(item, selector.hasChild);
            if (match && selector.hasSuccessor)
                match = item && !!this.getFirstChild(parent, key, selector.hasSuccessor).item;
            if (match && selector.eq) {
                --selector.eq;
                return;
            }
            if (match) {
                if (selector.child) {
                    return getDirectChild(item, selector.child);
                } else if (selector.successor) {
                    return this.getFirstChild(parent, key, selector.successor);
                }

                return { item, parent, key };
            }
        };
        return this.returnFirst(this.recursiveChildren(rootParent, rootKey), checkFilter.bind(null, selector)) || {};
    }

    static parseSelector(selector) {
        if (selector.startsWith('.')) return { className: selector.substr(1) }
        if (selector.startsWith('#')) return { id: selector.substr(1) }
        return {}
    }

    static findByProp(obj, what, value) {
        if (obj.hasOwnProperty(what) && obj[what] === value) return obj;
        if (obj.props && !obj.children) return this.findByProp(obj.props, what, value);
        if (!obj.children) return null;
        if (!(obj.children instanceof Array)) return this.findByProp(obj.children, what, value);
        for (const child of obj.children) {
            if (!child) continue;
            const findInChild = this.findByProp(child, what, value);
            if (findInChild) return findInChild;
        }
        return null;
    }

    static findProp(obj, what) {
        if (obj.hasOwnProperty(what)) return obj[what];
        if (obj.props && !obj.children) return this.findProp(obj.props, what);
        if (!obj.children) return null;
        if (!(obj.children instanceof Array)) return this.findProp(obj.children, what);
        for (const child of obj.children) {
            if (!child) continue;
            const findInChild = this.findProp(child, what);
            if (findInChild) return findInChild;
        }
        return null;
    }

    static get React() {
        return Reflection.modules.React;
    }

    static get ReactDOM() {
        return Reflection.modules.ReactDOM;
    }
}

export { Helpers as ReactHelpers };

class ReactComponent {
    constructor(id, component, retVal, important) {
        this.id = id;
        this.component = component;
        this.retVal = retVal;
        this.important = important;
    }

    get elements() {
        if (!this.important || !this.important.selector) return [];

        return document.querySelectorAll(this.important.selector);
    }

    get stateNodes() {
        return [...this.elements].map(e => Reflection.DOM(e).getComponentStateNode(this));
    }

    forceUpdateAll() {
        for (const e of this.elements) {
            Reflection.DOM(e).forceUpdate(this);
        }
    }
}

export class ReactComponents {
    static get components() { return this._components || (this._components = []) }
    static get unknownComponents() { return this._unknownComponents || (this._unknownComponents = []) }
    static get listeners() { return this._listeners || (this._listeners = []) }
    static get nameSetters() { return this._nameSetters || (this._nameSetters = []) }
    static get componentAliases() { return this._componentAliases || (this._componentAliases = []) }

    static get ReactComponent() { return ReactComponent }

    static push(component, retVal, important) {
        if (!(component instanceof Function)) return null;
        const { displayName } = component;
        if (!displayName) {
            return this.processUnknown(component, retVal);
        }

        const have = this.components.find(comp => comp.id === displayName);
        if (have) {
            if (!have.important) have.important = important;
            return component;
        }

        const c = new ReactComponent(displayName, component, retVal, important);
        this.components.push(c);

        const listener = this.listeners.find(listener => listener.id === displayName);
        if (listener) {
            for (const l of listener.listeners) l(c);
            Utils.removeFromArray(this.listeners, listener);
        }

        return c;
    }

    /**
     * Finds a component from the components array or by waiting for it to be mounted.
     * @param {String} name The component's name
     * @param {Object} important An object containing a selector to look for
     * @param {Function} filter A function to filter components if a single element is rendered by multiple components
     * @return {Promise => ReactComponent}
     */
    static async getComponent(name, important, filter) {
        name = this.getComponentName(name);

        const have = this.components.find(c => c.id === name);
        if (have) return have;

        if (important) {
            const callback = () => {
                if (this.components.find(c => c.id === name)) {
                    Logger.info('ReactComponents', `Important component ${name} already found`);
                    DOM.observer.unsubscribe(observerSubscription);
                    return;
                }

                const elements = document.querySelectorAll(important.selector);
                if (!elements.length) return;

                let component, reflect;
                for (const element of elements) {
                    reflect = Reflection.DOM(element);
                    component = filter ? reflect.components.find(component => {
                        try {
                            return filter.call(undefined, component);
                        } catch (err) {
                            return false;
                        }
                    }) : reflect.component;
                    if (component) break;
                }

                if (!component && filter) {
                    Logger.log('ReactComponents', ['Found elements matching the query selector but no components passed the filter', name, important, filter]);
                    return;
                }

                DOM.observer.unsubscribe(observerSubscription);

                if (!component) {
                    Logger.err('ReactComponents', [`FAILED TO GET IMPORTANT COMPONENT ${name} WITH REFLECTION FROM`, elements]);
                    return;
                }

                if (!component.displayName) component.displayName = name;
                Logger.info('ReactComponents', [`Found important component ${name} with reflection`, reflect]);
                important.filter = filter;
                this.push(component, undefined, important);
            };

            const observerSubscription = DOM.observer.subscribeToQuerySelector(callback, important.selector, null, true);
            setTimeout(callback, 0);
        }

        let listener = this.listeners.find(l => l.id === name);
        if (!listener) this.listeners.push(listener = {
            id: name,
            listeners: []
        });

        return new Promise(resolve => {
            listener.listeners.push(resolve);
        });
    }

    static getComponentName(name) {
        const resolvedAliases = [];

        while (this.componentAliases[name]) {
            resolvedAliases.push(name);
            name = this.componentAliases[name];

            if (resolvedAliases.includes(name)) break;
        }

        return name;
    }

    static setName(name, filter) {
        const have = this.components.find(c => c.id === name);
        if (have) return have;

        for (const [rci, rc] of this.unknownComponents.entries()) {
            if (filter(rc.component)) {
                rc.component.displayName = name;
                this.unknownComponents.splice(rci, 1);
                return this.push(rc.component);
            }
        }
        return this.nameSetters.push({ name, filter });
    }

    static processUnknown(component, retVal) {
        const have = this.unknownComponents.find(c => c.component === component);
        for (const [fi, filter] of this.nameSetters.entries()) {
            if (filter.filter.filter(component)) {
                Logger.log('ReactComponents', 'Filter match!');
                component.displayName = filter.name;
                this.nameSetters.splice(fi, 1);
                return this.push(component, retVal);
            }
        }
        if (have) return have;
        this.unknownComponents.push(component);
        return component;
    }
}

export class ReactAutoPatcher {
    /**
     * Wait for React to be loaded and patch it's createElement to store all unknown components.
     * Also patches some known components.
     */
    static async autoPatch() {
        const React = await Reflection.module.waitForModuleByName('React');

        this.unpatchCreateElement = MonkeyPatch('BD:ReactComponents:createElement', React).before('createElement', (component, args) => ReactComponents.push(args[0]));

        this.patchComponents();
    }

    /**
     * Patches a few known components.
     */
    static patchComponents() {
        const componentPatchFunctions = Object.getOwnPropertyNames(this).filter(p => p.startsWith('patch') && p !== 'patchComponents');
        return Promise.all(componentPatchFunctions.map(p => this[p].call(this)));
    }

    static async patchMessage() {
        const { selector } = Reflection.resolve('message', 'messageCozy', 'messageCompact');
        this.Message = await ReactComponents.getComponent('Message', {selector}, m => m.prototype && m.prototype.renderCozy);

        this.unpatchMessageRender = MonkeyPatch('BD:ReactComponents', this.Message.component.prototype).after('render', (component, args, retVal) => {
            const { message, jumpSequenceId, canFlash } = component.props;
            const { id, colorString, bot, author, attachments, embeds } = message;
            if (jumpSequenceId && canFlash) retVal = retVal.props.children;
            retVal.props['data-message-id'] = id;
            retVal.props['data-colourstring'] = colorString;
            if (author && author.id) retVal.props['data-user-id'] = author.id;
            if (bot || (author && author.bot)) retVal.props.className += ' bd-isBot';
            if (attachments && attachments.length) retVal.props.className += ' bd-hasAttachments';
            if (embeds && embeds.length) retVal.props.className += ' bd-hasEmbeds';
            if (author && author.id === DiscordApi.currentUser.id) retVal.props.className += ' bd-isCurrentUser';

            const dapiMessage = DiscordApi.Message.from(message);
            if (dapiMessage.guild && author.id === dapiMessage.guild.ownerId) retVal.props.className += ' bd-isGuildOwner';
            if (dapiMessage.guild && dapiMessage.guild.isMember(author.id)) retVal.props.className += ' bd-isGuildMember';
        });

        this.Message.forceUpdateAll();
    }

    static async patchMessageContent() {
        const { selector } = Reflection.resolve('container', 'containerCozy', 'containerCompact', 'edited');
        this.MessageContent = await ReactComponents.getComponent('MessageContent', {selector}, c => c.defaultProps && c.defaultProps.hasOwnProperty('disableButtons'));
    }

    static async patchSpoiler() {
        const { selector } = Reflection.resolve('spoilerText', 'spoilerContainer');
        this.Spoiler = await ReactComponents.getComponent('Spoiler', {selector}, c => c.prototype.renderSpoilerText);
    }

    static async patchMessageAccessories() {
        const { selector } = Reflection.resolve('container', 'containerCozy', 'embedWrapper');
        this.MessageAccessories = await ReactComponents.getComponent('MessageAccessories', {selector});
    }

    static async patchMessageGroup() {
        const { selector } = Reflection.resolve('container', 'message', 'messageCozy');
        this.MessageGroup = await ReactComponents.getComponent('MessageGroup', {selector});

        this.unpatchMessageGroupRender = MonkeyPatch('BD:ReactComponents', this.MessageGroup.component.prototype).after('render', (component, args, retVal) => {
            const { author, type } = component.props.messages[0];
            retVal.props['data-author-id'] = author.id;
            if (author.id === DiscordApi.currentUser.id) retVal.props.className += ' bd-isCurrentUser';
            if (type !== 0) retVal.props.className += ' bd-isSystemMessage';

            const dapiMessage = DiscordApi.Message.from(component.props.messages[0]);
            if (dapiMessage.guild && author.id === dapiMessage.guild.ownerId) retVal.props.className += ' bd-isGuildOwner';
            if (dapiMessage.guild && dapiMessage.guild.isMember(author.id)) retVal.props.className += ' bd-isGuildMember';
        });

        this.MessageGroup.forceUpdateAll();
    }

    static async patchImageWrapper() {
        ReactComponents.componentAliases.ImageWrapper = 'Image';

        const { selector } = Reflection.resolve('imageWrapper');
        this.ImageWrapper = await ReactComponents.getComponent('ImageWrapper', {selector}, c => typeof c.defaultProps.children === 'function');
    }

    static async patchChannelMember() {
        ReactComponents.componentAliases.ChannelMember = 'MemberListItem';

        const { selector } = Reflection.resolve('member', 'memberInner', 'activity');
        this.ChannelMember = await ReactComponents.getComponent('ChannelMember', {selector}, m => m.prototype.renderActivity);

        this.unpatchChannelMemberRender = MonkeyPatch('BD:ReactComponents', this.ChannelMember.component.prototype).after('render', (component, args, retVal) => {
            if (!retVal.props || !retVal.props.children) return;
            const user = Helpers.findProp(component, 'user');
            if (!user) return;
            retVal.props['data-user-id'] = user.id;
            retVal.props['data-colourstring'] = component.props.colorString;
            if (component.props.isOwner) retVal.props.className += ' bd-isGuildOwner';
        });

        this.ChannelMember.forceUpdateAll();
    }

    static async patchNameTag() {
        const { selector } = Reflection.resolve('nameTag', 'username', 'discriminator', 'ownerIcon');
        this.NameTag = await ReactComponents.getComponent('NameTag', {selector});
    }

    static async patchGuild() {
        const selector = `div.${Reflection.resolve('container', 'guildIcon', 'selected', 'unread').className}:not(:first-child)`;
        this.Guild = await ReactComponents.getComponent('Guild', {selector}, m => m.prototype.renderBadge);

        this.unpatchGuild = MonkeyPatch('BD:ReactComponents', this.Guild.component.prototype).after('render', (component, args, retVal) => {
            const { guild } = component.props;
            if (!guild) return;
            retVal.props['data-guild-id'] = guild.id;
            retVal.props['data-guild-name'] = guild.name;
        });

        this.Guild.forceUpdateAll();
    }

    /**
     * The Channel component contains the header, message scroller, message form and member list.
     */
    static async patchChannel() {
        const { selector } = Reflection.resolve('chat', 'title', 'channelName');
        this.Channel = await ReactComponents.getComponent('Channel', {selector});

        this.unpatchChannel = MonkeyPatch('BD:ReactComponents', this.Channel.component.prototype).after('render', (component, args, retVal) => {
            const channel = component.props.channel || component.state.channel;
            if (!channel) return;
            retVal.props['data-channel-id'] = channel.id;
            retVal.props['data-channel-name'] = channel.name;
            if ([0, 2, 4].includes(channel.type)) retVal.props.className += ' bd-isGuildChannel';
            if ([1, 3].includes(channel.type)) retVal.props.className += ' bd-isPrivateChannel';
            if (channel.type === 3) retVal.props.className += ' bd-isGroupChannel';
        });

        this.Channel.forceUpdateAll();
    }

    static async patchChannelTextArea() {
        const { selector } = Reflection.resolve('channelTextArea', 'autocomplete');
        this.ChannelTextArea = await ReactComponents.getComponent('ChannelTextArea', {selector});
    }

    /**
     * The GuildTextChannel component represents a text channel in the guild channel list.
     */
    static async patchGuildTextChannel() {
        ReactComponents.componentAliases.GuildTextChannel = 'TextChannel';

        const { selector } = Reflection.resolve('containerDefault', 'actionIcon');
        this.GuildTextChannel = await ReactComponents.getComponent('GuildTextChannel', {selector}, c => c.prototype.renderMentionBadge);

        this.unpatchGuildTextChannel = MonkeyPatch('BD:ReactComponents', this.GuildTextChannel.component.prototype).after('render', this._afterChannelRender);

        this.GuildTextChannel.forceUpdateAll();
    }

    /**
     * The GuildVoiceChannel component represents a voice channel in the guild channel list.
     */
    static async patchGuildVoiceChannel() {
        ReactComponents.componentAliases.GuildVoiceChannel = 'VoiceChannel';

        const { selector } = Reflection.resolve('containerDefault', 'actionIcon');
        this.GuildVoiceChannel = await ReactComponents.getComponent('GuildVoiceChannel', {selector}, c => c.prototype.handleVoiceConnect);

        this.unpatchGuildVoiceChannel = MonkeyPatch('BD:ReactComponents', this.GuildVoiceChannel.component.prototype).after('render', this._afterChannelRender);

        this.GuildVoiceChannel.forceUpdateAll();
    }

    /**
     * The DirectMessage component represents a channel in the direct messages list.
     */
    static async patchDirectMessage() {
        ReactComponents.componentAliases.DirectMessage = 'PrivateChannel';

        const { selector } = Reflection.resolve('channel', 'avatar', 'name');
        this.DirectMessage = await ReactComponents.getComponent('DirectMessage', {selector}, c => c.prototype.renderAvatar);

        this.unpatchDirectMessage = MonkeyPatch('BD:ReactComponents', this.DirectMessage.component.prototype).after('render', this._afterChannelRender);

        this.DirectMessage.forceUpdateAll();
    }

    static _afterChannelRender(component, args, retVal) {
        const { channel } = component.props;
        if (!channel) return;

        retVal.props['data-channel-id'] = channel.id;
        retVal.props['data-channel-name'] = channel.name;
        if ([0, 2, 4].includes(channel.type)) retVal.props.className += ' bd-isGuildChannel';
        if (channel.type === 2) retVal.props.className += ' bd-isVoiceChannel';
        // if (channel.type === 4) retVal.props.className += ' bd-isChannelCategory';
        if ([1, 3].includes(channel.type)) retVal.props.className += ' bd-isPrivateChannel';
        if (channel.type === 3) retVal.props.className += ' bd-isGroupChannel';
    }

    static async patchUserProfileModal() {
        ReactComponents.componentAliases.UserProfileModal = 'UserProfileBody';

        const { selector } = Reflection.resolve('root', 'topSectionNormal');
        this.UserProfileModal = await ReactComponents.getComponent('UserProfileModal', {selector}, c => c.prototype.renderHeader && c.prototype.renderBadges);

        this.unpatchUserProfileModal = MonkeyPatch('BD:ReactComponents', this.UserProfileModal.component.prototype).after('render', (component, args, retVal) => {
            const root = retVal.props.children[0] || retVal.props.children;
            const { user } = component.props;
            if (!user) return;
            root.props['data-user-id'] = user.id;
            if (user.bot) root.props.className += ' bd-isBot';
            if (user.id === DiscordApi.currentUser.id) root.props.className += ' bd-isCurrentUser';
        });

        this.UserProfileModal.forceUpdateAll();
    }

    static async patchUserPopout() {
        const { selector } = Reflection.resolve('userPopout', 'headerNormal');
        this.UserPopout = await ReactComponents.getComponent('UserPopout', {selector}, c => c.prototype.renderHeader);

        this.unpatchUserPopout = MonkeyPatch('BD:ReactComponents', this.UserPopout.component.prototype).after('render', (component, args, retVal) => {
            const root = retVal.props.children[0] || retVal.props.children;
            const { user, guild, guildMember } = component.props;
            if (!user) return;
            root.props['data-user-id'] = user.id;
            if (user.bot) root.props.className += ' bd-isBot';
            if (user.id === DiscordApi.currentUser.id) root.props.className += ' bd-isCurrentUser';
            if (guild) root.props['data-guild-id'] = guild.id;
            if (guild && user.id === guild.ownerId) root.props.className += ' bd-isGuildOwner';
            if (guild && guildMember) root.props.className += ' bd-isGuildMember';
            if (guildMember && guildMember.roles.length) root.props.className += ' bd-hasRoles';
        });

        this.UserPopout.forceUpdateAll();
    }

    static async patchUploadArea() {
        const { selector } = Reflection.resolve('uploadArea');
        this.UploadArea = await ReactComponents.getComponent('UploadArea', {selector});

        PackageInstaller.uploadAreaPatch(this.UploadArea);
    }
}
