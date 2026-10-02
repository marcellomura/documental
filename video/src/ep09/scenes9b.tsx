/* Escenas 6–10 del episodio 9 (Vaca Muerta): las tres trampas y el cierre. t = segundos desde el inicio del segmento. */
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, staticFile} from 'remotion';
import {F} from '../theme';
import {LogoMark} from '../ep04/kit';
import {cue} from './lib';
import {
  BarrelIcon, Big, Chip, Count, Credit, Dust, FactoryIcon, Framed, FullPhoto, FullVideo, K, OilBg, PersonIcon, Pin, PumpDisplay, SplitVs, SrcLine, Stat, Tag, TrapTag, Vig,
  between, clamp, easeIn, easeInOut, easeOut, fadeIO, fmt, pop, prog,
} from './kit9';
import {Barrels, Cam, GeoState, Globe3D, LiterGlass, PLACES, Stage, VM_MID, VM_TOP, WX, camPath, geo3, globePoint, globeRot, lerpCam, project, towerItems} from './three9';
import {BLOCK_WIDE, BlockShot, MapShot, mapCam} from './scenes9a';

type P = {t: number};

const Floor: React.FC<{o?: number}> = ({o = 0.45}) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={[160, 160]} />
    <shadowMaterial transparent opacity={o} />
  </mesh>
);

/* =====================================================================================
   S06 · TRAMPA 1: los caños. Vaca Muerta Oil Sur, 437 km a Punta Colorada, 180.000 → 720.000 b/d
   ===================================================================================== */
export const S06: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s06', p, n);
  const tSacar = c('el petróleo hay'), tCanos = c('Y los caños'), tPor = c('Por eso'), tOleo = c('oleoducto'), tVmos = c('Vaca Muerta Oil'), tKm = c('Cuatrocientos'), tPunta = c('Punta Colorada,');
  const tCargar = c('donde van'), tArr = c('Arranca'), t720 = c('setecientos'), tSin = c('Sin caños,'), tTecho = c('techo.');
  const pipe = easeInOut(clamp((t - tOleo) / (tPunta + 0.9 - tOleo)));
  const thick = 0.25 + 0.75 * easeInOut(clamp((t - t720 + 0.2) / 1.2));
  const k = easeInOut(clamp((t - tPor) / 3.5));
  const mcam = lerpCam(mapCam(-68.6, -38.5, 26, 1.0, 0.25), mapCam(-66.9, -40.0, 62, 0.95, 0.35), k);
  const p = (lon: number, lat: number, y = 0.7) => project(mcam, geo3(lon, lat, y));
  const [ax, ay] = p(...PLACES.anelo), [px, py] = p(...PLACES.puntaColorada), [nx, ny] = p(...PLACES.neuquen);
  const km = Math.round(437 * pipe);
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {t < tPor + 0.3 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tPor, 0.3)}}>
          <OilBg t={t} glow="rgba(229,56,59,0.14)" />
          <TrapTag t={t} t0={0.05} t1={tSacar + 0.2} n={1} sub="LOS CAÑOS" x={960 - 340} y={480} big />
          {t > tSacar - 0.2 ? <Bottleneck t={t} t0={tSacar - 0.2} tJam={tCanos} /> : null}
        </AbsoluteFill>
      ) : null}
      {between(t, tPor - 0.2, tSin + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tPor - 0.2, tSin + 0.3, 0.3)}}>
          <OilBg t={t} glow="rgba(116,172,223,0.1)" />
          <MapShot
            cam={mcam}
            s={{t, focus: {Neuquén: {c: '#3E5366', lift: 0.18}, 'Río Negro': {c: '#36495A', lift: 0.12}}, dim: 0.5, vm: 0.45, pipe, flow: clamp((t - tArr + 0.3) / 0.8), thick, ships: clamp((t - tCargar) / 1.6)}}
          />
          <Tag t={t} t0={tVmos} a="VMOS" b="VACA MUERTA OIL SUR" x={110} y={110} />
          <Pin x={ax} y={ay} text="AÑELO" sub="NEUQUÉN" color={K.oil} o={prog(t, tPor + 0.3, 0.5)} size={30} />
          <Pin x={nx + 60} y={ny} text="NEUQUÉN" color="#9FB3C4" o={prog(t, tPor + 0.6, 0.5) * 0.85} size={24} side="down" />
          <Pin x={px} y={py} text="PUNTA COLORADA" sub="RÍO NEGRO" color={K.water} o={prog(t, tPunta - 0.2, 0.5)} size={30} />
          {t > tKm - 0.3 ? (
            <div style={{position: 'absolute', left: 110, top: 220, opacity: prog(t, tKm - 0.3, 0.4)}}>
              <div style={{fontFamily: F.head, fontSize: 190, color: K.cream, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{km} KM</div>
              <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 26, letterSpacing: 5, color: K.mute, marginTop: 6}}>DE CAÑO HASTA EL MAR</div>
            </div>
          ) : null}
          {t > tArr - 0.2 ? <Capacity t={t} t0={tArr} t720={t720} /> : null}
          {between(t, tCargar - 0.1, tArr + 0.4) ? (
            <Framed t={t} t0={tCargar - 0.1} t1={tArr + 0.4} x={1460} y={330} w={620} h={350} caption="DONDE VAN A CARGAR LOS BARCOS" credit="Petroleros · Guardia Costera de EE.UU., dominio público">
              <FullVideo src="ep09/vid/tanqueros.mp4" t={t} t0={tCargar - 0.1} from={8} zoom={[1.05, 1.12]} dim={0.1} fade={0.01} />
            </Framed>
          ) : null}
          <SrcLine t={t} t0={tOleo + 0.5} text="Trazado aproximado · Fuente: VMOS S.A. y Secretaría de Energía (2026)" />
        </AbsoluteFill>
      ) : null}
      {t > tSin - 0.2 ? (
        <AbsoluteFill style={{opacity: prog(t, tSin - 0.2, 0.3)}}>
          <OilBg t={t} glow="rgba(229,56,59,0.12)" />
          <Ceiling t={t} t0={tSin} tHit={tTecho - 0.3} />
        </AbsoluteFill>
      ) : null}
      <Vig k={0.5} />
    </AbsoluteFill>
  );
};

