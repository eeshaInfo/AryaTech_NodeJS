
const CONFIG = require('../../config');
/********************************
 **** Managing all the services ***
 ********* independently ********
 ********************************/
module.exports = {
    userService: require('./userService'),
    franchaiseService:require('./franchaiseService'),
    courseService: require('./courseService'),
    paymentService: require('./paymentService'),
    certificationService: require('./certificationService'),
    swaggerService: require('./swaggerService'),
    authService: require('./authService'),
    sessionService: require('./sessionService'),
};