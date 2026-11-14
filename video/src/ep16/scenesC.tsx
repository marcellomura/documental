/* Ep16 · escenas s08-s15 y cierre: el mínimo en superficie, su camino, Pilar, la zona que crece y se parte, el núcleo,
   las inversiones, ¿y a vos?, los satélites, la abolladura y alguien que ve luces. */
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {clamp, easeInOut, easeOut, rnd} from '../lib/anim';
import {Atmosphere, BeltParticles, BeltShell, Blob, CoreSphere, Dots, Earth, FieldLines, GlowTube, Stage16, orbitPos, orbitPts, surfPath} from './globe16';
import {Big, Caps, Count, Credit16, K, Label, LineChart, Mono, NameTag, Phosphenes, Photo16, Quote16, Title16, mix, ss, vis} from './kit16';
import {IssHud, IssVideo, cloudsFor, insetsFor, type SceneP} from './scenesA';
import {altR, camBasis, camPath, fmtLat, fmtLon, fmtN, project, sunFrom, xyz, type V3} from './lib16';
import CAMPO from '../data/ep16/campo.json';
import EXTRA from '../data/ep16/extra.json';
import PILAR from '../data/ep16/pilar.json';
import MINJ from '../data/ep16/minimo.json';

const MIN = {lat: -26.23, lon: -60.02, F: 22071};
const AREAS = (CAMPO as unknown as {areas: {y: number; a32: number}[]}).areas;
const areaAt = (y: number) => {
  const a = AREAS.filter((q) => q.y <= 2025);
  if (y <= a[0].y) return a[0].a32;
  for (let i = 0; i < a.length - 1; i++) if (y <= a[i + 1].y) return mix(a[i].a32, a[i + 1].a32, (y - a[i].y) / (a[i + 1].y - a[i].y));
  return a[a.length - 1].a32;
};
const fminAt = (y: number) => {
  const a = (CAMPO as unknown as {areas: {y: number; fmin: number}[]}).areas;
  if (y <= a[0].y) return a[0].fmin;
  for (let i = 0; i < a.length - 1; i++) if (y <= a[i + 1].y) return mix(a[i].fmin, a[i + 1].fmin, (y - a[i].y) / (a[i + 1].y - a[i].y));
  return a[a.length - 1].fmin;
};
const CAMINO = (MINJ as unknown as {camino: {y: number; lat: number; lon: number}[]}).camino;
const caminoAt = (y: number) => {
  const c = CAMINO;
  if (y <= c[0].y) return c[0];
  for (let i = 0; i < c.length - 1; i++) if (y <= c[i + 1].y) {
    const k = (y - c[i].y) / (c[i + 1].y - c[i].y);
    return {y, lat: mix(c[i].lat, c[i + 1].lat, k), lon: mix(c[i].lon, c[i + 1].lon, k)};
  }
  return c[c.length - 1];
};
const PD = (EXTRA as unknown as {pampa_del_indio: {lat: number; lon: number}}).pampa_del_indio;
const FMAX = (EXTRA as unknown as {fmax: {lat: number; lon: number; F: number}}).fmax;

