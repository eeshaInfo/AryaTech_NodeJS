"use strict";
const path = require('path');
const CONFIG = require('../../config');
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, LOGIN_TYPES, EMAIL_TYPES, TOKEN_TYPE, STATUS, USER_TYPES, CHALLENGES_TYPES, CHALLENGE_PROJECTION, TRANSACTION_STATUS } = require('../utils/constants');
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
  let paymentData = await SERVICES.paymentService.getPayment({ paymentID: payload.paymentID })
  if (!paymentData) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
  }

  if (payload.status == TRANSACTION_STATUS.APPROVE) {

  }
  else {

  }
  //let user = await SERVICES.userService.getUsers({ _id: payload.user._id })
  // if (!compareHash(payload.oldPassword, payload.user.password)) {
  //   throw HELPERS.responseHelper.createErrorResponse(MESSAGES.OLD_PASSWORD_INVALID, ERROR_TYPES.BAD_REQUEST);
  // }
  // else {
  //   await SERVICES.userService.updateUser({ _id: payload.user._id }, { password: hashPassword(payload.newPassword) }, NORMAL_PROJECTION);
  //   return HELPERS.responseHelper.createSuccessResponse(MESSAGES.PASSWORD_UPDATED_SUCCESSFULLY);
  // }

};

paymentController.acceptPayment = async (payload) => {
  let criteria = {
    _id: payload.challengeId,
  }

  let challengeDetails = await SERVICES.challengeService.getChallenge(criteria)
  let transactionDetails = {
    challengeId: payload.challengeId,
    coin: payload.coin,
    userId: payload.user._id,
    transactionID: payload.transactionID,
    status: CONSTANTS.TRANSACTION_STATUS.PENDING,
  }

  if (transactionDetails.coin === challengeDetails.amount) {
    let paymentDetails = await SERVICES.paymentService.updatePaymentDetails(transactionDetails)
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PAYMENT_SUCCESSFULLY_COMPLETED));
  }
  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.COIN_AMOUNT_NOT_MATCHED, ERROR_TYPES.DATA_NOT_FOUND);

}


/* export challengeController */
module.exports = paymentController;