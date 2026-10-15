/* Gráficos 2D del episodio 13, primera mitad: qué es el fentanilo (potencia, calle y hospital, vía intravenosa,
   defensas del paciente), el microscopio, el ensayo de esterilidad con ocho lotes en una prueba, los 118 reportes,
   las 23 ampollas de dexametasona, el candado de la clausura, las 18 tareas, el acta abierta y los seis lotes. */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {K, F, gs, gm, mix, fadeIO, clamp, easeIn, easeInOut, easeOut, pop, prog, rnd, fmt, Odo13, ramp} from './kit13';

/* ================================================================== FENTANILO */
/** potencia comparada: morfina ×1 contra fentanilo ×50–100 (barras que crecen) */
export const PotencyBars: React.FC<{t: number; t0: number; t1?: number; x?: number; y?: number}> = ({t, t0, t1 = Infinity, x = 960, y = 600}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const W = 1300;
  const pM = prog(t, t0 + 0.2, 0.8);
  const pF = prog(t, t0 + 0.9, 1.6, easeInOut);
  const band = prog(t, t0 + 2.4, 0.8);
  const unit = W / 100;
  return (
    <div style={{position: 'absolute', left: x - W / 2, top: y, width: W, opacity: o}}>
      {[
        {label: 'MORFINA', w: unit * 1 * pM, val: '×1', c: K.mute},
        {label: 'FENTANILO', w: unit * 100 * pF, val: '×50 a ×100', c: K.red},
      ].map((r, i) => (
        <div key={i} style={{marginBottom: 46}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12}}>
            <span style={{...gm(26, K.bone, 600, 0.2)}}>{r.label}</span>
            <span style={{...gs(44, 700, r.c, -0.02), opacity: i ? prog(t, t0 + 1.4, 0.5) : pM}}>{r.val}</span>
          </div>
          <div style={{position: 'relative', height: 34, background: 'rgba(236,243,241,0.06)', borderRadius: 4}}>
            <div style={{position: 'absolute', left: 0, top: 0, height: 34, width: Math.max(r.w, 4), background: r.c, borderRadius: 4, boxShadow: i ? `0 0 30px rgba(255,59,48,0.45)` : undefined}} />
            {i === 1 ? (
              <div style={{position: 'absolute', left: unit * 50, top: -10, width: unit * 50, height: 54, border: `2px dashed ${K.amber}`, borderRadius: 6, opacity: band}} />
            ) : null}
          </div>
        </div>
      ))}
      <div style={{...gm(20, K.mute, 500, 0.12), opacity: band}}>VECES MÁS POTENTE QUE LA MORFINA (SEGÚN LA DOSIS)</div>
    </div>
  );
};

/** íconos de línea (trazo) para el hospital */
export const LineIcon: React.FC<{kind: 'quirofano' | 'uti' | 'intubado' | 'jeringa' | 'escudo' | 'hospital' | 'avion' | 'documento' | 'servidor' | 'polvo' | 'camion'; size?: number; color?: string; p?: number}> = ({kind, size = 120, color = K.teal, p = 1}) => {
  const len = 600;
  const st = {fill: 'none', stroke: color, strokeWidth: 3.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeDasharray: len, strokeDashoffset: len * (1 - clamp(p))};
  const paths: Record<string, string[]> = {
    quirofano: ['M20 90 h80', 'M30 90 v-20 h60 v20', 'M60 20 v14', 'M40 34 h40 l-6 14 h-28 z', 'M24 104 v6 M96 104 v6'],
    uti: ['M18 24 h84 v56 h-84 z', 'M24 56 h14 l6 -16 l8 30 l8 -22 l6 8 h30', 'M50 80 v16 h20 v-16', 'M40 96 h40'],
    intubado: ['M30 30 q30 -20 60 0 v40 q-30 22 -60 0 z', 'M60 74 v26', 'M52 100 h16', 'M44 44 q16 10 32 0'],
    jeringa: ['M20 100 l18 -18', 'M30 92 l48 -48 l14 14 l-48 48 z', 'M78 44 l12 -12', 'M84 26 l14 14', 'M46 76 l8 8 M58 64 l8 8'],
    escudo: ['M60 14 l40 14 v30 q0 34 -40 50 q-40 -16 -40 -50 v-30 z'],
    hospital: ['M24 100 v-66 h72 v66', 'M14 100 h92', 'M60 46 v28 M46 60 h28', 'M48 100 v-14 h24 v14'],
    avion: ['M16 66 l88 -30 l-6 14 l-34 16 l-6 34 l-10 4 l-2 -30 l-24 8 l-4 10 l-6 2 z'],
    documento: ['M30 14 h44 l18 18 v74 h-62 z', 'M74 14 v18 h18', 'M42 52 h36 M42 66 h36 M42 80 h24'],
    servidor: ['M24 18 h72 v26 h-72 z', 'M24 50 h72 v26 h-72 z', 'M24 82 h72 v20 h-72 z', 'M36 31 h6 M36 63 h6'],
    polvo: ['M36 30 h48 v12 h-48 z', 'M40 42 v52 q0 8 8 8 h24 q8 0 8 -8 v-52', 'M48 70 h24'],
    camion: ['M10 40 h62 v44 h-62 z', 'M72 54 h22 l14 16 v14 h-36', 'M28 92 a8 8 0 1 0 0.1 0 M86 92 a8 8 0 1 0 0.1 0'],
  };
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      {paths[kind].map((d, i) => (
        <path key={i} d={d} {...st} />
      ))}
    </svg>
  );
};

