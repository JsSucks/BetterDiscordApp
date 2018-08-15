/**
 * BetterDiscord Event Listener Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Module from './module';
import Events from './events';

export default class extends Module {

    events() {
        for (const event of this.eventBindings) {
            Events.on(event.id, event.callback);
        }
    }

}
