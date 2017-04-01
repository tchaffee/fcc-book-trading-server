const id = require('pow-mongodb-fixtures').createObjectId;
const bookFixtures = require('./books');

const users = {
  user1: {
    "_id": id("107f1f77bcf86cd799439011"),
    "external_id": "auth0|foobaruserid",
    "books": [ bookFixtures.books.book2._id ]
  },
  user2: {
    "_id": id("207f1f77bcf86cd799439011"),
    "external_id": "auth0|foobaruserid2",
    "books": [ bookFixtures.books.book1._id ]
  }
};

module.exports.users = users;
