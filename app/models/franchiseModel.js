"use strict";
/************* Modules ***********/
const {FRANCHAISE_STATUS } = require("../utils/constants");
const MONGOOSE = require("mongoose");
const CONSTANTS = require("../utils/constants");
const Schema = MONGOOSE.Schema;

/**************************************************
 *************Franchise_Admin/SuperAdmin Model or collection ***********
 **************************************************/
const franchiseSchema = new Schema(
    {   regDate : { type : Date , required : true },
        centerCode: { type: String, unique : true},
        name: {type: String, unique : true},
        address: {type: String},
        status: { type: Number, default:CONSTANTS.FRANCHAISE_STATUS.ACTIVE, enum:Object.values(CONSTANTS.FRANCHAISE_STATUS) },
        userId:{type:Schema.Types.ObjectId,ref:'users'},
        isDeleted: { type: Boolean, default: false},
    },
    { versionKey: false, timestamps: true,collection: 'franchise' }
);

module.exports = MONGOOSE.model("franchise", franchiseSchema);

