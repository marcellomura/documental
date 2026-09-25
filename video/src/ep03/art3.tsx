import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C, F} from '../theme';
import {clamp, easeInOut, easeOut, pop, prog, rnd} from '../lib/anim';
import {cue, segWords} from './lib';

const S = C.ink;
const SW = 6;

/* ---------- Palabras sincronizadas con la voz (igual que en 13 CEROS) ---------- */
export const SyncWords: React.FC<{t: number; seg: string; from: string; to: string; nFrom?: number; nTo?: number; style?: React.CSSProperties; hi?: Record<string, string>}> = ({t, seg, from, to, nFrom = 0, nTo = 0, style, hi = {}}) => {
  const ws = segWords(seg);
  const a = cue(seg, from, nFrom), b = cue(seg, to, nTo, 'e');
  const list = ws.filter((w) => w.s >= a - 0.001 && w.e <= b + 0.001);
  return (
    <div style={style}>
      {list.map((w, i) => {
        const k = prog(t, w.s - 0.08, 0.25);
        const clean = w.w.replace(/[«»]/g, '');
        const key = clean.toLowerCase().replace(/[^a-záéíóúñü]/g, '');
        return (
          <span key={i} style={{display: 'inline-block', marginRight: '0.26em', opacity: 0.15 + 0.85 * k, transform: `translateY(${(1 - k) * 18}px)`, color: hi[key] ?? 'inherit'}}>
            {clean}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- Video real con marco de foto ---------- */
export const Clip: React.FC<{src: string; from: number; t: number; t0: number; t1: number; x: number; y: number; w: number; h: number; rot?: number; credit?: string; dim?: number; full?: boolean; bw?: boolean}> = ({src, from, t, t0, t1, x, y, w, h, rot = 0, credit, dim = 0, full, bw}) => {
  const f = useCurrentFrame();
  if (t < t0 - 0.05 || t > t1 + 0.05) return null;
  const a = pop(t, t0, 0.9);
  const out = clamp((t - (t1 - 0.3)) / 0.3);
  // el video arranca (desde `from` segundos del archivo) justo en t0
  const startAbs = Math.round(f - (t - t0) * 30);
  const video = (
    <Sequence from={startAbs} layout="none">
      <OffthreadVideo src={staticFile(src)} startFrom={Math.round(from * 30)} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: bw ? 'grayscale(1) contrast(1.15)' : 'contrast(1.05) saturate(0.9)'}} />
    </Sequence>
  );
  if (full) {
    return (
      <AbsoluteFill style={{opacity: Math.min(clamp((t - t0) / 0.3), 1 - out)}}>
        {video}
        {dim ? <AbsoluteFill style={{background: `rgba(10,10,12,${dim})`}} /> : null}
        {credit ? <div style={{position: 'absolute', right: 30, bottom: 22, fontFamily: F.body, fontSize: 16, color: 'rgba(255,255,255,0.75)'}}>{credit}</div> : null}
      </AbsoluteFill>
    );
  }
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `rotate(${rot}deg) scale(${0.7 + 0.3 * a})`, opacity: Math.min(clamp((t - t0) / 0.15), 1 - out)}}>
      <div style={{position: 'absolute', inset: 0, background: '#FBF8F2', padding: 14, paddingBottom: credit ? 40 : 14, boxShadow: '0 18px 40px rgba(0,0,0,0.35)'}}>
        <div style={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#111'}}>
          {video}
          {dim ? <AbsoluteFill style={{background: `rgba(10,10,12,${dim})`}} /> : null}
          <div style={{position: 'absolute', left: 14, top: 12, display: 'flex', alignItems: 'center', gap: 8, fontFamily: F.body, fontWeight: 800, fontSize: 18, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.6)'}}>
            <span style={{width: 12, height: 12, borderRadius: 6, background: C.red, opacity: Math.floor(t * 2) % 2 ? 1 : 0.3}} /> ARCHIVO
          </div>
        </div>
        {credit ? <div style={{position: 'absolute', right: 14, bottom: 10, fontFamily: F.body, fontSize: 15, color: '#6f6a62'}}>{credit}</div> : null}
      </div>
    </div>
  );
};

/* ---------- Billetera (las reservas) ---------- */
export const Wallet: React.FC<{size?: number; open?: number; bills?: number; labels?: string[]; labelK?: number; color?: string}> = ({size = 700, open = 1, bills = 6, labels = [], labelK = 0, color = '#6B4A2E'}) => (
  <svg width={size} height={size * 0.72} viewBox="0 0 700 504" style={{overflow: 'visible'}}>
    {/* billetes que asoman */}
    {Array.from({length: bills}).map((_, i) => {
      const x = 110 + i * 78;
      const up = open * (70 + (i % 3) * 22);
      return (
        <g key={i} transform={`translate(${x} ${150 - up}) rotate(${(i - bills / 2) * 3} 60 120)`}>
          <rect x="0" y="0" width="120" height="240" rx="6" fill={C.bill} stroke={C.billDark} strokeWidth="4" />
          <text x="60" y="80" textAnchor="middle" fontFamily="Anton" fontSize="54" fill={C.billDark}>$</text>
          <rect x="10" y="10" width="100" height="220" rx="4" fill="none" stroke={C.billDark} strokeWidth="1.5" strokeDasharray="3 3" />
          {labels[i] ? (
            <g opacity={labelK}>
              <rect x="-6" y="96" width="132" height="44" fill={C.yellow} stroke={S} strokeWidth="3" transform="rotate(-6 60 118)" />
              <text x="60" y="126" textAnchor="middle" fontFamily="Anton" fontSize="24" fill={S} transform="rotate(-6 60 118)">{labels[i]}</text>
            </g>
          ) : null}
        </g>
      );
    })}
    {/* cuerpo */}
    <rect x="40" y="200" width="620" height="280" rx="34" fill={color} stroke={S} strokeWidth={SW} />
    <rect x="40" y="200" width="620" height="60" rx="30" fill="#8A6240" stroke={S} strokeWidth={SW} />
    <path d="M40 300 Q350 360 660 300" fill="none" stroke="#4E3420" strokeWidth="4" strokeDasharray="10 8" />
    <rect x="520" y="300" width="160" height="96" rx="20" fill="#8A6240" stroke={S} strokeWidth={SW} />
    <circle cx="590" cy="348" r="16" fill={C.yellow} stroke={S} strokeWidth="5" />
    <text x="290" y="440" textAnchor="middle" fontFamily="Anton" fontSize="44" fill="#F3E3C8" letterSpacing="3">BCRA</text>
  </svg>
);

/* ---------- Ratonera con un dólar de carnada ---------- */
export const Mousetrap: React.FC<{size?: number; snap?: number}> = ({size = 420, snap = 0}) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 420 252" style={{overflow: 'visible'}}>
    <rect x="20" y="150" width="380" height="70" rx="10" fill="#D9A866" stroke={S} strokeWidth={SW} />
    <rect x="150" y="120" width="120" height="44" rx="4" fill={C.bill} stroke={C.billDark} strokeWidth="4" />
    <text x="210" y="152" textAnchor="middle" fontFamily="Anton" fontSize="30" fill={C.billDark}>US$</text>
    <g transform={`rotate(${-150 + 150 * snap} 60 150)`}>
      <path d="M60 150 L360 150 L360 110 L60 110" fill="none" stroke="#9A9A9A" strokeWidth="10" strokeLinejoin="round" />
    </g>
    <circle cx="60" cy="150" r="14" fill="#9A9A9A" stroke={S} strokeWidth="4" />
  </svg>
);

/* ---------- Teléfono simple ---------- */
export const Phone: React.FC<{size?: number; ring?: number; color?: string}> = ({size = 220, ring = 0, color = C.red}) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 300 240" style={{overflow: 'visible', transform: `rotate(${ring ? Math.sin(ring * 60) * 7 : 0}deg)`}}>
    <path d="M40 120 L260 120 L240 230 L60 230 Z" fill={color} stroke={S} strokeWidth={SW} strokeLinejoin="round" />
    <circle cx="150" cy="175" r="38" fill="#fff" stroke={S} strokeWidth="5" />
    {Array.from({length: 10}).map((_, i) => {
      const a = (i / 10) * Math.PI * 1.6 + 0.9;
      return <circle key={i} cx={150 + Math.cos(a) * 25} cy={175 + Math.sin(a) * 25} r="5" fill={S} />;
    })}
    <path d="M30 100 C30 40 270 40 270 100 L240 112 C240 78 60 78 60 112 Z" fill={color} stroke={S} strokeWidth={SW} strokeLinejoin="round" />
  </svg>
);

/* ---------- Tarjeta de crédito ---------- */
export const CreditCard: React.FC<{w?: number; color?: string; label?: string; num?: string}> = ({w = 420, color = C.celesteDark, label = 'TARJETA', num = '4815 1623 4200 0001'}) => (
  <svg width={w} height={w * 0.63} viewBox="0 0 420 265" style={{overflow: 'visible', filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.3))'}}>
    <rect x="0" y="0" width="420" height="265" rx="22" fill={color} stroke={S} strokeWidth={SW} />
    <rect x="34" y="70" width="70" height="52" rx="8" fill={C.yellow} stroke={S} strokeWidth="4" />
    <text x="34" y="176" fontFamily="JetBrains Mono" fontWeight="800" fontSize="26" fill="#fff" letterSpacing="2">{num}</text>
    <text x="34" y="226" fontFamily="Anton" fontSize="30" fill="#fff" letterSpacing="2">{label}</text>
    <circle cx="340" cy="210" r="26" fill={C.red} opacity="0.9" />
    <circle cx="372" cy="210" r="26" fill={C.yellow} opacity="0.9" />
  </svg>
);

/* ---------- Esposas que unen a dos ---------- */
export const Cuffs: React.FC<{w?: number}> = ({w = 520}) => (
  <svg width={w} height={w * 0.42} viewBox="0 0 520 220" style={{overflow: 'visible'}}>
    <circle cx="110" cy="110" r="80" fill="none" stroke="#A7A9AC" strokeWidth="26" />
    <circle cx="110" cy="110" r="80" fill="none" stroke={S} strokeWidth="4" />
    <circle cx="410" cy="110" r="80" fill="none" stroke="#A7A9AC" strokeWidth="26" />
    <circle cx="410" cy="110" r="80" fill="none" stroke={S} strokeWidth="4" />
    {[0, 1, 2].map((i) => <ellipse key={i} cx={225 + i * 35} cy="110" rx="22" ry="14" fill="none" stroke="#8E9094" strokeWidth="10" />)}
  </svg>
);

/* ---------- Bola y cadena (la deuda que se queda) ---------- */
export const BallChain: React.FC<{size?: number; label?: string}> = ({size = 420, label = 'DEUDA'}) => (
  <svg width={size} height={size} viewBox="0 0 420 420" style={{overflow: 'visible'}}>
    {Array.from({length: 6}).map((_, i) => <ellipse key={i} cx={40 + i * 36} cy={60 + i * 26} rx="22" ry="14" fill="none" stroke="#6E7072" strokeWidth="10" transform={`rotate(35 ${40 + i * 36} ${60 + i * 26})`} />)}
    <circle cx="270" cy="280" r="130" fill="#2A2A2C" stroke={S} strokeWidth={SW} />
    <path d="M200 200 Q230 180 262 186" stroke="#fff" strokeWidth="14" fill="none" strokeLinecap="round" opacity="0.25" />
    <text x="270" y="300" textAnchor="middle" fontFamily="Anton" fontSize="54" fill={C.white}>{label}</text>
  </svg>
);

/* ---------- Taxímetro ---------- */
export const Taximeter: React.FC<{w?: number; value: string; label?: string}> = ({w = 820, value, label = 'INTERESES'}) => (
  <div style={{width: w, background: '#1B1B1D', border: `8px solid ${S}`, borderRadius: 26, padding: '26px 36px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'}}>
    <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: F.body, fontWeight: 900, fontSize: 26, color: C.yellow, letterSpacing: 4}}>
      <span>{label}</span>
      <span style={{background: C.red, color: '#fff', padding: '0 12px', borderRadius: 6}}>OCUPADO</span>
    </div>
    <div style={{marginTop: 18, background: '#0A120A', borderRadius: 12, padding: '14px 24px', fontFamily: F.mono, fontWeight: 800, fontSize: w * 0.085, color: '#7CFF6B', textShadow: '0 0 18px rgba(124,255,107,0.6)', textAlign: 'right', fontVariantNumeric: 'tabular-nums'}}>{value}</div>
  </div>
);

