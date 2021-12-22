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
        timeTaken: { type: String },
        caloriesBurned: { type: Number },
        avgSpeed: { type: String },
        maxSpeed: { type: String },
    },
    { versionKey: false, timestamps: true }
);

module.exports = MONGOOSE.model("userChallenges", userChallengesSchema);

