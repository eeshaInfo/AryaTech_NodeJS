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
        regNo: { type: String, unique:true },
        centerId: { type: Schema.Types.ObjectId, ref:'users'},
        email: { type: String },
        name: { type: String },
        gender: { type: Number, enum: [GENDER_TYPES.MALE, GENDER_TYPES.FEMALE] },
        fathersName: { type: String },
        mothersName: { type: String },
        dateOfReg: { type: Date },
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
        course: { type: String },
        duration: {type: Number },
        Qualification: {type: String},
        mobileNumber: { type: String },  
        parentsMobile: { type: String },    
        dob: { type: Date, max: new Date() },
        imagePath: { type: String },
        password: { type: String },

        //branch details for frachise admin registration
        centerCode: {type: String},
        centerName: {type: String},
        centerAddress: {type: String},
        areaType: {type: Number, enum:Object.values(CONSTANTS.AREA_TYPES)},   
        centerEmail: {type: String},
        status: { type: Number, default:CONSTANTS.STATUS.PENDING, enum:Object.values(CONSTANTS.STATUS) },
        isDeleted: { type: Boolean, default: false},
    },
    { versionKey: false, timestamps: true,collection: 'users' }
);

module.exports = MONGOOSE.model("users", userSchema);

