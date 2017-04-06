'use strict';

// var Users = require('../models/users.js');
var Users = require('../models/users.js');

/**
 * @module controllers/UserController
 */
function UserController () {
  const self = this;

  /**
   * Gets an existing user. Creates the user if it does not exist.
   *
   * @param {string} userId - External user id.
   *
   * @returns {Promise}
   */
  this.getOrCreateUser = function (authUserId) {

    return Users.findOne({ external_id: authUserId})
    .then(userDoc => {
      if ( ! userDoc ) {
        return self.addUser(authUserId);
      }
      
      return userDoc;
    });
  }

  this.addUser = function (authUserId) {
    const newUser = new Users();

    newUser.external_id = authUserId;
    return newUser.save();
  }

};

module.exports = UserController;
