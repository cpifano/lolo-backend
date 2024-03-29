//--------------------------------------------------------------------------------------------------------------------//
// CUSTOM ROUTES:
// In this file declare your custom routes manually.
//--------------------------------------------------------------------------------------------------------------------//
const express           = require('express');                   //Import external modules (express).
const loloBackend       = require('lolo-backend');

//Create Router.
const router = express.Router();
//--------------------------------------------------------------------------------------------------------------------//

const welcomeMessage = {
    success:        true,
    message:        "Welcome to Lolo Backend REST Framework",
    description:    "Lolo Backend REST Framework provides an automatic asynchronous CRUD Backend Server generator based on your models' definitions and validation rules.",
    version:        "2.2.1",
    info:           "This version work with NodeJS and MongoDB."
}

//--------------------------------------------------------------------------------------------------------------------//
// DEFINE YOUR CUSTOM ROUTES HERE:
//--------------------------------------------------------------------------------------------------------------------//
//Public routes:
router.get('/', (req, res) => {
    res.json(welcomeMessage);
});

//Private routes:
router.get('/private', loloBackend.crudMiddleware.checkJWT, (req, res) => {
    res.json(welcomeMessage);
});
//--------------------------------------------------------------------------------------------------------------------//

//--------------------------------------------------------------------------------------------------------------------//
// Export custom routes:
module.exports = router;
//--------------------------------------------------------------------------------------------------------------------//