import React from 'react';
import {AbsoluteFill} from 'remotion';
import {F} from '../theme';
import {cue} from './lib';
import {clamp, easeIn, easeInOut, easeOut, pop, prog, shake} from '../lib/anim';
import {Flash, Frame, Headline, Kicker, N, Ocean, Src, Tag, Vignette} from '../ep04/kit';
import {ArgMap, PLACES} from '../ep04/argmap';
import {Globe5, subsolar, visible5, zoneBand, View5} from './globe5';
import {Clock3D, DAWN, FlipClock, Icon, Map3D, NightSchool, SUN, SunPath3D} from './art5';
import prov from '../data/ep04/arg_provincias.json';

type P = {t: number};
const ramp = (t: number, a: number, b: number, e = easeInOut) => e(clamp((t - a) / (b - a)));
const JUN21 = 172, FEB12 = 43;
const hm = (h: number, m: number) => h * 60 + m;
const ARG = prov as any;

/** contorno de las provincias sobre el globo */
export const ArgOnGlobe: React.FC<{path: any; o?: number; fill?: string}> = ({path, o = 1, fill = 'rgba(255,255,255,0.06)'}) => (
  <g opacity={o}>
    {ARG.features.map((f: any, i: number) => (
      <path key={i} d={path(f) ?? ''} fill={fill} stroke="rgba(255,255,255,0.85)" strokeWidth={1.2} />
    ))}
  </g>
);

export const Pin: React.FC<{proj: any; lon: number; lat: number; t: number; t0: number; label?: string; color?: string; dx?: number; view?: View5}> = ({proj, lon, lat, t, t0, label, color = SUN, dx = 26, view}) => {
  if (t < t0) return null;
  if (view && !visible5(view, lon, lat)) return null;
  const p = proj([lon, lat]);
  if (!p) return null;
  const pulse = (t % 1.4) / 1.4;
  return (
    <g transform={`translate(${p[0]},${p[1]})`}>
      <circle r={12 + pulse * 40} fill="none" stroke={color} strokeWidth={3} opacity={1 - pulse} />
      <circle r={10 * pop(t, t0)} fill={color} stroke="#000" strokeWidth={2} />
      {label ? (
        <text x={dx} y={9} fill="#fff" fontFamily="Inter" fontWeight={800} fontSize={28} letterSpacing={2} style={{paintOrder: 'stroke'}} stroke="rgba(0,0,0,0.85)" strokeWidth={6} opacity={clamp((t - t0) / 0.3)}>
          {label}
        </text>
      ) : null}
    </g>
  );
};

/* =====================================================================
   S01 — Gancho: Mendoza a las 7:30, de noche. Ushuaia a las 10. Tu reloj está mal. + TÍTULO
   ===================================================================== */
