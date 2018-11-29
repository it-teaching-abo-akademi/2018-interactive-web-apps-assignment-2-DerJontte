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

}

var parseVirtual = function(){
    vCode = document.getElementById("virtual_barcode").value;
    if (vCode.length != 54){
        return errorMessage("invalid barcode length");
    }

    version = vCode.slice(0, 1);
    iban = vCode.slice(1, 17);
    amount = parseInt(vCode.slice(17, 23), 10) + "," + vCode.slice(23, 25);
    refNo = vCode.slice(25, 48);
    dueDate = parseDate(vCode.slice(-6));

    document.getElementById("iban").innerText = iban;
    document.getElementById("amount").innerText = amount;
    document.getElementById("reference").innerText = refNo;
    document.getElementById("due_date").innerText = dueDate;

    document.getElementById('barcode').innerText = vCode;
}

window.onload = function(n) {
    //Attach the onclick handler defined in step 1
    document.getElementById("btn_decode").onclick = parseVirtual;
}