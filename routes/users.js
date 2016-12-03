var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : 'us-cdbr-iron-east-04.cleardb.net',
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
    });
    console.log(id);
    console.log(rows[1].Variable_name);
    connection.end();
    res.send(id);
    next();
});

module.exports = router;
