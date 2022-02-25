
const CONFIG = require('../../config');
/********************************
 **** Managing all the services ***
 ********* independently ********
 ********************************/
module.exports = {
    userService: require('./userService'),
    swaggerService: require('./swaggerService'),
    authService: require('./authService'),
    sessionService: require('./sessionService'),
    // challengeService: require('./challengeService'),
    // fileUploadService: require('./fileUploadService'),
    // paymentService: require('./paymentService'),
    // fcmNotificationService: require('./fcmNotificationService')
};