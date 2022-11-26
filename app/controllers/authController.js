// "use strict";
const path = require('path');
const CONFIG = require('../../config');
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, LOGIN_TYPES, EMAIL_TYPES, TOKEN_TYPE, STATUS, USER_TYPES } = require('../utils/constants');
const SERVICES = require('../services');
const { compareHash, encryptJwt, createResetPasswordLink, sendEmail, createSetupPasswordLink, decryptJwt, hashPassword, sendSms } = require('../utils/utils');
const CONSTANTS = require('../utils/constants');
const qrCode = require('qrcode');
const fs = require('fs');

/**************************************************
 ***************** Auth controller ***************
 **************************************************/
let authController = {};

/**
 * function to check server.
 */
 authController.getServerResponse = async () => {
  throw HELPERS.responseHelper.createSuccessResponse(MESSAGES.SUCCESS);
}


/**
 * function to login a user to the system.
 */
 authController.loginUser = async (payload) => {

  // check is user exists in the database with provided email or not.
  let user = await SERVICES.userService.getUser({ email: payload.email }, { ...NORMAL_PROJECTION });
  // if user exists then compare the password that user entered.
  if (user) {
    // compare user's password.
    if (compareHash(payload.password, user.password)) {
      const dataForJwt = {
        id: user._id,
        date: Date.now()
      };
      delete user.password;
      let token = await encryptJwt(dataForJwt);
      let data = { userId: user._id, token: token, userType: user.userTYpe, }
      // create session for particular user
      await SERVICES.sessionService.createSession(data);
      return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.LOGGED_IN_SUCCESSFULLY), { token, user });
    }
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_PASSWORD, ERROR_TYPES.BAD_REQUEST);
  }
  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_EMAIL, ERROR_TYPES.BAD_REQUEST);
};

/**
 * funciton to send a link to registered email of an user who forgots his password.
 */
 authController.forgotPassword = async (payload) => {
  let requiredUser = await SERVICES.userService.getUser({ email: payload.email });
  if (requiredUser) {
    requiredUser.tokenType = CONSTANTS.TOKEN_TYPE.RESET_PASSWORD
    // create reset-password link.
    let resetPasswordLink = createResetPasswordLink({ id: requiredUser._id, tokenType: CONSTANTS.TOKEN_TYPE.RESET_PASSWORD });
    let linkParts = resetPasswordLink.split("/");
    payload.passwordToken = linkParts[linkParts.length - 1];
    let updatedUser = await SERVICES.userService.updateUser({ _id: requiredUser._id }, payload);

    // send forgot-password email to user.
    await sendEmail({
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      resetPasswordLink: resetPasswordLink
    }, EMAIL_TYPES.FORGOT_PASSWORD_EMAIL);
    return HELPERS.responseHelper.createSuccessResponse(MESSAGES.FORGOT_PASSWORD_EMAIL_SEND_SUCCESSFULLY)
  }
  return HELPERS.responseHelper.createErrorResponse(MESSAGES.NO_USER_FOUND);
};

/**
 * function to logout an user.
 */
 authController.logout = async (payload) => {
  //remove session of user
  await SERVICES.sessionService.removeSession({ token: payload.user.token });
  return HELPERS.responseHelper.createSuccessResponse(MESSAGES.LOGGED_OUT_SUCCESSFULLY);
};


/**
 * Function to reset password of user.
 * @param {*} payload
 */
 authController.resetPassword = async (payload) => {
  let decodedObj = decryptJwt(payload.token);
  //check wheather password is valid
  if (!decodedObj) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
  }
  if (decodedObj.tokenType !== TOKEN_TYPE.RESET_PASSWORD) throw HELPERS.responseHelper.createErrorResponse(MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
  // Get the user by passwordToken from database.
  let userData = await SERVICES.userService.getUser({ passwordToken: payload.token });
  if (!userData) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
  }
  // Update the user password if found in db.
  await SERVICES.userService.updateUser({ _id: userData._id }, { password: hashPassword(payload.password) }, NORMAL_PROJECTION);
  // Now delete the token from db.
  await SERVICES.userService.updateUser({ _id: userData._id }, { $unset: { passwordToken: 1 } });
  return HELPERS.responseHelper.createSuccessResponse(MESSAGES.PASSWORD_UPDATED_SUCCESSFULLY);
};

/**
 * Function to update password of admin.

 */
 authController.updatePassword = async (payload) => {
  //check if old  password given by user is correct
  if (!compareHash(payload.oldPassword, payload.user.password)) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.OLD_PASSWORD_INVALID, ERROR_TYPES.BAD_REQUEST);
  }
  await SERVICES.userService.updateUser({ _id: payload.user._id }, { password: hashPassword(payload.newPassword) }, NORMAL_PROJECTION);
  return HELPERS.responseHelper.createSuccessResponse(MESSAGES.PASSWORD_UPDATED_SUCCESSFULLY);
};


/* export userController */
module.exports = authController;
