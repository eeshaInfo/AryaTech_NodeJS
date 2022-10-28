'use strict';

const { Joi } = require('../../utils/joiUtils');
const { AVAILABLE_AUTHS, GENDER_TYPES, ADDRESS_TYPE,STATUS } = require('../../utils/constants');
//load controllers
const { userController } = require('../../controllers');
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
        handler: userController.getServerResponse
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
        handler: userController.getServerResponse
    },

    {
        method: 'POST',
        path: '/v1/user/login',
        joiSchemaForSwagger: {
            body: {
                // isAdminRole: Joi.boolean(),
                // mobileNumber: Joi.alternatives().conditional('isAdminRole', { is: true, then: Joi.string().optional(), otherwise: Joi.string().required() }),
                email: Joi.alternatives().conditional('isAdminRole', { is: true, then: Joi.string().required(), otherwise: Joi.string().optional() }),
                password: Joi.alternatives().conditional('isAdminRole', { is: true, then: Joi.string().required(), otherwise: Joi.string().optional() }),
            },
            group: 'Auth',
            description: 'Route to login a user/admin.',
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
            group: 'Auth',
            description: 'Route to logout user/admin auth',
            model: 'UserAuth'
        },
        auth: AVAILABLE_AUTHS.COMMON,
        handler: userController.logout
    },

    {
        method: 'POST',
        path: '/v1/user',
        joiSchemaForSwagger: {
            body: {
                studentType: Joi.number().optional().description('student type'),
                registrationNo:Joi.string().optional().description('Student Registration Number'),
                branch: Joi.string().optional().description('Branch code'),
                studentsName: Joi.string().required().description('User\'s first name.'),
                fathersName:Joi.string().required().description('father\'s name'),                
                mothersName:Joi.string().required().description('mother\'s name'),
                dob: Joi.date().max(new Date()).description('User date of birth.'),
                gender: Joi.number().valid(...Object.values(GENDER_TYPES)).required().description(`User's gender. 1 for male and 2 for female 3 for other.`),
                mobileNumber: Joi.string().required().description('User\'s mobile number.'),
                email:Joi.string().description('email id of student'),
                course: Joi.string().description('course'),
                duration:Joi.number().description('duration of the course'),
                address:Joi.array().items(
                    Joi.object({
                        type:Joi.number().valid(...Object.values(ADDRESS_TYPE)).description('Address type 1=>Permanent Address, 2=>Present Address'),
                        address: Joi.string().description('localicty, street No'),
                        postOffice:Joi.string().description('post office'),
                        state: Joi.string().description('state'),
                        dist: Joi.string().description('district'),
                        pincode:Joi.string().description('zip code')
                    })
                ),
                educations:Joi.array().items(
                    Joi.object({
                        examination:Joi.string().description('examination'),
                        board:Joi.string().description('board/university name'),
                        year:Joi.string().description('passing year')
                    })
                ),
                imagePath: Joi.string().default("").allow('').optional().description('Url of image.'),
            },
            group: 'User',
            description: 'Route to register a user.',
            model: 'Register'
        },
        handler: userController.registerNewUser
    },

    {
        method: "POST",
        path: "/v1/file/upload",
        joiSchemaForSwagger: {
            formData: {
                file: Joi.file({ name: "image", description: "Single image file" }),
            },
            group: "File",
            description: "Route to upload profile image for user",
            model: "UploadFiles",
        },
        handler: userController.uploadFile,
    },
    {
        method: 'PUT',
        path: '/v1/user',
        joiSchemaForSwagger: {
            // headers: {
            //     'authorization': Joi.string().required().description("User's JWT token.")
            // },
            body: {
                _id:Joi.string().objectId().description('mongo id'),
                regNo:Joi.string().required().description('Student Registration Number'),
                studentName: Joi.string().required().description('User\'s first name.'),
                fathersName:Joi.string().required().description('father\'s name'),                
                mothersName:Joi.string().required().description('mother\'s name'),
                dob: Joi.date().max(new Date()).description('User date of birth.'),
                gender: Joi.number().valid(...Object.values(GENDER_TYPES)).required().description(`User's gender. 1 for male and 2 for female 3 for other.`),
                mobileNumber: Joi.string().required().description('User\'s mobile number.'),
                parentsMobile: Joi.string().required().description('User\'s mobile number.'),
                email:Joi.string().description('email id of student'),
                course:Joi.string().required().description('Course Name'),
                duration:Joi.number().description('jjjjj'),
                address:Joi.array().items(
                    Joi.object({
                        type:Joi.number().valid(...Object.values(ADDRESS_TYPE)).description('Address type 1=>Permanent Address, 2=>Present Address'),
                        address: Joi.string().description('localicty, street No'),
                        postOffice: Joi.string().description('Post office'),
                        state: Joi.string().description('state'),
                        district: Joi.string().description('district'),
                        pincode:Joi.string().description('pincode')
                    })
                ),
                educations:Joi.array().items(
                    Joi.object({
                        examination:Joi.string().description('examination'),
                        board:Joi.string().description('board/university name'),
                        year:Joi.string().description('passing year')
                    })
                ),
                imagePath: Joi.string().default("").allow('').optional().description('Url of image.'),
            },
            group: 'User',
            description: 'Route to edit user profile for user/admin',
            model: 'UpdateProfile'
        },
        // auth: AVAILABLE_AUTHS.COMMON,
        handler: userController.updateProfile
    },
    {
        method: "PUT",
        path: "/v1/user/status",
        joiSchemaForSwagger: {
           body:{
                userId:Joi.string().valid(...Object.values(STATUS)).description('UserId'),
                status:Joi.number().valid(...Object.values(STATUS)).description('Status of the user')
           },
            group: "User",
            description: "Changes user application status",
            model: "changeUserStatus",
        },
        handler: userController.userStatus,
    },

    {
        method: 'GET',
        path: '/v1/user/list',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query: {
                status:Joi.number().default(STATUS.APPROVE).valid(...Object.values(STATUS)).description('status'),
                skip: Joi.number().default(0).description('skip'),
                limit: Joi.number().default(10).description('limit'),
                searchKey: Joi.string().allow(""),
                sortKey: Joi.string().default("createdAt").optional().description('sort key'),
                sortDirection: Joi.number().default(-1).optional().description('sort direction'),
            },
            group: 'User',
            description: 'Route to get userList for admin',
            model: 'GetUserList'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
        handler: userController.list
    },

    {
        method: 'GET',
        path: '/v1/user/dropdown',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            group: 'User',
            description: 'Route to get user dropdwon for user',
            model: 'getUsersDropDown'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
        handler: userController.userDropdown
    },


    {
        method: 'DELETE',
        path: '/v1/user',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query: {
                _id: Joi.string().required().description('_id of user'),
            },
            group: 'User',
            description: 'Route to delete user for admin .',
            model: 'DeleteUser'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
        handler: userController.deleteUser
    },
    {
        method: 'GET',
        path: '/v1/user/details',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query: {
                userId: Joi.string().objectId().required().description("User's Id"),
            },
            group: 'User',
            description: 'Route to get userDetails for admin',
            model: 'GetUserDetails'
        },
        auth: AVAILABLE_AUTHS.COMMON,
        handler: userController.userDetails
    },
    
]

module.exports = routes;




