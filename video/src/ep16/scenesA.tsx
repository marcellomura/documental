/* Ep16 · escenas de la apertura al cinturón (s01-s03): la Estación de noche, las fallas, el Hubble, los destellos, el
   «triángulo» que baja a Sudamérica, la bajada al monte chaqueño, el título, el núcleo, el escudo, Marte y el Explorer 1. */
import React from 'react';
import {AbsoluteFill, Freeze, Img, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {clamp, easeIn, easeInOut, easeOut} from '../lib/anim';
import {Atmosphere, BeltShell, BeltParticles, Earth, FieldLines, GlowTube, Mars, Section, SolarWind, Stage16, VanAllen, surfPath, orbitPts, Dots, orbitPos} from './globe16';
import {Big, Caps, Corrupt, Count, Credit16, K, Label, LineChart, Mono, NameTag, P, Phosphenes, Photo16, Snow, Title16, mix, ss, vis} from './kit16';
import {altR, camBasis, camPath, fmtLat, fmtLon, fmtN, project, sunFrom, xyz, type GeoCam, type TLx, type V3} from './lib16';
import ISS from '../data/ep16/iss.json';

export type SceneP = {t: number; T: TLx; w: number; h: number};
const MIN = {lat: -26.23, lon: -60.02, F: 22071};
/** altura de la cámara (radios) → cuánto se ven los detalles anidados y las nubes */
export const insetsFor = (cam: GeoCam): [number, number, number, number] => {
  const a = Math.hypot(...camBasis(cam).P) - 1;
  return [ss(1.6, 0.9, a), ss(0.22, 0.1, a), ss(0.05, 0.022, a), ss(0.012, 0.006, a)];
};
export const cloudsFor = (cam: GeoCam, base = 0.88) => base * ss(0.35, 1.3, Math.hypot(...camBasis(cam).P) - 1);
type IssClip = {n: number; lat: number[]; lon: number[]; alt: number[]; t: number[]; F: number[]};
const fmtUTC = (s: number) => new Date(s * 1000).toISOString().slice(11, 19);
const fmtDate = (s: number) => {
  const d = new Date(s * 1000);
  return `${String(d.getUTCDate()).padStart(2, '0')}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${d.getUTCFullYear()}`;
};

/* ------------------------------------------------------------------ la Estación: video real y su tablero */
export const IssVideo: React.FC<{clip: string; from: number; t: number; freezeAt?: [number, number]; z0?: number; z1?: number; dur: number; pos?: string; w: number; h: number}> = ({clip, from, t, freezeAt, z0 = 1.0, z1 = 1.06, dur, pos = '50% 35%', w, h}) => {
  const local = t - from;
  if (local < 0 || local > dur + 0.5) return null;
  const z = mix(z0, z1, clamp(local / dur));
  const fr = Math.round(Math.min(local, dur) * 30);
  const video = <OffthreadVideo src={staticFile(`ep16/iss/${clip}.mp4`)} muted style={{width: w, height: h, objectFit: 'cover', objectPosition: pos, transform: `scale(${z})`}} />;
  const frozen = freezeAt && local >= freezeAt[0] && local < freezeAt[1];
  const beyond = local >= dur;
  return (
    <Sequence from={Math.round(from * 30)} layout="none">
      {frozen ? <Freeze frame={Math.round(freezeAt![0] * 30)}>{video}</Freeze> : beyond ? <Freeze frame={Math.round(dur * 30) - 1}>{video}</Freeze> : (fr >= 0 ? video : null)}
    </Sequence>
  );
};
/** tablero sobre las fotos reales: posición, hora y |B| del IGRF-14 a la altura de la Estación */
export const IssHud: React.FC<{t: number; from: number; clip: string; k: number; thr?: number; warnFrom?: number; w: number; h: number; vertical?: boolean}> = ({t, from, clip, k, thr = 21000, warnFrom = 0, w, h, vertical}) => {
  if (k <= 0) return null;
  const C = (ISS as unknown as Record<string, IssClip>)[clip];
  const i = clamp(Math.floor((t - from) * 30), 0, C.n - 1);
  const F = C.F[i];
  const warn = F < thr && t >= warnFrom;
  const level = clamp((F - 15000) / (45000 - 15000));
  const col = warn ? K.hot : K.cool;
  const mx = vertical ? w - 120 : w - 170, my = vertical ? 520 : 250, mh = vertical ? 520 : 520;
  const pulse = warn ? 0.6 + 0.4 * Math.sin(t * 9) : 1;
  return (
    <AbsoluteFill style={{opacity: k}}>
      <div style={{position: 'absolute', left: vertical ? 60 : 96, top: vertical ? 120 : 84}}>
        <Caps size={vertical ? 20 : 18} color={K.ink}>Estación Espacial Internacional</Caps>
        <Mono size={vertical ? 18 : 16} color={K.dim} style={{marginTop: 8}}>FOTOS REALES DE LA TRIPULACIÓN · EXPEDICIÓN {clip === 'carib' ? 31 : 30}</Mono>
      </div>
      <div style={{position: 'absolute', left: vertical ? 60 : 96, bottom: vertical ? 760 : 80}}>
        <Mono size={vertical ? 30 : 26} color={K.ink}>{fmtDate(C.t[i])} · {fmtUTC(C.t[i])} UTC</Mono>
        <Mono size={vertical ? 24 : 21} color={K.dim} style={{marginTop: 10}}>{fmtLat(C.lat[i], 1)} · {fmtLon(C.lon[i], 1)} · {C.alt[i]} km</Mono>
      </div>
      {/* medidor de campo */}
      <div style={{position: 'absolute', left: mx - 240, top: my - 92, width: 300, textAlign: 'right'}}>
        <Caps size={15} color={K.dim}>Campo magnético</Caps>
        <Caps size={13} color={K.dim} style={{marginTop: 4, opacity: 0.8}}>modelo IGRF-14 · a esta altura</Caps>
      </div>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
        {[...Array(31)].map((_, j) => {
          const yy = my + (mh * j) / 30;
          return <line key={j} x1={mx + (j % 5 === 0 ? -16 : -8)} x2={mx} y1={yy} y2={yy} stroke={K.faint} strokeWidth={1.2} />;
        })}
        <line x1={mx + 14} x2={mx + 14} y1={my} y2={my + mh} stroke={K.line} strokeWidth={6} strokeLinecap="round" />
        <line x1={mx + 14} x2={mx + 14} y1={my + mh * (1 - level)} y2={my + mh} stroke={col} strokeWidth={6} strokeLinecap="round" opacity={pulse} />
        <line x1={mx - 30} x2={mx + 30} y1={my + mh * (1 - (thr - 15000) / 30000)} y2={my + mh * (1 - (thr - 15000) / 30000)} stroke={K.hot} strokeWidth={1.5} strokeDasharray="4 6" />
      </svg>
      <div style={{position: 'absolute', left: mx - 330, top: my + mh * (1 - level) - 30, width: 300, textAlign: 'right'}}>
        <Mono size={vertical ? 46 : 40} color={col}>{fmtN(F)}</Mono>
        <Caps size={14} color={K.dim}>nanoteslas</Caps>
      </div>
      {warn ? (
        <div style={{position: 'absolute', left: mx - 330, top: my + mh + 30, width: 344, textAlign: 'right', opacity: pulse}}>
          <Caps size={vertical ? 20 : 18} color={K.hot}>▲ Zona débil</Caps>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ s01 */
export const S01: React.FC<SceneP & {vertical?: boolean}> = ({t, T, w, h, vertical}) => {
  const A = (p: string, n = 0) => T.at('s01', p, n), E = (p: string, n = 0) => T.atE('s01', p, n);
  const s0 = T.start('s01');
  const vFrom = s0 - 3.2 < 0 ? 0 : s0 - 3.2;
  const tHang = A('las computadoras'), tSens = A('Los sensores'), tHub = A('El telescopio'), tObs = A('observar'), tAstro = A('Y los astronautas'), tTri = A('Le dicen');
  const glitchK = ss(tHang - 0.9, tHang, t) * (1 - ss(tSens + 0.1, tSens + 0.8, t)) * (0.55 + 0.45 * Math.sin(t * 23) ** 2);
  const issEnd = tHub - 0.05;
  const hubK = vis(t, tHub - 0.15, tAstro - 0.2, 0.25, 0.35);
  // obturador del Hubble: el círculo se cierra después de "observar"
  const iris = 1 - easeInOut(clamp((t - tObs - 0.35) / 0.8));
  return (
    <>
      {t < issEnd + 0.2 ? (
        <AbsoluteFill style={{opacity: 1 - ss(issEnd - 0.1, issEnd + 0.15, t)}}>
          <IssVideo clip="namerica" from={vFrom} t={t} dur={21.0} freezeAt={[tHang - vFrom + 0.15, tSens - vFrom - 0.1]} w={w} h={h} pos={vertical ? '50% 30%' : '50% 30%'} />
          <Snow t={t} t0={tSens - 0.3} rate={mix(20, 520, ss(tSens, tHub, t))} w={w} h={h} />
          <Corrupt t={t} k={glitchK} w={w} h={h} />
          {glitchK > 0.05 ? (
            <div style={{position: 'absolute', left: vertical ? 60 : 96, top: vertical ? 860 : 420, opacity: clamp(glitchK * 2)}}>
              <Mono size={vertical ? 30 : 26} color={K.warn}>ERROR DE MEMORIA · 0x3F → 0x3B</Mono>
              <Mono size={vertical ? 30 : 26} color={K.ink} style={{marginTop: 10, opacity: Math.floor(t * 4) % 2 ? 1 : 0.3}}>REINICIANDO…</Mono>
            </div>
          ) : null}
          <IssHud t={t} from={vFrom} clip="namerica" k={vis(t, vFrom + 0.8, issEnd, 0.8, 0.3) * (1 - glitchK * 0.7)} warnFrom={A('atraviesa')} w={w} h={h} vertical={vertical} />
          <Credit16 t={t} t0={vFrom + 1} t1={tHang - 0.5} text="NASA JSC · Gateway to Astronaut Photography of Earth (ISS030-E-260394 a 260709)" right={!vertical} />
        </AbsoluteFill>
      ) : null}
      {hubK > 0 ? (
        <AbsoluteFill style={{opacity: hubK, background: '#000'}}>
          <AbsoluteFill style={{clipPath: `circle(${mix(0, 75, iris)}% at 50% 50%)`}}>
            <Img src={staticFile('ep16/img/hubble_xdf.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${mix(1.05, 1.18, clamp((t - tHub) / 3))})`}} />
          </AbsoluteFill>
          <div style={{position: 'absolute', left: vertical ? 60 : 96, top: vertical ? 160 : 90}}>
            <Caps size={vertical ? 20 : 18} color={K.ink}>Telescopio espacial Hubble</Caps>
            <Mono size={vertical ? 26 : 22} color={t < tObs + 0.3 ? K.cool : K.warn} style={{marginTop: 10}}>
              {t < tObs + 0.3 ? `EXPONIENDO · ${fmtN(mix(61, 64, clamp((t - tHub) / 2)), 0)} %` : 'OBSERVACIÓN SUSPENDIDA'}
            </Mono>
          </div>
          <Credit16 t={t} t0={tHub} t1={tAstro} text="Hubble eXtreme Deep Field · NASA, ESA, G. Illingworth, D. Magee, P. Oesch, R. Bouwens y equipo HUDF09" right={!vertical} />
        </AbsoluteFill>
      ) : null}
      {/* ojos cerrados: destellos */}
      {t > tAstro - 0.4 && t < tTri + 0.2 ? (
        <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 60% at 50% 50%, rgba(40,10,8,${0.35 * vis(t, tAstro, tTri, 1.2, 0.6)}) 0%, rgba(0,0,0,1) 75%)`}}>
          <Phosphenes t={t} t0={A('ojos') - 0.2} t1={tTri - 0.6} rate={2.2} w={w} h={h} />
        </AbsoluteFill>
      ) : null}
    </>
  );
};

/** el globo de s01: del Caribe a Sudamérica y bajada al monte chaqueño, con el título encima */
export const S01Globe: React.FC<SceneP & {vertical?: boolean; until: number}> = ({t, T, w, h, vertical, until}) => {
  const A = (p: string, n = 0) => T.at('s01', p, n);
  const t0 = A('Le dicen') - 0.4;
  if (t < t0 - 0.1 || t > until + 0.6) return null;
  const tNo = A('Pero no está'), tSA = A('Está sobre Sudamérica'), tPunto = A('Y su punto'), tCae = A('cae en'), tMonte = A('el monte');
  const cam = camPath(t, [
    [t0, {lat: 26, lon: -70, range: 3.9, fov: 30}],
    [tNo, {lat: 22, lon: -66, range: 3.6, fov: 30}],
    [tSA + 0.6, {lat: -18, lon: -52, range: 3.2, fov: 30}],
    [tPunto, {lat: -22, lon: -56, range: 3.0, fov: 30}],
    [tCae, {lat: -26.0, lon: -59.8, r0: 1, range: 0.42, tilt: 12, head: 5, fov: 32}],
    [tMonte, {lat: MIN.lat, lon: MIN.lon, r0: 1, range: 0.028, tilt: 34, head: 12, fov: 36}],
    [tMonte + 2.6, {lat: MIN.lat, lon: MIN.lon, r0: 1, range: 0.011, tilt: 46, head: 18, fov: 38}],
    [until + 0.6, {lat: MIN.lat, lon: MIN.lon, r0: 1, range: 0.0135, tilt: 52, head: 34, fov: 38}],
  ]);
  const sun = sunFrom(-14, -22);
  const tri: [number, number][] = [[25.76, -80.19], [32.3, -64.78], [18.47, -66.11], [25.76, -80.19]];
  const triK = vis(t, A('Triángulo') - 0.3, tSA - 0.2, 0.6, 0.6);
  // la zona débil se expande sobre Sudamérica y, al bajar, se encoge hasta el punto exacto
  const thr = mix(mix(22400, 32000, easeInOut(clamp((t - tSA + 0.2) / 2.4))), 22180, easeInOut(clamp((t - tPunto) / (tCae + 1.2 - tPunto))));
  const alt = Math.hypot(...camBasis(cam).P) - 1;
  const fK = ss(tSA - 0.4, tSA + 0.4, t) * ss(0.45, 1.6, alt) * 0.9;
  const k0 = vis(t, t0, until + 0.6, 0.6, 0.6);
  const pmin = project(cam, xyz(MIN.lat, MIN.lon, 1), w, h);
  const ptri = project(cam, xyz(25.5, -70, 1), w, h);
  const strike = easeInOut(clamp((t - tNo - 0.4) / 0.6));
  return (
    <AbsoluteFill style={{opacity: k0}}>
      <Stage16 cam={cam} w={w} h={h} stars={ss(0.5, 1.5, alt)}>
        <Earth t={t} sun={sun} cam={cam} ins={insetsFor(cam)} clouds={cloudsFor(cam) * (1 - 0.6 * fK)} field={{year: 2025, k: fK * 0.8, full: 0, thr, hi: 0.8, iso: 0.9}} spot={{lat: MIN.lat, lon: MIN.lon, r: mix(0.035, 0.00035, ss(0.5, 0.01, alt)), k: ss(tPunto, tPunto + 0.8, t) * mix(1, 0.6, ss(0.05, 0.01, alt))}} />
        <Atmosphere sun={sun} cam={cam} />
        {triK > 0 ? <GlowTube id="tri" pts={surfPath(tri, 30, 24)} radius={0.006} color="#FF6A3A" k={triK * 1.4} reveal={clamp((t - A('Triángulo') + 0.3) / 1.0)} /> : null}
      </Stage16>
      {triK > 0 ? (
        <div style={{position: 'absolute', left: ptri.x + 90, top: ptri.y - 150, opacity: triK}}>
          <Caps size={vertical ? 22 : 20} color={K.ink}>Triángulo de las Bermudas</Caps>
          <div style={{height: 2, width: 330 * strike, background: K.hot, marginTop: -13}} />
        </div>
      ) : null}
      <Label x={pmin.x} y={pmin.y} dx={vertical ? -60 : 150} dy={vertical ? -260 : -170} k={vis(t, tPunto + 0.6, tMonte - 0.2, 0.8, 0.4) * pmin.vis} title="Mínimo del campo · IGRF-14 · 2025" value={<Count t={t} t0={tPunto + 0.6} d={2.2} a={25000} b={MIN.F} />} unit="nT" color={K.hot2} sub={`${fmtLat(MIN.lat)} · ${fmtLon(MIN.lon)}`} />
      <Big t={t} t0={tMonte + 0.1} t1={T.atE('s01', 'argentino') + 0.5} text="EL MONTE CHAQUEÑO" size={vertical ? 56 : 46} y={vertical ? 1520 : 900} font="mono" track={0.3} color="rgba(236,241,246,0.85)" />
      <Credit16 t={t} t0={tCae + 0.6} t1={until} text="Imagen: Sentinel-2 cloudless 2016, EOX IT Services (Copernicus Sentinel 2016), CC BY 4.0" right={!vertical} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ título */
export const S01Title: React.FC<SceneP> = ({t, T}) => {
  const t0 = T.atE('s01', 'argentino') + 0.4, t1 = T.start('s02') - 0.3;
  const k = vis(t, t0 - 0.3, t1, 1.0, 0.8);
  return (
    <>
      {k > 0 ? <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 45% at 50% 48%, rgba(1,2,7,${0.78 * k}) 0%, rgba(1,2,7,${0.45 * k}) 55%, rgba(1,2,7,${0.2 * k}) 100%)`}} /> : null}
      <Title16 t={t} t0={t0} t1={t1} title="EL PUNTO DÉBIL" sub="La anomalía magnética que vive sobre nosotros" size={150} y={400} />
    </>
  );
};

/* ------------------------------------------------------------------ s02: el núcleo, el dínamo, el escudo y Marte */
export const S02: React.FC<SceneP> = ({t, T, w, h}) => {
  const A = (p: string, n = 0) => T.at('s02', p, n);
  const s0 = T.start('s02'), s1 = T.end('s02');
  if (t < s0 - 1.2 || t > s1 + 1.2) return null;
  const tBajar = A('bajar'), tTres = A('Casi tres'), tOce = A('océano'), tGira = A('Ese hierro gira'), tCorr = A('genera corrientes'), tCampo = A('Las corrientes generan'), tDin = A('Es un dínamo');
  const tSale = A('Ese campo sale'), tInv = A('Es invisible'), tPero = A('Pero alcanza'), tChorro = A('un chorro'), tMarte = A('Marte perdió'), tCon = A('Y con él');
  const sA = sunFrom(-14, -22), sB = sunFrom(8, 10), sk = ss(s0 - 1.2, tBajar + 0.6, t);
  const sun: V3 = [mix(sA[0], sB[0], sk), mix(sA[1], sB[1], sk), mix(sA[2], sB[2], sk)];
  // Tierra: sube del monte, se abre en cuña, muestra el núcleo, se cierra y se aleja con las líneas de campo
  const camE = camPath(t, [
    [s0 - 1.2, {lat: MIN.lat, lon: MIN.lon, r0: 1, range: 0.0135, tilt: 52, head: 34, fov: 38}],
    [tBajar - 0.5, {lat: -24, lon: -55, r0: 1, range: 1.3, tilt: 12, head: 10, fov: 34}],
    [tBajar + 0.4, {lat: -10, lon: -40, range: 3.6, fov: 32}],
    [tTres + 0.6, {lat: 12, lon: -32, range: 3.6, fov: 32}],
    [tGira, {lat: 10, lon: -26, range: 3.2, fov: 32}],
    [tCampo, {lat: 12, lon: -24, range: 3.0, fov: 32}],
    [tSale, {lat: 14, lon: -20, range: 4.5, fov: 34}],
    [tInv, {lat: 16, lon: -10, range: 11.5, fov: 34}],
    [tPero, {lat: 18, lon: 0, range: 12.5, fov: 34}],
    [tMarte, {lat: 20, lon: 10, range: 14, fov: 34}],
  ]);
  const cut = ss(tBajar - 0.2, tBajar + 1.0, t) * (1 - ss(tCampo + 0.6, tCampo + 2.0, t));
  const cutW = 74 * cut;
  const conv = mix(0.6, 3.2, ss(tGira - 0.3, tGira + 1.5, t));
  const lines = ss(tCampo - 0.2, tDin + 0.5, t);
  const earthK = 1 - ss(tMarte - 0.6, tMarte, t);
  // Marte
  const marsK = ss(tMarte - 0.5, tMarte + 0.2, t);
  const camM: GeoCam = {lat: 6, lon: 30 + (t - tMarte) * 3, range: 3.4 + (t - tMarte) * 0.1, fov: 32};
  const sunW: V3 = sunFrom(0, -70);
  const pc = project(camE, [0, 0, 0], w, h);
  const pCore = project(camE, xyz(-28, -64, 0.55), w, h, false), pFe = project(camE, xyz(10, -64, 0.38), w, h, false);
  const ruler = vis(t, tTres, tOce + 1.2, 0.6, 0.5);
  return (
    <>
      {earthK > 0 ? (
        <AbsoluteFill style={{opacity: earthK * vis(t, s0 - 1.2, Infinity, 0.3)}}>
          <Stage16 cam={camE} w={w} h={h}>
            <Earth t={t} sun={sun} cam={camE} ins={insetsFor(camE)} clouds={cloudsFor(camE)} cut={{lon: -28, width: Math.max(cutW, 0.001), k: cutW > 3 ? 1 : 0}} />
            {cutW > 3 ? <Section t={t} lon={-28} width={cutW} conv={conv} k={mix(0.6, 1, ss(tGira, tCorr, t))} /> : null}
            <Atmosphere sun={sun} cam={camE} />
            {lines > 0 ? <FieldLines t={t} cam={camE} reveal={lines} k={mix(0.6, 1.0, ss(tSale, tInv, t))} flow={0.35} /> : null}
            {t > tPero - 1 ? <SolarWind t={t - tPero} sunDir={sunW} k={0.6 * ss(tPero - 0.5, tPero + 1.0, t) * (1 - ss(tMarte - 0.4, tMarte, t))} color="#FFD9A8" /> : null}
          </Stage16>
          {/* rótulos del corte */}
          <Label x={pCore.x} y={pCore.y} dx={-220} dy={150} k={ruler} title="Borde del núcleo" value="≈ 2.900 km" unit="de profundidad" color={K.hot2} align="left" />
          <Label x={pFe.x} y={pFe.y} dx={-340} dy={-150} k={vis(t, tOce, tGira + 2.5, 0.6, 0.5)} title="Núcleo externo" value="hierro líquido" color={K.hot} size={34} />
          <Big t={t} t0={tDin - 0.1} t1={tSale - 0.4} text="GEODÍNAMO" size={64} y={880} font="mono" track={0.4} color={K.hot2} />
          <Label x={w * 0.5 + 330} y={h * 0.5 - 220} dx={170} dy={-90} k={vis(t, tSale + 2.0, tInv - 0.3, 0.6, 0.5)} title="Llega a" value="decenas de miles" unit="de km" color={K.cool} size={38} />
          {/* imán de heladera vs. Tierra */}
          {t > tInv - 0.5 && t < tPero + 0.3 ? <Fridge t={t} t0={A('cien veces')} t1={tPero} /> : null}
          <Label x={w * 0.5 - 520} y={h * 0.5 - 40} dx={60} dy={-230} k={vis(t, tChorro - 0.2, tMarte - 0.4, 0.6, 0.5)} title="Viento solar · esquema, no a escala" value="+1.000.000" unit="km/h" color={K.hot2} size={44} align="left" />
        </AbsoluteFill>
      ) : null}
      {marsK > 0 ? (
        <AbsoluteFill style={{opacity: marsK * vis(t, tMarte - 1, s1 + 1.0, 0.3, 0.8)}}>
          <Stage16 cam={camM} w={w} h={h}>
            <Mars sun={sunW} cam={camM} atm={mix(0.55, 0.06, ss(tCon, tCon + 1.6, t))} spin={(t - tMarte) * 0.05} />
            <SolarWind t={t - tPero} sunDir={sunW} shield={0} k={0.7} color="#FFC48A" />
          </Stage16>
          <NameTag t={t} t0={tMarte + 0.2} t1={s1 + 0.8} name="MARTE" role="sin campo magnético global" x={96} y={820} />
          <Credit16 t={t} t0={tMarte} t1={s1 + 0.8} text="Textura de Marte: Solar System Scope (CC BY 4.0), a partir de datos de la NASA" right />
        </AbsoluteFill>
      ) : null}
    </>
  );
};
/** el imán de heladera (≈ 5 mT) contra el campo de la Tierra (≈ 0,05 mT): barras a la misma escala */
const Fridge: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  const k = vis(t, t0 - 0.8, t1, 0.6, 0.4);
  if (k <= 0) return null;
  const g = easeOut(clamp((t - t0 + 0.6) / 1.2));
  const W = 1100;
  return (
    <div style={{position: 'absolute', left: 410, top: 780, width: W, opacity: k}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
        <Caps size={17} color={K.ink} style={{width: 270}}>Imán de heladera</Caps>
        <div style={{height: 18, width: (W - 300) * g, background: K.ice, borderRadius: 2}} />
        <Mono size={20} color={K.ice}>≈ 5 mT</Mono>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 22}}>
        <Caps size={17} color={K.ink} style={{width: 270}}>Campo de la Tierra</Caps>
        <div style={{height: 18, width: Math.max(3, (W - 300) * g * 0.01), background: K.cool, borderRadius: 2}} />
        <Mono size={20} color={K.cool}>≈ 0,05 mT · cien veces menos</Mono>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ s03: atrapa · Explorer 1 · cinturones */
export const S03: React.FC<SceneP> = ({t, T, w, h}) => {
  const A = (p: string, n = 0) => T.at('s03', p, n);
  const s0 = T.start('s03'), s1 = T.end('s03');
  if (t < s0 - 1.5 || t > s1 + 1.5) return null;
  const tTamb = A('También atrapa'), tEn = A('En mil'), tExp = A('el Explorer 1'), tLlev = A('llevaba'), tCuanto = A('Cuanto más'), tSat = A('se saturó');
  const tFis = A('El físico'), tDos = A('dos anillos'), tCint = A('los cinturones'), tAdentro = A('El de adentro'), tLejos = A('Lejos'), tSalvo = A('Salvo');
  const sun = sunFrom(8, 10);
  // 3D: antes (atrapa) y después (los cinturones)
  const on3a = t < tEn + 0.6, on3b = t > tDos - 0.8;
  const camA = camPath(t, [[s0 - 1.5, {lat: 20, lon: 10, range: 14, fov: 34}], [tEn + 0.6, {lat: 14, lon: -10, range: 9.5, fov: 34}]]);
  const camB = camPath(t, [
    [tDos - 0.8, {lat: 8, lon: -40, range: 15, fov: 34}],
    [tCint + 1.2, {lat: 6, lon: -46, range: 11, fov: 34}],
    [tAdentro, {lat: 2, lon: -52, range: 4.2, fov: 34}],
    [tLejos, {lat: -2, lon: -56, range: 3.6, fov: 34}],
    [tSalvo, {lat: -12, lon: -52, range: 3.4, fov: 32}],
    [s1 + 1.5, {lat: -18, lon: -50, range: 3.2, fov: 32}],
  ]);
  const pIss = orbitPts(51.6, -100, 410, 256), pHub = orbitPts(28.5, -60, 530, 256);
  const ruler = vis(t, tAdentro - 0.2, tSalvo + 0.4, 0.6, 0.5);
  const pcB = project(camB, xyz(0, -52, 1.0), w, h);
  const r600 = project(camB, xyz(0, -52, altR(600)), w, h);
  return (
    <>
      {on3a ? (
        <AbsoluteFill style={{opacity: vis(t, s0 - 1.5, tEn + 0.6, 0.3, 0.6)}}>
          <Stage16 cam={camA} w={w} h={h}>
            <Earth t={t} sun={sun} cam={camA} />
            <Atmosphere sun={sun} cam={camA} />
            <FieldLines t={t} cam={camA} k={0.8} />
            <VanAllen t={t} kIn={ss(tTamb - 0.3, tTamb + 1.2, t)} kOut={ss(tTamb, tTamb + 1.6, t)} size={3 * camA.range} />
          </Stage16>
        </AbsoluteFill>
      ) : null}
      {/* archivo: 1958 */}
      <Photo16 t={t} t0={tEn - 0.3} t1={tExp + 1.1} file="ep16/img/explorer1_equipo.jpg" bw z0={1.05} z1={1.16} y0={10} y1={-20} grade={0.35} />
      <Photo16 t={t} t0={tExp + 0.8} t1={tLlev + 0.3} file="ep16/img/explorer1_satelite.jpg" z0={1.1} z1={1.22} y0={60} y1={-40} grade={0.3} />
      {t > tLlev - 0.6 && t < tCuanto + 0.4 ? <ExplorerCut t={t} t0={tLlev - 0.3} t1={tCuanto + 0.3} /> : null}
      <Credit16 t={t} t0={tEn} t1={tCuanto} text="Fotos: NASA / JPL-Caltech y NASA MSFC, 1958" right />
      <NameTag t={t} t0={tEn + 0.3} t1={tExp + 1.0} name="1958 · EXPLORER 1" role="el primer satélite de Estados Unidos" />
      {t > tCuanto - 0.6 && t < tDos ? <Geiger t={t} t0={tCuanto} tSat={tSat} t1={tFis + 0.2} /> : null}
      {/* James Van Allen: la misma foto, con él marcado */}
      {t > tFis - 0.5 && t < tDos + 0.2 ? (
        <AbsoluteFill style={{opacity: vis(t, tFis - 0.4, tDos, 0.4, 0.6)}}>
          <Img src={staticFile('ep16/img/explorer1_equipo.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.08) brightness(0.8)', transform: `scale(${mix(1.25, 1.45, clamp((t - tFis) / 3))}) translate(0px, 40px)`}} />
          <NameTag t={t} t0={tFis + 0.3} t1={tDos} name="JAMES VAN ALLEN" role="físico · Universidad de Iowa" x={96} y={840} />
        </AbsoluteFill>
      ) : null}
      {on3b ? (
        <AbsoluteFill style={{opacity: vis(t, tDos - 0.8, s1 + 1.5, 0.6, 0.6)}}>
          <Stage16 cam={camB} w={w} h={h}>
            <Earth t={t} sun={sun} cam={camB} />
            <Atmosphere sun={sun} cam={camB} />
            <VanAllen t={t} kIn={mix(1, 0.55, ss(tAdentro - 0.6, tAdentro + 0.6, t))} kOut={1 - ss(tAdentro - 0.6, tAdentro + 0.6, t) * 0.9} size={3 * camB.range} />
            {ruler > 0 ? <GlowTube id="iss3" pts={pIss} radius={0.0035} color="#8DB8FF" k={ruler * 0.8} /> : null}
            {ruler > 0 ? <GlowTube id="hub3" pts={pHub} radius={0.0035} color="#B9A6FF" k={ruler * 0.6} /> : null}
            {t > tSalvo - 0.6 ? <BeltShell t={t} cam={camB} k={ss(tSalvo - 0.4, tSalvo + 0.8, t)} /> : null}
          </Stage16>
          <Label x={w * 0.5 - 360} y={h * 0.5 - 30} dx={-160} dy={-200} k={vis(t, tCint, tAdentro, 0.6, 0.5)} title="Cinturón interior" value="protones" color={K.hot2} size={36} />
          <Label x={w * 0.5 + 520} y={h * 0.5 - 140} dx={150} dy={-150} k={vis(t, tCint + 0.4, tAdentro, 0.6, 0.5)} title="Cinturón exterior" value="electrones" color={K.ice} size={36} />
          <Label x={r600.x} y={r600.y} dx={-220} dy={-160} k={ruler * pcB.vis} title="Empieza a unos" value="600" unit="km" color={K.hot2} />
        </AbsoluteFill>
      ) : null}
    </>
  );
};
/** el corte del Explorer 1 con el contador de radiación marcado */
const ExplorerCut: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  const k = vis(t, t0, t1, 0.5, 0.5);
  if (k <= 0) return null;
  const z = mix(1.0, 1.35, easeInOut(clamp((t - t0) / (t1 - t0))));
  // "COSMIC RAY AND MICROMETEORITE PACKAGE" queda hacia el centro abajo de la ilustración
  return (
    <AbsoluteFill style={{opacity: k, background: '#EDE6D6'}}>
      <Img src={staticFile('ep16/img/explorer1_corte.jpg')} style={{width: '100%', height: '100%', objectFit: 'contain', transform: `scale(${z})`, transformOrigin: '58% 52%', filter: 'sepia(0.15) contrast(1.05)'}} />
      <AbsoluteFill style={{background: `radial-gradient(circle at 58% 52%, rgba(0,0,0,0) 12%, rgba(0,0,0,${0.55 * ss(t0 + 0.6, t0 + 1.4, t)}) 30%)`}} />
      <Label x={1110} y={560} dx={160} dy={-250} k={vis(t, t0 + 0.8, t1, 0.6, 0.3)} title="Explorer 1 · 1958" value="contador de radiación" color={K.hot} size={36} />
    </AbsoluteFill>
  );
};
/** el contador del Explorer 1: cuentas que suben con la altura hasta que el tubo se satura y marca cero (esquema) */
const Geiger: React.FC<{t: number; t0: number; tSat: number; t1: number}> = ({t, t0, tSat, t1}) => {
  const k = vis(t, t0 - 0.5, t1, 0.5, 0.5);
  if (k <= 0) return null;
  const data: [number, number][] = [];
  for (let a = 300; a <= 2500; a += 20) {
    const c = a < 1900 ? 30 * Math.exp((a - 300) / 330) : 0;
    data.push([a, Math.min(c, 4000)]);
  }
  const sat = t > tSat;
  return (
    <AbsoluteFill style={{opacity: k, background: 'rgba(1,2,7,0.92)'}}>
      <div style={{position: 'absolute', left: 300, top: 150}}>
        <Caps size={20} color={K.ink}>Explorer 1 · contador Geiger · esquema</Caps>
        <Mono size={18} color={K.dim} style={{marginTop: 8}}>cuentas por segundo según la altura</Mono>
      </div>
      <LineChart t={t} t0={t0} d={tSat - t0 + 0.2} k={1} data={data} xr={[300, 2500]} yr={[0, 4000]} box={[300, 260, 1320, 560]} color={K.hot} width={4} xticks={[500, 1000, 1500, 2000, 2500]} xfmt={(v) => `${fmtN(v)} km`} yticks={[]} grid={false} />
      {sat ? <Big t={t} t0={tSat + 0.05} t1={t1} text="SATURADO" size={92} y={420} font="mono" track={0.3} color={K.warn} /> : null}
    </AbsoluteFill>
  );
};
