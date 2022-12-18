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
 ***************** Franchaise controller ***************
 **************************************************/
let franchaiseController = {};

/**
 * function to register a franchaise
 */
franchaiseController.registerNewFranchaise = async (payload) => {
  let isUserAlreadyExist = await SERVICES.franchaiseService.getFranchaise({userId: payload.userId})
  if(!isUserAlreadyExist){
    let lastCenterRecord = await SERVICES.franchaiseService.getLatestRecord({ isDeleted: {$ne:true}} )
    console.log('last Center Details', lastCenterRecord)
    if(lastCenterRecord){
        let lastCenterCode = lastCenterRecord.centerCode
        let newCenterCode = ('00' + (parseInt(lastCenterCode.slice(3))+1)).slice(-3)
        payload.centerCode = `ACE${newCenterCode}`
        console.log('------->Payload for Center',payload)
    }else{
      payload.centerCode = 'ACE001' 
    }
    let data = await SERVICES.franchaiseService.create(payload);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.FRANCHAISE_CREATED_SUCCESSFULLY),{data});
  }
  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.USER_ALREADY_ACTIVE, ERROR_TYPES.ALREADY_EXISTS);
}

/**
 * function to update franchaise details
 * @param {*} payload 
 */
franchaiseController.udpateFranchaise = async(payload)=>{
  let criteria = { _id:payload._id };
  let data = await SERVICES.franchaiseService.update(criteria,payload,{ ...NORMAL_PROJECTION, password: 0, passwordToken: 0 })
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DATA_UPDATED_SUCCESSFULLY),{data})
}


franchaiseController.getFranchaise = async(payload)=>{
    let criteria = {_id: payload._id};
    let data = await SERVICES.franchaiseService.getUser(criteria,{...NORMAL_PROJECTION })
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.SUCCESS),{data})

}
/**
 * Function to get admin data.
 */
// franchaiseController.getAdminProfile = async (payload) => {
//   //get user profile
//   let user = await SERVICES.franchaiseService.getUser({ _id: payload.user._id }, { ...NORMAL_PROJECTION})
//   return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PROFILE_FETCHED_SUCCESSFULLY), { data: user });
// };

/**
 * Function to get user data 
 */
franchaiseController.list = async (payload) => {
  let criteria={ isDeleted : false, userType: USER_TYPES.ADMIN }
  let regex = new RegExp(payload.searchKey, 'i');
   criteria = {
     $or: [ { name: regex } ] 
  }
  //get user list with search and sort
  let sort = {};
  if (payload.sortKey) {
    sort[payload.sortKey] = payload.sortDirection;
  } else {
    sort['createdAt'] = -1;
  }
  let query = [
    { $match: matchCriteria },
    { $sort: sort },
    { $skip: payload.skip },
    { $limit: payload.limit },
    { $project: {"password": 0} },
  ]
  let franchaiseList = await SERVICES.franchaiseService.userAggregate(query);
  let count = await SERVICES.franchaiseService.getCount(criteria)
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.FRANCHAISE_FETCHED_SUCCESSFULLY), { franchaiseList,count })
}

/**
 * user list for dropdown
 * @param {*} payload 
 * @returns 
 */
franchaiseController.franchaiseDropdown = async (payload) => {
  let list = await SERVICES.franchaiseService.getAll({}, { centerCode: 1, name:1 })
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.FRANCHAISE_FETCHED_SUCCESSFULLY), { list })
}


franchaiseController.userStatus = async (payload) => {
  await SERVICES.franchaiseService.updateUserStatus({ _id: payload.userId }, { status: payload.status })
}
/* export franchaiseController */
module.exports = franchaiseController;
