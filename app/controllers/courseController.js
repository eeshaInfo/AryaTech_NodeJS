const {courseService} = require('../services')
const CONFIG = require('../../config');
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION } = require('../utils/constants');

let courseController = {}

courseController.createCourse = async(payload)=>{
   let data = await courseService.createCourse(payload)
   return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.createSuccessResponse), { data })
}

courseController.updateCourse = async(payload)=>{
    //--code here
}

courseController.getCourseList = async(payload)=>{
    let data = await courseService.getCourseList({isDeleted:false})
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DATA_FETCHED_SUCCESSFULLY), { data })
}

courseController.getCourseById = async(payload)=>{
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DATA_FETCHED_SUCCESSFULLY), { data })
}


module.exports = courseController;