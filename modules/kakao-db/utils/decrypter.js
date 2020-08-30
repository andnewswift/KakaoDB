"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Decrypter = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to set private field on non-instance"); } if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } return value; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to get private field on non-instance"); } if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

var _Array = java.lang.reflect.Array;
var _Byte = java.lang.Byte;
var _Integer = java.lang.Integer;
var _String = java.lang.String;

var _prefixes = new WeakMap();

var _iv = new WeakMap();

var _password = new WeakMap();

var _ivParameterSpec = new WeakMap();

var _cipher = new WeakMap();

var _cache = new WeakMap();

var _toByteArray = new WeakSet();

var _toCharArray = new WeakSet();

var _keygen = new WeakSet();

var Decrypter = /*#__PURE__*/function () {
  function Decrypter(prefixes) {
    _classCallCheck(this, Decrypter);

    _keygen.add(this);

    _toCharArray.add(this);

    _toByteArray.add(this);

    _prefixes.set(this, {
      writable: true,
      value: void 0
    });

    _iv.set(this, {
      writable: true,
      value: _classPrivateMethodGet(this, _toByteArray, _toByteArray2).call(this, [15, 8, 1, 0, 25, 71, 37, -36, 21, -11, 23, -32, -31, 21, 12, 53])
    });

    _password.set(this, {
      writable: true,
      value: _classPrivateMethodGet(this, _toCharArray, _toCharArray2).call(this, [22, 8, 9, 111, 2, 23, 43, 8, 33, 33, 10, 16, 3, 3, 7, 6])
    });

    _ivParameterSpec.set(this, {
      writable: true,
      value: new javax.crypto.spec.IvParameterSpec(_classPrivateFieldGet(this, _iv))
    });

    _cipher.set(this, {
      writable: true,
      value: javax.crypto.Cipher.getInstance("AES/CBC/PKCS5Padding")
    });

    _cache.set(this, {
      writable: true,
      value: {}
    });

    _classPrivateFieldSet(this, _prefixes, prefixes);
  }

  _createClass(Decrypter, [{
    key: "derive",
    value: function derive(key, enc) {
      return _classPrivateMethodGet(this, _keygen, _keygen2).call(this, key, enc);
    }
  }, {
    key: "execute",
    value: function execute(key, enc, context) {
      try {
        _classPrivateFieldGet(this, _cipher).init(2, _classPrivateMethodGet(this, _keygen, _keygen2).call(this, key, enc), _classPrivateFieldGet(this, _ivParameterSpec));

        return String(new _String(_classPrivateFieldGet(this, _cipher).doFinal(android.util.Base64.decode(context, 0)), "UTF-8"));
      } catch (e) {
        return null;
      }
    }
  }]);

  return Decrypter;
}();

exports.Decrypter = Decrypter;

var _toByteArray2 = function _toByteArray2(bytes) {
  var res = _Array.newInstance(_Byte.TYPE, bytes.length);

  for (var i = 0; i < bytes.length; i++) {
    res[i] = new _Integer(bytes[i]).byteValue();
  }

  return res;
};

var _toCharArray2 = function _toCharArray2(chars) {
  return new _String(chars.map(e => String.fromCharCode(e)).join("")).toCharArray();
};

var _keygen2 = function _keygen2(key, enc) {
  var index = _classPrivateFieldGet(this, _cache)[key + '_' + enc];

  if (!index) {
    var salt = new _String((_classPrivateFieldGet(this, _prefixes)[enc] + key).slice(0, 16).padEnd(16, "\0")).getBytes("UTF-8");
    var secretKeySpec = new javax.crypto.spec.SecretKeySpec(javax.crypto.SecretKeyFactory.getInstance("PBEWITHSHAAND256BITAES-CBC-BC").generateSecret(new javax.crypto.spec.PBEKeySpec(_classPrivateFieldGet(this, _password), salt, 2, 256)).getEncoded(), "AES");
    _classPrivateFieldGet(this, _cache)[key + '_' + enc] = secretKeySpec;
    return secretKeySpec;
  } else return index;
};