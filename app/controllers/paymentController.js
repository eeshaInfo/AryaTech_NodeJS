const CONFIG = require('../../config');
const {dbService} = require('../services')
const {paymentModel} = require('../models')
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION } = require('../utils/constants');

let paymentController= {}

paymentController.acceptPayment= async(payload)=>{
    payload.transactionId = new Date().getTime()
    let data = await dbService.create(paymentModel,payload)
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PAYMENT_ACCEPTED_SUCCESSFULLY), { data })
}

paymentController.editAcceptedPayment= async(payload)=>{

}


paymentController.getPaymentById= async(payload)=>{

}

paymentController.getPaymentList= async(payload)=>{
    let regex = new RegExp(payload.searchKey, 'i');
    let criteria = {
        $and: [{ $or: [{ "userData.studentsName": regex } ,{ "userData.mobileNumber": regex }] },{isDeleted: false}]
    }
    if(payload.userId){
        criteria = {
            $and: [{ $or: [{ "userData.studentsName": regex } ,{ "userData.mobileNumber": regex }] },{isDeleted: false,userId:payload.userId}]
    }}
    let matchCriteria = criteria;
    let sort={}
    sort[payload.sortKey]= payload.sortDirection
    console.log('sortData',sort)

    let queryArray=[
        { $lookup:{
            from:'users',
            localField:'userId',
            foreignField: '_id',
            as:'userData'
        }},
        { $match:matchCriteria},
        { $unwind:{path:"$userData", preserveNullAndEmptyArrays: true }},

        { $lookup:{
            from:'course',
            localField:'courseId',
            foreignField: '_id',
            as:'courseData'
        }},
        { $unwind:{path:"$courseData", preserveNullAndEmptyArrays: true }},
        {$project:{
            "userId": 1,
            "transactionId":1,
            "mode":1,
            "amount":1,
            "createdAt":1,
            "name": "$userData.name",
            "mobileNumber":"$userData.mobileNumber",
            "course":"$courseData.name",
            "duration":"$courseData.duration"

        }},
        {$group:{
            _id : "$userId",
            amountReceived : {$sum : "$amount"},
            userId: {$first : "$userId" },
            name: {$first : "$name" },
            transactionId: {$first : "$transactionId" },
            mode: {$first : "$mode" },
        }},
        { $sort:sort},
        { $skip:payload.skip },
        { $limit: payload.limit },
    ]

    let data = await dbService.aggregate(paymentModel,queryArray)
    let totalCount = await dbService.countDocument(paymentModel,matchCriteria)
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PAYMENT_LIST_FETCHED_SUCCESSFULLY), { data,totalCount })

 }

paymentController.deletePayment= async(payload)=>{
    let criteria= {_id: payload._id}
    let dataToUpdate = {isDeleted:true}
    let data = await dbService.findOneAndUpdate(paymentModel,criteria,dataToUpdate)
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PAYMENT_DELETE_SUCCESSFULLY), { data })
}

module.exports= paymentController;