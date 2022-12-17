"use strict";
/************* Modules ***********/
const { USER_TYPES, GENDER_TYPES, DURATION_TYPES, ADDRESS_TYPE } = require("../utils/constants");
const MONGOOSE = require("mongoose");
const CONSTANTS = require("../utils/constants");
const Schema = MONGOOSE.Schema;

/**************************************************
 ************* STUDENT'S  Model or collection ***********
 **************************************************/
const userSchema = new Schema(
    {
        //user details
        regNo: { type: String,default:'ARYATECH'+new Date().valueOf() },
        email: { type: String },
        name: { type: String },
        email: { type: String },
        password: { type: String },
        userType: { type: Number, default:CONSTANTS.USER_TYPES.STUDENT, enum: Object.values(CONSTANTS.USER_TYPES) },
        gender: { type: Number, enum: [GENDER_TYPES.MALE, GENDER_TYPES.FEMALE] },
        dob: { type: Date, max: new Date() },
        fathersName: { type: String },
        mothersName: { type: String },
        userType: { type: Number, enum: Object.values(CONSTANTS.USER_TYPES) },
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
        courseId: { type:MONGOOSE.Types.ObjectId, ref:'course' },
        franchaiseId:{type:MONGOOSE.Types.ObjectId,ref:'franchaise'},
        duration: {type: Number },
        educations: [{
            examination:{type: String},
            board: {type:String},
            passingYear:{type:String},
            percentage: { type: Number,},
        }],
        mobileNumber: { type: String }, 
        parentsMobileNumber: { type: String }, 
        parentsMobile: { type: String },    
        imagePath: { type: String },
        password: { type: String },
        isDeleted: { type: Boolean, default: false},
    },
    { versionKey: false, timestamps: true,collection: 'users' }
);

module.exports = MONGOOSE.model("users", userSchema);

