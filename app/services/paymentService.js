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
    return await paymentModel.findOne(criteria, null, { sort: { createdAt: -1 } }).lean();
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
    else if (criteria.sortKey === "distance" || criteria.sortKey === "amount") {
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
        //{ $addFields: { "challengeDataAmount": { $substr: ["$challengeData.amount", 0, -1] } } },
        {
            $match: {
                $or: [
                    { "userData.firstName": { $regex: criteria.search, $options: 'i' } },
                    { "userData.mobileNumber": { $regex: criteria.search, $options: 'i' } },
                    { 'userData.lastName': { $regex: criteria.search, $options: 'i' } },
                    { 'challengeData.distance': { $regex: criteria.search, $options: 'i' } },
                    { 'transactionID': { $regex: criteria.search, $options: 'i' } },
                    // { 'status': { $regex: criteria.search, $options: 'i' } },
                    // { 'challengeDataAmount': { $regex: criteria.search, $options: 'i' } },
                ]
            }
        },
        { $sort: sort },
        { $skip: criteria.skip },
        { $limit: criteria.limit },
        {
            $project: {
                "transactionID": 1,
                "status": 1,
                "createdAt": 1,
                "userData.firstName": 1,
                "userData.lastName": 1,
                "userData.mobileNumber": 1,
                "userData.imagePath": 1,
                "userData.mobileNumber": 1,
                "userData._id": 1,
                "challengeData.distance": 1,
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
                "amount":1,
                "status": 1,
                "createdAt": 1,
                "userData.firstName": 1,
                "userData.lastName": 1,
                "userData.mobileNumber": 1,
                "userData.gender": 1,
                "userData.country": 1,
                "userData.state": 1,
                "userData.city": 1,
                "userData.imagePath": 1,
                "userData.mobileNumber": 1,
                "userData._id": 1,
                "challengeData.distance": 1,
                // "challengeData.amount": 1,
                "challengeData.distanceType": 1
            }
        }

    ]
    return await paymentModel.aggregate(query);
}

module.exports = paymentService;