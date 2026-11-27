import * as React from 'react';
import Hls from 'hls.js';
import {
  Activity,
  AlertTriangle,
  Car,
  CloudSun,
  ExternalLink,
  Loader2,
  RefreshCw,
  Users,
  Video,
  VideoOff,
} from 'lucide-react';
import type { IncidentState } from '../lib/incident-engine';
import type { LiveOverview, LiveSourceState, LiveCctv } from '../lib/live-traffic';
import { cardinalToKo } from '../lib/ko-terms';

const REFRESH_MS = 60_000;

function SourceBadge({ label, state }: { label: string; state: LiveSourceState }) {
  const meta: Record<LiveSourceState['status'], { text: string; cls: string }> = {
    ok: { text: '실시간 연결', cls: 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300' },
    no_key: { text: '키 없음 · 추정값', cls: 'border-zinc-700 bg-zinc-900 text-zinc-400' },
    error: { text: '연결 오류', cls: 'border-red-500/50 bg-red-500/15 text-red-300' },
    not_applicable: { text: '해당 없음', cls: 'border-zinc-800 bg-zinc-900 text-zinc-500' },
  };
  const m = meta[state.status];
  return (
    <span
      title={state.message}
      className={`inline-flex items-center gap-1 rounded-xs border px-1.5 py-0.5 font-mono text-[10px] ${m.cls}`}
    >
      {label} · {m.text}
    </span>
  );
}

function levelClass(level?: string): string {
  if (!level) return 'text-zinc-400';
  if (/정체|혼잡|붐빔/.test(level)) return 'text-red-300';
  if (/서행|지체|약간/.test(level)) return 'text-amber-300';
  if (/원활|여유|보통/.test(level)) return 'text-emerald-300';
  return 'text-zinc-300';
}

function fmtMin(sec?: number | null): string {
  if (sec === null || sec === undefined) return '—';
  const m = Math.max(1, Math.round(sec / 60));
  return `${m}분`;
}

function fmtKm(m?: number | null): string {
  if (m === null || m === undefined) return '';
  return `${(m / 1000).toFixed(1)}km`;
}

function CctvPlayer({ cctv }: { cctv: LiveCctv }) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    setFailed(false);
    let hls: Hls | null = null;
    const isHls = /m3u8/i.test(cctv.url) || /hls/i.test(cctv.format || '');
    if (isHls && Hls.isSupported()) {
      hls = new Hls({ lowLatencyMode: true });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) setFailed(true);
      });
      hls.loadSource(cctv.url);
      hls.attachMedia(video);
    } else {
      video.src = cctv.url;
    }
    video.play().catch(() => undefined);
    return () => {
      hls?.destroy();
      video.removeAttribute('src');
      video.load();
    };
  }, [cctv.url, cctv.format]);

  return (
    <div className="overflow-hidden rounded-md border border-zinc-800 bg-zinc-950">
      <div className="relative aspect-video w-full bg-black">
        {failed ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-[11px] text-zinc-500">
            <VideoOff className="h-5 w-5" />
            영상을 불러오지 못했습니다
          </div>
        ) : (
          <video ref={videoRef} muted playsInline autoPlay className="h-full w-full object-cover" />
        )}
        <span className="absolute left-1.5 top-1.5 rounded-xs bg-red-600 px-1 font-mono text-[9px] font-bold text-white">
          LIVE
        </span>
      </div>
      <div className="px-2 py-1.5">
        <div className="truncate text-[11px] font-semibold text-zinc-100">{cctv.name}</div>
        <div className="font-mono text-[10px] text-zinc-400">
          {cctv.roadType === 'ex' ? '고속도로' : '국도'} · 사건 위치에서 {fmtKm(cctv.distanceM)}
        </div>
      </div>
    </div>
  );
}

/**
 * 실시간 교통·CCTV 화면
 * 카카오모빌리티(출동 소요시간), 서울 실시간 도시데이터(도로소통·사고·날씨·혼잡도), ITS(CCTV)를 1분마다 갱신한다.
 */
