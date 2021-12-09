"use strict";

const express = require('express');
const dbMigrations = require("../utils/dbMigrations");
const routes = require('../routes');
const routeUtils = require('../utils/routeUtils');
const { log} = require('../utils/utils');

module.exports = async function (app) {

    app.use(require("body-parser").json({ limit: '50mb' }));
    app.use(require("body-parser").urlencoded({ limit: '50mb', extended: true }));


    //server static folder
    app.use('/uploads', express.static('uploads'));
    app.use('/public', express.static('public'));
    /** middleware for each api call to logging**/
    app.use((req, res, next) => {
        const start = process.hrtime.bigint();
        res.on("finish", () => {
            let end = process.hrtime.bigint();
            let seconds = Number(end - start) / 1000000000;
            
            let message = `${req.method} ${res.statusCode} ${req.url} took ${seconds} seconds`;
            
            if(res.statusCode >= 200 && res.statusCode <= 299){ log.success(message); }
            else if(res.statusCode >= 400){ log.error(message); }
            else { log.info(message); }
        });
        next();
    });

    /********************************
    ***** For handling CORS Error ***
    *********************************/
    app.all('/*', (request, response, next) => {
        response.header('Access-Control-Allow-Origin', '*');
        response.header('Access-Control-Allow-Headers', 'Content-Type, api_key, Authorization, x-requested-with, Total-Count, Total-Pages, Error-Message');
        response.header('Access-Control-Allow-Methods', 'POST, GET, DELETE, PUT, OPTIONS');
        response.header('Access-Control-Max-Age', 1800);
        next();
    });

    // // serve static folder.
    //  app.use('/public', express.static('public'));
    // app.use('/uploads', express.static('uploads'));


    // initialize mongodb 
    await require('./db_mongo')();

    // initalize routes.
    await routeUtils.route(app, routes);

     /* -- database migration
    */
     await dbMigrations.migerateDatabase();
};
