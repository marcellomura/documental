/* Composición del episodio 14 (CAMPO DEL CIELO). Las escenas se solapan en cada corte y se cruzan con transiciones
   propias: "bólido" (una estela incandescente barre la pantalla en diagonal), "tinta" (el pergamino se abre en un
   círculo con borde de tinta), disolvencia con desenfoque, destello y corte seco. */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {TL, TITLE} from './lib';
import {Grain} from '../components/base';
import {Bug} from '../ep04/kit';
import {K, Defs14, clamp, easeInOut, easeOut} from './kit14';
import {S01, Titulo, S02, S03, S04} from './scenes14a';
import {S05, S06, S07, S08, S09, EndCard14} from './scenes14b';

const st = TL.starts;
const FPS = TL.fps;
type Trans = 'cut' | 'streak' | 'ink' | 'flash' | 'dissolve';
type SceneDef = {id: string; from: number; to: number; base: number; el: (t: number) => React.ReactNode; tr: Trans; d: number};
const SCENES: SceneDef[] = [
  {id: 's01', from: 0, to: TITLE, base: st.s01, el: (t) => <S01 t={t} />, tr: 'cut', d: 0},
  {id: 'tit', from: TITLE, to: st.s02 - 0.4, base: TITLE, el: (t) => <Titulo t={t} />, tr: 'cut', d: 0},
  {id: 's02', from: st.s02 - 0.4, to: st.s03 - 0.45, base: st.s02, el: (t) => <S02 t={t} />, tr: 'dissolve', d: 0.8},
  {id: 's03', from: st.s03 - 0.45, to: st.s04 - 0.4, base: st.s03, el: (t) => <S03 t={t} />, tr: 'ink', d: 1.0},
  {id: 's04', from: st.s04 - 0.4, to: st.s05 - 0.3, base: st.s04, el: (t) => <S04 t={t} />, tr: 'dissolve', d: 0.9},
  {id: 's05', from: st.s05 - 0.3, to: st.s06 - 0.3, base: st.s05, el: (t) => <S05 t={t} />, tr: 'dissolve', d: 0.6},
  {id: 's06', from: st.s06 - 0.3, to: st.s07 - 0.3, base: st.s06, el: (t) => <S06 t={t} />, tr: 'streak', d: 0.8},
  {id: 's07', from: st.s07 - 0.3, to: st.s08 - 0.3, base: st.s07, el: (t) => <S07 t={t} />, tr: 'dissolve', d: 0.8},
  {id: 's08', from: st.s08 - 0.3, to: st.s09 - 0.45, base: st.s08, el: (t) => <S08 t={t} />, tr: 'streak', d: 0.8},
  {id: 's09', from: st.s09 - 0.45, to: TL.end, base: st.s09, el: (t) => <S09 t={t} />, tr: 'dissolve', d: 1.0},
  {id: 'end', from: TL.end, to: TL.total + 1, base: TL.end, el: (t) => <EndCard14 t={t} total={TL.total - TL.end} />, tr: 'dissolve', d: 1.0},
];
export const SCENES14 = SCENES.map((s) => ({id: s.id, from: s.from, to: s.to, tr: s.tr}));

// la estela del bólido: diagonal de abajo a la izquierda hacia arriba a la derecha
const streakEdge = (e: number) => -600 + e * 3120; // posición x del borde en la línea media
const enterStyle = (tr: Trans, p: number): React.CSSProperties => {
  const e = easeInOut(clamp(p));
  switch (tr) {
    case 'streak': {
      const x = streakEdge(e);
      return {clipPath: `polygon(0 0, ${x + 300}px 0, ${x - 300}px 1080px, 0 1080px)`};
    }
    case 'ink':
      return {clipPath: `circle(${e * 1250}px at 38% 52%)`};
    case 'dissolve':
      return {opacity: easeOut(clamp(p)), transform: `scale(${1.04 - 0.04 * e})`, filter: `blur(${(1 - e) * 8}px)`};
    case 'flash':
      return {opacity: p >= 0.5 ? 1 : 0};
    default:
      return {};
  }
};

export const Cielo: React.FC = () => {
  const frame = useCurrentFrame();
  const T = frame / FPS;
  const endBug = TL.end - 0.6;
  const bug = T > st.s02 && T < endBug ? Math.min(1, (T - st.s02) / 0.6, (endBug - T) / 0.4) : 0;
  const nodes: React.ReactNode[] = [];
  const overlays: React.ReactNode[] = [];
  SCENES.forEach((sc, i) => {
    const next = SCENES[i + 1];
    const a = sc.from - sc.d / 2, b = next ? sc.to + next.d / 2 : sc.to;
    if (T < a || T >= b) return;
    let style: React.CSSProperties = {};
    if (sc.d > 0 && T < sc.from + sc.d / 2) style = {...style, ...enterStyle(sc.tr, (T - a) / sc.d)};
    nodes.push(
      <AbsoluteFill key={sc.id} style={{isolation: 'isolate', overflow: 'hidden', ...style}}>
        {sc.el(T - sc.base)}
      </AbsoluteFill>,
    );
    if (sc.d > 0 && T >= a && T < sc.from + sc.d / 2) {
      const p = (T - a) / sc.d;
      const e = easeInOut(clamp(p));
      if (sc.tr === 'streak') {
        const x = streakEdge(e);
        overlays.push(
          <svg key={'s' + sc.id} width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
            <defs>
              <linearGradient id={'sg' + sc.id} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#FF6A1A" stopOpacity={0} />
                <stop offset="0.5" stopColor="#FFF2D8" stopOpacity={0.95} />
                <stop offset="1" stopColor="#FF6A1A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <polygon points={`${x + 260},0 ${x + 340},0 ${x - 260},1080 ${x - 340},1080`} fill={`url(#sg${sc.id})`} style={{filter: 'blur(6px)'}} />
            <line x1={x + 300} y1={0} x2={x - 300} y2={1080} stroke="#FFF6E2" strokeWidth={4} />
          </svg>,
        );
      }
      if (sc.tr === 'ink') {
        overlays.push(
          <svg key={'i' + sc.id} width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
            <circle cx={1920 * 0.38} cy={1080 * 0.52} r={e * 1250} fill="none" stroke="#2A2016" strokeWidth={30 * (1 - p) + 4} opacity={0.85 * (1 - p * 0.7)} style={{filter: 'url(#quill14)'}} />
          </svg>,
        );
      }
      if (sc.tr === 'flash') overlays.push(<AbsoluteFill key={'f' + sc.id} style={{background: '#FFF2D8', opacity: Math.max(0, 1 - Math.abs(p - 0.5) * 2.2), pointerEvents: 'none'}} />);
    }
  });
  return (
    <AbsoluteFill style={{background: K.void}}>
      <Defs14 />
      {nodes}
      {overlays}
      <Bug o={bug} />
      <Grain opacity={0.04} />
    </AbsoluteFill>
  );
};
