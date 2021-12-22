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
        path: '/v1/payment/accept',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body: {
                challengeName: Joi.string().required().description('Challenge name.'),
                challengeType: Joi.number().required().valid(...Object.values(CHALLENGES_TYPES)).description('Challenge type i.e 1=> PAID, 2=> UNPAID.'),
                distanceType: Joi.number().required().valid(...Object.values(DISTANCE_TYPE)).description('Challenge distace  type.'),
                amount: Joi.alternatives().conditional('challengeType', { is: CONSTANTS.CHALLENGES_TYPES.PAID, then: Joi.number().min(1), otherwise: Joi.number().optional() }),
            },
            group: 'Payment',
            description: 'Route to payment .',
            model: 'GetPaymentDetails'
        },
        auth: AVAILABLE_AUTHS.USER,
        handler:paymentController.getPayment
    },

];

module.exports = routes;




