/* Gráficos 2D del episodio 13, segunda mitad: el riel de fechas (enero–mayo 2025), las 120.000 ampollas, la lista de
   trazabilidad sin el fentanilo, el mapa de la distribución, las 12 ampollas del hospital, el correo a la ANMAT, la
   coincidencia genómica, el autoclave, lo destruido, los 5 kilos que faltan, los procesados, el estado de la causa
   y los 4 millones de unidades. */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import prov from '../data/ep04/arg_provincias.json';
import {K, F, gs, gm, mix, fadeIO, clamp, easeIn, easeInOut, easeOut, pop, prog, rnd, fmt, Odo13, ramp} from './kit13';
import {LineIcon} from './viz13a';

/* ================================================================== RIEL DE FECHAS */
export type RailMark = {day: number; label: string; sub?: string; at: number; color?: string; up?: boolean; big?: boolean; h?: number; align?: 'left' | 'right'};
/** riel horizontal de fechas: day = días desde el 1/1/2025; los hitos aparecen sincronizados */
export const DatesRail: React.FC<{t: number; t0: number; t1?: number; d0: number; d1: number; marks: RailMark[]; y?: number; months?: [number, string][]; band?: {from: number; to: number; at: number; label: string; color?: string}; focus?: number}> = ({
  t, t0, t1 = Infinity, d0, d1, marks, y = 620, months = [], band, focus = -1,
}) => {
  const o = fadeIO(t, t0, t1, 0.45);
  if (o <= 0) return null;
  const X0 = 170, X1 = 1750;
  const dx = (d: number) => X0 + ((X1 - X0) * (d - d0)) / (d1 - d0);
  const grow = prog(t, t0, 1.0, easeInOut);
  const bp = band ? prog(t, band.at, 1.2, easeInOut) : 0;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <svg width={1920} height={1080}>
        <line x1={X0} y1={y} x2={X0 + (X1 - X0) * grow} y2={y} stroke={K.line2} strokeWidth={3} />
        {months.map(([d, l]) => (
          <g key={l} opacity={grow}>
            <line x1={dx(d)} y1={y - 12} x2={dx(d)} y2={y + 12} stroke={K.mute} strokeWidth={2} />
            <text x={dx(d) + 10} y={y + 40} fontFamily={F.mono} fontSize={20} fill={K.mute} letterSpacing="0.14em">
              {l}
            </text>
          </g>
        ))}
        {band ? <rect x={dx(band.from)} y={y - 9} width={(dx(band.to) - dx(band.from)) * bp} height={18} rx={4} fill={band.color ?? K.red} opacity={0.75} /> : null}
        {marks.map((m, i) => {
          const p = prog(t, m.at, 0.5);
          if (p <= 0) return null;
          const c = m.color ?? K.bone;
          const up = m.up !== false;
          const h = m.h ?? (m.big ? 170 : 120);
          const dim = focus >= 0 && focus !== i ? 0.35 : 1;
          return (
            <g key={i} opacity={p * dim}>
              <line x1={dx(m.day)} y1={y} x2={dx(m.day)} y2={up ? y - h * p : y + h * p} stroke={c} strokeWidth={3} />
              <circle cx={dx(m.day)} cy={y} r={11 * pop(t, m.at)} fill={c} />
            </g>
          );
        })}
      </svg>
      {marks.map((m, i) => {
        const p = prog(t, m.at + 0.15, 0.5);
        if (p <= 0) return null;
        const c = m.color ?? K.bone;
        const up = m.up !== false;
        const h = m.h ?? (m.big ? 170 : 120);
        const dim = focus >= 0 && focus !== i ? 0.35 : 1;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: dx(m.day) + (m.align === 'right' ? 6 : -6), top: up ? y - h - 12 : y + h + 12, opacity: p * dim, maxWidth: m.big ? 430 : 360, width: 'max-content',
              transform: `translate(${m.align === 'right' ? '-100%' : '0'}, ${up ? '-100%' : '0'})`, textAlign: m.align === 'right' ? 'right' : 'left',
            }}
          >
            <div style={{...gm(m.big ? 26 : 21, c, 600, 0.14)}}>{m.label}</div>
            {m.sub ? <div style={{...gs(m.big ? 40 : 30, 600, K.bone, -0.01), lineHeight: 1.1, marginTop: 4}}>{m.sub}</div> : null}
          </div>
        );
      })}
      {band ? (
        <div
          style={{
            position: 'absolute', left: (dx(band.from) + dx(band.to)) / 2, top: y + 62, transform: 'translateX(-50%)', opacity: bp, ...gm(20, band.color ?? K.red, 600, 0.16), whiteSpace: 'nowrap',
            background: 'rgba(4,10,11,0.92)', border: `1px solid ${band.color ?? K.red}`, borderRadius: 4, padding: '8px 16px',
          }}
        >
          {band.label}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ================================================================== 120.000 AMPOLLAS */
/** 120 bloques de 1.000 ampollas que se llenan */
export const Ampoules120k: React.FC<{t: number; t0: number; t1?: number; x?: number; y?: number; dur?: number; s?: number}> = ({t, t0, t1 = Infinity, x = 960, y = 560, dur = 3.2, s = 1}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const cols = 20, rows = 6, cw = 64, ch = 74;
  const k = ramp(t, t0 + 0.2, 120, dur);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', opacity: o, textAlign: 'center'}}>
      <svg width={cols * cw * s} height={rows * ch * s} viewBox={`0 0 ${cols * cw} ${rows * ch}`}>
        {Array.from({length: 120}, (_, i) => {
          const c = i % cols, r = Math.floor(i / cols);
          const on = clamp(k - i);
          return (
            <g key={i} transform={`translate(${c * cw + 8},${r * ch + 6})`} opacity={0.12 + 0.88 * on}>
              {Array.from({length: 5}, (_, j) => (
                <rect key={j} x={j * 10} y={(1 - on) * 10} width={7} height={52} rx={3} fill={on > 0.5 ? K.red : K.bone} opacity={0.9} />
              ))}
            </g>
          );
        })}
      </svg>
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 26, marginTop: 20}}>
        <Odo13 value={k * 1000} size={130} color={K.bone} />
        <span style={{...gm(28, K.red, 600, 0.18)}}>AMPOLLAS · LOTE 31.244</span>
      </div>
      <div style={{...gm(18, K.mute, 500, 0.14), marginTop: 6}}>CADA BLOQUE = 1.000 AMPOLLAS</div>
    </div>
  );
};

