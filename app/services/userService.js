'use strict';
const { userModel } = require('../models');
const CONSTANTS = require('../utils/constants');
let userService = {};

/**
 * function to update user.
 */
userService.updateUser = async (criteria, dataToUpdate, projection = {}) => {
  return await userModel.findOneAndUpdate(criteria, dataToUpdate, { new: true, projection: projection }).lean();
};

/**
 * function to fetch user from the system based on criteria.
 */
userService.getUser = async (criteria, projection) => {
  return await userModel.findOne(criteria, projection).lean();
};

userService.updateUserStatus = async(criteria, dataToUpdate)=>{
  return await userModel.updateOne(criteria,{$set:dataToUpdate})
}

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
  return await userModel.countDocuments(criteria)
}

/**
 * function to fetch users from the system based on criteria.
 */
userService.getUsers = async (criteria, projection= {}) => {
  return await userModel.find(criteria,projection);
};

/**
 * Function for delete user
 */
userService.deleteUser = async (criteria) => {
  return await userModel.deleteOne(criteria);
}


userService.update = async(criteria,dataToUpdate)=>{
  return await userModel.updateOne(criteria,{$set:dataToUpdate})
}

/**
 * Function to get  wallet address
 */
userService.findOne=async (criteria, projection = {} ) => {
  return await userModel.findOne(criteria,projection).lean()
}

userService.getLatestRecord = async(criteria, projection ={})=>{
  return await userModel.findOne(criteria,projection).sort({'createdAt':-1})
}

/**
 * Function to get aggregate data from user Model
 */
userService.userAggregate=async (query) => {
  return await userModel.aggregate(query);
}




module.exports = userService;