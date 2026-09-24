import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import timeline from './data/timeline.json';
import {C} from './theme';
import {Grain, SvgDefs, Wipe} from './components/base';
import {S01, S02, S03, S04} from './scenes/scenes1';
import * as S2 from './scenes/scenes2';
import * as S3 from './scenes/scenes3';

const st = timeline.starts as Record<string, number>;
const FPS = timeline.fps;

type SceneDef = {id: string; from: number; to: number; el: (t: number) => React.ReactNode; wipe?: string; dark?: boolean};

// Ventanas de cada escena (en segundos globales). Cada escena recibe t relativo al inicio de su segmento.
const cut = (id: string, pre = 0.25) => st[id] - pre;
const SCENES: SceneDef[] = [
  {id: 's01', from: 0, to: cut('s02'), el: (t) => <S01 t={t} />},
  {id: 's02', from: cut('s02'), to: cut('s03'), el: (t) => <S02 t={t} titleEnd={st.s03 - st.s02} />, wipe: C.yellow},
  {id: 's03', from: cut('s03'), to: cut('s04'), el: (t) => <S03 t={t} />, wipe: C.yellow},
  {id: 's04', from: cut('s04'), to: cut('s05', 0.9), el: (t) => <S04 t={t} />, wipe: C.celeste},
  {id: 's05', from: cut('s05', 0.9), to: cut('s06', 0.9), el: (t) => <S2.S05 t={t} />},
  {id: 's06', from: cut('s06', 0.9), to: cut('s07', 0.8), el: (t) => <S2.S06 t={t} />},
  {id: 's07', from: cut('s07', 0.8), to: cut('s08', 0.85), el: (t) => <S2.S07 t={t} />},
  {id: 's08', from: cut('s08', 0.85), to: cut('s09', 0.3), el: (t) => <S2.S08 t={t} />},
  {id: 's09', from: cut('s09', 0.3), to: cut('s10', 0.3), el: (t) => <S3.S09 t={t} />, wipe: C.red},
  {id: 's10', from: cut('s10', 0.3), to: cut('s11', 0.3), el: (t) => <S3.S10 t={t} />, wipe: C.yellow},
  {id: 's11', from: cut('s11', 0.3), to: cut('s12', 0.3), el: (t) => <S3.S11 t={t} />, wipe: C.celeste},
  {id: 's12', from: cut('s12', 0.3), to: timeline.total + 1, el: (t) => <S3.S12 t={t} total={timeline.total - st.s12} />, wipe: C.ink},
];

export const Documental: React.FC = () => {
  const frame = useCurrentFrame();
  const T = frame / FPS;
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <SvgDefs />
      {SCENES.map((sc) => (T >= sc.from && T < sc.to ? <AbsoluteFill key={sc.id}>{sc.el(T - st[sc.id])}</AbsoluteFill> : null))}
      {SCENES.filter((s) => s.wipe).map((sc, i) => (
        <Wipe key={'w' + sc.id} t={T} at={sc.from} color={sc.wipe} dir={i % 2 ? -1 : 1} />
      ))}
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};
