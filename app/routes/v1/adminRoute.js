'use strict';

const { Joi } = require('../../utils/joiUtils');
const { AVAILABLE_AUTHS, GENDER_TYPES } = require('../../utils/constants');
//load controllers
const { userController } = require('../../controllers');


let routesAdmin = [
    {
        method: 'POST',
        path: '/v1/admin/login',   //ADMIN_LOGIN
        joiSchemaForSwagger: {
            body: {
                email: Joi.string().email().required().description('User\'s email Id.'),
                password: Joi.string().required().regex(/^(?=.*[A-Za-z])(?=(.*[\d]){1,})(?=.*?[^\w\s]).{8,}$/).description('User\'s password.')
            },
            group: 'Admin',
            description: 'Route to login a admin.',
            model: 'Admin_Login'
        },
        handler: userController.loginUser
    },
    {
        method: 'POST',
        path: '/v1/admin/logout',        //ADMIN_LOGOUT...
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("Admin's JWT token.")
            },
            group: 'Admin',
            description: 'Route to logout admin auth',
            model: 'UserAuth'
        },
        auth: AVAILABLE_AUTHS.USER,
        handler: userController.logout
    },
    {
        method: 'POST',
        path: '/v1/admin/forgotPassword',  //FORGET PASSWORD  FOR ADMIN
        joiSchemaForSwagger: {
            body: {
                email: Joi.string().email().lowercase().required().messages({ "string.email": "Whoops, invalid email. Please try again." }).description('User\'s email Id.'),
            },
            group: 'Admin',
            description: 'Route to send email for forgot password.',
            model: 'Admin_ForgotPassword'
        },
        handler: userController.forgotPassword
    },
    {
        method: 'POST',
        path: '/v1/admin/reset-password',  //RESET PASSWORD FOR ADMIN...
        joiSchemaForSwagger: {
            body: {
                token: Joi.string().required().description('reset password token').label('Reset password token'),
                password: Joi.string().required().regex(/^(?=.*[A-Za-z])(?=(.*[\d]){1,})(?=.*?[^\w\s]).{8,}$/).default("string").description("User's password.")
                //password: Joi.string().regex(/^((?=.*\d)(?=.*[a-z])(?=.*[A-Z])|(?=.*\d)(?=.*[a-zA-Z])(?=.*[\W_])|(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])).{8,}$/).required().messages({ "string.pattern.base": "Password must have 8 character And Include three out of four character categories: lower case ,upper case, numbers special characters" }).description("User's password.")
            },
            group: 'Admin',
            description: 'Admin reset password page redirection.',
            model: 'Admin_ResetPassword'
        },
        handler: userController.resetPassword
    },
];

module.exports = routesAdmin;




