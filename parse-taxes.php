<?php

$url = 'http://193.246.65.25/cgi-stcalc/StCalcNP.cgi?StJ=2010&pfl_von=&pfl_bis=&Pfl=&tarif=b&KonfPfl=andere&KonfP=andere&gmde=Z%FCrich&RE=%income%&RV=0&VR=';

for ($income = 10000; $income < 250000; $income += 1000) {
    $res = file_get_contents(str_replace('%income%', $income, $url));
    preg_match('{Total einfache Staatssteuer +([0-9.\']+)}i', $res, $m);
    $tax = str_replace(array("'", '´'), '', $m[1]);
    file_put_contents('output.txt', $income.','.$tax.PHP_EOL, FILE_APPEND);
    echo $income.','.$tax.PHP_EOL;
}