/** bolsa de suero y gotero: las gotas caen por la cámara de goteo y bajan por la vía */
export const IVDrip: React.FC<{t: number; t0: number; t1?: number; x?: number; y?: number; s?: number; tint?: string}> = ({t, t0, t1 = Infinity, x = 1420, y = 160, s = 1, tint = K.teal}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const drops = [0, 0.33, 0.66].map((ph) => ((t * 0.9 + ph) % 1));
  const flow = (t * 120) % 40;
  return (
    <svg width={360 * s} height={820 * s} viewBox="0 0 360 820" style={{position: 'absolute', left: x, top: y, opacity: o}}>
      <defs>
        <linearGradient id="ivbag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(236,243,241,0.10)" />
          <stop offset="1" stopColor="rgba(236,243,241,0.22)" />
        </linearGradient>
      </defs>
      <path d="M150 10 h60 v20 h-60 z" fill="none" stroke={K.bone} strokeWidth={3} opacity={0.6} />
      <path d="M90 30 h180 q14 0 14 14 v220 q0 40 -40 52 l-30 10 h-68 l-30 -10 q-40 -12 -40 -52 v-220 q0 -14 14 -14 z" fill="url(#ivbag)" stroke={K.bone} strokeWidth={3} opacity={0.85} />
      <path d={`M80 ${120 + Math.sin(t * 1.3) * 3} q100 ${10 + Math.sin(t) * 4} 200 0 v150 q0 36 -36 46 l-28 9 h-72 l-28 -9 q-36 -10 -36 -46 z`} fill={tint} opacity={0.22} />
      <text x={180} y={190} textAnchor="middle" fontFamily={F.mono} fontSize={20} fill={K.bone} opacity={0.7} letterSpacing="0.16em">VÍA INTRAVENOSA</text>
      <path d="M170 326 h20 v30 h-20 z" fill="none" stroke={K.bone} strokeWidth={3} opacity={0.7} />
      <path d="M160 356 h40 v90 q0 14 -14 14 h-12 q-14 0 -14 -14 z" fill="rgba(236,243,241,0.06)" stroke={K.bone} strokeWidth={3} opacity={0.8} />
      {drops.map((d, i) => (
        <ellipse key={i} cx={180} cy={366 + d * 70} rx={5} ry={7} fill={tint} opacity={d < 0.95 ? 0.9 : 0} />
      ))}
      <path d="M180 460 C180 560 120 600 140 700 S 240 780 230 820" fill="none" stroke={K.bone} strokeWidth={6} opacity={0.35} />
      <path d="M180 460 C180 560 120 600 140 700 S 240 780 230 820" fill="none" stroke={tint} strokeWidth={4} strokeDasharray="6 34" strokeDashoffset={-flow} opacity={0.9} />
    </svg>
  );
};

