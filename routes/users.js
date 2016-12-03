var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var dbURL = process.env.CLEARDB_DATABASE_URL;
var connection = mysql.createConnection({
    host     : dbURL,
    user     : 'b2f823031ac8aa',
    password : '7231b3d0',
    database : 'heroku_3841ee16ff9e842'
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/:id', function(req, res, next) {
    var id = req.params.id;
    connection.connect();
    connection.query('SHOW VARIABLES LIKE "%version%";', function(err,rows,fields){
        console.log(dbURL);
        console.log(id);
    });
    connection.end();
    res.send(id + " : " + dbURL);
    next();
});

module.exports = router;
