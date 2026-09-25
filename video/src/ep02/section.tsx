import React from 'react';
import {R, F2} from './lib';
import {clamp, rnd} from '../lib/anim';

const S = '#111';

/* Patrullero de perfil */
const PoliceCar: React.FC<{x: number; y: number; t: number; flip?: boolean; s?: number}> = ({x, y, t, flip, s = 1}) => {
  const ph = Math.floor(t * 6 + x) % 2;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d="M-70 0 L-70 -26 L-40 -30 L-24 -52 L30 -52 L46 -30 L70 -26 L70 0 Z" fill="#F2F2F2" stroke={S} strokeWidth="4" strokeLinejoin="round" />
      <rect x="-70" y="-20" width="140" height="10" fill={R.blue} />
      <rect x="-14" y="-62" width="12" height="10" fill={ph ? R.red : '#661a16'} stroke={S} strokeWidth="2" />
      <rect x="2" y="-62" width="12" height="10" fill={ph ? '#16336b' : R.blue} stroke={S} strokeWidth="2" />
      {ph ? <circle cx="-8" cy="-58" r="22" fill={R.red} opacity="0.25" /> : <circle cx="8" cy="-58" r="22" fill={R.blue} opacity="0.3" />}
      <circle cx="-40" cy="0" r="13" fill="#1a1a1a" /><circle cx="40" cy="0" r="13" fill="#1a1a1a" />
    </g>
  );
};

const Tree: React.FC<{x: number; y: number; r?: number}> = ({x, y, r = 70}) => (
  <g>
    <rect x={x - 8} y={y - 90} width="16" height="90" fill="#5a3d24" stroke={S} strokeWidth="3" />
    <circle cx={x} cy={y - 120} r={r} fill="#4F7A3A" stroke={S} strokeWidth="4" />
    <circle cx={x - r * 0.5} cy={y - 100} r={r * 0.6} fill="#5E8C45" stroke={S} strokeWidth="4" />
  </g>
);

const House: React.FC<{x: number; w: number; h: number; color: string; y?: number}> = ({x, w, h, color, y = 400}) => (
  <g>
    <rect x={x} y={y - h} width={w} height={h} fill={color} stroke={S} strokeWidth="5" />
    <path d={`M${x - 14} ${y - h} L${x + w / 2} ${y - h - 70} L${x + w + 14} ${y - h}`} fill="#8E4B3A" stroke={S} strokeWidth="5" strokeLinejoin="round" />
    {Array.from({length: Math.floor(w / 90)}).map((_, i) => <rect key={i} x={x + 30 + i * 90} y={y - h + 40} width="46" height="56" fill="#9CC3E6" stroke={S} strokeWidth="4" />)}
  </g>
);

const Person: React.FC<{x: number; y: number; s?: number; color?: string; lamp?: boolean; t?: number}> = ({x, y, s = 1, color = '#111', lamp, t = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {lamp ? <path d={`M0 -52 L${120 + Math.sin(t * 3) * 20} -110 L${120 + Math.sin(t * 3) * 20} 10 Z`} fill="#FFF3B0" opacity="0.35" /> : null}
    <circle cx="0" cy="-52" r="12" fill={color} />
    {lamp ? <circle cx="8" cy="-56" r="5" fill="#FFF3B0" /> : null}
    <path d="M-16 0 L-16 -30 Q-16 -40 0 -40 Q16 -40 16 -30 L16 0 Z" fill={color} />
  </g>
);

const Sniper: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle cx="0" cy="-26" r="10" fill="#111" />
    <path d="M-14 0 L-14 -16 Q-14 -18 0 -18 Q14 -18 14 -16 L14 0 Z" fill="#111" />
    <rect x="4" y="-24" width="46" height="5" fill="#111" />
    <g opacity={0.6 + 0.4 * Math.sin(t * 8)}>
      <circle cx="90" cy="30" r="18" fill="none" stroke={R.red} strokeWidth="3" />
      <line x1="66" y1="30" x2="114" y2="30" stroke={R.red} strokeWidth="2" />
      <line x1="90" y1="6" x2="90" y2="54" stroke={R.red} strokeWidth="2" />
    </g>
  </g>
);

