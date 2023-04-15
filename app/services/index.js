
const CONFIG = require('../../config');
/********************************
 **** Managing all the services ***
 ********* independently ********
 ********************************/
module.exports = {
    dbService : require('./dbService'),
    userService: require('./userService'),
    fileUploadService: require('./fileUploadService'),
    franchaiseService:require('./franchaiseService'),
    paymentService: require('./paymentService'),
    swaggerService: require('./swaggerService'),
    authService: require('./authService'),
    sessionService: require('./sessionService'),
};