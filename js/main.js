"use strict";

var taxDataIncome, taxDataCapital,
    mobileDevice = false,
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

function getIncomeTaxes(income, married) {
    if (taxDataIncome === undefined) {
        $.ajax('taxrates_income.json', {
            async: false,
            dataType: 'json',
            success: function (data) {
                taxDataIncome = data;
            }
        });
    }

    var tax = 0;
    var idx = married ? 2 : 1;

    for(var i = 0 ; ; i++) {
      var boundary = taxDataIncome[i][idx];
      if (income < boundary || boundary == 0) {
        tax += income * taxDataIncome[i][0];
        break;
      } else {
        tax += boundary * taxDataIncome[i][0];
        income -= boundary;
      }
    }

    return tax;
}

function getCapitalTaxes(capital, married) {
    if (taxDataCapital === undefined) {
        $.ajax('taxrates_capital.json', {
            async: false,
            dataType: 'json',
            success: function (data) {
                taxDataCapital = data;
            }
        });
    }

    var tax = 0;
    var idx = married ? 2 : 1;


    for(var i = 0 ; ; i++) {
      var boundary = taxDataCapital[i][idx];
      if (capital < boundary || boundary == 0) {
        tax += capital * taxDataCapital[i][0];
        break;
      } else {
        tax += boundary * taxDataCapital[i][0];
        capital -= boundary;
      }
    }

    return tax;
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
        capital = $('#capital').val(),
        married = $('#married').is('.selected'),
<<<<<<< HEAD
        taxes = getIncomeTaxes(income, married)
             +  getCapitalTaxes(capital, married),
        duration = taxes / 1000 / total * 86400 * 365;
=======
        taxes = getTaxes(income, married),
        duration = taxes / 1000 / total * 86400 * 365,
        tr = $.tr.translator();
>>>>>>> Add translations, skip slider on mobile devices

    $('#income').text(moneyFormat(income) + ' CHF');
    $('#taxes').text(tr('taxes-report', {taxes: moneyFormat(taxes) + ' CHF', duration: Math.round(duration)}));

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

function initTranslations() {
    var tr = $.tr.translator();

    $('.t').html(function () {
        var src, content;
        if (src = $(this).data('orig-trans')) {
            return tr(src);
        }

        content = $(this).html();
        $(this).data('orig-trans', content);
        return tr(content);
    });

    update();
}

function init() {
    var re = /Android|iOS|iPhone|iPad|iPod|WebOS/i;
    mobileDevice = re.test(navigator.userAgent);

    // load dicts
    $.tr.dictionary(translations);
    // set default language
    $.tr.language('de');

    initData();

    $('.lang a').click(function (e) {
        $('.lang a').removeClass('active');
        $.tr.language($(this).data('lang'));
        $(this).addClass('active');
        initTranslations();
    })

    if (!mobileDevice) {
        $('#slider').replaceWith('<div id="slider" />');
        $('#slider').slider({
            min: 10,
            max: 249,
            value: 50,
        }).bind('slidechange slide', function (e) {
            update();
        });
    }

    $('#married, #single').click(function (e) {
        $('#married, #single').removeClass('selected');
        $(this).addClass('selected');
        update();
    });

    initTranslations();

    $('#container').removeClass('hidden');
}

init();
