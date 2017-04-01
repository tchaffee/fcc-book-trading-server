'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const Book = require('./books');

const Trade = new Schema({
	owner: { type: mongoose.Schema.ObjectId, ref : 'User', required: true },
	borrower: { type: mongoose.Schema.ObjectId, ref : 'User', required: true},
	book: { type: mongoose.Schema.ObjectId, ref : 'Book', required: true},
	approved: { type: Boolean, default: false }
});

module.exports = mongoose.model('Trade', Trade);
