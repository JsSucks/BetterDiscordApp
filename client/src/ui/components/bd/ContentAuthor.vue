/**
 * BetterDiscord Content Author Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <v-popover class="bd-contentAuthor bd-inline" popoverClass="bd-popover bd-contentAuthorLinks" trigger="click" placement="top" :disabled="!hasLinks">
        <span :class="{'bd-contentAuthorLink': hasLinks}">{{ author.name || author }}</span><span v-text="after" @click.stop></span>

        <template slot="popover">
            <div v-if="author.discord_id" @click="openUserProfileModal(author.discord_id)" v-tooltip="author.discord_username || author.name" class="bd-materialButton"><MiDiscord size="16" /></div>
            <div v-if="author.github_username" @click="openGitHub" v-tooltip="author.github_username" class="bd-materialButton"><MiGithubCircle size="16" /></div>
            <div v-if="author.twitter_username" @click="openTwitter" v-tooltip="'@' + author.twitter_username" class="bd-materialButton"><MiTwitterCircle size="16" /></div>
            <div v-if="author.url" @click="openWebsite" v-tooltip="author.url" class="bd-materialButton"><MiWeb size="16" /></div>
        </template>
    </v-popover>
</template>

<script>
    // Imports
    import { WebpackModules } from 'modules';
    import { BdMenu } from 'ui';
    import { shell } from 'electron';
    import { MiGithubCircle, MiWeb, MiTwitterCircle, MiDiscord } from '../common';

    export default {
        props: ['author', 'after'],
        components: {
            MiGithubCircle, MiWeb, MiTwitterCircle, MiDiscord
        },
        computed: {
            hasLinks() {
                return this.author.discord_id || this.author.github_username || this.author.twitter_username || this.author.url;
            }
        },
        methods: {
            openLink(e) {
                shell.openExternal(e.target.href);
                e.preventDefault();
            },
            openUserProfileModal(discord_id) {
                WebpackModules.getModuleByName('UserProfileModal').open(discord_id);
                BdMenu.close();
            },
            openGitHub() {
                shell.openExternal(`https://github.com/${this.author.github_username}`);
            },
            openWebsite() {
                shell.openExternal(this.author.url);
            },
            openTwitter() {
                shell.openExternal(`https://twitter.com/${this.author.twitter_username}`);
            }
        }
    }
</script>
