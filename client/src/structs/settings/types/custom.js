/**
 * BetterDiscord Custom Setting Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Globals } from 'modules';
import path from 'path';
import Setting from './basesetting';

export default class CustomSetting extends Setting {

    constructor(args, ...merge) {
        super(args, ...merge);

        if (this.args.class_file && this.path)
            this.setClass(this.args.class_file, this.args.class);
    }

    /**
     * The file to load the custom setting from.
     */
    get file() {
        return this.args.file;
    }

    /**
     * The name of a function on the plugin's main object that will be called to get a Vue component or a HTML element.
     */
    get function() {
        return this.args.function;
    }

    /**
     * The name of an export of {file}, or a Vue component.
     */
    get component() {
        return this.args.component;
    }

    /**
     * Whether to show a debug view under the custom setting's component.
     */
    get debug() {
        return this.args.debug || false;
    }

    /**
     * Sets the path of the plugin/theme this setting is part of.
     * Used by settings of type "array", "custom" and "file".
     * @param {String} contentPath The plugin/theme's directory path
     */
    setContentPath(_path) {
        this.args.path = _path;

        if (this.args.class_file)
            this.setClass(this.args.class_file, this.args.class);
    }

    /**
     * Replaces the custom setting's prototype with a new one that extends CustomSetting.
     * @param {String} classFile The path of a file relative to the plugin/theme's directory that will be required
     * @param {String} classExport The name of a property of the file's exports that will be used (optional)
     */
    setClass(class_file, class_export) {
        const class_exports = Globals.require(path.resolve(this.path, class_file));
        let setting_class = class_export ? class_exports[class_export] : class_exports.default ? class_exports.default : class_exports;

        if (typeof setting_class === 'function' && !(setting_class.prototype instanceof CustomSetting))
            setting_class = setting_class.call(class_exports, CustomSetting);

        if (!(setting_class.prototype instanceof CustomSetting))
            throw {message: 'Custom setting class doesn\'t extend from CustomSetting.'};

        this.__proto__ = setting_class.prototype;
    }

}
