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
                    stockTicker: find[i].stockTicker,
                    purchaseDate: find[i].purchaseDate,
                    purchasePrice: find[i].purchasePrice,
                    purchaseAmount: find[i].purchaseAmount,
                    exchange: find[i].exchange
                };
                stocks.push(indvStock)
            }
            var result = {
                id: id,
                stocks: stocks
            };
            res.send(JSON.parse(JSON.stringify(result)));
            //res.json(result);
        }
    });
});

router.get('/:id/:ticker', function(req, res, next) {
    var id = req.params.id;
    var ticker = req.params.ticker;
    ticker = ticker.toUpperCase();
    //console.log(req.app.models);

    req.app.models.stocks.findByStockTicker(ticker).exec(function (err, find){
        if (err) {
            res.status(500).json({error: 'Error when trying to find a users stocks'});
        }
        else if (!find) {
            res.status(401).json({error: "User not found"});
        }
        else {
            //found user
            var stocks = [];
            for (var i =0;i<find.length;i++){
                if (find[i].stockTicker == ticker) {
                    var indvStock = {
                        stockTicker: find[i].stockTicker,
                        purchaseDate: find[i].purchaseDate,
                        purchasePrice: find[i].purchasePrice,
                        purchaseAmount: find[i].purchaseAmount,
                        exchange: find[i].exchange
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
});

router.post('/:id/:ticker', function(req, res, next) {
    var id = req.params.id;
    var ticker = req.params.ticker;
    var val = req.body.purchasePrice;
    var purchDate = req.body.purchaseDate;
    var shareNum = req.body.purchaseAmount;
    var exchange = req.body.exchange;
    ticker = ticker.toUpperCase();
    //console.log(req.app.models);

    req.app.models.stocks.create({id: id,stockTicker: ticker, purchaseDate: purchDate, purchasePrice: val, purchaseAmount: shareNum, exchange: exchange}).exec(function (err, find){
        if (err) {
            res.status(500).json({error: 'Error when trying to create a users stocks'});
        }
        else if (!find) {
            res.status(401).json({error: "Param not found"});
        }
        else {
            //found user
            var result = {
                id: id,
                stockTicker: ticker,
                purchaseDate: purchDate,
                purchasePrice: val,
                purchaseAmount: shareNum,
                exchange: exchange
            };
            res.json(result);
        }
    });
});

module.exports = router;