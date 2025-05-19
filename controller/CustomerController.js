import { customer_db } from "../db/db.js";
import CustomerModel from "../model/CustomerModel.js";

/*---------------------Load Customer ID When The Page is Loading-------------------*/
$(document).ready(function() {
    $('#customerId').val(generateCustomerID());
    loadCustomers();
});

/*------Real time Validation For input fields--------*/
const namePattern = /^[A-Za-z\s]{3,}$/; // Only letters and spaces, at least 3 characters
const addressPattern = /^[A-Za-z\s]{3,}$/;
const phonePattern = /^(\+94|0)?7\d{8}$/; // Sri Lankan mobile format

$('#customerName').on('input', function () {
    if (!namePattern.test($(this).val())) {
        $(this).addClass('is-invalid').removeClass('is-valid');
    } else {
        $(this).addClass('is-valid').removeClass('is-invalid');
    }
});

$('#customerAddress').on('input', function () {
    if (!addressPattern.test($(this).val())) {
        $(this).addClass('is-invalid').removeClass('is-valid');
    } else {
        $(this).addClass('is-valid').removeClass('is-invalid');
    }
});
$('#customerPhone').on('input', function () {
    if (!phonePattern.test($(this).val())) {
        $(this).addClass('is-invalid').removeClass('is-valid');
    } else {
        $(this).addClass('is-valid').removeClass('is-invalid');
    }
});