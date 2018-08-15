/**
 * BetterDiscord Updater View Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <SettingsWrapper headertext="Updates">
        <div class="bd-flex bd-flexCol bd-updaterview">
            <div v-if="error" class="bd-formItem">
                <h5 style="margin-bottom: 10px;">Error installing updates</h5>
                <div class="bd-err bd-preWrap"><div class="bd-pre">{{ error.formatted }}</div></div>
                <div class="bd-formDivider"></div>
            </div>

            <template v-if="updatesAvailable">
                <p>Version {{ newVersion }} is available. You are currently running version {{ currentVersion }}.</p>
                <FormButton :onClick="install" :loading="updating">Install</FormButton>
            </template>
            <template v-else>
                <p>You're all up to date!</p>
            </template>
        </div>
    </SettingsWrapper>
</template>

<script>
    import { Globals, Updater } from 'modules';
    import { ClientLogger as Logger } from 'common';
    import SettingsWrapper from './SettingsWrapper.vue';
    import { FormButton } from '../common';

    export default {
        data() {
            return {
                currentVersion: Globals.version,
                updating: false,
                updater: Updater
            };
        },
        components: {
            SettingsWrapper,
            FormButton
        },
        computed: {
            updatesAvailable() {
                return this.updater.updatesAvailable;
            },
            newVersion() {
                return this.updater.latestVersion;
            },
            error() {
                return this.updater.error;
            }
        },
        methods: {
            async install() {
                this.updating = true;
                try {
                    await this.updater.update();
                } catch (err) {}
                this.updating = false;
            }
        }
    }
</script>
