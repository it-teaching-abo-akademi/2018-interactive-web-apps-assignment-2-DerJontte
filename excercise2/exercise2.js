var map;
var newMarker = null;

function makeMap(){
    navigator.geolocation.getCurrentPosition(drawMap);
}

function drawMap(position) {
    var currPos = { lat: position.coords.latitude,
        lng: position.coords.longitude};
    map = new google.maps.Map(document.getElementById("googleMap"), {
        center: currPos,
        zoom:15
    });

    var marker = new google.maps.Marker({
        position: currPos,
        map: map,
        title: 'Hello World!'
    });
}

function setMarker(){
    if (newMarker != null) {
        newMarker.setMap(null);
    }
    newMarker = new google.maps.Marker({
        position: map.center.valueOf(),
        map: map,
        title: 'helo2'
    });
}
