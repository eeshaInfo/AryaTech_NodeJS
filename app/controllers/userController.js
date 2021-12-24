"use strict";
const path = require('path');
const CONFIG = require('../../config');
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, LOGIN_TYPES, EMAIL_TYPES, TOKEN_TYPE, STATUS,USER_TYPES } = require('../utils/constants');
const SERVICES = require('../services');
const { compareHash, encryptJwt, createResetPasswordLink, sendEmail, createSetupPasswordLink, decryptJwt, hashPassword, sendSms } = require('../utils/utils');
const CONSTANTS = require('../utils/constants');

/**************************************************
 ***************** user controller ***************
 **************************************************/
let userController = {};

/**
 * function to check server.
 */
userController.getServerResponse = async (payload) => {
  throw HELPERS.responseHelper.createSuccessResponse(MESSAGES.SUCCESS);
}

/**
 * function to register a user to the system.
 */
userController.registerNewUser = async (payload) => {
  let isUserAlreadyExists = await SERVICES.userService.getUser({ mobileNumber: payload.mobileNumber }, NORMAL_PROJECTION);
  if (!isUserAlreadyExists) {
    payload.status = STATUS.ACTIVE;
    payload.userType = USER_TYPES.USER
    let newRegisteredUser = await SERVICES.userService.registerUser(payload);
    // console.log("New RegistredUser:.....",newRegisteredUser, newRegisteredUser._id)
    const dataForJwt = {
      id: newRegisteredUser._id,
      date: Date.now()
    };
    let token = await encryptJwt(dataForJwt);
    await SERVICES.sessionService.updateSession({ userId: newRegisteredUser._id }, { token });

    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_REGISTERED_SUCCESSFULLY), { user: newRegisteredUser, token });
  }
  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.MOBILE_NUMBER_ALREADY_EXISTS, ERROR_TYPES.BAD_REQUEST);
};

/**
 * function to login a user to the system.
 */
userController.loginUser = async (payload) => {
  if (payload.isAdminRole) {
    // check is user exists in the database with provided email or not.
    let user = await SERVICES.userService.getUser({ email: payload.email }, { ...NORMAL_PROJECTION });
    // if user exists then compare the password that user entered.
    if (user) {
      // compare user's password.
      if (compareHash(payload.password, user.password)) {
        const dataForJwt = {
          id: user._id,
          date: Date.now()
        };
        delete user.password;
        let token = await encryptJwt(dataForJwt);
        let data = { userId: user._id, token: token }

        await SERVICES.sessionService.createSession(data);

        return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.LOGGED_IN_SUCCESSFULLY), { token, user });
      }
      throw HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_PASSWORD, ERROR_TYPES.BAD_REQUEST);
    }
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_EMAIL, ERROR_TYPES.BAD_REQUEST);

  }
  else {
    let user = await SERVICES.userService.getUser({ mobileNumber: payload.mobileNumber }, { ...NORMAL_PROJECTION });
    if (user) {
      const dataForJwt = {
        id: user._id,
        date: Date.now()
      };
      let token = await encryptJwt(dataForJwt);
      await SERVICES.sessionService.updateSession({ userId: user._id }, { token });
      return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.LOGGED_IN_SUCCESSFULLY), { token, user, isNewUser: false });
    }
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_DOESNOT_EXIST), { isNewUser: true });
  }
};

/**
 * Function to fetch user's profile from the system.
 */
userController.getUserProfile = async (payload) => {
  let user = await SERVICES.userService.getUser({ _id: payload.user._id }, { ...NORMAL_PROJECTION, password: 0 });
  if (user) {
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PROFILE_FETCHED_SUCCESSFULLY), { data: user });
  }
  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
};

/**
 * funciton to send a link to registered email of an user who forgots his password.
 */
userController.forgotPassword = async (payload) => {
  let requiredUser = await SERVICES.userService.getUser({ email: payload.email });
  if (requiredUser) {
    requiredUser.tokenType = CONSTANTS.TOKEN_TYPE.RESET_PASSWORD
    // create reset-password link.
    let resetPasswordLink = createResetPasswordLink({ id: requiredUser._id, tokenType: CONSTANTS.TOKEN_TYPE.RESET_PASSWORD });
    let linkParts = resetPasswordLink.split("/");
    payload.passwordToken = linkParts[linkParts.length - 1];
    let updatedUser = await SERVICES.userService.updateUser({ _id: requiredUser._id }, payload);

    // send forgot-password email to user.
    await sendEmail({
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      resetPasswordLink: resetPasswordLink
    }, EMAIL_TYPES.FORGOT_PASSWORD_EMAIL);
    return HELPERS.responseHelper.createSuccessResponse(MESSAGES.FORGOT_PASSWORD_EMAIL_SEND_SUCCESSFULLY)
  }
  return HELPERS.responseHelper.createErrorResponse(MESSAGES.NO_USER_FOUND);
};

