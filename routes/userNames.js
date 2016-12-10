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

router.get('/:username', function(req, res, next) {
    var username = req.params.username;
    req.app.models.user.findOneByUsername(username).exec(function (err, find){
        if (err) {
            res.status(500).json({error: 'Error when trying to find user.'});
        }
        else if (!find) {
            res.status(401).json({error: "User does not exist"});
        }
        else {
            //found user
            var result = {
                    username: username,
                    userID: find.id
            };
            res.json(result);
        }
    });
});

router.post('/:username', function(req, res, next) {
    var username = req.params.username;
    var cash = req.body.cash;
    req.app.models.user.create({username: username, cash: cash}).exec(function (err, newUser){
        if (err) {
            res.status(500).json(err);
        }
        else {
            var result = {
                id: newUser.id,
                username: newUser.username,
                cash: newUser.cash
            };
            res.json(result);
        }
    });
});


module.exports = router;