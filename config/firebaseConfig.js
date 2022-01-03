var admin = require("firebase-admin");
var serviceAccount = require("./firebaseAccountKey");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// })

module.exports.admin = admin