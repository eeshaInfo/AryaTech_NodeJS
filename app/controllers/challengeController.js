"use strict";
const path = require('path');
const CONFIG = require('../../config');
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, LOGIN_TYPES, EMAIL_TYPES, TOKEN_TYPE, STATUS, USER_TYPES, CHALLENGES_TYPES, TRANSACTION_STATUS, LEADERBOARD_CATEGORY } = require('../utils/constants');
const SERVICES = require('../services');
const { compareHash, encryptJwt, createResetPasswordLink, sendEmail, createSetupPasswordLink, decryptJwt, hashPassword } = require('../utils/utils');
const CONSTANTS = require('../utils/constants');
const { CHALLENGE_ALREADY_EXISTS } = require('../utils/messages');

const moment = require('moment-timezone');
/**************************************************
 ***************** challenges controller ***************
 **************************************************/
let challengeController = {};

/**
 * function to create a chaalenge.
 */
challengeController.createChallenge = async (payload) => {
  //check if challenge exists with same name or not
  let isChallengeExists = await SERVICES.challengeService.getChallenge({ distance: payload.distance, isDeleted: false });
  if (!isChallengeExists) {
    if (payload.type === CHALLENGES_TYPES.UNPAID) {
      payload.amount = 0;
    }
    payload.completedByUser = 0;
    //create challenge
    let data = await SERVICES.challengeService.create(payload);
  //   await SERVICES.fcmNotificationService.pushreNotification({
  //     data: {'body':'abc'},
  //     webpush: {
  //         headers: {
  //             image: ''
  //         },
  //         // fcm_options: {
  //         //     link: `${CONFIG.CLIENT_URL}/${location.code && location.code.toLowerCase()}/go/${affiliateLinkObj.affiliateKey}`
  //         // }
  //     },
  //     topic: 'abcd'
  // });
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_CREATED_SUCCESSFULLY), { data });
  }
  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.CHALLENGE_ALREADY_EXISTS, ERROR_TYPES.BAD_REQUEST);
};

/**
 * function to get a dashboard data.
 */
challengeController.dashBoardData = async (payload) => {
  //get count of total challenges
  let totalChallenge = await SERVICES.challengeService.listCount({ isDeleted: false });
  //get count of total user
  let totalUser = await SERVICES.userService.getCountOfUsers({ userType: USER_TYPES.USER });
  // get count of paid challenges
  let paidChallenge = await SERVICES.challengeService.listCount({ isDeleted: false, type: CHALLENGES_TYPES.PAID });
  // get count of block user
  let blockUser = await SERVICES.userService.getCountOfUsers({ userType: USER_TYPES.USER, status: STATUS.BLOCK });
  let data = { totalChallenge, totalUser, paidChallenge, blockUser }
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DASHBOARD_DATA_FETCHED), { data });

};

/**
 * function to update a challenge.
 */
challengeController.updateChallenge = async (payload) => {
  //check if challengeId is valid  or not
  let challenge = await SERVICES.challengeService.getChallenge({ _id: payload.challengeId, isDeleted: false });
  if(!challenge) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
  }
  //check if challenge Name already exists or not
  let isChallengeExists = await SERVICES.challengeService.getChallenge({ distance: payload.distance, _id: { $ne: payload.challengeId } });
  if (!isChallengeExists) {
    if (payload.type === CHALLENGES_TYPES.UNPAID) {
      payload.amount = 0;
    }
    await SERVICES.challengeService.update({ _id: payload.challengeId }, payload);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_UPDATED_SUCCESSFULLY));
  }

  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.CHALLENGE_ALREADY_EXISTS, ERROR_TYPES.DATA_NOT_FOUND);
};

/**
 * Function to delete a challenge.
 */
challengeController.deleteChallenge = async (payload) => {
  // check if challenge id is valid or not
  let challenge = await SERVICES.challengeService.getChallenge({ _id: payload.challengeId, isDeleted: false });
  if(!challenge) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
  }
  let paidChallenge = await SERVICES.paymentService.getPayment({ challengeId: payload.challengeId, status: { $ne: TRANSACTION_STATUS.REJECT } })
  // challenge with completed field and payments cannot be deleted
  if ((challenge && !challenge.completedByUser) && !paidChallenge) {
    await SERVICES.challengeService.update({ _id: payload.challengeId }, { isDeleted: true });
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_DELETED_SUCCESSFULLY));
  }
  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.CHALLENGE_CANNOT_DELETED, ERROR_TYPES.BAD_REQUEST);
}

/**
 * Function to fetch list of chaalenges
 */
