'use strict'
const { Joi } = require('../../utils/joiUtils');
const {AVAILABLE_AUTHS} = require('../../utils/constants');
const {courseController} = require('../../controllers')

let courseRoutes=[

    {
        method: 'POST',
        path: '/v1/course',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body:{
                name: Joi.string().required().description('Course Name'),
                duration: Joi.number().required().description('course duration'),
                price: Joi.number().required().description('course price'),
            },
            group: 'Course',
            description: 'Route to create Course for Admin',
            model: 'createCourse'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
        handler: courseController.createCourse
    },

    {
        method: 'PUT',
        path: '/v1/course',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body:{
                _id: Joi.string().objectId().description('course MongoId'),
                name: Joi.string().required().description('Course Name'),
                duration: Joi.number().required().description('course duration'),
                price: Joi.number().required().description('course price'),
            },
            group: 'Course',
            description: 'Route to update Course for Admin',
            model: 'updateCourse'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
        handler: courseController.updateCourse
    },

    {
        method: 'GET',
        path: '/v1/course',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query:{
                _id: Joi.string().objectId().description('Course Mongo Id')
            },
            group: 'Course',
            description: 'Route to get Course by Id for Admin',
            model: 'getCourseById'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
        handler: courseController.getCourseById
    },

    {
        method: 'GET',
        path: '/v1/course/list',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            group: 'Course',
            description: 'Route to get list of course for Admin',
            model: 'courseList'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
        handler: courseController.getCourseList
    },
]

module.exports = courseRoutes