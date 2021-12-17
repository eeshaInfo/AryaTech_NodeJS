'use strict';

const { Joi } = require('../../utils/joiUtils');
const { AVAILABLE_AUTHS, GENDER_TYPES, CHALLENGES_TYPES, DISTANCE_TYPE } = require('../../utils/constants');
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
                challengeType: Joi.number().required().valid(...Object.values(CHALLENGES_TYPES)).description('Challenge type i.e 1=> PAID, 2=> UNPAID.'),
                distanceType: Joi.number().required().valid(...Object.values(DISTANCE_TYPE)).description('Challenge distace  type.'),
                amount: Joi.alternatives().conditional('challengeType', { is: CONSTANTS.CHALLENGES_TYPES.PAID, then: Joi.number().min(1), otherwise: Joi.number().optional() }),
            },
            group: 'Challenge',
            description: 'Route to create a challenge.',
            model: 'CreateChallenge'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
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
                challengeName: Joi.string().description('Challenge name.'),
                challengeType: Joi.number().valid(...Object.values(CHALLENGES_TYPES)).description('Challenge type i.e 1=> PAID, 2=> UNPAID.'),
                distanceType: Joi.number().valid(...Object.values(DISTANCE_TYPE)).description('Challenge distance type. i.e Meter or KM'),
                amount: Joi.alternatives().conditional('challengeType', { is: CONSTANTS.CHALLENGES_TYPES.PAID, then: Joi.number().min(1), otherwise: Joi.number().optional() })
            },
            group: 'Challenge',
            description: 'Route to update a challenge.',
            model: 'UpdateChallenge'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
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
        auth: AVAILABLE_AUTHS.ADMIN,
        handler: challengeController.delete
    },
    {
        method: 'GET',
        path: '/v1/challenge/list',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query: {
                skip: Joi.number().default(0).description('skip'),
                limit: Joi.number().default(10).description('limit'),
            },
            group: 'Challenge',
            description: 'Route to get challenges',
            model: 'GetChallenges'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
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
    {
        method: 'GET',
        path: '/v1/challenge/getChallengeById',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query: {
                id: Joi.string().objectId().required().description('Challenge Id.'),
                skip: Joi.number().default(0).description('skip'),
                limit: Joi.number().default(10).description('limit'),
            },
            group: 'Challenge',
            description: 'Route to get Users data',
            model: 'GetDashboardData'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
        handler: challengeController.getChallengeById
    },
    {
        method: 'GET',
        path: '/v1/user/getChallengeForUser',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query: {
                skip: Joi.number().default(0).description('skip'),
                limit: Joi.number().default(10).description('limit'),
            },
            group: 'User',
            description: 'Route to get Challenges for user',
            model: 'GetChallengesForUser'
        },
        auth: AVAILABLE_AUTHS.USER,
        handler: challengeController.getUserChallenge
    },
    {
        method: 'POST',
        path: '/v1/user/completedChallenge',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query: {
                id: Joi.string().objectId().required().description('Challenge Id.'),
            },
            body: {
                timeTaken: Joi.string().required().description('Time taken by the user'),
                caloriesBurned: Joi.string().required().description('Calories Burned'),
                avgSpeed: Joi.string().required().description(`Average Speed`),
                maxSpeed: Joi.string().required().description('Maximum Speed'),
            },
            group: 'Challenge',
            description: 'Route to Completed Challenge',
            model: 'completedChallenge'
        },
        handler: challengeController.completedChallenge,
        auth: AVAILABLE_AUTHS.USER,
    },

    {
		method: 'GET',
		path: '/v1/user/getUserByChallenges',
		joiSchemaForSwagger: {
			headers: {
				'authorization': Joi.string().required().description("User's JWT token.")
			},
            query: {
                skip:Joi.number().default(0).description('skip'),
                limit: Joi.number().default(10).description('limit'),
                id: Joi.string().objectId().required().description('Challenge Id.'),
            },
			group: 'User',
			description: 'Route to get users by challenges',
			model: 'GetUserByChallenges'
		},
		auth: AVAILABLE_AUTHS.ADMIN,
		handler:  challengeController.getUserByChallenges
	},
];

module.exports = routes;




