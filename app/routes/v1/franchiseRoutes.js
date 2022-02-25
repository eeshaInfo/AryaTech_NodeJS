'use strict';

const { Joi } = require('../../utils/joiUtils');
const { AVAILABLE_AUTHS, GENDER_TYPES } = require('../../utils/constants');
//load controllers
const { userController } = require('../../controllers');


let routesFranchise = [
    {
        method: 'GET',
        path: '/v1/serverResponse/test',
        joiSchemaForSwagger: {
            group: 'Franchise',
            description: 'Route to get server response (Is server working fine or not?).',
            model: 'SERVER'
        },
        handler: userController.getServerResponse
    },

];
module.exports = routesFranchise;




