"use strict";
/************* Modules ***********/
const { USER_TYPES, GENDER_TYPES, ADDRESS_TYPE } = require("../utils/constants");
const MONGOOSE = require("mongoose");
const CONSTANTS = require("../utils/constants");
const Schema = MONGOOSE.Schema;

/**************************************************
 *************Franchise_Admin/SuperAdmin Model or collection ***********
 **************************************************/
const franchaiseSchema = new Schema(
    {
        centerCode: { type: String,unique:true},
        name: {type: String,unique:true},
        address: {type: String},
        status: { type: Number, default:CONSTANTS.STATUS.PENDING, enum:Object.values(CONSTANTS.STATUS) },
        userId:{type:Schema.Types.ObjectId,ref:'users'},
        isDeleted: { type: Boolean, default: false},
    },
    { versionKey: false, timestamps: true,collection: 'franchaise' }
);

module.exports = MONGOOSE.model("franchaise", franchaiseSchema);

