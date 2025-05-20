import {item_db, orders_db, payment_db, order_detail_db, customer_db} from "../db/db.js";
import {loadItem} from "./ItemController.js";
//import {setCount} from "./MainController.js"; // Uncommented this import
import OrderDetailModel from "../model/OrderDetailModel.js";
import OrderModel from "../model/OrderModel.js";
import PaymentModel from "../model/PaymentModel.js"; // Fixed typo in import path

/*-----------------Load Page---------------------------*/
$(document).ready(function() {
    $('#invoiceNo').val(generatePayID());
    $('#generateOrderId').val(generateOrderID());
    loadOrderTable();
    loadDateAndTime();
});

/*--------------------Load date and Time -------------------------*/
function loadDateAndTime() {
    const now = new Date();

    const date = now.toISOString().split('T')[0];
    $('#invoiceDate').val(date);

    const time = now.toTimeString().split(' ')[0].substring(0,5);
    $('#invoiceTime').val(time);
}

/*--------------------Search Customer In the DB--------------------------------*/
$('#searchCustomer').on('click', function () {
    searchCustomer();
});

function searchCustomer() {
    let id = $('#searchCustomerInput').val().trim();
    if (!id) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Search an ID first",
        });
        return;
    }
    const c = customer_db.find(cust => cust.customerID === id);
    if (c) {
        $('#loadCid').val(c.customerID);
        $('#loadCName').val(c.customerName);
        $('#loadCAddress').val(c.address);
        $('#loadCPhone').val(c.customerPhone);
    } else {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Id does not Exist",
        });
    }
}

/*--------------------Reset BTN in Customer---------------------------*/
function resetCustomer() {
    $('#generateOrderId').val(generateOrderID())
    $('#searchCustomerInput').val('');
    $('#loadCid').val('');
    $('#loadCName').val('');
    $('#loadCAddress').val('');
    $('#loadCPhone').val('');
}

$('#resetCustomerDetails').on('click', function () {
    resetCustomer();
});

/*--------------------Search Item In the DB--------------------------------*/
$('#searchItem').on('click', function () {
    searchItem();
});

function searchItem() {
    let id = $('#itemIDInput').val().trim();
    if (!id) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Search an ID first",
        });
        return;
    }
    const c = item_db.find(item => item.itemId === id);
    if (c) {
        $('#loadItemId').val(c.itemId);
        $('#loadItemName').val(c.itemName);
        $('#loadItemQty').val(c.itemQty);
        $('#loadItemPrice').val(c.itemPrice);
    } else {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Id does not Exist",
        });
    }
}

/*-------------------Reset BTN in Item------------------------*/
function resetItem() {
    $('#itemIDInput').val('');
    $('#loadItemId').val('');
    $('#loadItemName').val('');
    $('#loadItemQty').val('');
    $('#loadItemPrice').val('');
    $('#quantity').val('');
}

$('#resetItemDetails').on('click', function () {
    resetItem();
});

/*----------------Add to Order / OrderDetails---------------------------*/
$('#addToOrder').on('click', function () {
    let itemCode = $('#loadItemId').val();
    let itemName = $('#loadItemName').val();
    let price = parseFloat($('#loadItemPrice').val());
    let needQty = parseInt($('#quantity').val());
    
    // Enhanced validation
    if (!itemCode || !itemName) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Please search for an item first",
        });
        return;
    }
    
    if (isNaN(needQty) || needQty <= 0) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Please enter a valid quantity",
        });
        return;
    }
    
    let item = item_db.find(item => item.itemId === itemCode);

    if (!item) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "No Item Found",
        });
        return;
    }

    if (item.itemQty < needQty) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Not enough Quantity",
        });
        return;
    }

    let index = order_detail_db.findIndex(item => item.itemCode === itemCode);

    if (index !== -1) {
        order_detail_db[index].qty += needQty;
        order_detail_db[index].total = order_detail_db[index].qty * order_detail_db[index].price;
    } else {
        let total = price * needQty;
        let order_data = new OrderDetailModel(itemCode, itemName, needQty, price, total);
        order_detail_db.push(order_data);
    }
    
    item.itemQty -= needQty;
    loadItem();
    setDisableCustomer();
    resetItem();
    loadOrderTable();
    updateTotalAmount();
    
    Swal.fire({
        title: "Item Added Successfully!",
        icon: "success",
        showConfirmButton: false,
        timer: 1500
    });
});

/*-------------------------Customer Form BTN changing--------------------------------*/
function setDisableCustomer() {
    $('#searchCustomer').prop('disabled', true);
    $('#resetCustomerDetails').prop('disabled', true);
    $('#searchCustomerInput').prop('readonly', true);
}

function setEnableCustomer() {
    $('#searchCustomer').prop('disabled', false);
    $('#resetCustomerDetails').prop('disabled', false);
    $('#searchCustomerInput').prop('readonly', false);
}

/*-------------------Get Total Amount------------------------*/
function updateTotalAmount() {
    let total = 0;
    order_detail_db.forEach(entry => {
        total += entry.total;
    });
    
    // Check if these are input fields or display elements
    if ($('#loadTotal').is('input')) {
        $('#loadTotal').val(total.toFixed(2));
        $('#loadSubTotal').val(total.toFixed(2));
    } else {
        // If they are span/div elements
        $('#loadTotal').text(total.toFixed(2));
        $('#loadSubTotal').text(total.toFixed(2));
    }
}

