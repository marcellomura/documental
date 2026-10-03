/* Escenas S01–S06 del episodio 11 (El Sol de Perón). t = segundos relativos al inicio de la narración del segmento. */
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {F} from '../theme';
import {cue} from './lib';
import {
  K, TYPE, SpaceBg, Embers, FilmFX, ArchiveVideo, FilmFrame, ArchCredit, Leader, NameTag, Newspaper, Ticker, MilkBottle, Flag, QuoteCard, Poll, DocSheet, EnergyBar, Scope, MoneyCount,
  Big, Chip, FullPhoto, Vig, Stamp, Typed, PhotoCard, DateCard, Place, YearRoll, MarkerCircle, between, fadeIO, clamp, easeIn, easeInOut, easeOut, prog, pop, rnd,
} from './kit11';
import {FlatMap, MapRoute, MapPin, mapXY} from '../ep10/kit10';
import type {MapView} from '../ep10/kit10';
import {IslandShot, ISL_WIDE, ISL_LOW, ISL_HIGH, ISL_REACT, Stage, Reactor3D, RX_CAM, RX_LOW, RX_TOP, Sun3D, Fusion3D, FUSION_CAM, camPath, project} from './three11';
import type {Cam} from './three11';

const C = (seg: string) => (phrase: string, n = 0, w: 's' | 'e' = 's') => cue(seg, phrase, n, w);

