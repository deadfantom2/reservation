var express             = require('express');
var socket              = require('socket.io');
var path                = require('path');
var bodyParser          = require('body-parser');
var expressValidator    = require('express-validator');
var flash               = require('connect-flash');
var session             = require('express-session');
var passport            = require('passport');
var config              = require('./config/database');
var mongoose            = require('mongoose');
    mongoose.connect(config.database);
    var db              = mongoose.connection;
var MongoStore = require('connect-mongo')(session);

// Init App
var app = express();

// Declaration Models
var Reservation = require('./models/reservation');
var User = require('./models/user');

// Pour charger toutes les 'vues.pug' dans le dossier 'views'
app.set('views',path.join(__dirname, 'views'));
app.set('view engine','pug');
app.use(express.static(path.join(__dirname, 'public'))); // Declaration du dossier public

app.use(bodyParser.json()); // Parseir applciation/json
app.use(bodyParser.urlencoded({extended: false})); // Pour parser dans la BD




// Express Session Middleware
// secret=save my session/ resave=session will be save in server if true, if false is not save in server/saveUninitialized=
app.use(session({  //parametrage session
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 15*60*1000 } //15minutes*60sec*1000ms
}));



// Express  Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.'),
          root    = namespace.shift(),
          formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return { param : formParam, msg   : msg, value : value };
  }
}));

// Passport config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());


// tous les routes avec auth session
app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  res.locals.session = req.session;
  next();
});


/*----------------------------------------------------------------------------*/
// Home Route Shows Ever Articles
app.get('/', function(req,resp){
    Reservation.find({}, function(err, reservations){
        User.find({}, function (err, users) {
            if(err){
                console.log(err);
            }else{
                resp.render('index',{title:'Listes des réservations', reservations:reservations, users:users});
            }
        });
    });
});


/*----------------------------------------------------------------------------*/


/*------------Declaration Routes Avec Path definit une fois-------------------*/
app.use('/users', require('./routes/users'));
app.use('/reservations', require('./routes/reservation'));






/*----------------------------------------------------------------------------*/
// Start Server
var server = app.listen(3000, function(){
  console.log('Server started on port 3000');
});

// socket setup
var io =  socket(server); // setup on notre serveur 3000

io.on('connection', function (socket) {
    //listen chat message
    socket.on('chat', function (data) {
        io.sockets.emit('chat', data);
    });
    socket.on('typing', function (data) {
        socket.broadcast.emit('typing', data);
    });

}); //connection from browser