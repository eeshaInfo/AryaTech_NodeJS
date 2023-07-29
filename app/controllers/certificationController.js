const {dbService} = require('../services')
const {certificationModel, userModel} = require('../models/index')
const CONFIG = require('../../config');
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, CERTIFICATE_TYPES, NORMAL_PROJECTION, CERTIFICATE_STATUS, STATUS } = require('../utils/constants');

let certificationController = {}

/**
 * Function for issue new certificate
 * @param {*} payload 
 */
certificationController.requestForCertificate = async (payload) => {
    let user = await dbService.findOne(userModel,{_id: payload.userId})
    if(user.status!==STATUS.APPROVED){
        throw HELPERS.responseHelper.createErrorResponse(MESSAGES.STUDENT_NOT_APPROVED, ERROR_TYPES.BAD_REQUEST);
    }
    let data = await dbService.create(certificationModel,payload)
    if(data){
        await dbService.findOneAndUpdate(userModel,{_id:payload.userId},{certificateIssued :true, status: STATUS.CERTIFIED})
    }
  return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.createSuccessResponse), { data })

}
/**
 * function to update certificate
 * @param {*} payload 
 */
certificationController.update = async (payload) => {

}
/**
 * function to delete certificate
 * @param {*} payload 
 */
certificationController.delete = async (payload) => {

}
/**
 * function to change status of certificate i.e pending to approve
 * @param {*} payload 
 */
certificationController.updateStatus = async (payload) => {

}

certificationController.getCertificate = async (payload) => {
    let queryArray=[
        {$match:{_id:payload._id}},
        {$lookup:{
            from:'users',
            localField:'userId',
            foreignField:'_id',
            as:'userData'
        }},
        {$unwind:{path:'$userData',preserveNullAndEmptyArrays:true}},

        {$lookup:{
            from:'franchise',
            localField:'centerId',
            foreignField:'_id',
            as:'centerDetails'
        }},
        {$unwind:{path:'$centerDetails',preserveNullAndEmptyArrays:true}},

        {$lookup:{
            from:'course',
            localField:'courseId',
            foreignField:'_id',
            as:'courseData'
        }},
        {$unwind:{path:'$courseData',preserveNullAndEmptyArrays:true}},
        {$project:{
                "regNo":"$userData.regNo",
                "name":"$userData.name",
                "fathersName":"$userData.fathersName",
                "mothersName":"$userData.mothersName",
                "dob":"$userData.dob",
                "gender":"$userData.gender",
                "profileImage":"$userData.profileImage",
                "marks":1,
                "serialNumber":1,
                "status": 1,
                "type" :1,
                "centerCode":"$centerDetails.regNo",
                "centerName":"$centerDetails.centerName",
                "centerAddress":"$centerDetails.centerAddress",
                "courseData":1

        }}
    ]
    let data = await dbService.aggregate(certificationModel,payload)
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.createSuccessResponse), { data:data[0] }) 
}


certificationController.getList = async(payload) =>{
   let criteria = {}
   let regex = new RegExp(payload.searchKey, 'i');
    if(payload.centerId){
        criteria = {centerId: payload.centerId, isDeleted : {$ne : true}}
    }else{
        criteria = {isDeleted : {$ne : true }}
    }
    let matchCriteria = {
        $and: [{ $or: [{ name: regex }] },criteria ]}
      let sort = {};
          sort[payload.sortKey] = payload.sortDirection;
    let queryArray=[
        {$lookup:{
            from:'users',
            localField:'userId',
            foreignField:'_id',
            as:'userData'
        }},
        {$unwind:{path:'$userData',preserveNullAndEmptyArrays:true}},

        {$lookup:{
            from:'franchise',
            localField:'centerId',
            foreignField:'_id',
            as:'centerDetails'
        }},
        {$unwind:{path:'$centerDetails',preserveNullAndEmptyArrays:true}},

        {$lookup:{
            from:'course',
            localField:'courseId',
            foreignField:'_id',
            as:'courseData'
        }},
        {$unwind:{path:'$courseData',preserveNullAndEmptyArrays:true}},
        {$project:{
                "regNo":"$userData.regNo",
                userId:"$userData._id",
                "name":"$userData.name",
                "fathersName":"$userData.fathersName",
                "mothersName":"$userData.mothersName",
                "mobileNumber" : "$userData.mobileNumber",
                "regDate" : "$userData.regDate",
                "dob":"$userData.dob",
                "gender":"$userData.gender",
                "profileImage":"$userData.profileImage",
                "marks":1,
                "serialNo":1,
                "status": 1,
                "type" : 1,
                "centerCode":"$centerDetails.centerCode",
                "centerName":"$centerDetails.name",
                "centerAddress":"$centerDetails.address",
                "courseName":"$courseData.name"

        }},
        {$group:{
            _id:"$userId",
            regNo: {$first: "$regNo"},
            name: {$first: "$name"},
            fathersName: {$first: "$fathersName"},
            mothersName: {$first: "$mothersName"},
            mobileNumber: {$first: "$mobileNumber"},
            regDate: {$first: "$regDate"},
            dob: {$first: "$dob"},
            gender: {$first: "$gender"},
            profileImage: {$first: "$profileImage"},
            marks: {$first: "$marks"},
            serialNo: {$first: "$serialNo"},
            centerCode: {$first: "$centerCode"},
            centerName: {$first: "$centerName"},
            centerAddress: {$first: "$centerAddress"},
            courseName: {$first: "$courseName"},
        }},
        { $match:matchCriteria },
        { $sort:sort },
        { $skip : payload.skip },
        { $limit : payload.limit }

        
    ]
let data = await dbService.aggregate(certificationModel,queryArray)
let totalCount = await dbService.countDocument(certificationModel,criteria)
return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.STUDENTS_CERTIFICATE_FETCHED_SUCCESSFULLY), {list: data, count:totalCount })
}


