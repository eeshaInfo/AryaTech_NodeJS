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
  let query
  if (payload.searchKey) {
    query = [
      {
        $match: criteria
      },
      {
        $match: {
          $or: [
            { "firstName": { $regex: payload.searchKey, $options: 'i' } },
            { "lastName": { $regex: payload.searchKey, $options: 'i' } },
            { "mobileNumber": { $regex: payload.searchKey, $options: 'i' } },
          ]
        }
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
  }
  else {
    query = [
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
  }
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
userService.getCountOfUsers = async (criteria,search) => {
  let regex = new RegExp(search,'i');
   return await userModel.find({ $and: [ { $or: [{firstName: regex },{lastName: regex},{mobileNumber: regex}] }, criteria ] }).count()
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
      }
    }
  ]
  return await userModel.aggregate(query);
};

module.exports = userService;