/**
 * function to create user's sesion or update an existing one.
 * @param {*} userId 
 * @param {*} payload 
 */

let createUserSession = async (criteriaForSession, userId, payload) => {
  payload.userId = userId;
  await SERVICES.sessionService.updateSession(criteriaForSession, payload);
};

/**
 * function to logout an user.
 */
userController.logout = async (payload) => {

  let criteria = {
    token: payload.user.token,
  };

  await SERVICES.sessionService.removeSession(criteria);

  return HELPERS.responseHelper.createSuccessResponse(MESSAGES.LOGGED_OUT_SUCCESSFULLY);
};

/**
 * function to update user's profile
 */
userController.updateProfile = async (payload) => {
  let updatedUser = await SERVICES.userService.updateUser({ _id: payload.user._id }, payload, { ...NORMAL_PROJECTION, password: 0, passwordToken: 0 });
  if (updatedUser) {
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PROFILE_UPDATE_SUCCESSFULLY), { data: updatedUser });
  }
  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
};

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
 * Function to reset password of user.
 * @param {*} payload
 */
userController.resetPassword = async (payload) => {
  let decodedObj = decryptJwt(payload.token);
  if (!decodedObj) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
  }
  if (decodedObj.tokenType !== TOKEN_TYPE.RESET_PASSWORD) throw HELPERS.responseHelper.createErrorResponse(MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
  // Get the user by passwordToken from database.
  let userData = await SERVICES.userService.getUser({ passwordToken: payload.token });
  if (!userData) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
  }
  // Update the user password if found in db.
  await SERVICES.userService.updateUser({ _id: userData._id }, { password: hashPassword(payload.password) }, NORMAL_PROJECTION);
  // Now delete the token from db.
  await SERVICES.userService.updateUser({ _id: userData._id }, { $unset: { passwordToken: 1 } });
  return HELPERS.responseHelper.createSuccessResponse(MESSAGES.PASSWORD_UPDATED_SUCCESSFULLY);
};

/**
 * Function to update password of admin.

 */
userController.updatePassword = async (payload) => {
  //let user = await SERVICES.userService.getUsers({ _id: payload.user._id })
  if (!compareHash(payload.oldPassword, payload.user.password)) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.OLD_PASSWORD_INVALID, ERROR_TYPES.BAD_REQUEST);
  }
  else {
    await SERVICES.userService.updateUser({ _id: payload.user._id }, { password: hashPassword(payload.newPassword) }, NORMAL_PROJECTION);
    return HELPERS.responseHelper.createSuccessResponse(MESSAGES.PASSWORD_UPDATED_SUCCESSFULLY);
  }

};

/**
 * Function to get admin data.
 */
userController.getAdminProfile = async (payload) => {
  let admin = await SERVICES.userService.getUser({ _id: payload.user._id }, { ...NORMAL_PROJECTION, password: 0, challengeCompleted: 0 })
  if (admin) {
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PROFILE_FETCHED_SUCCESSFULLY), { data: admin });
  }
  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
};




userController.list = async (payload) => {
  let criteria = {
    userType: CONSTANTS.USER_TYPES.USER
  }
  let userList = await SERVICES.userService.getUsersList(criteria, payload.skip, payload.limit)
  let userCount = await SERVICES.userService.getCountOfUsers(criteria);
  // console.log("UserList:==>", userList)
  let data = {
    list: userList,
    userCount: userCount
  }
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_FETCHED_SUCCESSFULLY), { data })
}



userController.blockUser = async (payload) => {
  let criteria = {
    _id: payload.id,
    userType: CONSTANTS.USER_TYPES.USER
  }

  let user = await SERVICES.userService.getUser(criteria, NORMAL_PROJECTION)
    ;
  if (user) {
    if (user.status === CONSTANTS.STATUS.BLOCK) {
      throw HELPERS.responseHelper.createErrorResponse(MESSAGES.USER_ALREADY_BLOCKED, ERROR_TYPES.BAD_REQUEST);
    }
    await SERVICES.userService.updateUser(criteria, { status: CONSTANTS.STATUS.BLOCK })
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_BLOCKED_SUCCESSFULLY), { user })
  }
  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
}
/* export userController */
module.exports = userController;