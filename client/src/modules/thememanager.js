/**
 * BetterDiscord Theme Manager Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import ContentManager from './contentmanager';

export default class extends ContentManager {

    static get localThemes() {
        return this.localContent;
    }

    static get pathId() {
        return 'themes';
    }

    static get loadAllThemes() {
        return this.loadAllContent;
    }

}
