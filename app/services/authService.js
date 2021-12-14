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
        let decodedToken = JWT.verify(request.headers.authorization, SECURITY.JWT_SIGN_KEY);
        // console.log(decodedToken);
        if (!decodedToken) {
            return false;
        }
        let checkSession = await sessionModel.findOne({ userId: decodedToken.id, token: request.headers.authorization });
        if (!checkSession) {
            return false;
        }
        let criteria = { _id: decodedToken.id };
        let authenticatedUser = await userModel.findOne(criteria).lean();
        if (authenticatedUser) {
            request.user = authenticatedUser;
            return true
        }
        return false;

    } catch (err) {
        return false;
    }
};

module.exports = authService;