/* ================================================================== TRAZABILIDAD */
/** la lista de medicamentos con trazabilidad obligatoria: el fentanilo no está */
export const TraceList: React.FC<{t: number; t0: number; t1?: number; tMiss: number; x?: number; y?: number}> = ({t, t0, t1 = Infinity, tMiss, x = 220, y = 230}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const miss = prog(t, tMiss, 0.6);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 760, opacity: o}}>
      <div style={{...gm(22, K.teal, 600, 0.2), marginBottom: 18}}>TRAZABILIDAD OBLIGATORIA · ANMAT</div>
      {Array.from({length: 7}, (_, i) => {
        const p = prog(t, t0 + 0.2 + i * 0.12, 0.4);
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 20, padding: '14px 0', borderBottom: `1px solid ${K.line}`, opacity: p}}>
            <span style={{...gm(20, K.mute, 500)}}>{String(i + 1).padStart(2, '0')}</span>
            <span style={{height: 14, width: 220 + rnd(i + 4) * 260, background: 'rgba(236,243,241,0.22)', borderRadius: 3}} />
            <span style={{marginLeft: 'auto', ...gm(20, K.teal, 600)}}>✓</span>
          </div>
        );
      })}
      <div style={{display: 'flex', alignItems: 'center', gap: 20, padding: '18px 0', borderBottom: `2px dashed ${K.red}`, opacity: miss, transform: `translateX(${(1 - miss) * 30}px)`}}>
        <span style={{...gm(20, K.red, 600)}}>—</span>
        <span style={{...gs(40, 760, K.red, -0.01)}}>FENTANILO</span>
        <span style={{marginLeft: 'auto', ...gm(22, K.red, 700, 0.14)}}>NO ESTABA</span>
      </div>
      <div style={{...gm(17, K.mute, 500, 0.12), marginTop: 12, opacity: prog(t, t0 + 1, 0.5)}}>LISTA ILUSTRATIVA (NOMBRES OMITIDOS)</div>
    </div>
  );
};

/* ================================================================== MAPA */
type Feat = {properties: {n: string}; geometry: {type: 'Polygon' | 'MultiPolygon'; coordinates: number[][][] | number[][][][]}};
const FEATS = (prov as unknown as {features: Feat[]}).features;
export type ArgProj = {cx: number; cy: number; lon0: number; lat0: number; k: number};
export const ARG_P: ArgProj = {cx: 1330, cy: 548, lon0: -63.5, lat0: -38.5, k: 30};
export const pxy = (p: ArgProj, lon: number, lat: number): [number, number] => [p.cx + (lon - p.lon0) * p.k * Math.cos((p.lat0 * Math.PI) / 180) * 1.15, p.cy - (lat - p.lat0) * p.k];
const ringPath = (p: ArgProj, ring: number[][]) => ring.map(([lon, lat], i) => `${i ? 'L' : 'M'}${pxy(p, lon, lat).map((v) => v.toFixed(1)).join(' ')}`).join(' ') + 'Z';
const featPath = (p: ArgProj, f: Feat) =>
  f.geometry.type === 'Polygon' ? (f.geometry.coordinates as number[][][]).map((r) => ringPath(p, r)).join(' ') : (f.geometry.coordinates as number[][][][]).map((poly) => poly.map((r) => ringPath(p, r)).join(' ')).join(' ');