const Boat: React.FC<{x: number; y: number; t: number; bags?: number}> = ({x, y, t, bags = 3}) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 9 + x) * 3})`}>
    <path d="M-90 -10 Q-96 24 -60 26 L70 26 Q100 24 94 -10 Z" fill={R.orange} stroke={S} strokeWidth="5" />
    <path d="M-86 0 L90 0" stroke={S} strokeWidth="3" />
    {Array.from({length: bags}).map((_, i) => (
      <g key={i}>
        <path d={`M${-60 + i * 36} -8 Q${-64 + i * 36} -44 ${-44 + i * 36} -46 Q${-22 + i * 36} -44 ${-26 + i * 36} -8 Z`} fill="#6B6B5A" stroke={S} strokeWidth="4" />
        <text x={-44 + i * 36} y="-20" textAnchor="middle" fontFamily="Anton" fontSize="16" fill={R.yellow}>$</text>
      </g>
    ))}
    <circle cx="50" cy="-30" r="11" fill="#111" /><path d="M36 -8 L36 -18 Q36 -22 50 -22 Q64 -22 64 -18 L64 -8 Z" fill="#111" />
    <rect x="-112" y="-6" width="22" height="26" fill="#333" stroke={S} strokeWidth="3" />
    {Array.from({length: 4}).map((_, i) => {
      const k = (t * 2 + i / 4) % 1;
      return <circle key={i} cx={-120 - k * 90} cy={14 + Math.sin(i) * 4} r={4 + k * 8} fill="#CFE8E6" opacity={1 - k} />;
    })}
  </g>
);

export type SectionProps = {
  t: number;
  pan?: number;        // desplazamiento horizontal en px del mundo
  zoom?: number;
  dig?: number;        // 0..1 progreso del túnel (desde el desagüe hacia arriba)
  cars?: number;       // cantidad de patrulleros visibles
  snipers?: boolean;
  workers?: boolean;
  boats?: number | null;  // posición x del primer bote
  boxesGlow?: number;
  dusk?: number;       // 0 día, 1 atardecer
  labels?: number;     // opacidad de rótulos
  exit?: number;       // 0..1 muestra la salida (alcantarilla)
  van?: number;        // x de la camioneta, null = oculta
  vanGone?: number;    // 0..1 la camioneta se va
  bagsUp?: number;     // 0..1 bolsas subiendo a la camioneta
  vaultEmpty?: boolean;
  hostages?: number;   // gente en el banco
};

export const CrossSection: React.FC<SectionProps> = ({
  t, pan = 0, zoom = 1, dig = 1, cars = 0, snipers, workers, boats = null, boxesGlow = 0, dusk = 0, labels = 1, exit = 0, van = null, vanGone = 0, bagsUp = 0, vaultEmpty, hostages = 0,
}) => {
  const W = 3400;
  const sky = dusk > 0 ? `rgb(${236 - dusk * 20},${227 - dusk * 90},${208 - dusk * 120})` : R.paper;
  const carXs = [260, 420, 600, 1260, 1420, 1580, 1760, 140, 1900, 2060, 700, 1180];
  const flow = (t * 120) % 80;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: 1080, transform: `scale(${zoom}) translateX(${-pan}px)`, transformOrigin: '0 0'}}>
      <svg width={W} height="1080" viewBox={`0 0 ${W} 1080`}>
        {/* cielo */}
        <rect x="0" y="0" width={W} height="400" fill={sky} />
        {/* edificios */}
        <House x={180} w={380} h={170} color="#E9D9B8" />
        <House x={1320} w={360} h={190} color="#DCCFB5" />
        <House x={1980} w={420} h={160} color="#E7D2B0" />
        <House x={2980} w={300} h={170} color="#E0D0B3" />
        <Tree x={640} y={400} /><Tree x={1230} y={400} r={60} /><Tree x={1860} y={400} r={80} /><Tree x={2500} y={400} /><Tree x={3320} y={400} r={60} />
        {/* banco */}
        <rect x="760" y="210" width="420" height="190" fill="#F4F1EA" stroke={S} strokeWidth="6" />
        <rect x="760" y="240" width="420" height="44" fill={R.red} stroke={S} strokeWidth="5" />
        <text x="970" y="274" textAnchor="middle" fontFamily="Anton" fontSize="34" fill="#fff" letterSpacing="4">BANCO RÍO</text>
        {[790, 900, 1080].map((x) => <rect key={x} x={x} y="300" width="70" height="80" fill="#9CC3E6" stroke={S} strokeWidth="4" />)}
        <rect x="990" y="300" width="70" height="100" fill="#5a3d24" stroke={S} strokeWidth="4" />
        {Array.from({length: hostages}).map((_, i) => <Person key={i} x={805 + (i % 12) * 30} y={398} s={0.6} color="#333" />)}
        {snipers ? (
          <>
            <Sniper x={260} y={220} t={t} /><Sniper x={1400} y={200} t={t + 1} /><Sniper x={1580} y={200} t={t + 2} />
          </>
        ) : null}
        {/* calle */}
        <rect x="0" y="392" width={W} height="10" fill="#B8B2A6" />
        <rect x="0" y="400" width={W} height="42" fill={R.asphalt} />
        {Array.from({length: 40}).map((_, i) => <rect key={i} x={i * 100 + 20} y="419" width="50" height="5" fill="#EDEDED" />)}
        {Array.from({length: Math.min(cars, carXs.length)}).map((_, i) => <PoliceCar key={i} x={carXs[i]} y={410} t={t} flip={i % 2 === 1} s={0.9} />)}
        {/* suelo */}
        <rect x="0" y="442" width={W} height="638" fill={R.soil} />
        {Array.from({length: 7}).map((_, i) => <path key={i} d={`M0 ${500 + i * 85} ${Array.from({length: 18}).map((__, k) => `Q${k * 200 + 100} ${500 + i * 85 + (rnd(i * 20 + k) - 0.5) * 30} ${(k + 1) * 200} ${500 + i * 85}`).join(' ')}`} stroke={R.soil2} strokeWidth="6" fill="none" />)}
        {Array.from({length: 60}).map((_, i) => <ellipse key={i} cx={rnd(i) * W} cy={470 + rnd(i + 99) * 580} rx={8 + rnd(i + 5) * 14} ry={6 + rnd(i + 7) * 8} fill={R.soil2} />)}
        {/* bóveda */}
        <rect x="790" y="462" width="360" height="178" fill="#2A2A2A" stroke={S} strokeWidth="8" />
        {Array.from({length: 18}).map((_, i) => {
          const c = i % 9, r = Math.floor(i / 9);
          return <rect key={i} x={808 + c * 37} y={488 + r * 52} width="30" height="40" fill={vaultEmpty ? '#2e2e2e' : boxesGlow > 0 ? `rgba(255,204,51,${0.3 + 0.7 * boxesGlow})` : '#8E959F'} stroke="#111" strokeWidth="3" />;
        })}
        {/* desagüe */}
        <rect x="-40" y="780" width={W + 80} height="140" rx="70" fill="#1d2b2b" stroke={R.concrete} strokeWidth="16" />
        <rect x="-40" y="872" width={W + 80} height="40" fill={R.water} opacity="0.9" />
        {Array.from({length: 50}).map((_, i) => <rect key={i} x={i * 80 - flow} y={884} width="36" height="4" fill="#CFE8E6" opacity="0.6" />)}
        {/* túnel (se cava desde el desagüe hacia arriba) */}
        <path d={`M925 ${780 - 140 * dig} L995 ${780 - 140 * dig} L1000 780 L920 780 Z`} fill="#3a2a1c" stroke={S} strokeWidth="5" />
        {dig > 0.98 ? <rect x="915" y="632" width="90" height="14" fill="#111" /> : null}
        {workers ? (
          <>
            <Person x={900} y={866} t={t} lamp s={1.1} color="#222" />
            <Person x={1040} y={866} t={t + 2} lamp s={1.1} color="#222" />
            {Array.from({length: 6}).map((_, i) => {
              const k = (t * 1.5 + i / 6) % 1;
              return <circle key={i} cx={960 + Math.sin(i * 3) * 30} cy={780 - 140 * dig + k * 80} r="5" fill="#8a6a4a" opacity={1 - k} />;
            })}
          </>
        ) : null}
        {/* salida: alcantarilla */}
        {exit > 0 ? (
          <g opacity={exit}>
            <rect x="2695" y="440" width="70" height="342" fill="#2a2a2a" stroke={S} strokeWidth="5" />
            {Array.from({length: 8}).map((_, i) => <rect key={i} x="2705" y={460 + i * 40} width="50" height="6" fill="#777" />)}
            <rect x="2680" y="398" width="100" height="8" fill="#555" />
          </g>
        ) : null}
        {van !== null ? (
          <g transform={`translate(${van + vanGone * 900} 0)`}>
            <g transform="translate(-260 250) scale(1)">
              <path d="M30 150 L30 60 C30 30 50 16 90 16 L420 16 C460 16 490 40 490 80 L490 150 Z" fill="#E9E3D2" stroke={S} strokeWidth="6" />
              <rect x="30" y="100" width="460" height="50" fill={R.red} stroke={S} strokeWidth="5" />
              {[70, 170, 330].map((x) => <rect key={x} x={x} y="34" width="80" height="50" rx="6" fill="#9CC3E6" stroke={S} strokeWidth="4" />)}
              <rect x="205" y="146" width="110" height="8" fill="#111" />
              <circle cx="110" cy="150" r="30" fill="#1a1a1a" /><circle cx="410" cy="150" r="30" fill="#1a1a1a" />
            </g>
            {bagsUp > 0 && bagsUp < 1 ? (
              <g>
                {[0, 1].map((i) => <path key={i} transform={`translate(${-20 + i * 40} ${780 - bagsUp * 380 + i * 30})`} d="M-16 0 Q-20 -36 0 -38 Q20 -36 16 0 Z" fill="#6B6B5A" stroke={S} strokeWidth="4" />)}
              </g>
            ) : null}
          </g>
        ) : null}
        {boats !== null ? (
          <>
            <Boat x={boats} y={866} t={t} />
            <Boat x={boats - 260} y={866} t={t + 1} bags={2} />
          </>
        ) : null}
        {/* rótulos */}
        <g opacity={labels} fontFamily="Special Elite" fontSize="30" fill="#111">
          <text x="1300" y="470" fill="#fff">CALLE PERÚ</text>
          <g>
            <rect x="1170" y="505" width="400" height="48" fill={R.yellow} stroke={S} strokeWidth="3" />
            <text x="1185" y="539">← BÓVEDA · CAJAS</text>
          </g>
          <g>
            <rect x="1440" y="945" width="370" height="48" fill="#fff" stroke={S} strokeWidth="3" />
            <text x="1455" y="979">DESAGÜE PLUVIAL</text>
          </g>
          {dig > 0.2 ? (
            <g>
              <rect x="1020" y="690" width="160" height="44" fill={R.red} stroke={S} strokeWidth="3" />
              <text x="1036" y="722" fill="#fff">TÚNEL</text>
            </g>
          ) : null}
          {exit > 0.5 ? (
            <g>
              <rect x="2800" y="600" width="300" height="48" fill={R.yellow} stroke={S} strokeWidth="3" />
              <text x="2815" y="634">ALCANTARILLA</text>
            </g>
          ) : null}
        </g>
      </svg>
    </div>
  );
};

/* ================= Mapa tipo plano del golpe ================= */

export const HeistMap: React.FC<{t: number; route: number; cars?: number; van?: number; exitLabel?: number}> = ({t, route, cars = 0, van = 0, exitLabel = 0}) => {
  const blue = '#0F2C4C';
  const line = 'rgba(255,255,255,0.85)';
  const path = 'M700 330 L700 620 L1100 620 L1100 900 L1560 900';
  const len = 290 + 400 + 280 + 460;
  const ph = Math.floor(t * 6) % 2;
  return (
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
      <rect width="1920" height="1080" fill={blue} />
      {Array.from({length: 49}).map((_, i) => <line key={'v' + i} x1={i * 40} y1="0" x2={i * 40} y2="1080" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />)}
      {Array.from({length: 28}).map((_, i) => <line key={'h' + i} x1="0" y1={i * 40} x2="1920" y2={i * 40} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />)}
      {/* calles */}
      <path d="M0 330 L1920 300" stroke={line} strokeWidth="26" />
      {[300, 700, 1100, 1560].map((x) => <line key={x} x1={x} y1="0" x2={x + 10} y2="1080" stroke={line} strokeWidth="12" />)}
      {[620, 900].map((y) => <line key={y} x1="0" y1={y} x2="1920" y2={y} stroke={line} strokeWidth="12" />)}
      <text x="60" y="300" fontFamily="Special Elite" fontSize="30" fill="#fff" transform="rotate(-0.9 60 300)">AV. DEL LIBERTADOR</text>
      <text x="720" y="780" fontFamily="Special Elite" fontSize="30" fill="#fff" transform="rotate(90 720 780)">CALLE PERÚ</text>
      {/* banco */}
      <rect x="600" y="210" width="90" height="90" fill={R.red} stroke="#fff" strokeWidth="4" />
      <text x="645" y="195" textAnchor="middle" fontFamily="Anton" fontSize="30" fill="#fff">BANCO</text>
      {/* patrulleros */}
      {Array.from({length: cars}).map((_, i) => {
        const a = (i / Math.max(cars, 1)) * Math.PI * 2;
        return <circle key={i} cx={645 + Math.cos(a) * (120 + (i % 3) * 30)} cy={255 + Math.sin(a) * (90 + (i % 2) * 30)} r="11" fill={(i + ph) % 2 ? R.red : R.blue} stroke="#fff" strokeWidth="2" />;
      })}
      {/* recorrido por el desagüe */}
      <path d={path} fill="none" stroke={R.yellow} strokeWidth="12" strokeDasharray={`${len}`} strokeDashoffset={len * (1 - route)} strokeLinecap="round" />
      <path d={path} fill="none" stroke="#111" strokeWidth="4" strokeDasharray="14 18" opacity={route > 0 ? 0.6 : 0} />
      {route > 0.98 ? (
        <g>
          <circle cx="1560" cy="900" r={26 + Math.sin(t * 8) * 4} fill="none" stroke={R.yellow} strokeWidth="6" />
          <circle cx="1560" cy="900" r="12" fill={R.yellow} />
        </g>
      ) : null}
      <g opacity={exitLabel}>
        <rect x="1300" y="950" width="520" height="56" fill={R.yellow} stroke="#111" strokeWidth="3" />
        <text x="1318" y="988" fontFamily="Special Elite" fontSize="30" fill="#111">ALCANTARILLA · A VARIAS CUADRAS</text>
      </g>
      {van > 0 ? (
        <g transform={`translate(${1560 + van * 420} 900)`}>
          <rect x="-40" y="-22" width="80" height="44" rx="8" fill={R.red} stroke="#fff" strokeWidth="4" />
          <text x="0" y="8" textAnchor="middle" fontFamily="Anton" fontSize="20" fill="#fff">VAN</text>
        </g>
      ) : null}
      <text x="1880" y="1050" textAnchor="end" fontFamily="Special Elite" fontSize="22" fill="rgba(255,255,255,0.6)">ESQUEMA ILUSTRATIVO · NO A ESCALA</text>
    </svg>
  );
};
