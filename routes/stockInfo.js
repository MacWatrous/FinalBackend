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
        if (response.length == undefined){
            if (response.PERatio == null){
                pes = '-';
            }
            else
                pes = response.PERatio;
            var stock = {
                stockTicker: stockTable[0].stockTicker,
                company: response.Name,
                price: response.LastTradePriceOnly,
                shares: shareN[tracker[0]],
                positionVal: shareN[tracker[0]]*response.LastTradePriceOnly,
                returnDol: shareN[tracker[0]]*response.LastTradePriceOnly-startVal[tracker[0]],
                returnPercent: (shareN[tracker[0]]*response.LastTradePriceOnly)/startVal[tracker[0]],
                dividendYield: response.DividendYield,
                marketCap: response.MarketCapitalization,
                movAvg200 : response.TwoHundreddayMovingAverage,
                earningsShare: response.EarningsShare,
                peratio: pes
            };
            stockArray.push(stock);
            res.json(stockArray)
        }
        else {
            for (var i =0;i<response.length;i++){
                //handle having multiple entries for same stock..?
                asks.push(response[i].LastTradePriceOnly);
                names.push(response[i].Name);
                if (response[i].DividendYield == null){
                    dividends.push(0);
                }
                else
                    dividends.push(response[i].DividendYield);
                if (response[i].PERatio == null){
                    pes.push('-');
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
                    returnPercent: (shareN[tracker[i]]*asks[i])/startVal[tracker[i]],
                    dividendYield: dividends[i],
                    marketCap: response[i].MarketCapitalization,
                    movAvg200 : response[i].TwoHundreddayMovingAverage,
                    earningsShare: response[i].EarningsShare,
                    peratio: pes[i]
                };
                console.log(stock);
                stockArray.push(stock);
            }
            res.json(stockArray);
        }
    });
});

/* query yahoo for specific stock enhanced info */
router.get('/:ticker', function(req, res, next) {
    var stockTicker = req.params.ticker;
    stockTicker = stockTicker.toUpperCase();
    var yqlText = 'env \'store://datatables.org/alltableswithkeys\'; select * from yahoo.finance.quotes where symbol in (\"'+ stockTicker + '\")';
    var query = new YQL(yqlText);
    query.exec(function (error, response) {
        //console.log(response.query.results.quote);
        if (error){
            res.json('');
            return;
        }
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
            price: response.LastTradePriceOnly,
            dividendYield: dividends,
            beta: "",
            peratio: pes,
            sector: "",
            industry: "",
            exchange: exchange,
            daysRange: response.DaysRange,
            marketCap: response.marketCapitalization,
            movAvg200 : response.TwoHundreddayMovingAverage,
            weekLow52: response.YearLow,
            weekHigh52: response.YearHigh,
            priceSales: response.PriceSales,
            movAvg50: response.FiftydayMovingAverage,
            yearHighChange: response.PercebtChangeFromYearHigh,
            earningsShare: response.EarningsShare
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
            response = response.query.results.quote;
            var historical = [];
            for (var i =0;i<response.length;i++){
                historical.push({price: response[i].Close, date:response[i].Date});
            }
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
        var links = [];
        for (var i = 0; i<cumulativeArray.length;i++){
            story.push(news[cumulativeArray[i]][0].title);
            date.push(news[cumulativeArray[i]][0].date);
            links.push(news[cumulativeArray[i]][0].link);
        }
        var result = {
            stories: story,
            dates: date,
            links: links
        };
        res.json(result);
    });
});

//get historic data
router.get('/', function(req, res, next) {
    var today = new Date();
    var lastYear = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    var lessMonth = today.getMonth()+1-6;
    var lessYear = yyyy;
    if (lessMonth <1){
        if (lessMonth == 0){
            lessMonth = 12;
            lessYear = yyyy-1;
        }
        else {
            lessMonth = 12+lessMonth;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
            lessYear = yyyy-1;
        }
    }
    if(dd<10) {
        dd='0'+dd
    }

    if (lessMonth<10){
        lessMonth='0'+lessMonth;
    }
    if(mm<10) {
        mm='0'+mm
    }
    today = yyyy+'-'+ mm +'-'+dd;
    lastYear = lessYear+'-'+ lessMonth +'-'+dd;
    var yqlText = 'select * from yahoo.finance.historicaldata where symbol in (\"^GSPC\",\"^DJI\",\"^IXIC\",\"^TNX\",\"GLD\") and startDate = \"' + lastYear + '\" and endDate = \"' + today + '\"';
    var query = new YQL(yqlText);
    query.exec(function (error, response) {
        //console.log(response.query.results.quote);
        if (error){
            res.json('');
            return;
        }
        response = response.query.results.quote;
        var historicalGSPC = [];
        var historicalDJI = [];
        var historicalIXIC = [];
        var historicalTNX = [];
        var historicalGLD = [];
        for (var i =0;i<response.length;i++){
            if (response[i].Symbol == '%5eGSPC'){
                historicalGSPC.push({price: response[i].Close, date:response[i].Date});
            }
            if (response[i].Symbol == '%5eDJI'){
                historicalDJI.push({price: response[i].Close, date:response[i].Date});
            }
            if (response[i].Symbol == '%5eIXIC'){
                historicalIXIC.push({price: response[i].Close, date:response[i].Date});
            }
            if (response[i].Symbol == '%5eTNX'){
                historicalTNX.push({price: response[i].Close, date:response[i].Date});
            }
            if (response[i].Symbol == '%GLD'){
                historicalGLD.push({price: response[i].Close, date:response[i].Date});
            }
        }
        var result = {
            GSPC: historicalGSPC,
            DJI: historicalDJI,
            IXIC: historicalIXIC,
            TNX: historicalTNX,
            GLD: historicalGLD
        };
        res.json(result);
    });
});

module.exports = router;