export const S01: React.FC<P & {dur: number}> = ({t, dur}) => {
  const s = 's01';
  const tSiete = cue(s, 'siete'), tInv = cue(s, 'invierno.'), tMiles = cue(s, 'Miles'), tAfuera = cue(s, 'afuera'), tSol = cue(s, 'El sol'), tHora = cue(s, 'hora.');
  const tUsh = cue(s, 'En Ushuaia'), tDiez = cue(s, 'diez.'), tYno = cue(s, 'Y no,'), tCulpa = cue(s, 'Es culpa', 1), tReloj = cue(s, 'reloj.'), tPorque = cue(s, 'Porque');
  const tZona = cue(s, 'zona'), tTu = cue(s, 'Tu reloj está'), tTodo = cue(s, 'Y el de');
  // tiempo "de reloj" en Argentina (minutos desde medianoche) que manda el sol del globo
  let clock = hm(7, 30);
  if (t > tSol - 0.2 && t < tUsh - 0.4) clock = hm(7, 30) + (hm(8, 38) - hm(7, 30)) * ramp(t, tSol, tHora + 0.3);
  if (t >= tUsh - 0.4) clock = hm(7, 30) + (hm(9, 59) - hm(7, 30)) * ramp(t, tUsh - 0.2, tDiez + 0.1);
  const sunA = subsolar(JUN21, clock / 60 + 3);
  const sceneA = t < tMiles - 0.3;
  const sceneB = t >= tMiles - 0.3 && t < tUsh - 0.3;
  const sceneD = t >= tUsh - 0.3 && t < tYno - 0.2;
  const sceneE = t >= tYno - 0.2 && t < tPorque - 0.3;
  const sceneF = t >= tPorque - 0.3 && t < tTu - 0.15;
  const title = t >= tTu - 0.15;
  const vA: View5 = {lon: -67 + 2 * ramp(t, -0.5, tMiles), lat: -33, r: 560 + 520 * ramp(t, -0.5, tMiles, easeOut), cx: 1080, cy: 560};
  const vD: View5 = {lon: -66 - 2 * ramp(t, tUsh, tDiez), lat: -46 - 6 * ramp(t, tUsh, tDiez), r: 820, cx: 1100, cy: 520};
  const vF: View5 = {lon: -56 + 4 * ramp(t, tPorque, tTu), lat: -26, r: 470, cx: 1150, cy: 560};
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      {sceneA ? (
        <AbsoluteFill>
          <Ocean glow="rgba(20,40,90,0.4)" />
          <Globe5 view={vA} sun={sunA}>
            {(proj, path) => (
              <>
                <ArgOnGlobe path={path} o={0.5} fill="rgba(0,0,0,0)" />
                <Pin proj={proj} lon={PLACES.Mendoza[0]} lat={PLACES.Mendoza[1]} t={t} t0={cue(s, 'Mendoza.') - 0.2} label="MENDOZA" view={vA} />
              </>
            )}
          </Globe5>
          <Vignette k={0.6} />
          <div style={{position: 'absolute', left: 110, top: 300, opacity: prog(t, tSiete - 0.3, 0.3), transform: `scale(${0.9 + 0.1 * pop(t, tSiete - 0.3)})`, transformOrigin: 'left'}}>
            <FlipClock t={t} value={() => hm(7, 30)} size={200} glow="rgba(255,90,60,0.35)" />
            <div style={{marginTop: 30, display: 'inline-block', background: N.cold, color: N.bg0, fontFamily: F.body, fontWeight: 800, fontSize: 32, letterSpacing: 5, padding: '8px 18px', opacity: prog(t, tInv - 0.3, 0.3), transform: `scale(${pop(t, tInv - 0.3)})`, transformOrigin: 'left'}}>21 DE JUNIO · INVIERNO</div>
          </div>
        </AbsoluteFill>
      ) : null}
      {sceneB ? (
        <AbsoluteFill style={{opacity: prog(t, tMiles - 0.3, 0.4)}}>
          <NightSchool t={t} dawn={ramp(t, tSol, tHora + 0.4)} kids={prog(t, tMiles, 1.2)} />
          <div style={{position: 'absolute', right: 90, top: 70}}>
            <FlipClock t={t} value={() => clock} size={130} label={t > tSol ? 'SALE EL SOL · 08:38' : 'MENDOZA'} />
          </div>
          <div style={{position: 'absolute', left: 110, top: 90, opacity: prog(t, tAfuera, 0.4) * (1 - prog(t, tSol - 0.3, 0.3))}}>
            <Headline t={t} t0={tAfuera} size={96} text="Afuera es de noche" style={{textShadow: '0 6px 30px rgba(0,0,0,0.7)'}} />
          </div>
          <div style={{position: 'absolute', left: 110, top: 90, opacity: prog(t, tSol, 0.4)}}>
            <Headline t={t} t0={tSol} size={96} text="El sol sale una hora después" hl={['sol']} hlColor={SUN} style={{textShadow: '0 6px 30px rgba(0,0,0,0.7)', width: 980}} />
          </div>
        </AbsoluteFill>
      ) : null}
      {sceneD ? (
        <AbsoluteFill>
          <Ocean glow="rgba(20,40,90,0.4)" />
          <Globe5 view={vD} sun={subsolar(JUN21, clock / 60 + 3)}>
            {(proj, path) => (
              <>
                <ArgOnGlobe path={path} o={0.45} fill="rgba(0,0,0,0)" />
                <Pin proj={proj} lon={-68.3} lat={-54.8} t={t} t0={tUsh} label="USHUAIA" view={vD} />
              </>
            )}
          </Globe5>
          <Vignette k={0.6} />
          <div style={{position: 'absolute', left: 110, top: 300}}>
            <FlipClock t={t} value={() => clock} size={200} />
            <div style={{marginTop: 30, fontFamily: F.head, fontSize: 70, color: SUN, opacity: prog(t, tDiez - 0.2, 0.3)}}>AMANECE 09:59</div>
          </div>
          <Src t={t} t0={tUsh} text="Día y noche calculados con la posición real del Sol · texturas NASA Blue/Black Marble" />
        </AbsoluteFill>
      ) : null}
      {sceneE ? (
        <AbsoluteFill>
          <Ocean glow="rgba(226,59,46,0.12)" />
          <div style={{position: 'absolute', left: 960 - 280, top: 200, transform: `translate(${shake(t, tReloj, 16, 0.5).x}px,${shake(t, tReloj, 16, 0.5).y}px)`}}>
            <Clock3D size={560} minutes={hm(7, 30) + (t > tCulpa ? (t - tCulpa) * 400 : 0)} rx={12 + Math.sin(t * 0.8) * 8} ry={-22 + Math.sin(t * 0.6) * 18} crack={prog(t, tReloj - 0.1, 0.2)} glowColor={t > tReloj ? 'rgba(226,59,46,0.6)' : undefined} />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 830, textAlign: 'center'}}>
            {t < tCulpa - 0.1 ? (
              <div style={{fontFamily: F.head, fontSize: 90, color: N.text, opacity: prog(t, tYno, 0.3)}}>
                NO ES <span style={{position: 'relative'}}>EL INVIERNO<span style={{position: 'absolute', left: -8, right: -8, top: '52%', height: 12, background: N.red, transformOrigin: 'left', transform: `scaleX(${prog(t, cue(s, 'culpa del') + 0.2, 0.4)})`}} /></span>
              </div>
            ) : (
              <div style={{fontFamily: F.head, fontSize: 110, color: N.red, transform: `scale(${pop(t, tCulpa - 0.1)})`}}>ES TU RELOJ</div>
            )}
          </div>
        </AbsoluteFill>
      ) : null}
      {sceneF ? (
        <AbsoluteFill style={{opacity: prog(t, tPorque - 0.3, 0.4)}}>
          <Ocean glow="rgba(30,90,150,0.3)" />
          <Globe5 view={vF} sun={subsolar(JUN21, 15)} dayOnly>
            {(proj, path) => {
              const a = prog(t, tPorque, 0.6);
              return (
                <>
                  <path d={path(zoneBand(-3)) ?? ''} fill={SUN} fillOpacity={0.28 * a} stroke={SUN} strokeWidth={3} opacity={a} />
                  <ArgOnGlobe path={path} o={prog(t, tPorque + 0.4, 0.6)} fill="rgba(116,172,223,0.25)" />
                  <Pin proj={proj} lon={-47.88} lat={-15.79} t={t} t0={tZona} label="BRASILIA" view={vF} />
                </>
              );
            }}
          </Globe5>
          <Vignette k={0.5} />
          <div style={{position: 'absolute', left: 110, top: 150, width: 680}}>
            <Kicker t={t} t0={tPorque} x={0} y={0} text="La franja horaria que usamos: UTC−3" color={SUN} />
            <div style={{marginTop: 70}}>
              <Headline t={t} t0={tPorque + 0.3} size={92} text="Ninguna ciudad argentina está adentro" hl={['Ninguna']} hlColor={N.red} />
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
      {title ? <TitleCard t={t} t0={tTu - 0.15} tTodo={tTodo} end={dur} /> : null}
      <Flash t={t} at={tTu - 0.15} color="#fff" max={0.6} dur={0.5} />
    </AbsoluteFill>
  );
};

