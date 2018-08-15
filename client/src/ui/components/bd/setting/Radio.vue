/**
 * BetterDiscord Setting Radio Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-formRadio">
        <div class="bd-formRadioDetails">
            <div class="bd-title">
                <h3>{{setting.text}}</h3>
            </div>
            <div class="bd-hint">{{setting.hint}}</div>
        </div>
        <RadioGroup :options="setting.options" v-model="setting.value" :multi="setting.multi" :min="setting.min" :max="setting.max" :disabled="setting.disabled" />
    </div>
</template>

<script>
    import RadioGroup from '../../common/RadioGroup.vue';

    export default {
        props: ['setting'],
        components: {
            RadioGroup
        }
    }
</script>
