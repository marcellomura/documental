import React from 'react';
import {C, F} from '../theme';

const S = C.ink; // trazo
const SW = 6;

/* ---------- Billete estilizado genérico ---------- */
export const Banknote: React.FC<{w?: number; color?: string; dark?: string; value: string; name: string; small?: string; worn?: boolean}> = ({
  w = 520, color = '#E9C9A6', dark = '#7A4A2A', value, name, small = 'BANCO CENTRAL DE LA REPÚBLICA ARGENTINA', worn,
}) => {
  const h = w * 0.47;
  const id = 'g' + name.replace(/\W/g, '') + value.replace(/\W/g, '');
  return (
    <svg width={w} height={h} viewBox="0 0 520 244" style={{filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.3))', overflow: 'visible'}}>
      <defs>
        <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="6" fill="none" stroke={dark} strokeOpacity="0.18" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="520" height="244" rx="10" fill={color} />
      <rect x="0" y="0" width="520" height="244" rx="10" fill={`url(#${id})`} />
      <rect x="12" y="12" width="496" height="220" rx="6" fill="none" stroke={dark} strokeWidth="3" />
      <rect x="20" y="20" width="480" height="204" rx="4" fill="none" stroke={dark} strokeWidth="1.2" strokeDasharray="3 3" />
      <ellipse cx="370" cy="122" rx="78" ry="92" fill={dark} fillOpacity="0.14" stroke={dark} strokeWidth="2" />
      <circle cx="370" cy="98" r="30" fill={dark} fillOpacity="0.55" />
      <path d="M320 190 Q370 128 420 190 Z" fill={dark} fillOpacity="0.55" />
      <text x="40" y="70" fontFamily="Anton" fontSize="54" fill={dark}>{value}</text>
      <text x="480" y="220" textAnchor="end" fontFamily="Anton" fontSize="34" fill={dark} opacity="0.9">{value}</text>
      <text x="40" y="112" fontFamily="Inter" fontWeight="800" fontSize="17" fill={dark} letterSpacing="1">{name}</text>
      <text x="40" y="140" fontFamily="Inter" fontWeight="600" fontSize="9.5" fill={dark} opacity="0.8" letterSpacing="0.6">{small}</text>
      <text x="40" y="206" fontFamily="JetBrains Mono" fontWeight="700" fontSize="15" fill={C.red} opacity="0.85">A 04.815.162</text>
      {worn ? <rect x="0" y="0" width="520" height="244" rx="10" fill="#6b5a3a" opacity="0.18" /> : null}
    </svg>
  );
};

/* ---------- Dólar estilizado ---------- */
export const DollarBill: React.FC<{w?: number; value?: string; tint?: string}> = ({w = 520, value = '100', tint = C.bill}) => (
  <svg width={w} height={w * 0.43} viewBox="0 0 520 224" style={{filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.3))', overflow: 'visible'}}>
    <rect x="0" y="0" width="520" height="224" rx="8" fill={tint} />
    <rect x="10" y="10" width="500" height="204" rx="5" fill="none" stroke={C.billDark} strokeWidth="4" />
    <rect x="18" y="18" width="484" height="188" rx="3" fill="none" stroke={C.billDark} strokeWidth="1.2" strokeDasharray="2 3" />
    <ellipse cx="260" cy="112" rx="70" ry="84" fill="#E6EFDC" stroke={C.billDark} strokeWidth="3" />
    <text x="260" y="146" textAnchor="middle" fontFamily="Playfair Display" fontWeight="900" fontSize="104" fill={C.billDark}>$</text>
    <text x="36" y="64" fontFamily="Anton" fontSize="48" fill={C.billDark}>{value}</text>
    <text x="484" y="196" textAnchor="end" fontFamily="Anton" fontSize="48" fill={C.billDark}>{value}</text>
    <text x="484" y="56" textAnchor="end" fontFamily="Playfair Display" fontWeight="800" fontSize="15" fill={C.billDark} letterSpacing="2">DÓLAR</text>
    <text x="36" y="196" fontFamily="Playfair Display" fontWeight="800" fontSize="13" fill={C.billDark} letterSpacing="1.5">ESTADOS UNIDOS</text>
    <circle cx="110" cy="130" r="26" fill="none" stroke={C.billDark} strokeWidth="2" />
    <circle cx="410" cy="100" r="22" fill={C.billDark} fillOpacity="0.2" />
  </svg>
);

/* ---------- Íconos (trazo negro, estilo plano) ---------- */
type IP = {size?: number; style?: React.CSSProperties};

