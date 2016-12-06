var express = require('express');
var router = express.Router();
var app = require('../app');
var models = require('../models');

//app.models = models.collections;
//app.connections = models.connections;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/:id', function(req, res, next) {
    var id = req.params.id;
    console.log(id);
    //console.log(req.app.models);
    req.app.models.user.findOneById(id).exec(function (err, find){
        if (err) {
            res.status(500).json({error: 'Error when trying to find user.'});
            return;
        }
        if (!find) {
            res.status(401).json({error: "User does not exist"});
            return;
        }
        //found user
        res.json(find.cash);
        return;
    });
    //res.send(id);
    next();
});

module.exports = router;