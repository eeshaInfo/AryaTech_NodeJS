"use strict";
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, LOGIN_TYPES, EMAIL_TYPES, TOKEN_TYPE, STATUS, USER_TYPES, CHALLENGES_TYPES, TRANSACTION_STATUS, LEADERBOARD_CATEGORY } = require('../utils/constants');
const SERVICES = require('../services');
const { getPaginationConditionForAggregate } = require('../utils/utils');
const CONSTANTS = require('../utils/constants');

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
  if (isChallengeExists) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.CHALLENGE_ALREADY_EXISTS, ERROR_TYPES.BAD_REQUEST);
  }
  if (payload.type === CHALLENGES_TYPES.UNPAID) {
    payload.amount = 0;
  }
  payload.completedByUser = 0;
  //create challenge
  let data = await SERVICES.challengeService.create(payload);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_CREATED_SUCCESSFULLY), { data });
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
  if (!challenge) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
  }
  //check if challenge Name already exists or not
  let isChallengeExists = await SERVICES.challengeService.getChallenge({ distance: payload.distance, _id: { $ne: payload.challengeId } });
  if (isChallengeExists) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.CHALLENGE_ALREADY_EXISTS, ERROR_TYPES.DATA_NOT_FOUND);
  }
  if (payload.type === CHALLENGES_TYPES.UNPAID) {
    payload.amount = 0;
  }
  await SERVICES.challengeService.update({ _id: payload.challengeId }, payload);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_UPDATED_SUCCESSFULLY));
};

/**
 * Function to delete a challenge.
 */
challengeController.deleteChallenge = async (payload) => {
  // check if challenge id is valid or not
  let challenge = await SERVICES.challengeService.getChallenge({ _id: payload.challengeId, isDeleted: false });
  if (!challenge) {
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
  let sort = {};
  if (payload.sortKey) {
    sort[payload.sortKey] = payload.sortDirection;
  } else {
    sort['createdAt'] = -1;
  }
 if (payload.user.userType == CONSTANTS.USER_TYPES.ADMIN) {
    if (payload.isRecentKey) {
      let query = [
        {
          $match: { isDeleted: false }
        },
        {
          $sort: sort
        },
        {
          $skip: payload.skip
        },
        {
          $limit: payload.limit
        }
      ]
      let recentChallenges = await SERVICES.challengeService.challengeAggregate(query);
      let totalCounts = await SERVICES.challengeService.listCount({ isDeleted: false });
      return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { recentChallenges, totalCounts } });
    }
    else {
      let query = [
        {
          $addFields: {
            challengeNameString: {
              $toString: '$distance'
            }
          },
        },
        {
          $match: { isDeleted: false, ...(payload.searchKey && { challengeNameString: { $regex: payload.searchKey, $options: 'i' } }) },
        },
        {
          $sort: sort
        },
        {
          $skip: payload.skip
        },
        {
          $limit: payload.limit
        },
      ]
      let challenges = await SERVICES.challengeService.challengeAggregate(query);
      let countQuery = [
        {
          $addFields: {
            challengeNameString: {
              $toString: '$distance'
            }
          },
        },
        {
          $match: { isDeleted: false, ...(payload.searchKey && { challengeNameString: { $regex: payload.searchKey, $options: 'i' } }) },
        }
      ]
      let totalCounts = await SERVICES.challengeService.challengeAggregate(countQuery);
      return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { challenges, totalCounts: totalCounts.length } });
    }
  } else {
    let query = [
      {
        $match: { isDeleted: false },
      },
      {
        $sort: sort
      },
      {
        $addFields: {
          completed: 0
        }
      }

    ]
    let challenges = await SERVICES.challengeService.challengeAggregate(query);
    let totalCounts = await SERVICES.challengeService.listCount({ isDeleted: false });
    let walletData = await SERVICES.userService.getAddress({}, NORMAL_PROJECTION);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { challenges, totalCounts, walletData } });
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

  challenge.completedData = await SERVICES.challengeService.listUserChallenge({ challengeId: payload.challengeId, ...(payload.userId ? { userId: payload.userId } : { userId: payload.user._id }), });
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { challenge } });
};

/**
*function to completed challenges
*/

challengeController.completedChallenge = async (payload) => {
  payload.userId = payload.user._id;
  payload.completingDate = new Date();
  // complete a challenge for particular user
  if (payload.maxSpeed < payload.avgSpeed) {
    throw HELPERS.responseHelper.createSuccessResponse(MESSAGES.MAXSPEED_CANNOT_BE_LESS_THAN_AVG_SPEED);
  }

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
  // get user list by particular challenge
  let list = await SERVICES.challengeService.getUserByChallenges(payload);
  let totalCounts = list.length ? list[0].totalCount : 0;
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { list, totalCounts } });
};

