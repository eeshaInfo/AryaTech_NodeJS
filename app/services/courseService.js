const CONFIG = require('../../config');
const { courseModel } = require(`../models`);
let courseService={};

courseService.createCourse= async(dataToInsert)=>{
    return await new courseModel(dataToInsert).save()    
}

courseService.getCourseList = async(criteria)=>{
    return await courseModel.find(criteria)
}

courseService.getCourseDetails = async(criteria)=>{
    return await courseModel.findOne(criteria).lean()
}

courseService.deleteCourse = async(criteria)=>{
    return await courseModel.deleteOne(criteria)
}
module.exports =courseService