/** el petróleo llega en barriles y se atora en un caño angosto */
const Bottleneck: React.FC<{t: number; t0: number; tJam: number}> = ({t, t0, tJam}) => {
  const a = prog(t, t0, 0.5);
  const jam = clamp((t - tJam) / 2.5);
  return (
    <AbsoluteFill style={{opacity: a}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: F.head, fontSize: 84, color: K.cream}}>EL PETRÓLEO HAY QUE SACARLO DE AHÍ</div>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <linearGradient id="pipeG" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#E6EAEE" />
            <stop offset="0.5" stopColor="#8C969F" />
            <stop offset="1" stopColor="#4A525A" />
          </linearGradient>
        </defs>
        <path d="M 120 440 L 1080 440 L 1240 540 L 1800 540 L 1800 620 L 1240 620 L 1080 720 L 120 720 Z" fill="url(#pipeG)" opacity={0.25} />
        <path d="M 120 440 L 1080 440 L 1240 540 L 1800 540 M 1800 620 L 1240 620 L 1080 720 L 120 720" stroke="#C9D1D8" strokeWidth={8} fill="none" />
      </svg>
      {Array.from({length: 26}, (_, i) => {
        const row = i % 3, col = Math.floor(i / 3);
        const speed = 260;
        const free = 120 + ((t - t0) * speed + col * 120) % 1000;
        const stop = 960 - col * 6 - row * 4;
        const x = jam > 0 ? Math.min(free, stop - (col % 3) * 105) : free;
        const y = 470 + row * 80;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, opacity: 0.95}}>
            <BarrelIcon size={70} color={K.oil} />
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 1240, top: 548, width: 560, height: 64, overflow: 'hidden'}}>
        {Array.from({length: 4}, (_, i) => (
          <div key={i} style={{position: 'absolute', left: ((t * 90 + i * 140) % 560) - 20, top: 6}}>
            <BarrelIcon size={52} color={K.oil} />
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', fontFamily: F.head, fontSize: 96, color: K.red, opacity: prog(t, tJam, 0.4), transform: `scale(${0.9 + 0.1 * pop(t, tJam)})`}}>
        Y LOS CAÑOS NO ALCANZAN
      </div>
    </AbsoluteFill>
  );
};

const Capacity: React.FC<{t: number; t0: number; t720: number}> = ({t, t0, t720}) => {
  const v = 180000 + 540000 * easeInOut(clamp((t - t720 + 0.2) / 1.2));
  return (
    <div style={{position: 'absolute', right: 110, bottom: 140, textAlign: 'right', opacity: prog(t, t0, 0.4)}}>
      <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 24, letterSpacing: 5, color: K.mute}}>{t < t720 ? 'ARRANCA CON' : 'PODRÍA LLEGAR A'}</div>
      <div style={{fontFamily: F.head, fontSize: 130, color: t < t720 ? K.cream : K.oil, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{fmt(Math.round(v / 1000) * 1000)}</div>
      <div style={{fontFamily: F.head, fontSize: 40, color: K.cream}}>BARRILES POR DÍA</div>
    </div>
  );
};

/** la producción sube y choca contra un techo de vidrio */
const Ceiling: React.FC<{t: number; t0: number; tHit: number}> = ({t, t0, tHit}) => {
  const k = clamp((t - t0) / (tHit - t0 + 0.4));
  const pts = Array.from({length: 41}, (_, i) => {
    const x = i / 40;
    const y = Math.min(0.78, 0.1 + 0.95 * x * x + 0.03 * Math.sin(i * 1.7));
    return [200 + x * 1500, 860 - y * 560] as [number, number];
  });
  const n = Math.max(2, Math.round(41 * k));
  const hit = prog(t, tHit, 0.3);
  const cy = 860 - 0.78 * 560;
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <line x1={160} y1={cy - 6} x2={1760} y2={cy - 6} stroke={K.red} strokeWidth={8} strokeDasharray="22 14" opacity={0.9} />
        <polyline points={pts.slice(0, n).map((p) => p.join(',')).join(' ')} fill="none" stroke={K.oil} strokeWidth={12} strokeLinejoin="round" strokeLinecap="round" />
        {hit > 0
          ? [0, 1, 2, 3, 4, 5].map((i) => {
              const a = (i / 6) * Math.PI * 2 + 0.3;
              const x0 = pts[n - 1][0], y0 = cy - 6;
              return <line key={i} x1={x0} y1={y0} x2={x0 + Math.cos(a) * 90 * hit} y2={y0 + Math.sin(a) * 50 * hit} stroke="#FFFFFF" strokeWidth={4} opacity={1 - hit * 0.4} />;
            })
          : null}
      </svg>
      <div style={{position: 'absolute', left: 170, top: cy - 70, fontFamily: F.body, fontWeight: 800, fontSize: 26, letterSpacing: 5, color: K.red}}>CAPACIDAD DE LOS CAÑOS</div>
      <div style={{position: 'absolute', left: 200, top: 880, fontFamily: F.body, fontWeight: 800, fontSize: 24, letterSpacing: 5, color: K.mute}}>PRODUCCIÓN</div>
      <Big t={t} t0={t0} text="SIN CAÑOS, | EL RÉCORD TIENE TECHO" size={110} y={170} hl={{TECHO: K.red}} />
    </AbsoluteFill>
  );
};

/* =====================================================================================
   S07 · TRAMPA 2: la nafta. Precio internacional, Ormuz, US$ 126, $1.700 → $2.000+, 36 % impuestos
   ===================================================================================== */
