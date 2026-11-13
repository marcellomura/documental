/* Ep16 · EL PUNTO DÉBIL — vertical (1080×1920, 2:48) con subtítulos palabra por palabra. Reusa s01, s04, s06, s08 y
   s13 del largo con encuadres verticales y termina mandando al documental completo en YouTube. */
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {useAssets16} from './globe16';
import {Caps, Captions16, Finish, K, Mono, Title16, vis} from './kit16';
import {V} from './lib16';
import {S01, S01Globe} from './scenesA';
import {S04, S06} from './scenesB';
import {S08, S13} from './scenesC';
import {easeOut, clamp} from '../lib/anim';

const W = 1080, H = 1920;
const WORDS = V.words();
const Cta: React.FC<{t: number}> = ({t}) => {
  const t0 = V.start('v01') - 0.4;
  const k = vis(t, t0, Infinity, 0.6);
  if (k <= 0) return null;
  const p = easeOut(clamp((t - t0 - 0.3) / 0.9));
  return (
    <AbsoluteFill style={{background: '#010207', opacity: k}}>
      <Title16 t={t} t0={t0 + 0.1} t1={Infinity} title="EL PUNTO DÉBIL" size={84} y={470} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center', opacity: p}}>
        <Caps size={26} color={K.dim}>documental completo</Caps>
        <div style={{margin: '36px auto 0', width: 760, padding: '34px 0', border: `2px solid ${K.hot}`, borderRadius: 14, background: 'rgba(255,122,31,0.08)'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26}}>
            <svg width={86} height={60} viewBox="0 0 86 60"><rect width="86" height="60" rx="16" fill="#FF2A1F" /><path d="M 34 17 L 58 30 L 34 43 Z" fill="#FFFFFF" /></svg>
            <Mono size={46} color={K.ink} weight={600} track={0.04}>YouTube</Mono>
          </div>
          <Mono size={36} color={K.hot2} style={{marginTop: 22}} track={0.12}>buscá CONTEXTO</Mono>
        </div>
        <Img src={staticFile('brand/logo_transparente.png')} style={{width: 150, height: 150, marginTop: 60, opacity: vis(t, t0 + 0.9, Infinity, 0.6)}} />
      </div>
    </AbsoluteFill>
  );
};
export const VertBody: React.FC<{t: number}> = ({t}) => {
  const p = {t, T: V, w: W, h: H, vertical: true};
  const tq1 = V.at('s06', 'Él los'), tq2 = V.at('s06', 'Son partículas'), tn1 = V.at('s13', 'La NASA'), tn2 = V.at('s13', 'Las brújulas');
  const hide = (t > tq1 - 0.2 && t < tq2) || (t > tn1 - 0.2 && t < tn2) || t > V.start('v01') - 0.4;
  return (
    <AbsoluteFill style={{background: '#010207'}}>
      <S01 {...p} />
      <S01Globe {...p} until={V.start('s04') + 0.4} />
      <Title16 t={t} t0={V.atE('s01', 'argentino') + 0.2} t1={V.start('s04') + 0.2} title="EL PUNTO DÉBIL" size={78} y={300} />
      <S04 {...p} />
      <S06 {...p} />
      <S08 {...p} />
      <S13 {...p} />
      <Cta t={t} />
      <Captions16 t={t} words={WORDS} y={1330} hide={hide} />
      <Finish t={t} />
    </AbsoluteFill>
  );
};
export const Vert: React.FC = () => {
  const ok = useAssets16();
  const f = useCurrentFrame();
  if (!ok) return null;
  return <VertBody t={f / 30} />;
};
export const VertStills: React.FC<{times: number[]}> = ({times}) => {
  const ok = useAssets16();
  const f = useCurrentFrame();
  if (!ok) return null;
  return <VertBody t={times[Math.min(f, times.length - 1)]} />;
};
