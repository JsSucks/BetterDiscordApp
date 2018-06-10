/**
 * BetterDiscord Modal Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div :class="['bd-toast', {'bd-toast-has-icon': type != 'basic' || icon}, 'bd-toast-' + type, {'bd-toast-closing': closing}]">
        <div class="bd-toast-icon" v-if="type != 'basic' || icon">
            <img v-if="icon" :src="icon" width="20" height="20" />
            <MiSuccess v-else-if="type == 'success'" size="20" />
            <MiWarning v-else-if="type == 'warning'" size="20" />
            <MiInfo v-else-if="type == 'info'" size="20" />
            <MiError v-else-if="type == 'error'" size="20" />
        </div>
        <div class="bd-toast-text">
            {{message}}
        </div>
    </div>
</template>

<script>
    // Imports
    import { MiSuccess, MiWarning, MiError, MiInfo } from './MaterialIcon';

    export default {
        props: {
            message: String,
            icon: String,
            type: {
                default: "basic",
                validator: function (value) {
                    return ['success', 'warning', 'error', 'info', 'basic'].indexOf(value) !== -1
                }
            },
            closing: {type: Boolean, default: false}
        },
        components: {
            MiSuccess, MiWarning, MiError, MiInfo
        }
    }
</script>
