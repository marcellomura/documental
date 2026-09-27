/* "¿Por qué ver a Messi cuesta $3 millones?" — composición principal (1920x1080; se renderiza x2 y se baja a 1080p). */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import cortes from '../data/msi/cortes.json';
import {M, FPS, Transition, TrKind, ChapterBar, Bug, clamp} from './kit';
import {TL, c, at, gapStart} from './lib';
import {
  SceneP, S01a, S01b, S01d, S01e, Title, Chapter, S02a, S02b, S02c, S02d, S03a, S03b, S03c, S03d, S03e, S04a, S04h, S04b, S04c, S04d, S05a, S05b, S05c, S05d, S05e, S05f,
} from './scenesA';
import {S06a, S06b, S06c, S06d, S06e, S07a, S07b, S07c, S07d, S08a, S08c, S08d, S09a, S09b, S09c, S10a, S10b, S10c, S11} from './scenesB';

type TSpec = {abs?: number; seg?: string; ph?: string; pre?: number; n?: number; gap?: string; at?: string; off?: number};
const resolve = (s: TSpec): number => {
  if (s.abs !== undefined) return s.abs;
  if (s.gap) return gapStart(s.gap);
  if (s.at) return at(s.at) + (s.off ?? 0);
  return c(s.seg!, s.ph!, s.n ?? 0) - (s.pre ?? 0.12);
};

const CH: Record<string, {seg: string; num: string; title: string; sub: string; bg: string}> = {
  CH1: {seg: 's03', num: '1', title: 'LA FILA', sub: 'Dos horas, cuatro entradas por cuenta', bg: 'mon_cc0_blur.jpg'},
  CH2: {seg: 's04', num: '2', title: 'LA CUENTA', sub: 'Por qué el precio se multiplica', bg: 'fest04_blur.jpg'},
  CH3: {seg: 's06', num: '3', title: 'LOS BOTS', sub: 'Quién llega primero a la fila', bg: 'egy112_blur.jpg'},
  CH4: {seg: 's08', num: '4', title: 'LA TRAMPA', sub: 'Webs truchas y precios de fantasía', bg: 'river_avion_blur.jpg'},
  CH5: {seg: 's10', num: '', title: 'EL VEREDICTO', sub: '¿Quién se queda con la diferencia?', bg: 'mon_pano2_blur.jpg'},
};
const chapterScene = (id: string): React.FC<SceneP> => {
  const ch = CH[id];
  const C: React.FC<SceneP> = ({T, t0}) => <Chapter T={T} t0={t0} t1={at(ch.seg) + 0.3} num={ch.num} title={ch.title} sub={ch.sub} bg={ch.bg} />;
  return C;
};

const SCENES: Record<string, React.FC<SceneP>> = {
  S01a, S01b, S01d, S01e, TITLE: Title, S02a, S02b, S02c, S02d, S03a, S03b, S03c, S03d, S03e, S04a, S04h, S04b, S04c, S04d, S05a, S05b, S05c, S05d, S05e, S05f,
  S06a, S06b, S06c, S06d, S06e, S07a, S07b, S07c, S07d, S08a, S08c, S08d, S09a, S09b, S09c, S10a, S10b, S10c, S11,
  CH1: chapterScene('CH1'), CH2: chapterScene('CH2'), CH3: chapterScene('CH3'), CH4: chapterScene('CH4'), CH5: chapterScene('CH5'),
};

type Shot = {id: string; from: number; tr?: TrKind};
const SHOTS: Shot[] = (cortes.shots as {id: string; t: TSpec; tr?: string}[]).map((s) => {
  if (!SCENES[s.id]) throw new Error('escena sin componente: ' + s.id);
  return {id: s.id, from: resolve(s.t), tr: s.tr as TrKind | undefined};
});
const INNER: {t: number; kind: TrKind}[] = (cortes.inner as {t: TSpec; tr: string}[]).map((s) => ({t: resolve(s.t), kind: s.tr as TrKind}));
export const CUTS = [...SHOTS.slice(1).map((s) => ({t: s.from, kind: s.tr!})), ...INNER];

const covered = (T: number) => SHOTS.some((s, i) => (s.id === 'TITLE' || s.id.startsWith('CH')) && T > s.from - 0.2 && T < (SHOTS[i + 1]?.from ?? Infinity) + 0.2);
const END_BAR = at('s11') - 0.15;
const MARKS = [
  {t: 0, label: 'El precio'},
  {t: gapStart('s03'), label: '1 · La fila'},
  {t: gapStart('s04'), label: '2 · La cuenta'},
  {t: gapStart('s06'), label: '3 · Los bots'},
  {t: gapStart('s08'), label: '4 · La trampa'},
  {t: gapStart('s10'), label: 'El veredicto'},
];

export const Msi: React.FC = () => {
  const frame = useCurrentFrame();
  const T = frame / FPS;
  let idx = 0;
  SHOTS.forEach((s, i) => { if (T >= s.from) idx = i; });
  const cur = SHOTS[idx];
  const Cur = SCENES[cur.id];
  const hide = covered(T);
  const barO = T > 3 && T < END_BAR ? Math.min(1, (T - 3) / 0.8, (END_BAR - T) / 0.3) : 0;
  return (
    <AbsoluteFill style={{background: M.night}}>
      <AbsoluteFill style={{isolation: 'isolate'}}><Cur T={T} t0={cur.from} /></AbsoluteFill>
      <ChapterBar t={T} total={TL.total} marks={MARKS} o={hide ? 0 : barO} />
      <Bug o={hide ? 0 : clamp(Math.min((T - 3) / 0.6, (c('s11', 'Contexto:') - 0.2 - T) / 0.4))} />
      {SHOTS.slice(1).map((s, i) => <Transition key={'s' + i} t={T} at={s.from} kind={s.tr!} />)}
      {INNER.map((s, i) => <Transition key={'i' + i} t={T} at={s.t} kind={s.kind} />)}
    </AbsoluteFill>
  );
};

export const TOTAL = TL.total;
