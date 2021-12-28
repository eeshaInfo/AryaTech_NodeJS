let CONSTANTS = require('./constants');
const MONGOOSE = require('mongoose');
const BCRYPT = require("bcrypt");
const JWT = require("jsonwebtoken");
const CONFIG = require('../../config');
const awsSms = require('aws-sns-sms');
const fs = require('fs');
const XLSX = require('xlsx');

const awsSnsConfig = {
  accessKeyId: CONFIG.AWS.accessKeyId,
  secretAccessKey: CONFIG.AWS.secretAccessKey,
  region: CONFIG.AWS.awsRegion,
};

// let client = require('redis').createClient({
//   port: CONFIG.REDIS.PORT,
//   host: CONFIG.REDIS.HOST
// });

let commonFunctions = {};

/**
 * incrypt password in case user login implementation
 * @param {*} payloadString 
 */
commonFunctions.hashPassword = (payloadString) => {
  return BCRYPT.hashSync(payloadString, CONSTANTS.SECURITY.BCRYPT_SALT);
};

/**
 * @param {string} plainText 
 * @param {string} hash 
 */
commonFunctions.compareHash = (payloadPassword, userPassword) => {
  return BCRYPT.compareSync(payloadPassword, userPassword);
};

/**
 * function to get array of key-values by using key name of the object.
 */
commonFunctions.getEnumArray = (obj) => {
  return Object.keys(obj).map(key => obj[key]);
};

/** used for converting string id to mongoose object id */
commonFunctions.convertIdToMongooseId = (stringId) => {
  return MONGOOSE.Types.ObjectId(stringId);
};

/** create jsonwebtoken **/
commonFunctions.encryptJwt = (payload) => {

  return JWT.sign(payload, CONSTANTS.SECURITY.JWT_SIGN_KEY, { algorithm: 'HS256', expiresIn: '24h' });
};

commonFunctions.decryptJwt = (token) => {
  return JWT.verify(token, CONSTANTS.SECURITY.JWT_SIGN_KEY, { algorithm: 'HS256' })
}

/**
 * function to convert an error into a readable form.
 * @param {} error 
 */
