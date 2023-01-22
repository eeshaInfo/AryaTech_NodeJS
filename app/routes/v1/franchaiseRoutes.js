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
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body: {
                regDate: Joi.date().description('registration number'),
                name: Joi.string().description('center Name'),
                address: Joi.string().description('center full address Address'),
                userId: Joi.string().objectId().description('Admin _id')
            },
            group: 'Franchaise',
            description: 'Route to register a new franchaise',
            model: 'RegisterNewFranchaise'
        },
        auth: AVAILABLE_AUTHS.SUPER_ADMIN,
        handler: franchaiseController.registerNewFranchaise
    },
    {
        method: 'PUT',
        path: '/v1/franchaise',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body: {
                _id:Joi.string().objectId().required().description('franchaise mongo _id'),
                address:Joi.string().description('Address of frachiaise'),
                name: Joi.string().required().description('User\'s  name.'),
                userId: Joi.string().objectId().description('Admin _id')
            },
            group: 'Franchaise',
            description: 'Route to update a franchaise details',
            model: 'updateFranchaise'
        },
        auth: AVAILABLE_AUTHS.SUPER_ADMIN,
        handler: franchaiseController.udpateFranchaise
    },
    {
        method: "GET",
        path: "/v1/franchaise",
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
           query:{
                _id:Joi.string().objectId().required().description('franchaise mongo _id')
           },
            group: "Franchaise",
            description: "get franchaise details by _id",
            model: "getFranchaiseDetails",
        },
        auth: AVAILABLE_AUTHS.SUPER_ADMIN,
        handler: franchaiseController.getFranchaise,
    },

    {
        method: 'GET',
        path: '/v1/franchaise/list',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query: {
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
        auth: AVAILABLE_AUTHS.SUPER_ADMIN,
        handler: franchaiseController.list
    },

    {
        method: 'GET',
        path: '/v1/franchaise/dropdown',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            group: 'Franchaise',
            description: 'Route to get franchaise dropdwon for user',
            model: 'getAllFranchaise'
        },
        auth: AVAILABLE_AUTHS.ADMIN_AND_SUPER_ADMIN,
        handler: franchaiseController.franchaiseDropdown
    },


    
]

module.exports = routes;