certificationController.updateStatus = async (payload) => {
    let criteria = { _id: payload._id }
    let dataToUpdate = {}
    if (payload.status == CERTIFICATE_STATUS.ISSUED) {
        let latestRecord = await certificationService.getLatestRecord({ status: CERTIFICATE_STATUS.ISSUED })
        let newSerialNumber = latestRecord ? latestRecord.serialNumber + 1 : '0001';
        dataToUpdate = { status: CERTIFICATE_STATUS.ISSUED, serialNumber: newSerialNumber }
    }
    else {
        dataToUpdate = { status: payload.status }
    }
    let data = await dbService.aggregate(certificationModel, dataToUpdate)
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.createSuccessResponse), { data })
}

certificationController.verifyCertificate = async (payload) =>{
    let criteria = {regNo : payload.regNo}
    let studentData = await dbService.findOne(userModel,criteria)
    if(studentData){
        let queryArray=[
            {$match:{ userId : studentData._id}},
            {$lookup:{
                from:'users',
                localField:'userId',
                foreignField:'_id',
                as:'userData'
            }},
            {$unwind:{path:'$userData',preserveNullAndEmptyArrays:true}},
            {$lookup:{
                from:'franchise',
                localField:'franchiseId',
                foreignField:'_id',
                as:'centerDetails'
            }},
            {$unwind:{path:'$centerDetails',preserveNullAndEmptyArrays:true}},
            {$lookup:{
                from:'course',
                localField:'courseId',
                foreignField:'_id',
                as:'courseData'
            }},
            {$unwind:{path:'$courseData',preserveNullAndEmptyArrays:true}},
            {$project:{
                    "regNo":"$userData.regNo",
                    "userId": "$userData._id",
                    "name":"$userData.name",
                    "fathersName":"$userData.fathersName",
                    "mothersName":"$userData.mothersName",
                    "dob":"$userData.dob",
                    "gender":"$userData.gender",
                    "profileImage":"$userData.profileImage",
                    "marks":1,
                    "serialNumber":1,
                    "status": 1,
                    "type" :1,
                    "centerCode":"$centerDetails.centerCode",
                    "centerName":"$centerDetails.centerName",
                    "centerAddress":"$centerDetails.centerAddress",
                    "courseData":1
    
            }}
        ]
        let data = await dbService.aggregate(certificationModel,queryArray)
        return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.createSuccessResponse), { data:data[0] }) 
    }else{
        throw HELPERS.responseHelper.createErrorResponse(MESSAGES.INALID_REGISTRATION_NO, ERROR_TYPES.BAD_REQUEST);
    }
}

certificationController.getAllCertificateByUserId = async(payload) =>{
    let criteria = {userId: payload.userId}
    let queryArray=[
        {$match : criteria},
        {$lookup:{
            from:'users',
            localField:'userId',
            foreignField:'_id',
            as:'userData'
        }},
        {$unwind:{path:'$userData',preserveNullAndEmptyArrays:true}},

        {$lookup:{
            from:'franchise',
            localField:'centerId',
            foreignField:'_id',
            as:'centerDetails'
        }},
        {$unwind:{path:'$centerDetails',preserveNullAndEmptyArrays:true}},

        {$lookup:{
            from:'course',
            localField:'courseId',
            foreignField:'_id',
            as:'courseData'
        }},
        {$unwind:{path:'$courseData',preserveNullAndEmptyArrays:true}},
        {$project:{
                "regNo":"$userData.regNo",
                "userId":"$userData._id",
                "name":"$userData.name",
                "fathersName":"$userData.fathersName",
                "mothersName":"$userData.mothersName",
                "mobileNumber" : "$userData.mobileNumber",
                "regDate" : "$userData.regDate",
                "dob":"$userData.dob",
                "gender":"$userData.gender",
                "profileImage":"$userData.profileImage",
                "marks":1,
                "serialNo":1,
                "certificateNo":1,
                "dateOfIssue" :1,
                "status": 1,
                "type" : 1,
                "centerCode":"$centerDetails.centerCode",
                "centerName":"$centerDetails.name",
                "centerAddress":"$centerDetails.address",
                "courseName":"$courseData.name",
                "courseDuration":"$courseData.duration"
        }}
        
    ]
    let data = await dbService.aggregate(certificationModel, queryArray)
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.SUCCESS), { data: data})
}


module.exports = certificationController;