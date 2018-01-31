                                                         /**
 * BetterDiscord UI Settings Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <SettingsWrapper headertext="UI Settings">
    </SettingsWrapper>
</template>

<script>
    // Imports
    import { SettingsWrapper } from './';
    import { SettingSwitch } from '../common';

    export default {
        components: {
            SettingsWrapper,
            SettingSwitch
        }
    }
</script>
