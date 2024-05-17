/**
 * Easy Maria DB (ezmdb) - v.1.0
 * Code by Miguel Ríos Marcos
 * 
 * A simple interface module to request a MariaDB DBMS with basic and complex queries
 * 
 * Dependencies : 'mariadb', 'fs' and 'path'
 * License : MIT License
 */

const mariadb = require('mariadb');
const fs = require('fs');
const path = require('path');

// Module configuration
const config_file_path = path.join(__dirname, 'config.json');
const module_config = JSON.parse(fs.readFileSync(config_file_path, 'utf-8')); // Just for the record, there isn't any module configuration available yet, this object is not used

// Configuration of the access to the database
const database_config = {};

// Global connection pool
let pool = null;

// Available procedures for this user
const get_procedures_file_path = path.join(__dirname, 'staticqueries', 'get_procedures.sql');
let procedures = {}; // Public access of procedures names available for this user

/**
* Function to startup the module functionality, configures the module and returns its functions.
* 
* Call the module as "require(db_module_path).init(database_config, credentials)".
* @param {object} config The host, port, database and other configurations of the database (reffer to mariadb documentation to find configuration names)
* @example
* {
*     "host" : "localhost", (Or ip)
*     "port" : 3306,
*     "database" : "databasename"
*     "connectionLimit" : 5, 
*     "multipleStatements" : true
* }
* @param {object} credentials The user and password 
* @example
* {
*     "user" : "username",
*     "password" : "userpassword"
* }
* @returns {object} The functions of the module once its initiated
*/
function init(config, credentials){

    // Set database configuration
    setConfig(config);

    // Set credentials
    setCredentials(credentials);

    // Flush api
    flush();

    // Return module functions
    return {
        procedures,
        setConfig,
        setCredentials,
        flush,
        call
    }
}

/**
* Function to configure the location and usage of the mariadb server
* @param {object} config The host, port, database and other configurations (reffer to mariadb documentation to find configuration names)
* @example
* {
*     "host" : "localhost", (Or ip)
*     "port" : 3306,
*     "database" : "databasename"
*     "connectionLimit" : 5, 
*     "multipleStatements" : true
* }
*/
function setConfig(config)
{
    // Merge configurations (Adds or updates existing credentials)
    database_config.params = { ...database_config.params, ...config };
}

/**
* Function to configure the credentials to be used to access the database
* @param {object} credentials The user and password 
* @example
* {
*     "user" : "username",
*     "password" : "userpassword"
* }
*/
function setCredentials(credentials)
{
    // Merge credentials (Adds or updates existing credentials)
    database_config.credentials = { ...config.credentials, ...credentials };
}

/**
 * Function to flush credentials, configuration and available procedures
 */
function flush(){
    // Create or flush pool with the new configuration
    flushPool();

    // Get or flush procedures available for this user
    flushProcedures();
}

/**
 * Function to create or update the pool of connections with the database.
 * @throws {Error} if configuration is wrong or an event of major cause happens (unknown error)
 */
async function flushPool()
{
    try{
        pool = await mariadb.createPool({ ...database_config.params, ...database_config.credentials });
    }
    catch(err){
        console.error('Error creating or updating database pool:\n', err);
        throw err;
    }
}

/**
 * Funtion to get or flush the available procedures for the current user.
 * 
 * Makes it easy to call procedure names without typoing by making an object with them
 */
function flushProcedures(){
    const getProceduresQuery = fs.readFileSync(get_procedures_file_path, 'utf-8').replace(/--.*?\n/g, ' ').replace(/\/\*.*?\*\//g, '').replace(/\s+/g, ' ');;
    
    query(getProceduresQuery, [])
    .then((rows) => {
        rows.forEach((row) => {
            procedures[row] = row;
        });
    })
    .catch((err) => {
        console.log("Error on flushing procedures for the current user" + err);
    });
}

/** 
 * Function to call a procedure previously stored in you database.
 * @param {string} procedure The name of the procedure you want to call.
 * @param {Array} params The array of parameters accepted by the procedure.
 * 
 * Procedures available for this user are stored at module_mame.procedures.* (procedure name as variable name).
 * @returns {Array} The requested rows or data retrived by the procedure
 */
function call(procedure, params){
    // Calc the string of placeholders
    const placeholders = params.map(() => '?').join(', ');

    return query(`CALL ?(${placeholders});`, [procedure, ...params]);
}

/**
 * Function to query the database with a request of any type.
 * @param {string} sql The sql query (uses "?" as parameter placeholders).
 * @param {object} params The array of parameters to be inserted into the query.
 * @returns {object} The rows that where fetched by the DBMS and extra info related to te query.
 * @throws {Error} if there is any issue with the pool or the query, probably wrong credentials or parameters.
 */
function query(sql, params){
    return pool.getConnection()
    .then((conn) => {
        return conn.query(sql, params)
        .then((rows) => {
            return rows;
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            conn.release();
        });
    })
    .catch((err) => {
        console.log(err);
    });
}

module.exports = { init };