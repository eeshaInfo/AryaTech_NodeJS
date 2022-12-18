'use strict';

let CONSTANTS = {};

CONSTANTS.SERVER = {
    ONE: 1
};

CONSTANTS.AVAILABLE_AUTHS = {
    SUPER_ADMIN: 1, // MAIN_BRANCH
    ADMIN: 2,        // SUB_BRANCH
    STUDENT: 3,
    ADMIN_AND_SUPER_ADMIN:4, //ADMIN AND SUPER ADMIN
    COMMON:5, // FOR EVERYONE
};

CONSTANTS.ADDRESS_TYPE = {
    PRIMARY: 'primary',
    SECONDRY: 'secondry'
}

CONSTANTS.STATUS = {
    PENDING: 1,
    APPROVE: 2,
    ACTIVE: 3,
    BLOCK: 4,
    INACTIVE: 5
};

CONSTANTS.PASSWORD_PATTER_REGEX = /^(?=.{6,})(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$/;

CONSTANTS.NORMAL_PROJECTION = { __v: 0, isDeleted: 0, createdAt: 0, updatedAt: 0, password: 0 };

CONSTANTS.MESSAGES = require('./messages');

CONSTANTS.SECURITY = {
    JWT_SIGN_KEY: 'fasdkfjklandfkdsfjladsfodfafjalfadsfkads',
    BCRYPT_SALT: 8,
    STATIC_TOKEN_FOR_AUTHORIZATION: '58dde3df315587b279edc3f5eeb98145'
};

CONSTANTS.ERROR_TYPES = {
    DATA_NOT_FOUND: 'DATA_NOT_FOUND',
    BAD_REQUEST: 'BAD_REQUEST',
    MONGO_EXCEPTION: 'MONGO_EXCEPTION',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    FORBIDDEN: 'FORBIDDEN',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    SOCKET_ERROR: 'SOCKET_ERROR',
    INVALID_MOVE: 'invalidMove'
};

CONSTANTS.USER_TYPES = {
    SUPER_ADMIN: 1, // MAIN_BRANCH
    ADMIN: 2,        // SUB_BRANCH
    STUDENT: 3
};

CONSTANTS.CERTIFICATE_STATUS = {
    PENDING: 1,
    ISSUED: 2,
    REJECT:3,
}

CONSTANTS.CERTIFICATE_TYPES = {
    MARKSHEET:"marksheet",
    CERTIFICATE:"certificate",
    TYPING:"typing"
}

CONSTANTS.GENDER_TYPES = {
    MALE: 1,
    FEMALE: 2
}


CONSTANTS.AREA_TYPES = {
    RURAL: 1,
    URBAN: 2,
}


CONSTANTS.TOKEN_TYPES = {
    LOGIN: 1,
    RESET_PASSWORD: 2,
    OTP: 3
};

CONSTANTS.EMAIL_TYPES = {
    SETUP_PASSWORD: 1,
    FORGOT_PASSWORD_EMAIL: 2,
    SEND_PAYROLL: 3
};

CONSTANTS.AVAILABLE_EXTENSIONS_FOR_FILE_UPLOADS = ['png', 'jpg', 'jpeg'];

CONSTANTS.PAGINATION = {
    DEFAULT_LIMIT: 50,
    DEFAULT_NUMBER_OF_DOCUMENTS_TO_SKIP: 0
};

CONSTANTS.TOKEN_TYPE = {
    RESET_PASSWORD: 1,
    ACTIVATE_ACCOUNT: 2,
};

CONSTANTS.ACTION_TAKEN = {
    UPDATE: 1,
    DELETE: 2,
}

CONSTANTS.DATABASE_VERSIONS = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
    SIX: 6,
    SEVEN: 7,
    EIGHT: 8,
    NINE: 9,
    TEN: 10,
    ELEVEN: 11,
    TWELVE: 12,
    THIRTEEN: 13,
    FOURTEEN: 14,
};

CONSTANTS.TRANSACTION_STATUS = {
    APPROVE: 1,
    REJECT: 2,
    PENDING: 3,
}


module.exports = CONSTANTS;