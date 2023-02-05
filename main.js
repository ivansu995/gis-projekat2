// wms sources
var wmsSourceLegend = new ol.source.TileWMS({
    url: "http://localhost:8080/geoserver/nis/wms",
    params: {
        LAYERS: "nis:planet_osm_polygon",
        TILED: true,
    },
    serverType: "geoserver",
});

var wmsSourceRoads = new ol.source.TileWMS({
    url: "http://localhost:8080/geoserver/nis/wms",
    params: {
        LAYERS: "nis:roads",
        TILED: true,
    },
    serverType: "geoserver",
});

var wmsSourceSchools = new ol.source.TileWMS({
    url: "http://localhost:8080/geoserver/nis/wms",
    params: {
        LAYERS: "nis:schools",
        TILED: true,
    },
    serverType: "geoserver",
});

var wmsSourceRailway = new ol.source.TileWMS({
    url: "http://localhost:8080/geoserver/nis/wms",
    params: {
        LAYERS: "nis:railway",
        TILED: true,
    },
    serverType: "geoserver",
});

var wmsSourceRivers = new ol.source.TileWMS({
    url: "http://localhost:8080/geoserver/nis/wms",
    params: {
        LAYERS: "nis:rivers",
        TILED: true,
    },
    serverType: "geoserver",
});

// kafici/banke/apoteke itd.
var wmsSourcePoints = new ol.source.TileWMS({
    url: "http://localhost:8080/geoserver/nis/wms",
    params: {
        LAYERS: "nis:points",
        TILED: true,
    },
    serverType: "geoserver",
});

var wmsSourceFaculty = new ol.source.TileWMS({
    url: "http://localhost:8080/geoserver/nis/wms",
    params: {
        LAYERS: "nis:faculty",
        TILED: true,
    },
    serverType: "geoserver",
});

var wmsSourceBuildings = new ol.source.TileWMS({
    url: "http://localhost:8080/geoserver/nis/wms",
    params: {
        LAYERS: "nis:buildings",
        TILED: true,
    },
    serverType: "geoserver",
});

// popup
const container = document.getElementById("popup");
const content = document.getElementById("popup-content");
const closer = document.getElementById("popup-closer");

closer.onclick = function () {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};

const overlay = new ol.Overlay({
    element: container,
    autoPan: {
        animation: {
            duration: 250,
        },
    },
});

// map
var map = new ol.Map({
    target: "map",
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM(),
        }),
        new ol.layer.Group({
            layers: [
                new ol.layer.Tile({
                    source: wmsSourceSchools,
                }),
                new ol.layer.Tile({
                    source: wmsSourceFaculty,
                }),
                new ol.layer.Tile({
                    source: wmsSourceBuildings,
                }),
                new ol.layer.Tile({
                    source: wmsSourceRailway,
                }),
                new ol.layer.Tile({
                    source: wmsSourceRivers,
                }),
                new ol.layer.Tile({
                    source: wmsSourceRoads,
                }),
                new ol.layer.Tile({
                    source: wmsSourcePoints,
                }),
            ],
        }),
    ],
    overlays: [overlay],
    view: new ol.View({
        center: ol.proj.fromLonLat([21.91975, 43.32]),
        zoom: 12,
    }),
});

map.on("singleclick", function (evt) {
    document.getElementById("info").innerHTML = "";
    const viewResolution = /** @type {number} */ (
        map.getView().getResolution()
    );
    const urlPoints = wmsSourcePoints.getFeatureInfoUrl(
        evt.coordinate,
        viewResolution,
        "EPSG:3857",
        { INFO_FORMAT: "application/json" }
    );
    const coordinate = evt.coordinate;

    const urlSchools = wmsSourceSchools.getFeatureInfoUrl(
        evt.coordinate,
        viewResolution,
        "EPSG:3857",
        { INFO_FORMAT: "application/json" }
    );

    const urlBuildings = wmsSourceBuildings.getFeatureInfoUrl(
        evt.coordinate,
        viewResolution,
        "EPSG:3857",
        { INFO_FORMAT: "application/json" }
    );

    const urlFaculty = wmsSourceFaculty.getFeatureInfoUrl(
        evt.coordinate,
        viewResolution,
        "EPSG:3857",
        { INFO_FORMAT: "application/json" }
    );

    if (urlPoints || urlSchools || urlFaculty) {
        console.log(urlPoints);
        console.log(urlSchools);
        fetch(urlPoints)
            .then((res) => res.json())
            .then((data) => {
                // console.log(data.features[0].properties.name);
                content.innerHTML =
                    "<p>" + data.features[0].properties.name + "</p>";
                overlay.setPosition(coordinate);
            });
        fetch(urlSchools)
            .then((res) => res.json())
            .then((data) => {
                // console.log(data);
                content.innerHTML =
                    "<p>" + data.features[0].properties.name + "</p>";
                overlay.setPosition(coordinate);
            });

        fetch(urlBuildings)
            .then((res) => res.json())
            .then((data) => {
                // console.log(data);
                content.innerHTML =
                    "<p>" + data.features[0].properties.name + "</p>";
                overlay.setPosition(coordinate);
            });

        fetch(urlFaculty)
            .then((res) => res.json())
            .then((data) => {
                // console.log(data);
                content.innerHTML =
                    "<p>" + data.features[0].properties.name + "</p>";
                overlay.setPosition(coordinate);
            });
    }
});

const updateLegend = function (resolution) {
    const graphicUrl = wmsSourceLegend.getLegendUrl(resolution);
    const img = document.getElementById("points");
    img.src = graphicUrl;
};

// Initial legend
const resolution = map.getView().getResolution();
updateLegend(resolution);

// Update the legend when the resolution changes
map.getView().on("change:resolution", function (event) {
    const resolution = event.target.getResolution();
    updateLegend(resolution);
});

function bindInputs(layerid, layer) {
    const visibilityInput = $(layerid + " input.visible");
    visibilityInput.on("change", function () {
        layer.setVisible(this.checked);
    });
    visibilityInput.prop("checked", layer.getVisible());

    const opacityInput = $(layerid + " input.opacity");
    opacityInput.on("input", function () {
        layer.setOpacity(parseFloat(this.value));
    });
    opacityInput.val(String(layer.getOpacity()));
}
function setup(id, group) {
    group.getLayers().forEach(function (layer, i) {
        const layerid = id + i;
        bindInputs(layerid, layer);
        if (layer instanceof ol.layer.Group) {
            setup(layerid, layer);
        }
    });
}
setup("#layer", map.getLayerGroup());

$("#layertree li > span")
    .click(function () {
        $(this).siblings("fieldset").toggle();
    })
    .siblings("fieldset")
    .hide();
