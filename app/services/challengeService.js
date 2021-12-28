const CONFIG = require('../../config');
const { challengeModel, userChallengesModel } = require(`../models`);
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
            $addFields : {
            challengeNameString: {
              $toString: '$challengeName'
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
        // {
    //         $addFields: {
    //             challengeNameString: {
    //                 $toString: '$challengeName'
    //             }
    //         },
        // },
        {
            $match: criteria,
        },
        {
            $sort: sort
        },
        {
            $addFields: {
                completed:0
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
            $addFields : {
            challengeNameString: {
              $toString: '$challengeName'
            }
          },
        },
        {
            $match: criteria,
        }
    ]
    let data =await challengeModel.aggregate(query);
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
    return await userChallengesModel.find(criteria).lean();
};

/**
 * function to  get user by challanges
 */
challengeService.getUserByChallenges = async (criteria) => {
   console.log(criteria);
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
            $match: { challengeId: convertIdToMongooseId(criteria.id) },
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
                    { 'avgSpeed': { $regex: criteria.searchKey, $options: 'i' } },
                    { 'maxSpeed': { $regex: criteria.searchKey, $options: 'i' } },
                    { 'timeTaken': { $regex: criteria.searchKey, $options: 'i' } }
                ]
            }
        },
        { $sort: sort },
        { $skip: criteria.skip },
        { $limit: criteria.limit },
        {
            $project: {
                "date": 1,
                "timeTaken": 1,
                "caloriesBurned": 1,
                "avgSpeed": 1,
                "maxSpeed": 1,
                "completingDate": 1,
                "userData.firstName": 1,
                "userData.lastName": 1,
                "userData.imagePath": 1,
                "userData.mobileNumber": 1

            }
        },
        //   {$sort:{"pagination.sortKey":pagination.sortDirection}},
    ] : [
        {
            $match: { challengeId: convertIdToMongooseId(criteria.id) },
        },
        { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "userData" } },
        { $unwind: "$userData" },
        { $sort: sort },
        { $skip: criteria.skip },
        { $limit: criteria.limit },
        {
            $project: {
                "date": 1,
                "timeTaken": 1,
                "caloriesBurned": 1,
                "avgSpeed": 1,
                "maxSpeed": 1,
                "completingDate": 1,
                "userData.firstName": 1,
                "userData.lastName": 1,
                "userData.imagePath": 1,
                "userData.mobileNumber": 1

            }
        }
    ]
    return await userChallengesModel.aggregate(query);
};



/**
 * function to  get challenges by user
 */
challengeService.getChallengesByUser = async (payload, pagination) => {
    console.log(payload);
    let query = payload.searchKey ? [
     {
     $match: { userId: payload.id} ,
     },
     {
        $lookup: {
            from: 'users',
            let: { userId: '$userId',searchKey: payload.searchKey },
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
             "completingDate": 1,
             "userData.firstName": 1,
             "userData.lastName": 1,
             "userData.imagePath": 1

         }
     }
    ] : [
        {
            $match: { userId: payload.id} ,
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
                "completingDate": 1,
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
                isChallengeCompleted: { $cond: { if: { $in: ["$_id", criteria.user.challenges ] }, then: 1, else:0 }}}
        },
        {
            $project: {
                "challengeName":1 ,
                "challengeType":1 ,
                "distanceType":1 ,
                "amount":1 ,
                isChallengeCompleted:1 ,
   
            }
        }
       ]
    return await challengeModel.aggregate(query);
};

module.exports = challengeService;