/* Composición del episodio 13 (EL LOTE 31.202, edición especial). Las escenas se solapan en cada corte y se cruzan con
   transiciones propias: "feta" (una placa ámbar translúcida barre la pantalla), "iris" (apertura circular como un
   campo de microscopio), destello, disolvencia con desenfoque y corte seco. */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {TL, CARD_LEAD} from './lib';
import {Grain} from '../components/base';
import {Bug} from '../ep04/kit';
import {K, Defs13, clamp, easeInOut, easeOut} from './kit13';
import {S01, S02, S03, S04, S05, S06} from './scenes13a';
import {S07, S08, S09, S10, S11, S12, Memorial, EndCard13} from './scenes13b';

const st = TL.starts;
const FPS = TL.fps;
const cut = (id: string, pre = 0.3) => st[id] - pre;
const card = (id: string) => st[id] - CARD_LEAD[id] - 0.05;

type Trans = 'cut' | 'slice' | 'iris' | 'flash' | 'dissolve';
type SceneDef = {id: string; from: number; to: number; base: number; el: (t: number) => React.ReactNode; tr: Trans; d: number};
// las placas de barrera viven al final de la escena anterior (en el silencio): el corte va después de la placa
const SCENES: SceneDef[] = [
  {id: 's01', from: 0, to: cut('s02', 0.35), base: st.s01, el: (t) => <S01 t={t} />, tr: 'cut', d: 0},
  {id: 's02', from: cut('s02', 0.35), to: cut('s03', 0.3), base: st.s02, el: (t) => <S02 t={t} />, tr: 'dissolve', d: 0.9},
  {id: 's03', from: cut('s03', 0.3), to: card('s04'), base: st.s03, el: (t) => <S03 t={t} />, tr: 'slice', d: 0.8},
  {id: 's04', from: card('s04'), to: card('s05'), base: st.s04, el: (t) => <S04 t={t} />, tr: 'cut', d: 0},
  {id: 's05', from: card('s05'), to: card('s06'), base: st.s05, el: (t) => <S05 t={t} />, tr: 'cut', d: 0},
  {id: 's06', from: card('s06'), to: card('s07'), base: st.s06, el: (t) => <S06 t={t} />, tr: 'cut', d: 0},
  {id: 's07', from: card('s07'), to: card('s08'), base: st.s07, el: (t) => <S07 t={t} />, tr: 'cut', d: 0},
  {id: 's08', from: card('s08'), to: card('s09'), base: st.s08, el: (t) => <S08 t={t} />, tr: 'cut', d: 0},
  {id: 's09', from: card('s09'), to: cut('s10', 0.5), base: st.s09, el: (t) => <S09 t={t} />, tr: 'cut', d: 0},
  {id: 's10', from: cut('s10', 0.5), to: cut('s11', 0.4), base: st.s10, el: (t) => <S10 t={t} />, tr: 'iris', d: 1.0},
  {id: 's11', from: cut('s11', 0.4), to: cut('s12', 0.4), base: st.s11, el: (t) => <S11 t={t} />, tr: 'flash', d: 0.5},
  {id: 's12', from: cut('s12', 0.4), to: TL.memorial, base: st.s12, el: (t) => <S12 t={t} />, tr: 'dissolve', d: 1.0},
  {id: 'mem', from: TL.memorial, to: TL.end, base: TL.memorial, el: (t) => <Memorial t={t} dur={TL.end - TL.memorial} />, tr: 'dissolve', d: 1.2},
  {id: 'end', from: TL.end, to: TL.total + 1, base: TL.end, el: (t) => <EndCard13 t={t} total={TL.total - TL.end} />, tr: 'dissolve', d: 1.0},
];
export const CUTS13 = SCENES.slice(1).map((s) => s.from);
export const SCENES13 = SCENES.map((s) => ({id: s.id, from: s.from, to: s.to, tr: s.tr}));

const enterStyle = (tr: Trans, p: number): React.CSSProperties => {
  const e = easeInOut(clamp(p));
  switch (tr) {
    case 'slice':
      return {clipPath: `inset(0 0 0 ${(1 - e) * 100}%)`};
    case 'iris':
      return {clipPath: `circle(${e * 1150}px at 50% 50%)`};
    case 'dissolve':
      return {opacity: easeOut(clamp(p)), transform: `scale(${1.04 - 0.04 * e})`, filter: `blur(${(1 - e) * 8}px)`};
    case 'flash':
      return {opacity: p >= 0.5 ? 1 : 0};
    default:
      return {};
  }
};
const exitStyle = (tr: Trans, p: number): React.CSSProperties => {
  const e = easeInOut(clamp(p));
  switch (tr) {
    case 'slice':
      return {transform: `translateX(${-e * 18}%)`, filter: `brightness(${1 - e * 0.5})`};
    case 'iris':
      return {transform: `scale(${1 + e * 0.05})`, filter: `brightness(${1 - e * 0.6})`};
    default:
      return {};
  }
};

export const Lote: React.FC = () => {
  const frame = useCurrentFrame();
  const T = frame / FPS;
  const endBug = TL.memorial - 0.6;
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
    if (sc.d > 0 && T >= a && T < sc.from + sc.d / 2) {
      const p = (T - a) / sc.d;
      if (sc.tr === 'slice') {
        const e = easeInOut(clamp(p));
        overlays.push(
          <div key={'s' + sc.id} style={{position: 'absolute', top: 0, left: `${(1 - e) * 100}%`, width: 220, height: 1080, transform: 'translateX(-50%)', background: 'linear-gradient(90deg, rgba(242,193,78,0) 0%, rgba(242,193,78,0.55) 45%, rgba(255,240,200,0.9) 50%, rgba(242,193,78,0.55) 55%, rgba(242,193,78,0) 100%)', pointerEvents: 'none'}} />,
        );
      }
      if (sc.tr === 'iris') {
        const r = easeInOut(clamp(p)) * 1150;
        overlays.push(
          <svg key={'i' + sc.id} width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
            <circle cx={960} cy={540} r={r} fill="none" stroke={K.teal} strokeWidth={8 * (1 - p) + 2} opacity={1 - p * 0.6} />
          </svg>,
        );
      }
      if (sc.tr === 'flash') {
        overlays.push(<AbsoluteFill key={'f' + sc.id} style={{background: '#FFF4F2', opacity: Math.max(0, 1 - Math.abs(p - 0.5) * 2.2), pointerEvents: 'none'}} />);
      }
    }
  });
  return (
    <AbsoluteFill style={{background: K.void}}>
      <Defs13 />
      {nodes}
      {overlays}
      <Bug o={bug} />
      <Grain opacity={0.045} />
    </AbsoluteFill>
  );
};
