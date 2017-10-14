var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var passport = require('passport');
var nodemailer  = require('nodemailer');

// Declaration Model User
var User = require('../models/user');


/* ***********************************************Profile************************************************************ */
// Profile GET
router.get('/profile/:id', ensureAuthenticated, function(req, res){
    // retrouver user selon son id dans profile
    User.findOne({_id: req.params.id}).then(function (user) {
      res.render('profile', {title:'Profile', user:user});
    });
});
// Profile POST
router.post('/profile/:id', ensureAuthenticated, function (req, res) {  // : change id item
    User.findByIdAndUpdate({_id: req.params.id}, req.body).then(function () {  // update user selon son id
        res.redirect('/');
    });
});



/* ***********************************************Register*********************************************************** */
// Register  GET
router.get('/register',function(req, resp){
  resp.render('register');
});
// Register  POST
router.post('/register', function(req, res){
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  //Validation systeme
  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);


  // Email config gmail service
  var sender = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: 'ynovnanterne@gmail.com',
          pass: 'ynov_nanterne'
      }
  });
  // Email message texte
  var mailoption = {
      from: 'ynovnanterne@gmail.com',
      to: req.body.email,
      subject: 'Votre inscription ' + req.body.name,
      html: 'Merci pour votre inscription <p>Vos données :</p><br>' + '<ul><li>Name: '+req.body.name+'</li><li>Email: '+req.body.email+'</li><li>Username: '+req.body.username+'</li></ul>'
  };
  // Email envoit method
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
            req.flash('success','Le compte est créé, vérifiez votre mail');
            res.redirect('/users/login');
          }
        });
      });
    });
  }
});


/* ***********************************************Login************************************************************** */
// Login  GET
router.get('/login',function(req, resp){
  resp.render('login');
});
// Login  POST
router.post('/login',function(req, resp, next){
  passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/users/login',
    failureFlash: true
  })(req, resp, next);
});
// Logout  GET
router.get('/logout',function(req, resp){
  req.logout();
  req.flash('success','Vous êtes maintenant déconnecté');
  resp.redirect('/users/login');
});


/* *********************************************Access control******************************************************* */
function ensureAuthenticated(req, resp, next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash('danger', 'Authentifiez vous !');
        resp.redirect('/users/login');
    }
}

module.exports = router;
