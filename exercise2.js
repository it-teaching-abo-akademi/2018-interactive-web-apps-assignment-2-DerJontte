// Global variables: search history, the list of current markers on the map, and the map itself.
var historyData = new Array();
var markers = new Array();
var map;

// Create and render the dropdown menu with countries.
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

// Get the approximate location of the user and call a function to create a map instance that is centered on said location.
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

// Function to set a marker with a specific name on a specific location on the map
function setMarker(position, placeName){
    var marker = new google.maps.Marker({
        position: position,
        map: map,
        title: placeName
    });
    markers.push(marker);
    map.setCenter(position);
}

// Function to remove all markers from the map and empty the list of markers.
function clearMarkers() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

/* This is where the magic happens. ;) This function takes a country code and a zipcode as agruments and queries
zipopotamus for the given data. The data the server returns is then used to:
     - create a list of the location(s) associated with the given zipcode and
     - place markers on those locations on the map (after any earlier markers are removed).
*/
function fetchData(countryCode, zipCode){
    // Fetch data from server and execute a lambda callback-function:
    $.getJSON("http://api.zippopotam.us/" + countryCode + "/" + zipCode, function(data) {
        // Delete old markers
        clearMarkers();

        // Parse the data from the server
        let response = JSON.parse(JSON.stringify(data));
        let places = JSON.parse(JSON.stringify(response.places));

        // Create a table with the results
        let result = '<table class="resultTable"><tr><td class="resultCol1">Place name</td><td class="resultCol2">Longitude</td><td class="resultCol3">Latitude</td></tr>';

        // Iterate over all (if any) places that have the specified zip code:
        for (let i = 0; i < places.length; i++) {
            // Create table rows with the names and coordinates of the places that have the specified zip code
            let position = new google.maps.LatLng(places[i].latitude, places[i].longitude);
            let placeName = places[i]["place name"];
            result += '<tr><td>'+ placeName + '</td><td>'+ places[i]["longitude"]+'</td><td>'+places[i]["latitude"]+'</td></tr>';
            // Put markers on the map
            setMarker(position, placeName);
        }
        result += "</table>"

        // Resize the results-section on the html-page
        let height = ((places.length + 1) *1.4) + "em";
        $("#box_results").css("height", height);

        // Insert the table with results in the page
        $("#box_results").html(result);
    });
}

// Function executed when the user clicks on the search-button
function searchClicked() {
    countryCode = $("#countries").val();
    zipCode = $("#zip").val();

    // Update the search history
    historyData.unshift($("#countries option[value=" + countryCode + "]").text() + " " + zipCode + "<br>");
    // If history is full, remove the oldest element
    if (historyData.length > 9) {
        historyData.pop();
    }
    // Update the history shown on the html-page and
    $("#history").html(historyData);
    // store the history on the users system.
    localStorage.setItem("history", historyData);
    // Get the requested data.
    fetchData(countryCode, zipCode);
}

// Function to execute when the page is loaded into the browser window
window.onload = function() {
    populateCountries();
    // Load the saved search history from an earlier session
    historyData = localStorage.getItem("history").split(',');
    if (historyData != null) {
        $("#history").html(historyData);
    }
    $("#btn_search").click(searchClicked);
    // When the zip-input is active and the user presses enter, fire off the search-button
    $("#zip").keypress(function (key) {
        if (key.which == 13) {
            $("#btn_search").click();
        }
    });}
