/**
 * BetterDiscord Modals Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <bd-toasts>
        <Toast v-for="(toast, index) in toasts" :message="toast.message" :type="toast.type" :icon="toast.icon" :closing="toast.closing" :key="`${toast.id}`"></Toast>
    </bd-toasts>
</template>
<script>
    // Imports
    import { Toasts } from 'ui';
    import { Toast } from './common';

    export default {
        components: {
            Toast
        },
        data() {
            return {
                toasts: Toasts.stack
            };
        }
    }
</script>
