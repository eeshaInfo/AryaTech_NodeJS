"use strict";
/************* Modules ***********/
const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;

/**************************************************
 ************* Admin wallet Address Model or collection ***********
 **************************************************/
const walletSchema = new Schema(
    {
        walletAddress: { type: String },
        QRImage: { type: String }// path of QR image
    },
    { versionKey: false, timestamps: true, collection: 'wallet' }
);

module.exports = MONGOOSE.model("wallet", walletSchema);
