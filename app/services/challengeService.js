const CONFIG = require('../../config');
const { challengeModel, userChallengesModel } = require(`../models`);
const { convertIdToMongooseId} = require(`../utils/utils`);

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
 * function to get challenge.
 */
challengeService.getUserChallengeBasedOnCriteria = async (criteria) => {
    return await userChallengesModel.findOne(criteria).lean();
};

/**
 * function to get all challenges.
 */
challengeService.getAllChallenges = async (criteria,pagination) => {
    return await challengeModel.find(criteria).sort( { 'createdAt': -1 } ).skip(pagination.skip).limit(pagination.limit).lean();
};
/**
 * function to  get count based on criteria
 */
challengeService.listChallenge = async (criteria) => {
    return await challengeModel.find(criteria).sort({ 'createdAt': -1 }).limit(10);
};

/**
 * function to  get user by challanges
 */
challengeService.getUserByChallenges = async (criteria, pagination) => {
    let query = criteria.searchKey ? [
     {
     $match: { challengeId: convertIdToMongooseId(criteria.id)},
     },
     {
        $lookup: {
            from: 'users',
            let: { userId: '$userId',searchKey: criteria.searchKey },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ['$$userId', '$_id'] },
                            ]
                        },
                    },
                },
                    { $match: {firstName: {$regex: criteria.searchKey, $options: 'i'}}},
            ],
            as: "userData"
        }
    },
    { $unwind: "$userData" },
    { $skip: pagination.skip },
    { $limit: pagination.limit },
     //{ $match: {'userData.firstName': {$regex: criteria.searchKey, $options: 'i'}}},
     {
         $project: {
             "date":1 ,
             "timeTaken":1 ,
             "caloriesBurned":1 ,
             "avgSpeed":1 ,
             "maxSpeed":1 ,
             "userData.firstName": 1,
             "userData.lastName": 1,
             "userData.imagePath": 1

         }
     }
    ] : [
        {
        $match: { challengeId: convertIdToMongooseId(criteria.id)},
        },
        { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "userData" } },
        { $unwind: "$userData" },
        { $skip: pagination.skip },
        { $limit: pagination.limit },
        {
            $project: {
                "date":1 ,
                "timeTaken":1 ,
                "caloriesBurned":1 ,
                "avgSpeed":1 ,
                "maxSpeed":1 ,
                "userData.firstName": 1,
                "userData.lastName": 1,
                "userData.imagePath": 1
   
            }
        }
       ]
    return await userChallengesModel.aggregate(query);
};


/**
 * function to  get count based on criteria
 */
challengeService.listCount = async (criteria) => {
    return await challengeModel.countDocuments(criteria);
};

/**
* Fucntion to complete Challenges
*/
challengeService.createUserChallenge = async (criteria) => {
    return await userChallengesModel(criteria).save();
}
/** 
 * function to  get count of user by challenge
 */
challengeService.getUserCountByChallenge = async (criteria) => {
    return await userChallengesModel.countDocuments(criteria);
};

module.exports = challengeService;