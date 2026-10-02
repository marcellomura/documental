/* Short vertical (1080×1920) del episodio 9 (Vaca Muerta) para YouTube Shorts: ¿por qué sube la nafta si producimos récord?,
   el precio del mundo y Ormuz, la nafta y los impuestos, Venezuela y el cierre que manda al video completo (ver tools/short_ep09.py). */
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {F} from '../theme';
import {Grain} from '../components/base';
import {LogoMark} from '../ep04/kit';
import short from '../data/ep09/short.json';
import words from '../data/ep09/words.json';
import wordsX from '../data/ep09/words_short.json';
import {cue as cueMain} from './lib';
import {BarrelIcon, Big, Chip, Count, FullPhoto, FullVideo, K, PumpDisplay, Vig, clamp, easeIn, easeInOut, easeOut, pop, prog} from './kit9';
import {Barrels, Cam, Globe3D, LiterGlass, Stage, globePoint, globeRot, project, towerItems} from './three9';

const VW = 1080, VH = 1920;
type Part = {id: string; seg: string; from: number; to: number; at: number};
const TL = short as unknown as {fps: number; parts: Part[]; cta: number; total: number};
const WS = {...(words as Record<string, {w: string; s: number; e: number}[]>), ...(wordsX as Record<string, {w: string; s: number; e: number}[]>)};
const P = Object.fromEntries(TL.parts.map((p) => [p.id, p])) as Record<string, Part>;
const cue = (seg: string, phrase: string, n = 0) => (seg === 'x01' ? WS.x01.find((w) => w.w.toLowerCase().startsWith(phrase.toLowerCase()))!.s : cueMain(seg, phrase, n));
const between = (t: number, a: number, b: number) => t >= a && t < b;
const fadeIO = (t: number, a: number, b: number, d = 0.3) => Math.min(prog(t, a, d), 1 - prog(t, b - d, d, easeIn));

