/**
 * BetterDiscord E2EE Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-e2eeTaContainer">
        <v-popover popoverClass="bd-popover bd-e2eePopover" placement="top">
            <div v-if="error" class="bd-e2eeTaBtn bd-e2eeLock bd-error">
                <MiLock v-tooltip="error" />
            </div>
            <div v-else-if="state === 'loading'" class="bd-e2eeTaBtn bd-e2eeLock bd-loading bd-warn">
                <MiLock v-tooltip="'Loading'" />
            </div>

            <div v-else-if="!E2EE.encryptNewMessages" class="bd-e2eeTaBtn bd-e2eeLock bd-warn">
                <MiLock v-tooltip="'New messages will not be encrypted.'" />
            </div>

            <div v-else class="bd-e2eeTaBtn bd-e2eeLock bd-ok">
                <MiLock v-tooltip="'Ready!'" />
            </div>
            <template slot="popover">
                <div @click="toggleEncrypt" :class="{'bd-warn': !E2EE.encryptNewMessages, 'bd-ok': E2EE.encryptNewMessages}"><MiLock size="16" v-tooltip="'Toggle Encryption'" /></div>
                <div v-close-popover @click="showUploadDialog" v-if="!error"><MiImagePlus size="16" v-tooltip="'Upload Encrypted Image'" /></div>
            </template>
        </v-popover>
        <div class="bd-taDivider"></div>
    </div>
</template>



<script>
    import fs from 'fs';
    import { Utils } from 'common';
    import { remote } from 'electron';
    import { E2EE } from 'builtin';
    import { DiscordApi, Security } from 'modules';
    import { MiLock, MiPlus, MiImagePlus } from '../ui/components/common/MaterialIcon';
    import { Toasts } from 'ui';

    export default {
        components: { MiLock, MiPlus, MiImagePlus },
        data() {
            return {
                E2EE,
                state: 'loading',
                error: null
            };
        },
        methods: {
            async showUploadDialog() {
                const dialogResult = remote.dialog.showOpenDialog({ properties: ['openFile'] });
                if (!dialogResult) return;

                const readFile = fs.readFileSync(dialogResult[0]);
                const FileActions = _bd.WebpackModules.getModuleByProps(["makeFile"]);
                const Uploader = _bd.WebpackModules.getModuleByProps(["instantBatchUpload"]);

                const img = await Utils.getImageFromBuffer(readFile);

                const canvas = document.createElement('canvas');
                canvas.height = img.height;
                canvas.width = img.width;
                const arrBuffer = await Utils.canvasToArrayBuffer(canvas);
                const encrypted = E2EE.encrypt(img.src.replace('data:;base64,', ''));
                const hmac = await E2EE.createHmac(encrypted);
                const encodedBytes = new TextEncoder().encode(encrypted + hmac);
                Uploader.upload(DiscordApi.currentChannel.id, FileActions.makeFile(new Uint8Array([...new Uint8Array(arrBuffer), ...encodedBytes]), 'bde2ee.png'));
            },
            toggleEncrypt() {
                const newState = !E2EE.encryptNewMessages;
                E2EE.encryptNewMessages = newState;
                if (!newState) {
                    Toasts.warning('New messages will not be encrypted');
                    return;
                }
                Toasts.success('New messages will be encrypted');
            }
        },
        mounted() {
            if (!E2EE.master) {
                this.error = 'No master key set!';
                return;
            }
            const haveKey = E2EE.getKey(DiscordApi.currentChannel.id);
            if (!haveKey) {
                this.error = 'No key for channel!';
                return;
            }
            this.state = 'OK';
            this.error = null;
        }
    }
</script>
