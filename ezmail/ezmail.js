/**
 * Easy Mail (ezmail) - v.1.0
 * Code by Miguel Ríos Marcos
 * 
 * A simple interface module to send basic and HTML emails using nodemailer module
 * 
 * Dependencies : 'fs', 'path', 'handlebars' and 'nodemailer'
 * License : MIT License
 */

const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const nodemailer = require('nodemailer');

let config = {
    credentials : {},
    defaults : {}
};

let templates = {};

let transporter;

/**
 * Function to start up module parameters.
 * 
 * Call the module as "require(ezmail_module_path).init(credentials, defaults)".
 * 
 * Functions saveTemplate and removeTemplate are not instance related functions, they are treated as "static like" functions thus only being able to be called by the default require('mail') constructor.
 * 
 * This should be useful for cluster architectures (to save the templates before forking workers, thus preventing multiple writing to the templates files)
 * @see saveTemplate
 * @see removeTemplate
 * 
 * @param {object} credentials The credentials asociated to your nodemailer account.
 * 
 * Please reffer to nodemailer documentation for a more detiled description.
 * @example
 * {
 *   "host" : "smtp.gmail.com",
 *   "port" : 587,
 *   "secure" : false,
 *   "auth" : {
 *       "user" : "",
 *       "pass" : ""
 *   }
 * }
 * @param {object} defaults The default info to be sent on you emails.
 * 
 * Please reffer to nodemailer documentation for all options.
 * @example
 * {
 *   "from" : "youremail@domain.ext"
 * }
 * @returns {object} The functions of the module once its initiated
 */
function init(credentials, defaults){

    // Set database configuration
    setCredentials(credentials);

    // Set credentials
    setDefaults(defaults);

    // Flush api
    flush();

    // Return module functions
    return {
        setCredentials,
        setDefaults,
        flush,
        send,
        sendHTML,
        sendTemplateHTML,
        templates
    }
}

/**
 * Function to update the credentials of the mail service.
 * 
 * Can be used to, for example, change the current user.
 * 
 * @param {object} credentials The credentials asociated to your nodemailer account.
 * 
 * Please reffer to nodemailer documentation for a more detiled description.
 * @example
 * {
 *   "host" : "smtp.gmail.com", (This is the default host for gmail)
 *   "port" : 587,              (This is the default port for nodemailer)
 *   "secure" : false,
 *   "auth" : {
 *       "user" : "",
 *       "pass" : ""
 *   }
 * }
 */
function setCredentials(credentials){
    config.credentials = { ...config.credentials, credentials };
}

/**
 * Function to update the defaults of the email (Such as the headers and body)
 * 
 * @param {object} defaults The default info to be sent on you emails.
 * 
 * Please reffer to nodemailer documentation for all options.
 * @example
 * {
 *   "from" : "youremail@domain.ext"
 * }
 */
function setDefaults(defaults){
    config.defaults = { ...config.defaults, defaults };
}

/**
 * Function to apply changes of credentials and defaults
 * 
 * Creates a new transporter for the message with the new configuration
 */
function flush(){

    // Create a new transporter
    transporter = nodemailer.createTransport(config.credentials, config.defaults);

    // Verify that the transporter was created successfully
    transporter.verify((error, success) => {
        if (error) {
            console.log("Mail service error");
            console.log(error);
        } else {
            console.log("Mail service successfully raised");
        }
    });

    // Flush templates names
    flushTemplates();
}

/**
 * Function to save HTML templates (makes use of handlebars)
 * 
 * @param {string} name The name with which te template will be saved.
 * @example "my_template_name"
 * 
 * If the name is already in use, the template will be updated.
 * 
 * Template names must have an alphanumeric + underscore encoding, the regex used is /^[a-zA-Z0-9_]+$/
 * 
 * @param {string} html The html (utf-8) template
 * 
 * The usage of this function is not mandatiry, it is just a confort util.
 */
