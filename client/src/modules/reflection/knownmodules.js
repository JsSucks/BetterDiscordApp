/**
 * BetterDiscord Reflection Modules
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Filters } from 'common';

export default {

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
    AccessibilityStore: Filters.byProperties(['colorblindMode']),
    AccountManager: Filters.byProperties(['register', 'login']),
    UserSettingsUpdater: Filters.byProperties(['updateRemoteSettings']),
    AccessibilitySettingsUpdater: Filters.byProperties(['toggleColorblindMode']),
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
    UserSettingsWindow: Filters.byProperties(['open', 'updateAccount']),
    ChannelSettingsWindow: Filters.byProperties(['open', 'updateChannel']),
    GuildSettingsWindow: Filters.byProperties(['open', 'updateGuild']),
    KeyboardCombosModal: Filters.byProperties(['show', 'activateRagingDemon']),

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

}
