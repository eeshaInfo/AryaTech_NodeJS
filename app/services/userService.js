'use strict';
const { userModel, userChallengesModel } = require('../models');
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
        "imagePath": 1,
        "mobileNumber": 1,
        'challengeCompleted': 1,
        "status": 1
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

userService.getUserDetails = async (criteria) => {
  let query = [
    { $match: { _id: convertIdToMongooseId(criteria) } },
    {
      $lookup: {
        from: "userchallenges",
        let: { id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $and: [{ $eq: ['$userId', '$$id'] }] }
            },
          },
        ],
        as: "userData"
      }
    }, {
      $unwind: "$userData"
    },
    {
      $lookup: {
        from: "challenges",
        localField: "userData.challengeId",
        foreignField: "_id",
        as: "challengeData"
      }
    },
    {
      $unwind: "$challengeData"
    },

    {
      $project: {
        "_id": 0,
        "firstName": 1,
        "lastName": 1,
        "imagePath": 1,
        "mobileNumber": 1,
        "country": 1,
        "state": 1,
        "city": 1,
        "zipCode": 1,
        "gender": 1,
        "dob": 1,
        "userData": 1,
        challengeName: {
          $cond: { if: { $eq: ["$challengeData.distanceType", 2] }, then:{$multiply:["$challengeData.challengeName",1000]}, else: "$challengeData.challengeName" }
        },
        // totalDistance: { $sum: "$challengeData.challengeName", }     
        // "userData.timeTaken": 1,
        // "userData.caloriesBurned": 1,
        // "userData.challengeData.challengeName": 1
    }
  }
  ]
  return await userModel.aggregate(query);
};

module.exports = userService;