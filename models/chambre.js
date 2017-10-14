var mongoose = require('mongoose');

// Chambre Schema comme dans Laravel
var chambreSchema = mongoose.Schema({
  nbChambre:  { type: String, required: true },
  address:    { type: String, required: true },
  metre:      { type: String, required: true },
  author:     { type: String, required: true }
});


var Chambre = module.exports = mongoose.model('Chambre',chambreSchema);
