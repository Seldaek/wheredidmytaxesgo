"use strict";

var taxData;

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

function update() {
    var income = $('#slider').slider('value') * 1000,
        married = $('#married').is('.selected');
    $('#income').text((income) + ' CHF');
    $('#taxes').text(getTaxes(income, married) + ' CHF');
}

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
