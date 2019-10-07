function polygonToMarker(center, coordinates, bearing, scale ){
    distances = []
    bearings = []
    centroid = turf.center(turf.polygon([coordinates]))
        for(i in coordinates){
            to = turf.point(coordinates[i]);
            options = {units: 'kilometers'};
            distanceI = turf.distance(centroid, to, options);
            bearingI = turf.bearing(centroid, to);
            bearings.push(bearingI)
            distances.push(distanceI)
            }
    //console.log({distances, bearings})
    points = []
    for(j in distances){
        distanceJ = distances[j]
        bearingJ = bearings[j]
        point = turf.destination(center, distanceJ, bearingJ);
        points.push(point.geometry.coordinates)
    }
    polygon = turf.polygon([points])
    if(bearing){
        polygon = turf.transformRotate(polygon,bearing);
    }
    if(scale){
        polygon = turf.transformScale(polygon, scale);
    }
    return polygon
}