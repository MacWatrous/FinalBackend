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
    //console.log(req.app.models);
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
    //res.send(id);
    //next();
});

router.post('/:username', function(req, res, next) {
    var username = req.params.username;
    var cash = req.body.cash;
    //console.log(req.app.models);
    req.app.models.user.create({username: username, cash: cash}).exec(function (err, newUser){
        if (err) {
            res.status(500).json(err);
        }
        else {
            res.json(newUser);
        }
    });
    //res.send(id);
    //next();
});


module.exports = router;