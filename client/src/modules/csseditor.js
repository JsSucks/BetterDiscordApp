/**
 * BetterDiscord CSS Editor Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { ClientIPC } from 'common';
import { DOM } from 'ui';

export default class {

    static async show() {
        const t = await ClientIPC.send('openCssEditor', {});
        ClientIPC.send('setCss', { css: DOM.getStyleCss('bd-customcss') });

        ClientIPC.on('bd-update-css', this.updateCss);
    }

    static updateCss(e, css) {
        DOM.injectStyle(css, 'bd-customcss');
    }
}
