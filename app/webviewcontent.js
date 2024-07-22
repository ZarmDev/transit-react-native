let html = `<!DOCTYPE html>
<html>

<head>
    <title>Leaflet Map</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/ZarmDev/transitHelper@latest/dist/bundle.js"></script>
</head>

<body>
    <div style="height: 100vh;" id="map"></div>
    <h1>Test</h1>
    <script>
        // https://stackoverflow.com/questions/37642481/how-to-draw-a-path-between-two-nodes-using-leaflet
        // 3. 
        var latlngs = [];
        async function test() {
            var trainLineFunc = await getTrainLineShapes();
            console.log(trainLineFunc)
            var trainLineShapes = trainLineFunc[0];
            var trainLineColors = trainLineFunc[1];
            var map = L.map('map').setView([40.71427000, -74.00597000], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
                maxZoom: 18,
            }).addTo(map);
            for (var i = 0; i < trainLineShapes.length - 2; i += 2) {
                console.log([trainLineShapes[i], trainLineShapes[i + 1]])
                var polyline = L.polyline([trainLineShapes[i], trainLineShapes[i + 1]], { color: trainLineColors[i], smoothFactor: '12.00' }).addTo(map);
            }
        }
        test()
    </script>
</body>

</html>`
let js = ``
export { html }