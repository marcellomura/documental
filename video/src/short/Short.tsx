import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import short from '../data/short.json';
import words from '../data/words.json';
import {C, F} from '../theme';
import {cue} from '../lib/words';
import {clamp, easeIn, pop, prog, rnd} from '../lib/anim';
import {Beat, Counter, Grain, Mark, Paper, Source, SvgDefs} from '../components/base';
import {Banknote, Book, CookieTin, DollarBill, Freezer, House, Mattress} from '../components/art';

/* Short vertical 1080x1920 que promociona el documental */

type Part = {id: string; seg: string; from: number; to: number; at: number; wordsTo?: number};
const PARTS = short.parts as Part[];
const WS = words as Record<string, {w: string; s: number; e: number}[]>;

/* tiempo del short en que se dice una palabra del guion */
const sc = (seg: string, phrase: string, n = 0, which: 's' | 'e' = 's') => {
  const t = cue(seg, phrase, n, which);
  const p = PARTS.find((q) => q.seg === seg && t >= q.from - 0.01 && t <= (q.wordsTo ?? q.to) + 0.01);
  if (!p) throw new Error('fuera del short: ' + phrase);
  return p.at + t - p.from;
};

/* palabras del short, en tiempo del short, agrupadas para subtítulos */
const CHUNKS = (() => {
  const list: {w: string; s: number; e: number}[] = [];
  for (const p of PARTS) {
    for (const w of WS[p.seg]) if (w.s >= p.from - 0.01 && w.s < (p.wordsTo ?? p.to) - 0.01) list.push({w: w.w, s: p.at + w.s - p.from, e: p.at + w.e - p.from});
  }
  const out: {words: typeof list; s: number; e: number}[] = [];
  let cur: typeof list = [];
  list.forEach((w, i) => {
    cur.push(w);
    const txt = cur.map((x) => x.w).join(' ');
    const punct = /[.,:?!»]$|\.\.\.$/.test(w.w);
    if (cur.length >= 3 || punct || txt.length > 15 || i === list.length - 1) {
      out.push({words: cur, s: cur[0].s, e: cur[cur.length - 1].e});
      cur = [];
    }
  });
  out.forEach((c, i) => (c.e = i < out.length - 1 ? Math.min(out[i + 1].s, c.e + 0.35) : c.e + 0.3));
  return out;
})();

const Captions: React.FC<{T: number}> = ({T}) => {
  const c = CHUNKS.find((x) => T >= x.s - 0.05 && T < x.e);
  if (!c || T > short.endCard - 0.1) return null;
  const k = pop(T, c.s - 0.05, 1.4);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1270, textAlign: 'center', transform: `scale(${0.85 + 0.15 * k})`}}>
      {c.words.map((w, i) => {
        const on = T >= w.s - 0.03;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block', margin: '0 12px', fontFamily: F.head, fontSize: 92, lineHeight: 1.15, textTransform: 'uppercase',
              color: on && T < w.e + 0.15 ? C.yellow : C.white,
              textShadow: '5px 5px 0 #161513, -5px -5px 0 #161513, 5px -5px 0 #161513, -5px 5px 0 #161513, 0 5px 0 #161513, 5px 0 0 #161513, -5px 0 0 #161513, 0 -5px 0 #161513, 0 14px 24px rgba(0,0,0,0.45)',
            }}
          >
            {w.w.replace(/[«»]/g, '')}
          </span>
        );
      })}
    </div>
  );
};

