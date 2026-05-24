import { useEffect, useMemo, useRef, useState } from 'react';
import { geoCircle, geoMercator, geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import { Link } from 'react-router-dom';
import worldAtlas from 'world-atlas/countries-110m.json';
import usStatesTopology from 'us-atlas/states-10m.json';
import jobsData from '../../data/jobs';
import mapPlacesData, { CustomPlace } from '../../data/mapPlaces';
import { Job } from '../../types/content';
import './WorkHistoryMap.css';

interface MapPin {
  id: string;
  title: string;
  coordinates: [number, number];
  kind: 'job' | 'visited' | 'interesting' | 'custom';
  jobs?: Job[];
  note?: string;
}

interface ProjectedPin extends MapPin {
  x: number;
  y: number;
  originX: number;
  originY: number;
}

function spreadOverlappingPins(pins: ProjectedPin[]): ProjectedPin[] {
  const COLLISION_THRESHOLD = 22;
  const BASE_RADIUS = 9;
  const RING_STEP = 5;

  const squaredThreshold = COLLISION_THRESHOLD * COLLISION_THRESHOLD;
  const visited = new Set<number>();
  const result = [...pins];

  const findNeighbors = (startIndex: number): number[] => {
    const stack = [startIndex];
    const group: number[] = [];

    visited.add(startIndex);

    while (stack.length > 0) {
      const currentIndex = stack.pop() as number;
      group.push(currentIndex);

      for (let i = 0; i < pins.length; i += 1) {
        if (visited.has(i) || i === currentIndex) continue;

        const dx = pins[currentIndex].x - pins[i].x;
        const dy = pins[currentIndex].y - pins[i].y;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared <= squaredThreshold) {
          visited.add(i);
          stack.push(i);
        }
      }
    }

    return group;
  };

  for (let i = 0; i < pins.length; i += 1) {
    if (visited.has(i)) continue;

    const group = findNeighbors(i);
    if (group.length <= 1) continue;

    const sortedGroup = [...group].sort((a, b) => result[a].id.localeCompare(result[b].id));

    sortedGroup.forEach((pinIndex, indexInGroup) => {
      const ring = Math.floor(indexInGroup / 8);
      const radius = BASE_RADIUS + ring * RING_STEP;
      const angle = (indexInGroup / sortedGroup.length) * Math.PI * 2 - Math.PI / 2;

      result[pinIndex] = {
        ...result[pinIndex],
        x: result[pinIndex].x + Math.cos(angle) * radius,
        y: result[pinIndex].y + Math.sin(angle) * radius,
      };
    });
  }

  return result;
}

const VIEWBOX = {
  width: 1000,
  height: 560,
  padding: 24,
};

const MAP_TILE = {
  width: VIEWBOX.width,
  height: VIEWBOX.height,
};

const MAP_VERTICAL_BOUNDS = {
  top: 0,
  bottom: VIEWBOX.height,
};

const MERCATOR_SCALE = VIEWBOX.width / (Math.PI * 2);

const AMERICA_CENTER: [number, number] = [-98.5795, 39.8283];
const INITIAL_ZOOM = 2.35;
const DEFAULT_VIEW_TRANSFORM = { zoom: INITIAL_ZOOM, x: 0, y: 0 };
const HORIZONTAL_REPEAT_OFFSETS = [-1, 0, 1];
const ZOOM_BUTTON_FACTOR = 1.36;
const ZOOM_ANIMATION_MS = 240;

type ViewTransform = typeof DEFAULT_VIEW_TRANSFORM;

function buildJobPins(jobs: Job[]): MapPin[] {
  const groups: Record<string, MapPin> = {};

  jobs.forEach(job => {
    if (!job.location) return;

    const key = `${job.location.city}|${job.location.state}`;
    if (!groups[key]) {
      groups[key] = {
        id: `job-${key.toLowerCase().replace(/\s+/g, '-')}`,
        title: `${job.location.city}, ${job.location.state}`,
        coordinates: job.location.coordinates,
        kind: 'job',
        jobs: [],
      };
    }

    groups[key].jobs?.push(job);
  });

  return Object.values(groups);
}

