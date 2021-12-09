const expect = require('chai').expect;
const request = require('request');
const CONFIG = require('../config');
const BASE_URL = CONFIG.server.URL;

/**
 * Test cases for all end points.
 */
describe('#API Integration:', () => {

    // check base path GET request only. (Server is working or not)
    it('Base Path request', function (done) {
        request(`${BASE_URL}/v1/user`, function (error, response) {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });
});