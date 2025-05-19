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