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
    await challengeModel.findOneAndUpdate(criteria, dataToUpdate);
};

/**
 * function to get challenge.
 */
challengeService.getChallenge = async (criteria) => {
    return await challengeModel.findOne(criteria).lean();
};
/**
 * function to get all challenges.
 */
challengeService.getAllChallenges = async (criteria,projection) => {
    return await challengeModel.find(criteria,projection).lean();
};
/**
 * function to  get count based on criteria
 */
challengeService.listChallenge = async (criteria) => {
    return await challengeModel.find(criteria).sort({'createdAt': -1 }).limit(10);
};

/**
 * function to  get count based on criteria
 */
challengeService.listCount = async (criteria) => {
    return await challengeModel.countDocuments(criteria);
};

module.exports = challengeService;