/*core functions for sipopama
* that is, putting together the kdf calls, handling the KDF->pw mapping, and integrations w/other libraries*/
var myScript;
var dicelist = [];

function doPBKDF2(kdfspec, pw) {
    var spec = kdfspec.split(":");
    //spec is pbkdf2:rounds:salt
    return sjcl.misc.pbkdf2(sjcl.codec.utf8String.toBits(pw),
        sjcl.codec.utf8String.toBits(spec[2]),
        spec[1], 32 * 8);
}

function doScrypt(kdfspec, pw) {
    var spec = kdfspec.split(":");
    //spec is scrypt:salt:r:N:p
    //note that for javascript, increasing p is best bet since memory is
    //constrained.
    return myScript.crypto_scrypt(myScript.encode_utf8(pw),
        myScript.encode_utf8(spec[1]),
        spec[2], spec[3], spec[4], 64);
}

function dohexN(passspec, kdfed) {
    var spec = passspec.split(":");
    var numChars = parseInt(spec[1]);
    var hexed = sjcl.codec.hex.fromBits(kdfed);
    return hexed.substring(0, numChars);
}

function doB64N(passspec, kdfed) {
    var spec = passspec.split(":");
    var numChars = parseInt(spec[1]);
    var b64ed = sjcl.codec.base64.fromBits(kdfed, true, true);
    return b64ed.substring(0, numChars);
}

function doDW(passspec, kdfed) {
    var res = "";
    var off = 0;
    for (i = 0; i < 4; i++) {
        var rnd = sjcl.bitArray.extract(kdfed, off, 13);
        off += 13;
        if (rnd > 6 * 6 * 6 * 6 * 6) {
            //worry about running out of bits later....
            i--;
            continue;
        }
        if (dicelist.length !== 7776)
            return "This is bad the list is the wrong length";
        var word = dicelist[rnd % dicelist.length].trim();
        if (i == 0)
            res = word;
        else
            res = res.concat("_", word);
    }
    return res;
}

function defps(passspec) {
    var spec = passspec.split(":");
    if (spec[0] == "nb64" || spec[0] == "nhex") {
        if (isNaN(spec[1]))
            return spec[0] + ":20";
        else
            return passspec;
    }
    if (spec[0] == "dw") {
        if (isNaN(spec[1]))
            return "dw:4";
        else
            return passspec;
    }
}

function passfromspec(passspec, inkdf) {
    var spec = passspec.split(":");
    if (spec[0] == "nb64") {
        return doB64N(passspec, inkdf);
    } else if (spec[0] == "nhex") {
        return dohexN(passspec, inkdf);
    } else if (spec[0] == "dw") {
        return doDW(passspec, inkdf)
    } else {
        return "some sort of bug or something; this is bad";
    }
}

function kdffromspec(kdfspec, inpw) {
    var spec = kdfspec.split(":");
    if (spec[0] == "pbkdf2") {
        return doPBKDF2(kdfspec, inpw);
    } else if (spec[0] == "scrypt") {
        //We round trip via hex to get into the sjcl format.
        return sjcl.codec.hex.toBits(myScript.to_hex
        (doScrypt(kdfspec, inpw)));
    } else {
        return inpw + kdfspec;
    }
}

function self_tests() {
    /*TODO - test coverage of other KDFs, pw types, iteratiosn, etc. etc.
    *  but hey, at least there is *a* test.*/
    var kdfspecone = "scrypt:-vuknxUkgAESgrhYjIslaj--ycrZjjbMIMI6B4ZxBxo:16384:8:3";
    var passspecone = "dw:4";
    var outexpectone = "1945_tx_1995_sheep";
    var derived_KDF = kdffromspec(kdfspecone, "asdf");
    var derived_pass = passfromspec(passspecone, derived_KDF);
    if(outexpectone!==derived_pass) {
        alert("test didn't pass; " + derived_pass + " veruus " + outexpectone);
    }
}

var scrypt_ready = false;
var diceware_ready = false;
function diceware_loaded(){
    diceware_ready = true;
    if(scrypt_ready) {
        self_tests();
    }
}