const TitleCard: React.FC<{t: number; t0: number; tTodo: number; end: number}> = ({t, t0, tTodo, end}) => {
  const k = t - t0;
  const glitch = k < 0.5 ? Math.sin(k * 90) * (1 - k / 0.5) * 18 : 0;
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      <Ocean glow="rgba(255,181,71,0.12)" grid={0.25} />
      {/* relojes que giran alrededor */}
      {Array.from({length: 9}).map((_, i) => {
        const a = (i / 9) * Math.PI * 2 + k * 0.25;
        const R = 700, x = 960 + Math.cos(a) * R, y = 540 + Math.sin(a) * R * 0.52;
        const sz = 120 + (i % 3) * 40;
        return (
          <div key={i} style={{position: 'absolute', left: x - sz / 2, top: y - sz / 2, opacity: 0.55 * prog(t, tTodo - 0.2 + i * 0.05, 0.4)}}>
            <Clock3D size={sz} minutes={i * 97 + k * (60 + i * 30)} rx={20} ry={Math.cos(a) * 50} />
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 960 - 170, top: 150, opacity: 0.95}}>
        <Clock3D size={340} minutes={hm(12, 0) + k * 720} rx={10} ry={Math.sin(k * 1.4) * 25} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center', transform: `translateX(${glitch}px) scale(${1.08 - 0.08 * easeOut(clamp(k / 0.6))})`}}>
        <div style={{fontFamily: F.head, fontSize: 200, lineHeight: 1, color: N.text, letterSpacing: 4}}>TU RELOJ</div>
        <div style={{fontFamily: F.head, fontSize: 200, lineHeight: 1, color: N.red, letterSpacing: 4, textShadow: glitch ? `${-glitch}px 0 0 #00E5FF, ${glitch}px 0 0 ${SUN}` : undefined}}>ESTÁ MAL</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 90, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 24, letterSpacing: 10, color: N.mute, opacity: prog(t, tTodo, 0.5)}}>
        Y EL DE TODO EL PAÍS · CONTEXTO · EPISODIO 5
      </div>
    </AbsoluteFill>
  );
};

/* =====================================================================
   S02 — La hora del sol, cada ciudad su mediodía, los trenes
   ===================================================================== */
const LMT: [string, number, number, number][] = [
  // ciudad, lon, lat, minutos respecto de Buenos Aires (hora solar media)
  ['Buenos Aires', -58.38, -34.6, 0], ['Rosario', -60.64, -32.95, -9], ['Córdoba', -64.19, -31.42, -23], ['Salta', -65.42, -24.78, -28],
  ['Mendoza', -68.85, -32.89, -42], ['Posadas', -55.9, -27.37, 10], ['Ushuaia', -68.3, -54.8, -40], ['Neuquén', -68.06, -38.95, -39],
];
const MiniClock: React.FC<{x: number; y: number; minutes: number; r?: number; label?: string; o?: number}> = ({x, y, minutes, r = 34, label, o = 1}) => {
  const hA = ((minutes / 60) % 12) * 30, mA = (minutes % 60) * 6;
  return (
    <g transform={`translate(${x},${y})`} opacity={o}>
      <circle r={r} fill="#F4F1EA" stroke={SUN} strokeWidth={4} />
      <line x1={0} y1={0} x2={Math.sin((hA * Math.PI) / 180) * r * 0.5} y2={-Math.cos((hA * Math.PI) / 180) * r * 0.5} stroke="#161513" strokeWidth={5} strokeLinecap="round" />
      <line x1={0} y1={0} x2={Math.sin((mA * Math.PI) / 180) * r * 0.8} y2={-Math.cos((mA * Math.PI) / 180) * r * 0.8} stroke="#161513" strokeWidth={3} strokeLinecap="round" />
      <circle r={4} fill={N.red} />
      {label ? (
        <text y={r + 30} textAnchor="middle" fill="#fff" fontFamily="Inter" fontWeight={800} fontSize={20} letterSpacing={1} style={{paintOrder: 'stroke'}} stroke="rgba(0,0,0,0.85)" strokeWidth={5}>
          {label}
        </text>
      ) : null}
    </g>
  );
};

