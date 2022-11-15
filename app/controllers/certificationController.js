const { certificationService } = require('../services')
const CONFIG = require('../../config');
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, CERTIFICATE_TYPES, NORMAL_PROJECTION, CERTIFICATE_STATUS } = require('../utils/constants');

let certificationController = {}

/**
 * Function for issue new certificate
 * @param {*} payload 
 */
certificationController.requestForCertificate = async (payload) => {
    console.log(payload);
    let data = await certificationService.create(payload)
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
            from:'users',
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
                "imagePath":"$userData.imagePath",
                "marks":1,
                "serialNumber":1,
                "status": 1,
                "centerCode":"$centerDetails.regNo",
                "centerName":"$centerDetails.centerName",
                "centerAddress":"$centerDetails.centerAddress",
                "centerCode":"$centerDetails.regNo",
                "courseData":1

        }}
    ]
    let data = await certificationService.aggregate(queryArray)
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.createSuccessResponse), { data }) 
}


certificationController.updateStatus = async (payload) => {
    let criteria = { _id: payload._id }
    let dataToUpdate = {}
    if (payload.status == CERTIFICATE_STATUS.ISSUED) {
        let latestRecord = await certificationService.getLatestRecord({ status: CERTIFICATE_STATUS.ISSUED })
        let newSerialNumber = latestRecord ? latestRecord.serialNumber + 1 : 0001
        dataToUpdate = { status: CERTIFICATE_STATUS.ISSUED, serialNumber: newSerialNumber }
    }
    else {
        dataToUpdate = { status: payload.status }
    }
    let data = await certificationService.update(criteria, dataToUpdate)
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.createSuccessResponse), { data })
}


module.exports = certificationController;