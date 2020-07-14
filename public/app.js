'use strict'
$('.dataBaseForm').hide();


$('.select-button').on('click', function(){
    $(this).next().toggle();
});