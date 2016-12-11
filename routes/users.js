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
    //console.log(req.app.models);
    req.app.models.user.findOneById(id).exec(function (err, find){
        if (err) {
            res.status(500).json({error: 'Error when trying to find user.'});
        }
        else if (!find) {
            res.status(401).json({error: "User does not exist"});
        }
        else {
            //found user
            res.json(result);
        }
    });
});

router.post('/:id', function(req, res, next) {
    var id = req.params.id;
    var body = req.body.cash;
    //console.log(req.app.models);
    req.app.models.user.update({id: id},{cash: body}).exec(function (err, find){
        if (err) {
            res.status(500).json({error: 'Error when trying to find user.'});
        }
        else if (!find) {
            res.status(401).json({error: "User does not exist"});
        }
        else {
            var result = {
                id: find.id,
                username: find.username,
                cash: find.cash
            };
            res.json(result);
        }
    });
});

module.exports = router;