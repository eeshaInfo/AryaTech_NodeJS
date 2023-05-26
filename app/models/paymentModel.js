"use strict";
/************* Modules ***********/
const {PAYMENT_TYPE} = require("../utils/constants");
const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;

/**************************************************
 ************* Payment Model or collection ***********
 **************************************************/
const paymentSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, required:true, ref:'users' },
        franchiseId: { type : Schema.Types.ObjectId, required:true, ref:'franchise'},
        feeType: {type:String},
        paymentType: {type:String, enum: Object.values(PAYMENT_TYPE)},
        description: {type:String},
        amount: { type: Number, required:true},
        transactionId: { type: String },
        mode:{type:String},
        isDeleted: { type: Boolean, default: false},
    },
    { versionKey: false, timestamps: true,collection: 'payments' }
);

module.exports = MONGOOSE.model("payments", paymentSchema);

