'use strict';
const { franchaiseModel} = require('../models');
const CONSTANTS = require('../utils/constants');
let franchaiseService = {};

/**
 * function to update user.
 */
franchaiseService.update = async (criteria, dataToUpdate, projection = {}) => {
  return await franchaiseModel.findOneAndUpdate(criteria, dataToUpdate, { new: true, projection: projection }).lean();
};

/**
 * function to fetch user from the system based on criteria.
 */
franchaiseService.getFranchaise = async (criteria, projection) => {
  return await franchaiseModel.findOne(criteria, projection).lean();
};

franchaiseService.updateStatus = async(criteria, dataToUpdate)=>{
  return await franchaiseModel.updateOne(criteria,{$set:{dataToUpdate}})
}

/**
 * function to create new user into the system.
 */
franchaiseService.create = async (payload) => {
  return await franchaiseModel(payload).save();
};

/**
 * function to fetch count of users from the system based on criteria.
 */
franchaiseService.getCount = async (criteria) => {
  return await franchaiseModel.countDocuments(criteria)
}

/**
 * function to fetch users from the system based on criteria.
 */
franchaiseService.getAll= async (criteria, projection= {}) => {
  return await franchaiseModel.find(criteria,projection);
};

/**
 * Function for delete user
 */
franchaiseService.delete = async (criteria) => {
  await userChallengesModel.deleteMany({ userId: criteria._id });
  return await franchaiseModel.deleteOne(criteria);
}

franchaiseService.getLatestRecord = async(criteria, projection ={})=>{
  return await franchaiseModel.findOne(criteria,projection).sort({'createdAt':-1})
}

/**
 * Function to get aggregate data from user Model
 */
franchaiseService.userAggregate=async (query) => {
  return await franchaiseModel.aggregate(query);
}




module.exports = franchaiseService;