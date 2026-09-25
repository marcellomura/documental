import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {TL, R} from './lib';
import {Grain, SvgDefs, Wipe} from '../components/base';
import {RockDefs, TrackCard} from './rock';
import {S01, S02, S03, S04} from './scenesA';
import {S05, S06, S07, S08} from './scenesB';
import {S09, S10, S11} from './scenesC';

const st = TL.starts;
const FPS = TL.fps;
/** la tarjeta de "track" tapa el corte entre capítulos */
const CARD_IN = 1.3;
const CARD_OUT = 0.45;
const IDS = ['s01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 's09', 's10', 's11'];

type SceneDef = {id: string; from: number; to: number; el: (t: number) => React.ReactNode};

const EL: Record<string, (t: number) => React.ReactNode> = {
  s01: (t) => <S01 t={t} titleEnd={st.s02 - CARD_IN - st.s01} />,
  s02: (t) => <S02 t={t} />,
  s03: (t) => <S03 t={t} />,
  s04: (t) => <S04 t={t} />,
  s05: (t) => <S05 t={t} />,
  s06: (t) => <S06 t={t} />,
  s07: (t) => <S07 t={t} />,
  s08: (t) => <S08 t={t} />,
  s09: (t) => <S09 t={t} />,
  s10: (t) => <S10 t={t} />,
  s11: (t) => <S11 t={t} total={TL.total - st.s11} />,
};

// s02..s10 entran detrás de su tarjeta; s11 entra con un barrido
const startOf = (id: string) => (id === 's01' ? 0 : id === 's11' ? st.s11 - 0.3 : st[id] - CARD_IN);
const endOf = (i: number) => (i === IDS.length - 1 ? TL.total + 1 : IDS[i + 1] === 's11' ? st.s11 - 0.3 : st[IDS[i + 1]] - CARD_IN + 0.32);
const SCENES: SceneDef[] = IDS.map((id, i) => ({id, from: startOf(id), to: endOf(i), el: EL[id]}));

export const RoboDelSiglo: React.FC = () => {
  const frame = useCurrentFrame();
  const T = frame / FPS;
  return (
    <AbsoluteFill style={{background: R.black}}>
      <SvgDefs />
      <RockDefs />
      {SCENES.map((sc) => (T >= sc.from && T < sc.to ? <AbsoluteFill key={sc.id} style={{isolation: 'isolate'}}>{sc.el(T - st[sc.id])}</AbsoluteFill> : null))}
      {IDS.slice(1, 10).map((id, idx) => (
        <TrackCard key={'tc' + id} t={T} t0={st[id] - CARD_IN} t1={st[id] + CARD_OUT} idx={idx} />
      ))}
      <Wipe t={T} at={st.s11 - 0.3} color={R.red} />
      <Grain opacity={0.08} />
    </AbsoluteFill>
  );
};