const GULF: [number, number] = [56.3, 26.6];
export const S07: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s07', p, n);
  const tSi = c('Si producimos'), tPq = c('¿por qué'), tPorque = c('Porque'), tAfuera = c('Si afuera'), tExporta = c('lo exporta.'), tYd = c('Y desde que'), tCerro = c('cerró');
  const tUna = c('una de cada'), tBarril = c('el barril llegó'), t126 = c('ciento veintiséis'), tAsi = c('Así,'), tPaso = c('pasó de'), tDos = c('más de dos mil.'), tTercio = c('Y más de un tercio'), tImp = c('impuestos.');
  // globo
  const gk = easeInOut(clamp((t - tCerro - 0.3) / 2.6));
  const rot = globeRot(GULF[0] - 18 * (1 - gk), GULF[1] - 6 * (1 - gk));
  const R = 3;
  const GP: [number, number, number] = [2.6, -0.2, 0];
  const gcam: Cam = {pos: [0, 0, 14 - 3 * gk], look: [0, 0, 0], fov: 32};
  const [ox, oy] = project(gcam, globePoint(GULF[0], GULF[1], R, rot, GP));
  // litro
  const lcam: Cam = {pos: [3.6, 3.6, 8.6], look: [0, 1.7, 0], fov: 34};
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {t < tPorque + 0.3 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tPorque, 0.3)}}>
          <FullPhoto src="ep09/ypf_chacabuco.jpg" t={t} t0={-0.4} t1={tPorque + 0.3} zoom={[1.04, 1.12]} dim={1.0} credit="Just a Man, CC BY 4.0" />
          <TrapTag t={t} t0={0.05} t1={tSi + 0.3} n={2} sub="LA QUE TE TOCA A VOS" x={960 - 470} y={480} big />
          <Big t={t} t0={tSi} text="PRODUCIMOS MÁS QUE NUNCA…" size={100} y={420} />
          <Big t={t} t0={tPq} text="¿POR QUÉ SUBE LA NAFTA?" size={150} y={600} hl={{NAFTA: K.red}} />
        </AbsoluteFill>
      ) : null}
      {between(t, tPorque - 0.2, tYd + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tPorque - 0.2, tYd + 0.3, 0.3)}}>
          <OilBg t={t} />
          <WorldPrice t={t} t0={tPorque} tAfuera={tAfuera} tExporta={tExporta} />
        </AbsoluteFill>
      ) : null}
      {between(t, tYd - 0.2, tCerro + 1.2) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tYd - 0.2, tCerro + 1.2, 0.3)}}>
          <FullVideo src="ep09/vid/bloqueo.mp4" t={t} t0={tYd - 0.2} t1={tCerro + 1.2} from={9} zoom={[1.1, 1.02]} dim={0.4} bw fade={0.01} credit="CENTCOM, dominio público" />
          <Chip t={t} t0={c('Irán')} text="IRÁN CIERRA ORMUZ" x={960} y={870} color={K.red} size={50} />
        </AbsoluteFill>
      ) : null}
      {between(t, tCerro + 0.9, tAsi + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tCerro + 0.9, tAsi + 0.3, 0.3)}}>
          <OilBg t={t} glow="rgba(95,198,232,0.12)" />
          <AbsoluteFill>
            <Stage cam={gcam} shadow={6} key0={[6, 4, 10]} keyI={2.0} fill={0.9} exposure={1.1}>
              <Globe3D r={R} rot={rot} pos={GP} t={t} countries={[{a3: 'IRN', color: '#E5383B', o: prog(t, tCerro + 1, 0.8)}, {a3: 'SAU', color: '#3DAA6D', o: 0.35 * prog(t, tCerro + 1.2, 0.8)}]} />
            </Stage>
          </AbsoluteFill>
          <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
            {[0, 1, 2].map((i) => {
              const ph = ((t * 0.9 + i / 3) % 1);
              return <circle key={i} cx={ox} cy={oy} r={20 + ph * 110} fill="none" stroke={K.red} strokeWidth={5} opacity={(1 - ph) * prog(t, tCerro + 1.4, 0.4)} />;
            })}
          </svg>
          <Pin x={ox} y={oy - 20} text="ESTRECHO DE ORMUZ" color={K.red} o={prog(t, tCerro + 1.5, 0.4)} size={34} />
          {t > tUna - 0.2 ? <Drops t={t} t0={tUna} /> : null}
          {t > tBarril - 0.2 ? (
            <div style={{position: 'absolute', left: 110, top: 150, opacity: prog(t, tBarril - 0.2, 0.3)}}>
              <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 26, letterSpacing: 5, color: K.mute}}>BARRIL BRENT · MÁXIMO, ABRIL 2026</div>
              <div style={{fontFamily: F.head, fontSize: 210, color: K.red, lineHeight: 1}}>
                US$ <Count t={t} t0={t126 - 0.3} dur={1.0} from={70} to={126} />
              </div>
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}
      {between(t, tAsi - 0.2, tTercio + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tAsi - 0.2, tTercio + 0.3, 0.3)}}>
          <FullPhoto src="ep09/ypf_caseros.jpg" t={t} t0={tAsi - 0.2} t1={tTercio + 0.3} zoom={[1.1, 1.18]} dim={1.2} focus="40% 50%" credit="Just a Man, CC BY 4.0" />
          <PumpDisplay value={t < tPaso ? 1700 : 1700 + 379 * easeOut(clamp((t - tDos + 0.3) / 1.0))} x={960} y={500} flash={t > tDos ? 0.6 : 0} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center', fontFamily: F.head, fontSize: 56, color: K.cream, opacity: prog(t, tPaso, 0.4)}}>
            FEBRERO: $1.700 <span style={{color: K.mute}}>→</span> <span style={{color: K.red, opacity: prog(t, tDos - 0.2, 0.3)}}>OCTUBRE: $2.079</span>
          </div>
          <SrcLine t={t} t0={tAsi + 0.3} text="Nafta súper, YPF, Ciudad de Buenos Aires (2026)" />
        </AbsoluteFill>
      ) : null}
      {t > tTercio - 0.2 ? (
        <AbsoluteFill style={{opacity: prog(t, tTercio - 0.2, 0.3)}}>
          <OilBg t={t} glow="rgba(242,169,59,0.16)" x={62} />
          <Stage cam={lcam} shadow={8} key0={[4, 10, 6]} keyI={2.0}>
            <LiterGlass fill={easeOut(clamp((t - tTercio + 0.1) / 1.2))} tax={easeInOut(clamp((t - c('tercio') - 0.1) / 1.0))} t={t} pos={[1.6, 0, 0]} />
            <Floor />
          </Stage>
          <div style={{position: 'absolute', left: 110, top: 280, opacity: prog(t, tTercio, 0.4)}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 28, letterSpacing: 6, color: K.mute}}>DE CADA LITRO QUE PAGÁS</div>
            <div style={{fontFamily: F.head, fontSize: 240, color: K.red, lineHeight: 1, marginTop: 10, opacity: prog(t, c('tercio'), 0.4)}}>
              <Count t={t} t0={c('tercio')} dur={1.0} to={36} />%
            </div>
            <div style={{fontFamily: F.head, fontSize: 90, color: K.cream, opacity: prog(t, tImp - 0.2, 0.4)}}>SON IMPUESTOS</div>
          </div>
          <div style={{position: 'absolute', left: 1180, top: 930, width: 560, textAlign: 'center', fontFamily: F.head, fontSize: 44, color: K.cream, opacity: prog(t, tTercio + 0.3, 0.4)}}>1 LITRO DE NAFTA</div>
          <SrcLine t={t} t0={tTercio + 0.4} text="Fuente: Infobae (marzo de 2026), con datos de expendedores de combustible: 35,9 % del precio" />
        </AbsoluteFill>
      ) : null}
      <Vig k={0.5} />
    </AbsoluteFill>
  );
};

