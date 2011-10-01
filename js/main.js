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

var max, scale;

function initData() {
    var i;

    scale = d3.scale.linear().range([ 0, 100 ] );

    var bubble = d3.layout.pack();

    var chart = d3.select(".chart").append("div").attr("class", "bar-chart");

    d3.json("data_parsing/2012.json", function(json) {
      var node = chart.selectAll("div")
          .data( bubble.nodes( classes(json) ).filter(function(d) { return !d.children; } ) )
          .enter()
          .append("div")
          .style("width", function(d) { return scale( d.size ) + '%'; } )
          .attr('class', function(d) { return 'active ' + d.class; } )
          .attr('id', function(d) { return d.id; } )
          .on('click', function(d, i) { $( '.' + d.id ).toggle() } )
          .html( function(d, i){ return '<span id="text' + i + '"/>'; } )
          .append("div")
          .attr('class', 'legend')
          .text(function(d) { return d.name; });
    });

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

function moneyFormat(n) {
    var t = "'", i = parseInt(n = Math.abs(+n || 0).toFixed(0)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
   	return (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t);
}

function update() {
    var i,
        income = mobileDevice ? (parseInt($('#slider').val()) || 0) : $('#slider').slider('value') * 1000,
        capital = parseInt($('#capital').val()) || 0,
        married = $('#married').is('.selected'),
        taxes = getIncomeTaxes(income, married)
              + getCapitalTaxes(capital, married),
        duration = taxes / 1000 / total * 86400 * 365,
        tr = $.tr.translator();

    $('#income').text(moneyFormat(income) + ' CHF');
    $('#taxes').text(moneyFormat(Math.round(taxes)));
    $('#time').text(Math.round(duration));

    d3.select('.bar-chart')
    .selectAll("div.active")
    .each( function( d, i) {
      $('#text' + i ).html( moneyFormat( d.size * taxes / total ) + ' CHF' )
    });    
}

function reverse_size_sort( a, b ) {
  return a.size < b.size;
};

function classes(root) {
  var classes = [];

  var sections = [];
  var subs = {};

  root.children.forEach( function( child, i ) {
    var subclasses = [];
    var sizes = [];

    child.children.forEach( function( grandchild ) {
      subclasses.push( { name: grandchild['Aufgaben'], class: 'sub section' + i, size: grandchild['Aufwand total']  } );
      sizes.push( grandchild['Aufwand total'] );
    })

    sections.push( { name: child.name, class: 'head', id: 'section' + i, size: d3.sum( sizes ), key: i } );

    subs[ i ] = subclasses.sort( reverse_size_sort );
  });

  sections.sort( reverse_size_sort );

  max = sections[0].size;

  total = d3.sum( sections.map( function(x) { return x.size; } ) );

  scale.domain( [0, max ] );

  sections.forEach( function( section ){
    classes.push( section );
    classes.push.apply( classes, subs[ section.key ] );
  });

  return {children: classes};
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
    $.tr.language('de', true);

    $('.lang a[data-lang="'+$.tr.language()+'"]').addClass('active');

    initData();

    $('.lang a').click(function (e) {
        $('.lang a').removeClass('active');
        $.tr.language($(this).data('lang'));
        $(this).addClass('active');
        initTranslations();
    });

    $('#capital').bind('change keyup', function (e) {
        if (isNaN(parseInt($(this).val())) && $(this).val()) {
            $(this).val('0');
        }
        update();
    });

    if (!mobileDevice) {
        $('#slider').replaceWith('<span id="income"><input type="text" value="50000" /> CHF</span><div id="slider" />');
        $('#slider').slider({
            min: 10,
            max: 300,
            value: 50,
        }).bind('slidechange slide', update);
    } else {
        $('#slider').bind('change keyup', update);
    }

    $('#married, #single').click(function (e) {
        $('#married, #single').removeClass('selected');
        $(this).addClass('selected');
        update();
    });

    initTranslations();

    $('#container').removeClass('hidden');

    setTimeout(update, 100);
    setTimeout(update, 1000);
}

init();
