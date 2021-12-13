"use strict";
const CONFIG = require("../../config");
/********************************
 **** Managing all the models ***
 ********* independently ********
 ********************************/
module.exports = {
  userModel: require(`../models/camel_sports/userModel`),
  adminModel: require('../models/camel_sports/adminModel'),
  dbVersionModel: require(`../models/camel_sports/dbVersionModel`)
};
