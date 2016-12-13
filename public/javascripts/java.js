/*jslint browser: true*/
/*global $, jQuery, alert*/
var global_ID;
var global_cash;
var global_username;
var global_stockarray;
var searchFor;
var runCount = 0;
var stockLoop;
var mainTable;
var exchange;

$('#searchbtn').on('click', searchDialog);
function searchDialog(event) {
    event.preventDefault();
    searchFor = $('#searchinput').val();
    graphLoop(searchFor);
    overlayLoop();
    stockLoop = setInterval(overlayLoop(),5000);
    $('#overlayhider').show();
    console.log(searchFor);
}
$('#addbtn').on('click', function(e) {
    e.preventDefault();
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    if(dd<10) {
        dd='0'+dd
    }

    if(mm<10) {
        mm='0'+mm
    }
    today = yyyy+'-'+ mm +'-'+dd;
    var payload = {
        purchasePrice: $('#userprice').val(),
        purchaseDate: today,
        purchaseAmount: $('#usershares').val(),
        exchange: exchange
    };
    console.log(payload);
    $.ajax({
        method: 'POST',
        data: JSON.stringify(payload),
        dataType: 'JSON',
        contentType: 'application/json; charset=UTF-8',
        url: '/users/portfolio/'+ global_ID + '/' + searchFor
    }).done(function(response) {
        global_stockarray.stocks.push({stockTicker: response.stockTicker,
            purchaseDate: response.purchaseDate,
            purchasePrice: response.purchasePrice,
            purchaseAmount: response.purchaseAmount,
            exchange: response.exchange});
        console.log(global_stockarray);
        clearInterval(stockLoop);
        mainLoop();
        mainGraph();
        $('#overlayhider').hide();
    });
});


$('#findUser').on('click', findUser);

function findUser(event) {
    event.preventDefault();

    $("#overlay").hide(1000);

    var username = $('#username').val();


    $.ajax({
        type:'GET',
        url: '/users/names/' + username,
        dataType: 'JSON'
    }).done(function(response) {
        global_ID = response.id;
        global_cash = response.cash;
        global_username = response.username;

        $.ajax({
            type: 'GET',
            url: '/users/portfolio/' + global_ID,
            dataType: 'JSON'
        }).done(function (response2) {
            global_stockarray = response2;
            mainLoop();
            var run = setInterval(mainLoop, 10000);
            googleLoop();
            var run2 = setInterval(googleLoop, 100000)
        });
    });
}

function mainLoop() {
    $.ajax({
        method: 'POST',
        data: JSON.stringify(global_stockarray),
        dataType: 'JSON',
        contentType: 'application/json; charset=UTF-8',
        url: '/stocks'
    }).done(function(response) {
        mainTable = response;
        $('#companyname').empty();
        $('#price').empty();
        $('#shares').empty();
        $('#positionVal').empty();
        $('#returnPer').empty();
        $('#dividendYield').empty();
        $('#peratio').empty();
        $("#marketcap").empty();
        $("#eps").empty();
        $("#200day").empty();
        console.log(response);
        for (var i = 0; i<response.length;i++){
            var row = $('<div></div>').text(response[i].company).addClass('row');
            $('#companyname').append(row);
            var row2 = $('<div></div>').text(response[i].price).addClass('row');
            $("#price").append(row2);
            var row3 = $('<div></div>').text(response[i].shares).addClass('row');
            $("#shares").append(row3);
            var row4 = $('<div></div>').text(response[i].positionVal).addClass('row');
            $("#positionVal").append(row4);
            var row5 = $('<div></div>').text(response[i].returnPercent).addClass('row');
            $("#returnPer").append(row5);
            var row6 = $('<div></div>').text(response[i].dividendYield).addClass('row');
            $("#dividendYield").append(row6);
            var row7 = $('<div></div>').text(response[i].peratio).addClass('row');
            $("#peratio").append(row7);
            var row8 = $('<div></div>').text(response[i].marketCap).addClass('row');
            $("#marketcap").append(row8);
            var row9 = $('<div></div>').text(response[i].earningsShare).addClass('row');
            $("#eps").append(row9);
            var row10 = $('<div></div>').text(response[i].movAvg200).addClass('row');
            $("#200day").append(row10);
        }
    });
}