commonFunctions.convertErrorIntoReadableForm = (error) => {
  let errorMessage = '';
  if (error.message.indexOf("[") > -1) {
    errorMessage = error.message.substr(error.message.indexOf("["));
  } else {
    errorMessage = error.message;
  }
  errorMessage = errorMessage.replace(/"/g, '');
  errorMessage = errorMessage.replace('[', '');
  errorMessage = errorMessage.replace(']', '');
  error.message = errorMessage;
  return error;
};

/***************************************
 **** Logger for error and success *****
 ***************************************/
commonFunctions.log = {
  info: (data) => {
    console.log('\x1b[33m' + data, '\x1b[0m');
  },
  success: (data) => {
    console.log('\x1b[32m' + data, '\x1b[0m');
  },
  error: (data) => {
    console.log('\x1b[31m' + data, '\x1b[0m');
  },
  default: (data) => {
    console.log(data, '\x1b[0m');
  }
};

/**
 * Send an email to perticular user mail 
 * @param {*} email email address
 * @param {*} subject  subject
 * @param {*} content content
 * @param {*} cb callback
 */

commonFunctions.sendEmail = async (userData, type) => {
  const mailgun = require("mailgun-js");
  HANDLEBARS = require('handlebars')
  const mg = mailgun({ apiKey: CONFIG.MAIL_GUN.API_KEY, domain: CONFIG.MAIL_GUN.DOMAIN });
  /** setup email data **/
  userData.baseURL = CONFIG.SERVER_URL;
  const mailData = commonFunctions.emailTypes(userData, type),
    email = userData.email;
  let templateData;
  if (type != CONSTANTS.EMAIL_TYPES.SEND_PAYROLL) {
    mailData.template = fs.readFileSync(mailData.template, 'utf-8');
    templateData = HANDLEBARS.compile(mailData.template)(mailData.data);
  }
  let emailToSend = {
    to: email,
    from: CONFIG.MAIL_GUN.SENDER,
    subject: mailData.Subject,
    ...(type == CONSTANTS.EMAIL_TYPES.SEND_PAYROLL && { text: 'Payroll' }),
    ...(type != CONSTANTS.EMAIL_TYPES.SEND_PAYROLL && { html: templateData }),
    //attachment: mailData.attachment,
    ...(type == CONSTANTS.EMAIL_TYPES.SEND_PAYROLL && { attachment: mailData.attachment }),
    //template: mailData.template,
    'h:X-Mailgun-Variables': JSON.stringify(mailData.data)
  };
  mg.messages().send(emailToSend, function (error, body) {
    if (error) {
      console.log(error)
    }
  });
};

commonFunctions.emailTypes = (user, type) => {
  let EmailStatus = {
    Subject: '',
    data: {},
    template: ''
  };
  switch (type) {
    case CONSTANTS.EMAIL_TYPES.SETUP_PASSWORD:
      EmailStatus["Subject"] = CONSTANTS.EMAIL_SUBJECTS.SETUP_PASSWORD;
      EmailStatus.template = CONSTANTS.MAIL_GUN_TEMPLATES.SETUP_PASSWORD_EMAIL;
      EmailStatus.data["link"] = user.setupPasswordLink;
      EmailStatus.data["firstName"] = user.firstName;
      // EmailStatus.data["senderLastName"] = user.adminLastName;
      EmailStatus.data["baseURL"] = user.baseURL;
      break;

    case CONSTANTS.EMAIL_TYPES.FORGOT_PASSWORD_EMAIL:
      EmailStatus["Subject"] = CONSTANTS.EMAIL_SUBJECTS.RESET_PASSWORD_EMAIL;
      EmailStatus.template = CONSTANTS.MAIL_GUN_TEMPLATES.RESET_PASSWORD_EMAIL;
      EmailStatus.data["firstName"] = user.firstName;
      EmailStatus.data["link"] = user.resetPasswordLink;
      EmailStatus.data["baseURL"] = user.baseURL;
      break;

    case CONSTANTS.EMAIL_TYPES.SEND_PAYROLL:
      EmailStatus["Subject"] = CONSTANTS.EMAIL_SUBJECTS.PAYROLL_EMAIL;
      EmailStatus.template = '';
      EmailStatus.attachment = user.fileUrl;
      //EmailStatus.data["firstName"] = user.firstName;
      //EmailStatus.data["link"] = user.resetPasswordLink;
      //EmailStatus.data["baseURL"] = user.baseURL;
      break;

    case CONSTANTS.EMAIL_TYPES.ACCOUNT_RESTORATION_EMAIL:
      EmailStatus['Subject'] = CONSTANTS.EMAIL_SUBJECTS.ACCOUNT_RESTORATION_EMAIL;
      EmailStatus.template = CONSTANTS.EMAIL_CONTENTS.ACCOUNT_RESTORATION_EMAIL;
      EmailStatus.data['name'] = user.name;
      EmailStatus.data['confirmationLink'] = user.confirmationLink;
      break;

    default:
      EmailStatus['Subject'] = 'Welcome Email!';
      break;
  }
  return EmailStatus;
};

commonFunctions.renderTemplate = (template, data) => {
  return handlebars.compile(template)(data);
};

/**
 * function to create reset password link.
 */
commonFunctions.createResetPasswordLink = (userData) => {
  let dataForJWT = { ...userData, Date: Date.now };
  let resetPasswordLink = CONFIG.CLIENT_URL + '/auth/resetpassword/' + commonFunctions.encryptJwt(dataForJWT);
  return resetPasswordLink;
};

/**
* function to create a setup password link.
*/
commonFunctions.createSetupPasswordLink = (userData) => {
  let token = commonFunctions.encryptJwt({ ...userData, date: Date.now, }, '24h');
  let setupPasswordLink = CONFIG.CLIENT_URL + '/auth/invite/' + token;
  return setupPasswordLink;
};

/**
 * function to create reset password link.
 */
commonFunctions.createAccountRestoreLink = (userData) => {
  let dataForJWT = { previousAccountId: userData._id, Date: Date.now, email: userData.email, newAccountId: userData.newAccountId };
  let accountRestoreLink = CONFIG.CLIENT_URL + '/v1/user/restore/' + commonFunctions.encryptJwt(dataForJWT);
  return accountRestoreLink;
};

/**
 * function to get data from redis 
 */
commonFunctions.getDataFromRedis = async (key) => {
  key = key.toString();
  let value = await new Promise((resolve, reject) => {
    client.get(key, function (err, value) {
      return resolve(JSON.parse(value))
    });
  })
  return value;
};

/**
 * function to generate random alphanumeric string
 */
commonFunctions.generateAlphanumericString = (length) => {
  let chracters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var randomString = '';
  for (var i = length; i > 0; --i) randomString += chracters[Math.floor(Math.random() * chracters.length)];
  return randomString;
};

/**
 * function to sent sms via AWS-SNS
 * @param {receiver} phoneNumber
 * @param {content} SMS 
 */
commonFunctions.sendSms = async (receiver, content) => {
  let msg = {
    "message": content,
    "sender": CONFIG.AWS.smsSender || 'Chicmic',
    "phoneNumber": receiver
  };
  let smsResponse = await awsSms(awsSnsConfig, msg);
  return smsResponse
}



module.exports = commonFunctions;

