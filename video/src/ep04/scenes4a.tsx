import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {F} from '../theme';
import {cue} from './lib';
import {clamp, easeIn, easeInOut, easeOut, pop, prog, shake} from '../lib/anim';
import {Bars, Cloud, Fan, Fish, Flame, Flash, Frame, Headline, HeatText, Kicker, N, Num, Ocean, Rain, Src, Tag, Vignette} from './kit';
import {FlatMap, lerpCam, RegionBox, Cam} from './flatmap';
import {Globe, arcPath, visible} from './globe';
import {SameDateBars} from './charts';
import {Section} from './section';

type P = {t: number};
const ramp = (t: number, a: number, b: number, e = easeInOut) => e(clamp((t - a) / (b - a)));

/** barra de color de la anomalía */
const Legend: React.FC<{t: number; t0: number; x?: number; y?: number}> = ({t, t0, x = 1330, y = 1000}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 480, opacity: prog(t, t0, 0.6)}}>
    <div style={{height: 12, borderRadius: 6, background: 'linear-gradient(90deg, #2B6CB0, #9CC7EA 30%, rgba(230,238,244,0.2) 40%, #FFC45A 58%, #FF7832 72%, #E23B2E 85%, #C2185B)'}} />
    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: F.mono, fontSize: 16, color: N.mute}}>
      <span>−3°</span>
      <span>0</span>
      <span>+2°</span>
      <span>+4,5°C</span>
    </div>
    <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 15, letterSpacing: 2, color: N.mute, marginTop: 2}}>DIFERENCIA CON LO NORMAL</div>
  </div>
);

/* =====================================================================
   S01 — Gancho: el mar frente a Perú, el récord, del océano a tu ciudad + TÍTULO
   ===================================================================== */
