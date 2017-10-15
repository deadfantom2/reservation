var express = require('express');
var router = express.Router();

// Declaration des Modeles
var Reservation = require('../models/reservation');  //Categorie
var User = require('../models/user');        //User



// Routes basic reservations
router.get('/', ensureAuthenticated,  function(req,resp){
    Reservation.find({}, function(err, reservations){
        if(err){
            console.log(err);
        }else{
            resp.render('./reservation/reservations',{title:'Reservations', reservations:reservations});
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
  req.checkBody('etage','Etage is required').notEmpty();
  req.checkBody('type','Type is required').notEmpty();
  req.checkBody('nbRoom','Nombre Room is required').notEmpty();
  req.checkBody('dateReservation','Date réservation is required').notEmpty();

  //Get errors
  var errors = req.validationErrors();
  if(errors){
    resp.render('./reservation/add_reservation',{title:'Add Reservation',errors:errors})
  }else{
      var reservation = new Reservation();
          reservation.etage = req.body.etage;
          reservation.type = req.body.type;
          reservation.nbRoom = req.body.nbRoom;
          reservation.dateReservation = req.body.dateReservation;
          reservation.userId = req.user._id;
          reservation.save();


          req.flash('success','Reservation Added');
          resp.redirect('/reservations');
  }
});


/*------------------------------------------------------Read----------------------------------------------------------*/
// Method GET  Read
router.get('/:id', ensureAuthenticated,  function(req,resp){
    Reservation.findById(req.params.id, function(err, reservation){
      resp.render('./reservation/reservation',{reservation:reservation});
  });
});


/*---------------------------------------------------Update-----------------------------------------------------------*/
// Method GET  Edit
router.get('/edit/:id', ensureAuthenticated, function(req,resp){
    Reservation.findById(req.params.id, function(err, reservation){
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
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash('danger', 'Please login');
        resp.redirect('/users/login');
    }
}


module.exports = router;
