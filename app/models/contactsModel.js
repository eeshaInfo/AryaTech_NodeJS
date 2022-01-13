"use strict";
/************* Modules ***********/
const MONGOOSE = require("mongoose");
const Schema = MONGOOSE.Schema;

/**************************************************
************* contacts Model or collection ********
**************************************************/
const contactsSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'users' },
        contacts: {
            type:[
                { mobileNumber: { type : String }, isRegistered: {type : Boolean , default : false} }
            ],
        }
    },
    { versionKey: false, timestamps: true, collection: 'contacts' }
);

module.exports = MONGOOSE.model("contacts", contactsSchema);