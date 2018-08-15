/**
 * BetterDiscord Settings Scheme Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Utils, ClientLogger as Logger } from 'common';

export default class SettingsScheme {

    constructor(args) {
        this.args = args.args || args;

        Object.freeze(this);
    }

    /**
     * The scheme's ID.
     */
    get id() {
        return this.args.id;
    }

    /**
     * The URL of the scheme's icon. This should be a base64 encoded data URI.
     */
    get icon_url() {
        return this.args.icon_url;
    }

    /**
     * The path of the scheme's icon relative to the content path.
     */
    get icon_path() {
        return this.args.icon_path;
    }

    /**
     * The MIME type of the scheme's icon.
     * This is only needed when using `icon_path` and the MIME type cannot be determined from the file contents. (Usually when using an SVG.)
     */
    get icon_type() {
        return this.args.icon_type;
    }

    /**
     * The scheme's name.
     */
    get name() {
        return this.args.name;
    }

    /**
     * A string to be displayed under the scheme.
     */
    get hint() {
        return this.args.hint;
    }

    /**
     * An array of stripped settings categories this scheme manages.
     */
    get categories() {
        return this.args.categories || this.args.settings || [];
    }

    get settings() {
        return this.categories;
    }

    /**
     * The path of the plugin/theme this scheme is part of.
     * Use scheme.setContentPath to change.
     */
    get path() {
        return this.args.path;
    }

    /**
     * Checks if this scheme's values are currently applied to a set.
     * @param {SettingsSet} set The set to check
     * @return {Boolean}
     */
    isActive(set) {
        for (const schemeCategory of this.categories) {
            const category = set.categories.find(c => c.id === (schemeCategory.id || schemeCategory.category));
            if (!category) {
                Logger.warn('SettingsScheme', `Category ${schemeCategory.id || schemeCategory.category} does not exist`);
                return false;
            }

            for (const schemeSetting of schemeCategory.settings) {
                const setting = category.settings.find(s => s.id === schemeSetting.id);
                if (!setting) {
                    Logger.warn('SettingsScheme', `Setting ${category.category}/${schemeSetting.id} does not exist`);
                    return false;
                }

                if (!Utils.compare(setting.args.value, schemeSetting.value)) return false;
            }
        }

        return true;
    }

    /**
     * Applies this scheme's values to a set.
     * @param {SettingsSet} set The set to merge this scheme's values into
     * @return {Promise}
     */
    applyTo(set) {
        return set.merge(this);
    }

    /**
     * Sets the path of the plugin/theme this setting is part of.
     * @param {String} contentPath The plugin/theme's directory path
     */
    setContentPath(contentPath) {
        this.args.path = contentPath;
    }

}
