/**
 * BetterDiscord Plugin Setting Radio Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-form-radio">
        <div class="bd-form-radio-details">
            <div class="bd-title">
                <h3>{{setting.text}}</h3>
            </div>
        </div>
        <div class="bd-form-radio-group">
            <label class="bd-radio" v-for="option in setting.options" :class="{'bd-radio-selected': setting.value === option.id}" @click="selectOption(option)">
                <div class="bd-radio-control-wrap">
                    <svg class="bd-radio-control" name="Checkmark" width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><polyline stroke="#3e82e5" stroke-width="2" points="3.5 9.5 7 13 15 5"></polyline></g></svg>
                </div>
                <div class="bd-radio-text">{{option.text}}</div>
            </label>
        </div>
    </div>
</template>
<script>
    export default {
        props: ['setting', 'change'],
        methods: {
            selectOption(option) {
                this.change(this.setting.id, option.id);
            }
        }
    }
</script>