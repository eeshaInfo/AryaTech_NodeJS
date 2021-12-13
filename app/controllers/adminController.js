"use strict";
const path = require('path');
const CONFIG = require('../../config');
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, LOGIN_TYPES, EMAIL_TYPES, TOKEN_TYPE, STATUS } = require('../utils/constants');
const SERVICES = require('../services');
const { compareHash, encryptJwt, createResetPasswordLink, sendEmail, createSetupPasswordLink, decryptJwt, hashPassword } = require('../utils/utils');
const CONSTANTS = require('../utils/constants');

/**************************************************
 ***************** user controller ***************
 **************************************************/
let adminController = {};

/**
 * function to check server.
 */
adminController.getServerResponse = async (payload) => {
    throw HELPERS.responseHelper.createSuccessResponse(MESSAGES.SUCCESS);
}

/**
 * function to login a user to the system.
 */
adminController.loginUser = async (payload) => {
    // check is user exists in the database with provided email or not.
    let user = await SERVICES.userService.getUser({ email: payload.email, status: CONSTANTS.STATUS.ACTIVE }, { ...NORMAL_PROJECTION, openSheets: 0, passwordToken: 0 });
    // if user exists then compare the password that user entered.
    if (user) {
        // compare user's password.
        if (compareHash(payload.password, user.password)) {
            const dataForJwt = {
                id: user._id,
                date: Date.now()
            };
            delete user.password;
            return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.LOGGED_IN_SUCCESSFULLY), { token: encryptJwt(dataForJwt), user });
        }
        throw HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_PASSWORD, ERROR_TYPES.BAD_REQUEST);
    }
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_EMAIL, ERROR_TYPES.BAD_REQUEST);
};



/* export adminController */
module.exports = adminController;