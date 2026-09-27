import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import tl from '../data/sdb/timeline.json';
import words from '../data/sdb/words.json';
import {C, F} from '../theme';
import {clamp, easeOut, pop, prog, rnd, shake} from '../lib/anim';
import {Beat, Counter, Grain, Mark, Paper, Photo, Stamp, Strike, SvgDefs} from '../components/base';
import {DollarBill, PriceTag} from '../components/art';
import {Arrow, Bomb, Box, Derrick, Factory, Gauge, Gift, Pick, Plane, Suitcase, Wheat} from './icons';

/* Short vertical 1080x1920 · "EL DÓLAR ESTÁ BARATO… ¿Y ESO ES MALO?" (secuela de 13 CEROS) */

type Word = {w: string; s: number; e: number};
const WS = words as Record<string, Word[]>;
const SEGS = tl.segs as Record<string, {at: number; dur: number}>;

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

/* tiempo absoluto del short en que se dice una frase del guion */
const c = (seg: string, phrase: string, n = 0, which: 's' | 'e' = 's') => {
  const list = WS[seg];
  const tg = phrase.split(/\s+/).map(norm);
  let found = -1;
  for (let i = 0; i <= list.length - tg.length; i++) {
    if (tg.every((x, k) => norm(list[i + k].w) === x)) {
      found++;
      if (found === n) return SEGS[seg].at + (which === 's' ? list[i].s : list[i + tg.length - 1].e);
    }
  }
  throw new Error(`cue no encontrado: ${seg} "${phrase}"`);
};
const segEnd = (seg: string) => SEGS[seg].at + SEGS[seg].dur;

/* subtítulos grandes palabra por palabra (mismo estilo que el short de 13 CEROS) */
const CHUNKS = (() => {
  const list: Word[] = [];
  for (const k of Object.keys(SEGS).sort()) for (const w of WS[k]) list.push({w: w.w, s: SEGS[k].at + w.s, e: SEGS[k].at + w.e});
  const out: {words: Word[]; s: number; e: number}[] = [];
  let cur: Word[] = [];
  list.forEach((w, i) => {
    cur.push(w);
    const txt = cur.map((x) => x.w).join(' ');
    const punct = /[.,:?!…]$/.test(w.w);
    if (cur.length >= 3 || punct || txt.length > 15 || i === list.length - 1) {
      out.push({words: cur, s: cur[0].s, e: cur[cur.length - 1].e});
      cur = [];
    }
  });
  out.forEach((x, i) => (x.e = i < out.length - 1 ? Math.min(out[i + 1].s, x.e + 0.35) : x.e + 0.3));
  return out;
})();

const OUTLINE = '5px 5px 0 #161513, -5px -5px 0 #161513, 5px -5px 0 #161513, -5px 5px 0 #161513, 0 5px 0 #161513, 5px 0 0 #161513, -5px 0 0 #161513, 0 -5px 0 #161513, 0 14px 24px rgba(0,0,0,0.45)';

const Captions: React.FC<{T: number}> = ({T}) => {
  const ch = CHUNKS.find((x) => T >= x.s - 0.05 && T < x.e);
  if (!ch || T > tl.endCard - 0.1) return null;
  const k = pop(T, ch.s - 0.05, 1.4);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1290, textAlign: 'center', transform: `scale(${0.85 + 0.15 * k})`}}>
      {ch.words.map((w, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block', margin: '0 12px', fontFamily: F.head, fontSize: 92, lineHeight: 1.15, textTransform: 'uppercase',
            color: T >= w.s - 0.03 && T < w.e + 0.15 ? C.yellow : C.white, textShadow: OUTLINE,
          }}
        >
          {w.w.replace(/[«»]/g, '')}
        </span>
      ))}
    </div>
  );
};

/* rótulo chico gris */
const Kicker: React.FC<{children: React.ReactNode; color?: string; style?: React.CSSProperties}> = ({children, color = C.gray, style}) => (
  <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 38, letterSpacing: 8, color, textAlign: 'center', ...style}}>{children}</div>
);

/* fuente al pie del bloque visual */
const Src: React.FC<{t: number; t0: number; text: string; y?: number}> = ({t, t0, text, y = 1210}) => (
  <div style={{position: 'absolute', left: 60, right: 60, top: y, textAlign: 'center', fontFamily: F.body, fontWeight: 600, fontSize: 22, letterSpacing: 1.5, color: 'rgba(22,21,19,0.55)', textTransform: 'uppercase', opacity: prog(t, t0, 0.6)}}>
    {text}
  </div>
);

/* etiqueta de precio con ancho automático */
const Tag: React.FC<{text: string; color?: string; size?: number}> = ({text, color = C.yellow, size = 76}) => (
  <div style={{position: 'relative', display: 'inline-flex', alignItems: 'center', height: size * 1.45, padding: `0 ${size * 0.35}px 0 ${size * 0.75}px`, background: color, border: `6px solid ${C.ink}`, borderRadius: '0 14px 14px 0', clipPath: 'none', fontFamily: F.head, fontSize: size, color: C.ink, boxShadow: `6px 6px 0 ${C.ink}`, marginLeft: size * 0.5}}>
    <div style={{position: 'absolute', left: -size * 0.52, top: -6, width: 0, height: 0, borderTop: `${size * 0.725 + 6}px solid transparent`, borderBottom: `${size * 0.725 + 6}px solid transparent`, borderRight: `${size * 0.52}px solid ${C.ink}`}} />
    <div style={{position: 'absolute', left: -size * 0.52 + 9, top: 3, width: 0, height: 0, borderTop: `${size * 0.725 - 3}px solid transparent`, borderBottom: `${size * 0.725 - 3}px solid transparent`, borderRight: `${size * 0.52 - 3}px solid ${color}`}} />
    <div style={{position: 'absolute', left: size * 0.1, width: size * 0.26, height: size * 0.26, borderRadius: '50%', background: C.white, border: `4px solid ${C.ink}`}} />
    {text}
  </div>
);