/** dos figuras: persona sana con defensas plenas y paciente de terapia intensiva con defensas bajas */
export const Defenses: React.FC<{t: number; t0: number; t1?: number; t2: number; y?: number}> = ({t, t0, t1 = Infinity, t2, y = 560}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const fig = (x: number, label: string, level: number, at: number, color: string, lying: boolean) => {
    const p = prog(t, at, 0.6);
    const lv = ramp(t, at + 0.3, level, 1.2);
    const ring = 0.55 + 0.45 * Math.sin(t * 3 + x);
    return (
      <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) translateY(${(1 - p) * 30}px)`, opacity: p, width: 520, textAlign: 'center'}}>
        <svg width={420} height={330} viewBox="0 0 420 330">
          <circle cx={210} cy={165} r={150} fill="none" stroke={color} strokeWidth={6} strokeDasharray={`${(2 * Math.PI * 150 * lv) / 100} 2000`} transform="rotate(-90 210 165)" opacity={0.95} />
          <circle cx={210} cy={165} r={150} fill="none" stroke={color} strokeWidth={2} opacity={0.15} />
          {lying ? (
            <g fill="none" stroke={K.bone} strokeWidth={5} strokeLinecap="round" opacity={0.85}>
              <circle cx={130} cy={170} r={22} />
              <path d="M156 178 h150 M120 210 h220 M120 210 v24 M340 210 v24 M300 150 v28" />
            </g>
          ) : (
            <g fill="none" stroke={K.bone} strokeWidth={5} strokeLinecap="round" opacity={0.85}>
              <circle cx={210} cy={92} r={26} />
              <path d="M210 120 v90 M210 140 l-46 34 M210 140 l46 34 M210 210 l-34 70 M210 210 l34 70" />
            </g>
          )}
          {Array.from({length: 7}, (_, i) => {
            const a = (i / 7) * Math.PI * 2 + t * 0.4;
            const r = 186 - (lying ? 40 * prog(t, at + 1.0, 1.2) : 0);
            return <circle key={i} cx={210 + Math.cos(a) * r} cy={165 + Math.sin(a) * r} r={7} fill={K.red} opacity={0.8 * ring} />;
          })}
        </svg>
        <div style={{...gm(24, color, 600, 0.18)}}>{label}</div>
        <div style={{...gs(54, 700, K.bone), marginTop: 6}}>{Math.round(lv)}%</div>
        <div style={{...gm(18, K.mute, 500, 0.12)}}>DEFENSAS (ILUSTRATIVO)</div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{opacity: o}}>
      {fig(560, 'PERSONA SANA', 100, t0, K.teal, false)}
      {fig(1360, 'PACIENTE EN TERAPIA INTENSIVA', 28, t2, K.amber, true)}
    </AbsoluteFill>
  );
};

/* ================================================================== MICROSCOPIO */
/** campo de microscopio (campo claro, tinción de Gram): bastoncitos que se mueven; n = 0 deja el campo limpio */
export const Microscope: React.FC<{t: number; t0: number; t1?: number; x?: number; y?: number; r?: number; n?: number; color?: string; focus?: number; label?: string; dark?: boolean; seed?: number}> = ({
  t, t0, t1 = Infinity, x = 960, y = 540, r = 380, n = 60, color = '#D2557A', focus = 1, label, dark = false, seed = 1,
}) => {
  const o = fadeIO(t, t0, t1, 0.5);
  if (o <= 0) return null;
  const f = clamp(focus);
  const bg = dark ? '#071012' : '#F2E9E4';
  const id = `mf${seed}`;
  return (
    <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, opacity: o}}>
      <svg width={r * 2} height={r * 2} viewBox={`0 0 ${r * 2} ${r * 2}`}>
        <defs>
          <clipPath id={id}>
            <circle cx={r} cy={r} r={r} />
          </clipPath>
          <radialGradient id={id + 'v'} cx="50%" cy="50%" r="50%">
            <stop offset="0.7" stopColor="rgba(0,0,0,0)" />
            <stop offset="1" stopColor="rgba(0,0,0,0.85)" />
          </radialGradient>
          <filter id={id + 'b'}>
            <feGaussianBlur stdDeviation={(1 - f) * 9} />
          </filter>
        </defs>
        <g clipPath={`url(#${id})`}>
          <rect x={0} y={0} width={r * 2} height={r * 2} fill={bg} />
          <g filter={`url(#${id}b)`}>
            {Array.from({length: 26}, (_, i) => (
              <circle key={'c' + i} cx={rnd(seed * 50 + i) * r * 2} cy={rnd(seed * 50 + i + 99) * r * 2} r={20 + rnd(i + seed) * 46} fill={dark ? 'rgba(80,140,130,0.06)' : 'rgba(190,150,160,0.13)'} />
            ))}
            {Array.from({length: n}, (_, i) => {
              const bx = rnd(seed * 7 + i) * r * 2 + Math.sin(t * 0.7 + i) * 8 + t * (rnd(i + 3) - 0.5) * 10;
              const by = rnd(seed * 7 + i + 400) * r * 2 + Math.cos(t * 0.6 + i * 1.7) * 8;
              const rot = rnd(i + 12) * 180 + Math.sin(t * 0.5 + i) * 14;
              const L = 26 + rnd(i + 30) * 18;
              return (
                <g key={i} transform={`translate(${bx},${by}) rotate(${rot})`}>
                  <rect x={-L / 2} y={-6} width={L} height={12} rx={6} fill={color} opacity={0.85} />
                  <rect x={-L / 2 + 3} y={-3.5} width={L - 6} height={4} rx={2} fill="rgba(255,255,255,0.35)" />
                </g>
              );
            })}
          </g>
          <rect x={0} y={0} width={r * 2} height={r * 2} fill={`url(#${id}v)`} />
        </g>
        <circle cx={r} cy={r} r={r - 2} fill="none" stroke="rgba(236,243,241,0.4)" strokeWidth={3} />
        <line x1={r} y1={r - 26} x2={r} y2={r + 26} stroke={dark ? K.teal : K.ink} strokeWidth={2} opacity={0.4} />
        <line x1={r - 26} y1={r} x2={r + 26} y2={r} stroke={dark ? K.teal : K.ink} strokeWidth={2} opacity={0.4} />
      </svg>
      {label ? <div style={{position: 'absolute', left: '50%', top: r * 2 + 24, transform: 'translateX(-50%)', ...gm(22, K.bone, 600, 0.18), whiteSpace: 'nowrap'}}>{label}</div> : null}
    </div>
  );
};

/* ================================================================== ENSAYO DE ESTERILIDAD */
const Vial: React.FC<{x: number; y: number; w?: number; h?: number; fill?: number; color?: string; bad?: number; label?: string; o?: number; glow?: number}> = ({x, y, w = 70, h = 150, fill = 0.6, color = '#BFEDE4', bad = 0, label, o = 1, glow = 0}) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <rect x={-w * 0.22} y={-h / 2 - 16} width={w * 0.44} height={18} rx={3} fill="#C9D3D1" />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill="rgba(236,243,241,0.08)" stroke="rgba(236,243,241,0.7)" strokeWidth={2.5} />
    <rect x={-w / 2 + 5} y={h / 2 - h * fill} width={w - 10} height={h * fill - 5} rx={10} fill={color} opacity={0.55} />
    {bad > 0
      ? Array.from({length: 9}, (_, i) => (
          <rect key={i} x={-w / 2 + 10 + rnd(i + x) * (w - 26)} y={h / 2 - h * fill * rnd(i + 7 + x) - 4} width={10} height={4} rx={2} fill={K.red} opacity={bad} />
        ))
      : null}
    {glow > 0 ? <rect x={-w / 2 - 6} y={-h / 2 - 6} width={w + 12} height={h + 12} rx={18} fill="none" stroke={K.red} strokeWidth={4} opacity={glow} /> : null}
    {label ? (
      <text x={0} y={h / 2 + 34} textAnchor="middle" fontFamily={F.mono} fontSize={19} fill={K.bone} opacity={0.85} letterSpacing="0.06em">
        {label}
      </text>
    ) : null}
  </g>
);

