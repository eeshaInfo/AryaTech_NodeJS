"use strict";
/************* Modules ***********/
const { USER_TYPES, GENDER_TYPES } = require("../utils/constants");
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
        userType: { type: Number, enum: [ USER_TYPES.USER, USER_TYPES.ADMIN ] },
        country: { type: String },
        state: { type: String },
        city: { type: String },
        mobileNumber: { type: String },
        zipCode: { type: String },
        gender: { type: Number, enum: [GENDER_TYPES.MALE, GENDER_TYPES.FEMALE, GENDER_TYPES.OTHER] },
        dob: { type: Date, max: new Date() },
        imagePath: { type: String },
        password: { type: String },
        status: { type: Number },
        challengeCompleted: { type: Number ,default: 0 },
        contacts: { type: Array }  // array of user contacts mobile number
    },
    { versionKey: false, timestamps: true,collection: 'users' }
);

module.exports = MONGOOSE.model("users", userSchema);

