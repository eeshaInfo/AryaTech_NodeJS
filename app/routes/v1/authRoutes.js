'use strict';

const { Joi } = require('../../utils/joiUtils');
const { AVAILABLE_AUTHS, GENDER_TYPES, ADDRESS_TYPE,STATUS,USER_TYPES } = require('../../utils/constants');
//load controllers
const { authController } = require('../../controllers');
const CONSTANTS = require('../../utils/constants');

let routes = [
    {
        method: 'GET',
        path: '/v1/serverResponse/',
        joiSchemaForSwagger: {
            group: 'Test',
            description: 'Route to get server response (Is server working fine or not?).',
            model: 'SERVER'
        },
        handler: authController.getServerResponse
    },

    {
        method: 'GET',
        path: '/v1/admin/auth',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            group: 'Test',
            description: 'Route to user/admin auth example',
            model: 'Admin_Auth'
        },
        auth: AVAILABLE_AUTHS.COMMON,
        handler: authController.getServerResponse
    },

    {
        method: 'POST',
        path: '/v1/user/login',
        joiSchemaForSwagger: {
            body: {
                email: Joi.alternatives().conditional('isAdminRole', { is: true, then: Joi.string().required(), otherwise: Joi.string().optional() }),
                password: Joi.alternatives().conditional('isAdminRole', { is: true, then: Joi.string().required(), otherwise: Joi.string().optional() }),
            },
            group: 'Auth',
            description: 'Route to login a user/admin.',
            model: 'Login'
        },
        handler: authController.loginUser
    },
    {
        method: 'POST',
        path: '/v1/user/logout',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            group: 'Auth',
            description: 'Route to logout user/admin auth',
            model: 'UserAuth'
        },
        auth: AVAILABLE_AUTHS.COMMON,
        handler: authController.logout
    },

   
    
]

module.exports = routes;




