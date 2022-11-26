"use strict";
/************* Modules ***********/
const { USER_TYPES, GENDER_TYPES, ADDRESS_TYPE } = require("../utils/constants");
const MONGOOSE = require("mongoose");
const CONSTANTS = require("../utils/constants");
const Schema = MONGOOSE.Schema;

/**************************************************
 ************* User,Franchise/Admin/SuperAdmin Model or collection ***********
 **************************************************/
const franchaiseSchema = new Schema(
    {
        centerCode: { type: String },
        email: { type: String },
        password: { type: String },
        name: { type: String },
        gender: { type: Number, enum: [GENDER_TYPES.MALE, GENDER_TYPES.FEMALE] },
        fathersName: { type: String },
        mothersName: { type: String },
        dateOfReg: { type: Date },
        dob: { type: Date, max: new Date() },
        address:[{
            type:{type: Number, enum:Object.values(ADDRESS_TYPE)},
            address: {type:String},
            postOffice:{type:String},
            state: { type: String,},
            city: { type: String },
            dist: { type:String },
            pincode: { type: String },
        }],       
        aadharNo: {type: String},
        panNo: {type: String},
        educations: [{
            examination:{type: String},
            board: {type:String},
            passingYear:{type:String},
            percentage: { type: Number,},
        }],
        mobileNumber: { type: String },   
        imagePath: { type: String },
        centerName: {type: String},
        centerAddress: {type: String},
        centerEmail: {type: String},
        areaType: {type: Number, enum:Object.values(CONSTANTS.AREA_TYPES)},   //Rural or URBAN
        status: { type: Number, default:CONSTANTS.STATUS.PENDING, enum:Object.values(CONSTANTS.STATUS) },
        isDeleted: { type: Boolean, default: false},
    },
    { versionKey: false, timestamps: true,collection: 'franchaise' }
);

module.exports = MONGOOSE.model("franchaise", franchaiseSchema);

