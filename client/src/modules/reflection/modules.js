/**
 * BetterDiscord Reflection Modules
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Utils, Filters } from 'common';
import Events from '../events';

const KnownModules = {
    React: Filters.byProperties(['createElement', 'cloneElement']),
    ReactDOM: Filters.byProperties(['render', 'findDOMNode']),

    Events: Filters.byPrototypeFields(['setMaxListeners', 'emit']),

    /* Guild Info, Stores, and Utilities */
    GuildStore: Filters.byProperties(['getGuild']),
    SortedGuildStore: Filters.byProperties(['getSortedGuilds']),
    SelectedGuildStore: Filters.byProperties(['getLastSelectedGuildId']),
    GuildSync: Filters.byProperties(['getSyncedGuilds']),
    GuildInfo: Filters.byProperties(['getAcronym']),
    GuildChannelsStore: Filters.byProperties(['getChannels', 'getDefaultChannel']),
    GuildMemberStore: Filters.byProperties(['getMember']),
    MemberCountStore: Filters.byProperties(['getMemberCounts']),
    GuildEmojiStore: Filters.byProperties(['getEmojis']),
    GuildActions: Filters.byProperties(['markGuildAsRead']),
    GuildPermissions: Filters.byProperties(['getGuildPermissions']),

    /* Channel Store & Actions */
    ChannelStore: Filters.byProperties(['getChannels', 'getDMFromUserId']),
    SelectedChannelStore: Filters.byProperties(['getLastSelectedChannelId']),
    ChannelActions: Filters.byProperties(['selectChannel']),
    PrivateChannelActions: Filters.byProperties(['openPrivateChannel']),
    ChannelSelector: Filters.byProperties(['selectGuild', 'selectChannel']),
    VoiceChannelActions: Filters.byProperties(['selectVoiceChannel']),

    /* Current User Info, State and Settings */
    UserInfoStore: Filters.byProperties(['getToken']),
    UserSettingsStore: Filters.byProperties(['guildPositions']),
    AccountManager: Filters.byProperties(['register', 'login']),
    UserSettingsUpdater: Filters.byProperties(['updateRemoteSettings']),
    OnlineWatcher: Filters.byProperties(['isOnline']),
    CurrentUserIdle: Filters.byProperties(['getIdleTime']),
    RelationshipStore: Filters.byProperties(['isBlocked', 'isFriend']),
    RelationshipManager: Filters.byProperties(['addRelationship']),
    MentionStore: Filters.byProperties(['getMentions']),

    /* User Stores and Utils */
    UserStore: Filters.byProperties(['getCurrentUser']),
    UserStatusStore: Filters.byProperties(['getStatuses']),
    UserTypingStore: Filters.byProperties(['isTyping']),
    UserActivityStore: Filters.byProperties(['getActivity']),
    UserNameResolver: Filters.byProperties(['getName']),
    UserNoteStore: Filters.byProperties(['getNote']),
    UserNoteActions: Filters.byProperties(['updateNote']),
    DraftActions: Filters.byProperties(['changeDraft']),

    /* Emoji Store and Utils */
    EmojiInfo: Filters.byProperties(['isEmojiDisabled']),
    EmojiUtils: Filters.byProperties(['getGuildEmoji']),
    EmojiStore: Filters.byProperties(['getByCategory', 'EMOJI_NAME_RE']),

    /* Invite Store and Utils */
    InviteStore: Filters.byProperties(['getInvites']),
    InviteResolver: Filters.byProperties(['findInvite']),
    InviteActions: Filters.byProperties(['acceptInvite']),

    /* Discord Objects & Utils */
    DiscordConstants: Filters.byProperties(['Permissions', 'ActivityTypes', 'StatusTypes']),
    Permissions: Filters.byProperties(['getHighestRole']),
    ColorConverter: Filters.byProperties(['hex2int']),
    ColorShader: Filters.byProperties(['darken']),
    TinyColor: Filters.byPrototypeFields(['toRgb']),
    ClassResolver: Filters.byProperties(['getClass']),
    ButtonData: Filters.byProperties(['ButtonSizes']),
    IconNames: Filters.byProperties(['IconNames']),
    NavigationUtils: Filters.byProperties(['transitionTo', 'replaceWith', 'getHistory']),

    /* Discord Messages */
    MessageStore: Filters.byProperties(['getMessages']),
    MessageActions: Filters.byProperties(['jumpToMessage', '_sendMessage']),
    MessageQueue: Filters.byProperties(['enqueue']),
    MessageParser: Filters.byProperties(['createMessage', 'parse', 'unparse']),

    /* In-Game Overlay */
    OverlayUserPopoutSettings: Filters.byProperties(['openUserPopout']),
    OverlayUserPopoutInfo: Filters.byProperties(['getOpenedUserPopout']),

    /* Experiments */
    ExperimentStore: Filters.byProperties(['getExperimentOverrides']),
    ExperimentsManager: Filters.byProperties(['isDeveloper']),
    CurrentExperiment: Filters.byProperties(['getExperimentId']),

    /* Images, Avatars and Utils */
    ImageResolver: Filters.byProperties(['getUserAvatarURL']),
    ImageUtils: Filters.byProperties(['getSizedImageSrc']),
    AvatarDefaults: Filters.byProperties(['getUserAvatarURL', 'DEFAULT_AVATARS']),

    /* Drag & Drop */
    DNDActions: Filters.byProperties(['beginDrag']),
    DNDSources: Filters.byProperties(['addTarget']),
    DNDObjects: Filters.byProperties(['DragSource']),

    /* Electron & Other Internals with Utils */
    ElectronModule: Filters.byProperties(['_getMainWindow']),
    Dispatcher: Filters.byProperties(['dirtyDispatch']),
    PathUtils: Filters.byProperties(['hasBasename']),
    NotificationModule: Filters.byProperties(['showNotification']),
    RouterModule: Filters.byProperties(['Router']),
    APIModule: Filters.byProperties(['getAPIBaseURL']),
    AnalyticEvents: Filters.byProperties(['AnalyticEventConfigs']),
    KeyGenerator: Filters.byCode(/"binary"/),
    Buffers: Filters.byProperties(['Buffer', 'kMaxLength']),
    DeviceStore: Filters.byProperties(['getDevices']),
    SoftwareInfo: Filters.byProperties(['os']),
    CurrentContext: Filters.byProperties(['setTagsContext']),

    /* Media Stuff (Audio/Video) */
    MediaDeviceInfo: Filters.byProperties(['Codecs', 'SUPPORTED_BROWSERS']),
    MediaInfo: Filters.byProperties(['getOutputVolume']),
    MediaEngineInfo: Filters.byProperties(['MediaEngineFeatures']),
    VoiceInfo: Filters.byProperties(['EchoCancellation']),
    VideoStream: Filters.byProperties(['getVideoStream']),
    SoundModule: Filters.byProperties(['playSound']),

    /* Window, DOM, HTML */
    WindowInfo: Filters.byProperties(['isFocused', 'windowSize']),
    TagInfo: Filters.byProperties(['VALID_TAG_NAMES']),
    DOMInfo: Filters.byProperties(['canUseDOM']),

    /* Locale/Location and Time */
    LocaleManager: Filters.byProperties(['setLocale']),
    Moment: Filters.byProperties(['parseZone']),
    LocationManager: Filters.byProperties(['createLocation']),
    Timestamps: Filters.byProperties(['fromTimestamp']),
    TimeFormatter: Filters.byProperties(['dateFormat']),

    /* Strings and Utils */
    Strings: Filters.byProperties(['TEXT', 'TEXTAREA_PLACEHOLDER']),
    StringFormats: Filters.byProperties(['a', 'z']),
    StringUtils: Filters.byProperties(['toASCII']),

    /* URLs and Utils */
    URLParser: Filters.byProperties(['Url', 'parse']),
    ExtraURLs: Filters.byProperties(['getArticleURL']),

    /* Text Processing */
    hljs: Filters.byProperties(['highlight', 'highlightBlock']),
    SimpleMarkdown: Filters.byProperties(['parseBlock', 'parseInline', 'defaultOutput']),

    /* DOM/React Components */
    /* ==================== */
    LayerManager: Filters.byProperties(['popLayer', 'pushLayer']),
    Tooltips: m => m.hide && m.show && !m.search && !m.submit && !m.search && !m.activateRagingDemon && !m.dismiss,
    UserSettingsWindow: Filters.byProperties(['open', 'updateAccount']),
    ChannelSettingsWindow: Filters.byProperties(['open', 'updateChannel']),
    GuildSettingsWindow: Filters.byProperties(['open', 'updateGuild']),

    /* Modals */
    ModalStack: Filters.byProperties(['push', 'update', 'pop', 'popWithKey']),
    ConfirmModal: Filters.byPrototypeFields(['handleCancel', 'handleSubmit', 'handleMinorConfirm']),
    UserProfileModal: Filters.byProperties(['fetchMutualFriends', 'setSection']),
    ChangeNicknameModal: Filters.byProperties(['open', 'changeNickname']),
    CreateChannelModal: Filters.byProperties(['open', 'createChannel']),
    PruneMembersModal: Filters.byProperties(['open', 'prune']),
    NotificationSettingsModal: Filters.byProperties(['open', 'updateNotificationSettings']),
    PrivacySettingsModal: Filters.byCode(/PRIVACY_SETTINGS_MODAL_OPEN/, m => m.open),
    CreateInviteModal: Filters.byProperties(['open', 'createInvite']),

    /* Popouts */
    PopoutStack: Filters.byProperties(['open', 'close', 'closeAll']),
    PopoutOpener: Filters.byProperties(['openPopout']),
    EmojiPicker: Filters.byPrototypeFields(['onHoverEmoji', 'selectEmoji']),

    /* Context Menus */
    ContextMenuActions: Filters.byCode(/CONTEXT_MENU_CLOSE/, c => c.close),
    ContextMenuItemsGroup: Filters.byCode(/itemGroup/),
    ContextMenuItem: Filters.byCode(/\.label\b.*\.hint\b.*\.action\b/),

    /* In-Message Links */
    ExternalLink: Filters.byCode(/\.trusted\b/)
};

