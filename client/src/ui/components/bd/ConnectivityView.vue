/**
 * BetterDiscord Connectivity View Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <SettingsWrapper headertext="Connectivity">
        <div class="bd-flex bd-flexCol bd-connectivityview">
            <div class="bd-settingswrapItem">
                <div v-if="connecting" class="bd-button bd-settingswrapButtonBig bd-disabled">Connecting</div>
                <div v-else-if="!connected" class="bd-button bd-settingswrapButtonBig" @click="showConnectWindow">Connect</div>
                <div v-else class="bd-settingswrapInfobox">
                    <div class="bd-settingswrapInfoboxChild" :style="{flex: '0 1 auto', backgroundImage: `url(${connectedUser.avatarUrl})`, width: '100px', height: '100px', borderRadius: '50%'}"></div>
                    <div class="bd-settingswrapInfoboxChild" :style="{flex: '1 1 auto', marginLeft: '10px'}">
                        <div class="bd-wrapper">
                            <h5>Username</h5>
                            <div>
                                {{connectedUser.username}}<span>#{{connectedUser.discriminator}}</span>
                            </div>
                        </div>
                        <div class="bd-wrapper" :style="{display: 'flex'}">
                            <h5>Themes: </h5><span>12</span>
                            <h5>Plugins: </h5><span>0</span>
                        </div>
                    </div>
                    <div class="bd-button" :style="{height: '30px', borderRadius: '4px', padding: '0 5px'}" @click="disconnect">Disconnect</div>
                </div>
            </div>
            <div class="bd-settingswrapItem">
                <h2 class="bd-settingswrapSubheader">BetterDiscord Connectivity</h2>
                <div class="bd-settingswrapItemDesc">
                    Explanation for what connectivity is here.
                    Explanation for what connectivity is here.
                    Explanation for what connectivity is here.
                    Explanation for what connectivity is here.
                    Explanation for what connectivity is here.
                    Explanation for what connectivity is here.
                </div>
            </div>
        </div>
    </SettingsWrapper>
</template>

<script>
    import SettingsWrapper from './SettingsWrapper.vue';
    import electron from 'electron';
    export default {
        data() {
            return {
                connectWindow: null,
                connecting: false,
                connected: false,
                connectedUser: null
            };
        },
        components: {
            SettingsWrapper
        },
        methods: {
            showConnectWindow() {
                if (this.connecting) return;
                this.connecting = true;
                const x = (window.screenX + window.outerWidth / 2) - 520 / 2;
                const y = (window.screenY + window.outerHeight / 2) - 750 / 2;
                this.connectWindow = new electron.remote.BrowserWindow({
                    width: 520,
                    height: 750,
                    x: x < 0 ? 0 : x,
                    y: y < 0 ? 0 : y,
                    backgroundColor: '#202225',
                    show: true,
                    resizable: false,
                    maximizable: false,
                    minimizable: false,
                    alwaysOnTop: true,
                    center: false,
                    webPreferences: { nodeIntegration: false }
                });
                this.connectWindow.setMenu(null);

                this.connectWindow.on('page-title-updated', (e, title) => {
                    if (title !== 'BetterDiscord Auth Ready') return;
                    this.connectWindow.webContents.executeJavaScript(`window.auth`, result => {
                        const { username, discriminator, avatarUrl, token } = result;
                        if (!username || !discriminator || !avatarUrl || !token) {
                            this.connected = false;
                            this.connectWindow.close();
                            return;
                        }
                        this.connected = true;
                        this.connectedUser = { username, discriminator, avatarUrl, token };
                        this.connectWindow.close();
                    });
                });
                this.connectWindow.on('close', (e) => {
                    this.connectWindow = null;
                    this.connecting = false;
                });
                this.connectWindow.loadURL(`ifyouareinwebtestthenyouknowwhatthisshouldbe/bd/v2/discord/connect?sub=${window.location.host.split('.')[0]}`);
            },
            disconnect() {
                this.connectedUser = null;
                this.connected = false;
            }
        }
    }
</script>
