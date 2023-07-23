// "use strict";
const path = require('path');
const CONFIG = require('../../config');
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, LOGIN_TYPES, EMAIL_TYPES, TOKEN_TYPE, STATUS, USER_TYPES } = require('../utils/constants');
const {franchiseModel, userModel} = require('../models')
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
 * function to register a franchise
 */
franchaiseController.registerNewFranchaise = async (payload) => {
  let alreadyExists = await dbService.findOne(franchiseModel,{centerCode: payload.centerCode})
  if(!alreadyExists){
    let data = await dbService.create(franchiseModel,payload);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.FRANCHAISE_CREATED_SUCCESSFULLY),{data});
  }
  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.ALREADY_EXISTS, ERROR_TYPES.ALREADY_EXISTS);
}

/**
 * function to update franchise details
 * @param {*} payload 
 */
franchaiseController.udpateFranchaise = async(payload)=>{
  let criteria = { _id:payload._id };
  let data = await dbService.findOneAndUpdate(franchiseModel,criteria,payload)
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DATA_UPDATED_SUCCESSFULLY),{data})
}


franchaiseController.getFranchaise = async(payload)=>{
    let criteria = {franchiseId: payload._id,userType: USER_TYPES.ADMIN};
    let queryArray= [
      {$match : criteria},
      {$lookup :{
        from : "franchise",
        localField: "franchiseId",
        foreignField: "_id",
        as : "centerInfo"
      }},
      {$unwind:{path: "$centerInfo", preserveNullAndEmptyArrays: true}},
      {$project:{
        "regDate" : "$centerInfo.regDate",
        "centerCode" : "$centerInfo.centerCode",
        "centerName" : "$centerInfo.name",
        "address" : "$centerInfo.address",
        "name":1,
        "email":1,
        "mobileNumber":1,
        "profileImage":1,
      }}
    ]
    let data = await dbService.aggregate(userModel,queryArray)
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.SUCCESS),{data:data[0]})

}


franchaiseController.deleteFranchise = async(payload) =>{
  let isStudentExist = await dbService.findOneAndUpdate(userModel,{franchiseId:payload._id, userType: USER_TYPES.STUDENT})
  if(isStudentExist){
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.FRANCHISE_CANNOT_BE_DELETED, ERROR_TYPES.BAD_REQUEST);
  }
  let data = await dbService.findOneAndUpdate(franchiseModel,{ _id: payload._id },{isDeleted:true});
  //if present then delete the user
  if (data) {
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.FRANCHISE_DELETED_SUCCESSFULLY));
  }
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
        "admin":"$userData.name",
        "centerAdminEmail":"$userData.email",
        "mobileNo":"$userData.mobileNumber"
      } },
  ]
  let franchaiseList = await dbService.aggregate(franchiseModel,query);
  let count = await dbService.countDocument(franchiseModel,criteria)
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.FRANCHAISE_FETCHED_SUCCESSFULLY), { franchaiseList,count })
}

/**
 * user list for dropdown
 * @param {*} payload 
 * @returns 
 */
franchaiseController.franchaiseDropdown = async (payload) => {
  let list = await dbService.find(franchiseModel,{isDeleted : { $ne:true }}, { centerCode: 1, name:1 })
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.FRANCHAISE_FETCHED_SUCCESSFULLY), { list })
}


franchaiseController.userStatus = async (payload) => {
  await dbService.findOneAndUpdate(franchiseModel,{ _id: payload.userId }, { status: payload.status })
}
/* export franchaiseController */
module.exports = franchaiseController;
