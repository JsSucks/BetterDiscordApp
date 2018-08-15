/**
 * BetterDiscord Setting Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import BoolSetting from './types/bool';
import StringSetting from './types/text';
import NumberSetting from './types/number';
import DropdownSetting from './types/dropdown';
import RadioSetting from './types/radio';
import SliderSetting from './types/slider';
import ColourSetting from './types/colour';
import KeybindSetting from './types/keybind';
import FileSetting from './types/file';
import GuildSetting from './types/guild';
import ArraySetting from './types/array';
import CollectionSetting from './types/collection';
import KvpSetting from './types/kvp';
import SecureKvpSetting from './types/securekvp';
import CustomSetting from './types/custom';

export default class Setting {

    constructor(args, ...merge) {
        args = args.args || args;

        if (args.type instanceof Array) args.subtype = args.type[0], args.type = 'collection';
        if (args.type === 'color') args.type = 'colour';

        if (args.type === 'bool') return new BoolSetting(args, ...merge);
        else if (args.type === 'text') return new StringSetting(args, ...merge);
        else if (args.type === 'number') return new NumberSetting(args, ...merge);
        else if (args.type === 'dropdown') return new DropdownSetting(args, ...merge);
        else if (args.type === 'radio') return new RadioSetting(args, ...merge);
        else if (args.type === 'slider') return new SliderSetting(args, ...merge);
        else if (args.type === 'colour') return new ColourSetting(args, ...merge);
        else if (args.type === 'keybind') return new KeybindSetting(args, ...merge);
        else if (args.type === 'file') return new FileSetting(args, ...merge);
        else if (args.type === 'guild') return new GuildSetting(args, ...merge);
        else if (args.type === 'array') return new ArraySetting(args, ...merge);
        else if (args.type === 'collection') return new CollectionSetting(args, ...merge);
        else if (args.type === 'kvp') return new KvpSetting(args, ...merge);
        else if (args.type === 'securekvp') return new SecureKvpSetting(args, ...merge);
        else if (args.type === 'custom') return new CustomSetting(args, ...merge);
        throw {message: `Setting type ${args.type} unknown`};
    }

}
