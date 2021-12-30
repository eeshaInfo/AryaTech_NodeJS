"use strict";
/************* Modules ***********/
const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;
/**************************************************
 ************* DbVersion Model or collection ***********
 **************************************************/
const dbVersionSchema = new Schema(
  {
    version: {
      type: Number,
      unique: true,
    },
  },
  { versionKey: false, timestamps: true, collection: 'dbVersions' }
);

module.exports = MONGOOSE.model("dbVersions", dbVersionSchema);
