/**
 * BetterDiscord Setting String Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-formTextinput">
        <div class="bd-title">
            <h3 v-if="setting.text">{{setting.text}}</h3>
            <div class="bd-textinputWrapper">
                <input type="text" v-model="setting.value" @keyup.stop />
            </div>
        </div>
        <div class="bd-hint">{{setting.hint}}</div>
    </div>
</template>

<script>
    export default {
        props: ['setting']
    }
</script>