/** el barril va adonde le pagan más */
const WorldPrice: React.FC<{t: number; t0: number; tAfuera: number; tExporta: number}> = ({t, t0, tAfuera, tExporta}) => {
  const mv = easeInOut(clamp((t - tExporta + 0.2) / 0.9));
  const bx = 960 + 520 * mv;
  return (
    <AbsoluteFill>
      <Big t={t} t0={t0} text="EL PETRÓLEO SE VENDE | AL PRECIO DEL MUNDO" size={86} y={180} hl={{MUNDO: K.oil}} />
      {[{x: 440, title: 'ACÁ', price: '¿MÁS BARATO?', col: K.celeste, at: tAfuera + 1.2}, {x: 1480, title: 'AFUERA', price: 'US$ 100', col: K.oil, at: tAfuera + 0.3}].map((b) => (
        <div key={b.title} style={{position: 'absolute', left: b.x, top: 600, transform: 'translate(-50%,-50%)', width: 560, height: 380, borderRadius: 18, border: `3px solid ${b.col}`, background: 'rgba(6,8,11,0.6)', opacity: prog(t, t0 + 0.4, 0.4)}}>
          <div style={{fontFamily: F.head, fontSize: 64, color: b.col, textAlign: 'center', marginTop: 20}}>{b.title}</div>
          <div style={{fontFamily: F.head, fontSize: 70, color: K.cream, textAlign: 'center', marginTop: 190, opacity: prog(t, b.at, 0.4)}}>{b.price}</div>
        </div>
      ))}
      <div style={{position: 'absolute', left: bx, top: 560, transform: `translate(-50%,-50%) rotate(${Math.sin(mv * Math.PI) * 12}deg)`}}>
        <BarrelIcon size={170} color={K.oil} />
      </div>
      <Chip t={t} t0={tExporta} text="LO EXPORTA" x={1480} y={880} color={K.oil} size={52} />
    </AbsoluteFill>
  );
};

const Drops: React.FC<{t: number; t0: number}> = ({t, t0}) => (
  <div style={{position: 'absolute', left: 120, top: 640, opacity: prog(t, t0, 0.3)}}>
    <div style={{display: 'flex', gap: 22}}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width={70} height={100} viewBox="0 0 70 100" style={{transform: `scale(${Math.min(1, pop(t, t0 + i * 0.1))})`}}>
          <path d="M35 4 C 50 34 64 50 64 66 A 29 29 0 0 1 6 66 C 6 50 20 34 35 4 Z" fill={i === 4 && t > t0 + 0.7 ? K.red : '#2A2420'} stroke={i === 4 && t > t0 + 0.7 ? K.red : K.oil} strokeWidth={4} />
        </svg>
      ))}
    </div>
    <div style={{fontFamily: F.head, fontSize: 54, color: K.cream, marginTop: 14}}>1 DE CADA 5 GOTAS</div>
    <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 22, letterSpacing: 4, color: K.mute}}>DEL PETRÓLEO DEL MUNDO PASABA POR ACÁ</div>
  </div>
);

/* =====================================================================================
   S08 · ¿Arabia Saudita? Ni cerca. ¿Venezuela? Más cerca de lo que parece. Torres de barriles 3D
   ===================================================================================== */
