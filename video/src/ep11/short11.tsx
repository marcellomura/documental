/* Short vertical (1080×1920) del episodio 11 (El Sol de Perón): el anuncio, la energía "en envases de medio litro",
   la frase de Teller, los 40 millones de grados contra un fósforo, el fraude y el cierre al video completo (ver tools/short_ep11.py). */
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {F} from '../theme';
import {Grain} from '../components/base';
import {LogoMark} from '../ep04/kit';
import short from '../data/ep11/short.json';
import words from '../data/ep11/words.json';
import wordsX from '../data/ep11/words_short.json';
import {cue as cueMain} from './lib';
import {K, TYPE, SpaceBg, Embers, ArchiveVideo, MilkBottle, Flag, Big, Stamp, Vig, InkDefs, between, clamp, easeOut, prog, pop} from './kit11';
import {IslandShot} from './three11';

const VW = 1080, VH = 1920;
type Part = {id: string; seg: string; from: number; to: number; at: number};
const TL = short as unknown as {fps: number; parts: Part[]; cta: number; total: number};
type Wd = {w: string; s: number; e: number};
const WS = {...(words as Record<string, Wd[]>), ...(wordsX as Record<string, Wd[]>)};
const P = Object.fromEntries(TL.parts.map((p) => [p.id, p])) as Record<string, Part>;
const cue = (seg: string, phrase: string, n = 0) => (seg === 'x01' ? WS.x01.find((w) => w.w.toLowerCase().startsWith(phrase.toLowerCase()))!.s : cueMain(seg, phrase, n));

