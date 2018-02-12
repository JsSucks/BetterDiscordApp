/**
 * BetterDiscord Plugin Setting Dropdown Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-form-dropdown">
        <div class="bd-title">
            <h3>{{setting.text}}</h3>
            <div class="bd-dropdown" :class="{'bd-active': active}">
                <div class="bd-dropdown-current" @click="() => active = !active">
                    <span class="bd-dropdown-text">{{getOptionText(setting.value)}}</span>
                    <span class="bd-dropdown-arrow-wrap">
                        <span class="bd-dropdown-arrow"></span>
                    </span>
                </div>
                <div class="bd-dropdown-options bd-flex bd-flex-col" ref="options" v-if="active">
                    <div class="bd-dropdown-option" v-for="option in setting.options" :class="{'bd-dropdown-option-selected': setting.value === option.id}" @click="selectOption(option)">{{option.text}}</div>
                </div>
            </div>
        </div>
        <div class="bd-hint">{{setting.hint}}</div>
    </div>
</template>
<script>
    export default {
        props: ['setting', 'change'],
        data() {
            return {
                active: false
            };
        },
        methods: {
            getOptionText(value) {
                let matching = this.setting.options.filter(opt => opt.id === value);
                if (matching.length == 0) return "";
                else return matching[0].text;
            },
            selectOption(option) {
                this.active = false;
                this.change(this.setting.id, option.id);
            }
        },
        mounted() {
            document.addEventListener("click", e => {
                let options = this.$refs.options;
                if (options && !options.contains(e.target) && options !== e.target) {
                    this.active = false;
                }
            });
        }
    }
</script>
