export default {
    editor: {
        label: { en: 'Mapbox Map' },
        icon: 'map',
    },
    actions: [
        {
            action: 'searchAddress',
            label: { en: 'Search address' },
            args: [{ name: 'query', type: 'string' }],
        },
    ],
    triggerEvents: [
        { name: 'map-load', label: { en: 'On map load' }, event: {} },
        {
            name: 'map-click',
            label: { en: 'On map click' },
            event: { lngLat: { lng: 0, lat: 0 } },
        },
        {
            name: 'marker-click',
            label: { en: 'On marker click' },
            event: { marker: {} },
        },
        {
            name: 'route-loaded',
            label: { en: 'On route loaded' },
            event: { route: {}, distance: 0, duration: 0 },
        },
        {
            name: 'search-select',
            label: { en: 'On search result selected' },
            event: { result: {} },
        },
        {
            name: 'address-suggestions',
            label: { en: 'On address suggestions' },
            event: { suggestions: [], query: '' },
        },
    ],
    properties: {
        mode: {
            label: { en: 'Mode' },
            type: 'TextSelect',
            section: 'settings',
            options: {
                options: [
                    { value: 'map', label: 'Map' },
                    { value: 'addressSearch', label: 'Address search' },
                ],
            },
            defaultValue: 'map',
            bindable: true,
        },
        searchContent: {
            hidden: content => content?.mode !== 'addressSearch',
            defaultValue: [],
            type: 'Array',
            options: {
                item: { type: 'wwObject', options: { linkable: true } },
            },
            /* wwEditor:start */
            bindingValidation: {
                type: 'array',
                tooltip: 'Drop your custom input / suggestion list UI here',
            },
            /* wwEditor:end */
        },
        searchLimit: {
            label: { en: 'Suggestion limit' },
            type: 'Number',
            section: 'settings',
            options: { min: 1, max: 10, step: 1 },
            defaultValue: 5,
            bindable: true,
            hidden: content => content?.mode !== 'addressSearch',
            /* wwEditor:start */
            bindingValidation: { type: 'number', tooltip: 'Max number of suggestions (1-10)' },
            /* wwEditor:end */
        },
        // ────── Access ──────
        accessToken: {
            label: { en: 'Mapbox Access Token' },
            type: 'Text',
            section: 'settings',
            bindable: true,
            defaultValue: '',
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'Your Mapbox public access token (pk.*)',
            },
            propertyHelp: 'Create one at https://account.mapbox.com/',
            /* wwEditor:end */
        },

        // ────── Map basics ──────
        mapStyle: {
            label: { en: 'Map style' },
            type: 'TextSelect',
            section: 'settings',
            options: {
                options: [
                    { value: 'streets-v12', label: 'Streets' },
                    { value: 'outdoors-v12', label: 'Outdoors' },
                    { value: 'light-v11', label: 'Light' },
                    { value: 'dark-v11', label: 'Dark' },
                    { value: 'satellite-v9', label: 'Satellite' },
                    { value: 'satellite-streets-v12', label: 'Satellite Streets' },
                    { value: 'navigation-day-v1', label: 'Navigation Day' },
                    { value: 'navigation-night-v1', label: 'Navigation Night' },
                ],
            },
            defaultValue: 'streets-v12',
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip:
                    'Valid values: streets-v12 | outdoors-v12 | light-v11 | dark-v11 | satellite-v9 | satellite-streets-v12 | navigation-day-v1 | navigation-night-v1',
            },
            /* wwEditor:end */
        },
        centerLongitude: {
            label: { en: 'Center longitude' },
            type: 'Number',
            section: 'settings',
            defaultValue: 0,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: { type: 'number', tooltip: 'Longitude in decimal degrees' },
            /* wwEditor:end */
        },
        centerLatitude: {
            label: { en: 'Center latitude' },
            type: 'Number',
            section: 'settings',
            defaultValue: 20,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: { type: 'number', tooltip: 'Latitude in decimal degrees' },
            /* wwEditor:end */
        },
        zoom: {
            label: { en: 'Zoom' },
            type: 'Number',
            section: 'settings',
            options: { min: 0, max: 22, step: 0.1 },
            defaultValue: 2,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: { type: 'number', tooltip: 'Zoom level (0-22)' },
            /* wwEditor:end */
        },
        pitch: {
            label: { en: 'Pitch' },
            type: 'Number',
            section: 'settings',
            options: { min: 0, max: 85, step: 1 },
            defaultValue: 0,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: { type: 'number', tooltip: 'Pitch angle (0-85)' },
            /* wwEditor:end */
        },
        bearing: {
            label: { en: 'Bearing' },
            type: 'Number',
            section: 'settings',
            options: { min: -180, max: 180, step: 1 },
            defaultValue: 0,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: { type: 'number', tooltip: 'Bearing rotation (-180..180)' },
            /* wwEditor:end */
        },
        interactive: {
            label: { en: 'Interactive' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: true,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: { type: 'boolean', tooltip: 'Allow pan/zoom interactions' },
            /* wwEditor:end */
        },
        height: {
            label: { en: 'Height' },
            type: 'Length',
            section: 'style',
            options: { unitChoices: [{ value: 'px', label: 'px', min: 100, max: 2000 }] },
            defaultValue: '400px',
            bindable: true,
        },
        borderRadius: {
            label: { en: 'Border radius' },
            type: 'Length',
            section: 'style',
            options: {
                unitChoices: [
                    { value: 'px', label: 'px', min: 0, max: 200 },
                    { value: '%', label: '%', min: 0, max: 50 },
                ],
            },
            defaultValue: '0px',
            bindable: true,
            /* wwEditor:start */
            bindingValidation: { type: 'string', tooltip: 'CSS length, e.g. "12px" or "50%"' },
            /* wwEditor:end */
        },

        // ────── Controls ──────
        showNavigationControl: {
            label: { en: 'Navigation control' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: true,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: { type: 'boolean', tooltip: 'Show zoom/compass control' },
            /* wwEditor:end */
        },
        showFullscreenControl: {
            label: { en: 'Fullscreen control' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: { type: 'boolean', tooltip: 'Show fullscreen button' },
            /* wwEditor:end */
        },
        showGeolocateControl: {
            label: { en: 'Geolocate control' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: { type: 'boolean', tooltip: 'Show "locate me" button' },
            /* wwEditor:end */
        },
        showScaleControl: {
            label: { en: 'Scale control' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: { type: 'boolean', tooltip: 'Show scale bar' },
            /* wwEditor:end */
        },
        show3dBuildings: {
            label: { en: '3D buildings' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: { type: 'boolean', tooltip: 'Render 3D building extrusions' },
            /* wwEditor:end */
        },
        showTraffic: {
            label: { en: 'Traffic layer' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: { type: 'boolean', tooltip: 'Show Mapbox live traffic layer' },
            /* wwEditor:end */
        },
        hideAttribution: {
            label: { en: 'Hide Mapbox attribution' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'Hides the (i) attribution. Note: Mapbox ToS may require attribution on free plans.',
            },
            /* wwEditor:end */
        },

        // ────── Markers ──────
        markers: {
            label: { en: 'Markers' },
            type: 'Array',
            section: 'settings',
            bindable: true,
            defaultValue: [],
            options: {
                expandable: true,
                getItemLabel(item) {
                    return item?.label || item?.name || item?.title || `Marker ${item?.id || ''}`;
                },
                item: {
                    type: 'Object',
                    defaultValue: {
                        id: '',
                        longitude: 0,
                        latitude: 0,
                        label: '',
                        color: '#3b82f6',
                    },
                    options: {
                        item: {
                            id: { label: { en: 'ID' }, type: 'Text' },
                            longitude: { label: { en: 'Longitude' }, type: 'Number' },
                            latitude: { label: { en: 'Latitude' }, type: 'Number' },
                            label: { label: { en: 'Label' }, type: 'Text' },
                            color: { label: { en: 'Color' }, type: 'Color' },
                        },
                    },
                },
            },
            /* wwEditor:start */
            bindingValidation: {
                type: 'array',
                tooltip: 'Array of marker objects with longitude/latitude fields',
            },
            /* wwEditor:end */
        },
        markerIdFormula: {
            label: { en: 'Marker - ID field' },
            type: 'Formula',
            section: 'settings',
            options: content => ({
                template:
                    Array.isArray(content.markers) && content.markers.length > 0 ? content.markers[0] : null,
            }),
            defaultValue: { type: 'f', code: "context.mapping?.['id']" },
            hidden: (content, sidepanelContent, boundProps) =>
                !Array.isArray(content.markers) || !content.markers?.length || !boundProps.markers,
        },
        markerLonFormula: {
            label: { en: 'Marker - Longitude field' },
            type: 'Formula',
            section: 'settings',
            options: content => ({
                template:
                    Array.isArray(content.markers) && content.markers.length > 0 ? content.markers[0] : null,
            }),
            defaultValue: { type: 'f', code: "context.mapping?.['longitude']" },
            hidden: (content, sidepanelContent, boundProps) =>
                !Array.isArray(content.markers) || !content.markers?.length || !boundProps.markers,
        },
        markerLatFormula: {
            label: { en: 'Marker - Latitude field' },
            type: 'Formula',
            section: 'settings',
            options: content => ({
                template:
                    Array.isArray(content.markers) && content.markers.length > 0 ? content.markers[0] : null,
            }),
            defaultValue: { type: 'f', code: "context.mapping?.['latitude']" },
            hidden: (content, sidepanelContent, boundProps) =>
                !Array.isArray(content.markers) || !content.markers?.length || !boundProps.markers,
        },
        markerLabelFormula: {
            label: { en: 'Marker - Label field' },
            type: 'Formula',
            section: 'settings',
            options: content => ({
                template:
                    Array.isArray(content.markers) && content.markers.length > 0 ? content.markers[0] : null,
            }),
            defaultValue: { type: 'f', code: "context.mapping?.['label']" },
            hidden: (content, sidepanelContent, boundProps) =>
                !Array.isArray(content.markers) || !content.markers?.length || !boundProps.markers,
        },
        markerColorFormula: {
            label: { en: 'Marker - Color field' },
            type: 'Formula',
            section: 'settings',
            options: content => ({
                template:
                    Array.isArray(content.markers) && content.markers.length > 0 ? content.markers[0] : null,
            }),
            defaultValue: { type: 'f', code: "context.mapping?.['color']" },
            hidden: (content, sidepanelContent, boundProps) =>
                !Array.isArray(content.markers) || !content.markers?.length || !boundProps.markers,
        },
        fitMarkers: {
            label: { en: 'Fit map to markers' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: { type: 'boolean', tooltip: 'Auto-fit bounds to markers' },
            /* wwEditor:end */
        },

        // ────── Directions ──────
        showDirections: {
            label: { en: 'Enable directions' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: { type: 'boolean', tooltip: 'Render a Mapbox Directions route' },
            /* wwEditor:end */
        },
        directionsProfile: {
            label: { en: 'Profile' },
            type: 'TextSelect',
            section: 'settings',
            options: {
                options: [
                    { value: 'driving', label: 'Driving' },
                    { value: 'driving-traffic', label: 'Driving (traffic)' },
                    { value: 'walking', label: 'Walking' },
                    { value: 'cycling', label: 'Cycling' },
                ],
            },
            defaultValue: 'driving',
            bindable: true,
            hidden: content => !content?.showDirections,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'Valid values: driving | driving-traffic | walking | cycling',
            },
            /* wwEditor:end */
        },
        directionsOrigin: {
            label: { en: 'Origin "lon,lat"' },
            type: 'Text',
            section: 'settings',
            defaultValue: '',
            bindable: true,
            hidden: content => !content?.showDirections,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'Start coordinate as "longitude,latitude" or [lon,lat]',
            },
            /* wwEditor:end */
        },
        directionsDestination: {
            label: { en: 'Destination "lon,lat"' },
            type: 'Text',
            section: 'settings',
            defaultValue: '',
            bindable: true,
            hidden: content => !content?.showDirections,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'End coordinate as "longitude,latitude" or [lon,lat]',
            },
            /* wwEditor:end */
        },
        directionsWaypoints: {
            label: { en: 'Waypoints' },
            type: 'Array',
            section: 'settings',
            bindable: true,
            defaultValue: [],
            hidden: content => !content?.showDirections,
            options: {
                expandable: true,
                getItemLabel(item) {
                    return item?.coordinates || 'Waypoint';
                },
                item: {
                    type: 'Object',
                    defaultValue: { coordinates: '' },
                    options: {
                        item: {
                            coordinates: { label: { en: 'Coordinates "lon,lat"' }, type: 'Text' },
                        },
                    },
                },
            },
            /* wwEditor:start */
            bindingValidation: { type: 'array', tooltip: 'Array of { coordinates: "lon,lat" }' },
            /* wwEditor:end */
        },
        directionsAlternatives: {
            label: { en: 'Alternatives' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
            bindable: true,
            hidden: content => !content?.showDirections,
            /* wwEditor:start */
            bindingValidation: { type: 'boolean', tooltip: 'Request alternative routes' },
            /* wwEditor:end */
        },
        directionsLanguage: {
            label: { en: 'Language code' },
            type: 'Text',
            section: 'settings',
            defaultValue: '',
            bindable: true,
            hidden: content => !content?.showDirections,
            /* wwEditor:start */
            bindingValidation: { type: 'string', tooltip: 'e.g. "en", "de", "fr"' },
            /* wwEditor:end */
        },
        directionsExclude: {
            label: { en: 'Exclude' },
            type: 'Text',
            section: 'settings',
            defaultValue: '',
            bindable: true,
            hidden: content => !content?.showDirections,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'e.g. "toll,motorway,ferry" — comma-separated',
            },
            /* wwEditor:end */
        },
        spinnerColor: {
            label: { en: 'Loading spinner color' },
            type: 'Color',
            section: 'style',
            defaultValue: '#3b82f6',
            bindable: true,
            hidden: content => !content?.showDirections,
        },
        routeColor: {
            label: { en: 'Route color' },
            type: 'Color',
            section: 'style',
            defaultValue: '#3b82f6',
            bindable: true,
            hidden: content => !content?.showDirections,
        },
        routeWidth: {
            label: { en: 'Route width' },
            type: 'Number',
            section: 'style',
            options: { min: 1, max: 20, step: 1 },
            defaultValue: 5,
            bindable: true,
            hidden: content => !content?.showDirections,
            /* wwEditor:start */
            bindingValidation: { type: 'number', tooltip: 'Line width in px' },
            /* wwEditor:end */
        },
        fitRoute: {
            label: { en: 'Fit map to route' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: true,
            bindable: true,
            hidden: content => !content?.showDirections,
            /* wwEditor:start */
            bindingValidation: { type: 'boolean', tooltip: 'Auto-fit bounds to route' },
            /* wwEditor:end */
        },

        // ────── Search box (Geocoding) ──────
        showSearchBox: {
            label: { en: 'Show search box' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: { type: 'boolean', tooltip: 'Show a geocoding search input' },
            /* wwEditor:end */
        },
        searchPlaceholder: {
            label: { en: 'Search placeholder' },
            type: 'Text',
            section: 'settings',
            defaultValue: 'Search a place...',
            bindable: true,
            hidden: content => !content?.showSearchBox,
            /* wwEditor:start */
            bindingValidation: { type: 'string', tooltip: 'Placeholder text for the search input' },
            /* wwEditor:end */
        },
        searchLanguage: {
            label: { en: 'Search language' },
            type: 'Text',
            section: 'settings',
            defaultValue: '',
            bindable: true,
            hidden: content => !content?.showSearchBox,
            /* wwEditor:start */
            bindingValidation: { type: 'string', tooltip: 'ISO 639-1 code, e.g. "en", "de"' },
            /* wwEditor:end */
        },
        searchCountry: {
            label: { en: 'Search country codes' },
            type: 'Text',
            section: 'settings',
            defaultValue: '',
            bindable: true,
            hidden: content => !content?.showSearchBox,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'Comma-separated ISO 3166-1 alpha-2 codes, e.g. "de,fr"',
            },
            /* wwEditor:end */
        },
        searchProximity: {
            label: { en: 'Search proximity "lon,lat"' },
            type: 'Text',
            section: 'settings',
            defaultValue: '',
            bindable: true,
            hidden: content => !content?.showSearchBox,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'Bias results toward a coordinate, "longitude,latitude"',
            },
            /* wwEditor:end */
        },
    },
};
