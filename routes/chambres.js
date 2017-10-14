var express = require('express');
var router = express.Router();

// Declaration des Modeles
var Chambre = require('../models/chambre');  //Categorie
var User = require('../models/user');        //User


/*-----------------------------Create-----------------------------------------*/
// Method GET  Create
router.get('/add', ensureAuthenticated, function(req,resp){
    Chambre.find(function(err, chambres){
      resp.render('./chambre/add_chambre',{title:'Add Chambre'});
  });
});

// Method POST  Create
router.post('/add', function(req,resp){
  req.checkBody('nbChambre','Title is required').notEmpty();
  req.checkBody('address','Body is required').notEmpty();
  req.checkBody('metre','Body is required').notEmpty();

  //Get errors
  var errors = req.validationErrors();
  if(errors){
    resp.render('./chambre/add_chambre',{title:'Add Chambre',errors:errors})
  }else{
      var chambre = new Chambre();
          chambre.nbChambre = req.body.nbChambre;
          chambre.address = req.body.address;
          chambre.metre = req.body.metre;
          chambre.author = req.user._id;

          chambre.save();
          req.flash('success','Chambre Added');
          resp.redirect('/chambres');
  }
});
/*----------------------------------------------------------------------------*/


/*-----------------------------Read-------------------------------------------*/
// Method GET  Read
router.get('/:id', function(req,resp){
  Chambre.findById(req.params.id, function(err, chambre){
      resp.render('./chambre/chambre',{chambre:chambre});
  });
});
/*----------------------------------------------------------------------------*/


/*-----------------------------Update-----------------------------------------*/
// Method GET  Edit
router.get('/edit/:id', ensureAuthenticated, function(req,resp){
  Chambre.findById(req.params.id, function(err, chambre){
    if(chambre.author != req.user._id){
      req.flash('danger', 'Not Authorized');
      resp.redirect('/');
    }
    resp.render('./chambre/edit_chambre', {title:'Edit Chambre', chambre:chambre});
  });
});
// Method POST  Edit
router.post('/edit/:id', function(req,resp){
    var chambre = {};
        chambre.nbChambre = req.body.nbChambre;
        chambre.address = req.body.address;
        chambre.metre = req.body.metre;
        chambre.author = req.user._id;
    var query = {_id:req.params.id}

  Chambre.update(query, chambre, function(err){
    if(err){
      console.log(err);
    }else{
      req.flash('success','Chambre Updated');
      resp.redirect('/');
    }
  });
});

/*----------------------------------------------------------------------------*/


/*-----------------------------Delete-----------------------------------------*/
// Method DELETE  Delete
router.delete('/:id', function(req,resp){
  if(!req.user._id){
    resp.status(500).send();
  }
  var query = {_id:req.params.id};
  Chambre.findById(req.params.id, function(err, chambre){
    if(chambre.author != req.user._id){
      resp.status(500).send();
    }else{
        Chambre.remove(query, function(err){
        if(err){
          console.log(err);
        }else{
          resp.send('Success');
        }
      });
    }
  });
});

/*----------------------------------------------------------------------------*/
// Access control
function ensureAuthenticated(req, resp, next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash('danger', 'Please login');
        resp.redirect('/users/login');
    }
}


module.exports = router;
