import React from 'react';
import {C} from '../theme';

/* Íconos del short del dólar barato: trazo negro, estilo plano como components/art.tsx */
const S = C.ink;
const SW = 7;
type IP = {size?: number; style?: React.CSSProperties};

export const Plane: React.FC<IP> = ({size = 160, style}) => (
  <svg width={size} height={size} viewBox="0 0 160 160" style={style}>
    <path d="M20 88 L64 80 L100 30 Q108 20 116 26 Q122 32 114 42 L92 84 L138 112 L130 124 L84 104 L70 128 L78 142 L68 146 L54 122 L28 110 Z" fill={C.celeste} stroke={S} strokeWidth={SW} strokeLinejoin="round" />
  </svg>
);

export const Box: React.FC<IP> = ({size = 160, style}) => (
  <svg width={size} height={size} viewBox="0 0 160 160" style={style}>
    <path d="M20 50 L80 24 L140 50 L140 118 L80 144 L20 118 Z" fill="#D9B98A" stroke={S} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M20 50 L80 76 L140 50 M80 76 L80 144" fill="none" stroke={S} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M50 37 L110 63" stroke={S} strokeWidth="5" />
    <text x="112" y="112" textAnchor="middle" fontFamily="Anton" fontSize="26" fill={S} transform="rotate(-22 112 104)">USA</text>
  </svg>
);

export const Wheat: React.FC<IP> = ({size = 160, style}) => (
  <svg width={size} height={size} viewBox="0 0 160 160" style={style}>
    <path d="M80 150 L80 40" stroke={S} strokeWidth={SW} strokeLinecap="round" />
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <ellipse cx="64" cy={112 - i * 22} rx="11" ry="20" fill={C.yellow} stroke={S} strokeWidth="5" transform={`rotate(-35 64 ${112 - i * 22})`} />
        <ellipse cx="96" cy={112 - i * 22} rx="11" ry="20" fill={C.yellow} stroke={S} strokeWidth="5" transform={`rotate(35 96 ${112 - i * 22})`} />
      </g>
    ))}
    <ellipse cx="80" cy="30" rx="11" ry="20" fill={C.yellow} stroke={S} strokeWidth="5" />
  </svg>
);

export const Factory: React.FC<IP> = ({size = 160, style}) => (
  <svg width={size} height={size} viewBox="0 0 160 160" style={style}>
    <path d="M14 146 L14 80 L50 100 L50 80 L86 100 L86 80 L112 94 L112 24 L136 24 L136 146 Z" fill="#fff" stroke={S} strokeWidth={SW} strokeLinejoin="round" />
    <rect x="30" y="116" width="18" height="18" fill={C.celeste} stroke={S} strokeWidth="4" />
    <rect x="64" y="116" width="18" height="18" fill={C.celeste} stroke={S} strokeWidth="4" />
  </svg>
);

export const Suitcase: React.FC<IP> = ({size = 160, style}) => (
  <svg width={size} height={size} viewBox="0 0 160 160" style={style}>
    <rect x="22" y="50" width="116" height="90" rx="12" fill={C.red} stroke={S} strokeWidth={SW} />
    <path d="M58 50 L58 30 Q58 22 66 22 L94 22 Q102 22 102 30 L102 50" fill="none" stroke={S} strokeWidth={SW} />
    <path d="M48 50 L48 140 M112 50 L112 140" stroke={S} strokeWidth="5" />
    <text x="80" y="108" textAnchor="middle" fontFamily="Anton" fontSize="30" fill="#fff">AR</text>
  </svg>
);

export const Derrick: React.FC<IP> = ({size = 160, style}) => (
  <svg width={size} height={size} viewBox="0 0 160 160" style={style}>
    <path d="M20 146 L140 146" stroke={S} strokeWidth={SW} strokeLinecap="round" />
    <path d="M52 146 L80 40 L108 146 M62 110 L98 110 M70 78 L90 78" fill="none" stroke={S} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M30 60 L130 40" stroke={S} strokeWidth="10" strokeLinecap="round" />
    <path d="M124 42 Q144 50 134 70" fill="none" stroke={S} strokeWidth="6" />
    <circle cx="80" cy="50" r="9" fill={C.yellow} stroke={S} strokeWidth="5" />
    <path d="M134 74 Q128 90 134 96 Q140 90 134 74 Z" fill={S} />
  </svg>
);

