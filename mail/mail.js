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


let credentials = JSON.parse(fs.readFileSync(path.join(__dirname, 'mail', 'credentials.json'),'utf-8'));
let defaults = JSON.parse(fs.readFileSync('./modules/mail/defaults.json', 'utf-8'));
let transporter;

/**
 * Function to start up module parameters
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
    setCredentials(config);

    // Set credentials
    setDefaults(credentials);

    // Return module functions
    return {
        setCredentials,
        setDefaults,
    }
}


module.exports = { init }

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