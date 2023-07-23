// "use strict";
const path = require('path');
const CONFIG = require('../../config');
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, USER_TYPES } = require('../utils/constants');
const SERVICES = require('../services');
const {dbService,fileUploadService} = require('../services')
const {userModel} = require('../models/index')
const { hashPassword} = require('../utils/utils');
const CONSTANTS = require('../utils/constants');
const franchiseModel = require('../models/franchiseModel');


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
  let profileImage = await fileUploadService.uploadFile(payload, pathToUpload, pathOnServer);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.FILE_UPLOADED_SUCCESSFULLY), { profileImage });
};

userController.getFile = async(payload) =>{
  let filePath = payload.filePath
  let fileUrl = await fileUploadService.getFile(filePath)
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.SUCCESS), { fileUrl });
}

/**
 * function to register a user to the system.
 */
userController.registerNewUser = async (payload) => {
  let isUserAlreadyExist = await SERVICES.userService.findOne({
    email: payload.email,
    isDeleted: false,
  });
  if (payload.userType === CONSTANTS.USER_TYPES.ADMIN) {
    let frachiaiseDetails = await dbService.findOne(franchiseModel, {
      _id: payload.franchiseId,
    });
    if (frachiaiseDetails.userId) {
      throw HELPERS.responseHelper.createErrorResponse(
        MESSAGES.USER_IS_ALREADY_ADMIN_OF_OTHER_FRANCHAISE,
        ERROR_TYPES.BAD_REQUEST
      );
      return;
    }
  }

  if (!isUserAlreadyExist) {
    payload.password = hashPassword(payload.mobileNumber);
    let data = await dbService.create(userModel, payload);
    if (data && payload.userType === CONSTANTS.USER_TYPES.ADMIN) {
      await dbService.findOneAndUpdate(
        franchiseModel,
        { _id: payload.franchiseId },
        { userId: data._id }
      );
    }
    return Object.assign(
      HELPERS.responseHelper.createSuccessResponse(
        MESSAGES.USER_REGISTERED_SUCCESSFULLY
      ),
      { user: data }
    );
  }
  throw HELPERS.responseHelper.createErrorResponse(
    MESSAGES.EMAIL_ALREADY_EXISTS,
    ERROR_TYPES.BAD_REQUEST
  );
}
  

/**
 * function to update user details
 * @param {*} payload 
 */
userController.updateUser = async(payload)=>{
  let criteria = { _id:payload._id };
  let data = await dbService.findOneAndUpdate(userModel,criteria,payload)
  if(data && payload.userType===CONSTANTS.USER_TYPES.ADMIN){
    await dbService.findOneAndUpdate(franchiseModel,{_id:payload.franchiseId},{userId:data._id})
  }
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DATA_UPDATED_SUCCESSFULLY),{data})
}


/**
 * Function to get user details
 * @param {*} payload 
 * @returns 
 */

userController.userDetails = async (payload) => {
  let criteria = {_id : payload.userId}
  let query = [
    { $match: criteria },
    {$lookup: {
      from :"course",
      localField: "courseId",
      foreignField : "_id",
      as:"course_data"
    }},
    { $unwind: { path: "$course_data", preserveNullAndEmptyArrays: true }},
    {$lookup: {
      from :"franchise",
      localField: "franchiseId",
      foreignField : "_id",
      as:"center_data"
    }},
    { $unwind: { path: "$center_data", preserveNullAndEmptyArrays: true }},
    { $project: {
        "regNo" : 1,
        "regDate" :1,
        "email" : 1, 
        "name" : 1,
        "gender" :1,
        "dob": 1,
        "franchiseId" :1,
        "fathersName": 1,
        "mothersName":1,
        "userType": 1,
        "address" : 1,
        "aadharNo": 1,
        "panNo": 1,
        "educations" :1,
        "isAddressSame" : 1,
        "primaryAddress" :1,
        "secondaryAddress" :1,
        "mobileNumber": 1,
        "profileImage": 1,
        "status": 1,
        "isDeleted": 1,
        "createdAt":1,
        "updatedAt":1,
        "courseId": 1,
        "courseName" : "$course_data.name",
        "course" : "$course_data.duration",
        "centerName" : "$center_data.name",
        "centerCode" : "$center_data.centerCode",
        "centerAddress" : "$center_data.address"

      }
    },
  ]
  let data = await dbService.aggregate(userModel,query)
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_FETCHED_SUCCESSFULLY), { data:data[0] })
}

/**
 * Function to get user data 
 */
userController.list = async (payload) => {
let criteria={}
  let regex = new RegExp(payload.searchKey, 'i');
   if(payload.franchiseId){
      criteria = {franchiseId:payload.franchiseId, status:payload.status, userType:USER_TYPES.STUDENT, isDeleted : {$ne:true}}
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
    {$lookup: {
      from :"course",
      localField: "courseId",
      foreignField : "_id",
      as:"course_data"
    }},
    { $unwind: { path: "$course_data", preserveNullAndEmptyArrays: true }},
    {$lookup: {
      from :"franchise",
      localField: "franchiseId",
      foreignField : "_id",
      as:"center_data"
    }},
    { $unwind: { path: "$center_data", preserveNullAndEmptyArrays: true }},
    { $sort: sort },
    { $skip: payload.skip },
    payload.franchiseId?{ $limit: 9999}:{ $limit: payload.limit  },
    { $project: {
        "regNo" : 1,
        "regDate" :1,
        "email" : 1, 
        "name" : 1,
        "gender" :1,
        "dob": 1,
        "fathersName": 1,
        "mothersName":1,
        "userType": 1,
        "address" : 1,
        "aadharNo": 1,
        "panNo": 1,
        "isAddressSame" : 1,
        "educations" :1,
        "mobileNumber": 1,
        "profileImage": 1,
        "status": 1,
        "isDeleted": 1,
        "createdAt":1,
        "updatedAt":1,
        "courseId": 1,
        "courseName" : "$course_data.name",
        "course" : "$course_data.duration",
        "centerName" : "$center_data.name",
        "centerCode" : "$center_data.centerCode",
        "centerAddress" : "$center_data.address"

      }
    },
  ]
  // let userList = await SERVICES.userService.userAggregate(query);
  let userList = await dbService.aggregate(userModel,query);
  //count users in database
  // let userCount = await SERVICES.userService.getCountOfUsers(criteria);
  let userCount = await dbService.countDocument(userModel,criteria)
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
  // let userList = await SERVICES.userService.getUsers({ isDeleted:false }, { regNo: 1, name: 1, })
  let userList = await dbService.find(userModel,{ isDeleted:false} , {regNo: 1, name: 1, })

  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_FETCHED_SUCCESSFULLY), { userList })
}

/**
 * Function to delete user
 */
userController.deleteUser = async (payload) => {
  //get data of user
  // let data = await SERVICES.userService.update({ _id: payload._id },{isDeleted:true});
  let data = await dbService.findOneAndUpdate(userModel,{ _id: payload._id },{isDeleted:true});
  //if present then delete the user
  if (data) {
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_DELETED_SUCCESSFULLY));
  }
}

/* export userController */
module.exports = userController;
