import * as React from 'react';
import {
  MapPin,
  Truck,
  Wind,
  Navigation,
  ExternalLink,
  CheckCircle2,
  ShieldAlert,
  PlusCircle,
  Flame,
  Building2,
  Compass,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import type { IncidentState, StagingCandidate, NearbyFireStation } from '../lib/incident-engine';
import { windFromToKo, degToKo, STAGING_STATUS_KO, PLACED_BY_KO } from '../lib/ko-terms';

export function MapWorkspace({
  incident,
  mapsApiKey,
  isDispatcher,
  onSelectStagingCandidate,
  onPlaceCustomStaging,
  onSwitchTo3D,
}: {
  incident: IncidentState;
  mapsApiKey: string | null;
  isDispatcher: boolean;
  onSelectStagingCandidate?: (stagingId: string, status: 'selected' | 'candidate') => void;
  onPlaceCustomStaging?: (
    type: 'truck_staging' | 'medical_post',
    localPos: [number, number, number]
  ) => void;
  onSwitchTo3D?: () => void;
}) {
  const [selectedMarkerId, setSelectedMarkerId] = React.useState<string>('incident-building');
  const [zoom, setZoom] = React.useState<number>(1);
  const [pan, setPan] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const center = React.useMemo(
    () => incident.building?.coordinates || { lat: 34.0505, lng: -118.2479 },
    [incident.building?.coordinates]
  );

  // Convert lat/lng to SVG tactical viewport coordinates (800x600 space centered on incident building)
  const projectLatLng = React.useCallback(
    (lat: number, lng: number) => {
      const dLat = lat - center.lat;
      const dLng = lng - center.lng;
      // Scale ~ 42,000 px per degree at zoom 1
      const scale = 42000 * zoom;
      const x = 440 + dLng * scale + pan.x;
      const y = 300 - dLat * scale + pan.y;
      return { x, y };
    },
    [center.lat, center.lng, zoom, pan.x, pan.y]
  );

  const buildingPt = projectLatLng(center.lat, center.lng);

  const selectedStaging = React.useMemo(
    () => incident.scene.stagingCandidates.find((s) => s.id === selectedMarkerId),
    [incident.scene.stagingCandidates, selectedMarkerId]
  );

  const selectedStation = React.useMemo(
    () => incident.building?.nearbyStations.find((st) => st.id === selectedMarkerId),
    [incident.building?.nearbyStations, selectedMarkerId]
  );

  // 지도 위 도로 이름: 코엑스 데모는 실제 주변 도로, 그 외(기존 미국 데모)는 원래 표기 유지
  const isCoexMap = /코엑스|coex/i.test(`${incident.building?.name || ''} ${incident.building?.address || ''}`);
  const mapLabels = isCoexMap
    ? {
        east: '영동대로 (동문 GATE · 삼성펌프)',
        north: '봉은사로 (북문 GATE · 임시응급의료소)',
        south: '테헤란로 (삼성역 방면)',
        west: '봉은사로86길 · 테헤란로87길',
        plaza: '삼성역 연결통로 (지하 · 연기 이동 방향)',
        stream: '탄천',
      }
    : {
        east: 'SOUTH BROADWAY (MAIN ENTRANCE & AERIAL STAGING)',
        north: 'WEST 3RD STREET (SANDSTONE SERVICE WALL & DUAL FDC)',
        south: '',
        west: '',
        plaza: '3RD & BROADWAY UPWIND PLAZA (EMS TRIAGE)',
        stream: 'TANCHEON STREAM',
      };

  // 도로선 위치(건물 중심에서 px, 확대 1배 기준). 코엑스는 구글 지도에서 잰 실제 거리에 맞춤
  // (북문 정류장 ≈ 북쪽 70px, 동문 정류장 ≈ 동쪽 80px), 기존 데모는 원래 값 유지
  const road = isCoexMap
    ? { e: 82, n: -74, w: -80, s: 110 }
    : { e: 56, n: -125, w: -95, s: 72 };

  const windFromDeg = incident.weather.windDirectionFromDeg ?? 290;
  const windToDeg = (windFromDeg + 180) % 360;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-zinc-950 select-none">
      {/* Top Geospatial Summary Bar */}
      <div className="z-20 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 bg-zinc-950/95 px-3 py-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-100">
            <MapPin className="h-3.5 w-3.5 text-red-400" />
            {incident.building?.name || '사건 발생 위치'}
          </span>
          <span className="text-zinc-400 hidden sm:inline">{incident.building?.address}</span>
          <span className="rounded-xs border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">
            {center.lat >= 0 ? '북위' : '남위'} {Math.abs(center.lat).toFixed(4)}°, {center.lng >= 0 ? '동경' : '서경'} {Math.abs(center.lng).toFixed(4)}°
          </span>
          {incident.building?.googleMapsUri && (
            <a
              href={incident.building.googleMapsUri}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-xs border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[11px] text-sky-300 hover:bg-zinc-800"
            >
              구글 지도에서 열기
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isDispatcher && onPlaceCustomStaging && (
            <button
              type="button"
              onClick={() => onPlaceCustomStaging('truck_staging', [16, 0, 15])}
              data-testid="map-propose-staging-btn"
              className="inline-flex items-center gap-1 rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-1 text-[11px] font-medium text-zinc-200 hover:bg-zinc-800"
            >
              <PlusCircle className="h-3 w-3 text-amber-400" />
              차량 배치 위치 제안
            </button>
          )}
          {onSwitchTo3D && (
            <button
              type="button"
              onClick={onSwitchTo3D}
              className="rounded-sm border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 text-[11px] font-medium text-amber-200 hover:bg-amber-500/25"
            >
              3D로 건물 보기
            </button>
          )}
        </div>
      </div>

      {/* Main Dark-Mode Tactical Geospatial Map Viewport */}
      <div className="relative flex-1 overflow-hidden bg-[#090d16]">
        <svg
          viewBox="0 0 880 600"
          data-testid="geospatial-map-svg"
          className="h-full w-full object-cover"
        >
          <defs>
            <pattern id="map-grid" width="44" height="44" patternUnits="userSpaceOnUse">
              <path
                d="M 44 0 L 0 0 0 44"
                fill="none"
                stroke="#1e293b"
                strokeWidth="0.8"
              />
            </pattern>
            <radialGradient id="plume-grad" cx="20%" cy="50%" r="80%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.38)" />
              <stop offset="45%" stopColor="rgba(245, 158, 11, 0.18)" />
              <stop offset="100%" stopColor="rgba(113, 113, 122, 0)" />
            </radialGradient>
          </defs>

          {/* Coordinate Grid Background */}
          <rect width="880" height="600" fill="#090d16" />
          <rect width="880" height="600" fill="url(#map-grid)" />

          {/* Tancheon Stream / Samseong-dong East Corridor Geometry */}
          <polygon
            points="730,0 880,0 880,600 795,600"
            fill="#0c192c"
            stroke="#1e3a5f"
            strokeWidth="1.5"
          />
          <text
            x="790"
            y="95"
            fill="#38bdf8"
            opacity="0.45"
            fontFamily="IBM Plex Mono, monospace"
            fontSize="11"
          >
            {mapLabels.stream}
          </text>

          {/* Major Arterial Road Network around 417 Yeongdong-daero (Gangnam-gu) */}
          <g stroke="#1e293b" strokeLinecap="round">
            {/* Yeongdong-daero (8-Lane N-S Primary Arterial) */}
            <line
              x1={buildingPt.x + road.e * zoom}
              y1="0"
              x2={buildingPt.x + road.e * zoom}
              y2="600"
              stroke="#27272a"
              strokeWidth={28 * zoom}
            />
            <line
              x1={buildingPt.x + road.e * zoom}
              y1="0"
              x2={buildingPt.x + road.e * zoom}
              y2="600"
              stroke="#3f3f46"
              strokeWidth="1.5"
              strokeDasharray="8 6"
            />
            {/* Teheran-ro (Major E-W Arterial via Samseong Station) */}
            <line
              x1="0"
              y1={buildingPt.y + road.n * zoom}
              x2="880"
              y2={buildingPt.y + road.n * zoom}
              stroke="#27272a"
              strokeWidth={22 * zoom}
            />
            {/* Teheran-ro 108-gil (West/North FDC & Service Alley) */}
            <line
              x1={buildingPt.x + road.w * zoom}
              y1="0"
              x2={buildingPt.x + road.w * zoom}
              y2="600"
              stroke="#1e293b"
              strokeWidth={14 * zoom}
            />
            <line
              x1="0"
              y1={buildingPt.y + road.s * zoom}
              x2="880"
              y2={buildingPt.y + road.s * zoom}
              stroke="#1e293b"
              strokeWidth={15 * zoom}
            />
          </g>

          {/* Street Labels */}
          <text
            x={buildingPt.x + (road.e + 20) * zoom}
            y="185"
            fill="#94a3b8"
            fontFamily="IBM Plex Mono, monospace"
            fontSize="11"
            fontWeight="600"
            transform={`rotate(90, ${buildingPt.x + (road.e + 20) * zoom}, 185)`}
          >
            {mapLabels.east}
          </text>
          <text
            x="120"
            y={buildingPt.y + (road.n - 13) * zoom}
            fill="#94a3b8"
            fontFamily="IBM Plex Mono, monospace"
            fontSize="10"
            fontWeight="600"
          >
            {mapLabels.north}
          </text>
          <text
            x={isCoexMap ? buildingPt.x + 30 * zoom : buildingPt.x - 185 * zoom}
            y={buildingPt.y + (isCoexMap ? road.s - 8 : 64) * zoom}
            fill="#64748b"
            fontFamily="IBM Plex Mono, monospace"
            fontSize="10"
          >
            {mapLabels.plaza}
          </text>
          {mapLabels.south && (
            <text
              x="120"
              y={buildingPt.y + (road.s + 20) * zoom}
              fill="#94a3b8"
              fontFamily="IBM Plex Mono, monospace"
              fontSize="10"
              fontWeight="600"
            >
              {mapLabels.south}
            </text>
          )}
          {mapLabels.west && (
            <text
              x={buildingPt.x + (road.w - 17) * zoom}
              y="185"
              fill="#94a3b8"
              fontFamily="IBM Plex Mono, monospace"
              fontSize="10"
              fontWeight="600"
              transform={`rotate(90, ${buildingPt.x + (road.w - 17) * zoom}, 185)`}
            >
              {mapLabels.west}
            </text>
          )}

          {/* Downwind Smoke Plume Cone (Aligned with Meteorological Wind FROM WNW -> Blowing ESE) */}
          <g
            transform={`translate(${buildingPt.x}, ${buildingPt.y}) rotate(${
              windToDeg - 90
            })`}
          >
            <polygon
              points="0,0 240,-58 240,58"
              fill="url(#plume-grad)"
              stroke="#f59e0b"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text
              x="95"
              y="4"
              fill="#fcd34d"
              fontFamily="IBM Plex Mono, monospace"
              fontSize="10"
            >
              연기 확산 방향 ({incident.weather.windSpeedKmh ?? 19} km/h)
            </text>
          </g>

          {/* Routes API Approach Polylines from Nearby Fire Stations */}
          {(incident.building?.nearbyStations || []).map((st) => {
            const stPt = projectLatLng(st.coordinates.lat, st.coordinates.lng);
            const midX = stPt.x;
            const midY = buildingPt.y;
            const isSelected = selectedMarkerId === st.id;
            return (
              <g key={`route-${st.id}`}>
                <polyline
                  points={`${stPt.x},${stPt.y} ${midX},${midY} ${buildingPt.x},${buildingPt.y}`}
                  fill="none"
                  stroke={isSelected ? '#38bdf8' : '#0284c7'}
                  strokeWidth={isSelected ? '3.5' : '2.5'}
                  strokeDasharray="6 4"
                  opacity={isSelected ? '1' : '0.75'}
                />
              </g>
            );
          })}

          {/* Incident Building Footprint & Active Fire Pin */}
          <g
            onClick={() => setSelectedMarkerId('incident-building')}
            className="cursor-pointer"
          >
            <rect
              x={buildingPt.x - 36 * zoom}
              y={buildingPt.y - 26 * zoom}
              width={72 * zoom}
              height={52 * zoom}
              rx="4"
              fill="rgba(239, 68, 68, 0.22)"
              stroke="#ef4444"
              strokeWidth="2.5"
            />
            <circle
              cx={buildingPt.x}
              cy={buildingPt.y}
              r="11"
              fill="#ef4444"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <rect
              x={buildingPt.x - 195}
              y={buildingPt.y - 54 * zoom}
              width="390"
              height="20"
              rx="4"
              fill="rgba(9, 13, 22, 0.88)"
              stroke="#ef4444"
              strokeWidth="1"
            />
            <text
              x={buildingPt.x}
              y={buildingPt.y - 40 * zoom}
              textAnchor="middle"
              fill="#fef2f2"
              fontFamily="Plus Jakarta Sans, sans-serif"
              fontSize="11.5"
              fontWeight="700"
            >
              {incident.building?.name || '사건 건물'} (정보 수정 #{incident.buildingRevision})
            </text>
          </g>

          {/* Staging Candidate & Selected Markers */}
          {incident.scene.stagingCandidates.map((stg, idx) => {
            const pt = projectLatLng(stg.coordinates.lat, stg.coordinates.lng);
            // Place pins at clear, non-overlapping tactical positions around the footprint
            // 기존 미국 데모는 핀이 겹치지 않도록 고정 간격을 두고, 코엑스는 실제 좌표 위치에 그대로 표시
            const offsetX = isCoexMap ? pt.x : pt.x + (idx === 0 ? 52 : idx === 1 ? -95 : 105);
            const offsetY = isCoexMap ? pt.y : pt.y + (idx === 0 ? 64 : idx === 1 ? 18 : -16);
            const isSelected = stg.status === 'selected';
            const fill =
              stg.type === 'truck_staging'
                ? isSelected
                  ? '#f59e0b'
                  : '#d97706'
                : '#10b981';
            // 코엑스: 건물 서쪽 핀은 이름표를 왼쪽에 붙여 화점 표시와 겹치지 않게 한다
            const alignEnd = isCoexMap ? pt.x < buildingPt.x - 4 : idx === 1;

            return (
              <g
                key={stg.id}
                onClick={() => setSelectedMarkerId(stg.id)}
                className="cursor-pointer"
              >
                <circle
                  cx={offsetX}
                  cy={offsetY}
                  r="8.5"
                  fill={fill}
                  stroke="#09090b"
                  strokeWidth="2"
                />
                <text
                  x={alignEnd ? offsetX - 13 : offsetX + 13}
                  y={offsetY + 4}
                  textAnchor={alignEnd ? 'end' : 'start'}
                  fill={isSelected ? '#fde68a' : '#d4d4d8'}
                  fontFamily="IBM Plex Mono, monospace"
                  fontSize="10"
                  fontWeight="600"
                >
                  {isSelected ? '[확정] ' : '[후보] '}
                  {stg.label.split('—')[0].trim()}
                </text>
              </g>
            );
          })}

          {/* Nearby Fire Station Pins */}
          {(incident.building?.nearbyStations || []).map((st) => {
            const stPt = projectLatLng(st.coordinates.lat, st.coordinates.lng);
            return (
              <g
                key={st.id}
                onClick={() => setSelectedMarkerId(st.id)}
                className="cursor-pointer"
              >
                <rect
                  x={stPt.x - 10}
                  y={stPt.y - 10}
                  width="20"
                  height="20"
                  rx="4"
                  fill="#0284c7"
                  stroke="#e0f2fe"
                  strokeWidth="1.5"
                />
                <text
                  x={stPt.x + 15}
                  y={stPt.y + 4}
                  fill="#bae6fd"
                  fontFamily="IBM Plex Mono, monospace"
                  fontSize="11"
                  fontWeight="600"
                >
                  {st.name} (
                  {st.durationSeconds ? `${Math.ceil(st.durationSeconds / 60)}분 도착 예상` : '경로'})
                </text>
              </g>
            );
          })}
        </svg>

        {/* Map Zoom & Pan Controls */}
        <div className="pointer-events-auto absolute right-3 bottom-3 z-10 flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-950/90 p-1 shadow-lg">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2.2, +(z + 0.25).toFixed(2)))}
            title="확대"
            className="rounded-xs p-1.5 text-zinc-300 hover:bg-zinc-800"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.25).toFixed(2)))}
            title="축소"
            className="rounded-xs p-1.5 text-zinc-300 hover:bg-zinc-800"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            title="지도 시점 초기화"
            className="rounded-xs p-1.5 text-zinc-300 hover:bg-zinc-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Bottom-Left Tactical Panel: Fire Stations, Routes API ETAs, and Staging Candidates */}
        <div
          data-testid="map-tactical-overlay"
          className="pointer-events-auto absolute bottom-3 left-3 z-10 w-80 max-w-[calc(100%-4.5rem)] max-h-[52%] overflow-y-auto space-y-2 rounded-lg border border-zinc-800/95 bg-zinc-950/95 p-2.5 text-xs shadow-2xl backdrop-blur-md"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-100 truncate">
              <Navigation className="h-3.5 w-3.5 text-sky-400 shrink-0" />
              <span className="truncate">출동 경로·차량 배치</span>
            </span>
            <span className="font-mono text-[10px] text-zinc-400 shrink-0">지도 API</span>
          </div>

          {/* Nearby Fire Stations */}
          <div className="space-y-1">
            <div className="font-mono text-[10px] uppercase text-zinc-400">
              가까운 소방서 (도착 예상 시간)
            </div>
            {(incident.building?.nearbyStations || []).map((st) => (
              <div
                key={st.id}
                onClick={() => setSelectedMarkerId(st.id)}
                className={`flex w-full cursor-pointer items-center justify-between rounded-sm border px-2 py-1 text-left transition ${
                  selectedMarkerId === st.id
                    ? 'border-sky-500/70 bg-sky-950/30'
                    : 'border-zinc-800/80 bg-zinc-900/70 hover:border-sky-500/40'
                }`}
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-zinc-200">{st.name}</div>
                  <div className="truncate text-[10px] text-zinc-400">{st.address}</div>
                </div>
                <div className="shrink-0 text-right font-mono text-[11px] text-emerald-400">
                  {st.durationSeconds ? `${Math.ceil(st.durationSeconds / 60)}분` : '—'}
                  <div className="text-[10px] text-zinc-400">
                    {st.distanceMeters ? `${(st.distanceMeters / 1000).toFixed(1)} km` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Staging Candidates */}
          <div className="space-y-1 pt-1 border-t border-zinc-800/80">
            <div className="font-mono text-[10px] uppercase text-zinc-400">
              차량 배치 위치·임시응급의료소 후보
            </div>
            {incident.scene.stagingCandidates.map((stg) => (
              <div
                key={stg.id}
                onClick={() => setSelectedMarkerId(stg.id)}
                className={`cursor-pointer rounded-sm border p-2 space-y-1 transition ${
                  selectedMarkerId === stg.id
                    ? 'border-amber-500/70 bg-amber-950/20'
                    : 'border-zinc-800 bg-zinc-900/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 font-medium text-zinc-100">
                    <Truck className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{stg.label}</span>
                  </span>
                  <span
                    className={`rounded-xs px-1.5 py-0.5 font-mono text-[9px] uppercase ${
                      stg.status === 'selected'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {STAGING_STATUS_KO[stg.status] ?? stg.status}
                  </span>
                </div>
                {stg.units && stg.units.length > 0 && (
                  <ul className="space-y-0.5">
                    {stg.units.map((un) => (
                      <li key={un.callSign} className="flex items-baseline justify-between gap-2 text-[10px]">
                        <span className="min-w-0">
                          <span
                            className={`font-semibold ${
                              un.kind === 'pump'
                                ? 'text-red-300'
                                : un.kind === 'rescue'
                                  ? 'text-orange-300'
                                  : un.kind === 'ambulance'
                                    ? 'text-emerald-300'
                                    : 'text-sky-300'
                            }`}
                          >
                            {un.callSign}
                          </span>
                          {un.outOfJurisdiction && (
                            <span className="ml-1 rounded-xs border border-sky-500/40 px-1 text-[9px] text-sky-300">타관할</span>
                          )}
                          {un.dispatchPhase === 'level1' && (
                            <span className="ml-1 rounded-xs border border-amber-500/40 px-1 text-[9px] text-amber-300">대응1단계</span>
                          )}
                          <span className="ml-1 text-zinc-400">{un.role}</span>
                        </span>
                        {un.routeDurationSeconds ? (
                          <span className="shrink-0 font-mono text-zinc-300">{Math.round(un.routeDurationSeconds / 60)}분</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
                {stg.risks.length > 0 && (
                  <p className="text-[10px] text-zinc-400">
                    <ShieldAlert className="inline h-3 w-3 text-amber-400 mr-1" />
                    {stg.risks[0]}
                  </p>
                )}
                {isDispatcher && onSelectStagingCandidate && (
                  <div className="flex justify-end pt-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStagingCandidate(
                          stg.id,
                          stg.status === 'selected' ? 'candidate' : 'selected'
                        );
                      }}
                      className="inline-flex items-center gap-1 rounded-xs border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-200 hover:bg-zinc-700"
                    >
                      <CheckCircle2 className="h-2.5 w-2.5 text-amber-400" />
                      {stg.status === 'selected' ? '후보로 되돌리기' : '배치 위치 확정'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Top-Right Wind Direction Compass & Selected Pin Inspector */}
        <div className="pointer-events-auto absolute right-3 top-3 z-10 flex flex-col gap-2 w-64 max-w-[calc(100%-1.5rem)]">
          <div className="rounded-md border border-zinc-800 bg-zinc-950/90 p-2 text-xs shadow-lg backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-sky-400 shrink-0" />
              <div className="min-w-0">
                <div className="font-semibold text-zinc-100 truncate">
                  풍향 {windFromToKo(incident.weather.windCardinalFrom || 'WNW')} ({windFromDeg}°)
                </div>
                <div className="text-[11px] text-zinc-400 truncate">
                  {incident.weather.windSpeedKmh ?? 18} km/h · 연기는 {degToKo(windToDeg)}쪽으로 ({windToDeg}°)
                </div>
              </div>
            </div>
          </div>

          {selectedStaging && (
            <div className="rounded-md border border-amber-500/40 bg-zinc-950/95 p-2.5 text-xs shadow-lg">
              <div className="font-mono text-[10px] uppercase text-amber-400">
                {selectedStaging.status === 'selected'
                  ? '확정된 차량 배치 위치'
                  : 'AI 조사 배치 후보'}
              </div>
              <div className="mt-0.5 font-semibold text-zinc-100">{selectedStaging.label}</div>
              <div className="mt-1 text-[11px] text-zinc-400">
                제안: {PLACED_BY_KO[selectedStaging.placedBy] ?? selectedStaging.placedBy} ·{' '}
                {selectedStaging.coordinates.lat.toFixed(4)},{' '}
                {selectedStaging.coordinates.lng.toFixed(4)}
              </div>
              {selectedStaging.outstandingChecks.length > 0 && (
                <div className="mt-1.5 text-[10px] text-amber-200">
                  확인 필요: {selectedStaging.outstandingChecks[0]}
                </div>
              )}
            </div>
          )}

          {selectedStation && (
            <div className="rounded-md border border-sky-500/40 bg-zinc-950/95 p-2.5 text-xs shadow-lg">
              <div className="font-mono text-[10px] uppercase text-sky-400">
                소방서 출동 경로
              </div>
              <div className="mt-0.5 font-semibold text-zinc-100">{selectedStation.name}</div>
              <div className="text-[11px] text-zinc-300">{selectedStation.address}</div>
              {selectedStation.googleMapsUri && (
                <a
                  href={selectedStation.googleMapsUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-sky-300 hover:underline"
                >
                  길 안내 열기
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
