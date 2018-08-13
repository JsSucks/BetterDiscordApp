/**
 * BetterDiscord E2EE Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-e2eeMessageButtonWrap">
        <div class="bd-e2eeMessageButton">
            <MiLock v-tooltip="'Encrypted'" :size="16" />
        </div>
    </div>
</template>

<script>
    import { MiLock } from '../ui/components/common/MaterialIcon';

    export default {
        components: {
            MiLock
        },
        props: ['message']
    }
</script>
