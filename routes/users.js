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
            console.log(user)
            res.status(200).send("User Authenticated");
            
          } else {
            res.status(401).send("Password Incorrect");
          }
        })
      }


    })

})

router.post('/create', function (req, res) {
  bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    const userProfile = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userEmail: req.body.userEmail,
      creationDate: new Date(),
      password: hash,
    };
    poolConnection.getDb()
      .collection(process.env.MONGOUSERCOLLECTION)
      .insertOne(userProfile, (err, results) => {
        if (err) {
          res.status(400).send("Error During User Creation");


        } else {
          res.status(201).send("Created User With Username " + userProfile.userEmail)
        }
      })

  })

})





module.exports = router;
