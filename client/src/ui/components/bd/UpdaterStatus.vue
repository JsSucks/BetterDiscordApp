/**
 * BetterDiscord Updater Status Component
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
            <h3 class="bd-updaterStatus" v-if="disabled">Use your package manager to install</h3>
            <h3 class="bd-updaterStatus bd-err" v-else-if="item.status.error">Update Failed!</h3>
            <h3 class="bd-updaterStatus bd-ok" v-else-if="item.status.updated">Done</h3>
            <div class="bd-spinner7" v-else-if="item.status.updating" />
            <h3 class="bd-updaterStatus" v-else>Unknown</h3>
        </div>
        <div class="bd-hint">{{item.hint}}</div>
    </div>
</template>

<script>
    export default {
        props: ['item', 'disabled']
    }
</script>
