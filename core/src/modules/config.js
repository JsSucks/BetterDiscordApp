/**
 * BetterDiscord Config Module
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Module from './modulebase';
import path from 'path';
import os from 'os';

export default class Config extends Module {

    get version() {
        return this.args.version;
    }

    get versions() {
        return {
            core: this.coreVersion,
            client: this.clientVersion,
            editor: this.editorVersion
        };
    }

    get coreVersion() {
        return this.state.coreVersion;
    }

    get clientVersion() {
        return this.state.clientVersion;
    }

    get editorVersion() {
        return this.state.editorVersion;
    }

    setClientVersion(clientVersion) {
        this.state.clientVersion = clientVersion;
    }

    setCoreVersion(coreVersion) {
        this.state.coreVersion = coreVersion;
    }

    setEditorVersion(editorVersion) {
        this.state.editorVersion = editorVersion;
    }

    get paths() {
        return this.args.paths;
    }

    getPath(id, full) {
        const path = this.paths.find(p => p.id === id);
        if (!path) return null;
        return full ? path : path.path;
    }

    addPath(id, path) {
        this.paths.push({ id, path });
    }

    get config() {
        return {
            version: this.version,
            versions: this.versions,
            paths: this.paths
        };
    }

    // Compatibility with old client code and new installer args
    compatibility() {
        this.args.paths = Object.entries(this.args.paths).map(([id, _path]) => ({
            id, path: path.resolve(os.homedir(), _path)
        }));
    }

}
