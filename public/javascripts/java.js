/*jslint browser: true*/
/*global $, jQuery, alert*/
$(function(){
    $("ul#ticker01").liScroll();
});

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
            marginRight: 0,
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

// leanModal v1.1 by Ray Stone - http://finelysliced.com.au
// Dual licensed under the MIT and GPL
(function ($) {
    $.fn.extend({
        leanModal: function (options) {
            var defaults = {
                top: 100,
                overlay: 0.5,
                closeButton: null
            };
            var overlay = $("<div id='lean_overlay'></div>");
            $("body").append(overlay);
            options = $.extend(defaults, options);
            return this.each(function () {
                var o = options;
                var modal_id = $(this).attr("href");

                function showModal() {
                    $("#lean_overlay").click(function () {
                        close_modal(modal_id)
                    });
                    $(o.closeButton).click(function () {
                        console.log(document.getElementById("username").value);
                        close_modal(modal_id)
                    });

                    var modal_height = $(modal_id).outerHeight();
                    var modal_width = $(modal_id).outerWidth();

                    $("#lean_overlay").css({
                        "display": "block",
                        opacity: 0
                    });

                    $("#lean_overlay").fadeTo(200, o.overlay);

                    $(modal_id).css({
                        "display": "block",
                        "position": "fixed",
                        "opacity": 0,
                        "z-index": 11000,
                        "left": 50 + "%",
                        "margin-left": -(modal_width / 2) + "px",
                        "top": o.top + "px"
                    });

                    $(modal_id).fadeTo(200, 1);
                };

                $(document).ready(function () {
                    showModal();
                });

                $(this).click(function (e) {
                    showModal();
                    e.preventDefault()
                })


            });

            function close_modal(modal_id) {
                findUser();

                $("#lean_overlay").fadeOut(200);
                $(modal_id).css({
                    "display": "none"
                })


            }
        }
    })
})(jQuery);

$('#findUser').on('click', findUser);

function findUser(event) {
    event.preventDefault();

    var username = $('#username').val();

    $.ajax({
        type:'GET',
        url: '/users/names/' + username,
        dataType: 'JSON'
    }).done(function(response) {
        console.log(response);
    });
};