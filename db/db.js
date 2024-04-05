// PONER UN COMANDO setConfig para poder poner la configuración desde el main.js sin tener que acceder al módulo, este comando reescribiría el fichero config.js y permitiría poder cambiar la configuración en runtime. También podría hacer que se puedan añadir configuraciones, en lugar de solo actualizar todas
const mariadb = require('mariadb');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8'));
let pool = mariadb.createPool(config.credentials);

function get(resource, data){
    const date = timeStamp();

    let rawSql;
    let params = [];
    switch(resource){
        case 'menu':
            // Devuelve el menú según su id
            rawSql = handlebars.compile(fs.readFileSync('./modules/db/sql-get/menu.sql', 'utf-8'))(data).replace(/--.*?\n/g, ' ').replace(/\/\*.*?\*\//g, '').replace(/\s+/g, ' ');
            params = [data.place];
        break;
        case 'order':
            // Devuelve la orden que hay asociada a una mesa (dado el lugar y el número de mesa)
            rawSql = handlebars.compile(fs.readFileSync('./modules/db/sql-get/order.sql', 'utf-8'))(data).replace(/--.*?\n/g, ' ').replace(/\/\*.*?\*\//g, '').replace(/\s+/g, ' ');
            params = [data.place, data.table];
        break;
        case 'user-by-cookie':
            // Devuelve la información de un usuario en función de la cookie
            rawSql = handlebars.compile(fs.readFileSync('./modules/db/sql-get/user-by-cookie.sql', 'utf-8'))(data).replace(/--.*?\n/g, ' ').replace(/\/\*.*?\*\//g, '').replace(/\s+/g, ' ');
            params = [data.cookie];
        break;
        case 'user-by-email':
            // Devuelve la información de un usuario en función de su email
            rawSql = handlebars.compile(fs.readFileSync('./modules/db/sql-get/user-by-email.sql', 'utf-8'))(data).replace(/--.*?\n/g, ' ').replace(/\/\*.*?\*\//g, '').replace(/\s+/g, ' ');
            params = [data.email];
        break;
        case 'places':
            // Devuelve los lugares asociados a un usuario
            rawSql = handlebars.compile(fs.readFileSync('./modules/db/sql-get/places.sql', 'utf-8'))(data).replace(/--.*?\n/g, ' ').replace(/\/\*.*?\*\//g, '').replace(/\s+/g, ' ');
            params = [data.id, data.cookie];
        break;
        case 'menus-list':
            // Devuelve los ids y nombres de los menús asociados a un lugar
            rawSql = handlebars.compile(fs.readFileSync('./modules/db/sql-get/menus-list.sql', 'utf-8'))(data).replace(/--.*?\n/g, ' ').replace(/\/\*.*?\*\//g, '').replace(/\s+/g, ' ');
            params = [data.placeId];
        break;
        case 'user-by-id':
            // Devuelve los datos de un usuario en función de su id
            rawSql = handlebars.compile(fs.readFileSync('./modules/db/sql-get/user-by-id.sql', 'utf-8'))(data).replace(/--.*?\n/g, ' ').replace(/\/\*.*?\*\//g, '').replace(/\s+/g, ' ');
            params = [data.id];
        break;
        case 'user-confirmation':
            // Devuelve el código de confirmación enviado a un usuario por correo
            rawSql = handlebars.compile(fs.readFileSync('./modules/db/sql-get/user-confirmation-code.sql', 'utf-8'))(data).replace(/--.*?\n/g, ' ').replace(/\/\*.*?\*\//g, '').replace(/\s+/g, ' ');
            params = [data.code];
        break;
        case 'full-place':
            // Devuelve los datos al completo, ordenados en JSON de un lugar (restaurante)
            rawSql = handlebars.compile(fs.readFileSync('./modules/db/sql-get/full-place.sql', 'utf-8'))(data).replace(/--.*?\n/g, ' ').replace(/\/\*.*?\*\//g, '').replace(/\s+/g, ' ');
            params = [data.id];
        break;
        default:
            throw Error('404 - Resource not found - get');
    }

    return query(rawSql, params);
}

function post(resource, data){
    const date = timeStamp();

    let rawSql;
    let params = [];
    switch(resource){
        case 'order':
            // Sube una orden echa por una mesa
            rawSql = handlebars.compile(fs.readFileSync('./modules/db/sql-post/order.sql', 'utf-8'))(data).replace(/--.*?\n/g, ' ').replace(/\/\*.*?\*\//g, '').replace(/\s+/g, ' '); // Prepara la query para que quepa toda la dara
            data.order.forEach((plate) => params = params.concat([parseInt(data.place), parseInt(data.table), parseInt(plate.id), parseInt(plate.amount), JSON.stringify(plate.extras), parseInt(data.place), parseInt(data.table)]));
        break;
        case 'user':
            // Sube la petición de cear un usuario
            //rawSql = handlebars.compile(fs.readFileSync('./modules/db/sql-post/order.sql', 'utf-8'))(data).replace(/--.*?\n/g, ' ').replace(/\/\*.*?\*\//g, '').replace(/\s+/g, ' ');
            //params = [data.email, ]
        break;
        case 'confirm-user':
            // Confirma un nuevo usuario
            rawSql = handlebars.compile(fs.readFileSync('./modules/db/sql-post/user.sql', 'utf-8'))(data).replace(/--.*?\n/g, ' ').replace(/\/\*.*?\*\//g, '').replace(/\s+/g, ' ');
            params = [data.code];
        break;
        case 'message':
            // Sube una reclamación creada por un usuario desde /contact
            rawSql = handlebars.compile(fs.readFileSync('./modules/db/sql-post/message.sql', 'utf-8'))(data).replace(/--.*?\n/g, ' ').replace(/\/\*.*?\*\//g, '').replace(/\s+/g, ' ');
            params = [data.email, data.subject, data.message];
        break;
        case 'login':
            // Crea una sesión para un usuario
            rawSql = handlebars.compile(fs.readFileSync('./modules/db/sql-post/login.sql', 'utf-8'))(data).replace(/--.*?\n/g, ' ').replace(/\/\*.*?\*\//g, '').replace(/\s+/g, ' ');
            params = [data.cookie, data.date, data.id];
        break;
        case 'place':
            // Sube un nuevo lugar asociado a un usuario
            rawSql = handlebars.compile(fs.readFileSync('./modules/db/sql-post/place.sql', 'utf-8'))(data).replace(/--.*?\n/g, ' ').replace(/\/\*.*?\*\//g, '').replace(/\s+/g, ' ');
            params = [data.name, data.location, data.uid];
        break;
        case 'menu':
            // Sube un nuevo menú asociado a un lugar
            rawSql = handlebars.compile(fs.readFileSync('./modules/db/sql-post/menu.sql', 'utf-8'))(data).replace(/--.*?\n/g, ' ').replace(/\/\*.*?\*\//g, '').replace(/\s+/g, ' ');
            params = [data.name, data.placeId, data.background];
        break;
        case 'part': 
            // Sube una nueva parte asociada a un menú
            rawSql = handlebars.compile(fs.readFileSync('./modules/db/sql-post/part.sql', 'utf-8'))(data).replace(/--.*?\n/g, ' ').replace(/\/\*.*?\*\//g, '').replace(/\s+/g, ' ');
            params = [data.name, data.menuId];
        break;
        case 'plate':
            // Sube un nuevo plato asociado a una parte
            rawSql = handlebars.compile(fs.readFileSync('./modules/db/sql-post/plate.sql', 'utf-8'))(data).replace(/--.*?\n/g, ' ').replace(/\/\*.*?\*\//g, '').replace(/\s+/g, ' ');
            params = [data.name, data.description, data.price, data.partId, data.extras];
        break;
        case 'table':
            // Crea una nueva mesa asociada a un lugar
            rawSql = handlebars.compile(fs.readFileSync('./modules/db/sql-post/table.sql', 'utf-8'))(data).replace(/--.*?\n/g, ' ').replace(/\/\*.*?\*\//g, '').replace(/\s+/g, ' ');
            params = [data.number, data.placeId];
        break;
        case 'remove-place':
            // Elimina un lugar (Solo indica que está eliminado pero la info sigue almacenada)
            rawSql = handlebars.compile(fs.readFileSync('./modules/db/sql-post/remove-place.sql', 'utf-8'))(data).replace(/--.*?\n/g, ' ').replace(/\/\*.*?\*\//g, '').replace(/\s+/g, ' ');
            params = [data.placeId, data.uid];
        break;
        case 'edit-place':
            // Edita un lugar
            rawSql = handlebars.compile(fs.readFileSync('./modules/db/sql-post/edit-place.sql', 'utf-8'))(data).replace(/--.*?\n/g, ' ').replace(/\/\*.*?\*\//g, '').replace(/\s+/g, ' ');
            params = [data.new.name, data.new.location, data.new.menuId, data.uid, data.place];
        break;
        case 'img-place':
            // Edita la imagen de un lugar
            rawSql = handlebars.compile(fs.readFileSync('./modules/db/sql-post/img-place.sql', 'utf-8'))(data).replace(/--.*?\n/g, ' ').replace(/\/\*.*?\*\//g, '').replace(/\s+/g, ' ');
            params = [data.img, data.uid, data.place];
        break;
        case 'error':
            // Sube un error a la tabla de errores
            rawSql = handlebars.compile(fs.readFileSync('./modules/db/sql-post/error.sql', 'utf-8'))(data).replace(/--.*?\n/g, ' ').replace(/\/\*.*?\*\//g, '').replace(/\s+/g, ' ');
            params = [data.code, data.subject, data.details];
        break;
        default:
            throw Error('404 - Resource not found - post');
    }

    return query(rawSql, params);
}

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

function timeStamp(){
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function sql(method, name){
    let sql;
    switch(method){
        case config.methods.get:
            sql = fs.readFileSync(`./modules/db/sql-get/${name}.sql`, 'utf-8');
        break;
        case config.methods.post:
            sql = fs.readFileSync(`./modules/db/sql-post/${name}.sql`, 'utf-8');
        break;
        case config.methods.multiple:
            sql = fs.readFileSync(`./modules/db/sql-mult/${name}.sql`, 'utf-8');
        break;
        default:
            throw Error('400 - Wrong method');
    }

    if(sql === undefined) throw Error('404 - File not found');

    return sql;
}

module.exports = {
    get,
    post
}