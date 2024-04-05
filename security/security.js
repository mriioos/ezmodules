const crypto = require('crypto');
const fs = require('fs');

// FALTA UNA KEY Y UN IV POR DEFECTO EN EL ARCHIVO key.json

function hash(str, salt){
    const hashAlgorithm = 'sha256'; // You can choose a different hashing algorithm if desired
    const hash = crypto.createHash(hashAlgorithm);
    
    //Generar un salt de 32 bits
    let auxSalt = salt;
    if(auxSalt === ""){
        auxSalt = crypto.randomBytes(32).toString('hex'); 
    }

    // Combine the string and salt
    const data = str + auxSalt;

    // Update the hash object with the data
    hash.update(data);

    // Generate the hash in hexadecimal format
    return {
        hash : hash.digest('hex'),
        salt : auxSalt
    }
}

const keysObj = JSON.parse(fs.readFileSync('./modules/security/key.json', 'utf-8'));
const key = Buffer.from(keysObj.key, 'hex'); // 256-bit key
const defIv = Buffer.from(keysObj.iv, 'hex');

// Encripta los datos con un nuevo iv (Si strong === true) o con el por defecto
function encrypt(data, strong) {
    let iv = defIv;
    if(strong){
        iv = crypto.randomBytes(16); // 128-bit IV
    }

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encryptedData = cipher.update(data, 'utf8', 'hex');
    encryptedData += cipher.final('hex');

    return {
        data: encryptedData,
        iv: iv.toString('hex')
    };
}

// Desencripta datos (el iv es opcional)
function decrypt(encryptedData, iv) {
    let decipher;
    if(iv === undefined){
        // Utiliza el iv por defecto
        decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(defIv, 'hex'));
    }
    else{
        // Utiliza el iv que se ha pasado
        decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
    }

    let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');
    return decryptedData;
}

module.exports = {
    hash,
    encrypt,
    decrypt
}