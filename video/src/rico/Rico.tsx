/* "¿Argentina fue el país más rico del mundo?" — composición principal (1920x1080, render x2 = 2160p). */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {R, FPS, Grain, Transition, TrKind, TR_DUR, Chapter, ChapterBar, Bug, clamp} from './kit';
import {TL, c, at, end, IMG} from './lib';
import {S01a, S01b, S01c, TitleCard, S02a, S02b, S03a, S03b, S04a, S04b, S05a, S05b, S05c, S05d, S05e, S06a, S06b} from './scenesA';
import {S07, S08a, S08b, S08c, S09, S10, S11, S12} from './scenesB';

type Shot = {from: number; el: React.FC<{T: number}>; tr?: TrKind; color?: string};

const gapStart = (seg: string) => end(prevSeg(seg)) + 0.15;
const prevSeg = (seg: string) => 's' + String(Number(seg.slice(1)) - 1).padStart(2, '0');

// cada corte se ubica un pelito antes de la palabra que lo motiva
const k = (seg: string, phrase: string, pre = 0.12) => c(seg, phrase) - pre;

const CH = [
  {seg: 's05', num: '1', title: 'La máquina de 1900', sub: 'Cómo se hizo rico un país en 30 años', bg: IMG.inmigrantes},
  {seg: 's08', num: '2', title: 'La caída', sub: 'Qué pasó con los gemelos', bg: IMG.golpe30},
  {seg: 's11', num: '3', title: 'El veredicto', sub: '¿Mito o verdad?', bg: IMG.plaza},
];

const Chap: Record<string, React.FC<{T: number}>> = {};
for (const ch of CH) {
  Chap[ch.seg] = ({T}) => <Chapter t={T} t0={gapStart(ch.seg)} t1={at(ch.seg) + 0.3} num={ch.num} title={ch.title} sub={ch.sub} bg={ch.bg} />;
}
const Title: React.FC<{T: number}> = ({T}) => <TitleCard T={T} t0={gapStart('s02')} t1={at('s02') + 0.25} />;

const SHOTS: Shot[] = [
  {from: 0, el: S01a},
  {from: k('s01', 'Y no es'), el: S01b, tr: 'whip'},
  {from: k('s01', 'Pero hay'), el: S01c, tr: 'glitch'},
  {from: gapStart('s02'), el: Title, tr: 'burn'},
  {from: at('s02') + 0.2, el: S02a, tr: 'gold', color: R.paper},
  {from: k('s02', 'Pero en'), el: S02b, tr: 'shutter', color: R.paper2},
  {from: at('s03') - 0.3, el: S03a, tr: 'bars'},
  {from: k('s03', 'El dato recorrió'), el: S03b, tr: 'flash'},
  {from: at('s04') - 0.3, el: S04a, tr: 'glitch'},
  {from: k('s04', 'Y hay otro'), el: S04b, tr: 'whip'},
  {from: gapStart('s05'), el: Chap.s05, tr: 'burn'},
  {from: at('s05') + 0.2, el: S05a, tr: 'flash'},
  {from: k('s05', 'llenos de'), el: S05b, tr: 'iris'},
  {from: k('s05', 'Los capitales'), el: S05c, tr: 'gold', color: R.paper},
  {from: k('s05', 'Con los'), el: S05d, tr: 'whip'},
  {from: k('s05', 'En mil novecientos trece,'), el: S05e, tr: 'shutter', color: R.paper},
  {from: at('s06') - 0.3, el: S06a, tr: 'burn'},
  {from: k('s06', 'Mientras las'), el: S06b, tr: 'flash'},
  {from: at('s07') - 0.35, el: S07, tr: 'gold', color: R.night},
  {from: gapStart('s08'), el: Chap.s08, tr: 'burn'},
  {from: at('s08') + 0.2, el: S08a, tr: 'flash'},
  {from: k('s08', 'En mil'), el: S08b, tr: 'iris'},
  {from: k('s08', 'Y en el ranking'), el: S08c, tr: 'glitch'},
  {from: at('s09') - 0.3, el: S09, tr: 'bars'},
  {from: at('s10') - 0.4, el: S10, tr: 'shutter'},
  {from: gapStart('s11'), el: Chap.s11, tr: 'burn'},
  {from: at('s11') + 0.2, el: S11, tr: 'flash'},
  {from: at('s12') - 0.35, el: S12, tr: 'gold', color: R.night},
];

