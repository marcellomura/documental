/* Escenas S07–S11 del episodio 11 (El Sol de Perón). */
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {F} from '../theme';
import {LogoMark} from '../ep04/kit';
import {cue} from './lib';
import {
  K, TYPE, SpaceBg, Embers, FilmFX, ArchiveVideo, FilmFrame, ArchCredit, NameTag, Newspaper, QuoteCard, Bulb, Plug, MoneyCount,
  Big, Chip, FullPhoto, Vig, Stamp, Typed, PhotoCard, DateCard, Place, YearRoll, MarkerCircle, between, fadeIO, clamp, easeIn, easeInOut, easeOut, prog, pop, rnd,
} from './kit11';
import {GlobeShot, GPin} from '../ep10/shots10';
import {FlatMap, MapRoute, MapPin} from '../ep10/kit10';
import type {MapView} from '../ep10/kit10';
import {IslandShot, ISL_WIDE, Stage, Sun3D, Stellarator3D, STEL_CAM, camPath} from './three11';

const C = (seg: string) => (phrase: string, n = 0, w: 's' | 'e' = 's') => cue(seg, phrase, n, w);

/* ============================================================ S07 — el final de Richter */
export const S07: React.FC<{t: number}> = ({t}) => {
  const c = C('s07');
  const tInst = c('Encuentran') - 0.1, tFraude = c('El proyecto') - 0.1, tGolpe = c('Después') - 0.1, tPaso = c('Pasó') - 0.1, tMurio = c('Murió') - 0.1, tFin = c('Fin') - 0.1, tO = c('O eso');
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {t < tInst + 0.4 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tInst, 0.4)}}>
          <IslandShot s={{t, build: 1, reactor: 1, night: 1, search: prog(t, 0.6, 0.8), boat: 0.85 + 0.15 * prog(t, 0, 3), lit: 0.9}} cam={camPath(t, [[0, ISL_WIDE], [0.1, {pos: [-4, 9, 30], look: [0, 1, 0], fov: 38}]], 4)} />
          <DateCard t={t} t0={0.1} d={22} m={11} y={1952} x={320} yPos={300} label="LOS MILITARES TOMAN LA ISLA" color={K.red} size={0.85} />
          <div style={{position: 'absolute', left: 60, bottom: 40, fontFamily: F.mono, fontSize: 16, color: 'rgba(243,235,221,0.6)'}}>Recreación 3D</div>
        </AbsoluteFill>
      ) : null}
      {between(t, tInst, tFraude + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tInst, 0.4), 1 - prog(t, tFraude, 0.4))}}>
          <FullPhoto src="ep11/img/richter_lab.jpg" t={t} t0={tInst} zoom={[1.12, 1.28]} focus="35% 60%" bw dim={0.55} />
          <FilmFX t={t} k={0.6} />
          <div style={{position: 'absolute', left: 360, top: 230, width: 1200, height: 380, borderRadius: 40, background: 'rgba(5,6,11,0.82)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', opacity: prog(t, tInst + 0.1, 0.4)}} />
          <Plug t={t} t0={c('conectados.') - 0.7} x={960} y={420} s={1.25} />
          <Big t={t} t0={c('instrumentos') - 0.1} text="INSTRUMENTOS SIN CONECTAR" size={96} y={800} color={K.cream} hl={{CONECTAR: K.red}} />
        </AbsoluteFill>
      ) : null}
      {between(t, tFraude, tGolpe + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tFraude, 0.4), 1 - prog(t, tGolpe, 0.4))}}>
          <IslandShot s={{t, build: 1, reactor: 1, night: 1, lit: 0.3, sunGlow: 1 - prog(t, c('apaga') - 0.2, 1.6)}} cam={{pos: [8, 8, 24], look: [0, 1.6, 0], fov: 36}} />
          <AbsoluteFill style={{background: `rgba(0,0,0,${0.5 * prog(t, c('apaga'), 2)})`}} />
          <Stamp t={t} t0={c('fraude,') - 0.1} text="FRAUDE" x={960} y={360} rot={-8} size={200} />
          {t > c('el sol') - 0.2 ? <Big t={t} t0={c('el sol') - 0.2} text="EL SOL ARGENTINO SE APAGA" size={90} y={880} color={K.sun} /> : null}
        </AbsoluteFill>
      ) : null}
      {between(t, tGolpe, tPaso + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tGolpe, 0.4), 1 - prog(t, tPaso, 0.4))}}>
          <FullPhoto src="ep11/img/richter.jpg" t={t} t0={tGolpe} zoom={[1.05, 1.12]} focus="50% 30%" bw dim={0.35} />
          <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
            {Array.from({length: 9}, (_, i) => {
              const k = easeOut(prog(t, c('detenido.') - 0.4 + i * 0.03, 0.4));
              return <rect key={i} x={140 + i * 210} y={-1080 + 1080 * k} width={34} height={1080} fill="#1B1B1F" stroke="#55565C" strokeWidth={3} />;
            })}
          </svg>
          <DateCard t={t} t0={tGolpe + 0.2} d={4} m={10} y={1955} x={1560} yPos={330} label="TRAS EL GOLPE" color={K.red} size={0.8} />
          <Stamp t={t} t0={c('detenido.')} text="DETENIDO" x={960} y={760} rot={-6} size={130} />
        </AbsoluteFill>
      ) : null}
      {between(t, tPaso, tFin + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tPaso, 0.4), 1 - prog(t, tFin, 0.4))}}>
          <AbsoluteFill style={{background: '#E9DFC9'}}>
            <Img src={staticFile('tex/paper.png')} style={{width: '100%', height: '100%', mixBlendMode: 'multiply', opacity: 0.7}} />
          </AbsoluteFill>
          <div style={{position: 'absolute', inset: 0, transform: `scale(${1 + 0.06 * clamp((t - tPaso) / 10)})`, transformOrigin: '30% 50%'}}>
          <PhotoCard t={t} t0={tPaso} src="ep11/img/richter.jpg" x={500} y={500} w={520} h={650} rot={-4} caption="Ronald Richter" />
          {t > c('criando') - 0.3 && t < c('pequeños') - 0.2 ? (
            <div style={{position: 'absolute', left: 1080, top: 230, opacity: Math.min(prog(t, c('criando') - 0.3, 0.3), 1 - prog(t, c('pequeños') - 0.6, 0.4))}}>
              <Hen t={t - c('criando') + 0.3} />
              <div style={{fontFamily: F.hand, fontSize: 72, color: '#3A2A1E', marginTop: -10, transform: 'rotate(-3deg)'}}>criando gallinas…</div>
            </div>
          ) : null}
          <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
            {Array.from({length: 7}, (_, i) => {
              const t0 = c('pequeños') - 0.6 + i * 0.22;
              const k = prog(t, t0, 0.5);
              const x = 1010 + (i % 4) * 210 + (i > 3 ? 100 : 0), y = 420 + Math.floor(i / 4) * 230;
              const r = 50 + rnd(i) * 20;
              return k > 0 ? (
                <g key={i} opacity={k} stroke="#B5531E" strokeWidth={5} fill="none" strokeLinecap="round">
                  <circle cx={x} cy={y} r={r * k} />
                  {Array.from({length: 10}, (_, j) => {
                    const a = (j / 10) * Math.PI * 2;
                    return <line key={j} x1={x + Math.cos(a) * (r + 12)} y1={y + Math.sin(a) * (r + 12)} x2={x + Math.cos(a) * (r + 12 + 26 * k)} y2={y + Math.sin(a) * (r + 12 + 26 * k)} />;
                  })}
                </g>
              ) : null;
            })}
          </svg>
          <div style={{position: 'absolute', left: 980, top: 820, width: 860, fontFamily: F.hand, fontSize: 56, color: '#3A2A1E', opacity: prog(t, c('la fórmula') - 0.1, 0.5), transform: 'rotate(-2deg)'}}>“Tengo la fórmula para crear pequeños soles”</div>
          </div>
          {t > tMurio - 0.2 ? (
            <div style={{position: 'absolute', left: 1000, top: 110, fontFamily: F.head, fontSize: 130, color: '#2A2018', opacity: prog(t, tMurio - 0.2, 0.4)}}>
              1909 – <span style={{color: K.red}}>1991</span>
            </div>
          ) : null}
          <ArchCredit text="Foto: Wikimedia Commons (dominio público)" />
        </AbsoluteFill>
      ) : null}
      {t >= tFin ? (
        <AbsoluteFill style={{opacity: prog(t, tFin, 0.3)}}>
          <AbsoluteFill style={{background: '#0A0908'}} />
          {(() => {
            const g = t > tO ? prog(t, tO, 0.15) : 0;
            const jx = g > 0 ? Math.sin(t * 90) * 18 * (1 - prog(t, tO + 0.3, 0.6)) : 0;
            const iris = 1 - easeIn(prog(t, tFin + 0.6, 1.6, (x) => x)) * 0.55;
            return (
              <>
                <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0) ${iris * 60}%, #000 ${iris * 60 + 1}%)`}} />
                <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', transform: `translateX(${jx}px)`}}>
                  <div style={{fontFamily: F.quote, fontStyle: 'italic', fontSize: 220, color: K.cream, opacity: 1 - 0.7 * g}}>Fin</div>
                </div>
                {g > 0 ? (
                  <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily: F.head, fontSize: 110, color: K.sun, opacity: g, letterSpacing: 4, textShadow: `${-jx}px 0 0 ${K.plasma}, ${jx}px 0 0 ${K.red}`}}>¿O NO?</div>
                ) : null}
              </>
            );
          })()}
          <FilmFX t={t} k={1.2} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/** gallina dibujada a mano que se traza y picotea */
