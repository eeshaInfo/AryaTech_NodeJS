"use strict";
/************* Modules ***********/
const { } = require("../utils/constants");
const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;

/**************************************************
 ************* Payment Model or collection ***********
 **************************************************/
const paymentSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, required:true, ref:'users' },
        courseId: { type: Schema.Types.ObjectId, ref: 'course'},
        amount: { type: Number, required:true},
        transactionId: { type: String, required:true},
        mode:{type:String},
        isDeleted: { type: Boolean, default: false},
    },
    { versionKey: false, timestamps: true,collection: 'payments' }
);

module.exports = MONGOOSE.model("payments", paymentSchema);

