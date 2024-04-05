const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const nodemailer = require('nodemailer');

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