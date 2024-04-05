// Módulo que maneja el método POST

// Framework
const fs = require('fs');
const handlebars = require('handlebars');
const crypto = require('crypto');

const db = require('../db/db.js');
const security = require('../security/security.js');
const util = require('../util/util.js');
const mail = require('../mail/mail.js');

// Configuración
const config = JSON.parse(fs.readFileSync('config.json', 'utf-8')); //Buscar una mejor forma de hacerlo

const spanishLangCodes = ['es', 'es-ES', 'es-MX', 'es-AR', 'es-CO', 'es-CL', 'es-PE', 'es-VE', 'es-EC', 'es-GT', 'es-CU', 'es-DO', 'es-HN', 'es-PY', 'es-SV', 'es-NI', 'es-CR', 'es-PA', 'es-PR', 'es-US'];

// Funciones
// Función para pedir un plato
// This is an example
function order(req, res){
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.statusCode = 200;

    db.post('order', req.body) //Ej de req.body = {"place":"0","table":"2","order":[{"amount":"1","id":"1","price":"650","extras":[["1"],["1"],["0","1"],["Que no haya mayonesa porfi que soy alérgico"]]}]} 
    .then((data) => {
        res.send({ status : "200" });
    })
    .catch((err) => {
        res.statusCode = 500;
        db.post('error', {
            code : 500,
            subject : 'post order',
            details : err
        });
        res.send({ status : "500" });
    })
    .finally(() => {
        res.end();
    });
}

module.exports = {
    order
}