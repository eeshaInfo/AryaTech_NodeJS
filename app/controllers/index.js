'use strict';

/********************************
 * Managing all the controllers *
 ********* independently ********
 ********************************/
module.exports = {
    userController: require('./userController'),
    courseController: require('./courseController'),
    paymentController: require('./paymentController'),
    certificationController: require('./certificationController')
};