/** ocho lotes mezclados en una sola prueba: el contaminado se diluye y el cultivo da negativo */
export const PoolingDiagram: React.FC<{t: number; t0: number; t1?: number; tPool: number; tDilute: number; tNeg: number; tOut: number}> = ({t, t0, t1 = Infinity, tPool, tDilute, tNeg, tOut}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const single = 1 - prog(t, tPool - 0.4, 0.5);
  const eight = prog(t, tPool, 0.7);
  const pour = prog(t, tPool + 0.8, 1.6, easeInOut);
  const dil = prog(t, tDilute, 2.2, easeInOut);
  const neg = prog(t, tNeg, 0.5);
  const out = prog(t, tOut, 1.2, easeInOut);
  const flaskX = 1240, flaskY = 600;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <svg width={1920} height={1080}>
        {/* una muestra (explicación) */}
        <g opacity={single}>
          <Vial x={640} y={600} label="LOTE" fill={0.62} />
          <path d={`M700 600 C 820 600 900 600 ${flaskX - 120} ${flaskY}`} fill="none" stroke={K.teal} strokeWidth={3} strokeDasharray="10 10" strokeDashoffset={-t * 40} />
          <text x={820} y={560} fontFamily={F.mono} fontSize={22} fill={K.teal} letterSpacing="0.14em">MUESTRA</text>
        </g>
        {/* ocho lotes */}
        {Array.from({length: 8}, (_, i) => {
          const col = i % 4, row = Math.floor(i / 4);
          const vx = 300 + col * 150, vy = 440 + row * 300;
          const isBad = i === 5;
          const pp = prog(t, tPool + i * 0.06, 0.5);
          return (
            <g key={i} opacity={eight * pp}>
              <Vial x={vx} y={vy} w={64} h={130} fill={0.6 - pour * 0.25} bad={isBad ? 1 - dil * 0.6 : 0} glow={isBad ? 0.9 * (1 - dil) : 0} label={`LOTE ${i + 1}`} />
              <path d={`M${vx + 34} ${vy} C ${vx + 300} ${vy} ${flaskX - 300} ${flaskY - 40} ${flaskX - 110} ${flaskY - 40}`} fill="none" stroke={isBad ? K.red : K.teal} strokeWidth={2.5} strokeDasharray="8 12" strokeDashoffset={-t * 50} opacity={pour > 0 && pour < 1 ? 0.8 : 0.15} />
            </g>
          );
        })}
        {/* frasco de cultivo */}
        <g transform={`translate(${flaskX + out * 520},${flaskY})`}>
          <path d="M-40 -170 h80 v60 l90 170 q12 26 -16 26 h-228 q-28 0 -16 -26 l90 -170 z" fill="rgba(236,243,241,0.06)" stroke="rgba(236,243,241,0.8)" strokeWidth={3} />
          <path d={`M${-118 + 20} ${60} h${236 - 40} l-${30} -60 h-${236 - 100} z`} fill="#F5D99A" opacity={0.18 + 0.3 * pour} />
          {Array.from({length: 22}, (_, i) => {
            const k = clamp(pour * 1.2 - 0.2);
            const spread = mix(0.2, 1, dil);
            return (
              <rect key={i} x={-8 + (rnd(i + 70) - 0.5) * 200 * spread} y={30 - rnd(i + 90) * 70 * spread} width={9} height={4} rx={2} fill={K.red} opacity={k * (1 - dil * 0.93)} />
            );
          })}
          <text x={0} y={140} textAnchor="middle" fontFamily={F.mono} fontSize={22} fill={K.bone} letterSpacing="0.16em">CULTIVO</text>
        </g>
      </svg>
      {/* resultado */}
      <div style={{position: 'absolute', left: flaskX + 210 + out * 520, top: 300, opacity: neg * (1 - out * 0.3), transform: `scale(${0.9 + 0.1 * pop(t, tNeg)})`}}>
        <div style={{...gm(22, K.mute, 600, 0.2)}}>RESULTADO</div>
        <div style={{...gs(84, 800, K.teal, -0.03)}}>NEGATIVO ✓</div>
        <div style={{...gm(20, K.amber, 600, 0.14), marginTop: 6}}>LA BACTERIA NO APARECE</div>
      </div>
      <div style={{position: 'absolute', left: 300, top: 250, opacity: eight * (1 - out)}}>
        <div style={{...gm(24, K.amber, 600, 0.2)}}>SEGÚN LA CAUSA</div>
        <div style={{...gs(56, 760, K.bone, -0.02)}}>
          8 lotes <span style={{color: K.mute, fontWeight: 400}}>→</span> 1 prueba
        </div>
      </div>
      {out > 0 ? (
        <div style={{position: 'absolute', left: 1500, top: 820, opacity: out, ...gs(64, 800, K.red, -0.02)}}>EL LOTE SALE</div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ================================================================== HISTORIAL */
/** 118 reportes (2018–2024) que se apilan; la mayoría se confirman; 38 retiros marcados */
export const ReportsGrid: React.FC<{t: number; t0: number; t1?: number; tConf: number; tRecall: number; x?: number; y?: number}> = ({t, t0, t1 = Infinity, tConf, tRecall, x = 260, y = 300}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const cols = 20, cw = 60, ch = 74;
  const nShow = Math.floor(ramp(t, t0 + 0.2, 118, 3.2));
  const conf = prog(t, tConf, 1.2);
  const rec = prog(t, tRecall, 1.4);
  // 38 retiros en un orden fijo (determinista) que se van marcando
  const order = Array.from({length: 118}, (_, i) => i).sort((a, b) => rnd(a * 13 + 5) - rnd(b * 13 + 5));
  const recallRank = new Map(order.slice(0, 38).map((idx, k) => [idx, k] as [number, number]));
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: o}}>
      <svg width={cols * cw} height={6 * ch + 20}>
        {Array.from({length: 118}, (_, i) => {
          if (i >= nShow) return null;
          const c = i % cols, r = Math.floor(i / cols);
          const confirmed = (rnd(i + 3) < 0.86 || recallRank.has(i)) && conf > rnd(i + 9);
          const rk = recallRank.get(i);
          const recall = rk !== undefined && rec * 38 > rk;
          const fill = recall ? K.red : confirmed ? K.amber : 'rgba(236,243,241,0.12)';
          const pp = clamp((nShow - i) / 3);
          return (
            <g key={i} transform={`translate(${c * cw + 6},${r * ch + 6 + (1 - pp) * 20})`} opacity={pp}>
              <path d="M0 0 h32 l12 12 v46 h-44 z" fill={fill} opacity={recall ? 1 : 0.85} />
              <path d="M32 0 v12 h12" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={2} />
              <path d="M8 24 h28 M8 34 h28 M8 44 h18" stroke="rgba(0,0,0,0.35)" strokeWidth={3} />
            </g>
          );
        })}
      </svg>
      <div style={{display: 'flex', gap: 60, marginTop: 26}}>
        <div>
          <div style={{...gm(22, K.amber, 600, 0.2)}}>REPORTES 2018–2024</div>
          <Odo13 value={ramp(t, t0 + 0.2, 118, 3.2)} size={120} />
        </div>
        <div style={{opacity: prog(t, tConf, 0.5)}}>
          <div style={{...gm(22, K.amber, 600, 0.2)}}>CONFIRMADOS</div>
          <div style={{...gs(64, 700, K.bone), marginTop: 18}}>la gran mayoría</div>
        </div>
        <div style={{opacity: prog(t, tRecall, 0.5)}}>
          <div style={{...gm(22, K.red, 600, 0.2)}}>RETIROS DE LOTES</div>
          <Odo13 value={ramp(t, tRecall, 38, 1.4)} size={120} color={K.red} prefix="≥" />
        </div>
      </div>
    </div>
  );
};

