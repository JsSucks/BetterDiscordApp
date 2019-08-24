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
            <div class="bd-settingsCategories">
                <div class="bd-settingsCategory" v-if="bdUpdates && bdUpdates.length">
                    <div class="bd-formItem">
                        <h5>BetterDiscord</h5>
                    </div>
                    <div class="bd-formDivider"></div>
                    <div v-for="update in bdUpdates">
                        <UpdaterStatus :item="update" v-if="update.status.updating" />
                        <UpdaterToggle :item="update" @toggle="updater.toggleUpdate(update)" v-else />
                        <div class="bd-formDivider"></div>
                    </div>
                </div>
            </div>
            <div class="bd-formButton bd-button" @click="update">
                Update
            </div>
        </div>
    </SettingsWrapper>
</template>

<script>
    import { Globals, Updater } from 'modules';
    import { ClientLogger as Logger } from 'common';
    import SettingsWrapper from './SettingsWrapper.vue';
    import UpdaterToggle from './UpdaterToggle.vue';
    import UpdaterStatus from './UpdaterStatus.vue';

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
            UpdaterToggle,
            UpdaterStatus
        },
        computed: {
            updatesAvailable() {
                return this.updater.updatesAvailable;
            },
            newVersion() {
                return '2.0.0-beta.4';
            },
            error() {
                return this.updater.error;
            },
            updates() {
                return this.updater.updates;
            },
            bdUpdates() {
                return this.updater.bdUpdates;
            }
        },
        methods: {
            update() {
                this.updater.startUpdate();
            }
        }
    }
</script>
