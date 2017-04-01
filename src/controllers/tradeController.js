'use strict';

const Trade = require('../models/trades.js');
const Books = require('../models/books.js');
const UserController = require('../controllers/userController.js');

function TradeController () {
  const self = this;

  this.getBookByGoogleId = function (googleId) {
    return Books.findOne({ googleId: googleId })
    .then(bookDoc => bookDoc ? bookDoc : false);
  }

  this.getDocsfromExtIds = function(ownerAuthId, bookGoogleId, borrowerAuthId) {
    const userController = new UserController();

    const getOwner = userController.getOrCreateUser(ownerAuthId)
      , getBook = self.getBookByGoogleId(bookGoogleId)
      , getBorrower = userController.getOrCreateUser(borrowerAuthId);

      return [getOwner, getBook, getBorrower];
  }

  this.addTrade = function (ownerAuthId, bookGoogleId, borrowerAuthId) {
    let getOwner, getBook, getBorrower;

    [getOwner, getBook, getBorrower] = self.getDocsfromExtIds(ownerAuthId, bookGoogleId, borrowerAuthId);

    return Promise.all([getOwner, getBook, getBorrower])
    .then( ([owner, book, borrower]) => {
      let newTrade;

      return self.isRequested(ownerAuthId, book, borrowerAuthId)
      .then(requested => {
        if (requested) return true;

        newTrade = new Trade();
        newTrade.owner = owner._id;
        newTrade.borrower = borrower._id;
        newTrade.book = book._id;
        return newTrade.save();    
      });
    });
  }


  this.isRequested = function (ownerAuthId, bookDoc, borrowerAuthId) {
    const userController = new UserController();

    const getOwner = userController.getOrCreateUser(ownerAuthId)
      , getBorrower = userController.getOrCreateUser(borrowerAuthId);

    return Promise.all([getOwner, getBorrower])
    .then( ([owner, borrower]) => {  
      return Trade.findOne({ owner: owner._id, book: bookDoc._id, borrower: borrower._id })
      .then(tradeDoc => tradeDoc ? true : false);
    });
  }

};

module.exports = TradeController;
