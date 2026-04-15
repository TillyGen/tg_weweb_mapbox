<template>
    <div class="mapbox-element" :class="{ 'mapbox-element--hide-attribution': content?.hideAttribution }" :style="rootStyle">
        <div :id="mapContainerId" ref="mapContainer" class="mapbox-element__map" />

        <div v-if="isRouteLoading" class="mapbox-element__route-skeleton" aria-hidden="true">
            <div class="mapbox-element__route-skeleton-bar" />
            <div class="mapbox-element__route-skeleton-bar mapbox-element__route-skeleton-bar--short" />
            <div class="mapbox-element__route-skeleton-bar" />
        </div>

        <div v-if="content?.showSearchBox" class="mapbox-element__search">
            <input
                type="text"
                class="mapbox-element__search-input"
                :placeholder="content?.searchPlaceholder || 'Search a place...'"
                :value="searchQuery"
                @input="onSearchInput"
                @focus="searchFocused = true"
                @blur="onSearchBlur"
            />
            <ul
                v-if="searchFocused && searchResults.length"
                class="mapbox-element__search-results"
            >
                <li
                    v-for="result in searchResults"
                    :key="result.id"
                    class="mapbox-element__search-result"
                    @mousedown.prevent="onSearchSelect(result)"
                >
                    {{ result.place_name }}
                </li>
            </ul>
        </div>

        <!-- wwEditor:start -->
        <div v-if="!content?.accessToken" class="mapbox-element__placeholder">
            <p>Set your Mapbox access token in the element settings.</p>
        </div>
        <!-- wwEditor:end -->
    </div>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';

const MAPBOX_VERSION = 'v2.15.0';
const MAPBOX_JS_URL = `https://api.mapbox.com/mapbox-gl-js/${MAPBOX_VERSION}/mapbox-gl.js`;
const MAPBOX_CSS_URL = `https://api.mapbox.com/mapbox-gl-js/${MAPBOX_VERSION}/mapbox-gl.css`;

const mapboxLoadPromises = new WeakMap();
const loadMapbox = doc => {
    const win = doc.defaultView;
    if (win && win.mapboxgl) return Promise.resolve(win.mapboxgl);
    if (mapboxLoadPromises.has(doc)) return mapboxLoadPromises.get(doc);

    const promise = new Promise((resolve, reject) => {
        if (!doc.querySelector(`link[data-mapbox-gl="${MAPBOX_VERSION}"]`)) {
            const link = doc.createElement('link');
            link.rel = 'stylesheet';
            link.href = MAPBOX_CSS_URL;
            link.dataset.mapboxGl = MAPBOX_VERSION;
            doc.head.appendChild(link);
        }
        const existing = doc.querySelector(`script[data-mapbox-gl="${MAPBOX_VERSION}"]`);
        if (existing) {
            existing.addEventListener('load', () => resolve(doc.defaultView.mapboxgl));
            existing.addEventListener('error', reject);
            return;
        }
        const script = doc.createElement('script');
        script.src = MAPBOX_JS_URL;
        script.async = true;
        script.dataset.mapboxGl = MAPBOX_VERSION;
        script.onload = () => resolve(doc.defaultView.mapboxgl);
        script.onerror = reject;
        doc.head.appendChild(script);
    });
    mapboxLoadPromises.set(doc, promise);
    return promise;
};