/* ------------------------------------------------------------------ s08: el mínimo en la superficie */
export const S08: React.FC<SceneP & {vertical?: boolean}> = ({t, T, w, h, vertical}) => {
  const A = (p: string, n = 0) => T.at('s08', p, n);
  const s0 = T.start('s08'), s1 = T.end('s08');
  if (t < s0 - 1.2 || t > s1 + 1.2) return null;
  const tSup = A('En la superficie'), tPolos = A('Cerca de los polos'), tAca = A('Acá,'), tTercio = A('Un tercio'), tModelo = A('El modelo'), tHoy = A('Hoy da'), tEs = A('Es el Chaco'), tVeinte = A('A veinte');
  const sun = sunFrom(-20, -30);
  const cam = camPath(t, [
    [s0 - 1.2, {lat: -24, lon: -48, range: 2.9, fov: 30}],
    [tSup + 0.4, {lat: -28, lon: -40, range: 3.3, fov: 30}],
    [tPolos + 0.3, {lat: -62, lon: 100, range: 3.5, fov: 30}],
    [tPolos + 2.4, {lat: -60, lon: 120, range: 3.4, fov: 30}],
    [tAca + 0.6, {lat: -24, lon: -56, range: 3.2, fov: 30}],
    [tModelo, {lat: -25, lon: -58, range: 2.9, fov: 30}],
    [tHoy + 0.6, {lat: -26, lon: -60, r0: 1, range: 0.9, tilt: 0, fov: 32}],
    [tEs, {lat: -26.1, lon: -60.0, r0: 1, range: 0.12, tilt: 18, head: 0, fov: 34}],
    [tVeinte + 0.4, {lat: -26.08, lon: -60.0, r0: 1, range: 0.0075, tilt: 30, head: 4, fov: 36}],
    [s1 + 1.2, {lat: -26.05, lon: -60.0, r0: 1, range: 0.0068, tilt: 36, head: 10, fov: 36}],
  ]);
  const alt = Math.hypot(...camBasis(cam).P) - 1;
  const fK = ss(tSup - 0.3, tSup + 0.8, t) * ss(0.6, 1.4, alt);
  const pMax = project(cam, xyz(FMAX.lat, FMAX.lon, 1), w, h), pMin = project(cam, xyz(MIN.lat, MIN.lon, 1), w, h), pPd = project(cam, xyz(PD.lat, PD.lon, 1), w, h);
  const grid = ss(tModelo, tHoy, t) * ss(0.02, 0.2, alt);
  const lat0 = surfPath([[MIN.lat, -100], [MIN.lat, -60.02], [MIN.lat, -20]], 3, 40), lon0 = surfPath([[10, MIN.lon], [MIN.lat, MIN.lon], [-60, MIN.lon]], 3, 40);
  const cross = ss(tHoy, tHoy + 1.2, t) * (1 - ss(tEs - 0.8, tEs, t));
  return (
    <AbsoluteFill style={{opacity: vis(t, s0 - 1.2, s1 + 1.2, 0.6, 0.6)}}>
      <Stage16 cam={cam} w={w} h={h} stars={ss(0.4, 1.4, alt)}>
        <Earth t={t} sun={sun} cam={cam} ins={insetsFor(cam)} clouds={cloudsFor(cam, 0.5) * (1 - fK * 0.7)} field={{year: 2025, k: fK, full: 1, thr: 26000, hi: 0.5, iso: 1}} grid={grid} spot={{lat: MIN.lat, lon: MIN.lon, r: mix(0.02, 0.0006, ss(0.4, 0.01, alt)), k: ss(tHoy, tHoy + 1, t)}} />
        <Atmosphere sun={sun} cam={cam} />
        {cross > 0 ? <GlowTube id="lat26" pts={lat0} radius={0.0022} color="#FFC24A" k={cross} /> : null}
        {cross > 0 ? <GlowTube id="lon60" pts={lon0} radius={0.0022} color="#FFC24A" k={cross} /> : null}
      </Stage16>
      <FieldBar t={t} t0={tSup + 0.3} t1={tModelo} vertical={vertical} />
      <Label x={pMax.x} y={pMax.y} dx={vertical ? -60 : 160} dy={-150} k={vis(t, tPolos + 0.6, tAca, 0.6, 0.5) * pMax.vis} title="Cerca del polo sur magnético" value={fmtN(FMAX.F)} unit="nT" color={K.cool} />
      <Label x={pMin.x} y={pMin.y} dx={vertical ? -40 : 170} dy={vertical ? -280 : -150} k={vis(t, tAca + 0.4, tModelo, 0.6, 0.5) * pMin.vis} title="Mínimo · Chaco" value={fmtN(MIN.F)} unit="nT" color={K.hot2} />
      <Big t={t} t0={tTercio - 0.05} t1={tModelo - 0.3} text="⅓" size={vertical ? 200 : 180} y={vertical ? 1300 : 760} font="mono" color={K.hot2} />
      <div style={{position: 'absolute', left: vertical ? 60 : 96, top: vertical ? 160 : 84, opacity: vis(t, tModelo, tEs, 0.6, 0.5)}}>
        <Caps size={vertical ? 20 : 18} color={K.ink}>IGRF-14 · Campo Geomagnético Internacional de Referencia</Caps>
        <Mono size={vertical ? 19 : 17} color={K.dim} style={{marginTop: 8}}>Asociación Internacional de Geomagnetismo y Aeronomía (IAGA)</Mono>
      </div>
      <Big t={t} t0={tHoy + 0.4} t1={tEs + 0.2} text={`${fmtLat(MIN.lat)} · ${fmtLon(MIN.lon)}`} size={vertical ? 62 : 70} y={vertical ? 1480 : 860} font="mono" color={K.hot2} track={0.02} />
      {t > tVeinte - 0.5 ? (
        <svg style={{position: 'absolute', left: 0, top: 0, opacity: vis(t, tVeinte - 0.3, s1 + 1, 0.5, 0.5)}} width={w} height={h}>
          <line x1={pMin.x} y1={pMin.y} x2={mix(pMin.x, pPd.x, ss(tVeinte - 0.2, tVeinte + 0.8, t))} y2={mix(pMin.y, pPd.y, ss(tVeinte - 0.2, tVeinte + 0.8, t))} stroke={K.ink} strokeWidth={2} strokeDasharray="8 8" />
          <circle cx={pMin.x} cy={pMin.y} r={10} fill="none" stroke={K.hot2} strokeWidth={3} />
        </svg>
      ) : null}
      <Label x={pPd.x} y={pPd.y} dx={vertical ? -40 : 150} dy={-120} k={vis(t, tVeinte + 0.5, s1 + 1, 0.5, 0.5) * pPd.vis} title="Pampa del Indio" value="21" unit="km" color={K.ink} />
      <Label x={pMin.x} y={pMin.y} dx={vertical ? 40 : -170} dy={vertical ? 240 : 140} k={vis(t, tEs + 0.2, s1 + 1, 0.5, 0.5) * pMin.vis} title="el punto más débil" value="Chaco" color={K.hot2} size={36} />
      <Credit16 t={t} t0={tEs + 0.5} t1={s1 + 1} text="Imagen: Sentinel-2 cloudless 2016, EOX (Copernicus Sentinel 2016), CC BY 4.0 · campo: IGRF-14" right={!vertical} />
    </AbsoluteFill>
  );
};
/** barra de colores del campo en superficie */
const FieldBar: React.FC<{t: number; t0: number; t1: number; vertical?: boolean}> = ({t, t0, t1, vertical}) => {
  const k = vis(t, t0, t1, 0.6, 0.5);
  if (k <= 0) return null;
  const stops = [[22000, '#FFEDB3'], [25000, '#FF8C1F'], [31000, '#D9213A'], [38000, '#33134D'], [52000, '#1A47D9'], [65000, '#40EBD1']] as [number, string][];
  const W = vertical ? 900 : 760;
  return (
    <div style={{position: 'absolute', left: vertical ? 90 : 96, bottom: vertical ? 300 : 90, opacity: k}}>
      <Caps size={16} color={K.dim}>Intensidad del campo en superficie · 2025 · nanoteslas</Caps>
      <div style={{width: W, height: 14, marginTop: 14, background: `linear-gradient(90deg, ${stops.map(([v, c]) => `${c} ${((v - 22000) / 43000) * 100}%`).join(', ')})`}} />
      <div style={{position: 'relative', width: W, height: 30}}>
        {[22000, 30000, 40000, 50000, 60000].map((v) => <Mono key={v} size={16} color={K.dim} style={{position: 'absolute', left: ((v - 22000) / 43000) * W - 30, top: 8}}>{fmtN(v)}</Mono>)}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ s09: el camino del mínimo desde 1900 */
export const S09: React.FC<SceneP> = ({t, T, w, h}) => {
  const A = (p: string, n = 0) => T.at('s09', p, n);
  const s0 = T.start('s09'), s1 = T.end('s09');
  if (t < s0 - 1.2 || t > s1 + 1.2) return null;
  const t1900 = A('En mil'), tSes = A('En los años sesenta'), tNov = A('En los noventa'), tPar = A('cruzó'), tFor = A('pasó por'), tSigue = A('y sigue'), tVeinte = A('a unos veinte');
  // año que se muestra según la frase
  const year = camPath(t, [
    [s0 - 1, {lat: 1900, lon: 0, range: 1}], [t1900 + 0.5, {lat: 1900, lon: 0, range: 1}], [tSes + 0.4, {lat: 1963, lon: 0, range: 1}],
    [tNov + 0.4, {lat: 1994, lon: 0, range: 1}], [tPar + 0.3, {lat: 2001, lon: 0, range: 1}], [tFor + 0.3, {lat: 2017, lon: 0, range: 1}],
    [tSigue + 0.4, {lat: 2025, lon: 0, range: 1}], [tVeinte + 0.8, {lat: 2034, lon: 0, range: 1}],
  ], easeInOut).lat;
  const m = caminoAt(year);
  const sun = sunFrom(-25, -45);
  const cam = camPath(t, [
    [s0 - 1.2, {lat: -24, lon: -52, r0: 1, range: 1.15, tilt: 8, fov: 32}],
    [t1900 + 0.4, {lat: -22, lon: -45, r0: 1, range: 0.95, tilt: 12, head: -20, fov: 32}],
    [tNov + 0.4, {lat: -25, lon: -52, r0: 1, range: 0.62, tilt: 16, head: -10, fov: 32}],
    [tSigue + 0.4, {lat: -26, lon: -58, r0: 1, range: 0.5, tilt: 20, head: -5, fov: 32}],
    [s1 + 1.2, {lat: -27, lon: -60, r0: 1, range: 0.52, tilt: 22, head: 0, fov: 32}],
  ]);
  const pts = CAMINO.filter((c) => c.y <= 2035).map((c) => [c.lat, c.lon] as [number, number]);
  const path = surfPath(pts, 6, 3);
  const rev = clamp((year - 1900) / (2035 - 1900));
  const pNow = project(cam, xyz(m.lat, m.lon, 1), w, h);
  const marks: [number, string, number][] = [[1900, 'océano frente a Brasil', t1900], [1963, 'costa de Santa Catarina', tSes], [1994, 'Misiones', tNov], [2001, 'Paraguay', tPar], [2017, 'Formosa', tFor], [2025, 'Chaco', tSigue]];
  return (
    <AbsoluteFill style={{opacity: vis(t, s0 - 1.2, s1 + 1.2, 0.6, 0.6)}}>
      <Stage16 cam={cam} w={w} h={h} stars={0.6}>
        <Earth t={t} sun={sun} cam={cam} ins={insetsFor(cam)} clouds={0} spec={0.2} field={{year: Math.min(year, 2030), k: 0.9, full: 0, thr: fminAt(year) + 800, hi: 0.8, iso: 0.8}} dim={0.85} />
        <Atmosphere sun={sun} cam={cam} />
        <GlowTube id="camino" pts={path} radius={0.0032} color="#FFC24A" k={1.3} reveal={rev} />
        <Dots pts={[xyz(m.lat, m.lon, altR(8))]} size={26} color="#FFF2D6" k={1} />
      </Stage16>
      {marks.map(([y, name, tt]) => {
        const c = caminoAt(y);
        const p = project(cam, xyz(c.lat, c.lon, 1), w, h);
        const k = vis(t, tt + 0.2, s1 + 1, 0.5, 0.5) * p.vis;
        if (k <= 0) return null;
        return (
          <div key={y} style={{position: 'absolute', left: p.x + 18, top: p.y - 46, opacity: k}}>
            <Mono size={26} color={K.hot2}>{y}</Mono>
            <Caps size={15} color={K.ink}>{name}</Caps>
          </div>
        );
      })}
      <div style={{position: 'absolute', right: 96, top: 70, textAlign: 'right'}}>
        <Caps size={16} color={K.dim}>dónde está el mínimo</Caps>
        <Mono size={110} color={K.ink}>{Math.floor(year)}</Mono>
        <Mono size={20} color={K.dim}>{fmtLat(m.lat, 1)} · {fmtLon(m.lon, 1)}{year > 2025.5 ? ' · proyección' : ''}</Mono>
      </div>
      <Label x={pNow.x} y={pNow.y} dx={-200} dy={170} k={vis(t, tVeinte - 0.2, s1 + 1, 0.5, 0.5) * pNow.vis} title="Hacia el oeste" value="≈ 20" unit="km por año" color={K.hot2} />
      <Credit16 t={t} t0={s0} t1={s1 + 1} text="Posición del mínimo año por año · modelo IGRF-14 (después de 2025, con la variación secular)" right />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ s10: Pilar, la zona que crece, Swarm y el segundo mínimo */
export const S10: React.FC<SceneP> = ({t, T, w, h}) => {
  const A = (p: string, n = 0) => T.at('s10', p, n);
  const s0 = T.start('s10'), s1 = T.end('s10');
  if (t < s0 - 1.2 || t > s1 + 1.2) return null;
  const tPilar = A('En Pilar'), tEnt = A('Entonces'), tHoy = A('Hoy,'), tUn = A('Un veintidós'), tZona = A('Y la zona'), tEn1900 = A('En mil'), tHoy2 = A('Hoy,', 1), tQuinta = A('Una quinta'), tSwarm = A('Los satélites'), tCerca = A('cerca de África'), tLa = A('La anomalía');
  const sun = sunFrom(-15, -30);
  // 1) el globo con el observatorio
  const camP = camPath(t, [[s0 - 1.2, {lat: -27, lon: -60, r0: 1, range: 0.6, tilt: 10, fov: 32}], [tEnt, {lat: -31.67, lon: -63.88, r0: 1, range: 0.25, tilt: 25, head: 10, fov: 32}]]);
  const pPil = project(camP, xyz(-31.67, -63.88, 1), w, h);
  // 2) el gráfico de Pilar
  const data = (PILAR as unknown as {datos: [number, number][]}).datos;
  const model = (EXTRA as unknown as {pilar_modelo: [number, number][]}).pilar_modelo;
  const chartK = vis(t, tEnt - 0.4, tZona + 0.2, 0.6, 0.6);
  // 3) la zona débil crece (1900 → 2025), Swarm, dos mínimos
  const year = mix(1900, 2025, easeInOut(clamp((t - tEn1900 - 0.2) / (tHoy2 + 0.6 - tEn1900 - 0.2)))) + mix(0, 5, ss(tLa - 0.2, s1, t));
  const camZ = camPath(t, [[tZona - 0.6, {lat: -30, lon: -35, range: 3.4, fov: 30}], [tSwarm, {lat: -30, lon: -28, range: 3.3, fov: 30}], [tCerca, {lat: -34, lon: -25, range: 3.1, fov: 30}], [s1 + 1.2, {lat: -36, lon: -22, range: 3.0, fov: 30}]]);
  const thr = mix(32000, 24400, ss(tCerca - 0.6, tCerca + 1.2, t));
  const zK = ss(tZona - 0.6, tZona, t);
  const sw = ss(tSwarm - 0.3, tSwarm + 0.6, t) * (1 - ss(tLa - 0.5, tLa + 0.3, t));
  const swarm: V3[] = [orbitPos(87.35, -40, 460, (t - tSwarm) * 0.9 + 1.0), orbitPos(87.35, -38.6, 460, (t - tSwarm) * 0.9 + 1.02), orbitPos(87.75, -10, 510, (t - tSwarm) * 0.86 + 2.2)];
  const p2 = project(camZ, xyz(-40.75, -0.75, 1), w, h), p1 = project(camZ, xyz(MIN.lat, MIN.lon, 1), w, h);
  return (
    <>
      {t < tEnt + 0.5 ? (
        <AbsoluteFill style={{opacity: vis(t, s0 - 1.2, tEnt + 0.5, 0.6, 0.5)}}>
          <Stage16 cam={camP} w={w} h={h} stars={0.5}>
            <Earth t={t} sun={sun} cam={camP} ins={insetsFor(camP)} clouds={0} spot={{lat: -31.67, lon: -63.88, r: 0.004, k: 1}} />
            <Atmosphere sun={sun} cam={camP} />
          </Stage16>
          <Big t={t} t0={s0 + 0.1} t1={tPilar - 0.2} text="no es solo un modelo" size={64} y={860} font="serif" color={K.ink} />
          <Label x={pPil.x} y={pPil.y} dx={170} dy={-150} k={vis(t, tPilar + 0.2, tEnt + 0.4, 0.6, 0.4) * pPil.vis} title="Observatorio de Pilar · Córdoba" value="desde 1905" color={K.ink} sub="Servicio Meteorológico Nacional" />
        </AbsoluteFill>
      ) : null}
      {chartK > 0 ? (
        <AbsoluteFill style={{opacity: chartK, background: '#010207'}}>
          <div style={{position: 'absolute', left: 230, top: 110}}>
            <Caps size={19} color={K.ink}>Observatorio de Pilar · intensidad total medida (medias anuales)</Caps>
            <Mono size={17} color={K.dim} style={{marginTop: 8}}>puntos: medición · línea punteada: modelo IGRF-14 en el mismo lugar</Mono>
          </div>
          <LineChart t={t} t0={tEnt - 0.2} d={tUn - tEnt + 0.5} k={1} data={model} xr={[1900, 2030]} yr={[21500, 29500]} box={[230, 230, 1460, 620]} color="rgba(141,184,255,0.7)" width={2} dash="6 8" yticks={[22000, 24000, 26000, 28000]} xticks={[1905, 1940, 1980, 2024]} grid />
          <LineChart t={t} t0={tEnt - 0.2} d={tUn - tEnt + 0.5} k={1} data={data} xr={[1900, 2030]} yr={[21500, 29500]} box={[230, 230, 1460, 620]} color={K.hot} width={3} dots xticks={[]} yticks={[]} grid={false} />
          <Label x={230 + ((1905.5 - 1900) / 130) * 1460} y={230 + 620 - ((28819 - 21500) / 8000) * 620} dx={120} dy={-60} k={vis(t, tEnt + 0.3, tZona, 0.5, 0.4)} title="1905" value="28.819" unit="nT" color={K.ink} size={40} />
          <Label x={230 + ((2024.5 - 1900) / 130) * 1460} y={230 + 620 - ((22476 - 21500) / 8000) * 620} dx={-160} dy={-150} k={vis(t, tHoy + 0.3, tZona, 0.5, 0.4)} title="2024" value="22.476" unit="nT" color={K.hot2} size={40} />
          <Big t={t} t0={tUn} t1={tZona} text="−22 %" size={130} y={300} font="mono" color={K.hot} />
          <Credit16 t={t} t0={tEnt} t1={tZona} text="Datos: World Data Centre for Geomagnetism (Edimburgo) · observatorio del SMN" right />
        </AbsoluteFill>
      ) : null}
      {zK > 0 ? (
        <AbsoluteFill style={{opacity: vis(t, tZona - 0.6, s1 + 1.2, 0.6, 0.6)}}>
          <Stage16 cam={camZ} w={w} h={h}>
            <Earth t={t} sun={sun} cam={camZ} clouds={0.4} field={{year, k: 1, full: 0, thr, hi: 0.9, iso: 0.7}} dim={0.85} />
            <Atmosphere sun={sun} cam={camZ} />
            {sw > 0 ? <Dots pts={swarm} size={20} color="#FFFFFF" k={sw} /> : null}
            {sw > 0 ? <GlowTube id="sw1" pts={orbitPts(87.35, -40, 460, 300)} radius={0.0028} color="#8DB8FF" k={sw * 0.6} /> : null}
            {sw > 0 ? <GlowTube id="sw3" pts={orbitPts(87.75, -10, 510, 300)} radius={0.0028} color="#8DB8FF" k={sw * 0.5} /> : null}
          </Stage16>
          <div style={{position: 'absolute', right: 96, top: 70, textAlign: 'right', opacity: vis(t, tEn1900 - 0.3, tSwarm, 0.5, 0.5)}}>
            <Caps size={16} color={K.dim}>zona con menos de 32.000 nT</Caps>
            <Mono size={96} color={K.hot2}>{Math.floor(year)}</Mono>
            <Mono size={40} color={K.ink}>{fmtN(areaAt(year), 0)} <span style={{fontSize: 20, color: K.dim}}>millones de km²</span></Mono>
            <Mono size={20} color={K.dim} style={{marginTop: 8, opacity: ss(tQuinta - 0.3, tQuinta + 0.3, t)}}>21 % de la superficie del planeta</Mono>
          </div>
          <NameTag t={t} t0={tSwarm + 0.3} t1={tCerca - 0.2} name="SWARM" role="tres satélites de la Agencia Espacial Europea" x={96} y={840} />
          <Label x={p2.x} y={p2.y} dx={160} dy={-170} k={vis(t, tCerca + 0.4, s1 + 1, 0.6, 0.5) * p2.vis} title="Segundo mínimo · aparece hacia 2007" value="41° S · 1° O" color={K.hot2} size={36} />
          <Label x={p1.x} y={p1.y} dx={-170} dy={-170} k={vis(t, tCerca + 0.8, s1 + 1, 0.6, 0.5) * p1.vis} title="Mínimo principal" value="Chaco" color={K.hot2} size={36} />
          <Big t={t} t0={tLa} t1={s1 + 1} text="se parte en dos" size={70} y={890} font="serif" color={K.ink} />
          <Credit16 t={t} t0={tZona} t1={tSwarm} text="Áreas y mínimos calculados con el IGRF-14 · ESA (2025): la anomalía creció desde 2014" />
        </AbsoluteFill>
      ) : null}
    </>
  );
};

/* ------------------------------------------------------------------ s11: el borde del núcleo */
export const S11: React.FC<SceneP> = ({t, T, w, h}) => {
  const A = (p: string, n = 0) => T.at('s11', p, n);
  const s0 = T.start('s11'), s1 = T.end('s11');
  if (t < s0 - 1.2 || t > s1 + 1.2) return null;
  const tResp = A('La respuesta'), tBorde = A('en el borde'), tEnHem = A('En el hemisferio'), tPero = A('Pero debajo'), tEntra = A('entra'), tSon = A('Son parches'), tUna = A('Una de las'), tMasa = A('una masa'), tAfrica = A('África');
  const sun = sunFrom(-10, -10);
  const cam = camPath(t, [
    [s0 - 1.2, {lat: -30, lon: -20, range: 3.2, fov: 30}],
    [tBorde + 0.8, {lat: -30, lon: -20, range: 2.1, fov: 30}],
    [tPero, {lat: -32, lon: -15, range: 1.85, fov: 30}],
    [tUna, {lat: -25, lon: 0, range: 1.9, fov: 30}],
    [tAfrica, {lat: -15, lon: 15, range: 1.75, fov: 30}],
    [s1 + 1.2, {lat: -14, lon: 18, range: 1.7, fov: 30}],
  ]);
  const ghost = ss(tResp, tBorde + 0.6, t);
  const year = mix(1900, 2025, easeInOut(clamp((t - tSon) / 2.6)));
  const deg10 = t > tSon - 0.3;
  const pIn = project(cam, xyz(-35, -10, 0.547), w, h, false), pOut = project(cam, xyz(-60, -60, 0.547), w, h, false);
  return (
    <AbsoluteFill style={{opacity: vis(t, s0 - 1.2, s1 + 1.2, 0.6, 0.6)}}>
      <Stage16 cam={cam} w={w} h={h}>
        <Earth t={t} sun={sun} cam={cam} alpha={mix(1, 0.1, ghost)} clouds={mix(0.6, 0, ghost)} night={0.4} />
        {ghost > 0.05 ? <CoreSphere t={t} cam={cam} k={ghost} rev={ss(tPero, tEntra, t)} deg10={deg10} year={deg10 ? year : 2025} /> : null}
        {t > tMasa - 0.6 ? <Blob lat={-10} lon={18} cam={cam} t={t} k={ss(tMasa - 0.4, tMasa + 1, t)} /> : null}
      </Stage16>
      <Label x={pOut.x} y={pOut.y} dx={-160} dy={140} k={vis(t, tEnHem + 0.4, tSon, 0.6, 0.5)} title="Debería" value="salir" color="#FF6A3A" size={40} />
      <Label x={pIn.x} y={pIn.y} dx={170} dy={-150} k={vis(t, tEntra - 0.1, tUna, 0.6, 0.5)} title="Parches de flujo invertido" value="entra" color="#6FA8FF" size={40} />
      <Caps size={18} color={K.ink} style={{position: 'absolute', left: 96, top: 84, opacity: vis(t, tBorde, tUna, 0.6, 0.5)}}>Borde del núcleo · 2.900 km de profundidad · campo radial (IGRF-14)</Caps>
      {deg10 ? <Mono size={88} color={K.ink} style={{position: 'absolute', right: 96, top: 70, opacity: vis(t, tSon - 0.2, tUna, 0.5, 0.5)}}>{Math.floor(year)}</Mono> : null}
      <NameTag t={t} t0={tMasa + 0.6} t1={s1 + 1} name="LLSVP" role="gran provincia de baja velocidad bajo África · hipótesis (Tarduno et al., 2015)" x={96} y={840} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ s12: ¿se da vuelta? */
const GPTS: [number, number, number][] = [ // millones de años (GTS2012, simplificada): [desde, hasta, normal=1]
  [0, 0.781, 1], [0.781, 0.988, 0], [0.988, 1.072, 1], [1.072, 1.778, 0], [1.778, 1.945, 1], [1.945, 2.581, 0], [2.581, 3.032, 1], [3.032, 3.116, 0], [3.116, 3.207, 1], [3.207, 3.33, 0], [3.33, 3.596, 1], [3.596, 4.187, 0], [4.187, 4.3, 1], [4.3, 4.493, 0], [4.493, 4.631, 1], [4.631, 4.799, 0], [4.799, 4.896, 1], [4.896, 4.997, 0], [4.997, 5.235, 1], [5.235, 6.0, 0],
];
const Seafloor: React.FC<{t: number; t0: number; tLast: number; t1: number; w: number; h: number}> = ({t, t0, tLast, t1, w, h}) => {
  const k = vis(t, t0, t1, 0.6, 0.6);
  if (k <= 0) return null;
  const cx = w / 2, y0 = 380, y1 = 760;
  const grow = easeOut(clamp((t - t0) / 2.4));
  const pxPerMa = 140 * grow;
  const stripes: React.ReactNode[] = [];
  GPTS.forEach(([a, b, n], i) => {
    for (const s of [-1, 1]) {
      const xa = cx + s * a * pxPerMa, xb = cx + s * b * pxPerMa;
      stripes.push(<rect key={`${i}${s}`} x={Math.min(xa, xb)} y={y0} width={Math.abs(xb - xa)} height={y1 - y0} fill={n ? '#D9E4F2' : '#1B2638'} opacity={0.95} />);
    }
  });
  const hl = vis(t, tLast, t1, 0.5, 0.5);
  return (
    <AbsoluteFill style={{opacity: k, background: '#010207'}}>
      <svg width={w} height={h}>
        {stripes}
        <line x1={cx} x2={cx} y1={y0 - 40} y2={y1 + 40} stroke={K.hot} strokeWidth={4} />
        {hl > 0 ? <rect x={cx + 0.781 * pxPerMa - 3} y={y0 - 20} width={6} height={y1 - y0 + 40} fill={K.hot2} opacity={hl} /> : null}
        {hl > 0 ? <rect x={cx - 0.781 * pxPerMa - 3} y={y0 - 20} width={6} height={y1 - y0 + 40} fill={K.hot2} opacity={hl} /> : null}
      </svg>
      <Caps size={18} color={K.ink} style={{position: 'absolute', left: 96, top: 84}}>Fondo del océano a ambos lados de una dorsal · esquema</Caps>
      <Mono size={17} color={K.dim} style={{position: 'absolute', left: 96, top: 120}}>claro: polaridad como la actual · oscuro: invertida · escala de polaridad GTS2012</Mono>
      <Caps size={16} color={K.hot} style={{position: 'absolute', left: cx - 40, top: y1 + 60}}>dorsal</Caps>
      <Label x={cx + 0.781 * pxPerMa} y={y0 - 20} dx={150} dy={-110} k={hl} title="Última inversión" value="780.000" unit="años" color={K.hot2} size={44} />
      <Mono size={16} color={K.dim} style={{position: 'absolute', left: cx + 3 * pxPerMa - 40, top: y1 + 60, opacity: grow}}>3 millones de años →</Mono>
    </AbsoluteFill>
  );
};
const Compass: React.FC<{t: number; t0: number; tFlip: number; t1: number; w: number; h: number}> = ({t, t0, tFlip, t1, w, h}) => {
  const k = vis(t, t0, t1, 0.5, 0.5);
  if (k <= 0) return null;
  const a = 180 * easeInOut(clamp((t - tFlip) / 1.4));
  return (
    <div style={{position: 'absolute', right: 180, top: h / 2 - 170, width: 340, height: 340, opacity: k}}>
      <svg width={340} height={340}>
        <circle cx={170} cy={170} r={160} fill="rgba(1,2,7,0.75)" stroke={K.faint} strokeWidth={2} />
        {[...Array(36)].map((_, i) => <line key={i} x1={170} y1={18} x2={170} y2={i % 9 === 0 ? 40 : 28} stroke={K.faint} strokeWidth={2} transform={`rotate(${i * 10} 170 170)`} />)}
        <g transform={`rotate(${a} 170 170)`}>
          <path d="M 170 50 L 186 170 L 154 170 Z" fill={K.hot} />
          <path d="M 170 290 L 186 170 L 154 170 Z" fill={K.ink} />
        </g>
        <circle cx={170} cy={170} r={8} fill={K.bg} stroke={K.ink} strokeWidth={2} />
      </svg>
      <Caps size={18} color={K.dim} style={{textAlign: 'center', marginTop: 10}}>{a > 90 ? 'el norte pasa a ser sur' : 'norte magnético'}</Caps>
    </div>
  );
};
const NineK: React.FC<{t: number; t0: number; tAp: number; tPron: number; t1: number; w: number; h: number}> = ({t, t0, tAp, tPron, t1, w, h}) => {
  const k = vis(t, t0, t1, 0.6, 0.6);
  if (k <= 0) return null;
  const x0 = 140, x1 = w - 140, y = 560;
  const X = (yr: number) => x0 + ((yr + 7000) / (2400 + 7000)) * (x1 - x0);
  const p = easeInOut(clamp((t - t0) / 3.5));
  const blobs = [-6100, -4700, -3300, -1900, -600, 700].map((c, i) => ({c, d: 600 + rnd(i * 3.1) * 500, k: 0.6 + rnd(i * 5.3) * 0.4}));
  const future = vis(t, tPron, t1, 0.6, 0.5);
  return (
    <AbsoluteFill style={{opacity: k, background: '#010207'}}>
      <svg width={w} height={h}>
        <line x1={x0} x2={X(2025) * 0 + mix(x0, X(2025), p)} y1={y} y2={y} stroke={K.faint} strokeWidth={2} />
        {blobs.map((b, i) => {
          const on = mix(x0, X(2025), p) > X(b.c);
          if (!on) return null;
          const grow = ss(X(b.c - b.d / 2), X(b.c), mix(x0, X(2025), p));
          return <ellipse key={i} cx={X(b.c)} cy={y} rx={((X(b.c + b.d / 2) - X(b.c - b.d / 2)) / 2) * grow} ry={36 * b.k * grow} fill="rgba(255,122,31,0.28)" stroke={K.hot} strokeWidth={1.5} />;
        })}
        {p > 0.98 ? <ellipse cx={X(2025)} cy={y} rx={22} ry={44} fill="rgba(255,194,74,0.45)" stroke={K.hot2} strokeWidth={2} /> : null}
        {future > 0 ? <line x1={X(2025)} x2={mix(X(2025), X(2325), future)} y1={y} y2={y} stroke={K.hot2} strokeWidth={2} strokeDasharray="8 8" /> : null}
        {future > 0 ? <ellipse cx={X(2175)} cy={y} rx={70 * future} ry={30 * (1 - future * 0.6)} fill="rgba(255,194,74,0.15)" /> : null}
        {[-7000, -5000, -3000, -1000, 1000, 2025].map((yr) => <text key={yr} x={X(yr)} y={y + 80} fill={K.dim} fontFamily={K.mono} fontSize={18} textAnchor="middle">{yr < 0 ? `${fmtN(-yr)} a. C.` : yr}</text>)}
      </svg>
      <Caps size={18} color={K.ink} style={{position: 'absolute', left: 96, top: 84}}>9.000 años de campo magnético reconstruido</Caps>
      <Mono size={17} color={K.dim} style={{position: 'absolute', left: 96, top: 120}}>Nilsson et al. (2022), PNAS · anomalías como la actual aparecieron y se fueron (esquema)</Mono>
      <Big t={t} t0={tAp} t1={tPron - 0.2} text="sin ninguna inversión" size={56} y={760} font="serif" color={K.ink} />
      <Label x={X(2325)} y={y} dx={-120} dy={-170} k={future} title="Pronóstico" value="≈ 300" unit="años" color={K.hot2} size={44} />
    </AbsoluteFill>
  );
};
export const S12: React.FC<SceneP> = ({t, T, w, h}) => {
  const A = (p: string, n = 0) => T.at('s12', p, n);
  const s0 = T.start('s12'), s1 = T.end('s12');
  if (t < s0 - 1.2 || t > s1 + 1.2) return null;
  const tPorque = A('Porque'), tNorte = A('el norte'), tPaso = A('Pasó cientos'), tUlt = A('La última'), tY = A('Y en los últimos'), tPero = A('Pero un estudio'), tApar = A('Aparecieron'), tSu = A('Su pronóstico');
  const sun = sunFrom(15, 20);
  const cam = camPath(t, [[s0 - 1.2, {lat: 18, lon: -30, range: 9.5, fov: 34}], [tPaso, {lat: 12, lon: -10, range: 8.6, fov: 34}]]);
  const flip = easeInOut(clamp((t - tNorte) / 1.4));
  const mom = (EXTRA as unknown as {momento_dipolar: [number, number][]}).momento_dipolar;
  return (
    <>
      {t < tPaso + 0.6 ? (
        <AbsoluteFill style={{opacity: vis(t, s0 - 1.2, tPaso + 0.6, 0.6, 0.6)}}>
          <Stage16 cam={cam} w={w} h={h}>
            <Earth t={t} sun={sun} cam={cam} />
            <Atmosphere sun={sun} cam={cam} />
            <FieldLines t={t} cam={cam} flip={flip > 0.5 ? 1 : 0} colA={flip > 0.5 ? '#6E8BFF' : '#48F3D2'} colB={flip > 0.5 ? '#48F3D2' : '#6E8BFF'} k={1 - 0.7 * Math.sin(flip * Math.PI)} />
          </Stage16>
          <Compass t={t} t0={tPorque - 0.3} tFlip={tNorte} t1={tPaso + 0.4} w={w} h={h} />
        </AbsoluteFill>
      ) : null}
      <Seafloor t={t} t0={tPaso - 0.3} tLast={tUlt + 0.3} t1={tY + 0.1} w={w} h={h} />
      {t > tY - 0.6 && t < tPero + 0.4 ? (
        <AbsoluteFill style={{opacity: vis(t, tY - 0.5, tPero + 0.3, 0.5, 0.5), background: '#010207'}}>
          <div style={{position: 'absolute', left: 230, top: 110}}>
            <Caps size={19} color={K.ink}>Fuerza del imán de la Tierra (momento dipolar) · IGRF-14</Caps>
            <Mono size={17} color={K.dim} style={{marginTop: 8}}>−7,6 % desde 1900 · cerca de −10 % en dos siglos</Mono>
          </div>
          <LineChart t={t} t0={tY - 0.2} d={3} k={1} data={mom} xr={[1895, 2030]} yr={[29000, 32500]} box={[230, 260, 1460, 560]} color={K.cool} width={4} yticks={[29500, 30500, 31500, 32500]} xticks={[1900, 1950, 2000, 2025]} yfmt={(v) => fmtN(v)} grid />
          <Big t={t} t0={A('diez por ciento')} t1={tPero} text="≈ −10 %" size={110} y={300} font="mono" color={K.hot} />
        </AbsoluteFill>
      ) : null}
      <NineK t={t} t0={tPero - 0.3} tAp={tApar} tPron={tSu} t1={s1 + 1.2} w={w} h={h} />
    </>
  );
};

/* ------------------------------------------------------------------ s13: ¿y a vos? */
export const S13: React.FC<SceneP & {vertical?: boolean}> = ({t, T, w, h, vertical}) => {
  const A = (p: string, n = 0) => T.at('s13', p, n);
  const s0 = T.start('s13'), s1 = T.end('s13');
  if (t < s0 - 1 || t > s1 + 1) return null;
  const tNada = A('Nada'), tAtm = A('La atmósfera'), tNasa = A('La NASA'), tBruj = A('Las brújulas'), tCel = A('Tu celular');
  return (
    <>
      <Photo16 t={t} t0={s0 - 0.8} t1={tAtm + 0.2} file="ep15/img/atardecer_chaco.jpg" z0={1.05} z1={1.14} grade={0.25} />
      <Credit16 t={t} t0={s0} t1={tAtm} text="Foto: atardecer en el Chaco · Er220, CC BY-SA 4.0" right={!vertical} />
      <Big t={t} t0={tNada - 0.05} t1={tAtm - 0.1} text="Nada." size={vertical ? 150 : 140} y={vertical ? 820 : 420} font="serif" color={K.ink} />
      <Shield t={t} t0={tAtm - 0.3} t1={tNasa + 0.1} w={w} h={h} vertical={vertical} />
      {t > tNasa - 0.4 && t < s1 + 1 ? (
        <AbsoluteFill style={{background: '#010207', opacity: vis(t, tNasa - 0.4, s1 + 1, 0.4, 0.6)}}>
          <Quote16 t={t} t0={tNasa} t1={tBruj - 0.2} text="En la superficie, la anomalía no tiene efectos visibles en la vida diaria." who="NASA, 2020 · traducción" x={vertical ? 60 : 160} y={vertical ? 640 : 330} w={vertical ? 960 : 1500} size={vertical ? 80 : 76} />
          {t > tBruj - 0.3 ? <OkIcons t={t} tB={tBruj} tC={tCel} w={w} h={h} vertical={vertical} /> : null}
        </AbsoluteFill>
      ) : null}
    </>
  );
};
/** la atmósfera frena las partículas: capas y trazas que se detienen alto */
const Shield: React.FC<{t: number; t0: number; t1: number; w: number; h: number; vertical?: boolean}> = ({t, t0, t1, w, h, vertical}) => {
  const k = vis(t, t0, t1, 0.5, 0.5);
  if (k <= 0) return null;
  const ground = h * 0.84, top = h * 0.12;
  const yKm = (km: number) => ground - (km / 600) * (ground - top);
  const tr = [...Array(14)].map((_, i) => {
    const x = (0.1 + 0.8 * rnd(i * 2.3)) * w, stop = yKm(80 + rnd(i * 4.1) * 90);
    const pk = clamp((t - t0 - i * 0.07) / 0.6);
    return <line key={i} x1={x - 120} y1={top - 60} x2={mix(x - 120, x, pk)} y2={mix(top - 60, stop, pk)} stroke="#FFF2D6" strokeWidth={3} opacity={0.85 * (1 - clamp((t - t0 - i * 0.07 - 0.6) * 2) * 0.6)} />;
  });
  return (
    <AbsoluteFill style={{opacity: k, background: 'linear-gradient(180deg, #010207 0%, #04122A 60%, #0E3A63 92%, #2B2015 100%)'}}>
      <svg width={w} height={h}>
        {[[100, 'termosfera'], [400, 'Estación Espacial · 400 km']].map(([km, name]) => (
          <g key={name as string}>
            <line x1={0} x2={w} y1={yKm(km as number)} y2={yKm(km as number)} stroke={K.faint} strokeDasharray="4 10" />
            <text x={vertical ? 60 : 96} y={yKm(km as number) - 12} fill={K.dim} fontFamily={K.mono} fontSize={vertical ? 24 : 18}>{`${name} ${km === 100 ? '· 100 km' : ''}`}</text>
          </g>
        ))}
        {tr}
      </svg>
      <Caps size={vertical ? 22 : 18} color={K.ink} style={{position: 'absolute', left: vertical ? 60 : 96, top: vertical ? 1700 : 960}}>la atmósfera frena lo que el campo deja pasar · esquema</Caps>
    </AbsoluteFill>
  );
};
const OkIcons: React.FC<{t: number; tB: number; tC: number; w: number; h: number; vertical?: boolean}> = ({t, tB, tC, w, h, vertical}) => {
  const k1 = vis(t, tB, Infinity, 0.5), k2 = vis(t, tC, Infinity, 0.5);
  const y = vertical ? 1300 : 770;
  const wob = Math.sin(t * 2.1) * 4;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', gap: vertical ? 120 : 220}}>
      <div style={{opacity: k1, textAlign: 'center'}}>
        <svg width={150} height={150}>
          <circle cx={75} cy={75} r={66} fill="none" stroke={K.faint} strokeWidth={3} />
          <g transform={`rotate(${wob} 75 75)`}><path d="M 75 20 L 86 75 L 64 75 Z" fill={K.hot} /><path d="M 75 130 L 86 75 L 64 75 Z" fill={K.ink} /></g>
        </svg>
        <Caps size={vertical ? 22 : 18} color={K.ok} style={{marginTop: 10}}>brújula · funciona</Caps>
      </div>
      <div style={{opacity: k2, textAlign: 'center'}}>
        <svg width={150} height={150}>
          <rect x={45} y={10} width={60} height={120} rx={10} fill="none" stroke={K.faint} strokeWidth={3} />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={58 + i * 9} y={92 - i * 12} width={6} height={18 + i * 12} fill={K.ok} />)}
        </svg>
        <Caps size={vertical ? 22 : 18} color={K.ok} style={{marginTop: 10}}>celular · funciona</Caps>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ s14: lo que vive arriba */
const LEO: V3[] = [...Array(5200)].map((_, i) => orbitPos([53, 53, 70, 97.6, 43, 87.9, 51.6][i % 7], rnd(i * 1.7) * 360, 480 + rnd(i * 2.9) * 260, rnd(i * 4.3) * Math.PI * 2));
const MEO: V3[] = [...Array(31)].map((_, i) => orbitPos(55, (i % 6) * 60, 20200, (i / 31) * Math.PI * 2 * 5.3));
const GEO: V3[] = [...Array(70)].map((_, i) => orbitPos(0.1, 0, 35786, (i / 70) * Math.PI * 2 + rnd(i) * 0.05));
export const S14: React.FC<SceneP> = ({t, T, w, h}) => {
  const A = (p: string, n = 0) => T.at('s14', p, n);
  const s0 = T.start('s14'), s1 = T.end('s14');
  if (t < s0 - 1 || t > s1 + 1.2) return null;
  const tPron = A('el pronóstico'), tMapas = A('los mapas'), tCom = A('las comunicaciones'), tArg = A('y los satélites'), tCruz = A('que cruzan');
  const sun = sunFrom(-15, -40);
  const cam = camPath(t, [[s0 - 1, {lat: 12, lon: -50, range: 16, fov: 36}], [tCom + 0.5, {lat: 5, lon: -55, range: 12, fov: 36}], [tArg + 0.6, {lat: -28, lon: -50, range: 3.1, fov: 32}], [s1 + 1.2, {lat: -30, lon: -48, range: 2.9, fov: 32}]]);
  const arg = ss(tArg - 0.2, tArg + 0.8, t);
  // SAOCOM 1A y 1B: heliosincrónicas a 620 km, en el mismo plano y separadas media vuelta
  const sa = orbitPts(97.9, -78, 620, 360);
  const u = (t - tArg) * 0.55;
  const s1a = orbitPos(97.9, -78, 620, u + 4.4), s1b = orbitPos(97.9, -78, 620, u + 4.4 + Math.PI);
  const p1 = project(cam, s1a, w, h), p2 = project(cam, s1b, w, h);
  return (
    <AbsoluteFill style={{opacity: vis(t, s0 - 1, s1 + 1.2, 0.6, 0.6)}}>
      <Stage16 cam={cam} w={w} h={h}>
        <Earth t={t} sun={sun} cam={cam} field={{year: 2025, k: arg * 0.85, full: 0, thr: 26000, hi: 0.45, iso: 0.6}} />
        <Atmosphere sun={sun} cam={cam} />
        <Dots pts={LEO} size={4.6} color="#BFD3FF" k={vis(t, s0 - 0.5, Infinity, 0.8) * (1 - arg * 0.75)} />
        <Dots pts={MEO} size={7} color="#7CF29A" k={vis(t, tMapas - 0.2, Infinity, 0.5) * (1 - arg)} />
        <Dots pts={GEO} size={6} color="#FFC24A" k={vis(t, tCom - 0.2, Infinity, 0.5) * (1 - arg)} />
        {arg > 0 ? <GlowTube id="saocom" pts={sa} radius={0.004} color="#8DB8FF" k={arg} /> : null}
        {arg > 0 ? <Dots pts={[s1a, s1b]} size={18} color="#FFFFFF" k={arg} /> : null}
        {arg > 0 ? <BeltShell t={t} cam={cam} k={arg * 0.35} hot={0.2} /> : null}
      </Stage16>
      <div style={{position: 'absolute', left: 96, top: 84}}>
        <Caps size={18} color="#BFD3FF" style={{opacity: vis(t, tPron - 0.2, tArg, 0.4, 0.4)}}>· órbita baja · clima, observación, internet</Caps>
        <Caps size={18} color="#7CF29A" style={{marginTop: 12, opacity: vis(t, tMapas - 0.2, tArg, 0.4, 0.4)}}>· GPS · 20.200 km</Caps>
        <Caps size={18} color="#FFC24A" style={{marginTop: 12, opacity: vis(t, tCom - 0.2, tArg, 0.4, 0.4)}}>· comunicaciones geoestacionarias · 35.786 km</Caps>
      </div>
      <Label x={p1.x} y={p1.y} dx={170} dy={-120} k={vis(t, tArg + 0.6, s1 + 1, 0.5, 0.5) * p1.vis} title="CONAE" value="SAOCOM 1A" color={K.ink} size={36} />
      <Label x={p2.x} y={p2.y} dx={-170} dy={120} k={vis(t, tArg + 0.9, s1 + 1, 0.5, 0.5) * p2.vis} title="CONAE" value="SAOCOM 1B" color={K.ink} size={36} />
      <Caps size={18} color={K.hot2} style={{position: 'absolute', right: 96, bottom: 90, opacity: vis(t, tCruz, s1 + 1, 0.5, 0.5)}}>620 km · cruzan la anomalía todos los días</Caps>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ s15: la abolladura, el centro y alguien que ve luces */
export const S15: React.FC<SceneP & {vertical?: boolean}> = ({t, T, w, h, vertical}) => {
  const A = (p: string, n = 0) => T.at('s15', p, n);
  const s0 = T.start('s15'), s1 = T.end('s15');
  if (t < s0 - 1.2) return null;
  const tMueve = A('Se mueve'), tDeb = A('Se debilita'), tTiene = A('Tiene una'), tY = A('Y esa'), tPunto = A('un punto'), tNadie = A('nadie'), tMientras = A('Mientras'), tAlguien = A('alguien'), tOjos = A('ojos'), tVe = A('y ve'), tLuces = A('luces');
  const sun = sunFrom(-15, -30);
  const cam = camPath(t, [
    [s0 - 1.2, {lat: 5, lon: -30, range: 8.5, fov: 34}],
    [tMueve, {lat: -15, lon: -45, range: 3.3, fov: 30}],
    [tTiene, {lat: -32, lon: -45, range: 3.1, fov: 30}],
    [tY + 0.6, {lat: -30, lon: -52, range: 2.9, fov: 30}],
    [tPunto + 0.4, {lat: -26.1, lon: -59.9, r0: 1, range: 0.4, tilt: 10, head: 5, fov: 32}],
    [tNadie + 0.4, {lat: MIN.lat, lon: MIN.lon, r0: 1, range: 0.02, tilt: 34, head: 14, fov: 36}],
    [tMientras + 1.0, {lat: MIN.lat, lon: MIN.lon, r0: 1, range: 0.012, tilt: 46, head: 24, fov: 38}],
  ]);
  const yr = mix(1900, 2025, easeInOut(clamp((t - tDeb + 0.2) / 1.4)));
  const dent = ss(tTiene - 0.3, tTiene + 0.6, t) * (1 - ss(tY + 0.6, tPunto, t));
  const path = surfPath(CAMINO.filter((c) => c.y <= 2025).map((c) => [c.lat, c.lon] as [number, number]), 6, 3);
  const pathK = vis(t, tMueve - 0.3, tY, 0.4, 0.6);
  const fieldK = ss(tDeb - 0.3, tDeb + 0.4, t) * (1 - ss(tPunto - 0.4, tPunto + 0.6, t));
  const issIn = tMientras - 0.2;
  const black = ss(tOjos - 0.1, tVe - 0.1, t);
  const endK = ss(s1 + 0.3, s1 + 1.2, t);
  return (
    <>
      {t < issIn + 0.6 ? (
        <AbsoluteFill style={{opacity: vis(t, s0 - 1.2, issIn + 0.6, 0.6, 0.6)}}>
          <Stage16 cam={cam} w={w} h={h} stars={1}>
            <Earth t={t} sun={sun} cam={cam} ins={insetsFor(cam)} clouds={cloudsFor(cam, 0.6) * (1 - fieldK * 0.5)} field={{year: yr, k: fieldK, full: 0, thr: 26000, hi: 0.35, iso: 0.6}} spot={{lat: MIN.lat, lon: MIN.lon, r: mix(0.035, 0.0004, ss(0.5, 0.012, Math.hypot(...camBasis(cam).P) - 1)), k: ss(tPunto, tPunto + 0.8, t)}} />
            <Atmosphere sun={sun} cam={cam} />
            {t < tMueve ? <FieldLines t={t} cam={cam} k={1 - ss(tMueve - 2.0, tMueve - 0.5, t)} /> : null}
            {pathK > 0 ? <GlowTube id="camino15" pts={path} radius={0.004} color="#FFC24A" k={pathK * 1.2} reveal={ss(tMueve - 0.3, tMueve + 0.8, t)} /> : null}
            {dent > 0 ? <BeltShell t={t} cam={cam} k={dent * 0.7} hot={0.25} /> : null}
          </Stage16>
          <Big t={t} t0={tMueve - 0.05} t1={tDeb - 0.1} text="se mueve" size={vertical ? 90 : 80} y={vertical ? 1500 : 880} font="serif" color={K.ink} />
          <Big t={t} t0={tDeb - 0.05} t1={tTiene - 0.1} text="se debilita" size={vertical ? 90 : 80} y={vertical ? 1500 : 880} font="serif" color={K.ink} />
          <Big t={t} t0={tTiene - 0.05} t1={tY} text="tiene una abolladura" size={vertical ? 80 : 80} y={vertical ? 1500 : 880} font="serif" color={K.hot2} />
          <Big t={t} t0={tNadie - 0.1} t1={tMientras} text="donde nadie siente nada" size={vertical ? 70 : 64} y={vertical ? 1500 : 880} font="serif" color={K.ink} />
        </AbsoluteFill>
      ) : null}
      {t > issIn - 0.6 && black < 1 ? (
        <AbsoluteFill style={{opacity: vis(t, issIn - 0.6, Infinity, 0.8) * (1 - black)}}>
          <IssVideo clip="carib" from={tMientras - 4.0} t={t} dur={22} w={w} h={h} pos="50% 45%" z0={1.02} z1={1.1} />
          <IssHud t={t} from={tMientras - 4.0} clip="carib" k={vis(t, issIn + 0.4, Infinity, 0.6)} warnFrom={tAlguien - 0.5} w={w} h={h} vertical={vertical} />
          <Credit16 t={t} t0={issIn + 0.5} t1={tOjos} text="NASA JSC · Gateway to Astronaut Photography of Earth (ISS031-E-169858 a 170189)" right={!vertical} />
        </AbsoluteFill>
      ) : null}
      {t > tOjos - 0.2 ? (
        <AbsoluteFill style={{background: '#000', opacity: black}}>
          <Phosphenes t={t} t0={tLuces - 0.15} t1={s1 + 0.6} rate={5} w={w} h={h} seed={77} />
        </AbsoluteFill>
      ) : null}
      {endK > 0 ? <EndCard t={t} t0={s1 + 0.3} w={w} h={h} vertical={vertical} /> : null}
    </>
  );
};
const EndCard: React.FC<{t: number; t0: number; w: number; h: number; vertical?: boolean}> = ({t, t0, w, h, vertical}) => {
  const k = vis(t, t0, Infinity, 1.0);
  return (
    <AbsoluteFill style={{background: '#010207', opacity: k}}>
      <Title16 t={t} t0={t0 + 0.3} t1={Infinity} title="EL PUNTO DÉBIL" size={vertical ? 92 : 104} y={vertical ? 640 : 250} />
      <div style={{position: 'absolute', left: 0, right: 0, top: vertical ? 860 : 450, textAlign: 'center', opacity: vis(t, t0 + 1.2, Infinity, 0.8)}}>
        <Img src={staticFile('brand/logo_transparente.png')} style={{width: vertical ? 150 : 120, height: vertical ? 150 : 120}} />
        <Caps size={vertical ? 24 : 20} color={K.ink} style={{marginTop: 14}}>CONTEXTO</Caps>
      </div>
      <div style={{position: 'absolute', left: vertical ? 60 : 260, right: vertical ? 60 : 260, top: vertical ? 1180 : 690, textAlign: 'center', opacity: vis(t, t0 + 2.0, Infinity, 0.8)}}>
        <Mono size={vertical ? 19 : 17} color={K.dim} style={{whiteSpace: 'normal', lineHeight: 1.7}}>
          Campo: IGRF-14 (IAGA, NOAA/NCEI), calculado para este episodio · Protones: MetOp-A SEM-2 (EUMETSAT/NOAA) · Pilar: WDC Edimburgo y SMN ·
          Fotos de la Estación: NASA JSC · Tierra: NASA (Blue Marble, Black Marble, VIIRS/GIBS) · Sentinel-2 cloudless 2016 (EOX, CC BY 4.0) ·
          Hubble XDF: NASA/ESA · Explorer 1: NASA/JPL · Fuentes: NASA (2020), ESA (2025), STScI, Nilsson et al. (2022), Tarduno et al. (2015)
        </Mono>
      </div>
    </AbsoluteFill>
  );
};
