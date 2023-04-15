const {dbService} = require('../services/index')
const {courseModel} = require('../models/index')
const HELPERS = require("../helpers");
const { MESSAGES} = require('../utils/constants');

let courseController = {}
/**
 * Function to create new Course
 * @param {*} payload 
 * @returns 
 */
courseController.createCourse = async(payload)=>{
    let data = await dbService.create(courseModel,payload)
   return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.createSuccessResponse), { data })
}

/**
 * Function to Update Course Details
 * @param {*} payload 
 * @returns 
 */

courseController.updateCourse = async(payload)=>{
    let data = await dbService.findOneAndUpdate(courseModel,{_id:payload._id},payload)
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DATA_UPDATED_SUCCESSFULLY),{data})
}

/**
 * Function to get course List
 * @param {*} payload 
 * @returns 
 */
courseController.getCourseList = async(payload)=>{
    let data = await dbService.find(courseModel,{isDeleted:false})
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DATA_FETCHED_SUCCESSFULLY), { data })
}

courseController.forDropdown = async(payload)=>{
    let data = await dbService.find(courseModel,{isDeleted:false},{name:1})
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DATA_FETCHED_SUCCESSFULLY), { data })
}

/**
 * function to get Course Detail by id
 * @param {*} payload 
 * @returns 
 */
courseController.getCourseById = async(payload)=>{
    let data = await dbService.findOne(courseModel,{_id:payload._id})
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DATA_FETCHED_SUCCESSFULLY), { data })
}



module.exports = courseController;