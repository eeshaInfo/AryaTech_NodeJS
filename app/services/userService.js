'use strict';
const { userModel,userChallengesModel } = require('../models');
const utils = require('../utils/utils');

let userService = {};

/** 
 * function to register a new  user
 */
userService.registerUser = async (payload) => {
  // encrypt user's password and store it in the database.
  //payload.password = utils.hashPassword(payload.password);
  return await userModel(payload).save();
};

/**
 * function to update user.
 */
userService.updateUser = async (criteria, dataToUpdate, projection = {}) => {
  let updatedUserData = await userModel.findOneAndUpdate(criteria, dataToUpdate, { new: true, projection: projection }).lean();
  //function to maintain the users stats history.
  //await userService.updateUserStatsHistory(userData, updatedUserData);
  return updatedUserData;
};

/**
 * function to fetch user from the system based on criteria.
 */
userService.getUser = async (criteria, projection) => {
  return await userModel.findOne(criteria, projection).lean();
};


userService.getUsersList = async (criteria,skip,limit) => {
  return await userModel.find(criteria).skip(skip).limit(limit);
};


/**
 * function to create new user into the system.
 */
userService.createUser = async (payload) => {
  return await userModel(payload).save();
};

/**
 * function to fetch count of users from the system based on criteria.
 */
userService.getCountOfUsers = async (criteria) => {
  return await userModel.countDocuments(criteria);
};

/**
 * function to fetch users from the system based on criteria.
 */
userService.getUsers = async (criteria) => {
  return await userModel.find(criteria);
};

/**
 * Function for delete user
 */
userService.deleteUser = async (criteria)=>{
  await userChallengesModel.deleteMany({userId:criteria._id});
  return await userModel.deleteOne(criteria);
}


module.exports = userService;