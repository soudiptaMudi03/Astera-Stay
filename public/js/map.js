//making coordinate string to number array
function stringToNum(coordinates) {
    let numbers = coordinates.replace('[', '').replace(']', '').split(',');
    let num1 = parseFloat(numbers[0]);
    let num2 = parseFloat(numbers[1]);
    return [num1, num2];
}
let coord = stringToNum(coordinates);

//creating map using maptiler
maptilersdk.config.apiKey = mapToken;
const map = new maptilersdk.Map({
    container: 'map', // container's id or the HTML element to render the map
    style: maptilersdk.MapStyle.STREETS,
    center: coord, // starting position [lng, lat]
    zoom: 14, // starting zoom
});


//adding  marker to the map using maptiler
const marker = new maptilersdk.Marker({
    color: "#FF0000",
    draggable: true
}).setLngLat(coord)
    .addTo(map);

const markerHeight = 50, markerRadius = 10, linearOffset = 25;
const popupOffsets = {
    'top': [0, 0],
    'top-left': [0,0],
    'top-right': [0,0],
    'bottom': [0, -markerHeight],
    'bottom-left': [linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
    'bottom-right': [-linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
    'left': [markerRadius, (markerHeight - markerRadius) * -1],
    'right': [-markerRadius, (markerHeight - markerRadius) * -1]
};
const popup = new maptilersdk.Popup({offset: popupOffsets, className: 'my-class'})
.setLngLat(coord)
.setHTML(`<p>Here your can stay</p>`)
.setMaxWidth("600px")
.addTo(map);