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
 ***************** user controller ***************
 **************************************************/
let userController = {};

/**
 * function to check server.
 */
userController.getServerResponse = async () => {
  throw HELPERS.responseHelper.createSuccessResponse(MESSAGES.SUCCESS);
}


/**
 * function to login a user to the system.
 */
userController.loginUser = async (payload) => {

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
      let data = { userId: user._id, token: token, userType: user.userTYpe, }
      // create session for particular user
      await SERVICES.sessionService.createSession(data);
      return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.LOGGED_IN_SUCCESSFULLY), { token, user });
    }
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_PASSWORD, ERROR_TYPES.BAD_REQUEST);
  }
  throw HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_EMAIL, ERROR_TYPES.BAD_REQUEST);
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
 * function to logout an user.
 */
userController.logout = async (payload) => {
  //remove session of user
  await SERVICES.sessionService.removeSession({ token: payload.user.token });
  return HELPERS.responseHelper.createSuccessResponse(MESSAGES.LOGGED_OUT_SUCCESSFULLY);
};

/**
 * function to update user's profile
 */
userController.updateProfile = async (payload) => {
  //update user's profile'
  let updatedUser = await SERVICES.userService.updateUser({ _id: payload.user._id }, payload, { ...NORMAL_PROJECTION, password: 0, passwordToken: 0 });
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PROFILE_UPDATE_SUCCESSFULLY), { data: updatedUser });
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
  //check wheather password is valid
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
  //check if old  password given by user is correct
  if (!compareHash(payload.oldPassword, payload.user.password)) {
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.OLD_PASSWORD_INVALID, ERROR_TYPES.BAD_REQUEST);
  }
  await SERVICES.userService.updateUser({ _id: payload.user._id }, { password: hashPassword(payload.newPassword) }, NORMAL_PROJECTION);
  return HELPERS.responseHelper.createSuccessResponse(MESSAGES.PASSWORD_UPDATED_SUCCESSFULLY);
};

/**
 * function to register a user to the system.
 */
userController.registerNewUser = async (payload) => {
  if (payload.userType == CONSTANTS.USER_TYPES.STUDENT) {
    console.log('===New Student Registration===');
    //Auto Generate Registration No for Student----- 
    let lastRegStuForGivenYear = await SERVICES.userService.getLatestRecord({ centerId: payload.centerId, userType: CONSTANTS.USER_TYPES.STUDENT })
    let lastRegNo = lastRegStuForGivenYear?parseInt(lastRegStuForGivenYear.regNo.slice(-4))+1 : `0001`
    lastRegNo = lastRegStuForGivenYear?'000'+lastRegNo:'0001'
    let centerDetails = await SERVICES.userService.getUser({ _id: payload.centerId })
    let newRegNo = `${centerDetails.regNo}${payload.dateOfReg.getYear().toString().slice(1)}${lastRegNo}`
    payload.regNo = newRegNo;
    console.log('----------------New Registration No:----------------', payload.regNo)
  }
  else if (payload.userType == CONSTANTS.USER_TYPES.ADMIN) {
    //Auto Generate center code---
    console.log('------New Auto Generate Center Code-------');
    let centerDetails = await SERVICES.userService.getLatestRecord({ userType: CONSTANTS.USER_TYPES.ADMIN })
    let lastCenterRegNo = centerDetails?centerDetails.regNo.slice(-3):null;
    console.log('centerCode==>',lastCenterRegNo)
    let newCenterRegNo = lastCenterRegNo?'00'+(parseInt(lastCenterRegNo) + 1):'001'
    payload.regNo = lastCenterRegNo?`ACE${newCenterRegNo}`:'ACE001';
    console.log('new Center code would be===>',payload.regNo)
  }
  payload.password = hashPassword(payload.mobileNumber);
  console.log(payload)
  let data = await SERVICES.userService.createUser(payload)
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_REGISTERED_SUCCESSFULLY), { user: data });
}
// throw HELPERS.responseHelper.createErrorResponse(MESSAGES.MOBILE_NUMBER_ALREADY_EXISTS, ERROR_TYPES.BAD_REQUEST);

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
 * Function to get admin data.
 */
userController.getAdminProfile = async (payload) => {
  //get user profile
  let user = await SERVICES.userService.getUser({ _id: payload.user._id }, { ...NORMAL_PROJECTION, password: 0, challengeCompleted: 0 })
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PROFILE_FETCHED_SUCCESSFULLY), { data: user });
};

/**
 * Function to get user data 
 */
