'use strict';

const { Joi } = require('../../utils/joiUtils');
const { AVAILABLE_AUTHS, GENDER_TYPES } = require('../../utils/constants');
//load controllers
const { adminController } = require('../../controllers');


let routesAdmin = [
    {
        method: 'GET',
        path: '/v1/admin/auth',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            group: 'Admin',
            description: 'Route to user auth example',
            model: 'UserAuth'
        },
        auth: AVAILABLE_AUTHS.USER,
        handler: adminController.getServerResponse
    },

    {
        method: 'POST',
        path: '/v1/admin/login',
        joiSchemaForSwagger: {
            body: {
                email: Joi.string().email().required().description('User\'s email Id.'),
                password: Joi.string().required().regex(/^(?=.*[A-Za-z])(?=(.*[\d]){1,})(?=.*?[^\w\s]).{8,}$/).description('User\'s password.')
            },
            group: 'Admin',
            description: 'Route to login a admin.',
            model: 'Login'
        },
        handler: adminController.loginUser
    },
    {
        method: 'POST',
        path: '/v1/admin/logout',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            group: 'Admin',
            description: 'Route to logout user auth',
            model: 'UserAuth'
        },
        auth: AVAILABLE_AUTHS.USER,
        handler: adminController.logout
    },
];

module.exports = routesAdmin;




