import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {TL, cue} from './lib';
import {Grain} from '../components/base';
import {Bug} from '../ep04/kit';
import {InkDefs, K, ShutterWipe} from './kit10';
import {S01, S02, S03, S04, S05} from './scenes10a';
import {S06, S07, S08, S09, S10} from './scenes10b';

const st = TL.starts;
const FPS = TL.fps;
const cut = (id: string, pre = 0.3) => st[id] - pre;

type SceneDef = {id: string; from: number; to: number; el: (t: number) => React.ReactNode; wipe?: boolean};
const S01_DUR = TL.durations.s01;
const SCENES: SceneDef[] = [
  {id: 's01', from: 0, to: cut('s02'), el: (t) => <S01 t={t} dur={S01_DUR} />},
  {id: 's02', from: cut('s02'), to: cut('s03'), el: (t) => <S02 t={t} />, wipe: true},
  {id: 's03', from: cut('s03'), to: cut('s04'), el: (t) => <S03 t={t} />, wipe: true},
  {id: 's04', from: cut('s04'), to: cut('s05'), el: (t) => <S04 t={t} />, wipe: true},
  {id: 's05', from: cut('s05'), to: cut('s06'), el: (t) => <S05 t={t} />, wipe: true},
  {id: 's06', from: cut('s06'), to: cut('s07', 0.4), el: (t) => <S06 t={t} />, wipe: true},
  {id: 's07', from: cut('s07', 0.4), to: cut('s08', 0.45), el: (t) => <S07 t={t} />, wipe: true},
  {id: 's08', from: cut('s08', 0.45), to: cut('s09', 0.4), el: (t) => <S08 t={t} />, wipe: true},
  {id: 's09', from: cut('s09', 0.4), to: cut('s10', 0.4), el: (t) => <S09 t={t} />, wipe: true},
  {id: 's10', from: cut('s10', 0.4), to: TL.total + 1, el: (t) => <S10 t={t} total={TL.total - st.s10} />, wipe: true},
];
export const CUTS10 = SCENES.filter((s) => s.wipe).map((s) => s.from);
export const TITLE_AT = st.s01 + S01_DUR + 0.1;
const END_CARD = st.s10 + cue('s10', 'Si te') - 0.4;

export const Cuadro: React.FC = () => {
  const frame = useCurrentFrame();
  const T = frame / FPS;
  const bug = T > st.s02 && T < END_CARD ? Math.min(1, (T - st.s02) / 0.6, (END_CARD - T) / 0.4) : 0;
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      <InkDefs />
      {SCENES.map((sc) => (T >= sc.from && T < sc.to ? <AbsoluteFill key={sc.id} style={{isolation: 'isolate'}}>{sc.el(T - st[sc.id])}</AbsoluteFill> : null))}
      <Bug o={bug} />
      {SCENES.filter((s) => s.wipe).map((sc) => (
        <ShutterWipe key={'w' + sc.id} t={T} at={sc.from} />
      ))}
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};
