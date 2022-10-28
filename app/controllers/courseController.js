const {courseService} = require('../services')
const CONFIG = require('../../config');
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION } = require('../utils/constants');

let courseController = {}
/**
 * Function to create new Course
 * @param {*} payload 
 * @returns 
 */
courseController.createCourse = async(payload)=>{
   let data = await courseService.createCourse(payload)
   return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.createSuccessResponse), { data })
}

/**
 * Function to Update Course Details
 * @param {*} payload 
 * @returns 
 */

courseController.updateCourse = async(payload)=>{
    let data = await courseService.updateCourse({_id:payload._id},payload)
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DATA_UPDATED_SUCCESSFULLY),{data})
}

/**
 * Function to get course List
 * @param {*} payload 
 * @returns 
 */
courseController.getCourseList = async(payload)=>{
    let data = await courseService.getCourseList({isDeleted:false})
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DATA_FETCHED_SUCCESSFULLY), { data })
}

/**
 * function to get Course Detail by id
 * @param {*} payload 
 * @returns 
 */
courseController.getCourseById = async(payload)=>{
    let data = await courseService.getCourseById({_id:payload._id})
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DATA_FETCHED_SUCCESSFULLY), { data })
}



module.exports = courseController;