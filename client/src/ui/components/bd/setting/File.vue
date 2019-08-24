/**
 * BetterDiscord Setting File Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-formFileinput">
        <div class="bd-title">
            <h3>{{ setting.text }}</h3>
            <button class="bd-button bd-buttonPrimary" :class="{'bd-disabled': setting.disabled}" @click="openDialog">Select</button>
        </div>
        <div class="bd-hint">{{ setting.hint }}</div>
        <div class="bd-selectedFiles">
            <div class="bd-selectedFile" v-for="file_path in setting.value">
                <!-- Maybe add a preview here later? -->
                <!-- For now just show the selected file path -->
                <span class="bd-filePath">{{ file_path }}</span>
                <span class="bd-fileOpen" @click="openItem(file_path)"><MiOpenInNew /></span>
                <span class="bd-fileRemove" :class="{'bd-disabled': setting.disabled}" @click="removeItem(file_path)"><MiMinus /></span>
            </div>
        </div>
    </div>
</template>

<script>
    import { shell } from 'electron';
    import { Utils, ClientIPC } from 'common';
    import { MiOpenInNew, MiMinus } from '../../common';
    import path from 'path';

    export default {
        props: ['setting'],
        components: {
            MiOpenInNew, MiMinus
        },
        methods: {
            async openDialog(e) {
                if (this.setting.disabled) return;

                const filenames = await ClientIPC.send('bd-native-open', this.setting.dialogOptions);
                if (filenames)
                    this.setting.value = filenames;
            },
            openItem(file_path) {
                shell.openItem(path.resolve(this.setting.path, file_path));
            },
            removeItem(file_path) {
                if (this.setting.disabled) return;
                this.setting.value = this.setting.value.filter(f => f !== file_path);
            }
        }
    }
</script>