/* ---------- Carpeta de expediente ---------- */
export const Folder: React.FC<{w?: number; title: string; lines?: string[]}> = ({w = 760, title, lines = []}) => (
  <div style={{position: 'relative', width: w, height: w * 0.72}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: w * 0.38, height: 60, background: '#D7B97F', border: `5px solid ${S}`, borderBottom: 'none', borderRadius: '14px 14px 0 0'}} />
    <div style={{position: 'absolute', left: 0, top: 52, right: 0, bottom: 0, background: '#E6C98F', border: `5px solid ${S}`, borderRadius: '0 14px 14px 14px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', padding: '40px 48px'}}>
      <div style={{fontFamily: F.mono, fontWeight: 800, fontSize: 26, color: '#5A4520', letterSpacing: 2}}>EXPEDIENTE</div>
      <div style={{fontFamily: F.head, fontSize: 64, color: S, lineHeight: 1.05, marginTop: 10}}>{title}</div>
      {lines.map((l, i) => <div key={i} style={{fontFamily: F.mono, fontSize: 24, color: '#5A4520', marginTop: 14}}>{l}</div>)}
    </div>
  </div>
);

/* ---------- Examen corregido ---------- */
export const Exam: React.FC<{w?: number; t: number; t0: number; items: {text: string; ok: boolean; t0: number}[]}> = ({w = 760, t, t0, items}) => (
  <div style={{width: w, background: '#FFFDF6', padding: '36px 46px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', transform: 'rotate(-2deg)', backgroundImage: 'repeating-linear-gradient(180deg, rgba(0,0,0,0) 0 54px, rgba(47,111,168,0.22) 54px 56px)', opacity: prog(t, t0, 0.3)}}>
    <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: F.hand, fontSize: 36, color: '#1d2a5a'}}>
      <span>Alumna: ARGENTINA</span>
      <span>Revisión Nº 3</span>
    </div>
    <div style={{marginTop: 26, display: 'flex', flexDirection: 'column', gap: 26}}>
      {items.map((it, i) => (
        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 20, fontFamily: F.body, fontWeight: 800, fontSize: 38, color: S, opacity: t > it.t0 - 0.1 ? 1 : 0}}>
          <span style={{fontFamily: F.hand, fontSize: 64, color: it.ok ? C.green : C.red, width: 60, transform: `scale(${pop(t, it.t0)})`}}>{it.ok ? '✓' : '✗'}</span>
          {it.text}
        </div>
      ))}
    </div>
  </div>
);

