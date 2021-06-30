'use strict';

const { Decrypter } = require('./utils/decrypter');
const PRESET = require('./preset');
const JSONbig = require('./utils/JSONbig');

importClass(android.database.sqlite.SQLiteDatabase);
importClass(org.json.JSONArray);

const decrypter = new Decrypter(PRESET.prefixes);

module.exports = /** @class */ (function () {
    /**
     * Init KakaoTalk
     * @param {String} packageName KakaoTalk PackageName
     */
    function KakaoDB(packageName='com.kakao.talk') {
        /** @private */ this.packageName = packageName;
        this.DB1 = SQLiteDatabase.openDatabase("/data/data/" + this.packageName + "/databases/KakaoTalk.db", null, SQLiteDatabase.CREATE_IF_NECESSARY);
        this.DB2 = SQLiteDatabase.openDatabase("/data/data/" + this.packageName + "/databases/KakaoTalk2.db", null, SQLiteDatabase.CREATE_IF_NECESSARY);
        //fetch myid
        /** @private */ this._cur = this.DB2.rawQuery("SELECT user_id FROM open_profile", null);
        this._cur.moveToNext();
        /** @private */ this._myid = Number(this._cur.getString(0));
        /** @private */ this._col = PRESET.structure(this._myid);

        //TODO init
    }

    /** @private */
    KakaoDB.prototype._grant = function () {
        java.lang.Runtime.getRuntime().exec([
            'su',
            'mount -o remount rw /data/data/' + this.packageName + '/databases',
            'chmod -R 777 /data/data/' + this.packageName + '/databases',
            'mount -o remount rw /data/data/' + this.packageName + '/shared_prefs',
            'chmod -R 777 /data/data/' + this.packageName + '/shared_prefs',
        ]).waitFor();
    }

    /** @private */
    KakaoDB.prototype._init = function () {
        //fetch myid key
        for(let i=20;i<=28;i++) decrypter.derive(this._myid, i);
        //fetch col name
        for(let i in this._col) {
            this._col[i].column = JSON.parse(String(JSONArray(this[this._col[i].loc].query(i, null, null, null, null, null, null).getColumnNames())));
        }
    }

    KakaoDB.prototype.index = function () {
        const cur = this.DB1.rawQuery("SELECT * FROM sqlite_sequence WHERE name = ?", ['chat_logs']);
        cur.moveToNext();
        const ret = String(cur.getString(1));
        cur.close();
        return ret;
    }

    /**
     * KakaoDB DB get
     * @param {String} table SQL QueryName
     * @param {String} index SQL Id
     * @param {Array[Number, Boolean]} args SQL range
     */
    KakaoDB.prototype.get = function (table, index, args = {}) {
        try {

        } catch(e) {

        }
    }

    return KakaoDB;
})();

/** @class */
function DBitem(table, prop) {
    /** @private */ this._table = table;
    /** @private */ this._prop = prop;
    /** @private */ this._data = {
        __reference__: {},
        __primitive__: {},
        __props__: {},
        get __data__() {
            for(let i in this.__primitive__) this[i];
            return this.__reference__;
        }
    };
}

DBitem.prototype.get = function (cursor) {
    const { column, salt, execute } = this._prop;

    for(let i in column) {
        let [key, value] = [column[i], String(cursor.getString(i))];
        this._data.__primitive__[key] = value;
    }

    let salty = Array(2);
    for(let j in salt) {
        if(Array.isArray(salt[j])) {
            this._data.__reference__[salt[j][0]] = JSON.parse(this._data.__primitive__[salt[j][0]]);
            salty[j] = this._data.__reference__[salt[j][0]][salt[j][1]];
        } else if(typeof salt[j] === 'number') {
            salty[j] = salt[j];
        } else salty[j] = this._data.__primitive__[salt[j]];
    }
    this._data.__props__.salt = salty;

    let foo = this._data;
    for(let data in foo.__primitive__) {
        let method = {};
        execute[data] && Object.assign(method, execute[data]);

        if(this._table === 'chat_logs' && data === 'message' && PRESET.typeException.indexOf(JSON.parse(foo.__primitive__.type) == -1)) {
            method.bigParse = true;
        }

        //closer
        (function (data, method) {
            Object.defineProperty(foo, data, {
                get() {
                    this.__reference__[data] = this.__reference__[data] || (() => {
                        const dbKey = new DBkey(this.__primitive__[data]);
                        if(method.decrypt) dbKey.decrypt(this.__props__.salt);
                        if(method.parse) dbKey.parse();
                        if(method.bigParse) dbKey.bigParse();
                        return dbKey.data;
                    })()
                    return this.__reference__[data];
                }
            });
        })(data, method)
    }

    return this._data;
}

/** @class */
function DBkey(prop) {
    /** @private */ this._data = prop;
}

DBkey.prototype.parse = function () {
    try {
        this._data = JSON.parse(this._data);
    } catch(e) {}
}

DBkey.prototype.bigParse = function () {
    try {
        this._data = JSONbig.parse(this._data);
    } catch (e) {}
}

DBkey.prototype.decrypt = function (salt) {
    try {
        this._data = decrypter.execute(salt[0], salt[1], this._data);
    } catch(e) {}
}

DBkey.prototype.data = function () {
    return this._data;
}