// server.js
require('dotenv').config();

const path       = process.cwd();
const express    = require('express');
const app        = express();
const port       = process.env.PORT || 8080;
const mongoose   = require('mongoose');
const jwt        = require('express-jwt');
const bodyParser = require('body-parser');

const BookController = require(path + '/src/controllers/bookController.js');
const bookController = new BookController();

const TradeController = require(path + '/src/controllers/tradeController.js');
const tradeController = new TradeController();


mongoose.connect(process.env.MONGO_URI);
mongoose.Promise = global.Promise;

const authenticate = jwt({
  secret: process.env.AUTH0_SECRET,
  audience: process.env.AUTH0_CLIENT_ID
});

// ROUTES
// ==============================================

// get an instance of router
var router = express.Router();

// Body parser must come before setting up routes or POST will not work.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Books list.
router.get('/api/books', authenticate, function(req, res) {

  if ( ! req.user ) {
    res.json({ error: 'User is not authenticated.' });
  } else {
    bookController.getAllBooks(req.user.sub)
    .then(result => res.json({ books: result }))
    .catch(reason => res.status(500).json({ error: reason }));
  }
});

// My Books list.
router.get('/api/users/me/books', authenticate, function(req, res) {

  if ( ! req.user ) {
    res.json( { error: 'User is not authenticated.' } );
  } else {
    bookController.getMyBooks(req.user)
    .then(books => {
      res.json({ books: books });
    })
    .catch(reason => res.status(500).json({ error: reason }));
  }
});

router.post('/api/users/me/books', authenticate, function(req, res) {

  console.log('Got a POST request to /api/users/me/books');

  if ( ! req.user ) {
    res.json({ error: 'User is not authenticated.' } );
  } else {
    const bodyJSON = req.body;
    console.log(req.user);
    
    bookController.addMyBook(req.user, bodyJSON.googleId, bodyJSON.title)
    .then(() => { res.sendStatus(200)});
  }
});

router.delete('/api/users/me/books', authenticate, function(req, res) {

  console.log('Got a DELETE request to /api/users/me/books');

  if ( ! req.user ) {
    res.json({ error: 'User is not authenticated.' } );
  } else {
    const bodyJSON = req.body;
    console.log(req.user);
    
    bookController.deleteMyBook(req.user, bodyJSON.googleId)
    .then(() => { res.sendStatus(200)});
  }
});

router.post('/api/users/me/traderequests', authenticate, function(req, res) {

  console.log('Got a POST request to /api/users/me/traderequests');

  if ( ! req.user ) {
    res.json({ error: 'User is not authenticated.' } );
  } else {
    const bodyJSON = req.body;
    
    tradeController.addTrade(bodyJSON.owner, bodyJSON.googleId, req.user.sub)
    .then(() => { res.sendStatus(200)});
  }
});

// apply the routes to our application
app.use('/', router);

// Catch auth errors.
app.use(function(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: err });
  } else {
    // continue doing what we were doing and go to the route
    next();
  }
});

// START THE SERVER
// ==============================================
app.listen(port);
console.log('Magic happens on port ' + port);
