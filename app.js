var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var mysql      = require('mysql');
var dbURL = process.env.CLEARDB_DATABASE_URL;
var connection = mysql.createConnection({
    host     : dbURL,
    user     : 'b2f823031ac8aa',
    password : '7231b3d0',
    database : 'heroku_3841ee16ff9e842'
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/users/:id', specificUser);
app.use('/notes', notes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

app.get('/notes', function(req, res) {
	res.json({notes: "This is your notebook. Edit this to start saving your notes!"})
});
app.get('/users/:id', function (req, res, next) {
    var id = req.params.id;
    connection.connect();
    connection.query('SHOW VARIABLES LIKE "%version%";', function(err,rows,fields){
        console.log(rows[0]);
    });
    connection.end();
});
