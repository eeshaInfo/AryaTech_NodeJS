'use strict';

const { Joi } = require('../../utils/joiUtils');
const { AVAILABLE_AUTHS} = require('../../utils/constants');
//load controllers
const { franchaiseController } = require('../../controllers');

let routes = [
    {
        method: 'POST',
        path: '/v1/franchise',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body: {
                regDate : Joi.string().description('registration Date'),
                centerCode: Joi.string().description('center code'),
                name: Joi.string().description('center Name'),
                address: Joi.string().description('center full address Address'),
                userId: Joi.string().objectId().description('Admin _id')
            },
            group: 'Franchaise',
            description: 'Route to register a new franchise',
            model: 'RegisterNewFranchaise'
        },
        auth: AVAILABLE_AUTHS.SUPER_ADMIN,
        handler: franchaiseController.registerNewFranchaise
    },
    {
        method: 'PUT',
        path: '/v1/franchise',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body: {
                _id:Joi.string().objectId().required().description('franchise mongo _id'),
                regDate : Joi.string().description('registration Date'),
                centerCode: Joi.string().description('center code'),
                address:Joi.string().description('Address of frachiaise'),
                name: Joi.string().required().description('User\'s  name.'),
                userId: Joi.string().objectId().description('Admin _id')
            },
            group: 'Franchaise',
            description: 'Route to update a franchise details',
            model: 'updateFranchaise'
        },
        auth: AVAILABLE_AUTHS.SUPER_ADMIN,
        handler: franchaiseController.udpateFranchaise
    },
    {
        method: "GET",
        path: "/v1/franchise",
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
           query:{
                _id:Joi.string().objectId().required().description('franchise mongo _id')
           },
            group: "Franchaise",
            description: "get franchise details by _id",
            model: "getFranchaiseDetails",
        },
        auth: AVAILABLE_AUTHS.SUPER_ADMIN,
        handler: franchaiseController.getFranchaise,
    },
    {
        method: "DELETE",
        path: "/v1/franchise",
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query: {
                _id: Joi.string().objectId().required().description('user mongo _id')
            },
            group: "Franchaise",
            description: "delete franchise",
            model: "deleteFranchise",
        },
        auth: AVAILABLE_AUTHS.SUPER_ADMIN,
        handler: franchaiseController.deleteFranchise,
    },

    {
        method: 'GET',
        path: '/v1/franchise/list',
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
        path: '/v1/franchise/dropdown',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            group: 'Franchaise',
            description: 'Route to get franchise dropdwon for user',
            model: 'getAllFranchaise'
        },
        auth: AVAILABLE_AUTHS.ADMIN_AND_SUPER_ADMIN,
        handler: franchaiseController.franchaiseDropdown
    },


    
]

module.exports = routes;




