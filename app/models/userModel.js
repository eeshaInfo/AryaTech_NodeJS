"use strict";
/************* Modules ***********/
const { USER_TYPES, GENDER_TYPES, DURATION_TYPES, ADDRESS_TYPE } = require("../utils/constants");
const MONGOOSE = require("mongoose");
const CONSTANTS = require("../utils/constants");
const Schema = MONGOOSE.Schema;

/**************************************************
 ************* User,Franchise/Admin/SuperAdmin Model or collection ***********
 **************************************************/
const userSchema = new Schema(
    {
        //user details
        regNo: { type: String,default:'ARYATECH'+new Date().valueOf() },
        email: { type: String },
        name: { type: String },
        gender: { type: Number, enum: [GENDER_TYPES.MALE, GENDER_TYPES.FEMALE] },
        fathersName: { type: String },
        mothersName: { type: String },
        userType: { type: Number, enum: Object.values(CONSTANTS.USER_TYPES) },
        address:[{
            type:{type: Number, enum:Object.values(ADDRESS_TYPE)},
            address: {type:String},
            postOffice:{type:String},
            state: { type: String, default:'Bihar' },
            city: { type: String },
            dist: { type:String },
            pincode: { type: String },
        }],       
        aadharNo: {type: String},
        panNo: {type: String},
        courseId: { type:MONGOOSE.Types.ObjectId, ref:'course' },
        franchaiseId:{type:MONGOOSE.Types.ObjectId,ref:'franchaise'},
        duration: {type: Number },
        Qualification: {type: String},
        mobileNumber: { type: String },  
        parentsMobile: { type: String },    
        dob: { type: Date, max: new Date() },
        imagePath: { type: String },
        password: { type: String },
        isDeleted: { type: Boolean, default: false},
    },
    { versionKey: false, timestamps: true,collection: 'users' }
);

module.exports = MONGOOSE.model("users", userSchema);

