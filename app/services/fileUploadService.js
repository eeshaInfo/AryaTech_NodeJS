const AWS = require('aws-sdk');
const fs = require('fs');
// const fse = require('fs-extra');
const path = require('path');
const CONFIG = require('../../config');
const fileUploadService = {};
AWS.config.update({ accessKeyId: CONFIG.AWS.accessKeyId, secretAccessKey: CONFIG.AWS.secretAccessKey });
let s3Bucket = new AWS.S3({ region: process.env.AWS_REGION });
const { AVAILABLE_EXTENSIONS_FOR_FILE_UPLOADS, SERVER, MESSAGES, ERROR_TYPES } = require(`../utils/constants`);
const HELPERS = require("../helpers");

/**
 * function to upload a file to s3(AWS) bucket.
 */
fileUploadService.uploadFileToS3 = (buffer, fileName, bucketName) => {
    console.log(fileName)
    return new Promise((resolve, reject) => {
        s3Bucket.upload({
            Bucket: CONFIG.S3_BUCKET.bucketName,
            Key: fileName,
            Body: buffer,
        }, function (err, data) {
            if (err) {
                console.log('Error here', err);
                return reject(err);
            }
            let imageUrl = `${process.env.CLOUD_FRONT_URL}/${data.key}`;
            resolve(imageUrl);
        });
    });
};

/**
 * function to upload file to local server.
 */
fileUploadService.uploadFileToLocal = async (payload, fileName, pathToUpload, pathOnServer) => {
    let directoryPath = pathToUpload ? pathToUpload : path.resolve(__dirname + `../../../..${CONFIG.PATH_TO_UPLOAD_SUBMISSIONS_ON_LOCAL}/${payload.user._id}`);
    // create user's directory if not present.
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
    }
    let fileSavePath = `${directoryPath}/${fileName}`;
    let writeStream = fs.createWriteStream(fileSavePath);
    return new Promise((resolve, reject) => {
        writeStream.write(payload.file.buffer);
        writeStream.on('error', function (err) {
            reject(err);
        });
        writeStream.end(function (err) {
            if (err) {
                reject(err);
            } else {
                let fileUrl = pathToUpload ? `${CONFIG.SERVER_URL}${pathOnServer}/${fileName}` : `${CONFIG.SERVER_URL}${CONFIG.PATH_TO_UPLOAD_SUBMISSIONS_ON_LOCAL}/${payload.user._id}/${fileName}`;
                resolve(fileUrl);
            }
        });
    });
};

/**
 * function to upload a file on either local server or on s3 bucket.
 */
fileUploadService.uploadFile = async (payload, pathToUpload, pathOnServer) => {
    let fileExtention = payload.file.originalname.split('.')[1];
    console.log(fileExtention, AVAILABLE_EXTENSIONS_FOR_FILE_UPLOADS)
    if (AVAILABLE_EXTENSIONS_FOR_FILE_UPLOADS.indexOf(fileExtention) !== -(SERVER.ONE)) {
        let fileName = `profile_${Date.now()}.${fileExtention}`, fileUrl = '';
        let UPLOAD_TO_S3 = process.env.UPLOAD_TO_S3 ? process.env.UPLOAD_TO_S3 : '';
        if (UPLOAD_TO_S3.toLowerCase() === 'true') {
            let s3BucketName = CONFIG.S3_BUCKET.zipBucketName;
            fileUrl = await fileUploadService.uploadFileToS3(payload.file.buffer, fileName, s3BucketName);
        } else {
            fileUrl = await fileUploadService.uploadFileToLocal(payload, fileName, pathToUpload, pathOnServer);
        }
        return fileUrl;
    }
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_FILE_TYPE, ERROR_TYPES.BAD_REQUEST);
};

module.exports = fileUploadService;