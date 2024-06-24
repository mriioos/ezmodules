/**
 * Easy Security (ezsec) - v.1.0
 * Code by Miguel Ríos Marcos
 * 
 * A simple interface module to encrypt, decrypt and hash data using sha256
 * 
 * Dependencies : 'fs' and 'crypto'
 * License : MIT License
 */

const crypto = require('crypto');
const fs = require('fs');

let config = fs.readFileSync(path.join(__dirname, 'key.json'));

// Check if default values exist, if they don't, create new ones and store them
if(!config.key || !config.iv){
    setDefaultConfig(config);
}

/**
 * Function to startup the module functionality, configures the module and returns its functions.
 * 
 * Call the module as "require(ezmail_module_path).init({ key : key, iv : iv })".
 * @param {string} key The key used by the module to encrypt and decrypt data.
 * @example
 * "A LOOOONG STRING WITH RANDOM LETTERS".
 * 
 * @param {string} iv The initialization vector.
 * @example
 * "ANOTHER LOOOONG STRING WITH RANDOM LETTERS".
 * 
 * If you leave any of the arguments undefined, the stored as default value will be used, if this is the first time the module is called, new ones will be created.
 * @see setDefaultConfig
 * 
 * @returns {object} The functions of the module once its initiated and some useful variables.
 */
function init({ key, iv }){

    // Set the config values
    setConfig({
        key : key ? key : config.key,
        iv : iv ? iv : config.iv
    });

    // Return the module functions
    return {
        setConfig,
        hash,
        encrypt,
        decrypt
    }
}

/**
 * Function to set a new default config (This function is to be called before initiation of the module, it works as an "static-like" function).
 * 
 * Previous configurations will be stored at "ezsec/log/*.json", this is in order to prevent loss of keys and ivs, which could lead to the loss of encrypted data.
 * 
 * @param {string} key The key used by the module to encrypt and decrypt data.
 * @example
 * "A LOOOONG STRING WITH RANDOM LETTERS" (32 bytes).
 * 
 * @param {string} iv The initialization vector.
 * @example
 * "ANOTHER LOOOONG STRING WITH RANDOM LETTERS" (16 bytes).
 * 
 * If you leave any of the arguments undefined, new ones will be created.
 */
function setDefaultConfig({ key, iv }){

    // Create an object with the new config
    let newConfig = { 
        key : key ? key : getNewKey(), 
        iv : iv ? iv : getNewIv()
    };

    // Move the current config to a new file and store it in the log
    fs.rename(path.join(__dirname, 'key.json'), path.join(__dirname, 'log', `key_${Date.now('.')}.json`), (err) => {
        
        // Ensure that there wasn't an error
        if(err){
            console.error('Error saving new default configuration (On saving old config) : ', err);
        } 
        else{
            // Overwrite key.json
            fs.writeFileSync(path.join(__dirname, 'key.json'), JSON.stringify(newConfig));
        }
    });
}

/**
 * Function to get a new key.
 * @returns {string} A long string with the new key (32 bytes) encoded in hex.
 */
function getNewKey(){
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Function to get a new initiation vector.
 * @returns {string} A long string with the new iv (16 bytes) encoded in hex .
 */
function getNewIv(){
    return crypto.randomBytes(16).toString('hex');
}

/**
 * Function to get a new salt.
 * @returns {string} A long string with the new salt (32 bytes) encoded in hex.
 */
function getNewSalt(){
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Function to set the key and iv values used by the module in order to do crypto things.
 * 
 * @param {string} key The key used by the module to .
 * @example
 * "A LOOOONG STRING WITH RANDOM LETTERS" (32 bytes).
 * 
 * @param {string} iv The initialization vector.
 * @example
 * "ANOTHER LOOOONG STRING WITH RANDOM LETTERS" (16 bytes).
 */
function setConfig({ key, iv }){
    config = {
        key : Buffer.from(key, 'hex'),
        iv : Buffer.from(iv, 'hex')
    };
}

/**
 * Function to get the hash value of a string.
 * @param {string} str The string to be hashed.
 * @param {string} salt (Optional) The salt (32 bytes) to be applied to the string.
 * 
 * If the salt is not specified, a new one will be created.
 * 
 * @returns {object} An object with the hashed string and the salt applied.
 * @example
 * {
 *   hash : "Hashed string",
 *   salt : "The salt used"
 * }
 */
function hash(str, salt){
    const hash = crypto.createHash('sha256');

    // Generate a salt of 32 bits
    const auxSalt = salt ? salt : getNewSalt();

    // Combine the string and salt
    const data = str + auxSalt;

    // Update the hash object with the data
    hash.update(data); 

    // Generate the hash in hexadecimal format
    return {
        hash : hash.digest('hex'),
        salt : auxSalt
    };
}

/**
 * Function to encrypt data.
 * 
 * @param {string} data The data string to be encrypted.
 * @param {boolean} strong A flag than indicates if the data should be encrypted using a new iv.
 * 
 * If false, the configured iv will be used, else a new one will be created.
 * 
 * @returns {object} An object that contains the encrypted data and the iv used.
 * @example
 * {
 *   data : "your encrypted data",
 *   iv : "The iv used for the encryption"
 * }
 */
function encrypt(data, strong) {

    // Choose iv to be used
    const iv = strong ? getNewIv() : config.iv; 

    // Create a cipher object
    const cipher = crypto.createCipheriv('aes-256-cbc', config.key, iv);
    
    // Encrypt data
    let encryptedData = cipher.update(data, 'utf8', 'hex');
    encryptedData += cipher.final('hex');

    // Return encrypted data and iv used
    return {
        data : encryptedData,
        iv : iv.toString('hex')
    };
}

/**
 * Function to decrypt an encryptd data string.
 * 
 * @param {string} encryptedData A string with the encrypted data.
 * @param {string} iv (Optional) The iv to be used for the decryption.
 * 
 * If not specified, the configured one will be used.
 * 
 * @returns {string} A string with the decrypted data.
 */
function decrypt(encryptedData, iv) {

    // Choose iv to be used
    const auxIv = iv ? iv : config.iv;

    // Create a decipher object
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, auxIv);

    // Decrypt data
    let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');

    // Return decrypted data
    return decryptedData;
}

module.exports = {
    init,
    setDefaultConfig
};