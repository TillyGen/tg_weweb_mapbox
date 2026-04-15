export default {
    editor: {
        designSystemId: 'bf0afd2b-e049-43c4-a15b-a3404b877a1e',
    },
    properties: {
        accessToken: {
            label: { en: 'Access Token' },
            type: 'Text',
            section: 'settings',
            bindable: true,
            defaultValue: '',
        },
    },
    actions: [
        {
            name: 'Forward Geocoding',
            code: 'forwardGeocoding',
            isAsync: true,
            /* wwEditor:start */
            parameters: [
                { name: 'query', label: { en: 'Search query' }, type: 'Text', bindable: true, required: true },
                { name: 'limit', label: { en: 'Limit (1-10)' }, type: 'Number', bindable: true },
                { name: 'proximity', label: { en: 'Proximity "lon,lat" (optional)' }, type: 'Text', bindable: true },
                { name: 'country', label: { en: 'Country codes, comma-separated' }, type: 'Text', bindable: true },
                { name: 'language', label: { en: 'Language code' }, type: 'Text', bindable: true },
                { name: 'types', label: { en: 'Types, comma-separated' }, type: 'Text', bindable: true },
                { name: 'bbox', label: { en: 'Bbox "minLon,minLat,maxLon,maxLat"' }, type: 'Text', bindable: true },
                { name: 'autocomplete', label: { en: 'Autocomplete' }, type: 'OnOff', bindable: true },
                { name: 'fuzzyMatch', label: { en: 'Fuzzy match' }, type: 'OnOff', bindable: true },
                { name: 'routing', label: { en: 'Routing' }, type: 'OnOff', bindable: true },
                { name: 'worldview', label: { en: 'Worldview' }, type: 'Text', bindable: true },
                { name: 'endpoint', label: { en: 'Endpoint (places | places-permanent)' }, type: 'Text', bindable: true },
            ],
            /* wwEditor:end */
        },
        {
            name: 'Reverse Geocoding',
            code: 'reverseGeocoding',
            isAsync: true,
            /* wwEditor:start */
            parameters: [
                { name: 'longitude', label: { en: 'Longitude' }, type: 'Number', bindable: true, required: true },
                { name: 'latitude', label: { en: 'Latitude' }, type: 'Number', bindable: true, required: true },
                { name: 'limit', label: { en: 'Limit (1-5)' }, type: 'Number', bindable: true },
                { name: 'country', label: { en: 'Country codes, comma-separated' }, type: 'Text', bindable: true },
                { name: 'language', label: { en: 'Language code' }, type: 'Text', bindable: true },
                { name: 'types', label: { en: 'Types, comma-separated' }, type: 'Text', bindable: true },
                { name: 'worldview', label: { en: 'Worldview' }, type: 'Text', bindable: true },
                { name: 'endpoint', label: { en: 'Endpoint (places | places-permanent)' }, type: 'Text', bindable: true },
            ],
            /* wwEditor:end */
        },
        {
            name: 'Get Directions',
            code: 'getDirections',
            isAsync: true,
            /* wwEditor:start */
            parameters: [
                { name: 'profile', label: { en: 'Profile (driving | driving-traffic | walking | cycling)' }, type: 'Text', bindable: true, required: true },
                { name: 'coordinates', label: { en: 'Coordinates "lon,lat;lon,lat" or array of [lon,lat]' }, type: 'Text', bindable: true, required: true },
                { name: 'alternatives', label: { en: 'Alternatives' }, type: 'OnOff', bindable: true },
                { name: 'geometries', label: { en: 'Geometries (geojson | polyline | polyline6)' }, type: 'Text', bindable: true },
                { name: 'overview', label: { en: 'Overview (full | simplified | false)' }, type: 'Text', bindable: true },
                { name: 'steps', label: { en: 'Steps' }, type: 'OnOff', bindable: true },
                { name: 'annotations', label: { en: 'Annotations, comma-separated' }, type: 'Text', bindable: true },
                { name: 'language', label: { en: 'Language code' }, type: 'Text', bindable: true },
                { name: 'voiceInstructions', label: { en: 'Voice instructions' }, type: 'OnOff', bindable: true },
                { name: 'bannerInstructions', label: { en: 'Banner instructions' }, type: 'OnOff', bindable: true },
                { name: 'continueStraight', label: { en: 'Continue straight' }, type: 'OnOff', bindable: true },
                { name: 'exclude', label: { en: 'Exclude (e.g. "toll,motorway")' }, type: 'Text', bindable: true },
                { name: 'approaches', label: { en: 'Approaches, semicolon-separated' }, type: 'Text', bindable: true },
                { name: 'waypoints', label: { en: 'Waypoint indices, semicolon-separated' }, type: 'Text', bindable: true },
                { name: 'waypointNames', label: { en: 'Waypoint names, semicolon-separated' }, type: 'Text', bindable: true },
                { name: 'radiuses', label: { en: 'Radiuses, semicolon-separated' }, type: 'Text', bindable: true },
                { name: 'bearings', label: { en: 'Bearings, semicolon-separated' }, type: 'Text', bindable: true },
            ],
            /* wwEditor:end */
        },
    ],
};
