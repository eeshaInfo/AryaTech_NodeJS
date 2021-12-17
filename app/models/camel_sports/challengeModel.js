"use strict";
const { boolean } = require("joi");
/************* Modules ***********/
const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;
const { CHALLENGES_TYPES, DISTANCE_TYPE } = require(`../../utils/constants`)

/**************************************************
 ************* Challenge Model or collection ***********
 **************************************************/
const challengeSchema = new Schema(
    {
        challengeName: { type: String },
        challengeType: { type: Number, enum: [CHALLENGES_TYPES.PAID, CHALLENGES_TYPES.UNPAID] },
        distanceType: { type: Number, enum: [DISTANCE_TYPE.METER, DISTANCE_TYPE.KM] },
        amount: { type: Number },
        completed:{type:Number},
        isDeleted: { type: Boolean, default: false },
    },
    { versionKey: false }
);

challengeSchema.set("timestamps", true);

module.exports = MONGOOSE.model("challenges", challengeSchema);