export const DEST: {name: string; prov: string; lon: number; lat: number; label: string}[] = [
  {name: 'Buenos Aires', prov: 'Buenos Aires', lon: -59.2, lat: -36.4, label: 'BUENOS AIRES'},
  {name: 'Santa Fe', prov: 'Santa Fe', lon: -60.9, lat: -31.2, label: 'SANTA FE'},
  {name: 'Córdoba', prov: 'Córdoba', lon: -64.2, lat: -31.4, label: 'CÓRDOBA'},
  {name: 'la Ciudad', prov: 'Ciudad de Buenos Aires', lon: -58.4, lat: -34.6, label: 'CABA'},
  {name: 'Neuquén', prov: 'Neuquén', lon: -68.1, lat: -38.9, label: 'NEUQUÉN'},
  {name: 'Formosa', prov: 'Formosa', lon: -58.2, lat: -26.2, label: 'FORMOSA'},
  {name: 'Jujuy', prov: 'Jujuy', lon: -65.3, lat: -24.2, label: 'JUJUY'},
];
export const RAMALLO = {lon: -60.01, lat: -33.48};

/** mapa de la Argentina con la distribución desde Ramallo; lost = las trazas se vuelven "?" y se pierden */
export const ArgMap13: React.FC<{t: number; t0: number; t1?: number; at: number[]; lost?: number; p?: ArgProj; zoom?: number}> = ({t, t0, t1 = Infinity, at, lost = Infinity, p = ARG_P, zoom = 1}) => {
  const o = fadeIO(t, t0, t1, 0.5);
  if (o <= 0) return null;
  const lp = prog(t, lost, 1.6, easeInOut);
  const hl = new Map(DEST.map((d, i) => [d.prov, prog(t, at[i], 0.6)] as [string, number]));
  const [rx, ry] = pxy(p, RAMALLO.lon, RAMALLO.lat);
  return (
    <AbsoluteFill style={{opacity: o, transform: `scale(${zoom})`, transformOrigin: `${rx}px ${ry}px`}}>
      <svg width={1920} height={1080}>
        <defs>
          <filter id="mglow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        {FEATS.map((f, i) => {
          const h = hl.get(f.properties.n) ?? 0;
          return <path key={i} d={featPath(p, f)} fill={h > 0 ? `rgba(255,59,48,${0.1 + 0.22 * h})` : 'rgba(236,243,241,0.05)'} stroke={h > 0 ? K.red : 'rgba(236,243,241,0.28)'} strokeWidth={h > 0 ? 1.8 : 1.1} />;
        })}
        {DEST.map((d, i) => {
          const k = prog(t, at[i] - 0.5, 0.9, easeInOut);
          if (k <= 0) return null;
          const [bx, by] = pxy(p, d.lon, d.lat);
          const mx = (rx + bx) / 2 + (by - ry) * 0.25, my = (ry + by) / 2 - Math.abs(bx - rx) * 0.25 - 30;
          const len = Math.hypot(bx - rx, by - ry) * 1.3 + 60;
          return (
            <g key={i}>
              <path d={`M${rx} ${ry} Q${mx} ${my} ${bx} ${by}`} fill="none" stroke={K.red} strokeWidth={3} strokeDasharray={lp > 0 ? `${8} ${10 + lp * 20}` : `${len}`} strokeDashoffset={lp > 0 ? -t * 30 : len * (1 - k)} opacity={1 - lp * 0.65} />
              <circle cx={bx} cy={by} r={9 * k} fill={K.red} />
              <circle cx={bx} cy={by} r={9 + ((t * 30) % 30)} fill="none" stroke={K.red} strokeWidth={2} opacity={k * (1 - ((t * 30) % 30) / 30)} />
              {lp > 0 ? (
                <text x={bx + 16} y={by - 14} fontFamily={F.sans} fontWeight={800} fontSize={34} fill={K.amber} opacity={lp}>
                  ?
                </text>
              ) : null}
            </g>
          );
        })}
        <circle cx={rx} cy={ry} r={12} fill={K.amber} />
        <circle cx={rx} cy={ry} r={26} fill="none" stroke={K.amber} strokeWidth={2} opacity={0.8} />
      </svg>
      {DEST.map((d, i) => {
        const k = prog(t, at[i], 0.5);
        if (k <= 0) return null;
        const [bx, by] = pxy(p, d.lon, d.lat);
        const left = d.lon < -62;
        const dy = d.label === 'CABA' ? -16 : d.label === 'BUENOS AIRES' ? 18 : 0;
        return (
          <div key={i} style={{position: 'absolute', left: bx + (left ? -18 : 18), top: by + dy, transform: `translate(${left ? '-100%' : '0'}, -50%)`, opacity: k, ...gm(20, K.bone, 600, 0.12), whiteSpace: 'nowrap', textShadow: '0 2px 8px rgba(0,0,0,0.9)'}}>
            {d.label}
          </div>
        );
      })}
      <div style={{position: 'absolute', left: rx - 34, top: ry - 4, transform: 'translate(-100%,-50%)', ...gm(20, K.amber, 600, 0.12), whiteSpace: 'nowrap', textShadow: '0 2px 8px rgba(0,0,0,0.9)'}}>RAMALLO · PLANTA</div>
    </AbsoluteFill>
  );
};

