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

    req.app.models.stocks.findById(id).exec(function (err, find){
        if (err) {
            res.status(500).json({error: 'Error when trying to find a users stocks'});
        }
        else if (!find) {
            res.status(401).json({error: "User has no stocks"});
        }
        else {
            //found user
            var stocks = [];
            for (var i =0;i<find.length;i++){
                var indvStock = {
                    ticker: find[i].stockTicker,
                    purchaseDate: find[i].purchaseDate,
                    sharePrice: find[i].purchasePrice,
                    shares: find[i].purchaseAmount
                };
                stocks.push(indvStock)
            }
            var result = {
                id: id,
                stocks: stocks
            };
            res.json(result);
        }
    });
    //res.send(id);
    //next();
});

router.get('/:id/:ticker', function(req, res, next) {
    var id = req.params.id;
    var ticker = req.params.ticker;
    //console.log(req.app.models);

    req.app.models.stocks.findById(id).exec(function (err, find){
        if (err) {
            res.status(500).json({error: 'Error when trying to find a users stocks'});
        }
        else if (!find) {
            res.status(401).json({error: "User has no stocks"});
        }
        else {
            //found user
            var stocks = [];
            for (var i =0;i<find.length;i++){
                if (find[i].stockTicker == ticker) {
                    var indvStock = {
                        ticker: find[i].stockTicker,
                        purchaseDate: find[i].purchaseDate,
                        sharePrice: find[i].purchasePrice,
                        shares: find[i].purchaseAmount
                    };
                    stocks.push(indvStock);
                }
            }

            var result = {
                id: id,
                stocks: stocks
            };
            res.json(result);
        }
    });
    //res.send(id);
    //next();
});

module.exports = router;