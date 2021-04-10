/*!
 * lolo-backend
 * Copyright(c) 2021 Camilo Pifano Herrera
 * MIT Licensed
 */
//--------------------------------------------------------------------------------------------------------------------//
// BACKEND WEB SERVER:
// This module creates the Backend server (WebServer).
//--------------------------------------------------------------------------------------------------------------------//
module.exports = function() { //Models is a REST parameter.
    //Import external modules:
    const express       = require('express');
    const http          = require('http');
    const https         = require('https');
    const cors          = require('cors');
    const jwt           = require('jsonwebtoken');
    const mongoose      = require('mongoose');
    const moment        = require('moment');
    const path          = require("path");
    const fs            = require('fs');

    //Import services module:
    const services      = require('./services');

    //Define console message separator:
    const consoleLn = "|---------------------------------------------------------------------------------------------------------------|";

    //Import file settings (YAML):
    const settings = services.getFileSettings();

    //Set language:
    const currentLang   = require('./supported_languages')(settings.language);

    //Import routes:
    const customRoutes  = require(path.resolve('./', settings.custom_routes_file));
    const crudRoutes    = require('./dynamic_crud');

    //Create express object (app webServer):
    const app = express();

    //Set whitelist (CORS):
    let whiteList = [
        "http://" + settings.webserver.host + ":" + settings.webserver.http_port,
        "https://" + settings.webserver.host + ":" + settings.webserver.https_port
    ];

    //Check settings cors whitelist (not empty):
    if(settings.cors_whitelist){
        whiteList = whiteList.concat(settings.cors_whitelist);
    }

    //Set CORS options:
    const corsOptionsDelegate = (req, callback) => {
        let corsOptions;
        if (whiteList.indexOf(req.header('Origin')) !== -1){
            corsOptions = { origin: true };     //Eeflect (enable) the requested origin in the CORS response.
        } else {
            corsOptions = { origin: false };    //Disable CORS for this request.
        }
        callback(null, corsOptions);            //Callback expects two parameters: error and options.
    }

    //Apply CORS options:
    app.use(cors(corsOptionsDelegate));

    //Configure express Middleware (ex bodyParser):
    app.use(express.json());                            //Parsing application/json
    app.use(express.urlencoded({ extended: true }));    //Parsing application/x-www-form-urlencoded
    
    //Parse credentials object to array (necessary for find method):
    const arrayCredentials = [];
    Object.entries(settings.jwt_credentials).forEach(([key, value]) => {
        arrayCredentials.push(value);
    });

    //Set JWT Login Path:
    app.post('/jwt-login', (req, res) => {
        //Get POST data:
        const { username, password } = req.body;

        //Filter credential from the credentials array by username and password:
        const currentCredential = arrayCredentials.find(credential => { return credential.username === username && credential.password === password });

        //Validate existence of result:
        if(currentCredential){
            //Crear payload:
            const payload = {
            sub: currentCredential.id,      //Identify the subject of the token.
            iat: (Date.now() / 1000),       //Token creation date.
            //exp: (Declared in expiresIn)  //Token expiration date.
            }

            jwt.sign(payload, settings.secret_token, {expiresIn: currentCredential.time_exp}, (err, token) => {
            if(err){
                res.status(500).send({ success: false, message: currentLang.jwt.sign_error,  error: err });
                return;
            }
            res.status(200).send({ success: true, message: currentLang.jwt.sign_success, token: token });
            });


        } else {
            res.json({ success: false, message: currentLang.jwt.user_pass_error });
        }
    });

    //Set MongoDB URI:
    const mongodbURI = 'mongodb://' + settings.db.host + ':' + settings.db.port + '/' + settings.db.name;

    //Establish connection with MongoDB:
    mongoose.connect(mongodbURI, {useNewUrlParser: true, useUnifiedTopology: true}, (err) => {
        if(err){
            console.error('| ' + currentLang.server.db_cnx_error + mongodbURI);
            console.log(consoleLn);
            throw err;
        } else {
            console.log('| ' + currentLang.server.db_cnx_success + mongodbURI);
            console.log(consoleLn);
        }
    });
    
    //Register paths of custom routes file:
    app.use('/', customRoutes);

    //Generate dynamic CRUD routes based on the specified models:
    Object.entries(settings.models).forEach(([key, value]) => {
        //Import current model:
        const currentModel = require(path.resolve('./', value));

        //Set URL path to current model:
        app.use('/' + key, crudRoutes(currentModel, currentLang));
    });

    //Start message:
    console.log(consoleLn);
    console.log('| ' + currentLang.server.start + ' | ' + moment().format('DD/MM/YYYY h:mm:ss'));
    console.log(consoleLn);

    //HTTP Enabled:
    if(settings.webserver.http_enabled === true){
        //Create HTTP server:
        const httpServer = http.createServer(app);

        //Start listening on our server:
        httpServer.listen(settings.webserver.http_port, () => {
            console.log('| http://' + settings.webserver.host + ':' + settings.webserver.http_port);
        });
    }

    //HTTPS Enabled:
    if(settings.webserver.https_enabled === true){
        const httpsOptions = {
            //Reference SSL certificates:
            key     : fs.readFileSync(path.resolve('./', settings.ssl_certificates.key)),
            cert    : fs.readFileSync(path.resolve('./', settings.ssl_certificates.cert)),
        };
        
        //If certificates is not self-signed:
        if(settings.ssl_certificates.ca){
            httpsOptions['ca'] = fs.readFileSync(path.resolve('./', settings.ssl_certificates.ca));
        }

        //Create HTTPS Server:
        https.createServer(httpsOptions, app).listen(settings.webserver.https_port, () => {
            console.log('| https://' + settings.webserver.host + ':' + settings.webserver.https_port);
        });
    }

    //HTTP and HTTPS Advice:
    if(settings.webserver.http_enabled === false && settings.webserver.https_enabled === false ){
        console.log('| ' + currentLang.server.non_server);
    }

    //Export WebServer:
    return app;
};
//--------------------------------------------------------------------------------------------------------------------//