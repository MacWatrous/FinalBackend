var express = require('express');
var router = express.Router();
var app = require('../app');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/:id', function(req, res, next) {
    var id = req.params.id;
    console.log(id);
    app.models.user.findOne({id:id}).exec(function (err, find){
        if (err) {
            res.status(500).json({error: 'Error when trying to find user.'});
        }
        if (!find) {
            res.status(401).json({error: "User does not exist"});
        }
        //found user
        return res.json(find.cash);
    });
    res.send(id);
    next();
});

module.exports = router;
