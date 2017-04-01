const id = require('pow-mongodb-fixtures').createObjectId;

const books = {
  "book1": {
    "_id": id("507f1f77bcf86cd799439011"),
    "googleId": "z2MLDgAAQBAJ",
    "title": "Animal Farm"
  },
  "book2": {
    "_id": id("407f1f77bcf86cd799439011"),
    "googleId": "foobarMyBookGoogleId",
    "title": "My book"
  }  
};

module.exports.books = books;
