/**
 * Easy Auth (ezauth) - v.1.0
 * Code by Miguel Ríos Marcos
 * 
 * A simple middleware module designed to provide the user a simple interface for async authentication requests
 * 
 * Dependencies : none
 * License : MIT License
 */

let contexts = {};

/**
 * Function to start up module parameters.
 * 
 * Call the module as "require(ezauth_module_path).init()".
 * 
 * @param {Object} contexts_object An object that stores the context name and the functions that are going to be used for authorizing in each context.
 * @example 
 * {
 *  context : [ auth_function_1, auth_functon_2, ... ], // Array of functions to check in this context
 *  authClient : [ checkSession ],
 *  authAdmin : [ checkCookie, checkSessionTime, verifyPermits ],
 *  authOwner : [ checkCookie, checkSessionTime, verifyPermits, verifyIP ]
 * }
 * 
 * Each auth function must have one and only one credentials parameter, any additional parameters will be ignored.
 * 
 * Authorization will be interpreted as granted if the function returns anything else than an error, if it throws an error, the auth will be interpreted as false.
 * 
 * @example
 * function checkCookie(credentials){
 *  // Your code to check the client's cookie
 *  
 *  // If the auth process isn't successful
 *  throw new Error('Some error message');
 *     
 *  // If the auth process is successful; 
 *  return {
 *      client_id : some_number,
 *      client_email : some_string,
 *      other_data : anything_else_you_want_to_retrieve,
 *      ...
 *  };
 * }
 * 
 * It is not mandatory to include the contexts_object parameter, but it might be convenient for an easy use of the module.
 * You can include the array of functions to be used later on calling the auth function.
 * 
 * Access any of the stored function arrays as ezauth_module_name.contexts.your_context_name.
 * 
 * @returns {object} The functions of the module once its initiated.
 */
function init(contexts_object){

    // Check if the structure of contexts_object is valid
    try{ 
        if(contexts_object != null) isAuthContextsObjectValid(contexts_object);

        return {
            contexts,
            auth
        };
    }
    catch(err){ 
        throw new Error('Invalid');
    }
}

/**
 * Function to check the authorization of a client based on a list of functions.
 * 
 * @param {Array} auth_functions An array of the functions that are going to check if the client is authorized.
 * 
 * This functions might be stored at ezauth_module_name.contexts.your_context_name (They were stored at init of the module).
 * 
 * You can pass directly the array of functions to be used.
 * 
 * @param {Object} credentials An object with the credentials to be passed to each of the auth functions.
 * @returns {Object} An array with anything returned by the functions (In the same order as the function calls).
 * 
 * This is in order to make the module a little more efficient, trying to avoid second calls to functions or DBMS that have already been called inside any of the auth functions.
 * 
 * @throws Error, If the auth process doesn't succeed.
 */
async function auth(auth_functions, credentials){

    // Call each function in the list and store the promise
    let promises = [];
    
    auth_functions.forEach((auth_function) => {

        // Ensure the function is wrapped inside a promise, so sync functions act like async.
        const wrapped_function = Promise.resolve().then(() => auth_function(credentials)); 
        
        // Store the promise
        promises.push(wrapped_function);
    });

    return Promise.allSettled(promises)
    .then((results) => {

        // Variable to store any data returned by the auth functions
        let data = [];

        // Iterate over each promise
        results.forEach((promise) => {

            // Check if any auth proccess has failed
            if(promise.status === 'rejected'){
                throw new Error('Authorization was rejected - ', promise.reason.message);
            }

            // If successfull, push returned data into the array
            data.push(promise.value);
        });

        return data;
    });
}

/**
 * Internal function to check if the structure of the provided contexts_object is valid.
 */
function isAuthContextsObjectValid(contexts_object){

    // Check if its an object
    if(!(typeof contexts_object === 'object')){

        throw new Error('Error : Auth contexts object must be a non array object.\nCheck "init" function example');
    }

    Object.keys(contexts_object).forEach((context) => {
        
        const auth_functions = contexts_object[context];

        // Check if each value contains an array
        if(!Array.isArray(auth_functions)){

            throw new Error('Error : Auth contexts object must contain an array if authfunctions in each context-key.\nCheck "init" function example')
        }

        auth_functions.forEach((auth_function) => {

            // Check if each array contains functions
            if(!(typeof auth_function === 'function')){

                throw new Error('Error : Auth contexts must contain an array of functions.\nCheck "init" function example')
            }

            // Check if the function is valid (Has at least one parameter)
            if(!(auth_function.length > 0)){
                
                throw new Error('Error : Auth functions must have one parameter.\nCheck "init" function example')
            }
        });
    });

    return;
}

module.exports = { init };