/* tarjeta blanca con sombra dura */
const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{background: C.white, border: `5px solid ${C.ink}`, borderRadius: 22, boxShadow: `10px 10px 0 ${C.ink}`, ...style}}>{children}</div>
);

export const DolarBarato: React.FC = () => {
  const T = useCurrentFrame() / tl.fps;
  const E = tl.endCard;

  /* ---- cues ---- */
  const s1Barato = c('s01', 'barato.'), s1Malo = c('s01', '¿es malo?'), s1Anio = c('s01', 'En lo que va'), s1Cuatro = c('s01', 'cuatro');
  const s1Infl = c('s01', 'La inflación,'), s1Veinti = c('s01', 'veintitrés.'), s1Todos = c('s01', 'Y todos'), s1Atraso = c('s01', 'atraso');
  const s1Signif = c('s01', 'significa?');
  const s2 = SEGS.s02.at, s2Cien = c('s02', 'cien'), s2Hoy = c('s02', 'hoy cuesta'), s2Ciento = c('s02', 'ciento'), s2Pero = c('s02', 'Pero el dólar');
  const s2Movio = c('s02', 'movió.'), s2Ent = c('s02', 'Entonces,'), s2Sesenta = c('s02', 'sesenta'), s2Ochenta = c('s02', 'ochenta');
  const s2Cara = c('s02', 'más cara'), s2Eso = c('s02', 'Eso es el'), s2Precios = c('s02', 'los precios'), s2Corren = c('s02', 'corren,'), s2Camina = c('s02', 'camina.');
  const s3 = SEGS.s03.at, s3Viaja = c('s03', 'viaja'), s3Imp = c('s03', 'importado,'), s3Dol = c('s03', 'compra dólares'), s3Pierde = c('s03', '¿Quién pierde?');
  const s3Vende = c('s03', 'vende'), s3Campo = c('s03', 'campo,'), s3Ind = c('s03', 'industria,'), s3Tur = c('s03', 'turismo.');
  const s3Cobran = c('s03', 'Cobran'), s3Rinden = c('s03', 'rinden'), s3Costos = c('s03', 'costos'), s3Suben = c('s03', 'subiendo.');
  const s4 = SEGS.s04.at, s4Si = c('s04', 'Sí.'), s4Uno = c('s04', 'uno a uno'), s4Diecisiete = c('s04', 'diecisiete.'), s4Dos = c('s04', 'Las dos veces,');
  const s4Salto = c('s04', 'salto'), s4Dos02 = c('s04', 'dos mil dos,'), s4Tri = c('s04', 'triplicó.'), s4Dos18 = c('s04', 'dos mil dieciocho,'), s4Dup = c('s04', 'duplicó.');
  const s5 = SEGS.s05.at, s5Gob = c('s05', 'El Gobierno'), s5Dist = c('s05', 'distinto:'), s5Vaca = c('s05', 'Vaca'), s5Min = c('s05', 'minería');
  const s5Entrar = c('s05', 'entrar'), s5Fuerte = c('s05', 'fuerte'), s5Otros = c('s05', 'Otros advierten'), s5Ajust = c('s05', 'ajustado');
  const s5Debajo = c('s05', 'muy por debajo'), s5D18 = c('s05', 'dieciocho'), s5D19 = c('s05', 'diecinueve.');
  const s6 = SEGS.s06.at, s6Bueno = c('s06', 'bueno'), s6Malo = c('s06', 'malo'), s6Preg = c('s06', 'La pregunta'), s6Sost = c('s06', 'sostiene');
  const s6Verdad = c('s06', 'verdad,'), s6Presion = c('s06', 'acumulando'), s6Vos = c('s06', '¿Vos qué'), s6Regalo = c('s06', 'regalo'), s6Bomba = c('s06', 'bomba?');
  const s6Contame = c('s06', 'Contame'), s6Siq = c('s06', 'Y si querés'), s6Trece = c('s06', 'Trece');

  const sk = shake(T, s1Malo, 16, 0.5);
  const sk2 = shake(T, s4Salto + 0.2, 20, 0.6);

  return (
    <AbsoluteFill>
      <SvgDefs />
      <Paper>
        {/* etiqueta superior */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', opacity: T < E ? 1 : 0}}>
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 14, fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: C.ink}}>
            <span style={{width: 18, height: 18, background: C.yellow, borderRadius: 4, display: 'inline-block'}} /> CONTEXTO · EL DÓLAR BARATO
          </span>
        </div>

        {/* ============ S01 ============ */}
        {/* 1. Gancho: el dólar en oferta */}
        <Beat t={T} t0={-0.2} t1={s1Anio} kind="fade">
          <div style={{position: 'absolute', inset: 0, transform: `translate(${sk.x}px, ${sk.y}px)`}}>
            <Photo src="cotizacion_calle.jpg" t={T} t0={0} t1={s1Anio} x={540} y={520} w={860} h={420} rot={-3} bw tape credit="Gastón Cuello · CC BY-SA 4.0" />
            <div style={{position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', fontFamily: F.head, fontSize: 150, lineHeight: 1, transform: `scale(${0.8 + 0.2 * pop(T, 0.2)})`}}>
              EL DÓLAR ESTÁ<br />
              <Mark t={T} t0={s1Barato}>BARATO</Mark>
            </div>
            <div style={{position: 'absolute', left: 600, top: 330, transform: `rotate(${10 + Math.sin(T * 5) * 6}deg) scale(${pop(T, s1Barato + 0.15)})`, transformOrigin: '20px 90px'}}>
              <PriceTag w={380} text="OFERTA" color={C.yellow} />
            </div>
            <Stamp t={T} t0={s1Malo} text="¿ES MALO?" x={540} y={1130} size={120} rot={-7} />
          </div>
        </Beat>

        {/* 2. Dólar +4 % vs inflación +23 % */}
        <Beat t={T} t0={s1Anio - 0.1} t1={s1Todos} kind="up">
          <Kicker style={{position: 'absolute', left: 0, right: 0, top: 300}}>EN LO QUE VA DE 2026</Kicker>
          <div style={{position: 'absolute', left: 130, top: 400, width: 820, height: 760, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around'}}>
            {[
              {l: 'DÓLAR', v: 4.1, lab: '+4%', col: C.green, t0: s1Cuatro - 0.2},
              {l: 'INFLACIÓN', v: 23, lab: '+23%', col: C.red, t0: s1Veinti - 0.3},
            ].map((b) => (
              <div key={b.l} style={{width: 320, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <div style={{fontFamily: F.head, fontSize: 120, color: b.col, opacity: prog(T, b.t0 + 0.3, 0.3), transform: `scale(${pop(T, b.t0 + 0.3)})`}}>{b.lab}</div>
                <div style={{width: 260, height: (b.v / 23) * 480 * prog(T, b.t0, 0.9) + 8, background: b.col, border: `5px solid ${C.ink}`, borderRadius: '10px 10px 0 0'}} />
                <div style={{fontFamily: F.head, fontSize: 64, marginTop: 14, opacity: prog(T, b.l === 'DÓLAR' ? s1Anio : s1Infl, 0.4)}}>{b.l}</div>
              </div>
            ))}
          </div>
          <div style={{position: 'absolute', left: 100, right: 100, top: 1156, height: 6, background: C.ink}} />
          <Src t={T} t0={s1Cuatro} text="Dólar mayorista 1/1 al 21/9/2026 · inflación estimada del período · Infobae" y={1180} />
        </Beat>

        {/* 3. Atraso cambiario: todos lo dicen */}
        <Beat t={T} t0={s1Todos - 0.1} t1={s2 - 0.05} kind="fade">
          {Array.from({length: 9}).map((_, i) => {
            const t0 = s1Todos + 0.1 + i * 0.12;
            if (T < t0) return null;
            return (
              <div key={i} style={{position: 'absolute', left: 40 + rnd(i + 4) * 620, top: 300 + rnd(i + 21) * 860, transform: `scale(${pop(T, t0)}) rotate(${(rnd(i) - 0.5) * 24}deg)`, opacity: 0.9 - prog(T, s1Atraso, 0.5) * 0.55}}>
                <div style={{background: i % 2 ? C.white : '#F7F3EB', border: `4px solid ${C.ink}`, borderRadius: 26, padding: '10px 22px', fontFamily: F.script, fontWeight: 700, fontSize: 44, color: C.ink}}>
                  “atraso cambiario”
                </div>
              </div>
            );
          })}
          <div style={{position: 'absolute', left: 60, right: 60, top: 560, textAlign: 'center', transform: `scale(${pop(T, s1Atraso - 0.05)})`, opacity: T > s1Atraso - 0.1 ? 1 : 0}}>
            <Card style={{padding: '30px 20px'}}>
              <div style={{fontFamily: F.head, fontSize: 170, lineHeight: 1}}>
                <Mark t={T} t0={s1Atraso + 0.2}>ATRASO</Mark>
                <br />
                CAMBIARIO
              </div>
            </Card>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 1000, textAlign: 'center', fontFamily: F.hand, fontSize: 96, color: C.red, transform: `rotate(-4deg) scale(${pop(T, s1Signif - 0.3)})`, opacity: T > s1Signif - 0.35 ? 1 : 0}}>
            ¿qué significa?
          </div>
        </Beat>

        {/* ============ S02 ============ */}
        {/* 4. La cuenta: precios +23 %, dólar +4 % */}
        <Beat t={T} t0={s2 - 0.05} t1={s2Ent} kind="up">
          <Kicker style={{position: 'absolute', left: 0, right: 0, top: 300}}>HAGAMOS UNA CUENTA</Kicker>
          <Card style={{position: 'absolute', left: 70, width: 940, top: 380, height: 780, padding: 0, overflow: 'hidden'}}>
            <div style={{position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 58px, rgba(116,172,223,0.35) 58px 61px)'}} />
            <div style={{position: 'absolute', left: 64, top: 0, bottom: 0, width: 4, background: 'rgba(226,59,46,0.45)'}} />
            {/* precio */}
            <div style={{position: 'absolute', left: 100, top: 40, fontFamily: F.body, fontWeight: 800, fontSize: 34, letterSpacing: 5, color: C.ink2}}>UN PRODUCTO</div>
            {[
              {l: 'ENERO', txt: '$100.000', t0: s2Cien, y: 110},
              {l: 'HOY', txt: '$123.000', t0: s2Ciento, y: 250},
            ].map((r) => (
              <div key={r.l} style={{position: 'absolute', left: 100, top: r.y, display: 'flex', alignItems: 'center', gap: 20, opacity: T > r.t0 - 0.2 ? 1 : 0}}>
                <div style={{width: 190, fontFamily: F.head, fontSize: 60}}>{r.l}</div>
                <div style={{transform: `scale(${pop(T, r.t0 - 0.2)})`}}>
                  <Tag text={r.txt} color={r.l === 'HOY' ? C.red : C.yellow} size={66} />
                </div>
              </div>
            ))}
            <div style={{position: 'absolute', right: 30, top: 10, fontFamily: F.hand, fontSize: 96, color: C.red, transform: `rotate(-8deg) scale(${pop(T, s2Ciento + 0.6)})`, opacity: T > s2Ciento + 0.6 ? 1 : 0}}>+23%</div>
            {/* dólar */}
            <div style={{position: 'absolute', left: 100, top: 440, fontFamily: F.body, fontWeight: 800, fontSize: 34, letterSpacing: 5, color: C.ink2, opacity: prog(T, s2Pero - 0.1, 0.3)}}>EL DÓLAR</div>
            {[
              {l: 'ENERO', txt: '$1.460', y: 500},
              {l: 'HOY', txt: '$1.520', y: 610},
            ].map((r, i) => {
              const t0 = s2Pero + i * 0.45;
              return (
                <div key={r.l} style={{position: 'absolute', left: 100, top: r.y, display: 'flex', alignItems: 'center', gap: 20, opacity: T > t0 ? 1 : 0, transform: `translateX(${(1 - prog(T, t0, 0.4)) * -80}px)`}}>
                  <div style={{width: 190, fontFamily: F.head, fontSize: 60}}>{r.l}</div>
                  <DollarBill w={190} value="1" />
                  <div style={{fontFamily: F.head, fontSize: 70, marginLeft: 16}}>= {r.txt}</div>
                </div>
              );
            })}
            <div style={{position: 'absolute', right: 30, top: 400, fontFamily: F.hand, fontSize: 96, color: C.green, transform: `rotate(-8deg) scale(${pop(T, s2Movio)})`, opacity: T > s2Movio ? 1 : 0}}>+4%</div>
          </Card>
          <Src t={T} t0={s2Pero} text="Ejemplo con la inflación estimada 2026 · dólar mayorista" />
        </Beat>

        {/* 5. Medido en dólares: de 68 a 81 */}
        <Beat t={T} t0={s2Ent - 0.05} t1={s2Eso} kind="fade">
          <Kicker style={{position: 'absolute', left: 0, right: 0, top: 300}}>MEDIDO EN DÓLARES</Kicker>
          <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', fontFamily: F.mono, fontWeight: 700, fontSize: 38, color: C.ink2, lineHeight: 1.6}}>
            <div style={{opacity: prog(T, s2Ent + 0.3, 0.3)}}>100.000 ÷ 1.460 ≈ US$ 68</div>
            <div style={{opacity: prog(T, s2Ochenta - 0.4, 0.3)}}>123.000 ÷ 1.520 ≈ US$ 81</div>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center', fontFamily: F.head, lineHeight: 0.95, opacity: prog(T, s2Ent + 0.1, 0.3), transform: `scale(${0.8 + 0.2 * pop(T, s2Ent + 0.1)})`}}>
            <div style={{fontSize: 150, color: C.green}}>US$</div>
            <div style={{fontSize: 400, color: T > s2Ochenta + 0.5 ? C.red : C.ink}}>
              <Counter t={T} t0={s2Ochenta - 0.1} t1={s2Ochenta + 0.6} from={68} to={81} />
            </div>
          </div>
          <Stamp t={T} t0={s2Cara} text="+18% MÁS CARA" sub="LA ARGENTINA, EN DÓLARES" x={540} y={1110} size={96} rot={-6} />
        </Beat>

        {/* 6. Los precios corren, el dólar camina */}
        <Beat t={T} t0={s2Eso - 0.05} t1={SEGS.s03.at - 0.05} kind="fade">
          <div style={{position: 'absolute', left: 60, right: 60, top: 320, textAlign: 'center'}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 38, letterSpacing: 8, color: C.gray}}>ESO ES EL</div>
            <div style={{fontFamily: F.head, fontSize: 130, lineHeight: 1}}>
              <Mark t={T} t0={s2Eso + 0.3}>ATRASO CAMBIARIO</Mark>
            </div>
          </div>
          {[
            {l: 'PRECIOS', v: 'CORREN', t0: s2Corren - 0.3, speed: 1, y: 640, col: C.red},
            {l: 'DÓLAR', v: 'CAMINA', t0: s2Camina - 0.4, speed: 0.18, y: 900, col: C.green},
          ].map((r) => {
            const p = clamp((T - r.t0) / 1.6) * r.speed;
            const bob = T > r.t0 ? Math.abs(Math.sin((T - r.t0) * (r.speed > 0.5 ? 14 : 5))) * 18 : 0;
            return (
              <div key={r.l} style={{position: 'absolute', left: 0, right: 0, top: r.y, opacity: prog(T, s2Precios - 0.2, 0.3)}}>
                <div style={{position: 'absolute', left: 60, right: 60, top: 170, height: 6, background: C.ink, backgroundImage: `repeating-linear-gradient(90deg, ${C.ink} 0 30px, transparent 30px 50px)`}} />
                <div style={{position: 'absolute', left: 900, top: 40, width: 10, height: 140, background: C.ink}} />
                <div style={{position: 'absolute', left: 60 + p * 600, top: 30 - bob}}>
                  {r.l === 'PRECIOS' ? <Tag text="$$$" color={C.red} size={70} /> : <DollarBill w={240} value="1" />}
                </div>
                <div style={{position: 'absolute', left: 60, top: -60, fontFamily: F.head, fontSize: 56, color: r.col}}>
                  {r.l} <span style={{fontFamily: F.hand, fontSize: 56, color: C.ink, opacity: T > r.t0 ? 1 : 0}}>· {r.v.toLowerCase()}</span>
                </div>
              </div>
            );
          })}
        </Beat>

        {/* ============ S03 ============ */}
        {/* 7. Quién gana, quién pierde */}
        <Beat t={T} t0={s3 - 0.05} t1={s3Cobran} kind="up">
          {[
            {h: 'GANAN', col: C.green, t0: s3, y: 300, items: [
              {l: 'VIAJAR AFUERA', i: <Plane size={130} />, t0: s3Viaja},
              {l: 'IMPORTADOS', i: <Box size={130} />, t0: s3Imp},
              {l: 'COMPRAR DÓLARES', i: <DollarBill w={150} value="1" />, t0: s3Dol},
            ]},
            {h: 'PIERDEN', col: C.red, t0: s3Pierde, y: 760, items: [
              {l: 'EL CAMPO', i: <Wheat size={130} />, t0: s3Campo},
              {l: 'LA INDUSTRIA', i: <Factory size={130} />, t0: s3Ind},
              {l: 'EL TURISMO', i: <Suitcase size={130} />, t0: s3Tur},
            ]},
          ].map((g) => (
            <div key={g.h} style={{position: 'absolute', left: 50, right: 50, top: g.y, opacity: T > g.t0 - 0.1 ? 1 : 0}}>
              <div style={{display: 'inline-block', background: g.col, color: C.white, fontFamily: F.head, fontSize: 70, padding: '4px 30px', border: `5px solid ${C.ink}`, transform: `rotate(-2deg) scale(${pop(T, g.t0 - 0.1)})`}}>
                {g.h}
              </div>
              {g.h === 'PIERDEN' ? (
                <span style={{marginLeft: 20, fontFamily: F.script, fontWeight: 700, fontSize: 44, opacity: prog(T, s3Vende, 0.4)}}>los que exportan o compiten con importados</span>
              ) : null}
              <div style={{display: 'flex', gap: 26, marginTop: 24}}>
                {g.items.map((it) => (
                  <Card key={it.l} style={{width: 300, height: 290, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: `7px 7px 0 ${C.ink}`, opacity: T > it.t0 - 0.15 ? 1 : 0, transform: `scale(${pop(T, it.t0 - 0.15)})`}}>
                    <div style={{height: 150, display: 'flex', alignItems: 'center'}}>{it.i}</div>
                    <div style={{fontFamily: F.head, fontSize: 40, textAlign: 'center', lineHeight: 1.05, padding: '0 10px'}}>{it.l}</div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </Beat>

        {/* 8. La tijera: ingresos en dólares vs costos en pesos */}
        <Beat t={T} t0={s3Cobran - 0.05} t1={s4 - 0.05} kind="fade">
          <Kicker style={{position: 'absolute', left: 0, right: 0, top: 300}}>EL PROBLEMA DEL QUE EXPORTA</Kicker>
          {[
            {l: 'SUS DÓLARES', s: 'rinden menos', up: false, col: C.green, t0: s3Rinden - 0.2, x: 110},
            {l: 'SUS COSTOS', s: 'en pesos, suben', up: true, col: C.red, t0: s3Costos - 0.1, x: 580},
          ].map((a) => {
            const k = prog(T, a.t0, 0.7);
            return (
              <div key={a.l} style={{position: 'absolute', left: a.x, top: 420, width: 390, textAlign: 'center', opacity: T > a.t0 - 0.1 ? 1 : 0}}>
                <div style={{fontFamily: F.head, fontSize: 70, color: a.col}}>{a.l}</div>
                <div style={{fontFamily: F.hand, fontSize: 52, marginTop: 6}}>{a.s}</div>
                <div style={{marginTop: 30, height: 420, display: 'flex', alignItems: a.up ? 'flex-end' : 'flex-start', justifyContent: 'center'}}>
                  <div style={{transform: `translateY(${(a.up ? 1 - k : k - 1) * 120 + (a.up ? -Math.max(0, T - s3Suben) * 30 : 0)}px) scale(${0.6 + 0.4 * k})`}}>
                    <Arrow size={380} color={a.col} up={a.up} />
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{position: 'absolute', left: 540 - 90, top: 760, transform: `scale(${pop(T, s3Costos + 0.4)})`, opacity: T > s3Costos + 0.4 ? 1 : 0}}>
            <Factory size={180} />
          </div>
        </Beat>

        {/* ============ S04 ============ */}
        {/* 9. ¿Ya pasó? Sí: el 1 a 1 y 2017 */}
        <Beat t={T} t0={s4 - 0.05} t1={s4Dos} kind="fade">
          <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: F.head, fontSize: 130, transform: `scale(${pop(T, s4)})`}}>¿YA PASÓ?</div>
          <Stamp t={T} t0={s4Si} text="SÍ" x={900} y={450} size={110} rot={12} />
          <Photo src="billete_peso_1992.jpg" t={T} t0={s4Uno - 0.2} t1={s4Dos} x={330} y={720} w={540} h={360} rot={-5} tape credit="CC BY 4.0" />
          <div style={{position: 'absolute', left: 60, top: 930, width: 540, textAlign: 'center', fontFamily: F.head, fontSize: 64, lineHeight: 1.05, transform: `scale(${pop(T, s4Uno)})`, opacity: T > s4Uno ? 1 : 0}}>
            <Mark t={T} t0={s4Uno + 0.2}>$1 = US$1</Mark>
            <div style={{fontFamily: F.hand, fontSize: 46}}>los años 90</div>
          </div>
          <div style={{position: 'absolute', left: 640, top: 600, transform: `rotate(6deg) scale(${pop(T, s4Diecisiete - 0.5)})`, opacity: T > s4Diecisiete - 0.5 ? 1 : 0}}>
            <Card style={{width: 380, padding: '30px 10px', textAlign: 'center'}}>
              <div style={{fontFamily: F.head, fontSize: 150, lineHeight: 1}}>2017</div>
              <div style={{fontFamily: F.hand, fontSize: 44, marginTop: 10}}>dólar barato otra vez</div>
            </Card>
          </div>
        </Beat>

        {/* 10. El salto: x3 y x2 */}
        <Beat t={T} t0={s4Dos - 0.05} t1={s5 - 0.05} kind="fade">
          <div style={{position: 'absolute', inset: 0, transform: `translate(${sk2.x}px, ${sk2.y}px)`}}>
            <Kicker style={{position: 'absolute', left: 0, right: 0, top: 300}}>LAS DOS VECES TERMINÓ IGUAL</Kicker>
            {/* línea que se dispara */}
            <svg width="960" height="330" viewBox="0 0 960 330" style={{position: 'absolute', left: 60, top: 400, overflow: 'visible'}}>
              {(() => {
                const p = clamp((T - (s4Dos + 0.2)) / 1.2);
                const j = easeOut(clamp((T - (s4Salto + 0.1)) / 0.35));
                const xEnd = 60 + p * 640;
                const d = `M60 280 L${xEnd} ${280 - p * 20}` + (j > 0 ? ` L${700 + j * 40} ${260 - j * 160} L${740 + j * 160} ${100 - j * 5}` : '');
                return (
                  <>
                    <line x1="40" x2="940" y1="300" y2="300" stroke={C.ink} strokeWidth="5" />
                    <path d={d} fill="none" stroke={C.red} strokeWidth="14" strokeLinejoin="round" strokeLinecap="round" />
                    <text x="80" y="250" fontFamily="Permanent Marker" fontSize="40" fill={C.ink} opacity={p}>dólar barato…</text>
                    {j > 0.9 ? <text x="420" y="130" fontFamily="Anton" fontSize="80" fill={C.red} transform={`rotate(-8 420 130)`}>¡SALTO!</text> : null}
                  </>
                );
              })()}
            </svg>
            {[
              {y: '2002', big: '×3', sub: '$1 → $3,4', t0: s4Dos02, tb: s4Tri, x: 70},
              {y: '2018', big: '×2', sub: '$19 → $38', t0: s4Dos18, tb: s4Dup, x: 560},
            ].map((b) => (
              <div key={b.y} style={{position: 'absolute', left: b.x, top: 760, opacity: T > b.t0 - 0.1 ? 1 : 0, transform: `scale(${pop(T, b.t0 - 0.1)}) rotate(${b.y === '2002' ? -2 : 2}deg)`}}>
                <Card style={{width: 450, height: 400, textAlign: 'center', padding: '20px 0'}}>
                  <div style={{fontFamily: F.head, fontSize: 90, lineHeight: 1}}>{b.y}</div>
                  <div style={{fontFamily: F.head, fontSize: 190, lineHeight: 1.05, color: C.red, transform: `scale(${pop(T, b.tb - 0.2)})`, opacity: T > b.tb - 0.25 ? 1 : 0}}>{b.big}</div>
                  <div style={{fontFamily: F.mono, fontWeight: 700, fontSize: 40, opacity: prog(T, b.tb, 0.4)}}>{b.sub}</div>
                </Card>
              </div>
            ))}
            <Src t={T} t0={s4Tri} text="Dólar oficial mayorista · cierres de 2001/2002 y 2017/2018 · BCRA" y={1200} />
          </div>
        </Beat>

        {/* ============ S05 ============ */}
        {/* 11. La otra mirada: esta vez es distinto */}
        <Beat t={T} t0={s5 - 0.05} t1={s5Otros} kind="up">
          <Kicker style={{position: 'absolute', left: 0, right: 0, top: 300}}>PERO HAY OTRA MIRADA</Kicker>
          <div style={{position: 'absolute', left: 80, right: 80, top: 380, textAlign: 'center', opacity: T > s5Gob - 0.1 ? 1 : 0, transform: `scale(${pop(T, s5Gob - 0.1)})`}}>
            <Card style={{padding: '24px 30px'}}>
              <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 5, color: C.gray}}>EL GOBIERNO Y ALGUNOS ECONOMISTAS</div>
              <div style={{fontFamily: F.quote, fontStyle: 'italic', fontWeight: 800, fontSize: 84, lineHeight: 1.05, marginTop: 8}}>
                “Esta vez <Mark t={T} t0={s5Dist - 0.2}>es distinto</Mark>”
              </div>
            </Card>
          </div>
          {[
            {l: 'VACA MUERTA', i: <Derrick size={200} />, t0: s5Vaca, x: 120},
            {l: 'MINERÍA', i: <Pick size={200} />, t0: s5Min, x: 600},
          ].map((it) => (
            <div key={it.l} style={{position: 'absolute', left: it.x, top: 690, width: 360, textAlign: 'center', opacity: T > it.t0 - 0.15 ? 1 : 0, transform: `scale(${pop(T, it.t0 - 0.15)})`}}>
              {it.i}
              <div style={{fontFamily: F.head, fontSize: 56}}>{it.l}</div>
            </div>
          ))}
          {Array.from({length: 10}).map((_, i) => {
            const t0 = s5Entrar - 0.1 + i * 0.1;
            const k = clamp((T - t0) / 0.9);
            if (k <= 0 || T > s5Otros) return null;
            return (
              <div key={i} style={{position: 'absolute', left: 120 + rnd(i) * 700, top: 650 + easeOut(k) * 420, opacity: 1 - k * 0.3, transform: `rotate(${(rnd(i + 7) - 0.5) * 50}deg)`}}>
                <DollarBill w={170} value="100" />
              </div>
            );
          })}
          <div style={{position: 'absolute', left: 0, right: 0, top: 1050, textAlign: 'center', fontFamily: F.head, fontSize: 96, opacity: T > s5Fuerte - 0.1 ? 1 : 0, transform: `scale(${pop(T, s5Fuerte - 0.1)})`}}>
            <Mark t={T} t0={s5Fuerte} color={C.celeste}>PESO FUERTE</Mark>
          </div>
        </Beat>

        {/* 12. Ajustado por inflación: muy por debajo de 2018-2019 */}
        <Beat t={T} t0={s5Otros - 0.05} t1={s6 - 0.05} kind="fade">
          <Kicker style={{position: 'absolute', left: 0, right: 0, top: 300}}>OTROS ADVIERTEN</Kicker>
          <div style={{position: 'absolute', left: 0, right: 0, top: 350, textAlign: 'center', fontFamily: F.head, fontSize: 76, lineHeight: 1.05, opacity: prog(T, s5Ajust - 0.1, 0.3)}}>
            EL DÓLAR <Mark t={T} t0={s5Ajust + 0.1}>AJUSTADO POR INFLACIÓN</Mark>
          </div>
          <div style={{position: 'absolute', left: 110, top: 520, width: 860, height: 620, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around'}}>
            {[
              {l: '2018', v: 2400, lab: '≈ $2.400', t0: s5D18 - 0.2, col: C.ink2},
              {l: '2019', v: 2570, lab: '≈ $2.570', t0: s5D19 - 0.3, col: C.ink2},
              {l: 'HOY', v: 1515, lab: '≈ $1.515', t0: s5Debajo - 0.1, col: C.green},
            ].map((b) => (
              <div key={b.l} style={{width: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: T > b.t0 - 0.1 ? 1 : 0}}>
                <div style={{fontFamily: F.head, fontSize: 56, color: b.col, opacity: prog(T, b.t0 + 0.4, 0.3)}}>{b.lab}</div>
                <div style={{width: 200, height: (b.v / 2570) * 420 * prog(T, b.t0, 0.8), background: b.col, border: `5px solid ${C.ink}`, borderRadius: '10px 10px 0 0'}} />
                <div style={{fontFamily: F.head, fontSize: 64, marginTop: 10}}>{b.l}</div>
              </div>
            ))}
          </div>
          <Src t={T} t0={s5D18} text="En pesos de hoy, aprox. · cálculo de Salvador Vitelli citado por Bloomberg Línea" y={1200} />
        </Beat>

        {/* ============ S06 ============ */}
        {/* 13. Ni bueno ni malo: la pregunta */}
        <Beat t={T} t0={s6 - 0.05} t1={s6Vos} kind="fade">
          <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: F.head, fontSize: 110, lineHeight: 1.05}}>
            <span style={{opacity: T > s6Bueno - 0.1 ? 1 : 0}}><Strike t={T} t0={s6Bueno + 0.3}>BUENO</Strike></span>
            <span style={{fontFamily: F.hand, fontSize: 70, margin: '0 26px', opacity: T > s6Malo - 0.2 ? 1 : 0}}>ni</span>
            <span style={{opacity: T > s6Malo - 0.1 ? 1 : 0}}><Strike t={T} t0={s6Malo + 0.3}>MALO</Strike></span>
            <div style={{fontFamily: F.hand, fontSize: 60, opacity: prog(T, s6Malo + 0.5, 0.3)}}>por sí solo</div>
          </div>
          <Kicker style={{position: 'absolute', left: 0, right: 0, top: 560, opacity: prog(T, s6Preg, 0.3)}}>LA PREGUNTA ES</Kicker>
          <Card style={{position: 'absolute', left: 70, width: 900, top: 640, padding: '22px 30px', display: 'flex', alignItems: 'center', gap: 24, opacity: T > s6Sost - 0.15 ? 1 : 0, transform: `scale(${pop(T, s6Sost - 0.15)})`}}>
            <div style={{fontFamily: F.head, fontSize: 110, color: C.green}}>✓</div>
            <div style={{fontFamily: F.head, fontSize: 56, lineHeight: 1.05}}>
              ¿SE SOSTIENE CON <Mark t={T} t0={s6Verdad - 0.2} color={C.bill}>DÓLARES QUE ENTRAN DE VERDAD?</Mark>
            </div>
          </Card>
          <div style={{position: 'absolute', left: 0, right: 0, top: 870, textAlign: 'center', fontFamily: F.hand, fontSize: 60, opacity: prog(T, s6Presion - 0.4, 0.3)}}>¿o se acumula presión?</div>
          <div style={{position: 'absolute', left: 540 - 170, top: 950, opacity: T > s6Presion - 0.3 ? 1 : 0}}>
            <Gauge size={340} v={0.2 + 0.72 * prog(T, s6Presion, 1.3) + (T > s6Presion + 1.2 ? Math.sin(T * 40) * 0.015 : 0)} />
          </div>
        </Beat>

        {/* 14. ¿Regalo o bomba? */}
        <Beat t={T} t0={s6Vos - 0.05} t1={s6Siq} kind="pop">
          <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: F.head, fontSize: 96}}>¿VOS QUÉ PENSÁS?</div>
          {[
            {l: 'REGALO', i: <Gift size={300} open={prog(T, s6Regalo + 0.2, 0.5)} />, t0: s6Regalo - 0.1, x: 70, col: C.celeste},
            {l: 'BOMBA', i: <Bomb size={300} t={T} />, t0: s6Bomba - 0.1, x: 570, col: C.red},
          ].map((o) => (
            <div key={o.l} style={{position: 'absolute', left: o.x, top: 450, width: 440, textAlign: 'center', opacity: T > o.t0 ? 1 : 0, transform: `scale(${pop(T, o.t0)})`}}>
              <Card style={{height: 520, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                {o.i}
                <div style={{fontFamily: F.head, fontSize: 90, color: o.col, WebkitTextStroke: `3px ${C.ink}`}}>{o.l}</div>
              </Card>
            </div>
          ))}
          <div style={{position: 'absolute', left: 540 - 60, top: 650, width: 120, height: 120, borderRadius: 60, background: C.yellow, border: `5px solid ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.head, fontSize: 60, opacity: T > s6Bomba ? 1 : 0, transform: `scale(${pop(T, s6Bomba)})`}}>VS</div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 1030, textAlign: 'center', opacity: T > s6Contame - 0.1 ? 1 : 0, transform: `scale(${pop(T, s6Contame - 0.1)})`}}>
            <span style={{display: 'inline-block', background: C.ink, color: C.white, fontFamily: F.head, fontSize: 64, padding: '12px 36px', borderRadius: 40}}>CONTAME EN LOS COMENTARIOS ↓</span>
          </div>
        </Beat>

        {/* 15. Puente a 13 CEROS */}
        <Beat t={T} t0={s6Siq - 0.05} t1={E + 0.05} kind="fade">
          <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center'}}>
            <Kicker>¿POR QUÉ EL DÓLAR NOS OBSESIONA?</Kicker>
            <div style={{display: 'flex', justifyContent: 'center', fontFamily: F.head, fontSize: 96, marginTop: 70}}>
              <span>1</span>
              {Array.from({length: 13}).map((_, i) => {
                const on = T > s6Siq + 0.3 + i * 0.08;
                return (
                  <React.Fragment key={i}>
                    {i > 0 && (13 - i) % 3 === 0 ? <span style={{opacity: on ? 1 : 0}}>.</span> : null}
                    <span style={{color: T > s6Trece ? C.red : C.ink, opacity: on ? 1 : 0, display: 'inline-block', transform: `scale(${pop(T, s6Siq + 0.3 + i * 0.08)})`}}>0</span>
                  </React.Fragment>
                );
              })}
            </div>
            <div style={{fontFamily: F.head, fontSize: 130, marginTop: 70, lineHeight: 1.05, opacity: T > s6Trece - 0.1 ? 1 : 0, transform: `scale(${pop(T, s6Trece - 0.1)})`}}>
              MIRÁ <Mark t={T} t0={s6Trece + 0.1}>13 CEROS</Mark>
            </div>
          </div>
        </Beat>
      </Paper>

      <Captions T={T} />

      {/* Placa final */}
      {T > E ? (
        <AbsoluteFill style={{background: C.ink, clipPath: `circle(${clamp((T - E) / 0.5) * 150}% at 50% 45%)`}}>
          <Grain opacity={0.16} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center'}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 32, letterSpacing: 12, color: C.yellow, opacity: prog(T, E + 0.2, 0.4)}}>CONTEXTO · ARGENTINA, EXPLICADA</div>
            <div style={{fontFamily: F.head, fontSize: 250, lineHeight: 0.95, color: C.white, marginTop: 40, transform: `scale(${1.25 - 0.25 * prog(T, E, 0.45)})`}}>
              ¿REGALO<br /><span style={{color: C.yellow}}>O BOMBA?</span>
            </div>
            <div style={{fontFamily: F.hand, fontSize: 60, color: C.white, marginTop: 30, opacity: prog(T, E + 0.5, 0.4)}}>te leo en los comentarios</div>
            <div style={{display: 'inline-block', marginTop: 60, background: C.yellow, color: C.ink, border: `6px solid ${C.white}`, fontFamily: F.head, fontSize: 60, padding: '14px 36px', borderRadius: 14, transform: `scale(${pop(T, E + 1.1) * (1 + Math.sin((T - E) * 6) * 0.03)})`, opacity: T > E + 1.1 ? 1 : 0}}>
              ▶ MIRÁ 13 CEROS EN EL CANAL
            </div>
            <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 40, color: 'rgba(255,255,255,0.8)', marginTop: 34, opacity: prog(T, E + 1.6, 0.4)}}>Seguí a CONTEXTO para entender la Argentina</div>
          </div>
        </AbsoluteFill>
      ) : null}
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};

export const SDB_TOTAL = tl.total;
export const SDB_FPS = tl.fps;
