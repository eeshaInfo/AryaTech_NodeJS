"use strict";
const { boolean } = require("joi");
/************* Modules ***********/
const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;
const { CHALLENGES_TYPES, DISTANCE_TYPE } = require(`../../utils/constants`)

/**************************************************
 ************* Transaction Model or collection ***********
 **************************************************/
const transactionSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'users' },
        challengeId: { type: Schema.Types.ObjectId, ref: 'challenges' },
        transactionID: { type: String },
        status: { type: Boolean }
    },
    { versionKey: false }
);

transactionSchema.set("timestamps", true);

module.exports = MONGOOSE.model("transactions", transactionSchema);