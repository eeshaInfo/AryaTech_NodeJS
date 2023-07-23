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
fileUploadService.uploadFileToS3 = (buffer, fileName,originalImageName) => {
    const dir = 'profile';
    return new Promise((resolve, reject) => {
        s3Bucket.upload({
            Bucket: CONFIG.S3_BUCKET.bucketName,
            Key: `aryatech/${dir}/`+fileName,
            Body: buffer,
        }, function (err, data) {
            if (err) {
                console.log('Error here', err);
                return reject(err);
            }
            let profileImage = {
                originalImage : originalImageName,
                imageUrl :  `${process.env.CLOUDFRONT_URL}/${data.key}`
            }
            resolve(profileImage);
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
    if (AVAILABLE_EXTENSIONS_FOR_FILE_UPLOADS.indexOf(fileExtention) !== -(SERVER.ONE)) {
        let fileName = `profile_${Date.now()}.${fileExtention}`, profileImage = '';
        let originalImageName = payload.file.originalname;
        let UPLOAD_TO_S3 = process.env.UPLOAD_TO_S3 ? process.env.UPLOAD_TO_S3 : '';
        if (UPLOAD_TO_S3.toLowerCase() === 'true') {
            let s3BucketName = CONFIG.S3_BUCKET.zipBucketName;
            profileImage = await fileUploadService.uploadFileToS3(payload.file.buffer, fileName,originalImageName);
        } else {
            profileImage = await fileUploadService.uploadFileToLocal(payload, fileName, pathToUpload, pathOnServer);
        }
        return profileImage;
    }
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_FILE_TYPE, ERROR_TYPES.BAD_REQUEST);
};


/**
 * Function to download file from s3_bucket
 * @param {*} uploadPath 
 * @returns 
 */
fileUploadService.downloadFromS3 =async(filePath) => {
    try {
         let awsParams = {
                Bucket: CONFIG.S3_BUCKET.bucketName,
                Key: filePath || "dlf/MOHAMMAD EESHA AADHAR CARD .png",
                // Key: uploadPath
         };
            let file_data = await s3.getObject(awsParams).promise()
            return file_data.Body;
        } catch (downloadErr) {
            console.log(downloadErr);
            reject({ status: "failed", error: downloadErr })

        }
}
/**
 * function to view file
 * @param {*} file 
 */

fileUploadService.getFile = async(filePath) => {
    try {
        const params = {
          Bucket: CONFIG.S3_BUCKET.bucketName,
          Key: filePath,
          Expires: 100
        }
        var url = s3Bucket.getSignedUrl('getObject', params)
        return url;
      } catch (error) {
        console.error(error);
        // ctx.body = {'message': `Could not retrieve file from S3`}
      }
}

module.exports = fileUploadService;