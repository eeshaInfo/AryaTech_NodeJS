const CONFIG = require('../../config');
const { paymentModel } = require(`../models`);

let paymentService = {};

/**
 * function to update a payment detail.
 */
paymentService.updateSession = async (criteria, dataToUpdate) => {
    return await paymentModel.findOneAndUpdate(criteria, dataToUpdate, { new: true, upsert: true }).lean();
};

/**
 * function to get payment detail.
 */
paymentService.getPayment = async (criteria) => {
    return await paymentModel.findOne(criteria).lean();
};

/**
 * function to get payment list.
 */
paymentService.getPayment = async (criteria) => {
    return await paymentModel.find(criteria).lean();
};


paymentService.updatePaymentDetails = async (dataToInsert) => {
    return await paymentModel.create(dataToInsert)
}



module.exports = paymentService;