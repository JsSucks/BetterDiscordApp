/**
 * BetterDiscord Secure Key Value Pair Setting Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Kvp from './kvp';

export default class SecureKvpSetting extends Kvp {

    /**
     * The value to use when the setting doesn't have a value.
     */
    get defaultValue() {
        return { key: 'PlaceholderKey', value: '' };
    }
}
