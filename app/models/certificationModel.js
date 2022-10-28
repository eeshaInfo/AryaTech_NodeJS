"use strict";
/************* Modules ***********/
const { } = require("../utils/constants");
const MONGOOSE = require("mongoose");
const CONSTANTS = require("../utils/constants");
const Schema = MONGOOSE.Schema;

/**************************************************
 ************* Certification Model or collection ***********
 **************************************************/
const certificationSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, required:true, ref:'users' },
        courseId: { type: Schema.Types.ObjectId, ref: 'course'},
        serialNumber: { type: Number },
        marksDetail:{
            pratical: { type : Number, default:0},
            written: { type: Number, default: 0 },
            assignment: { type: Number, default: 0 },
            viva: { type: Number, default: 0 },
        },
        status: { type: Number, enum :Object.keys(CONSTANTS.CERTIFICATE_STATUS)},
        isDeleted: { type: Boolean, default: false},
    },
    { versionKey: false, timestamps: true,collection: 'certifications' }
);

module.exports = MONGOOSE.model("certifications", certificationSchema);

