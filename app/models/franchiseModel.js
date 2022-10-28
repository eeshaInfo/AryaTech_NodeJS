"use strict";
/************* Modules ***********/
const { USER_TYPES, GENDER_TYPES } = require("../utils/constants");
const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;

/**************************************************
 ************* FRANCHISE Model or collection ***********
 **************************************************/
const franchiseSchema = new Schema(
    {
        //user Details
        email: { type: String },
        firstName: { type: String },
        lastName: { type: String },
        gender: { type: Number, enum: [GENDER_TYPES.MALE, GENDER_TYPES.FEMALE, GENDER_TYPES.OTHER] },
        dob: { type: Date, max: new Date() },
        userType: { type: Number, default:USER_TYPES.FRANCHISE},
        country: { type: String },
        state: { type: String },
        district: { type:String },
        city: { type: String },
        zipCode: { type: String },
        qualification: {type: String},
        aadharNo: {type: String},
        panNo: {type: String},

        //center Details
        centerCode: {type: String},
        centerAddress: {type: String},
        centerPostOffice: {type: String},
        centerDistrict: {type: String},
        centerState: {type: String},
        centerPinCode: {type: String},
        centerEmail: {type: String},
        numberOfDesktop: {type: Number},
        numberOfLaptop: {type: Number},
        numberTheoryRoom: {type: Number},
        numberOfPracticalRoom: {type: Number},
        numberOfStaff: {type: Number},
        areaType: {type: Number, enum: [AREA_TYPES.RURAL,AREA_TYPES.URBAN]},
        mobileNumber: { type: String },      
        imagePath: { type: String },
        password: { type: String },
        status: { type: Number },
        isDeleted: { type: Boolean, default: false},
    },
    { versionKey: false, timestamps: true,collection: 'franchise' }
);

module.exports = MONGOOSE.model("franchise", franchiseSchema);

