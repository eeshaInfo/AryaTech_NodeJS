const {paymentModel} = require('../models')
let paymentService={}

paymentService.createPayment= async(dataToInsert)=>{
    return await new paymentModel(dataToInsert).save()    
}

paymentService.getPaymentList = async(queryArray)=>{
    return await paymentModel.aggregate(queryArray)
}

paymentService.getPaymentDetails = async(criteria)=>{
    return await paymentModel.findOne(criteria).lean()
}

paymentService.update = async(criteria,dataToUpdate)=>{
    return await paymentModel.findOneAndUpdate(criteria,dataToUpdate,{new: true, upsert:false})
}

paymentService.countDocuments = async(criteria) =>{
    return await paymentModel.countDocuments(criteria)
}


module.exports= paymentService;