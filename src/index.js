import { Decrypter } from "./utils/decrypter";
import JSONbig from "./utils/JSONbig";

import PRESET from "./preset";


importClass(android.database.sqlite.SQLiteDatabase);
importClass(org.json.JSONArray);

const decrypter = new Decrypter(PRESET.prefixes);

export default class {

    
    DB1;
    DB2;
    #cur;
    #myid;
    #col;

    constructor () {

        this.#grant();

        this.DB1 = SQLiteDatabase.openDatabase("/data/data/com.kakao.talk/databases/KakaoTalk.db", null, SQLiteDatabase.CREATE_IF_NECESSARY);
        this.DB2 = SQLiteDatabase.openDatabase("/data/data/com.kakao.talk/databases/KakaoTalk2.db", null, SQLiteDatabase.CREATE_IF_NECESSARY);
        //fetch myid
        this.#cur = this.DB2.rawQuery("SELECT user_id FROM open_profile", null);
        this.#cur.moveToNext();
        this.#myid = Number(this.#cur.getString(0));
        this.#col = PRESET.structure(this.#myid);

        this.#init();

    }

    #grant () {
        java.lang.Runtime.getRuntime().exec([
            "su",
            "mount -o remount rw /data/data/com.kakao.talk/databases",
            "chmod -R 777 /data/data/com.kakao.talk/databases",
            "mount -o remount rw /data/data/com.kakao.talk/shared_prefs",
            "chmod -R 777 /data/data/com.kakao.talk/shared_prefs",
        ]).waitFor()
    }

    #init () {
        //fetch myid key
        for (let i = 20; i <= 28; i++) decrypter.derive(this.#myid, i)
        //fetch col name
        for (let i in this.#col) {
            this.#col[i].column = JSON.parse(String(JSONArray(this[this.#col[i].loc].query(i, null, null, null, null, null, null).getColumnNames())))
        }
    }

    index () {
        const cur = this.DB1.rawQuery("SELECT * FROM sqlite_sequence WHERE name = ?", ['chat_logs']);
        cur.moveToNext();
        const ret = String(cur.getString(1));
        cur.close();
        return ret;
    }

    get (table, index, args = {} /* query(string), id(string), range(arr[int, bool]) */ ) {
        try {
        if (table == 'chat_logs' && !index) index = this.index();
        if (Object.keys(this.#col).indexOf(table) == -1) return null;
        let cursor = !args.query ?
            this[this.#col[table].loc].rawQuery("SELECT * FROM " + table + " WHERE " + (args.id ? args.id : this.#col[table].index) + " = ?", [index]) :
            this[this.#col[table].loc].rawQuery(args.query, null)
        if (!args.range) {
            cursor.moveToNext()
            let ret = new DBitem(table, this.#col[table]).get(cursor)
            cursor.close()
            return ret
        }
        let ret = [];
        !args.range[1] ? cursor.moveToNext() : cursor.moveToLast()
        try {
            for (let i = 0; i < args.range[0]; ++i) {
                ret.push(new DBitem(table, this.#col[table]).get(cursor))
                args.range[1] ? cursor.moveToPrevious() : cursor.moveToNext()
            }
        } catch (e) {}
        cursor.close()
        return ret
        } catch (e) {
            Log.e('error!\nlineNo: ' + e.lineNumber + '\nmsg: ' + e.message);
        }
    }

}


class DBitem {

    #table;
    #prop;
    #data = {
        __reference__: {},
        __primitive__: {},
        __props__: {},
        get __data__() {
            for (let i in this.__primitive__) this[i];
            return this.__reference__;
        }
    };

    constructor(table, prop) {
        this.#table = table;
        this.#prop = prop;
    }

    get (cursor) {
        const { column, salt, execute } = this.#prop;

        for (let i in column) {
            let [key, value] = [column[i], String(cursor.getString(i))];
            this.#data.__primitive__[key] = value;
        }

        let salty = Array(2);
        for (let j in salt) {
            if (Array.isArray(salt[j])) {
                this.#data.__reference__[salt[j][0]] = JSON.parse(this.#data.__primitive__[salt[j][0]]);
                salty[j] = this.#data.__reference__[salt[j][0]][salt[j][1]];
            } else if (typeof salt[j] == 'number') {
                salty[j] = salt[j]
            } else salty[j] = this.#data.__primitive__[salt[j]];
        }
        this.#data.__props__.salt = salty;

        let foo = this.#data;
        for (let data in foo.__primitive__) {
            let method = {};
            execute[data] && Object.assign(method, execute[data]);

            if (this.#table === 'chat_logs' && data === 'message' && PRESET.typeException.indexOf(JSON.parse(foo.__primitive__.type) == -1)) {
                method.bigParse = true;
            }

            //클로저
            (function (data, method) {
                Object.defineProperty(foo, data, {
                    get() {
                        this.__reference__[data] = this.__reference__[data] || (() => {
                            const dbkey = new DBkey(this.__primitive__[data]);
                            if (method.decrypt) dbkey.decrypt(this.__props__.salt);
                            if (method.parse) dbkey.parse();
                            if (method.bigParse) dbkey.bigParse();
                            return dbkey.data;
                        })()
                        return this.__reference__[data];
                    }
                });
            })(data, method)
        }

        return this.#data;
    }
}


class DBkey {

    #data;

    constructor(prop) {
        this.#data = prop
    }

    parse() {
        try {
            this.#data = JSON.parse(this.#data)
        } catch (e) {}
    }

    bigParse() {
        try {
            this.#data = JSONbig.parse(this.#data)
        } catch (e) {}
    }

    decrypt(salt) {
        try {
            this.#data = decrypter.execute(salt[0], salt[1], this.#data);
        } catch (e) {}
    }

    get data() {
        return this.#data;
    }
}