function buildCustomPins(places: CustomPlace[]): MapPin[] {
  return places
    .filter(place => Array.isArray(place.coordinates) && place.coordinates.length === 2)
    .map(place => ({
      id: place.id,
      title: place.name,
      coordinates: place.coordinates,
      kind: place.category ?? 'custom',
      note: place.note,
    }));
}

/** Returns [longitude, latitude] of the point on Earth directly beneath the Sun */
function getSubsolarPoint(date: Date): [number, number] {
  const D = date.getTime() / 86_400_000 - 10_957.5; // days since J2000.0
  const L = ((280.460 + 0.985_647_4 * D) % 360 + 360) % 360;
  const g = ((357.528 + 0.985_600_3 * D) % 360 + 360) % 360;
  const gRad = (g * Math.PI) / 180;
  const lambdaRad = ((L + 1.915 * Math.sin(gRad) + 0.02 * Math.sin(2 * gRad)) * Math.PI) / 180;
  const epsilon = (23.439 * Math.PI) / 180;
  const sinDec = Math.sin(epsilon) * Math.sin(lambdaRad);
  const dec = Math.asin(sinDec) * (180 / Math.PI);
  const ra = Math.atan2(Math.cos(epsilon) * Math.sin(lambdaRad), Math.cos(lambdaRad)) * (180 / Math.PI);
  const gmst = ((280.460_618_37 + 360.985_647_366_29 * D) % 360 + 360) % 360;
  const lon = ((ra - gmst) % 360 + 540) % 360 - 180;
  return [lon, dec];
}

const US_CITIES: Array<{ name: string; coordinates: [number, number] }> = [
  { name: 'New York',        coordinates: [-74.006,   40.713] },
  { name: 'Los Angeles',     coordinates: [-118.244,  34.052] },
  { name: 'Chicago',         coordinates: [-87.629,   41.878] },
  { name: 'Houston',         coordinates: [-95.369,   29.760] },
  { name: 'Phoenix',         coordinates: [-112.074,  33.448] },
  { name: 'Philadelphia',    coordinates: [-75.165,   39.952] },
  { name: 'San Diego',       coordinates: [-117.161,  32.716] },
  { name: 'Dallas',          coordinates: [-96.797,   32.777] },
  { name: 'Denver',          coordinates: [-104.990,  39.739] },
  { name: 'Seattle',         coordinates: [-122.332,  47.606] },
  { name: 'Nashville',       coordinates: [-86.781,   36.165] },
  { name: 'Miami',           coordinates: [-80.192,   25.761] },
  { name: 'Atlanta',         coordinates: [-84.388,   33.749] },
  { name: 'Minneapolis',     coordinates: [-93.265,   44.977] },
  { name: 'Las Vegas',       coordinates: [-115.149,  36.175] },
  { name: 'Washington D.C.', coordinates: [-77.036,   38.907] },
  { name: 'Boston',          coordinates: [-71.059,   42.360] },
  { name: 'Portland',        coordinates: [-122.675,  45.523] },
  { name: 'New Orleans',     coordinates: [-90.071,   29.951] },
  { name: 'Detroit',         coordinates: [-83.048,   42.331] },
  { name: 'Charlotte',       coordinates: [-80.843,   35.227] },
  { name: 'Honolulu',        coordinates: [-157.858,  21.307] },
  { name: 'Anchorage',       coordinates: [-149.900,  61.218] },
];

