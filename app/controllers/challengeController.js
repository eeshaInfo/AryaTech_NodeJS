"use strict";
const path = require('path');
const CONFIG = require('../../config');
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, LOGIN_TYPES, EMAIL_TYPES, TOKEN_TYPE, STATUS } = require('../utils/constants');
const SERVICES = require('../services');
const { compareHash, encryptJwt, createResetPasswordLink, sendEmail, createSetupPasswordLink, decryptJwt, hashPassword } = require('../utils/utils');
const CONSTANTS = require('../utils/constants');

/**************************************************
 ***************** challenges controller ***************
 **************************************************/
let challengeController = {};

/**
 * function to check server.
 */
challengeController.getServerResponse = async (payload) => {
  throw HELPERS.responseHelper.createSuccessResponse(MESSAGES.SUCCESS);
}

/**
 * function to create a chaalenge.
 */
challengeController.create = async (payload) => {
//   let isChallengeExists = await SERVICES.challengeService.getChallenge({ challengeName: payload.challengeName });
//   if (!isChallengeExists) {
    let data = await SERVICES.challengeService.create(payload);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_CREATED_SUCCESSFULLY), { data });
 // }
  //throw HELPERS.responseHelper.createErrorResponse(MESSAGES.CHALLENGE_ALREADY_EXISTS, ERROR_TYPES.BAD_REQUEST);
};

/**
 * function to update a challenge.
 */
challengeController.updateChallenge = async (payload) => {
    let challenge = await SERVICES.challengeService.getChallenge({ _id: payload.id });
    if (challenge) {
      await SERVICES.challengeService.update({ _id: payload.id }, payload);
      return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_UPDATED_SUCCESSFULLY));
    }
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
  };

/**
 * Function to delete a challenge.
 */
challengeController.delete = async (payload) => {
  let challenge = await SERVICES.challengeService.getChallenge({ _id: payload.id });
  if (challenge) {
    await SERVICES.challengeService.update({ _id: payload.id }, {isDeleted: true});
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_DELETED_SUCCESSFULLY));
  }
  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
};

/**
 * Function to fetch list of chaalenges
 */
challengeController.list = async (payload) => {
    let user = await SERVICES.userService.getUser({ _id: payload.user._id }, { ...NORMAL_PROJECTION, password: 0 });
    if (user) {
      return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PROFILE_FETCHED_SUCCESSFULLY), { data: user });
    }
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
  };




/* export challengeController */
module.exports = challengeController;