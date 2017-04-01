'use strict';

const includes = require('lodash/includes'); 
const Books = require('../models/books.js');
const Users = require('../models/users.js');
const UserController = require('../controllers/userController.js');
const TradeController = require('../controllers/tradeController.js');

function BookController () {
  const self = this;

  this.addBook = function (googleId, title) {
    const newBook = new Books();

    newBook.googleId = googleId;
    newBook.title = title;
    return newBook.save();
  } 

  this.getBookByGoogleId = function (googleId) {
    console.log('getBookByGoogleId');

    return Books.findOne({ googleId: googleId })
    .then(bookDoc => {
      console.log('Books.findOne ok!');
      console.log(bookDoc);

      if ( ! bookDoc ) {
        return false;
      }

      return bookDoc;
    });
  }

  this.getOrCreateBook = function (googleId, title) {

    return Books.findOne({ googleId: googleId })
    .then(bookDoc => {
      if ( ! bookDoc ) {
        return self.addBook(googleId, title);
      } else {
        return bookDoc;
      }
    });
  }

  this.getAllBooks = function (authUserId) {
    const tradeController = new TradeController();

    // TODO: What an indentation mess! Simplify.

    console.log('Getting all books...');

    return Users.find()
    .then(users => {
      let bookPromises = []
        , rtnBooks = [];

      users.forEach(user => {
        user.books.forEach(book => {
          bookPromises.push(
            Books.findOne({ _id: book.toString() })
            .then(book => {
              console.log('Trying to see if is requested.');
              return tradeController.isRequested(user.external_id, book, authUserId)
              .then(requested => {
                return Object.assign({}, { owner: user.external_id, requested: requested }, book._doc);
              })
            })
          );
        });

      });

      return Promise.all(bookPromises)
      .then(books => {
        return books;
      })

    });
  }

  this.addMyBook = function (user, bookGoogleId, bookTitle) {
    const userController = new UserController();

    const getBook = self.getOrCreateBook(bookGoogleId, bookTitle);
    const getUser = userController.getOrCreateUser(user.sub);

    return Promise.all([getBook, getUser])
    .then( ([book, user]) => {
      if (includes(user.books, book._id)) return true;

      user.books.push(book._id);
      return user.save();
    });

  }

  this.deleteMyBook = function (user, bookGoogleId) {
    const userController = new UserController();

    const getBook = self.getBookByGoogleId(bookGoogleId);
    const getUser = userController.getOrCreateUser(user.sub);

    console.log(getBook);
    console.log(getUser);

    return Promise.all([getBook, getUser])
    .then( ([book, user]) => {
      console.log('deleteMyBook promises returned...');
      console.log(book);
      console.log(user);
      console.log(! book);
      console.log(String(book._id));
      const bookIds = user.books.map(el => el.toString());

      if ( ! book) return true;
      if ( ! includes(bookIds, book._id.toString())) return true;

      user.books = user.books.filter(item => item.toString() != book._id.toString());
      return user.save();
    });
  }

  this.getMyBooks = function (user) {
    const userController = new UserController();

    return userController.getOrCreateUser(user.sub)
    .then(user => {
      return Books.find({ _id: { $in: user.books } })
      .then(booksDoc => {
        if (booksDoc) {
          return booksDoc.map(el => {
            console.log('el');
            console.log(el);
            return Object.assign({}, { owner: user.external_id }, el.toObject())
          });
        } else {
          return [];
        }
      });

    });
  }
};

module.exports = BookController;
