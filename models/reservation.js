var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

// Reservation Schema
var reservationSchema = mongoose.Schema({
  etage:             { type: String, required: true },
  type:              { type: String, required: true },
  nbRoom:            { type: String, required: true },
  dateReservation:   { type: String, required: true },
  userId:            { type: String, required: true }
});


var Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
