'use strict'
const { Joi } = require('../../utils/joiUtils');
const {AVAILABLE_AUTHS, CERTIFICATE_STATUS} = require('../../utils/constants');
const {certificationController} = require('../../controllers');
const { object } = require('joi');

let certificationRoutes=[

    {
        method: 'POST',
        path: '/v1/certificate',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body:{
                centerId:Joi.string().objectId().description('centerId'),
                userId: Joi.string().objectId().description('userId'),
                courseId: Joi.string().objectId().description('course MongoId'),
                marksDetails:Joi.object(
                    {
                        pratical: Joi.number().description('practical Marks'),
                        written: Joi.number().description('written Marks'),
                        assignment: Joi.number().description('assignment Marks'),
                        viva: Joi.number().description('viva Marks')
                    }
                )
            },
            group: 'Certificate',
            description: 'Route to create certificate request for Admin',
            model: 'createCertificateRequest'
        },
        auth: AVAILABLE_AUTHS.SUPER_ADMIN,
        handler: certificationController.requestForCertificate
    },

    {
        method: 'PUT',
        path: '/v1/certificate',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body:{
                _id:Joi.string().objectId().description('certificate Request mongo _id'),
                centerId:Joi.string().objectId().description('centerId'),
                userId: Joi.string().objectId().description('userId'),
                courseId: Joi.string().objectId().description('course MongoId'),
                marksDetails:Joi.object(
                    {
                        pratical: Joi.number().description('practical Marks'),
                        written: Joi.number().description('written Marks'),
                        assignment: Joi.number().description('assignment Marks'),
                        viva: Joi.number().description('viva Marks')
                    }
                )
            },
            group: 'Certificate',
            description: 'Route to update certificate for Admin',
            model: 'updateCertificateRequest'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
        handler: certificationController.update
    },

    {
        method: 'PUT',
        path: '/v1/certificate/status',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body:{
                _id:Joi.string().objectId().description('certificate Request mongo _id'),
                status:Joi.number().required().valid(...Object.values(CERTIFICATE_STATUS)).description('certificate status 1=>Pending, 2=>Reject, 3=>Issued ')
            },
            group: 'Certificate',
            description: 'Route to update certificate status for Admin',
            model: 'update certificate status'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
        handler: certificationController.updateStatus
    },

    {
        method: 'GET',
        path: '/v1/certificate',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query:{
                _id: Joi.string().objectId().description('certificate Mongo Id')
            },
            group: 'Certificate',
            description: 'Route to get certificate by Id for Admin',
            model: 'getCertificateById'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
        handler: certificationController.getCertificate
    },

    // {
    //     method: 'GET',
    //     path: '/v1/certificate/list',
    //     joiSchemaForSwagger: {
    //         headers: {
    //             'authorization': Joi.string().required().description("User's JWT token.")
    //         },
    //         group: 'Certificate',
    //         description: 'Route to get list of certificate for Admin',
    //         model: 'courseList'
    //     },
    //     auth: AVAILABLE_AUTHS.ADMIN,
    //     handler: certificationController.getList
    // },
]

module.exports = certificationRoutes