/**
 * BetterDiscord Utils Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import fs from 'fs';
import _ from 'lodash';
import filetype from 'file-type';
import path from 'path';

export class Utils {
    static overload(fn, cb) {
        const orig = fn;
        return function (...args) {
            orig(...args);
            cb(...args);
        }
    }

    /**
     * Attempts to parse a string as JSON.
     * @param {String} json The string to parse
     * @return {Any}
     */
    static async tryParseJson(jsonString) {
        try {
            return JSON.parse(jsonString);
        } catch (err) {
            throw ({
                message: 'Failed to parse json',
                err
            });
        }
    }

    /**
     * Returns a new object with normalised keys.
     * @param {Object} object
     * @return {Object}
     */
    static toCamelCase(o) {
        const camelCased = {};
        _.forEach(o, (value, key) => {
            if (_.isPlainObject(value) || _.isArray(value)) {
                value = this.toCamelCase(value);
            }
            camelCased[_.camelCase(key)] = value;
        });
        return camelCased;
    }

    /**
     * Format strings with placeholders (`{{placeholder}}`) into full strings.
     * Quick example: `formatString("Hello, {{user}}", {user: "Zerebos"})`
     * would return "Hello, Zerebos".
     * @param {string} string - string to format
     * @param {object} values - object literal of placeholders to replacements
     * @returns {string} the properly formatted string
     */
    static formatString(string, values) {
        for (const val in values) {
            let replacement = values[val];
            if (Array.isArray(replacement)) replacement = JSON.stringify(replacement);
            if (typeof(replacement) === 'object' && replacement !== null) replacement = replacement.toString();
            string = string.replace(new RegExp(`{{${val}}}`, 'g'), replacement);
        }
        return string;
    }

    /**
     * Finds a value, subobject, or array from a tree that matches a specific filter. Great for patching render functions.
     * @param {object} tree React tree to look through. Can be a rendered object or an internal instance.
     * @param {callable} searchFilter Filter function to check subobjects against.
     */
    static findInReactTree(tree, searchFilter) {
        return this.findInTree(tree, searchFilter, {walkable: ['props', 'children', 'child', 'sibling']});
    }

    /**
     * Finds a value, subobject, or array from a tree that matches a specific filter.
     * @param {object} tree Tree that should be walked
     * @param {callable} searchFilter Filter to check against each object and subobject
     * @param {object} options Additional options to customize the search
     * @param {Array<string>|null} [options.walkable=null] Array of strings to use as keys that are allowed to be walked on. Null value indicates all keys are walkable
     * @param {Array<string>} [options.ignore=[]] Array of strings to use as keys to exclude from the search, most helpful when `walkable = null`.
     */
    static findInTree(tree, searchFilter, { walkable = null, ignore = [] }) {
        if (typeof searchFilter === 'string') {
            if (tree.hasOwnProperty(searchFilter)) return tree[searchFilter];
        } else if (searchFilter(tree)) return tree;

        if (typeof tree !== 'object' || tree == null) return undefined;

        let tempReturn = undefined;
        if (tree instanceof Array) {
            for (const value of tree) {
                tempReturn = this.findInTree(value, searchFilter, {walkable, ignore});
                if (typeof tempReturn != 'undefined') return tempReturn;
            }
        }
        else {
            const toWalk = walkable == null ? Object.keys(tree) : walkable;
            for (const key of toWalk) {
                if (!tree.hasOwnProperty(key) || ignore.includes(key)) continue;
                tempReturn = this.findInTree(tree[key], searchFilter, {walkable, ignore});
                if (typeof tempReturn != 'undefined') return tempReturn;
            }
        }
        return tempReturn;
    }

    /**
     * Gets a nested property (if it exists) safely. Path should be something like `prop.prop2.prop3`.
     * Numbers can be used for arrays as well like `prop.prop2.array.0.id`.
     * @param {Object} obj - object to get nested property of
     * @param {string} path - representation of the property to obtain
     */
    static getNestedProp(obj, path) {
        return path.split(/\s?\.\s?/).reduce(function(obj, prop) {
            return obj && obj[prop];
        }, obj);
    }

    /**
     * Checks if two or more values contain the same data.
     * @param {Any} ...value The value to compare
     * @return {Boolean}
     */
    static compare(value1, value2, ...values) {
        // Check to see if value1 and value2 contain the same data
        if (typeof value1 !== typeof value2) return false;
        if (value1 === null && value2 === null) return true;
        if (value1 === null || value2 === null) return false;

        if (typeof value1 === 'object') {
            // Loop through the object and check if everything's the same
            if (Object.keys(value1).length !== Object.keys(value2).length) return false;

            for (const key in value1) {
                if (!this.compare(value1[key], value2[key])) return false;
            }
        } else if (value1 !== value2) return false;

        // value1 and value2 contain the same data
        // Check any more values
        for (const value3 of values) {
            if (!this.compare(value1, value3))
                return false;
        }

        return true;
    }

    /**
     * Deep extends an object with a set of other objects. Objects later in the list
     * of `extenders` have priority, that is to say if one sets a key to be a primitive,
     * it will be overwritten with the next one with the same key. If it is an object,
     * and the keys match, the object is extended. This happens recursively.
     * @param {object} extendee - Object to be extended
     * @param {...object} extenders - Objects to extend with
     * @returns {object} - A reference to `extendee`
     */
    static extend(extendee, ...extenders) {
        for (let i = 0; i < extenders.length; i++) {
            for (const key in extenders[i]) {
                if (extenders[i].hasOwnProperty(key)) {
                    if (typeof extendee[key] === 'object' && typeof extenders[i][key] === 'object') this.extend(extendee[key], extenders[i][key]);
                    else if (typeof extenders[i][key] === 'object') extendee[key] = {}, this.extend(extendee[key], extenders[i][key]);
                    else extendee[key] = extenders[i][key];
                }
            }
        }
        return extendee;
    }

    /**
     * Clones an object and all it's properties.
     * @param {Any} value The value to clone
     * @param {Function} exclude A function to filter objects that shouldn't be cloned
     * @return {Any} The cloned value
     */
    static deepclone(value, exclude, cloned) {
        if (exclude && exclude(value)) return value;

        if (!cloned) cloned = new WeakMap();

        if (typeof value === 'object' && value !== null) {
            if (value instanceof Array) return value.map(i => this.deepclone(i, exclude, cloned));

            if (cloned.has(value)) return cloned.get(value);

            const clone = Object.assign({}, value);
            cloned.set(value, clone);

            for (const key in clone) {
                clone[key] = this.deepclone(clone[key], exclude, cloned);
            }

            return clone;
        }

        return value;
    }

    /**
     * Freezes an object and all it's properties.
     * @param {Any} object The object to freeze
     * @param {Function} exclude A function to filter objects that shouldn't be frozen
     */
    static deepfreeze(object, exclude) {
        if (exclude && exclude(object)) return;

        if (typeof object === 'object' && object !== null) {
            if (Object.isFrozen(object)) return object;

            const properties = Object.getOwnPropertyNames(object);

            for (const property of properties) {
                this.deepfreeze(object[property], exclude);
            }

            Object.freeze(object);
        }

        return object;
    }

    /**
     * Removes an item from an array. This differs from Array.prototype.filter as it mutates the original array instead of creating a new one.
     * @param {Array} array The array to filter
     * @param {Any} item The item to remove from the array
     * @return {Array}
     */
    static removeFromArray(array, item, filter) {
        let index;
        while ((index = filter ? array.findIndex(item) : array.indexOf(item)) > -1)
            array.splice(index, 1);
        return array;
    }

    /**
     * Defines a property with a getter that can be changed like a normal property.
     * @param {Object} object The object to define a property on
     * @param {String} property The property to define
     * @param {Function} getter The property's getter
     * @return {Object}
     */
    static defineSoftGetter(object, property, get) {
        return Object.defineProperty(object, property, {
            get,
            set: value => Object.defineProperty(object, property, {
                value,
                writable: true,
                configurable: true,
                enumerable: true
            }),
            configurable: true,
            enumerable: true
        });
    }

    /**
     * Generates an automatically memoizing version of an object.
     * @param {Object} object - object to memoize
     * @returns {Proxy} the proxy to the object that memoizes properties
     */
    static memoizeObject(object) {
        const proxy = new Proxy(object, {
            get: function(obj, mod) {
                if (!obj.hasOwnProperty(mod)) return undefined;
                if (Object.getOwnPropertyDescriptor(obj, mod).get) {
                    const value = obj[mod];
                    delete obj[mod];
                    obj[mod] = value;
                }
                return obj[mod];
            },
            set: function(obj, mod, value) {
                if (obj.hasOwnProperty(mod)) return;
                obj[mod] = value;
                return obj[mod];
            }
        });

        Object.defineProperty(proxy, 'hasOwnProperty', {value: function(prop) {
            return this[prop] !== undefined;
        }});

        return proxy;
    }

    static wait(time = 0) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    static async until(check, time = 0) {
        let value, i;
        do {
            // Wait for the next tick
            await new Promise(resolve => setTimeout(resolve, time));
            value = check(i);
            i++;
        } while (!value);
        return value;
    }

    /**
     * Stably sorts arrays since `.sort()` has issues.
     * @param {Array} list - array to sort
     * @param {function} comparator - comparator to sort by
     */
    static stableSort(list, comparator) {
        const length = list.length;
        const entries = Array(length);
        let index;

        // wrap values with initial indices
        for (index = 0; index < length; index++) {
            entries[index] = [index, list[index]];
        }

        // sort with fallback based on initial indices
        entries.sort(function (a, b) {
            const comparison = Number(this(a[1], b[1]));
            return comparison || a[0] - b[0];
        }.bind(comparator));

        // re-map original array to stable sorted values
        for (index = 0; index < length; index++) {
            list[index] = entries[index][1];
        }
    }

    /**
     * Finds the index of array of bytes in another array
     * @param {Array} haystack The array to find aob in
     * @param {Array} needle The aob to find
     * @return {Number} aob index, -1 if not found
     */
    static aobscan(haystack, needle) {
        for (let h = 0; h < haystack.length - needle.length + 1; ++h) {
            let found = true;
            for (let n = 0; n < needle.length; ++n) {
                if (needle[n] === null ||
                    needle[n] === '??' ||
                    haystack[h + n] === needle[n]) continue;
                found = false;
                break;
            }
            if (found) return h;
        }
        return -1;
    }

    /**
     * Convert buffer to base64 encoded string
     * @param {any} buffer buffer to convert
     * @returns {String} base64 encoded string from buffer
     */
    static arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    static async getImageFromBuffer(buffer) {
        if (!(buffer instanceof Blob)) buffer = new Blob([buffer]);
        const reader = new FileReader();
        reader.readAsDataURL(buffer);
        await new Promise(r => {
            reader.onload = r
        });
        const img = new Image();
        img.src = reader.result;
        return new Promise(resolve => {
            img.onload = () => {
                resolve(img);
            }
        });
    }

    static async canvasToArrayBuffer(canvas, mime = 'image/png') {
        const reader = new FileReader();
        return new Promise(resolve => {
            canvas.toBlob(blob => {
                reader.addEventListener('loadend', () => {
                    resolve(reader.result);
                });
                reader.readAsArrayBuffer(blob);
            }, mime);
        });
    }
}

