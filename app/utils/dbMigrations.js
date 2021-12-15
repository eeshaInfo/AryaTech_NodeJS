const { DATABASE_VERSIONS, USER_TYPES } = require("./constants");
const { ADMIN, LOCATION } = require("../../config");
const { hashPassword } = require("./utils");
const { userModel, dbVersionModel } = require('../models')
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
        await userModel({ email: ADMIN.EMAIL, password: password, firstName: ADMIN.FIRST_NAME, lastName: ADMIN.LAST_NAME, userType: USER_TYPES.ADMIN }).save();
        await dbVersionModel.findOneAndUpdate({ version: DATABASE_VERSIONS.ONE }).lean();
        await dbVersionModel({ version: DATABASE_VERSIONS.ONE }).save();
    }
    version = DATABASE_VERSIONS.ONE;

}

module.exports = dbMigrations;
