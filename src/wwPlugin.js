import mapboxgl from 'mapbox-gl';

const GEOCODING_BASE = 'https://api.mapbox.com/geocoding/v5';
const DIRECTIONS_BASE = 'https://api.mapbox.com/directions/v5/mapbox';

function appendParam(params, key, value) {
    if (value === undefined || value === null || value === '') return;
    if (typeof value === 'boolean') {
        params.append(key, value ? 'true' : 'false');
        return;
    }
    params.append(key, String(value));
}

function normalizeCoordinates(coordinates) {
    if (Array.isArray(coordinates)) {
        return coordinates
            .map(pair => {
                if (Array.isArray(pair)) return `${pair[0]},${pair[1]}`;
                if (pair && typeof pair === 'object') {
                    const lon = pair.lon ?? pair.lng ?? pair.longitude;
                    const lat = pair.lat ?? pair.latitude;
                    return `${lon},${lat}`;
                }
                return String(pair);
            })
            .join(';');
    }
    return String(coordinates || '').trim();
}

async function request(url) {
    const response = await fetch(url);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const message = data?.message || `Mapbox request failed (${response.status})`;
        throw new Error(message);
    }
    return data;
}

export default {
    mapboxgl,

    getAccessToken() {
        const token = this.settings?.publicData?.accessToken || this.settings?.accessToken;
        if (!token) throw new Error('Mapbox access token is not configured in the plugin settings.');
        return token;
    },

    async forwardGeocoding({
        query,
        limit,
        proximity,
        country,
        language,
        types,
        bbox,
        autocomplete,
        fuzzyMatch,
        routing,
        worldview,
        endpoint,
    } = {}) {
        if (!query) throw new Error('forwardGeocoding: "query" is required.');
        const token = this.getAccessToken();
        const ep = endpoint || 'places';
        const params = new URLSearchParams();
        params.append('access_token', token);
        appendParam(params, 'limit', limit);
        appendParam(params, 'proximity', proximity);
        appendParam(params, 'country', country);
        appendParam(params, 'language', language);
        appendParam(params, 'types', types);
        appendParam(params, 'bbox', bbox);
        appendParam(params, 'autocomplete', autocomplete);
        appendParam(params, 'fuzzyMatch', fuzzyMatch);
        appendParam(params, 'routing', routing);
        appendParam(params, 'worldview', worldview);
        const url = `${GEOCODING_BASE}/mapbox.${ep}/${encodeURIComponent(query)}.json?${params.toString()}`;
        return request(url);
    },

    async reverseGeocoding({
        longitude,
        latitude,
        limit,
        country,
        language,
        types,
        worldview,
        endpoint,
    } = {}) {
        if (longitude === undefined || latitude === undefined) {
            throw new Error('reverseGeocoding: "longitude" and "latitude" are required.');
        }
        const token = this.getAccessToken();
        const ep = endpoint || 'places';
        const params = new URLSearchParams();
        params.append('access_token', token);
        appendParam(params, 'limit', limit);
        appendParam(params, 'country', country);
        appendParam(params, 'language', language);
        appendParam(params, 'types', types);
        appendParam(params, 'worldview', worldview);
        const url = `${GEOCODING_BASE}/mapbox.${ep}/${longitude},${latitude}.json?${params.toString()}`;
        return request(url);
    },

    async getDirections({
        profile,
        coordinates,
        alternatives,
        geometries,
        overview,
        steps,
        annotations,
        language,
        voiceInstructions,
        bannerInstructions,
        continueStraight,
        exclude,
        approaches,
        waypoints,
        waypointNames,
        radiuses,
        bearings,
    } = {}) {
        if (!profile) throw new Error('getDirections: "profile" is required.');
        if (!coordinates) throw new Error('getDirections: "coordinates" is required.');
        const token = this.getAccessToken();
        const coordString = normalizeCoordinates(coordinates);
        const params = new URLSearchParams();
        params.append('access_token', token);
        appendParam(params, 'alternatives', alternatives);
        appendParam(params, 'geometries', geometries || 'geojson');
        appendParam(params, 'overview', overview);
        appendParam(params, 'steps', steps);
        appendParam(params, 'annotations', annotations);
        appendParam(params, 'language', language);
        appendParam(params, 'voice_instructions', voiceInstructions);
        appendParam(params, 'banner_instructions', bannerInstructions);
        appendParam(params, 'continue_straight', continueStraight);
        appendParam(params, 'exclude', exclude);
        appendParam(params, 'approaches', approaches);
        appendParam(params, 'waypoints', waypoints);
        appendParam(params, 'waypoint_names', waypointNames);
        appendParam(params, 'radiuses', radiuses);
        appendParam(params, 'bearings', bearings);
        const url = `${DIRECTIONS_BASE}/${profile}/${coordString}?${params.toString()}`;
        return request(url);
    },
};