/* ---------- Diagrama circular (el círculo vicioso) ---------- */
export const Cycle: React.FC<{t: number; items: {text: string; t0: number; color?: string}[]; r?: number; spin?: number; hi?: number; size?: number}> = ({t, items, r = 360, spin = 0, hi = -1, size = 1000}) => {
  const n = items.length;
  const cx = size / 2, cy = size / 2;
  return (
    <div style={{position: 'relative', width: size, height: size}}>
      <svg width={size} height={size} style={{position: 'absolute', inset: 0, overflow: 'visible', transform: `rotate(${spin}deg)`}}>
        <defs>
          <marker id="arrC" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill={S} /></marker>
        </defs>
        {items.map((it, i) => {
          const a0 = (i / n) * Math.PI * 2 - Math.PI / 2 + 0.32;
          const a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2 - 0.32;
          const next = items[(i + 1) % n];
          const k = clamp((t - next.t0 + 0.4) / 0.5);
          if (i === n - 1 && t < next.t0) return null;
          const am = a0 + (a1 - a0) * k;
          return k > 0 ? <path key={i} d={`M${cx + Math.cos(a0) * r} ${cy + Math.sin(a0) * r} A ${r} ${r} 0 0 1 ${cx + Math.cos(am) * r} ${cy + Math.sin(am) * r}`} fill="none" stroke={S} strokeWidth="9" markerEnd="url(#arrC)" /> : null;
        })}
      </svg>
      {items.map((it, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(a + (spin * Math.PI) / 180) * r, y = cy + Math.sin(a + (spin * Math.PI) / 180) * r;
        const on = t > it.t0 - 0.1;
        const isHi = hi === i;
        return (
          <div key={i} style={{position: 'absolute', left: x - 170, top: y - 60, width: 340, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: isHi ? C.yellow : it.color ?? '#fff', border: `6px solid ${S}`, borderRadius: 18, boxShadow: '8px 8px 0 rgba(0,0,0,0.85)', fontFamily: F.head, fontSize: 40, lineHeight: 1.05, color: S, padding: '10px 16px', opacity: on ? 1 : 0, transform: `scale(${pop(t, it.t0 - 0.1) * (isHi ? 1.08 : 1)})`}}>
            {it.text}
          </div>
        );
      })}
    </div>
  );
};

