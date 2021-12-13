'use strict';
const { adminModel } = require('../models');
const utils = require('../utils/utils');

let adminService = {};

/** 
 * function to register a new  user
 */
adminService.registerUser = async (payload) => {
    // encrypt user's password and store it in the database.
    payload.password = utils.hashPassword(payload.password);
    return await userModel(payload).save();
};

/**
 * function to update user.
 */
adminService.updateUser = async (criteria, dataToUpdate, projection = {}) => {
    let updatedUserData = await userModel.findOneAndUpdate(criteria, dataToUpdate, { new: true, projection: projection }).lean();
    //function to maintain the users stats history.
    //await adminService.updateUserStatsHistory(userData, updatedUserData);
    return updatedUserData;
};

/**
 * function to fetch user from the system based on criteria.
 */
adminService.getUser = async (criteria, projection) => {
    return await userModel.findOne(criteria, projection).lean();
};

/**
 * function to create new user into the system.
 */
adminService.createUser = async (payload) => {
    return await userModel(payload).save();
};

/**
 * function to fetch count of users from the system based on criteria.
 */
adminService.getCountOfUsers = async (criteria) => {
    return await userModel.countDocuments(criteria);
};

/**
 * function to fetch users from the system based on criteria.
 */
adminService.getUsers = async (criteria) => {
    return await userModel.find(criteria);
};


module.exports = adminService;