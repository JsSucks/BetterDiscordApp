/**
 * BetterDiscord Context Menu Toggle Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-cmItem bd-cmToggle" @click="$emit('click', $event)">
        <div class="bd-cmLabel">{{item.text}}</div>
        <div class="bd-cmCheckbox" :checked="checked">
            <div class="bd-cmCheckboxInner">
                <input type="checkbox" :checked="checked"/>
                <span></span>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['item', 'checked']
    }
</script>
