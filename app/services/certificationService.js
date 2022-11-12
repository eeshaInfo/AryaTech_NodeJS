const CONFIG = require('../../config');
const { certificationModel } = require(`../models`);
let certificationService={};

certificationService.create= async(dataToInsert)=>{
    return await new certificationModel(dataToInsert).save()    
}

certificationService.update = async(criteria,dataToUpdate)=>{
    return await certificationModel.findOneAndUpdate(criteria,dataToUpdate,{new:true,upsert:true})
}

certificationService.getList = async(criteria)=>{
    return await certificationModel.find(criteria)
}

certificationService.getCertificate = async(criteria)=>{
    return await certificationModel.findOne(criteria).lean()
}

certificationService.delete = async(criteria)=>{
    return await certificationModel.deleteOne(criteria)
}

certificationService.getLatestRecord = async(criteria) =>{
    return await certificationModel.findOne(criteria).sort({'createdAt':-1})
}
module.exports =certificationService