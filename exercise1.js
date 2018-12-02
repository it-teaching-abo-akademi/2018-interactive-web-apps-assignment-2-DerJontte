// A convenience function for showing a popup with an error message
function errorMessage(message) {
    alert("Error: " + message);
}

// This function takes the virtual barcode from the input box on the page and extracts the data within it.
function parseVirtual() {
    // Read the barcode and check that it's the correct length
    let vCode = document.getElementById("virtual_barcode").value;
    if (vCode.length != 54){
        return errorMessage("invalid barcode length");
    }

    // Check which version the barcode is and invoke the correct algorithm to format the reference number with.
    let version = vCode.slice(0, 1);
    if (version == 4) {
        refNo = refVer4(vCode.slice(28, 48));
    } else if (version == 5) {
        refNo = refVer5(vCode.slice(25, 48));
    } else {
        errorMessage("invalid barcode version");
        return;
    }

    // Extract and format the rest of the data within the barcode: IBAN account, amount to be paid and due date.
    let iban = formatIBAN(vCode.slice(1, 17));
    let amount = parseInt(vCode.slice(17, 23), 10) + "," + vCode.slice(23, 25);
    let dueDate = parseDate(vCode.slice(-6));

    // Print the payment information on the webpage.
    document.getElementById("iban").innerText = iban;
    document.getElementById("amount").innerText = amount;
    document.getElementById("reference").innerText = refNo;
    document.getElementById("due_date").innerText = dueDate;

    // Use JsBarcode to generate a a barcode in Code128-c format and display it on the web page.
    let element = document.getElementById("barcode");
    JsBarcode(element, vCode, {format: "CODE128C"});
}

// Function to parse the reference number from a version 4 barcode. Strips all zeroes from the beginning of the string
// and arranges the remaining numbers in groups of five.
function refVer4(rawRefNo){
    rawRefNo = rawRefNo.replace(/^0+/, "");
    refNo = "";
    while (rawRefNo.length > 4) {
        refNo = rawRefNo.slice(-5) + " " + refNo;
        rawRefNo = rawRefNo.slice(0, -5);
    }
    refNo = rawRefNo + " " + refNo;
    return refNo;
}

// Function to parse the reference number from a version 5 barcode. Starts with "RF" and the first two numbers in the
// series, strips all zeroes until the next number, and arranges the remaining numbers in groups of four.
function refVer5(rawRefNo) {
    refNo = "RF" + rawRefNo.slice(0,2);
    rawRefNo = rawRefNo.slice(2).replace(/^0+/, "");
    while (rawRefNo.length > 3) {
        refNo += " " + rawRefNo.slice(0, 4);
        rawRefNo = rawRefNo.slice(4);
    }
    refNo += " " + rawRefNo;
    return refNo;
}

// Function to convert a date from YYMMDD-form to DD.MM.YYYY
function parseDate(rawDate) {
    if (rawDate == 0) {
        var date = "00.00.00";
    } else {
        year = "20" + rawDate.slice(0, 2);
        month = parseInt(rawDate.slice(2, 4), 10);
        day = parseInt(rawDate.slice(-2), 10);
        var date = day + "." + month + "." + year;
    }
    return date;
}

// Function to group the digits in an IBAN account number so that they are easier to read
function formatIBAN(rawNo) {
    formatted = rawNo.slice(0,2) + " " + rawNo.slice(2, 6) + " " + rawNo.slice(6, 10) + " " + rawNo.slice(10, 14) + " " + rawNo.slice(-2);
    return formatted;
}

// Function to switch between two texts in a given context. Used for the "hide/show"-button.
function toggleText(element, textA, textB){
    if($(element).text() == textA) {
        element.text(textB);
    } else {
        element.text(textA);
    }
}

// This function is executed when the page is loaded into the browser window.
window.onload = function() {
    // Create an event handler that makes the background of the text input grey when the element has focus and
    // white when it doesn't.
    $("input:text").bind("focus blur", function() {
        $(this).toggleClass("bg_grey");
    });

    // Set a listener on the hide-button. Hide the information section and change the text on the button to "show" when
    // the user presses the hide-button. Show the information section and change the text to "hide" when the user presses
    // the button again.
    $("#btn_hide").click(function(){
        $("#information").slideToggle("fast", toggleText($(this), "Hide", "Show"));
    });

    // Set an event handler that clicks the decode-button vhen enter is pressed in the text input field.
    $("#virtual_barcode").keypress(function (key) {
        if (key.which == 13) {
            $("#btn_decode").click();
        }
    });

    // Execute the parseVirtual-function when the user presses the decode-button.
    document.getElementById("btn_decode").onclick = parseVirtual;
}
