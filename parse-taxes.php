<?php

for ($income = 10000; $income < 250000; $income += 1000) {
    $marriedTax = getTax($income, 'a');
    $singleTax = getTax($income, 'b');
    file_put_contents('output.txt', $income.','.$singleTax.','.$marriedTax.PHP_EOL, FILE_APPEND);
    echo $income.','.$singleTax.','.$marriedTax.PHP_EOL;
}

function getTax($income, $married)
{
    $url = 'http://193.246.65.25/cgi-stcalc/StCalcNP.cgi?StJ=2010&pfl_von=&pfl_bis=&Pfl=&tarif=%married%&KonfPfl=andere&KonfP=andere&gmde=Z%FCrich&RE=%income%&RV=0&VR=';
    $res = file_get_contents(str_replace(array('%income%', '%married%'), array($income, $married), $url));
    preg_match('{Total einfache Staatssteuer +([0-9.\']+)}i', $res, $m);
    return str_replace(array("'", '´'), '', $m[1]);
}
