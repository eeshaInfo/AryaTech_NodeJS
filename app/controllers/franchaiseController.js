// "use strict";
const path = require('path');
const CONFIG = require('../../config');
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, LOGIN_TYPES, EMAIL_TYPES, TOKEN_TYPE, STATUS, USER_TYPES } = require('../utils/constants');
const {franchaiseModel} = require('../models')
const {dbService} = require('../services')
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
  let isUserAlreadyExist = await dbService.findOne(franchaiseModel,{userId: payload.userId})
  // if(!isUserAlreadyExist){
    let data = await SERVICES.franchaiseService.create(payload);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.FRANCHAISE_CREATED_SUCCESSFULLY),{data});
  // }
  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.USER_IS_ALREADY_ADMIN_OF_OTHER_FRANCHAISE, ERROR_TYPES.ALREADY_EXISTS);
}

/**
 * function to update franchaise details
 * @param {*} payload 
 */
franchaiseController.udpateFranchaise = async(payload)=>{
  let criteria = { _id:payload._id };
  let data = await dbService.findOneAndUpdate(franchaiseModel,criteria,payload)
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DATA_UPDATED_SUCCESSFULLY),{data})
}


franchaiseController.getFranchaise = async(payload)=>{
    let criteria = {_id: payload._id};
    let data = await dbService.findOne(franchaiseModel,criteria,{...NORMAL_PROJECTION })
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.SUCCESS),{data})

}

/**
 * Function to get user data 
 */
franchaiseController.list = async (payload) => {
  let criteria={ isDeleted : {$ne:true} }
  let regex = new RegExp(payload.searchKey, 'i');
  let matchCriteria = {
    $and: [{ $or: [{ name: regex }, { mobileNumber: regex }] },criteria ]}
  //get user list with search and sort
  let sort = {};
  if (payload.sortKey) {
    sort[payload.sortKey] = payload.sortDirection;
  } else {
    sort['createdAt'] = -1;
  }
  let query = [
    { $match: matchCriteria },
    {$lookup:{
      from: "users",
      localField: "userId",
      foreignField:"_id",
      as:"userData"
    }},
    {$unwind:{path: "$userData", preserveNullAndEmptyArrays: true}},
    { $sort: sort },
    { $skip: payload.skip },
    { $limit: payload.limit },
    { $project: 
      {
        "centerCode": 1,
        "name": 1,
        "address": 1,
        "status" : 1,
        "regDate" : 1,
        "centerAdminName":"$userData.name",
        "centerAdminEmail":"$userData.email",
        "centerAdminMobile":"$userData.mobileNumber"
      } },
  ]
  let franchaiseList = await dbService.aggregate(franchaiseModel,query);
  let count = await SERVICES.franchaiseService.getCount(criteria)
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.FRANCHAISE_FETCHED_SUCCESSFULLY), { franchaiseList,count })
}

/**
 * user list for dropdown
 * @param {*} payload 
 * @returns 
 */
franchaiseController.franchaiseDropdown = async (payload) => {
  let list = await dbService.find(franchaiseModel,{}, { centerCode: 1, name:1 })
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.FRANCHAISE_FETCHED_SUCCESSFULLY), { list })
}


franchaiseController.userStatus = async (payload) => {
  await dbService.findOneAndUpdate(franchaiseModel,{ _id: payload.userId }, { status: payload.status })
}
/* export franchaiseController */
module.exports = franchaiseController;