class Module {

    /**
     * Finds a module using a filter function.
     * @param {Function} filter A function to use to filter modules
     * @param {Boolean} first Whether to return only the first matching module
     * @param {Array} modules An array of modules to search in
     * @return {Any}
     */
    static getModule(filter, first = true, _modules) {
        const modules = _modules || this.getAllModules();
        const rm = [];
        for (const index in modules) {
            if (!modules.hasOwnProperty(index)) continue;
            const module = modules[index];
            const { exports } = module;
            let foundModule = null;

            if (!exports) continue;
            if (exports.__esModule && exports.default && filter(exports.default)) foundModule = exports.default;
            if (filter(exports)) foundModule = exports;
            if (!foundModule) continue;
            if (first) return foundModule;
            rm.push(foundModule);
        }
        return first ? undefined : rm;
    }

    /**
     * Finds a module by it's name.
     * @param {String} name The name of the module
     * @param {Function} fallback A function to use to filter modules if not finding a known module
     * @return {Any}
     */
    static byName(name, fallback) {
        if (Cache.hasOwnProperty(name)) return Cache[name];
        if (KnownModules.hasOwnProperty(name)) fallback = KnownModules[name];
        if (!fallback) return undefined;
        const module = this.getModule(fallback, true);
        return module ? Cache[name] = module : undefined;
    }

