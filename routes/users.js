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
      console.log("Checking for user");
      if (user) {
        bcrypt.compare(req.body.password, user.password, (err, results) => {
          if (results) {
            // send some info back to the app
            res.status(200).send({
              firstName: user.firstName,
              lastName: user.lastName,
              userEmail: user.userEmail,
              token: mockToken
            });
          } else {
            res.status(401).send("Password incorrect");
          }
        })
      } else {
        res.status(404).send("No user found!");
      }
    })
    .catch(err => {
      res.status(500).send("Server side error.");
      // res.status(400).send("Not sure why this would happen.");
    })
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
                res.status(201).send({
                  firstName: userProfile.firstName,
                  lastName: userProfile.lastName,
                  userEmail: userProfile.userEmail,
                  token: mockToken
                });
              }
            }) // end insertOne()
        } // end else statement
      }) // end then
  }) // end hash()
}); // end router.post()

router.delete("/:account", function (req, res) {
  var db = poolConnection.getDb();
  toDelete = { "userEmail": req.params.account };
  db.collection(process.env.MONGOUSERCOLLECTION)
    .deleteOne(toDelete, (obj, err) => {
      if (err.deletedCount == 0) {
        res.status(404).send("No Users Found")
      } else {
        console.log("User " + toDelete.userEmail + " deleted.")
        res.status(200).send("User Account Deleted");
      }
    })

})

router.get("/userLocations/:userEmail", function (req, res) {
  var db = poolConnection.getDb();
  uid = req.params.userEmail;
  let toFind = { userEmail: uid }
  db.collection(process.env.USERLOCATIONCOLLECTION)
    .find(toFind).toArray()
    .then(docs => {
      if (docs.length == 0) {
        res.status(404).send("No Saved Locations for Given User")
      } else {

        toSend = docs.map(index => ({

          long: index.longitude,
          lat: index.latitude,
          creationDate: index.creationDate
        }))
        console.log(toSend)
        res.status(200).send(toSend);
      }
    }
    )
    .catch(err => {
      res.status(500).send(err)

    })

})

router.post("/password", function (req, res) {
  var db = poolConnection.getDb();
  let oldPassword = req.body.old;
  let newPassword = req.body.new;
  let userEmail = req.body.email;
  let toFind = { "userEmail": userEmail }
  db.collection(process.env.MONGOUSERCOLLECTION)
    .findOne(toFind)
    .then((user) => {
      if (user) {
        
        bcrypt.compare(oldPassword, user.password, (err, results) => {
          if (results) {
            bcrypt.hash(newPassword, saltRounds, (err, hash) => {
              db.collection(process.env.MONGOUSERCOLLECTION)
                .updateOne(toFind, { $set: { "password": hash } }, (err, docs) => {
                  res.status(200).send("Password Updated Successfully")
                
                })
            })
          }
          else { res.status(401).send("Password incorrect"); }
        })
      } else { res.status(404).send("No User Found") }
    })
    .catch(err => {
      res.status(500).send(err);
    })
})





module.exports = router;