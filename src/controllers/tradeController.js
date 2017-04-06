'use strict';

const Trade = require('../models/trades.js');
const Books = require('../models/books.js');
const UserController = require('../controllers/userController.js');

function TradeController () {
  const self = this;

  this.getOwnerTrades = function(owner) {
    const userController = new UserController();

    return userController.getOrCreateUser(owner)
    .then(user => {
      return Trade.find({ owner: user._id})
      .populate('book')
      .then(trades => {

        if (trades) {
          const rtnBooks = trades.map(trade => {
              return Object.assign({}, { owner: owner, tradeApproved: trade.toObject().approved }, trade.toObject().book);
          })
          return rtnBooks;
        } else {
          return [];
        }
      });
    });
  }


  this.getMyTrades = function(authUserId) {
    const userController = new UserController();

    return userController.getOrCreateUser(authUserId)
    .then(user => {
      return Trade.find({ borrower: user._id})
      .populate('book')
      .then(trades => {

        if ( ! trades ) {
          return [];
        }

        return trades.map(trade => {
          return Object.assign(
            {}, 
            { 
              owner: trade.toObject().owner,
              requested: true,
              tradeApproved: trade.toObject().approved
            }, 
            trade.toObject().book
          );
        })

      });
    });
  }

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

      return self.isRequested(owner, book, borrower)
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

  this.approveTrade = function (ownerAuthId, bookGoogleId) {
    const userController = new UserController();
    const getOwner = userController.getOrCreateUser(ownerAuthId);
    const getBook = self.getBookByGoogleId(bookGoogleId);

    // Get the owner and book documents.
    return Promise.all([getOwner, getBook])
    .then( ([owner, book]) => {
      // Find the trade.
      return Trade.findOne({ owner: owner._id, book: book._id })
      .then(tradeDoc => {
        tradeDoc.approved = true;
        return tradeDoc.save();
      });
    });
  }

  this.isRequested = function (ownerDoc, bookDoc, borrowerDoc) {
      return Trade.findOne({ owner: ownerDoc._id, book: bookDoc._id, borrower: borrowerDoc._id })
      .then(tradeDoc => tradeDoc ? true : false);
  }

};

module.exports = TradeController;
