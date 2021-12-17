"use strict";
const path = require('path');
const CONFIG = require('../../config');
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, LOGIN_TYPES, EMAIL_TYPES, TOKEN_TYPE, STATUS, USER_TYPES, CHALLENGES_TYPES, CHALLENGE_PROJECTION } = require('../utils/constants');
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
  //let isChallengeExists = await SERVICES.challengeService.getChallenge({ challengeName: payload.challengeName,isDeleted: false });
  //if (!isChallengeExists) {
  let data = await SERVICES.challengeService.create(payload);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_CREATED_SUCCESSFULLY), { data });
  //}
  //throw HELPERS.responseHelper.createErrorResponse(MESSAGES.CHALLENGE_ALREADY_EXISTS, ERROR_TYPES.BAD_REQUEST);
};

/**
 * function to get a dashboard data.
 */
challengeController.dashBoardData = async (payload) => {
  let totalChallenge = await SERVICES.challengeService.listCount({ isDeleted: false });
  let totalUser = await SERVICES.userService.getCountOfUsers({ userType: USER_TYPES.USER });
  let paidChallenge = await SERVICES.challengeService.listCount({ isDeleted: false, challengeType: CHALLENGES_TYPES.PAID });
  let blockUser = await SERVICES.userService.getCountOfUsers({ userType: USER_TYPES.USER, status: STATUS.BLOCK });
  let recentChallenges = await SERVICES.challengeService.listChallenge({ isDeleted: false });;
  let data = { totalChallenge, totalUser, paidChallenge, blockUser, recentChallenges }
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DASHBOARD_DATA_FETCHED), { data });

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
    await SERVICES.challengeService.update({ _id: payload.id }, { isDeleted: true });
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_DELETED_SUCCESSFULLY));
  }
  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
};

/**
 * Function to fetch list of chaalenges
 */
challengeController.list = async (payload) => {
  let challenges = await SERVICES.challengeService.getAllChallenges({ isDeleted: false }, { skip: payload.skip, ...(payload.limit && { limit: payload.limit }) });
  let totalCounts = await SERVICES.challengeService.listCount({ isDeleted: false });
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { challenges, totalCounts } });
};


/**
 * Function to fetch list of users completed task
 */
challengeController.getChallengeById = async (payload) => {
  let challenge = await SERVICES.challengeService.getChallenge({ _id: payload.id });
  console.log(challenge);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { challenge } });
};



/**
* Function to fetch list of challenges to user
*/
challengeController.getUserChallenge = async (payload) => {
  let challenges = await SERVICES.challengeService.getAllChallenges({ isDeleted: false }, { skip: payload.skip, ...(payload.limit && { limit: payload.limit }) });
  let totalCounts = await SERVICES.challengeService.listCount({ isDeleted: false });
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { challenges, totalCounts } });
};


/**
*function to completed challenges
*/

challengeController.completedChallenge = async (payload) => {
  let challenge = await SERVICES.challengeService.getUserChallengeBasedOnCriteria({ userId: payload.user._id, challengeId: payload.id });
  console.log("Challenges.....>", challenge)
  if (challenge) {
    await SERVICES.challengeService.createUserChallenge(payload);
    await SERVICES.challengeService.update({ _id: payload.id }, { $inc: { completed: 1 } });
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_UPDATED_SUCCESSFULLY));
  }
  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
};


/* export challengeController */
module.exports = challengeController;