/**
* Function to fetch user by particular challenge
*/
challengeController.getChallengesByUser = async (payload) => {
  // criteria by which challenge to be fetched
  // get all challenge by particular user
  let list = await SERVICES.challengeService.getChallengesByUser(payload);
  let totalCounts = list.length ? list[0].totalCount : 0
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { list, totalCounts } });
};

/**
* Function to fetch list challenge list for user
*/
challengeController.challengeListForUser = async (payload) => {
  // get challenge for specific user
  let userData = await SERVICES.challengeService.listUserChallenge({ userId: payload.user._id });
  payload.user.challenges = userData.map(data => data.challengeId);
  // get challenge list for particular user
  let query = [
    {
      $match: { isDeleted: false },
    },
    {
      $addFields: {
        isChallengeCompleted: { $cond: { if: { $in: ["$_id", payload.user.challenges] }, then: 1, else: 0 } }
      }
    },
    {
      $project: {
        "distance": 1,
        "type": 1,
        "distanceType": 1,
        "amount": 1,
        isChallengeCompleted: 1,
      }
    }
  ]
  let challenges = await SERVICES.challengeService.challengeAggregate(query);
  let walletData = await SERVICES.userService.getAddress({}, NORMAL_PROJECTION);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { challenges, walletData } });
};



//challenge history for a particular user
challengeController.history = async (payload) => {
  let criteria = {
    ...(payload.userId ? { userId: payload.userId } : { userId: payload.user._id }),
    ...(payload.completingDate && {
      completingDate: {
        $gte: new Date(moment(payload.completingDate).startOf('day')),
        $lte: new Date(moment(payload.completingDate).endOf('day'))
      }
    }),
  }

  //get challenge history data
  let query = [
    {
      $match: criteria,
    },
    { $lookup: { from: "challenges", localField: "challengeId", foreignField: "_id", as: "challengeData" } },
    { $unwind: "$challengeData" },
    { $sort: { 'updatedAt': 1 } },
    {
      $group: {
        _id: '$challengeId',
        challengeCompletedCount: {
          $sum: 1
        },
        "distance": { "$first": "$challengeData.distance" },
        "distanceType": { "$first": "$challengeData.distanceType" }
      }
    },
  ]
  //get challenge history data
  let challengeHistoryData = await SERVICES.challengeService.userChallengeAggregate(query);
  //get user stats
  let userStat = await SERVICES.userService.getUserStats(criteria)
  if (challengeHistoryData.length) {
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { data: { challengeHistoryData, userStat: userStat[0] } });
  }

  return HELPERS.responseHelper.createSuccessResponse(MESSAGES.NO_CHALLENGES_COMPLETED);


}



challengeController.calenderMark = async (payload) => {
  let query = [
    { $match: { userId: payload.user._id } },
    { $group: { _id: "$completingDate" } },
    { $project: { completingDate: "$_id" } },
    { $project: { _id: 0 } }
  ];
  let date = await SERVICES.challengeService.userChallengeAggregate(query);
  if (!date.length) {
    throw HELPERS.responseHelper.createSuccessResponse(MESSAGES.NO_CHALLENGES_COMPLETED);
  }
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.COMPLETED_CHALLENGES_DATE_FETCH_SUCCESSFULLY), { date })


}

/**
* Function to fetch leaderboard list
*/
challengeController.leaderboardList = async (payload) => {
  let criteria = {
    challengeId: payload.challengeId,
  }
  // add user contact in contact list
  if(Object.keys(payload.user).length) {
   payload.user.contacts.push(payload.user.mobileNumber);
  }

  let userCriteria = {
    ...(payload.leaderboardCategory == LEADERBOARD_CATEGORY.COUNTRY && { $eq: [payload.user.country, '$country'] }),
    ...(payload.leaderboardCategory == LEADERBOARD_CATEGORY.FRIEND) && { $in: ['$mobileNumber', payload.user.contacts] }
  }
  let dashboardData = await SERVICES.challengeService.getLeaderboardList(criteria, payload, userCriteria);

  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CHALLENGE_FETCHED_SUCCESSFULLY), { leaderboardCategory: payload.leaderboardCategory, data: { dashboardData } });

}

/* export challengeController */
module.exports = challengeController;