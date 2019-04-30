/**
 * BetterDiscord Updater Switch Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-settingSwitch">
        <div class="bd-title">
            <h3>{{item.text}}</h3>
            <div class="bd-switchWrapper" @click="$emit('toggle', item)">
                <input type="checkbox" class="bd-switchCheckbox" />
                <div class="bd-switch" :class="{'bd-checked': item.status.update}" />
            </div>
        </div>
        <div class="bd-hint">{{item.hint}}</div>
    </div>
</template>

<script>
    export default {
        props: ['item']
    }
</script>
