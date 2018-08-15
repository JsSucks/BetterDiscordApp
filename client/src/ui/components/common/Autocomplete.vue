/**
 * BetterDiscord Emote Autocomplete Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-autocomplete" :class="{'bd-active': emotes && emotes.length}">
        <div v-if="emotes && emotes.length" class="bd-autocompleteInner">
            <div class="bd-autocompleteRow">
                <div class="bd-autocompleteSelector">
                    <div class="bd-autocompleteTitle">
                        Emotes Matching:
                        <strong>{{title}}</strong>
                    </div>
                </div>
            </div>
            <div v-for="(emote, index) in emotes" class="bd-autocompleteRow" :key="index">
                <div class="bd-autocompleteSelector bd-selectable" :class="{'bd-selected': index === selectedIndex, 'bd-emoteFavourite': isFavourite(emote)}" @mouseover="selected = emote.id" @click="inject(emote)">
                    <div class="bd-autocompleteField">
                        <img :src="emote.src" :alt="emote.name" />
                        <div class="bd-flexGrow">{{emote.id}}</div>
                        <div class="bd-emoteFavouriteButton" :class="{'bd-active': isFavourite(emote)}" @click.stop="toggleFavourite(emote)">
                            <MiStar :size="16" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { EmoteModule } from 'builtin';
    import { Events, Settings } from 'modules';
    import { DOMManip as Manip } from 'ui';
    import { MiStar } from './MaterialIcon';

    export default {
        components: {
            MiStar
        },
        data() {
            return {
                EmoteModule,
                emotes: [],
                title: '',
                selIndex: 0,
                selected: '',
                open: false,
                selectedIndex: 0,
                sterm: '',
                settingUpdatedHandler: null
            };
        },
        created() {
            const enabledSetting = Settings.getSetting('emotes', 'default', 'enable');
            enabledSetting.on('setting-updated', this.settingUpdatedHandler = event => {
                if (event.value) return this.addEventListeners();
                this.removeEventListeners();
                this.reset();
            });

            if (enabledSetting.value) this.addEventListeners();
        },
        destroyed() {
            if (this.settingUpdatedHandler) {
                const enabledSetting = Settings.getSetting('emotes', 'default', 'enable');
                enabledSetting.removeListener('setting-updated', this.settingUpdatedHandler);
            }

            this.removeEventListeners();
        },
        methods: {
            addEventListeners() {
                window.addEventListener('keydown', this.prevents);
                const ta = document.querySelector('.chat textarea');
                if (!ta) return;
                ta.addEventListener('keydown', this.setCaret);
                ta.addEventListener('keyup', this.searchEmotes);
            },
            removeEventListeners() {
                window.removeEventListener('keydown', this.prevents);
                const ta = document.querySelector('.chat textarea');
                if (!ta) return;
                ta.removeEventListener('keydown', this.setCaret);
                ta.removeEventListener('keyup', this.searchEmotes);
            },
            prevents(e) {
                if (!this.open) return;
                if (e.which === 27) this.reset();
                else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') this.traverse(e);
                else if (e.key !== 'Tab' && e.key !== 'Enter') return;
                e.stopPropagation();
                e.preventDefault();
            },
            setCaret(e) {
                this.caret = e.target.selectionEnd;
            },
            getEmoteSrc(emote) {
                let { id, value } = emote;
                if (value.id) value = value.id;
                const uri = emote.type === 2 ? 'https://cdn.betterttv.net/emote/:id/1x' : emote.type === 1 ? 'https://cdn.frankerfacez.com/emoticon/:id/1' : 'https://static-cdn.jtvnw.net/emoticons/v1/:id/1.0';
                return uri.replace(':id', value);
            },
            isFavourite(emote) {
                return EmoteModule.isFavourite(emote);
            },
            toggleFavourite(emote) {
                return EmoteModule.setFavourite(emote, !this.isFavourite(emote));
            },
            searchEmotes(e) {
                if (e.which === 27 || e.key === 'ArrowDown' || e.key === 'ArrowUp') return;
                if (e.key === 'Tab' || e.key === 'Enter' && this.open) {
                    const selected = this.emotes[this.selectedIndex];
                    if (!selected) return;
                    this.inject(selected);
                    this.reset();
                    return;
                }

                const { selectionEnd, value } = e.target;
                this.sterm = value.substr(0, selectionEnd).split(/\s+/g).pop();

                if (!this.sterm.startsWith(';')) {
                    this.reset();
                    return;
                }

                if (this.sterm.length < 4) {
                    this.reset();
                    return;
                }
                this.title = this.sterm.substr(1);
                this.emotes = EmoteModule.filter(new RegExp(this.sterm.substr(1), 'i'), 10);
                this.open = this.emotes.length;
            },
            traverse(e) {
                if (!this.open) return;
                if (e.key === 'ArrowUp') {
                    this.selectedIndex = (this.selectedIndex - 1) < 0 ? Math.min(this.emotes.length, 10) - 1 : this.selectedIndex - 1;
                    return;
                }
                if (e.key === 'ArrowDown') {
                    this.selectedIndex = (this.selectedIndex + 1) >= Math.min(this.emotes.length, 10) ? 0 : this.selectedIndex + 1;
                    return;
                }
                return;
            },
            reset() {
                this.emotes = [];
                this.title = '';
                this.selIndex = 0;
                this.selected = '';
                this.open = false;
                this.selectedIndex = 0;
                this.sterm = '';
            },
            inject(emote) {
                const ta = document.querySelector('.chat textarea');
                if (!ta) return;
                const { selectionEnd, value } = ta;
                const en = `;${emote.id};`;
                let substr = value.substr(0, selectionEnd);
                substr = substr.replace(new RegExp(this.sterm + '$'), en);

                Manip.setText(substr + value.substr(selectionEnd, value.length), false);
                ta.selectionEnd = ta.selectionStart = selectionEnd + en.length - this.sterm.length;
                this.reset();
            }
        }
    }
</script>
