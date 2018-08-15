/**
 * BetterDiscord Radio Group Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-radioGroup" :class="{'bd-disabled': disabled}">
        <label class="bd-radio" v-for="option in options" :class="{'bd-radioSelected': isSelected(option.value)}" @click="toggleOption(option.value)">
            <div class="bd-radioControlWrap">
                <svg class="bd-radioControl" name="Checkmark" width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <g fill="none" fill-rule="evenodd"><polyline stroke="#3e82e5" stroke-width="2" points="3.5 9.5 7 13 15 5"></polyline></g>
                </svg>
            </div>
            <div class="bd-radioText">{{ option.text }}</div>
        </label>
    </div>
</template>

<script>
    import { Utils } from 'common';

    export default {
        props: ['options', 'value', 'multi', 'min', 'max', 'disabled'],
        methods: {
            toggleOption(value) {
                if (!this.multi)
                    return this.$emit('input', value);

                const values = this.value instanceof Array ? this.value : [this.value];

                if (values.find(v => Utils.compare(v, value))) {
                    if (this.min && (values.length - 1) <= this.min) return;
                    this.$emit('input', values.filter(v => !Utils.compare(v, value)));
                } else {
                    if (this.max && values.length > this.max) return;
                    this.$emit('input', values.concat([value]));
                }
            },
            isSelected(value) {
                if (!this.multi)
                    return Utils.compare(this.value, value);

                const values = this.value instanceof Array ? this.value : [this.value];
                return values.find(v => Utils.compare(v, value));
            }
        }
    }
</script>
