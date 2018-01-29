/**
 * BetterDiscord Client Utils Module
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

class Filters {
    static byProperties(props, selector = m => m) {
        return module => {
            const component = selector(module);
            if (!component) return false;
            return props.every(property => component[property] !== undefined);
        };
    }

    static byPrototypeFields(fields, selector = m => m) {
        return module => {
            const component = selector(module);
            if (!component) return false;
            if (!component.prototype) return false;
            return fields.every(field => component.prototype[field] !== undefined);
        };
    }

    static byCode(search, selector = m => m) {
        return module => {
            const method = selector(module);
            if (!method) return false;
            return method.toString().search(search) !== -1;
        };
    }

    static byDisplayName(name) {
        return module => {
            return module && module.displayName === name;
        };
    }

    static combine(...filters) {
        return module => {
            return filters.every(filter => filter(module));
        };
    }
}

module.exports = { Filters };
