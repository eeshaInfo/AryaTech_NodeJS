'use strict';

const { Joi } = require('../../utils/joiUtils');
const { AVAILABLE_AUTHS, GENDER_TYPES, CHALLENGES_TYPES, DISTANCE_TYPE, LEADERBOARD_CATEGORY } = require('../../utils/constants');
//load controllers
const { challengeController } = require('../../controllers');
const CONSTANTS = require('../../utils/constants');

let routes = [
    {
        method: 'POST',
        path: '/v1/challenge',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body: {
                distance: Joi.number().required().description('Distance.'),
                type: Joi.number().required().valid(...Object.values(CHALLENGES_TYPES)).description('Challenge type i.e 1=> PAID, 2=> UNPAID.'),
                distanceType: Joi.number().required().valid(...Object.values(DISTANCE_TYPE)).description('Challenge distace  type.'),
                amount: Joi.alternatives().conditional('type', { is: CONSTANTS.CHALLENGES_TYPES.PAID, then: Joi.number().min(1), otherwise: Joi.number().optional() }),
            },
            group: 'Challenge',
            description: 'Route to create a challenge for admin',
            model: 'CreateChallenge'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
        handler: challengeController.createChallenge
    },
    {
        method: 'PUT',
        path: '/v1/challenge',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body: {
                challengeId: Joi.string().objectId().required().description('Challenge Id.'),
                distance: Joi.number().description('Distance.'),
                type: Joi.number().valid(...Object.values(CHALLENGES_TYPES)).description('Challenge type i.e 1=> PAID, 2=> UNPAID.'),
                distanceType: Joi.number().valid(...Object.values(DISTANCE_TYPE)).description('Challenge distance type. i.e Meter or KM'),
                amount: Joi.alternatives().conditional('type', { is: CONSTANTS.CHALLENGES_TYPES.PAID, then: Joi.number().min(1), otherwise: Joi.number().optional() })
            },
            group: 'Challenge',
            description: 'Route to update a challenge for admin',
            model: 'UpdateChallenge'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
        handler: challengeController.updateChallenge
    },
    {
        method: 'DELETE',
        path: '/v1/challenge',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query: {
                challengeId: Joi.string().objectId().required().description('Challenge Id.'),
            },
            group: 'Challenge',
            description: 'Route to delete a challenge for admin',
            model: 'DeleteChallenge'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
        handler: challengeController.deleteChallenge
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
                searchKey: Joi.string().allow(""),
                isRecentKey: Joi.boolean().default(false),
                sortKey: Joi.string().default("createdAt").optional().description('sort key'),
                sortDirection: Joi.number().default(-1).optional().description('sort direction'),
            },
            group: 'Challenge',
            description: 'Route to get challenges for admin/user',
            model: 'GetChallenges'
        },
        auth: AVAILABLE_AUTHS.COMMON,
        handler: challengeController.list
    },
    {
        method: 'GET',
        path: '/v1/user/challenge/list',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query: {
                skip: Joi.number().default(0).description('skip'),
                limit: Joi.number().default(10).description('limit'),
                searchKey: Joi.string().allow(""),
                sortKey: Joi.string().default("createdAt").optional().description('sort key'),
                sortDirection: Joi.number().default(-1).optional().description('sort direction'),
            },
            group: 'Challenge',
            description: 'Route to get challenges list for user',
            model: 'GetChallenges'
        },
        auth: AVAILABLE_AUTHS.USER,
        handler: challengeController.challengeListForUser
    },
    {
        method: 'GET',
        path: '/v1/challenge/dashboardData',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            group: 'Challenge',
            description: 'Route to get dashboard data for admin',
            model: 'GetDashboardData'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
        handler: challengeController.dashBoardData
    },
    {
        method: 'GET',
        path: '/v1/challenge',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query: {
                challengeId: Joi.string().objectId().required().description('Challenge Id.'),
                userId: Joi.string().objectId().optional().description('User Id.'),
            },
            group: 'Challenge',
            description: 'Route to get Challenge by id for user/admin',
            model: 'GetChallengeById'
        },
        auth: AVAILABLE_AUTHS.COMMON,
        handler: challengeController.getChallengeById
    },

    {
        method: 'GET',
        path: '/v1/guest/challenge',
        joiSchemaForSwagger: {
            query: {
                challengeId: Joi.string().objectId().required().description('Challenge Id.')
            },
            group: 'Challenge',
            description: 'Route to get Challenge by id for guest',
            model: 'GetChallengeByIdforGuest'
        },
        handler: challengeController.getChallengeById
    },
    {
        method: 'POST',
        path: '/v1/challenge/complete',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query: {
                challengeId: Joi.string().objectId().required().description('Challenge Id.'),
            },
            body: {
                timeTaken: Joi.number().required().description('Time taken by the  in seconds'),
                caloriesBurned: Joi.number().required().description('Calories Burned in calories'),
                avgSpeed: Joi.number().required().description(`Average Speed in km/h`),
                maxSpeed: Joi.number().required().description('Maximum Speed in km/h'),
                trackingPoints: Joi.array().items(
                    Joi.object({ lat: Joi.number().description('latitude'), lng: Joi.number().description('longitude.') })).required().description('Tracking Point'),

            },
            group: 'Challenge',
            description: 'Route to Completed Challenge for user',
            model: 'CompletedChallenge'
        },
        handler: challengeController.completedChallenge,
        auth: AVAILABLE_AUTHS.USER,
    },

    {
        method: 'GET',
        path: '/v1/challenge/users',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query: {
                skip: Joi.number().default(0).description('skip'),
                limit: Joi.number().default(10).description('limit'),
                challengeId: Joi.string().objectId().required().description('Challenge Id.'),
                searchKey: Joi.string().allow(""),
                sortKey: Joi.string().optional().description('sort key'),
                sortDirection: Joi.number().default(-1).optional().description('sort direction'),
            },
            group: 'Challenge',
            description: 'Route to get users by challenge for admin',
            model: 'GetUserByChallenges'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
        handler: challengeController.getUserByChallenges
    },
    {
        method: 'GET',
        path: '/v1/user/challenges',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query: {
                skip: Joi.number().default(0).description('skip'),
                limit: Joi.number().default(10).description('limit'),
                userId: Joi.string().objectId().required().description('User Id.'),
                searchKey: Joi.string().allow(""),
                sortKey: Joi.string().optional().description('sort key'),
                sortDirection: Joi.number().default(-1).optional().description('sort direction'),
            },
            group: 'Challenge',
            description: 'Route to get challenge by user for admin',
            model: 'GetChallengeByUser'
        },
        auth: AVAILABLE_AUTHS.ADMIN,
        handler: challengeController.getChallengesByUser
    },
    {
        method: 'GET',
        path: '/v1/guest/challenge/list',
        joiSchemaForSwagger: {
            group: 'Challenge',
            description: 'Route to get challenge list for GUEST',
            model: 'GetChallengeListForGuest'
        },
        handler: challengeController.list
    },


    {
        method: 'POST',
        path: '/v1/challenge/history',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            body: {
                completingDate:Joi.date().optional().description(`Date for challenge History`),
                userId: Joi.string().objectId().optional().description('User Id.'),
            },
            group: 'Challenge',
            description: 'Route to get challenge history',
            model: 'ChallengeHistory'
        },
        handler: challengeController.history,
        auth: AVAILABLE_AUTHS.USER,

    },
    {
        method: 'GET',
        path: '/v1/leaderboard/list',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required().description("User's JWT token.")
            },
            query: {
                skip: Joi.number().default(0).description('skip'),
                limit: Joi.number().default(10).description('limit'),
                searchKey: Joi.string().allow(""),
                leaderboardCategory: Joi.number().valid(...Object.values(LEADERBOARD_CATEGORY)).description('leaderboard category type'),
                challengeId: Joi.string().objectId().required().description('Challenge Id.'),
                sortKey: Joi.string().default("createdAt").optional().description('sort key'),
                sortDirection: Joi.number().default(-1).optional().description('sort direction'),
            },
            group: 'Challenge',
            description: 'Route to get challenges for admin/user',
            model: 'GetChallenges'
        },
        auth: AVAILABLE_AUTHS.USER,
        handler: challengeController.leaderboardList
    },
];

module.exports = routes;




