const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const CONFIG = require('../../config');

module.exports = async () => {
    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true
    };
    await mongoose.connect(process.env.dbUrl||CONFIG.MONGODB.URL, options);
    console.log('Mongo connected at ', CONFIG.MONGODB.URL);
};