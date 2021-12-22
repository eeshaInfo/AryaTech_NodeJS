"use strict";
/************* Modules ***********/
const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;

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
    { versionKey: false, timestamps: true }
);


module.exports = MONGOOSE.model("transactions", transactionSchema);