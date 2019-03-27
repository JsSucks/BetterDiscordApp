/**
 * BetterDiscord External Module Base
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Globals from './globals';
import Content from './content';
import path from 'path';
import semver from 'semver';

export default class ExtModule extends Content {

    constructor(internals) {
        super(internals);
        this.__require = Globals.require(this.paths.mainPath);
    }

    get type() { return 'module' }
    get alternateVersions() { return this.__internals.alternateVersions }

    getVersion(value) {
        if (this.alternateVersions) for (const version of Object.keys(this.alternateVersions)) {
            if (semver.satisfies(version, value)) {
                return Globals.require(path.join(this.contentPath, this.alternateVersions[version]));
            }
        }

        if (semver.satisfies(this.version, value)) {
            return this.__require;
        }

        throw new Error(`Module cannot satisfy version ${value}.`);
    }
}
