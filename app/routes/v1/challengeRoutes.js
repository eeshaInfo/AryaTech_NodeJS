'use strict';

const { Joi } = require('../../utils/joiUtils');
const { AVAILABLE_AUTHS, GENDER_TYPES } = require('../../utils/constants');
//load controllers
const { challengeController } = require('../../controllers');
const CONSTANTS = require('../../utils/constants');

let routes = [
    {
        method: 'POST',
        path: '/v1/challenge/create',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body: {
                challengeName: Joi.string().required().description('Challenge name.'),
                challengeType: Joi.number().required().description('Challenge type i.e 1=> PAID, 2=> UNPAID.'),
                //location: Joi.string().required().description('User\'s location.'),
                distanceType: Joi.number().required().description('Challenge distace  type.'),
                //amount: Joi.alternatives().when(CONSTANTS.CHALLENGES_TYPES.PAID == 'challengeType',{is:true,then: Joi.number().min(1),otherwise: Joi.number().optional()}),
                amount: Joi.alternatives().conditional('challengeType',{is: CONSTANTS.CHALLENGES_TYPES.PAID, then: Joi.number().min(1),otherwise: Joi.number().optional()}),
                
            },
            group: 'Challenge',
            description: 'Route to create a challenge.',
            model: 'CreateChallenge'
        },
        auth: AVAILABLE_AUTHS.USER,
        handler: challengeController.create
    },
    {
        method: 'PUT',
        path: '/v1/challenge/edit',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query: {
                id: Joi.string().objectId().required().description('Challenge Id.'),
            },
            body: {
                challengeName: Joi.string().required().description('Challenge name.'),
                challengeType: Joi.number().required().description('Challenge type i.e 1=> PAID, 2=> UNPAID.'),
                distanceType: Joi.string().required().description('Challenge distance type. i.e Meter or KM'),
                amount: Joi.alternatives().conditional('challengeType',{is: CONSTANTS.CHALLENGES_TYPES.PAID, then: Joi.number().min(1),otherwise: Joi.number().optional()}),
            },
            group: 'Challenge',
            description: 'Route to update a challenge.',
            model: 'UpdateChallenge'
        },
        auth: AVAILABLE_AUTHS.USER,
        handler: challengeController.updateChallenge
    },
    {
        method: 'DELETE',
        path: '/v1/challenge/delete',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query: {
                id: Joi.string().objectId().required().description('Challenge Id.'),
            },
            group: 'Challenge',
            description: 'Route to delete a challenge.',
            model: 'DeleteChallenge'
        },
        auth: AVAILABLE_AUTHS.USER,
        handler: challengeController.delete
    },
    {
		method: 'GET',
		path: '/v1/challenge/list',
		joiSchemaForSwagger: {
			headers: {
				'authorization': Joi.string().required().description("User's JWT token.")
			},
			group: 'Challenge',
			description: 'Route to get challenges',
			model: 'GetChallenges'
		},
		auth: AVAILABLE_AUTHS.USER,
		handler: challengeController.list
	},
    {
		method: 'GET',
		path: '/v1/challenge/dashBoardData',
		joiSchemaForSwagger: {
			headers: {
				'authorization': Joi.string().required().description("User's JWT token.")
			},
			group: 'Challenge',
			description: 'Route to get dashboard data',
			model: 'GetDashboardData'
		},
		auth: AVAILABLE_AUTHS.ADMIN,
		handler: challengeController.dashBoardData
	},
];

module.exports = routes;




