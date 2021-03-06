/*!
 * lolo-backend
 * Copyright(c) 2021 Camilo Pifano Herrera
 * MIT Licensed
 */
//--------------------------------------------------------------------------------------------------------------------//
// LANGUAGE MODULE:
// This module establishing the response messages for each language.
//--------------------------------------------------------------------------------------------------------------------//
module.exports = function(language){
    //Set font color to welcome console messaging 'Lolo Backend':
    const textColor     = '\x1b[35m';
    const resetColor    = '\x1b[0m';

    //Initialize translate object (English - Default):
    const lang = {
        'server': {
            'db_cnx_error':         'Failed to establish connection with MongoDB to: ',
            'db_cnx_success':       'Established connection with MongoDB to: ',
            'start':                textColor + 'Lolo Backend' + resetColor + ' has started',
            'non_server':           'The server type was not specified in the settings file (http_enabled, https_enabled). '
        },
        'db': {
            'empty_id':             'ID field cannot be empty.',
            'invalid_id':           'The specified ID is NOT valid for MongoDB.',
            'query_error':          'Error during query to MongoDB.',
            'query_no_data':        'No records was found.',
            'validate_error':       'Validation error.',
            'insert_success':       'Insert operation successful.',
            'insert_error':         'An error occurred while inserting the element.',
            'id_no_results':        'The specified ID does not exist.',
            'update_error':         'An error occurred while updating the element.',
            'delete_error':         'An error occurred while deleting the element.',
            'delete_success':       'Successfully deleted.',
            'delete_id_no_results': 'No record was found to delete with the specified ID.',
            'password_match':       'Passwords match.',
            'password_dont_match':  'Passwords dont match.',
            'password_empty':       'Password field cannot be empty.',
        },
        'jwt': {
            'sign_error':           'An error occurred during the JWT generation.',
            'sign_success':         'Successful authentication.',
            'user_pass_error':      'User and/or password are incorrect.',
            'check_empty_token':    'The authentication token is required.',
            'check_invalid_token':  'Invalid token.'
        }

    };

    //Set translations according to the requested language: 
    switch (language) {
        case 'ES':
            lang.server.db_cnx_error =      'Error al intentar establecer la conexi??n con MongoDB hacia: ';
            lang.server.db_cnx_success =    'Conexi??n satisfactoria con MongoDB hacia: ';
            lang.server.start =             textColor + 'Lolo Backend' + resetColor + ' ha iniciado';
            lang.server.non_server =        'No se estableci?? ning??n tipo de servidor en el archivo de configuraci??n (http_enabled, https_enabled).';

            lang.db.empty_id =              'El campo ID no puede ser vac??o.';
            lang.db.invalid_id =            'El ID especificado NO es v??lido para MongoDB.';
            lang.db.query_error =           'Error durante la consulta al servidor MongoDB.';
            lang.db.query_no_data =         'No se encontraron registros.';
            lang.db.validate_error =        'Error de validaci??n.';
            lang.db.insert_success =        'Guardado exitoso.';
            lang.db.insert_error =          'Error al intentar insertar el elemento.';
            lang.db.id_no_results =         'No existe ning??n elemento con el ID especificado';
            lang.db.update_error =          'Error al intentar actualizar el elemento.';
            lang.db.delete_error =          'Error al intentar eliminar el elemento.';
            lang.db.delete_success =        'Eliminaci??n exitosa.';
            lang.db.delete_id_no_results =  'No se encuentra ning??n registro para eliminar con el ID especificado.';
            lang.db.password_match =        'Contrase??a correcta.';
            lang.db.password_dont_match =   'La contrase??a NO coincide.';
            lang.db.password_empty =        'La contrase??a NO puede ser vac??a.';

            lang.jwt.sign_error =           'Ha ocurrido un error durante la generaci??n del JWT.';
            lang.jwt.sign_success =         'Autenticaci??n exitosa.';
            lang.jwt.user_pass_error =      'Usuario y/o password son incorrectos.';
            lang.jwt.check_empty_token =    'Es necesario un token de autenticaci??n.';
            lang.jwt.check_invalid_token =  'El token no es v??lido.';
            break;
    }

    //Return translate object:
    return lang;
}
//--------------------------------------------------------------------------------------------------------------------//