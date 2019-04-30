/**
 * BetterDiscord Discord API
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import DiscordApi, { Modules } from '.';
import EventEmitter from 'events';
import { Utils } from 'common';
import { List } from 'structs';
import { User, Channel, Guild, Message } from 'discordstructs';
import Events from '../events';

const remoteSettingsKeys = {
    showCurrentGame: 'show_current_game',
    inlineAttachmentMedia: 'inline_attachment_media',
    inlineEmbedMedia: 'inline_embed_media',
    gifAutoPlay: 'gif_auto_play',
    renderEmbeds: 'render_embeds',
    renderReactions: 'render_reactions',
    renderSpoilers: 'render_spoilers',
    showInAppNotifications: 'show_in_app_notifications',
    animateEmoji: 'animate_emoji',
    sync: 'sync',
    theme: 'theme',
    enableTTSCommand: 'enable_tts_command',
    messageDisplayCompact: 'message_display_compact',
    locale: 'locale',
    convertEmoticons: 'convert_emoticons',
    restrictedGuilds: 'restricted_guilds',
    friendSourceFlags: 'friend_source_flags',
    developerMode: 'developer_mode',
    guildPositions: 'guild_positions',
    detectPlatformAccounts: 'detect_platform_accounts',
    status: 'status',
    explicitContentFilter: 'explicit_content_filter',
    disableGamesTab: 'disable_games_tab',
    defaultGuildsRestricted: 'default_guilds_restricted',
    afkTimeout: 'afk_timeout',
    timezoneOffset: 'timezone_offset'
};

export default new class UserSettings extends EventEmitter {

    init() {
        for (const [key, discordKey] of Object.entries({
            'status': 'status',
            'explicitContentFilter': 'explicitContentFilter',
            'defaultGuildsRestricted': 'defaultGuildsRestricted',
            'restrictedGuildIds': 'restrictedGuilds',
            // 'friendSourceFlags',
            'detectPlatformAccounts': 'detectPlatformAccounts',
            'afkTimeout': 'afkTimeout',
            'showCurrentGame': 'showCurrentGame',
            'inlineAttachmentMedia': 'inlineAttachmentMedia',
            'inlineEmbedMedia': 'inlineEmbedMedia',
            'autoplayGifs': 'gifAutoPlay',
            'showEmbeds': 'renderEmbeds',
            'showReactions': 'renderReactions',
            'showSpoilers': 'renderSpoilers',
            'animateEmoji': 'animateEmoji',
            'convertEmoticons': 'convertEmoticons',
            'allowTts': 'enableTTSCommand',
            'theme': 'theme',
            'displayCompact': 'messageDisplayCompact',
            // 'disableGamesTab',
            'developerMode': 'developerMode',
            'locale': 'locale',
            'timezoneOffset': 'timezoneOffset',
        })) {
            this['_' + discordKey] = this.key;
        }

        this._friendSourceFlags = Modules.UserSettingsStore.friendSourceFlags;
        this._disableGamesTab = !this.showActivityTab;

        Events.on('discord-dispatch:USER_SETTINGS_UPDATE', event => {
            for (const k of Object.keys(event.settings)) {
                // No change
                if (Utils.compare(event.settings[k], this['_' + k])) continue;

                if (this['_update_' + k]) this['_update_' + k]();
            }
        });

        this._colourblindMode = this.colourblindMode;

        Events.on('discord-dispatch:ACCESSIBILITY_COLORBLIND_TOGGLE', () => {
            if (Utils.compare(this.colourblindMode, this._colourblindMode)) return;

            this.emit('colourblind-mode', this.colourblindMode, this._colourblindMode);
            this._colourblindMode = this.colourblindMode;
        });
    }

    /**
     * Opens Discord's settings UI.
     */
    open(section = 'ACCOUNT') {
        Modules.UserSettingsWindow.open();
        Modules.UserSettingsWindow.setSection(section);
    }

    /**
     * Updates settings.
     * @param {Object} data
     * @param {boolean} [save=true]
     * @return {Promise}
     */
    async updateSettings(data, save = true) {
        Modules.UserSettingsUpdater.updateLocalSettings(data);

        if (save && DiscordApi.authenticated) {
            await Modules.APIModule.patch({
                url: Modules.DiscordConstants.Endpoints.SETTINGS,
                body: this.toRemoteKeys(data)
            });
        }
    }

    toRemoteKeys(data) {
        const body = {};
        for (const k of Object.keys(data)) {
            body[remoteSettingsKeys[k] || k] = data[k];
        }
        return body;
    }

    /**
     * Updates settings locally.
     * @param {Object} data
     */
    localUpdateSettings(data) {
        this.updateSettings(data, false);
    }

    /**
     * The user's current status. Either "online", "idle", "dnd" or "invisible".
     * @type {string}
     */
    get status() {
        // Reading _status tells Vue to watch it
        return this._status, Modules.UserSettingsStore.status;
    }

    set status(status) {
        if (!['online', 'idle', 'dnd', 'invisible'].includes(status)) throw new Error('Invalid status.');
        this.updateSettings({status});
    }

    _update_status() {
        this.emit('status', this.status, this._status);
        this._status = this.status;
    }

    get StatusOnline() { return 'online' }
    get StatusIdle() { return 'idle' }
    get StatusDND() { return 'dnd' }
    get StatusInvisible() { return 'invisible' }

    /**
     * The user's selected explicit content filter level.
     * 0 == off, 1 == everyone except friends, 2 == everyone
     * Configurable in the privacy and safety panel.
     * @type {number}
     */
    get explicitContentFilter() { return this._explicitContentFilter, Modules.UserSettingsStore.explicitContentFilter }

    set explicitContentFilter(explicitContentFilter) {
        if (![0, 1, 2].includes(explicitContentFilter)) throw new Error('Invalid explicit content filter level.');
        this.updateSettings({explicitContentFilter});
    }

    _update_explicitContentFilter() {
        this.emit('explicit-content-filter', this.explicitContentFilter, this._explicitContentFilter);
        this._explicitContentFilter = this.explicitContentFilter;
    }

    get ExplicitContentFilterDisabled() { return 0 }
    get ExplicitContentFilterExceptFriends() { return 1 }
    get ExplicitContentFilterEnabled() { return 2 }

    /**
     * Whether to disallow direct messages from server members by default.
     * @type {boolean}
     */
    get defaultGuildsRestricted() { return this._defaultGuildsRestricted, Modules.UserSettingsStore.defaultGuildsRestricted }

    set defaultGuildsRestricted(defaultGuildsRestricted) {
        this.updateSettings({defaultGuildsRestricted: !!defaultGuildsRestricted});
    }

    _update_defaultGuildsRestricted() {
        this.emit('default-guilds-restricted', this.defaultGuildsRestricted, this._defaultGuildsRestricted);
        this._defaultGuildsRestricted = this.defaultGuildsRestricted;
    }

    /**
     * An array of guilds to disallow direct messages from their members.
     * This is bypassed if the member is has another mutual guild with this disabled, or the member is friends with the current user.
     * Configurable in each server's privacy settings.
     * @type {Guild[]}
     */
    get restrictedGuilds() {
        return List.from(this.restrictedGuildIds, id => Guild.fromId(id) || id);
    }

    get restrictedGuildIds() { return this._restrictedGuilds, Modules.UserSettingsStore.restrictedGuilds }

    _update_restrictedGuilds() {
        this.emit('restricted-guilds', this.restrictedGuildIds, this._restrictedGuilds);
        this._restrictedGuilds = this.restrictedGuildIds;
    }

    /**
     * An array of flags specifying who should be allowed to add the current user as a friend.
     * If everyone is checked, this will only have one item, "all". Otherwise it has either "mutual_friends", "mutual_guilds", both or neither.
     * Configurable in the privacy and safety panel.
     * @type {string[]}
     */
    get friendSourceFlags() { return this._friendSourceFlags, Object.keys(Modules.UserSettingsStore.friendSourceFlags).filter(f => Modules.UserSettingsStore.friendSourceFlags[f]) }
    get friendSourceEveryone() { return this.friendSourceFlags.includes('all') }
    get friendSourceMutualFriends() { return this.friendSourceFlags.includes('all') || this.friendSourceFlags.includes('mutual_friends') }
    get friendSourceMutualGuilds() { return this.friendSourceFlags.includes('all') || this.friendSourceFlags.includes('mutual_guilds') }
    get friendSourceAnyone() { return this.friendSourceFlags.length > 0 }

    set friendSourceFlags(friendSourceFlags) {
        this.updateSettings({friendSourceFlags: {
            all: friendSourceFlags.includes('all'),
            mutual_friends: friendSourceFlags.includes('all') || friendSourceFlags.includes('mutual_friends'),
            mutual_guilds: friendSourceFlags.includes('all') || friendSourceFlags.includes('mutual_guilds')
        }});
    }

    set friendSourceEveryone(friendSourceEveryone) {
        if (!!friendSourceEveryone === this.friendSourceEveryone) return;
        this.friendSourceFlags = friendSourceEveryone ? ['all'] : ['mutual_friends', 'mutual_guilds'];
    }

    set friendSourceMutualFriends(friendSourceMutualFriends) {
        if (!!friendSourceMutualFriends === this.friendSourceMutualFriends) return;
        this.friendSourceFlags = friendSourceMutualFriends ? this.friendSourceFlags.concat(['mutual_friends']) :
            this.friendSourceFlags.includes('all') ? ['mutual_guilds'] :
                this.friendSourceFlags.filter(f => f !== 'mutual_friends');
    }

    set friendSourceMutualGuilds(friendSourceMutualGuilds) {
        if (!!friendSourceMutualGuilds === this.friendSourceMutualGuilds) return;
        this.friendSourceFlags = friendSourceMutualGuilds ? this.friendSourceFlags.concat(['mutual_guilds']) :
            this.friendSourceFlags.includes('all') ? ['mutual_friends'] :
                this.friendSourceFlags.filter(f => f !== 'mutual_guilds');
    }

    set friendSourceAnyone(friendSourceAnyone) {
        if (!!friendSourceAnyone === this.friendSourceAnyone) return;
        this.friendSourceFlags = friendSourceAnyone ? ['mutual_friends', 'mutual_guilds'] : [];
    }

    _update_friendSourceFlags() {
        this.emit('friend-source-flags', this.friendSourceFlags, Object.keys(this._friendSourceFlags).filter(f => this._friendSourceFlags[f]));
        this._friendSourceFlags = this.friendSourceFlags;
    }

    /**
     * Whether to automatically add accounts from other platforms running on the user's computer.
     * Configurable in the connections panel.
     * @type {boolean}
     */
    get detectPlatformAccounts() { return this._detectPlatformAccounts, Modules.UserSettingsStore.detectPlatformAccounts }

    set detectPlatformAccounts(detectPlatformAccounts) {
        this.updateSettings({detectPlatformAccounts: !!detectPlatformAccounts});
    }

    _update_detectPlatformAccounts() {
        this.emit('detect-platform-accounts', this.detectPlatformAccounts, this._detectPlatformAccounts);
        this._detectPlatformAccounts = this.detectPlatformAccounts;
    }

    /**
     * The number of seconds Discord will wait for activity before sending mobile push notifications.
     * Configurable in the notifications panel.
     * @type {number}
     */
    get afkTimeout() { return this._afkTimeout, Modules.UserSettingsStore.afkTimeout }

    set afkTimeout(afkTimeout) {
        this.updateSettings({afkTimeout: parseInt(afkTimeout)});
    }

    _update_afkTimeout() {
        this.emit('afk-timeout', this.afkTimeout, this._afkTimeout);
        this._afkTimeout = this.afkTimeout;
    }

    get AfkTimeout1Minute() { return 60 }
    get AfkTimeout2Minutes() { return 120 }
    get AfkTimeout3Minutes() { return 180 }
    get AfkTimeout4Minutes() { return 240 }
    get AfkTimeout5Minutes() { return 300 }
    get AfkTimeout6Minutes() { return 360 }
    get AfkTimeout7Minutes() { return 420 }
    get AfkTimeout8Minutes() { return 480 }
    get AfkTimeout9Minutes() { return 540 }
    get AfkTimeout10Minutes() { return 600 }

    /**
     * Whether to display the currently running game as a status message.
     * Configurable in the games panel.
     * @type {boolean}
     */
    get showCurrentGame() { return this._showCurrentGame, Modules.UserSettingsStore.showCurrentGame }

    set showCurrentGame(showCurrentGame) {
        this.updateSettings({showCurrentGame: !!showCurrentGame});
    }
    set localShowCurrentGame(showCurrentGame) {
        this.updateSettings({showCurrentGame: !!showCurrentGame}, false);
    }

    _update_showCurrentGame() {
        this.emit('restricted-guilds', this.showCurrentGame, this._showCurrentGame);
        this._showCurrentGame = this.showCurrentGame;
    }

    /**
     * Whether to show images uploaded directly to Discord.
     * Configurable in the text and images panel.
     * @type {boolean}
     */
    get inlineAttachmentMedia() { return this._inlineAttachmentMedia, Modules.UserSettingsStore.inlineAttachmentMedia }

    set inlineAttachmentMedia(inlineAttachmentMedia) {
        this.updateSettings({inlineAttachmentMedia: !!inlineAttachmentMedia});
    }
    set localInlineAttachmentMedia(inlineAttachmentMedia) {
        this.updateSettings({inlineAttachmentMedia: !!inlineAttachmentMedia}, false);
    }

    _update_inlineAttachmentMedia() {
        this.emit('inline-attachment-media', this.inlineAttachmentMedia, this._inlineAttachmentMedia);
        this._inlineAttachmentMedia = this.inlineAttachmentMedia;
    }

    /**
     * Whether to show images linked in Discord.
     * Configurable in the text and images panel.
     * @type {boolean}
     */
    get inlineEmbedMedia() { return this._inlineEmbedMedia, Modules.UserSettingsStore.inlineEmbedMedia }

    set inlineEmbedMedia(inlineEmbedMedia) {
        this.updateSettings({inlineEmbedMedia: !!inlineEmbedMedia});
    }
    set localInlineEmbedMedia(inlineEmbedMedia) {
        this.updateSettings({inlineEmbedMedia: !!inlineEmbedMedia}, false);
    }

    _update_inlineEmbedMedia() {
        this.emit('inline-embed-media', this.inlineEmbedMedia, this._inlineEmbedMedia);
        this._inlineEmbedMedia = this.inlineEmbedMedia;
    }

    /**
     * Whether to automatically play GIFs when the Discord window is active without having to hover the mouse over the image.
     * Configurable in the text and images panel.
     * @type {boolean}
     */
    get autoplayGifs() { return this._gifAutoPlay, Modules.UserSettingsStore.gifAutoPlay }

    set autoplayGifs(gifAutoPlay) {
        this.updateSettings({gifAutoPlay: !!gifAutoPlay});
    }
    set localAutoplayGifs(gifAutoPlay) {
        this.updateSettings({gifAutoPlay: !!gifAutoPlay}, false);
    }

    _update_gifAutoPlay() {
        this.emit('autoplay-gifs', this.autoplayGifs, this._gifAutoPlay);
        this._gifAutoPlay = this.autoplayGifs;
    }

    /**
     * Whether to show content from HTTP[s] links as embeds.
     * Configurable in the text and images panel.
     * @type {boolean}
     */
    get showEmbeds() { return this._renderEmbeds, Modules.UserSettingsStore.renderEmbeds }

    set showEmbeds(renderEmbeds) {
        this.updateSettings({renderEmbeds: !!renderEmbeds});
    }
    set localShowEmbeds(renderEmbeds) {
        this.updateSettings({renderEmbeds: !!renderEmbeds}, false);
    }

    _update_renderEmbeds() {
        this.emit('show-embeds', this.showEmbeds, this._renderEmbeds);
        this._renderEmbeds = this.showEmbeds;
    }

    /**
     * Whether to show a message's reactions.
     * Configurable in the text and images panel.
     * @type {boolean}
     */
    get showReactions() { return this._renderReactions, Modules.UserSettingsStore.renderReactions }

    set showReactions(renderReactions) {
        this.updateSettings({renderReactions: !!renderReactions});
    }
    set localShowReactions(renderReactions) {
        this.updateSettings({renderReactions: !!renderReactions}, false);
    }

    _update_showReactions() {
        this.emit('show-reactions', this.showReactions, this._showReactions);
        this._showReactions = this.showReactions;
    }

    /**
     * When to show spoilers.
     * Configurable in the text and images panel.
     * @type {boolean}
     */
    get showSpoilers() { return this._renderSpoilers, Modules.UserSettingsStore.renderSpoilers }

    set showSpoilers(renderSpoilers) {
        if (!['ON_CLICK', 'IF_MODERATOR', 'ALWAYS'].includes(renderSpoilers)) throw new Error('Invalid show spoilers value.');
        this.updateSettings({renderSpoilers: !!renderSpoilers}, false);
    }

    _update_renderSpoilers() {
        this.emit('show-spoilers', this.showSpoilers, this._renderSpoilers);
        this._renderSpoilers = this.showSpoilers;
    }

    get ShowSpoilersOnClick() { return 'ON_CLICK' }
    get ShowSpoilersIfModerator() { return 'IF_MODERATOR' }
    get ShowSpoilersAlways() { return 'ALWAYS' }

    /**
     * Whether to play animated emoji.
     * Configurable in the text and images panel.
     * @type {boolean}
     */
    get animateEmoji() { return this._animateEmoji, Modules.UserSettingsStore.animateEmoji }

    set animateEmoji(animateEmoji) {
        this.updateSettings({animateEmoji: !!animateEmoji});
    }
    set localAnimateEmoji(animateEmoji) {
        this.updateSettings({animateEmoji: !!animateEmoji}, false);
    }

    _update_animateEmoji() {
        this.emit('animate-emoji', this.animateEmoji, this._animateEmoji);
        this._animateEmoji = this.animateEmoji;
    }

    /**
     * Whether to convert ASCII emoticons to emoji.
     * Configurable in the text and images panel.
     * @type {boolean}
     */
    get convertEmoticons() { return this._convertEmoticons, Modules.UserSettingsStore.convertEmoticons }

    set convertEmoticons(convertEmoticons) {
        this.updateSettings({convertEmoticons: !!convertEmoticons});
    }
    set localConvertEmoticons(convertEmoticons) {
        this.updateSettings({convertEmoticons: !!convertEmoticons}, false);
    }

    _update_convertEmoticons() {
        this.emit('convert-emoticons', this.convertEmoticons, this._convertEmoticons);
        this._convertEmoticons = this.convertEmoticons;
    }

    /**
     * Whether to allow playing text-to-speech messages.
     * Configurable in the text and images panel.
     * @type {boolean}
     */
    get allowTts() { return this._enableTTSCommand, Modules.UserSettingsStore.enableTTSCommand }

    set allowTts(enableTTSCommand) {
        this.updateSettings({enableTTSCommand: !!enableTTSCommand});
    }
    set localAllowTts(enableTTSCommand) {
        this.updateSettings({enableTTSCommand: !!enableTTSCommand}, false);
    }

    _update_enableTTSCommand() {
        this.emit('allow-tts', this.allowTts, this._enableTTSCommand);
        this._enableTTSCommand = this.allowTts;
    }

    /**
     * The user's selected theme. Either "dark" or "light".
     * Configurable in the appearance panel.
     * @type {string}
     */
    get theme() { return this._theme, Modules.UserSettingsStore.theme }

    set theme(theme) {
        if (!['dark', 'light'].includes(theme)) throw new Error('Invalid theme.');
        this.updateSettings({theme});
    }
    set localTheme(theme) {
        if (!['dark', 'light'].includes(theme)) throw new Error('Invalid theme.');
        this.updateSettings({theme}, false);
    }

    _update_theme() {
        this.emit('theme', this.theme, this._theme);
        this._theme = this.theme;
    }

    get ThemeDark() { return 'dark' }
    get ThemeLight() { return 'light' }

    /**
     * Whether the user has enabled compact mode.
     * `true` if compact mode is enabled, `false` if cozy mode is enabled.
     * Configurable in the appearance panel.
     * @type {boolean}
     */
    get displayCompact() { return this._messageDisplayCompact, Modules.UserSettingsStore.messageDisplayCompact }

    set displayCompact(messageDisplayCompact) {
        this.updateSettings({messageDisplayCompact: !!messageDisplayCompact});
    }
    set localDisplayCompact(messageDisplayCompact) {
        this.updateSettings({messageDisplayCompact: !!messageDisplayCompact}, false);
    }

    _update_messageDisplayCompact() {
        this.emit('inline-embed-media', this.displayCompact, this._messageDisplayCompact);
        this._messageDisplayCompact = this.displayCompact;
    }

    /**
     * Whether the user has enabled colourblind mode.
     * Configurable in the appearance panel.
     * @type {boolean}
     */
    get colourblindMode() { return this._colourblindMode, Modules.AccessibilityStore.colorblindMode }

    set colourblindMode(colourblindMode) {
        if (!!colourblindMode === this.colourblindMode) return;
        Modules.AccessibilitySettingsUpdater.toggleColorblindMode();
    }

    /**
     * Whether the user has enabled the activity tab.
     * Configurable in the appearance panel.
     * @type {boolean}
     */
    get showActivityTab() { return this._disableGamesTab, !Modules.UserSettingsStore.disableGamesTab }

    set showActivityTab(disableGamesTab) {
        this.updateSettings({disableGamesTab: !disableGamesTab});
    }
    set localShowActivityTab(disableGamesTab) {
        this.updateSettings({disableGamesTab: !disableGamesTab}, false);
    }

    _update_disableGamesTab() {
        this.emit('show-activity-tab', this.showActivityTab, !this._disableGamesTab);
        this._disableGamesTab = !this.showActivityTab;
    }

    /**
     * Whether the user has enabled developer mode.
     * Currently only adds a "Copy ID" option to the context menu on users, guilds and channels.
     * Configurable in the appearance panel.
     * @type {boolean}
     */
    get developerMode() { return this._developerMode, Modules.UserSettingsStore.developerMode }

    set developerMode(developerMode) {
        this.updateSettings({developerMode: !!developerMode});
    }
    set localDeveloperMode(developerMode) {
        this.updateSettings({developerMode: !!developerMode}, false);
    }

    _update_developerMode() {
        this.emit('developer-mode', this.developerMode, this._developerMode);
        this._developerMode = this.developerMode;
    }

    /**
     * The user's selected language code.
     * Configurable in the language panel.
     * @type {string}
     */
    get locale() { return this._locale, Modules.UserSettingsStore.locale }

    set locale(locale) {
        this.updateSettings({locale: !!locale});
    }
    set localLocale(locale) {
        this.updateSettings({locale: !!locale}, false);
    }

    _update_locale() {
        this.emit('locale', this.locale, this._locale);
        this._locale = this.locale;
    }

    /**
     * The user's timezone offset in hours.
     * This is not configurable.
     * @type {number}
     */
    get timezoneOffset() { return this._timezoneOffset, Modules.UserSettingsStore.timezoneOffset }

    _update_timezoneOffset() {
        this.emit('timezone-offset', this.timezoneOffset, this._timezoneOffset);
        this._timezoneOffset = this.timezoneOffset;
    }

}
