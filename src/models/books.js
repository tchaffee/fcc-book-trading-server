'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// TODO: Referential integrity for ownerS, which should be a User?
const Book = new Schema({
	googleId: String,
	title: String
});

module.exports = mongoose.model('Book', Book);