/* ---------- subtítulos palabra por palabra (con cifras) ---------- */
const NUMS: [string, string][] = [['cuarenta millones', '40 millones'], ['medio litro,', '½ litro,']];
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
      out.push({w: hit[1], s: ws[i].s, e: ws[i + n - 1].e});
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
  const s = '#05060B';
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: y, textAlign: 'center', transform: `scale(${0.86 + 0.14 * k})`}}>
      {c.words.map((w, i) => {
        const on = T >= w.s - 0.03 && T < w.e + 0.15;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block', margin: '0 12px', fontFamily: F.head, fontSize: 92, lineHeight: 1.15, textTransform: 'uppercase', color: on ? K.sun : '#fff',
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
  <Big t={t} t0={t0} t1={t1} text={text} size={size} x={540} w={1000} y={y} hl={hl} color={color} lh={1.02} />
);

/* ---------- 1 · el anuncio ---------- */
const Gancho: React.FC<{s: number}> = ({s}) => {
  const c = (p: string) => cue('s01', p);
  const tIsla = c('en una isla') - 0.2, tArg = c('la Argentina') - 0.15, tEnc = c('Encender,') - 0.2;
  const t0 = P.gancho.from;
  return (
    <AbsoluteFill>
      {s < tIsla + 0.4 ? (
        <AbsoluteFill style={{opacity: 1 - prog(s, tIsla, 0.4)}}>
          <ArchiveVideo src="ep11/vid/bal_saludo.mp4" t={s} t0={t0 - 0.3} t1={tIsla + 0.4} from={1.2} rate={0.8} bw sepia zoom={[1.0, 1.06]} focus="45% 40%" dim={0.35} />
          {[0, 0.35, 0.8, 1.3].map((d, i) => {
            const a = c('prensa') + d;
            const k = s >= a && s < a + 0.18 ? 1 - (s - a) / 0.18 : 0;
            return k > 0 ? <AbsoluteFill key={i} style={{background: `rgba(255,255,255,${0.7 * k})`}} /> : null;
          })}
          <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,6,11,0.88) 0%, rgba(5,6,11,0) 34%)'}} />
          <Title t={s} t0={t0 + 0.05} text="24 DE MARZO DE 1951" size={84} y={190} color={K.sun} />
          <Title t={s} t0={t0 + 0.4} text="PERÓN ANUNCIA | ALGO QUE ASOMBRA | AL MUNDO" size={104} y={420} />
        </AbsoluteFill>
      ) : null}
      {between(s, tIsla, tArg + 0.4) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(s, tIsla, 0.4), 1 - prog(s, tArg, 0.4))}}>
          <IslandShot s={{t: s, build: 1, reactor: 1, lit: 0.6}} cam={{pos: [4, 20 - 3 * prog(s, tIsla, 3), 42], look: [0, 1, 0], fov: 52}} w={VW} h={VH} />
          <Stamp t={s} t0={c('secreta')} text="ISLA SECRETA" x={540} y={420} rot={-7} size={100} />
        </AbsoluteFill>
      ) : null}
      {between(s, tArg, tEnc + 0.3) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(s, tArg, 0.35), 1 - prog(s, tEnc, 0.3))}}>
          <SpaceBg t={s} glow="rgba(116,172,223,0.18)" />
          {[
            {k: 'arg' as const, name: 'ARGENTINA', t0: tArg + 0.15, y: 260},
            {k: 'usa' as const, name: 'ESTADOS UNIDOS', t0: c('Estados'), y: 650},
            {k: 'urss' as const, name: 'UNIÓN SOVIÉTICA', t0: c('Unión'), y: 1000},
          ].map((f, i) => {
            const a = pop(s, f.t0, 1.3);
            const win = f.k === 'arg';
            return s >= f.t0 ? (
              <div key={i} style={{position: 'absolute', left: 0, right: 0, top: f.y, textAlign: 'center', transform: `scale(${Math.min(1.05, a)})`, opacity: Math.min(1, a)}}>
                <div style={{display: 'inline-block', boxShadow: win ? `0 0 70px ${K.celeste}` : 'none', filter: !win && s > f.t0 + 0.8 ? 'grayscale(0.7) brightness(0.6)' : 'none'}}>
                  <Flag kind={f.k} w={win ? 380 : 300} />
                </div>
                <div style={{fontFamily: F.head, fontSize: win ? 70 : 52, color: K.cream, marginTop: 12}}>
                  {f.name} {!win && s > f.t0 + 0.5 ? <span style={{color: K.red}}>✕</span> : null}
                  {win && s > c('conseguido.') - 0.2 ? <span style={{color: K.green}}>✓</span> : null}
                </div>
              </div>
            ) : null;
          })}
        </AbsoluteFill>
      ) : null}
      {s >= tEnc ? (
        <AbsoluteFill style={{opacity: prog(s, tEnc, 0.3)}}>
          <SpaceBg t={s} glow="rgba(255,140,40,0.25)" />
          <div style={{position: 'absolute', left: 90, top: 330, width: 900, height: 900, borderRadius: 450, overflow: 'hidden', boxShadow: '0 0 160px 40px rgba(255,140,40,0.4)'}}>
            <ArchiveVideo src="ep11/vid/sol304.mp4" t={s} t0={tEnc} rate={0.55} film={0} dim={0} zoom={[1.15, 1.0]} fade={0.2} />
          </div>
          <svg width={VW} height={VH} style={{position: 'absolute', left: 0, top: 0}}>
            <circle cx={540} cy={780} r={480} fill="none" stroke={K.plasma} strokeWidth={8} />
            <circle cx={540} cy={780} r={530} fill="none" stroke={K.plasma} strokeWidth={3} strokeDasharray="12 16" opacity={0.6} />
          </svg>
          <Title t={s} t0={c('máquina,') - 0.1} text="UN SOL EN UNA MÁQUINA" size={92} y={190} color={K.sun} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- 2 · energía en envases de medio litro ---------- */
const Leche: React.FC<{s: number}> = ({s}) => {
  const c = (p: string) => cue('s01', p);
  const t0 = P.leche.from, tM = c('Era todo');
  return (
    <AbsoluteFill>
      <SpaceBg t={s} glow="rgba(255,150,50,0.22)" y={50} />
      <div style={{position: 'absolute', left: 120, right: 120, top: 1180, height: 16, background: '#3A2F25'}} />
      {[0, 1, 2].map((i) => {
        const a = t0 + 0.1 + i * 0.3;
        const crack = prog(s, tM + 0.1 + i * 0.12, 0.5);
        const fill = easeOut(prog(s, a, 1.2)) * (1 - 0.85 * prog(s, tM + 0.5, 0.8));
        return s >= a - 0.05 ? <MilkBottle key={i} t={s} x={250 + i * 290} y={970} s={1.05} fill={fill} glow={fill} crack={crack} o={prog(s, a, 0.3)} /> : null;
      })}
      <Title t={s} t0={t0} text="LA ENERGÍA IBA A VENDERSE | COMO LA LECHE" size={86} y={330} hl={{LECHE: K.sun}} />
      <Stamp t={s} t0={c('mentira.')} text="MENTIRA" x={540} y={800} rot={-8} size={190} />
    </AbsoluteFill>
  );
};

/* ---------- 3 · Teller ---------- */
const Teller: React.FC<{s: number}> = ({s}) => {
  const c = (p: string) => cue('s05', p);
  const lines = [
    {text: 'Leyendo una línea,', t0: c('leyendo') - 0.1, color: K.cream},
    {text: 'uno piensa que es un genio.', t0: c('uno piensa') - 0.1, color: K.green},
    {text: 'Leyendo la siguiente,', t0: c('Leyendo la') - 0.1, color: K.cream},
    {text: 'se da cuenta de que está loco.', t0: c('se da') - 0.1, color: K.red},
  ];
  return (
    <AbsoluteFill>
      <SpaceBg t={s} />
      <div style={{position: 'absolute', left: 0, top: 0, width: VW, height: 980, overflow: 'hidden'}}>
        <Img src={staticFile('ep11/img/teller.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%', filter: 'grayscale(1) contrast(1.1)', transform: `scale(${1.02 + 0.05 * clamp((s - P.teller.from) / 12)})`}} />
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,6,11,0) 60%, #05060B 100%)'}} />
      </div>
      <div style={{position: 'absolute', left: 60, top: 820, fontFamily: F.head, fontSize: 70, color: K.cream}}>EDWARD TELLER</div>
      <div style={{position: 'absolute', left: 62, top: 900, fontFamily: F.body, fontWeight: 800, fontSize: 30, color: K.mute, letterSpacing: 3}}>EL “PADRE” DE LA BOMBA H, SOBRE RICHTER</div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 1000}}>
        {lines.map((l, i) => (
          <div key={i} style={{fontFamily: F.quote, fontStyle: 'italic', fontWeight: 600, fontSize: 60, lineHeight: 1.2, color: l.color, opacity: prog(s, l.t0, 0.4)}}>{l.text}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 4 · 40 millones de grados contra un fósforo ---------- */
const Grados: React.FC<{s: number}> = ({s}) => {
  const c = (p: string) => cue('s06', p);
  const tNeed = c('cuarenta') - 0.2, tArc = c('Su máquina,') - 0.1, tOce = c('Como querer') - 0.1;
  const k = easeOut(prog(s, tNeed, 1.2));
  return (
    <AbsoluteFill>
      <SpaceBg t={s} glow="rgba(92,214,255,0.12)" />
      <Title t={s} t0={P.grados.from} t1={tOce + 0.2} text="EL INFORME DE BALSEIRO" size={84} y={190} color={K.plasma} />
      {s < tOce + 0.3 ? (
        <AbsoluteFill style={{opacity: 1 - prog(s, tOce, 0.3)}}>
          <div style={{position: 'absolute', left: 160, bottom: 380, width: 240, height: 1100 * k, background: `linear-gradient(0deg, ${K.sun2}, ${K.sun})`, borderRadius: 14, boxShadow: '0 0 50px rgba(255,140,40,0.5)'}} />
          <div style={{position: 'absolute', left: 120, bottom: 300, width: 320, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 26, color: K.mute, letterSpacing: 2}}>LO QUE HACÍA FALTA</div>
          <div style={{position: 'absolute', left: 440, top: 380, fontFamily: F.head, fontSize: 96, color: K.cream, opacity: prog(s, tNeed + 0.5, 0.3)}}>40.000.000 °C</div>
          <div style={{position: 'absolute', left: 660, bottom: 380, width: 240, height: 4, background: K.plasma, opacity: prog(s, tArc, 0.2), boxShadow: `0 0 20px ${K.plasma}`}} />
          <div style={{position: 'absolute', left: 620, bottom: 300, width: 320, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 26, color: K.mute, letterSpacing: 2, opacity: prog(s, tArc, 0.3)}}>EL ARCO DE RICHTER</div>
          <div style={{position: 'absolute', left: 560, top: 1250, width: 460, textAlign: 'center', fontFamily: F.head, fontSize: 90, color: K.plasma, opacity: prog(s, c('unos pocos') - 0.1, 0.3)}}>≈ 4.000 °C</div>
        </AbsoluteFill>
      ) : null}
      {s > tOce - 0.1 ? (
        <AbsoluteFill style={{opacity: prog(s, tOce - 0.1, 0.4)}}>
          <svg width={VW} height={VH}>
            {Array.from({length: 9}, (_, i) => (
              <path key={i} d={`M0 ${1000 + i * 70} ${Array.from({length: 8}, (_, j) => `Q ${j * 140 + 70} ${1000 + i * 70 + Math.sin(s * 2 + i + j) * 22 - 26} ${(j + 1) * 140} ${1000 + i * 70}`).join(' ')}`} fill="none" stroke={K.plasma} strokeWidth={5} opacity={0.25 + i * 0.07} />
            ))}
            <g transform={`translate(540, ${820 - 10 * Math.sin(s * 2)}) scale(3)`}>
              <rect x={-8} y={0} width={16} height={150} rx={4} fill="#D9B98A" />
              <ellipse cx={0} cy={-6} rx={18} ry={24} fill="#8A2A1E" />
              <path d={`M0 ${-70 - 6 * Math.sin(s * 12)} C 24 -40 22 -12 0 -10 C -22 -12 -24 -40 0 ${-70 - 6 * Math.sin(s * 12)} Z`} fill={K.sun} />
              <path d="M0 -50 C 10 -34 8 -18 0 -16 C -8 -18 -10 -34 0 -50 Z" fill="#FFF2C0" />
            </g>
          </svg>
          <Title t={s} t0={c('hervir') - 0.2} text="HERVIR EL OCÉANO | CON UN FÓSFORO" size={100} y={300} hl={{FÓSFORO: K.sun, OCÉANO: K.plasma}} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- 5 · fraude ---------- */
const Fraude: React.FC<{s: number}> = ({s}) => {
  const c = (p: string) => cue('s07', p);
  return (
    <AbsoluteFill>
      <IslandShot s={{t: s, build: 1, reactor: 1, night: 1, lit: 0.3, sunGlow: 1 - prog(s, c('apaga') - 0.2, 1.4)}} cam={{pos: [6, 14, 34], look: [0, 1.4, 0], fov: 50}} w={VW} h={VH} />
      <AbsoluteFill style={{background: `rgba(0,0,0,${0.5 * prog(s, c('apaga'), 1.5)})`}} />
      <Stamp t={s} t0={c('fraude,') - 0.1} text="FRAUDE" x={540} y={560} rot={-8} size={210} />
    </AbsoluteFill>
  );
};

/* ---------- 6 · cierre: tarjeta del video completo y flecha al enlace ---------- */
const Cta: React.FC<{T: number; t0: number}> = ({T, t0}) => {
  const t = T - t0;
  const a = pop(t, 0.1, 0.9);
  const bob = Math.sin(t * 6) * 16;
  const drift = 1 + 0.05 * clamp(t / 12);
  const sweep = ((t * 0.45) % 1.6) - 0.3;
  return (
    <AbsoluteFill>
      <SpaceBg t={t} glow="rgba(255,140,40,0.2)" y={30} />
      <Embers t={t} n={46} o={0.7} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', opacity: prog(t, 0, 0.4)}}>
        <div style={{fontFamily: F.head, fontSize: 80, color: K.cream, lineHeight: 1.05}}>¿Y QUÉ DEJÓ</div>
        <div style={{fontFamily: F.head, fontSize: 80, color: K.sun, lineHeight: 1.05}}>ESA MENTIRA?</div>
      </div>
      <div style={{position: 'absolute', left: 60, top: 430, width: 960, transform: `scale(${Math.max(0, a) * drift}) rotate(${0.6 * Math.sin(t * 0.8)}deg)`, transformOrigin: '50% 50%'}}>
        <div style={{position: 'relative', width: 960, height: 540, borderRadius: 18, overflow: 'hidden', boxShadow: '0 40px 90px rgba(0,0,0,0.7)', border: '4px solid rgba(255,255,255,0.85)', background: '#0A0B12'}}>
          <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 115%, #FFF4D0 0%, #FFC050 9%, #FF7A1A 18%, rgba(255,90,20,0.3) 32%, rgba(0,0,0,0) 55%)'}} />
          <div style={{position: 'absolute', left: 40, top: 60, transform: 'rotate(-3deg)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', border: '10px solid #F3ECDD'}}>
            <Img src={staticFile('ep11/img/richter_peron.jpg')} style={{width: 380, height: 240, objectFit: 'cover', filter: 'grayscale(1) contrast(1.1)'}} />
          </div>
          <div style={{position: 'absolute', left: 470, right: 30, top: 90, fontFamily: F.head, fontSize: 110, lineHeight: 0.95, color: K.cream}}>
            EL SOL
            <div style={{color: K.sun}}>DE PERÓN</div>
          </div>
          <div style={{position: 'absolute', right: 18, bottom: 16, background: 'rgba(0,0,0,0.8)', color: '#fff', fontFamily: F.body, fontWeight: 700, fontSize: 30, padding: '4px 12px', borderRadius: 6}}>7:07</div>
          <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep * 100}%`, width: 160, background: 'linear-gradient(90deg, rgba(255,240,200,0) 0%, rgba(255,240,200,0.22) 50%, rgba(255,240,200,0) 100%)', transform: 'skewX(-18deg)'}} />
          <div style={{position: 'absolute', right: 24, top: 22, width: 70, height: 70}}>
            <LogoMark size={70} t={t} t0={0.3} />
          </div>
        </div>
        <div style={{marginTop: 22, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 34, letterSpacing: 4, color: K.cream}}>VIDEO COMPLETO · CONTEXTO</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', opacity: prog(t, cue('x01', 'Tocá') - 0.2, 0.3)}}>
        <div style={{display: 'inline-block', background: K.sun, color: K.bg0, fontFamily: F.head, fontSize: 70, padding: '14px 40px 6px', borderRadius: 14}}>TOCÁ EL ENLACE DE ABAJO</div>
        <div style={{fontFamily: F.head, fontSize: 200, color: K.sun, lineHeight: 1, transform: `translateY(${bob}px)`, marginTop: 10, textShadow: '0 10px 30px rgba(0,0,0,0.6)'}}>↓</div>
      </div>
    </AbsoluteFill>
  );
};

export const ShortSol: React.FC = () => {
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
            {p.id === 'gancho' ? <Gancho s={s} /> : p.id === 'leche' ? <Leche s={s} /> : p.id === 'teller' ? <Teller s={s} /> : p.id === 'grados' ? <Grados s={s} /> : p.id === 'fraude' ? <Fraude s={s} /> : <Cta T={T} t0={p.at} />}
          </AbsoluteFill>
        );
      })}
      <Vig k={0.4} />
      {T < TL.cta - 0.1 ? <Captions T={T} y={1440} /> : null}
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};
export const SHORT11_TOTAL = TL.total;
