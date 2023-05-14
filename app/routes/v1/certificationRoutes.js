'use strict'
const { Joi } = require('../../utils/joiUtils');
const {AVAILABLE_AUTHS, CERTIFICATE_STATUS, CERTIFICATE_TYPES} = require('../../utils/constants');
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
                type : Joi.string().valid(...Object.values(CERTIFICATE_TYPES)).description('Certificate Type'),
                dateOfIssue: Joi.date().description('certificate date issue'),
                certificateNo: Joi.string().description('certificate number'),
                serialNo: Joi.number().description('certificate serial number'),
                marks:Joi.object(
                    {
                        pratical: Joi.number().description('practical Marks'),
                        written: Joi.number().description('written Marks'),
                        assignment: Joi.number().description('assignment Marks'),
                        viva: Joi.number().description('viva Marks'),
                        englishTyping : Joi.number().description('English typing speed if certificate type is typing'),
                        hindiTyping : Joi.number().description('Hindi typing speed if certificate type is typing')
                    }
                )
            },
            group: 'Certificate',
            description: 'Route to create certificate request for Admin',
            model: 'createCertificateRequest'
        },
        auth: AVAILABLE_AUTHS.ADMIN_AND_SUPER_ADMIN,
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
                type : Joi.string().valid(...Object.values(CERTIFICATE_TYPES)).description('Certificate Type'),
                courseId: Joi.string().objectId().description('course MongoId'),
                dateOfIssue: Joi.date().description('certificate date issue'),
                marks:Joi.object(
                    {
                        pratical: Joi.number().description('practical Marks'),
                        written: Joi.number().description('written Marks'),
                        assignment: Joi.number().description('assignment Marks'),
                        viva: Joi.number().description('viva Marks'),
                        englishTyping : Joi.number().description('English typing speed if certificate type is typing'),
                        hindiTyping : Joi.number().description('Hindi typing speed if certificate type is typing')
                    }
                )
            },
            group: 'Certificate',
            description: 'Route to update certificate for Admin',
            model: 'updateCertificateRequest'
        },
        auth: AVAILABLE_AUTHS.ADMIN_AND_SUPER_ADMIN,
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
        auth: AVAILABLE_AUTHS.SUPER_ADMIN,
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
        auth: AVAILABLE_AUTHS.ADMIN_AND_SUPER_ADMIN,
        handler: certificationController.getCertificate
    },

    {
        method: 'GET',
        path: '/v1/certificate/list',
        joiSchemaForSwagger: {
            // headers: {
            //     'authorization': Joi.string().required().description("User's JWT token.")
            // },
            query : {
                centerId: Joi.string().objectId().description('franchiseId mongo _id'),
                status: Joi.number().default(CERTIFICATE_STATUS.PENDING).valid(...Object.values(CERTIFICATE_STATUS)).description('status'),
                skip: Joi.number().default(0).description('skip'),
                limit: Joi.number().default(10).description('limit'),
                searchKey: Joi.string().allow(""),
                sortKey: Joi.string().default("createdAt").optional().description('sort key'),
                sortDirection: Joi.number().default(-1).optional().description('sort direction'),
            },
            group: 'Certificate',
            description: 'Route to get list of certificate for Admin',
            model: 'courseList'
        },
        // auth: AVAILABLE_AUTHS.ADMIN,
        handler: certificationController.getList
    },
    {
        method: 'GET',
        path: '/v1/certificate/userId',
        joiSchemaForSwagger: {
            query:{
                userId: Joi.string().objectId().required().description('UserId'),
            },
            group: 'Certificate',
            description: 'Route to get all certificate by userid',
            model: 'getAllCertificateByUserId'
        },
          auth: AVAILABLE_AUTHS.SUPER_ADMIN,
        handler: certificationController.getAllCertificateByUserId
    },
    {
        method: 'GET',
        path: '/v1/certificate/verify',
        joiSchemaForSwagger: {
            query:{
                regNo: Joi.string().required().description('Registration No'),
                certificateType : Joi.string().valid(...Object.values(CERTIFICATE_TYPES)).description('Certificate Type'),
            },
            group: 'Certificate',
            description: 'Route to verify certificate for student',
            model: 'getCertificateById'
        },
        handler: certificationController.verifyCertificate
    },
]

module.exports = certificationRoutes