    /**
     * Finds a module by it's display name.
     * @param {String} name The display name of the module
     * @return {Any}
     */
    static byDisplayName(name) {
        return this.getModule(Filters.byDisplayName(name), true);
    }

    /**
     * Finds a module using it's code.
     * @param {RegEx} regex A regular expression to use to filter modules
     * @param {Boolean} first Whether to return the only the first matching module
     * @return {Any}
     */
    static byRegex(regex, first = true) {
        return this.getModule(Filters.byCode(regex), first);
    }

    /**
     * Finds the first module using properties on it's prototype.
     * @param {any} props Properties to use to filter modules
     * @return {Any}
     */
    static byPrototypes(...prototypes) {
        return this.getModule(Filters.byPrototypeFields(prototypes), true);
    }

    /**
     * Finds all modules using properties on it's prototype.
     * @param {any} props Properties to use to filter modules
     * @return {Any}
     */
    static allByPrototypes(...prototypes) {
        return this.getModule(Filters.byPrototypeFields(prototypes), false);
    }

    /**
     * Finds the first module using it's own properties.
     * @param {any} props Properties to use to filter modules
     * @return {Any}
     */
    static byProps(...props) {
        return this.getModule(Filters.byProperties(props), true);
    }

    /**
     * Finds all modules using it's own properties.
     * @param {any} props Properties to use to filter modules
     * @return {Any}
     */
    static allByProps(...props) {
        return this.getModule(Filters.byProperties(props), false);
    }

