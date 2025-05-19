import { item_db } from "../db/db.js";
import ItemModel from "../model/ItemModel.js";

/*---------------------Load Item ID When The Page is Loading-------------------*/
$(document).ready(function() {
    $('#itemCode').val(generateItemID());
    loadItem();
});

/*--------------------------Generate next Item Id----------------------------*/
function generateItemID() {
    if (item_db.length === 0) {
        return "I001";
    }
    // Get the last Item ID (assuming last added is at the end)
    let lastId = item_db[item_db.length - 1].itemId;
    let numberPart = parseInt(lastId.substring(1));
    let newId = numberPart + 1;
    return "I" + newId.toString().padStart(3, '0');
}

/*--------regex ---------------*/
const namePattern = /^[A-Za-z\s]{3,}$/;
const qtyPattern = /^[1-9]\d*$/;
const pricePattern = /^(?:[1-9]\d*|0)?(?:\.\d{1,2})?$/;

$('#itemName').on('input',function () {
    if (!namePattern.test($(this).val())){
        $(this).addClass('is-invalid').removeClass('is-valid');
    }else {
        $(this).addClass('is-valid').removeClass('is-invalid');
    }
});

$('#itemQuantity').on('input',function () {
    if (!qtyPattern.test($(this).val())){
        $(this).addClass('is-invalid').removeClass('is-valid');
    }else {
        $(this).addClass('is-valid').removeClass('is-invalid');
    }
});

$('#itemPrice').on('input',function () {
    if (!pricePattern.test($(this).val())){
        $(this).addClass('is-invalid').removeClass('is-valid');
    }else {
        $(this).addClass('is-valid').removeClass('is-invalid');
    }
});