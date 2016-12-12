var express = require('express');
var router = express.Router();
var app = require('../app');
var models = require('../models');
var YQL = require('yql');
var googleFinance = require('google-finance');
//app.models = models.collections;
//app.connections = models.connections;

/* query yahoo for big stock table. */
router.post('/', function(req, res, next) {
    var stockTable = req.body.stocks;
    var stockTicker = [];
    var shareP = [];
    var shareN = [];
    var startVal = [];
    var asks = [];
    var dividends =[];
    var pes = [];
    var names =[];
    var stockArray = [];
    for (var i =0;i<stockTable.length;i++){
        //handle having multiple entries for same stock..?
        stockTicker.push(stockTable[i].stockTicker);
        shareP.push(stockTable[i].purchasePrice);
        shareN.push(stockTable[i].purchaseAmount);
        startVal.push(shareN[i] * shareP[i]);
    }
    //Getting value of shares when purchased
    for (var i =0;i<stockTable.length;i++){
        for (var j=i+1;j<stockTable.length;j++){
            if (stockTicker[i] == stockTicker[j]){
                shareN[i] += shareN[j];
                startVal[i] += startVal[j];
            }
        }
    }

    var cumulativeArray =[];
    var tracker = [];
    for (var i =0;i<stockTable.length;i++){
        if (!(cumulativeArray.indexOf(stockTicker[i])>-1)){
            cumulativeArray.push(stockTicker[i]);
            tracker.push(i);
        }
    }
    var yqlText = 'env \'store://datatables.org/alltableswithkeys\'; select * from yahoo.finance.quotes where symbol in (\"';
    for (var i = 0;i<stockTicker.length;i++){
        if (i>0){
            yqlText+=',\"';
        }
        yqlText += stockTicker[i] + '\"';
    }
    yqlText += ')';
    var query = new YQL(yqlText);
    query.exec(function (error, response) {
        response = response.query.results.quote;
        for (var i =0;i<response.length;i++){
            //handle having multiple entries for same stock..?
            asks.push(response[i].Bid);
            names.push(response[i].Name);
            if (response[i].DividendYield == null){
                dividends.push(0);
            }
            else
                dividends.push(response[i].DividendYield)
            if (response[i].PERatio == null){
                pes.push('no data');
            }
            else
                pes.push(response[i].PERatio);

            var stock = {
                stockTicker: cumulativeArray[i],
                company: names[i],
                price: asks[i],
                shares: shareN[tracker[i]],
                positionVal: shareN[tracker[i]]*asks[i],
                returnDol: shareN[tracker[i]]*asks[i]-startVal[tracker[i]],
                returnPercent: shareN[tracker[i]]*asks[i]/startVal[tracker[i]],
                dividendYield: dividends[i],
                beta: "",
                peratio: pes[i],
                sector: "",
                industry: ""
            };
            stockArray.push(stock);
        }
        res.json(stockArray);
    });
});

/* query yahoo for specific stock enhanced info */
router.get('/:ticker', function(req, res, next) {
    var stockTicker = req.params.ticker;
    stockTicker = stockTicker.toUpperCase();
    var yqlText = 'select * from yahoo.finance.quotes where symbol in (\"'+ stockTicker + '\")';
    var query = new YQL(yqlText);
    query.exec(function (error, response) {
        //console.log(response.query.results.quote);
        response = response.query.results.quote;
        var dividends = 0;
        var exchange ='';
        if (response.DividendYield != null){
            dividends = response.DividendYield;
        }
        var pes = 'no data';
        if (response.PERatio != null){
            pes = response.PERatio;
        }
        if (response.StockExchange == 'NMS'){
            exchange = 'NASDAQ';
        }
        else
            exchange = 'NYSE';
        var stock = {
            stockTicker: stockTicker,
            company: response.Name,
            price: response.Bid,
            dividendYield: dividends,
            beta: "",
            peratio: pes,
            sector: "",
            industry: "",
            exchange: exchange,
            daysRange: response.DaysRange
        };
        var today = new Date();
        var lastYear = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        var lessYear = yyyy-1;

        if(dd<10) {
            dd='0'+dd
        }

        if(mm<10) {
            mm='0'+mm
        }
        today = yyyy+'-'+ mm +'-'+dd;
        lastYear = lessYear+'-'+ mm +'-'+dd;
        var yqlText2 = 'select * from yahoo.finance.historicaldata where symbol = \"'+ stockTicker + '\" and startDate = \"' + lastYear + '\" and endDate = \"' + today + '\"';
        var query2 = new YQL(yqlText2);
        query2.exec(function (error, response) {
            console.log(response);
            response = response.query.results.quote;
            var historical = [];
            for (var i =0;i<response.length;i++){
                historical.push(response[i].Close);
            }
            historical.push
            stock.historical = historical;
            res.json(stock);
        });
    });
});

//Get our stocks news Tickers
router.put('/', function(req, res, next) {
    var stockTable = req.body.stocks;
    var stockTicker = [];

    for (var i =0;i<stockTable.length;i++){
        //handle having multiple entries for same stock..?

        stockTicker.push(stockTable[i].exchange + ':' + stockTable[i].stockTicker);
    }
    var cumulativeArray =[];
    var tracker = [];
    for (var i =0;i<stockTable.length;i++){
        if (!(cumulativeArray.indexOf(stockTicker[i])>-1)){
            cumulativeArray.push(stockTicker[i]);
            tracker.push(i);
        }
    }
    googleFinance.companyNews({
        symbols: cumulativeArray
    }, function(err, news){
        if (err) {throw err;}
        var story = [];
        var date = [];
        for (var i = 0; i<cumulativeArray.length;i++){
            story.push(news[cumulativeArray[i]][0].title);
            date.push(news[cumulativeArray[i]][0].date);
        }
        var result = {
            stories: story,
            dates: date
        };
        res.json(result);
    });
});


module.exports = router;