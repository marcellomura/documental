/* Ep16 · EL PUNTO DÉBIL — largo para YouTube (1920×1080 de composición, render a 2560×1440, sin subtítulos). */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {useAssets16} from './globe16';
import {Finish} from './kit16';
import {L} from './lib16';
import {S01, S01Globe, S01Title, S02, S03} from './scenesA';
import {S04, S05, S06, S07} from './scenesB';
import {S08, S09, S10, S11, S12, S13, S14, S15} from './scenesC';

const W = 1920, H = 1080;
export const DocBody: React.FC<{t: number}> = ({t}) => {
  const p = {t, T: L, w: W, h: H};
  return (
    <AbsoluteFill style={{background: '#010207'}}>
      <S01 {...p} />
      <S01Globe {...p} until={L.start('s02') + 0.4} />
      <S01Title {...p} />
      <S02 {...p} />
      <S03 {...p} />
      <S04 {...p} />
      <S05 {...p} />
      <S06 {...p} />
      <S07 {...p} />
      <S08 {...p} />
      <S09 {...p} />
      <S10 {...p} />
      <S11 {...p} />
      <S12 {...p} />
      <S13 {...p} />
      <S14 {...p} />
      <S15 {...p} />
      <Finish t={t} />
    </AbsoluteFill>
  );
};
export const Doc: React.FC = () => {
  const ok = useAssets16();
  const f = useCurrentFrame();
  if (!ok) return null;
  return <DocBody t={f / 30} />;
};
/** cuadros sueltos para revisar: el cuadro i muestra el instante TIMES[i] */
export const DocStills: React.FC<{times: number[]}> = ({times}) => {
  const ok = useAssets16();
  const f = useCurrentFrame();
  if (!ok) return null;
  return <DocBody t={times[Math.min(f, times.length - 1)]} />;
};
