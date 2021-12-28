'use strict';

const { Joi } = require('../../utils/joiUtils');
const { AVAILABLE_AUTHS, GENDER_TYPES } = require('../../utils/constants');
//load controllers
const { userController } = require('../../controllers');


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
            model: 'Admin_Auth'
        },
        auth: AVAILABLE_AUTHS.COMMON,
        handler: userController.getServerResponse
    },
    {
        method: 'POST',
        path: '/v1/admin/forgotPassword',
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
        path: '/v1/admin/reset-password',
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
    {
        method: 'PUT',
        path: '/v1/admin/update-password',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body: {
                oldPassword: Joi.string().required().description('old password '),
                newPassword: Joi.string().required().isValidPassword().description("User's new password.")
            },
            group: 'Admin',
            description: 'Admin update password page .',
            model: 'Admin_UpdatePassword'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
        handler: userController.updatePassword
    },
    {
        method: 'GET',
        path: '/v1/admin/getAdminProfile',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("Admin's JWT token.")
            },

            group: 'Admin',
            description: 'Admin get profile  ',
            model: 'Admin_GetProfile'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
        handler: userController.getAdminProfile
    },

    {
        method: 'PUT',
        path: '/v1/user/blockUnblockUser',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body: {
                id: Joi.string().objectId().required().description('User Id.'),
                status:Joi.number().required().description('User Status')
            },
            group: 'Admin',
            description: 'Route to block/unblock user',
            model: 'blockUser'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
        handler: userController.blockUser
    },
];

module.exports = routesAdmin;




