// Create the 'basemap' tile layer that will be the background of our map.
let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});


// OPTIONAL: Step 2
// Create the 'street' tile layer as a second background of the map
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

// Create the map object with center and zoom options.
let map = L.map("map", {
  center: [20, 0], // Center as it would be like looking at a world map
  zoom: 3, // Zoom to see majority of Earth
  layers: [topo] // Default layer
});

// Then add the 'basemap' tile layer to the map.

// OPTIONAL: Step 2
// Create the layer groups, base maps, and overlays for our two sets of data, earthquakes and tectonic_plates.
// Add a control to the map that will allow the user to change which layers are visible.
let baseMaps = {
  "Topographic Map": topo,
  "Street Map": street
};

// Earthquake and Tectonic Layer Groups
let earthquakes = new L.LayerGroup();
let tectonicPlates = new L.LayerGroup();

// Overlay object
let overlayMaps = {
  "Earthquakes": earthquakes,
  "Tectonic Plates": tectonicPlates
};
// Connects and makes control
L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 0.75,
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "#000",
      radius: getRadius(feature.properties.mag),
      weight: 0.5
    };
  }

  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) { // Created a Green - Red Scale
    return depth > 90 ? "#a50026" :
           depth > 70 ? "#d73027" :
           depth > 50 ? "#f46d43" :
           depth > 30 ? "#fdae61" :
           depth > 10 ? "#a6d96a" :
                        "#1a9850";
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    return magnitude === 0 ? 1 : magnitude * 4; // If zero default to 1, if non-null, multipy by 4
  }

  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        `<strong>Magnitude:</strong> ${feature.properties.mag}<br>
        <strong>Location:</strong> ${feature.properties.place}<br>
        <strong>Depth:</strong> ${feature.geometry.coordinates[2]} km`
      );
    }
  // OPTIONAL: Step 2
  // Add the data to the earthquake layer instead of directly to the map.
  }).addTo(earthquakes);

  earthquakes.addTo(map);
  // Create a legend control object.
  let legend = L.control({
    position: "bottomright" // Position on screen
  });

  // Then add all the details for the legend
  // Initialize depth intervals and colors for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    let depthIntervals = [-10, 10, 30, 50, 70, 90];
    let colors = ["#1a9850", "#91cf60", "#d9ef8b", "#fee08b", "#fc8d59", "#d73027"];

    // Loop through our depth intervals to generate a label with a colored square for each interval.
    for (let i = 0; i < depthIntervals.length; i++) {
      div.innerHTML +=
        `<i style="background: ${colors[i]}"></i> ${depthIntervals[i]}${depthIntervals[i + 1] ? "&ndash;" + depthIntervals[i + 1] : "+"}<br>`;
    }

    return div;
  };

  // Finally, add the legend to the map.
  legend.addTo(map);

  // OPTIONAL: Step 2
  // Make a request to get our Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
    // Save the geoJSON data, along with style information, to the tectonic_plates layer.
    L.geoJson(plate_data, {
      color: "darkorange",
      weight: 2
    }).addTo(tectonicPlates);

    // Then add the tectonic_plates layer to the map.
    tectonicPlates.addTo(map);
  });
});
