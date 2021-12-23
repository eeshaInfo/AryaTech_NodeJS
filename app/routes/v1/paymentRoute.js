'use strict';

const { Joi } = require('../../utils/joiUtils');
const { AVAILABLE_AUTHS, GENDER_TYPES, CHALLENGES_TYPES, DISTANCE_TYPE, TRANSACTION_STATUS } = require('../../utils/constants');
//load controllers
const { paymentController } = require('../../controllers');
const CONSTANTS = require('../../utils/constants');

let routes = [
    {
        method: 'PUT',
        path: '/v1/payment/approveOrReject',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body: {
                id: Joi.string().required().description('Payment id'),
                status: Joi.number().required().description('1 => APPROVE, 2=> REJECT ,3=> PENDING')
            },
            group: 'Payment',
            description: 'Route to approve or reject a payment.',
            model: 'ApproveOrRejectPayment'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
        handler: paymentController.approveOrRejectPayment
    },


    {
        method: 'POST',
        path: '/v1/payment/acceptPayment',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },

            body: {
                coin: Joi.number().description(`HZM Coins`).required(),
                challengeId: Joi.string().description('Challenge Id').required(),
                transactionID: Joi.string().description('Transactions Id').required()
            },
            group: 'Payment',
            description: 'Route to accept Payment .',
            model: 'AcceptPayment'
        },
        auth: AVAILABLE_AUTHS.USER,
        handler: paymentController.acceptPayment
    },
    {
        method: 'GET',
        path: '/v1/payment/getPaymentList',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query: {
                skip: Joi.number().default(0).description('skip'),
                limit: Joi.number().default(10).description('limit'),
                searchKey: Joi.string().allow(""),
                sortKey: Joi.string().optional().description('sort key'),
                sortDirection: Joi.number().default(-1).optional().description('sort direction'),
            },
            group: 'Payment',
            description: 'Route to get payment list.',
            model: 'GetPaymentDetails'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
        handler: paymentController.getPaymentList
    },

];

module.exports = routes;



