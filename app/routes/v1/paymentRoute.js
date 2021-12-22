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


];

module.exports = routes;




