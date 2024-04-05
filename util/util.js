// Función que sirve para convertir céntimos a euros
function centToEur(cents){
    cents = cents.toString();
    cents = cents.split('');
    cents.splice(cents.length - 2, 0, '.');
    return cents.join('');
}

// Función que sirve para chequear que un email es válido
function isValidEmail(email){
    return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
}

module.exports = {
    centToEur : centToEur,
    isValidEmail : isValidEmail
}