"use strict";
const path = require('path');
const CONFIG = require('../../config');
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, LOGIN_TYPES, EMAIL_TYPES, TOKEN_TYPE, STATUS, USER_TYPES, CHALLENGES_TYPES, CHALLENGE_PROJECTION } = require('../utils/constants');
const SERVICES = require('../services');
const { compareHash, encryptJwt, createResetPasswordLink, sendEmail, createSetupPasswordLink, decryptJwt, hashPassword } = require('../utils/utils');
const CONSTANTS = require('../utils/constants');
const { CHALLENGE_ALREADY_EXISTS } = require('../utils/messages');

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
challengeController.createChallenge = async (payload) => {
  let isChallengeExists = await SERVICES.challengeService.getChallenge({ challengeName: payload.challengeName, isDeleted: false });
  if (!isChallengeExists) {
    if (payload.challengeType === CHALLENGES_TYPES.UNPAID) {
      payload.amount = 0;
    }
    payload.completed = 0;
    let data = await SERVICES.challengeService.create(payload);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_CREATED_SUCCESSFULLY), { data });
  }
  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.CHALLENGE_ALREADY_EXISTS, ERROR_TYPES.BAD_REQUEST);
};

/**
 * function to get a dashboard data.
 */
challengeController.dashBoardData = async (payload) => {
  let totalChallenge = await SERVICES.challengeService.listCount({ isDeleted: false });
  let totalUser = await SERVICES.userService.getCountOfUsers({ userType: USER_TYPES.USER });
  let paidChallenge = await SERVICES.challengeService.listCount({ isDeleted: false, challengeType: CHALLENGES_TYPES.PAID });
  let blockUser = await SERVICES.userService.getCountOfUsers({ userType: USER_TYPES.USER, status: STATUS.BLOCK });
  let data = { totalChallenge, totalUser, paidChallenge, blockUser }
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DASHBOARD_DATA_FETCHED), { data });

};

/**
 * function to update a challenge.
 */
challengeController.updateChallenge = async (payload) => {
  let challenge = await SERVICES.challengeService.getChallenge({ _id: payload.challengeId });
  let isChallengeExists = await SERVICES.challengeService.getChallenge({ challengeName: payload.challengeName, _id: { $ne: payload.challengeId } });
  if (!isChallengeExists) {
    if (challenge) {
      if (payload.challengeType === CHALLENGES_TYPES.UNPAID) {
        payload.amount = 0;
      }
      await SERVICES.challengeService.update({ _id: payload.challengeId }, payload);
      return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_UPDATED_SUCCESSFULLY));
    }
  }

  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.CHALLENGE_ALREADY_EXISTS, ERROR_TYPES.DATA_NOT_FOUND);
};

/**
 * Function to delete a challenge.
 */
challengeController.deleteChallenge = async (payload) => {
  let challenge = await SERVICES.challengeService.getChallenge({ _id: payload.id });
  let paidChallenge = await SERVICES.paymentService.getPayment({ challengeId: payload.id })
  if (paidChallenge || challenge.completed>0) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.CHALLENGE_CANNOT_DELETED, ERROR_TYPES.BAD_REQUEST);
  }
  await SERVICES.challengeService.update({ _id: payload.id }, { isDeleted: true });
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_DELETED_SUCCESSFULLY));

};

/**
 * Function to fetch list of chaalenges
 */
challengeController.list = async (payload) => {
  if (payload.isRecentKey) {
    let recentChallenges = await SERVICES.challengeService.listChallenge({ isDeleted: false }, { skip: payload.skip, ...(payload.limit && { limit: payload.limit }), sortKey: payload.sortKey, sortDirection: payload.sortDirection });
    let totalCounts = await SERVICES.challengeService.listCount({ isDeleted: false });
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { recentChallenges, totalCounts } });
  }
  else {
    let challenges = await SERVICES.challengeService.getAllChallenges({ isDeleted: false, ...(payload.searchKey && { challengeName: { $regex: payload.searchKey, $options: 'i' } }) }, { skip: payload.skip, ...(payload.limit && { limit: payload.limit }), sortKey: payload.sortKey, sortDirection: payload.sortDirection });
    let totalCounts = await SERVICES.challengeService.listCount({ isDeleted: false, ...(payload.searchKey && { challengeName: { $regex: payload.searchKey, $options: 'i' } }) });
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { challenges, totalCounts } });
  }
};


/**
 * Function to fetch list of users completed task
 */
challengeController.getChallengeById = async (payload) => {
  let challenge = await SERVICES.challengeService.getChallenge({ _id: payload.id });
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { challenge } });
};

/**
*function to completed challenges
*/

challengeController.completedChallenge = async (payload) => {
  let challenge = await SERVICES.challengeService.getUserChallengeBasedOnCriteria({ userId: payload.user._id, challengeId: payload.id });
  //if (!challenge) {
  payload.userId = payload.user._id;
  payload.challengeId = payload.id;
  payload.completingDate = new Date();
  await SERVICES.challengeService.createUserChallenge(payload);
  //let challenge = await SERVICES.challengeService.getUserChallengeBasedOnCriteria({ userId: payload.user._id, challengeId: payload.id });
  if (!challenge) {
    await SERVICES.challengeService.update({ _id: payload.id }, { $inc: { completed: 1 } });
    await SERVICES.userService.updateUser({ _id: payload.user._id }, { $inc: { challengeCompleted: 1 } });
  }
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_COMPLETED_SUCCESSFULLY));
  //}
  //throw HELPERS.responseHelper.createErrorResponse(MESSAGES.CHALLENGE_ALREADY_COMPLETED, ERROR_TYPES.BAD_REQUEST);
};


/**
* Function to fetch user for particular challange
*/
challengeController.getUserByChallenges = async (payload) => {
  let criteria = {
    challengeId: payload.id
  }
  let list = await SERVICES.challengeService.getUserByChallenges(payload);
  let totalCounts = await SERVICES.challengeService.getUserCountByChallenge(criteria);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { list, totalCounts } });
};

/**
* Function to fetch user by particular challenge
*/
challengeController.getChallengesByUser = async (payload) => {
  let criteria = {
    userId: payload.id
  }
  let list = await SERVICES.challengeService.getChallengesByUser(payload, { skip: payload.skip, limit: payload.limit });
  let totalCounts = await SERVICES.challengeService.getUserCountByChallenge(criteria);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { list, totalCounts } });
};

/* export challengeController */
module.exports = challengeController;