/** 23 ampollas de dexametasona: se analiza una sola */
export const Vials23: React.FC<{t: number; t0: number; t1?: number; tOne: number; y?: number}> = ({t, t0, t1 = Infinity, tOne, y = 560}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const one = prog(t, tOne, 0.6);
  const lens = prog(t, tOne + 0.1, 0.8);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <svg width={1920} height={1080}>
        {Array.from({length: 23}, (_, i) => {
          const vx = 230 + i * 64;
          const pp = prog(t, t0 + i * 0.04, 0.45);
          const chosen = i === 11;
          return (
            <g key={i} opacity={pp * (chosen ? 1 : 1 - one * 0.7)} transform={`translate(0,${(1 - pp) * 40})`}>
              <Vial x={vx} y={y} w={42} h={120} fill={0.6} color="#E7E2C9" glow={chosen ? one : 0} />
            </g>
          );
        })}
        <g opacity={lens} transform={`translate(${230 + 11 * 64},${y - 20})`}>
          <circle cx={0} cy={0} r={90} fill="none" stroke={K.bone} strokeWidth={6} />
          <path d="M64 64 l70 70" stroke={K.bone} strokeWidth={14} strokeLinecap="round" />
        </g>
      </svg>
      <div style={{position: 'absolute', left: 230, top: y + 130, display: 'flex', gap: 80}}>
        <div>
          <div style={{...gm(22, K.amber, 600, 0.2)}}>AMPOLLAS</div>
          <div style={{...gs(110, 700, K.bone)}}>23</div>
        </div>
        <div style={{opacity: one}}>
          <div style={{...gm(22, K.red, 600, 0.2)}}>ANALIZADAS</div>
          <div style={{...gs(110, 700, K.red)}}>1</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** candado que intenta cerrar y queda abierto */
export const Padlock: React.FC<{t: number; t0: number; t1?: number; x?: number; y?: number; s?: number; tTry: number}> = ({t, t0, t1 = Infinity, x = 1400, y = 520, s = 1, tTry}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const a = t - tTry;
  const shut = a < 0 ? 0 : a < 0.25 ? a / 0.25 : a < 0.5 ? 1 - (a - 0.25) / 0.25 * 0.85 : 0.15 + Math.sin(a * 18) * 0.03 * Math.exp(-(a - 0.5) * 3);
  const lift = (1 - shut) * 70;
  return (
    <svg width={360 * s} height={460 * s} viewBox="0 0 360 460" style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', opacity: o}}>
      <path d={`M100 ${200 - lift} v-70 a80 80 0 0 1 160 0 v${70 + (shut > 0.9 ? 0 : 0)}`} fill="none" stroke="#B9C4C2" strokeWidth={30} strokeLinecap="round" transform={`rotate(${(1 - shut) * -18} 260 ${200 - lift})`} />
      <rect x={50} y={200} width={260} height={220} rx={28} fill="#7E8C8A" />
      <rect x={50} y={200} width={260} height={220} rx={28} fill="none" stroke="#C9D3D1" strokeWidth={4} />
      <circle cx={180} cy={290} r={24} fill="#2A3332" />
      <rect x={172} y={300} width={16} height={50} rx={6} fill="#2A3332" />
    </svg>
  );
};

/* ================================================================== INSPECCIÓN */
/** las tareas de esa noche: aparecen con su tilde sincronizadas con la locución y un contador hasta 18 */
export const Checklist18: React.FC<{t: number; t0: number; t1?: number; items: {text: string; at: number}[]; x?: number; y?: number; tCount?: number}> = ({t, t0, t1 = Infinity, items, x = 980, y = 250, tCount}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const last = items[items.length - 1].at;
  const count = Math.min(18, Math.floor(ramp(t, tCount ?? t0, 18, Math.max(1, last - (tCount ?? t0) + 1.2))));
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 820, opacity: o}}>
      <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: `1px solid ${K.line2}`, paddingBottom: 14}}>
        <div style={{...gm(22, K.amber, 600, 0.2)}}>ESA NOCHE · GRUPO DEL LABORATORIO</div>
        <div style={{...gs(54, 760, K.bone)}}>
          {count}
          <span style={{color: K.dim, fontWeight: 400}}>/18</span>
        </div>
      </div>
      {items.map((it, i) => {
        const p = prog(t, it.at, 0.45);
        const ck = prog(t, it.at + 0.25, 0.35);
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, padding: '16px 0', borderBottom: `1px solid ${K.line}`, opacity: p, transform: `translateX(${(1 - p) * 30}px)`}}>
            <svg width={40} height={40}>
              <rect x={2} y={2} width={36} height={36} rx={8} fill="none" stroke={K.teal} strokeWidth={2.5} />
              <path d="M10 21 l7 7 l14 -16" fill="none" stroke={K.teal} strokeWidth={4} strokeLinecap="round" strokeDasharray={40} strokeDashoffset={40 * (1 - ck)} />
            </svg>
            <div style={{...gs(38, 520, K.bone, -0.01)}}>{it.text}</div>
          </div>
        );
      })}
      <div style={{...gm(20, K.mute, 500, 0.14), marginTop: 16, opacity: prog(t, last + 0.6, 0.5)}}>+ 13 TAREAS MÁS · SEGÚN LOS CHATS DE LA CAUSA</div>
    </div>
  );
};