// cortes internos (dentro de una misma escena) que también llevan transición
const INNER: {t: number; kind: TrKind; color?: string}[] = [
  {t: k('s01', 'la misma base'), kind: 'glitch'},
  {t: k('s02', 'Groningen,', 0.3), kind: 'iris', color: R.night},
  {t: k('s03', 'Número uno.', 0.05), kind: 'flash'},
  {t: k('s04', 'O sea,', 0.2), kind: 'whip'},
  {t: k('s04', 'Entonces, ¿es'), kind: 'glitch'},
  {t: k('s05', 'casi uno', 0.3), kind: 'gold', color: R.paper},
  {t: k('s05', 'Somos el'), kind: 'burn'},
  {t: k('s05', 'Y en París'), kind: 'burn'},
  {t: k('s06', 'El PBI'), kind: 'shutter', color: R.paper},
  {t: k('s06', 'En mil novecientos siete,'), kind: 'whip'},
  {t: k('s06', 'Uno de'), kind: 'flash'},
  {t: k('s06', 'Y en mil'), kind: 'burn'},
  {t: k('s07', 'Y acá'), kind: 'glitch'},
  {t: k('s09', 'Uno:'), kind: 'whip'},
  {t: k('s09', 'Dos:'), kind: 'whip'},
  {t: k('s09', 'Tres:'), kind: 'whip'},
  {t: k('s09', 'Y cuatro:'), kind: 'whip'},
  {t: k('s09', 'Ningún factor'), kind: 'flash'},
  {t: k('s11', 'El mito'), kind: 'burn'},
  {t: k('s12', 'La historia'), kind: 'flash'},
  {t: k('s12', 'Si este'), kind: 'iris', color: R.night},
];

export const CUTS = [...SHOTS.slice(1).map((s) => ({t: s.from, kind: s.tr!})), ...INNER];

const MARKS = [
  {t: 0, label: 'La frase'},
  {t: at('s02'), label: 'La fuente'},
  {t: at('s03'), label: 'El número uno'},
  {t: gapStart('s05'), label: '1 · La máquina'},
  {t: gapStart('s08'), label: '2 · La caída'},
  {t: at('s09'), label: 'Por qué'},
  {t: gapStart('s11'), label: '3 · El veredicto'},
];

export const Rico: React.FC = () => {
  const frame = useCurrentFrame();
  const T = frame / FPS;
  let idx = 0;
  SHOTS.forEach((s, i) => { if (T >= s.from) idx = i; });
  const Cur = SHOTS[idx].el;
  const endCard = c('s12', 'Si este');
  const barO = T > at('s02') && T < endCard ? Math.min(1, (T - at('s02')) / 0.8) : 0;
  const inChapter = CH.some((ch) => T > gapStart(ch.seg) - 0.2 && T < at(ch.seg) + 0.3) || (T > gapStart('s02') - 0.2 && T < at('s02') + 0.3);
  return (
    <AbsoluteFill style={{background: R.night}}>
      <AbsoluteFill style={{isolation: 'isolate'}}><Cur T={T} /></AbsoluteFill>
      <ChapterBar t={T} total={endCard} marks={MARKS} o={inChapter ? 0 : barO} />
      <Bug o={inChapter ? 0 : clamp(Math.min((T - 3) / 0.6, (endCard - T) / 0.4))} />
      {SHOTS.slice(1).map((s, i) => <Transition key={'s' + i} t={T} at={s.from} kind={s.tr!} color={s.color} />)}
      {INNER.map((s, i) => <Transition key={'i' + i} t={T} at={s.t} kind={s.kind} color={s.color} />)}
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};

export const TOTAL = TL.total;
export {TR_DUR};
