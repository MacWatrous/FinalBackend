var express = require('express');
var router = express.Router();
var app = require('../app');
var models = require('../models');
var YQL = require('yql');
//app.models = models.collections;
//app.connections = models.connections;

/* query yahoo for big stock table. */
router.post('/', function(req, res, next) {
    var stockTable = req.body.stocks;
    result = [];
    var stockTicker = [];
    var shareP = [];
    var shareN = [];
    var startVal = [];
    var asks = [];
    var dividends =[];
    var pes = [];
    for (var i =0;i<stockTable.length;i++){
        //handle having multiple entries for same stock..?
        stockTicker.push(stockTable[i].stockTicker);
        shareP.push(stockTable[i].purchasePrice);
        shareN.push(stockTable[i].purchaseAmount);
        startVal.push(shareN * shareP);

    }
    var yqlText = 'select * from yahoo.finance.quote where symbol in (\"';
    for (var i = 0;i<stockTicker.length;i++){
        yqlText += stockTicker[i] + '\"';
    }
    yqlText += ')';
    var query = new YQL(yqlText);
    query.exec(function (error, response) {
        response = response.query.results.quotes;
        for (var i =0;i<response.length;i++){
            //handle having multiple entries for same stock..?
            asks.push(response[i].Bid);
            if (response[i].DividendYield == null){
                dividends.push(0);
            }
            else
                dividends.push(response[i].DividendYield)
            if (response[i].PERatio == null){
                pes.push('no data');
            }
            else
                pes.push(response[i].PERatio)
        }
        res.json(asks);
    });

});

/* query yahoo for specific stock enhanced info */
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
            var result = {
                id: id,
                username: find.username,
                cash: find.cash
            };
            res.json(result);
        }
    });
    //res.send(id);
    //next();
});

module.exports = router;