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
                email: Joi.string().email().required().description('User\'s email.'),
                password: Joi.string().required().regex(/^(?=.*[A-Za-z])(?=(.*[\d]){1,})(?=.*?[^\w\s]).{8,}$/).description('User\'s password.'),
                name: Joi.string().required().description('User\'s name.'),
                country: Joi.string().required().description('User\'s country.'),
                city: Joi.string().required().description('User\'s city.'),
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
        path: '/v1/user/invite',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body: {
                email: Joi.string().email().required().description('User\'s email.'),
                firstName: Joi.string().required().description('User\'s first name.'),
                lastName: Joi.string().required().description('User\'s last name.'),
            },
            group: 'User',
            description: 'Route to invite a user.',
            model: 'Invite'
        },
        auth: AVAILABLE_AUTHS.USER,
        handler: userController.inviteUser
    },
    {
        method: 'POST',
        path: '/v1/user/activateAccount',
        joiSchemaForSwagger: {
            body: {
                token: Joi.string().required().description('Setup Password Token.'),
                password: Joi.string().required().regex(/^(?=.*[A-Za-z])(?=(.*[\d]){1,})(?=.*?[^\w\s]).{8,}$/).default("string").description('Password.')
            },
            group: 'User',
            description: 'Route to activate account.',
            model: 'ActivateAccount'
        },
        handler: userController.activateAccount
    },
    {
        method: 'POST',
        path: '/v1/user/forgotPassword',
        joiSchemaForSwagger: {
            body: {
                email: Joi.string().email().lowercase().required().messages({ "string.email": "Whoops, invalid email. Please try again." }).description('User\'s email Id.'),
            },
            group: 'User',
            description: 'Route to send email for forgot password.',
            model: 'ForgotPassword'
        },
        handler: userController.forgotPassword
    },
    {
        method: 'POST',
        path: '/v1/user/reset-password',
        joiSchemaForSwagger: {
            body: {
                token: Joi.string().required().description('reset password token').label('Reset password token'),
                password: Joi.string().required().regex(/^(?=.*[A-Za-z])(?=(.*[\d]){1,})(?=.*?[^\w\s]).{8,}$/).default("string").description("User's password.")
                //password: Joi.string().regex(/^((?=.*\d)(?=.*[a-z])(?=.*[A-Z])|(?=.*\d)(?=.*[a-zA-Z])(?=.*[\W_])|(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])).{8,}$/).required().messages({ "string.pattern.base": "Password must have 8 character And Include three out of four character categories: lower case ,upper case, numbers special characters" }).description("User's password.")
            },
            group: 'User',
            description: 'User reset password page redirection.',
            model: 'ResetPassword'
        },
        handler: userController.resetPassword
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




