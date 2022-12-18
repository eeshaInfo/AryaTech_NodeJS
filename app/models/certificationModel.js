"use strict";
/************* Modules ***********/
const {CERTIFICATE_STATUS, CERTIFICATE_TYPES} = require("../utils/constants");
const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;

/**************************************************
 ************* Certification Model or collection ***********
 **************************************************/
const certificationSchema = new Schema(
    {
        certificateType: { type: String, enum: Object.values(CERTIFICATE_TYPES)},
        userId: { type: Schema.Types.ObjectId, ref:'users' },
        courseId: { type: Schema.Types.ObjectId, ref: 'course'},
        centerId: { type: Schema.Types.ObjectId, ref:'users'},
        serialNumber: { type: Number },
        marks:{
            pratical: { type : Number, default:0},
            written: { type: Number, default: 0 },
            assignment: { type: Number, default: 0 },
            viva: { type: Number, default: 0 },
        },
        englishTypingSpeed: { type: Number },
        hindiTypingSpeed: { type: Number },
        status: { type: Number, default: CERTIFICATE_STATUS.PENDING,enum :Object.values(CERTIFICATE_STATUS)},
        isDeleted: { type: Boolean, default: false},
    },
    { versionKey: false, timestamps: true,collection: 'certifications' }
);

module.exports = MONGOOSE.model("certifications", certificationSchema);

