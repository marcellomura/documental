/* Composición del episodio 12 (ARA San Juan). Las escenas se solapan en cada corte y se cruzan con
   transiciones propias del episodio: "ping" de sonar (revelado circular con anillo), descenso (empuje vertical
   con desenfoque de movimiento), barrido (whip horizontal), destello y disolvencia. */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {TL} from './lib';
import {Grain} from '../components/base';
import {Bug} from '../ep04/kit';
import {K, Defs12, clamp, easeInOut, easeIn, easeOut} from './kit12';
import {S01, S02, S03, S04, S05} from './scenes12a';
import {S06, S07, S08, S09, S10, Names, EndCard12} from './scenes12b';

const st = TL.starts;
const FPS = TL.fps;
const cut = (id: string, pre = 0.3) => st[id] - pre;
const NAMES_DUR = 19.0;

type Trans = 'cut' | 'ping' | 'push' | 'whip' | 'flash' | 'dissolve';
type SceneDef = {id: string; from: number; to: number; base: number; el: (t: number) => React.ReactNode; tr: Trans; d: number};
const S01_END = cut('s02', 0.35);
const SCENES: SceneDef[] = [
  {id: 's01', from: 0, to: S01_END, base: st.s01, el: (t) => <S01 t={t} dur={TL.durations.s01} titleEnd={S01_END - st.s01} />, tr: 'cut', d: 0},
  {id: 's02', from: S01_END, to: cut('s03', 0.35), base: st.s02, el: (t) => <S02 t={t} />, tr: 'ping', d: 0.8},
  {id: 's03', from: cut('s03', 0.35), to: cut('s04', 0.6), base: st.s03, el: (t) => <S03 t={t} />, tr: 'push', d: 0.7},
  {id: 's04', from: cut('s04', 0.6), to: cut('s05', 0.35), base: st.s04, el: (t) => <S04 t={t} />, tr: 'dissolve', d: 0.9},
  {id: 's05', from: cut('s05', 0.35), to: cut('s06', 0.35), base: st.s05, el: (t) => <S05 t={t} />, tr: 'ping', d: 0.8},
  {id: 's06', from: cut('s06', 0.35), to: cut('s07', 0.5), base: st.s06, el: (t) => <S06 t={t} />, tr: 'whip', d: 0.55},
  {id: 's07', from: cut('s07', 0.5), to: cut('s08', 0.35), base: st.s07, el: (t) => <S07 t={t} />, tr: 'dissolve', d: 1.0},
  {id: 's08', from: cut('s08', 0.35), to: cut('s09', 0.25), base: st.s08, el: (t) => <S08 t={t} />, tr: 'push', d: 0.7},
  {id: 's09', from: cut('s09', 0.25), to: cut('s10', 0.5), base: st.s09, el: (t) => <S09 t={t} />, tr: 'flash', d: 0.45},
  {id: 's10', from: cut('s10', 0.5), to: TL.names, base: st.s10, el: (t) => <S10 t={t} />, tr: 'dissolve', d: 1.0},
  {id: 'names', from: TL.names, to: TL.names + NAMES_DUR, base: TL.names, el: (t) => <Names t={t} dur={NAMES_DUR + 0.6} />, tr: 'dissolve', d: 1.2},
  {id: 'end', from: TL.names + NAMES_DUR, to: TL.total + 1, base: TL.names + NAMES_DUR, el: (t) => <EndCard12 t={t} total={TL.total - TL.names - NAMES_DUR} />, tr: 'dissolve', d: 0.8},
];
export const CUTS12 = SCENES.slice(1).map((s) => s.from);
export const SCENES12 = SCENES.map((s) => ({id: s.id, from: s.from, to: s.to, tr: s.tr}));