/* ============================================================ S01 — el anuncio */
export const S01: React.FC<{t: number; dur: number}> = ({t, dur}) => {
  const c = C('s01');
  const tIsla = c('en una isla') - 0.2, tArg = c('la Argentina') - 0.15, tEnc = c('Encender,') - 0.2, tEn = c('Energía') - 0.15, tMent = c('Era todo'), tPero = c('Pero lo'), tEs = c('Es lo que');
  const TITLE = dur + 0.1;
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {/* noticiero: Perón en el balcón */}
      {between(t, 0.8, tIsla + 0.4) ? (
        <AbsoluteFill>
          <ArchiveVideo src="ep11/vid/bal_saludo.mp4" t={t} t0={0.9} t1={tIsla + 0.4} from={1.2} rate={0.8} bw sepia zoom={[1.06, 1.16]} focus="50% 40%" credit="Noticiero 1953 · DiFilm / Wikimedia Commons (dominio público)" />
          <div style={{position: 'absolute', left: 0, right: 0, top: 160, textAlign: 'center', opacity: fadeIO(t, 1.0, c('Juan') + 0.4)}}>
            <div style={{fontFamily: F.head, fontSize: 150, color: K.cream, letterSpacing: 8, textShadow: '0 10px 50px rgba(0,0,0,0.9)', transform: `scale(${1.08 - 0.08 * easeOut(prog(t, 1.0, 1.2))})`}}>24 · III · 1951</div>
          </div>
          <Place t={t} t0={c('Juan') - 0.1} t1={tIsla + 0.4} a="CASA ROSADA · BUENOS AIRES" b="PERÓN CONVOCA A LA PRENSA" color={K.sun} />
          {[0, 0.35, 0.8, 1.3, 1.7].map((d, i) => {
            const t0 = c('prensa') + d;
            const k = t >= t0 && t < t0 + 0.18 ? 1 - (t - t0) / 0.18 : 0;
            return k > 0 ? <AbsoluteFill key={i} style={{background: `radial-gradient(circle at ${20 + rnd(i) * 60}% ${30 + rnd(i + 4) * 40}%, rgba(255,255,255,${0.95 * k}) 0%, rgba(255,255,255,${0.35 * k}) 30%, rgba(255,255,255,0) 60%)`}} /> : null;
          })}
          <Ticker t={t} t0={c('anuncio') - 0.1} t1={tIsla + 0.4} text="ARGENTINA ANUNCIA REACCIONES TERMONUCLEARES CONTROLADAS  ●  BUENOS AIRES  ●  SORPRESA EN EL MUNDO  ●" />
        </AbsoluteFill>
      ) : null}
      <Leader t={t} t0={-0.45} dur={1.3} />

      {/* la isla secreta */}
      {between(t, tIsla, tArg + 0.4) ? (
        <AbsoluteFill style={{opacity: prog(t, tIsla, 0.4)}}>
          <IslandShot s={{t, build: 1, reactor: 1, lit: 0.6}} cam={camPath(t - tIsla, [[0, ISL_WIDE], [0.2, {pos: [3, 11, 30], look: [0, 1, 0], fov: 38}]], 3.0)} />
          <Vig k={0.5} />
          <Stamp t={t} t0={c('secreta')} text="SECRETO" x={1380} y={300} rot={-9} size={96} />
          <Place t={t} t0={c('Patagonia,') - 0.2} a="PATAGONIA" b="UNA ISLA EN UN LAGO" color={K.sun} />
          <div style={{position: 'absolute', left: 60, bottom: 40, fontFamily: F.mono, fontSize: 16, color: 'rgba(243,235,221,0.6)'}}>Recreación 3D</div>
        </AbsoluteFill>
      ) : null}

      {/* la carrera: Argentina vs. EE. UU. y la URSS */}
      {between(t, tArg, tEnc + 0.3) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tArg, 0.35), 1 - prog(t, tEnc, 0.3))}}>
          <SpaceBg t={t} glow="rgba(116,172,223,0.18)" />
          {[
            {k: 'usa' as const, name: 'ESTADOS UNIDOS', t0: c('Estados'), x: 430},
            {k: 'urss' as const, name: 'UNIÓN SOVIÉTICA', t0: c('Unión'), x: 960},
            {k: 'arg' as const, name: 'ARGENTINA', t0: tArg + 0.15, x: 1490},
          ].map((f, i) => {
            const a = pop(t, f.t0, 1.3);
            const win = f.k === 'arg';
            const glow = win ? prog(t, c('conseguido.') - 0.2, 0.5) : 0;
            return t >= f.t0 ? (
              <div key={i} style={{position: 'absolute', left: f.x - 200, top: 300, width: 400, textAlign: 'center', transform: `scale(${Math.min(1.05, a) * (1 + 0.08 * glow)})`, opacity: Math.min(1, a)}}>
                <div style={{display: 'inline-block', boxShadow: win ? `0 0 ${60 * glow}px ${K.celeste}` : '0 20px 50px rgba(0,0,0,0.5)', filter: !win && t > f.t0 + 0.8 ? 'grayscale(0.7) brightness(0.6)' : 'none'}}>
                  <Flag kind={f.k} w={340} />
                </div>
                <div style={{fontFamily: F.head, fontSize: 52, color: K.cream, marginTop: 24, letterSpacing: 2}}>{f.name}</div>
                {!win && t > f.t0 + 0.5 ? <div style={{fontFamily: F.head, fontSize: 130, color: K.red, marginTop: -6, opacity: prog(t, f.t0 + 0.5, 0.25)}}>✕</div> : null}
                {win && glow > 0 ? <div style={{fontFamily: F.head, fontSize: 130, color: K.green, marginTop: -6, opacity: glow}}>✓</div> : null}
              </div>
            ) : null;
          })}
          <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 34, letterSpacing: 6, color: K.mute, opacity: prog(t, tArg, 0.4)}}>LA CARRERA ATÓMICA · 1951</div>
        </AbsoluteFill>
      ) : null}

      {/* el fuego del Sol, dentro de una máquina */}
      {between(t, tEnc, tEn + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tEnc, 0.3), 1 - prog(t, tEn, 0.4))}}>
          <SpaceBg t={t} glow="rgba(255,140,40,0.25)" />
          {(() => {
            const k = easeInOut(prog(t, c('máquina,') - 0.2, 1.0, (x) => x));
            const R = 1150 - 860 * k;
            return (
              <>
                <AbsoluteFill style={{clipPath: `circle(${R}px at 960px 540px)`}}>
                  <ArchiveVideo src="ep11/vid/sol304.mp4" t={t} t0={tEnc} rate={0.55} film={0} dim={0} zoom={[1.3, 1.0]} fade={0.2} />
                </AbsoluteFill>
                <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: k}}>
                  <circle cx={960} cy={540} r={R + 20} fill="none" stroke={K.plasma} strokeWidth={6} />
                  <circle cx={960} cy={540} r={R + 60} fill="none" stroke={K.plasma} strokeWidth={2} strokeDasharray="10 14" opacity={0.6} />
                  {Array.from({length: 16}, (_, i) => {
                    const a = (i / 16) * Math.PI * 2;
                    return <circle key={i} cx={960 + Math.cos(a) * (R + 40)} cy={540 + Math.sin(a) * (R + 40)} r={9} fill="#9AA7B8" />;
                  })}
                  {[-1, 1].map((s) => (
                    <g key={s}>
                      <rect x={960 + s * (R + 90) - (s > 0 ? 0 : 220)} y={500} width={220} height={80} fill="#1A2030" stroke={K.plasma} strokeWidth={3} />
                      <line x1={960 + s * (R + 60)} y1={540} x2={960 + s * (R + 90)} y2={540} stroke={K.plasma} strokeWidth={6} />
                    </g>
                  ))}
                  <text x={960} y={540 + R + 130} textAnchor="middle" fontFamily={F.mono} fontSize={30} fill={K.plasma} letterSpacing={6}>UN SOL EN UNA MÁQUINA</text>
                </svg>
              </>
            );
          })()}
          <ArchCredit text="Sol: NASA SDO / SVS (dominio público)" />
        </AbsoluteFill>
      ) : null}

      {/* energía en envases de medio litro */}
      {between(t, tEn, tPero + 0.3) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tEn, 0.35), 1 - prog(t, tPero, 0.3))}}>
          <SpaceBg t={t} glow="rgba(255,150,50,0.22)" y={60} />
          <div style={{position: 'absolute', left: 260, right: 260, top: 840, height: 16, background: '#3A2F25', boxShadow: '0 10px 30px rgba(0,0,0,0.6)'}} />
          {[0, 1, 2].map((i) => {
            const t0 = tEn + 0.2 + i * 0.35;
            const crack = prog(t, tMent + 0.1 + i * 0.12, 0.5);
            const fill = easeOut(prog(t, t0, 1.4)) * (1 - 0.85 * prog(t, tMent + 0.5, 0.8));
            const shake = crack > 0 && crack < 1 ? Math.sin(t * 70 + i) * 6 * (1 - crack) : 0;
            const bob = Math.sin(t * 1.7 + i * 1.3) * 10 * (1 - crack);
            const push = 1 + 0.07 * clamp((t - tEn) / 7);
            return t >= t0 - 0.05 ? <MilkBottle key={i} t={t} x={960 + (660 + i * 300 - 960) * push + shake} y={640 + bob} s={push} fill={fill} glow={fill} crack={crack} o={prog(t, t0, 0.3)} rot={(i === 1 ? 0 : (i - 1) * 3) + Math.sin(t * 1.3 + i) * 1.5} /> : null;
          })}
          <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', opacity: fadeIO(t, tEn, tMent + 0.2)}}>
            <div style={{fontFamily: F.head, fontSize: 92, color: K.sun, letterSpacing: 3, textShadow: '0 0 40px rgba(255,160,60,0.5)'}}>ENERGÍA CASI INFINITA Y BARATA</div>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 920, textAlign: 'center', opacity: fadeIO(t, c('según') - 0.1, tMent + 0.2)}}>
            <span style={{fontFamily: F.quote, fontStyle: 'italic', fontSize: 44, color: K.cream}}>“En envases de medio litro, como la leche”</span>
            <span style={{fontFamily: F.body, fontWeight: 700, fontSize: 28, color: K.mute, marginLeft: 20, letterSpacing: 2}}>— PERÓN</span>
          </div>
          <Stamp t={t} t0={c('mentira.')} text="MENTIRA" x={960} y={420} rot={-7} size={190} />
        </AbsoluteFill>
      ) : null}

      {/* lo que esa mentira terminó creando (adelanto) */}
      {between(t, tPero, TITLE + 0.05) ? (
        <AbsoluteFill style={{opacity: prog(t, tPero, 0.3)}}>
          <SpaceBg t={t} glow="rgba(92,214,255,0.12)" />
          {t < tEs + 0.05 ? (
            <div style={{position: 'absolute', inset: 0, transform: `scale(${1 + 0.06 * clamp((t - tPero) / 3)})`}}>
              <Big t={t} t0={tPero + 0.1} text="LO MÁS INCREÍBLE NO ES LA MENTIRA" size={96} color={K.cream} y={520} />
            </div>
          ) : null}
          <Embers t={t} n={40} o={0.6} />
          {['ep11/img/ib2.jpg', 'ep11/img/ra6_int.jpg', 'ep11/img/w7x.jpg', 'ep11/img/arsat1.jpg'].map((src, i) => {
            const t0 = tEs + 0.1 + i * 0.42;
            if (t < t0 || t > TITLE) return null;
            const k = prog(t, t0, 0.18);
            return (
              <div key={i} style={{position: 'absolute', left: 160 + i * 410, top: 300, width: 380, height: 480, overflow: 'hidden', borderRadius: 14, opacity: k, transform: `translateY(${(1 - k) * 40}px) rotate(${(i - 1.5) * 2}deg)`, boxShadow: '0 30px 60px rgba(0,0,0,0.6)'}}>
                <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: `blur(${14 - 10 * prog(t, t0, 1.0)}px) brightness(0.75)`}} />
                <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.head, fontSize: 200, color: 'rgba(255,255,255,0.85)'}}>?</div>
              </div>
            );
          })}
          {t > tEs ? <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: F.head, fontSize: 70, color: K.plasma, letterSpacing: 3, opacity: prog(t, tEs, 0.3)}}>ES LO QUE TERMINÓ CREANDO</div> : null}
        </AbsoluteFill>
      ) : null}

      {/* placa de título */}
      {t >= TITLE ? <TitleCard t={t - TITLE} /> : null}
    </AbsoluteFill>
  );
};