export const Book: React.FC<IP> = ({size = 300, style}) => (
  <svg width={size} height={size} viewBox="0 0 300 300" style={style}>
    <rect x="96" y="60" width="120" height="52" rx="4" fill={C.bill} stroke={C.billDark} strokeWidth="4" transform="rotate(-12 156 86)" />
    <text x="150" y="98" fontFamily="Anton" fontSize="30" fill={C.billDark} transform="rotate(-12 156 86)">US$</text>
    <path d="M40 100 L150 120 L260 100 L260 240 L150 262 L40 240 Z" fill="#fff" stroke={S} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M150 120 L150 262" stroke={S} strokeWidth={SW} />
    <path d="M40 100 L40 240 L150 262 L150 120 Z" fill={C.red} stroke={S} strokeWidth={SW} strokeLinejoin="round" opacity="0.92" />
    {[140, 165, 190, 215].map((y) => <path key={y} d={`M170 ${y - 12} L240 ${y - 25}`} stroke={S} strokeOpacity="0.35" strokeWidth="4" />)}
  </svg>
);

export const CookieTin: React.FC<IP> = ({size = 300, style}) => (
  <svg width={size} height={size} viewBox="0 0 300 300" style={style}>
    <ellipse cx="150" cy="238" rx="112" ry="30" fill="#1F4E8C" stroke={S} strokeWidth={SW} />
    <path d="M38 150 L38 238 A112 30 0 0 0 262 238 L262 150" fill="#2A63AE" stroke={S} strokeWidth={SW} />
    {[70, 110, 150, 190, 230].map((x) => <circle key={x} cx={x} cy="200" r="7" fill="#fff" opacity="0.8" />)}
    <path d="M38 175 Q150 205 262 175" stroke="#fff" strokeWidth="5" fill="none" opacity="0.8" />
    <ellipse cx="150" cy="150" rx="112" ry="30" fill="#15365F" stroke={S} strokeWidth={SW} />
    <rect x="100" y="112" width="100" height="48" rx="4" fill={C.bill} stroke={C.billDark} strokeWidth="4" transform="rotate(-8 150 136)" />
    <rect x="115" y="100" width="100" height="48" rx="4" fill={C.bill} stroke={C.billDark} strokeWidth="4" transform="rotate(10 165 124)" />
    <g transform="rotate(-24 150 90)">
      <ellipse cx="170" cy="78" rx="116" ry="30" fill="#2A63AE" stroke={S} strokeWidth={SW} />
      <ellipse cx="170" cy="72" rx="80" ry="18" fill="none" stroke="#fff" strokeWidth="4" opacity="0.7" />
    </g>
  </svg>
);

export const Freezer: React.FC<IP> = ({size = 300, style}) => (
  <svg width={size} height={size} viewBox="0 0 300 300" style={style}>
    <rect x="70" y="30" width="160" height="250" rx="14" fill="#fff" stroke={S} strokeWidth={SW} />
    <path d="M70 110 L230 110" stroke={S} strokeWidth={SW} />
    <rect x="86" y="44" width="128" height="54" rx="6" fill="#D9ECF7" stroke={S} strokeWidth="4" />
    <rect x="104" y="54" width="86" height="36" rx="4" fill={C.bill} stroke={C.billDark} strokeWidth="3" />
    <text x="120" y="80" fontFamily="Anton" fontSize="20" fill={C.billDark}>US$</text>
    <path d="M86 44 L214 44" stroke="#9BD0EE" strokeWidth="8" />
    {[100, 130, 160, 190].map((x, i) => <path key={x} d={`M${x} 98 l6 ${10 + (i % 2) * 6} l6 -${10 + (i % 2) * 6}`} fill="#BFE3F6" stroke={S} strokeWidth="2" />)}
    <rect x="206" y="124" width="10" height="46" rx="5" fill={S} />
    <rect x="206" y="60" width="10" height="30" rx="5" fill={S} />
  </svg>
);

