
"use strict";
/************ Modules **********/
const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;
const { TOKEN_TYPES, USER_TYPE, DEVICE_TYPES } = require("../../utils/constants");

/************ user Session Model **********/
const sessionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'users' },
   // userType: { type: Number, enum: Object.values(USER_TYPE), default: USER_TYPE.USER },
   // tokenType: { type: Number, default: TOKEN_TYPES.LOGIN },
    token: { type: String },
  //  tokenExpDate: { type: Date },
   // deviceType: { type: Number, enum: Object.values(DEVICE_TYPES) },
   // deviceToken: { type: String },
   // data: { type: Object }
}, { timestamps: true, versionKey: false });

module.exports = MONGOOSE.model('sessions', sessionSchema);