const XA = -5.2, XS = 0, XV = 5.2;
export const S08: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s08', p, n);
  const tNi = c('Ni cerca.'), tAun = c('Aun golpeada'), tSeis = c('seis millones'), tCasi = c('Casi siete'), tPero = c('Pero hay otro'), tVen = c('Venezuela.'), tDice = c('Dice tener');
  const tHoy = c('y hoy produce'), tUn = c('un millón'), tApenas = c('Apenas'), tLlego = c('Venezuela llegó'), tTres = c('tres millones.'), tTuvo = c('Tuvo');
  const arg = towerItems(9, [XA, 0, 0], clamp((t - tAun) / 1.0), K.celeste, 3, 2, 1);
  const sau = towerItems(62, [XS, 0, 0], clamp((t - tSeis + 0.2) / 2.2), K.sau, 3, 2, 2);
  const ven = towerItems(11, [XV, 0, 0], clamp((t - tUn + 0.3) / 1.0), K.ven, 3, 2, 3);
  const ghost = towerItems(32, [XV, 0, 0], clamp((t - tLlego) / 1.4), K.red, 3, 2, 4);
  const ghostO = 1 - prog(t, tTuvo - 0.3, 0.5);
  const cam = camPath(t, [
    [tAun - 0.3, {pos: [-3.5, 3.2, 13], look: [-2.5, 1.5, 0], fov: 34}],
    [tSeis - 0.3, {pos: [-7, 7.5, 27], look: [-1.2, 6.4, 0], fov: 38}],
    [tPero - 0.2, {pos: [1, 3.6, 15], look: [0.5, 2.2, 0], fov: 34}],
    [tLlego - 0.2, {pos: [6, 6, 21], look: [2.6, 4.6, 0], fov: 36}],
  ], 2.2);
  const top = (x: number, n: number) => project(cam, [x, Math.ceil(n / 6) * 1.22 + 0.4, 0.9]);
  const [agx, agy] = top(XA, 9), [sax, say] = top(XS, 62 * clamp((t - tSeis + 0.2) / 2.2)), [vex, vey] = top(XV, 11);
  const [ghx, ghy] = top(XV, 32);
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {t < tAun + 0.3 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tAun, 0.3)}}>
          <FullPhoto src="ep09/ras_tanura.jpg" t={t} t0={-0.4} t1={tAun + 0.3} zoom={[1.05, 1.14]} dim={0.5} credit="Ras Tanura, años 60 · Aramco, dominio público" />
          <Big t={t} t0={0.1} text="¿YA SOMOS | ARABIA SAUDITA?" size={140} y={470} hl={{SAUDITA: K.sau}} />
          {t > tNi ? (
            <div style={{position: 'absolute', left: 1440, top: 760, transform: `translate(-50%,-50%) rotate(-8deg) scale(${2 - Math.min(1, pop(t, tNi, 1.4))})`, opacity: prog(t, tNi, 0.15)}}>
              <div style={{border: `7px solid ${K.red}`, color: K.red, fontFamily: F.head, fontSize: 96, padding: '6px 30px 0', borderRadius: 8, background: 'rgba(6,8,11,0.6)'}}>NI CERCA</div>
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}
      {between(t, tAun - 0.2, tTuvo + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tAun - 0.2, tTuvo + 0.3, 0.3)}}>
          <OilBg t={t} glow="rgba(242,169,59,0.12)" y={75} />
          <Stage cam={cam} shadow={22} key0={[8, 26, 14]} keyI={2.1} target={[0, 4, 0]}>
            <Barrels items={[...arg, ...sau, ...ven]} max={90} />
            {t > tLlego - 0.1 ? <Barrels items={ghost.slice(12)} max={24} ghost /> : null}
            <Floor />
          </Stage>
          <Pin x={agx} y={agy} text="ARGENTINA" sub="0,94 MILLONES/DÍA" color={K.celeste} o={prog(t, tAun + 0.4, 0.4)} size={30} />
          <Pin x={sax} y={say} text="ARABIA SAUDITA" sub="6,2 MILLONES/DÍA" color={K.sau} o={prog(t, tSeis + 0.4, 0.4)} size={30} />
          <Pin x={vex} y={vey} text="VENEZUELA" sub="1,1 MILLONES/DÍA" color={K.ven} o={prog(t, tUn + 0.6, 0.4) * (1 - prog(t, tLlego, 0.3))} size={30} />
          <Pin x={ghx} y={ghy} text="VENEZUELA EN SU PICO" sub="MÁS DE 3 MILLONES/DÍA" color={K.red} o={prog(t, tTres - 0.4, 0.4) * ghostO} size={30} />
          {t > tCasi - 0.2 && t < tPero + 0.2 ? <Chip t={t} t0={tCasi} t1={tPero + 0.2} text="CASI 7 VECES MÁS" x={1480} y={880} color={K.sau} size={56} /> : null}
          <Chip t={t} t0={tDice} t1={tHoy + 0.4} text="DICE TENER LAS MAYORES RESERVAS DEL MUNDO" x={1260} y={880} color={K.ven} size={38} />
          <Chip t={t} t0={tApenas} t1={tLlego} text="APENAS 200.000 BARRILES MÁS QUE LA ARGENTINA" x={1220} y={880} color={K.ven} size={38} />
          <div style={{position: 'absolute', right: 90, bottom: 60, display: 'flex', alignItems: 'center', gap: 12, opacity: prog(t, tAun + 0.6, 0.5), fontFamily: F.body, fontWeight: 700, fontSize: 22, color: K.mute}}>
            <BarrelIcon size={40} /> = 100.000 BARRILES POR DÍA
          </div>
          <SrcLine t={t} t0={tAun + 0.5} text="Producción de agosto de 2026 · Fuentes: OPEP (fuentes secundarias), Secretaría de Energía" />
        </AbsoluteFill>
      ) : null}
      {t > tTuvo - 0.2 ? (
        <AbsoluteFill style={{opacity: prog(t, tTuvo - 0.2, 0.3)}}>
          <FullPhoto src="ep09/colas_vzla.png" t={t} t0={tTuvo - 0.2} zoom={[1.06, 1.14]} dim={0.5} bw credit="Colas por nafta, Caracas, 2002-2003 · Prensa Presidencial de Venezuela, CC BY 3.0" />
          <Big t={t} t0={tTuvo} text="TUVO EL TESORO…" size={130} y={420} />
          <Big t={t} t0={c('lo perdió.') - 0.1} text="Y LO PERDIÓ" size={170} y={600} hl={{PERDIÓ: K.red}} />
        </AbsoluteFill>
      ) : null}
      <Vig k={0.5} />
    </AbsoluteFill>
  );
};

/* =====================================================================================
   S09 · TRAMPA 3: la enfermedad holandesa; el FMI lo advirtió; Noruega guardó el petróleo en un fondo
   ===================================================================================== */
