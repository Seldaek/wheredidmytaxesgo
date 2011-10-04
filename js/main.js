(function () {
    "use strict";

    var taxDataIncome, taxDataCapital, max, scale,
        mobileDevice = false,
        total = 0;

    function initData() {
        var bubble, chart;

        scale = d3.scale.linear().range([ 0, 100 ] );
        bubble = d3.layout.pack();
        chart = d3.select(".chart").append("div").attr("class", "bar-chart");

        $.get("data_parsing/2010.json", function(json) {

            var i,
                filtered = [],
                data = bubble.nodes(classes(json));

            for (i = 0; i < data.length; i++) {
                if (!data[i].children) {
                    filtered.push(data[i]);
                }
            }

            var node = chart.selectAll("div")
                .data( filtered )
                .enter()
                .append("div")
                .attr('data-width', function (d) { return scale( d.size ) + '%'; })
                .attr('class', function (d) { return 'active ' + d['class']; } )
                .attr('id', function (d) { if (typeof d['id'] !== 'undefined') return d['id']; } )
                .html( function (d, i) { return '<span id="text' + i + '"></span>'; } )
                .append("div")
                .attr('class', 'legend')
                .attr('data-legend', function (d) { return d.name; });

            $('.bar-chart div')
                .css('width', function () {
                    return $(this).data('width');
                })
                .click(function () {
                    if ($(this).attr('id')) {
                        $('.' + $(this).attr('id')).toggle();
                    }
                });
            $('.bar-chart .legend').text(function () {
                return $(this).data('legend');
            })
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

        var i, boundary,
            tax = 0,
            idx = married ? 2 : 1;

        for(i = 0; ; i++) {
            boundary = taxDataIncome[i][idx];
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

        var i, boundary,
            tax = 0,
            idx = married ? 2 : 1;

        for(i = 0; ; i++) {
            boundary = taxDataCapital[i][idx];
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
        var t = "'",
            i = parseInt(n = Math.abs(+n || 0).toFixed(0)).toString(),
            j = (j = i.length) > 3 ? j % 3 : 0;
       	return (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t);
    }

    function update() {
        var i,
            income = mobileDevice ? (parseInt($('#slider').val()) || 0) : $('#slider').slider('value') * 1000,
            capital = parseInt($('#capital').val()) || 0,
            married = $('#married').is('.selected'),
            taxes = getIncomeTaxes(income, married) + getCapitalTaxes(capital, married),
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
        if (a.size === b.size) {
            return 0;
        }
        return a.size < b.size ? 1 : -1;
    };

    function classes(root) {
        var classes = [];
        var sections = [];
        var subs = {};

        $.each(root.children, function(i, child) {
            var subclasses = [];
            var sizes = [];

            $.each(child.children, function(j, grandchild) {
                subclasses.push({
                    name: grandchild['Aufgaben'],
                    'class': 'sub section' + i,
                    size: grandchild['Aufwand total']
                });
                sizes.push(grandchild['Aufwand total']);
            });

            sections.push({
                name: child.name,
                'class': 'head',
                'id': 'section' + i,
                size: d3.sum( sizes ),
                key: i
            });

            subs[i] = subclasses.sort(reverse_size_sort);
        });

        sections.sort(reverse_size_sort);

        max = sections[0].size;

        total = d3.sum($.map(sections, function (x) {
            return x.size;
        }));

        scale.domain([0, max ]);

        $.each(sections, function (i, section) {
            classes.push(section);
            classes.push.apply(classes, subs[section.key]);
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

        document.title = tr('Where Did My Taxes Go?');

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

        $(update);
        setTimeout(update, 100);
        setTimeout(update, 1000);
    }

    init();
}());