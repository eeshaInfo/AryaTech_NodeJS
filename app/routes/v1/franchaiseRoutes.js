'use strict';

const { Joi } = require('../../utils/joiUtils');
const { AVAILABLE_AUTHS, GENDER_TYPES, ADDRESS_TYPE,STATUS,USER_TYPES } = require('../../utils/constants');
//load controllers
const { franchaiseController } = require('../../controllers');
const CONSTANTS = require('../../utils/constants');

let routes = [
    {
        method: 'POST',
        path: '/v1/franchaise',
        joiSchemaForSwagger: {
            body: {
                dateOfReg: Joi.date().required().default(new Date()).max(new Date()).description('date of registration'),
                name: Joi.string().required().description('User\'s  name.'),
                fathersName:Joi.string().optional().description('father\'s name'),                
                mothersName:Joi.string().optional().description('mother\'s name'),
                dob: Joi.date().max(new Date()).description('User date of birth.'),
                gender: Joi.number().valid(...Object.values(GENDER_TYPES)).required().description(`User's gender. 1 for male and 2 for female 3.`),
                mobileNumber: Joi.string().required().description('User\'s mobile number.'),
                email:Joi.string().required().description('email id of student'),
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
                        year:Joi.string().description('passing year'),
                        percentage: Joi.number().description('total percentage of marks')
                    })
                ).required().description('Education Details of the student or Admin'),
                imagePath: Joi.string().default("").allow('').optional().description('Url of image.'),
                panNo:Joi.string().description('pan card no of franchise admin'),
                aadharNo: Joi.string().description('aadhar no of franchise admin'),
                centerName: Joi.string().description('center Name'),
                centerAddress: Joi.string().description('center full address Address'),
                areaType: Joi.number().valid(...Object.values(CONSTANTS.AREA_TYPES)).description('area type 1=>Rural, 2=>Urban')

            },
            group: 'Franchaise',
            description: 'Route to register a new franchaise',
            model: 'RegisterNewFranchaise'
        },
        // auth: AVAILABLE_AUTHS.ADMIN_AND_SUPER_ADMIN,
        handler: franchaiseController.registerNewFranchaise
    },
    {
        method: 'PUT',
        path: '/v1/franchaise',
        joiSchemaForSwagger: {
            body: {
                _id:Joi.string().objectId().required().description('franchaise mongo _id'),
                dateOfReg: Joi.date().required().default(new Date()).max(new Date()).description('date of registration'),
                name: Joi.string().required().description('User\'s  name.'),
                fathersName:Joi.string().optional().description('father\'s name'),                
                mothersName:Joi.string().optional().description('mother\'s name'),
                dob: Joi.date().max(new Date()).description('User date of birth.'),
                gender: Joi.number().valid(...Object.values(GENDER_TYPES)).required().description(`User's gender. 1 for male and 2 for female 3.`),
                mobileNumber: Joi.string().required().description('User\'s mobile number.'),
                email:Joi.string().required().description('email id of student'),
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
                        year:Joi.string().description('passing year'),
                        percentage: Joi.number().description('total percentage of marks')
                    })
                ).optional().description('Education Details of the student or Admin'),
                imagePath: Joi.string().default("").allow('').optional().description('Url of image.'),
                panNo:Joi.string().description('pan card no of franchise admin'),
                aadharNo: Joi.string().description('aadhar no of franchise admin'),
                centerName: Joi.string().description('center Name'),
                centerAddress: Joi.string().description('center full address Address'),
                areaType: Joi.number().valid(...Object.values(CONSTANTS.AREA_TYPES)).description('area type 1=>Rural, 2=>Urban')
            },
            group: 'Franchaise',
            description: 'Route to update a franchaise details',
            model: 'updateFranchaise'
        },
        // auth: AVAILABLE_AUTHS.ADMIN_AND_SUPER_ADMIN,
        handler: franchaiseController.udpateFranchaise
    },
    {
        method: "GET",
        path: "/v1/franchaise",
        joiSchemaForSwagger: {
           query:{
                _id:Joi.string().objectId().required().description('franchaise mongo _id')
           },
            group: "Franchaise",
            description: "get franchaise details by _id",
            model: "getFranchaiseDetails",
        },
        // auth: AVAILABLE_AUTHS.ADMIN_AND_SUPER_ADMIN,
        handler: franchaiseController.getFranchaise,
    },

    {
        method: 'GET',
        path: '/v1/franchaise/list',
        joiSchemaForSwagger: {
            // headers: {
            //     'authorization': Joi.string().required().description("User's JWT token.")
            // },
            query: {
                // status:Joi.number().default(STATUS.PENDING).valid(...Object.values(STATUS)).description('status'),
                skip: Joi.number().default(0).description('skip'),
                limit: Joi.number().default(10).description('limit'),
                searchKey: Joi.string().allow(""),
                sortKey: Joi.string().default("createdAt").optional().description('sort key'),
                sortDirection: Joi.number().default(-1).optional().description('sort direction'),
            },
            group: 'Franchaise',
            description: 'Route to get userList for admin',
            model: 'GetUserList'
        },
        // auth: AVAILABLE_AUTHS.ADMIN_AND_SUPER_ADMIN,
        handler: franchaiseController.list
    },

    {
        method: 'GET',
        path: '/v1/franchaise/dropdown',
        joiSchemaForSwagger: {
            // headers: {
            //     'authorization': Joi.string().required().description("User's JWT token.")
            // },
            group: 'Franchaise',
            description: 'Route to get franchaise dropdwon for user',
            model: 'getAllFranchaise'
        },
        // auth: AVAILABLE_AUTHS.ADMIN_AND_SUPER_ADMIN,
        handler: franchaiseController.franchaiseDropdown
    },


    
]

module.exports = routes;