/* ---------- Mapamundi mínimo con un pin ---------- */
export const GlobePin: React.FC<{size?: number; t: number; t0: number}> = ({size = 560, t, t0}) => {
  const k = pop(t, t0, 1.1);
  return (
    <svg width={size} height={size} viewBox="0 0 560 560" style={{overflow: 'visible'}}>
      <circle cx="280" cy="280" r="250" fill={C.celeste} stroke={S} strokeWidth={SW} />
      {[-160, -80, 0, 80, 160].map((d) => <ellipse key={d} cx="280" cy="280" rx={Math.abs(250 - Math.abs(d) * 1.2)} ry="250" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" />)}
      {[-160, -80, 0, 80, 160].map((d) => <line key={'l' + d} x1={280 - Math.sqrt(250 * 250 - d * d)} y1={280 + d} x2={280 + Math.sqrt(250 * 250 - d * d)} y2={280 + d} stroke="#fff" strokeOpacity="0.5" strokeWidth="2" />)}
      {/* Sudamérica esquemática */}
      <path d="M250 250 Q300 230 330 260 Q350 300 320 350 Q300 400 290 460 Q270 470 268 440 Q262 380 240 340 Q220 290 250 250 Z" fill="#F0E6CF" stroke={S} strokeWidth="5" />
      <path d="M150 120 Q220 100 250 140 Q240 190 200 200 Q150 190 140 160 Z" fill="#F0E6CF" stroke={S} strokeWidth="5" />
      <path d="M340 120 Q420 100 460 150 Q470 210 420 240 Q370 230 350 180 Z" fill="#F0E6CF" stroke={S} strokeWidth="5" />
      <g transform={`translate(285 400) scale(${k}) translate(0 -80)`}>
        <path d="M0 80 C-10 50 -40 30 -40 0 A40 40 0 1 1 40 0 C40 30 10 50 0 80 Z" fill={C.red} stroke={S} strokeWidth="5" />
        <circle cx="0" cy="0" r="14" fill="#fff" />
      </g>
    </svg>
  );
};

/* ---------- Sello repetido que se apila ("la última vez") ---------- */
export const StampPile: React.FC<{t: number; t0: number; t1: number; n: number; text: string}> = ({t, t0, t1, n, text}) => (
  <>
    {Array.from({length: n}).map((_, i) => {
      const ti = t0 + ((t1 - t0) * Math.pow(i / Math.max(1, n - 1), 1.6));
      if (t < ti) return null;
      const k = clamp((t - ti) / 0.12);
      const x = 140 + rnd(i * 3 + 1) * 1500, y = 150 + rnd(i * 7 + 2) * 760;
      return (
        <div key={i} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${(rnd(i + 9) - 0.5) * 40}deg) scale(${2.1 - 1.1 * easeOut(k)})`, opacity: clamp(k * 3) * 0.92, border: `7px solid ${C.red}`, color: C.red, fontFamily: F.head, fontSize: 56, padding: '4px 20px', borderRadius: 8, whiteSpace: 'nowrap', filter: 'url(#rough)', mixBlendMode: 'multiply'}}>
          {text}
        </div>
      );
    })}
  </>
);

/* ---------- Flecha de billetes que viajan de A a B ---------- */
export const MoneyFlow: React.FC<{t: number; t0: number; dur?: number; from: [number, number]; to: [number, number]; n?: number; arc?: number}> = ({t, t0, dur = 1.6, from, to, n = 7, arc = -160}) => (
  <>
    {Array.from({length: n}).map((_, i) => {
      const k = clamp((t - t0 - i * 0.12) / dur);
      if (k <= 0 || k >= 1) return null;
      const e = easeInOut(k);
      const x = from[0] + (to[0] - from[0]) * e;
      const y = from[1] + (to[1] - from[1]) * e + Math.sin(e * Math.PI) * arc;
      return (
        <div key={i} style={{position: 'absolute', left: x - 70, top: y - 30, width: 140, height: 60, background: C.bill, border: `4px solid ${C.billDark}`, borderRadius: 5, transform: `rotate(${(e - 0.5) * 40 + i * 7}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.head, fontSize: 30, color: C.billDark, opacity: Math.sin(k * Math.PI) * 1.4}}>
          US$
        </div>
      );
    })}
  </>
);
