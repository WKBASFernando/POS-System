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

/*--------------------------Generate next Customer Id----------------------------*/
function generateCustomerID() {
    if (customer_db.length === 0) {
        return "C001";
    }
    // Get the last customer ID (assuming last added is at the end)
    let lastId = customer_db[customer_db.length - 1].customerID;
    let numberPart = parseInt(lastId.substring(1));
    let newId = numberPart + 1;
    return "C" + newId.toString().padStart(3, '0');
}

/*--------------------------Save Customer----------------------------*/
$('#customer_save').on('click', function () {
    let id = generateCustomerID();
    let name = $('#customerName').val();
    let address = $('#customerAddress').val();
    let phone = $('#customerPhone').val();

    if (!namePattern.test(name) || !addressPattern.test(address) || !phonePattern.test(phone)) {
        Swal.fire({
            icon: "error",
            title: "Invalid Input",
            text: "Please enter valid customer details.",
        });
    }else {
        let customer_data = new CustomerModel(id,name,address,phone);
        customer_db.push(customer_data);
        loadCustomers();
        clearForm();
        setCount();
        Swal.fire({
            title: "Data Saved Successfully!",
            icon: "success",
            draggable: true
        });
    }
});