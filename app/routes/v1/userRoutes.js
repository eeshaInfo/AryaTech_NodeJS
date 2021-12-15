'use strict';

const { Joi } = require('../../utils/joiUtils');
const { AVAILABLE_AUTHS, GENDER_TYPES } = require('../../utils/constants');
//load controllers
const { userController } = require('../../controllers');

let routes = [
    {
        method: 'GET',
        path: '/v1/serverResponse/',
        joiSchemaForSwagger: {
            group: 'User',
            description: 'Route to get server response (Is server working fine or not?).',
            model: 'SERVER'
        },
        handler: userController.getServerResponse
    }, {
        method: 'GET',
        path: '/v1/user/auth',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            group: 'User',
            description: 'Route to user auth example',
            model: 'UserAuth'
        },
        auth: AVAILABLE_AUTHS.USER,
        handler: userController.getServerResponse
    },

    {
        method: 'POST',
        path: '/v1/user/register',
        joiSchemaForSwagger: {
            body: {
                firstName: Joi.string().required().description('User\'s first name.'),
                lastName: Joi.string().required().description('User\'s last name.'),
                location: Joi.string().required().description('User\'s location.'),
                gender: Joi.number().valid(...Object.values(GENDER_TYPES)).required().description(`User's gender. 1 for male and 2 for female.`),
                dob: Joi.date().max(new Date()).description('User date of birth.'),
                imagePath: Joi.string().optional().description('Url of image.')
            },
            group: 'User',
            description: 'Route to register a user.',
            model: 'Register'
        },
        handler: userController.registerNewUser
    },

    {
        method: 'POST',
        path: '/v1/user/login',
        joiSchemaForSwagger: {
            body: {
                email: Joi.string().email().required().description('User\'s email Id.'),
                password: Joi.string().required().regex(/^(?=.*[A-Za-z])(?=(.*[\d]){1,})(?=.*?[^\w\s]).{8,}$/).description('User\'s password.')
            },
            group: 'User',
            description: 'Route to login a user.',
            model: 'Login'
        },
        handler: userController.loginUser
    },
    {
        method: 'POST',
        path: '/v1/user/logout',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            group: 'User',
            description: 'Route to logout user auth',
            model: 'UserAuth'
        },
        auth: AVAILABLE_AUTHS.USER,
        handler: userController.logout
    },
];

module.exports = routes;




