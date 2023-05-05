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
    if(payload.userId){
       let queryArray=[
         { $match:{_id:payload.userId}},
         { $lookup:{
            from:'course',
            localField:'courseId',
            foreignField: '_id',
            as:'courseData'
        }},
        { $unwind:{path:"$courseData", preserveNullAndEmptyArrays: true }},
        { $lookup:{
            from:'payments',
            localField:'_id',
            foreignField: 'userId',
            as:'paymentsData'
        }},
        { $unwind:{path:"$paymentsData", preserveNullAndEmptyArrays: true }},
        { $lookup:{
            from:'payments',
            localField:'_id',
            foreignField: 'userId',
            as:'transactions'
        }},
        {$project:{
            "regNo":1,
            "regDate":1,
            "imagePath":1,
            "fathersName" :1,
            "createdAt":1,
            "name": 1,
            "course":"$courseData.name",
            "duration" :"$courseData.duration",
            "mobileNumber":1,
            "totalFees" :1,
            paymentsData:1,
            "transactions":1,
        }},
        {$group:{
            _id : "$_id",
            amountPaid : { $sum : "$paymentsData.amount"},
            name: {$first : "$name" },
            regDate: {$first : "$regDate" },
            regNo: {$first : "$regNo" },
            imagePath: {$first : "$imagePath" },
            fathersName: {$first : "$fathersName" },
            totalFees: {$first : "$totalFees"},
            course: {$first : "$course" },
            duration: {$first : "$duration" },
            mobileNumber: {$first : "$mobileNumber" },
            transactions: {$first : "$transactions" },
            
        }},
        {$addFields:{"totalDues":{$subtract:["$totalFees","$amountPaid"]}}},
    ]

    let data = await dbService.aggregate(userModel,queryArray)
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PAYMENT_LIST_FETCHED_SUCCESSFULLY), {data:data[0]})
    }else{
        let regex = new RegExp(payload.searchKey, 'i');
    let criteria = {
        $and: [{ $or: [{ "name": regex } ,{ "regNo": regex }] },{isDeleted: {$ne:true} ,userType: USER_TYPES.STUDENT}]
    }
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
            "regNo":1,
            "name": 1,
            "mobileNumber":1,
            "totalFees" :1,
            "amount" : "$paymentsData.amount",
            "course":"$courseData.name",
        }},
        {$group:{
            _id : "$_id",
            amountPaid : {$sum : "$amount"},
            name: {$first : "$name" },
            regNo: {$first:"$regNo"},
            totalFees: {$first : "$totalFees"},
            courseName: {$first : "$course" },
            mobileNumber: {$first : "$mobileNumber" },
        }},
        {$addFields:{"totalDues":{$subtract:["$totalFees","$amountPaid"]}}},
        { $sort:sort},
        { $skip:payload.skip },
        { $limit: payload.limit },
    ]

    let userList = await dbService.aggregate(userModel,queryArray)
    let totalCount = await dbService.countDocument(userModel,matchCriteria)
    let data = {
        list: userList,
        userCount: totalCount
      }
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PAYMENT_LIST_FETCHED_SUCCESSFULLY), { data })
    }
    

 }

paymentController.deletePayment= async(payload)=>{
    let criteria= {_id: payload._id}
    let dataToUpdate = {isDeleted:true}
    let data = await dbService.findOneAndUpdate(paymentModel,criteria,dataToUpdate)
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PAYMENT_DELETE_SUCCESSFULLY), { data })
}

module.exports= paymentController;