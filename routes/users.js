require('dotenv').config()
var express = require('express');
var router = express.Router();
var poolConnection = require('../PoolConnection');
var bcrypt = require('bcrypt');

const saltRounds = 10;
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('User Page');
});


router.post('/login', function (req, res) {
  poolConnection.getDb().collection(process.env.MONGOUSERCOLLECTION)
    .findOne({
      "userEmail": req.body.userEmail
    }).then((user) => {
      if (!user) {
        res.status(404).status("No User Found");
      } else {
        bcrypt.compare(req.body.password, user.password, (err, results) => {
          if (results) {
            res.status(200).send("User Authenticated");
          } else {
            res.status(401).send("Password Incorrect");
          }
        })
      }
    })
});

router.post('/create', function (req, res) {
  bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    const userProfile = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userEmail: req.body.userEmail,
      creationDate: new Date(),
      password: hash,
    };

    // first make sure a user with that email doesn't already exist
    poolConnection.getDb().collection(process.env.MONGOUSERCOLLECTION)
      .findOne({
        "userEmail": req.body.userEmail
      }).then((user) => {
        if (user) {
          // account already exists with that user email! Return an error response
          res.status(400).status("Account already exists with that email.");
        } else {
          // otherwise, create a new user account
          poolConnection.getDb().collection(process.env.MONGOUSERCOLLECTION)
            .insertOne(userProfile, (err, results) => {
              if (err) {
                res.status(400).send("Error during user creation");
              } else {
                res.status(201).send("Created user with email " + userProfile.userEmail)
              }
            }) // end insertOne()
        } // end else statement
      }) // end then
  }) // end hash()
}); // end router.post()


module.exports = router;