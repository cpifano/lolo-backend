//--------------------------------------------------------------------------------------------------------------------//
// MODEL (MONGOOSE):
// User schema, model and validation rules definition.
//--------------------------------------------------------------------------------------------------------------------//
//Import modules:
const mongoose = require('mongoose');
const { body } = require('express-validator');
const loloBackend = require('lolo-backend');

//Define Pre-Schema (Only if a password field exists):
//For the rest of the cases use Schema directly.
const preSchema = new mongoose.Schema({
    username:       { type: String, required: true },
    password:       { type: String, required: true },
    first_name:     { type: String, required: true },
    family_name:    { type: String, required: true },
    email:          { type: String, required: true, match: /.+\@.+\..+/ },
    status:         { type: Boolean, default: false }
},
{ timestamps: true },
{ versionKey: false });

//Indicate that the schema has a password (to be encrypted):
Schema = loloBackend.crudMiddleware.isPassword(preSchema, 'password');

//Define model:
const Model = mongoose.model('users', Schema);
//--------------------------------------------------------------------------------------------------------------------//

//--------------------------------------------------------------------------------------------------------------------//
// VALIDATION RULES (EXPRESS-VALIDATOR):
// Validation rules and data normalization.
//--------------------------------------------------------------------------------------------------------------------//
const Validator = [
    body('username')
        .trim()
        .isLength(8)
        .withMessage('The username is too short (minimum lenght: 8 characters).')
        .toLowerCase(),

    body('password')
        .trim()
        .isLength(8)
        .withMessage('The password is too short (minimum lenght: 8 characters).'),

    body('first_name')
        .trim()
        .isLength(3)
        .withMessage('The first_name is too short (minimum lenght: 3 characters).')
        .toUpperCase(),

    body('family_name')
        .trim()
        .isLength(3)
        .withMessage('The family_name is too short (minimum lenght: 3 characters).')
        .toUpperCase(),

    body('email')
        .trim()
        .isEmail()
        .withMessage('The value entered is not a valid email.')
        .normalizeEmail({ gmail_remove_dots: false })
        .toLowerCase(),

    body('status')
        .trim()
        .isBoolean()
        .withMessage('The status entered is not a boolean (true or false).')
        .toBoolean()
];
//--------------------------------------------------------------------------------------------------------------------//

//--------------------------------------------------------------------------------------------------------------------//
//Export Shcema, Model and Validation Rules:
module.exports = { Schema, Model, Validator };
//--------------------------------------------------------------------------------------------------------------------//