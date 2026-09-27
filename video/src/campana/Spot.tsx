import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {Grain, SvgDefs} from '../components/base';
import {clamp, easeIn, easeInOut, easeOut, shake} from '../lib/anim';
import lyrics from '../data/campana/lyrics.json';
import {
  Aula, BandWipe, BrandLines, Caption, Clip, Confetti, FactCard, Flash, FONT, FPS, Isotipo, K, Leak, PhotoKeys, ramp, Slam, Stamp, useLayout, Vignette, Wheelchair, win, Wordmark,
} from './kit';

export const SPOT_TOTAL = 93.0;
const LY = lyrics as {t0: number; t1: number; w: [number, string][]}[];
/** beats del estribillo (100 BPM exactos, medidos sobre el audio) */
const B0 = 38.685, BEAT = 0.6;
const beats = (a: number, b: number) => {
  const r: number[] = [];
  for (let t = B0; t < b; t += BEAT) if (t >= a) r.push(+t.toFixed(3));
  return r;
};
const BW = 'grayscale(1) contrast(1.15) brightness(0.72)';

export const Spot: React.FC<{withAudio?: boolean}> = ({withAudio = false}) => {
  const f = useCurrentFrame();
  const T = f / FPS;
  const {V, u, W, H} = useLayout();
  const big = (V ? 190 : 230) * u;

  // temblores: sellos de VETO, golpes del puente y del cierre
  const sh = [shake(T, 12.28, 16), shake(T, 15.86, 16), shake(T, 58.78, 12), shake(T, 63.62, 12), shake(T, 67.06, 14), shake(T, 89.2, 12)].reduce((a, b) => ({x: a.x + b.x, y: a.y + b.y}), {x: 0, y: 0});

  // letterbox durante el lamento, se abre con la esperanza
  const bars = V ? 0 : (1 - ramp(T, 21.7, 22.7, easeInOut)) * H * 0.115;

  const ch1 = beats(38.6, 56.9);
  const ch2 = beats(69.8, 86.9);

  return (
    <AbsoluteFill style={{background: K.navy, overflow: 'hidden'}}>
      <SvgDefs />
      {withAudio ? <Audio src={staticFile('campana/jingle.mp3')} /> : null}

      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px)`}}>
        {/* ======================= LAMENTO (0 – 22) ======================= */}
        {/* el Congreso en blanco y negro; al llegar "los miércoles" la cámara se abre y aparece el cartel de los jubilados */}
        <PhotoKeys
          T={T} from={0.4} to={10.4} src="campana/img/jub09_03.jpg" fin={1.3} fout={0.5} filter={BW}
          keys={[[0.4, 2.3, 30, 8], [5.1, 2.0, 30, 12], [7.3, 1.08, 48, 45], [10.4, 1.16, 48, 50]]}
        />

        {/* discapacidad: silla de ruedas dibujada + VETO */}
        {T > 9.9 && T < 14.3 ? (
          <AbsoluteFill style={{opacity: win(T, 9.95, 14.25, 0.4, 0.35), background: `radial-gradient(ellipse at 50% 45%, ${K.navy2} 0%, ${K.navy} 70%)`}}>
            <BrandLines T={T} t0={10.0} dur={2.4} set={2} o={0.22} width={3} />
            <div style={{position: 'absolute', left: V ? '50%' : '68%', top: V ? '34%' : '46%', transform: 'translate(-50%,-50%)'}}>
              <Wheelchair T={T} t0={10.25} size={(V ? 520 : 560) * u} />
            </div>
            <Stamp T={T} t0={12.28} t1={14.3} x={V ? 0 : W * 0.18} y={V ? -H * 0.16 : -20 * u} size={(V ? 150 : 170) * u} />
          </AbsoluteFill>
        ) : null}

        {/* universidades y Garrahan: pizarrón + VETO */}
        {T > 13.95 && T < 17.95 ? (
          <AbsoluteFill style={{opacity: win(T, 14.0, 17.9, 0.35, 0.3), background: `radial-gradient(ellipse at 50% 45%, ${K.navy2} 0%, ${K.navy} 70%)`}}>
            <BrandLines T={T} t0={14.0} dur={2.2} set={1} o={0.2} width={3} flip />
            <div style={{position: 'absolute', left: V ? '50%' : '66%', top: V ? '33%' : '44%', transform: 'translate(-50%,-50%)'}}>
              <Aula T={T} t0={14.1} size={(V ? 380 : 430) * u} />
            </div>
            <Stamp T={T} t0={15.86} t1={17.95} x={V ? 0 : W * 0.16} y={V ? -H * 0.12 : 40 * u} size={(V ? 140 : 160) * u} rot={7} />
          </AbsoluteFill>
        ) : null}

        {/* "Pero ninguna noche dura para siempre" */}
        {T > 17.6 && T < 22.9 ? (
          <AbsoluteFill style={{background: '#000', opacity: win(T, 17.65, 22.9, 0.35, 0.6)}}>
            <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 110%, rgba(246,212,101,${0.55 * ramp(T, 20.3, 22.3)}) 0%, rgba(13,178,253,${0.35 * ramp(T, 20.6, 22.5)}) 35%, rgba(0,0,0,0) 70%)`}} />
            <div style={{position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', textAlign: 'center', fontFamily: FONT, color: K.white, textTransform: 'uppercase'}}>
              {[
                ['NINGUNA', 18.08], ['NOCHE', 18.46],
              ].map(([w, t0], i) => (
                <span key={i} style={{fontWeight: 300, fontSize: (V ? 120 : 130) * u, letterSpacing: 14 * u, opacity: easeOut(clamp((T - (t0 as number) + 0.1) / 0.5)), marginRight: 30 * u, display: V ? 'block' : 'inline'}}>{w}</span>
              ))}
              <div style={{fontWeight: 800, fontStyle: 'italic', fontSize: (V ? 118 : 150) * u, lineHeight: 1.05, letterSpacing: 4 * u, marginTop: 10 * u, color: T > 20.66 ? K.yel : K.white}}>
                {[
                  ['DURA', 19.82], ['PARA', 20.28], ['SIEMPRE', 20.66],
                ].map(([w, t0], i) => (
                  <span key={i} style={{opacity: easeOut(clamp((T - (t0 as number) + 0.08) / 0.35)), marginRight: 26 * u, display: 'inline-block', transform: `translateY(${(1 - easeOut(clamp((T - (t0 as number) + 0.08) / 0.4))) * 30}px)`}}>{w}</span>
                ))}
              </div>
            </div>
          </AbsoluteFill>
        ) : null}

        {/* ======================= GIRO (22 – 38.7) ======================= */}
        <Clip T={T} from={21.9} to={27.45} at={24.0} rate={0.85} z0={1.12} z1={1.02} fin={0.7} />
        <Clip T={T} from={27.45} to={29.28} at={5.0} z0={1.05} z1={1.12} />
        <Clip T={T} from={29.28} to={31.1} at={13.0} z0={1.1} z1={1.04} vpos="40% 50%" />
        <Clip T={T} from={31.1} to={33.5} at={10.0} z0={1.0} z1={1.1} />
        <Clip T={T} from={33.5} to={38.72} at={15.2} rate={0.7} z0={1.04} z1={1.16} vpos="35% 50%" />

        {/* ======================= ESTRIBILLO 1 (38.7 – 56.9) ======================= */}
        <Clip T={T} from={38.69} to={41.09} at={8.0} rate={0.8} z0={1.08} z1={1.14} punch={ch1} vpos="62% 50%" />
        <Clip T={T} from={41.09} to={43.49} at={2.2} z0={1.0} z1={1.08} punch={ch1} />
        <Clip T={T} from={43.49} to={45.89} at={0.0} rate={0.8} z0={1.12} z1={1.04} punch={ch1} vpos="45% 50%" />
        <Clip T={T} from={45.89} to={47.62} at={22.0} z0={1.02} z1={1.1} punch={ch1} />
        <Clip T={T} from={47.6} to={50.69} at={29.2} z0={1.05} z1={1.15} punch={ch1} filter="brightness(0.55) saturate(1.1)" vpos="55% 50%" />
        <Clip T={T} from={50.69} to={53.09} at={16.8} rate={0.8} z0={1.1} z1={1.02} punch={ch1} vpos="35% 50%" />
        <Clip T={T} from={53.09} to={56.92} at={33.2} rate={0.9} z0={1.04} z1={1.14} punch={ch1} vpos="55% 50%" />

        {/* ======================= PUENTE (56.9 – 69.8) ======================= */}
        {[
          [56.9, 58.8, '¿QUIÉN LA\nLEVANTA?', K.azul],
          [60.98, 63.64, '¿QUIÉN LA\nSOSTIENE?', K.azul],
          [64.94, 67.08, '¿Y QUIÉN LA\nCONDUCE?', K.navy],
        ].map(([a, b, txt, bg], i) => (
          <AbsoluteFill key={i} style={{display: T >= (a as number) && T < (b as number) ? 'flex' : 'none', background: bg as string}}>
            <BrandLines T={T} t0={a as number} dur={1.0} set={i % 2 === 0 ? 1 : 2} o={0.9} width={6} flip={i === 1} />
            <Slam T={T} t0={a as number} t1={b as number} text={txt as string} size={(V ? 170 : 180) * u} italic={false} weight={800} color={K.white} />
          </AbsoluteFill>
        ))}
        <Clip T={T} from={58.78} to={60.98} at={25.5} z0={1.12} z1={1.02} />
        <Clip T={T} from={63.62} to={64.94} at={5.5} z0={1.1} z1={1.02} />
        <Clip T={T} from={67.06} to={69.86} at={19.0} rate={0.9} z0={1.14} z1={1.04} vpos="62% 50%" />

        {/* ======================= ESTRIBILLO 2 (69.8 – 86.9) ======================= */}
        {[
          [69.84, 71.09, 8.6, '62% 50%'], [71.09, 72.29, 13.6, '55% 50%'], [72.29, 73.49, 22.6, '50% 50%'], [73.49, 74.69, 3.2, '50% 50%'],
          [74.69, 75.89, 0.6, '45% 50%'], [75.89, 77.09, 27.0, '60% 50%'], [77.09, 78.29, 11.2, '40% 50%'], [78.29, 79.49, 30.5, '55% 50%'],
        ].map(([a, b, at, vp], i) => (
          <Clip key={i} T={T} from={a as number} to={(b as number) + 0.02} at={at as number} z0={i % 2 ? 1.12 : 1.04} z1={i % 2 ? 1.04 : 1.12} punch={ch2} vpos={vp as string} />
        ))}
        <Clip T={T} from={79.49} to={81.89} at={20.0} rate={0.8} z0={1.06} z1={1.14} punch={ch2} filter="brightness(0.55) saturate(1.1)" vpos="62% 50%" />
        <Clip T={T} from={81.89} to={84.1} at={15.6} rate={0.8} z0={1.12} z1={1.04} punch={ch2} vpos="35% 50%" />
        <Clip T={T} from={84.1} to={87.2} at={33.6} rate={0.65} z0={1.04} z1={1.16} vpos="55% 50%" />

        {/* grado general sobre el material: viñeta y un velo celeste suave */}
        {T > 21.9 && T < 87.2 ? (
          <>
            <AbsoluteFill style={{pointerEvents: 'none', background: `linear-gradient(180deg, rgba(0,77,255,0.10) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 60%, rgba(6,10,21,0.55) 100%)`}} />
            <Vignette o={0.55} />
          </>
        ) : T <= 21.9 ? <Vignette o={0.75} /> : null}

        {/* ======================= TEXTOS SOBRE EL MATERIAL ======================= */}
        <FactCard T={T} t0={6.2} t1={10.1} date="SEPTIEMBRE 2024" text="Milei vetó la ley de movilidad jubilatoria." src="Decreto 782/2024 · 2 de septiembre de 2024" />
        <FactCard T={T} t0={10.9} t1={14.15} date="4 DE AGOSTO DE 2025" text="Vetó la Ley de Emergencia en Discapacidad." src="Decreto 534/2025 · El Congreso rechazó el veto el 4/9/2025" />
        <FactCard T={T} t0={14.6} t1={17.85} date="2025" text="Vetó el financiamiento universitario y la emergencia del Garrahan." src="El Congreso rechazó ambos vetos el 2/10/2025" />

        {/* "se prende la esperanza": destello */}
        <Leak T={T} at={21.95} dur={1.4} color="255,236,190" y="100%" peak={0.9} />
        <Leak T={T} at={23.72} dur={1.2} color="120,210,255" x="72%" y="40%" peak={0.75} />

        {/* estribillo 1 */}
        <Slam T={T} t0={38.86} t1={41.0} text={'¡VAMOS,'} size={big} y={-big * 0.5} color={K.white} />
        <Slam T={T} t0={40.04} t1={41.0} text={'AXEL!'} size={big * 1.12} y={big * 0.52} color={K.cel} />
        <Slam T={T} t0={43.58} t1={45.8} text={'¡VAMOS,'} size={big} y={-big * 0.5} color={K.white} />
        <Slam T={T} t0={44.2} t1={45.8} text={'AXEL!'} size={big * 1.12} y={big * 0.52} color={K.cel} />

        {/* "Derecho al futuro" con el isotipo */}
        {[[47.6, 50.6, 48.6], [79.49, 81.8, 79.82]].map(([a, b, t2], i) =>
          T > a && T < b ? (
            <AbsoluteFill key={i} style={{opacity: win(T, a, b, 0.2, 0.3)}}>
              <BrandLines T={T} t0={a} dur={1.2} set={i ? 2 : 1} width={6} />
              <div style={{position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: V ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: 50 * u}}>
                <Isotipo size={(V ? 260 : 300) * u} p={clamp((T - a) / 0.9)} />
                <div style={{fontFamily: FONT, fontWeight: 900, fontStyle: 'italic', color: K.white, textTransform: 'uppercase', lineHeight: 0.9, fontSize: (V ? 150 : 170) * u, textAlign: V ? 'center' : 'left', textShadow: '0 10px 40px rgba(0,0,0,0.5)'}}>
                  <div style={{opacity: easeOut(clamp((T - a) / 0.25)), transform: `translateX(${(1 - easeOut(clamp((T - a) / 0.35))) * -40}px)`}}>DERECHO</div>
                  <div style={{color: K.cel, opacity: easeOut(clamp((T - t2) / 0.25)), transform: `translateX(${(1 - easeOut(clamp((T - t2) / 0.35))) * -40}px)`}}>AL FUTURO</div>
                </div>
              </div>
            </AbsoluteFill>
          ) : null,
        )}

        {/* puente: respuestas de la gente */}
        <Slam T={T} t0={58.78} t1={60.95} text={'¡LA GENTE!'} size={big * 1.05} color={K.white} />
        <Flash T={T} at={58.78} c={K.cel} peak={0.6} />
        <Slam T={T} t0={63.62} t1={64.92} text={'¡LA GENTE!'} size={big * 1.05} color={K.white} />
        <Flash T={T} at={63.62} c={K.cel} peak={0.6} />
        <Slam T={T} t0={67.06} t1={69.8} text={'AXEL\nPRESIDENTE'} size={big * 0.95} color={K.white} />
        <Flash T={T} at={67.06} c="#ffffff" peak={0.75} />
        <Confetti T={T} t0={67.1} t1={69.9} n={V ? 70 : 110} />

        {/* estribillo 2 */}
        <Slam T={T} t0={69.84} t1={72.2} text={'¡VAMOS,'} size={big} y={-big * 0.5} color={K.white} />
        <Slam T={T} t0={71.16} t1={72.2} text={'AXEL!'} size={big * 1.12} y={big * 0.52} color={K.cel} />
        <Slam T={T} t0={74.9} t1={77.0} text={'¡VAMOS,'} size={big} y={-big * 0.5} color={K.white} />
        <Slam T={T} t0={75.38} t1={77.0} text={'AXEL!'} size={big * 1.12} y={big * 0.52} color={K.cel} />

        {/* ======================= CIERRE (86.9 – 93) ======================= */}
        {T > 86.85 ? (
          <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, ${K.navy2} 0%, ${K.navy} 75%)`}}>
            <BrandLines T={T} t0={86.95} dur={1.8} set={1} width={6} />
            <BrandLines T={T} t0={87.3} dur={1.8} set={2} width={6} flip o={0.6} />
            {T < 90.55 ? (
              <div style={{position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', textAlign: 'center', fontFamily: FONT, textTransform: 'uppercase', color: K.white}}>
                <div style={{fontWeight: 400, fontSize: (V ? 80 : 84) * u, letterSpacing: 6 * u, lineHeight: 1.1, opacity: Math.min(easeOut(clamp((T - 87.05) / 0.45)), 1 - easeIn(clamp((T - 90.25) / 0.3))), padding: `0 ${60 * u}px`}}>
                  Nos pueden sacar muchas cosas.
                </div>
                <div style={{height: 26 * u}} />
                <div style={{fontWeight: 900, fontStyle: 'italic', fontSize: (V ? 170 : 200) * u, lineHeight: 1, color: K.cel, opacity: Math.min(easeOut(clamp((T - 89.2) / 0.15)), 1 - easeIn(clamp((T - 90.3) / 0.25))), transform: `scale(${1.3 - 0.3 * easeOut(clamp((T - 89.2) / 0.25))})`}}>
                  El futuro, no.
                </div>
              </div>
            ) : (
              <div style={{position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 * u}}>
                <Wordmark h={(V ? 180 : 190) * u} p={clamp((T - 90.6) / 1.0)} />
                <div style={{fontFamily: FONT, fontWeight: 900, fontStyle: 'italic', fontSize: (V ? 120 : 128) * u, letterSpacing: 4 * u, color: K.cel, lineHeight: 1, opacity: easeOut(clamp((T - 91.1) / 0.4)), transform: `translateY(${(1 - easeOut(clamp((T - 91.1) / 0.5))) * 30}px)`}}>
                  AXEL 2027
                </div>
                <div style={{fontFamily: FONT, fontWeight: 300, fontSize: 46 * u, letterSpacing: 5 * u, color: 'rgba(244,246,250,0.85)', opacity: easeOut(clamp((T - 91.6) / 0.5))}}>
                  Hay otro camino.
                </div>
              </div>
            )}
          </AbsoluteFill>
        ) : null}

        {/* letra: todo menos el puente */}
        {LY.map((l, i) => (i >= 13 && i <= 15 ? null : <Caption key={i} T={T} line={l} next={LY[i + 1]?.w[0][0]} />))}
      </AbsoluteFill>

      {/* marca chica arriba a la izquierda mientras corre el material */}
      {T > 22.4 && T < 86.8 ? (
        <div style={{position: 'absolute', left: (V ? 60 : 70) * u, top: (V ? 90 : 56) * u, opacity: 0.9 * win(T, 22.4, 86.8, 0.6, 0.3)}}>
          <Wordmark h={42 * u} p={clamp((T - 22.4) / 1.0)} />
        </div>
      ) : null}

      {/* letterbox */}
      {bars > 0.5 ? (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: bars, background: '#000'}} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: bars, background: '#000'}} />
        </>
      ) : null}

      {/* transiciones */}
      <BandWipe T={T} at={38.69} dur={0.55} />
      <BandWipe T={T} at={47.6} dur={0.5} colors={[K.azul, K.cel]} />
      <Flash T={T} at={56.9} c="#ffffff" peak={0.7} />
      <Flash T={T} at={60.98} c="#ffffff" peak={0.5} />
      <Flash T={T} at={64.94} c="#ffffff" peak={0.5} />
      <BandWipe T={T} at={69.84} dur={0.5} colors={[K.cel, K.white, K.azul]} />
      <BandWipe T={T} at={79.49} dur={0.5} colors={[K.azul, K.cel]} />
      <BandWipe T={T} at={86.9} dur={0.6} colors={[K.cel, K.azul, K.navy]} />
      {/* fundido de entrada desde negro */}
      {T < 0.9 ? <AbsoluteFill style={{background: '#000', opacity: 1 - easeInOut(clamp(T / 0.9))}} /> : null}
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};