export const S09: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s09', p, n);
  const tNombre = c('Tiene nombre:'), tHol = c('enfermedad holandesa,'), tCuando = c('Cuando un país'), tEntran = c('entran'), tAbarata = c('se abarata.'), tBarato = c('Y con el dólar barato,');
  const tFab = c('fábricas'), tFondo = c('El Fondo'), tNor = c('Noruega'), tDecide = c('decidió'), tGuardo = c('Lo guardó'), tDos = c('dos coma'), tCuatro = c('más de cuatrocientos');
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {t < tNombre + 0.3 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tNombre, 0.3)}}>
          <OilBg t={t} glow="rgba(229,56,59,0.18)" />
          <TrapTag t={t} t0={0.1} n={3} sub="LA MÁS PELIGROSA" x={960 - 440} y={500} big />
        </AbsoluteFill>
      ) : null}
      {between(t, tNombre - 0.2, tCuando + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tNombre - 0.2, tCuando + 0.3, 0.3)}}>
          <FullPhoto src="ep09/slochteren.jpg" t={t} t0={tNombre - 0.2} t1={tCuando + 0.3} zoom={[1.04, 1.14]} dim={0.55} bw credit="Gas de Slochteren, Países Bajos · Nationaal Archief, CC0" />
          <Big t={t} t0={tHol - 0.1} text="LA ENFERMEDAD HOLANDESA" size={130} y={470} hl={{HOLANDESA: K.oil}} />
          <Chip t={t} t0={c('Holanda')} text="PAÍSES BAJOS · ENCONTRÓ GAS EN 1959" x={960} y={640} color={K.oil} size={40} />
        </AbsoluteFill>
      ) : null}
      {between(t, tCuando - 0.2, tFondo + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tCuando - 0.2, tFondo + 0.3, 0.3)}}>
          <OilBg t={t} />
          <Dutch t={t} t0={tCuando} tEntran={tEntran} tAbarata={tAbarata} tBarato={tBarato} tFab={tFab} />
        </AbsoluteFill>
      ) : null}
      {between(t, tFondo - 0.2, tNor + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tFondo - 0.2, tNor + 0.3, 0.3)}}>
          <OilBg t={t} glow="rgba(229,56,59,0.14)" />
          <Warning t={t} t0={tFondo} tAdv={c('advirtió')} />
        </AbsoluteFill>
      ) : null}
      {between(t, tNor - 0.2, tGuardo + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tNor - 0.2, tGuardo + 0.3, 0.3)}}>
          <FullPhoto src="ep09/troll.jpg" t={t} t0={tNor - 0.2} t1={tGuardo + 0.3} zoom={[1.04, 1.14]} dim={0.4} credit="Plataforma Troll A, Mar del Norte · Norsk olje og gass, CC BY-SA 2.0" />
          <Tag t={t} t0={tNor + 0.1} a="NORUEGA" b="ENCUENTRA PETRÓLEO EN 1969" x={110} y={110} color={K.nor} />
          <Big t={t} t0={tDecide} text="DECIDIÓ NO GASTÁRSELO" size={130} y={860} hl={{NO: K.nor}} />
        </AbsoluteFill>
      ) : null}
      {t > tGuardo - 0.2 ? (
        <AbsoluteFill style={{opacity: prog(t, tGuardo - 0.2, 0.3)}}>
          <FullPhoto src="ep09/norges_bank.jpg" t={t} t0={tGuardo - 0.2} zoom={[1.04, 1.12]} dim={1.4} credit="Banco Central de Noruega, Oslo · Mahlum, dominio público" />
          <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(6,8,11,0.85) 0%, rgba(6,8,11,0.35) 70%)'}} />
          <div style={{position: 'absolute', left: 110, top: 170, fontFamily: F.body, fontWeight: 800, fontSize: 28, letterSpacing: 6, color: K.nor, opacity: prog(t, tGuardo, 0.4)}}>FONDO SOBERANO DE NORUEGA</div>
          <div style={{position: 'absolute', left: 100, top: 220, fontFamily: F.head, fontSize: 240, color: K.cream, lineHeight: 1, opacity: prog(t, tDos - 0.3, 0.3)}}>
            US$ 2,3 <span style={{fontSize: 130}}>BILLONES</span>
          </div>
          <div style={{position: 'absolute', left: 116, top: 470, fontFamily: F.body, fontWeight: 700, fontSize: 30, color: K.mute, opacity: prog(t, tDos + 0.6, 0.4)}}>2.300.000 millones de dólares</div>
          <div style={{position: 'absolute', left: 110, top: 600, display: 'flex', alignItems: 'center', gap: 30, opacity: prog(t, tCuatro - 0.2, 0.4)}}>
            <PersonIcon size={200} color={K.nor} />
            <div>
              <div style={{fontFamily: F.head, fontSize: 150, color: K.nor, lineHeight: 1}}>
                +US$ <Count t={t} t0={tCuatro} dur={1.2} to={400000} />
              </div>
              <div style={{fontFamily: F.head, fontSize: 60, color: K.cream}}>POR CADA NORUEGO</div>
            </div>
          </div>
          <SrcLine t={t} t0={tGuardo + 0.4} text="Fuente: Norges Bank Investment Management (2026)" />
        </AbsoluteFill>
      ) : null}
      <Vig k={0.5} />
    </AbsoluteFill>
  );
};

