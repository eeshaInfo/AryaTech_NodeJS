const CONFIG = require('../../config');
const { challengeModel, userChallengesModel } = require(`../models`);
const { PAGINATION } = require(`../utils/constants`);
const { convertIdToMongooseId } = require(`../utils/utils`);

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
challengeService.getAllChallenges = async (criteria, pagination) => {
    let sort = {};
    if (pagination.sortKey) {
        sort[pagination.sortKey] = pagination.sortDirection;
    } else {
        sort['createdAt'] = -1;
    }
    let query = [
        {
            $addFields: {
                challengeNameString: {
                    $toString: '$distance'
                }
            },
        },
        {
            $match: criteria,
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
    ]
    return await challengeModel.aggregate(query);
};

challengeService.getAllGuestChallenges = async (criteria) => {
    let sort = {};
    sort['createdAt'] = -1;
    let query = [
        {
            $match: criteria,
        },
        {
            $sort: sort
        },
        {
            $addFields: {
                completed: 0
            }
        }

    ]
    return await challengeModel.aggregate(query);
};


/**
 * function to get all challenges.
 */
challengeService.listCountForDashboard = async (criteria, pagination) => {
    //let sort = {};
    //sort[pagination.sortKey] = pagination.sortDirection;
    let query = [
        {
            $addFields: {
                challengeNameString: {
                    $toString: '$distance'
                }
            },
        },
        {
            $match: criteria,
        }
    ]
    let data = await challengeModel.aggregate(query);
    return data.length;
};
/**
 * function to  get count based on criteria
 */
challengeService.listChallenge = async (criteria, pagination) => {
    return await challengeModel.find(criteria).sort([[pagination.sortKey, pagination.sortDirection]]).skip(pagination.skip).limit(pagination.limit).lean();
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
challengeService.getChallengesByUser = async (payload, pagination) => {
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
        { $skip: pagination.skip },
        { $limit: pagination.limit },
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
        { $skip: pagination.skip },
        { $limit: pagination.limit }
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
 * function to  get challenge list for user
 */
challengeService.getChallengeListForUser = async (criteria) => {

    let query = [
        {
            $match: { isDeleted: false },
        },
        {
            // $addFields: {
            //     isChallengeCompleted: { $cond: [{ $in: [criteria.user.challenges, '$challenges._id'] }, 1, 0] }
            // }
            $addFields: {
                isChallengeCompleted: { $cond: { if: { $in: ["$_id", criteria.user.challenges] }, then: 1, else: 0 } }
            }
        },
        {
            $project: {
                "distance": 1,
                "type": 1,
                "distanceType": 1,
                "amount": 1,
                isChallengeCompleted: 1,

            }
        }
    ]
    return await challengeModel.aggregate(query);
};



challengeService.getHistory = async (criteria) => {
    let query = [
        {
            $match: criteria,
        },
        { $lookup: { from: "challenges", localField: "challengeId", foreignField: "_id", as: "challengeData" } },
        { $unwind: "$challengeData" },
        {
            $group: {
                _id: '$challengeId',
                challengeCompletedCount: {
                    $sum: 1
                },
                "distance": { "$first": "$challengeData.distance" },
                "distanceType": { "$first": "$challengeData.distanceType" }
            }
        },
    ]
    return await userChallengesModel.aggregate(query);
};

/**
 * function to get leaderboard data
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
                'timeTaken': { $max: '$timeTaken' },
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
        { ...(userExists ? { $addFields: { order: { $cond: { if: { $eq: ["$userData._id", payload.user._id] }, then: 0, else: 1 } } } }: { $match: {} }) },
        { ...(userExists ? { $sort: { order: 1 } }: { $match: {} }) },
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
    console.log(query)
    return await userChallengesModel.aggregate(query);
};


challengeService.calender = async (criteria) => {
    let query = [
        { $match: criteria },
        { $group: { _id: "$completingDate" } },
        { $project: { completingDate: "$_id" } },
        { $project: { _id: 0 } }

        //         {
        //     $project: {
        //         _id: 0,
        //         date: {
        //             $dateToString: {
        //                 format: "%Y-%m-%d",
        //                 date: "$completingDate"
        //             }
        //         }
        //     }
        // },
        // {
        //     $group: {
        //         _id: "$date"
        //     }
        // }  
    ]
    return await userChallengesModel.aggregate(query)
}

module.exports = challengeService;