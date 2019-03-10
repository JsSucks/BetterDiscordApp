/**
 * BetterDiscord Security Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import nodecrypto from 'node-crypto';
import aes256 from 'aes256';

export default class Security {

    static encrypt(key, content, prefix = '') {
        if (key instanceof Array || content instanceof Array) return this.deepEncrypt(key, content, prefix);
        return `${prefix}${aes256.encrypt(key, content)}`;
    }

    static decrypt(key, content, prefix = '') {
        if (key instanceof Array || content instanceof Array) {
            return this.deepDecrypt(key, content, prefix);
        }
        return aes256.decrypt(key, content.replace(prefix, ''));
    }

    static deepEncrypt(keys, content, prefix = '') {
        if (content && content instanceof Array) return this.deepEncryptContent(keys, content, prefix);
        let encrypt = null;
        for (const key of keys) {
            if (encrypt === null) encrypt = this.encrypt(key, content, prefix);
            else encrypt = this.encrypt(key, encrypt, prefix);
        }
        return encrypt;
    }

    static deepEncryptContent(key, contents, prefix = '') {
        let encrypt = null;
        for (const content of contents) {
            if (encrypt === null) encrypt = this.encrypt(key, content, prefix);
            else encrypt = this.encrypt(encrypt, content, prefix);
        }
        return encrypt;
    }

    static deepDecrypt(keys, content, prefix = '') {
        if (content && content instanceof Array) return this.deepDecryptContent(keys, content, prefix);
        let decrypt = null;
        for (const key of keys.reverse()) {
            if (decrypt === null) decrypt = this.decrypt(key, content, prefix);
            else decrypt = this.decrypt(key, decrypt, prefix);
        }
        return decrypt;
    }

    static deepDecryptContent(key, contents, prefix = '') {
        let decrypt = null;
        for (const content of contents) {
            if (decrypt === null) decrypt = this.decrypt(key, content, prefix);
            else decrypt = this.decrypt(decrypt, content, prefix);
        }
        return decrypt;
    }

    static randomBytes(length = 64, to = 'hex') {
        return nodecrypto.randomBytes(length).toString(to);
    }

    static async createHmac(key, data, algorithm = 'sha256') {
        const hmac = nodecrypto.createHmac(algorithm, key);
        return new Promise((resolve, reject) => {
            hmac.on('readable', () => {
                const data = hmac.read();
                if (data) return resolve(data.toString('hex'));
                reject(null);
            });
            hmac.write(data);
            hmac.end();
        });
    }

    static createECDH(curve = 'secp384r1') {
        return nodecrypto.createECDH(curve);
    }

    static hash(algorithm, data, encoding) {
        const hash = nodecrypto.createHash(algorithm);
        hash.update(data);
        return hash.digest(encoding);
    }

    static sha256(text) {
        const hash = nodecrypto.createHash('sha256');
        hash.update(text);
        return hash.digest('base64');
    }

    static generateECDHKeys(ecdh) {
        return ecdh.generateKeys('base64');
    }

    static getECDHPublicKey(ecdh) {
        return ecdh.getPublicKey('base64');
    }

    static computeECDHSecret(ecdh, otherPublicKey) {
        return ecdh.computeSecret(otherPublicKey, 'base64', 'base64');
    }

    static isBase64(text) {
        const reg = /^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{3}=|[a-zA-Z0-9+/]{2}==)?$/;
        return reg.test(text);
    }

}
