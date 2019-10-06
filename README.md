# 3D Markers of Flights Locations

Using known bearings and distances between the center of a polygon and each of its vertices,
It's possible to use [MapBox GL JS](https://docs.mapbox.com/mapbox-gl-js/overview/) along with [Turf.js](https://turfjs.org/docs) to create markers based on a simply (not very well) drawn polygon.

The planes' heading is based on the bearing reported, their base height is based on barometric altitude reported,
and the height for all of them is 20 meters.
### Each plane is drawn 150 times larger than a normal plane size.