userController.list = async (payload) => {
  let regex = new RegExp(payload.searchKey, 'i');
  let criteria = {
    $and: [{ $or: [{ studentsName: regex }, { mobileNumber: regex }] }, { userType: payload.userType, status: payload.status }]
  }
  //get user list with search and sort
  let sort = {};
  if (payload.sortKey) {
    sort[payload.sortKey] = payload.sortDirection;
  } else {
    sort['createdAt'] = -1;
  }
  let query = [
    {
      $match: criteria
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
    // {
    //   $project: {
    //     "firstName": 1,
    //     "lastName": 1,
    //     "gender": 1,
    //     "country": 1,
    //     "state": 1,
    //     "city": 1,
    //     "imagePath": 1,
    //     "mobileNumber": 1,
    //     'challengeCompleted': 1,
    //     "status": 1,
    //   }
    // },
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
  let userList = await SERVICES.userService.getUsers({userType:payload.userType }, { regNo: 1, name: 1, })
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
  let data = await SERVICES.userService.deleteUser({ _id: payload._id });
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
  let userData = await SERVICES.userService.getUser({ _id: payload.userId });
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DATA_FETCHED_SUCCESSFULLY), { userData })
}

/**
 * Function to update wallet address.
 */
userController.updateWalletAddress = async (payload) => {
  let pathToUpload = path.resolve(__dirname + `../../..${CONFIG.PATH_TO_UPLOAD_FILES_ON_LOCAL}`);
  let fileName = `QRCode.jpeg`;
  await qrCode.toFile(`${pathToUpload}/${fileName}`, payload.walletAddress, {
    errorCorrectionLevel: 'H',
    quality: 0.95,
    margin: 1,
    color: {
      dark: '#208698',
      light: '#FFF',
    },
  })
  let fileUrl = "uploads/files/QRCode.jpeg";
  let data = fs.readFileSync(fileUrl);
  let imageUrl = await SERVICES.fileUploadService.uploadFileToS3(data, `upload_${Date.now()}.jpeg`, CONFIG.S3_BUCKET.zipBucketName);
  //find and update user address
  await SERVICES.userService.updateAddress({}, { walletAddress: payload.walletAddress, QRImage: imageUrl });
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DATA_UPDATED_SUCCESSFULLY))
}

/**
 * Function to get wallet address.
 */
userController.getWalletAddress = async () => {
  //get user wallet address 
  let address = await SERVICES.userService.getAddress({}, NORMAL_PROJECTION);
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DATA_FETCHED_SUCCESSFULLY), { address })
}

/**
 * Function to post user contacts.
 */
userController.userContacts = async (payload) => {
  //find those numbers which are present in our database
  let phonesRegex = [];
  payload.contacts.forEach(contact => {
    phonesRegex.push(new RegExp(contact));
  })
  let contacts = await SERVICES.userService.getUsers({ "mobileNumber": { $in: phonesRegex } }, { _id: 0, mobileNumber: 1 })
  let contact = contacts.filter((arr) => {
    if (arr.mobileNumber != payload.user.mobileNumber) {
      return arr.mobileNumber
    }
  }).map(arr => arr.mobileNumber)
  let dataToUpdate = { $set: { "contacts": contact }, contactSyncTime: Date.now() }
  //find user and update contacts
  let data = await SERVICES.userService.updateUser({ _id: payload.user._id }, dataToUpdate)
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.CONTACTS_ADDED_SUCCESSFULLY), { data })
}

userController.friendList = async (payload) => {
  //check if user has friend or not
  // if (!payload.user.contacts.length) {
  //   throw HELPERS.responseHelper.createSuccessResponse(MESSAGES.NO_FRIENDS_FOUND);
  // }
  let contactsData = await SERVICES.userService.getContact({ userId: payload.user._id });
  let contacts = contactsData.contacts.filter(item => item.isRegistered == true).map(item => item.mobileNumber)
  console.log(contacts);
  let criteria = {
    mobileNumber: { $in: contacts },
    $and: [{ $or: [{ firstName: new RegExp(payload.searchKey, 'i') }, { lastName: new RegExp(payload.searchKey, 'i') }, { mobileNumber: new RegExp(payload.searchKey, 'i') }] }],
  }
  let data = await SERVICES.userService.getUsers(criteria, { firstName: 1, lastName: 1, challengeCompleted: 1, imagePath: 1, mobileNumber: 1 })
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DATA_FETCHED_SUCCESSFULLY), { data })
}


userController.userStatus = async (payload) => {
  await SERVICES.userService.updateUserStatus({ _id: payload.userId }, { status: payload.status })
}
/* export userController */
module.exports = userController;
