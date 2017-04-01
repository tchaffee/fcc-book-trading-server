require('dotenv').config();
const fixtures = require('pow-mongodb-fixtures').connect('test', {
  host: "127.0.0.1",
  port: 27400
});
const apickli = require('apickli');
const {defineSupportCode} = require('cucumber');

defineSupportCode(function({After, Before}) {

  Before({tags: "@dbfixtures"}, function (scenarioResult, callback) {
		this.apickli = new apickli.Apickli('http', process.env.API_SERVER, '/vagrant/test/schemas/');
    fixtures.clearAllAndLoad(__dirname + './../fixtures', callback);
  });

// The Before hook will clear the DB, so leave the DB intact for examination
// instead of clearing it after each scenario.  
/*
  After({tags: "@dbfixtures"}, function (scenarioResult, callback) {
    fixtures.clear(function(err) {
      if (err) {
        callback(err);
      } else {
        callback();
      }
    })
  });
*/
});
