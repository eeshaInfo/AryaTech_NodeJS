// "use strict";
const path = require('path');
const CONFIG = require('../../config');
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, LOGIN_TYPES, EMAIL_TYPES, TOKEN_TYPE, STATUS, USER_TYPES } = require('../utils/constants');
const SERVICES = require('../services');
const { compareHash, encryptJwt, createResetPasswordLink, sendEmail, createSetupPasswordLink, decryptJwt, hashPassword, sendSms } = require('../utils/utils');
const CONSTANTS = require('../utils/constants');


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
    if(payload.userType==CONSTANTS.USER_TYPES.STUDENT){ 
      let lastRegStuForGivenYear = await SERVICES.userService.getLatestRecord({
        franchaiseId: payload.franchaiseId, userType: CONSTANTS.USER_TYPES.STUDENT, regYear:payload.regYear
        } )

      //Auto Generate Registration No for Student----- 
        let lastRegNo = lastRegStuForGivenYear?parseInt(lastRegStuForGivenYear.regNo.slice(-4))+1 : `0001`
        lastRegNo = lastRegStuForGivenYear?'000'+lastRegNo:'0001'
        let centerDetails = await SERVICES.franchaiseService.getFranchaise({ _id: payload.centerId })
        let newRegNoForStudent = `${centerDetails.centerCode}${payload.regYear.slice(2)}${lastRegNo}`
        payload.regNo = newRegNoForStudent;
      }
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
 * Function to block-unblock user.
 */

userController.blockUser = async (payload) => {
  let criteria = {
    _id: payload.id,
    userType: CONSTANTS.USER_TYPES.USER
  }
  //get user from database 
  let user = await SERVICES.userService.getUser(criteria, NORMAL_PROJECTION);
  //if user is present then update its status
  if (user) {
    //check if user is already active or already blocked
    if (user.status === payload.status) {
      throw HELPERS.responseHelper.createErrorResponse(`${payload.status === CONSTANTS.STATUS.BLOCK ? MESSAGES.USER_ALREADY_BLOCKED : MESSAGES.USER_ALREADY_ACTIVE}`, ERROR_TYPES.BAD_REQUEST);
    }
    //if not then update the status of user to block/unblock
    await SERVICES.userService.updateUser(criteria, { status: payload.status })
    if (payload.status === CONSTANTS.STATUS.BLOCK) {
      await SERVICES.sessionService.removeAllSession({ userId: payload.id, userType: CONSTANTS.USER_TYPES.USER })
    }
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(`${payload.status === CONSTANTS.STATUS.BLOCK ? MESSAGES.USER_BLOCKED_SUCCESSFULLY : MESSAGES.USER_UNBLOCKED_SUCCESSFULLY}`), { user })
  }
  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.USER_NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
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

userController.userDetails = async (payload) => {
  let criteria = {
    userId: payload.userId
  }
  //get user data
  let userData = await SERVICES.userService.getUser({ _id: payload.userId },NORMAL_PROJECTION);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DATA_FETCHED_SUCCESSFULLY), { userData })
}


userController.userStatus = async (payload) => {
  await SERVICES.userService.updateUserStatus({ _id: payload.userId }, { status: payload.status })
}
/* export userController */
module.exports = userController;
