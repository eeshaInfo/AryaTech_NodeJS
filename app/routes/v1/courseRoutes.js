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
                full_name : Joi.string().required().description('course full name'),
                duration: Joi.number().required().description('course duration'),
                modules:Joi.array().items(
                  Joi.object({
                    name: Joi.string().required().description('module Name'),
                    details: Joi.string().default(" ").description('Details of course eg: All Topics')
                  })  
                )
            },
            group: 'Course',
            description: 'Route to create Course for Admin',
            model: 'createCourse'
        },
        auth: AVAILABLE_AUTHS.SUPER_ADMIN,
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
                name: Joi.string().required().description('Course Name'),
                full_name : Joi.string().required().description('course full name'),
                duration: Joi.number().required().description('course duration'),
                modules:Joi.array().items(
                  Joi.object({
                    name: Joi.string().required().description('module Name'),
                    details: Joi.string().default(" ").description('Details of course eg: All Topics')
                  })  
                )
            },
            group: 'Course',
            description: 'Route to update Course for Admin',
            model: 'updateCourse'
        },
        auth: AVAILABLE_AUTHS.SUPER_ADMIN,
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
        auth: AVAILABLE_AUTHS.SUPER_ADMIN,
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
        auth: AVAILABLE_AUTHS.SUPER_ADMIN,
        handler: courseController.getCourseList
    },
    {
        method: 'GET',
        path: '/v1/course/dropdown',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            group: 'Course',
            description: 'Route to get list of course for Admin dropdown in student creation',
            model: 'courseListForDropdown'
        },
        auth: AVAILABLE_AUTHS.SUPER_ADMIN,
        handler: courseController.forDropdown
    },
]

module.exports = courseRoutes