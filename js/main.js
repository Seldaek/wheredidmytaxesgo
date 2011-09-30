"use strict";

var taxData,
    total = 0,
    data = [
        { key: "BEHÖRDEN UND ALLGEMEINE VERWALTUNG", value: 798532 },
        { key: "RECHTSCHUTZ UND SICHERHEIT", value: 610601 },
        { key: "BILDUNG", value: 897564 },
        { key: "KULTUR UND FREIZEIT", value: 353979 },
        { key: "GESUNDHEIT", value: 882751 },
        { key: "SOZIALE WOHLFAHRT", value: 1358892 },
        { key: "VERKEHR", value: 997827 },
        { key: "UMWELT UND RAUMORDNUNG", value: 477265 },
        { key: "VOLKSWIRTSCHAFT", value: 845404 },
        { key: "FINANZEN UND STEUERN", value: 548101 }
    ];

function initData() {
    var i;
    data.sort(function (a, b) {
        if (a.value == b.value) {
            return 0;
        }
        return a.value > b.value ? -1 : 1;
    });

    for (i = 0; i < data.length; i++) {
        total += data[i].value;
    }
}

function getTaxes(income, married) {
    var incomeType;

    if (taxData === undefined) {
        $.ajax('taxes.json', {
            async: false,
            success: function (data) {
                taxData = data;
            }
        });
    }

    incomeType = Math.round(income / 1000);
    if (incomeType < 10 || incomeType > 249) {
        throw new Error('Invalid input, must be within the 10K-249K range');
    }

    return Math.round(taxData[incomeType.toString()][married ? 1 : 0] / (incomeType*1000) * income);
}

function moneyFormat(value) {
    value = value.toString();
    if (value > 1000) {
        return Math.floor(value / 1000) + "'" + "000".substr((value % 1000).toString().length) + (value % 1000);
    }
    return value;
}

function update() {
    var i,
        income = $('#slider').slider('value') * 1000,
        married = $('#married').is('.selected'),
        taxes = getTaxes(income, married),
        duration = taxes / 1000 / total * 86400 * 365;

    $('#income').text(moneyFormat(income) + ' CHF');
    $('#taxes').text(moneyFormat(taxes) + ' CHF');
    $('#duration').text(Math.round(duration));

    $('.chart').html('');
    var chart = d3.select(".chart").append("div").attr("class", "bar-chart");

    chart.selectAll("div")
        .data(data)
        .enter()
        .append("p")
        .html(function (d) {
            var spent = Math.round(taxes / total * d.value);
            return '<span class="label">'+moneyFormat(spent)+' CHF</span>';
        })
        .append("div")
        .style("width", function (d) {
            return d.value / 2000 + "px";
        })
        .text(function (d) {
            return d.key;
        });
}

initData();

$('#slider').slider({
    min: 10,
    max: 249,
    value: 50,
}).bind('slidechange slide', function (e) {
    update();
}).trigger('slidechange');

$('#married, #single').click(function (e) {
    $('#married, #single').removeClass('selected');
    $(this).addClass('selected');
    update();
});