/** la enfermedad holandesa en tres pasos */
const Dutch: React.FC<{t: number; t0: number; tEntran: number; tAbarata: number; tBarato: number; tFab: number}> = ({t, t0, tEntran, tAbarata, tBarato, tFab}) => {
  const steps = [
    {x: 340, title: 'SE EXPORTAN RECURSOS', at: t0},
    {x: 960, title: 'ENTRAN MUCHOS DÓLARES', at: tEntran},
    {x: 1580, title: 'EL DÓLAR SE ABARATA', at: tAbarata - 0.4},
  ];
  const needle = -50 + 100 * (1 - easeInOut(clamp((t - tAbarata + 0.6) / 1.2)));
  const dimF = clamp((t - tFab - 0.4) / 1.6);
  const showFactory = t > tBarato - 0.2;
  return (
    <AbsoluteFill>
      {!showFactory || t < tBarato + 0.3 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tBarato, 0.3)}}>
          {steps.map((s, i) => (
            <div key={i} style={{position: 'absolute', left: s.x, top: 560, transform: 'translate(-50%,-50%)', opacity: prog(t, s.at, 0.4), textAlign: 'center', width: 520}}>
              <div style={{height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                {i === 0 ? (
                  <div style={{display: 'flex', gap: 10}}>
                    {[0, 1, 2].map((k) => (
                      <div key={k} style={{transform: `translateY(${Math.sin(t * 3 + k) * 6}px)`}}>
                        <BarrelIcon size={130} color={K.oil} />
                      </div>
                    ))}
                  </div>
                ) : i === 1 ? (
                  <div style={{position: 'relative', width: 420, height: 300}}>
                    {Array.from({length: 14}, (_, k) => {
                      const ph = ((t - s.at) * 0.8 + k / 14) % 1;
                      return (
                        <div key={k} style={{position: 'absolute', left: 20 + ((k * 73) % 360), top: -40 + ph * 320, width: 90, height: 42, background: '#5FA864', borderRadius: 6, border: '3px solid #2E6B35', transform: `rotate(${(k % 5) * 14 - 28}deg)`, opacity: t > s.at ? 1 - ph * 0.3 : 0, fontFamily: F.head, fontSize: 26, color: '#1B3D1E', textAlign: 'center', lineHeight: '38px'}}>
                          US$
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <svg width={360} height={240} viewBox="-180 -200 360 240">
                    <path d="M -150 0 A 150 150 0 0 1 150 0" fill="none" stroke="rgba(242,238,230,0.25)" strokeWidth={22} />
                    <path d="M -150 0 A 150 150 0 0 1 -106 -106" fill="none" stroke={K.red} strokeWidth={22} />
                    <g transform={`rotate(${needle})`}>
                      <path d="M -8 0 L 0 -140 L 8 0 Z" fill={K.cream} />
                    </g>
                    <circle r={16} fill={K.cream} />
                    <text x={0} y={36} textAnchor="middle" fontFamily="Anton" fontSize={30} fill={K.mute}>PRECIO DEL DÓLAR</text>
                  </svg>
                )}
              </div>
              <div style={{fontFamily: F.head, fontSize: 46, color: K.cream}}>{s.title}</div>
            </div>
          ))}
          {[0, 1].map((i) => (
            <div key={i} style={{position: 'absolute', left: 620 + i * 620, top: 520, fontFamily: F.head, fontSize: 90, color: K.oil, opacity: prog(t, steps[i + 1].at - 0.2, 0.3)}}>→</div>
          ))}
        </AbsoluteFill>
      ) : null}
      {showFactory ? (
        <AbsoluteFill style={{opacity: prog(t, tBarato - 0.2, 0.4)}}>
          <div style={{position: 'absolute', left: 960, top: 470, transform: 'translate(-50%,-50%)', display: 'flex', gap: 60}}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{opacity: 1 - 0.55 * clamp(dimF * 3 - i)}}>
                <FactoryIcon size={330} t={t + i} smoke={1 - clamp(dimF * 3 - i)} lights={1 - clamp(dimF * 3 - i)} color={i === 2 && dimF > 0.8 ? '#6B747C' : '#C9D1D8'} />
              </div>
            ))}
          </div>
          <Big t={t} t0={tBarato} text="CON EL DÓLAR BARATO…" size={90} y={150} />
          <Big t={t} t0={tFab + 0.2} text="LAS FÁBRICAS NO PUEDEN COMPETIR" size={100} y={860} hl={{COMPETIR: K.red}} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

const Warning: React.FC<{t: number; t0: number; tAdv: number}> = ({t, t0, tAdv}) => (
  <AbsoluteFill>
    <div style={{position: 'absolute', left: 960, top: 520, transform: `translate(-50%,-50%) rotate(-2deg) scale(${0.85 + 0.15 * pop(t, t0, 0.9)})`, opacity: prog(t, t0, 0.3)}}>
      <div style={{width: 1080, background: '#F5F2EA', borderRadius: 8, padding: '56px 70px 60px', boxShadow: '0 40px 90px rgba(0,0,0,0.6)', color: '#22201D'}}>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 26, letterSpacing: 6, color: '#6A625A'}}>FONDO MONETARIO INTERNACIONAL</div>
        <div style={{fontFamily: F.head, fontSize: 70, lineHeight: 1.08, marginTop: 18}}>EL BOOM DE LA ENERGÍA PUEDE ABARATAR EL DÓLAR Y GOLPEAR A OTROS SECTORES</div>
        <div style={{height: 14, width: 700, background: '#D9D3C7', marginTop: 30, borderRadius: 4}} />
        <div style={{height: 14, width: 840, background: '#D9D3C7', marginTop: 14, borderRadius: 4}} />
        <div style={{height: 14, width: 560, background: '#D9D3C7', marginTop: 14, borderRadius: 4}} />
      </div>
      {t > tAdv ? (
        <div style={{position: 'absolute', right: -40, top: -50, transform: `rotate(12deg) scale(${2 - Math.min(1, pop(t, tAdv, 1.4))})`, opacity: prog(t, tAdv, 0.15), border: `8px solid ${K.red}`, color: K.red, fontFamily: F.head, fontSize: 80, padding: '6px 26px 0', borderRadius: 8, background: 'rgba(245,242,234,0.85)'}}>
          ADVERTENCIA
        </div>
      ) : null}
    </div>
    <SrcLine t={t} t0={t0 + 0.4} text="Síntesis de la advertencia del FMI sobre la Argentina (vía Bloomberg Línea, 2026)" />
  </AbsoluteFill>
);

/* =====================================================================================
   S10 · la pregunta no es si tenemos petróleo; ¿Noruega o Venezuela?; cierre
   ===================================================================================== */