export const S02: React.FC<P> = ({t}) => {
  const s = 's02';
  const tComo = cue(s, '¿Cómo'), tDurante = cue(s, 'Durante'), tMedio = cue(s, 'mediodía', 0), tAlto = cue(s, 'alto.'), tPero = cue(s, 'Pero');
  const tCada = cue(s, 'cada'), tCuando = cue(s, 'Cuando en'), tMza = cue(s, 'Mendoza'), tOnce = cue(s, 'once'), tTrenes = cue(s, 'trenes,'), tCaos = cue(s, 'caos.');
  const sun = t > tDurante - 0.4 && t < tPero - 0.2;
  const map = t >= tPero - 0.2 && t < tCuando - 0.2;
  const duo = t >= tCuando - 0.2 && t < cue(s, 'Y con') - 0.3;
  const trains = t >= cue(s, 'Y con') - 0.3;
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      {t < tDurante - 0.2 ? (
        <AbsoluteFill>
          <Ocean grid={0.3} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center'}}>
            <div style={{fontFamily: F.head, fontSize: 220, color: SUN, transform: `scale(${pop(t, -0.05)})`}}>PARÁ.</div>
            <div style={{fontFamily: F.head, fontSize: 80, color: N.text, opacity: prog(t, tComo, 0.3)}}>¿CÓMO PUEDE ESTAR MAL LA HORA?</div>
          </div>
        </AbsoluteFill>
      ) : null}
      {sun ? (
        <AbsoluteFill style={{opacity: prog(t, tDurante - 0.4, 0.5)}}>
          <AbsoluteFill style={{background: 'linear-gradient(180deg, #2B5C9E 0%, #6FB0E6 55%, #F6D59A 100%)'}} />
          <SunPath3D t={t} k={0.08 + 0.42 * ramp(t, tDurante, tAlto + 0.2)} show={1} cy={760} noonTag={prog(t, tMedio, 0.5)} />
          <div style={{position: 'absolute', left: 110, top: 90}}>
            <Kicker t={t} t0={tDurante} x={0} y={0} text="Durante siglos" color="#0B1A2C" />
            <div style={{marginTop: 60}}>
              <Headline t={t} t0={tDurante + 0.2} size={90} text="La hora la marcaba el sol" color="#0B1A2C" hl={['sol']} hlColor="#B35A00" />
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
      {map ? (
        <AbsoluteFill style={{opacity: prog(t, tPero - 0.2, 0.4)}}>
          <Ocean glow="rgba(255,181,71,0.12)" />
          <ArgMap cam={{box: [600, 40, 1360, 985]}} t={t}>
            {(proj) => (
              <>
                {LMT.map(([n, lo, la, d], i) => {
                  const p = proj([lo, la])!;
                  return <MiniClock key={n} x={p[0]} y={p[1]} minutes={hm(12, 0) + d} r={30} label={n.toUpperCase()} o={prog(t, tCada - 0.3 + i * 0.12, 0.3)} />;
                })}
              </>
            )}
          </ArgMap>
          <div style={{position: 'absolute', left: 110, top: 150, width: 440}}>
            <Headline t={t} t0={tCada - 0.2} size={84} text="Cada ciudad, su propio mediodía" hl={['su', 'propio']} hlColor={SUN} />
          </div>
        </AbsoluteFill>
      ) : null}
      {duo ? (
        <AbsoluteFill>
          <Ocean glow="rgba(255,181,71,0.14)" />
          {[
            ['BUENOS AIRES', hm(12, 0), '12:00', tCuando, 480],
            ['MENDOZA', hm(11, 18), '≈ 11:20', tMza, 1440],
          ].map(([n, m, lab, tt, x]) => (
            <div key={n as string} style={{position: 'absolute', left: (x as number) - 230, top: 170, width: 460, textAlign: 'center', opacity: prog(t, (tt as number) - 0.2, 0.3), transform: `translateY(${(1 - prog(t, (tt as number) - 0.2, 0.5)) * 40}px)`}}>
              <Clock3D size={460} minutes={m as number} rx={8} ry={(x as number) < 960 ? 18 : -18} />
              <div style={{fontFamily: F.head, fontSize: 90, color: N.text, marginTop: 20}}>{lab as string}</div>
              <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 5, color: N.mute}}>{n as string}</div>
            </div>
          ))}
          <div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: F.head, fontSize: 60, color: SUN, opacity: prog(t, tOnce, 0.3)}}>−42 MIN</div>
          <Src t={t} t0={tCuando} text="Hora solar media: 4 minutos por cada grado de longitud" />
        </AbsoluteFill>
      ) : null}
      {trains ? (
        <AbsoluteFill>
          <Frame src="img/ep05/retiro1900.jpg" t={t} t0={cue(s, 'Y con') - 0.3} x={960} y={540} w={1920} h={1080} radius={0} zoom={[1.08, 1.22]} enter="fade" grade="linear-gradient(180deg, rgba(40,25,10,0.35), rgba(4,10,17,0.75))" />
          <AbsoluteFill style={{mixBlendMode: 'multiply', background: 'rgba(160,120,70,0.35)'}} />
          {Array.from({length: 6}).map((_, i) => (
            <div key={i} style={{position: 'absolute', left: 140 + i * 280, top: 150 + (i % 2) * 90, opacity: prog(t, tTrenes + i * 0.12, 0.3)}}>
              <Clock3D size={170} minutes={hm(12, 0) + i * 23 + (t - tTrenes) * (120 + i * 70)} rx={10} ry={i % 2 ? 25 : -25} />
            </div>
          ))}
          <div style={{position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center'}}>
            <div style={{display: 'inline-block', fontFamily: F.head, fontSize: 150, color: N.red, border: `10px solid ${N.red}`, padding: '0 40px', transform: `rotate(-6deg) scale(${pop(t, tCaos - 0.1)})`, opacity: t > tCaos - 0.1 ? 1 : 0, background: 'rgba(4,10,17,0.55)'}}>CAOS</div>
          </div>
          <Src t={t} t0={tTrenes} text="Estación Retiro, c. 1900 · dominio público" />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* =====================================================================
   S03 — 1894 Córdoba · 1920 sistema mundial · 24 franjas · Argentina en −4 y −5
   ===================================================================== */
export const S03: React.FC<P> = ({t}) => {
  const s = 's03';
  const tMil = cue(s, 'mil ochocientos'), tUnif = cue(s, 'unificó'), tElig = cue(s, 'eligió'), tObs = cue(s, 'Observatorio'), t1920 = cue(s, 'mil novecientos');
  const tPlan = cue(s, 'El planeta'), tVeinti = cue(s, 'veinticuatro'), tQuince = cue(s, 'quince'), tSegun = cue(s, 'Según'), tCuatro = cue(s, 'menos cuatro'), tCord = cue(s, 'cordillera'), tCinco = cue(s, 'cinco.');
  const a1894 = t < t1920 - 0.3;
  const zones = t >= t1920 - 0.3;
  const spin = ramp(t, t1920, tSegun);
  const zoomSA = ramp(t, tSegun - 0.4, tSegun + 1.2);
  const view: View5 = {lon: 0 * (1 - spin) + (-200) * spin * (1 - zoomSA) + -62 * zoomSA, lat: 10 * (1 - zoomSA) - 34 * zoomSA, r: 430 + 380 * zoomSA, cx: 1180 - 40 * zoomSA, cy: 560 + 60 * zoomSA};
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      {a1894 ? (
        <AbsoluteFill>
          <Ocean glow="rgba(201,162,74,0.16)" />
          <Frame src="img/ep05/observatorio1930.png" t={t} t0={tMil - 0.3} x={560} y={560} w={820} h={690} zoom={[1.02, 1.1]} enter="clip" credit="Observatorio de Córdoba, 1930 · revista Plus Ultra · dominio público" grade="rgba(120,90,40,0.12)" />
          <Frame src="img/ep05/gould2.jpg" t={t} t0={tObs - 0.4} x={1060} y={690} w={300} h={380} zoom={[1, 1.06]} enter="rise" rot={3} credit="Benjamin Gould, fundador (1871)" focus="50% 30%" />
          <div style={{position: 'absolute', left: 1280, top: 170, width: 560}}>
            <div style={{fontFamily: F.head, fontSize: 200, lineHeight: 0.9, color: SUN, transform: `scale(${1.2 - 0.2 * pop(t, tMil - 0.1)})`, transformOrigin: 'left top', opacity: prog(t, tMil - 0.1, 0.2)}}>1894</div>
            <div style={{fontFamily: F.head, fontSize: 64, color: N.text, marginTop: 10, opacity: prog(t, tUnif - 0.1, 0.4)}}>UNA SOLA HORA PARA TODO EL PAÍS</div>
            <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 30, color: N.mute, marginTop: 20, opacity: prog(t, tElig, 0.4)}}>la del Observatorio de Córdoba (4 h 17 min detrás de Greenwich)</div>
          </div>
        </AbsoluteFill>
      ) : null}
      {zones ? (
        <AbsoluteFill style={{opacity: prog(t, t1920 - 0.3, 0.4)}}>
          <Ocean glow="rgba(30,90,150,0.3)" />
          <Globe5 view={view} sun={subsolar(80, 12 - view.lon / 15)} dayOnly>
            {(proj, path) => {
              const bands = Array.from({length: 24}).map((_, i) => i - 11);
              return (
                <>
                  {bands.map((k, i) => {
                    const a = prog(t, tVeinti - 0.6 + i * 0.05, 0.3) * (1 - zoomSA * (k >= -5 && k <= -3 ? 0 : 0.6));
                    return <path key={k} d={path(zoneBand(k)) ?? ''} fill={i % 2 ? '#FFFFFF' : '#0B1A2C'} fillOpacity={0.14 * a} stroke="rgba(255,255,255,0.55)" strokeWidth={1.5} opacity={a} />;
                  })}
                  <path d={path({type: 'LineString', coordinates: [[0, -89], [0, 0], [0, 89]]} as any) ?? ''} stroke={SUN} strokeWidth={4} fill="none" opacity={prog(t, t1920, 0.4) * (1 - zoomSA)} />
                  {[
                    [-4, tCuatro - 0.4, SUN],
                    [-5, tCinco - 0.4, DAWN],
                  ].map(([k, tt, c]) => (
                    <path key={k as number} d={path(zoneBand(k as number)) ?? ''} fill={c as string} fillOpacity={0.3 * prog(t, tt as number, 0.4)} stroke={c as string} strokeWidth={3} opacity={prog(t, tt as number, 0.4)} />
                  ))}
                  <ArgOnGlobe path={path} o={zoomSA} fill="rgba(0,0,0,0.12)" />
                  {zoomSA > 0.5
                    ? [
                        [-4, -60, 5, 'UTC−4', tCuatro - 0.4],
                        [-5, -75, 5, 'UTC−5', tCinco - 0.4],
                        [-3, -45, 5, 'UTC−3', tSegun],
                      ].map(([k, lo, la, lab, tt]) => {
                        const p = proj([lo as number, la as number]);
                        return p ? (
                          <text key={lab as string} x={p[0]} y={p[1]} textAnchor="middle" fill="#fff" fontFamily="Anton" fontSize={46} opacity={prog(t, tt as number, 0.4)} style={{paintOrder: 'stroke'}} stroke="rgba(0,0,0,0.8)" strokeWidth={6}>
                            {lab as string}
                          </text>
                        ) : null;
                      })
                    : null}
                </>
              );
            }}
          </Globe5>
          <Vignette k={0.45} />
          <div style={{position: 'absolute', left: 110, top: 150, width: 640}}>
            {t < tPlan - 0.2 ? (
              <>
                <div style={{fontFamily: F.head, fontSize: 200, lineHeight: 0.9, color: SUN, opacity: prog(t, t1920 - 0.1, 0.2)}}>1920</div>
                <div style={{fontFamily: F.head, fontSize: 64, color: N.text, opacity: prog(t, t1920 + 0.6, 0.4)}}>EL SISTEMA MUNDIAL</div>
                <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 30, color: N.mute, opacity: prog(t, t1920 + 0.9, 0.4)}}>la hora se cuenta desde Greenwich</div>
              </>
            ) : t < tSegun - 0.3 ? (
              <>
                <Headline t={t} t0={tPlan} size={96} text="24 franjas, una por hora" hl={['24']} hlColor={SUN} />
                <div style={{marginTop: 40, display: 'inline-block', background: SUN, color: N.bg0, fontFamily: F.head, fontSize: 80, padding: '4px 26px', opacity: prog(t, tQuince - 0.2, 0.3), transform: `scale(${pop(t, tQuince - 0.2)})`, transformOrigin: 'left'}}>15° = 1 HORA</div>
              </>
            ) : (
              <>
                <Headline t={t} t0={tSegun} size={84} text="Casi toda la Argentina: menos cuatro" hl={['cuatro']} hlColor={SUN} />
                <div style={{marginTop: 30, fontFamily: F.head, fontSize: 70, color: DAWN, opacity: prog(t, tCord - 0.2, 0.4)}}>CORDILLERA Y SUR: −5</div>
              </>
            )}
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* =====================================================================
   S04 — Usamos −3 (la de Brasilia). Una hora adelantados. Mapa 3D del mediodía solar
   ===================================================================== */
export const S04: React.FC<P> = ({t}) => {
  const s = 's04';
  const tMenos = cue(s, 'Menos'), tBras = cue(s, 'Brasilia,'), tDiez = cue(s, 'diez'), tViv = cue(s, 'vivimos'), tCord = cue(s, 'cordillera,'), tBA = cue(s, 'En Buenos'), tMza = cue(s, 'En Mendoza,'), tCal = cue(s, 'El Calafate,'), tFeb = cue(s, 'febrero...'), tDos = cue(s, 'dos', 1);
  const globe = t < tBA - 0.4;
  const view: View5 = {lon: -60, lat: -28, r: 810, cx: 1140, cy: 620};
  const tilt = 50 * ramp(t, tBA - 0.4, tBA + 1.2);
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      {globe ? (
        <AbsoluteFill>
          <Ocean glow="rgba(30,90,150,0.3)" />
          <Globe5 view={view} sun={subsolar(80, 12 - view.lon / 15)} dayOnly>
            {(proj, path) => {
              const red = prog(t, tMenos - 0.2, 0.3);
              const blink = t > tMenos && t < tMenos + 1.2 ? 0.5 + 0.5 * Math.sin(t * 18) : 1;
              const pB = proj([-47.88, -15.79]), pA = proj([-58.38, -34.6]);
              return (
                <>
                  <path d={path(zoneBand(-4)) ?? ''} fill={SUN} fillOpacity={0.18} stroke={SUN} strokeWidth={2} />
                  <path d={path(zoneBand(-5)) ?? ''} fill={DAWN} fillOpacity={0.18} stroke={DAWN} strokeWidth={2} />
                  <path d={path(zoneBand(-3)) ?? ''} fill={N.red} fillOpacity={0.32 * red * blink} stroke={N.red} strokeWidth={4} opacity={red} />
                  <ArgOnGlobe path={path} fill="rgba(0,0,0,0.12)" />
                  <Pin proj={proj} lon={-47.88} lat={-15.79} t={t} t0={tBras - 0.2} label="BRASILIA" view={view} />
                  <Pin proj={proj} lon={-58.38} lat={-34.6} t={t} t0={tBras} label="BUENOS AIRES" view={view} dx={-240} />
                  {pA && pB && t > tDiez - 0.2 ? (
                    <g opacity={prog(t, tDiez - 0.2, 0.3)}>
                      <line x1={pA[0]} y1={pA[1] - 60} x2={pA[0] + (pB[0] - pA[0]) * prog(t, tDiez - 0.2, 0.6)} y2={pA[1] - 60} stroke={SUN} strokeWidth={6} />
                      <text x={(pA[0] + pB[0]) / 2} y={pA[1] - 80} textAnchor="middle" fill={SUN} fontFamily="Anton" fontSize={44}>10° MÁS AL ESTE</text>
                    </g>
                  ) : null}
                </>
              );
            }}
          </Globe5>
          <Vignette k={0.45} />
          <div style={{position: 'absolute', left: 110, top: 160, width: 620}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: N.mute}}>LA QUE USAMOS</div>
            <div style={{fontFamily: F.head, fontSize: 220, lineHeight: 1, color: N.red, transform: `scale(${pop(t, tMenos - 0.2)})`, transformOrigin: 'left'}}>UTC−3</div>
            <div style={{fontFamily: F.head, fontSize: 60, color: N.text, opacity: prog(t, tBras - 0.2, 0.3)}}>LA HORA DE BRASILIA</div>
            <div style={{marginTop: 40, opacity: prog(t, tViv - 0.2, 0.3)}}>
              <span style={{display: 'inline-block', background: SUN, color: N.bg0, fontFamily: F.head, fontSize: 70, padding: '2px 20px', transform: `scale(${pop(t, tViv - 0.2)})`}}>+1 HORA</span>
              <span style={{display: 'inline-block', marginLeft: 20, background: DAWN, color: N.bg0, fontFamily: F.head, fontSize: 70, padding: '2px 20px', opacity: prog(t, tCord - 0.2, 0.3), transform: `scale(${pop(t, tCord - 0.2)})`}}>+2 EN LA CORDILLERA</span>
            </div>
          </div>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill>
          <Ocean glow="rgba(255,181,71,0.14)" grid={0.2} />
          <Map3D
            t={t} tilt={tilt} rotZ={-8 * ramp(t, tBA - 0.4, tDos + 1)} cx={1200} cy={600} scale={1.12}
            bars={[
              {lon: -58.38, lat: -34.6, h: 55 * 2.3, label: '12:55', sub: 'BUENOS AIRES', t0: tBA},
              {lon: -68.85, lat: -32.89, h: 97 * 2.3, label: '13:37', sub: 'MENDOZA', t0: tMza},
              {lon: -72.27, lat: -50.34, h: 123 * 2.3, label: '14:03', sub: 'EL CALAFATE · FEB', t0: tCal, color: DAWN},
              {lon: -55.9, lat: -27.37, h: 45 * 2.3, label: '', t0: tBA + 0.4, color: '#E6A340'},
              {lon: -68.3, lat: -54.8, h: 94 * 2.3, label: '', t0: tCal + 0.3, color: '#E6A340'},
            ]}
          />
          <div style={{position: 'absolute', left: 110, top: 150, width: 620}}>
            <Kicker t={t} t0={tBA - 0.2} x={0} y={0} text="Mediodía solar · cuando el sol está más alto" color={SUN} />
            <div style={{marginTop: 70}}>
              <Headline t={t} t0={tBA} size={90} text="El mediodía llega tarde" hl={['tarde']} hlColor={SUN} />
            </div>
            <div style={{marginTop: 30, fontFamily: F.body, fontWeight: 700, fontSize: 28, color: N.mute, opacity: prog(t, tMza, 0.4)}}>Cada barra: minutos después de las 12 del reloj</div>
            <div style={{marginTop: 30, fontFamily: F.head, fontSize: 58, color: DAWN, whiteSpace: 'nowrap', opacity: prog(t, tFeb, 0.4)}}>EN FEBRERO, A LAS 14:03</div>
          </div>
          <Src t={t} t0={tBA} text="Cálculo astronómico (NOAA / astral): 21 de junio; El Calafate, 12 de febrero" />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* =====================================================================
   S05 — 1930 horario de verano · 1942 no lo atrasamos · 1970 decreto
   ===================================================================== */
export const Timeline: React.FC<{t: number; at: number; o?: number}> = ({t, at, o = 1}) => {
  const Y = [1894, 1920, 1930, 1942, 1970, 1974, 2008, 2009, 2026];
  const x0 = 180, x1 = 1740;
  const X = (y: number) => x0 + ((y - 1890) / (2030 - 1890)) * (x1 - x0);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: o}}>
      <line x1={x0} x2={x1} y1={1010} y2={1010} stroke="rgba(255,255,255,0.3)" strokeWidth={3} />
      {Y.map((y) => (
        <g key={y} opacity={at >= y ? 1 : 0.45}>
          <circle cx={X(y)} cy={1010} r={at >= y ? 9 : 6} fill={at >= y ? SUN : '#8EA4B8'} />
          <text x={X(y)} y={y === 1974 || y === 2009 ? 988 : 1050} textAnchor="middle" fill={at >= y ? '#fff' : '#8EA4B8'} fontFamily="JetBrains Mono" fontSize={20}>
            {y}
          </text>
        </g>
      ))}
      <circle cx={X(at)} cy={1010} r={16} fill="none" stroke={SUN} strokeWidth={4} />
      {t < 0 ? null : null}
    </svg>
  );
};

export const S05: React.FC<P> = ({t}) => {
  const s = 's05';
  const t1930 = cue(s, 'mil novecientos', 0), tAdel = cue(s, 'adelantar'), t1942 = cue(s, 'mil novecientos', 1), tOto = cue(s, 'otoño,'), tNo = cue(s, 'no lo'), tHubo = cue(s, 'Hubo');
  const t1970 = cue(s, 'mil novecientos', 2), tDecreto = cue(s, 'decreto'), tMenos = cue(s, 'menos'), tEnergia = cue(s, 'energía.');
  const stage = t < t1942 - 0.4 ? 0 : t < tHubo - 0.3 ? 1 : 2;
  const year = stage === 0 ? 1930 : stage === 1 ? 1942 : t < t1970 - 0.3 ? 1956 : 1970;
  const rew = 1 - prog(t, t1930 - 0.9, 0.6);
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      <Ocean glow="rgba(201,162,74,0.14)" />
      {t < t1930 - 0.2 ? (
        <AbsoluteFill>
          {Array.from({length: 5}).map((_, i) => (
            <div key={i} style={{position: 'absolute', left: 180 + i * 330, top: 280, opacity: 0.7 * rew}}>
              <Clock3D size={240} minutes={hm(12, 0) - t * (900 + i * 200)} rx={10} ry={i % 2 ? 20 : -20} />
            </div>
          ))}
          <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily: F.head, fontSize: 110, color: N.text}}>¿CÓMO LLEGAMOS ACÁ?</div>
        </AbsoluteFill>
      ) : null}
      {stage === 0 && t >= t1930 - 0.2 ? (
        <AbsoluteFill>
          <Frame src="img/ep05/torre.jpg" t={t} t0={t1930 - 0.2} x={500} y={500} w={560} h={760} zoom={[1.05, 1.15]} enter="clip" focus="50% 30%" grade="linear-gradient(rgba(120,80,30,0.25), rgba(120,80,30,0.25))" credit="Torre Monumental (1916), Buenos Aires · Matías Profeta · CC BY-SA 4.0" />
          <div style={{position: 'absolute', left: 900, top: 150}}>
            <div style={{fontFamily: F.head, fontSize: 200, lineHeight: 0.9, color: SUN}}>1930</div>
            <div style={{fontFamily: F.head, fontSize: 70, color: N.text}}>HORARIO DE VERANO</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 40, marginTop: 40}}>
              <Clock3D size={260} minutes={hm(12, 0) + 60 * ramp(t, tAdel, tAdel + 1.2)} rx={8} ry={-18} />
              <div style={{fontFamily: F.head, fontSize: 110, color: SUN, opacity: prog(t, tAdel, 0.3), transform: `scale(${pop(t, tAdel)})`}}>+1 H</div>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
      {stage === 1 ? (
        <AbsoluteFill>
          {Array.from({length: 26}).map((_, i) => {
            const x = ((Math.sin(i * 12.9) * 43758.5) % 1 + 1) % 1 * 1920;
            const y = (((t - t1942) * (90 + (i % 5) * 30) + i * 97) % 1200) - 100;
            return (
              <div key={i} style={{position: 'absolute', left: x + Math.sin(t * 2 + i) * 40, top: y, transform: `rotate(${t * 90 + i * 40}deg)`, opacity: 0.8}}>
                <Icon name="leaf" size={50 + (i % 3) * 20} color={['#D08A45', '#C2562E', '#E6A340'][i % 3]} />
              </div>
            );
          })}
          <div style={{position: 'absolute', left: 200, top: 200}}>
            <div style={{fontFamily: F.head, fontSize: 200, lineHeight: 0.9, color: SUN}}>1942</div>
            <div style={{fontFamily: F.head, fontSize: 70, color: N.text, opacity: prog(t, tOto - 0.2, 0.3)}}>LLEGÓ EL OTOÑO...</div>
          </div>
          <div style={{position: 'absolute', left: 1100, top: 220}}>
            <Clock3D size={500} minutes={hm(13, 0) - 12 * Math.max(0, Math.sin(Math.max(0, t - tOto) * 6)) * (t < tNo ? 1 : 0)} rx={6} ry={-14} />
          </div>
          <div style={{position: 'absolute', left: 1030, top: 780, fontFamily: F.head, fontSize: 96, color: N.red, border: `8px solid ${N.red}`, padding: '0 30px', transform: `rotate(-5deg) scale(${pop(t, tNo)})`, opacity: t > tNo ? 1 : 0}}>NO LO ATRASAMOS</div>
        </AbsoluteFill>
      ) : null}
      {stage === 2 ? (
        <AbsoluteFill>
          <div style={{position: 'absolute', left: 150, top: 150, fontFamily: F.head, fontSize: 90, color: N.mute, opacity: prog(t, tHubo, 0.3) * (1 - prog(t, t1970 - 0.4, 0.3))}}>IDAS Y VUELTAS...</div>
          <div
            style={{
              position: 'absolute', left: 260, top: 230, width: 820, height: 640, background: '#EDE3CF', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', padding: '56px 64px',
              transform: `rotate(-2deg) translateY(${(1 - prog(t, t1970 - 0.3, 0.6)) * 900}px)`,
            }}
          >
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 24, letterSpacing: 6, color: '#6A5A44'}}>BOLETÍN OFICIAL · REPÚBLICA ARGENTINA</div>
            <div style={{fontFamily: F.quote, fontWeight: 800, fontSize: 86, color: '#1E1A14', marginTop: 24}}>Decreto 1.215</div>
            <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 34, color: '#4A3D2C', marginTop: 6}}>30 de marzo de 1970</div>
            <div style={{height: 3, background: '#6A5A44', margin: '30px 0'}} />
            <div style={{fontFamily: F.quote, fontSize: 40, color: '#1E1A14', lineHeight: 1.3, opacity: prog(t, tDecreto + 0.3, 0.5)}}>Hora oficial: tres horas menos que Greenwich, durante todo el año.</div>
          </div>
          <div style={{position: 'absolute', left: 1180, top: 300, textAlign: 'center'}}>
            <div style={{fontFamily: F.head, fontSize: 210, lineHeight: 1, color: N.red, opacity: prog(t, tMenos - 0.2, 0.3), transform: `scale(${pop(t, tMenos - 0.2)})`}}>−3</div>
            <div style={{fontFamily: F.head, fontSize: 70, color: N.text, opacity: prog(t, tMenos + 0.5, 0.3)}}>TODO EL AÑO</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 20, justifyContent: 'center', marginTop: 40, opacity: prog(t, tEnergia - 0.6, 0.3)}}>
              <Icon name="bulb" size={100} color={SUN} />
              <div style={{fontFamily: F.head, fontSize: 56, color: SUN}}>AHORRAR ENERGÍA</div>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
      <Timeline t={t} at={t < t1930 - 0.2 ? 1920 + 10 * prog(t, 0, 1.2) : year} o={prog(t, 0.3, 0.5)} />
    </AbsoluteFill>
  );
};
