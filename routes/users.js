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

const mockToken =
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ikx1Y2FzIEdhcmNleiIsImlhdCI6MTUxNjIzOTAyMn0.oK5FZPULfF-nfZmiumDGiufxf10Fe2KiGe9G5Njoa64';

router.post('/verify', function (req, res, next) {
  poolConnection.getDb().collection(process.env.MONGOUSERCOLLECTION)
    .findOne({
      "userEmail": req.body.userEmail
    }).then((user) => {

      if (!user) {
        res.status(404).send("No User Found");
      } else {
        bcrypt.compare(req.body.password, user.password, (err, results) => {
          if (results) {
            // send some info back to the app
            res.status(200).send({ firstName: user.firstName,
              lastName: user.lastName,
              userEmail: user.userEmail,
              token: mockToken});
          } else {
            res.status(401).send("Password Incorrect");
          }
        })
      }
    })
    // .catch(err => {
    //   res.status(404).send("No User Found");
    // })
});

router.post('/create', function (req, res, next) {
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
          res.status(409).send("Account already exists with that email.");
        } else {
          // otherwise, create a new user account
          poolConnection.getDb().collection(process.env.MONGOUSERCOLLECTION)
            .insertOne(userProfile, (err, result) => {
              if (err) {
                res.status(400).send("Error during user creation.");
              } else {
                // res.status(201).send("Accounted created successfully!");
                res.status(201).send({ firstName: userProfile.firstName,
                  lastName: userProfile.lastName,
                  userEmail: userProfile.userEmail,
                  token: mockToken});
              }
            }) // end insertOne()
        } // end else statement
      }) // end then
  }) // end hash()
}); // end router.post()


module.exports = router;