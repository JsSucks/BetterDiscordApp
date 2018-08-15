/**
 * BetterDiscord Setting Guild Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-formGuildinput">
        <div class="bd-title">
            <h3>{{ setting.text }}</h3>
        </div>
        <div class="bd-hint">{{ setting.hint }}</div>
        <div class="bd-guilds">
            <div class="bd-guild" :class="{'bd-active': isGuildSelected(guild), 'bd-guildHasIcon': guild.icon}" :style="{backgroundImage: `url('${getGuildIconURL(guild)}')`}" @click="() => isGuildSelected(guild) ? unselectGuild(guild) : selectGuild(guild)" v-for="guild in guilds" v-if="guild" v-tooltip="guild.name">
                <div class="bd-guildText" v-if="!guild.icon">{{ getGuildIconText(guild) }}</div>
            </div>
        </div>
    </div>
</template>

<script>
    import { DiscordApi } from 'modules';

    export default {
        props: ['setting'],
        data() {
            return {
                user_guilds: []
            };
        },
        computed: {
            guilds() {
                const guilds = ([]).concat(this.user_guilds);

                for (let guild of this.setting.guilds) {
                    if (!guilds.find(g => g && guild && g.id === guild.id))
                        guilds.push(guild);
                }

                return guilds.sort(function(a, b) {
                    var nameA = a.name.toUpperCase(); // ignore upper and lowercase
                    var nameB = b.name.toUpperCase(); // ignore upper and lowercase
                    if (nameA < nameB) return -1;
                    if (nameA > nameB) return 1;
                    // names must be equal
                    return 0;
                });
            }
        },
        methods: {
            isGuildSelected(guild) {
                return this.setting.guilds.find(g => g && g.id === guild.id);
            },
            getGuildIconURL(guild) {
                return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp`;
            },
            getGuildIconText(guild) {
                const words = guild.name.split(' ');
                if (!words.length) return '';
                const first = words[0].substr(0, 1);
                if (words.length <= 1) return first;
                const last = words[words.length - 1].substr(0, 1);
                return `${first}${last}`;
            },
            async selectGuild(guild) {
                if (this.setting.max && this.setting.guilds.length >= this.setting.max) return;
                await this.setting.addGuild(guild.id);
            },
            async unselectGuild(guild) {
                if (this.setting.min && this.setting.guilds.length <= this.setting.min) return;
                await this.setting.removeGuild(guild.id);
            },
            refreshGuilds() {
                this.user_guilds = DiscordApi.guilds;
            }
        },
        created() {
            this.refreshGuilds();
        }
    }
</script>
