var map = new mapboxgl.Map({
    container: 'map', 
    style: {
        "version": 8,
        "sources": {
            "raster-tiles": {
                "type": "raster",
                "tiles": ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
                "tileSize": 256
            }
        },
        "layers": [{
            "id": "simple-tiles",
            "type": "raster",
            "source": "raster-tiles",
            "minzoom": 0,
            "maxzoom": 22
        }]
    },
    center: [34.799722, 31.258889], 
    zoom: 6,
    attributionControl: false
});
map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.AttributionControl({
    compact: false,
    customAttribution: `<a href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox</a> <a href="http://www.openstreetmap.org/about/" target="_blank">© OpenStreetMap</a> Data From: <a href="https://opensky-network.org" target="_blank">opensky-network</a> `
}), 'bottom-left');
var center = [34.799722, 31.258889];
var radius = 10;
var options = {steps: 20, units: 'kilometers', properties: {foo: 'bar'}};
var circle = turf.circle(center, radius, options);
var data, plane, center, line, distance, distances, coords, bearings, points, rotatedPoly;
map.on('load', function () {
    //https://opensky-network.org/api/states/all?lamin=34.24892&lomin=29.57574&lamax=35.87372&lomax=33.30793 Israel+
    $.getJSON('https://opensky-network.org/api/states/all',function(response){
        data = response;
        geojson = {'type': "FeatureCollection",'features':[]}
        
            $.getJSON('./plane.geojson',function(response){
                plane = response;
                map.addLayer({
                    'id': 'plane',
                    'type': 'fill',
                    'source': {
                    'type': 'geojson',
                    'data': plane
                    },'paint': {
                        'fill-color': '#3bb2d0',
                        'fill-opacity': 0.9
                    }
                    });
                //plane = turf.transformScale(plane, 150);
                plane = turf.transformRotate(plane, -31);
                
                center = [data.states[0][5],data.states[0][6]]
                
                coords = plane.features[0].geometry.coordinates[0]
           
                coords = plane.features[0].geometry.coordinates[0]

                for(p in data.states){
                    if(data.states[p][5]){
                    
                    var feature  = {
                        type: "Feature",
                        properties:{
                            
                        },
                        geometry: {
                        type: "Polygon",
                        coordinates: polygonToMarker([data.states[p][5],data.states[p][6]], coords,  data.states[p][10], 150 )["geometry"]["coordinates"]
                        },
                        crs: {
                        type: "name",
                        properties: {
                            name: "urn:ogc:def:crs:EPSG::4326"
                        }
                        }
                    };
                    
                    feature.properties["icao24"] = data.states[p][0]
                    feature.properties["callsign"] = data.states[p][1]
                    feature.properties["origin_country"] = data.states[p][2]
                    unix_timestamp = data.states[p][10]
                    var date = new Date(unix_timestamp*1000);
                    var hours = date.getHours();
                    var minutes = "0" + date.getMinutes();
                    var seconds = "0" + date.getSeconds();
                    var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
                    feature.properties["time_position"] = formattedTime
                    feature.properties["on_ground"] = data.states[p][8]
                    feature.properties["velocity"] = data.states[p][9]*3.6
                    feature.properties["center"] = [data.states[p][5],data.states[p][6]]
                    feature.properties["bearing"] = data.states[p][10]
                    feature.properties["base_height"]  = data.states[p][7]
                    feature.properties["height"] = data.states[p][7]+20
                    geojson.features.push(feature)
                    }
                }
                
                map.addLayer({
                    'id': 'shadows',
                    'type': 'fill',
                    'source': {
                    'type': 'geojson',
                    'data': geojson
                    },'paint': {
                        'fill-color': 'black',
                        'fill-opacity': 0.4
                    }
                    });
                
                
                map.addLayer({
                    'id': 'planes',
                    'type': 'fill-extrusion',
                    'source': {
                    'type': 'geojson',
                    'data': geojson 
                    },'paint': {
                        'fill-extrusion-color': '#ff6f69',
                        'fill-extrusion-opacity': 1,
                        'fill-extrusion-height': ['get', 'height'],
                        'fill-extrusion-base':  ['get', 'base_height']
                    }
                    });
                   
            })
            popup = new mapboxgl.Popup()
            map.on('click', 'planes', function (e) {
                var coordinates = JSON.parse(e.features[0].properties.center);
                
                var description = "ICAO24 Code: "+e.features[0].properties.icao24+"<br>"+
                "Call Sign: "+e.features[0].properties.callsign+"<br>"+
                "Origin Country: "+e.features[0].properties.origin_country+"<br>"+
                //""+e.features[0].properties.time_position+"<br>"+
                "Velocity: "+e.features[0].properties.velocity+" km/h <br>"+
                "Bearing: "+e.features[0].properties.bearing+"&#176;<br>"+
                "Barometric Height: "+e.features[0].properties.base_height+" meters<br>"+
                ""+((e.features[0].properties.on_ground)? "<span style='color: green;'>On The Ground</span>": "<span style='color: blue;'>In The Air</span>");
                 
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
                 
                popup
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(map);
                });

                
                map.on('mouseenter', 'planes', function () {
                    map.getCanvas().style.cursor = 'pointer';
                });
                     
    
                map.on('mouseleave', 'planes', function () {
                    map.getCanvas().style.cursor = '';
                });
                
    })

    
});
