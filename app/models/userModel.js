"use strict";
/************* Modules ***********/
const { USER_TYPES, GENDER_TYPES, DURATION_TYPES } = require("../utils/constants");
const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;

/**************************************************
 ************* User Model or collection ***********
 **************************************************/
const userSchema = new Schema(
    {
        email: { type: String },
        firstName: { type: String },
        lastName: { type: String },
        userType: { type: Number, enum: [ USER_TYPES.STUDENT, USER_TYPES.ADMIN,USER_TYPES.TEACHER ] },
        country: { type: String },
        state: { type: String },
        city: { type: String },
        district: { type:String },
        zipCode: { type: String },
        aadharNo: {type: String},
        panNo: {type: String},
        studyCenter: {type: String},
        centerLocation: {type: String},
        courseDuration: {type: Number },
        Qualification: {type: String},
        mobileNumber: { type: String },      
        gender: { type: Number, enum: [GENDER_TYPES.MALE, GENDER_TYPES.FEMALE, GENDER_TYPES.OTHER] },
        dob: { type: Date, max: new Date() },
        imagePath: { type: String },
        password: { type: String },
        status: { type: Number },
    },
    { versionKey: false, timestamps: true,collection: 'users' }
);

module.exports = MONGOOSE.model("users", userSchema);

