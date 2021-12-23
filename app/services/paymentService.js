const CONFIG = require('../../config');
const { paymentModel } = require(`../models`);

let paymentService = {};

/**
 * function to update a payment detail.
 */
paymentService.updatePayment = async (criteria, dataToUpdate) => {
    return await paymentModel.findOneAndUpdate(criteria, dataToUpdate, { new: true, upsert: true }).lean();
};

/**
 * function to get payment detail.
 */
paymentService.getPayment = async (criteria) => {
    return await paymentModel.findOne(criteria).lean();
};

/**
 * function to get payment list.
 */
// paymentService.getPayment = async (criteria) => {
//     return await paymentModel.find(criteria).lean();
// };


paymentService.updatePaymentDetails = async (dataToInsert) => {
    return await paymentModel.create(dataToInsert)
}

paymentService.getPaymentDetails = async (criteria) => {
    let sort = {}
    if (criteria.sortKey === "firstName" || criteria.sortKey === "lastName") {
        criteria.sortKey = `userData.${criteria.sortKey}`
        sort[criteria.sortKey] = criteria.sortDirection;
    }
    else if (criteria.sortKey === "challengeName" || criteria.sortKey === "amount") {
        criteria.sortKey = `challengeData.${criteria.sortKey}`
        sort[criteria.sortKey] = criteria.sortDirection;
    }
    else {
        sort[criteria.sortKey] = criteria.sortDirection;
    }
    let query = criteria.search ? [
        {
            $lookup:
            {
                // from: "users",
                // let: { userId: "$userId", challengeId: "$challengeId" },
                // pipeline: [
                //     { $match: { $expr: { $and: [{ $eq: ['$$userId', '$_id'] }] } } },
                //     {
                //         $lookup:
                //         {
                //             from: "challenges",
                //             let: { challengeId: "$$challengeId", searchKey: criteria.searchKey },
                //             pipeline: [
                //                 { $match: { $expr: { $and: [{ $eq: ['$$challengeId', '$_id'] }] } } },
                //             ],
                //             as: "challengeData"
                //         }
                //     }
                // ],
                // as: "userData"
                //   },
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "userData"
            }
        },
        { $unwind: "$userData" },
        {
            $lookup:
            {
                from: "challenges",
                localField: "challengeId",
                foreignField: "_id",
                as: "challengeData"
            }
        },
        { $unwind: "$challengeData" },
        { $match: { firstName: { $regex: criteria.search, $options: 'i' } } },
        { $sort: sort },
        { $skip: criteria.skip },
        { $limit: criteria.limit },
        {
            $project: {
                "transactionID": 1,
                "status": 1,
                "userData.firstName": 1,
                "userData.lastName": 1,
                "userData.imagePath": 1,
                "userData.mobileNumber": 1,
                "challengeData.challengeName": 1,
                "challengeData.amount": 1,
                "challengeData.distanceType": 1
            }
        }


    ] : [

        {
            $lookup:
            {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "userData"
            }
        },
        { $unwind: "$userData" },
        {
            $lookup:
            {
                from: "challenges",
                localField: "challengeId",
                foreignField: "_id",
                as: "challengeData"
            }
        },
        { $unwind: "$challengeData" },
        { $sort: sort },
        { $skip: criteria.skip },
        { $limit: criteria.limit },
        {
            $project: {
                "transactionID": 1,
                "status": 1,
                "userData.firstName": 1,
                "userData.lastName": 1,
                "userData.imagePath": 1,
                "userData.mobileNumber": 1,
                "challengeData.challengeName": 1,
                "challengeData.amount": 1,
                "challengeData.distanceType": 1
            }
        }

    ]
    return await paymentModel.aggregate(query);
}

module.exports = paymentService;