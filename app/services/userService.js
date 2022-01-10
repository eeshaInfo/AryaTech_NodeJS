'use strict';
const { log } = require('npmlog');
const { userModel, userChallengesModel,walletAddressModel } = require('../models');
const CONSTANTS = require('../utils/constants');
const utils = require('../utils/utils');
const { convertIdToMongooseId } = require(`../utils/utils`);
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


userService.getUsersList = async (criteria, payload, pagination) => {
  let sort = {};
  sort[payload.sortKey] = payload.sortDirection;
  let query = [
    {
      $match: criteria
    },
    {
      $sort: sort
    },
    {
      $skip: pagination.skip
    },
    {
      $limit: pagination.limit
    },
    {
      $project: {
        "firstName": 1,
        "lastName": 1,
        "gender": 1,
        "country": 1,
        "state": 1,
        "city":1,
        "imagePath": 1,
        "mobileNumber": 1,
        'challengeCompleted': 1,
        "status": 1,
      }
    },
  ]
  return await userModel.aggregate(query);
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


//   let data = await userModel.aggregate(query);
//   return data.length
//   // return await userModel.find(criteria);
// };

/**
 * function to fetch users from the system based on criteria.
 */
userService.getUsers = async (criteria) => {
  return await userModel.find(criteria);
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
userService.updateAddress = async (criteria) => {
  return await walletAddressModel.findOneAndUpdate({},{walletAddress:criteria},{upsert: true, new:true}).lean()
}

/**
 * Function to get  wallet address
 */
userService. getAddress=async () => {
  return await walletAddressModel.findOne({},{ _id: 0, walletAddress: 1 }).lean()
}


userService.friends = async (criteria) => {
  return await userModel.aggregate(criteria, { firstName: 1, lastName: 1,challengeCompleted:1,imagePath:1})

}




module.exports = userService;