/** estilo de entrada (p 0→1) */
const enterStyle = (tr: Trans, p: number): React.CSSProperties => {
  const e = easeInOut(clamp(p));
  switch (tr) {
    case 'ping':
      return {clipPath: `circle(${e * 1250}px at 50% 50%)`};
    case 'push':
      return {transform: `translateY(${(1 - e) * 100}%)`, filter: `blur(${Math.sin(clamp(p) * Math.PI) * 10}px)`};
    case 'whip':
      return {transform: `translateX(${(1 - e) * 100}%)`, filter: `blur(${Math.sin(clamp(p) * Math.PI) * 16}px)`};
    case 'dissolve':
      return {opacity: easeOut(clamp(p)), transform: `scale(${1.04 - 0.04 * e})`, filter: `blur(${(1 - e) * 8}px)`};
    case 'flash':
      return {opacity: p >= 0.5 ? 1 : 0};
    default:
      return {};
  }
};
/** estilo de salida de la escena anterior según la transición de la siguiente */
const exitStyle = (tr: Trans, p: number): React.CSSProperties => {
  const e = easeInOut(clamp(p));
  switch (tr) {
    case 'push':
      return {transform: `translateY(${-e * 100}%)`, filter: `blur(${Math.sin(clamp(p) * Math.PI) * 10}px)`};
    case 'whip':
      return {transform: `translateX(${-e * 100}%)`, filter: `blur(${Math.sin(clamp(p) * Math.PI) * 16}px)`};
    case 'ping':
      return {transform: `scale(${1 + e * 0.06})`, filter: `brightness(${1 - e * 0.5})`};
    default:
      return {};
  }
};

export const SanJuan: React.FC = () => {
  const frame = useCurrentFrame();
  const T = frame / FPS;
  const endBug = TL.names - 0.6;
  const bug = T > st.s02 && T < endBug ? Math.min(1, (T - st.s02) / 0.6, (endBug - T) / 0.4) : 0;
  const nodes: React.ReactNode[] = [];
  const overlays: React.ReactNode[] = [];
  SCENES.forEach((sc, i) => {
    const next = SCENES[i + 1];
    const a = sc.from - sc.d / 2, b = next ? sc.to + next.d / 2 : sc.to;
    if (T < a || T >= b) return;
    let style: React.CSSProperties = {};
    if (sc.d > 0 && T < sc.from + sc.d / 2) style = {...style, ...enterStyle(sc.tr, (T - a) / sc.d)};
    if (next && next.d > 0 && T > sc.to - next.d / 2) style = {...style, ...exitStyle(next.tr, (T - (sc.to - next.d / 2)) / next.d)};
    nodes.push(
      <AbsoluteFill key={sc.id} style={{isolation: 'isolate', overflow: 'hidden', ...style}}>
        {sc.el(T - sc.base)}
      </AbsoluteFill>,
    );
    // adornos de la transición de entrada
    if (sc.d > 0 && T >= a && T < sc.from + sc.d / 2) {
      const p = (T - a) / sc.d;
      if (sc.tr === 'ping') {
        const r = easeInOut(clamp(p)) * 1250;
        overlays.push(
          <svg key={'p' + sc.id} width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
            <circle cx={960} cy={540} r={r} fill="none" stroke={K.cyan} strokeWidth={10 * (1 - p) + 2} opacity={1 - p * 0.6} />
            <circle cx={960} cy={540} r={r * 0.82} fill="none" stroke={K.cyan} strokeWidth={2} opacity={(1 - p) * 0.5} />
          </svg>,
        );
      }
      if (sc.tr === 'flash') {
        overlays.push(<AbsoluteFill key={'f' + sc.id} style={{background: '#EAF6FF', opacity: Math.max(0, 1 - Math.abs(p - 0.5) * 2.2), pointerEvents: 'none'}} />);
      }
    }
  });
  return (
    <AbsoluteFill style={{background: K.abyss}}>
      <Defs12 />
      {nodes}
      {overlays}
      <Bug o={bug} />
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};
export {easeIn};
