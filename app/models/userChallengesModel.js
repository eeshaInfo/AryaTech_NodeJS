"use strict";
const { boolean } = require("joi");
/************* Modules ***********/
const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;

/**************************************************
 ************* User Challenges Model or collection ***********
 **************************************************/
const userChallengesSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'users' },
        challengeId: { type: Schema.Types.ObjectId, ref: 'challenges' },
        completingDate: { type: Date }, //date of completion of challenge
        timeTaken: { type: Number }, // time taken to complete a challenge in second
        caloriesBurned: { type: Number }, // Calories burned in Calories
        avgSpeed: { type: Number }, // avg speed in m/s
        maxSpeed: { type: Number }, // avg speed in m/s
        trackingPoints: {
            type:[
                { lat: {type:Number,default:undefined}, lng: {type:Number,default:undefined} }
            ],
            default:undefined
        }
    },
    { versionKey: false, timestamps: true }
);

module.exports = MONGOOSE.model("userChallenges", userChallengesSchema);

