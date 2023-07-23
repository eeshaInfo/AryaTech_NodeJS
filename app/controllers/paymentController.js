const CONFIG = require('../../config');
const {dbService} = require('../services')
const {paymentModel, userModel} = require('../models')
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, USER_TYPES } = require('../utils/constants');
const CONSTANTS = require('../utils/constants');

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
            "profileImage":1,
            "fathersName" :1,
            "createdAt":1,
            "name": 1,
            "course":"$courseData.name",
            "duration" :"$courseData.duration",
            "mobileNumber":1,
            "totalFees" :1,
            paymentsData:1,
            "transactions":1,
            "franchiseId":1,
        }},
        {$group:{
            _id : "$_id",
            amountPaid : { $sum:{
                '$cond': [
                        { '$eq': ['$paymentsData.paymentType', 'Credit']},"$paymentsData.amount",0
                 ]
            }},
            feeAdded : { $sum:{
                '$cond': [
                        { '$eq': ['$paymentsData.paymentType', 'Debit']},"$paymentsData.amount",0
                 ]
            }},
            name: {$first : "$name" },
            regDate: {$first : "$regDate" },
            regNo: {$first : "$regNo" },
            profileImage: {$first : "$profileImage" },
            fathersName: {$first : "$fathersName" },
            totalFees: {$first : "$totalFees"},
            course: {$first : "$course" },
            duration: {$first : "$duration" },
            mobileNumber: {$first : "$mobileNumber" },
            transactions: {$first : "$transactions" },
            franchiseId: {$first : "$franchiseId" },
            createdAt : {$first : "$createdAt"}
            
        }},
        {$addFields:{"totalDues":{ $add:[ {$subtract:["$totalFees","$amountPaid"]},  "$feeAdded"] }}},

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
        { $lookup:{
            from:'franchise',
            localField:'franchiseId',
            foreignField: '_id',
            as:'franchiseData'
        }},
        { $unwind:{path:"$franchiseData", preserveNullAndEmptyArrays: true }},
        {$project:{
            "userId": "$paymentsData.userId",
            "centerName" : "$franchiseData.name",
            "createdAt":1,
            "regNo":1,
            "name": 1,
            "mobileNumber":1,
            "totalFees" :1,
            "amount" : "$paymentsData.amount",
            "paymentType" : "$paymentsData.paymentType",
            "course":"$courseData.name",
        }},
        {$group:{
            _id : "$_id",
            amountPaid : { $sum:{
                '$cond': [
                        { '$eq': ['$paymentType', 'Credit']},"$amount",0
                 ]
            }},
            name: {$first : "$name" },
            regNo: {$first:"$regNo"},
            feeAdded : { $sum:{
                '$cond': [
                        { '$eq': ['$paymentType', 'Debit']},"$amount",0
                 ]
            }},
            totalFees: {$first : "$totalFees"},
            courseName: {$first : "$course" },
            mobileNumber: {$first : "$mobileNumber" },
            centerName: {$first : "$centerName" },
            createdAt : {$first : "$createdAt"}
        }},
        {$addFields:{"totalDues":{ $add:[ {$subtract:["$totalFees","$amountPaid"]},  "$feeAdded"] }}},
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

paymentController.addStudentFee = async(payload) =>{
    await dbService.findOneAndUpdate(userModel,{_id:payload.userId},{ $inc: { totalFees: payload.amount }})
    let data = await dbService.create(paymentModel,payload)
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.SUCCESS), { data })
}

module.exports= paymentController;