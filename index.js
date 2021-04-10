/*!
 * lolo-backend
 * Copyright(c) 2021 Camilo Pifano Herrera
 * MIT Licensed
 */
//--------------------------------------------------------------------------------------------------------------------//
// MAIN APP:
//--------------------------------------------------------------------------------------------------------------------//
//Import modules:
const path              = require("path");
const fs                = require('fs');
const backend_server    = require('./lib/backend_server');
const crudMiddleware    = require('./lib/crud_middleware');

function runserver (){
    try {
        //If settings.yaml exist:
        if (fs.existsSync(path.resolve('./', 'settings.yaml'))){
            //Run backend web server:
            backend_server();
        }
    }
    catch(err){
        console.log('The settings.yaml file does NOT exist.');
        console.log('This file is necessary to run Lolo Backend.');
        console.error(err);
    }
}

//Export lolo-backend module:
module.exports = { runserver, crudMiddleware };
//--------------------------------------------------------------------------------------------------------------------//