/**
 * BetterDiscord Sidebar Item Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <SidebarButton v-if="item._type === 'button'" :item="item" :onClick="onClick"/>
    <SidebarHeader v-else :item="item" />
</template>
<script>
    // Imports
    import { SidebarHeader, SidebarButton } from './';

    export default {
        props: ['item', 'onClick'],
        components: {
            SidebarHeader,
            SidebarButton
        }
    }
</script>
