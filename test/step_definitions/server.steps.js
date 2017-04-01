require('dotenv').config();
const fetch = require('node-fetch');
const chai = require('chai');
const expect = chai.expect;

const userFixtures = require('../fixtures/users');

const jsonWebToken = require('jsonwebtoken');

// Cucumber doesn't support arrow functions due to binding 'this'.
/* eslint func-names: ["error", "never"]*/
/* eslint prefer-arrow-callback: 0 */
// TODO: Remove the below line before committing.
/* eslint no-console: 0 */

const { defineSupportCode } = require('cucumber');

defineSupportCode(({ Given, When, Then }) => {

  let jsonResults;

  When('I set a JWT bearer token using test user {stringInDoubleQuotes}', function (userId, callback) {

    const jwtToken = jsonWebToken.sign({
      sub: userFixtures.users[userId].external_id,
      aud: process.env.AUTH0_CLIENT_ID
    }, process.env.AUTH0_SECRET );


    this.apickli.setAccessToken(jwtToken);
    this.apickli.setBearerToken();

    // Write code here that turns the phrase above into concrete actions
    callback(null, 'ok');
  });

  Then('I should eventually get back a JSON list of books:', function (string) {
    return expect(jsonResults).to.deep.equal(JSON.parse(string));

    return jsonResults.then(data => {
      return expect(data).to.deep.equal(JSON.parse(string));
    })
  });

});
