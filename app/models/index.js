"use strict";
const CONFIG = require("../../config");
/********************************
 **** Managing all the models ***
 ********* independently ********
 ********************************/
module.exports = {
  userModel: require(`../models/userModel`),
  dbVersionModel: require(`../models/dbVersionModel`),
  sessionModel:require(`../models/sessionModel`),
  challengeModel:require(`../models/challengeModel`),
  userChallengesModel:require(`../models/userChallengesModel`),
  paymentModel:require(`./paymentModel`),
};