const Hen: React.FC<{t: number}> = ({t}) => {
  const d = 'M60 160 C40 120 60 70 110 70 C120 40 150 30 165 55 C180 50 190 62 182 72 L200 80 L182 86 C188 120 170 170 120 180 C95 185 70 178 60 160 Z M150 50 C152 38 160 32 166 40 M100 120 C120 110 140 115 150 130 M105 180 L100 215 L88 222 M100 215 L112 222 M135 178 L140 212 L128 220 M140 212 L152 220';
  const k = clamp(t / 1.4);
  const peck = Math.max(0, Math.sin(t * 5)) * 6;
  return (
    <svg width={440} height={380} viewBox="0 0 240 240" style={{overflow: 'visible'}}>
      <g transform={`rotate(${peck * 0.6} 180 80)`}>
        <path d={d} fill="none" stroke="#3A2A1E" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
        <circle cx={168} cy={64} r={4} fill="#3A2A1E" opacity={k} />
        <path d="M160 46 C164 36 172 38 170 46" fill="none" stroke="#B5531E" strokeWidth={6} strokeLinecap="round" opacity={k} />
      </g>
    </svg>
  );
};

/* ============================================================ S08 — Spitzer y el stellarator */
export const S08: React.FC<{t: number}> = ({t}) => {
  const c = C('s08');
  const tPenso = c('Pensó:') - 0.1, tSilla = c('Y arriba') - 0.1, tStel = c('imaginó') - 0.1, tPlata = c('Dos meses') - 0.1, tURSS = c('Hasta en') - 0.1, tMent = c('La mentira') - 0.1;
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {t < tPenso + 0.4 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tPenso, 0.4)}}>
          <SpaceBg t={t} glow="rgba(160,200,255,0.16)" stars={0.4} />
          <Snow t={t} />
          <PhotoCard t={t} t0={-0.2} src="ep11/img/spitzer.jpg" x={500} y={500} w={520} h={660} rot={-3} caption="Lyman Spitzer" bw={false} />
          <Newspaper t={t} t0={c('leyó') - 0.3} x={1340} y={540} w={680} rot={4} masthead="THE MORNING HERALD" date="MARCH 25, 1951" head="Argentina claims controlled H-power" sub="Perón announces thermonuclear reaction" />
          <NameTag t={t} t0={c('Lyman') - 0.2} name="LYMAN SPITZER" role="ASTROFÍSICO · PRINCETON" x={110} y={900} color={K.plasma} />
          <ArchCredit text="Foto: NASA (dominio público) · Diario: recreación" />
        </AbsoluteFill>
      ) : null}
      {between(t, tPenso, tSilla + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tPenso, 0.4), 1 - prog(t, tSilla, 0.4))}}>
          <Blueprint t={t} />
          <div style={{position: 'absolute', left: 260, top: 300, fontFamily: F.hand, fontSize: 110, color: '#F3EBDD', opacity: prog(t, c('esto') - 0.1, 0.4), transform: 'rotate(-3deg)'}}>
            “Esto no puede funcionar” <span style={{color: K.red}}>✗</span>
          </div>
          <div style={{position: 'absolute', left: 340, top: 560, fontFamily: F.hand, fontSize: 96, color: K.sun, opacity: prog(t, c('¿qué haría') - 0.1, 0.4), transform: 'rotate(-2deg)'}}>¿Qué haría falta para que sí funcione?</div>
        </AbsoluteFill>
      ) : null}
      {between(t, tSilla, tStel + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tSilla, 0.4), 1 - prog(t, tStel, 0.4))}}>
          <Chairlift t={t - tSilla} />
          <Place t={t} t0={tSilla + 0.2} a="ARRIBA DE UNA AEROSILLA" b="MARZO DE 1951" color={K.plasma} />
        </AbsoluteFill>
      ) : null}
      {between(t, tStel, tPlata + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tStel, 0.4), 1 - prog(t, tPlata, 0.4))}}>
          <SpaceBg t={t} glow="rgba(92,214,255,0.16)" />
          <Stage cam={camPath(t - tStel, [[0, {pos: [0, 7, 12], look: [0, -0.3, 0], fov: 42}], [0.2, STEL_CAM]], 3)} keyI={2.2} fill={0.7} key0={[4, 10, 8]}>
            <Stellarator3D t={t} coils={prog(t, tStel + 0.3, 2.8, (x) => x)} plasma={prog(t, c('un gas') - 0.2, 1.2)} spin={(t - tStel) * 0.18} />
          </Stage>
          <Chip t={t} t0={c('imanes') - 0.1} text="IMANES" x={360} y={260} color="#3E7FD8" size={56} />
          <Chip t={t} t0={c('un gas') - 0.1} text="GAS A MILLONES DE GRADOS" x={1450} y={260} color={K.sun} size={56} />
          <Big t={t} t0={c('el stellarator.') - 0.1} text="EL STELLARATOR" size={140} y={930} color={K.cream} />
          <ArchCredit text="Recreación 3D" />
        </AbsoluteFill>
      ) : null}
      {between(t, tPlata, tURSS + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tPlata, 0.4), 1 - prog(t, tURSS, 0.4))}}>
          <SpaceBg t={t} glow="rgba(92,214,255,0.12)" />
          {t < c('Así') + 0.2 ? (
            <AbsoluteFill style={{opacity: 1 - prog(t, c('Así'), 0.3)}}>
              <DateCard t={t} t0={tPlata + 0.1} d={12} m={5} y={1951} x={560} yPos={420} label="PRESENTA EL PROYECTO" color={K.plasma} />
              <MoneyCount t={t} t0={c('plata') - 0.3} to={50000} dur={1.0} x={1260} y={520} size={170} color={K.green} label="FONDOS DE LA COMISIÓN DE ENERGÍA ATÓMICA" />
            </AbsoluteFill>
          ) : null}
          {t > c('Así') - 0.1 ? (
            <AbsoluteFill style={{opacity: prog(t, c('Así') - 0.1, 0.4)}}>
              <PhotoCard t={t} t0={c('Así') - 0.1} src="ep11/img/wendel2a.jpg" x={560} y={480} w={700} h={525} rot={-3} caption="Stellarator Wendelstein II (1965)" bw={false} capSize={24} />
              <PhotoCard t={t} t0={c('todavía') - 0.3} src="ep11/img/w7x.jpg" x={1360} y={520} w={760} h={473} rot={2} caption="Wendelstein 7-X, Alemania (hoy)" bw={false} capSize={24} from="right" />
              <Big t={t} t0={c('todavía') - 0.1} text="TODAVÍA EXISTE" size={90} y={930} color={K.plasma} />
              <ArchCredit text="Fotos: Wombat aus Alaska (CC BY-SA 4.0) · Max-Planck IPP (CC BY 3.0)" />
            </AbsoluteFill>
          ) : null}
        </AbsoluteFill>
      ) : null}
      {t >= tURSS ? (
        <AbsoluteFill style={{opacity: prog(t, tURSS, 0.4)}}>
          <SpaceBg t={t} glow="rgba(255,178,62,0.1)" />
          <GlobeShot
            t={t}
            v={{lon: -40 + 25 * easeInOut(prog(t, tURSS, 4)), lat: 20, dist: 9.4, x: 0}}
            routes={[
              {pts: [[-64, -36], [-74, 40.5]], p: prog(t, tURSS + 0.1, 1.2), color: K.sun, h: 0.12},
              {pts: [[-64, -36], [37.6, 55.7]], p: prog(t, c('Soviética,') - 0.2, 1.4), color: K.sun, h: 0.16},
            ]}
            countries={[
              {a3: 'ARG', color: '#74ACDF', o: 0.9},
              {a3: 'USA', color: '#5CD6FF', o: prog(t, tURSS + 0.6, 0.5)},
              {a3: 'RUS', color: '#E8423A', o: prog(t, c('Soviética,'), 0.5)},
            ]}
          >
            {(pt) => (
              <>
                <GPin xy={pt(-74, 40.5)} label="ESTADOS UNIDOS" o={prog(t, tURSS + 0.9, 0.4)} color={K.plasma} side="l" />
                <GPin xy={pt(37.6, 55.7)} label="UNIÓN SOVIÉTICA" o={prog(t, c('Soviética,') + 0.6, 0.4)} color={K.red} />
                <GPin xy={pt(-64, -36)} label="ARGENTINA" o={0.9} color={K.celeste} />
              </>
            )}
          </GlobeShot>
          {t > tMent - 0.1 ? (
            <AbsoluteFill style={{background: `rgba(5,6,11,${0.6 * prog(t, tMent - 0.1, 0.4)})`}}>
              <Big t={t} t0={tMent} text="LA MENTIRA ARGENTINA | DESPERTÓ A LAS POTENCIAS" size={120} y={540} color={K.cream} hl={{POTENCIAS: K.sun}} lh={1.05} />
            </AbsoluteFill>
          ) : null}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

const Snow: React.FC<{t: number}> = ({t}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
    {Array.from({length: 90}, (_, i) => {
      const sp = 0.05 + rnd(i) * 0.08;
      const y = ((rnd(i + 3) + t * sp) % 1) * 1120 - 20;
      const x = rnd(i + 7) * 1920 + Math.sin(t * 0.8 + i) * 30;
      return <circle key={i} cx={x} cy={y} r={1.5 + rnd(i + 11) * 3} fill="#FFFFFF" opacity={0.25 + rnd(i + 5) * 0.4} />;
    })}
  </svg>
);
const Blueprint: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: '#0F2A4A'}}>
    <svg width={1920} height={1080}>
      {Array.from({length: 49}, (_, i) => <line key={'v' + i} x1={i * 40} y1={0} x2={i * 40} y2={1080} stroke="#3A6A9A" strokeWidth={i % 5 ? 0.6 : 1.6} opacity={0.5} />)}
      {Array.from({length: 28}, (_, i) => <line key={'h' + i} x1={0} y1={i * 40} x2={1920} y2={i * 40} stroke="#3A6A9A" strokeWidth={i % 5 ? 0.6 : 1.6} opacity={0.5} />)}
      <circle cx={1500 + Math.sin(t) * 4} cy={820} r={150} fill="none" stroke="#9CC4EE" strokeWidth={3} strokeDasharray="12 10" />
      <ellipse cx={1500} cy={820} rx={210} ry={70} fill="none" stroke="#9CC4EE" strokeWidth={2} />
    </svg>
  </AbsoluteFill>
);
/** ladera nevada con una aerosilla que sube */
const Chairlift: React.FC<{t: number}> = ({t}) => {
  const k = clamp(t / 6);
  const cx = 260 + 1100 * k, cy = 820 - 560 * k;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #4C6D96 0%, #9FB9D6 55%, #E9F0F7 100%)'}}>
      <svg width={1920} height={1080}>
        <path d="M0 720 L380 420 L620 560 L980 230 L1320 470 L1600 300 L1920 520 L1920 1080 L0 1080 Z" fill="#DCE6F0" />
        <path d="M980 230 L1080 330 L1020 320 L940 290 Z M380 420 L450 480 L400 470 Z M1600 300 L1680 370 L1620 360 Z" fill="#AFC2D6" />
        <path d="M0 980 L700 640 L1920 900 L1920 1080 L0 1080 Z" fill="#F6F9FC" />
        {Array.from({length: 16}, (_, i) => {
          const x = 80 + i * 120 + (i % 2) * 40, y = 960 - (i % 3) * 30 - Math.max(0, 300 - Math.abs(x - 700) * 0.5);
          return <path key={i} d={`M${x} ${y} l-26 60 h52 Z M${x} ${y + 30} l-34 70 h68 Z`} fill="#2C4A3A" />;
        })}
        <line x1={160} y1={900} x2={1560} y2={130} stroke="#2A2A30" strokeWidth={4} />
        {[0.08, 0.5, 0.92].map((p, i) => (
          <g key={i}>
            <rect x={160 + 1400 * p - 8} y={900 - 770 * p} width={16} height={260} fill="#3A3A40" />
          </g>
        ))}
        <g transform={`translate(${cx},${cy})`}>
          <line x1={0} y1={0} x2={0} y2={90} stroke="#2A2A30" strokeWidth={5} />
          <rect x={-50} y={90} width={100} height={14} rx={4} fill="#C0392B" />
          <rect x={-50} y={50} width={10} height={54} fill="#C0392B" />
          <circle cx={0} cy={58} r={16} fill="#2A2F3A" />
          <rect x={-18} y={72} width={36} height={30} rx={8} fill="#2A2F3A" />
          {k > 0.3 ? <circle cx={60} cy={20} r={10 + 30 * prog(t, 2.4, 0.6)} fill="none" stroke={K.sun} strokeWidth={4} opacity={prog(t, 2.4, 0.4)} /> : null}
          {k > 0.3 ? <text x={78} y={-20} fontFamily={F.head} fontSize={70} fill={K.sun} opacity={prog(t, 2.4, 0.4)}>💡</text> : null}
        </g>
      </svg>
      <Snow t={t} />
    </AbsoluteFill>
  );
};