export function LiveTrafficView({ incident }: { incident: IncidentState }) {
  const [data, setData] = React.useState<LiveOverview | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!incident.building) return;
    setLoading(true);
    try {
      const res = await fetch('/api/live/overview');
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  }, [incident.building]);

  React.useEffect(() => {
    void load();
    const t = setInterval(() => void load(), REFRESH_MS);
    return () => clearInterval(t);
  }, [load, incident.building?.name]);

  if (!incident.building) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-zinc-500">
        사건 건물이 정해지면 실시간 교통 정보를 불러옵니다.
      </div>
    );
  }

  const city = data?.city;

  return (
    <div data-testid="live-traffic-view" className="h-full overflow-y-auto bg-zinc-950 p-3.5 space-y-3.5 text-xs">
      {/* 상단: 연결 상태 */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {data && (
            <>
              <SourceBadge label="카카오모빌리티" state={data.sources.kakao} />
              <SourceBadge label="서울 도시데이터" state={data.sources.seoul} />
              <SourceBadge label="ITS CCTV" state={data.sources.its} />
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-200 hover:bg-zinc-800"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          {data ? `${new Date(data.fetchedAt).toLocaleTimeString('ko-KR', { hour12: false })} 갱신` : '불러오기'}
        </button>
      </div>
      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-950/30 px-2.5 py-1.5 text-red-200">{error}</div>
      )}

      {/* 1. 출동 소요시간 */}
      <section className="rounded-md border border-zinc-800 bg-zinc-900/50">
        <header className="flex items-center gap-1.5 border-b border-zinc-800 px-3 py-2 font-semibold text-zinc-100">
          <Car className="h-3.5 w-3.5 text-amber-400" />
          출동 소요시간
          <span className="ml-auto font-mono text-[10px] font-normal text-zinc-500">
            {data?.sources.kakao.status === 'ok' ? '카카오모빌리티 실시간 교통 반영' : '직선거리 기반 추정'}
          </span>
        </header>
        <div className="divide-y divide-zinc-800/70">
          {(data?.etas || []).map((e) => {
            const live = e.durationSec !== null;
            return (
              <div key={e.stationId} className="flex items-center justify-between gap-2 px-3 py-2">
                <div className="min-w-0">
                  <div className="truncate font-medium text-zinc-200">{e.stationName}</div>
                  <div className="truncate text-[10px] text-zinc-500">→ {e.targetLabel}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className={`font-mono text-sm font-bold ${live ? 'text-emerald-300' : 'text-zinc-400'}`}>
                    {live ? fmtMin(e.durationSec) : `${fmtMin(e.estimatedDurationSec)} (추정)`}
                  </div>
                  <div className="font-mono text-[10px] text-zinc-500">
                    {live ? fmtKm(e.distanceM) : ''}
                    {live && e.congestedSegments ? ` · 정체 구간 ${e.congestedSegments}곳` : ''}
                  </div>
                </div>
              </div>
            );
          })}
          {!data && <div className="px-3 py-3 text-zinc-500">불러오는 중…</div>}
        </div>
      </section>

      {/* 2. 주변 도로 소통 */}
      <section className="rounded-md border border-zinc-800 bg-zinc-900/50">
        <header className="flex items-center gap-1.5 border-b border-zinc-800 px-3 py-2 font-semibold text-zinc-100">
          <Activity className="h-3.5 w-3.5 text-sky-400" />
          주변 도로 소통
          <span className="ml-auto font-mono text-[10px] font-normal text-zinc-500">
            {incident.building.seoulCityDataArea
              ? `서울 실시간 도시데이터 · ${incident.building.seoulCityDataArea}`
              : '대상 지역 아님'}
          </span>
        </header>
        {city ? (
          <div className="space-y-2 p-3">
            {(city.avgMessage || city.avgLevel) && (
              <div className="rounded-sm bg-zinc-950/60 px-2 py-1.5">
                <span className={`font-semibold ${levelClass(city.avgLevel)}`}>
                  {city.avgLevel ?? '소통'}
                  {city.avgSpeedKmh ? ` · 평균 ${city.avgSpeedKmh}km/h` : ''}
                </span>
                {city.avgMessage && <span className="ml-1.5 text-zinc-300">{city.avgMessage}</span>}
              </div>
            )}
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {city.roads.slice(0, 12).map((r, i) => (
                <div key={i} className="flex items-center justify-between gap-2 rounded-sm border border-zinc-800 px-2 py-1">
                  <span className="truncate text-zinc-200">
                    {r.roadName}
                    {r.from && r.to && <span className="text-zinc-500"> ({r.from}→{r.to})</span>}
                    {r.distanceM !== undefined && (
                      <span className="ml-1 font-mono text-[10px] text-zinc-600">{(r.distanceM / 1000).toFixed(1)}km</span>
                    )}
                  </span>
                  <span className={`shrink-0 font-mono ${levelClass(r.level)}`}>
                    {r.level}
                    {r.speedKmh !== null ? ` ${r.speedKmh}` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-3 py-3 text-zinc-500">
            {data?.sources.seoul.status === 'error'
              ? `연결 오류: ${data.sources.seoul.message}`
              : data?.sources.seoul.status === 'not_applicable'
                ? '서울 실시간 도시데이터 대상 지역이 아닙니다.'
                : '서울 열린데이터광장 인증키를 넣으면 주변 도로 소통·사고·기상·혼잡도가 표시됩니다.'}
          </div>
        )}
      </section>

      {/* 3. 사고·통제 / 기상 / 혼잡도 */}
      {city && (
        <section className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="rounded-md border border-zinc-800 bg-zinc-900/50 p-2.5">
            <div className="flex items-center gap-1 font-semibold text-zinc-100">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400" /> 사고·통제
            </div>
            {city.accidents.length === 0 ? (
              <div className="mt-1 text-zinc-500">현재 보고 없음</div>
            ) : (
              <ul className="mt-1 space-y-1">
                {city.accidents.slice(0, 4).map((a, i) => (
                  <li key={i} className="text-zinc-300">
                    <span className="text-red-300">{a.type ?? '통제'}</span> {a.info}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-md border border-zinc-800 bg-zinc-900/50 p-2.5">
            <div className="flex items-center gap-1 font-semibold text-zinc-100">
              <CloudSun className="h-3.5 w-3.5 text-sky-400" /> 실시간 기상
            </div>
            <div className="mt-1 text-zinc-300">
              {city.weather?.tempC ?? '—'}°C · 습도 {city.weather?.humidity ?? '—'}%
              <br />
              바람 {city.weather?.windDir ? `${cardinalToKo(city.weather.windDir)}풍` : '—'} {city.weather?.windSpeed ?? '—'}m/s
            </div>
          </div>
          <div className="rounded-md border border-zinc-800 bg-zinc-900/50 p-2.5">
            <div className="flex items-center gap-1 font-semibold text-zinc-100">
              <Users className="h-3.5 w-3.5 text-amber-400" /> 실시간 혼잡도
            </div>
            <div className={`mt-1 font-semibold ${levelClass(city.crowd?.level)}`}>{city.crowd?.level ?? '—'}</div>
            {city.crowd?.min !== undefined && city.crowd?.min !== null && (
              <div className="text-zinc-400">
                추정 인구 {city.crowd.min.toLocaleString()}~{(city.crowd.max ?? city.crowd.min).toLocaleString()}명
              </div>
            )}
          </div>
        </section>
      )}

      {/* 4. CCTV */}
      <section className="rounded-md border border-zinc-800 bg-zinc-900/50">
        <header className="flex items-center gap-1.5 border-b border-zinc-800 px-3 py-2 font-semibold text-zinc-100">
          <Video className="h-3.5 w-3.5 text-red-400" />
          주변 도로 CCTV
          <span className="ml-auto font-mono text-[10px] font-normal text-zinc-500">ITS 국가교통정보센터</span>
        </header>
        {data && data.cctv.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2">
            {data.cctv.slice(0, 4).map((c) => (
              <CctvPlayer key={c.url} cctv={c} />
            ))}
          </div>
        ) : (
          <div className="px-3 py-3 text-zinc-500">
            {data?.sources.its.status === 'error'
              ? `연결 오류: ${data.sources.its.message}`
              : data?.sources.its.status === 'ok'
                ? data.sources.its.message
                : 'ITS 국가교통정보센터 인증키를 넣으면 주변 국도·고속도로 CCTV 실시간 영상이 표시됩니다. 코엑스 앞 도로처럼 서울 시내 도로 CCTV는 아래 TOPIS에서 볼 수 있습니다.'}
          </div>
        )}
        <div className="flex flex-wrap gap-1.5 border-t border-zinc-800 px-3 py-2">
          {(data?.links || []).map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-xs border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-[10px] text-sky-300 hover:bg-zinc-800"
            >
              {l.label}
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          ))}
        </div>
      </section>

      <p className="text-[10px] leading-relaxed text-zinc-500">
        도로 소통·CCTV는 국가교통정보센터·서울시 TOPIS 등 공공 원천 자료이며, 방송사 교통정보도 같은 자료를 씁니다.
        키가 없거나 연결이 안 되면 시나리오의 추정값을 표시합니다.
      </p>
    </div>
  );
}
