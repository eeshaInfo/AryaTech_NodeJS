"use strict";
/************* Modules ***********/
const {CERTIFICATE_STATUS} = require("../utils/constants");
const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;

/**************************************************
 ************* Certification Model or collection ***********
 **************************************************/
const certificationSchema = new Schema(
    {
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
        status: { type: Number, default: CERTIFICATE_STATUS.PENDING,enum :Object.values(CERTIFICATE_STATUS)},
        isDeleted: { type: Boolean, default: false},
    },
    { versionKey: false, timestamps: true,collection: 'certifications' }
);

module.exports = MONGOOSE.model("certifications", certificationSchema);

