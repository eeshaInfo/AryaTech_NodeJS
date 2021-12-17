"use strict";
const CONFIG = require("../../config");
/********************************
 **** Managing all the models ***
 ********* independently ********
 ********************************/
module.exports = {
  userModel: require(`../models/camel_sports/userModel`),
  dbVersionModel: require(`../models/camel_sports/dbVersionModel`),
  sessionModel:require(`../models/camel_sports/sessionModel`),
  challengeModel:require(`../models/camel_sports/challengeModel`),
  userChallengesModel:require(`../models/camel_sports/userChallengesModel`),
};
