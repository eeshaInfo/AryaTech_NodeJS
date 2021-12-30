'use strict';

let CONSTANTS = {};

CONSTANTS.SERVER = {
    ONE: 1
};

CONSTANTS.AVAILABLE_AUTHS = {
    ADMIN: 1,
    USER: 2,
    COMMON: 3
};

CONSTANTS.STATUS = {
    ACTIVE: 1,
    BLOCK: 2,
};

CONSTANTS.PASSWORD_PATTER_REGEX = /^(?=.{6,})(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$/;

CONSTANTS.NORMAL_PROJECTION = { __v: 0, isDeleted: 0, createdAt: 0, updatedAt: 0 };

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
    ADMIN: 1,
    USER: 2,
};


CONSTANTS.GENDER_TYPES = {
    MALE: 1,
    FEMALE: 2,
    OTHER: 3,
}


CONSTANTS.CHALLENGES_TYPES = {
    PAID: 1,
    UNPAID: 2,
}

CONSTANTS.DISTANCE_TYPE = {
    METER: 1,
    KM: 2,
}

CONSTANTS.LOGIN_TYPES = {
    NORMAL: 1,
    GOOGLE: 2,
    FACEBOOK: 3
};

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

CONSTANTS.AVAILABLE_EXTENSIONS_FOR_FILE_UPLOADS = ['png', 'jpg', 'pdf'];

CONSTANTS.PAGINATION = {
    DEFAULT_LIMIT: 10,
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