challengeController.list = async (payload) => {
  if (payload.user.userType == CONSTANTS.USER_TYPES.ADMIN) {
    if (payload.isRecentKey) {
      let recentChallenges = await SERVICES.challengeService.listChallenge({ isDeleted: false }, { skip: payload.skip, ...(payload.limit && { limit: payload.limit }), sortKey: payload.sortKey, sortDirection: payload.sortDirection });
      let totalCounts = await SERVICES.challengeService.listCount({ isDeleted: false });
      return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { recentChallenges, totalCounts } });
    }
    else {
      let challenges = await SERVICES.challengeService.getAllChallenges({ isDeleted: false, ...(payload.searchKey && { challengeNameString: { $regex: payload.searchKey, $options: 'i' } }) }, { skip: payload.skip, ...(payload.limit && { limit: payload.limit }), sortKey: payload.sortKey, sortDirection: payload.sortDirection });
      let totalCounts = await SERVICES.challengeService.listCountForDashboard({ isDeleted: false, ...(payload.searchKey && { challengeNameString: { $regex: payload.searchKey, $options: 'i' } }) });
      return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { challenges, totalCounts } });
    }
  } else {
    let challenges = await SERVICES.challengeService.getAllGuestChallenges({ isDeleted: false });
    let totalCounts = await SERVICES.challengeService.listCountForDashboard({ isDeleted: false });
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { challenges, totalCounts } });
  }
};



/**
 * Function to fetch list of users completed task
 */
challengeController.getChallengeById = async (payload) => {
  let challenge = await SERVICES.challengeService.getChallenge({ _id: payload.challengeId, isDeleted: false });
  // get challenge data for admin
  if ((payload.user && payload.user.userType == CONSTANTS.USER_TYPES.ADMIN) || !Object.keys(payload.user).length) {
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { challenge } });
  }

  challenge.completedData = await SERVICES.challengeService.listUserChallenge({ challengeId: payload.challengeId, ...(payload.userId ? { userId: payload.userId } : {userId: payload.user._id}) });
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { challenge } });
};

/**
*function to completed challenges
*/

challengeController.completedChallenge = async (payload) => {
  payload.userId = payload.user._id;
  payload.completingDate = new Date();
  // complete a challenge for particular user
  await SERVICES.challengeService.createUserChallenge(payload);
  await SERVICES.challengeService.update({ _id: payload.challengeId }, { $inc: { completedByUser: 1 } });
  await SERVICES.userService.updateUser({ _id: payload.user._id }, { $inc: { challengeCompleted: 1 } });
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_COMPLETED_SUCCESSFULLY));
  //}
  //throw HELPERS.responseHelper.createErrorResponse(MESSAGES.CHALLENGE_ALREADY_COMPLETED, ERROR_TYPES.BAD_REQUEST);
};


/**
* Function to fetch user for particular challange
*/
challengeController.getUserByChallenges = async (payload) => {
  let criteria = {
    challengeId: payload.challengeId
  }
  // get user list by particular challenge
  let list = await SERVICES.challengeService.getUserByChallenges(payload);
  let totalCounts = await SERVICES.challengeService.getUserCountByChallenge(criteria);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { list, totalCounts } });
};

/**
* Function to fetch user by particular challenge
*/
challengeController.getChallengesByUser = async (payload) => {
  // criteria by which challenge to be fetched
  let criteria = {
    userId: payload.userId
  }
  // get all challenge by particular user
  let list = await SERVICES.challengeService.getChallengesByUser(payload, { skip: payload.skip, limit: payload.limit });
  let totalCounts = await SERVICES.challengeService.getUserCountByChallenge(criteria);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { list, totalCounts } });
};

/**
* Function to fetch list challenge list for user
*/
challengeController.challengeListForUser = async (payload) => {
  // get challenge for specific user
  let userData = await SERVICES.challengeService.listUserChallenge({userId: payload.user._id});
  payload.user.challenges = userData.map(data => data.challengeId);
  // get challenge list for particular user
  let challenges = await SERVICES.challengeService.getChallengeListForUser(payload);
  //let totalCounts = await SERVICES.challengeService.getUserCountByChallenge(criteria);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { challenges } });
};



//challenge history for a particular user
challengeController.history = async (payload) => {
  let criteria = {
    ...(payload.userId ? { userId: payload.userId } : {userId: payload.user._id}),
    ...(payload.completingDate && { completingDate: { 
      $gte: new Date(moment(payload.completingDate).startOf('day')), 
      $lte: new Date(moment(payload.completingDate).endOf('day'))
    } }),
  }

  //get challenge history data
  let challengeHistoryData = await SERVICES.challengeService.getHistory(criteria);
  //get user stats
  let userStat = await SERVICES.userService.getUserStats(criteria)
  if (challengeHistoryData.length) 
{
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { challengeHistoryData, userStat: userStat[0] } });
  }

  return HELPERS.responseHelper.createSuccessResponse(MESSAGES.NO_CHALLENGES_COMPLETED);


}


/**
* Function to fetch leaderboard list
*/
challengeController.leaderboardList = async (payload) => {
  //...(payload.limit && { limit: payload.limit })
  let criteria = {
    challengeId: payload.challengeId
  }
  let userCriteria = {
    ...(payload.leaderboardCategory == LEADERBOARD_CATEGORY.COUNTRY && { $eq: [payload.user.country, '$country']} ),
    ...(payload.leaderboardCategory == LEADERBOARD_CATEGORY.FRIEND) && { $in: ['$mobileNumber',payload.user.contacts]}
  }
  console.log(userCriteria);
  let dashboardData = await SERVICES.challengeService.getLeaderboardList(criteria, payload , userCriteria);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { dashboardData } });



};

/* export challengeController */
module.exports = challengeController;