/* ---------- subtítulos palabra por palabra (con cifras en vez de números deletreados) ---------- */
const NUMS: [string, string][] = [
  ['novecientos treinta y seis mil ochocientos', '936.800'], ['un millón cien mil', '1.100.000'], ['ciento veintiséis', '126'], ['mil setecientos', '1.700'],
  ['dos mil.', '2.000.'], ['doscientos mil', '200.000'], ['seis millones', '6 millones'], ['tres millones', '3 millones'], ['siete veces', '7 veces'],
  ['una de cada cinco', '1 de cada 5'], ['cien dólares', '100 dólares'],
];
const key = (w: string) => w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
const mergeNums = (ws: {w: string; s: number; e: number}[]) => {
  const out: typeof ws = [];
  for (let i = 0; i < ws.length; ) {
    const hit = NUMS.find(([a]) => {
      const toks = a.split(' ');
      return i + toks.length <= ws.length && toks.every((tk, k) => key(ws[i + k].w) === key(tk));
    });
    if (hit) {
      const n = hit[0].split(' ').length;
      const trail = (ws[i + n - 1].w.match(/[.,:;!?]*$/) || [''])[0];
      out.push({w: hit[1] + trail, s: ws[i].s, e: ws[i + n - 1].e});
      i += n;
    } else out.push(ws[i++]);
  }
  return out;
};
const CHUNKS = (() => {
  const list: {w: string; s: number; e: number}[] = [];
  for (const p of TL.parts) for (const w of mergeNums(WS[p.seg])) if (w.s >= p.from - 0.01 && w.e <= p.to + 0.05) list.push({w: w.w, s: p.at + w.s - p.from, e: p.at + w.e - p.from});
  const out: {words: typeof list; s: number; e: number}[] = [];
  let cur: typeof list = [];
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
  const s = '#06080B';
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: y, textAlign: 'center', transform: `scale(${0.86 + 0.14 * k})`}}>
      {c.words.map((w, i) => {
        const on = T >= w.s - 0.03 && T < w.e + 0.15;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block', margin: '0 12px', fontFamily: F.head, fontSize: 92, lineHeight: 1.15, textTransform: 'uppercase', color: on ? K.oil : '#fff',
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

const Title: React.FC<{t: number; t0: number; t1?: number; text: string; size?: number; y?: number; hl?: Record<string, string>; color?: string}> = ({t, t0, t1, text, size = 120, y = 330, hl, color}) => (
  <Big t={t} t0={t0} t1={t1} text={text} size={size} x={540} w={980} y={y} hl={hl} color={color} />
);
const Floor: React.FC = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={[120, 120]} />
    <shadowMaterial transparent opacity={0.45} />
  </mesh>
);

/* ---------- 1 · la pregunta ---------- */
const Pregunta: React.FC<{s: number}> = ({s}) => {
  const c = (p: string) => cue('s07', p);
  return (
    <AbsoluteFill>
      <FullPhoto src="ep09/ypf_chacabuco.jpg" t={s} t0={c('Si producimos') - 0.3} zoom={[1.15, 1.25]} focus="45% 50%" dim={0.9} fade={0.01} />
      <PumpDisplay value={1700 + 379 * easeOut(clamp((s - c('¿por qué')) / 1.0))} x={540} y={760} w={900} flash={s > c('nafta?') ? 0.6 : 0} />
      <Title t={s} t0={c('Si producimos')} text="PRODUCIMOS PETRÓLEO RÉCORD…" size={96} y={300} />
      <Title t={s} t0={c('¿por qué')} text="¿Y LA NAFTA SUBE?" size={130} y={470} hl={{NAFTA: K.red, SUBE: K.red}} />
    </AbsoluteFill>
  );
};

/* ---------- 2 · el récord ---------- */
const Record: React.FC<{s: number}> = ({s}) => {
  const c = (p: string) => cue('s01', p);
  return (
    <AbsoluteFill>
      <FullVideo src="ep09/vid/bombeo.mp4" t={s} t0={c('En agosto,') - 0.3} zoom={[1.0, 1.08]} focus="35% 50%" dim={1.0} fade={0.01} />
      <AbsoluteFill style={{background: 'rgba(6,8,11,0.35)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center'}}>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 34, letterSpacing: 8, color: K.mute}}>ARGENTINA · AGOSTO 2026</div>
        <div style={{fontFamily: F.head, fontSize: 210, color: K.cream, lineHeight: 1, marginTop: 10}}>
          <Count t={s} t0={c('novecientos')} dur={2.4} from={600000} to={936800} />
        </div>
        <div style={{fontFamily: F.head, fontSize: 64, color: K.oil}}>BARRILES POR DÍA</div>
      </div>
      {s > c('Récord') ? (
        <div style={{position: 'absolute', left: 540, top: 850, transform: `translate(-50%,-50%) rotate(-7deg) scale(${2.2 - 1.2 * Math.min(1, pop(s, c('Récord'), 1.4))})`}}>
          <div style={{border: `8px solid ${K.red}`, color: K.red, fontFamily: F.head, fontSize: 92, padding: '6px 30px 0', borderRadius: 8, background: 'rgba(6,8,11,0.6)'}}>RÉCORD ABSOLUTO</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- 3 · por qué: precio del mundo, Ormuz, US$ 126, la nafta y los impuestos ---------- */
const GULF: [number, number] = [56.3, 26.6];
const Porque: React.FC<{s: number}> = ({s}) => {
  const c = (p: string) => cue('s07', p);
  const tPq = c('Porque'), tEx = c('lo exporta.'), tYd = c('Y desde que'), tCerro = c('cerró'), tUna = c('una de cada'), t126 = c('ciento veintiséis'), tAsi = c('Así,'), tDos = c('más de dos mil.'), tTer = c('Y más de un tercio');
  const mv = easeInOut(clamp((s - tEx + 0.2) / 0.9));
  const gk = easeInOut(clamp((s - tCerro - 0.3) / 2.4));
  const rot = globeRot(GULF[0] - 18 * (1 - gk), GULF[1] - 6 * (1 - gk));
  const gcam: Cam = {pos: [0, 0, 21 - 3 * gk], look: [0, 0, 0], fov: 32};
  const GP: [number, number, number] = [0, -0.9, 0];
  const [ox, oy] = project(gcam, globePoint(GULF[0], GULF[1], 3, rot, GP), VW, VH);
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {s < tYd + 0.3 ? (
        <AbsoluteFill style={{opacity: 1 - prog(s, tYd, 0.3)}}>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(242,169,59,0.16) 0%, #06080B 70%)'}} />
          <Title t={s} t0={tPq} text="SE VENDE AL | PRECIO DEL MUNDO" size={104} y={260} hl={{MUNDO: K.oil}} />
          {[{y: 560, title: 'AFUERA', price: 'US$ 100', col: K.oil, at: c('cien')}, {y: 1000, title: 'ACÁ', price: '¿MÁS BARATO?', col: K.celeste, at: c('ninguna')}].map((b) => (
            <div key={b.title} style={{position: 'absolute', left: 540, top: b.y, transform: 'translate(-50%,-50%)', width: 760, height: 300, borderRadius: 18, border: `4px solid ${b.col}`, background: 'rgba(6,8,11,0.6)', opacity: prog(s, tPq + 0.4, 0.4)}}>
              <div style={{fontFamily: F.head, fontSize: 72, color: b.col, textAlign: 'center', marginTop: 20}}>{b.title}</div>
              <div style={{fontFamily: F.head, fontSize: 84, color: K.cream, textAlign: 'center', marginTop: 40, opacity: prog(s, b.at, 0.4)}}>{b.price}</div>
            </div>
          ))}
          <div style={{position: 'absolute', left: 1000, top: 1000 - 440 * mv, transform: 'translate(-50%,-50%)'}}>
            <BarrelIcon size={150} color={K.oil} />
          </div>
          <Chip t={s} t0={tEx} text="LO EXPORTA" x={540} y={760} color={K.oil} size={60} />
        </AbsoluteFill>
      ) : null}
      {between(s, tYd - 0.2, tCerro + 1.2) ? (
        <AbsoluteFill style={{opacity: fadeIO(s, tYd - 0.2, tCerro + 1.2)}}>
          <FullVideo src="ep09/vid/bloqueo.mp4" t={s} t0={tYd - 0.2} from={9} zoom={[1.0, 1.06]} dim={0.4} bw fade={0.01} />
          <Chip t={s} t0={c('Irán')} text="IRÁN CIERRA ORMUZ" x={540} y={420} color={K.red} size={66} />
        </AbsoluteFill>
      ) : null}
      {between(s, tCerro + 0.9, tAsi + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(s, tCerro + 0.9, tAsi + 0.3)}}>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(95,198,232,0.14) 0%, #06080B 70%)'}} />
          <Stage cam={gcam} w={VW} h={VH} shadow={6} key0={[6, 4, 10]} keyI={2.0} fill={0.9} exposure={1.1}>
            <Globe3D r={3} rot={rot} pos={GP} t={s} countries={[{a3: 'IRN', color: '#E5383B', o: prog(s, tCerro + 1, 0.8)}]} />
          </Stage>
          <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0}}>
            {[0, 1, 2].map((i) => {
              const ph = (s * 0.9 + i / 3) % 1;
              return <circle key={i} cx={ox} cy={oy} r={20 + ph * 110} fill="none" stroke={K.red} strokeWidth={6} opacity={(1 - ph) * prog(s, tCerro + 1.4, 0.4)} />;
            })}
          </svg>
          <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', opacity: prog(s, tUna - 0.2, 0.3)}}>
            <div style={{display: 'flex', gap: 22, justifyContent: 'center'}}>
              {[0, 1, 2, 3, 4].map((i) => (
                <svg key={i} width={84} height={120} viewBox="0 0 70 100" style={{transform: `scale(${Math.min(1, pop(s, tUna + i * 0.1))})`}}>
                  <path d="M35 4 C 50 34 64 50 64 66 A 29 29 0 0 1 6 66 C 6 50 20 34 35 4 Z" fill={i === 4 && s > tUna + 0.7 ? K.red : '#2A2420'} stroke={i === 4 && s > tUna + 0.7 ? K.red : K.oil} strokeWidth={4} />
                </svg>
              ))}
            </div>
            <div style={{fontFamily: F.head, fontSize: 64, color: K.cream, marginTop: 10}}>1 DE CADA 5 GOTAS DEL MUNDO</div>
          </div>
          {s > t126 - 0.4 ? (
            <div style={{position: 'absolute', left: 0, right: 0, top: 1040, textAlign: 'center', opacity: prog(s, t126 - 0.4, 0.3)}}>
              <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 32, letterSpacing: 6, color: K.mute}}>BARRIL BRENT · MÁXIMO 2026</div>
              <div style={{fontFamily: F.head, fontSize: 200, color: K.red, lineHeight: 1}}>
                US$ <Count t={s} t0={t126 - 0.3} dur={1.0} from={70} to={126} />
              </div>
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}
      {between(s, tAsi - 0.2, tTer + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(s, tAsi - 0.2, tTer + 0.3)}}>
          <FullPhoto src="ep09/ypf_caseros.jpg" t={s} t0={tAsi - 0.2} zoom={[1.2, 1.28]} focus="55% 50%" dim={1.2} fade={0.01} />
          <PumpDisplay value={s < c('pasó de') ? 1700 : 1700 + 379 * easeOut(clamp((s - tDos + 0.3) / 1.0))} x={540} y={640} w={940} flash={s > tDos ? 0.6 : 0} />
          <Title t={s} t0={c('pasó de')} text="+20% DESDE LA GUERRA" size={100} y={330} hl={{'+20%': K.red}} />
        </AbsoluteFill>
      ) : null}
      {s > tTer - 0.2 ? (
        <AbsoluteFill style={{opacity: prog(s, tTer - 0.2, 0.3)}}>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(242,169,59,0.16) 0%, #06080B 70%)'}} />
          <Stage cam={{pos: [3.4, 3.6, 16], look: [0, 0.6, 0], fov: 34}} w={VW} h={VH} shadow={8} key0={[4, 10, 6]} keyI={2.0}>
            <LiterGlass fill={easeOut(clamp((s - tTer + 0.1) / 1.0))} tax={easeInOut(clamp((s - c('tercio') - 0.1) / 0.9))} t={s} pos={[0, -0.6, 0]} />
            <Floor />
          </Stage>
          <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center'}}>
            <div style={{fontFamily: F.head, fontSize: 220, color: K.red, lineHeight: 1, opacity: prog(s, c('tercio'), 0.4)}}>36%</div>
            <div style={{fontFamily: F.head, fontSize: 80, color: K.cream, opacity: prog(s, c('impuestos.') - 0.2, 0.4)}}>SON IMPUESTOS</div>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- 4 · Venezuela ---------- */
const Venezuela: React.FC<{s: number}> = ({s}) => {
  const c = (p: string) => cue('s08', p);
  const tVen = c('Venezuela.'), tUn = c('un millón'), tLl = c('Venezuela llegó'), tTres = c('tres millones.'), tTuvo = c('Tuvo');
  const XA = -1.5, XV = 1.5;
  const arg = towerItems(9, [XA, 0, 0], clamp((s - c('Pero hay otro') - 0.3) / 1.0), K.celeste, 3, 2, 1);
  const ven = towerItems(11, [XV, 0, 0], clamp((s - tUn + 0.3) / 1.0), K.ven, 3, 2, 3);
  const ghost = towerItems(32, [XV, 0, 0], clamp((s - tLl) / 1.4), K.red, 3, 2, 4);
  const k = easeInOut(clamp((s - tLl + 0.2) / 1.6));
  const cam: Cam = {pos: [0, 3.6 + 4 * k, 17 + 9 * k], look: [0, 0.4 + 1.6 * k, 0], fov: 40};
  const top = (x: number, n: number) => project(cam, [x, Math.ceil(n / 6) * 1.22 + 0.4, 0.9], VW, VH);
  const [ax, ay] = top(XA, 9), [vx, vy] = top(XV, 11), [gx, gy] = top(XV, 32);
  const tag = (x: number, y: number, a: string, b: string, col: string, o: number) =>
    o <= 0.01 ? null : (
      <div style={{position: 'absolute', left: x, top: y - 20, transform: 'translate(-50%,-100%)', opacity: o, textAlign: 'center', background: 'rgba(6,8,11,0.85)', border: `3px solid ${col}`, borderRadius: 10, padding: '8px 18px 4px'}}>
        <div style={{fontFamily: F.head, fontSize: 46, color: K.cream, whiteSpace: 'nowrap'}}>{a}</div>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 24, letterSpacing: 2, color: K.mute, whiteSpace: 'nowrap'}}>{b}</div>
      </div>
    );
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {s < tTuvo + 0.3 ? (
        <AbsoluteFill style={{opacity: 1 - prog(s, tTuvo, 0.3)}}>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 60%, rgba(242,169,59,0.14) 0%, #06080B 70%)'}} />
          <Stage cam={cam} w={VW} h={VH} shadow={18} key0={[8, 24, 14]} keyI={2.1} target={[0, 3, 0]}>
            <Barrels items={[...arg, ...ven]} max={24} />
            {s > tLl - 0.1 ? <Barrels items={ghost.slice(12)} max={24} ghost /> : null}
            <Floor />
          </Stage>
          {tag(ax, ay, 'ARGENTINA', '0,94 MILLONES/DÍA', K.celeste, prog(s, c('Pero hay otro') + 0.6, 0.4))}
          {tag(vx, vy, 'VENEZUELA', '1,1 MILLONES/DÍA', K.ven, prog(s, tUn + 0.6, 0.4) * (1 - prog(s, tLl, 0.3)))}
          {tag(gx, gy, 'SU PICO', 'MÁS DE 3 MILLONES/DÍA', K.red, prog(s, tTres - 0.4, 0.4))}
          <Title t={s} t0={tVen - 0.3} t1={tLl} text="¿VENEZUELA?" size={150} y={260} hl={{'¿VENEZUELA?': K.ven}} />
        </AbsoluteFill>
      ) : null}
      {s > tTuvo - 0.2 ? (
        <AbsoluteFill style={{opacity: prog(s, tTuvo - 0.2, 0.3)}}>
          <FullPhoto src="ep09/colas_vzla.png" t={s} t0={tTuvo - 0.2} zoom={[1.15, 1.22]} dim={0.5} bw fade={0.01} />
          <Title t={s} t0={tTuvo} text="TUVO EL TESORO…" size={120} y={360} />
          <Title t={s} t0={c('lo perdió.') - 0.1} text="Y LO PERDIÓ" size={160} y={540} hl={{PERDIÓ: K.red}} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- 5 · cierre: tarjeta del video completo y flecha al enlace ---------- */
const Cta: React.FC<{T: number; t0: number}> = ({T, t0}) => {
  const t = T - t0;
  const a = pop(t, 0.1, 0.9);
  const bob = Math.sin(t * 6) * 16;
  return (
    <AbsoluteFill>
      <FullPhoto src="ep09/rig_noche.jpg" t={t} t0={-0.2} zoom={[1.3, 1.4]} focus="30% 50%" dim={1.1} fade={0.01} />
      <AbsoluteFill style={{background: 'rgba(6,8,11,0.5)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 160, textAlign: 'center', opacity: prog(t, 0, 0.4)}}>
        <div style={{fontFamily: F.head, fontSize: 92, color: K.cream, lineHeight: 1.02}}>¿NORUEGA</div>
        <div style={{fontFamily: F.head, fontSize: 92, color: K.oil, lineHeight: 1.02}}>O VENEZUELA?</div>
      </div>
      <div style={{position: 'absolute', left: 60, top: 440, width: 960, transform: `scale(${Math.max(0, a)})`, transformOrigin: '50% 50%'}}>
        <div style={{position: 'relative', width: 960, height: 540, borderRadius: 18, overflow: 'hidden', boxShadow: '0 40px 90px rgba(0,0,0,0.7)', border: '4px solid rgba(255,255,255,0.85)'}}>
          <Img src={staticFile('ep09/rig_noche.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5)'}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: F.head, fontSize: 124, lineHeight: 0.95, color: K.cream}}>
            VACA MUERTA
            <div style={{fontSize: 64, marginTop: 14}}>EL TESORO <span style={{color: K.red}}>Y LA TRAMPA</span></div>
          </div>
          <div style={{position: 'absolute', right: 18, bottom: 16, background: 'rgba(0,0,0,0.8)', color: '#fff', fontFamily: F.body, fontWeight: 700, fontSize: 30, padding: '4px 12px', borderRadius: 6}}>6:00</div>
          <div style={{position: 'absolute', left: 24, top: 22, width: 70, height: 70}}>
            <LogoMark size={70} t={t} t0={0.3} />
          </div>
        </div>
        <div style={{marginTop: 22, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 34, letterSpacing: 4, color: K.cream}}>VIDEO COMPLETO · CONTEXTO</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', opacity: prog(t, cue('x01', 'Tocá') - 0.2, 0.3)}}>
        <div style={{display: 'inline-block', background: K.oil, color: K.bg0, fontFamily: F.head, fontSize: 70, padding: '14px 40px 6px', borderRadius: 14}}>TOCÁ EL ENLACE DE ABAJO</div>
        <div style={{fontFamily: F.head, fontSize: 200, color: K.oil, lineHeight: 1, transform: `translateY(${bob}px)`, marginTop: 10, textShadow: '0 10px 30px rgba(0,0,0,0.6)'}}>↓</div>
      </div>
    </AbsoluteFill>
  );
};

export const ShortVaca: React.FC = () => {
  const frame = useCurrentFrame();
  const T = frame / TL.fps;
  const segT = (id: string) => T - P[id].at + P[id].from;
  const nextAt = (i: number) => (i + 1 < TL.parts.length ? TL.parts[i + 1].at : TL.total + 1);
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {TL.parts.map((p, i) => {
        const a = p.at - 0.25, b = nextAt(i) - 0.1;
        if (T < a || T >= b) return null;
        const s = segT(p.id);
        return (
          <AbsoluteFill key={p.id} style={{opacity: i ? prog(T, a, 0.3) : 1}}>
            {p.id === 'pregunta' ? <Pregunta s={s} /> : p.id === 'record' ? <Record s={s} /> : p.id === 'porque' ? <Porque s={s} /> : p.id === 'venezuela' ? <Venezuela s={s} /> : <Cta T={T} t0={p.at} />}
          </AbsoluteFill>
        );
      })}
      <Vig k={0.4} />
      {T < TL.cta - 0.1 ? <Captions T={T} y={1360} /> : null}
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};
export const SHORT9_TOTAL = TL.total;