export const S01: React.FC<P> = ({t}) => {
  const s = 's01';
  const tCuatro = cue(s, 'cuatro'), tSeis = cue(s, 'seis'), tMedio = cue(s, 'En el medio'), tTres = cue(s, 'tres grados');
  const tMas = cue(s, 'En más'), tNingun = cue(s, 'ningún'), tTan = cue(s, 'tan caliente'), tLoQue = cue(s, 'Y lo que');
  const tMiles = cue(s, 'miles'), tLlueve = cue(s, 'llueve'), tCiudad = cue(s, 'tu ciudad'), tEsto = cue(s, 'Esto es');
  const tSuper = cue(s, 'Súper'), tYa = cue(s, 'Y ya');
  const endT = 33.9;

  // --- A: mapa plano, de Perú al Pacífico central
  const camA0: Cam = {lon: 281, lat: -5, deg: 40}, camA1: Cam = {lon: 279, lat: -5, deg: 33};
  const camB: Cam = {lon: 214, lat: -1, deg: 84};
  let cam = lerpCam(camA0, camA1, ramp(t, -0.4, tMedio));
  if (t > tMedio) cam = lerpCam(camA1, camB, ramp(t, tMedio - 0.1, tTres - 0.3));
  const revR = 2 + ramp(t, 0.2, 5.6, easeOut) * 90;
  const mapOut = prog(t, tMas - 0.2, 0.6);

  // --- C: globo
  const gIn = prog(t, tLoQue - 0.35, 0.8);
  const gRot = ramp(t, tLoQue - 0.3, tMiles + 0.8);
  const zoomEnd = ramp(t, tEsto, tSuper + 0.1, easeIn);
  const view = {
    lon: -150 + 80 * gRot - 45 * zoomEnd,
    lat: -2 - 16 * gRot + 16 * zoomEnd,
    r: 430 + 60 * gRot + 900 * zoomEnd,
    cx: 960 + 180 * (1 - gIn) + 240 * gRot * (1 - zoomEnd),
    cy: 560 + 60 * zoomEnd,
  };
  const ttl = t >= tSuper - 0.05;
  const sh = shake(t, tTan, 10, 0.5);
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      {/* A · mapa */}
      {mapOut < 1 ? (
        <AbsoluteFill style={{opacity: 1 - mapOut, transform: `scale(${1 + mapOut * 0.15})`, filter: mapOut > 0 ? `blur(${mapOut * 8}px)` : undefined}}>
          <FlatMap cam={cam} reveal={{lon: -81, lat: -4, r: revR}} land="110">
            {(Pp) => (
              <>
                <RegionBox P={Pp} lon0={-90} lon1={-80} lat0={-10} lat1={0} p={prog(t, 0.9, 0.9)} label="NIÑO 1+2" />
                <RegionBox P={Pp} lon0={-170} lon1={-120} lat0={-5} lat1={5} p={prog(t, tMedio + 0.6, 1)} label="NIÑO 3.4 · PACÍFICO CENTRAL" />
              </>
            )}
          </FlatMap>
          <Vignette k={0.6} />
          <Kicker t={t} t0={0.1} text="Temperatura del mar · 16 de septiembre de 2026" />
          {(() => {
            const [x, y] = [960 + (275 - cam.lon) * (1920 / cam.deg), 540 - (-5 - cam.lat) * (1920 / cam.deg)];
            return (
              <Tag t={t} t0={tCuatro - 0.5} t1={tMedio + 0.4} x={x} y={y} dx={-260} dy={-170} size={120} title="Frente a Perú" color={N.yellow}
                value={<Num t={t} t0={tCuatro - 0.2} t1={tSeis + 0.3} to={4.6} dec={1} prefix="+" suffix="°C" />} />
            );
          })()}
          {(() => {
            const [x, y] = [960 + (215 - cam.lon) * (1920 / cam.deg), 540 - (0 - cam.lat) * (1920 / cam.deg)];
            return (
              <Tag t={t} t0={tTres - 0.35} t1={tMas + 0.1} x={x} y={y} dx={150} dy={-210} size={120} title="Pacífico central" color={N.yellow}
                value={<Num t={t} t0={tTres - 0.2} t1={tTres + 0.5} to={3} dec={1} prefix="+" suffix="°C" />} />
            );
          })()}
          <Legend t={t} t0={1.2} />
          <Src t={t} t0={1.2} text="Datos: NOAA OISST v2.1 (satélites) · NOAA CPC" />
        </AbsoluteFill>
      ) : null}

      {/* B · récord: cada año a mediados de septiembre */}
      {t > tMas - 0.3 && t < tLoQue + 0.6 ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tMas - 0.3, 0.5), 1 - prog(t, tLoQue - 0.1, 0.5)), transform: `translate(${sh.x}px, ${sh.y}px)`}}>
          <Ocean grid={0.35} />
          <Kicker t={t} t0={tMas - 0.1} text="Pacífico central (Niño 3.4) · cada 16 de septiembre" />
          <div style={{position: 'absolute', left: 110, top: 150}}>
            <Headline t={t} t0={tMas} size={64} text="45 años de satélites" />
          </div>
          <SameDateBars t={t} t0={tMas + 0.1} tLast={tTan - 0.05} />
          <Tag t={t} t0={tTan + 0.35} x={1690 - 1460 / 45 * 0.5} y={720 - 3.0 * 105} dx={-120} dy={-60} size={86} title="2026 · nunca visto" value="+3,0°C" color={N.yellow} dot={false} />
          <Flash t={t} at={tTan} color={N.hot} max={0.35} />
          <Src t={t} t0={tMas} text="NOAA CPC · índice semanal Niño 3.4 (base 1991-2020), semana más cercana al 16/9" />
        </AbsoluteFill>
      ) : null}

      {/* C · del océano a tu ciudad */}
      {t > tLoQue - 0.4 ? (
        <AbsoluteFill style={{opacity: gIn, filter: zoomEnd > 0 ? `blur(${zoomEnd * 5}px) brightness(${1 - 0.35 * zoomEnd})` : undefined}}>
          <Ocean glow="rgba(30,90,150,0.35)" />
          <Stars t={t} />
          <Globe view={view} tex="sst2026">
            {(proj, path) => {
              const aP = prog(t, tMiles - 0.3, 1.3);
              const ba: [number, number] = [-58.4, -34.6];
              const from: [number, number] = [-145, 0];
              const pB = proj(ba);
              const cityOn = t > tCiudad - 0.2 && visible(view, ba[0], ba[1]) && pB;
              const pulse = (t % 1.4) / 1.4;
              return (
                <g opacity={1 - zoomEnd}>
                  <path d={path({type: 'Polygon', coordinates: [[[-170, -5], [-120, -5], [-120, 5], [-170, 5], [-170, -5]]]} as any) ?? ''} fill="rgba(255,204,51,0.12)" stroke={N.yellow} strokeWidth={3} opacity={prog(t, tLoQue, 0.6)} />
                  {aP > 0 ? <path d={arcPath(path, from, ba, aP)} fill="none" stroke={N.yellow} strokeWidth={6} strokeDasharray="2 12" strokeLinecap="round" /> : null}
                  {cityOn ? (
                    <g transform={`translate(${pB![0]},${pB![1]})`}>
                      <circle r={14 + pulse * 40} fill="none" stroke={N.rain} strokeWidth={3} opacity={1 - pulse} />
                      <circle r={11 * pop(t, tCiudad - 0.2)} fill={N.rain} stroke="#fff" strokeWidth={3} />
                    </g>
                  ) : null}
                  {t > tLlueve - 0.3 && pB ? (
                    <g opacity={prog(t, tLlueve - 0.3, 0.5)}>
                      <Cloud x={pB[0] + 10} y={pB[1] - 120} s={0.9} color="#E3EEF7" />
                      <Rain t={t} x={pB[0] - 40} y={pB[1] - 100} w={100} h={90} n={12} />
                    </g>
                  ) : null}
                </g>
              );
            }}
          </Globe>
          <Tag t={t} t0={tMiles + 0.2} t1={tEsto} x={1000} y={330} dx={-160} dy={-110} size={70} title="A miles de kilómetros" value="≈ 9.700 km" dot={false} />
          <Tag t={t} t0={tCiudad - 0.1} t1={tEsto} x={view.cx + 210} y={770} dx={180} dy={60} size={70} title="Este verano" value="TU CIUDAD" color={N.rain} dot={false} />
          <Vignette k={0.5} />
        </AbsoluteFill>
      ) : null}

      {/* D · TÍTULO */}
      {ttl ? <TitleCard t={t} t0={tSuper - 0.05} tYa={tYa} end={endT} /> : null}
      <Flash t={t} at={tSuper - 0.05} color={N.amber} max={0.7} dur={0.6} />
    </AbsoluteFill>
  );
};

