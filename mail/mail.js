/**
 * Easy Maria DB (ezmdb) - v.1.0
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
 * Functions saveTemplate and removeTemplate are not instance related functions, they are treated as "static like" functions thus only being able to be called by the default require('mail') consturctor.
 * 
 * This should be useful for cluster architectures (to save the templates before forking workers, thus preventing multiple writing to the templates files)
 *
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
 * 
 * If the name is already in use, the template will be updated.
 * 
 * @param {string} html The html (utf-8) template
 * 
 * The usage of this funciton is not completely obligatory, it is just a confort thing.
 */
function saveTemplate(name, html){
    templates[name] = name;

    fs.writeFileSync(path.join(__dirname, 'templates', `${templates[name]}.html`), html, 'utf-8');
}

/**
 * Function to save HTML templates (makes use of handlebars)
 * 
 * @param {string} name The name with which te template is saved.
 * 
 * All available template names are available at module_name.templates.*
 * 
 * The usage of this funciton is not completely obligatory, it is just a confort thing.
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

/** Function to send HTML based mails.
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
 * 
 * @param {string} to 
 * @param {string} subject 
 * @param {string} template 
 * @param {object} data 
 */
function sendHTML(to, subject, template, data){

    // Read the selected template
    fs.readFile(`./modules/mail/templates/${template}.html`, 'utf-8')
    .then((source) => {

        // Compile the template
        const template = handlebars.compile(source);

        // Send the mail
        transporter.sendMail({
            to : to,
            subject : subject,
            html : template(data)
        });
    });
}



module.exports = { 
    init,
    saveTemplate,
    removeTemplate,
 }

/*
const credentials = JSON.parse(fs.readFileSync(path.join(__dirname, 'mail', 'credentials.json'),'utf-8'));
const defaults = JSON.parse(fs.readFileSync('./modules/mail/defaults.json', 'utf-8'));
const transporter = nodemailer.createTransport(credentials, defaults);
transporter.verify(function (error, success) {
    if (error) {
        console.log("Mail service error");
        console.log(error);
    } else {
        console.log("Mail service successfully raised");
    }
});

function send(to, subject, text){
    transporter.sendMail({
        to : to,
        subject : subject,
        text : text
    });
}

function sendHTML(to, subject, resource, data){
    const source = fs.readFileSync(`./modules/mail/templates/${resource}.html`, 'utf-8');
    const template = handlebars.compile(source);

    transporter.sendMail({
        to : to,
        subject : subject,
        html : template(data)
    });
}

module.exports = {
    send,
    sendHTML
}
*/