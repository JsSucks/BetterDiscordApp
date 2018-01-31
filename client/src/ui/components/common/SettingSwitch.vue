/**
 * BetterDiscord Setting Switch Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-setting-switch" :class="{'bd-disabled': disabled}">
        <div class="bd-title">
            <h3>{{setting.title || setting.text}}</h3>
            <label class="bd-switch-wrapper" @click="!disabled ? onClick(setting) : null">
                <input type="checkbox" class="bd-switch-checkbox" />
                <div class="bd-switch" :class="{'bd-checked': (setting.checked || setting.enabled || setting.value)}" />
            </label>
        </div>
        <div class="bd-hint">{{setting.hint}}</div>
    </div>
</template>
<script>
    export default {
        props: ['setting', 'onClick', 'disabled']
    }
</script>
