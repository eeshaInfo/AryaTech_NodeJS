"use strict";
const path = require('path');
const CONFIG = require('../../config');
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, LOGIN_TYPES, EMAIL_TYPES, TOKEN_TYPE, STATUS } = require('../utils/constants');
const SERVICES = require('../services');
const { compareHash, encryptJwt, createResetPasswordLink, sendEmail, createSetupPasswordLink, decryptJwt, hashPassword } = require('../utils/utils');
const CONSTANTS = require('../utils/constants');

/**************************************************
 ***************** user controller ***************
 **************************************************/
let adminController = {};

/**
 * function to check server.
 */
adminController.getServerResponse = async (payload) => {
    throw HELPERS.responseHelper.createSuccessResponse(MESSAGES.SUCCESS);
}

/**
 * function to register a user to the system.
 */
adminController.registerNewUser = async (payload) => {
    let isUserAlreadyExists = await SERVICES.userService.getUser({ email: payload.email }, NORMAL_PROJECTION);
    if (!isUserAlreadyExists) {
        let newRegisteredUser = await SERVICES.userService.registerUser(payload);
        return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_REGISTERED_SUCCESSFULLY), { user: newRegisteredUser });
    }
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.EMAIL_ALREADY_EXISTS, ERROR_TYPES.BAD_REQUEST);
};

/**
 * function to login a user to the system.
 */
adminController.loginUser = async (payload) => {
    // check is user exists in the database with provided email or not.
    let user = await SERVICES.userService.getUser({ email: payload.email, status: CONSTANTS.STATUS.ACTIVE }, { ...NORMAL_PROJECTION, openSheets: 0, passwordToken: 0 });
    // if user exists then compare the password that user entered.
    if (user) {
        // compare user's password.
        if (compareHash(payload.password, user.password)) {
            const dataForJwt = {
                id: user._id,
                date: Date.now()
            };
            delete user.password;
            return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.LOGGED_IN_SUCCESSFULLY), { token: encryptJwt(dataForJwt), user });
        }
        throw HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_PASSWORD, ERROR_TYPES.BAD_REQUEST);
    }
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_EMAIL, ERROR_TYPES.BAD_REQUEST);
};

/**
 * Function to fetch user's profile from the system.
 */
adminController.getUserProfile = async (payload) => {
    let user = await SERVICES.userService.getUser({ _id: payload.user._id }, { ...NORMAL_PROJECTION, password: 0 });
    if (user) {
        return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PROFILE_FETCHED_SUCCESSFULLY), { data: user });
    }
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
};

/**
 * funciton to send a link to registered email of an user who forgots his password.
 */
adminController.forgotPassword = async (payload) => {
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
 * function to login using google play,  and using device id.
 */
adminController.socialLogin = async (payload) => {
    // check user's session with provided device id is exists or not.
    let criteriaForSession = { deviceId: payload.deviceId, loginType: payload.loginType };
    if (payload.loginType !== LOGIN_TYPES.NORMAL && !payload.socialId) {
        throw HELPERS.responseHelper.createErrorResponse(MESSAGES.SOCIAL_ID_REQUIRED_FOR_THIS_LOGIN, ERROR_TYPES.BAD_REQUEST);
    }
    let userSession = await SERVICES.sessionService.getSession(criteriaForSession);
    if (userSession || (!userSession && payload.loginType !== LOGIN_TYPES.NORMAL)) {
        let userFindCriteria = userSession ? { _id: userSession.userId._id, isDeleted: false } : {};
        // if user wants to login using google play then find its google's record from database.
        if (payload.socialId && payload.loginType === LOGIN_TYPES.GOOGLE) {
            userFindCriteria = { 'googlePlayServices.id': payload.socialId, isDeleted: false };
            payload.googlePlayServices = { id: payload.socialId };
        }
        // check user exists based on above criteria if yes then return it in response otherwise create new one and update its session.  
        let user = await SERVICES.userService.getUser(userFindCriteria, { ...NORMAL_PROJECTION, password: 0 });
        if (user) {
            // update user's session.
            const dataForJwt = {
                id: user._id,
                date: Date.now()
            };
            payload.token = encryptJwt(dataForJwt);
            await createUserSession(criteriaForSession, user._id, payload);
            return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.LOGGED_IN_SUCCESSFULLY), { data: user, token: payload.token });
        }
    }

    let newUser = await SERVICES.userService.createUser(payload);
    // update session with new created user.
    const dataForJwt = {
        id: newUser._id,
        date: Date.now()
    };
    payload.token = encryptJwt(dataForJwt);
    await createUserSession(criteriaForSession, newUser._id, payload);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.LOGGED_IN_SUCCESSFULLY), { data: newUser, token: payload.token });
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
adminController.logout = async (payload) => {
    let criteria = {
        userId: payload.user._id
    }, dataToUpdate = { $unset: { token: 1 } };
    await SERVICES.sessionService.updateSession(criteria, dataToUpdate);
    await SERVICES.userService.updateUser({ _id: payload.user._id }, { openSheets: [] });
    return HELPERS.responseHelper.createSuccessResponse(MESSAGES.LOGGED_OUT_SUCCESSFULLY);
};