/*--------------------Get Sub Total-----------------*/
$('#discountAmount').on('input', function() {
    let total = 0;
    order_detail_db.forEach(entry => {
        total += entry.total;
    });
    
    let discount = parseFloat($('#discountAmount').val());
    if (isNaN(discount)) {
        discount = 0;
    }
    
    let subTotal = total - discount;
    
    // Check if these are input fields or display elements
    if ($('#loadSubTotal').is('input')) {
        $('#loadSubTotal').val(subTotal.toFixed(2));
    } else {
        // If they are span/div elements
        $('#loadSubTotal').text(subTotal.toFixed(2));
    }
});

/*--------------------LoadBalance---------------------*/
$('#cashAmount').on('input', function() {
    let cash = parseFloat($('#cashAmount').val());
    
    // Check if loadSubTotal is an input field or display element
    let total;
    if ($('#loadSubTotal').is('input')) {
        total = parseFloat($('#loadSubTotal').val());
    } else {
        total = parseFloat($('#loadSubTotal').text());
    }

    if (isNaN(cash) || isNaN(total)) {
        $('#balanceAmount').val("Invalid input");
    } else {
        let balance = cash - total;
        $('#balanceAmount').val(balance.toFixed(2));
    }
});

/*---------------------Load table--------------------*/
function loadOrderTable() {
    $('#order-body').empty();
    order_detail_db.forEach((orderDetail, index) => {
        let itemCode = orderDetail.itemCode;
        let itemName = orderDetail.itemName;
        let qty = orderDetail.qty;
        let price = orderDetail.price;
        let total = orderDetail.total;
        let data = `<tr>
                        <td>${itemCode}</td>
                        <td>${itemName}</td>
                        <td>${qty}</td>
                        <td>${price.toFixed(2)}</td>
                        <td>${total.toFixed(2)}</td>
                    </tr>`;
        $('#order-body').append(data);
    });
}

/*--------------------------Generate next PayId----------------------------*/
function generatePayID() {
    if (payment_db.length === 0) {
        return "PAY001";
    }

    let lastId = payment_db[payment_db.length - 1].payId;
    let numberPart = parseInt(lastId.substring(3));
    let newId = numberPart + 1;
    return "PAY" + newId.toString().padStart(3, '0');
}

/*--------------------------Generate next Order Id----------------------------*/
function generateOrderID() {
    if (orders_db.length === 0) {
        return "OID-001";
    }

    let lastId = orders_db[orders_db.length - 1].orderID;
    let numberPart = parseInt(lastId.substring(4));
    let newId = numberPart + 1;
    return "OID-" + newId.toString().padStart(3, '0');
}

/*------------------------Place Order-----------------------------*/
$('#placeOrder').on('click', function() {
    // Validate customer selection
    let customerID = $('#loadCid').val();
    if (!customerID) {
        Swal.fire({
            icon: "error",
            title: "No Customer Selected",
            text: "Please search and select a customer first"
        });
        return;
    }
    
    // Validate order items
    if (order_detail_db.length === 0) {
        Swal.fire({
            icon: "error",
            title: "Empty Order",
            text: "Please add at least one item to the order"
        });
        return;
    }

    let id = generatePayID();
    $('#invoiceNo').val(id);
    let date = $('#invoiceDate').val();
    let time = $('#invoiceTime').val();
    let method = $('#paymentMethod').val();
    
    // Get total value, handling both input fields and display elements
    let total;
    if ($('#loadTotal').is('input')) {
        total = parseFloat($('#loadTotal').val());
    } else {
        total = parseFloat($('#loadTotal').text());
    }

    let orderID = $('#generateOrderId').val();
    
    // Get subtotal value, handling both input fields and display elements
    let payAmount;
    if ($('#loadSubTotal').is('input')) {
        payAmount = parseFloat($('#loadSubTotal').val());
    } else {
        payAmount = parseFloat($('#loadSubTotal').text());
    }
    
    let paymentID = $('#invoiceNo').val();

    // Final validation
    if (!orderID || !customerID || !paymentID || isNaN(payAmount) || !date || !time || !method || isNaN(total) || total <= 0) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Please fill all payment details!",
        });
    } else {
        // Save order
        let order_data = new OrderModel(orderID, customerID, paymentID, payAmount);
        orders_db.push(order_data);
        
        // Save payment
        let payment_data = new PaymentModel(id, date, time, method, total);
        payment_db.push(payment_data);
        
        // Clear the order_detail_db as order is now completed
        order_detail_db.length = 0;
        
        reset();
        setEnableCustomer();
        resetCustomer();
        
        Swal.fire({
            title: "Order Placed Successfully!",
            icon: "success",
            text: "Order ID: " + orderID,
            draggable: true
        });
    }
});

/*-------------Reset Payment/PlaceOrder----------------------*/
$('#resetPaymentDetails').on('click', function() {
    reset();
});

function reset() {
    let id = generatePayID();
    $('#invoiceNo').val(id);
    $('#paymentMethod').val('Cash'); // Reset to default option
    $('#cashAmount').val('');
    $('#discountAmount').val('');
    
    // Handle both input and display elements
    if ($('#loadSubTotal').is('input')) {
        $('#loadSubTotal').val('');
        $('#loadTotal').val('');
    } else {
        $('#loadSubTotal').text('');
        $('#loadTotal').text('');
    }
    
    $('#balanceAmount').val('');
    
    loadDateAndTime();
    
    // Clear order table and data
    $('#order-body').empty();
}


