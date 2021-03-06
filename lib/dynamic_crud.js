/*!
 * lolo-backend
 * Copyright(c) 2021 Camilo Pifano Herrera
 * MIT Licensed
 */
//--------------------------------------------------------------------------------------------------------------------//
// DYNAMIC CRUD:
// Generate dynamic CRUD routes (most common routes), based on the specified models.
//--------------------------------------------------------------------------------------------------------------------//
module.exports = function(current, currentLang, verboseMode) {
    const express               = require('express');                   //Express module.
    const { validationResult }  = require('express-validator');         //Express-validator Middleware.
    const bcrypt                = require('bcrypt');                    //bcrypt module.
    const services              = require('./services');                //Services module.
    const crudMiddleware        = require('./crud_middleware');         //CRUD Middleware.

    //Create a Router:
    const router = express.Router();

    //Get keys from current schema:
    const allSchemaKeys     = services.getSchemaKeys(current);          //All.
    const allowedSchemaKeys = services.getSchemaKeys(current, true);    //No parameters that cannot be modified.

    //----------------------------------------------------------------------------------------------------------------//
    // GET - DESCRIBE:
    // Returns all the keys of the model indicated in the creation of the route.
    //----------------------------------------------------------------------------------------------------------------//
    router.get('/describe', crudMiddleware.checkJWT, (req, res) => {
        //Send console log message:
        if(verboseMode === true) { services.sendConsoleMessage(req); }

        //Return All Schema Keys (HTML Response):
        res.status(200).send({ success: true, keys: allSchemaKeys });
    });
    //----------------------------------------------------------------------------------------------------------------//

    //----------------------------------------------------------------------------------------------------------------//
    // GET - COUNT:
    // Returns number of records in the collection that match the filters.
    //----------------------------------------------------------------------------------------------------------------//
    router.get('/count', crudMiddleware.checkJWT, async (req, res) => {
        //Send console log message:
        if(verboseMode === true) { services.sendConsoleMessage(req); }

        //Count using query params:
        await current.Model.countDocuments(req.query.filter, (err, count) => {
            if (err) {
                //Send error message to console:
                console.error({ success: false, error: err.message });
                res.status(500).send({ success: false, error: err.message });
            }

            //Return the result (HTML Response):
            res.status(200).send({ success: true, count: count });
        });
    });
    //----------------------------------------------------------------------------------------------------------------//

    //----------------------------------------------------------------------------------------------------------------//
    // GET - FIND:
    // Finds all the records in the collection that match the filters, the projection and the requested sort.
    //----------------------------------------------------------------------------------------------------------------//
    router.get('/find', crudMiddleware.checkJWT, async (req, res) => {
        //Send console log message:
        if(verboseMode === true) { services.sendConsoleMessage(req); }

        //Get query params:
        let { filter, proj, skip, limit, sort, pager } = req.query;

        //Parse skip and limit value (string) to integer (base 10):
        skip = parseInt(skip, 10);
        limit = parseInt(limit, 10);

        //Validate and format data projection:
        let formatted_proj = services.validateFormattedProj(proj);

        //Check if Pager was requested:
        if(pager){
            //Parse page_number and page_limit value (string) to integer (base 10):
            pager.page_number = parseInt(pager.page_number, 10);
            pager.page_limit = parseInt(pager.page_limit, 10);

            //If dosn't exist, set page number:
            if(!pager.page_number){
                pager.page_number = 1;
            }

            //Set page limit and and replace limit param:
            if(pager.page_limit){
                limit = pager.page_limit;
            } else {
                //Set default page limit value:
                limit = 10;
            }

            //Calculate and replace skip value (Paginate):
            skip = (pager.page_number-1)*limit;
        }

        //Build find query:
        const queryMongoDB = current.Model.find(filter, formatted_proj).skip(skip).limit(limit).sort(sort);

        //Count using query params:
        await current.Model.countDocuments(req.query.filter, async(err, count) => {
            if (err) {
                //Send error message to console:
                console.error({ success: false, error: err.message });
                res.status(500).send({ success: false, error: err.message });
            }

            //Execute find query:
            await queryMongoDB.exec((err, data) => {
                //Validate errors in the query:
                if(err){
                    //Set error message:
                    errorMessage = { success: false, message: currentLang.db.query_error, error: err.message };

                    //Send error message to console:
                    console.error(errorMessage);

                    //Return error message (HTML Response):
                    res.status(500).send(errorMessage);
                } else if(data){
                    //Validate and set paginator:
                    let pager_data;
                    if(pager){
                        pager_data = {
                            total_items: count,
                            items_per_page: limit,
                            viewed_items: data.length,
                            number_of_pages: Math.ceil(count / limit),
                            actual_page: pager.page_number
                        };
                    } else {
                        pager_data = 'Pager is disabled';
                    }

                    //Return result (HTML Response):
                    res.status(200).send({
                        success: true,
                        data: data,
                        pager: pager_data,
                    });
                } else {
                    //Return result NO data (HTML Response):
                    res.status(200).send({ success: true, message: currentLang.db.query_no_data, data: {} });
                }
            });
        });

    });
    //----------------------------------------------------------------------------------------------------------------//

    //----------------------------------------------------------------------------------------------------------------//
    // GET - FIND BY ID:
    // Find an element based on an ID.
    //----------------------------------------------------------------------------------------------------------------//
    router.get('/findById', crudMiddleware.checkJWT, async (req, res) => {
        //Send console log message:
        if(verboseMode === true) { services.sendConsoleMessage(req); }

        //Validate ID request:
        if(!services.validateRequestID(req, res, currentLang)) return;

        //Get query params:
        let { id, proj } = req.query;

        //Validate and format data projection:
        let formatted_proj = services.validateFormattedProj(proj);

        //Build query:
        const queryMongoDB = current.Model.findById(id, formatted_proj);

        //Execute query:
        await queryMongoDB.exec((err, data) => {
            //Evaluate query result:
            const result = services.commonResponse(err, data, currentLang);

            //Return the result (HTML Response):
            if (result.success === true) {
                res.status(200).send(result);
            } else {
                res.status(500).send(result);
            }
        });
    });
    //----------------------------------------------------------------------------------------------------------------//

    //----------------------------------------------------------------------------------------------------------------//
    // GET - FIND ONE:
    // Find for a single item (first occurrence), in the collection that match the filters, the projection and the
    // requested sort.
    //----------------------------------------------------------------------------------------------------------------//
    router.get('/findOne', crudMiddleware.checkJWT, async (req, res) => {
        //Send console log message:
        if(verboseMode === true) { services.sendConsoleMessage(req); }

        //Get query params:
        let { filter, proj, sort } = req.query;

        //Validate and format data projection:
        let formatted_proj = services.validateFormattedProj(proj);

        //Build query:
        const queryMongoDB = current.Model.findOne(filter, formatted_proj).sort(sort);

        //Execute query:
        await queryMongoDB.exec((err, data) => {
            //Evaluate query result:
            const result = services.commonResponse(err, data, currentLang);

            //Return the result (HTML Response):
            if (result.success === true) {
                res.status(200).send(result);
            } else {
                res.status(500).send(result);
            }
        });
    });
    //----------------------------------------------------------------------------------------------------------------//

    //----------------------------------------------------------------------------------------------------------------//
    // POST - INSERT:
    // Creates a new record in the database.
    //----------------------------------------------------------------------------------------------------------------//
    router.post('/insert', crudMiddleware.checkJWT, current.Validator, async (req, res) => {
        //Send console log message:
        if(verboseMode === true) { services.sendConsoleMessage(req); }

        //Get validation result:
        const errors = validationResult(req);

        //Check validation result (express-validator):
        if(!errors.isEmpty()){
            //Initialize container array of validation messages:
            let validate_messages = [];

            //Walk through validation errors and load them into the message array:
            errors.array().forEach(element => {
                validate_messages.push(element.msg);
            });

            //Return the result (HTML Response):
            res.status(422).send({ success: false, message: currentLang.db.validate_error, validate_errors: validate_messages });
        } else {
            //Create Mongoose object to insert validated data from POST:
            const objData = new current.Model(req.body);

            //Save to MongoDB:
            const result = await objData.save(objData)
                .then(data => {
                    return { success: true, message: currentLang.db.insert_success, data: data };
                })
                .catch(err => {
                    //Send error message to console:
                    console.error({ success: false, message: currentLang.db.insert_error, error: err.message });

                    return { success: false, message: currentLang.db.insert_error, error: err.message };
            });

            //Return the result (HTML Response):
            if (result.success === true) {
                res.status(200).send(result);
            } else {
                res.status(500).send(result);
            }
        }
    });
    //----------------------------------------------------------------------------------------------------------------//

    //----------------------------------------------------------------------------------------------------------------//
    // POST - UPDATE:
    // Validate against the current model and if positive, updates an existing record in the database according to the
    // ID and specified parameters.
    //----------------------------------------------------------------------------------------------------------------//
    router.post('/update', crudMiddleware.checkJWT, crudMiddleware.allowedValidate(allowedSchemaKeys), current.Validator, async (req, res) => {
        //Send console log message:
        if(verboseMode === true) { services.sendConsoleMessage(req); }

        //Validate ID request:
        if(!services.validateRequestID(req, res, currentLang)) return;

        //Get validation result (global: all elements):
        const errors = validationResult(req);

        //Initialize container array of validation messages:
        let validate_messages = [];

        //Check validation result (express-validator):
        if(!errors.isEmpty()){
            //Get keys of the elements allowed to set:
            const setKeys = Object.keys(req.validatedResult.set)

            //Check if the elements to be set contain errors:
            errors.array().forEach(element => {
                if(setKeys.includes(element.param)){
                    validate_messages.push(element.msg);
                }
            });
        }

        //Check only the validation of the fields allowed to set:
        if(Object.keys(validate_messages).length === 0){
            //Initialize result variable (HTML Response):
            let result;

            //Save to MongoDB:
            //{new:true} - If success, return the modified document instead of the original, before modification.
            result = await current.Model.findOneAndUpdate({_id: req.body.id },{$set: req.validatedResult.set }, {new:true})
            .then((data)=>{
                if(data) {
                    return { success: true, data: data, blocked_attributes: req.validatedResult.blocked };
                } else {
                    return { success: true, message: currentLang.db.id_no_results };
                }
            })
            .catch((err)=>{
                //Send error message to console:
                console.error({ success: false, message: currentLang.db.update_error, error: err.message });

                //Return error message (HTML Response):
                return { success: false, message: currentLang.db.update_error, error: err.message };
            });

            //Return the result (HTML Response):
            if (result.success === true && result.data) {
                res.status(200).send(result);
            } else if (result.success === true){
                res.status(404).send(result);
            } else {
                res.status(500).send(result);
            }

        } else {
            //Return the result (HTML Response):
            res.status(422).send({ success: false, message: currentLang.db.validate_error, validate_errors: validate_messages });
        }
    });
    //----------------------------------------------------------------------------------------------------------------//

    //----------------------------------------------------------------------------------------------------------------//
    // POST - DELETE:
    // Delete an item from the database based on an ID.
    //----------------------------------------------------------------------------------------------------------------//
    router.post('/delete', crudMiddleware.checkJWT, async (req, res) => {
        //Send console log message:
        if(verboseMode === true) { services.sendConsoleMessage(req); }

        //Validate ID request:
        if(!services.validateRequestID(req, res, currentLang)) return;

        //Build query:
        const queryMongoDB = current.Model.findOneAndDelete({ _id: req.body.id });

        //Execute query:
        await queryMongoDB.exec((err, data) => {
            if(err){
                //Send error message to console:
                console.error({ success: false, message: currentLang.db.delete_error, error: err.message });

                //Return error message (HTML Response):
                res.status(500).send({ success: false, message: currentLang.db.delete_error, error: err.message });
            } else if(data) {
                //Return the result (HTML Response):
                res.status(200).send({ success: true, message: currentLang.db.delete_success, data: data });
            } else {
                //Return the result (HTML Response):
                res.status(404).send({ success: false, message: currentLang.db.delete_id_no_results, id: req.body.id });
            }
        });
    });
    //----------------------------------------------------------------------------------------------------------------//

    //----------------------------------------------------------------------------------------------------------------//
    // POST - CHECK PASSWORD:
    //----------------------------------------------------------------------------------------------------------------//
    router.post('/checkPassById', crudMiddleware.checkJWT, async (req, res) => {
        //Send console log message:
        if(verboseMode === true) { services.sendConsoleMessage(req); }

        //Validate ID request:
        if(!services.validateRequestID(req, res, currentLang)) return;

        //Validate Password request:
        if(req.body.password){
            //Get POST data:
            let {id, password} = req.body;

            //Build query:
            const queryMongoDB = current.Model.findById(id, {'password': 1});

            //Execute query:
            await queryMongoDB.exec((err, data) => {
                //Validate errors in the query:
                if(err){
                    //Set error message:
                    errorMessage = { success: false, message: currentLang.db.query_error, error: err.message };

                    //Send error message to console:
                    console.error(errorMessage);

                    //Return error message (HTML Response):
                    res.status(500).send(errorMessage);
                } else if(data){
                    //Compare the passwords:
                    bcrypt.compare(password, data.password, (err, same) => {
                        if(same){
                            //Passwords match:
                            res.status(200).send({ success: true, message: currentLang.db.password_match });
                        } else {
                            //Passwords don't match:
                            res.status(200).send({ success: false, message: currentLang.db.password_dont_match, error: err });
                        }
                    });
                } else {
                    //Return result NO data (HTML Response):
                    res.status(404).send({ success: false, message: currentLang.db.id_no_results });
                }
            });
        } else {
            //Return result NO data (HTML Response):
            res.status(404).send({ success: false, message: currentLang.db.password_empty });
        }
    });
    //----------------------------------------------------------------------------------------------------------------//

    //----------------------------------------------------------------------------------------------------------------//
    //Return the current router:
    return router;
    //----------------------------------------------------------------------------------------------------------------//
};
//--------------------------------------------------------------------------------------------------------------------//