/**
 * function to update user's profile
 */
adminController.updateProfile = async (payload) => {
    let updatedUser = await SERVICES.userService.updateUser({ _id: payload.user._id }, payload, { ...NORMAL_PROJECTION, password: 0 });
    if (updatedUser) {
        return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PROFILE_UPDATE_SUCCESSFULLY), { data: updatedUser });
    }
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
};

/**
 * Function to upload file.
 */
adminController.uploadFile = async (payload) => {
    // check whether the request contains valid payload.
    if (!Object.keys(payload.file).length) {
        throw HELPERS.responseHelper.createErrorResponse(MESSAGES.FILE_REQUIRED_IN_PAYLOAD, ERROR_TYPES.BAD_REQUEST);
    }
    let pathToUpload = path.resolve(__dirname + `../../../..${CONFIG.PATH_TO_UPLOAD_FILES_ON_LOCAL}`),
        pathOnServer = CONFIG.PATH_TO_UPLOAD_FILES_ON_LOCAL;
    let fileUrl = await SERVICES.fileUploadService.uploadFile(payload, pathToUpload, pathOnServer);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.FILE_UPLOADED_SUCCESSFULLY), { fileUrl });
};

/**
 * Function to invite a user to a system.
 * @param {*} payload 
 * @returns 
 */
adminController.inviteUser = async (payload) => {
    let isUserAlreadyExists = await SERVICES.userService.getUser({ email: payload.email }, NORMAL_PROJECTION);
    if (isUserAlreadyExists) {
        throw HELPERS.responseHelper.createErrorResponse(MESSAGES.EMAIL_ALREADY_EXISTS, ERROR_TYPES.BAD_REQUEST);
    }

    payload.status = CONSTANTS.STATUS.PENDING;
    let userData = await SERVICES.userService.createUser(payload);
    // create setup password link
    let setupPasswordLink = createSetupPasswordLink({ id: userData._id, tokenType: CONSTANTS.TOKEN_TYPE.ACTIVATE_ACCOUNT });
    let linkParts = setupPasswordLink.split("/");
    payload.passwordToken = linkParts[linkParts.length - 1];
    // send setup password email to user.
    await sendEmail(
        {
            email: payload.email,
            firstName: payload.firstName || CONFIG.USER_NAME,
            lastName: payload.lastName || CONFIG.LAST_NAME,
            setupPasswordLink: setupPasswordLink
        },
        EMAIL_TYPES.SETUP_PASSWORD
    );

    await SERVICES.userService.updateUser({ _id: userData._id }, { passwordToken: payload.passwordToken });
    return HELPERS.responseHelper.createSuccessResponse(MESSAGES.INVITATION_SENT_SUCCESSFULLY);

    // if (!isUserAlreadyExists) {
    //   let newRegisteredUser = await SERVICES.userService.registerUser(payload);
    //   return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_REGISTERED_SUCCESSFULLY), { user: newRegisteredUser });
    // }
    // throw HELPERS.responseHelper.createErrorResponse(MESSAGES.EMAIL_ALREADY_EXISTS, ERROR_TYPES.BAD_REQUEST);
};

/**
 * Function to setup password. 
 * @param {*} payload 
 */
adminController.activateAccount = async (payload) => {
    let decodedObj = decryptJwt(payload.token);
    if (!decodedObj) {
        throw HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_TOKEN, ERROR_TYPES.UNAUTHORIZED);
    }
    if (decodedObj.tokenType != TOKEN_TYPE.ACTIVATE_ACCOUNT) throw HELPERS.responseHelper.createErrorResponse(MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
    // Get the user by payload token from database.
    let userData = await SERVICES.userService.getUser({ passwordToken: payload.token });
    if (!userData) {
        throw HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_TOKEN, ERROR_TYPES.UNAUTHORIZED);
    }
    if (userData && userData.status === STATUS.ACTIVE) {
        return HELPERS.responseHelper.createErrorResponse(MESSAGES.ALREADY_ACTIVATED, ERROR_TYPES.ALREADY_EXISTS);
    }
    let payloadObj = {
        password: hashPassword(payload.password),
        status: STATUS.ACTIVE
    }
    let updatedData = await SERVICES.userService.updateUser({ _id: userData._id }, payloadObj, { ...NORMAL_PROJECTION, password: 0, passwordToken: 0 });
    const dataForJwt = { id: userData._id, date: Date.now() };
    let jwtToken = encryptJwt(dataForJwt);
    // await SERVICES.sessionService.updateSession({ userId: userData._id, accessToken: jwtToken }, { accessToken: jwtToken, refreshToken: refreshToken });
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DETAILED_SUBMITED_SUCCESSFULLY), { token: jwtToken, user: updatedData });
}

/**
 * Function to reset password of user.
 * @param {*} payload
 */
adminController.resetPassword = async (payload) => {
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


/* export adminController */
module.exports = adminController;