    /**
     * Discord's __webpack_require__ function.
     */
    static get require() {
        if (this._require) return this._require;

        const __webpack_require__ = this.getWebpackRequire();
        if (!__webpack_require__) return null;

        this.hookWebpackRequireCache(__webpack_require__);
        return this._require = __webpack_require__;
    }

    static getWebpackRequire() {
        const id = 'bd-webpackmodules';

        if (typeof window.webpackJsonp === 'function') {
            const __webpack_require__ = window['webpackJsonp']([], {
                [id]: (module, exports, __webpack_require__) => exports.default = __webpack_require__
            }, [id]).default;
            delete __webpack_require__.m[id];
            delete __webpack_require__.c[id];
            return __webpack_require__;
        } else if (window.webpackJsonp && window.webpackJsonp.push) {
            const __webpack_require__ = window['webpackJsonp'].push([[], {
                [id]: (module, exports, req) => exports.default = req
            }, [[id]]]).default;
            window['webpackJsonp'].pop();
            delete __webpack_require__.m[id];
            delete __webpack_require__.c[id];
            return __webpack_require__;
        }
    }

    static hookWebpackRequireCache(__webpack_require__) {
        __webpack_require__.c = new Proxy(__webpack_require__.c, {
            set(module_cache, module_id, module) {
                // Add it to our emitter cache and emit a module-loading event
                this.moduleLoading(module_id, module);
                Events.emit('module-loading', module);

                // Add the module to the cache as normal
                module_cache[module_id] = module;
            }
        });
    }

    static moduleLoading(module_id, module) {
        if (this.require.c[module_id]) return;

        if (!this.moduleLoadedEventTimeout) {
            this.moduleLoadedEventTimeout = setTimeout(() => {
                this.moduleLoadedEventTimeout = undefined;

                // Emit a module-loaded event for every module
                for (const module of this.modulesLoadingCache) {
                    Events.emit('module-loaded', module);
                }

                // Emit a modules-loaded event
                Events.emit('modules-loaded', this.modulesLoadingCache);

                this.modulesLoadedCache = [];
            }, 0);
        }

        // Add this to our own cache
        if (!this.modulesLoadingCache) this.modulesLoadingCache = [];
        this.modulesLoadingCache.push(module);
    }

    static waitForWebpackRequire() {
        return Utils.until(() => this.require, 10);
    }

    /**
     * Waits for a module to load.
     * This only returns a single module, as it can't guarentee there are no more modules that could
     * match the filter, which is pretty much what that would be asking for.
     * @param {Function} filter The name of a known module or a filter function
     * @return {Any}
     */
    static async waitForModule(filter) {
        const module = this.getModule(filter);
        if (module) return module;

        while (this.require.m.length > this.require.c.length) {
            const additionalModules = await Events.once('modules-loaded');

            const module = this.getModule(filter, true, additionalModules);
            if (module) return module;
        }

        throw new Error('All modules have now been loaded. None match the passed filter.');
    }

    /**
     * Finds a module by it's name.
     * @param {String} name The name of the module
     * @param {Function} fallback A function to use to filter modules if not finding a known module
     * @return {Any}
     */
    static async waitForModuleByName(name, fallback) {
        if (Cache.hasOwnProperty(name)) return Cache[name];
        if (KnownModules.hasOwnProperty(name)) fallback = KnownModules[name];
        if (!fallback) return undefined;
        const module = await this.waitForModule(fallback, true);
        return module ? Cache[name] = module : undefined;
    }

    static waitForModuleByDisplayName(props) {
        return this.waitForModule(Filters.byDisplayName(props));
    }
    static waitForModuleByRegex(props) {
        return this.waitForModule(Filters.byCode(props));
    }
    static waitForModuleByProps(props) {
        return this.waitForModule(Filters.byProperties(props));
    }
    static waitForModuleByPrototypes(props) {
        return this.waitForModule(Filters.byPrototypeFields(props));
    }

    /**
     * Returns all loaded modules.
     * @return {Array}
     */
    static getAllModules() {
        return this.require.c;
    }

    /**
     * Returns an array of known modules.
     * @return {Array}
     */
    static listKnownModules() {
        return Object.keys(KnownModules);
    }

    static get KnownModules() { return KnownModules }

}

const Modules = new Proxy(Module, {
    get(Module, name) {
        return Module.byName(name);
    }
});

export { Module, Modules }