export const Short: React.FC = () => {
  const T = useCurrentFrame() / short.fps;
  const E = short.endCard;
  const tLibro = sc('s01', 'Adentro'), tLata = sc('s01', 'lata'), tFreezer = sc('s01', 'En el freezer'), tColchon = sc('s01', 'Debajo');
  const tChiste = sc('s01', 'Y no es'), tIndec = sc('s01', 'INDEC,'), tNum = sc('s01', 'doscientos'), tSist = sc('s01', 'sistema.', 0, 'e');
  const tCinco = sc('s01', 'Es más de cinco'), tVeces = sc('s01', 'veces'), tPero = sc('s01', 'Pero la verdadera'), tPorque = sc('s01', '¿por qué');
  const tMoneda = sc('s01', 'su propia'), tNo = sc('s01', 'no sirve'), tAhorrar = sc('s01', 'ahorrar?');
  const tPara = sc('s02', 'Para'), tContar = sc('s02', 'contar'), tHist = sc('s02', 'Porque'), tTrece = sc('s02', 'trece'), tDesap = sc('s02', 'desaparecieron.');
  const tCada = sc('s02', 'Y cada'), tRota = sc('s02', 'rota.'), tPromesa = sc('s02', 'promesa');
  const spots = [
    {t0: tLibro, label: 'UN LIBRO', icon: <Book size={300} />},
    {t0: tLata, label: 'LA LATA DE GALLETITAS', icon: <CookieTin size={300} />},
    {t0: tFreezer, label: 'EL FREEZER', icon: <Freezer size={300} />},
    {t0: tColchon, label: 'EL COLCHÓN', icon: <Mattress size={300} />},
  ];
  const active = spots.reduce((a, sp, i) => (T >= sp.t0 ? i : a), -1);
  const zeros = Array.from({length: 13});

  return (
    <AbsoluteFill>
      <SvgDefs />
      <Paper>
        {/* etiqueta superior */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', opacity: T < E ? 1 : 0}}>
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 14, fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: C.ink}}>
            <span style={{width: 18, height: 18, background: C.yellow, borderRadius: 4, display: 'inline-block'}} /> CONTEXTO · 13 CEROS
          </span>
        </div>

        {/* 1. La casa */}
        <Beat t={T} t0={-0.2} t1={tLibro - 0.05} kind="fade">
          <div style={{position: 'absolute', left: 540 - 330, top: 330, transform: `scale(${0.85 + 0.15 * pop(T, 0)})`}}>
            <House size={660} />
            {[0, 1, 2].map((i) => {
              const k = prog(T, sc('s01', 'dólares') + i * 0.18, 0.7);
              const sx = [-600, 600, -400][i], sy = [-300, -200, 500][i];
              return (
                <div key={i} style={{position: 'absolute', left: 230 + sx * (1 - k), top: 330 + sy * (1 - k), opacity: k < 1 ? clamp(k * 4) : 1 - prog(T, sc('s01', 'escondidos.') + 0.4, 0.3), transform: `rotate(${(1 - k) * 200 + i * 20}deg) scale(${1 - k * 0.6})`}}>
                  <DollarBill w={240} />
                </div>
              );
            })}
            {T > sc('s01', 'escondidos.') + 0.3 ? <div style={{position: 'absolute', left: 470, top: 20, fontFamily: F.hand, fontSize: 200, color: C.red, transform: `scale(${pop(T, sc('s01', 'escondidos.') + 0.3)}) rotate(12deg)`}}>?</div> : null}
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 1030, textAlign: 'center', fontFamily: F.hand, fontSize: 64, color: C.ink, opacity: prog(T, sc('s01', 'viejos,'), 0.4), transform: 'rotate(-3deg)'}}>(o la de tus viejos)</div>
        </Beat>

        {/* 2. Escondites en grilla 2x2 */}
        <Beat t={T} t0={tLibro - 0.1} t1={tChiste + 0.1} kind="fade">
          <div style={{position: 'absolute', left: 90, top: 320, width: 900, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 30}}>
            {spots.map((sp, i) => {
              const isA = i === active;
              return (
                <div key={i} style={{width: 435, height: 440, background: isA ? C.white : '#F7F3EB', border: `5px solid ${C.ink}`, borderRadius: 22, boxShadow: isA ? `12px 12px 0 ${C.ink}` : `6px 6px 0 ${C.ink}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: T < sp.t0 ? 0 : 1, transform: `scale(${pop(T, sp.t0) * (isA ? 1.04 : 0.96)}) rotate(${(i % 2 ? 1.5 : -1.5)}deg)`}}>
                  {sp.icon}
                  <div style={{fontFamily: F.head, fontSize: i === 1 ? 38 : 50, textAlign: 'center', lineHeight: 1.05, padding: '0 16px'}}>
                    {isA ? <Mark t={T} t0={sp.t0 + 0.15}>{sp.label}</Mark> : sp.label}
                  </div>
                </div>
              );
            })}
          </div>
        </Beat>

        {/* 3. Contador */}
        <Beat t={T} t0={tChiste + 0.2} t1={tCinco} kind="fade">
          <div style={{position: 'absolute', left: 0, right: 0, top: 340, textAlign: 'center'}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 46, letterSpacing: 8, color: C.ink2, opacity: prog(T, tIndec, 0.4)}}>
              SEGÚN EL <Mark t={T} t0={tIndec + 0.1}>INDEC</Mark>
            </div>
            <div style={{fontFamily: F.head, lineHeight: 0.95, marginTop: 40, opacity: prog(T, tNum - 0.3, 0.3)}}>
              <div style={{fontSize: 150, color: C.green}}>US$</div>
              <div style={{fontSize: 250, color: C.ink}}><Counter t={T} t0={tNum - 0.2} t1={tSist - 0.2} to={220854} /></div>
              <div style={{fontSize: 150, color: C.ink}}>MILLONES</div>
            </div>
            <div style={{fontFamily: F.head, fontSize: 96, marginTop: 30, opacity: prog(T, sc('s01', 'fuera'), 0.3)}}>
              <Mark t={T} t0={sc('s01', 'fuera')}>FUERA DEL SISTEMA</Mark>
            </div>
          </div>
        </Beat>

        {/* 4. Barras vs reservas */}
        <Beat t={T} t0={tCinco - 0.05} t1={tPero - 0.1} kind="up">
          <div style={{position: 'absolute', left: 150, top: 330, width: 780, height: 820, display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: 80}}>
            {[
              {v: 220854, l: 'FUERA DEL SISTEMA', lab: '220.854', c: C.green, t0: tCinco + 0.1},
              {v: 42052, l: 'RESERVAS DEL BANCO CENTRAL', lab: '42.052', c: C.ink, t0: tCinco + 0.9},
            ].map((b) => (
              <div key={b.l} style={{width: 330, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <div style={{fontFamily: F.head, fontSize: 70, color: b.c, opacity: prog(T, b.t0 + 0.4, 0.3)}}>{b.lab}</div>
                <div style={{width: 300, height: (b.v / 220854) * 560 * prog(T, b.t0, 0.8), background: b.c, borderRadius: '8px 8px 0 0'}} />
                <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 28, textAlign: 'center', marginTop: 14, height: 70}}>{b.l}</div>
              </div>
            ))}
          </div>
          <div style={{position: 'absolute', right: 110, top: 520, fontFamily: F.hand, fontSize: 200, color: C.red, transform: `rotate(-8deg) scale(${pop(T, tVeces)})`, opacity: T > tVeces ? 1 : 0}}>×5</div>
          <Source t={T} t0={tCinco} text="INDEC y BCRA · millones de US$ · 31/03/2026" x={1860} y={1200} />
        </Beat>

        {/* 5. La pregunta */}
        <Beat t={T} t0={tPero - 0.1} t1={tPara - 0.1} kind="fade">
          <div style={{position: 'absolute', left: 0, right: 0, top: 340, textAlign: 'center'}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 40, letterSpacing: 8, color: C.gray}}>LA VERDADERA PREGUNTA</div>
            <div style={{fontFamily: F.head, fontSize: 250, marginTop: 10, transform: `scale(${0.8 + 0.2 * pop(T, tPorque)})`, opacity: T > tPorque ? 1 : 0}}>¿POR QUÉ?</div>
          </div>
          {T > tMoneda - 0.1 ? (
            <div style={{position: 'absolute', left: 540 - 300, top: 700, transform: `scale(${pop(T, tMoneda - 0.1)}) rotate(${-4 + prog(T, tNo, 0.6) * 25}deg) translateY(${easeIn(clamp((T - tNo - 0.2) / 1.0)) * 900}px)`, filter: `grayscale(${prog(T, tNo, 0.4)})`}}>
              <Banknote w={600} value="$1" name="PESO ARGENTINO" color="#DCC7E8" dark="#4B2F66" />
            </div>
          ) : null}
          <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', fontFamily: F.head, fontSize: 130, lineHeight: 1.05, opacity: prog(T, tNo + 0.3, 0.3)}}>
            NO SIRVE PARA<br />
            <Mark t={T} t0={tAhorrar} color={C.red}><span style={{color: T > tAhorrar + 0.2 ? C.white : C.ink}}>AHORRAR</span></Mark>
          </div>
        </Beat>

        {/* 6. Hay que contar ceros */}
        <Beat t={T} t0={tPara - 0.1} t1={tHist} kind="fade">
          {Array.from({length: 22}).map((_, i) => {
            const t0 = tContar - 0.2 + i * 0.05;
            if (T < t0) return null;
            return (
              <div key={i} style={{position: 'absolute', left: 60 + rnd(i) * 900, top: 320 + rnd(i + 50) * 850, fontFamily: F.head, fontSize: 90 + rnd(i + 9) * 150, color: i % 3 === 0 ? C.yellow : C.ink, transform: `scale(${pop(T, t0)}) rotate(${(rnd(i + 3) - 0.5) * 40}deg)`}}>0</div>
            );
          })}
          <div style={{position: 'absolute', left: 90, right: 90, top: 640, textAlign: 'center', background: C.paper, padding: '16px 20px', border: `6px solid ${C.ink}`, boxShadow: `12px 12px 0 ${C.ink}`, transform: `scale(${pop(T, tContar)})`, opacity: T > tContar - 0.1 ? 1 : 0}}>
            <div style={{fontFamily: F.head, fontSize: 120, lineHeight: 1.05}}>HAY QUE<br /><Mark t={T} t0={tContar + 0.2}>CONTAR CEROS</Mark></div>
          </div>
        </Beat>

        {/* 7. 13 ceros que desaparecen */}
        <Beat t={T} t0={tHist} t1={tCada} kind="fade">
          <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center'}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 40, letterSpacing: 8, color: C.gray}}>LA HISTORIA DEL PESO</div>
            <div style={{display: 'flex', justifyContent: 'center', fontFamily: F.head, fontSize: 118, marginTop: 70}}>
              <span>1</span>
              {zeros.map((_, i) => {
                const hi = T > tTrece + i * 0.07;
                const fall = clamp((T - (tDesap + 0.1 + (12 - i) * 0.07)) / 0.6);
                return (
                  <React.Fragment key={i}>
                    {i > 0 && (13 - i) % 3 === 0 ? <span style={{opacity: 1 - fall}}>.</span> : null}
                    <span style={{color: hi ? C.red : C.ink, display: 'inline-block', transform: `translateY(${easeIn(fall) * 900}px) rotate(${fall * (rnd(i) - 0.5) * 180}deg)`}}>0</span>
                  </React.Fragment>
                );
              })}
            </div>
            <div style={{fontFamily: F.head, fontSize: 110, marginTop: 70, lineHeight: 1.05, opacity: prog(T, tTrece, 0.3)}}>
              <Mark t={T} t0={tTrece}>13 CEROS</Mark>
              <br />QUE DESAPARECIERON
            </div>
          </div>
        </Beat>

        {/* 8. La promesa rota */}
        <Beat t={T} t0={tCada} t1={E + 0.05} kind="fade">
          {[0, 1].map((h) => {
            const k = prog(T, tRota, 0.6);
            const clip = h === 0 ? 'polygon(0 0, 54% 0, 47% 22%, 56% 40%, 45% 58%, 55% 78%, 48% 100%, 0 100%)' : 'polygon(54% 0, 100% 0, 100% 100%, 48% 100%, 55% 78%, 45% 58%, 56% 40%, 47% 22%)';
            return (
              <div key={h} style={{position: 'absolute', left: 540 - 250, top: 330, width: 500, height: 620, clipPath: clip, transform: `translate(${(h ? 1 : -1) * k * 110}px, ${k * 30}px) rotate(${(h ? 1 : -1) * k * 14}deg)`}}>
                <svg width="500" height="620" viewBox="0 0 500 620"><ellipse cx="250" cy="310" rx="185" ry="260" fill="none" stroke={C.ink} strokeWidth="100" /></svg>
              </div>
            );
          })}
          <div style={{position: 'absolute', left: 0, right: 0, top: 1010, textAlign: 'center', fontFamily: F.head, fontSize: 96, lineHeight: 1.1, opacity: prog(T, tPromesa, 0.3)}}>
            CADA CERO:<br />
            <Mark t={T} t0={tPromesa + 0.1} color={C.red}><span style={{color: C.white}}>UNA PROMESA ROTA</span></Mark>
          </div>
        </Beat>
      </Paper>

      <Captions T={T} />

      {/* Placa final: al documental completo */}
      {T > E ? (
        <AbsoluteFill style={{background: C.ink, clipPath: `circle(${clamp((T - E) / 0.5) * 150}% at 50% 45%)`}}>
          <Grain opacity={0.16} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center'}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 32, letterSpacing: 12, color: C.yellow, opacity: prog(T, E + 0.2, 0.4)}}>CONTEXTO · ARGENTINA, EXPLICADA</div>
            <div style={{fontFamily: F.head, fontSize: 330, lineHeight: 0.95, color: C.white, marginTop: 30, transform: `scale(${1.25 - 0.25 * prog(T, E, 0.45)})`}}>
              13<br /><span style={{color: C.yellow}}>CEROS</span>
            </div>
            <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 46, color: 'rgba(255,255,255,0.85)', margin: '30px 90px 0', lineHeight: 1.3, opacity: prog(T, E + 0.4, 0.5)}}>
              Por qué los argentinos no confían en su propia moneda
            </div>
            <div style={{display: 'inline-block', marginTop: 60, background: C.yellow, color: C.ink, border: `6px solid ${C.white}`, fontFamily: F.head, fontSize: 64, padding: '14px 36px', borderRadius: 14, transform: `scale(${pop(T, E + 1.2) * (1 + Math.sin((T - E) * 6) * 0.03)})`, opacity: T > E + 1.2 ? 1 : 0}}>
              ▶ DOCUMENTAL COMPLETO
            </div>
            <div style={{fontFamily: F.hand, fontSize: 56, color: C.white, marginTop: 30, opacity: prog(T, E + 1.6, 0.4)}}>en el canal · link abajo ↓</div>
          </div>
        </AbsoluteFill>
      ) : null}
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};
