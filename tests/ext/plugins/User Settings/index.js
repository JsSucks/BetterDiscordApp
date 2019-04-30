exports.default = (Plugin, {Logger, DiscordApi, BdMenuItems, CommonComponents, Api}) => class UserSettingsTest extends Plugin {
    onstart() {
        DiscordApi.UserSettings.theme = DiscordApi.UserSettings.ThemeDark; // === 'dark'

        this.menu_item = BdMenuItems.addVueComponent('Test', 'User Settings', {
            template: `<settings-wrapper headertext="User Settings API">
                <h4 style="color: #f6f6f7;">Status</h4>
                <radio-group v-model="UserSettings.status" :options="statusOptions" />

                <h4 style="color: #f6f6f7;">Explicit content filter</h4>
                <radio-group v-model="UserSettings.explicitContentFilter" :options="explicitContentFilterOptions" />

                <h4 style="color: #f6f6f7;">Default guilds restricted</h4>
                <setting-switch v-model="UserSettings.defaultGuildsRestricted" />

                <h4 style="color: #f6f6f7;">Friend source flags</h4>
                <p style="color: #f6f6f7;">{{ JSON.stringify(UserSettings.friendSourceFlags)}}</p>

                <h4 style="color: #f6f6f7;">Friend source everyone</h4>
                <setting-switch v-model="UserSettings.friendSourceEveryone" />
                <h4 style="color: #f6f6f7;">Friend source mutual friends</h4>
                <setting-switch v-model="UserSettings.friendSourceMutualFriends" />
                <h4 style="color: #f6f6f7;">Friend source mutual guilds</h4>
                <setting-switch v-model="UserSettings.friendSourceMutualGuilds" />
                <h4 style="color: #f6f6f7;">Friend source anyone</h4>
                <setting-switch v-model="UserSettings.friendSourceAnyone" />

                <h4 style="color: #f6f6f7;">Detect platform accounts</h4>
                <setting-switch v-model="UserSettings.detectPlatformAccounts" />

                <h4 style="color: #f6f6f7;">AFK timeout</h4>
                <radio-group v-model="UserSettings.afkTimeout" :options="afkTimeoutOptions" />

                <h4 style="color: #f6f6f7;">Show current game</h4>
                <setting-switch v-model="UserSettings.showCurrentGame" />

                <h4 style="color: #f6f6f7;">Inline attachment media</h4>
                <setting-switch v-model="UserSettings.inlineAttachmentMedia" />

                <h4 style="color: #f6f6f7;">Inline embed media</h4>
                <setting-switch v-model="UserSettings.inlineEmbedMedia" />

                <h4 style="color: #f6f6f7;">Autoplay GIFs</h4>
                <setting-switch v-model="UserSettings.autoplayGifs" />

                <h4 style="color: #f6f6f7;">Show embeds</h4>
                <setting-switch v-model="UserSettings.showEmbeds" />

                <h4 style="color: #f6f6f7;">Show reactions</h4>
                <setting-switch v-model="UserSettings.showReactions" />

                <h4 style="color: #f6f6f7;">Show spoilers</h4>
                <radio-group v-model="UserSettings.showSpoilers" :options="showSpoilersOptions" />

                <h4 style="color: #f6f6f7;">Animate emoji</h4>
                <setting-switch v-model="UserSettings.animateEmoji" />

                <h4 style="color: #f6f6f7;">Convert emoticons</h4>
                <setting-switch v-model="UserSettings.convertEmoticons" />

                <h4 style="color: #f6f6f7;">Allow TTS messages</h4>
                <setting-switch v-model="UserSettings.allowTts" />

                <h4 style="color: #f6f6f7;">Theme</h4>
                <radio-group v-model="UserSettings.theme" :options="themeOptions" />

                <h4 style="color: #f6f6f7;">Compact mode</h4>
                <setting-switch v-model="UserSettings.displayCompact" />

                <h4 style="color: #f6f6f7;">Colourblind mode</h4>
                <setting-switch v-model="UserSettings.colourblindMode" />

                <h4 style="color: #f6f6f7;">Show activity tab</h4>
                <setting-switch v-model="UserSettings.showActivityTab" />

                <h4 style="color: #f6f6f7;">Developer mode</h4>
                <setting-switch v-model="UserSettings.developerMode" />

                <h4 style="color: #f6f6f7;">Locale</h4>
                <p style="color: #f6f6f7;">{{ JSON.stringify(UserSettings.locale)}}</p>

                <h4 style="color: #f6f6f7;">Timezone offset</h4>
                <p style="color: #f6f6f7;">{{ JSON.stringify(UserSettings.timezoneOffset)}}</p>
            </settings-wrapper>`,
            components: {
                SettingsWrapper: CommonComponents.SettingsWrapper,
                SettingSwitch: CommonComponents.SettingSwitch,
                RadioGroup: CommonComponents.RadioGroup
            },
            data() { return {
                Api, plugin: Api.plugin, UserSettings: DiscordApi.UserSettings,

                statusOptions: [
                    {value: DiscordApi.UserSettings.StatusOnline, text: 'Online'},
                    {value: DiscordApi.UserSettings.StatusIdle, text: 'Idle'},
                    {value: DiscordApi.UserSettings.StatusDND, text: 'Do not disturb'},
                    {value: DiscordApi.UserSettings.StatusInvisible, text: 'Invisible'}
                ],

                explicitContentFilterOptions: [
                    {value: DiscordApi.UserSettings.ExplicitContentFilterDisabled, text: 'Disabled'},
                    {value: DiscordApi.UserSettings.ExplicitContentFilterExceptFriends, text: 'Except friends'},
                    {value: DiscordApi.UserSettings.ExplicitContentFilterEnabled, text: 'Enabled'}
                ],

                afkTimeoutOptions: [
                    {value: DiscordApi.UserSettings.AfkTimeout1Minute, text: '1 minute'},
                    {value: DiscordApi.UserSettings.AfkTimeout2Minutes, text: '2 minutes'},
                    {value: DiscordApi.UserSettings.AfkTimeout3Minutes, text: '3 minutes'},
                    {value: DiscordApi.UserSettings.AfkTimeout4Minutes, text: '4 minutes'},
                    {value: DiscordApi.UserSettings.AfkTimeout5Minutes, text: '5 minutes'},
                    {value: DiscordApi.UserSettings.AfkTimeout6Minutes, text: '6 minutes'},
                    {value: DiscordApi.UserSettings.AfkTimeout7Minutes, text: '7 minutes'},
                    {value: DiscordApi.UserSettings.AfkTimeout8Minutes, text: '8 minutes'},
                    {value: DiscordApi.UserSettings.AfkTimeout9Minutes, text: '9 minutes'},
                    {value: DiscordApi.UserSettings.AfkTimeout10Minutes, text: '10 minutes'}
                ],

                showSpoilersOptions: [
                    {value: DiscordApi.UserSettings.ShowSpoilersOnClick, text: 'On click'},
                    {value: DiscordApi.UserSettings.ShowSpoilersIfModerator, text: 'If moderator'},
                    {value: DiscordApi.UserSettings.ShowSpoilersAlways, text: 'Always'}
                ],

                themeOptions: [
                    {value: DiscordApi.UserSettings.ThemeDark, text: 'Dark'},
                    {value: DiscordApi.UserSettings.ThemeLight, text: 'Light'}
                ]
            }; }
        });
    }

    onstop() {
        BdMenuItems.removeAll();
    }
}