/* ============================================================ S09 — el legado */
const BARI: [number, number] = [-71.3, -41.13];
const WORLD: MapView = {lon: 22, lat: 6, scale: 5.5};
const EXPORTS: {name: string; sub: string; p: [number, number]; ph: string; side?: 'l' | 'r'}[] = [
  {name: 'PERÚ', sub: 'RP-0 · RP-10', p: [-77.0, -12.0], ph: 'Perú,', side: 'l'},
  {name: 'ARGELIA', sub: 'NUR', p: [3.0, 36.7], ph: 'Argelia,', side: 'l'},
  {name: 'EGIPTO', sub: 'ETRR-2', p: [31.2, 30.0], ph: 'Egipto'},
  {name: 'AUSTRALIA', sub: 'OPAL', p: [151.0, -34.0], ph: 'Australia,'},
  {name: 'PAÍSES BAJOS', sub: 'PALLAS · en construcción', p: [4.7, 52.8], ph: 'Países', side: 'l'},
];
export const S09: React.FC<{t: number}> = ({t}) => {
  const c = C('s09');
  const tProp = c('Balseiro') - 0.2, tIB = c('El Instituto') - 0.2, tRA1 = c('En mil') - 0.1, tInvap = c('Y en mil') - 0.1, tVende = c('Hoy la') - 0.1, tArsat = c('Y de esa') - 0.1;
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {t < tProp + 0.4 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tProp, 0.4)}}>
          <SpaceBg t={t} glow="rgba(116,172,223,0.24)" />
          <Big t={t} t0={0.05} text="Y EN LA ARGENTINA…" size={130} y={500} color={K.celeste} />
        </AbsoluteFill>
      ) : null}
      {between(t, tProp, tIB + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tProp, 0.4), 1 - prog(t, tIB, 0.4))}}>
          <FullPhoto src="ep11/img/ib.jpg" t={t} t0={tProp} zoom={[1.02, 1.12]} dim={0.35} />
          <Chip t={t} t0={c('no tirar') - 0.1} text="NO TIRAR TODO" x={420} y={260} color={K.plasma} size={56} />
          <Chip t={t} t0={c('los equipos') - 0.1} text="LOS EQUIPOS DE LA ISLA" x={560} y={380} color={K.sun} size={52} />
          <Place t={t} t0={c('Bariloche') - 0.2} a="SAN CARLOS DE BARILOCHE" b="NACE UN INSTITUTO DE FÍSICA" color={K.plasma} x={96} y={760} />
          <ArchCredit text="Foto: F. Cosso · Wikimedia Commons (GFDL)" />
        </AbsoluteFill>
      ) : null}
      {between(t, tIB, tRA1 + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tIB, 0.4), 1 - prog(t, tRA1, 0.4))}}>
          <FullPhoto src="ep11/img/ib2.jpg" t={t} t0={tIB} zoom={[1.05, 1.15]} focus="30% 50%" dim={0.25} />
          <NameTag t={t} t0={tIB + 0.2} name="INSTITUTO BALSEIRO" role="LLEVA SU NOMBRE DESDE 1962" x={1810} y={830} align="right" color={K.plasma} />
          <ArchCredit text="Foto: Pieckd · Wikimedia Commons (GFDL)" x={96} align="left" />
        </AbsoluteFill>
      ) : null}
      {between(t, tRA1, tInvap + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tRA1, 0.4), 1 - prog(t, tInvap, 0.4))}}>
          <Pool t={t} />
          <DateCard t={t} t0={tRA1 + 0.1} d={17} m={1} y={1958} x={330} yPos={330} label="SE ENCIENDE EL RA-1" color={K.plasma} size={0.85} />
          <Big t={t} t0={c('el primer') - 0.1} text="EL PRIMER REACTOR | DE AMÉRICA LATINA" size={96} x={1180} y={800} w={1300} color={K.cream} hl={{LATINA: K.plasma, AMÉRICA: K.plasma}} lh={1.05} />
          <ArchCredit text="Ilustración: brillo azul (radiación de Cherenkov) en la pileta de un reactor de investigación" />
        </AbsoluteFill>
      ) : null}
      {between(t, tInvap, tVende + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tInvap, 0.4), 1 - prog(t, tVende, 0.4))}}>
          {t < c('tecnología') - 0.4 ? (
            <AbsoluteFill style={{opacity: 1 - prog(t, c('tecnología') - 0.8, 0.4)}}>
              <FullPhoto src="ep11/img/invap.jpg" t={t} t0={tInvap} zoom={[1.02, 1.1]} dim={0.3} />
              <NameTag t={t} t0={c('INVAP,') - 0.2} name="INVAP" role="BARILOCHE · 1976" x={110} y={820} color={K.celeste} />
              <ArchCredit text="Foto: SoleFabrizio · Wikimedia Commons (CC BY-SA 3.0)" />
            </AbsoluteFill>
          ) : null}
          {t > c('tecnología') - 0.8 ? (
            <AbsoluteFill style={{opacity: prog(t, c('tecnología') - 0.8, 0.4)}}>
              <FullPhoto src="ep11/img/ra6_int.jpg" t={t} t0={c('tecnología') - 0.8} zoom={[1.05, 1.14]} dim={0.35} />
              <Big t={t} t0={c('tecnología') - 0.1} text="TECNOLOGÍA NUCLEAR DE VERDAD" size={104} y={880} color={K.cream} hl={{VERDAD: K.plasma}} />
              <ArchCredit text="Reactor RA-6, Bariloche (construido por INVAP) · Colibri29 (CC0)" />
            </AbsoluteFill>
          ) : null}
        </AbsoluteFill>
      ) : null}
      {between(t, tVende, tArsat + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tVende, 0.4), 1 - prog(t, tArsat, 0.4))}}>
          <SpaceBg t={t} glow="rgba(116,172,223,0.12)" />
          <FlatMap v={WORLD} sea="#071019" land="#1A2433" stroke="rgba(160,190,230,0.22)" hl={{ARG: '#2E5F8C', PER: '#1F4A63', DZA: '#1F4A63', EGY: '#1F4A63', AUS: '#1F4A63', NLD: '#1F4A63'}}>
            {EXPORTS.map((e) => (
              <MapRoute key={e.name} v={WORLD} pts={[BARI, e.p]} p={easeInOut(prog(t, c(e.ph) - 0.5, 0.9, (x) => x))} color={K.plasma} curve={e.name === 'PERÚ' ? -0.3 : 0.16} width={5} />
            ))}
            {EXPORTS.map((e) => (
              <MapPin key={'p' + e.name} v={WORLD} lon={e.p[0]} lat={e.p[1]} label={e.name} sub={e.sub} o={prog(t, c(e.ph) + 0.3, 0.4)} color={K.plasma} side={e.side ?? 'r'} size={34} />
            ))}
            <MapPin v={WORLD} lon={BARI[0]} lat={BARI[1]} label="BARILOCHE" o={prog(t, tVende, 0.4)} color={K.sun} side="r" size={34} />
          </FlatMap>
          <div style={{position: 'absolute', left: 80, top: 80, fontFamily: F.head, fontSize: 70, color: K.cream, opacity: prog(t, tVende, 0.4)}}>LA ARGENTINA VENDE REACTORES</div>
          {between(t, c('donde') - 0.2, c('Ahora') - 0.1) ? (
            <div style={{position: 'absolute', left: 1240, top: 130, width: 600, padding: '26px 32px', background: 'rgba(12,14,23,0.92)', border: `3px solid ${K.plasma}`, borderRadius: 22, opacity: fadeIO(t, c('donde') - 0.2, c('Ahora') - 0.1, 0.3)}}>
              <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: K.mute}}>LICITACIÓN DEL REACTOR OPAL · 2000</div>
              <div style={{fontFamily: F.head, fontSize: 60, color: K.cream, marginTop: 8}}>LE GANÓ A:</div>
              {[['ALEMANIA', 'Alemania,'], ['FRANCIA', 'Francia'], ['CANADÁ', 'Canadá.']].map(([n, ph]) => (
                <div key={n} style={{display: 'flex', justifyContent: 'space-between', fontFamily: F.head, fontSize: 64, color: K.cream, marginTop: 8, opacity: prog(t, c(ph) - 0.15, 0.25)}}>
                  <span>{n}</span>
                  <span style={{color: K.red}}>✕</span>
                </div>
              ))}
            </div>
          ) : null}
          <ArchCredit text="Fuentes: INVAP, ANSTO, NRG-PALLAS" x={96} align="left" />
        </AbsoluteFill>
      ) : null}
      {t >= tArsat ? (
        <AbsoluteFill style={{opacity: prog(t, tArsat, 0.4)}}>
          <FullPhoto src="ep11/img/arsat1.jpg" t={t} t0={tArsat} zoom={[1.03, 1.12]} dim={0.3} />
          <NameTag t={t} t0={c('satélites') - 0.2} name="SATÉLITES ARSAT" role="HECHOS EN BARILOCHE POR INVAP" x={110} y={830} color={K.celeste} />
          <ArchCredit text="Foto: Presidencia de la Nación (CC BY 2.5 AR)" />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
/** pileta de un reactor de investigación con el brillo azul de Cherenkov */
const Pool: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: '#03080F'}}>
    <svg width={1920} height={1080}>
      <defs>
        <radialGradient id="ckv" cx="960" cy="640" r="520" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E8FBFF" />
          <stop offset="0.18" stopColor="#7FE3FF" />
          <stop offset="0.5" stopColor="#1E7FD8" stopOpacity={0.7} />
          <stop offset="1" stopColor="#03080F" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={960} cy={640} rx={700} ry={420} fill="url(#ckv)" opacity={0.85 + 0.1 * Math.sin(t * 3)} />
      {Array.from({length: 25}, (_, i) => {
        const x = 760 + (i % 5) * 100, y = 540 + Math.floor(i / 5) * 50;
        return <rect key={i} x={x - 30} y={y - 18} width={60} height={36} rx={4} fill="#0A2A44" stroke="#9AE8FF" strokeWidth={2} opacity={0.75} />;
      })}
      {Array.from({length: 30}, (_, i) => {
        const y = 900 - ((t * 60 + rnd(i) * 400) % 400);
        return <circle key={'b' + i} cx={700 + rnd(i + 3) * 520} cy={y} r={2 + rnd(i + 5) * 4} fill="#D6F7FF" opacity={0.5} />;
      })}
      <rect x={300} y={160} width={1320} height={880} fill="none" stroke="#5E7890" strokeWidth={10} rx={30} />
    </svg>
  </AbsoluteFill>
);