export const Mattress: React.FC<IP & {bills?: number}> = ({size = 300, style, bills = 3}) => (
  <svg width={size} height={size} viewBox="0 0 300 300" style={style}>
    {Array.from({length: bills}).map((_, i) => (
      <g key={i} transform={`translate(${60 + i * 58} ${176 - (i % 2) * 6}) rotate(${-10 + i * 9})`}>
        <rect x="0" y="0" width="84" height="40" rx="3" fill={C.bill} stroke={C.billDark} strokeWidth="3" />
        <text x="8" y="28" fontFamily="Anton" fontSize="20" fill={C.billDark}>$</text>
      </g>
    ))}
    <rect x="30" y="118" width="240" height="72" rx="26" fill="#F4F1FA" stroke={S} strokeWidth={SW} />
    {[70, 110, 150, 190, 230].map((x) => <circle key={x} cx={x} cy="154" r="5" fill={S} opacity="0.5" />)}
    <path d="M40 134 Q150 124 260 134" stroke="#B8B0D6" strokeWidth="5" fill="none" />
    <rect x="20" y="210" width="260" height="22" rx="6" fill="#8C6A4A" stroke={S} strokeWidth={SW} />
    <rect x="34" y="232" width="16" height="36" fill="#8C6A4A" stroke={S} strokeWidth="5" />
    <rect x="250" y="232" width="16" height="36" fill="#8C6A4A" stroke={S} strokeWidth="5" />
  </svg>
);

export const House: React.FC<IP & {fill?: string}> = ({size = 300, style, fill = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 300 300" style={style}>
    <path d="M40 140 L150 50 L260 140" fill="none" stroke={S} strokeWidth={SW + 2} strokeLinejoin="round" strokeLinecap="round" />
    <rect x="62" y="130" width="176" height="140" fill={fill} stroke={S} strokeWidth={SW} />
    <rect x="130" y="196" width="44" height="74" fill={C.yellow} stroke={S} strokeWidth={SW} />
    <rect x="84" y="160" width="36" height="36" fill={C.celeste} stroke={S} strokeWidth="5" />
    <rect x="184" y="160" width="36" height="36" fill={C.celeste} stroke={S} strokeWidth="5" />
    <rect x="196" y="70" width="22" height="42" fill={fill} stroke={S} strokeWidth="5" />
  </svg>
);

export const Bank: React.FC<IP & {label?: string; fill?: string}> = ({size = 300, style, label = 'BANCO', fill = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 300 300" style={style}>
    <path d="M30 100 L150 36 L270 100 Z" fill={fill} stroke={S} strokeWidth={SW} strokeLinejoin="round" />
    <rect x="36" y="100" width="228" height="22" fill={fill} stroke={S} strokeWidth={SW} />
    {[62, 112, 162, 212].map((x) => <rect key={x} x={x} y="126" width="26" height="110" fill={fill} stroke={S} strokeWidth="5" />)}
    <rect x="24" y="236" width="252" height="24" fill={fill} stroke={S} strokeWidth={SW} />
    <text x="150" y="88" textAnchor="middle" fontFamily="Anton" fontSize="26" fill={S}>{label}</text>
  </svg>
);

export const Padlock: React.FC<IP & {open?: number; color?: string}> = ({size = 300, style, open = 0, color = C.yellow}) => (
  <svg width={size} height={size} viewBox="0 0 300 300" style={{overflow: 'visible', ...style}}>
    <g transform={`translate(0 ${-open * 58}) rotate(${-open * 10} 90 140)`}>
      <path d="M90 140 L90 100 A60 60 0 0 1 210 100 L210 140" fill="none" stroke={S} strokeWidth="22" strokeLinecap="round" />
      <path d="M90 140 L90 100 A60 60 0 0 1 210 100 L210 140" fill="none" stroke="#C9C4BA" strokeWidth="10" strokeLinecap="round" />
    </g>
    <rect x="60" y="136" width="180" height="140" rx="18" fill={color} stroke={S} strokeWidth={SW} />
    <circle cx="150" cy="196" r="16" fill={S} />
    <rect x="143" y="200" width="14" height="40" rx="6" fill={S} />
  </svg>
);

export const Helicopter: React.FC<IP & {spin?: number}> = ({size = 300, style, spin = 0}) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 300 180" style={style}>
    <rect x={150 - 120 * Math.abs(Math.cos(spin))} y="22" width={240 * Math.abs(Math.cos(spin))} height="8" rx="4" fill={S} />
    <rect x="146" y="26" width="8" height="26" fill={S} />
    <path d="M90 60 Q150 44 190 60 L200 110 Q150 126 96 112 Q70 96 90 60 Z" fill={S} />
    <path d="M110 66 Q140 58 168 64 L170 88 L112 90 Z" fill={C.celeste} />
    <path d="M196 78 L286 70 L286 82 L200 96 Z" fill={S} />
    <rect x="276" y="52" width="8" height="40" rx="4" fill={S} transform={`rotate(${spin * 57} 280 72)`} />
    <path d="M86 130 L214 130" stroke={S} strokeWidth="6" strokeLinecap="round" />
    <path d="M114 114 L106 130 M184 112 L192 130" stroke={S} strokeWidth="5" />
  </svg>
);

export const Printer: React.FC<IP & {phase?: number}> = ({size = 300, style}) => (
  <svg width={size} height={size} viewBox="0 0 300 300" style={style}>
    <rect x="40" y="90" width="220" height="120" rx="12" fill="#D8D2C6" stroke={S} strokeWidth={SW} />
    <rect x="70" y="60" width="160" height="40" rx="8" fill="#BDB6A8" stroke={S} strokeWidth={SW} />
    <circle cx="100" cy="150" r="24" fill="#fff" stroke={S} strokeWidth="5" />
    <circle cx="200" cy="150" r="24" fill="#fff" stroke={S} strokeWidth="5" />
    <rect x="70" y="200" width="160" height="16" fill={S} />
    <rect x="232" y="104" width="16" height="16" rx="8" fill={C.red} />
    <text x="150" y="118" textAnchor="middle" fontFamily="Anton" fontSize="20" fill={S}>CASA DE MONEDA</text>
  </svg>
);

export const Calendar: React.FC<IP & {day: string; month: string; year?: string}> = ({size = 300, style, day, month, year}) => (
  <svg width={size} height={size} viewBox="0 0 300 300" style={style}>
    <rect x="40" y="50" width="220" height="220" rx="16" fill="#fff" stroke={S} strokeWidth={SW} />
    <path d="M40 66 Q40 50 56 50 L244 50 Q260 50 260 66 L260 110 L40 110 Z" fill={C.red} stroke={S} strokeWidth={SW} />
    <text x="150" y="96" textAnchor="middle" fontFamily="Inter" fontWeight="900" fontSize="34" fill="#fff" letterSpacing="3">{month}</text>
    <text x="150" y="222" textAnchor="middle" fontFamily="Anton" fontSize="118" fill={S}>{day}</text>
    {year ? <text x="150" y="256" textAnchor="middle" fontFamily="Inter" fontWeight="800" fontSize="22" fill={C.gray}>{year}</text> : null}
    <rect x="86" y="30" width="16" height="44" rx="8" fill={S} />
    <rect x="198" y="30" width="16" height="44" rx="8" fill={S} />
  </svg>
);

export const Fence: React.FC<IP & {p?: number}> = ({size = 400, style, p = 1}) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 400 240" style={style}>
    {Array.from({length: 9}).map((_, i) => {
      const k = Math.min(1, Math.max(0, p * 9 - i));
      return <rect key={i} x={20 + i * 44} y={240 - 220 * k} width="26" height={220 * k} fill="#B07A45" stroke={S} strokeWidth="5" />;
    })}
    <rect x="0" y="70" width={400 * p} height="22" fill="#9A6634" stroke={S} strokeWidth="5" />
    <rect x="0" y="160" width={400 * p} height="22" fill="#9A6634" stroke={S} strokeWidth="5" />
  </svg>
);

