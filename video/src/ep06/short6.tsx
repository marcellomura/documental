/* Short vertical (1080×1920) del episodio 6 para YouTube Shorts: gancho, el ticket del kilo de carne,
   impuestos contra ganancias y el cierre que manda al video completo (ver tools/short_ep06.py). */
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {F} from '../theme';
import {Grain} from '../components/base';
import {LogoMark} from '../ep04/kit';
import short from '../data/ep06/short.json';
import words from '../data/ep06/words.json';
import wordsX from '../data/ep06/words_short.json';
import {cue as cueMain} from './lib';
import {Big, Chip, ChickenIcon, Count, CowIcon, Ember, FullPhoto, FullVideo, K, LINKS, PersonIcon, Ticket, Vig, clamp, easeIn, easeInOut, easeOut, pop, prog} from './kit6';
import {Balance, Grid100, ShadowFloor, Stage, Tray} from './three6';
import {G, balAngle} from './scenes6a';

const VW = 1080, VH = 1920;
type Part = {id: string; seg: string; from: number; to: number; at: number};
const TL = short as unknown as {fps: number; parts: Part[]; cta: number; total: number};
const WS = {...(words as Record<string, {w: string; s: number; e: number}[]>), ...(wordsX as Record<string, {w: string; s: number; e: number}[]>)};
const P = Object.fromEntries(TL.parts.map((p) => [p.id, p])) as Record<string, Part>;
const cue = (seg: string, phrase: string, n = 0) => (seg === 'x01' ? WS.x01.find((w) => w.w.toLowerCase().startsWith(phrase.toLowerCase()))!.s : cueMain(seg, phrase, n));
const between = (t: number, a: number, b: number) => t >= a && t < b;
const fadeIO = (t: number, a: number, b: number, d = 0.3) => Math.min(prog(t, a, d), 1 - prog(t, b - d, d, easeIn));

