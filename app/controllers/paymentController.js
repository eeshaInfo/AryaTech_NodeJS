const CONFIG = require('../../config');
const {dbService} = require('../services')
const {paymentModel, userModel} = require('../models')
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, USER_TYPES } = require('../utils/constants');

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
        $and: [{ $or: [{ "name": regex } ,{ "regNo": regex }] },{isDeleted: {$ne:true} ,userType: USER_TYPES.STUDENT}]
    }
    // if(payload.userId){
        //     criteria = {
            //         $and: [{ $or: [{ "userData.studentsName": regex } ,{ "userData.mobileNumber": regex }] },{isDeleted: false,userId:payload.userId}]
            // }}
    let matchCriteria = criteria;
    let sort={}
    sort[payload.sortKey]= payload.sortDirection
    let queryArray=[
        { $match:matchCriteria},
        { $lookup:{
            from:'payments',
            localField:'_id',
            foreignField: 'userId',
            as:'paymentsData'
        }},
        { $unwind:{path:"$paymentsData", preserveNullAndEmptyArrays: true }},

        { $lookup:{
            from:'course',
            localField:'courseId',
            foreignField: '_id',
            as:'courseData'
        }},
        { $unwind:{path:"$courseData", preserveNullAndEmptyArrays: true }},
        {$project:{
            "userId": "$paymentsData.userId",
            "createdAt":1,
            "name": 1,
            "mobileNumber":1,
            "totalFees" :1,
            "amount" : "$paymentsData.amount",
            "course":"$courseData.name",
            "duration":"$courseData.duration"

        }},
        {$group:{
            _id : "$_id",
            amountPaid : {$sum : "$amount"},
            name: {$first : "$name" },
            totalFees: {$first : "$totalFees"},
            course: {$first : "$course" },
            mobileNumber: {$first : "$mobileNumber" },
        }},
        {$addFields:{"totalDues":{$subtract:["$totalFees","$amountPaid"]}}},
        { $sort:sort},
        { $skip:payload.skip },
        { $limit: payload.limit },
    ]

    let data = await dbService.aggregate(userModel,queryArray)
    let totalCount = await dbService.countDocument(userModel,matchCriteria)
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PAYMENT_LIST_FETCHED_SUCCESSFULLY), { data,totalCount })

 }

paymentController.deletePayment= async(payload)=>{
    let criteria= {_id: payload._id}
    let dataToUpdate = {isDeleted:true}
    let data = await dbService.findOneAndUpdate(paymentModel,criteria,dataToUpdate)
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PAYMENT_DELETE_SUCCESSFULLY), { data })
}

module.exports= paymentController;