export default {
    props: {
        uid: { type: String, required: true },
        content: { type: Object, required: true },
        /* wwEditor:start */
        wwEditorState: { type: Object, required: true },
        /* wwEditor:end */
    },
    emits: ['trigger-event'],
    setup(props, { emit }) {
        const mapContainer = ref(null);
        const mapContainerId = computed(() => `mapbox-element-${props.uid}`);
        let map = null;
        let markerInstances = [];

        const { value: isMapReady, setValue: setMapReady } = wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: 'isMapReady',
            type: 'boolean',
            defaultValue: false,
        });
        const { value: currentCenter, setValue: setCurrentCenter } = wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: 'currentCenter',
            type: 'object',
            defaultValue: { lng: 0, lat: 0 },
        });
        const { value: currentZoom, setValue: setCurrentZoom } = wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: 'currentZoom',
            type: 'number',
            defaultValue: 2,
        });
        const { value: selectedMarker, setValue: setSelectedMarker } = wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: 'selectedMarker',
            type: 'object',
            defaultValue: null,
        });
        const { value: currentRoute, setValue: setCurrentRoute } = wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: 'currentRoute',
            type: 'object',
            defaultValue: null,
        });
        const { value: searchValue, setValue: setSearchValue } = wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: 'searchValue',
            type: 'string',
            defaultValue: '',
        });

        const rootStyle = computed(() => ({
            position: 'relative',
            width: '100%',
            height: props.content?.height || '400px',
            minHeight: '200px',
            borderRadius: props.content?.borderRadius || '0px',
            overflow: 'hidden',
        }));

        const resolveFormula = (formula, item, fallback) => {
            try {
                const { resolveMappingFormula } = wwLib.wwFormula.useFormula();
                const result = resolveMappingFormula(formula, item);
                return result ?? fallback;
            } catch (e) {
                return fallback;
            }
        };

        const processedMarkers = computed(() => {
            const markers = Array.isArray(props.content?.markers) ? props.content.markers : [];
            return markers
                .map((item, idx) => ({
                    id: resolveFormula(props.content?.markerIdFormula, item, item?.id ?? `marker-${idx}`),
                    longitude: Number(resolveFormula(props.content?.markerLonFormula, item, item?.longitude)),
                    latitude: Number(resolveFormula(props.content?.markerLatFormula, item, item?.latitude)),
                    label: resolveFormula(props.content?.markerLabelFormula, item, item?.label ?? ''),
                    color: resolveFormula(props.content?.markerColorFormula, item, item?.color ?? '#3b82f6'),
                    originalItem: item,
                }))
                .filter(m => Number.isFinite(m.longitude) && Number.isFinite(m.latitude));
        });

        const parseLonLat = value => {
            if (value === undefined || value === null || value === '') return null;
            if (Array.isArray(value) && value.length >= 2) {
                const lon = Number(value[0]);
                const lat = Number(value[1]);
                return Number.isFinite(lon) && Number.isFinite(lat) ? [lon, lat] : null;
            }
            if (typeof value === 'object') {
                const lon = Number(value.lon ?? value.lng ?? value.longitude);
                const lat = Number(value.lat ?? value.latitude);
                return Number.isFinite(lon) && Number.isFinite(lat) ? [lon, lat] : null;
            }
            if (typeof value === 'string') {
                const parts = value.split(',').map(s => Number(s.trim()));
                return parts.length === 2 && parts.every(Number.isFinite) ? parts : null;
            }
            return null;
        };

        const getInitialCenter = () => {
            const parsed = parseLonLat(props.content?.center);
            if (parsed) return parsed;
            const lon = Number(props.content?.centerLongitude);
            const lat = Number(props.content?.centerLatitude);
            if (Number.isFinite(lon) && Number.isFinite(lat)) return [lon, lat];
            return [0, 20];
        };

        const initMap = async () => {
            console.log('[Mapbox element] initMap called, container:', mapContainer.value);
            if (!mapContainer.value) {
                console.warn('[Mapbox element] aborting: container ref is null');
                return;
            }
            const token = props.content?.accessToken;
            if (!token) {
                console.warn('[Mapbox element] aborting: no access token');
                return;
            }
            let mapboxgl;
            try {
                mapboxgl = await loadMapbox(mapContainer.value.ownerDocument);
                console.log('[Mapbox element] mapbox-gl loaded:', !!mapboxgl);
            } catch (err) {
                console.error('[Mapbox element] failed to load mapbox-gl', err);
                return;
            }
            if (!mapboxgl) {
                console.warn('[Mapbox element] aborting: mapboxgl undefined after load');
                return;
            }
            if (!mapContainer.value) {
                console.warn('[Mapbox element] aborting: container ref became null after load');
                return;
            }
            if (map) {
                map.remove();
                map = null;
            }
            markerInstances = [];
            mapboxgl.accessToken = token;

            map = new mapboxgl.Map({
                container: mapContainerId.value,
                style: `mapbox://styles/mapbox/${props.content?.mapStyle || 'streets-v12'}`,
                center: getInitialCenter(),
                zoom: Number(props.content?.zoom ?? 2),
                pitch: Number(props.content?.pitch ?? 0),
                bearing: Number(props.content?.bearing ?? 0),
                interactive: props.content?.interactive !== false,
            });

            if (props.content?.showNavigationControl) {
                map.addControl(new mapboxgl.NavigationControl(), 'top-right');
            }
            if (props.content?.showFullscreenControl) {
                map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
            }
            if (props.content?.showGeolocateControl) {
                map.addControl(
                    new mapboxgl.GeolocateControl({
                        positionOptions: { enableHighAccuracy: true },
                        trackUserLocation: true,
                    }),
                    'top-right'
                );
            }
            if (props.content?.showScaleControl) {
                map.addControl(new mapboxgl.ScaleControl());
            }

            map.on('load', () => {
                setMapReady(true);
                syncMarkers();
                sync3dBuildings();
                syncTraffic();
                syncRoute();
                emit('trigger-event', { name: 'map-load', event: {} });
            });
            map.on('click', e => {
                emit('trigger-event', {
                    name: 'map-click',
                    event: { lngLat: { lng: e.lngLat.lng, lat: e.lngLat.lat } },
                });
            });
            map.on('moveend', () => {
                const c = map.getCenter();
                setCurrentCenter({ lng: c.lng, lat: c.lat });
                setCurrentZoom(map.getZoom());
            });
        };

        const syncMarkers = () => {
            if (!map || !mapContainer.value) return;
            const mapboxgl = mapContainer.value.ownerDocument.defaultView.mapboxgl;
            if (!mapboxgl) return;
            markerInstances.forEach(m => m.remove());
            markerInstances = [];
            processedMarkers.value.forEach(markerData => {
                const marker = new mapboxgl.Marker({ color: markerData.color })
                    .setLngLat([markerData.longitude, markerData.latitude])
                    .addTo(map);
                if (markerData.label) {
                    marker.setPopup(
                        new mapboxgl.Popup({ offset: 25 }).setText(String(markerData.label))
                    );
                }
                marker.getElement().addEventListener('click', () => {
                    setSelectedMarker(markerData);
                    emit('trigger-event', { name: 'marker-click', event: { marker: markerData } });
                });
                markerInstances.push(marker);
            });

            if (props.content?.fitMarkers && processedMarkers.value.length > 1) {
                const bounds = new mapboxgl.LngLatBounds();
                processedMarkers.value.forEach(m => bounds.extend([m.longitude, m.latitude]));
                map.fitBounds(bounds, { padding: 40, maxZoom: 15 });
            }
        };

        const fetchDirections = async () => {
            if (!props.content?.showDirections) return null;
            const token = props.content?.accessToken;
            if (!token) return null;
            const origin = parseLonLat(props.content?.directionsOrigin);
            const destination = parseLonLat(props.content?.directionsDestination);
            if (!origin || !destination) return null;
            const waypointsInput = Array.isArray(props.content?.directionsWaypoints)
                ? props.content.directionsWaypoints
                : [];
            const waypoints = waypointsInput
                .map(w => parseLonLat(w?.coordinates ?? w))
                .filter(Boolean);
            const all = [origin, ...waypoints, destination];
            const coordString = all.map(p => `${p[0]},${p[1]}`).join(';');
            const profile = props.content?.directionsProfile || 'driving';
            const params = new URLSearchParams({
                access_token: token,
                geometries: 'geojson',
                overview: 'full',
                steps: 'true',
                alternatives: props.content?.directionsAlternatives ? 'true' : 'false',
            });
            if (props.content?.directionsLanguage) params.append('language', props.content.directionsLanguage);
            if (props.content?.directionsExclude) params.append('exclude', props.content.directionsExclude);
            const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordString}?${params.toString()}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Mapbox directions request failed (${response.status})`);
            }
            return response.json();
        };

        const sync3dBuildings = () => {
            if (!map || !map.isStyleLoaded()) return;
            const layerId = 'mapbox-element-3d-buildings';
            const existing = map.getLayer(layerId);
            if (props.content?.show3dBuildings) {
                if (existing) return;
                const layers = map.getStyle().layers || [];
                const labelLayer = layers.find(
                    l => l.type === 'symbol' && l.layout && l.layout['text-field']
                );
                map.addLayer(
                    {
                        id: layerId,
                        source: 'composite',
                        'source-layer': 'building',
                        filter: ['==', 'extrude', 'true'],
                        type: 'fill-extrusion',
                        minzoom: 14,
                        paint: {
                            'fill-extrusion-color': '#aaa',
                            'fill-extrusion-height': [
                                'interpolate', ['linear'], ['zoom'],
                                14, 0, 14.5, ['get', 'height'],
                            ],
                            'fill-extrusion-base': [
                                'interpolate', ['linear'], ['zoom'],
                                14, 0, 14.5, ['get', 'min_height'],
                            ],
                            'fill-extrusion-opacity': 0.6,
                        },
                    },
                    labelLayer?.id
                );
            } else if (existing) {
                map.removeLayer(layerId);
            }
        };

        const syncTraffic = () => {
            if (!map || !map.isStyleLoaded()) return;
            const sourceId = 'mapbox-element-traffic';
            const layerId = 'mapbox-element-traffic-layer';
            if (props.content?.showTraffic) {
                if (!map.getSource(sourceId)) {
                    map.addSource(sourceId, {
                        type: 'vector',
                        url: 'mapbox://mapbox.mapbox-traffic-v1',
                    });
                }
                if (!map.getLayer(layerId)) {
                    map.addLayer({
                        id: layerId,
                        type: 'line',
                        source: sourceId,
                        'source-layer': 'traffic',
                        paint: {
                            'line-width': 2,
                            'line-color': [
                                'match',
                                ['get', 'congestion'],
                                'low', '#22c55e',
                                'moderate', '#eab308',
                                'heavy', '#f97316',
                                'severe', '#ef4444',
                                '#9ca3af',
                            ],
                        },
                    });
                }
            } else {
                if (map.getLayer(layerId)) map.removeLayer(layerId);
                if (map.getSource(sourceId)) map.removeSource(sourceId);
            }
        };

        const clearRoute = () => {
            if (!map) return;
            if (map.getLayer('mapbox-element-route')) map.removeLayer('mapbox-element-route');
            if (map.getSource('mapbox-element-route')) map.removeSource('mapbox-element-route');
        };

        const syncRoute = async () => {
            if (!map || !map.isStyleLoaded() || !mapContainer.value) return;
            const mapboxgl = mapContainer.value.ownerDocument.defaultView.mapboxgl;
            if (!mapboxgl) return;
            isRouteLoading.value = true;
            try {
                const data = await fetchDirections();
                if (!data || !Array.isArray(data.routes) || !data.routes.length) {
                    clearRoute();
                    setCurrentRoute(null);
                    return;
                }
                const route = data.routes[0];
                const geojson = { type: 'Feature', properties: {}, geometry: route.geometry };
                if (map.getSource('mapbox-element-route')) {
                    map.getSource('mapbox-element-route').setData(geojson);
                    if (map.getLayer('mapbox-element-route')) {
                        map.setPaintProperty(
                            'mapbox-element-route',
                            'line-color',
                            props.content?.routeColor || '#3b82f6'
                        );
                        map.setPaintProperty(
                            'mapbox-element-route',
                            'line-width',
                            Number(props.content?.routeWidth ?? 5)
                        );
                    }
                } else {
                    map.addSource('mapbox-element-route', { type: 'geojson', data: geojson });
                    map.addLayer({
                        id: 'mapbox-element-route',
                        type: 'line',
                        source: 'mapbox-element-route',
                        layout: { 'line-join': 'round', 'line-cap': 'round' },
                        paint: {
                            'line-color': props.content?.routeColor || '#3b82f6',
                            'line-width': Number(props.content?.routeWidth ?? 5),
                        },
                    });
                }
                if (props.content?.fitRoute && route.geometry?.coordinates?.length) {
                    const coords = route.geometry.coordinates;
                    const bounds = coords.reduce(
                        (b, c) => b.extend(c),
                        new mapboxgl.LngLatBounds(coords[0], coords[0])
                    );
                    map.fitBounds(bounds, { padding: 60 });
                }
                const routeData = {
                    distance: route.distance,
                    duration: route.duration,
                    geometry: route.geometry,
                    legs: route.legs,
                };
                setCurrentRoute(routeData);
                emit('trigger-event', {
                    name: 'route-loaded',
                    event: {
                        route: routeData,
                        distance: route.distance,
                        duration: route.duration,
                    },
                });
            } catch (err) {
                console.error('[Mapbox element] directions error', err);
            } finally {
                isRouteLoading.value = false;
            }
        };

        const isRouteLoading = ref(false);

        const searchQuery = ref('');
        const searchResults = ref([]);
        const searchFocused = ref(false);
        let searchTimer = null;

        const runSearch = async () => {
            const q = searchQuery.value;
            const token = props.content?.accessToken;
            if (!q || !token) {
                searchResults.value = [];
                return;
            }
            const params = new URLSearchParams({
                access_token: token,
                autocomplete: 'true',
                limit: '5',
            });
            if (props.content?.searchLanguage) params.append('language', props.content.searchLanguage);
            if (props.content?.searchCountry) params.append('country', props.content.searchCountry);
            if (props.content?.searchProximity) params.append('proximity', props.content.searchProximity);
            try {
                const response = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?${params.toString()}`
                );
                const data = await response.json();
                searchResults.value = Array.isArray(data.features) ? data.features : [];
            } catch (err) {
                searchResults.value = [];
            }
        };

        const onSearchInput = e => {
            searchQuery.value = e.target.value;
            setSearchValue(searchQuery.value);
            clearTimeout(searchTimer);
            searchTimer = setTimeout(runSearch, 300);
        };

        const onSearchBlur = () => {
            setTimeout(() => {
                searchFocused.value = false;
            }, 150);
        };

        const onSearchSelect = result => {
            searchQuery.value = result.place_name;
            setSearchValue(result.place_name);
            searchResults.value = [];
            searchFocused.value = false;
            if (map && Array.isArray(result.center)) {
                map.flyTo({ center: result.center, zoom: Math.max(map.getZoom(), 12) });
            }
            emit('trigger-event', { name: 'search-select', event: { result } });
        };

        onMounted(async () => {
            await nextTick();
            initMap();
        });

        onBeforeUnmount(() => {
            if (map) {
                map.remove();
                map = null;
            }
        });

        watch(
            () => [
                props.content?.accessToken,
                props.content?.mapStyle,
                props.content?.interactive,
                props.content?.showNavigationControl,
                props.content?.showFullscreenControl,
                props.content?.showGeolocateControl,
                props.content?.showScaleControl,
            ],
            () => {
                setTimeout(() => initMap(), 50);
            }
        );

        watch(
            () => [
                props.content?.center,
                props.content?.centerLongitude,
                props.content?.centerLatitude,
                props.content?.zoom,
                props.content?.pitch,
                props.content?.bearing,
            ],
            () => {
                if (!map) return;
                map.easeTo({
                    center: getInitialCenter(),
                    zoom: Number(props.content?.zoom ?? map.getZoom()),
                    pitch: Number(props.content?.pitch ?? map.getPitch()),
                    bearing: Number(props.content?.bearing ?? map.getBearing()),
                });
            },
            { deep: true }
        );

        watch(
            () => [
                props.content?.markers,
                props.content?.markerIdFormula,
                props.content?.markerLonFormula,
                props.content?.markerLatFormula,
                props.content?.markerLabelFormula,
                props.content?.markerColorFormula,
                props.content?.fitMarkers,
            ],
            () => {
                if (map && map.isStyleLoaded()) syncMarkers();
            },
            { deep: true }
        );

        watch(
            () => [
                props.content?.showDirections,
                props.content?.directionsProfile,
                props.content?.directionsOrigin,
                props.content?.directionsDestination,
                props.content?.directionsWaypoints,
                props.content?.directionsAlternatives,
                props.content?.directionsLanguage,
                props.content?.directionsExclude,
                props.content?.routeColor,
                props.content?.routeWidth,
                props.content?.fitRoute,
            ],
            () => {
                if (map && map.isStyleLoaded()) syncRoute();
            },
            { deep: true }
        );

        watch(
            () => props.content?.show3dBuildings,
            () => {
                if (map && map.isStyleLoaded()) sync3dBuildings();
            }
        );

        watch(
            () => props.content?.showTraffic,
            () => {
                if (map && map.isStyleLoaded()) syncTraffic();
            }
        );

        watch(
            () => [props.content?.showSearchBox, props.content?.height],
            () => {
                nextTick(() => {
                    if (map) map.resize();
                });
            }
        );

        return {
            mapContainer,
            mapContainerId,
            rootStyle,
            isRouteLoading,
            searchQuery,
            searchResults,
            searchFocused,
            onSearchInput,
            onSearchBlur,
            onSearchSelect,
            /* wwEditor:start */
            isEditing: computed(() => props.wwEditorState?.isEditing),
            /* wwEditor:end */
        };
    },
};
</script>