/* ---------- subtítulos palabra por palabra ---------- */
const CHUNKS = (() => {
  const list: {w: string; s: number; e: number}[] = [];
  for (const p of TL.parts) for (const w of WS[p.seg]) if (w.s >= p.from - 0.01 && w.e <= p.to + 0.05) list.push({w: w.w, s: p.at + w.s - p.from, e: p.at + w.e - p.from});
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
  const s = '#0B0806';
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: y, textAlign: 'center', transform: `scale(${0.86 + 0.14 * k})`}}>
      {c.words.map((w, i) => {
        const on = T >= w.s - 0.03 && T < w.e + 0.15;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block', margin: '0 12px', fontFamily: F.head, fontSize: 92, lineHeight: 1.15, textTransform: 'uppercase', color: on ? K.yellow : '#fff',
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

/* =================================================================================== */
const Gancho: React.FC<{s: number}> = ({s}) => {
  const c = (p: string, n = 0) => cue('s01', p, n);
  const tCows = c('Cincuenta'), tArg = c('cuarenta'), tAsado = c('Somos'), tBal = c('Y sin embargo'), tPollo = c('Y los argentinos'), tComo = c('¿Cómo');
  const tA = c('kilo de asado'), tP = [c('tres kilos'), c('kilos y medio'), c('medio de pollo'), c('pollo.')];
  const drop = (t0: number) => (1 - easeIn(clamp((s - t0) / 0.4))) * 3.2;
  const icons = (n: number, t0: number, y: number, el: React.ReactNode, cols = 9, step = 96, rowH = 62, extraFrom = 999) =>
    Array.from({length: n}, (_, i) => {
      const r = Math.floor(i / cols), col = i % cols;
      const a = pop(s, t0 + i * 0.03, 1.2);
      const extra = i >= extraFrom ? prog(s, c('argentinos.') + 0.2, 0.4) : 0;
      return (
        <div key={i} style={{position: 'absolute', left: 540 - (cols * step) / 2 + col * step + 8, top: y + r * rowH, transform: `scale(${Math.max(0, a)})`, filter: extra ? `drop-shadow(0 0 10px ${K.yellow})` : undefined}}>
          {extra ? <CowIcon size={80} color={K.yellow} /> : el}
        </div>
      );
    });
  return (
    <AbsoluteFill>
      {s < tCows + 0.4 ? <FullVideo src="ep06/vid/feedlot_b.mp4" t={s} t0={-0.3} t1={tCows + 0.4} zoom={[1.12, 1.02]} dim={0.35} /> : null}
      {s < tCows + 0.2 ? <Title t={s} t0={0.05} t1={tCows + 0.2} text="HAY MÁS VACAS | QUE PERSONAS" size={130} y={420} hl={{VACAS: K.yellow}} /> : null}
      {between(s, tCows, tAsado + 0.2) ? (
        <AbsoluteFill style={{opacity: fadeIO(s, tCows, tAsado + 0.2)}}>
          <FullVideo src="ep06/vid/feedlot_c.mp4" t={s} t0={tCows} t1={tAsado + 0.2} dim={1.2} fade={0.01} />
          <AbsoluteFill style={{background: 'rgba(11,8,6,0.55)'}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: F.head, fontSize: 104, color: K.cream}}>
            <Count t={s} t0={tCows} dur={1.3} to={51} /> MILLONES <span style={{color: K.yellow, fontSize: 60}}>DE VACAS</span>
          </div>
          {icons(51, tCows, 320, <CowIcon size={80} color={K.cream} />, 9, 96, 62, 46)}
          {s > tArg - 0.1 ? (
            <div style={{position: 'absolute', left: 0, right: 0, top: 740, textAlign: 'center', fontFamily: F.head, fontSize: 104, color: K.cream, opacity: prog(s, tArg - 0.1, 0.3)}}>
              <Count t={s} t0={tArg} dur={1.3} to={46} /> MILLONES <span style={{color: K.celeste, fontSize: 52}}>DE ARGENTINOS</span>
            </div>
          ) : null}
          {icons(46, tArg, 890, <PersonIcon size={62} />, 12, 72, 76)}
        </AbsoluteFill>
      ) : null}
      {between(s, tAsado - 0.1, tBal + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(s, tAsado - 0.1, tBal + 0.3)}}>
          <FullPhoto src="ep06/asado3.jpg" t={s} t0={tAsado - 0.1} t1={c('parrilla,') + 0.2} zoom={[1.05, 1.16]} dim={0.3} />
          <FullPhoto src="ep06/asado2.jpg" t={s} t0={c('parrilla,') - 0.2} t1={c('del', 1) + 0.2} zoom={[1.12, 1.02]} focus="45% 45%" dim={0.25} />
          <FullPhoto src="ep06/asado1.jpg" t={s} t0={c('del', 1) - 0.2} t1={tBal + 0.4} zoom={[1.03, 1.14]} dim={0.3} />
          <Title t={s} t0={tAsado + 0.1} text="EL PAÍS | DEL ASADO" size={150} y={420} hl={{ASADO: K.yellow}} />
        </AbsoluteFill>
      ) : null}
      {between(s, tBal, tPollo + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(s, tBal, tPollo + 0.3)}}>
          <Ember glow="rgba(210,110,40,0.3)" y={46} />
          <Stage w={VW} h={VH} cam={{pos: [0, 3.3, 15.5], look: [0, 1.7, 0], fov: 52}} shadow={8} key0={[4, 10, 8]}>
            <Balance
              angle={balAngle(s, tA, tP)}
              left={s > tA - 0.4 ? <Tray kind="asado" s={1.25} pos={[0, drop(tA - 0.4), 0]} rot={[0, 0.2, 0]} /> : null}
              right={
                <group>
                  {[[-0.3, 0, -0.2], [0.32, 0.02, 0.18], [-0.05, 0.25, 0.05]].map((p, i) =>
                    s > tP[i] - 0.4 ? <Tray key={i} kind="pollo" s={0.95} pos={[p[0], p[1] + drop(tP[i] - 0.4), p[2]]} rot={[0, (i - 1) * 0.3, 0]} /> : null,
                  )}
                  {s > tP[3] - 0.4 ? <Tray kind="pollo" s={0.95} half pos={[0.28, 0.5 + drop(tP[3] - 0.4), -0.05]} rot={[0, -0.4, 0]} /> : null}
                </group>
              }
            />
            <ShadowFloor o={0.55} />
          </Stage>
          <Chip t={s} t0={tA} text="1 KG ASADO" x={255} y={1160} color={K.red} size={46} />
          <Chip t={s} t0={tP[0]} text="3,5 KG POLLO" x={825} y={1160} color={K.pollo} size={46} />
          <Title t={s} t0={c('medio de pollo') + 0.3} text="LA MISMA PLATA" size={110} y={330} color={K.yellow} />
        </AbsoluteFill>
      ) : null}
      {between(s, tPollo, tComo + 0.25) ? (
        <AbsoluteFill style={{opacity: fadeIO(s, tPollo, tComo + 0.25)}}>
          <FullPhoto src="ep06/pollo.jpg" t={s} t0={tPollo} t1={tComo + 0.3} dim={1.3} zoom={[1.1, 1.18]} fade={0.01} blur={3} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 180, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 32, letterSpacing: 5, color: K.mute}}>KILOS POR HABITANTE, POR AÑO</div>
          {[{v: 49, color: K.pollo, label: 'POLLO', t0: c('pollo', 1), icon: <ChickenIcon size={150} />, x: 300}, {v: 46, color: K.red, label: 'VACA', t0: c('carne de vaca'), icon: <CowIcon size={170} color={K.red} />, x: 780}].map((b) => {
            const k = easeOut(clamp((s - b.t0) / 0.9));
            return (
              <div key={b.label} style={{position: 'absolute', left: b.x - 150, bottom: 780, width: 300, textAlign: 'center', opacity: prog(s, b.t0 - 0.2, 0.3)}}>
                <div style={{fontFamily: F.head, fontSize: 110, color: K.cream, lineHeight: 1}}>{b.v === 49 ? '≈' : ''}<Count t={s} t0={b.t0} dur={0.9} to={b.v} /></div>
                <div style={{height: 560 * (b.v / 50) * k, background: b.color, borderRadius: '10px 10px 0 0', marginTop: 10}} />
                <div style={{display: 'flex', justifyContent: 'center', marginTop: 16}}>{b.icon}</div>
              </div>
            );
          })}
        </AbsoluteFill>
      ) : null}
      {s >= tComo - 0.1 ? (
        <AbsoluteFill style={{opacity: prog(s, tComo - 0.1, 0.25)}}>
          <FullPhoto src="ep06/carniceria.jpg" t={s} t0={tComo - 0.1} dim={1.3} zoom={[1.18, 1.05]} fade={0.01} focus="30% 50%" />
          <Title t={s} t0={tComo} t1={c('¿Quién') - 0.05} text="¿CÓMO | PUEDE SER?" size={160} y={560} />
          <Title t={s} t0={c('¿Quién')} text="¿QUIÉN SE | QUEDA CON | LA PLATA?" size={160} y={600} hl={{PLATA: K.yellow}} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

const TicketPart: React.FC<{s: number; t0: number}> = ({s}) => {
  const c = (p: string, n = 0) => cue('s07', p, n);
  const tl = [c('Seis'), c('Tres'), c('Menos'), c('Tres', 1), c('Y más')];
  const lines = LINKS.map((l, i) => ({label: l.id === 'inv' ? 'ENGORDE' : l.name, value: l.amount, t0: tl[i], color: l.id === 'imp' ? K.red : undefined, strong: l.id === 'imp'}));
  const s0 = c('Un kilo') - 0.1;
  return (
    <AbsoluteFill>
      <Ember glow="rgba(200,90,40,0.24)" y={40} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', opacity: prog(s, s0, 0.4)}}>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 5, color: K.mute}}>1 KG DE CARNE EN EL MOSTRADOR</div>
        <div style={{fontFamily: F.head, fontSize: 150, color: K.yellow, lineHeight: 1}}>
          $<Count t={s} t0={c('dieciocho')} dur={1.2} to={18500} />
        </div>
      </div>
      <Ticket t={s} t0={s0 + 0.1} lines={lines} total={{t0: c('impuestos.') + 0.7, value: 18500}} x={540} y={360} w={900} circle={{t0: c('impuestos.') - 0.1, line: 4}} />
    </AbsoluteFill>
  );
};

const Impuestos: React.FC<{s: number}> = ({s}) => {
  const c = (p: string, n = 0) => cue('s06', p, n);
  const tMas = c('Más de'), tY = c('Y es');
  return (
    <AbsoluteFill>
      {s < tY + 0.3 ? (
        <AbsoluteFill style={{opacity: 1 - prog(s, tY, 0.3)}}>
          <Ember glow="rgba(226,59,46,0.2)" y={55} />
          <Stage w={VW} h={VH} cam={{pos: [3.5, 19, 15.5], look: [0, 3.2, 0.4], fov: 50}} shadow={12} key0={[6, 14, 8]}>
            <Grid100 t={s} groups={[G.cria(1, {dim: 0.5}), G.inv(1, {dim: 0.5}), G.frig(1, {dim: 0.5}), G.carn(1, {dim: 0.5}), G.imp(1, {lift: 0.6 * prog(s, tMas, 0.6), glow: 1})]} />
            <ShadowFloor o={0.5} />
          </Stage>
          <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center'}}>
            <div style={{fontFamily: F.head, fontSize: 260, color: K.red, lineHeight: 0.9, textShadow: '0 0 70px rgba(226,59,46,0.45)'}}>$28</div>
            <div style={{fontFamily: F.head, fontSize: 80, color: K.cream}}>DE CADA $100</div>
            <div style={{fontFamily: F.head, fontSize: 80, color: K.red}}>SON IMPUESTOS</div>
          </div>
        </AbsoluteFill>
      ) : null}
      {s >= tY ? (
        <AbsoluteFill style={{opacity: prog(s, tY, 0.3)}}>
          <Ember glow="rgba(226,59,46,0.18)" />
          <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 5, color: K.mute}}>DE CADA $100 DEL KILO DE CARNE</div>
          {[{v: 28, color: K.red, label: 'IMPUESTOS', t0: tY + 0.2, x: 300}, {v: 21, color: K.yellow, label: 'GANANCIAS DE TODA LA CADENA', t0: c('las ganancias'), x: 780}].map((b) => {
            const k = easeOut(clamp((s - b.t0) / 0.9));
            return (
              <div key={b.label} style={{position: 'absolute', left: b.x - 190, bottom: 720, width: 380, textAlign: 'center', opacity: prog(s, b.t0 - 0.2, 0.3)}}>
                <div style={{fontFamily: F.head, fontSize: 140, color: b.color, lineHeight: 1}}>${Math.round(b.v * k)}</div>
                <div style={{height: 700 * (b.v / 30) * k, background: b.color, borderRadius: '12px 12px 0 0', marginTop: 10, boxShadow: `0 0 50px ${b.color}66`}} />
                <div style={{fontFamily: F.head, fontSize: 46, color: K.cream, marginTop: 14, lineHeight: 1.05}}>{b.label}</div>
              </div>
            );
          })}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/** cierre: la tarjeta del video completo y la flecha al enlace */
const Cta: React.FC<{T: number; t0: number}> = ({T, t0}) => {
  const t = T - t0;
  const a = pop(t, 0.1, 0.9);
  const bob = Math.sin(t * 6) * 16;
  return (
    <AbsoluteFill>
      <FullPhoto src="ep06/niebla.jpg" t={t} t0={-0.2} zoom={[1.1, 1.2]} dim={1.1} fade={0.01} />
      <AbsoluteFill style={{background: 'rgba(11,8,6,0.45)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 160, textAlign: 'center', opacity: prog(t, 0, 0.4)}}>
        <div style={{fontFamily: F.head, fontSize: 96, color: K.cream, lineHeight: 1.02}}>¿QUIÉN SE QUEDA</div>
        <div style={{fontFamily: F.head, fontSize: 96, color: K.yellow, lineHeight: 1.02}}>CON CADA PESO?</div>
      </div>
      <div style={{position: 'absolute', left: 60, top: 440, width: 960, transform: `scale(${Math.max(0, a)})`, transformOrigin: '50% 50%'}}>
        <div style={{position: 'relative', width: 960, height: 540, borderRadius: 18, overflow: 'hidden', boxShadow: '0 40px 90px rgba(0,0,0,0.7)', border: '4px solid rgba(255,255,255,0.85)'}}>
          <Img src={staticFile('ep06/niebla.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.55)'}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: F.head, fontSize: 110, lineHeight: 0.95, color: K.cream}}>
            LA <span style={{color: K.red}}>PARADOJA</span>
            <br />
            DE LA CARNE
          </div>
          <div style={{position: 'absolute', right: 18, bottom: 16, background: 'rgba(0,0,0,0.8)', color: '#fff', fontFamily: F.body, fontWeight: 700, fontSize: 30, padding: '4px 12px', borderRadius: 6}}>5:51</div>
          <div style={{position: 'absolute', left: 24, top: 22, width: 70, height: 70}}>
            <LogoMark size={70} t={t} t0={0.3} />
          </div>
        </div>
        <div style={{marginTop: 22, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 34, letterSpacing: 4, color: K.cream}}>VIDEO COMPLETO · CONTEXTO</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', opacity: prog(t, cue('x01', 'Tocá') - 0.2, 0.3)}}>
        <div style={{display: 'inline-block', background: K.yellow, color: K.bg0, fontFamily: F.head, fontSize: 70, padding: '14px 40px 6px', borderRadius: 14}}>TOCÁ EL ENLACE DE ABAJO</div>
        <div style={{fontFamily: F.head, fontSize: 200, color: K.yellow, lineHeight: 1, transform: `translateY(${bob}px)`, marginTop: 10, textShadow: '0 10px 30px rgba(0,0,0,0.6)'}}>↓</div>
      </div>
    </AbsoluteFill>
  );
};

export const ShortCarne: React.FC = () => {
  const frame = useCurrentFrame();
  const T = frame / TL.fps;
  const segT = (id: string) => T - P[id].at + P[id].from;
  const nextAt = (i: number) => (i + 1 < TL.parts.length ? TL.parts[i + 1].at : TL.total + 1);
  const capY = T < P.ticket.at ? 1330 : T < P.impuestos.at ? 1330 : 1350;
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {TL.parts.map((p, i) => {
        const a = p.at - 0.25, b = nextAt(i) - 0.1;
        if (T < a || T >= b) return null;
        const s = segT(p.id);
        return (
          <AbsoluteFill key={p.id} style={{opacity: i ? prog(T, a, 0.3) : 1}}>
            {p.id === 'gancho' ? <Gancho s={s} /> : p.id === 'ticket' ? <TicketPart s={s} t0={p.at} /> : p.id === 'impuestos' ? <Impuestos s={s} /> : <Cta T={T} t0={p.at} />}
          </AbsoluteFill>
        );
      })}
      <Vig k={0.4} />
      {T < TL.cta - 0.1 ? <Captions T={T} y={capY} /> : null}
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};
export const SHORT6_TOTAL = TL.total;
