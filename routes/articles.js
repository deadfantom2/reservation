var express = require('express');
var router = express.Router();

// Declaration des Modeles
var Article = require('../models/article');  //Article
var User = require('../models/user');        //User


/*-----------------------------Create-----------------------------------------*/
// Method GET  Create
router.get('/add', ensureAuthenticated, function(req,resp){
  resp.render('add_article',{title:'Add Article'});
});
// Method POST  Create
router.post('/add', function(req,resp){
  req.checkBody('title','Title is required').notEmpty();
  req.checkBody('body','Body is required').notEmpty();
  //Get errors
    var errors = req.validationErrors();
  if(errors){
    resp.render('add_article',{title:'Add Article',errors:errors})
  }else{
      var article = new Article();
          article.title = req.body.title;
          article.author = req.user._id;
          article.body = req.body.body;

          article.save();
          req.flash('success','Article Added');
          resp.redirect('/');
  }
});
/*----------------------------------------------------------------------------*/


/*-----------------------------Read-------------------------------------------*/
// Method GET  Read
router.get('/:id', ensureAuthenticated, function(req,resp){
  Article.findById(req.params.id, function(err, article){
    User.findById(article.author, function(err, user){
      resp.render('article',{article:article, author: user.name});
    });
  });
});
/*----------------------------------------------------------------------------*/


/*-----------------------------Update-----------------------------------------*/
// Method GET  Edit
router.get('/edit/:id', ensureAuthenticated, function(req,resp){
  Article.findById(req.params.id, function(err, article){
    if(article.author != req.user._id){
      req.flash('danger', 'Not Authorized');
      resp.redirect('/');
    }
    resp.render('edit_article', {title:'Edit Article', article:article});
  });
});
// Method POST  Edit
router.post('/edit/:id', ensureAuthenticated, function(req,resp){
    var article = {};
        article.title = req.body.title;
        article.author = req.body.author;
        article.body = req.body.body;
    var query = {_id:req.params.id}

  Article.update(query, article, function(err){
    if(err){
      console.log(err);
    }else{
      req.flash('success','Article Updated');
      resp.redirect('/');
    }
  });
});
/*----------------------------------------------------------------------------*/


/*-----------------------------Delete-----------------------------------------*/
// Method DELETE  Delete
router.delete('/:id', ensureAuthenticated, function(req,resp){
  if(!req.user._id){
    resp.status(500).send();
  }
  var query = {_id:req.params.id};
  Article.findById(req.params.id, function(err, article){
    if(article.author != req.user._id){
      resp.status(500).send();
    }else{
      Article.remove(query, function(err){
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


//      /articles/add
//      /articles/59de7271b02bbc31cc2568e5
//      /articles/edit/59de7271b02bbc31cc2568e5
//



