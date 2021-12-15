"use strict";
/************* Modules ***********/
const { USER_TYPES, GENDER_TYPES } = require("../../utils/constants");
const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;

var validateEmail = function (email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};

var validateMobileNumber = function (mobileNumber) {
    var re = /^\+\d{1,3}\d{9,11}$/;
    return re.test(mobileNumber);
};

/**************************************************
 ************* User Model or collection ***********
 **************************************************/
const userSchema = new Schema(
    {
        firstName: { type: String },
        lastName:{type:String},
        userType: { type: Number, maxlength: 2, default: USER_TYPES.USER },
        location: { type: String, default: "" },
        gender: { type: Number, enum: [GENDER_TYPES.MALE, GENDER_TYPES.FEMALE] },
        dob: { type: Date, max: new Date() },
        imagePath: { type: String },
        registrationToken: [{ type: String }],
       // isLoggedIn: { type: Boolean, default: false },
    },
    { versionKey: false }
);

userSchema.set("timestamps", true);

module.exports = MONGOOSE.model("users", userSchema);

