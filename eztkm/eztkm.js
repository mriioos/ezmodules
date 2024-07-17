/**
 * Easy Tool Kit Maker (eztkm) - v.1.0
 * Code by Miguel Ríos Marcos
 * 
 * A simple interface module create tool kits
 * Can be used for grouping different modules into a single interface, 
 * which can be useful for modularization of the code, such as dividing
 * it into multiple files each whith one function.
 * 
 * Dependencies : 'path' and 'fs'
 * License : MIT License
 */

const fs = require('fs');
const path = require('path');

/**
* Function to startup the module functionality, configures the module and returns its functions.
* 
* Call the module as "require(tkm_module_path).init(path_to_modules)".
*
* If the path is a single file, it will only call that file (I haven't found a use for this yet)
* If the path is a directory, it will call all the files in that directory.
* @param {Array} paths The paths to the modules you want to group
* @example 'path/to/modules/or/files/you/want/to/group'
* 
* @param {boolean} recursive A flag that determines whether the path scan is recursive
* @example true - The subdirectories will be scanned for more modules recursively. Subdirectories will appear as an object inside the root.
* @example false - Only the root directory will be scanned for modules
* 
* @returns {object} The functions of the module once its initiated
*/
function init(paths, recursive){

    let functions = {};

    paths.forEach((path) => {
        const normalized = path.normalize(path);
        const parsed = path.parse(normalized);

        // Check if the path is a file or directory
        fs.stat(normalized, (err, stats) => {
            if (err) {
                throw new Error(`Error accessing ${normalized}: ${err}`);
            }

            if (stats.isFile()) {
                // Check if the file is js
                if(parsed.ext === '.js'){
                    functions[parsed.name] = getFunctions();
                }
            } else if (stats.isDirectory()) {
                // Find all js files in the directory
                console.log(`${normalized} is a directory.`);
            }
        });
    });
}

module.exports = { init };