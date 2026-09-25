import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {TL} from './lib';
import {Grain, SvgDefs, Wipe} from '../components/base';
import {S01, S02, S03, S04, S05} from './scenes3a';
import {S06, S07, S08, S09, S10} from './scenes3b';

const st = TL.starts;
const FPS = TL.fps;
const cut = (id: string, pre = 0.3) => st[id] - pre;

type SceneDef = {id: string; from: number; to: number; el: (t: number) => React.ReactNode; wipe?: string};
const SCENES: SceneDef[] = [
  {id: 's01', from: 0, to: cut('s02'), el: (t) => <S01 t={t} />},
  {id: 's02', from: cut('s02'), to: cut('s03'), el: (t) => <S02 t={t} />, wipe: C.yellow},
  {id: 's03', from: cut('s03'), to: cut('s04'), el: (t) => <S03 t={t} />, wipe: C.celeste},
  {id: 's04', from: cut('s04'), to: cut('s05', 0.95), el: (t) => <S04 t={t} />, wipe: C.yellow},
  {id: 's05', from: cut('s05', 0.95), to: cut('s06', 0.95), el: (t) => <S05 t={t} />},
  {id: 's06', from: cut('s06', 0.95), to: cut('s07', 0.95), el: (t) => <S06 t={t} />},
  {id: 's07', from: cut('s07', 0.95), to: cut('s08', 0.95), el: (t) => <S07 t={t} />},
  {id: 's08', from: cut('s08', 0.95), to: cut('s09', 0.35), el: (t) => <S08 t={t} />},
  {id: 's09', from: cut('s09', 0.35), to: cut('s10'), el: (t) => <S09 t={t} />, wipe: C.red},
  {id: 's10', from: cut('s10'), to: TL.total + 1, el: (t) => <S10 t={t} total={TL.total - st.s10} />},
];

export const Fmi: React.FC = () => {
  const frame = useCurrentFrame();
  const T = frame / FPS;
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <SvgDefs />
      {SCENES.map((sc) => (T >= sc.from && T < sc.to ? <AbsoluteFill key={sc.id} style={{isolation: 'isolate'}}>{sc.el(T - st[sc.id])}</AbsoluteFill> : null))}
      {SCENES.filter((s) => s.wipe).map((sc, i) => (
        <Wipe key={'w' + sc.id} t={T} at={sc.from} color={sc.wipe} dir={i % 2 ? -1 : 1} />
      ))}
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};