export const Person: React.FC<{size?: number; color?: string; style?: React.CSSProperties}> = ({size = 60, color = S, style}) => (
  <svg width={size} height={size * 1.6} viewBox="0 0 60 96" style={style}>
    <circle cx="30" cy="16" r="13" fill={color} />
    <path d="M10 94 L10 50 Q10 34 30 34 Q50 34 50 50 L50 94 Z" fill={color} />
  </svg>
);

export const PriceTag: React.FC<{w?: number; text: string; color?: string}> = ({w = 360, text, color = C.yellow}) => (
  <svg width={w} height={w * 0.5} viewBox="0 0 360 180" style={{overflow: 'visible', filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.25))'}}>
    <path d="M60 10 L340 10 Q350 10 350 20 L350 160 Q350 170 340 170 L60 170 L10 90 Z" fill={color} stroke={S} strokeWidth={SW} strokeLinejoin="round" />
    <circle cx="56" cy="90" r="12" fill="#fff" stroke={S} strokeWidth="5" />
    <text x="205" y="118" textAnchor="middle" fontFamily="Anton" fontSize="84" fill={S}>{text}</text>
  </svg>
);

export const Scale: React.FC<IP & {tilt?: number; left?: React.ReactNode; right?: React.ReactNode}> = ({size = 800, tilt = 0}) => {
  const a = tilt * 12;
  const dy = Math.sin((a * Math.PI) / 180) * 250;
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 800 480" style={{overflow: 'visible'}}>
      <path d="M400 70 L400 430" stroke={S} strokeWidth="14" />
      <path d="M300 440 L500 440" stroke={S} strokeWidth="18" strokeLinecap="round" />
      <circle cx="400" cy="70" r="16" fill={S} />
      <g transform={`rotate(${a} 400 70)`}>
        <path d="M150 70 L650 70" stroke={S} strokeWidth="12" strokeLinecap="round" />
      </g>
      <g transform={`translate(0 ${-dy})`}>
        <path d="M150 70 L90 250 M150 70 L210 250" stroke={S} strokeWidth="4" />
        <path d="M70 250 L230 250 Q150 300 70 250 Z" fill={S} />
      </g>
      <g transform={`translate(0 ${dy})`}>
        <path d="M650 70 L590 250 M650 70 L710 250" stroke={S} strokeWidth="4" />
        <path d="M570 250 L730 250 Q650 300 570 250 Z" fill={S} />
      </g>
    </svg>
  );
};

