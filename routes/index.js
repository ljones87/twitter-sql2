'use strict';
var express = require('express');
var client = require('../db')
var router = express.Router();
//var tweetBank = require(../tweetBank.js)

module.exports = function makeRouterWithSockets (io) {

  // a reusable function
  function respondWithAllTweets (req, res, next){
    client.query('SELECT * FROM tweets JOIN users ON users.id = tweets.user_id', function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });

  }

  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next){
    client.query('SELECT * FROM tweets JOIN users ON users.id = tweets.user_id WHERE users.name = $1', [req.params.username], function (err, result){
      if (err) return next(err);
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true })
    });
  });

  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
    client.query('SELECT * FROM tweets JOIN users ON users.id = tweets.user_id WHERE tweets.id = $1', [req.params.id], function (err, result){
      if (err) return next(err);
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true })
    });
  });

  // create a new tweet
  router.post('/tweets', function(req, res, next){
    client.query('INSERT INTO users (name, picture_url) VALUES ($1, $2)', [req.body.name, null],
     function (err, result){
      if (err) return next(err);
      client.query('SELECT * FROM users WHERE users.name = $1', [req.body.name],
       function (err, result){
         if (err) return next(err);
         const user = result.rows[0];
         client.query('INSERT INTO tweets (user_id, content) VALUES ($1, $2)', [user.id, req.body.content],
           function (err, result){
            if (err) return next(err);
              res.redirect();
          });
        });
     });

    // var newTweet = tweetBank.add(req.body.name, req.body.content);
    // io.sockets.emit('new_tweet', newTweet);
    // res.redirect('/');
  });

  return router;

}