export class FileUtils {
    /**
     * Gets information about a file.
     * @param {String} path The file's path
     * @return {Promise}
     */
    static async stat(path) {
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stat) => {
                if (err) return reject({
                    message: `No such file or directory: ${err.path}`,
                    err
                });

                resolve(stat);
            });
        });
    }

    /**
     * Checks if a file exists and is a file.
     * @param {String} path The file's path
     * @return {Promise}
     */
    static async fileExists(path) {
        const stats = await this.stat(path);

        if (!stats.isFile()) throw {
            message: `Not a file: ${path}`,
            stats
        };
    }

    /**
     * Checks if a directory exists and is a directory.
     * @param {String} path The directory's path
     * @return {Promise}
     */
    static async directoryExists(path) {
        const stats = await this.stat(path);

        if (!stats.isDirectory()) throw {
            message: `Not a directory: ${path}`,
            stats
        };
    }

    /**
     * Creates a directory.
     * @param {String} path The directory's path
     * @return {Promise}
     */
    static async createDirectory(path) {
        return new Promise((resolve, reject) => {
            fs.mkdir(path, err => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    /**
     * Checks if a directory exists and creates it if it doesn't.
     * @param {String} path The directory's path
     * @return {Promise}
     */
    static async ensureDirectory(path) {
        try {
            await this.directoryExists(path);
            return true;
        } catch (err) {
            await this.createDirectory(path);
            return true;
        }
    }

    /**
     * Returns the contents of a file.
     * @param {String} path The file's path
     * @return {Promise}
     */
    static async readFile(path) {
        await this.fileExists(path);

        return new Promise((resolve, reject) => {
            fs.readFile(path, 'utf-8', (err, data) => {
                if (err) return reject({
                    message: `Could not read file: ${path}`,
                    err
                });

                resolve(data);
            });
        });
    }

    /**
     * Returns the contents of a file.
     * @param {String} path The file's path
     * @param {Object} options Additional options to pass to fs.readFile
     * @return {Promise}
     */
    static async readFileBuffer(path, options) {
        await this.fileExists(path);

        return new Promise((resolve, reject) => {
            fs.readFile(path, options || {}, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });
    }

    /**
     * Writes to a file.
     * @param {String} path The file's path
     * @param {String} data The file's new contents
     * @return {Promise}
     */
    static async writeFile(path, data) {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, data, err => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    /**
     * Writes to the end of a file.
     * @param {String} path The file's path
     * @param {String} data The data to append to the file
     * @return {Promise}
     */
    static async appendToFile(path, data) {
        return new Promise((resolve, reject) => {
            fs.appendFile(path, data, err => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    /**
     * Returns the contents of a file parsed as JSON.
     * @param {String} path The file's path
     * @return {Promise}
     */
    static async readJsonFromFile(path) {
        const readFile = await this.readFile(path);

        try {
            return await Utils.tryParseJson(readFile);
        } catch (err) {
            throw Object.assign(err, { path });
        }
    }

    /**
     * Writes to a file as JSON.
     * @param {String} path The file's path
     * @param {Any} data The file's new contents
     * @param {Boolean} pretty Whether to pretty print the JSON object
     * @return {Promise}
     */
    static async writeJsonToFile(path, json, pretty) {
        return this.writeFile(path, `${JSON.stringify(json, null, pretty ? 4 : 0)}\n`);
    }

    /**
     * Returns an array of items in a directory.
     * @param {String} path The directory's path
     * @return {Promise}
     */
    static async listDirectory(path) {
        await this.directoryExists(path);

        return new Promise((resolve, reject) => {
            fs.readdir(path, (err, files) => {
                if (err) reject(err);
                else resolve(files);
            });
        });
    }

    static async readDir(path) {
        return this.listDirectory(path);
    }

    /**
     * Returns a file or buffer's MIME type and typical file extension.
     * @param {String|Buffer} buffer A buffer or the path of a file
     * @return {Promise}
     */
    static async getFileType(buffer) {
        if (typeof buffer === 'string') buffer = await this.readFileBuffer(buffer);

        return filetype(buffer);
    }

    /**
     * Returns a file's contents as a data URI.
     * @param {String} path The directory's path
     * @return {Promise}
     */
    static async toDataURI(buffer, type) {
        if (typeof buffer === 'string') buffer = await this.readFileBuffer(buffer);
        if (!type) type = (await this.getFileType(buffer)).mime;
        return `data:${type};base64,${buffer.toString('base64')}`;
    }

    /**
     * Deletes a file.
     * @param {String} path The file's path
     * @return {Promise}
     */
    static async deleteFile(path) {
        await this.fileExists(path);

        return new Promise((resolve, reject) => {
            fs.unlink(path, (err, files) => {
                if (err) reject(err);
                else resolve(files);
            });
        });
    }

    /**
     * Deletes a directory.
     * @param {String} path The directory's path
     * @return {Promise}
     */
    static async deleteDirectory(path) {
        await this.directoryExists(path);

        return new Promise((resolve, reject) => {
            fs.rmdir(path, (err, files) => {
                if (err) reject(err);
                else resolve(files);
            });
        });
    }

    /**
     * Deletes a directory and it's contents.
     * @param {String} path The directory's path
     * @return {Promise}
     */
    static async recursiveDeleteDirectory(pathToDir) {
        for (const file of await this.listDirectory(pathToDir)) {
            const pathToFile = path.join(pathToDir, file);
            try {
                await this.recursiveDeleteDirectory(pathToFile);
            } catch (err) {
                await this.deleteFile(pathToFile);
            }
        }

        await this.deleteDirectory(pathToDir);
    }
}
