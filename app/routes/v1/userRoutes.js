'use strict';

const { Joi } = require('../../utils/joiUtils');
const { AVAILABLE_AUTHS, GENDER_TYPES, ADDRESS_TYPE, STATUS, USER_TYPES } = require('../../utils/constants');
//load controllers
const { userController } = require('../../controllers');
const CONSTANTS = require('../../utils/constants');

let routes = [

    {
        method: 'POST',
        path: '/v1/user',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body: {
                regNo: Joi.string().description('registration Number for the student only'),
                regDate: Joi.string().description('registration date of student'),
                userType: Joi.number().valid(...[USER_TYPES.ADMIN, USER_TYPES.STUDENT]).description('USER_TYPES 1=>SuperAdmin, 2=>Admin, 3=>Student'),
                franchiseId: Joi.string().objectId().description('Center mongo _id'),                
                name: Joi.string().required().description('User\'s  name.'),
                fathersName: Joi.string().optional().description('father\'s name'),
                mothersName: Joi.string().optional().description('mother\'s name'),
                dob: Joi.date().max(new Date()).description('User date of birth.'),
                gender: Joi.number().valid(...Object.values(GENDER_TYPES)).required().description(`User's gender. 1 for male and 2 for female 3.`),
                mobileNumber: Joi.string().required().description('User\'s mobile number.'),
                email: Joi.string().required().description('email id of Users'),
                courseId: Joi.string().description('course in which student will take admission'),
                isAddressSame: Joi.boolean().description('true if both address will be same'),
                primaryAddress: 
                    Joi.object({
                        
                        address: Joi.string().description('localicty, street No'),
                        postOffice: Joi.string().description('post office'),
                        state: Joi.string().description('state'),
                        dist: Joi.string().description('district'),
                        pincode: Joi.string().description('zip code')
                    }),
                    secondaryAddress: 
                    Joi.object({
                        address: Joi.string().description('localicty, street No'),
                        postOffice: Joi.string().description('post office'),
                        state: Joi.string().description('state'),
                        dist: Joi.string().description('district'),
                        pincode: Joi.string().description('zip code')
                    }),
                educations: Joi.array().items(
                    Joi.object({
                        examination: Joi.string().description('examination'),
                        board: Joi.string().description('board/university name'),
                        year: Joi.string().description('passing year')
                    })
                ).required().description('Education Details of the Users or Admin'),
                profileImage: Joi.object({
                    originalImageName : Joi.string().description('original image name'),
                    imageUrl : Joi.string().description('image url '),
                }),
                panNo: Joi.string().description('pan card no of franchise admin'),
                aadharNo: Joi.string().required().description('aadhar no of franchise admin'),
            },
            group: 'Users',
            description: 'Route to register a user.',
            model: 'Register',
        },
        auth: AVAILABLE_AUTHS.ADMIN_AND_SUPER_ADMIN,
        handler: userController.registerNewUser
    },


    {
        method: 'PUT',
        path: '/v1/user',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body: {
                _id: Joi.string().objectId().required().description('user mongo _id'),
                regNo: Joi.string().description('registration Number for the student only'),
                regDate: Joi.string().description('registration date of student'),
                franchiseId: Joi.string().objectId().description('Center mongo _id'),
                name: Joi.string().required().description('User\'s  name.'),
                fathersName: Joi.string().optional().description('father\'s name'),
                mothersName: Joi.string().optional().description('mother\'s name'),
                dob: Joi.date().max(new Date()).description('User date of birth.'),
                gender: Joi.number().valid(...Object.values(GENDER_TYPES)).required().description(`User's gender. 1 for male and 2 for female 3.`),
                userType: Joi.number().valid(...[USER_TYPES.ADMIN, USER_TYPES.STUDENT]).description('USER_TYPES 1=>SuperAdmin, 2=>Admin, 3=>Student'),
                mobileNumber: Joi.string().required().description('User\'s mobile number.'),
                email: Joi.string().required().description('email id of Users'),
                courseId: Joi.string().description('course'),
                isAddressSame: Joi.boolean().description('true if both address will be same'),
                primaryAddress: 
                Joi.object({
                    
                    address: Joi.string().description('localicty, street No'),
                    postOffice: Joi.string().description('post office'),
                    state: Joi.string().description('state'),
                    dist: Joi.string().description('district'),
                    pincode: Joi.string().description('zip code')
                }),
                secondaryAddress: 
                Joi.object({
                    address: Joi.string().description('localicty, street No'),
                    postOffice: Joi.string().description('post office'),
                    state: Joi.string().description('state'),
                    dist: Joi.string().description('district'),
                    pincode: Joi.string().description('zip code')
                }),
                educations: Joi.array().items(
                    Joi.object({
                        examination: Joi.string().description('examination'),
                        board: Joi.string().description('board/university name'),
                        year: Joi.string().description('passing year')
                    })
                ).required().description('Education Details of the Users or Admin'),
                profileImage: Joi.object({
                    originalImageName : Joi.string().description('original image name'),
                    imageUrl : Joi.string().description('image url '),
                }),
                panNo: Joi.string().description('pan card no of franchise admin'),
                aadharNo: Joi.string().description('aadhar no of franchise admin'),
            },
            group: 'Users',
            description: 'Route to update a user details',
            model: 'updateUser'
        },
        auth: AVAILABLE_AUTHS.ADMIN_AND_SUPER_ADMIN,
        handler: userController.updateUser
    },

    {
        method: "DELETE",
        path: "/v1/user",
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query: {
                _id: Joi.string().objectId().required().description('user mongo _id')
            },
            group: 'Users',
            description: 'Route to delete a user',
            model: 'deleteUser'
        },
        auth: AVAILABLE_AUTHS.SUPER_ADMIN,
        handler: userController.deleteUser,
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
        // auth: AVAILABLE_AUTHS.ADMIN_AND_SUPER_ADMIN,
        handler: userController.uploadFile,
    },
    {
        method: "GET",
        path: "/v1/file/get",
        joiSchemaForSwagger: {
            query: {
                filePath: Joi.string().required().description('s3 file path')
            },
            group: "File",
            description: "Route to get profile image for user",
            model: "getFileFromS3",
        },
        // auth: AVAILABLE_AUTHS.ADMIN_AND_SUPER_ADMIN,
        handler: userController.getFile,
    },

    {
        method: "PUT",
        path: "/v1/user/status",
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body: {
                userId: Joi.string().objectId().description('UserId'),
                status: Joi.number().valid(...Object.values(STATUS)).description('Status of the user')
            },
            group: 'Users',
            description: "Changes user application status",
            model: "changeUserStatus",
        },
        auth: AVAILABLE_AUTHS.ADMIN_AND_SUPER_ADMIN,
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
                franchiseId: Joi.string().objectId().description('franchiseId mongo _id'),
                status: Joi.number().default(STATUS.PENDING).valid(...Object.values(STATUS)).description('status'),
                skip: Joi.number().default(0).description('skip'),
                limit: Joi.number().default(10).description('limit'),
                searchKey: Joi.string().allow(""),
                sortKey: Joi.string().default("createdAt").optional().description('sort key'),
                sortDirection: Joi.number().default(-1).optional().description('sort direction'),
            },
            group: 'Users',
            description: 'Route to get userList for admin',
            model: 'GetUserList'
        },
        auth: AVAILABLE_AUTHS.ADMIN_AND_SUPER_ADMIN,
        handler: userController.list
    },

    {
        method: 'GET',
        path: '/v1/user/dropdown',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query: {
                userType: Joi.number().default(USER_TYPES.STUDENT).valid(...Object.values(USER_TYPES)).description('User Type')
            },
            group: 'Users',
            description: 'Route to get user dropdwon for user',
            model: 'getUsersDropDown'
        },
        auth: AVAILABLE_AUTHS.ADMIN_AND_SUPER_ADMIN,
        handler: userController.userDropdown
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
            group: 'Users',
            description: 'Route to get userDetails for admin',
            model: 'GetUserDetails'
        },
        auth: AVAILABLE_AUTHS.ADMIN_AND_SUPER_ADMIN,
        handler: userController.userDetails
    },

]

module.exports = routes;




