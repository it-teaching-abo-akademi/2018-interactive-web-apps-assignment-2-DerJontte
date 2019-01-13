var routePath, plottedLine, plottedVehicles, routeName, map;
var markers = [];

// Function that creates the Google map. Hardcoded to start centered on Turku market square, the main hub for
// local mass transit.
function makeMap() {
    currPos = {
        lat: 60.45165,
        lng: 22.2676
    };
    map = new google.maps.Map(document.getElementById("route_map"), {
        center: currPos,
        zoom: 12
    });
}

// Function to set a marker with a specific name on a given location on the map
function setMarker(position, markerName){
    let marker = new google.maps.Marker({
        position: position,
        map: map,
        title: markerName
    });
    markers.push(marker); // Save the marker so that it can be removed when needed
}

// Function to remove all markers from the map and empty the list of markers.
function clearMarkers() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

// Function that fetches route data from the server, parses it and populates the dropdown list with a human readable
// list of bus lines.
function populateRouteList() {
    $.getJSON("http://data.foli.fi/gtfs/routes", function(response) { // Fetch the data
        let routeList = [];

        // Sort the data by the line number
        response = response.sort(function (a, b) {
            let regex = /\D/;
            // If the first charachter in either line number is a letter, sort them lexicographically so that such lines will
            // be last in the list. These lines are service lines and internal lines in the surrounding municipalities.
            if(isNaN(a.route_short_name[0]) || isNaN(b.route_short_name[0])) {
                return a.route_short_name.localeCompare(b.route_short_name);
            }
            // If either line has a non-numerical character that is not the first character, sort them primarily by their
            // numerical part and secondarily by their non-numerical part.
            let aTemp = isNaN(a.route_short_name) ? a.route_short_name.replace(regex, "") : a.route_short_name;
            let bTemp = isNaN(b.route_short_name) ? b.route_short_name.replace(regex, "") : b.route_short_name;
            if (aTemp === bTemp) return a.route_short_name.localeCompare(b.route_short_name);

            // If both line numbers are actual integers, sort them from smaller to bigger
            return aTemp - bTemp;
        });

        // Go through the sorted data and parse it into the list that is shown in the dropdown menu
        response.forEach(item => {
            let lineName = item.route_short_name + ": " + item.route_long_name;
            var newOption = new Option(lineName, JSON.stringify({name: item.route_short_name, lineID: item.route_id}));
            $("#route_number").append(newOption);
        });
    });
}

// Function that draws the route of a given bus line
function plotRoute(selectedLine) {
    // Get the line ID and fetch the route coordinates from the server
    let routeID = JSON.parse(selectedLine).lineID;
    $.getJSON("http://data.foli.fi/gtfs/trips/route/" + routeID, function (routeTrips) {

        // Most lines have a few different variations of the route. Find the most common route shape for the line.
        var table = {};
        Object.getOwnPropertyNames(routeTrips).forEach(index => {
            // Create a table with a key for each route shape and count the number of times that shape occurs in the data
            let route = routeTrips[index];
            if (route.shape_id in table) {
                table[route.shape_id] += 1;
            } else {
                table[route.shape_id] = 1;
            }
        });

        // Find the route shape with the most occurances
        let biggest = {name: "", value: 0};
        Object.getOwnPropertyNames(table).forEach(name => {
            biggest = (table[name] > biggest.value) ? {name: name, value: table[name]} : biggest;
        });

        // Fetch the shape that was selected above and draw it on the map
        $.getJSON("http://data.foli.fi/gtfs/v0/20190103-094234/shapes/" + biggest.name, function (routePoints) {
            let routeLine = [];
            // Create a Google Maps API-compatible list with the route points
            for (let i = 0; i < routePoints.length; i++) {
                let newPoint = {lat: routePoints[i].lat, lng: routePoints[i].lon};
                routeLine.push(newPoint);
            }

            // If there is an earlier route drawn on the map, remove it
            if (routePath !== undefined) {
                clearRoute();
            }

            // If there are buses from another line plotted on the map, remove them
            if (plottedVehicles !== selectedLine) {
                clearMarkers();
                plottedVehicles = undefined;
            }

            // Create the polyline that will be drawn on the map
            routePath = new google.maps.Polyline({
                path: routeLine,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2
            });

            // Draw the polyline on the map and memorize the plotted line in a global variable
            routePath.setMap(map);
            plottedLine = selectedLine;
        });
    });
}

// Function that removes a drawn route drom the map
function clearRoute() {
    if (routePath !== undefined) {
        routePath.setMap(null);
        routePath = undefined;
    }
}

// Function that sets markers on the map where the buses of the selected line is
function plotVehicles(selectedLine) {
    routeName = JSON.parse(selectedLine).name;

    // Get the vehicle position data from the server
    $.getJSON("http://data.foli.fi/siri/vm/", function(vmData) {
        let vehicleData = vmData.result.vehicles;
        // Remove any earlier markers
        clearMarkers();

        // If there is a bus line plotted that is not the currently selected line, removit
        if (plottedLine !== selectedLine) clearRoute();

        // Parse the vehicle data for the ones that belong to the selected line and set their markers on the map
        Object.getOwnPropertyNames(vehicleData).forEach(itemName => {
            let item = vehicleData[itemName];
            if (item.publishedlinename === routeName) {
                let newPoint = new google.maps.LatLng(item.latitude, item.longitude);
                setMarker(newPoint, item.publishedlinename);
            }
        });
    });
    // Memorize in a global variable which line the plotted buses are from, and set the dropdown to the selected line
    // (the dropdown can be in the "wrong" position eg. when the user clicks the refresh-button)
    plottedVehicles = selectedLine;
    $("#route_number").val(selectedLine);
}

// Simple method to get the currently selected line from the dropdown
function getSelected() {
    return $("#route_number option:selected").val();
}

// Function that executes when the page is loaded into the browser
window.onload = async function () {
    await populateRouteList();

    // Event handlers for the buttons
    $("#btn_show_route").click(function () {
        plotRoute(getSelected());
    });

    $("#btn_refresh").click(function () {
        // Refresh is possible only when there are vehicles plotted onto the map
        if (plottedVehicles === undefined) return;
        plotVehicles(plottedVehicles); // Plot the current vehicles anew
    });

    $("#btn_show_positions").click(function () {
        // If the selected line's buses is already plotted on the map, don't do anything
        if (plottedVehicles === getSelected()) return;
        plotVehicles(getSelected()); // Plot the vehicles of the line that is selected in the dropdown
    });
};