function googleLoop() {
    $.ajax({
        method: 'PUT',
        data: JSON.stringify(global_stockarray),
        dataType: 'JSON',
        contentType: 'application/json; charset=UTF-8',
        url: '/stocks'
    }).done(function(response) {
        $('#ticker01').empty();
        for (var i = 0; i<response.dates.length;i++){
            var li = $('<li></li>');
            var date = $('<span></span>').text(response.dates[i].substring(5,10)+' ');
            var a = $('<a></a>').attr("href",response.links[i]).text(response.stories[i]);
            li.append(date);
            li.append(a);
            $('#ticker01').append(li);
        }
        if (runCount == 0){
            $(function(){
                $("ul#ticker01").liScroll();
                mainGraph();
            });
        }
        runCount++;
    });
}

function graphLoop(stock) {
    $.ajax({
        method: 'GET',
        dataType: 'JSON',
        contentType: 'application/json; charset=UTF-8',
        url: '/stocks/'+ stock
    }).done(function(response) {
        var labels =[]; //dates
        var data = []; //stock closing prices
        for (var i = 0;i<response.historical.length; i++){
            labels.push(response.historical[i].date);
            data.push(response.historical[i].price);
        }
        makeGraph(labels,data);
    });
}
var ctx = document.getElementById("myChart");

function makeGraph(labels, data){
    var backgroundColor = [];
    var borderColor = [];
    for (var i = labels.length;i>0;i--){
        backgroundColor.push('rgba('+200+','+i+','+i+',0.2'+')');
        borderColor.push('rgba('+200+','+i+','+i+',1'+')');
    }
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Day\'s Close ($)',
                data: data,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1
            }]
        },
        options: {
            //maintainAspectRatio: true,
            scales: {
                yAxes: [{
                    //barThickness:200,
                    ticks: {
                        //beginAtZero:true
                    }
                }]
            }
        }
    });
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

var ctx2 = document.getElementById("myChartPie");

function mainGraph(){
    var backgroundColor = [];
    var borderColor = [];
    var labels = [];
    var data = [];
    var increase = 100;
    var increase2 = 200;
    var tempColor;
    for (var i = 0;i<mainTable.length; i++){
        increase += 20;
        increase2 +=10;
        labels.push(mainTable[i].company);
        data.push(mainTable[i].positionVal);
        tempColor = getRandomColor();
        backgroundColor.push(tempColor);
        borderColor.push(tempColor);
    }
    var myChartPie = new Chart(ctx2, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Position Val ($)',
                data: data,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1
            }]
        },
        options: {
            legend: {
                display: false
            },
            scale: {
                //lineArc: false,
                //display: false
            },
            startAngle: -.70,
        }
    });
}

function overlayLoop(){
    $.ajax({
        method: 'GET',
        dataType: 'JSON',
        contentType: 'application/json; charset=UTF-8',
        url: '/stocks/'+ searchFor
    }).done(function(response) {
        /*var stock = {
            stockTicker: stockTicker,
            company: response.Name,
            price: response.Bid,
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
        };*/
        $("#52wk-L").empty();
        $("#52wk-H").empty();
        $("#mktcap").empty();
        $("#dividend").empty();
        $("#earnings").empty();
        $("#pe-r").empty();
        $("#ps-r").empty();
        $("#50d").empty();
        $("#200d").empty();
        $("#change").empty();
        $("#exchangeimg").empty();
        $("#name").empty();
        $("#ticker").empty();

        if (response.exchange=='NYSE'){
            exchange = 'NYSE';
            $("#exchangeimg").append($('<img>').attr('src','images/NYSE.png').css('width','100px'));
        }
        else {
            exchange = 'NASDAQ';
            $("#exchangeimg").append($('<img>').attr('src','images/Nasdaq.png').css('width','100px'));
        }
        $("#name").append($('<h1></h1>').text(response.company));
        $("#ticker").append($('<h4></h4>').text(response.stockTicker));
        $("#52wk-L").append($('<p></p>').text('$'+response.weekLow52));
        $("#52wk-H").append($('<p></p>').text('$'+response.weekHigh52));
        $("#mktcap").append($('<p></p>').text('$'+response.marketCap));
        $("#dividend").append($('<p></p>').text(response.dividendYield+'%'));
        $("#earnings").append($('<p></p>').text(response.earningsShare));
        $("#pe-r").append($('<p></p>').text(response.peratio));
        $("#ps-r").append($('<p></p>').text(response.priceSales+'x'));
        $("#50d").append($('<p></p>').text('$'+response.movAvg50));
        $("#200d").append($('<p></p>').text('$'+response.movAvg200));
        $("#change").append($('<p></p>').text(response.yearHighChange));
        $("#userprice").attr('placeholder','$'+response.price);
    });
}
