const CONFIG = require('../../config');
const { challengeModel, userChallengesModel } = require(`../models`);
const { PAGINATION } = require(`../utils/constants`);
const { convertIdToMongooseId } = require(`../utils/utils`);

let challengeService = {};

/**
 * function to create a challenge.
 */
challengeService.create = async (payload) => {
    return await challengeModel(payload).save();
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
challengeService.getChallenge = async (criteria, projection = {}) => {
    return await challengeModel.findOne(criteria, projection).lean();
};

/**
 * function to get challenge.
 */
challengeService.getUserChallengeBasedOnCriteria = async (criteria) => {
    return await userChallengesModel.findOne(criteria).lean();
};

/**
 * function to  get completed challenge based on criteria
 */
challengeService.listUserChallenge = async (criteria) => {
    return await userChallengesModel.find(criteria).sort({ updatedAt: -1 }).lean();
};

/**
 * function to  get user by challanges
 */
challengeService.getUserByChallenges = async (criteria) => {
    let sort = {}
    if (criteria.sortKey === "firstName" || criteria.sortKey === "lastName") {
        criteria.sortKey = `userData.${criteria.sortKey}`
        sort[criteria.sortKey] = criteria.sortDirection;
    }
    else {
        sort[criteria.sortKey] = criteria.sortDirection;
    }

    let query = criteria.searchKey ? [
        {
            $match: { challengeId: convertIdToMongooseId(criteria.challengeId) },
        },

        {
            $lookup: {
                from: 'users',
                let: { userId: '$userId', searchKey: criteria.searchKey },
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
                ],
                as: "userData"
            }
        },
        { $unwind: "$userData" },
        //{ $addFields: { "challengeDataAmount": { $substr: ["$challengeData.amount", 0, -1] } } },
        {
            $match: {
                $or: [
                    { "userData.firstName": { $regex: criteria.searchKey, $options: 'i' } },
                    { 'userData.lastName': { $regex: criteria.searchKey, $options: 'i' } },
                    { 'userData.mobileNumber': { $regex: criteria.searchKey, $options: 'i' } },
                    //  { 'avgSpeed': { $regex: criteria.searchKey, $options: 'i' } },
                    //  { 'maxSpeed': { $regex: criteria.searchKey, $options: 'i' } },
                    //  { 'timeTaken': { $regex: criteria.searchKey, $options: 'i' } }
                ]
            }
        },
        { $sort: sort },
        {
            $facet: {
                totalCount: [
                    { $count: "value" }
                ],
                pipelineResults: [
                    {
                        $project: {
                            "date": 1,
                            "timeTaken": 1,
                            "caloriesBurned": 1,
                            "avgSpeed": { $round: [ "$avgSpeed", 2 ] } ,
                            "maxSpeed": { $round: [ "$maxSpeed", 2 ] } ,
                            "completingDate": 1,
                            "userData.firstName": 1,
                            "userData.lastName": 1,
                            "userData.imagePath": 1,
                            "userData.mobileNumber": 1,
                            "userData._id": 1,
                        }
                    }
                ]
            }
        },
        { $unwind: "$pipelineResults" },
        { $unwind: "$totalCount" },
        { $replaceRoot: { newRoot: { $mergeObjects: ["$pipelineResults", { totalCount: "$totalCount.value" }] } } },
        { $skip: criteria.skip },
        { $limit: criteria.limit },
    ] : [
        {
            $match: { challengeId: convertIdToMongooseId(criteria.challengeId) },
        },
        { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "userData" } },
        { $unwind: "$userData" },
        { $sort: sort },
        {
            $facet: {
                totalCount: [
                    { $count: "value" }
                ],
                pipelineResults: [
                    {
                        $project: {
                            "date": 1,
                            "timeTaken": 1,
                            "caloriesBurned": 1,
                            "avgSpeed": { $round: [ "$avgSpeed", 2 ] } ,
                            "maxSpeed": { $round: [ "$maxSpeed", 2 ] } ,
                            "completingDate": 1,
                            "userData.firstName": 1,
                            "userData.lastName": 1,
                            "userData.imagePath": 1,
                            "userData.mobileNumber": 1,
                            "userData._id": 1,
                        }
                    }
                ]
            }
        },
        { $unwind: "$pipelineResults" },
        { $unwind: "$totalCount" },
        { $replaceRoot: { newRoot: { $mergeObjects: ["$pipelineResults", { totalCount: "$totalCount.value" }] } } },
        { $skip: criteria.skip },
        { $limit: criteria.limit }
    ]
    return await userChallengesModel.aggregate(query);
};



/**
 * function to  get challenges by user
 */
