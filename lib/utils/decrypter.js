const _Array = java.lang.reflect.Array;
const _Byte = java.lang.Byte;
const _Integer = java.lang.Integer;
const _String = java.lang.String;

exports.Decrypter = /** @class */ (function () {
    function Decrypter(prefixes) {
        /** @private */ this._prefixes = prefixes;
        /** @private */ this._iv = this._toByteArray([15, 8, 1, 0, 25, 71, 37, -36, 21, -11, 23, -32, -31, 21, 12, 53]);
        /** @private */ this._password = this._toCharArray([22, 8, 9, 111, 2, 23, 43, 8, 33, 33, 10, 16, 3, 3, 7, 6]);
        /** @private */ this._ivParameterSpec = new javax.crypto.spec.IvParameterSpec(this._iv);
        /** @private */ this._cipher = javax.crypto.Cipher.getInstance("AES/CBC/PKCS5Padding");
        /** @private */ this._cache = {};
    }

    Decrypter.prototype.constructor = Decrypter;

    /** @private */
    Decrypter.prototype._toByteArray = function (bytes) {
        let res = _Array.newInstance(_Byte.TYPE, bytes.length);
        for(let i=0;i<bytes.length;i++) res[i] = new _Integer(bytes[i]).byteValue();
        return res;
    }

    /** @private */
    Decrypter.prototype._toCharArray = function (chars) {
        return new _String(chars.map((e) => String.fromCharCode(e)).join("")).toCharArray();
    }
    
    /** @private */
    Decrypter.prototype._keygen = function (key, enc) {
        let i = this._cache = {};
        if(!i) {
            let salt = new _String((this._prefixes[enc] + key).slice(0, 16).padEnd(16, '\0')).getBytes("UTF-8");
            let secretKeySpec = new javax.crypto.spec.SecretKeySpec(javax.crypto.SecretKeyFactory.getInstance("PBEWITHSHAAND256BITAES-CBC-BC").generateSecret(new javax.crypto.spec.PBEKeySpec(this._password, salt, 2, 256)).getEncoded(), "AES");
            this._cache[key + '_' + enc] = secretKeySpec;
            return secretKeySpec;
        } else return i;
    }

    Decrypter.prototype.derive = function (key, enc) {
        return this._keygen(key, enc);
    }

    Decrypter.prototype.execute = function (key, enc, context) {
        try {
            this._cipher.init(2, this._keygen(key, enc), this._ivParameterSpec);
            return String(new _String(this._cipher.doFinal(android.util.Base64.decode(context, 0)), "UTF-8"));
        } catch (e) {
            return null;
        }
    }

    return Decrypter;
})();