"use strict";
/************* Modules ***********/
const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;
const { CHALLENGES_TYPES, DISTANCE_TYPE } = require(`../utils/constants`)

/**************************************************
 ************* Challenge Model or collection ***********
 **************************************************/
const challengeSchema = new Schema(
    {
        distance: { type: Number },
        type: { type: Number, enum: [CHALLENGES_TYPES.PAID, CHALLENGES_TYPES.UNPAID] },
        distanceType: { type: Number, enum: [DISTANCE_TYPE.METER, DISTANCE_TYPE.KM] },
        amount: { type: Number ,default: 0 }, // price to pay for challenge in HZM
        completedByUser:{type:Number, default: 0 },  // user count which completed challenge
        isDeleted: { type: Boolean, default: false }
    },
    { versionKey: false, timestamps: true }
);

module.exports = MONGOOSE.model("challenges", challengeSchema);

