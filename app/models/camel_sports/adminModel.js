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
const adminSchema = new Schema(
    {
        email: {
            type: String, trim: true, required: [true, "email address is required."], validate: [validateEmail, "Must be a valid email address."], unique: true
        },
        password: { type: String },
        name: { type: String }
    },
    { versionKey: false }
);

adminSchema.set("timestamps", true);

module.exports = MONGOOSE.model("admin", adminSchema);