/* ================================================================== HOSPITAL */
/** doce ampollas analizadas: diez con bacterias; las de otra marca, ninguna */
export const TwelveAmpoules: React.FC<{t: number; t0: number; t1?: number; tTen: number; tOther: number; y?: number}> = ({t, t0, t1 = Infinity, tTen, tOther, y = 420}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const amp = (x: number, yy: number, bad: number, label?: string, key?: string) => (
    <g key={key} transform={`translate(${x},${yy})`}>
      <path d="M-20 60 v-78 q0 -10 8 -16 l6 -6 v-10 q-6 -6 0 -14 h12 q6 8 0 14 v10 l6 6 q8 6 8 16 v78 q0 8 -8 8 h-24 q-8 0 -8 -8 z" fill="rgba(236,243,241,0.08)" stroke="rgba(236,243,241,0.75)" strokeWidth={2.5} />
      <rect x={-15} y={10} width={30} height={52} rx={6} fill={bad > 0 ? `rgba(255,59,48,${0.2 + 0.5 * bad})` : 'rgba(191,237,228,0.45)'} />
      {bad > 0 ? Array.from({length: 6}, (_, i) => <rect key={i} x={-12 + rnd(i + x) * 20} y={16 + rnd(i * 3 + x) * 40} width={8} height={3} rx={1.5} fill={K.red} opacity={bad} />) : null}
      {label ? (
        <text x={0} y={96} textAnchor="middle" fontFamily={F.mono} fontSize={16} fill={K.mute}>
          {label}
        </text>
      ) : null}
    </g>
  );
  const ten = prog(t, tTen, 1.0);
  const other = prog(t, tOther, 0.6);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 150, top: y - 150, ...gm(22, K.teal, 600, 0.2)}}>FENTANILO HLB · 12 AMPOLLAS ANALIZADAS</div>
      <svg width={1920} height={1080}>
        {Array.from({length: 12}, (_, i) => {
          const p = prog(t, t0 + i * 0.06, 0.4);
          const bad = i < 10 ? clamp(ten * 10 - i) : 0;
          return <g key={i} opacity={p}>{amp(170 + i * 112, y, bad, String(i + 1), 'h' + i)}</g>;
        })}
        <g opacity={other}>
          {Array.from({length: 6}, (_, i) => amp(170 + i * 112, y + 300, 0, undefined, 'o' + i))}
        </g>
      </svg>
      <div style={{position: 'absolute', left: 1700, top: y - 30, transform: 'translateX(-50%)', textAlign: 'center', opacity: ten}}>
        <div style={{...gs(130, 800, K.red, -0.04)}}>
          {Math.round(ramp(t, tTen, 10, 1.0))}
          <span style={{color: K.dim, fontWeight: 300}}>/12</span>
        </div>
        <div style={{...gm(20, K.red, 600, 0.16)}}>CON LAS BACTERIAS</div>
      </div>
      <div style={{position: 'absolute', left: 150, top: y + 170, ...gm(22, K.mute, 600, 0.2), opacity: other}}>OTRA MARCA</div>
      <div style={{position: 'absolute', left: 1700, top: y + 270, transform: 'translateX(-50%)', textAlign: 'center', opacity: other}}>
        <div style={{...gs(130, 800, K.teal, -0.04)}}>0</div>
        <div style={{...gm(20, K.teal, 600, 0.16)}}>NINGUNA</div>
      </div>
    </AbsoluteFill>
  );
};

