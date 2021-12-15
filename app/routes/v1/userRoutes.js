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
                //location: Joi.string().required().description('User\'s location.'),
                country: Joi.string().required().description('User\'s country.'),
                state: Joi.string().required().description('User\'s state.'),
                city: Joi.string().required().description('User\'s city.'),
                zipCode: Joi.string().required().description('User\'s zip code.'),
                mobileNumber: Joi.string().required().description('User\'s mobile number.'),
                gender: Joi.number().valid(...Object.values(GENDER_TYPES)).required().description(`User's gender. 1 for male and 2 for female 3 for other.`),
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
                isAdminRole: Joi.boolean(),
                mobileNumber: Joi.alternatives().conditional('isAdminRole',{is:true,then: Joi.string().optional(),otherwise: Joi.string().required()}),
                email: Joi.alternatives().conditional('isAdminRole',{is:true,then: Joi.string().required(),otherwise: Joi.string().optional()}),
                password: Joi.alternatives().conditional('isAdminRole',{is:true,then: Joi.string().required(),otherwise: Joi.string().optional()}),
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
    {
        method: "POST",
        path: "/v1/file/upload",
        joiSchemaForSwagger: {
            // Route format to use for files upload 
            headers: {
                authorization: Joi.string().required().description("Your's JWT token."),
            },
            formData: {
                file: Joi.file({ name: "image", description: "Single image file" }),
                // body: {
                //     locationId: Joi.string().alphanum().min(24).max(24).required().description(`Location id.`),
                //     title: Joi.string().optional().description('Title.'),
                //     alt: Joi.string().optional().description('Alt.')
                // },
            },
            group: "File",
            description: "Route to upload files in multiple formats",
            model: "UploadFiles",
        },
        auth: "admin",
        handler: userController.uploadFile,
    },

];

module.exports = routes;




