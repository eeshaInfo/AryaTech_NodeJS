"use strict";
 const { admin } = require(`../../config/firebaseConfig`);
 const { responseHelper } = require(`../helpers`);
 const { ERROR_TYPES, MESSAGES } = require('../utils/constants');
let fcmNotificationService = {};

/**
 * Function to send notification to recipient.
 * @param {*} message // Message object having device ('topic' or 'token') and ('data' or 'notification') fields to send.
 */
fcmNotificationService.pushNotification = async () => {
    var message = {
        notification: {
          title: 'Message from node',
          body: 'hey there'
        },
        token: '43423feerftw'
        //topic: topic
      };
    return await admin.messaging().send(message)
        .then(response => {
            console.log('<<<<<<',response);
            let messageId = response.split("/").reverse()[0] || '';
            return Object.assign(responseHelper.createSuccessResponse(MESSAGES.FCM.NOTIFICATION_SENT_SUCCESSFULLY), { messageId });
        })
        .catch(error => {
            console.log('<<<<<<<<<<',error);
            throw responseHelper.createErrorResponse(error.message, ERROR_TYPES.BAD_REQUEST);
        });
};

module.exports = fcmNotificationService;
