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
        name: { type: String },
        duration: { type: Number }, // Duration will be in Months only
        description: { type: String, default: ""},
        isDeleted: { type: Boolean, default: false},
     },
    { versionKey: false, timestamps: true,collection: 'course' }
);

module.exports = MONGOOSE.model("course", courseSchema);