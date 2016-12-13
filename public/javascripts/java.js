/*jslint browser: true*/
/*global $, jQuery, alert*/
var global_ID;
var global_cash;
var global_username;
var global_stockarray;
var searchFor;
var runCount = 0;
var stockLoop;

$(function () {


    var colors = Highcharts.getOptions().colors,
        categories = ['MSIE', 'Firefox', 'Chrome', 'Safari', 'Opera'],
        data = [{
            y: 56.33,
            color: colors[0],
            drilldown: {
                name: 'MSIE versions',
                categories: ['MSIE 6.0', 'MSIE 7.0', 'MSIE 8.0', 'MSIE 9.0', 'MSIE 10.0', 'MSIE 11.0'],
                data: [1.06, 0.5, 17.2, 8.11, 5.33, 24.13],
                color: colors[0]
            }
        }, {
            y: 10.38,
            color: colors[1],
            drilldown: {
                name: 'Firefox versions',
                categories: ['Firefox v31', 'Firefox v32', 'Firefox v33', 'Firefox v35', 'Firefox v36', 'Firefox v37', 'Firefox v38'],
                data: [0.33, 0.15, 0.22, 1.27, 2.76, 2.32, 2.31, 1.02],
                color: colors[1]
            }
        }, {
            y: 24.03,
            color: colors[2],
            drilldown: {
                name: 'Chrome versions',
                categories: ['Chrome v30.0', 'Chrome v31.0', 'Chrome v32.0', 'Chrome v33.0', 'Chrome v34.0',
                    'Chrome v35.0', 'Chrome v36.0', 'Chrome v37.0', 'Chrome v38.0', 'Chrome v39.0', 'Chrome v40.0', 'Chrome v41.0', 'Chrome v42.0', 'Chrome v43.0'
                    ],
                data: [0.14, 1.24, 0.55, 0.19, 0.14, 0.85, 2.53, 0.38, 0.6, 2.96, 5, 4.32, 3.68, 1.45],
                color: colors[2]
            }
        }, {
            y: 4.77,
            color: colors[3],
            drilldown: {
                name: 'Safari versions',
                categories: ['Safari v5.0', 'Safari v5.1', 'Safari v6.1', 'Safari v6.2', 'Safari v7.0', 'Safari v7.1', 'Safari v8.0'],
                data: [0.3, 0.42, 0.29, 0.17, 0.26, 0.77, 2.56],
                color: colors[3]
            }
        }, {
            y: 0.91,
            color: colors[4],
            drilldown: {
                name: 'Opera versions',
                categories: ['Opera v12.x', 'Opera v27', 'Opera v28', 'Opera v29'],
                data: [0.34, 0.17, 0.24, 0.16],
                color: colors[4]
            }
        }, {
            y: 0.2,
            color: colors[5],
            drilldown: {
                name: 'Proprietary or Undetectable',
                categories: [],
                data: [],
                color: colors[5]
            }
        }],
        browserData = [],
        versionsData = [],
        i,
        j,
        dataLen = data.length,
        drillDataLen,
        brightness;


    // Build the data arrays
    for (i = 0; i < dataLen; i += 1) {

        // add browser data
        browserData.push({
            name: categories[i],
            y: data[i].y,
            color: data[i].color
        });

        // add version data
        drillDataLen = data[i].drilldown.data.length;
        for (j = 0; j < drillDataLen; j += 1) {
            brightness = 0.2 - (j / drillDataLen) / 5;
            versionsData.push({
                name: data[i].drilldown.categories[j],
                y: data[i].drilldown.data[j],
                color: Highcharts.Color(data[i].color).brighten(brightness).get()
            });
        }
    }

    // Create the chart
    var chart = Highcharts.chart("pie", {
        chart: {
            type: 'pie',
            renderTo: 'container',
            marginTop: -50,
            marginBottom: -50,
            marginLeft: 0,
            marginRight: 0
        },
        title: {
            text: null
        },
        yAxis: {
            title: {
                text: 'Total percent market share'
            }
        },
        credits: false,
        plotOptions: {
            pie: {
                shadow: false,
                center: ['50%', '50%'],
                size: '100%'
            }
        },
        tooltip: {
            valueSuffix: '%'
        },
        series: [{
            name: 'Browsers',
            data: browserData,
            size: '60%',
            dataLabels: {
                formatter: function () {
                    return this.y > 5 ? this.point.name : null;
                },
                color: '#ffffff',
                distance: -30
            }
            
        }, {
            name: 'Versions',
            data: versionsData,
            size: '80%',
            innerSize: '60%',
            dataLabels: {
                formatter: function () {
                    // display only if larger than 1
                    return this.y > 1 ? '<b>' + this.point.name + ':</b> ' + this.y + '%' : null;
                }
            }
        }]
        
    });

    var opt = chart.series[1].options;
    opt.dataLabels.enabled = !opt.dataLabels.enabled;
    chart.series[1].update(opt);
});



$('#searchbtn').on('click', searchDialog);
function searchDialog(event) {
    event.preventDefault();
    searchFor = $('#searchinput').val();
    graphLoop(searchFor);
    stockLoop = setInterval(overlayLoop(),1000);
    $('#overlayhider').show();
    console.log(searchFor);
}
$('#addbtn').on('click', function(e) {
    e.preventDefault();
    clearInterval(stockLoop);
    $('#overlayhider').hide();
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
        $('#companyname').empty();
        $('#price').empty();
        $('#shares').empty();
        $('#positionVal').empty();
        $('#returnPer').empty();
        $('#dividendYield').empty();
        $('#beta').empty();
        $('#peratio').empty();
        $('#sector').empty();
        $('#industry').empty();

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
            var row7 = $('<div></div>').text(response[i].beta).addClass('row');
            $("#beta").append(row7);
            var row8 = $('<div></div>').text(response[i].peratio).addClass('row');
            $("#peratio").append(row8);
            var row9 = $('<div></div>').text(response[i].sector).addClass('row');
            $("#sector").append(row9);
            var row10 = $('<div></div>').text(response[i].industry).addClass('row');
            $("#industry").append(row10);
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
        $("#exchange").empty();

        $("#52wk-L").append($('<p></p>').text('$'+response.weekLow52));
        $("#52wk-H").append($('<p></p>').text('$'+response.weekHigh52));
        $("#mktcap").append($('<p></p>').text('$'+response.marketCap));
        $("#dividend").append($('<p></p>').text(response.dividendYield+'%'));
        $("#earnings").append($('<p></p>').text(response.earningsShare));
        $("#pe-r").append($('<p></p>').text(response.peratio));
        $("#ps-r").append($('<p></p>').text(response.priceSales+'x'));
        $("#50d").append($('<p></p>').text('$'+response.movAvg50));
        $("#200d").append($('<p></p>').text('$'+response.movAvg200));
        $("#change").append($('<p></p>').text(response.yearHighChange+'%'));
        $("#exchange").append($('<p></p>').text(response.exchange));
        $("#userprice").attr('placeholder','$'+response.price);
    });
}