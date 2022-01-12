'use strict';
const { userModel, userChallengesModel,walletAddressModel } = require('../models');
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
  await userChallengesModel.deleteMany({ userId: criteria._id });
  return await userModel.deleteOne(criteria);
}
/**
 * Function to get challenge information completed by user 
 */
userService.getUserStats = async (criteria) => {
  let query = [
    { $match: criteria },
    { $lookup: { from: "challenges", localField: "challengeId", foreignField: "_id", as: "challengeData" } },
    { $unwind: "$challengeData" },
    // { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "userData" } },
    // { $unwind: "$userData" },
    {
      $addFields: {
        distanceTravelledInMeter: { $cond: { if: { $eq: ["$challengeData.distanceType", CONSTANTS.DISTANCE_TYPE.KM] }, then: { $multiply: ["$challengeData.distance", 1000] }, else: "$challengeData.distance" } }
      }
    },
    {
      $group: {
        _id: '$userId',
        totalCalories: {
          $sum: "$caloriesBurned"
        },
        totalTime: {
          $sum: "$timeTaken"
        },
        totalDistance: {
          $sum: "$distanceTravelledInMeter"
        }
      }
    },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userData" } },
    { $unwind: "$userData" },
    {
      $project: {
        totalCalories: 1,
        totalTime: 1,
        totalDistance: 1,
        _id:0,
        'userData._id': 1,
        'userData.firstName': 1,
        'userData.lastName': 1,
        'userData.imagePath': 1,
      }
    }
  ]
  return await userChallengesModel.aggregate(query);
};

/**
 * Function to update admin wallet address
 */
userService.updateAddress = async (criteria, dataToUpdate) => {
  return await walletAddressModel.findOneAndUpdate(criteria, dataToUpdate, { upsert: true, new: true }).lean()
}

/**
 * Function to get  wallet address
 */
userService.getAddress=async (criteria, projection = {} ) => {
  return await walletAddressModel.findOne(criteria,projection).lean()
}

/**
 * Function to get aggregate data from user Model
 */
userService.userAggregate=async (query) => {
  return await userModel.aggregate(query);
}



module.exports = userService;