"use strict";
/************* Modules ***********/
const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;
const { TRANSACTION_STATUS } = require(`../utils/constants`)

/**************************************************
 ************* Transaction Model or collection ***********
 **************************************************/
const paymentSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'users' },
        challengeId: { type: Schema.Types.ObjectId, ref: 'challenges' },
        transactionID: { type: String }, // transection Id of payment
        status: { type: Number ,enum: [TRANSACTION_STATUS.APPROVE, TRANSACTION_STATUS.PENDING, TRANSACTION_STATUS.REJECT]} // status of payment i.e approve,pending ,reject
    },
    { versionKey: false, timestamps: true }
);


module.exports = MONGOOSE.model("transactions", paymentSchema);