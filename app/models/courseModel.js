"use strict";
/************* Modules ***********/
const { } = require("../utils/constants");
const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;

/**************************************************
 ************* Course Model or collection ***********
 **************************************************/
const courseSchema = new Schema(
    {
        name: { type: String, required:true },
        fullName: { type: String, required:true },
        duration: { type: Number }, // Duration will be in Months only
        fee : { type : Number },
        modules :[{
                name: { type: String },
                details: { type: String, default: ""},
                _id: false } 
            ],
        isDeleted: { type: Boolean, default: false},
     },
    { versionKey: false, timestamps: true,collection: 'course' }
);

module.exports = MONGOOSE.model("course", courseSchema);