export const S10: React.FC<P & {total: number}> = ({t, total}) => {
  const c = (p: string, n = 0) => cue('s10', p, n);
  const tLaP = c('La pregunta es'), tY = c('Y la Argentina'), tTes = c('el tesoro'), tElP = c('El petróleo no'), tLoQ = c('Lo que hacés'), tCont = c('Contanos'), tVamos = c('¿vamos'), tVen = c('Venezuela?');
  const tSi = c('Si te'), tNos = c('Nos vemos');
  const ang = 0.55 + t * 0.03;
  const cam1: Cam = {pos: [Math.sin(ang) * 19, 3.2, Math.cos(ang) * 19], look: [0, -3.2, 0], fov: 34};
  const k2 = easeInOut(clamp((t - tY) / 3));
  const cam2 = lerpCam(cam1, {pos: [6.5, -3.2, 12.5], look: [0, -4.6, 1.5], fov: 32}, k2);
  const geo: GeoState = {t, night: 1, surface: 1, glow: 0.4 + 0.6 * prog(t, tY, 1), oil: prog(t, tY, 1.2), sea: 0, plank: 0};
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {t < tElP + 0.3 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tElP, 0.3)}}>
          <OilBg t={t} glow="rgba(242,169,59,0.12)" />
          <BlockShot cam={t < tY ? cam1 : cam2} s={geo} night />
          <Big t={t} t0={0.05} t1={tLaP} text="LA PREGUNTA NO ES SI TIENE PETRÓLEO" size={88} y={150} />
          <Big t={t} t0={tLaP} t1={tY + 0.1} text="ES QUÉ VA A HACER CON ÉL" size={110} y={150} hl={{QUÉ: K.oil}} />
          <Chip t={t} t0={tTes - 0.2} text="EL TESORO DE UN MAR DE HACE 145 MILLONES DE AÑOS" x={960} y={930} color={K.oil} size={38} />
        </AbsoluteFill>
      ) : null}
      {between(t, tElP - 0.2, tCont + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tElP - 0.2, tCont + 0.3, 0.3)}}>
          <FullVideo src="ep09/vid/bombeo.mp4" t={t} t0={tElP - 0.2} t1={tCont + 0.3} zoom={[1.12, 1.04]} dim={1.5} fade={0.01} credit="H-2-O, CC BY-SA 4.0" />
          <AbsoluteFill style={{background: 'rgba(6,8,11,0.45)'}} />
          <Big t={t} t0={tElP} text="EL PETRÓLEO NO TE HACE RICO." size={120} y={430} />
          <Big t={t} t0={tLoQ} text="LO QUE HACÉS CON ÉL, SÍ." size={150} y={620} hl={{SÍ: K.oil}} />
        </AbsoluteFill>
      ) : null}
      {between(t, tCont - 0.2, tSi + 0.4) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tCont - 0.2, tSi + 0.4, 0.3)}}>
          <SplitVs
            t={t} t0={tCont} tR={tVen - 0.2} mid="?"
            left={{src: 'ep09/troll.jpg', name: 'NORUEGA', color: K.nor, credit: 'Norsk olje og gass, CC BY-SA 2.0'}}
            right={{src: 'ep09/colas_vzla.png', name: 'VENEZUELA', color: K.ven, credit: 'Prensa Presidencial de Venezuela, CC BY 3.0'}}
          />
          <div style={{position: 'absolute', left: 0, right: 0, top: 90, textAlign: 'center', opacity: prog(t, tCont, 0.4)}}>
            <span style={{background: 'rgba(6,8,11,0.85)', padding: '10px 30px 4px', borderRadius: 10, fontFamily: F.head, fontSize: 64, color: K.cream}}>CONTANOS: ¿PARA DÓNDE VAMOS?</span>
          </div>
        </AbsoluteFill>
      ) : null}
      {t > tSi - 0.5 ? <EndCard t={t} t0={tSi - 0.2} tSusc={c('suscribite')} tComp={c('compartilo')} tNos={tNos} total={total} /> : null}
      <Vig k={0.45} />
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{t: number; t0: number; tSusc: number; tComp: number; tNos: number; total: number}> = ({t, t0, tSusc, tComp, tNos, total}) => {
  const move = easeInOut(clamp((t - (tNos - 1.6)) / 1.0));
  const size = 380 - 110 * move;
  const lx = 960 - size / 2 - 560 * move;
  const ly = 250 - 90 * move;
  const bg = prog(t, t0 - 0.3, 0.6);
  const fadeOut = prog(t, total - 0.6, 0.6);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: K.bg0, opacity: bg}} />
      <AbsoluteFill style={{opacity: bg * 0.8, background: 'radial-gradient(ellipse at 30% 55%, rgba(242,169,59,0.16) 0%, rgba(0,0,0,0) 60%)'}} />
      <Dust t={t} n={30} o={0.5 * bg} />
      <div style={{position: 'absolute', left: lx, top: ly}}>
        <LogoMark size={size} t={t} t0={t0} />
      </div>
      <div style={{position: 'absolute', left: -560 * move, right: 560 * move, top: 680 - 220 * move, textAlign: 'center', opacity: prog(t, t0 + 0.5, 0.5)}}>
        <div style={{fontFamily: F.head, fontSize: 110 - 30 * move, color: '#fff', letterSpacing: 6}}>CONTEXTO</div>
      </div>
      <div style={{position: 'absolute', left: 960 - 190 - 560 * move, top: 830 - 240 * move, opacity: prog(t, tSusc - 0.2, 0.3), transform: `scale(${pop(t, tSusc - 0.2)})`}}>
        <div style={{width: 380, height: 84, background: K.red, borderRadius: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 34, letterSpacing: 3, color: '#fff', boxShadow: '0 10px 30px rgba(229,56,59,0.45)'}}>
          SUSCRIBITE
        </div>
      </div>
      <div style={{position: 'absolute', left: 960 - 380 - 560 * move, top: 945 - 240 * move, width: 760, textAlign: 'center', opacity: prog(t, tComp - 0.2, 0.3), fontFamily: F.body, fontWeight: 700, fontSize: 28, color: K.mute}}>
        Compartilo con alguien que trabaje en Vaca Muerta
      </div>
      <div style={{position: 'absolute', left: 1010, top: 170, opacity: prog(t, tNos - 0.6, 0.5)}}>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 26, letterSpacing: 6, color: K.mute, marginBottom: 16}}>SEGUÍ MIRANDO</div>
        {[0, 1].map((i) => (
          <div key={i} style={{width: 760, height: 330, marginBottom: 40, borderRadius: 10, border: '3px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.04)', transform: `translateX(${(1 - prog(t, tNos - 0.5 + i * 0.15, 0.6)) * 80}px)`}} />
        ))}
      </div>
      <div style={{position: 'absolute', left: 50, top: 850, width: 700, textAlign: 'center', opacity: prog(t, tNos, 0.5), fontFamily: F.head, fontSize: 56, color: '#fff'}}>NOS VEMOS EN EL PRÓXIMO VIDEO</div>
      <AbsoluteFill style={{background: '#000', opacity: fadeOut}} />
    </AbsoluteFill>
  );
};