/** correo a la ANMAT (solo los datos: quién, a quién y cuándo) */
export const EmailCard: React.FC<{t: number; t0: number; t1?: number; tSend: number; x?: number; y?: number}> = ({t, t0, t1 = Infinity, tSend, x = 1240, y = 520}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const p = pop(t, t0, 0.9);
  const send = prog(t, tSend, 0.8, easeIn);
  const rows: [string, string][] = [
    ['DE', 'Jefatura de Farmacia · Hospital Italiano de La Plata'],
    ['PARA', 'ANMAT'],
    ['FECHA', '2 de mayo de 2025'],
  ];
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 860, transform: `translate(-50%,-50%) scale(${(0.94 + 0.06 * p) * (1 - send * 0.3)}) translate(${send * 900}px, ${-send * 300}px) rotate(${send * -8}deg)`, opacity: o * (1 - send * 0.9)}}>
      <div style={{background: '#F4F6F3', borderRadius: 18, overflow: 'hidden', boxShadow: '0 40px 90px rgba(0,0,0,0.6)'}}>
        <div style={{background: '#E3E8E5', padding: '18px 28px', display: 'flex', alignItems: 'center', gap: 12}}>
          {['#E0605A', '#E7B04B', '#5DBB63'].map((c) => (
            <span key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />
          ))}
          <span style={{...gm(18, K.inkSoft, 600, 0.14), marginLeft: 16}}>NUEVO MENSAJE</span>
        </div>
        <div style={{padding: '18px 30px 28px'}}>
          {rows.map(([k, v], i) => (
            <div key={k} style={{display: 'flex', gap: 22, padding: '14px 0', borderBottom: '1px solid rgba(11,20,22,0.12)', opacity: prog(t, t0 + 0.2 + i * 0.15, 0.4)}}>
              <span style={{...gm(19, K.inkSoft, 600, 0.14), width: 90}}>{k}</span>
              <span style={{fontFamily: F.ui, fontSize: 28, color: K.ink}}>{v}</span>
            </div>
          ))}
          <div style={{marginTop: 18}}>
            {[0.92, 0.84, 0.6].map((w, i) => (
              <div key={i} style={{height: 12, width: `${w * 100}%`, background: 'rgba(11,20,22,0.12)', borderRadius: 3, marginBottom: 12}} />
            ))}
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10}}>
            <span style={{...gm(16, K.inkSoft, 500, 0.1)}}>CONTENIDO NO REPRODUCIDO</span>
            <span style={{background: K.tealDeep, color: '#fff', fontFamily: F.ui, fontWeight: 600, fontSize: 24, padding: '10px 26px', borderRadius: 10}}>Enviar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/** coincidencia genómica: dos secuencias (pacientes y ampollas) que se alinean */
export const GenomeMatch: React.FC<{t: number; t0: number; t1?: number; tMatch: number; x?: number; y?: number}> = ({t, t0, t1 = Infinity, tMatch, x = 960, y = 640}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const N = 46;
  const BASES = 'ACGT';
  const m = prog(t, tMatch, 1.4, easeInOut);
  const off = (1 - m) * 160;
  const row = (label: string, yy: number, dx: number, seed: number) => (
    <g transform={`translate(${-N * 15 + dx},${yy})`}>
      <text x={-24} y={22} textAnchor="end" fontFamily={F.mono} fontSize={20} fill={K.mute} letterSpacing="0.14em">
        {label}
      </text>
      {Array.from({length: N}, (_, i) => {
        const b = BASES[Math.floor(rnd(i * 3 + 7) * 4)];
        const show = prog(t, t0 + i * 0.02 + seed * 0.2, 0.3);
        const c = b === 'A' ? '#5AD08E' : b === 'C' ? '#64B0FF' : b === 'G' ? K.amber : '#FF6B6B';
        return (
          <g key={i} opacity={show}>
            <rect x={i * 30} y={0} width={26} height={34} rx={4} fill={c} opacity={0.18 + 0.5 * m} />
            <text x={i * 30 + 13} y={24} textAnchor="middle" fontFamily={F.mono} fontWeight={600} fontSize={18} fill={K.bone}>
              {b}
            </text>
          </g>
        );
      })}
    </g>
  );
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, opacity: o}}>
      <svg width={1920} height={1080}>
        <g transform={`translate(${x},${y})`}>
          {row('PACIENTES', -60, -off, 0)}
          {row('AMPOLLAS', 20, off, 1)}
          {m > 0.95
            ? Array.from({length: N}, (_, i) => <line key={i} x1={-N * 15 + i * 30 + 13} y1={-24} x2={-N * 15 + i * 30 + 13} y2={18} stroke={K.teal} strokeWidth={2} opacity={prog(t, tMatch + 1.4 + i * 0.01, 0.3)} />)
            : null}
        </g>
      </svg>
      <div style={{position: 'absolute', left: x, top: y + 110, transform: 'translateX(-50%)', textAlign: 'center', opacity: prog(t, tMatch + 1.3, 0.5)}}>
        <div style={{...gs(64, 800, K.teal, -0.02)}}>COINCIDENCIA GENÓMICA ✓</div>
        <div style={{...gm(20, K.mute, 500, 0.14), marginTop: 6}}>INSTITUTO MALBRÁN · SECUENCIAS ILUSTRATIVAS</div>
      </div>
    </div>
  );
};

