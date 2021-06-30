const _Array = java.lang.reflect.Array;
const _Byte = java.lang.Byte;
const _Integer = java.lang.Integer;
const _String = java.lang.String;

export class Decrypter {

    #prefixes;
    #iv = this.#toByteArray([15, 8, 1, 0, 25, 71, 37, -36, 21, -11, 23, -32, -31, 21, 12, 53]);
    #password = this.#toCharArray([22, 8, 9, 111, 2, 23, 43, 8, 33, 33, 10, 16, 3, 3, 7, 6]);
    #ivParameterSpec = new javax.crypto.spec.IvParameterSpec(this.#iv);
    #cipher = javax.crypto.Cipher.getInstance("AES/CBC/PKCS5Padding");
    #cache = {};

    constructor (prefixes) {
        this.#prefixes = prefixes;
    }

    #toByteArray(bytes) {
        let res = _Array.newInstance(_Byte.TYPE, bytes.length);
        for (let i = 0; i < bytes.length; i++) res[i] = new _Integer(bytes[i]).byteValue();
        return res;
    }

    #toCharArray(chars) {
        return new _String(chars.map((e) => String.fromCharCode(e)).join("")).toCharArray();
    }

    #keygen(key, enc) {
        let index = this.#cache[key + '_' + enc];
        if (!index) {
            let salt = new _String((this.#prefixes[enc] + key).slice(0, 16).padEnd(16, "\0")).getBytes("UTF-8");
            let secretKeySpec = new javax.crypto.spec.SecretKeySpec(javax.crypto.SecretKeyFactory.getInstance("PBEWITHSHAAND256BITAES-CBC-BC").generateSecret(new javax.crypto.spec.PBEKeySpec(this.#password, salt, 2, 256)).getEncoded(), "AES");
            this.#cache[key + '_' + enc] = secretKeySpec;
            return secretKeySpec;
        } else return index;
    }

    derive (key, enc) {
        return this.#keygen(key, enc);
    }

    execute (key, enc, context) {
        try {
            this.#cipher.init(2, this.#keygen(key, enc), this.#ivParameterSpec);
            return String(new _String(this.#cipher.doFinal(android.util.Base64.decode(context, 0)), "UTF-8"));
        } catch (e) {
            return null;
        }
    }

}