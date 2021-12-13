const { DATABASE_VERSIONS } = require("./constants");
const { dbVersionModel } = require("./../models");
const { ADMIN, LOCATION } = require("../../config");
const { hashPassword } = require("./utils");
const { adminModel } = require('../models/index')
let dbMigrations = {};

/** -- function to migerate database based on version number. */
dbMigrations.migerateDatabase = async () => {
    /** get database version. */
    let dbVersion = await dbVersionModel.findOne().lean();

    let version = dbVersion ? dbVersion.version : 0;
    /** -- database migeration for initial version */
    if (version < DATABASE_VERSIONS.ONE) {
        /** -- create admin if not exist */
        let password = hashPassword(ADMIN.PASSWORD);
        await adminModel({ email: ADMIN.EMAIL, password: password, name: ADMIN.NAME }).save();
        await dbVersionModel.findOneAndUpdate({ version: DATABASE_VERSIONS.ONE }).lean();
        await dbVersionModel({ version: DATABASE_VERSIONS.ONE }).save();
    }
    version = DATABASE_VERSIONS.ONE;

}

module.exports = dbMigrations;