/** pacientes conectados a un punto en común: el fentanilo de HLB */
export const PatientsLink: React.FC<{t: number; t0: number; t1?: number; tLink: number}> = ({t, t0, t1 = Infinity, tLink}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const link = prog(t, tLink, 1.0, easeInOut);
  const cx = 960, cy = 560;
  const pts = Array.from({length: 11}, (_, i) => {
    const a = (i / 11) * Math.PI * 2 - Math.PI / 2;
    return [cx + Math.cos(a) * 440, cy + Math.sin(a) * 330] as [number, number];
  });
  return (
    <AbsoluteFill style={{opacity: o}}>
      <svg width={1920} height={1080}>
        {pts.map(([px, py], i) => {
          const p = prog(t, t0 + i * 0.07, 0.4);
          return (
            <g key={i} opacity={p}>
              <line x1={px} y1={py} x2={mix(px, cx, link)} y2={mix(py, cy, link)} stroke={K.red} strokeWidth={2.5} opacity={0.8} />
              <circle cx={px} cy={py - 12} r={14} fill="none" stroke={K.bone} strokeWidth={3} />
              <path d={`M${px - 22} ${py + 26} q22 -30 44 0`} fill="none" stroke={K.bone} strokeWidth={3} />
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={110 * prog(t, tLink + 0.6, 0.6)} fill="rgba(255,59,48,0.12)" stroke={K.red} strokeWidth={3} />
      </svg>
      <div style={{position: 'absolute', left: cx, top: cy, transform: 'translate(-50%,-50%)', textAlign: 'center', opacity: prog(t, tLink + 0.7, 0.5)}}>
        <div style={{...gm(18, K.red, 600, 0.18)}}>EN COMÚN</div>
        <div style={{...gs(40, 800, K.bone, -0.02)}}>FENTANILO</div>
        <div style={{...gs(40, 800, K.red, -0.02)}}>HLB</div>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== ENCUBRIMIENTO */
/** autoclave en corte: 100 ampollas adentro y vapor */
export const Autoclave2D: React.FC<{t: number; t0: number; t1?: number; x?: number; y?: number}> = ({t, t0, t1 = Infinity, x = 1250, y = 560}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const door = prog(t, t0 + 0.3, 1.0, easeInOut);
  const steam = prog(t, t0 + 1.4, 1.0);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', opacity: o}}>
      <svg width={900} height={700} viewBox="0 0 900 700">
        <rect x={60} y={60} width={780} height={560} rx={60} fill="#1B2A2B" stroke="#8FA6A6" strokeWidth={6} />
        <rect x={110} y={110} width={680} height={460} rx={40} fill="#0B1213" stroke="#516B6C" strokeWidth={3} />
        {Array.from({length: 100}, (_, i) => {
          const c = i % 20, r = Math.floor(i / 20);
          const p = prog(t, t0 + 0.4 + i * 0.008, 0.3);
          return (
            <g key={i} transform={`translate(${170 + c * 30},${190 + r * 76})`} opacity={p}>
              <rect x={-7} y={-28} width={14} height={50} rx={5} fill="rgba(236,243,241,0.22)" stroke="rgba(236,243,241,0.6)" strokeWidth={1.2} />
              <rect x={-5} y={-4} width={10} height={24} rx={3} fill="rgba(191,237,228,0.5)" />
            </g>
          );
        })}
        {Array.from({length: 26}, (_, i) => {
          const ph = (t * 0.6 + rnd(i) * 3) % 1;
          return <circle key={i} cx={150 + rnd(i + 3) * 600} cy={540 - ph * 400} r={18 + ph * 40} fill="rgba(236,243,241,0.08)" opacity={steam * (1 - ph)} />;
        })}
        <g transform={`translate(${60 + 780 * (1 - door * 0.82)},60)`}>
          <rect x={0} y={0} width={780 * 0.18 + 20} height={560} rx={40} fill="#25393A" stroke="#8FA6A6" strokeWidth={4} opacity={0.95} />
        </g>
        <circle cx={820} cy={100} r={34} fill="#0B1213" stroke="#8FA6A6" strokeWidth={4} />
        <line x1={820} y1={100} x2={820 + Math.cos(-0.5 + steam * 2.2) * 24} y2={100 + Math.sin(-0.5 + steam * 2.2) * 24} stroke={K.red} strokeWidth={4} />
      </svg>
      <div style={{position: 'absolute', left: 60, top: 640, ...gm(22, K.bone, 600, 0.16)}}>AUTOCLAVE · AL MENOS 100 AMPOLLAS</div>
    </div>
  );
};

/** lo que se destruyó: información digital, documentación y citrato de fentanilo (tachados en rojo) */
export const Destroyed: React.FC<{t: number; t0: number; t1?: number; at: number[]; y?: number}> = ({t, t0, t1 = Infinity, at, y = 560}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const items: {k: 'servidor' | 'documento' | 'polvo'; l: string}[] = [
    {k: 'servidor', l: 'INFORMACIÓN DIGITAL'},
    {k: 'documento', l: 'DOCUMENTACIÓN'},
    {k: 'polvo', l: 'CITRATO DE FENTANILO'},
  ];
  return (
    <AbsoluteFill style={{opacity: o}}>
      {items.map((it, i) => {
        const p = prog(t, at[i], 0.5);
        const x = prog(t, at[i] + 0.5, 0.4);
        const cx = 960 + (i - 1) * 470;
        return (
          <div key={i} style={{position: 'absolute', left: cx, top: y, transform: `translate(-50%,-50%) scale(${0.9 + 0.1 * p})`, opacity: p, textAlign: 'center'}}>
            <div style={{position: 'relative', display: 'inline-block'}}>
              <LineIcon kind={it.k} size={220} color={K.bone} p={p} />
              <svg width={220} height={220} style={{position: 'absolute', left: 0, top: 0}}>
                <path d="M30 30 L190 190 M190 30 L30 190" stroke={K.red} strokeWidth={10} strokeLinecap="round" strokeDasharray={230} strokeDashoffset={230 * (1 - x)} />
              </svg>
            </div>
            <div style={{...gm(24, K.bone, 600, 0.16), marginTop: 18}}>{it.l}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** casi 5 kg de citrato de fentanilo que no aparecieron: dos versiones */
export const MissingKilos: React.FC<{t: number; t0: number; t1?: number; tA: number; tB: number}> = ({t, t0, t1 = Infinity, tA, tB}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const a = prog(t, tA, 0.5), b = prog(t, tB, 0.5);
  const card = (x: number, p: number, kicker: string, text: string, color: string) => (
    <div style={{position: 'absolute', left: x, top: 690, width: 640, transform: `translate(-50%,0) translateY(${(1 - p) * 30}px)`, opacity: p, border: `2px solid ${color}`, borderRadius: 16, padding: '24px 30px', background: 'rgba(4,10,11,0.7)'}}>
      <div style={{...gm(21, color, 600, 0.2)}}>{kicker}</div>
      <div style={{...gs(44, 700, K.bone, -0.02), marginTop: 8, lineHeight: 1.1}}>{text}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 960, top: 330, transform: 'translate(-50%,-50%)', textAlign: 'center'}}>
        <div style={{...gm(24, K.amber, 600, 0.2)}}>NO APARECIERON EN LOS ALLANAMIENTOS</div>
        <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 18}}>
          <span style={{...gs(60, 400, K.mute)}}>≈</span>
          <Odo13 value={ramp(t, t0 + 0.2, 5, 1.2)} size={220} />
          <span style={{...gs(80, 700, K.bone)}}>kg</span>
        </div>
        <div style={{...gm(22, K.bone, 500, 0.16)}}>DE CITRATO DE FENTANILO</div>
      </div>
      {card(620, a, 'LA EMPRESA', '«Los destruimos»', K.mute)}
      {card(1300, b, 'EL JUEZ INVESTIGA', '¿Se desviaron?', K.amber)}
    </AbsoluteFill>
  );
};

/** trece procesados: dueños, gerentes y directores técnicos (siluetas, sin nombres ni reparto inventado) */
export const Procesados13: React.FC<{t: number; t0: number; t1?: number; tRoles: number; tDim?: number}> = ({t, t0, t1 = Infinity, tRoles, tDim}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  // cuando hablan las defensas, las 13 figuras pasan a segundo plano
  const dim = tDim === undefined ? 0 : prog(t, tDim, 0.8) * 0.5;
  const roles = ['DUEÑOS', 'GERENTES', 'DIRECTORES TÉCNICOS'];
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: 960, top: 230, transform: 'translateX(-50%)', textAlign: 'center'}}>
        <Odo13 value={ramp(t, t0, 13, 1.0)} size={170} />
        <div style={{...gm(24, K.bone, 600, 0.22)}}>PROCESADOS</div>
      </div>
      <svg width={1920} height={1080}>
        {Array.from({length: 13}, (_, i) => {
          const x = 960 + (i - 6) * 118;
          const p = prog(t, t0 + 0.1 + i * 0.06, 0.4);
          return (
            <g key={i} opacity={p * (1 - dim)} transform={`translate(${x},${640 + (1 - p) * 30})`}>
              <circle cx={0} cy={-60} r={30} fill="none" stroke={K.amber} strokeWidth={4} />
              <path d="M-52 40 q0 -62 52 -62 q52 0 52 62" fill="none" stroke={K.amber} strokeWidth={4} />
            </g>
          );
        })}
      </svg>
      <div style={{position: 'absolute', left: 0, top: 740, width: 1920, display: 'flex', justifyContent: 'center', gap: 46}}>
        {roles.map((l, i) => {
          const p = prog(t, tRoles + i * 0.35, 0.45);
          return (
            <div key={l} style={{display: 'flex', alignItems: 'center', gap: 14, opacity: p, transform: `translateY(${(1 - p) * 16}px)`}}>
              <span style={{width: 12, height: 12, borderRadius: 6, background: K.amber}} />
              <span style={{...gm(26, K.bone, 600, 0.16)}}>{l}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== CIERRE */
/** estado de la causa: investigación → procesamientos → apelaciones (pendiente) → juicio */
export const CasePipeline: React.FC<{t: number; t0: number; t1?: number; tPend: number; y?: number}> = ({t, t0, t1 = Infinity, tPend, y = 600}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const steps = [
    {l: 'INVESTIGACIÓN', s: 'done'},
    {l: 'PROCESAMIENTOS', s: 'done'},
    {l: 'APELACIONES', s: 'pend', sub: 'Cámara Federal de La Plata'},
    {l: 'JUICIO', s: 'todo'},
  ];
  const pend = prog(t, tPend, 0.5);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <svg width={1920} height={1080}>
        <line x1={300} y1={y} x2={1620} y2={y} stroke={K.line2} strokeWidth={4} />
        <line x1={300} y1={y} x2={300 + 880 * prog(t, t0, 1.2, easeInOut)} y2={y} stroke={K.teal} strokeWidth={6} />
      </svg>
      {steps.map((st, i) => {
        const x = 300 + i * 440;
        const p = prog(t, t0 + i * 0.25, 0.5);
        const c = st.s === 'done' ? K.teal : st.s === 'pend' ? K.amber : K.dim;
        const blink = st.s === 'pend' ? 0.6 + 0.4 * Math.sin(t * 4) * pend : 1;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', opacity: p, textAlign: 'center'}}>
            <div style={{width: 64, height: 64, borderRadius: 32, margin: '0 auto', border: `4px solid ${c}`, background: st.s === 'done' ? c : 'rgba(4,10,11,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: blink, ...gs(30, 800, K.void, 0)}}>
              {st.s === 'done' ? '✓' : st.s === 'pend' ? <span style={{color: K.amber}}>…</span> : ''}
            </div>
            <div style={{...gm(22, st.s === 'todo' ? K.mute : K.bone, 600, 0.16), marginTop: 22, whiteSpace: 'nowrap'}}>{st.l}</div>
            {st.sub ? <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 30, color: K.amber, marginTop: 6, whiteSpace: 'nowrap', opacity: pend}}>{st.sub}</div> : null}
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 960, top: y - 210, transform: 'translateX(-50%)', textAlign: 'center', opacity: prog(t, t0, 0.5)}}>
        <div style={{...gs(64, 800, K.bone, -0.02)}}>TODAVÍA NO LLEGÓ A JUICIO</div>
      </div>
    </AbsoluteFill>
  );
};

/** más de 4 millones de unidades en depósitos: cajas que se apilan */
export const Boxes4M: React.FC<{t: number; t0: number; t1?: number}> = ({t, t0, t1 = Infinity}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const n = Math.floor(ramp(t, t0 + 0.3, 160, 3.0));
  return (
    <AbsoluteFill style={{opacity: o}}>
      <svg width={1920} height={1080}>
        {Array.from({length: 160}, (_, i) => {
          if (i >= n) return null;
          const c = i % 16, r = Math.floor(i / 16);
          const x = 1090 + c * 44 + (r % 2) * 10, yy = 900 - r * 46;
          return (
            <g key={i} transform={`translate(${x},${yy})`}>
              <rect x={0} y={0} width={40} height={40} rx={3} fill={i % 7 === 0 ? '#B98A4F' : '#A87C45'} stroke="#5E4426" strokeWidth={1.5} />
              <line x1={20} y1={0} x2={20} y2={14} stroke="#5E4426" strokeWidth={2} />
            </g>
          );
        })}
      </svg>
      <div style={{position: 'absolute', left: 140, top: 330}}>
        <div style={{...gm(24, K.amber, 600, 0.2)}}>OCTUBRE 2026 · PROVINCIA DE BUENOS AIRES</div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 10}}>
          <span style={{...gs(70, 400, K.mute)}}>+</span>
          <Odo13 value={ramp(t, t0 + 0.3, 4000000, 3.0)} size={150} />
        </div>
        <div style={{...gs(44, 600, K.bone), marginTop: 10, lineHeight: 1.15, maxWidth: 900}}>
          unidades de remedios de estos laboratorios
          <br />
          <span style={{color: K.amber}}>autorizadas para descartar</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
export {fmt, clamp, easeOut};
