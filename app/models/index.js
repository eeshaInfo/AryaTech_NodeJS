"use strict";
const CONFIG = require("../../config");
/********************************
 **** Managing all the models ***
 ********* independently ********
 ********************************/
module.exports = {
  userModel: require(`../models/userModel`),
  courseModel: require('../models/courseModel'),
  paymentModel: require('../models/paymentModel'),
  certificationModel: require('../models/certificationModel'),
  dbVersionModel: require(`../models/dbVersionModel`),
  sessionModel:require(`../models/sessionModel`),
};
