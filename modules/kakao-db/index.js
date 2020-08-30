"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _decrypter = require("./utils/decrypter");

var _JSONbig = _interopRequireDefault(require("./utils/JSONbig"));

var _preset = _interopRequireDefault(require("./preset"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to get private field on non-instance"); } if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to set private field on non-instance"); } if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } return value; }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

importClass(android.database.sqlite.SQLiteDatabase);
importClass(org.json.JSONArray);
var decrypter = new _decrypter.Decrypter(_preset.default.prefixes);

var _cur = new WeakMap();

var _myid = new WeakMap();

var _col = new WeakMap();

var _grant = new WeakSet();

var _init = new WeakSet();

var _default = /*#__PURE__*/function () {
  function _default() {
    _classCallCheck(this, _default);

    _init.add(this);

    _grant.add(this);

    _defineProperty(this, "DB1", void 0);

    _defineProperty(this, "DB2", void 0);

    _cur.set(this, {
      writable: true,
      value: void 0
    });

    _myid.set(this, {
      writable: true,
      value: void 0
    });

    _col.set(this, {
      writable: true,
      value: void 0
    });

    _classPrivateMethodGet(this, _grant, _grant2).call(this);

    this.DB1 = SQLiteDatabase.openDatabase("/data/data/com.kakao.talk/databases/KakaoTalk.db", null, SQLiteDatabase.CREATE_IF_NECESSARY);
    this.DB2 = SQLiteDatabase.openDatabase("/data/data/com.kakao.talk/databases/KakaoTalk2.db", null, SQLiteDatabase.CREATE_IF_NECESSARY); //fetch myid

    _classPrivateFieldSet(this, _cur, this.DB2.rawQuery("SELECT user_id FROM open_profile", null));

    _classPrivateFieldGet(this, _cur).moveToNext();

    _classPrivateFieldSet(this, _myid, Number(_classPrivateFieldGet(this, _cur).getString(0)));

    _classPrivateFieldSet(this, _col, _preset.default.structure(_classPrivateFieldGet(this, _myid)));

    _classPrivateMethodGet(this, _init, _init2).call(this);
  }

  _createClass(_default, [{
    key: "index",
    value: function index() {
      var cur = this.DB1.rawQuery("SELECT * FROM sqlite_sequence WHERE name = ?", ['chat_logs']);
      cur.moveToNext();
      var ret = String(cur.getString(1));
      cur.close();
      return ret;
    }
  }, {
    key: "get",
    value: function get(table, index)
    /* query(string), id(string), range(arr[int, bool]) */
    {
      var args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      if (table == 'chat_logs' && !index) index = this.index();
      if (table && args.query) return undefined;
      if (Object.keys(_classPrivateFieldGet(this, _col)).indexOf(table) == -1 && !args.query) return undefined;
      var cursor = !args.query ? this[_classPrivateFieldGet(this, _col)[table].loc].rawQuery("SELECT * FROM " + table + " WHERE " + (args.id ? args.id : _classPrivateFieldGet(this, _col)[table].index) + " = ?", [index]) : this[_classPrivateFieldGet(this, _col)[table].loc].rawQuery(args.query, null);

      if (!args.range) {
        cursor.moveToNext();

        var _ret = new DBitem(table, _classPrivateFieldGet(this, _col)[table]).get(cursor);

        cursor.close();
        return _ret;
      }

      var ret = [];
      !args.range[1] ? cursor.moveToNext() : cursor.moveToLast();

      try {
        for (var i = 0; i < args.range[0]; ++i) {
          ret.push(new DBitem(table, _classPrivateFieldGet(this, _col)[table]).get(cursor));
          args.range[1] ? cursor.moveToPrevious() : cursor.moveToNext();
        }
      } catch (e) {}

      cursor.close();
      return ret;
    }
  }]);

  return _default;
}();

exports.default = _default;

var _grant2 = function _grant2() {
  java.lang.Runtime.getRuntime().exec(["su", "mount -o remount rw /data/data/com.kakao.talk/databases", "chmod -R 777 /data/data/com.kakao.talk/databases", "mount -o remount rw /data/data/com.kakao.talk/shared_prefs", "chmod -R 777 /data/data/com.kakao.talk/shared_prefs"]).waitFor();
};