const Stars: React.FC<{t: number}> = ({t}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
    {Array.from({length: 120}).map((_, i) => {
      const x = ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1 * 1920;
      const y = ((Math.sin(i * 78.233) * 12345.678) % 1 + 1) % 1 * 1080;
      const tw = 0.3 + 0.35 * (1 + Math.sin(t * 1.3 + i));
      return <circle key={i} cx={x} cy={y} r={i % 9 === 0 ? 1.8 : 1} fill="#CFE3F5" opacity={tw * 0.5} />;
    })}
  </svg>
);

const TitleCard: React.FC<{t: number; t0: number; tYa: number; end: number}> = ({t, t0, tYa, end}) => {
  const a = prog(t, t0, 0.7);
  const z = 1.18 - 0.18 * easeOut(clamp((t - t0) / 1.2)) + (t - t0) * 0.012;
  const live = t > tYa - 0.1;
  const blink = Math.floor(t * 2) % 2 === 0;
  const out = prog(t, end - 0.25, 0.25, easeIn);
  return (
    <AbsoluteFill style={{opacity: 1 - out * 0}}>
      <AbsoluteFill style={{background: 'rgba(4,10,17,0.55)', opacity: a}} />
      <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${z})`}}>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 14, color: N.text, opacity: prog(t, t0 + 0.2, 0.5), marginBottom: 58}}>EL FENÓMENO QUE VIENE</div>
        <div style={{clipPath: `inset(-40% ${(1 - easeOut(clamp((t - t0) / 0.55))) * 100}% -20% 0)`}}>
          <HeatText text="Súper Niño" size={260} t={t} />
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 26, opacity: live ? prog(t, tYa - 0.1, 0.3) : 0}}>
          <div style={{width: 20, height: 20, borderRadius: 10, background: N.red, opacity: blink ? 1 : 0.35, boxShadow: `0 0 20px ${N.red}`}} />
          <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 32, letterSpacing: 8, color: N.text}}>YA ESTÁ ACÁ</div>
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', fontFamily: F.body, fontWeight: 700, fontSize: 22, letterSpacing: 10, color: N.mute, opacity: prog(t, t0 + 1.4, 0.6)}}>
        CONTEXTO · EPISODIO 4
      </div>
    </AbsoluteFill>
  );
};

/* =====================================================================
   S02 — El nombre: pescadores, Navidad, «la corriente del Niño», cambio de humor
   ===================================================================== */
export const S02: React.FC<P> = ({t}) => {
  const s = 's02';
  const tCada = cue(s, 'Cada'), tNavidad = cue(s, 'Navidad,'), tLlegaba = cue(s, 'llegaba'), tPeces = cue(s, 'peces'), tDesap = cue(s, 'desaparecían.');
  const tLe = cue(s, 'Le decían'), tCorr = cue(s, '«la corriente'), tJesus = cue(s, 'Niño Jesús.'), tHoy = cue(s, 'Hoy'), tNoEs = cue(s, 'corriente:', 1);
  const tCambio = cue(s, 'cambio'), tHumor = cue(s, 'humor'), tTodo = cue(s, 'todo el'), tPac = cue(s, 'Pacífico.');
  // cámara del mapa costero
  const cam = lerpCam({lon: 283, lat: -7, deg: 34}, {lon: 281, lat: -8, deg: 28}, ramp(t, tCada - 0.4, tLe));
  const mapO = Math.min(prog(t, tCada - 0.5, 0.6), 1 - prog(t, tLe - 0.4, 0.5));
  const card = Math.min(prog(t, tLe - 0.3, 0.6), 1 - prog(t, tCambio - 0.4, 0.5));
  const gl = prog(t, tCambio - 0.5, 0.9);
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      {/* pescadores */}
      {t < tCada + 0.4 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tCada - 0.3, 0.6)}}>
          <Frame src="img/ep04/pescadores.jpg" t={t} t0={-0.5} x={960} y={540} w={1920} h={1080} zoom={[1.05, 1.16]} enter="fade" radius={0} grade="linear-gradient(180deg, rgba(4,10,17,0.1) 40%, rgba(4,10,17,0.85) 100%)" />
          <div style={{position: 'absolute', left: 110, bottom: 150}}>
            <Kicker t={t} t0={0} text="El origen del nombre" x={0} y={-50} />
            <Headline t={t} t0={0.9} size={110} text="Pescadores de Perú" />
          </div>
          <Src t={t} t0={0.4} text="Foto: KimDivulga · CC BY-SA 4.0" x={1810} align="right" />
        </AbsoluteFill>
      ) : null}
      {/* costa: llega el agua caliente y se van los peces */}
      {mapO > 0 ? (
        <AbsoluteFill style={{opacity: mapO}}>
          <FlatMap cam={cam} land="50sa" reveal={{lon: -81, lat: 1, r: 0.5 + ramp(t, tLlegaba - 0.2, tPeces, easeOut) * 13}}>
            {(Pp, _path, k) => (
              <g>
                {Array.from({length: 14}).map((_, i) => {
                  const [x, y] = Pp(-82.6 + (i % 4) * 0.7 + Math.sin(i) * 0.3, -6 - Math.floor(i / 4) * 1.6 - (i % 2) * 0.5);
                  const gone = prog(t, tDesap - 0.3 + (i % 5) * 0.06, 0.7);
                  return <Fish key={i} x={x - gone * 260} y={y + Math.sin(t * 2 + i) * 5} s={k / 30} o={prog(t, tCada - 0.2 + i * 0.03, 0.4) * (1 - gone)} flip color="#9FF0E6" />;
                })}
              </g>
            )}
          </FlatMap>
          <Vignette k={0.55} />
          <div style={{position: 'absolute', left: 150, top: 300, width: 330, height: 360, background: '#F4EFE6', borderRadius: 14, boxShadow: '0 30px 60px rgba(0,0,0,0.5)', overflow: 'hidden', transform: `rotate(-4deg) scale(${pop(t, tNavidad - 0.3)})`, transformOrigin: '50% 50%'}}>
            <div style={{height: 96, background: N.red, color: '#fff', fontFamily: F.body, fontWeight: 800, fontSize: 38, letterSpacing: 6, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>DICIEMBRE</div>
            <div style={{fontFamily: F.head, fontSize: 200, color: '#161513', textAlign: 'center', lineHeight: 1.2}}>25</div>
          </div>
          <Tag t={t} t0={tLlegaba} x={960 + (279 - cam.lon) * (1920 / cam.deg)} y={540 - (-4 - cam.lat) * (1920 / cam.deg)} dx={160} dy={-150} size={64} title="Llega agua caliente" value="Y SE VAN LOS PECES" color={N.amber} />
        </AbsoluteFill>
      ) : null}
      {/* «la corriente del Niño» */}
      {card > 0 ? (
        <AbsoluteFill style={{opacity: card}}>
          <Ocean glow="rgba(255,166,48,0.14)" />
          <div style={{position: 'absolute', left: 260, right: 260, top: 250, height: 580, background: '#EDE3CF', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', transform: `rotate(-1.5deg) translateY(${(1 - prog(t, tLe - 0.3, 0.8)) * 60}px)`, padding: '70px 90px'}}>
            <Img src={staticFile('tex/paper.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'multiply', opacity: 0.6}} />
            <div style={{position: 'relative', fontFamily: F.body, fontWeight: 800, fontSize: 24, letterSpacing: 8, color: '#6A5A44'}}>LOS PESCADORES LA LLAMABAN</div>
            <div style={{position: 'relative', fontFamily: F.quote, fontStyle: 'italic', fontWeight: 700, fontSize: 118, color: '#1E1A14', lineHeight: 1.08, marginTop: 30}}>
              <span style={{opacity: prog(t, tCorr - 0.1, 0.4)}}>«la </span>
              <span style={{position: 'relative', opacity: prog(t, tCorr, 0.4)}}>
                corriente
                <span style={{position: 'absolute', left: -6, right: -6, top: '55%', height: 12, background: N.red, transformOrigin: 'left', transform: `scaleX(${prog(t, tNoEs - 0.2, 0.4)}) rotate(-3deg)`}} />
              </span>
              <br />
              <span style={{opacity: prog(t, tCorr + 0.7, 0.4)}}>del Niño»</span>
            </div>
            <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 18, marginTop: 34, opacity: prog(t, tJesus - 0.5, 0.5)}}>
              <svg width={50} height={50} viewBox="-25 -25 50 50">
                <path d="M0 -24 L6 -6 L24 0 L6 6 L0 24 L-6 6 L-24 0 L-6 -6 Z" fill="#C9962B" />
              </svg>
              <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 36, color: '#4A3D2C'}}>por el Niño Jesús: llegaba cerca de Navidad</div>
            </div>
          </div>
          <div style={{position: 'absolute', right: 300, top: 740, transform: `rotate(-6deg) scale(${pop(t, tNoEs + 0.1)})`, opacity: t > tNoEs ? 1 : 0, fontFamily: F.head, fontSize: 64, color: N.red, border: `6px solid ${N.red}`, padding: '4px 22px'}}>
            NO ES UNA CORRIENTE
          </div>
        </AbsoluteFill>
      ) : null}
      {/* todo el Pacífico */}
      {gl > 0 ? (
        <AbsoluteFill style={{opacity: gl}}>
          <Ocean glow="rgba(30,90,150,0.3)" />
          <Stars t={t} />
          <Globe view={{lon: -165 + (t - tCambio) * 5, lat: 0, r: 420 + 40 * ramp(t, tCambio, tPac), cx: 1240, cy: 560}} tex="base" tex2="sst2026" mix={ramp(t, tHumor - 0.2, tHumor + 1.2)}>
            {(proj, path) => (
              <g opacity={prog(t, tTodo - 0.2, 0.6)}>
                <path d={path({type: 'Sphere'} as any) ?? ''} fill="none" stroke={N.yellow} strokeWidth={4} opacity={0.0} />
              </g>
            )}
          </Globe>
          <div style={{position: 'absolute', left: 110, top: 330, width: 700}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 28, letterSpacing: 6, color: N.mute, opacity: prog(t, tCambio - 0.3, 0.4)}}>NO ES UNA CORRIENTE: ES UN</div>
            <Headline t={t} t0={tCambio} size={120} text="cambio de humor" hl={['humor']} hlColor={N.amber} />
            <div style={{marginTop: 18, opacity: prog(t, tTodo - 0.2, 0.5)}}>
              <div style={{fontFamily: F.head, fontSize: 64, color: N.text}}>DE TODO EL OCÉANO PACÍFICO</div>
              <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 28, color: N.mute, marginTop: 10}}>que cubre un tercio de la superficie del planeta</div>
            </div>
          </div>
          <Vignette k={0.45} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* =====================================================================
   S03 — Año normal: alisios, pileta caliente al oeste, afloramiento al este
   ===================================================================== */
const fanAngle = (t: number, tOff?: number) => {
  // integra la velocidad: 1,6 vueltas/s y frena hasta 0 después de tOff
  const v = 1.6 * 360;
  if (tOff === undefined || t < tOff) return t * v;
  const d = Math.min(t - tOff, 2.2);
  return tOff * v + v * (d - (d * d) / (2 * 2.2));
};

export const S03: React.FC<P & {dur: number}> = ({t, dur}) => {
  const fo = 1 - prog(t, dur - 0.55, 0.45);
  const s = 's03';
  const tAlis = cue(s, 'vientos'), tVent = cue(s, 'ventilador'), tEmp = cue(s, 'Empujan'), tIndo = cue(s, 'Indonesia');
  const tAlla = cue(s, 'allá'), tFrente = cue(s, 'frente'), tSube = cue(s, 'sube'), tAgua = cue(s, 'Agua fría,', 1), tNut = cue(s, 'nutrientes,'), tPeces = cue(s, 'peces.');
  const tEq = cue(s, 'equilibrio.');
  return (
    <AbsoluteFill>
      <Ocean glow="rgba(40,110,170,0.22)" />
      <AbsoluteFill style={{transform: `scale(${1.06 - 0.06 * prog(t, -0.4, 1.4)})`, opacity: prog(t, -0.4, 0.5)}}>
        <Section t={t} k={0} wind={1} c={{wind: tAlis - 0.2, warm: tEmp - 0.2, high: tAlla, up: tFrente, chips: [tAgua, tNut, tPeces]}} />
      </AbsoluteFill>
      <Kicker t={t} t0={-0.2} text="Corte del Pacífico ecuatorial" />
      <div style={{position: 'absolute', left: 110, top: 138}}>
        <div style={{display: 'inline-block', background: N.cold, color: N.bg0, fontFamily: F.head, fontSize: 64, padding: '4px 22px', transform: `scale(${pop(t, -0.1)})`, transformOrigin: 'left'}}>AÑO NORMAL</div>
      </div>
      {/* ventilador */}
      <div style={{position: 'absolute', left: 1540, top: 90, opacity: prog(t, tVent - 0.3, 0.4), transform: `scale(${0.6 + 0.4 * pop(t, tVent - 0.3)})`}}>
        <svg width={260} height={260} viewBox="-130 -100 260 260">
          <Fan x={0} y={0} s={0.85} angle={-fanAngle(t)} />
        </svg>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 20, letterSpacing: 4, color: N.text, textAlign: 'center', marginTop: -24}}>ALISIOS = VENTILADOR</div>
      </div>
      {/* textos de apoyo */}
      <Caption t={t} t0={tAlis} t1={tEmp - 0.2} text="Los alisios soplan de este a oeste" />
      <Caption t={t} t0={tEmp} t1={tAlla - 0.2} text="Empujan el agua caliente hacia Asia" />
      <Caption t={t} t0={tAlla} t1={tFrente - 0.2} text="Allá el mar está más alto" />
      <Caption t={t} t0={tFrente} t1={tEq - 0.3} text="Frente a Sudamérica sube agua fría" />
      <div style={{position: 'absolute', left: 1130, top: 400, display: 'flex', gap: 14, opacity: fo}}>
        {[
          ['AGUA FRÍA', tAgua, N.cold],
          ['NUTRIENTES', tNut, N.teal],
          ['PECES', tPeces, '#9FF0E6'],
        ].map(([l, tt, c]) => (
          <div key={l as string} style={{fontFamily: F.body, fontWeight: 800, fontSize: 22, letterSpacing: 3, color: N.bg0, background: c as string, padding: '8px 14px', borderRadius: 30, transform: `scale(${pop(t, tt as number)})`}}>
            {l as string}
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 918, textAlign: 'center', opacity: fo}}>
        <Headline t={t} t0={tEq - 0.3} size={96} text="Ese es el equilibrio" hl={['equilibrio']} hlColor={N.teal} style={{textShadow: '0 6px 30px rgba(0,0,0,0.7)'}} />
      </div>
    </AbsoluteFill>
  );
};

const Caption: React.FC<{t: number; t0: number; t1: number; text: string; y?: number}> = ({t, t0, t1, text, y = 1010}) => {
  if (t < t0 - 0.05 || t > t1 + 0.3) return null;
  const a = prog(t, t0, 0.4);
  const o = Math.min(a, 1 - prog(t, t1, 0.3));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y - 60, textAlign: 'center', opacity: o, transform: `translateY(${(1 - a) * 20}px)`}}>
      <span style={{fontFamily: F.head, fontSize: 52, color: N.text, background: 'rgba(4,10,17,0.72)', padding: '4px 26px', textTransform: 'uppercase', letterSpacing: 1}}>{text}</span>
    </div>
  );
};

/* =====================================================================
   S04 — El Niño: se apaga el ventilador, la pileta vuelve al este, las lluvias se mudan
   ===================================================================== */
export const S04: React.FC<P> = ({t}) => {
  const s = 's04';
  const tDeb = cue(s, 'debilitan.'), tApaga = cue(s, 'apaga.'), tToda = cue(s, 'toda'), tVuelve = cue(s, 'vuelve'), tPeru = cue(s, 'Perú', 0), tEcu = cue(s, 'Ecuador.');
  const tEvap = cue(s, 'evapora'), tLluv = cue(s, 'lluvias', 0), tMudan = cue(s, 'mudan.'), tEnPeru = cue(s, 'En Perú'), tDesierto = cue(s, 'desierto.');
  const tAus = cue(s, 'Australia'), tSeq = cue(s, 'sequías'), tInc = cue(s, 'incendios.'), tYlas = cue(s, 'Y las'), tNuestro = cue(s, 'nuestro'), tMapa = cue(s, 'mapa.');
  const wind = 1 - 0.85 * ramp(t, 0.8, tDeb + 0.6);
  const k = ramp(t, tToda - 0.1, tEcu + 0.4);
  const rk = ramp(t, tLluv - 0.5, tMudan + 0.4);
  const sw = ramp(t, tEnPeru - 0.6, tEnPeru + 0.5); // del corte al mapa
  // cámara del mapa de teleconexiones
  const camW: Cam = {lon: 200, lat: -8, deg: 175};
  const camSA: Cam = {lon: 298, lat: -26, deg: 62};
  const cam = lerpCam(camW, camSA, ramp(t, tYlas - 0.2, tNuestro + 0.3));
  const K = 1920 / cam.deg;
  const PP = (lon: number, lat: number): [number, number] => [960 + ((((lon % 360) + 360) % 360) - cam.lon) * K, 540 - (lat - cam.lat) * K];
  const dryP = prog(t, tSeq - 0.3, 0.6);
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      {sw < 1 ? (
        <AbsoluteFill style={{opacity: 1 - sw, transform: `scale(${1 + sw * 0.5})`, filter: sw > 0 ? `blur(${sw * 10}px)` : undefined}}>
          <Ocean glow="rgba(40,110,170,0.22)" />
          <Section t={t} k={k} wind={wind} rk={rk} c={{wind: -5, warm: -5, up: -5, high: -5, chips: [-5, -5, -5], evap: tEvap - 0.3}} />
          <Kicker t={t} t0={-5} text="Corte del Pacífico ecuatorial" />
          <div style={{position: 'absolute', left: 110, top: 138, height: 90, overflow: 'hidden'}}>
            <div style={{display: 'inline-block', background: N.cold, color: N.bg0, fontFamily: F.head, fontSize: 64, padding: '4px 22px', transform: `translateY(${-prog(t, tDeb - 0.4, 0.5) * 100}%)`}}>AÑO NORMAL</div>
          </div>
          <div style={{position: 'absolute', left: 110, top: 138}}>
            <div style={{display: 'inline-block', background: N.hot, color: N.bg0, fontFamily: F.head, fontSize: 64, padding: '4px 22px', clipPath: `inset(${(1 - prog(t, tDeb - 0.2, 0.5)) * 100}% 0 0 0)`}}>EL NIÑO</div>
          </div>
          <div style={{position: 'absolute', left: 1540, top: 90}}>
            <svg width={260} height={260} viewBox="-130 -100 260 260">
              <Fan x={0} y={0} s={0.85} angle={-fanAngle(t + 20, tApaga + 20 - 0.6)} off={prog(t, tApaga, 0.5)} color={t > tApaga ? N.mute : N.text} />
            </svg>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 20, letterSpacing: 4, color: t > tApaga ? N.red : N.text, textAlign: 'center', marginTop: -24}}>
              {t > tApaga - 0.1 ? 'VENTILADOR APAGADO' : 'ALISIOS = VENTILADOR'}
            </div>
          </div>
          <Caption t={t} t0={0.1} t1={tToda - 0.2} text="Los alisios se debilitan" />
          <Caption t={t} t0={tToda} t1={tEvap - 0.3} text="El agua caliente vuelve hacia el este" />
          <Caption t={t} t0={tEvap} t1={tEnPeru} text="Más evaporación: las lluvias se mudan" />
          {k > 0.05 ? (
            <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
              <g opacity={prog(t, tVuelve - 0.2, 0.5) * (1 - prog(t, tEvap, 0.5))}>
                <path d={`M 620 700 L ${620 + 700 * k} 700`} stroke="#fff" strokeWidth={8} strokeLinecap="round" />
                <path d={`M ${640 + 700 * k} 700 l -34 -24 M ${640 + 700 * k} 700 l -34 24`} stroke="#fff" strokeWidth={8} strokeLinecap="round" />
              </g>
            </svg>
          ) : null}
        </AbsoluteFill>
      ) : null}
      {sw > 0 ? (
        <AbsoluteFill style={{opacity: sw, transform: `scale(${1.25 - 0.25 * sw})`}}>
          <FlatMap cam={cam} sstO={0.4} highlight={{AUS: `rgba(208,138,69,${0.85 * dryP})`, IDN: `rgba(208,138,69,${0.85 * dryP})`, PNG: `rgba(208,138,69,${0.6 * dryP})`}}>
            {(Pp, path, kk) => (
              <g>
                {/* Perú: lluvia en el desierto */}
                {(() => {
                  const [x, y] = Pp(-77, -8);
                  const a = prog(t, tEnPeru, 0.5);
                  return (
                    <g opacity={a}>
                      <Cloud x={x} y={y - 4.5 * kk} s={0.055 * kk} color="#E3EEF7" />
                      <Rain t={t} x={x - 2.4 * kk} y={y - 3 * kk} w={4.8 * kk} h={4 * kk} n={18} />
                    </g>
                  );
                })()}
                {/* Australia e Indonesia: sequía e incendios */}
                {[[-240, -25], [-228, -20], [-215, -30], [-247, -31], [-222, -14], [-247, -3], [-258, 0]].map(([lo, la], i) => {
                  const [x, y] = Pp(lo, la);
                  return <Flame key={i} x={x} y={y} s={0.075 * kk} t={t + i} o={prog(t, tInc - 0.4 + i * 0.08, 0.4)} />;
                })}
                {/* nuestro lado del mapa */}
                {(() => {
                  const [x, y] = Pp(-59, -30);
                  const a = prog(t, tNuestro - 0.3, 0.5);
                  return (
                    <g opacity={a}>
                      <defs>
                        <radialGradient id="rain-glow">
                          <stop offset="0" stopColor={N.rain} stopOpacity={0.5} />
                          <stop offset="1" stopColor={N.rain} stopOpacity={0} />
                        </radialGradient>
                      </defs>
                      <circle cx={x} cy={y} r={7 * kk} fill="url(#rain-glow)" />
                      <Cloud x={x + 0.4 * kk} y={y - 5 * kk} s={0.028 * kk} color="#E3EEF7" />
                      <Rain t={t} x={x - 2.4 * kk} y={y - 3.6 * kk} w={5 * kk} h={4.2 * kk} n={34} />
                    </g>
                  );
                })()}
              </g>
            )}
          </FlatMap>
          <Vignette k={0.5} />
          <Tag t={t} t0={tEnPeru + 0.1} t1={tYlas - 0.1} x={PP(-77, -9)[0]} y={PP(-77, -9)[1]} dx={-120} dy={120} size={60} title="Perú" value="LLUEVE EN EL DESIERTO" color={N.rain} />
          <Tag t={t} t0={tAus} t1={tYlas - 0.1} x={PP(134, -25)[0]} y={PP(134, -25)[1]} dx={140} dy={-210} size={60} title="Australia e Indonesia" value="SEQUÍAS E INCENDIOS" color={N.dry} />
          <Tag t={t} t0={tNuestro} x={PP(-59, -30)[0]} y={PP(-59, -30)[1]} dx={220} dy={-140} size={70} title="Y para nuestro lado" value="MÁS LLUVIAS" color={N.rain} />
          <Kicker t={t} t0={tEnPeru} text="Cómo se reparte el efecto" />
          {t < tYlas ? (
            <Frame src="img/ep04/incendios_aus.png" t={t} t0={tInc - 0.2} t1={tYlas - 0.1} x={1640} y={820} w={380} h={300} zoom={[1, 1.04]} enter="clip" credit="Incendios 2015-16 en Australia · NASA MODIS" grade="rgba(0,0,0,0.05)" />
          ) : null}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
