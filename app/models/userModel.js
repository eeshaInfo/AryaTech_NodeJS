"use strict";
/************* Modules ***********/
const { USER_TYPES, GENDER_TYPES, DURATION_TYPES, ADDRESS_TYPE } = require("../utils/constants");
const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;

/**************************************************
 ************* User Model or collection ***********
 **************************************************/
const userSchema = new Schema(
    {
        regNo: { type: String },
        branch: { type: String },
        studentType: { type: Number },
        email: { type: String },
        studentsName: { type: String },
        fathersName: { type: String },
        mothersName: { type: String },
        userType: { type: Number, enum: [ USER_TYPES.STUDENT, USER_TYPES.ADMIN,USER_TYPES.TEACHER ] },
        country: { type: String },
        address:[{
            type:{type: Number, enum:Object.values(ADDRESS_TYPE)},
            address: {type:String},
            postOffice:{type:String},
            state: { type: String },
            city: { type: String },
            dist: { type:String },
            pincode: { type: String },
        }],       
        aadharNo: {type: String},
        panNo: {type: String},
        studyCenter: {type: String},
        centerLocation: {type: String},
        course: { type: String },
        duration: {type: Number },
        Qualification: {type: String},
        mobileNumber: { type: String },  
        parentsMobile: { type: String },    
        gender: { type: Number, enum: [GENDER_TYPES.MALE, GENDER_TYPES.FEMALE] },
        dob: { type: Date, max: new Date() },
        imagePath: { type: String },
        password: { type: String },
        status: { type: Number },
    },
    { versionKey: false, timestamps: true,collection: 'users' }
);

module.exports = MONGOOSE.model("users", userSchema);

