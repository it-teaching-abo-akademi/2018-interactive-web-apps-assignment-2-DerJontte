// Versionumero 1 5                                 0
// Saajan tilinumeron (IBAN) numeerinen osa 16      1 - 16
// Eurot 6                                          17 - 22
// Sentit 2                                         23 - 24
// RF-viitteen numeerinen osa 23                    25 - 47
// Eräpäivä 6 VVKKPP                                48 - 53

function errorMessage(message) {
    alert("Error: " + message);
}

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

function formatIBAN(rawNo) {
    formatted = rawNo.slice(0,2) + " " + rawNo.slice(2, 6) + " " + rawNo.slice(6, 10) + " " + rawNo.slice(10, 14) + " " + rawNo.slice(-2);
    return formatted;
}

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

function parseVirtual() {
    vCode = document.getElementById("virtual_barcode").value;
    if (vCode.length != 54){
        return errorMessage("invalid barcode length");
    }

    version = vCode.slice(0, 1);
    if (version == 4) {
        refNo = refVer4(vCode.slice(28, 48));
    } else if (version == 5) {
        refNo = refVer5(vCode.slice(25, 48));
    } else {
        errorMessage("invalid barcode version");
        return;
    }
    iban = formatIBAN(vCode.slice(1, 17));
    amount = parseInt(vCode.slice(17, 23), 10) + "," + vCode.slice(23, 25);
    dueDate = parseDate(vCode.slice(-6));

    document.getElementById("iban").innerText = iban;
    document.getElementById("amount").innerText = amount;
    document.getElementById("reference").innerText = refNo;
    document.getElementById("due_date").innerText = dueDate;

    var element = document.getElementById("barcode");
    JsBarcode(element, vCode, {format: "CODE128C"});
}

function setGreyOnFocus(element) {
    element.onfocus = function() {
            element.style = "background: lightgrey";
        }
    element.onblur = function() {
            element.style = "background: white";
        }
}

window.onload = function(n) {
    textInputs = document.getElementsByClassName("text_input");
    for (i = 0; i < textInputs.length; i++) {
        setGreyOnFocus(textInputs[i]);
    }
    document.getElementById("btn_decode").onclick = parseVirtual;
}