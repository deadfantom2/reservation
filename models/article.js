var mongoose = require('mongoose');

// Article Schema comme dans Laravel
var articleSchema = mongoose.Schema({
  title:{ type: String, required: true },
  author:{ type: String, required: true },
  body:{ type: String, required: true }
});


var Article = module.exports = mongoose.model('Article',articleSchema);
