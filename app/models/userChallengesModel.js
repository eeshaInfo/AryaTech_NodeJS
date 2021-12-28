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
        completingDate: { type: Date },
        timeTaken: { type: Number },
        caloriesBurned: { type: Number },
        avgSpeed: { type: Number },
        maxSpeed: { type: Number },
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

