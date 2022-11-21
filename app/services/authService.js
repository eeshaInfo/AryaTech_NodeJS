const { SECURITY, MESSAGES, ERROR_TYPES,AVAILABLE_AUTHS, USER_TYPES } = require('../utils/constants');
const HELPERS = require("../helpers");
const { userModel, sessionModel } = require('../models');
const JWT = require('jsonwebtoken');
const utils = require(`../utils/utils`);

let authService = {};

/**
 * function to authenticate user.
 */
authService.userValidate = (auth) => {
    return (request, response, next) => {
        validateUser(request,auth).then((isAuthorized) => {
            if (isAuthorized) {
                return next();
            } 
            let responseObject = HELPERS.responseHelper.createErrorResponse(MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
            return response.status(responseObject.statusCode).json(responseObject);
        }).catch((err) => {
            let responseObject = HELPERS.responseHelper.createErrorResponse(MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
            return response.status(responseObject.statusCode).json(responseObject);
        });
    };
};


/**
 * function to validate user's jwt token and fetch its details from the system. 
 * @param {} request 
 */
let validateUser = async (request,auth) => {
    try {
        let decodedToken = JWT.verify(request.headers.authorization, SECURITY.JWT_SIGN_KEY);
        if (!decodedToken) {
            return false;
        }
        let checkSession = await sessionModel.findOne({ userId: decodedToken.id, token: request.headers.authorization });
        if (!checkSession) {
            return false;
        }

        let verifyUserType = await userModel.findOne({_id: decodedToken.id}).lean();
        if(verifyUserType && !(auth==AVAILABLE_AUTHS.COMMON) ){
            if(auth==AVAILABLE_AUTHS.ADMIN_AND_SUPER_ADMIN){
                if(!(AVAILABLE_AUTHS.ADMIN== verifyUserType.userType ||AVAILABLE_AUTHS.SUPER_ADMIN==verifyUserType.userType)){  
                    return false
                }
            }
            else if(!(auth==verifyUserType.userType)){
                return false
            }
        }
        let criteria = { _id: decodedToken.id };
        if(auth == AVAILABLE_AUTHS.SUPER_ADMIN) {
            criteria.userType = USER_TYPES.SUPER_ADMIN;
        }
        if(auth == AVAILABLE_AUTHS.ADMIN) {
            criteria.userType = USER_TYPES.ADMIN;
        }
        if(auth == AVAILABLE_AUTHS.STUDENT) {
            criteria.userType = USER_TYPES.STUDENT;
        }
        if(auth == AVAILABLE_AUTHS.ADMIN_AND_SUPER_ADMIN || auth == AVAILABLE_AUTHS.COMMON ) {
            criteria.userType = verifyUserType.userType;
        }
        let authenticatedUser = await userModel.findOne(criteria).lean();
        if (authenticatedUser) {
            request.user = authenticatedUser;
            request.user.token = request.headers.authorization;
            return true
        }
        return false;

    } catch (err) {
        console.log(err);
        return false;
    }
};

module.exports = authService;