<style scoped lang="scss">
.mapbox-element {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: inherit;

    &--hide-attribution {
        :deep(.mapboxgl-ctrl-attrib),
        :deep(.mapboxgl-ctrl-bottom-right) {
            display: none !important;
        }
    }

    &__map {
        width: 100%;
        height: 100%;
    }

    &__route-skeleton {
        position: absolute;
        inset: 0;
        z-index: 3;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 12px;
        padding: 24px;
        background: rgba(255, 255, 255, 0.65);
        backdrop-filter: blur(2px);
        pointer-events: none;
    }

    &__route-skeleton-bar {
        width: min(320px, 70%);
        height: 14px;
        border-radius: 7px;
        background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.08) 0%,
            rgba(0, 0, 0, 0.16) 50%,
            rgba(0, 0, 0, 0.08) 100%
        );
        background-size: 200% 100%;
        animation: mapbox-element-skeleton 1.2s ease-in-out infinite;

        &--short {
            width: min(200px, 45%);
        }
    }

    &__search {
        position: absolute;
        top: 12px;
        left: 12px;
        width: 280px;
        max-width: calc(100% - 24px);
        z-index: 2;
    }

    &__search-input {
        width: 100%;
        padding: 10px 12px;
        border-radius: 6px;
        border: 1px solid #d0d0d0;
        background: #fff;
        font-size: 14px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
        outline: none;
        box-sizing: border-box;

        &:focus {
            border-color: #3b82f6;
        }
    }

    &__search-results {
        margin: 4px 0 0;
        padding: 4px 0;
        list-style: none;
        background: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        max-height: 240px;
        overflow-y: auto;
    }

    &__search-result {
        padding: 8px 12px;
        font-size: 13px;
        cursor: pointer;
        color: #111;

        &:hover {
            background: #f4f4f5;
        }
    }

    @keyframes mapbox-element-skeleton {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }

    /* wwEditor:start */
    &__placeholder {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: repeating-linear-gradient(
            45deg,
            #f5f5f5,
            #f5f5f5 10px,
            #eaeaea 10px,
            #eaeaea 20px
        );
        color: #666;
        font-size: 14px;
        pointer-events: none;
    }
    /* wwEditor:end */
}
</style>
