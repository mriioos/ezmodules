// Módulo que maneja el método GET

// IDEAS
//  Podría hacer que ubiese un fichero json que almacena los nombres de los archivos, sus archivos de traducción y sus permisos (Si es público o privado) + otros metadatos

// Framework
const fs = require('fs');
const handlebars = require('handlebars');
const { v4 : uuidv4 } = require('uuid')

const db = require('../db/db.js');
const security = require('../security/security.js');
const util = require('../util/util.js');

// Configuración
const config = JSON.parse(fs.readFileSync('config.json', 'utf-8')); //Buscar una mejor forma de hacerlo

const spanishLangCodes = ['es', 'es-ES', 'es-MX', 'es-AR', 'es-CO', 'es-CL', 'es-PE', 'es-VE', 'es-EC', 'es-GT', 'es-CU', 'es-DO', 'es-HN', 'es-PY', 'es-SV', 'es-NI', 'es-CR', 'es-PA', 'es-PR', 'es-US'];

// Funciones
// Función para solicitar el índice de la página
// This is an example
function index(req, res){
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.statusCode = 200;

    const source = fs.readFileSync(`${config.dir.public}/${config.dir.index}.html`, 'utf-8');
    let data =  JSON.parse(fs.readFileSync(`${config.dir.public}/${config.dir.index}-data.json`, 'utf-8'));

    const template = handlebars.compile(source);

    let lang;
    //if(req.acceptsLanguages(spanishLangCodes) !== false){
        lang = config.lang.es;
    //}
    //else{
    //    lang = config.lang.en;
    //}

    let file;
    try{
        data[lang].global.domain = config.domain;
        file = template(data[lang]);
    }
    catch(err){
        file = publicFile("html", config.dir.error, "html", lang, undefined);
        res.statusCode = 404;
    }
    
    res.write(file);
    res.end();
}

// Función para solicitar un fichero
function file(req, res){
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.statusCode = 200;

    // Control de seguridad
    if(req.query.t || req.query.n){
        if(req.query.t.includes('..') || req.query.n.includes('..') || req.query.t.includes('%2e%2e') || req.query.n.includes('%2e%2e')){
            res.write("Error 401: Ilegal operation on file system");
            res.end();
            return;
        }
    }
    
    let type;
    if(req.query.t === undefined){ // t = type (tipo de archivo)
        type = "html";
    }
    else{
        type = req.query.t;
    }

    let name;
    if(req.query.n === undefined){ 
        name = req.url.split('/')[1].split('?')[0];
    }
    else{
        name = req.query.n; // n = name (nombre del archivo)
    }

    let ext;
    if(type === "html" || type === "css" || type === "js"){
        ext = type;
    }
    else{
        ext = name.split('.')[name.split('.').length - 1];
        name = name.substring(0, name.length - ext.length - 1);
    }

    let lang;
    //if(req.acceptsLanguages(spanishLangCodes) !== false){
        lang = config.lang.es;
    //}
    //else{
    //    lang = config.lang.en;
    //}

    let file;
    try{
        file = publicFile(type, name, ext, lang, undefined);
    }
    catch(err){
        console.log(err);
        file = publicFile("html", config.dir.error, "html", lang, undefined);
        res.statusCode = 404;
    }

    res.write(file);
    res.end();
}

// Función para solicitar un fichero público
function publicFile(type, name, ext, lang, content){
    let source;
    if(type.split('/')[0].includes('multimedia')){
        source = fs.readFileSync(`${config.dir.public}/resources/${type}/${name}.${ext}`); // No lleva utf-8 porque si no, no funciona para los archivos de imagen
    }
    else{
        source = fs.readFileSync(`${config.dir.public}/resources/${type}/${name}.${ext}`, 'utf-8');
    }
    
    if(type !== "html") return source;

    //Si el tipo es HTML
    const template = handlebars.compile(source);

    let data;
    if(content === undefined){
        data = JSON.parse(fs.readFileSync(`${config.dir.public}/resources/${type}/${name}-data.json`, 'utf-8'));
        data[lang].global.domain = config.domain;
    }
    else{
        data = content;
    }
    
    return template(data[lang]);
}

module.exports = {
    index,
    menu,
    ordered,
    loginPage,
    logout,
    user,
    places,
    menusList,
    plansList,
    tableqr,
    file
}