var express = require('express');
var nodemailer  = require('nodemailer');
var router = express.Router();

// Models
var Reservation = require('../models/reservation');  //Categorie
var User        = require('../models/user');        //User



// Route basic de toutes mes reservations
router.get('/', ensureAuthenticated,  function(req,resp){  // ensureAuthenticated, si connecter ou pas
    Reservation.find({}, function(err, reservations){       // trouver totues mes reservations
        if(err){
            console.log(err);
        }else{
            // envoit dans la vue les reservations
            resp.render('./reservation/reservations',{title:'Liste de mes réservations : ', reservations:reservations});
        }
    });
});



/*----------------------------------------------------Create----------------------------------------------------------*/
// Method GET  Create
router.get('/add', ensureAuthenticated, function(req,resp){
      resp.render('./reservation/add_reservation',{title:'Add Reservation'});
});
// Method POST  Create
router.post('/add', ensureAuthenticated,  function(req,resp){
  // Si required n'est pas respecter afficher les messages
  req.checkBody('etage','Etage is required').notEmpty();
  req.checkBody('type','Type is required').notEmpty();
  req.checkBody('nbRoom','Nombre Room is required').notEmpty();
  req.checkBody('dateReservation','Date réservation is required').notEmpty();

  //Get errors
  var errors = req.validationErrors();
  if(errors){
    resp.render('./reservation/add_reservation',{title:'Add Reservation',errors:errors})
  }else{
      //création nouveau reservation
      var reservation = new Reservation();
          reservation.etage = req.body.etage;
          reservation.type = req.body.type;
          reservation.nbRoom = req.body.nbRoom;
          reservation.dateReservation = req.body.dateReservation;
          reservation.userId = req.user._id;
          reservation.save();

          req.flash('success','Reservation Added');  // message success
          resp.redirect('/reservations');            // rederictions vers /reservations
  }
});


/*------------------------------------------------------Read----------------------------------------------------------*/
// Method GET  Read
router.get('/:id', ensureAuthenticated,  function(req,resp){
    //Trouver une reservations selon   son id
    Reservation.findById(req.params.id, function(err, reservation){
      resp.render('./reservation/reservation',{reservation:reservation});
  });
});


/*---------------------------------------------------Update-----------------------------------------------------------*/
// Method GET  Edit
router.get('/edit/:id', ensureAuthenticated, function(req,resp){
    Reservation.findById(req.params.id, function(err, reservation){
        // pour securiser les routes des autres utilsiateurs
        if(reservation.userId != req.user._id){
            req.flash('danger', 'Not Authorized');
            resp.redirect('/');
        }
        resp.render('./reservation/edit_reservation', {title:'Edit Reservation', reservation:reservation});
    });
});
// Method POST  Edit
router.post('/edit/:id', ensureAuthenticated, function(req,resp){
    var reservation = {};
        reservation.etage = req.body.etage;
        reservation.type = req.body.type;
        reservation.nbRoom = req.body.nbRoom;
        reservation.dateReservation = req.body.dateReservation;
        reservation.userId = req.body.userId;

        var query = {_id:req.params.id}

    if(reservation.userId != req.user._id){
        req.flash('danger', 'Not Authorized');
        resp.redirect('/');
    }else
    Reservation.update(query, reservation, function(err){
        if(err){
            console.log(err);
        }else{
            req.flash('success','Reservation Updated');
            resp.redirect('/reservations');
        }
    });
});



/*----------------------------------------------------------Delete----------------------------------------------------*/
// Method DELETE  avec main.js ajax
router.delete('/:id', ensureAuthenticated, function(req,resp){
    if(!req.user._id){
        resp.status(500).send();
    }
    var query = {_id:req.params.id};
    Reservation.findById(req.params.id, function(err, reservation){
        if(reservation.userId != req.user._id){
            resp.status(500).send();
        }else{
            Reservation.remove(query, function(err){
                if(err){
                    console.log(err);
                }else{
                    resp.send('Success');
                }
            });
        }
    });
});


/*-----------------------------------------------Access control-------------------------------------------------------*/
function ensureAuthenticated(req, resp, next){
    //si on est connecter
    if(req.isAuthenticated()){
        return next();
    }else{
        //si non rederiction vers la page login
        req.flash('danger', 'Veuillez vous connecter');
        resp.redirect('/users/login');
    }
}


module.exports = router;
