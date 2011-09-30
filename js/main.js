"use strict";

var taxes;

function getTaxes(income, married) {
    var incomeType;

    if (taxes === undefined) {
        $.ajax('taxes.json', {
            async: false,
            success: function (data) {
                taxes = data;
            }
        });
    }

    incomeType = Math.round(income / 1000);
    if (incomeType < 10 || incomeType > 249) {
        throw new Error('Invalid input, must be within the 10K-249K range');
    }

    return Math.round(taxes[incomeType.toString()][married ? 1 : 0] / (incomeType*1000) * income);
}

function update(income) {
    $('#income').text('Income: ' + (income * 1000) + ' CHF');
    $('#taxes').text('Taxes: ' + getTaxes(income * 1000) + ' CHF');
}

$(function () {
    $('#slider').slider({
        min: 10,
        max: 249,
        value: 50,
    }).bind('slidechange slide', function (e) {
            update($(this).slider('value'));
    });
});