/** línea de tiempo de la inspección: el día de la visita, el acta abierta un mes y la fabricación adentro de ese tramo */
export const ActaSpan: React.FC<{t: number; t0: number; t1?: number; tDay: number; tOpen: number; tFab: number; y?: number}> = ({t, t0, t1 = Infinity, tDay, tOpen, tFab, y = 640}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const X0 = 220, X1 = 1700;
  // del 20/11/2024 al 10/01/2025 (51 días)
  const dx = (d: number) => X0 + ((X1 - X0) * d) / 51;
  const day = prog(t, tDay, 0.5);
  const open = prog(t, tOpen, 1.4, easeInOut);
  const fab = prog(t, tFab, 0.6);
  const ticks = [
    {d: 0, l: '20 NOV'}, {d: 11, l: '1 DIC'}, {d: 26, l: '16 DIC'}, {d: 41, l: '31 DIC'}, {d: 51, l: '10 ENE'},
  ];
  return (
    <AbsoluteFill style={{opacity: o}}>
      <svg width={1920} height={1080}>
        <line x1={X0} y1={y} x2={X1} y2={y} stroke={K.line2} strokeWidth={3} />
        {Array.from({length: 52}, (_, d) => (
          <line key={d} x1={dx(d)} y1={y - (d % 5 === 0 ? 14 : 7)} x2={dx(d)} y2={y} stroke={K.line2} strokeWidth={2} />
        ))}
        {ticks.map((tk) => (
          <text key={tk.d} x={dx(tk.d)} y={y + 44} textAnchor="middle" fontFamily={F.mono} fontSize={20} fill={K.mute} letterSpacing="0.1em">
            {tk.l}
          </text>
        ))}
        {/* día de la inspección: 28/11 */}
        <rect x={dx(8) - 8} y={y - 90} width={16} height={90 * day} fill={K.amber} />
        {/* acta abierta: 28/11 → ~28/12 */}
        <rect x={dx(8)} y={y - 46} width={(dx(38) - dx(8)) * open} height={26} rx={4} fill="rgba(255,176,32,0.22)" stroke={K.amber} strokeWidth={2} />
        {/* fabricación del fentanilo: 16/12 */}
        <g opacity={fab}>
          <line x1={dx(26)} y1={y - 220} x2={dx(26)} y2={y} stroke={K.red} strokeWidth={4} />
          <circle cx={dx(26)} cy={y - 33} r={14 * pop(t, tFab)} fill={K.red} />
        </g>
      </svg>
      <div style={{position: 'absolute', left: dx(8) - 8, top: y - 170, opacity: day}}>
        <div style={{...gm(20, K.amber, 600, 0.16)}}>28 NOV · INSPECCIÓN</div>
        <div style={{...gs(34, 600, K.bone)}}>un solo día</div>
      </div>
      <div style={{position: 'absolute', left: (dx(8) + dx(38)) / 2, top: y + 80, transform: 'translateX(-50%)', opacity: open, textAlign: 'center'}}>
        <div style={{...gm(20, K.amber, 600, 0.16)}}>EL ACTA SIGUE ABIERTA</div>
        <div style={{...gs(34, 600, K.bone)}}>se cierra recién un mes después</div>
      </div>
      <div style={{position: 'absolute', left: dx(26) + 24, top: y - 250, opacity: fab}}>
        <div style={{...gm(22, K.red, 600, 0.16)}}>16 DIC 2024</div>
        <div style={{...gs(46, 760, K.bone, -0.02)}}>empieza a fabricarse</div>
        <div style={{...gs(46, 760, K.red, -0.02)}}>el fentanilo</div>
      </div>
    </AbsoluteFill>
  );
};