export const Bubble: React.FC<IP> = ({size = 200, style}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={style}>
    <path d="M30 40 Q30 20 50 20 L160 20 Q180 20 180 40 L180 120 Q180 140 160 140 L90 140 L50 180 L56 140 L50 140 Q30 140 30 120 Z" fill="#fff" stroke={S} strokeWidth={SW} strokeLinejoin="round" />
    {[70, 105, 140].map((x) => <circle key={x} cx={x} cy="80" r="10" fill={S} />)}
  </svg>
);

export const Bell: React.FC<IP & {swing?: number}> = ({size = 120, style, swing = 0}) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={style}>
    <g transform={`rotate(${swing} 60 16)`}>
      <path d="M60 14 Q92 14 92 54 L92 78 L102 92 L18 92 L28 78 L28 54 Q28 14 60 14 Z" fill={C.yellow} stroke={S} strokeWidth="6" strokeLinejoin="round" />
      <circle cx="60" cy="102" r="10" fill={S} />
    </g>
  </svg>
);

export const Vault: React.FC<IP & {spin?: number}> = ({size = 420, style, spin = 0}) => (
  <svg width={size} height={size} viewBox="0 0 420 420" style={style}>
    <circle cx="210" cy="210" r="190" fill="#3A3F46" stroke="#111" strokeWidth="10" />
    <circle cx="210" cy="210" r="150" fill="#555C66" stroke="#111" strokeWidth="8" />
    {Array.from({length: 12}).map((_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return <circle key={i} cx={210 + Math.cos(a) * 172} cy={210 + Math.sin(a) * 172} r="8" fill="#9aa1ab" />;
    })}
    <g transform={`rotate(${spin} 210 210)`}>
      <circle cx="210" cy="210" r="46" fill="#9aa1ab" stroke="#111" strokeWidth="8" />
      {[0, 60, 120].map((r) => <rect key={r} x="202" y="96" width="16" height="228" rx="8" fill="#C7CCD3" stroke="#111" strokeWidth="5" transform={`rotate(${r} 210 210)`} />)}
    </g>
  </svg>
);

export const Boat: React.FC<IP> = ({size = 260, style}) => (
  <svg width={size} height={size * 0.5} viewBox="0 0 260 130" style={style}>
    <path d="M20 60 Q20 110 70 110 L200 110 Q246 110 246 66 Z" fill="#E86A2C" stroke={S} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M30 66 L236 66" stroke={S} strokeWidth="5" />
    <circle cx="110" cy="46" r="14" fill={S} />
    <path d="M96 66 Q110 50 124 66" fill={S} />
    <path d="M150 40 L196 96" stroke="#8C6A4A" strokeWidth="8" strokeLinecap="round" />
  </svg>
);

export const Note: React.FC<{w?: number; text: string; p?: number}> = ({w = 620, text, p = 1}) => {
  const shown = text.slice(0, Math.round(text.length * p));
  return (
    <div style={{width: w, background: '#FFFDF4', padding: '36px 44px', transform: 'rotate(-3deg)', boxShadow: '0 16px 30px rgba(0,0,0,0.4)', backgroundImage: 'repeating-linear-gradient(180deg, rgba(0,0,0,0) 0 46px, rgba(47,111,168,0.25) 46px 48px)'}}>
      <div style={{fontFamily: F.script, fontSize: 50, lineHeight: '48px', color: '#1d2a5a', fontWeight: 700, minHeight: 48 * 4}}>{shown}</div>
    </div>
  );
};
