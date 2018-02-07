/**
 * BetterDiscord Client UI Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import DOM from './dom';
import Vue from './vue';
import { BdSettingsWrapper } from './components';
import BdModals from './components/bd/BdModals.vue';
import { Events, WebpackModules } from 'modules';
import { Utils } from 'common';

export default class {

    static initUiEvents() {
        const defer = setInterval(() => {
            if (!this.profilePopupModule) return;
            clearInterval(defer);
            this.profilePopupModule.open = Utils.overload(this.profilePopupModule.open, userid => {
                Events.emit('ui-event', {
                    event: 'profile-popup-open',
                    data: { userid }
                });
            });
        }, 100);
    }

    static get profilePopupModule() {
        return WebpackModules.getModuleByProps(['fetchMutualFriends', 'setSection']);
    }

    static injectUi() {
        DOM.createElement('bdtooltips').appendTo(DOM.bdBody);
        DOM.createElement('div', null, 'bd-settings').appendTo(DOM.bdBody);
        DOM.createElement('div', null, 'bd-modals').appendTo(DOM.bdModals);

        const modals = new Vue({
            el: '#bd-modals',
            components: { BdModals },
            template: '<BdModals/>'
        });

        const vueInstance = new Vue({
            el: '#bd-settings',
            components: { BdSettingsWrapper },
            template: '<BdSettingsWrapper/>'
        });

        return vueInstance;
    }
}