export const Pick: React.FC<IP> = ({size = 160, style}) => (
  <svg width={size} height={size} viewBox="0 0 160 160" style={style}>
    <path d="M44 140 L110 52" stroke="#8a5a2b" strokeWidth="14" strokeLinecap="round" />
    <path d="M44 140 L110 52" stroke={S} strokeWidth="4" strokeLinecap="round" fill="none" />
    <path d="M60 36 Q112 22 146 70 Q108 46 84 58 Z" fill="#B8BCC2" stroke={S} strokeWidth="6" strokeLinejoin="round" />
    <path d="M14 128 L40 110 L58 132 L30 150 Z" fill="#C9A227" stroke={S} strokeWidth="5" strokeLinejoin="round" />
  </svg>
);

export const Gift: React.FC<IP & {open?: number}> = ({size = 300, style, open = 0}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{overflow: 'visible', ...style}}>
    <rect x="30" y="90" width="140" height="100" rx="6" fill={C.celeste} stroke={S} strokeWidth={SW} />
    <rect x="88" y="90" width="24" height="100" fill={C.yellow} stroke={S} strokeWidth="5" />
    <g transform={`translate(0 ${-open * 40}) rotate(${-open * 18} 30 90)`}>
      <rect x="20" y="62" width="160" height="32" rx="6" fill={C.celeste} stroke={S} strokeWidth={SW} />
      <rect x="88" y="62" width="24" height="32" fill={C.yellow} stroke={S} strokeWidth="5" />
      <path d="M100 62 Q60 20 58 48 Q58 64 100 62 Q140 64 142 48 Q140 20 100 62 Z" fill={C.yellow} stroke={S} strokeWidth="6" strokeLinejoin="round" />
    </g>
  </svg>
);

export const Bomb: React.FC<IP & {t?: number}> = ({size = 300, style, t = 0}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{overflow: 'visible', ...style}}>
    <circle cx="92" cy="120" r="66" fill={S} />
    <circle cx="70" cy="98" r="14" fill="#fff" opacity="0.35" />
    <rect x="112" y="46" width="34" height="26" rx="4" fill="#444" stroke={S} strokeWidth="4" transform="rotate(35 129 59)" />
    <path d="M142 44 Q156 20 176 26" fill="none" stroke="#8a6b3a" strokeWidth="6" strokeLinecap="round" />
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const a = (i / 6) * Math.PI * 2 + t * 9;
      const r = 14 + 6 * Math.sin(t * 30 + i);
      return <path key={i} d={`M176 26 L${176 + Math.cos(a) * r} ${26 + Math.sin(a) * r}`} stroke={i % 2 ? C.yellow : C.red} strokeWidth="5" strokeLinecap="round" />;
    })}
  </svg>
);

export const Gauge: React.FC<IP & {v: number}> = ({size = 360, style, v}) => {
  const a = -120 + v * 240;
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 240 180" style={style}>
      <path d="M30 150 A90 90 0 0 1 90 66" fill="none" stroke={C.green} strokeWidth="22" />
      <path d="M90 66 A90 90 0 0 1 170 70" fill="none" stroke={C.yellow} strokeWidth="22" />
      <path d="M170 70 A90 90 0 0 1 210 150" fill="none" stroke={C.red} strokeWidth="22" />
      <path d="M30 150 A90 90 0 0 1 210 150" fill="none" stroke={S} strokeWidth="5" />
      <g transform={`rotate(${a} 120 150)`}>
        <path d="M120 150 L120 70" stroke={S} strokeWidth="9" strokeLinecap="round" />
      </g>
      <circle cx="120" cy="150" r="14" fill={S} />
    </svg>
  );
};

export const Arrow: React.FC<{size?: number; color: string; up?: boolean}> = ({size = 200, color, up = true}) => (
  <svg width={size * 0.7} height={size} viewBox="0 0 140 200" style={{transform: up ? undefined : 'scaleY(-1)'}}>
    <path d="M70 10 L130 90 L94 90 L94 190 L46 190 L46 90 L10 90 Z" fill={color} stroke={S} strokeWidth="7" strokeLinejoin="round" />
  </svg>
);
