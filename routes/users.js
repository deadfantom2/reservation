var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var passport = require('passport');
var nodemailer  = require('nodemailer');

// Declaration Modele User
var User = require('../models/user');

// Register form GET
router.get('/register',function(req, resp){
  resp.render('register');
});
// Register form POST
router.post('/register', function(req, res){
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  var sender = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: 'ynovnanterne@gmail.com',
          pass: 'ynov_nanterne'
      }
  });
  var mailoption = {
      from: 'ynovnanterne@gmail.com',
      to: req.body.email,
      subject: 'Votre inscription ' + req.body.name,
      text: 'Merci pour votre inscription',
      html: '<p>Vos données :</p><br>' + '<ul><li>Name: '+req.body.name+'</li><li>Email: '+req.body.email+'</li><li>Username: '+req.body.username+'</li></ul>'
  };
  sender.sendMail(mailoption, function (error, info) {
      if(error){
          console.log(error);
      } else
          console.log('mail send:');
  });


  var errors = req.validationErrors();
  if(errors){
    res.render('register', {errors:errors});
  }else{
    var newUser = new User({
      name:name,
      email:email,
      username:username,
      password:password
    });

    bcrypt.genSalt(10, function(errors, salt){
      bcrypt.hash(newUser.password, salt, function(errors, hash){
        if(errors){
          console.log(errors);
        }
        newUser.password = hash;
        newUser.save(function(errors){
          if(errors){
          } else {
            req.flash('success','You are now registered and can log in');
            res.redirect('/users/login');
          }
        });
      });
    });
  }
});


// Login form GET
router.get('/login',function(req, resp){
  resp.render('login');
});

// Login form POST
router.post('/login',function(req, resp, next){
  passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/users/login',
    failureFlash: true
  })(req, resp, next);
});

// Logout form GET
router.get('/logout',function(req, resp){
  req.logout();
  req.flash('success','You are logged out');
  resp.redirect('/users/login');
});

module.exports = router;
