/* Short vertical (1080×1920) del episodio 10 (El cuadro del nazi) para YouTube Shorts: el timbre, el aviso y el sillón verde;
   el retrato robado en 1940; la comparación, el allanamiento y el tapiz; Ceruti; la primera devolución y el cierre (ver tools/short_ep10.py). */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {F} from '../theme';
import {Grain} from '../components/base';
import {LogoMark} from '../ep04/kit';
import short from '../data/ep10/short.json';
import words from '../data/ep10/words.json';
import wordsX from '../data/ep10/words_short.json';
import {cue as cueMain} from './lib';
import {Big, Count, DateCard, FT, GiltFrame, InkDefs, K, Motes, MuseumLabel, NoirBg, PhotoCard, Stamp, Typed, Vig, YearRoll, between, clamp, easeIn, easeInOut, pop, prog} from './kit10';
import {Cam, PAINT_H, PAINT_POS, PAINT_W, camPath, project} from './three10';
import {ChaletShot, ListingPhone, MarkerCircle, PHOTO_CENTER_DY, PHOTO_W, RoomShot} from './shots10';

const VW = 1080, VH = 1920;
type Part = {id: string; seg: string; from: number; to: number; at: number};
const TL = short as unknown as {fps: number; parts: Part[]; cta: number; total: number};
type Wd = {w: string; s: number; e: number};
const WS = {...(words as Record<string, Wd[]>), ...(wordsX as Record<string, Wd[]>)};
const P = Object.fromEntries(TL.parts.map((p) => [p.id, p])) as Record<string, Part>;
const cue = (seg: string, phrase: string, n = 0) => (seg === 'x01' ? WS.x01.find((w) => w.w.toLowerCase().startsWith(phrase.toLowerCase()))!.s : cueMain(seg, phrase, n));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/* ---------- subtítulos palabra por palabra (con cifras) ---------- */
const NUMS: [string, string][] = [
  ['mil novecientos cuarenta', '1940'], ['doscientos cincuenta mil', '250.000'], ['ochenta', '80'], ['trescientos', '300'], ['veinticinco', '25'], ['dos días', '2 días'],
];
const key = (w: string) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
const mergeNums = (ws: Wd[]) => {
  const out: Wd[] = [];
  for (let i = 0; i < ws.length; ) {
    const hit = NUMS.find(([a]) => {
      const toks = a.split(' ');
      return i + toks.length <= ws.length && toks.every((tk, k) => key(ws[i + k].w) === key(tk));
    });
    if (hit) {
      const n = hit[0].split(' ').length;
      const trail = (ws[i + n - 1].w.match(/[.,:;!?]*$/) || [''])[0];
      const lead = (ws[i].w.match(/^[¿¡]*/) || [''])[0];
      const cap = /^[A-ZÁÉÍÓÚ]/.test(ws[i].w.replace(/^[¿¡]/, '')) ? hit[1].charAt(0).toUpperCase() + hit[1].slice(1) : hit[1];
      out.push({w: lead + cap + trail, s: ws[i].s, e: ws[i + n - 1].e});
      i += n;
    } else out.push(ws[i++]);
  }
  return out;
};
const CHUNKS = (() => {
  const list: Wd[] = [];
  for (const p of TL.parts) for (const w of mergeNums(WS[p.seg])) if (w.s >= p.from - 0.01 && w.e <= p.to + 0.05) list.push({w: w.w, s: p.at + w.s - p.from, e: p.at + w.e - p.from});
  const out: {words: Wd[]; s: number; e: number}[] = [];
  let cur: Wd[] = [];
  list.forEach((w, i) => {
    cur.push(w);
    const txt = cur.map((x) => x.w).join(' ');
    if (cur.length >= 3 || /[.,:?!]$/.test(w.w) || txt.length > 14 || i === list.length - 1) {
      out.push({words: cur, s: cur[0].s, e: cur[cur.length - 1].e});
      cur = [];
    }
  });
  out.forEach((c, i) => (c.e = i < out.length - 1 ? Math.min(out[i + 1].s, c.e + 0.35) : c.e + 0.3));
  return out;
})();
const Captions: React.FC<{T: number; y: number}> = ({T, y}) => {
  const c = CHUNKS.find((x) => T >= x.s - 0.05 && T < x.e);
  if (!c) return null;
  const k = pop(T, c.s - 0.05, 1.4);
  const s = '#0B0907';
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: y, textAlign: 'center', transform: `scale(${0.86 + 0.14 * k})`}}>
      {c.words.map((w, i) => {
        const on = T >= w.s - 0.03 && T < w.e + 0.15;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block', margin: '0 12px', fontFamily: F.head, fontSize: 92, lineHeight: 1.15, textTransform: 'uppercase', color: on ? K.gold : '#fff',
              textShadow: `6px 6px 0 ${s}, -6px -6px 0 ${s}, 6px -6px 0 ${s}, -6px 6px 0 ${s}, 0 6px 0 ${s}, 6px 0 0 ${s}, -6px 0 0 ${s}, 0 -6px 0 ${s}, 0 16px 30px rgba(0,0,0,0.6)`,
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};
const Title: React.FC<{t: number; t0: number; t1?: number; text: string; size?: number; y?: number; hl?: Record<string, string>; color?: string}> = ({t, t0, t1, text, size = 110, y = 300, hl, color}) => (
  <Big t={t} t0={t0} t1={t1} text={text} size={size} x={540} w={1000} y={y} hl={hl} color={color} />
);

/* ---------- cámaras verticales ---------- */
const CHV: Record<string, Cam> = {
  wide: {pos: [2.6, 2.3, 21], look: [0, 2.1, 0], fov: 46},
  door: {pos: [1.4, 1.7, 8.6], look: [1.0, 1.55, 3], fov: 46},
  window: {pos: [-1.3, 1.6, 8.4], look: [-1.6, 1.45, 3], fov: 42},
  sign: {pos: [-2.6, 1.4, 8.6], look: [-3.15, 1.25, 5.15], fov: 42},
  raid: {pos: [1.6, 2.0, 17], look: [0, 1.8, 2], fov: 50},
};
const RV_WIDE: Cam = {pos: [0, 1.55, 6.6], look: [0, 1.55, 0], fov: 62};
const RV_SOFA: Cam = {pos: [0.6, 1.3, 4.6], look: [0, 1.35, 0.3], fov: 60};
const RV_PAINT: Cam = {pos: [0, 1.92, 2.6], look: [0, 1.92, 0], fov: 50};

/* ---------- 1 · el gancho: timbre, aviso, sillón verde ---------- */
const Gancho: React.FC<{s: number}> = ({s}) => {
  const c = (p: string) => cue('s01', p);
  const tTimbre = c('timbre'), tNadie = c('Nadie'), tAlguien = c('alguien'), tJardin = c('En el jardín'), tNoche = c('Esa noche,'), tPasa = c('pasa'), tHasta = c('Hasta que'), tLiving = c('al living,'), tSillon = c('sillón'), tFrena = c('lo frena:'), tEse = c('¿ese');
  const t0 = P.gancho.from;
  const chCam = camPath(s, [[t0 - 1, CHV.wide], [tTimbre - 1.2, CHV.door], [tNadie + 0.4, CHV.window], [tJardin - 0.1, CHV.sign]], 2.0);
  const swipe = (a: number) => easeInOut(clamp((s - a) / 0.4));
  const idx = swipe(tPasa + 0.25) + swipe(tPasa + 0.95) + swipe(tHasta + 0.45);
  const zoom = easeInOut(clamp((s - (tLiving + 0.15)) / 1.0));
  const phBase = 1.25;
  const phScale = mix(phBase, VW / PHOTO_W, zoom);
  const phY = mix(740, VH / 2 - PHOTO_CENTER_DY * (VW / PHOTO_W), zoom);
  const roomCam = camPath(s, [[tLiving + 0.9, RV_WIDE], [tSillon - 0.2, RV_SOFA], [tFrena - 0.2, RV_PAINT]], 1.6);
  const [px, py] = project(roomCam, PAINT_POS, VW, VH);
  const [, pTop] = project(roomCam, [0, PAINT_POS[1] + PAINT_H / 2 + 0.1, 0], VW, VH);
  const [pR] = project(roomCam, [PAINT_W / 2 + 0.1, PAINT_POS[1], 0], VW, VH);
  return (
    <AbsoluteFill>
      {s < tNoche + 0.3 ? (
        <AbsoluteFill style={{opacity: 1 - prog(s, tNoche, 0.3)}}>
          <ChaletShot t={s} cam={chCam} s={{t: s, mover: clamp((s - (tAlguien - 0.5)) / 1.9), lights: 1, porch: 1}} w={VW} h={VH} />
        </AbsoluteFill>
      ) : null}
      {between(s, tNoche - 0.2, tLiving + 1.3) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(s, tNoche - 0.2, 0.4), 1 - prog(s, tLiving + 1.0, 0.3))}}>
          <NoirBg t={s} glow="rgba(125,187,230,0.22)" x={50} y={40} />
          <ListingPhone
            t={s} idx={idx} x={540} y={phY} scale={phScale} tilt={0.6 * (1 - zoom)} o={prog(s, tNoche, 0.4)}
            ext={<ChaletShot t={s} cam={{pos: [3.2, 1.9, 13], look: [0, 1.9, 0], fov: 34}} s={{t: s, lights: 1}} w={PHOTO_W} h={322} />}
            living={idx > 2.2 ? <RoomShot cam={{pos: [0, 1.55, 6.4], look: [0, 1.45, 0], fov: 40}} s={{t: s, painting: 1, tapestry: 0}} w={PHOTO_W} h={322} /> : null}
          />
        </AbsoluteFill>
      ) : null}
      {s > tLiving + 0.9 ? (
        <AbsoluteFill style={{opacity: prog(s, tLiving + 0.9, 0.15)}}>
          <RoomShot cam={roomCam} s={{t: s, painting: 1, tapestry: 0}} w={VW} h={VH} />
          <MarkerCircle t={s} t0={tEse - 0.1} x={px} y={py} rx={(pR - px) * 1.3} ry={(py - pTop) * 1.18} />
          {s > tEse ? (
            <div style={{position: 'absolute', left: 0, right: 0, top: pTop - 150 - (py - pTop) * 0.2, textAlign: 'center', fontFamily: F.hand, fontSize: 84, color: K.red, transform: 'rotate(-4deg)', opacity: prog(s, tEse + 0.15, 0.3), textShadow: '0 3px 10px rgba(0,0,0,0.7)'}}>
              ¿ese no es el cuadro?
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}
      {s < t0 + 4.6 ? (
        <AbsoluteFill style={{opacity: 1 - prog(s, t0 + 4.2, 0.4)}}>
          <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(11,9,7,0.85) 0%, rgba(11,9,7,0) 32%)'}} />
          <Title t={s} t0={t0 + 0.05} text="UN CUADRO ROBADO | POR LOS NAZIS | APARECIÓ EN UN AVISO" size={96} y={330} hl={{NAZIS: K.red, AVISO: K.gold}} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- 2 · el retrato robado en 1940 ---------- */
const Robado: React.FC<{s: number}> = ({s}) => {
  const c = (p: string) => cue('s01', p);
  const tArriba = c('Arriba'), tRobaron = c('robaron'), tYque = c('y que');
  return (
    <AbsoluteFill>
      <NoirBg t={s} glow="rgba(214,175,92,0.22)" y={40} />
      <Motes t={s} n={34} o={0.6} />
      <div style={{position: 'absolute', left: 540, top: 700, transform: `translate(-50%,-50%) scale(${0.95 + 0.04 * clamp((s - tArriba) / 8)})`}}>
        <GiltFrame src="ep10/img/cuadro.jpg" w={560} h={756} />
      </div>
      <Stamp t={s} t0={tRobaron} text="ROBADO POR LOS NAZIS" sub="ÁMSTERDAM · 1940" x={540} y={1150} rot={-6} size={74} bg="rgba(11,9,7,0.7)" />
      {s > tYque - 0.3 ? <YearRoll t={s} t0={tYque} from={1940} to={2025} dur={1.9} x={540} y={170} size={170} color={K.cream} /> : null}
    </AbsoluteFill>
  );
};

/* ---------- 3 · la comparación, el allanamiento y el tapiz ---------- */
const Match: React.FC<{s: number}> = ({s}) => {
  const c = (p: string) => cue('s07', p);
  const tCuando = c('Cuando vieron'), tComp = c('compararon'), tFotos = c('fotos de archivo'), tMismo = c('Era el mismo.'), tPubl = c('Lo publicaron'), tDos = c('Dos días'), tAllan = c('allanó'), tYel = c('Y el cuadro'), tTapiz = c('tapiz');
  const scan = ((s - tComp) / 1.6) % 1;
  return (
    <AbsoluteFill>
      {s < tPubl + 0.4 ? (
        <AbsoluteFill style={{opacity: 1 - prog(s, tPubl, 0.4)}}>
          <NoirBg t={s} />
          <div style={{position: 'absolute', left: 0, top: 0, width: VW, height: 760, overflow: 'hidden'}}>
            <RoomShot cam={{pos: [0, 1.92, 2.0], look: [0, 1.92, 0], fov: 40}} s={{t: s, painting: 1, tapestry: 0}} w={VW} h={760} />
          </div>
          <div style={{position: 'absolute', left: 0, top: 758, width: VW, height: 4, background: K.cream, opacity: 0.6}} />
          <PhotoCard t={s} t0={tFotos - 0.4} src="ep10/img/cuadro_rce_crop.jpg" x={540} y={1060} w={400} h={538} rot={1.5} tape={false} from="down" />
          <div style={{position: 'absolute', left: 60, top: 120, fontFamily: F.head, fontSize: 48, color: K.blue, textShadow: '0 3px 10px #000', opacity: prog(s, tCuando, 0.3)}}>EL AVISO · 2025</div>
          <div style={{position: 'absolute', right: 60, top: 1340, fontFamily: F.head, fontSize: 48, color: K.gold, textShadow: '0 3px 10px #000', opacity: prog(s, tFotos - 0.2, 0.3)}}>ARCHIVO · 1940</div>
          {between(s, tComp, tMismo) ? <div style={{position: 'absolute', left: 0, width: VW, top: 120 + scan * 1200, height: 4, background: K.blue, boxShadow: `0 0 18px ${K.blue}`, opacity: 0.85}} /> : null}
          <Stamp t={s} t0={tMismo} text="ES EL MISMO" x={540} y={760} rot={-8} size={110} color={K.red} bg="rgba(11,9,7,0.6)" />
        </AbsoluteFill>
      ) : null}
      {between(s, tPubl - 0.2, tDos + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(s, tPubl - 0.2, 0.3), 1 - prog(s, tDos, 0.4))}}>
          <NoirBg t={s} glow="rgba(125,187,230,0.16)" />
          <DateCard t={s} t0={tPubl} d={25} m={8} y={2025} x={540} yPos={560} label="SE PUBLICA LA INVESTIGACIÓN" color={K.blue} size={1.3} />
        </AbsoluteFill>
      ) : null}
      {between(s, tDos - 0.2, tYel + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(s, tDos - 0.2, 0.3), 1 - prog(s, tYel, 0.4))}}>
          <ChaletShot t={s} cam={CHV.raid} s={{t: s, lights: 0.6, police: prog(s, tAllan - 0.6, 0.3), sign: 1}} w={VW} h={VH} />
          <Title t={s} t0={tAllan} text="ALLANAMIENTO" size={140} y={330} />
        </AbsoluteFill>
      ) : null}
      {s > tYel - 0.2 ? (
        <AbsoluteFill style={{opacity: prog(s, tYel - 0.2, 0.3)}}>
          <RoomShot cam={{pos: [0, 1.75, 4.2], look: [0, 1.75, 0], fov: 50}} s={{t: s, painting: 0, tapestry: clamp((s - tTapiz + 0.6) / 1.0), ghost: 1 - prog(s, tTapiz - 0.4, 0.8), lamp: 0.8}} w={VW} h={VH} />
          <Title t={s} t0={c('no estaba.') - 0.3} text="EL CUADRO YA NO ESTABA" size={110} y={300} hl={{NO: K.red, ESTABA: K.red}} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- 4 · auténtico: Giacomo Ceruti ---------- */
const Autentico: React.FC<{s: number}> = ({s}) => {
  const c = (p: string) => cue('s08', p);
  const tAut = c('Era auténtico:'), tGiac = c('Giacomo'), tTresc = c('trescientos'), tVal = c('valuado'), tDosc = c('doscientos');
  return (
    <AbsoluteFill>
      <NoirBg t={s} glow="rgba(214,175,92,0.24)" y={34} />
      <div style={{position: 'absolute', left: 540, top: 520, transform: 'translate(-50%,-50%) scale(0.78)'}}>
        <GiltFrame src="ep10/img/cuadro.jpg" w={560} h={756} />
      </div>
      <Stamp t={s} t0={tAut + 0.1} text="AUTÉNTICO" x={780} y={800} rot={-8} size={84} color={K.red} bg="rgba(11,9,7,0.7)" />
      <MuseumLabel t={s} t0={tGiac - 0.3} x={140} y={930} w={800} lines={[
        {text: 'Giacomo Ceruti (1698 – 1767)', t0: tGiac - 0.2, style: {fontWeight: 800, fontSize: 40}},
        {text: 'Retrato de una dama · siglo XVIII', t0: tTresc - 0.4, style: {fontStyle: 'italic'}},
      ]} />
      {s > tVal - 0.2 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1130, textAlign: 'center', opacity: prog(s, tVal - 0.2, 0.3)}}>
          <div style={{fontFamily: F.head, fontSize: 150, color: K.gold, lineHeight: 1}}>
            € <Count t={s} t0={tDosc - 0.2} dur={1.2} from={0} to={250000} />
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- 5 · la primera vez ---------- */
const Primera: React.FC<{s: number}> = ({s}) => {
  const c = (p: string) => cue('s08', p);
  const tPrim = c('Es la primera');
  return (
    <AbsoluteFill>
      <NoirBg t={s} glow="rgba(214,175,92,0.3)" y={36} />
      <Motes t={s} n={40} o={0.8} />
      <div style={{position: 'absolute', left: 540, top: 560, transform: 'translate(-50%,-50%) scale(0.62)'}}>
        <GiltFrame src="ep10/img/cuadro.jpg" w={560} h={756} />
      </div>
      <Title t={s} t0={tPrim} text="LA PRIMERA VEZ" size={150} y={1050} color={K.gold} />
    </AbsoluteFill>
  );
};

/* ---------- 6 · cierre: tarjeta del video completo y flecha al enlace ---------- */
const Cta: React.FC<{T: number; t0: number}> = ({T, t0}) => {
  const t = T - t0;
  const a = pop(t, 0.1, 0.9);
  const bob = Math.sin(t * 6) * 16;
  const drift = 1 + 0.05 * clamp(t / 12);
  const sweep = ((t * 0.45) % 1.6) - 0.3; // brillo que cruza la tarjeta
  return (
    <AbsoluteFill>
      <NoirBg t={t} glow="rgba(214,175,92,0.18)" y={30} />
      <Motes t={t} n={40} o={0.7} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', opacity: prog(t, 0, 0.4)}}>
        <div style={{fontFamily: F.head, fontSize: 80, color: K.cream, lineHeight: 1.05}}>¿CÓMO LLEGÓ HASTA ACÁ?</div>
        <div style={{fontFamily: F.head, fontSize: 64, color: K.gold, lineHeight: 1.05, marginTop: 10}}>¿Y DÓNDE ESTÁ EL SEGUNDO CUADRO?</div>
      </div>
      <div style={{position: 'absolute', left: 60, top: 430, width: 960, transform: `scale(${Math.max(0, a) * drift}) rotate(${0.6 * Math.sin(t * 0.8)}deg)`, transformOrigin: '50% 50%'}}>
        <div style={{position: 'relative', width: 960, height: 540, borderRadius: 18, overflow: 'hidden', boxShadow: '0 40px 90px rgba(0,0,0,0.7)', border: '4px solid rgba(255,255,255,0.85)', background: '#14100C'}}>
          <div style={{position: 'absolute', left: 50, top: 40, transform: 'scale(0.62)', transformOrigin: '0 0'}}>
            <GiltFrame src="ep10/img/cuadro.jpg" w={430} h={580} />
          </div>
          <div style={{position: 'absolute', left: 420, right: 30, top: 150, fontFamily: F.head, fontSize: 104, lineHeight: 0.95, color: K.cream}}>
            EL CUADRO
            <div style={{color: K.red}}>DEL NAZI</div>
          </div>
          <div style={{position: 'absolute', right: 18, bottom: 16, background: 'rgba(0,0,0,0.8)', color: '#fff', fontFamily: F.body, fontWeight: 700, fontSize: 30, padding: '4px 12px', borderRadius: 6}}>6:26</div>
          <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep * 100}%`, width: 160, background: 'linear-gradient(90deg, rgba(255,240,200,0) 0%, rgba(255,240,200,0.22) 50%, rgba(255,240,200,0) 100%)', transform: 'skewX(-18deg)'}} />
          <div style={{position: 'absolute', right: 24, top: 22, width: 70, height: 70}}>
            <LogoMark size={70} t={t} t0={0.3} />
          </div>
        </div>
        <div style={{marginTop: 22, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 34, letterSpacing: 4, color: K.cream}}>VIDEO COMPLETO · CONTEXTO</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', opacity: prog(t, cue('x01', 'Tocá') - 0.2, 0.3)}}>
        <div style={{display: 'inline-block', background: K.gold, color: K.bg0, fontFamily: F.head, fontSize: 70, padding: '14px 40px 6px', borderRadius: 14}}>TOCÁ EL ENLACE DE ABAJO</div>
        <div style={{fontFamily: F.head, fontSize: 200, color: K.gold, lineHeight: 1, transform: `translateY(${bob}px)`, marginTop: 10, textShadow: '0 10px 30px rgba(0,0,0,0.6)'}}>↓</div>
      </div>
    </AbsoluteFill>
  );
};

export const ShortCuadro: React.FC = () => {
  const frame = useCurrentFrame();
  const T = frame / TL.fps;
  const segT = (id: string) => T - P[id].at + P[id].from;
  const nextAt = (i: number) => (i + 1 < TL.parts.length ? TL.parts[i + 1].at : TL.total + 1);
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      <InkDefs />
      {TL.parts.map((p, i) => {
        const a = p.at - 0.25, b = nextAt(i) - 0.1;
        if (T < a || T >= b) return null;
        const s = segT(p.id);
        return (
          <AbsoluteFill key={p.id} style={{opacity: i ? prog(T, a, 0.3) : 1}}>
            {p.id === 'gancho' ? <Gancho s={s} /> : p.id === 'robado' ? <Robado s={s} /> : p.id === 'match' ? <Match s={s} /> : p.id === 'autentico' ? <Autentico s={s} /> : p.id === 'primera' ? <Primera s={s} /> : <Cta T={T} t0={p.at} />}
          </AbsoluteFill>
        );
      })}
      <Vig k={0.4} />
      {T < TL.cta - 0.1 ? <Captions T={T} y={1440} /> : null}
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};
export const SHORT10_TOTAL = TL.total;
