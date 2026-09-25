import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {TL} from './lib';
import {Grain} from '../components/base';
import {Bug, Flash, Iris, N, WaveWipe} from './kit';
import {S01, S02, S03, S04} from './scenes4a';
import {S05, S06, S07, S08, S09, S10} from './scenes4b';
import {cue} from './lib';

const st = TL.starts;
const FPS = TL.fps;
const cut = (id: string, pre = 0.3) => st[id] - pre;

type Tr = {kind: 'wave'; colors: [string, string, string]} | {kind: 'iris'; x?: number; y?: number} | {kind: 'flash'};
type SceneDef = {id: string; from: number; to: number; el: (t: number) => React.ReactNode; tr?: Tr};
const SCENES: SceneDef[] = [
  {id: 's01', from: 0, to: cut('s02'), el: (t) => <S01 t={t} />},
  {id: 's02', from: cut('s02'), to: cut('s03'), el: (t) => <S02 t={t} />, tr: {kind: 'wave', colors: [N.yellow, N.deep, N.bg1]}},
  {id: 's03', from: cut('s03'), to: cut('s04', 0), el: (t) => <S03 t={t} dur={cut('s04', 0) - st.s03} />, tr: {kind: 'wave', colors: [N.teal, N.deep, N.bg1]}},
  {id: 's04', from: cut('s04', 0), to: cut('s05', 0.6), el: (t) => <S04 t={t} />},
  {id: 's05', from: cut('s05', 0.6), to: cut('s06', 0.5), el: (t) => <S05 t={t} />, tr: {kind: 'wave', colors: [N.yellow, N.hot, N.bg0]}},
  {id: 's06', from: cut('s06', 0.5), to: cut('s07', 0), el: (t) => <S06 t={t} dur={cut('s07', 0) - st.s06} />, tr: {kind: 'iris'}},
  {id: 's07', from: cut('s07', 0), to: cut('s08', 0.45), el: (t) => <S07 t={t} />},
  {id: 's08', from: cut('s08', 0.45), to: cut('s09', 0.6), el: (t) => <S08 t={t} />, tr: {kind: 'wave', colors: [N.teal, N.deep, N.bg1]}},
  {id: 's09', from: cut('s09', 0.6), to: cut('s10', 0.5), el: (t) => <S09 t={t} />, tr: {kind: 'wave', colors: [N.amber, N.hot, N.bg0]}},
  {id: 's10', from: cut('s10', 0.5), to: TL.total + 1, el: (t) => <S10 t={t} total={TL.total - st.s10} />, tr: {kind: 'iris', x: 1460, y: 420}},
];
const END_CARD = st.s10 + cue('s10', 'Si te') - 0.4;

export const SuperNino: React.FC = () => {
  const frame = useCurrentFrame();
  const T = frame / FPS;
  const bug = T > st.s02 && T < END_CARD ? Math.min(1, (T - st.s02) / 0.6, (END_CARD - T) / 0.4) : 0;
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      {SCENES.map((sc) => (T >= sc.from && T < sc.to ? <AbsoluteFill key={sc.id} style={{isolation: 'isolate'}}>{sc.el(T - st[sc.id])}</AbsoluteFill> : null))}
      <Bug o={bug} />
      {SCENES.filter((s) => s.tr).map((sc) => {
        const tr = sc.tr!;
        if (tr.kind === 'wave') return <WaveWipe key={'w' + sc.id} t={T} at={sc.from} colors={tr.colors} />;
        if (tr.kind === 'iris') return <Iris key={'w' + sc.id} t={T} at={sc.from} x={tr.x} y={tr.y} />;
        return <Flash key={'w' + sc.id} t={T} at={sc.from} />;
      })}
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};
