const { SECURITY, MESSAGES, ERROR_TYPES } = require('../utils/constants');
const HELPERS = require("../helpers");
const { userModel, sessionModel } = require('../models');
const JWT = require('jsonwebtoken');
const utils = require(`../utils/utils`);

let authService = {};

/**
 * function to authenticate user.
 */
authService.userValidate = () => {
    return (request, response, next) => {
        validateUser(request).then((isAuthorized) => {
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
let validateUser = async (request) => {
    try {
        // let session = await sessionService.getSession({token: request.headers.authorization, tokenType: TOKEN_TYPES.LOGIN});
        // if(!session || (session && session.tokenExpDate < new Date())){
        //     return false;
        // }
        // if(authType == AVAILABLE_AUTHS.USER && session.userType != USER_TYPE.USER){
        //     return false;
        // }
        // else if(authType == AVAILABLE_AUTHS.ADMIN && session.userType != USER_TYPE.SUPER_ADMIN){
        //     return false;
        // }
        // else if(authType == AVAILABLE_AUTHS.ALL && !(session.userType == USER_TYPE.SUPER_ADMIN  || session.userType == USER_TYPE.USER)){
        //     return false;
        // }

        let token = await utils.decryptJwt(request.headers.authorization);
        let user = await userModel.findOne({ _id: token.id }).lean();
        if (user) {
            //user.session = session;
            request.user = user;
            return true;
        }
        return false;
    } catch (err) {
        return false;
    }
};

module.exports = authService;