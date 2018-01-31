/**
 * BetterDiscord Client UI Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Dom from './dom';
import Vue from 'vue';
import VTooltip from 'v-tooltip';
import { BdSettingsWrapper } from './components';

export default class {
    static injectUi() {
        Vue.use(VTooltip, {
            defaultContainer: 'bdtooltips',
            defaultClass: 'bd-tooltip',
            defaultTargetClass: 'bd-has-tooltip',
            defaultInnerSelector: '.bd-tooltip-inner',
            defaultTemplate: '<div class="bd-tooltip"><span class="bd-tooltip-inner"></span></div>'
        });

        Dom.createElement('div', null, 'bd-settings').appendTo(Dom.bdBody);

        const vueInstance = new Vue({
            el: '#bd-settings',
            components: { BdSettingsWrapper },
            template: '<BdSettingsWrapper/>'
        });

        return vueInstance;
    }
}
