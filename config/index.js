const path = require('path');

var development = require('./env/development');
var production = require('./env/production');
var staging = require('./env/staging');
var PLATFORM = process.env.PLATFORM || 'CamelSports';

var defaults = {
    PLATFORM: PLATFORM,
    ADMIN: {
        EMAIL: `admin.test@yopmail.com`,
        PASSWORD: `Admin@123`,
        STATUS: 2
    },
    root: path.normalize(__dirname + '/../app'),
    SENDGRID_API_KEY: 'CHANGEME',
    environment: process.env.NODE_ENV || 'production',
    show: function () {
        console.log('environment: ' + this.environment);
    },
    SENDINBLUE: {
        API_KEY: 'dummy',
        SENDER_EMAIL: 'contact@projectdomain.com'
    },
    ENV_STAGING: "staging",
    ENV_DEVELOPMENT: "development",
    ENV_PRODUCTION: "production",
    environment: process.env.NODE_ENV || 'development',
    MONGODB: {
        PROTOCOL: process.env.DB_PROTOCOL || 'mongodb',
        HOST: process.env.DB_HOST || '127.0.0.1',
        PORT: process.env.DB_PORT || 27017,
        NAME: PLATFORM || 'Camel Sports',
        USER: '',
        PASSWORD: '',
        get URL() { return process.env.dbUrl || `${this.PROTOCOL}://${this.HOST}:${this.PORT}/${this.NAME}` }
    },
    domain: {
        PROTOCOL: process.env.DOMAIN_PROTOCOL || 'http',
        HOST: process.env.DOMAIN_HOST || '127.0.0.1',
        PORT: process.env.DOMAIN_PORT ? process.env.DOMAIN_PORT : '3000',
        get URL() { return `${this.PROTOCOL}://${this.HOST}${!!this.PORT ? ':' + this.PORT : ''}` }
    },
    server: {
        PROTOCOL: process.env.SERVER_PROTOCOL || 'http',
        HOST: process.env.SERVER_HOST || '0.0.0.0',
        PORT: process.env.SERVER_PORT || '4001',
        get URL() { return `${this.PROTOCOL}://${this.HOST}:${this.PORT}` }
    },
    PATH_FOR_LOCAL: process.env.PATH_FOR_LOCAL || '/uploads/',
    SERVER_URL: process.env.SERVER_URL || 'http://localhost:4001',
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:4200',
    swagger: require('./swagger'),
    S3_BUCKET: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'access-key-id',
        secretAccessKey: process.env.AWS_SECRET_ACESS_KEY || 'secret-access-key',
        zipBucketName: process.env.BUCKET_NAME || 'bucket-name'
    },
    AWS: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || `aws_access_key`,
        secretAccessKey: process.env.AWS_SECRET_ACESS_KEY || 'aws_secret_key',
        awsRegion: process.env.AWS_REGION || 'ohio',
        smsSender: process.env.SMS_SENDER || 'chicmic'
    },
    PATH_TO_UPLOAD_FILES_ON_LOCAL: process.env.PATH_TO_UPLOAD_FILES_ON_LOCAL || '/uploads/files'
};

let currentEnvironment = process.env.NODE_ENV || 'production';

function myConfig(envConfig) {
    return { ...defaults, ...envConfig };
};

module.exports = {
    development: myConfig(development),
    production: myConfig(production),
    staging: myConfig(staging)
}[currentEnvironment];