/* ============================================================ S10 — la fusión hoy y la isla */
export const S10: React.FC<{t: number}> = ({t}) => {
  const c = C('s10');
  const tNif = c('En dos mil') - 0.2, tRed = c('Pero para') - 0.1, tIter = c('Y el gran') - 0.1, tRuin = c('Mientras') - 0.1, tAbre = c('Bariloche') - 0.2;
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {t < tNif + 0.4 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tNif, 0.4)}}>
          <SpaceBg t={t} glow="rgba(255,210,122,0.1)" />
          <Bulb on={0.12 * Math.max(0, Math.sin(t * 13) * Math.sin(t * 7)) * (t > c('encendió') && t < c('encendió') + 1 ? 1 : 0)} x={1340} y={560} s={1.4} />
          <YearRoll t={t} t0={c('Setenta') - 0.3} from={1951} to={2026} dur={1.6} x={600} y={440} size={220} color={K.cream} />
          <div style={{position: 'absolute', left: 600, top: 600, transform: 'translateX(-50%)', fontFamily: F.head, fontSize: 80, color: K.sun, whiteSpace: 'nowrap', opacity: prog(t, c('después,') - 0.1, 0.3)}}>75 AÑOS DESPUÉS</div>
          <div style={{position: 'absolute', left: 600, top: 720, transform: 'translateX(-50%)', fontFamily: F.body, fontWeight: 800, fontSize: 34, color: K.mute, letterSpacing: 3, whiteSpace: 'nowrap', opacity: prog(t, c('sola') - 0.2, 0.3)}}>NI UNA SOLA LAMPARITA</div>
        </AbsoluteFill>
      ) : null}
      {between(t, tNif, tRed + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tNif, 0.4), 1 - prog(t, tRed, 0.4))}}>
          <ArchiveVideo src="ep11/vid/nif_laser.mp4" t={t} t0={tNif} t1={c('más energía') - 0.2} film={0} zoom={[1.0, 1.08]} dim={0.25} credit="Lawrence Livermore National Laboratory (dominio público)" />
          <ArchiveVideo src="ep11/vid/nif_camara.mp4" t={t} t0={c('más energía') - 0.5} film={0} zoom={[1.0, 1.08]} dim={0.55} credit="Lawrence Livermore National Laboratory (dominio público)" />
          <NameTag t={t} t0={c('un laboratorio') - 0.1} t1={c('más energía') - 0.2} name="NATIONAL IGNITION FACILITY" role="CALIFORNIA · 5 DE DICIEMBRE DE 2022" color={K.plasma} />
          {t > c('más energía') - 0.4 ? <NifBars t={t} t0={c('más energía') - 0.3} tRed={Infinity} /> : null}
        </AbsoluteFill>
      ) : null}
      {between(t, tRed, tIter + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tRed, 0.4), 1 - prog(t, tIter, 0.4))}}>
          <SpaceBg t={t} glow="rgba(92,214,255,0.1)" />
          <NifBars t={t} t0={tRed - 5} tRed={c('muchísima') - 0.4} />
        </AbsoluteFill>
      ) : null}
      {between(t, tIter, tRuin + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tIter, 0.4), 1 - prog(t, tRuin, 0.4))}}>
          <FullPhoto src="ep11/img/iter2018.jpg" t={t} t0={tIter} zoom={[1.02, 1.12]} dim={0.35} />
          <NameTag t={t} t0={c('ITER,') - 0.2} name="ITER" role="EL GRAN REACTOR INTERNACIONAL · FRANCIA" color={K.plasma} />
          <div style={{position: 'absolute', right: 120, top: 200, textAlign: 'right', opacity: prog(t, c('dos mil treinta') - 0.4, 0.4)}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 28, color: K.cream, letterSpacing: 3}}>COMBUSTIBLE DEFINITIVO</div>
            <div style={{fontFamily: F.head, fontSize: 200, color: K.sun, lineHeight: 1}}>2039</div>
          </div>
          <ArchCredit text="Foto: ITER en construcción (2018) · Oak Ridge National Laboratory (CC BY 2.0)" />
        </AbsoluteFill>
      ) : null}
      {t >= tRuin ? (
        <AbsoluteFill style={{opacity: prog(t, tRuin, 0.4)}}>
          <FullPhoto src="ep11/img/ruinas.jpg" t={t} t0={tRuin} zoom={[1.0, 1.06]} focus="60% 75%" dim={0.1} />
          <Place t={t} t0={c('isla') - 0.2} a="ISLA HUEMUL · HOY" b="LAS RUINAS DEL PROYECTO" color={K.sun} />
          <MarkerCircle t={t} t0={c('ruinas') - 0.1} x={800} y={590} rx={360} ry={140} color={K.sun} />
          <MarkerCircle t={t} t0={c('ruinas') + 0.4} x={1700} y={560} rx={230} ry={180} color={K.sun} />
          {t > tAbre ? (
            <div style={{position: 'absolute', left: 120, top: 820, padding: '22px 34px', background: 'rgba(12,14,23,0.88)', border: `3px solid ${K.green}`, borderRadius: 20, opacity: prog(t, tAbre, 0.4), transform: `scale(${Math.min(1, pop(t, tAbre))})`}}>
              <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: K.green}}>BARILOCHE QUIERE ABRIRLA</div>
              <div style={{fontFamily: F.head, fontSize: 64, color: K.cream}}>VISITAS: FIN DE 2026</div>
            </div>
          ) : null}
          <ArchCredit text="Foto: Amina Ferley Yael · Wikimedia Commons (CC BY-SA 4.0)" />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