/** los seis lotes de la tanda; el 31.202 se destaca */
export const SixLots: React.FC<{t: number; t0: number; t1?: number; tPick: number; y?: number}> = ({t, t0, t1 = Infinity, tPick, y = 560}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const lots = ['31.201', '31.202', '31.244', '31.245', '31.246', '31.247'];
  const pick = prog(t, tPick, 0.7);
  return (
    <AbsoluteFill style={{opacity: o}}>
      {lots.map((l, i) => {
        const p = prog(t, t0 + i * 0.09, 0.5);
        const chosen = i === 1;
        const xx = 960 + (i - 2.5) * 270;
        const sc = chosen ? 1 + pick * 0.35 : 1 - pick * 0.1;
        return (
          <div
            key={l}
            style={{
              position: 'absolute', left: xx, top: y, transform: `translate(-50%,-50%) translateY(${(1 - p) * 40 - (chosen ? pick * 30 : 0)}px) scale(${sc})`,
              opacity: p * (chosen ? 1 : 1 - pick * 0.6), border: `2px solid ${chosen ? mixColor(pick) : K.line2}`, borderRadius: 12, padding: '18px 26px', background: chosen ? `rgba(255,59,48,${0.12 * pick})` : 'rgba(236,243,241,0.04)', textAlign: 'center',
            }}
          >
            <div style={{...gm(18, K.mute, 600, 0.2)}}>LOTE</div>
            <div style={{...gm(40, chosen ? K.bone : K.bone, 600, 0.02)}}>{l}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
const mixColor = (k: number) => (k > 0.5 ? K.red : K.line2);
export {fmt};