function saveTemplate(name, html){
    
    if(!isValidFileName(name)){
        console.error("Error on saving template: File name isn't valid : " + name + "\n File name must match the regex : /^[a-zA-Z0-9_]+$/");
        return;
    }

    templates[name] = name;

    fs.writeFileSync(path.join(__dirname, 'templates', `${templates[name]}.html`), html, 'utf-8');
}

/**
 * Function to check if a name is valid for creating a file
 * @param {string} name The name of the file to be tried
 * @returns true if name is valid, false if isn't
 */
function isValidFileName(name){
    return /^[a-zA-Z0-9_]+$/.test(name);
}

/**
 * Function to save HTML templates (makes use of handlebars)
 * 
 * @param {string} name The name with which te template is saved.
 * @example "my_template_name"
 * 
 * All available template names are available at module_name.templates.*
 * 
 * The usage of this function is not completely obligatory, it is just a confort thing.
 */
function removeTemplate(name){
    delete templates[name];

    fs.unlink(path.join(__dirname, 'templates', `${templates[name]}.html`));
}

/**
 * Function to flush template names. 
 * 
 * (Only called once on module init, after that, new template names are updated directly)
 */
function flushTemplates(){
    fs.readdirSync(path.join(__dirname, 'templates'), (err, files) => {

        if (err) {
            console.error('Error flushing tempate names: ', err);
            return;
        }

        files.forEach((file) => {
            const template = path.basename(file, path.extname(file));

            templates[template] = template;
        });
    });
}

/**
 * Function to send a plain text basic email
 * 
 * @param {string} to The email of the user you want to send the message to.
 * @example "reciveroftheemail@domain.ext"
 * 
 * @param {string} subject The subject of the email.
 * @example "Very important subject"
 * 
 * @param {string} body The body of the email.
 * @example "An extensive explanation of the very importan subject"
 */
function send(to, subject, body){
    transporter.sendMail({
        to : to,
        subject : subject,
        text : body
    });
}

/** 
 * Function to send HTML based mails.
 * 
 * @param {string} to The email of the user you want to send the message to.
 * @example "reciveroftheemail@domain.ext"
 * 
 * @param {string} subject The subject of the email.
 * @example "Very important subject"
 * 
 * @param {string} htmlBody The HTML plain text to be embeded on the email body.
 * @example "<!DOCTYPE html><html> your content </html>"
 */
function sendHTML(to, subject, htmlBody){
    transporter.sendMail({
        to : to,
        subject : subject,
        html : htmlBody
    });
}

// Para enviar utilizando un template guardado
/**
 * Function to send HTML based mails using a template.
 * 
 * In order to use this function, you must save the HTML templates in the module, and call their names using module_name.templates.*
 * @see saveTemplate
 * @see removeTemplate
 * 
 * Template names are stored as variable names to reduce typoing.
 * 
 * @param {string} to The email of the user you want to send the message to.
 * @example "reciveroftheemail@domain.ext"
 * 
 * @param {string} subject The subject of the email.
 * @example "Very important subject"
 * 
 * @param {string} template The name of the template that you want to use for this email.
 * @example "my_template_name"
 * 
 * @param {object} data The data to be used to substitute the HTML template placeholders.
 *  
 * Please, reffer to handlebars documentation to understand how this placeholders work and how to embed data into them.
 * 
 * @example
 * {
 *   "placeholdername" : "data",
 *   "placeholdersection" : {
 *      "localplaceholder1" : "data1",
 *      "localplaceholder2" : "data2"
 *   },
 *   "placeholderlist" : [
 *      "data3", "data4", "data5"
 *   ]
 * }
 */
function sendTemplateHTML(to, subject, template, data){

    // Read the selected template
    fs.readFile(path.join(__dirname, 'templates', `${template}.html`), 'utf-8')
    .then((source) => {

        // Compile the template
        const template = handlebars.compile(source);

        // Send the HTML mail
        sendHTML(to, subject, template(data));
    });
}

module.exports = { 
    init,
    saveTemplate,
    removeTemplate,
}