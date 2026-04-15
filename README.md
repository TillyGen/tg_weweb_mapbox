# MAPBOX ELEMENT

A custom element for [weweb.io](https://www.weweb.io/) that renders a Mapbox map with markers, directions routing and an optional geocoding search box.

## Installation

`npm install`

## Serve locally

`npm run serve --port=[PORT]` — then in the WeWeb editor, open the developer popup and add `localhost:[PORT]` as a custom element.

## Build

`npm run build --name="mapbox-element"`

## Features

- Mapbox GL map with configurable style, center, zoom, pitch, bearing
- Navigation / fullscreen / geolocate / scale controls
- Marker array with formula mapping for dynamic data binding
- Directions routing (driving, driving-traffic, walking, cycling) with waypoints, alternatives, exclusions
- Optional geocoding search box (forward geocoding with autocomplete)
- Trigger events: `map-load`, `map-click`, `marker-click`, `route-loaded`, `search-select`
- Internal variables: `isMapReady`, `currentCenter`, `currentZoom`, `selectedMarker`, `currentRoute`, `searchValue`
