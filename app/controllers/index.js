'use strict';

/********************************
 * Managing all the controllers *
 ********* independently ********
 ********************************/
module.exports = {
    authController: require('./authController'),
    userController: require('./userController'),
    franchaiseController: require('./franchaiseController'),
    courseController: require('./courseController'),
    paymentController: require('./paymentController'),
    certificationController: require('./certificationController')
};