challengeService.getChallengesByUser = async (payload) => {
    let sort = {}
    if (payload.sortKey === "distance") {
        payload.sortKey = `challengeData.${payload.sortKey}`
        sort[payload.sortKey] = payload.sortDirection;
    }
    else {
        sort[payload.sortKey] = payload.sortDirection;
    }
    let query = payload.searchKey ? [
        {
            $match: { userId: payload.userId },
        },
        {
            $addFields: {
                completedChallenge: {
                    $substr: ['$challengeCompleted', 0, -1]
                }
            }
        },
        {
            $lookup: {
                from: 'challenges',
                let: { challengeId: '$challengeId', searchKey: payload.searchKey },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$$challengeId', '$_id'] },
                                ]
                            },
                        },
                    },
                    //{ $match: {firstName: {$regex: criteria.searchKey, $options: 'i'}}},
                ],
                as: "challengeData"
            }
        },
        { $unwind: "$challengeData" },
        {
            $addFields: {
                challengeNameString: {
                    $toString: '$challengeData.distance'
                }
            },
        },
        {
            $match: {
                $or: [
                    { "challengeNameString": { $regex: payload.searchKey, $options: 'i' } }
                ]
            }
        },
        { $sort: sort },
        {
            $facet: {
                totalCount: [
                    { $count: "value" }
                ],
                pipelineResults: [
                    {
                        $project: {
                            "date": 1,
                            "timeTaken": 1,
                            "caloriesBurned": 1,
                            "avgSpeed": { $round: [ "$avgSpeed", 2 ] } ,
                            "maxSpeed": { $round: [ "$maxSpeed", 2 ] } ,
                            "completingDate": 1,
                            "challengeData.distance": 1,
                            "challengeData.distanceType": 1,
                            "challengeData._id": 1
                        }
                    }
                ]
            }
        },
        { $unwind: "$pipelineResults" },
        { $unwind: "$totalCount" },
        { $replaceRoot: { newRoot: { $mergeObjects: ["$pipelineResults", { totalCount: "$totalCount.value" }] } } },
        { $skip: payload.skip },
        { $limit: payload.limit },
    ] : [
        {
            $match: { userId: payload.userId },
        },
        { $lookup: { from: "challenges", localField: "challengeId", foreignField: "_id", as: "challengeData" } },
        { $unwind: "$challengeData" },
        { $sort: sort },
        {
            $facet: {
                totalCount: [
                    { $count: "value" }
                ],
                pipelineResults: [
                    {
                        $project: {
                            "date": 1,
                            "timeTaken": 1,
                            "caloriesBurned": 1,
                            avgSpeed: { $round: ["$avgSpeed", 2] },
                            maxSpeed: { $round: ["$maxSpeed", 2] },
                            "completingDate": 1,
                            "challengeData.distance": 1,
                            "challengeData.distanceType": 1,
                            "challengeData._id": 1

                        }
                    }
                ]
            }
        },
        {
            $unwind: "$pipelineResults"
        },
        {
            $unwind: "$totalCount"
        },
        {
            $replaceRoot: {
                newRoot: {
                    $mergeObjects: ["$pipelineResults", { totalCount: "$totalCount.value" }]
                }
            }
        },
        { $skip: payload.skip },
        { $limit: payload.limit }
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

/**
 * aggregation common model for userChallengeModel
 */
challengeService.getLeaderboardList = async (criteria, payload, userCriteria = {}) => {
    let userExists = Object.keys(payload.user).length > 0
    let query = [
        {
            $match: criteria
        },
        {
            $group: {
                _id: '$userId',
                'timeTaken': { $min: '$timeTaken' },
            }
        },
        {
            $sort: { timeTaken: 1 }
        },
        {
            $group: {
                _id: '$false',
                challengeData: {
                    $push: {
                        "userId": "$_id",
                        "timeTaken": "$timeTaken",
                    }
                }
            }
        },
        {
            $unwind: {
                path: "$challengeData",
                includeArrayIndex: "rank"
            }
        },
        {
            $lookup: {
                from: 'users',
                let: { userId: '$challengeData.userId' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$$userId', '$_id'] },
                                    userCriteria
                                ]
                            },
                        },
                    },
                ],
                as: "userData"
            }
        },
        { $unwind: "$userData" },
        //{ $addFields: { order: { $cond: { if: { $eq: ["$userData._id", payload.user._id] }, then: 0, else: 1 } } } },
        { ...(userExists ? { $addFields: { order: { $cond: { if: { $eq: ["$userData._id", payload.user._id] }, then: 0, else: 1 } } } } : { $match: {} }) },
        { ...(userExists ? { $sort: { order: 1 } } : { $match: {} }) },
        {
            $limit: PAGINATION.DEFAULT_LIMIT
        },
        {
            $project: {
                _id: 0,
                "rank": { $sum: ["$rank", 1] },
                timeTaken: '$challengeData.timeTaken',
                "userData._id": 1,
                "userData.firstName": 1,
                "userData.lastName": 1,
                "userData.imagePath": 1,
                "userData.mobileNumber": 1,
                "userData.country": 1,
                "userData.state": 1,
                "userData.city": 1,
                "userData.rank": 1
            }
        }
    ]
    return await userChallengesModel.aggregate(query);
}

/**
* aggregation common model for user challengeModel
*/
challengeService.userChallengeAggregate = async (query) => {
    return await userChallengesModel.aggregate(query);
}

/**
 * aggregation common model for challengeModel
 */
challengeService.challengeAggregate = async (query) => {
    return await challengeModel.aggregate(query);
}

module.exports = challengeService;        handler: userController.friendList
