"use strict";
const path = require('path');
const CONFIG = require('../../config');
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, LOGIN_TYPES, EMAIL_TYPES, TOKEN_TYPE, STATUS, USER_TYPES, CHALLENGES_TYPES, TRANSACTION_STATUS } = require('../utils/constants');
const SERVICES = require('../services');
const { compareHash, encryptJwt, createResetPasswordLink, sendEmail, createSetupPasswordLink, decryptJwt, hashPassword } = require('../utils/utils');
const CONSTANTS = require('../utils/constants');
const { CHALLENGE_ALREADY_EXISTS } = require('../utils/messages');

/**************************************************
 ***************** Payment controller ***************
 **************************************************/
let paymentController = {};


/**
 * Function to approve or reject payment
 */
paymentController.approveOrRejectPayment = async (payload) => {
  let paymentData = await SERVICES.paymentService.getPayment({ _id: payload.id })
  if (!paymentData) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
  }
  if (paymentData.status == TRANSACTION_STATUS.APPROVE) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.PAYMENT_ALREADY_APPROVED, ERROR_TYPES.DATA_NOT_FOUND);
  }
  else if (paymentData.status == TRANSACTION_STATUS.REJECT) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.PAYMENT_ALREADY_REJECTED, ERROR_TYPES.DATA_NOT_FOUND);
  }
  if (payload.status == TRANSACTION_STATUS.APPROVE) {
    await SERVICES.paymentService.updatePayment({ _id: paymentData._id }, { status: TRANSACTION_STATUS.APPROVE })
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PAYMENT_APPROVED));
  }
  else {
    await SERVICES.paymentService.updatePayment({ _id: paymentData._id }, { status: TRANSACTION_STATUS.REJECT })
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PAYMENT_REJECTED));
  }
};

paymentController.acceptPayment = async (payload) => {

  // if transection id is not there
  if (!payload.transactionID) {
    let paymentData = await SERVICES.paymentService.getPayment({ challengeId: payload.challengeId, userId: payload.user._id });
    if (paymentData) {
      return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PAYMENT_FOUND), { isTransactionFound: true, data: paymentData });
    }
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.NOT_FOUND), { isTransactionFound: false });
  }

  // if there is transection id
  let criteria = {
    _id: payload.challengeId,
    type: CHALLENGES_TYPES.UNPAID
  }

  let challengeDetails = await SERVICES.challengeService.getChallenge(criteria);
  if (challengeDetails) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_CHALLENGE_TYPE, ERROR_TYPES.BAD_REQUEST);
  }

  let data = await SERVICES.paymentService.getPayment({ challengeId: payload.challengeId, transactionID: payload.transactionID, userId: payload.user._id, status: { $ne: TRANSACTION_STATUS.REJECT } });
  if (data) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.PAYMENT_ALREADY_COMPLETED, ERROR_TYPES.BAD_REQUEST);
  }

  let transactionDetails = {
    challengeId: payload.challengeId,
    userId: payload.user._id,
    transactionID: payload.transactionID,
    status: CONSTANTS.TRANSACTION_STATUS.PENDING,
  }
  await SERVICES.paymentService.updatePaymentDetails(transactionDetails)
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PAYMENT_SUCCESSFULLY_COMPLETED));

}


paymentController.getPaymentList = async (payload) => {
  let paymentDetails = await SERVICES.paymentService.getPaymentDetails({ skip: payload.skip, limit: payload.limit, search: payload.searchKey, sortKey: payload.sortKey, sortDirection: payload.sortDirection })
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PAYMENT_LIST_FETCHED_SUCCESSFULLY), { data: paymentDetails });
}
/* export challengeController */
module.exports = paymentController;