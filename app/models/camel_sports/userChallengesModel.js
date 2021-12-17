"use strict";
const { boolean } = require("joi");
/************* Modules ***********/
const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;
const { CHALLENGES_TYPES, DISTANCE_TYPE } = require(`../../utils/constants`)

/**************************************************
 ************* User Challenges Model or collection ***********
 **************************************************/
const userChallengesSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'users' },
        challengeId: { type: Schema.Types.ObjectId, ref: 'challanges' },
        date: { type: Date, max: new Date() },
        timeTaken: { type: String },
        caloriesBurned: { type: Number },
        avgSpeed: { type: String },
        maxSpeed: { type: String },
    },
    { versionKey: false }
);

userChallengesSchema.set("timestamps", true);

module.exports = MONGOOSE.model("userChallenges", userChallengesSchema);
