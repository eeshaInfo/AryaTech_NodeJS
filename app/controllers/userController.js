// "use strict";
const path = require('path');
const CONFIG = require('../../config');
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, USER_TYPES } = require('../utils/constants');
const SERVICES = require('../services');
const { hashPassword} = require('../utils/utils');


/**************************************************
 ***************** user controller ***************
 **************************************************/
let userController = {};


/**
 * Function to upload file.
 */

userController.uploadFile = async (payload) => {
  // check whether the request contains valid payload.
  if (!Object.keys(payload.file).length) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.FILE_REQUIRED_IN_PAYLOAD, ERROR_TYPES.BAD_REQUEST);
  }
  let pathToUpload = path.resolve(__dirname + `../../..${CONFIG.PATH_TO_UPLOAD_FILES_ON_LOCAL}`),
    pathOnServer = CONFIG.PATH_TO_UPLOAD_FILES_ON_LOCAL;
  let fileUrl = await SERVICES.fileUploadService.uploadFile(payload, pathToUpload, pathOnServer);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.FILE_UPLOADED_SUCCESSFULLY), { fileUrl });
};

/**
 * function to register a user to the system.
 */
userController.registerNewUser = async (payload) => {
  let isUserAlreadyExist = await SERVICES.userService.findOne({email:payload.email, isDeleted:false})
  if(!isUserAlreadyExist){
    payload.password = hashPassword(payload.mobileNumber);
    let data = await SERVICES.userService.createUser(payload)
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_REGISTERED_SUCCESSFULLY), { user: data });
      }
      throw HELPERS.responseHelper.createErrorResponse(MESSAGES.EMAIL_ALREADY_EXISTS, ERROR_TYPES.BAD_REQUEST);
    }
  

/**
 * function to update user details
 * @param {*} payload 
 */
userController.updateUser = async(payload)=>{
  let criteria = { _id:payload._id };
  let data = await SERVICES.userService.updateUser(criteria,payload,{ ...NORMAL_PROJECTION, password: 0, passwordToken: 0 })
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DATA_UPDATED_SUCCESSFULLY),{data})
}


/**
 * Function to get user data 
 */
userController.list = async (payload) => {
let criteria={}
  let regex = new RegExp(payload.searchKey, 'i');
   if(payload.centerId){
      criteria = {franchaiseId:payload.franchaiseId, status:payload.status, userType:USER_TYPES.STUDENT, isDeleted : {$ne:true}}
   }else{
      criteria = {status:payload.status ,userType:USER_TYPES.STUDENT, isDeleted : {$ne:true}}
   }
  let matchCriteria = {
    $and: [{ $or: [{ name: regex }, { mobileNumber: regex }] },criteria ]}
  //get user list with search and sort 
  let sort = {};
      sort[payload.sortKey] = payload.sortDirection;
  let query = [
    { $match: matchCriteria },
    { $sort: sort },
    { $skip: payload.skip },
    { $limit: payload.limit },
    { $project: {
        "password": 0,
      }
    },
  ]
  let userList = await SERVICES.userService.userAggregate(query);
  //count users in database
  let userCount = await SERVICES.userService.getCountOfUsers(criteria);
  let data = {
    list: userList,
    userCount: userCount
  }
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_FETCHED_SUCCESSFULLY), { data })
}

/**
 * user list for dropdown
 * @param {*} payload 
 * @returns 
 */
userController.userDropdown = async (payload) => {
  let userList = await SERVICES.userService.getUsers({ isDeleted:false }, { regNo: 1, name: 1, })
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_FETCHED_SUCCESSFULLY), { userList })
}

/**
 * Function to delete user
 */
userController.deleteUser = async (payload) => {
  //get data of user
  let data = await SERVICES.userService.update({ _id: payload._id },{isDeleted:true});
  //if present then delete the user
  if (data) {
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_DELETED_SUCCESSFULLY));
  }
}

/* export userController */
module.exports = userController;
