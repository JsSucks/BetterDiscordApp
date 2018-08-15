/**
 * BetterDiscord Database Module
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Datastore from 'nedb';

export default class Database {

    constructor(dbPath) {
        this.exec = this.exec.bind(this);
        this.update = this.update.bind(this);
        this.init(dbPath);
        //this.db.emotes.loadDatabase();
        //this.db = new Datastore({ filename: dbPath, autoload: true });
    }

    async init(dbPath) {
        this.db = {
            storage: new Datastore({ filename: `${dbPath}/storage`, autoload: true })
        };
    }

    async update(cmd) {
        const db = cmd.db ? this.db[cmd.db] : this.db.storage;
        return new Promise((resolve, reject) => {
            db.update(cmd.args, cmd.data, { upsert: true }, (err, docs) => {
                if (err) return reject(err);
                db.persistence.compactDatafile();
                resolve(docs);
            });
        });
    }

    async loadDatabase(db) {
        return new Promise((resolve, reject) => {
            db.loadDatabase();
            resolve();
        });
    }

    async find(cmd) {
        const db = cmd.db ? this.db[cmd.db] : this.db.storage;
        let args = cmd.args;
        if (cmd.regex) args = { [cmd.regex.param]: new RegExp(cmd.regex.source, cmd.regex.flags) };
        return new Promise((resolve, reject) => {
            db.find(args, (err, docs) => {
                if (err) return reject(err);
                resolve(docs);
            });
        });
    }

    async exec(cmd) {
        switch (cmd.action) {
        case 'update':
            return this.update(cmd);
        case 'find':
            return this.find(cmd);
        }
        throw 'Invalid Command';
    }

}
