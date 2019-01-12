var routePath;
var map;

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

function populateRoutes() {
    $.getJSON("http://data.foli.fi/gtfs/routes", function(response) {
        let toReturn = [];

        for (let i = 0; i < response.length; i++) {
            let currentRoute = response[i];
            let key = currentRoute.route_short_name;
            let value = key + ": " + currentRoute.route_long_name;
            toReturn.push({key: key, value: value, id: currentRoute.route_id});
        }
        toReturn = toReturn.sort(function (a, b) {
            let regex = /\D/;
            if(isNaN(a.key[0]) || isNaN(b.key[0])) {
                return a.key.localeCompare(b.key);
            }
            let aTemp = isNaN(a.key) ? a.key.replace(regex, "") : a.key;
            let bTemp = isNaN(b.key) ? b.key.replace(regex, "") : b.key;
            if (aTemp === bTemp) return a.key.localeCompare(b.key);
            return aTemp - bTemp;
        });
        $("#route_number").append(new Option("--- Select route ---", "undefined"));
        toReturn.forEach(item => {
            var newOption = new Option(item.value, item.id);
            $("#route_number").append(newOption);
        });
    });
}

function plotRoute(routeID) {
    if (routeID === "undefined") {
        return;
    }
    $.getJSON("http://data.foli.fi/gtfs/trips/route/" + routeID, function (routeTrips) {
        var shape = routeTrips[0].shape_id;
        $.getJSON("http://data.foli.fi/gtfs/v0/20190103-094234/shapes/" + shape, function (routePoints) {
            let routeLine = [];
            for (let i = 0; i < routePoints.length; i++) {
                let newPoint = {lat: routePoints[i].lat, lng: routePoints[i].lon};
                routeLine.push(newPoint);
            }
            if (routePath !== undefined) {
                routePath.setMap(null);
            }
            routePath = new google.maps.Polyline({
                path: routeLine,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
            routePath.setMap(map);
        });
    });
}

// Function to set a marker with a specific name on a specific location on the map
function setMarker(position, markerName){
    var marker = new google.maps.Marker({
        position: position,
        map: map,
        title: markerName
    });
    markers.push(marker);
}

// Function to remove all markers from the map and empty the list of markers.
function clearMarkers() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

// Function to execute when the page is loaded into the browser window
window.onload = function() {
    populateRoutes();

    $("#btn_show_route").click(function () {
        let routeID = $("#route_number option:selected").val();
        plotRoute(routeID);
    });

    $("#btn_clear_route").click(function () {
        if (routePath !== undefined) {
            routePath.setMap(null);
        }
    });
};
