const CONFIG = require('../../config');
const { challengeModel } = require(`../models`);

let challengeService = {};

/**
 * function to create a challenge.
 */
challengeService.create = async (criteria) => {
    return await challengeModel(criteria).save();

};

/**
 * function to update a challenge.
 */
challengeService.update = async (criteria, dataToUpdate) => {
    await userModel.findOneAndUpdate(criteria, dataToUpdate);
};

/**
 * function to get challenge.
 */
challengeService.getChallenge = async (criteria) => {
    return await challengeModel.findOne(criteria).lean();
};

/**
 * function to remove session of a user when user is deleted from system.
 */
challengeService.removeSession = async (criteria) => {
    return await challengeModel.findOneAndDelete(criteria);
};

module.exports = challengeService;