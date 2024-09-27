/**
 * Easy Deep Nest (ezdn) - v.1.0
 * Code by Miguel Ríos Marcos
 * 
 * A simple module to deep nest properties into an object and get deep nested properties from the object.
 * 
 * After calling this module, Object.prototype.set and Object.prototype.get will be available.
 * Additionally, you can call the functions like (modulename).set or (modulename).get
 * 
 * Dependencies : none
 * License : ISC
 */

/**
 * Function to set a deeply nested property (deeply nested = parents may not exist).
 * @param {object} obj Root object.
 * @param {string} vPath To deeply nested property.
 * @example /vitrual/path/to/deeply/nested/property/file.js/lang
 * @param {string | object} value To be set to deeply nested property.
 * @returns {{parent : object, key : string}} - An object that conains a refference to the last created object and the key name
 */
function setDeeplyNestedProperty(obj, vPath, value){

    // Check that object is valid
    if(!obj) return;
    
    // Get key names ordered by deepness (less to most)
    const pathParts = vPath.split('/').filter((part) => part);
    const keys = pathParts.length ? pathParts : [''];

    // Create eack key or access it if exist
    let aux = obj;
    for(let iKey = 0; iKey < keys.length - 1; iKey++){ // Leave last element as the key to the value
        
        // Extract key
        const key = keys[iKey];

        // Create if not exists
        aux[key] = typeof aux[key] === typeof {} ? aux[key] : {};

        // Access
        aux = aux[key];
    }

    // Store value at last key
    const last = keys[keys.length - 1];
    aux[last] = value;

    // Return last created object and key name
    return {
        parent : aux,
        key : last
    }
}

/**
 * Function to get a deeply nested property given its path.
 * @param {object} obj Root object.
 * @param {string} vPath To deeply nested property.
 * @example /vitrual/path/to/deeply/nested/property/file.js/lang
 * @returns {*} Value stored at that property
 */
function getDeeplyNestedProperty(obj, vPath){
    
    // Check that object is valid
    if(!obj) return;

    // Get key names ordered by deepness (less to most)
    const pathParts = vPath.split('/').filter((part) => part);
    const keys = pathParts.length ? pathParts : [''];

    // Access each key if exist
    let aux = obj;
    for(let iKey = 0; iKey < keys.length; iKey++){
        
        // Extract key
        const key = keys[iKey];

        // Access key
        aux = aux[key];

        // Check if aux is still a value
        if(!aux){
            return;
        }
    }

    return aux;
}

// Make methods work from any object directly within itself
// Deactivated by now
/*Object.prototype.set = function(vPath, value){
    setDeeplyNestedProperty(this, vPath, value);
}

Object.prototype.get = function(vPath){
    return getDeeplyNestedProperty(this, vPath);
}*/

module.exports = { 
    set : setDeeplyNestedProperty, 
    get : getDeeplyNestedProperty
};