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
            query: {
                transactionID: Joi.string().required().description('Transaction id'),
                status: Joi.number().required().description('1 => APPROVE, 2=> REJECT ')
            },
            group: 'Payment',
            description: 'Route to approve or reject a payment.',
            model: 'ApproveOrRejectPayment'
        },
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

];

module.exports = routes;