export const TitleCard: React.FC<{t: number}> = ({t}) => {
  const rise = easeOut(prog(t, 0, 1.6));
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      <SpaceBg t={t} glow="rgba(255,140,40,0.2)" y={70} />
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% ${122 - 36 * rise}%, #FFF4D0 0%, #FFC050 6%, #FF7A1A 13%, rgba(255,90,20,0.35) 24%, rgba(0,0,0,0) 46%)`}} />
      <Embers t={t} n={60} o={0.8} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center'}}>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 12, color: K.cream, opacity: prog(t, 0.2, 0.4)}}>CONTEXTO · EPISODIO 11</div>
        <div style={{fontFamily: F.head, fontSize: 210, color: K.cream, letterSpacing: 10, lineHeight: 1.05, marginTop: 10, transform: `scale(${1.15 - 0.15 * easeOut(prog(t, 0.1, 0.9))})`, opacity: prog(t, 0.1, 0.4), textShadow: '0 0 60px rgba(255,140,40,0.55), 0 14px 50px rgba(0,0,0,0.8)'}}>EL SOL DE PERÓN</div>
        <div style={{fontFamily: TYPE, fontSize: 38, color: K.sun, letterSpacing: 4, marginTop: 18, opacity: prog(t, 0.8, 0.5)}}>LA MENTIRA NUCLEAR QUE TERMINÓ SALIENDO BIEN</div>
      </div>
      <FilmFX t={t} k={0.4} />
    </AbsoluteFill>
  );
};

