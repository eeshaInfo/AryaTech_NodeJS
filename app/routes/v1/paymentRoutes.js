'use strict';

const { Joi } = require('../../utils/joiUtils');
//load controllers
const { paymentController } = require('../../controllers');
const {AVAILABLE_AUTHS} = require('../../utils/constants');

let routes = [
    {
        method: 'POST',
        path:'/v1/payment',
        joiSchemaForSwagger:{
            headers:{
                'authorization':Joi.string().required().description('User Auth Token')
            },
            body:{
                userId:Joi.string().objectId().required().description('Student MongoId'),
                amount:Joi.number().integer().required().description('Amount'),
                mode:Joi.string().required().description('mode of payment, cash,online,cheque')
            },
            group: 'Payment',
            description: 'Route for Accept Payment of student',
            model: 'acceptPayment'
        },
        auth:AVAILABLE_AUTHS.SUPER_ADMIN,
        handler:paymentController.acceptPayment
    },
    

    {
        method: 'PUT',
        path:'/v1/payment',
        joiSchemaForSwagger:{
            headers:{
                'authorization':Joi.string().required().description('User Auth Token')
            },
            body:{
                _id: Joi.string().objectId().required().description('payment _id MongoId'),
                userId:Joi.string().objectId().required().description('Student MongoId'),
                amount:Joi.number().integer().required().description('Amount'),
            },
            group: 'Payment',
            description: 'Route for edit accepted Payment of student',
            model: 'editAcceptedPayment'
        },
        auth:AVAILABLE_AUTHS.SUPER_ADMIN,
        handler:paymentController.editAcceptedPayment
    },



    {
        method: 'GET',
        path:'/v1/payment',
        joiSchemaForSwagger:{
            headers:{
                'authorization':Joi.string().required().description('User Auth Token')
            },
            query:{
                _id:Joi.string().objectId().required().description('payment MongoId')
            },
            group: 'Payment',
            description: 'Route for get payment by id',
            model: 'getPaymentById'
        },
        auth:AVAILABLE_AUTHS.SUPER_ADMIN,
        handler:paymentController.getPaymentById
    },

    {
        method: 'DELETE',
        path:'/v1/payment',
        joiSchemaForSwagger:{
            headers:{
                'authorization':Joi.string().required().description('User Auth Token')
            },
            query:{
                _id:Joi.string().objectId().required().description('payment MongoId')
            },
            group: 'Payment',
            description: 'Route for delete payment record',
            model: 'deletePaymentRecord'
        },
        auth:AVAILABLE_AUTHS.SUPER_ADMIN,
        handler:paymentController.deletePayment
    },

    {
        method: 'GET',
        path:'/v1/payment/list',
        joiSchemaForSwagger:{
            headers:{
                'authorization':Joi.string().required().description('User Auth Token')
            },
            query:{
                userId:Joi.string().objectId().optional().description('UserId'),
                skip:Joi.number().default(0).description('Skip'),
                limit:Joi.number().default(10).description('Limit'),
                sortKey: Joi.string().default('createdAt').description('sortKey'),
                sortDirection:Joi.number().default(-1).description('sortDirection'),
                searchKey: Joi.string().allow('').description('search String')

            },
            group: 'Payment',
            description: 'Route for all payment list',
            model: 'getPaymentList'
        },
        auth:AVAILABLE_AUTHS.SUPER_ADMIN,
        handler:paymentController.getPaymentList
    }
]

module.exports = routes;




