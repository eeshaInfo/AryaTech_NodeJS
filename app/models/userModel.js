"use strict";
/************* Modules ***********/
const { USER_TYPES, GENDER_TYPES, DURATION_TYPES, ADDRESS_TYPE, STATUS } = require("../utils/constants");
const MONGOOSE = require("mongoose");
const CONSTANTS = require("../utils/constants");
const Schema = MONGOOSE.Schema;

/**************************************************
 ************* STUDENT'S  Model or collection ***********
 **************************************************/
const userSchema = new Schema(
    {
        //user details
        regNo: { type: String },
        regDate : { type : Date },
        name: { type: String },
        email: { type: String },
        password: { type: String },
        gender: { type: Number, enum: Object.values(GENDER_TYPES) },
        dob: { type: Date, max: new Date() },
        fathersName: { type: String },
        mothersName: { type: String },
        totalFees: { type : Number , default: 0},
        userType: { type: Number, enum: Object.values(CONSTANTS.USER_TYPES) },
        isAddressSame : { type : Boolean, default : true },
        primaryAddress:{
            address: {type:String},
            postOffice:{type:String},
            state: { type: String },
            city: { type: String },
            dist: { type:String },
            pincode: { type: String },
        },
        secondaryAddress:{
            address: {type:String},
            postOffice:{type:String},
            state: { type: String },
            city: { type: String },
            dist: { type:String },
            pincode: { type: String },
        },
        aadharNo: {type: String},
        panNo: {type: String},
        courseId: { type:MONGOOSE.Types.ObjectId, ref:'course' },
        franchiseId:{type:MONGOOSE.Types.ObjectId,ref:'franchise'},
        educations: [{
            examination:{type: String},
            board: {type:String},
            year:{type:String},
            percentage: { type: Number,},
        }],
        mobileNumber: { type: String }, 
        parentsMobileNumber: { type: String }, 
        parentsMobile: { type: String },    
        profileImage: { type: String },
        password: { type: String },
        status:{type: Number, default:STATUS.PENDING },
        isDeleted: { type: Boolean, default: false},
    },
    { versionKey: false, timestamps: true,collection: 'users' }
);

module.exports = MONGOOSE.model("users", userSchema);