/* ============================================================ S02 — Richter */
const MAP_EU: MapView = {lon: -22, lat: 12, scale: 12.5};
export const S02: React.FC<{t: number}> = ({t}) => {
  const c = C('s02');
  const tMap = c('En mil'), tTank = c('recomendado') - 0.2, tProm = c('Y le prometió'), tMedia = c('Perón contaría'), tDieron = c('Le dieron'), tIsla = c('y una isla');
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {t < tMap + 0.4 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tMap, 0.4)}}>
          <FullPhoto src="ep11/img/richter.jpg" t={t} t0={-0.3} zoom={[1.02, 1.14]} focus="50% 30%" bw dim={0.3} />
          <FilmFX t={t} k={0.6} />
          <NameTag t={t} t0={c('Ronald') - 0.1} name="RONALD RICHTER" role="FÍSICO AUSTRÍACO · 1909–1991" />
          {t > c('casi nadie') ? <Stamp t={t} t0={c('casi nadie')} text="¿QUIÉN ES?" x={1430} y={330} rot={6} size={80} color={K.sun} /> : null}
          <ArchCredit text="Foto: Wikimedia Commons (dominio público)" />
        </AbsoluteFill>
      ) : null}

      {between(t, tMap, tTank + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tMap, 0.4), 1 - prog(t, tTank, 0.4))}}>
          <FlatMap v={MAP_EU} sea="#081019" land="#1C2533" stroke="rgba(160,190,230,0.25)" hl={{ARG: '#2E5F8C', AUT: '#7A5A30'}}>
            <MapRoute v={MAP_EU} pts={[[14.5, 47.6], [-58.4, -34.6]]} p={easeInOut(prog(t, tMap + 0.4, 2.4, (x) => x))} color={K.sun} curve={0.25} width={6} />
            <MapPin v={MAP_EU} lon={14.5} lat={47.6} label="AUSTRIA" o={prog(t, tMap + 0.2, 0.4)} color={K.sun} />
            <MapPin v={MAP_EU} lon={-58.4} lat={-34.6} label="BUENOS AIRES" o={prog(t, c('Buenos') - 0.1, 0.4)} color={K.celeste} side="r" />
          </FlatMap>
          <YearRoll t={t} t0={tMap} from={1945} to={1948} dur={1.2} x={1500} y={300} size={170} color={K.cream} />
        </AbsoluteFill>
      ) : null}

      {between(t, tTank, tProm + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tTank, 0.4), 1 - prog(t, tProm, 0.4))}}>
          <ArchiveVideo src="ep11/vid/pq_despegue.mp4" t={t} t0={tTank} t1={tProm + 0.4} bw sepia zoom={[1.05, 1.12]} credit="Sucesos Argentinos · Wikimedia Commons (CC BY-SA 4.0)" />
          <PhotoCard t={t} t0={tTank + 0.4} src="ep11/img/tank.jpg" x={420} y={430} w={420} h={520} rot={-3} caption="KURT TANK" capSize={30} />
          <NameTag t={t} t0={c('el ingeniero') - 0.1} name="AVIONES A REACCIÓN" role="EL PULQUI II, DISEÑADO POR TANK" x={760} y={830} />
        </AbsoluteFill>
      ) : null}

      {between(t, tProm, tMedia + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tProm, 0.4), 1 - prog(t, tMedia, 0.4))}}>
          <ArchiveVideo src="ep11/vid/pq_peron.mp4" t={t} t0={tProm} t1={tMedia + 0.4} bw sepia zoom={[1.08, 1.18]} focus="50% 35%" dim={0.45} credit="Sucesos Argentinos · Wikimedia Commons (CC BY-SA 4.0)" />
          <Big t={t} t0={c('una Argentina') - 0.05} text="UNA ARGENTINA POTENCIA ATÓMICA" size={104} y={800} hl={{ATÓMICA: K.sun, ARGENTINA: K.celeste}} />
        </AbsoluteFill>
      ) : null}

      {between(t, tMedia, tDieron + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tMedia, 0.4), 1 - prog(t, tDieron, 0.4))}}>
          <SpaceBg t={t} glow="rgba(232,195,106,0.16)" />
          <PhotoCard t={t} t0={tMedia} src="ep11/img/richter_peron.jpg" x={640} y={510} w={820} h={462} rot={-2} caption="Richter y Perón" focus="50% 40%" />
          {(() => {
            const t0 = c('media hora,') - 0.1;
            const k = easeInOut(prog(t, t0, 1.6, (x) => x));
            const a = k * Math.PI * 2 * 0.5;
            return t > t0 - 0.2 ? (
              <div style={{position: 'absolute', left: 1240, top: 230, width: 520, textAlign: 'center', opacity: prog(t, t0 - 0.2, 0.3)}}>
                <svg width={340} height={340} viewBox="-170 -170 340 340">
                  <circle r={150} fill="#11141C" stroke={K.cream} strokeWidth={8} />
                  <path d={`M0 0 L0 -140 A140 140 0 ${k > 0.5 ? 1 : 0} 1 ${Math.sin(a * 2) * 140} ${-Math.cos(a * 2) * 140} Z`} fill={K.sun} opacity={0.75} />
                  <line x1={0} y1={0} x2={Math.sin(a * 2) * 120} y2={-Math.cos(a * 2) * 120} stroke={K.cream} strokeWidth={8} strokeLinecap="round" />
                  <rect x={-22} y={-196} width={44} height={30} rx={6} fill={K.cream} />
                </svg>
                <div style={{fontFamily: F.head, fontSize: 90, color: K.cream, marginTop: 6}}>{String(Math.round(30 * k)).padStart(2, '0')}:00</div>
                <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, color: K.sun, letterSpacing: 3, marginTop: 8, opacity: prog(t, c('todos') - 0.1, 0.4)}}>TODOS LOS SECRETOS</div>
                <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, color: K.sun, letterSpacing: 3, opacity: prog(t, c('física') - 0.1, 0.4)}}>DE LA FÍSICA NUCLEAR</div>
              </div>
            ) : null;
          })()}
          <ArchCredit text="Foto: Wikimedia Commons (dominio público)" />
        </AbsoluteFill>
      ) : null}

      {between(t, tDieron, tIsla + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tDieron, 0.4), 1 - prog(t, tIsla, 0.4))}}>
          <FullPhoto src="ep11/img/richter_lab.jpg" t={t} t0={tDieron} zoom={[1.05, 1.15]} bw dim={0.55} />
          <FilmFX t={t} k={0.5} />
          <Chip t={t} t0={c('plata,') - 0.05} text="PLATA" x={360} y={330} color={K.sun} size={64} />
          <Chip t={t} t0={c('obreros,') - 0.05} text="OBREROS" x={760} y={470} color={K.cream} size={64} />
          <Stamp t={t} t0={c('secreto') - 0.05} text="SECRETO ABSOLUTO" x={1250} y={640} rot={-6} size={96} />
        </AbsoluteFill>
      ) : null}

      {t >= tIsla ? <IslaReveal t={t} t0={tIsla} tB={c('Bariloche.') - 0.3} tH={c('La isla') - 0.1} /> : null}
    </AbsoluteFill>
  );
};
const MAP_AR: MapView = {lon: -64, lat: -38.5, scale: 40};
const IslaReveal: React.FC<{t: number; t0: number; tB: number; tH: number}> = ({t, t0, tB, tH}) => {
  const [bx, by] = mapXY(MAP_AR, -71.3, -41.13);
  return (
    <AbsoluteFill style={{opacity: prog(t, t0, 0.4)}}>
      {t < tH + 0.5 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tH, 0.5), transform: `scale(${(1 + 0.08 * clamp((t - t0) / 4)) * (1 + 0.9 * easeIn(prog(t, tB + 0.4, 1.4, (x) => x)))})`, transformOrigin: `${bx}px ${by}px`}}>
          <FlatMap v={MAP_AR} sea="#081019" land="#1C2533" stroke="rgba(160,190,230,0.3)" hl={{ARG: '#2E5F8C'}}>
            <MapPin v={MAP_AR} lon={-71.3} lat={-41.13} label="BARILOCHE" sub="LAGO NAHUEL HUAPI" o={prog(t, tB - 0.6, 0.4)} color={K.sun} side="r" size={40} />
            <MapPin v={MAP_AR} lon={-58.4} lat={-34.6} label="BUENOS AIRES" o={0.7} color={K.celeste} side="r" />
          </FlatMap>
        </AbsoluteFill>
      ) : null}
      {t > tH - 0.1 ? (
        <AbsoluteFill style={{opacity: prog(t, tH - 0.1, 0.5)}}>
          <FullPhoto src="ep11/img/isla.jpg" t={t} t0={tH - 0.1} zoom={[1.0, 1.08]} focus="46% 66%" dim={0.15} />
          <MarkerCircle t={t} t0={tH + 0.3} x={890} y={720} rx={170} ry={70} color={K.sun} />
          <div style={{position: 'absolute', left: 1080, top: 600, fontFamily: F.head, fontSize: 84, color: K.cream, textShadow: '0 6px 24px rgba(0,0,0,0.8)', opacity: prog(t, tH + 0.5, 0.4)}}>ISLA HUEMUL</div>
          <ArchCredit text="Foto: Gonce · Wikimedia Commons (CC BY-SA 4.0)" />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* ============================================================ S03 — la ciudad científica y el reactor demolido */
export const S03: React.FC<{t: number}> = ({t}) => {
  const c = C('s03');
  const tCity = c('se levantó') - 0.3, tCil = c('un cilindro') - 0.2, tAlg = c('respondía') - 0.7, tCost = c('El proyecto') - 0.1;
  const tCrack = c('Antes'), tDem = c('mandó');
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {t < tCity + 0.4 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tCity, 0.4)}}>
          <ArchiveVideo src="ep11/vid/lago.mp4" t={t} t0={-0.3} film={0} zoom={[1.05, 1.1]} dim={0.2} credit="Video: Erico Schulz · Wikimedia Commons (CC BY 3.0)" />
          <Place t={t} t0={0.1} a="PATAGONIA" b="BOSQUES Y AGUA HELADA" color={K.sun} />
        </AbsoluteFill>
      ) : null}
      {between(t, tCity, tCil + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tCity, 0.4), 1 - prog(t, tCil, 0.4))}}>
          <IslandShot
            s={{t, build: prog(t, tCity + 0.2, 2.4, (x) => x), reactor: prog(t, c('reactor') - 0.1, 1.0), lit: 0.4}}
            cam={camPath(t - tCity, [[0, ISL_HIGH], [0.6, {pos: [9, 12, 22], look: [0, 1, 0], fov: 36}], [3.2, ISL_REACT]], 2.2)}
          />
          <Vig k={0.45} />
          <Big t={t} t0={c('ciudad') - 0.1} t1={c('con un') + 0.1} text="UNA CIUDAD CIENTÍFICA DE LA NADA" size={80} y={140} />
          <div style={{position: 'absolute', left: 60, bottom: 40, fontFamily: F.mono, fontSize: 16, color: 'rgba(243,235,221,0.6)'}}>Recreación 3D</div>
        </AbsoluteFill>
      ) : null}
      {between(t, tCil, tAlg + 0.4) ? <ReactorShot t={t} c={c} t0={tCil} t1={tAlg} tCrack={tCrack} tDem={tDem} /> : null}
      {between(t, tAlg, tCost + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tAlg, 0.4), 1 - prog(t, tCost, 0.4))}}>
          <FullPhoto src="ep11/img/richter_lab.jpg" t={t} t0={tAlg} zoom={[1.18, 1.3]} focus="68% 55%" bw dim={0.5} />
          <FilmFX t={t} k={0.6} />
          <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(5,6,11,0.92) 0%, rgba(5,6,11,0.75) 45%, rgba(5,6,11,0) 75%)'}} />
          <div style={{position: 'absolute', left: 150, top: 380, width: 1300}}>
            <Typed t={t} t0={c('es que') - 0.1} text={'—Es que usted\nno sabe mi secreto.'} cps={20} size={92} color={K.cream} style={{textShadow: '0 4px 20px rgba(0,0,0,0.9)'}} />
          </div>
          <div style={{position: 'absolute', left: 150, top: 290, fontFamily: F.body, fontWeight: 800, fontSize: 34, color: K.sun, letterSpacing: 5, opacity: prog(t, c('respondía') - 0.1, 0.4)}}>LA RESPUESTA DE RICHTER, SIEMPRE</div>
          <ArchCredit text="Richter en su laboratorio · Wikimedia Commons (dominio público)" />
        </AbsoluteFill>
      ) : null}
      {t >= tCost ? (
        <AbsoluteFill style={{opacity: prog(t, tCost, 0.4)}}>
          <SpaceBg t={t} glow="rgba(232,195,106,0.16)" />
          <MoneyCount t={t} t0={c('unos quince') - 0.1} to={15000000} dur={1.3} label="LO QUE COSTÓ EL PROYECTO (DÓLARES DE ENTONCES)" y={380} size={150} color={K.gold} />
          {t > c('Hoy') - 0.1 ? <MoneyCount t={t} t0={c('Hoy') - 0.1} to={500000000} dur={1.6} prefix="+ US$ " label="HOY SERÍAN" y={720} size={150} color={K.sun} /> : null}
          <ArchCredit text="Estimación: 62,5 millones de pesos de la época" x={96} align="left" />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

const ReactorShot: React.FC<{t: number; c: (p: string, n?: number, w?: 's' | 'e') => number; t0: number; t1: number; tCrack: number; tDem: number}> = ({t, c, t0, t1, tCrack, tDem}) => {
  const cam: Cam = camPath(t - t0, [[0, RX_LOW], [0.3, RX_CAM], [tCrack - t0 - 0.2, {pos: [3, 5.5, 18], look: [0, 4, 0], fov: 38}], [tDem - t0 + 0.2, {pos: [10, 12, 26], look: [0, 2.5, 0], fov: 40}]], 2.0);
  const crack = prog(t, tCrack + 0.3, 2.6, (x) => x);
  const dem = prog(t, tDem + 0.1, 2.2, (x) => x);
  const p = (v: [number, number, number]) => project(cam, v);
  const [l1, l2] = [p([-6, 9.6, 0]), p([6, 9.6, 0])];
  const [w1, w2] = [p([2, 9.4, 0]), p([6, 9.4, 0])];
  const hu = p([7.6, 2.1, 3.2]);
  const showDims = t < tCrack + 0.3;
  return (
    <AbsoluteFill style={{opacity: Math.min(prog(t, t0, 0.4), 1 - prog(t, t1, 0.4))}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #2C3E5C 0%, #6F86A6 45%, #A9B4C2 62%, #5A5A58 100%)'}} />
      <Stage cam={cam} key0={[18, 24, 22]} keyI={2.2} fill={1.0} shadow={26} rimColor="#9FB6FF">
        <Reactor3D t={t} build={1} crack={crack} demolish={dem} />
      </Stage>
      {showDims ? (
        <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
          <g opacity={fadeIO(t, c('doce') - 0.2, tCrack + 0.3)}>
            <line x1={l1[0]} y1={l1[1]} x2={l2[0]} y2={l2[1]} stroke={K.sun} strokeWidth={5} />
            <circle cx={l1[0]} cy={l1[1]} r={8} fill={K.sun} />
            <circle cx={l2[0]} cy={l2[1]} r={8} fill={K.sun} />
            <text x={(l1[0] + l2[0]) / 2} y={(l1[1] + l2[1]) / 2 - 22} textAnchor="middle" fontFamily={F.head} fontSize={76} fill={K.cream} stroke="#000" strokeWidth={8} paintOrder="stroke">12 METROS</text>
          </g>
          <g opacity={fadeIO(t, c('paredes') - 0.2, tCrack + 0.3)}>
            <line x1={w1[0]} y1={w1[1] + 40} x2={w2[0]} y2={w2[1] + 40} stroke={K.plasma} strokeWidth={5} />
            <text x={(w1[0] + w2[0]) / 2} y={(w1[1] + w2[1]) / 2 + 100} textAnchor="middle" fontFamily={F.head} fontSize={54} fill={K.plasma} stroke="#000" strokeWidth={7} paintOrder="stroke">PAREDES DE 4 M</text>
          </g>
          <g opacity={fadeIO(t, c('un cilindro') + 0.3, tCrack + 0.3)}>
            <text x={hu[0] + 30} y={hu[1]} fontFamily={F.mono} fontSize={26} fill={K.cream} stroke="#000" strokeWidth={5} paintOrder="stroke">1,80 m</text>
          </g>
        </svg>
      ) : null}
      {t > c('grieta') - 0.1 ? <Stamp t={t} t0={c('grieta') - 0.05} t1={tDem + 0.2} text="¿UNA GRIETA?" x={1450} y={250} rot={7} size={84} color={K.red} /> : null}
      {t > tDem ? <Big t={t} t0={tDem + 0.2} text="LO MANDÓ DEMOLER" size={100} y={150} color={K.red} /> : null}
      <div style={{position: 'absolute', left: 60, bottom: 40, fontFamily: F.mono, fontSize: 16, color: 'rgba(243,235,221,0.6)'}}>Recreación 3D con las medidas del reactor original</div>
    </AbsoluteFill>
  );
};

/* ============================================================ S04 — qué es la fusión */
export const S04: React.FC<{t: number}> = ({t}) => {
  const c = C('s04');
  const tSun = c('En el centro') - 0.2, tNuc = c('los núcleos') - 0.3, tTierra = c('En la Tierra,') - 0.2, tBomba = c('La fusión') - 0.15, tCtrl = c('Controlarla,');
  const tPegan = c('se pegan.') + 0.05, tLib = c('liberan') - 0.6;
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {t < tSun + 0.4 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tSun, 0.4)}}>
          <SpaceBg t={t} glow="rgba(255,140,40,0.22)" />
          <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 40, letterSpacing: 6, color: K.mute, opacity: prog(t, 0.0, 0.4)}}>¿QUÉ DECÍA HABER LOGRADO?</div>
          <Big t={t} t0={c('Fusión') - 0.05} text="FUSIÓN NUCLEAR" size={200} y={540} color={K.sun} />
        </AbsoluteFill>
      ) : null}
      {between(t, tSun, tNuc + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tSun, 0.4), 1 - prog(t, tNuc, 0.4))}}>
          <SpaceBg t={t} glow="rgba(255,120,30,0.15)" />
          <Stage cam={camPath(t - tSun, [[0, {pos: [0, 0, 16], look: [0, 0, 0], fov: 40}], [0.1, {pos: [0, 0, 10.5], look: [0, 0, 0], fov: 40}]], 3.2)} keyI={0.4} fill={0.3}>
            <Sun3D t={t} r={3} core={prog(t, c('centro') - 0.1, 1.0)} />
          </Stage>
          <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
            {t > c('gravedad') - 0.1
              ? Array.from({length: 8}, (_, i) => {
                  const a = (i / 8) * Math.PI * 2 + 0.3;
                  const k = prog(t, c('gravedad') - 0.1 + i * 0.05, 0.5);
                  const pulse = 1 - 0.08 * Math.sin((t - c('aprieta')) * 8);
                  const r0 = 470 * pulse, r1 = 340 * pulse;
                  return (
                    <g key={i} opacity={k}>
                      <line x1={960 + Math.cos(a) * r0} y1={540 + Math.sin(a) * r0} x2={960 + Math.cos(a) * r1} y2={540 + Math.sin(a) * r1} stroke={K.plasma} strokeWidth={8} strokeLinecap="round" />
                      <polygon points={`${960 + Math.cos(a) * (r1 - 10)},${540 + Math.sin(a) * (r1 - 10)} ${960 + Math.cos(a + 0.06) * (r1 + 30)},${540 + Math.sin(a + 0.06) * (r1 + 30)} ${960 + Math.cos(a - 0.06) * (r1 + 30)},${540 + Math.sin(a - 0.06) * (r1 + 30)}`} fill={K.plasma} />
                    </g>
                  );
                })
              : null}
          </svg>
          <div style={{position: 'absolute', left: 1400, top: 420, opacity: prog(t, c('quince') - 0.1, 0.4)}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 28, letterSpacing: 4, color: K.mute}}>CENTRO DEL SOL</div>
            <div style={{fontFamily: F.head, fontSize: 104, color: K.cream, lineHeight: 1}}>15.000.000 °C</div>
          </div>
          {t > c('gravedad') - 0.1 ? <div style={{position: 'absolute', left: 150, top: 470, fontFamily: F.head, fontSize: 80, color: K.plasma, opacity: prog(t, c('gravedad') - 0.1, 0.4)}}>GRAVEDAD</div> : null}
          <ArchCredit text="Recreación 3D" />
        </AbsoluteFill>
      ) : null}
      {between(t, tNuc, tTierra + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tNuc, 0.4), 1 - prog(t, tTierra, 0.4))}}>
          <SpaceBg t={t} glow="rgba(255,150,60,0.18)" />
          {(() => {
            const k = clamp((t - tNuc - 0.2) / (tPegan - tNuc - 0.2));
            const f = t > tLib ? clamp((t - tLib) / 2.2) : 0;
            return (
              <>
                <Stage cam={FUSION_CAM} keyI={1.6} fill={0.8} key0={[4, 8, 10]}>
                  <Fusion3D t={t} k={f > 0 ? 1 : k} f={f} />
                </Stage>
                {f === 0 ? (
                  <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: 1 - prog(t, tPegan - 0.3, 0.3)}}>
                    <text x={project(FUSION_CAM, [-2.9 * (1 - easeInOut(k)) - 0.4, 0, 0])[0]} y={380} textAnchor="middle" fontFamily={F.head} fontSize={46} fill={K.cream}>HIDRÓGENO</text>
                    <text x={project(FUSION_CAM, [2.9 * (1 - easeInOut(k)) + 0.45, 0, 0])[0]} y={760} textAnchor="middle" fontFamily={F.head} fontSize={46} fill={K.cream}>HIDRÓGENO</text>
                  </svg>
                ) : (
                  <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: prog(t, tLib + 0.3, 0.4)}}>
                    <text x={project(FUSION_CAM, [-(clamp((t - tLib) / 2.2)) * 1.2, 0, 0])[0]} y={330} textAnchor="middle" fontFamily={F.head} fontSize={56} fill={K.cream}>HELIO</text>
                  </svg>
                )}
                {f > 0 ? <Big t={t} t0={c('muchísima') - 0.1} text="MUCHÍSIMA ENERGÍA" size={110} y={900} color={K.sun} /> : null}
                <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 32, letterSpacing: 5, color: K.mute, opacity: prog(t, tNuc + 0.2, 0.4)}}>CHOCAN Y SE PEGAN</div>
              </>
            );
          })()}
        </AbsoluteFill>
      ) : null}
      {between(t, tTierra, tBomba + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tTierra, 0.4), 1 - prog(t, tBomba, 0.4))}}>
          <SpaceBg t={t} glow="rgba(92,214,255,0.12)" />
          <Embers t={t} n={36} o={0.5} color="#9FE6FF" />
          <div style={{position: 'absolute', inset: 0, transform: `scale(${1 + 0.06 * clamp((t - tTierra) / 7)})`, transformOrigin: '30% 50%'}}>
          <div style={{position: 'absolute', left: 220, top: 200, fontFamily: F.head, fontSize: 76, color: K.cream}}>EN LA TIERRA, SIN ESA GRAVEDAD…</div>
          <EnergyBar t={t} t0={tTierra + 0.6} label="CENTRO DEL SOL" value="15 MILLONES °C" frac={0.17} color={K.sun2} y={420} />
          <EnergyBar t={t} t0={c('decenas') - 0.3} label="LO QUE HACE FALTA EN UN REACTOR" value="DECENAS DE MILLONES °C" frac={0.62} color={K.plasma} y={620} />
          <div style={{position: 'absolute', left: 220, top: 840, fontFamily: F.body, fontWeight: 700, fontSize: 30, color: K.mute, opacity: prog(t, c('decenas') + 0.6, 0.4)}}>Los reactores actuales apuntan a más de 100 millones de grados.</div>
          </div>
        </AbsoluteFill>
      ) : null}
      {t >= tBomba ? (
        <AbsoluteFill style={{opacity: prog(t, tBomba, 0.4)}}>
          <ArchiveVideo src="ep11/vid/ivy_fuego.mp4" t={t} t0={tBomba} t1={c('bomba') + 0.3} zoom={[1.0, 1.08]} film={0.6} credit="Operación Ivy, 1952 · Departamento de Energía de EE. UU. (dominio público)" />
          <ArchiveVideo src="ep11/vid/ivy_hongo.mp4" t={t} t0={c('bomba') + 0.0} from={6} zoom={[1.0, 1.1]} film={0.6} dim={0.3} credit="Operación Ivy, 1952 · Departamento de Energía de EE. UU. (dominio público)" />
          <Big t={t} t0={c('sin control') - 0.2} t1={c('bomba') + 0.3} text="FUSIÓN SIN CONTROL" size={110} y={170} color={K.cream} />
          <NameTag t={t} t0={c('bomba') + 0.3} t1={tCtrl + 0.2} name="LA BOMBA DE HIDRÓGENO" role="IVY MIKE · EE. UU. · 1 DE NOVIEMBRE DE 1952" />
          {t > tCtrl - 0.2 ? (
            <AbsoluteFill style={{background: `rgba(5,6,11,${0.55 * prog(t, tCtrl - 0.2, 0.5)})`}}>
              <Big t={t} t0={tCtrl} text="CONTROLARLA:" size={110} y={430} color={K.cream} />
              <Big t={t} t0={c('sueño') - 0.1} text="EL SUEÑO IMPOSIBLE" size={150} y={600} color={K.plasma} />
            </AbsoluteFill>
          ) : null}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* ============================================================ S05 — el anuncio y los que no le creyeron */
export const S05: React.FC<{t: number}> = ({t}) => {
  const c = C('s05');
  const tNot = c('y la noticia') - 0.1, tPero = c('Pero los'), tTel = c('el padre') - 1.3, tIsla = c('Y en la isla') - 0.1, tPoll = c('Antes') - 0.1;
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {t < tNot + 0.4 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tNot, 0.4)}}>
          <SpaceBg t={t} glow="rgba(255,150,60,0.18)" />
          <FilmFrame src="ep11/img/richter_lab.jpg" image t={t} t0={-0.2} x={1180} y={540} w={980} h={620} rot={2} label="LABORATORIO DE RICHTER" />
          <DateCard t={t} t0={c('dieciséis') - 0.2} d={16} m={2} y={1951} x={400} yPos={420} label="“LO CONSEGUÍ”" color={K.red} />
          {[0, 0.3, 0.5].map((d, i) => {
            const t0 = c('conseguido,') + d;
            const k = t >= t0 && t < t0 + 0.15 ? 1 - (t - t0) / 0.15 : 0;
            return k > 0 ? <AbsoluteFill key={i} style={{background: `rgba(160,220,255,${0.6 * k})`}} /> : null;
          })}
        </AbsoluteFill>
      ) : null}
      {between(t, tNot, tTel + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tNot, 0.3), 1 - prog(t, tTel, 0.4))}}>
          <SpaceBg t={t} glow="rgba(232,195,106,0.12)" />
          <Newspaper t={t} t0={tNot + 0.1} x={450} y={560} w={600} rot={-6} masthead="EL DIARIO" date="25 DE MARZO DE 1951" head="La Argentina domina la energía atómica" sub="Anuncio del presidente desde la Casa Rosada" />
          <Newspaper t={t} t0={tNot + 0.55} x={970} y={520} w={600} rot={3} masthead="THE DAILY NEWS" date="MARCH 25, 1951" head="Argentina claims atomic power" sub="Physicists abroad ask for proof" dark />
          <Newspaper t={t} t0={tNot + 1.0} x={1480} y={590} w={580} rot={-2} masthead="LE QUOTIDIEN" date="25 MARS 1951" head="L'Argentine et le secret de l'atome" />
          {t > tPero ? (
            <>
              <AbsoluteFill style={{background: `rgba(5,6,11,${0.5 * prog(t, tPero, 0.4)})`}} />
              {[450, 970, 1480].map((x, i) => (
                <Stamp key={i} t={t} t0={tPero + 0.3 + i * 0.25} text="?" x={x} y={520} rot={(i - 1) * 8} size={220} color={K.red} />
              ))}
              <Big t={t} t0={c('no le') - 0.1} text="LOS FÍSICOS NO LE CREÍAN" size={96} y={930} color={K.cream} />
            </>
          ) : null}
          <ArchCredit text="Diarios: recreación" x={96} align="left" />
        </AbsoluteFill>
      ) : null}
      {between(t, tTel, tIsla + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tTel, 0.4), 1 - prog(t, tIsla, 0.4))}}>
          <AbsoluteFill style={{left: 0, width: 760}}>
            <FullPhoto src="ep11/img/teller.jpg" t={t} t0={tTel} zoom={[1.0, 1.08]} focus="50% 35%" bw dim={0.2} />
          </AbsoluteFill>
          <AbsoluteFill style={{left: 760, background: 'linear-gradient(90deg, rgba(5,6,11,0.0) 0%, #05060B 6%)'}} />
          <NameTag t={t} t0={tTel + 0.3} name="EDWARD TELLER" role="“PADRE” DE LA BOMBA H" x={60} y={860} />
          <QuoteCard
            t={t}
            t0={c('leyendo') - 0.3}
            x={1340}
            y={520}
            w={1000}
            size={62}
            lines={[
              {text: 'Leyendo una línea,', t0: c('leyendo') - 0.1},
              {text: 'uno piensa que es un genio.', t0: c('uno piensa') - 0.1, color: K.green},
              {text: 'Leyendo la siguiente,', t0: c('Leyendo la') - 0.1},
              {text: 'se da cuenta de que está loco.', t0: c('se da') - 0.1, color: K.red},
            ]}
          />
          <ArchCredit text="Foto: Wikimedia Commons (dominio público)" />
        </AbsoluteFill>
      ) : null}
      {between(t, tIsla, tPoll + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tIsla, 0.4), 1 - prog(t, tPoll, 0.4))}}>
          <IslandShot s={{t, build: 1, reactor: 1, lit: 0.5}} cam={camPath(t - tIsla, [[0, ISL_LOW], [0.1, {pos: [-6, 7, 26], look: [0, 1.5, 0], fov: 36}]], 4)} />
          <AbsoluteFill style={{background: 'rgba(5,6,11,0.6)'}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center'}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 34, letterSpacing: 5, color: K.cream, opacity: prog(t, tIsla + 0.3, 0.4)}}>FÍSICOS ARGENTINOS DE RENOMBRE EN LA ISLA</div>
            <div style={{fontFamily: F.head, fontSize: 340, color: K.red, lineHeight: 1, transform: `scale(${Math.min(1.06, pop(t, c('ni un'), 1.2))})`, opacity: prog(t, c('ni un'), 0.2), textShadow: '0 10px 50px rgba(0,0,0,0.8)'}}>0</div>
          </div>
        </AbsoluteFill>
      ) : null}
      {t >= tPoll ? (
        <AbsoluteFill style={{opacity: prog(t, tPoll, 0.4)}}>
          <SpaceBg t={t} glow="rgba(255,178,62,0.16)" />
          <div style={{position: 'absolute', inset: 0, transform: 'scale(1.22)', transformOrigin: '50% 50%'}}>
            <Poll t={t} t0={c('¿vos') - 0.3} q="¿LE HUBIERAS CREÍDO?" a="SÍ, LE CREÍA" b="NO, NI AHÍ" />
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* ============================================================ S06 — la comisión y el informe de Balseiro */
export const S06: React.FC<{t: number}> = ({t}) => {
  const c = C('s06');
  const tSep = c('En septiembre') - 0.1, tBal = c('Entre sus') - 0.1, tInf = c('Y su informe') - 0.1, tTemp = c('Para la') - 0.1, tMed = c('¿Y las') - 0.1, tConc = c('Conclusión:') - 0.1;
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {t < tSep + 0.4 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tSep, 0.4)}}>
          <FullPhoto src="ep11/img/peron_banda.jpg" t={t} t0={-0.3} zoom={[1.0, 1.06]} focus="50% 6%" bw dim={0.35} />
          <FilmFX t={t} k={0.5} />
          <Big t={t} t0={c('dudar.') - 0.2} text="LAS DUDAS" size={130} y={860} color={K.sun} />
          <ArchCredit text="Foto: Casa Rosada (CC BY 2.5 AR)" />
        </AbsoluteFill>
      ) : null}
      {between(t, tSep, tBal + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tSep, 0.4), 1 - prog(t, tBal, 0.4))}}>
          <IslandShot s={{t, build: 1, reactor: 1, boat: prog(t, tSep, 6.0, (x) => x), lit: 0.4}} cam={{pos: [-20, 10, 38], look: [-6, 0.5, 4], fov: 38}} />
          <DateCard t={t} t0={tSep + 0.1} d={5} m={9} y={1952} x={320} yPos={300} label="LLEGA LA COMISIÓN" color={K.plasma} size={0.85} />
          <div style={{position: 'absolute', left: 60, bottom: 40, fontFamily: F.mono, fontSize: 16, color: 'rgba(243,235,221,0.6)'}}>Recreación 3D</div>
        </AbsoluteFill>
      ) : null}
      {between(t, tBal, tInf + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tBal, 0.4), 1 - prog(t, tInf, 0.4))}}>
          <SpaceBg t={t} glow="rgba(92,214,255,0.14)" />
          <PhotoCard t={t} t0={tBal} src="ep11/img/balseiro_frondizi.jpg" x={760} y={470} w={900} h={604} rot={-1.5} caption="José A. Balseiro (con Frondizi, 1960)" focus="50% 40%" />
          <div style={{position: 'absolute', left: 1330, top: 260, textAlign: 'center', width: 460, opacity: prog(t, c('treinta') - 0.1, 0.4)}}>
            <div style={{fontFamily: F.head, fontSize: 240, color: K.plasma, lineHeight: 1}}>33</div>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 34, color: K.cream, letterSpacing: 6}}>AÑOS</div>
            <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 26, color: K.mute, letterSpacing: 3, marginTop: 10, opacity: prog(t, c('casi desconocido:') - 0.1, 0.4)}}>CASI DESCONOCIDO</div>
          </div>
          <NameTag t={t} t0={c('José') - 0.1} name="JOSÉ ANTONIO BALSEIRO" role="FÍSICO ARGENTINO" x={110} y={890} color={K.plasma} />
          <ArchCredit text="Foto: Archivo Familia Balseiro · Wikimedia Commons" />
        </AbsoluteFill>
      ) : null}
      {between(t, tInf, tTemp + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tInf, 0.3), 1 - prog(t, tTemp, 0.4))}}>
          <SpaceBg t={t} glow="rgba(232,195,106,0.12)" />
          <DocSheet t={t} t0={tInf} x={960} y={560} w={1100} h={820} rot={-1.5} title="INFORME TÉCNICO" sub="INSPECCIÓN EN LA ISLA HUEMUL · SEPTIEMBRE DE 1952">
            {Array.from({length: 12}, (_, i) => (
              <div key={i} style={{height: 14, marginBottom: 22, background: '#2A2620', opacity: 0.28, width: `${72 + rnd(i) * 26}%`}} />
            ))}
          </DocSheet>
          <Stamp t={t} t0={c('demoledor.') - 0.1} text="DEMOLEDOR" x={1300} y={720} rot={-10} size={100} />
        </AbsoluteFill>
      ) : null}
      {between(t, tTemp, tMed + 0.4) ? <TempCompare t={t} c={c} t0={tTemp} t1={tMed} /> : null}
      {between(t, tMed, tConc + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tMed, 0.4), 1 - prog(t, tConc, 0.4))}}>
          <SpaceBg t={t} glow="rgba(89,209,138,0.1)" />
          <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', fontFamily: F.head, fontSize: 70, color: K.cream, opacity: prog(t, tMed, 0.4)}}>¿Y LAS MEDICIONES?</div>
          <Scope t={t} t0={c('Los detectores') - 0.3} x={150} y={300} title="REACCIÓN “EXITOSA”" spikes={[c('marcaban'), c('marcaban') + 1.4, c('combustible:') + 0.2, c('chispa') - 0.2]} fuel />
          <Scope t={t} t0={c('aunque') - 0.4} x={1010} y={300} title="SIN COMBUSTIBLE" spikes={[c('marcaban'), c('marcaban') + 1.4, c('combustible:') + 0.2, c('chispa') - 0.2]} fuel={false} />
          <Big t={t} t0={c('lo mismo') - 0.1} t1={c('medían') - 0.1} text="MARCABAN LO MISMO" size={84} y={900} color={K.sun} />
          {t > c('medían') - 0.1 ? <Big t={t} t0={c('medían') - 0.1} text="MEDÍAN LA CHISPA, NO LA FUSIÓN" size={84} y={900} color={K.red} /> : null}
        </AbsoluteFill>
      ) : null}
      {t >= tConc ? (
        <AbsoluteFill style={{opacity: prog(t, tConc, 0.4)}}>
          <SpaceBg t={t} glow="rgba(232,195,106,0.12)" />
          <DocSheet t={t} t0={tConc} x={960} y={540} w={1300} h={760} rot={-1} title="CONCLUSIÓN" sub="Informe de la comisión · 1952">
            <Typed t={t} t0={c('las afirmaciones') - 0.1} text="«Las afirmaciones del doctor Richter no corresponden a hechos comprobados con criterio científico.»" cps={21} size={46} color={K.ink} cursor={false} />
            <div style={{marginTop: 50, fontFamily: F.script, fontSize: 64, color: '#22324A', opacity: prog(t, c('criterio') - 0.2, 0.6)}}>J. A. Balseiro</div>
          </DocSheet>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/** escala lineal: 40 millones de grados vs. los pocos miles del arco eléctrico */
const TempCompare: React.FC<{t: number; c: (p: string, n?: number, w?: 's' | 'e') => number; t0: number; t1: number}> = ({t, c, t0, t1}) => {
  const tNeed = c('cuarenta') - 0.2, tArc = c('Su máquina,') - 0.1, tMiles = c('unos pocos') - 0.1, tOce = c('Como querer') - 0.1;
  const L = 1560, X0 = 180;
  const need = easeOut(prog(t, tNeed, 1.2));
  const mag = prog(t, tMiles, 0.5);
  return (
    <AbsoluteFill style={{opacity: Math.min(prog(t, t0, 0.4), 1 - prog(t, t1, 0.4))}}>
      <SpaceBg t={t} glow="rgba(92,214,255,0.12)" />
      {t < tOce + 0.3 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tOce, 0.3)}}>
          <div style={{position: 'absolute', left: X0, top: 200, fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: K.mute, opacity: prog(t, t0 + 0.2, 0.4)}}>LO QUE HACÍA FALTA</div>
          <div style={{position: 'absolute', left: X0, top: 250, height: 90, width: L * need, background: `linear-gradient(90deg, ${K.sun2}, ${K.sun})`, borderRadius: 10, boxShadow: '0 0 40px rgba(255,140,40,0.5)'}} />
          <div style={{position: 'absolute', left: X0, top: 360, fontFamily: F.head, fontSize: 110, color: K.cream, opacity: prog(t, tNeed + 0.4, 0.4)}}>40.000.000 °C</div>
          <div style={{position: 'absolute', left: X0, top: 600, fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: K.mute, opacity: prog(t, tArc, 0.4)}}>EL ARCO ELÉCTRICO DE RICHTER</div>
          <div style={{position: 'absolute', left: X0, top: 650, height: 90, width: 4, background: K.plasma, opacity: prog(t, tArc + 0.2, 0.2), boxShadow: `0 0 20px ${K.plasma}`}} />
          {mag > 0 ? (
            <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: mag}}>
              <circle cx={X0 + 2} cy={695} r={70} fill="none" stroke={K.cream} strokeWidth={6} />
              <line x1={X0 + 52} y1={745} x2={X0 + 120} y2={820} stroke={K.cream} strokeWidth={14} strokeLinecap="round" />
              <text x={X0 + 160} y={720} fontFamily={F.head} fontSize={90} fill={K.plasma}>≈ 4.000 °C</text>
              <text x={X0 + 160} y={800} fontFamily={F.body} fontWeight={800} fontSize={34} fill={K.mute} letterSpacing={3}>DIEZ MIL VECES MENOS</text>
            </svg>
          ) : null}
          <ArchCredit text="Escala real. Fuente: Informe Balseiro (1952), Instituto Balseiro" x={96} align="left" />
        </AbsoluteFill>
      ) : null}
      {t > tOce - 0.1 ? (
        <AbsoluteFill style={{opacity: prog(t, tOce - 0.1, 0.4)}}>
          <svg width={1920} height={1080}>
            {Array.from({length: 7}, (_, i) => (
              <path key={i} d={`M0 ${640 + i * 60} ${Array.from({length: 13}, (_, j) => `Q ${j * 160 + 80} ${640 + i * 60 + Math.sin(t * 2 + i + j) * 22 - 26} ${(j + 1) * 160} ${640 + i * 60}`).join(' ')}`} fill="none" stroke={K.plasma} strokeWidth={5} opacity={0.25 + i * 0.08} />
            ))}
            <g transform={`translate(960, ${520 - 10 * Math.sin(t * 2)}) scale(2.2)`}>
              <rect x={-8} y={0} width={16} height={150} rx={4} fill="#D9B98A" />
              <ellipse cx={0} cy={-6} rx={18} ry={24} fill="#8A2A1E" />
              <path d={`M0 ${-70 - 6 * Math.sin(t * 12)} C 24 -40 22 -12 0 -10 C -22 -12 -24 -40 0 ${-70 - 6 * Math.sin(t * 12)} Z`} fill={K.sun} />
              <path d="M0 -50 C 10 -34 8 -18 0 -16 C -8 -18 -10 -34 0 -50 Z" fill="#FFF2C0" />
            </g>
          </svg>
          <Big t={t} t0={c('hervir') - 0.2} text="HERVIR EL OCÉANO CON UN FÓSFORO" size={96} y={240} color={K.cream} hl={{FÓSFORO: K.sun, OCÉANO: K.plasma}} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
