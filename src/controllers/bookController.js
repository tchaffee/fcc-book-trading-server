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

    return Books.findOne({ googleId: googleId })
    .then(bookDoc => {

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

  this.getUsersBooks = function () {
    const getUsers = Users.find().populate('books');

    return getUsers.then(users => {
      let rtnBooks = [];

      users.forEach(user => {
        user.books.forEach(book => {
          rtnBooks.push({ book: book, user: user});
        })
      });

      return rtnBooks;
    });
  }

  this.decorateUsersBooksWithRequested = function (userBooks, borrower) {
    const tradeController = new TradeController();
      let bookPromises = [];

      userBooks.forEach(userBook => {
        bookPromises.push(
          tradeController.isRequested(userBook.user, userBook.book, borrower)
          .then(requested => {
            return Object.assign({}, { owner: userBook.user.external_id, requested: requested }, userBook.book._doc);
          })
        );
      })

      return Promise.all(bookPromises)
      .then(books => {
        return books;
      })
  }

  this.getAllBooks = function (authUserId) {
    const userController = new UserController();
    const getBorrower = userController.getOrCreateUser(authUserId);
    const getUserBooks = self.getUsersBooks();

    return Promise.all([getBorrower, getUserBooks])
    .then(([borrower, userBooks]) => {
      return self.decorateUsersBooksWithRequested(userBooks, borrower);
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

    return Promise.all([getBook, getUser])
    .then( ([book, user]) => {
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
