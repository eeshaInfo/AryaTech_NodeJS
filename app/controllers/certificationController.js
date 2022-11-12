const {certificationService} = require('../services')
const CONFIG = require('../../config');
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES,CERTIFICATE_TYPES,NORMAL_PROJECTION, CERTIFICATE_STATUS } = require('../utils/constants');

let certificationController = {}

/**
 * Function for issue new certificate
 * @param {*} payload 
 */
 certificationController.requestForCertificate = async(payload) => {
    let lastSerialNumber=await certificationService.getCertificate({centre})
    let data = await certificationService.create(payload)
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.createSuccessResponse), { data })

 }
/**
 * function to update certificate
 * @param {*} payload 
 */
 certificationController.update = async(payload)=>{

 }
 /**
  * function to delete certificate
  * @param {*} payload 
  */
 certificationController.delete = async(payload)=>{

 }
 /**
  * function to change status of certificate i.e pending to approve
  * @param {*} payload 
  */
 certificationController.updateStatus = async(payload)=>{

 }

 certificationController.getCertificate = async(payload)=>{
    
 }


 certificationController.updateStatus = async(payload)=>{
    let criteria ={_id:payload._id}
    let dataToUpdate={}
    if(payload.status==CERTIFICATE_STATUS.ISSUED){
        dataToUpdate= { $inc: { serialNumber:1 }, status:CERTIFICATE_STATUS.ISSUED }
        
    }
    dataToUpdate = {status:payload.status}
    let data = await certificationService.update(criteria,dataToUpdate)
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.createSuccessResponse), { data })
 }


module.exports = certificationController;