/** energía del disparo vs. electricidad de la red, en escala real */
const NifBars: React.FC<{t: number; t0: number; tRed: number}> = ({t, t0, tRed}) => {
  const r = easeInOut(prog(t, tRed, 1.4, (x) => x));
  const max = 3.6 + (330 - 3.6) * r;
  const W = 1300;
  const rows: {label: string; v: number; txt: string; color: string; at: number}[] = [
    {label: 'ENERGÍA DE LOS LÁSERES', v: 2.05, txt: '2,05 MJ', color: K.plasma, at: t0},
    {label: 'ENERGÍA DE LA FUSIÓN', v: 3.15, txt: '3,15 MJ', color: K.sun, at: t0 + 0.5},
    {label: 'ELECTRICIDAD DE LA RED PARA DISPARAR', v: 300, txt: '≈ 300 MJ', color: K.red, at: tRed},
  ];
  return (
    <AbsoluteFill>
      {rows.map((rw, i) =>
        t >= rw.at ? (
          <div key={i} style={{position: 'absolute', left: 220, top: 260 + i * 210, opacity: prog(t, rw.at, 0.3)}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 28, letterSpacing: 3, color: K.cream, marginBottom: 10, textShadow: '0 2px 10px #000'}}>{rw.label}</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
              <div style={{height: 70, width: Math.max(6, (W * rw.v) / max) * easeOut(prog(t, rw.at, 0.8)), background: rw.color, borderRadius: 8, boxShadow: `0 0 30px ${rw.color}88`}} />
              <div style={{fontFamily: F.head, fontSize: 66, color: K.cream, textShadow: '0 4px 14px #000', whiteSpace: 'nowrap'}}>{rw.txt}</div>
            </div>
          </div>
        ) : null,
      )}
      {r > 0 ? <div style={{position: 'absolute', left: 220, top: 900, fontFamily: F.body, fontWeight: 700, fontSize: 28, color: K.mute, opacity: r}}>Fuente: LLNL. En 2025 el récord llegó a 8,6 MJ: todavía muy lejos de la electricidad que consume.</div> : null}
    </AbsoluteFill>
  );
};