export const WorkHistoryMap = () => {
  const [activePin, setActivePin] = useState<MapPin | null>(null);
  const [viewTransform, setViewTransform] = useState(DEFAULT_VIEW_TRANSFORM);
  const [isDragging, setIsDragging] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  const svgRef = useRef<SVGSVGElement | null>(null);
  const viewTransformRef = useRef<ViewTransform>(DEFAULT_VIEW_TRANSFORM);
  const zoomAnimationFrameRef = useRef<number | null>(null);
  const pointerTapRef = useRef<{ x: number; y: number; pinId: string | null } | null>(null);
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const gestureStartRef = useRef<{
    type: 'pan' | 'pinch';
    x: number;
    y: number;
    zoom: number;
    centerX: number;
    centerY: number;
    distance: number;
  } | null>(null);

  // Tick every minute to keep day/night shadow current
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    viewTransformRef.current = viewTransform;
  }, [viewTransform]);

  useEffect(() => {
    return () => {
      if (zoomAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(zoomAnimationFrameRef.current);
      }
    };
  }, []);

  const mapPins = useMemo(() => {
    const jobPins = buildJobPins(jobsData);
    const customPins = buildCustomPins(mapPlacesData);
    return [...jobPins, ...customPins];
  }, []);

  const countriesGeoJson = useMemo(() => {
    const topology = worldAtlas as unknown as {
      objects: { countries: unknown };
    };

    const countryFeatures = feature(
      topology as never,
      topology.objects.countries as never
    ) as unknown as GeoJSON.FeatureCollection;

    return {
      ...countryFeatures,
      features: countryFeatures.features.filter(countryFeature => String(countryFeature.id) !== '010'),
    };
  }, []);

  const projection = useMemo(
    () =>
      geoMercator()
        .scale(MERCATOR_SCALE)
        .translate([VIEWBOX.width / 2, VIEWBOX.height / 2])
        .precision(0.1),
    []
  );

  const americaViewTransform = useMemo(() => {
    const center = projection(AMERICA_CENTER);
    if (!center) return DEFAULT_VIEW_TRANSFORM;

    return {
      zoom: INITIAL_ZOOM,
      x: VIEWBOX.width / 2 - center[0] * INITIAL_ZOOM,
      y: VIEWBOX.height / 2 - center[1] * INITIAL_ZOOM,
    };
  }, [projection]);

  useEffect(() => {
    setViewTransform(clampViewTransform(americaViewTransform));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [americaViewTransform]);

  const pathGenerator = useMemo(() => geoPath(projection), [projection]);

  // ── Day / Night shadow ──────────────────────────────────────────────
  const solarPoint = useMemo((): [number, number] => {
    const [sunLon, sunLat] = getSubsolarPoint(currentTime);
    return [sunLon, sunLat];
  }, [currentTime]);

  const daylightPath = useMemo(() => {
    try {
      const daylight = geoCircle().center(solarPoint).radius(90).precision(1)();
      return pathGenerator(daylight as unknown as GeoJSON.Feature);
    } catch { return null; }
  }, [solarPoint, pathGenerator]);

  const twilightSegments = useMemo(() => {
    try {
      const daylight = geoCircle().center(solarPoint).radius(90).precision(1)();
      const ring = daylight.coordinates[0] ?? [];
      const segments: string[] = [];
      let currentSegment: [number, number][] = [];

      ring.forEach(coordinate => {
        const projected = projection(coordinate as [number, number]);
        const previous = currentSegment[currentSegment.length - 1];

        if (
          !projected ||
          !Number.isFinite(projected[0]) ||
          !Number.isFinite(projected[1])
        ) {
          if (currentSegment.length > 1) {
            segments.push(
              currentSegment
                .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x},${y}`)
                .join('')
            );
          }
          currentSegment = projected ? [[projected[0], projected[1]]] : [];
          return;
        }

        if (previous && Math.abs(projected[0] - previous[0]) > MAP_TILE.width / 2) {
          const crossingToRight = previous[0] > projected[0];
          const adjustedX = projected[0] + (crossingToRight ? MAP_TILE.width : -MAP_TILE.width);
          const edgeX = crossingToRight ? MAP_TILE.width : 0;
          const oppositeEdgeX = crossingToRight ? 0 : MAP_TILE.width;
          const progressToEdge = (edgeX - previous[0]) / (adjustedX - previous[0]);
          const edgeY = previous[1] + (projected[1] - previous[1]) * progressToEdge;

          currentSegment.push([edgeX, edgeY]);

          if (currentSegment.length > 1) {
            segments.push(
              currentSegment
                .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x},${y}`)
                .join('')
            );
          }

          currentSegment = [[oppositeEdgeX, edgeY], [projected[0], projected[1]]];
          return;
        }

        currentSegment.push([projected[0], projected[1]]);
      });

      if (currentSegment.length > 1) {
        segments.push(
          currentSegment
            .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x},${y}`)
            .join('')
        );
      }

      return segments;
    } catch { return []; }
  }, [solarPoint, projection]);

  // ── US State borders ─────────────────────────────────────────────────────
  const usStateBordersPath = useMemo(() => {
    try {
      const topo = usStatesTopology as never;
      const objects = (usStatesTopology as unknown as { objects: { states: object } }).objects;
      const statesMesh = mesh(topo, objects.states as never);
      return pathGenerator(statesMesh as unknown as GeoJSON.Feature);
    } catch { return null; }
  }, [pathGenerator]);

  // ── Major city projections ───────────────────────────────────────────
  const projectedCities = useMemo(
    () =>
      US_CITIES.flatMap(city => {
        const pt = projection(city.coordinates);
        return pt ? [{ name: city.name, x: pt[0], y: pt[1] }] : [];
      }),
    [projection]
  );

  const projectedPins = useMemo(
    () => {
      const basePins = mapPins
        .map(pin => {
          const point = projection(pin.coordinates);
          if (!point) {
            return null;
          }

          return {
            ...pin,
            x: point[0],
            y: point[1],
            originX: point[0],
            originY: point[1],
          } as ProjectedPin;
        })
        .filter((pin): pin is ProjectedPin => pin !== null);

      return spreadOverlappingPins(basePins);
    },
    [mapPins, projection]
  );

  const jobPinCount = mapPins.filter(pin => pin.kind === 'job').length;
  const customPinCount = mapPins.length - jobPinCount;
  const selectedPinLabel = activePin?.title ?? 'None';
  const selectedPinJobs = activePin?.jobs?.length ?? 0;

  const selectPinById = (pinId: string) => {
    const nextPin = mapPins.find(pin => pin.id === pinId);
    if (!nextPin) return;

    setActivePin(prev => (prev?.id === nextPin.id ? null : nextPin));
  };

  const formatCoordinateLabel = (value: number, positiveHemisphere: string, negativeHemisphere: string) => {
    const hemisphere = value >= 0 ? positiveHemisphere : negativeHemisphere;
    return `${Math.abs(value).toFixed(1)}°${hemisphere}`;
  };

  const sunLongitude = formatCoordinateLabel(solarPoint[0], 'E', 'W');
  const sunLatitude = formatCoordinateLabel(solarPoint[1], 'N', 'S');

  const clampZoom = (value: number) => Math.min(6, Math.max(1, value));

  const clampViewTransform = (transform: ViewTransform): ViewTransform => {
    const zoom = clampZoom(transform.zoom);
    const scaledTop = MAP_VERTICAL_BOUNDS.top * zoom;
    const scaledBottom = MAP_VERTICAL_BOUNDS.bottom * zoom;
    const scaledMapHeight = scaledBottom - scaledTop;

    if (scaledMapHeight <= VIEWBOX.height) {
      return {
        ...transform,
        zoom,
        y: (VIEWBOX.height - scaledMapHeight) / 2 - scaledTop,
      };
    }

    return {
      ...transform,
      zoom,
      y: Math.min(-scaledTop, Math.max(VIEWBOX.height - scaledBottom, transform.y)),
    };
  };

  const cancelZoomAnimation = () => {
    if (zoomAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(zoomAnimationFrameRef.current);
      zoomAnimationFrameRef.current = null;
    }
  };

  const setViewTransformNow = (transform: ViewTransform) => {
    viewTransformRef.current = transform;
    setViewTransform(transform);
  };

  const animateViewTransform = (targetTransform: ViewTransform, duration = ZOOM_ANIMATION_MS) => {
    cancelZoomAnimation();

    const startTransform = viewTransformRef.current;
    const shouldReduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (shouldReduceMotion) {
      setViewTransformNow(targetTransform);
      return;
    }

    const startTime = performance.now();
    const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

    const step = (time: number) => {
      const progress = Math.min(1, (time - startTime) / duration);
      const easedProgress = easeOutCubic(progress);
      const nextTransform = {
        zoom: startTransform.zoom + (targetTransform.zoom - startTransform.zoom) * easedProgress,
        x: startTransform.x + (targetTransform.x - startTransform.x) * easedProgress,
        y: startTransform.y + (targetTransform.y - startTransform.y) * easedProgress,
      };

      setViewTransformNow(nextTransform);

      if (progress < 1) {
        zoomAnimationFrameRef.current = window.requestAnimationFrame(step);
      } else {
        zoomAnimationFrameRef.current = null;
        setViewTransformNow(targetTransform);
      }
    };

    zoomAnimationFrameRef.current = window.requestAnimationFrame(step);
  };

  const getSvgPointFromClient = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;

    const ctm = svg.getScreenCTM();
    if (!ctm) return null;

    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    return point.matrixTransform(ctm.inverse());
  };

  const getWrappedMapOrigin = () => {
    const scaledTileWidth = MAP_TILE.width * viewTransform.zoom;
    const wrappedX = ((viewTransform.x % scaledTileWidth) + scaledTileWidth) % scaledTileWidth;

    return {
      x: wrappedX - scaledTileWidth,
      y: viewTransform.y,
    };
  };

  const wrappedMapOrigin = getWrappedMapOrigin();

  const renderMapTile = (tileX: number, tileY: number) => {
    const tileKey = `${tileX}-${tileY}`;

    return (
      <g key={tileKey} transform={`translate(${tileX * MAP_TILE.width} ${tileY * MAP_TILE.height})`}>
        <rect className="map-ocean" width={MAP_TILE.width} height={MAP_TILE.height} />

        <g className="map-countries">
          {countriesGeoJson.features.map((countryFeature, index) => {
            const path = pathGenerator(countryFeature);
            if (!path) {
              return null;
            }

            return <path key={`${tileKey}-${countryFeature.id ?? index}`} d={path} className="map-country" />;
          })}
        </g>

        {daylightPath && (
          <path d={daylightPath} className="map-day-overlay" />
        )}
        {twilightSegments.map((segmentPath, index) => (
          <path key={`${tileKey}-twilight-${index}`} d={segmentPath} className="map-twilight-overlay" />
        ))}
        {viewTransform.zoom >= 1.6 && usStateBordersPath && (
          <path d={usStateBordersPath} className="map-state-border" />
        )}

        {viewTransform.zoom >= 2.2 && projectedCities.map(city => (
          <g key={`${tileKey}-${city.name}`} transform={`translate(${city.x}, ${city.y})`}>
            <circle className="map-city-dot" r={3 / viewTransform.zoom} />
            {viewTransform.zoom >= 3.2 && (
              <text
                className="map-city-label"
                y={-6 / viewTransform.zoom}
                fontSize={6.2 / viewTransform.zoom}
              >
                {city.name}
              </text>
            )}
          </g>
        ))}

        <g className="map-location-layer">
          {projectedPins.map(pin => {
            const movedDistance = Math.hypot(pin.x - pin.originX, pin.y - pin.originY);
            if (movedDistance < 1) {
              return null;
            }

            return (
              <line
                key={`${tileKey}-leader-${pin.id}`}
                className="history-marker-leader"
                x1={pin.originX}
                y1={pin.originY}
                x2={pin.x}
                y2={pin.y}
              />
            );
          })}

          {projectedPins.map(pin => {
            const isActive = activePin?.id === pin.id;

            return (
              <g
                key={`${tileKey}-${pin.id}`}
                className={`history-marker history-marker--${pin.kind}${isActive ? ' history-marker--active' : ''}`}
                data-pin-id={pin.id}
                transform={`translate(${pin.x}, ${pin.y})`}
                onClick={event => event.stopPropagation()}
                role="button"
                tabIndex={0}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectPinById(pin.id);
                  }
                }}
              >
                <circle className="history-marker-pulse" r="16" />
                <circle className="history-marker-dot" r="7" />
                {pin.jobs && pin.jobs.length > 1 && (
                  <g className="history-marker-count">
                    <circle className="history-marker-count-core" r="5.2" />
                    <text className="history-marker-count-label" y="0.4">
                      {pin.jobs.length}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </g>
    );
  };

  const zoomAtSvgPoint = (
    anchorX: number,
    anchorY: number,
    nextZoom: number,
    animate = false,
    duration = ZOOM_ANIMATION_MS
  ) => {
    const currentTransform = viewTransformRef.current;
    const clampedNextZoom = clampZoom(nextZoom);
    if (clampedNextZoom === currentTransform.zoom) return;

    const worldX = (anchorX - currentTransform.x) / currentTransform.zoom;
    const worldY = (anchorY - currentTransform.y) / currentTransform.zoom;

    const nextTransform = clampViewTransform({
      zoom: clampedNextZoom,
      x: anchorX - worldX * clampedNextZoom,
      y: anchorY - worldY * clampedNextZoom,
    });

    if (animate) {
      animateViewTransform(nextTransform, duration);
      return;
    }

    cancelZoomAnimation();
    setViewTransformNow(nextTransform);
  };

  const zoomAtViewCenter = (direction: 1 | -1) => {
    const currentZoom = viewTransformRef.current.zoom;
    const nextZoom = direction > 0
      ? currentZoom * ZOOM_BUTTON_FACTOR
      : currentZoom / ZOOM_BUTTON_FACTOR;

    zoomAtSvgPoint(VIEWBOX.width / 2, VIEWBOX.height / 2, nextZoom, true);
  };

  const handleWheelZoom = (event: React.WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const cursorInSvg = getSvgPointFromClient(event.clientX, event.clientY);
    if (!cursorInSvg) return;

    const cursorX = cursorInSvg.x;
    const cursorY = cursorInSvg.y;
    const currentZoom = viewTransformRef.current.zoom;
    const normalizedDelta = Math.max(-3, Math.min(3, -event.deltaY / 100));
    const zoomFactor = Math.pow(1.045, normalizedDelta);
    const nextZoom = clampZoom(currentZoom * zoomFactor);

    zoomAtSvgPoint(cursorX, cursorY, nextZoom);
  };

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    cancelZoomAnimation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const pointerTarget = event.target as Element | null;
    const markerTarget = pointerTarget?.closest?.('.history-marker') as SVGGElement | null;
    pointerTapRef.current = {
      x: event.clientX,
      y: event.clientY,
      pinId: markerTarget?.dataset.pinId ?? null,
    };

    activePointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    const pointers = Array.from(activePointersRef.current.values());
    const currentTransform = viewTransformRef.current;
    if (pointers.length >= 2) {
      const [firstPointer, secondPointer] = pointers;
      gestureStartRef.current = {
        type: 'pinch',
        x: currentTransform.x,
        y: currentTransform.y,
        zoom: currentTransform.zoom,
        centerX: (firstPointer.x + secondPointer.x) / 2,
        centerY: (firstPointer.y + secondPointer.y) / 2,
        distance: Math.hypot(firstPointer.x - secondPointer.x, firstPointer.y - secondPointer.y),
      };
    } else {
      gestureStartRef.current = {
        type: 'pan',
        x: event.clientX - currentTransform.x,
        y: event.clientY - currentTransform.y,
        zoom: currentTransform.zoom,
        centerX: event.clientX,
        centerY: event.clientY,
        distance: 0,
      };
    }

    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!activePointersRef.current.has(event.pointerId)) return;

    const pointerTap = pointerTapRef.current;
    if (
      pointerTap &&
      Math.hypot(event.clientX - pointerTap.x, event.clientY - pointerTap.y) > 6
    ) {
      pointerTapRef.current = null;
    }

    activePointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    const gestureStart = gestureStartRef.current;
    if (!isDragging || !gestureStart) return;

    const pointers = Array.from(activePointersRef.current.values());

    if (gestureStart.type === 'pinch' && pointers.length >= 2) {
      const [firstPointer, secondPointer] = pointers;
      const currentCenter = {
        x: (firstPointer.x + secondPointer.x) / 2,
        y: (firstPointer.y + secondPointer.y) / 2,
      };
      const currentDistance = Math.hypot(firstPointer.x - secondPointer.x, firstPointer.y - secondPointer.y);
      const nextZoom = clampZoom(gestureStart.zoom * (currentDistance / Math.max(gestureStart.distance, 1)));
      const anchor = getSvgPointFromClient(gestureStart.centerX, gestureStart.centerY);
      const currentCenterInSvg = getSvgPointFromClient(currentCenter.x, currentCenter.y);

      if (!anchor || !currentCenterInSvg) return;

      const worldX = (anchor.x - gestureStart.x) / gestureStart.zoom;
      const worldY = (anchor.y - gestureStart.y) / gestureStart.zoom;

      setViewTransform(clampViewTransform({
        zoom: nextZoom,
        x: currentCenterInSvg.x - worldX * nextZoom,
        y: currentCenterInSvg.y - worldY * nextZoom,
      }));
      return;
    }

    if (pointers.length === 1) {
      setViewTransform(prev => clampViewTransform({
        ...prev,
        x: event.clientX - gestureStart.x,
        y: event.clientY - gestureStart.y,
      }));
    }
  };

  const handlePointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    const pointerTap = pointerTapRef.current;
    if (
      activePointersRef.current.size === 1 &&
      pointerTap?.pinId &&
      Math.hypot(event.clientX - pointerTap.x, event.clientY - pointerTap.y) <= 6
    ) {
      selectPinById(pointerTap.pinId);
    }
    pointerTapRef.current = null;

    activePointersRef.current.delete(event.pointerId);

    if (activePointersRef.current.size === 1) {
      const remainingPointer = Array.from(activePointersRef.current.values())[0];
      const currentTransform = viewTransformRef.current;
      gestureStartRef.current = {
        type: 'pan',
        x: remainingPointer.x - currentTransform.x,
        y: remainingPointer.y - currentTransform.y,
        zoom: currentTransform.zoom,
        centerX: remainingPointer.x,
        centerY: remainingPointer.y,
        distance: 0,
      };
      return;
    }

    setIsDragging(false);
    gestureStartRef.current = null;
  };

  const resetView = () => {
    animateViewTransform(clampViewTransform(americaViewTransform));
  };

  return (
    <section className="work-history-map-section" id="map">
      <div className="map-header-row">
        <div className="map-heading-group">
          <h2 className="section-heading">World Map</h2>
          <p className="map-subtitle">
            Work locations plus any place I have visited or want to visit
          </p>
        </div>
      </div>

      <div className="history-map-layout">
        <div className="map-container">
          <div className="map-controls">
            <button type="button" onClick={() => zoomAtViewCenter(1)}>+</button>
            <button type="button" onClick={() => zoomAtViewCenter(-1)}>−</button>
            <button type="button" onClick={resetView}>Reset</button>
          </div>

          <svg
            ref={svgRef}
            className="us-history-map"
            viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
            role="img"
            aria-label="Interactive world map with location markers"
            onWheel={handleWheelZoom}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <defs>
              <linearGradient id="history-map-marker-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>

            <g transform={`translate(${wrappedMapOrigin.x} ${wrappedMapOrigin.y})`}>
              <g transform={`scale(${viewTransform.zoom})`}>
                {HORIZONTAL_REPEAT_OFFSETS.map(tileX => renderMapTile(tileX, 0))}
              </g>
            </g>
          </svg>

          <div className="map-footer">
            <div className="map-caption">
              <span className="map-caption-dot" />
              <span>Click a marker for details · Add custom pins in mapPlaces.json</span>
              <span className="map-utc-time">
                {currentTime.getUTCHours().toString().padStart(2, '0')}
                :{currentTime.getUTCMinutes().toString().padStart(2, '0')} UTC · {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} local
              </span>
            </div>

            <div className="map-meta-row" aria-label="Map status details">
              <span className="map-meta-pill">
                <span className="map-meta-label">Zoom</span>
                <strong>{viewTransform.zoom.toFixed(2)}x</strong>
              </span>
              <span className="map-meta-pill">
                <span className="map-meta-label">Markers</span>
                <strong>{mapPins.length}</strong>
              </span>
              <span className="map-meta-pill">
                <span className="map-meta-label">Work</span>
                <strong>{jobPinCount}</strong>
              </span>
              <span className="map-meta-pill">
                <span className="map-meta-label">Other</span>
                <strong>{customPinCount}</strong>
              </span>
              <span className="map-meta-pill map-meta-pill--wide">
                <span className="map-meta-label">Selected</span>
                <strong>{selectedPinLabel}{selectedPinJobs > 1 ? ` (${selectedPinJobs} jobs)` : ''}</strong>
              </span>
              <span className="map-meta-pill map-meta-pill--wide">
                <span className="map-meta-label">Sun position</span>
                <strong>{sunLatitude} · {sunLongitude}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="history-right-column">
          <Link className="inline-home-link" to="/">
            Home
          </Link>

          <aside className="history-details-panel" aria-live="polite">
            {activePin ? (
              <div className="map-popup">
                <div className="popup-location-header">
                  <span className="popup-location-dot" />
                  <h3 className="popup-location-name">
                    {activePin.title}
                  </h3>
                </div>

                {activePin.jobs && activePin.jobs.length > 0 ? (
                  <div className="popup-jobs">
                    {activePin.jobs.map((job, idx) => (
                      <div key={job.id} className="popup-job">
                        {idx > 0 && <div className="popup-divider" />}
                        <p className="popup-company">{job.company}</p>
                        <p className="popup-title">{job.title}</p>
                        <p className="popup-period">{job.period}</p>
                        {job.descriptionText && <p className="popup-desc-text">{job.descriptionText}</p>}
                        {job.description.length > 0 && (
                          <ul className="popup-desc-list">
                            {job.description.map((description, index) => (
                              <li key={index}>{description}</li>
                            ))}
                          </ul>
                        )}
                        {job.skills.length > 0 && (
                          <div className="popup-skills">
                            {job.skills.map(skill => (
                              <span key={skill} className="popup-skill-tag">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="popup-jobs">
                    <div className="popup-job">
                      <p className="popup-company">{activePin.kind.toUpperCase()} pin</p>
                      <p className="popup-desc-text">
                        {activePin.note || 'Add note text in src/data/mapPlaces.ts to describe this place.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="history-details-empty">
                <h3>Select a marker</h3>
                <p>Click any marker to view details. You can add custom pins in src/data/mapPlaces.ts.</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
};
