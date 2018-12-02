var historyData = new Array();
var markers = new Array();
var map;

function populateCountries() {
    var options = [ ["FI", "Finland"],
                    ["SE", "Sweden"],
                    ["FR", "France",],
                    ["DE", "Germany"] ];
    options.forEach((value, index) => {
        var newOption = $('<option value="' + value[0] + '">' + value[1] + '</option>');
        $("#countries").append(newOption);
    });
}

function makeMap(){
    navigator.geolocation.getCurrentPosition(drawMap);
}

function drawMap(position) {
    currPos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude};
    map = new google.maps.Map(document.getElementById("box_map"), {
        center: currPos,
        zoom: 10
    });
}

function setMarker(position, placeName){
    var marker = new google.maps.Marker({
        position: position,
        map: map,
        title: placeName
    });
    markers.push(marker);
    map.setCenter(position);
}

function clearMarkers() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}

function fetchData(countryCode, zipCode){
    $.getJSON("http://api.zippopotam.us/" + countryCode + "/" + zipCode, function(data) {
        clearMarkers();
        let response = JSON.parse(JSON.stringify(data));
        let places = JSON.parse(JSON.stringify(response.places));
        let result = '<table class="resultTable"><tr><td class="resultCol1">Place name</td><td class="resultCol2">Longitude</td><td class="resultCol3">Latitude</td></tr>';
        for (let i = 0; i < places.length; i++) {
            let position = new google.maps.LatLng(places[i].latitude, places[i].longitude);
            let placeName = places[i]["place name"];
            result += '<tr><td>'+ placeName + '</td><td>'+ places[i]["longitude"]+'</td><td>'+places[i]["latitude"]+'</td></tr>';
            setMarker(position, placeName);
        }
        result += "</table>"
        let height = ((places.length + 1) *1.4) + "em";
        $("#box_results").css("height", height);
        $("#box_results").html(result);
    });
}

function searchClicked() {
    countryCode = $("#countries").val();
    zipCode = $("#zip").val();

    historyData.unshift($("#countries option[value=" + countryCode + "]").text() + " " + zipCode + "<br>");
    if (historyData.length > 9) {
        historyData.pop();
    }
    $("#history").html(historyData);
    localStorage.setItem("history", historyData);
    fetchData(countryCode, zipCode);
}

window.onload = function() {
    populateCountries();
    historyData = localStorage.getItem("history").split(',');
    $("#history").html(historyData);
    $("#btn_search").click(searchClicked);
    $("#zip").keypress(function (key) {
        if (key.which == 13) {
            $("#btn_search").click();
        }
    });}