/* ============================================================ S11 — cierre */
export const S11: React.FC<{t: number; total: number}> = ({t, total}) => {
  const c = C('s11');
  const tResp = c('Y la respuesta') - 0.1, tVeces = c('A veces,') - 0.2, tCont = c('Contanos') - 0.2, tSi = c('Si te');
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {t < tResp + 0.4 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tResp, 0.4)}}>
          <AbsoluteFill style={{width: 960}}>
            <FullPhoto src="ep11/img/richter.jpg" t={t} t0={-0.3} zoom={[1.05, 1.12]} focus="50% 30%" bw dim={0.4} grade="rgba(232,66,58,0.35)" />
          </AbsoluteFill>
          <AbsoluteFill style={{left: 960, width: 960}}>
            <FullPhoto src="ep11/img/balseiro_frondizi.jpg" t={t} t0={-0.3} zoom={[1.15, 1.22]} focus="62% 40%" bw dim={0.4} grade="rgba(92,214,255,0.3)" />
          </AbsoluteFill>
          <div style={{position: 'absolute', left: 958, top: 0, width: 4, height: 1080, background: K.cream, opacity: 0.6}} />
          <Big t={t} t0={c('prometió') - 0.1} text="PROMETIÓ UN SOL" size={84} x={480} w={900} y={760} color={K.sun} />
          <Big t={t} t0={c('no entregó') - 0.1} text="NO ENTREGÓ NADA" size={70} x={480} w={900} y={860} color={K.red} />
          <Big t={t} t0={c('quién') - 0.2} text="¿QUIÉN SABÍA DE VERDAD?" size={78} x={1440} w={900} y={820} color={K.plasma} />
        </AbsoluteFill>
      ) : null}
      {between(t, tResp, tVeces + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tResp, 0.4), 1 - prog(t, tVeces, 0.4))}}>
          <SpaceBg t={t} glow="rgba(92,214,255,0.16)" />
          <QuoteCard
            t={t}
            t0={tResp}
            x={960}
            y={520}
            w={1500}
            size={64}
            lines={[
              {text: 'Un joven científico desconocido tenía que informar', t0: tResp + 0.2},
              {text: 'al Presidente de la Nación que había sido engañado.', t0: c('decirle') - 0.2, color: K.plasma},
            ]}
            who="INSTITUTO BALSEIRO, SOBRE EL INFORME DE 1952"
            whoAt={c('engañado.') - 0.3}
          />
        </AbsoluteFill>
      ) : null}
      {between(t, tVeces, tCont + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tVeces, 0.4), 1 - prog(t, tCont, 0.4))}}>
          <SpaceBg t={t} glow="rgba(255,140,40,0.14)" />
          {(() => {
            const y = 1180 - 520 * easeOut(prog(t, tVeces, 2.8));
            return (
              <>
                <AbsoluteFill style={{background: `radial-gradient(circle at 50% ${(y / 1080) * 100}%, rgba(255,200,110,0.55) 0%, rgba(255,120,30,0.25) 22%, rgba(0,0,0,0) 45%)`}} />
                <div style={{position: 'absolute', left: 960 - 300, top: y - 300, width: 600, height: 600, borderRadius: 300, overflow: 'hidden', boxShadow: '0 0 120px 40px rgba(255,150,50,0.45)'}}>
                  <ArchiveVideo src="ep11/vid/sol171.mp4" t={t} t0={tVeces - 0.4} rate={0.5} film={0} dim={0} zoom={[1.12, 1.12]} fade={0.1} />
                </div>
              </>
            );
          })()}
          <Embers t={t} n={50} o={0.7} />
          <Big t={t} t0={tVeces + 0.2} text="A VECES, UNA MENTIRA ENORME | DEJA ALGO VERDADERO" size={110} y={220} color={K.cream} hl={{VERDADERO: K.sun}} lh={1.05} />
          <ArchCredit text="Sol: NASA SDO (dominio público)" />
        </AbsoluteFill>
      ) : null}
      {between(t, tCont, tSi + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tCont, tSi + 0.3, 0.3)}}>
          <SpaceBg t={t} glow="rgba(116,172,223,0.16)" />
          <div style={{position: 'absolute', left: 340, top: 320, width: 1240, padding: '40px 50px', background: 'rgba(16,18,28,0.94)', border: `3px solid ${K.sun}`, borderRadius: 30, boxShadow: '0 30px 70px rgba(0,0,0,0.6)', transform: `scale(${Math.min(1, pop(t, tCont))})`}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 34, color: K.sun, letterSpacing: 3}}>💬 CONTANOS EN LOS COMENTARIOS</div>
            <div style={{fontFamily: F.head, fontSize: 92, color: K.cream, lineHeight: 1.05, marginTop: 20, opacity: prog(t, c('¿sabías') - 0.1, 0.3)}}>¿SABÍAS QUE LA ARGENTINA EXPORTA REACTORES NUCLEARES?</div>
          </div>
        </AbsoluteFill>
      ) : null}
      {t > tSi - 0.5 ? <EndCard t={t} t0={tSi - 0.2} tSusc={c('suscribite,')} tComp={c('compartilo')} tNos={c('Nos vemos')} total={total} /> : null}
      <Vig k={0.4} />
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
      <AbsoluteFill style={{opacity: bg, background: `radial-gradient(circle at ${30 + 4 * Math.sin(t * 0.5)}% ${60 + 3 * Math.cos(t * 0.4)}%, rgba(255,140,40,0.22) 0%, rgba(0,0,0,0) 55%)`}} />
      <Embers t={t} n={45} o={0.55 * bg} />
      <div style={{position: 'absolute', left: lx, top: ly, transform: `rotate(${Math.sin(t * 0.6) * 1.5}deg)`}}>
        <LogoMark size={size} t={t} t0={t0} />
      </div>
      <div style={{position: 'absolute', left: -560 * move, right: 560 * move, top: 680 - 220 * move, textAlign: 'center', opacity: prog(t, t0 + 0.5, 0.5)}}>
        <div style={{fontFamily: F.head, fontSize: 110 - 30 * move, color: '#fff', letterSpacing: 6}}>CONTEXTO</div>
      </div>
      <div style={{position: 'absolute', left: 960 - 190 - 560 * move, top: 830 - 240 * move, opacity: prog(t, tSusc - 0.2, 0.3), transform: `scale(${pop(t, tSusc - 0.2) * (1 + 0.025 * Math.sin(t * 4))})`}}>
        <div style={{width: 380, height: 84, background: K.red, borderRadius: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 34, letterSpacing: 3, color: '#fff', boxShadow: '0 10px 30px rgba(232,66,58,0.45)'}}>SUSCRIBITE</div>
      </div>
      <div style={{position: 'absolute', left: 960 - 380 - 560 * move, top: 945 - 240 * move, width: 760, textAlign: 'center', opacity: prog(t, tComp - 0.2, 0.3), fontFamily: F.body, fontWeight: 700, fontSize: 28, color: K.mute}}>
        Compartilo con alguien que todavía crea en las promesas fáciles
      </div>
      <div style={{position: 'absolute', left: 1010, top: 170, opacity: prog(t, tNos - 0.6, 0.5)}}>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 26, letterSpacing: 6, color: K.mute, marginBottom: 16}}>SEGUÍ MIRANDO</div>
        {[0, 1].map((i) => (
          <div key={i} style={{width: 760, height: 330, marginBottom: 40, borderRadius: 10, border: `3px solid rgba(255,255,255,${0.16 + 0.06 * Math.sin(t * 2 + i)})`, background: 'rgba(255,255,255,0.04)', transform: `translateX(${(1 - prog(t, tNos - 0.5 + i * 0.15, 0.6)) * 80}px)`}} />
        ))}
      </div>
      <div style={{position: 'absolute', left: 50, top: 850, width: 700, textAlign: 'center', opacity: prog(t, tNos, 0.5), fontFamily: F.head, fontSize: 56, color: '#fff'}}>NOS VEMOS EN EL PRÓXIMO VIDEO</div>
      <AbsoluteFill style={{background: '#000', opacity: fadeOut}} />
    </AbsoluteFill>
  );
};