var _init2 = function _init2() {
  //fetch myid key
  for (var i = 20; i <= 28; i++) {
    decrypter.derive(_classPrivateFieldGet(this, _myid), i);
  } //fetch col name


  for (var _i in _classPrivateFieldGet(this, _col)) {
    _classPrivateFieldGet(this, _col)[_i].column = JSON.parse(String(JSONArray(this[_classPrivateFieldGet(this, _col)[_i].loc].query(_i, null, null, null, null, null, null).getColumnNames())));
  }
};

var _table = new WeakMap();

var _prop = new WeakMap();

var _data = new WeakMap();

var DBitem = /*#__PURE__*/function () {
  function DBitem(table, prop) {
    _classCallCheck(this, DBitem);

    _table.set(this, {
      writable: true,
      value: void 0
    });

    _prop.set(this, {
      writable: true,
      value: void 0
    });

    _data.set(this, {
      writable: true,
      value: {
        __reference__: {},
        __primitive__: {},
        __props__: {},

        get __data__() {
          for (var i in this.__primitive__) {
            this[i];
          }

          return this.__reference__;
        }

      }
    });

    _classPrivateFieldSet(this, _table, table);

    _classPrivateFieldSet(this, _prop, prop);
  }

  _createClass(DBitem, [{
    key: "get",
    value: function get(cursor) {
      var {
        column,
        salt,
        execute
      } = _classPrivateFieldGet(this, _prop);

      for (var i in column) {
        var [key, value] = [column[i], String(cursor.getString(i))];
        _classPrivateFieldGet(this, _data).__primitive__[key] = value;
      }

      var salty = Array(2);

      for (var j in salt) {
        if (Array.isArray(salt[j])) {
          _classPrivateFieldGet(this, _data).__reference__[salt[j][0]] = JSON.parse(_classPrivateFieldGet(this, _data).__primitive__[salt[j][0]]);
          salty[j] = _classPrivateFieldGet(this, _data).__reference__[salt[j][0]][salt[j][1]];
        } else if (typeof salt[j] == 'number') {
          salty[j] = salt[j];
        } else salty[j] = _classPrivateFieldGet(this, _data).__primitive__[salt[j]];
      }

      _classPrivateFieldGet(this, _data).__props__.salt = salty;

      var foo = _classPrivateFieldGet(this, _data);

      for (var data in foo.__primitive__) {
        var method = {};
        execute[data] && Object.assign(method, execute[data]);

        if (_classPrivateFieldGet(this, _table) === 'chat_logs' && data === 'message' && _preset.default.typeException.indexOf(JSON.parse(foo.__primitive__.type) == -1)) {
          method.bigParse = true;
        } //클로저


        (function (data, method) {
          Object.defineProperty(foo, data, {
            get() {
              this.__reference__[data] = this.__reference__[data] || (() => {
                var dbkey = new DBkey(this.__primitive__[data]);
                if (method.decrypt) dbkey.decrypt(this.__props__.salt);
                if (method.parse) dbkey.parse();
                if (method.bigParse) dbkey.bigParse();
                return dbkey.data;
              })();

              return this.__reference__[data];
            }

          });
        })(data, method);
      }

      return _classPrivateFieldGet(this, _data);
    }
  }]);

  return DBitem;
}();

var _data2 = new WeakMap();

var DBkey = /*#__PURE__*/function () {
  function DBkey(prop) {
    _classCallCheck(this, DBkey);

    _data2.set(this, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldSet(this, _data2, prop);
  }

  _createClass(DBkey, [{
    key: "parse",
    value: function parse() {
      try {
        _classPrivateFieldSet(this, _data2, JSON.parse(_classPrivateFieldGet(this, _data2)));
      } catch (e) {}
    }
  }, {
    key: "bigParse",
    value: function bigParse() {
      try {
        _classPrivateFieldSet(this, _data2, _JSONbig.default.parse(_classPrivateFieldGet(this, _data2)));
      } catch (e) {}
    }
  }, {
    key: "decrypt",
    value: function decrypt(salt) {
      try {
        _classPrivateFieldSet(this, _data2, decrypter.execute(salt[0], salt[1], _classPrivateFieldGet(this, _data2)));
      } catch (e) {}
    }
  }, {
    key: "data",
    get: function get() {
      return _classPrivateFieldGet(this, _data2);
    }
  }]);

  return DBkey;
}();