import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, F} from '../theme';
import {cue, segWords} from '../lib/words';
import {clamp, easeIn, easeOut, fmt, pop, prog, rnd, shake} from '../lib/anim';
import {Beat, Center, ChapterTag, Counter, Dark, Grain, H, LowerThird, Mark, Paper, Photo, Source, Stamp, Strike} from '../components/base';
import {Banknote, Bank, Bell, Boat, Bubble, DollarBill, Fence, Mattress, Note, Padlock, Vault} from '../components/art';
import {BarsV, LineChart} from '../components/charts';

type P = {t: number};

const Quote: React.FC<{t: number; seg: string; from: string; to: string; size?: number; color?: string}> = ({t, seg, from, to, size = 110, color = C.ink}) => {
  const ws = segWords(seg);
  const a = cue(seg, from), b = cue(seg, to, 0, 'e');
  const list = ws.filter((w) => w.s >= a - 0.001 && w.e <= b + 0.001);
  return (
    <div style={{fontFamily: F.quote, fontStyle: 'italic', fontWeight: 800, fontSize: size, lineHeight: 1.1, color}}>
      <span style={{color: C.red}}>“</span>
      {list.map((w, i) => {
        const k = prog(t, w.s - 0.08, 0.25);
        return <span key={i} style={{display: 'inline-block', marginRight: '0.25em', opacity: 0.12 + 0.88 * k}}>{w.w.replace(/[«»]/g, '')}</span>;
      })}
      <span style={{color: C.red}}>”</span>
    </div>
  );
};

/* =====================================================================
   S09 — 2002: "El que depositó dólares, recibirá dólares"
   ===================================================================== */
export const S09: React.FC<P> = ({t}) => {
  const s = 's09';
  const tEdu = cue(s, 'Eduardo'), tQ = cue(s, 'El que depositó'), tNo = cue(s, 'No pasó.'), tLos = cue(s, 'Los depósitos'), t140 = cue(s, 'uno cuarenta,');
  const tMien = cue(s, 'mientras'), tCasi = cue(s, 'casi cuatro.'), tUna = cue(s, 'Una generación'), tDecr = cue(s, 'decreto.');
  const tY = cue(s, 'Y se rompió'), tConf = cue(s, 'la confianza');
  const crack = prog(t, tConf + 0.2, 0.7);
  return (
    <Paper>
      <ChapterTag t={t} t0={0} label="2002 · La promesa" />
      <Beat t={t} t0={-0.3} t1={tLos - 0.05} kind="fade">
        <Photo src="duhalde.jpg" t={t} t0={-0.2} x={420} y={520} w={540} h={720} rot={-3} credit="Presidencia · CC BY 2.5 AR" focus="50% 20%" tape />
        <LowerThird t={t} t0={tEdu} t1={tLos} name="Eduardo Duhalde" role="Presidente · enero de 2002" x={120} y={860} />
        <div style={{position: 'absolute', left: 820, top: 300, width: 1000}}>
          <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 34, letterSpacing: 6, color: C.gray, marginBottom: 20, opacity: prog(t, cue(s, 'prometió:') - 0.2, 0.3)}}>LA PROMESA</div>
          {t > tQ - 0.2 ? <Quote t={t} seg={s} from="El que depositó" to="recibirá dólares»." size={112} /> : null}
        </div>
        <Stamp t={t} t0={tNo} text="NO PASÓ" x={1250} y={820} size={150} rot={-8} />
      </Beat>
      {/* 1,40 vs 3,90 */}
      <Beat t={t} t0={tLos - 0.05} t1={tUna - 0.05} kind="fade">
        <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center'}}>
          <H size={96}>La pesificación</H>
        </div>
        {[
          {x: 170, title: 'TU DEPÓSITO DE US$1', sub: 'te lo devolvían en pesos a', val: 1.4, t0: t140, c: C.ink},
          {x: 1010, title: 'EL DÓLAR EN LA CALLE', sub: 'se fue a casi', val: 3.9, t0: tCasi - 0.3, c: C.red},
        ].map((b, i) => (
          <div key={i} style={{position: 'absolute', left: b.x, top: 300, width: 740, opacity: prog(t, i ? tMien : tLos, 0.4)}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 36, letterSpacing: 4}}>{b.title}</div>
            <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 32, color: C.gray, marginTop: 6}}>{b.sub}</div>
            <div style={{fontFamily: F.head, fontSize: 210, color: b.c, lineHeight: 1.05}}>
              <Counter t={t} t0={b.t0 - 0.3} t1={b.t0 + 0.4} from={1} to={b.val} dec={2} prefix="$" />
            </div>
            <div style={{height: 60, width: 170 * b.val * prog(t, b.t0 - 0.3, 0.7), background: b.c, borderRadius: 6, marginTop: 10}} />
          </div>
        ))}
        <Source t={t} t0={tLos} text="Pesificación asimétrica (2002) · dólar libre: máximo ~$3,90 en junio de 2002" />
      </Beat>
      {/* Ahorristas */}
      <Beat t={t} t0={tUna - 0.05} t1={tY - 0.05} kind="fade">
        <Photo src="corralito_01.jpg" t={t} t0={tUna - 0.05} x={960} y={500} w={1500} h={840} rot={-1.5} credit="Buenos Aires, 6/2/2002 · Foto: Barcex · CC BY-SA 3.0" zoom={[1.05, 1.2]} focus="45% 45%" />
        <div style={{position: 'absolute', zIndex: 10, left: 160, top: 790, background: C.ink, color: C.white, fontFamily: F.head, fontSize: 62, padding: '8px 26px', transform: `translateX(${(1 - prog(t, tUna + 0.2, 0.5)) * -800}px)`}}>
          “DEPOSITAMOS DÓLARES. QUEREMOS DÓLARES.”
        </div>
        <Stamp t={t} t0={tDecr} text="POR DECRETO" x={1420} y={300} size={110} rot={8} />
      </Beat>
      {/* Confianza rota */}
      <Beat t={t} t0={tY - 0.05} kind="fade">
        <Center>
          <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 40, letterSpacing: 8, color: C.gray, marginBottom: 20}}>SE ROMPIÓ ALGO MÁS PROFUNDO</div>
          <div style={{position: 'relative', width: 1500, height: 300}}>
            {[0, 1].map((h) => (
              <div key={h} style={{position: 'absolute', inset: 0, clipPath: h ? 'polygon(52% 0, 100% 0, 100% 100%, 47% 100%, 54% 70%, 48% 45%, 55% 22%)' : 'polygon(0 0, 52% 0, 55% 22%, 48% 45%, 54% 70%, 47% 100%, 0 100%)', transform: `translate(${(h ? 1 : -1) * crack * 60}px, ${crack * (h ? 30 : 10)}px) rotate(${(h ? 1 : -1) * crack * 5}deg)`, opacity: prog(t, tConf - 0.15, 0.3)}}>
                <div style={{fontFamily: F.head, fontSize: 270, textAlign: 'center', lineHeight: '300px', color: C.ink}}>CONFIANZA</div>
              </div>
            ))}
          </div>
          <div style={{fontFamily: F.head, fontSize: 80, marginTop: 30, opacity: prog(t, cue(s, 'en los bancos.'), 0.3)}}>
            EN LOS <Mark t={t} t0={cue(s, 'bancos.')} color={C.red}><span style={{color: C.white}}>BANCOS</span></Mark>
          </div>
        </Center>
      </Beat>
    </Paper>
  );
};

/* =====================================================================
   S10 — Las reglas, el cepo, el blue y el zoológico de dólares
   ===================================================================== */
const ZOO: {n: string; c: string; cueW?: string}[] = [
  {n: 'OFICIAL', c: '#FFFFFF', cueW: 'oficial,'},
  {n: 'BLUE', c: '#9CC3E6', cueW: 'blue,'},
  {n: 'MEP', c: '#FFFFFF', cueW: 'MEP,'},
  {n: 'CCL', c: '#FFFFFF', cueW: 'contado'},
  {n: 'TARJETA', c: '#FFFFFF', cueW: 'tarjeta,'},
  {n: 'SOJA', c: '#E8D9A8', cueW: 'soja...'},
  {n: 'QATAR', c: '#C9A1B6', cueW: 'Catar'},
  {n: 'COLDPLAY', c: '#F7C8E0', cueW: 'Coldplay.'},
  {n: 'MAYORISTA', c: '#FFFFFF'},
  {n: 'AHORRO', c: '#FFFFFF'},
  {n: 'CRIPTO', c: '#FFE08A'},
  {n: 'LUJO', c: '#E6D3A3'},
  {n: 'NETFLIX', c: '#F4B4B0'},
  {n: 'FUTURO', c: '#FFFFFF'},
  {n: 'CEDEARS', c: '#FFFFFF'},
];

export const S10: React.FC<P> = ({t}) => {
  const s = 's10';
  const tDos = cue(s, 'dos reglas.'), tNo1 = cue(s, 'No confíes'), tDesv = cue(s, 'se desvaloriza.'), tNo2 = cue(s, 'No confíes', 1), tQuit = cue(s, 'te lo');
  const tEnt = cue(s, '¿Entonces?'), tCompr = cue(s, 'Comprás'), tGuard = cue(s, 'guardás'), tEn11 = cue(s, 'En dos mil once,'), tCepo = cue(s, 'cepo.');
  const tYcon = cue(s, 'Y con él,'), tBlue = cue(s, 'blue:'), tCueva = cue(s, 'cueva'), tArb = cue(s, 'arbolito.');
  const tPara = cue(s, 'Para dos'), tSurr = cue(s, 'surrealista:'), tUnas = cue(s, 'Unas'), tQuince = cue(s, 'quince'), tMismo = cue(s, 'mismo');
  const zooT = ZOO.map((z, i) => (z.cueW ? cue(s, z.cueW) - 0.1 : cue(s, 'Coldplay.') + 0.45 + (i - 8) * 0.13));
  const shown = zooT.filter((x) => t > x).length;
  const collapse = prog(t, tMismo - 0.1, 0.7, easeIn);
  return (
    <Paper>
      {/* Reglas */}
      <Beat t={t} t0={-0.3} t1={tEnt - 0.05} kind="fade">
        <div style={{position: 'absolute', left: 260, top: 110, width: 1400, height: 860, background: '#FFFEF8', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', transform: 'rotate(-1.2deg)', backgroundImage: 'repeating-linear-gradient(180deg, rgba(0,0,0,0) 0 78px, rgba(47,111,168,0.22) 78px 80px)'}}>
          <div style={{position: 'absolute', left: 110, top: 0, bottom: 0, width: 4, background: 'rgba(226,59,46,0.4)'}} />
          <div style={{position: 'absolute', left: 170, top: 60, fontFamily: F.head, fontSize: 96, color: C.ink, opacity: prog(t, tDos - 0.3, 0.3)}}>
            <Mark t={t} t0={tDos}>LAS DOS REGLAS</Mark>
          </div>
          {[
            {n: '1', txt: 'No confíes en el peso', why: '(se desvaloriza)', t0: tNo1, tw: tDesv},
            {n: '2', txt: 'No confíes en el banco', why: '(te lo pueden quitar)', t0: tNo2, tw: tQuit},
          ].map((r, i) => (
            <div key={i} style={{position: 'absolute', left: 170, top: 270 + i * 260, opacity: prog(t, r.t0 - 0.1, 0.3), transform: `translateX(${(1 - prog(t, r.t0 - 0.1, 0.4)) * 40}px)`}}>
              <div style={{fontFamily: F.hand, fontSize: 88, color: '#1d2a5a'}}>{r.n}. {r.txt}</div>
              <div style={{fontFamily: F.script, fontWeight: 700, fontSize: 64, color: C.red, marginLeft: 70, opacity: prog(t, r.tw, 0.3)}}>{r.why}</div>
            </div>
          ))}
        </div>
      </Beat>
      {/* ¿Entonces? colchón */}
      <Beat t={t} t0={tEnt - 0.05} t1={tEn11 - 0.05} kind="fade">
        <Center>
          <H size={120} style={{opacity: prog(t, tEnt, 0.3)}}>¿Entonces?</H>
          <div style={{transform: `scale(${pop(t, tCompr - 0.1)})`, marginTop: 10}}>
            <Mattress size={560} bills={t > tGuard ? 3 : t > tCompr ? 1 : 0} />
          </div>
          <div style={{fontFamily: F.hand, fontSize: 62, color: C.green, marginTop: -60, opacity: prog(t, tGuard, 0.3), transform: 'rotate(-3deg)'}}>…y los guardás en casa</div>
        </Center>
      </Beat>
      {/* Cepo */}
      <Beat t={t} t0={tEn11 - 0.05} t1={tYcon - 0.05} kind="fade">
        <ChapterTag t={t} t0={tEn11} label="2011 · El cepo" />
        <Center>
          <div style={{position: 'relative', width: 700, height: 520}}>
            <div style={{position: 'absolute', left: 80, top: 190}}><DollarBill w={540} /></div>
            <div style={{position: 'absolute', left: 200, top: -40 - (1 - easeIn(clamp((t - tCepo + 0.35) / 0.35))) * 400}}><Padlock size={300} /></div>
          </div>
          <H size={140} style={{marginTop: -10}}><Mark t={t} t0={tCepo}>EL CEPO</Mark></H>
        </Center>
      </Beat>
      {/* Blue */}
      <Beat t={t} t0={tYcon - 0.05} t1={tPara - 0.05} kind="fade">
        <Photo src="cotizacion_calle.jpg" t={t} t0={tYcon} x={1530} y={540} w={600} h={780} rot={3} credit="Foto: Gastón Cuello · CC BY-SA 4.0" focus="50% 55%" tape />
        <div style={{position: 'absolute', left: 140, top: 180, transform: `scale(${pop(t, tBlue - 0.2)}) rotate(-4deg)`, filter: 'hue-rotate(95deg) saturate(1.3)'}}>
          <DollarBill w={620} />
        </div>
        <div style={{position: 'absolute', left: 150, top: 480}}>
          <H size={140} color={C.celesteDark} style={{opacity: prog(t, tBlue - 0.2, 0.3)}}>DÓLAR BLUE</H>
          <div style={{fontFamily: F.hand, fontSize: 48, marginTop: 30, opacity: prog(t, tCueva, 0.3)}}><span style={{color: C.red}}>CUEVA:</span> casa de cambio ilegal</div>
          <div style={{fontFamily: F.hand, fontSize: 48, marginTop: 10, opacity: prog(t, tArb, 0.3)}}><span style={{color: C.red}}>ARBOLITO:</span> el que vende en la calle</div>
        </div>
      </Beat>
      {/* Zoológico */}
      <Beat t={t} t0={tPara - 0.05} kind="fade">
        <div style={{position: 'absolute', left: 120, top: 70, display: 'flex', alignItems: 'baseline', gap: 30}}>
          <H size={96}>2022: <Mark t={t} t0={tSurr}>los mil dólares</Mark></H>
        </div>
        <div style={{position: 'absolute', right: 120, top: 60, textAlign: 'right'}}>
          <div style={{fontFamily: F.head, fontSize: 150, color: C.red, lineHeight: 1}}>{shown}</div>
          <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: C.gray}}>COTIZACIONES</div>
        </div>
        <div style={{position: 'absolute', left: 150, top: 290, width: 1620, display: 'flex', flexWrap: 'wrap', gap: 30}}>
          {ZOO.map((z, i) => {
            const t0 = zooT[i];
            const col = i % 5, row = Math.floor(i / 5);
            const dx = (2 - col) * 300 * collapse, dy = (1 - row) * 200 * collapse;
            return (
              <div key={z.n} style={{width: 300, height: 170, background: z.c, border: `5px solid ${C.ink}`, borderRadius: 14, boxShadow: `7px 7px 0 ${C.ink}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `translate(${dx}px, ${dy}px) scale(${pop(t, t0) * (1 - collapse * 0.6)}) rotate(${(rnd(i) - 0.5) * 6}deg)`, opacity: t > t0 ? 1 - collapse : 0}}>
                <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 22, letterSpacing: 5, color: C.ink2}}>DÓLAR</div>
                <div style={{fontFamily: F.head, fontSize: z.n.length > 8 ? 56 : 68, color: C.ink, lineHeight: 1.05}}>{z.n}</div>
              </div>
            );
          })}
        </div>
        {collapse > 0.5 ? (
          <Center>
            <div style={{transform: `scale(${pop(t, tMismo + 0.3)})`}}><DollarBill w={640} /></div>
            <H size={96} style={{marginTop: 40}}>15 precios · <Mark t={t} t0={tMismo + 0.5}>1 billete</Mark></H>
          </Center>
        ) : null}
        <Source t={t} t0={tPara} text="Cotizaciones vigentes en octubre de 2022" />
      </Beat>
    </Paper>
  );
};

/* =====================================================================
   S11 — Hoy
   ===================================================================== */
const DOLAR = [
  [2001, 1], [2002, 3.37], [2003, 2.93], [2004, 2.97], [2005, 3.03], [2006, 3.06], [2007, 3.15], [2008, 3.45], [2009, 3.8], [2010, 3.98],
  [2011, 4.3], [2012, 4.92], [2013, 6.52], [2014, 8.55], [2015, 13.0], [2016, 15.85], [2017, 18.77], [2018, 37.7], [2019, 59.9], [2020, 84.1],
  [2021, 102.7], [2022, 177.1], [2023, 808.5], [2024, 1032], [2025, 1455], [2026, 1535],
].map(([x, y]) => ({x, y}));

export const S11: React.FC<P> = ({t}) => {
  const s = 's11';
  const tEn = cue(s, 'En dos mil uno,'), tHoy = cue(s, 'Hoy,'), tMil = cue(s, 'quinientos.'), tLa = cue(s, 'La inflación');
  const tDosc = cue(s, 'doscientos'), tTreinta = cue(s, 'treinta'), tCepo = cue(s, 'El cepo'), tLev = cue(s, 'levantó.');
  const tAhora = cue(s, 'Y ahora,'), tVuel = cue(s, 'vuelvan'), tPero = cue(s, 'Pero mirá'), tPrimer = cue(s, 'primer'), tNoBaj = cue(s, 'no bajaron.'), tSub = cue(s, 'Subieron.');
  return (
    <Paper>
      <ChapterTag t={t} t0={0} label="Hoy · 2026" />
      {/* Dólar 2001-2026 */}
      <Beat t={t} t0={-0.3} t1={tLa - 0.05} kind="fade">
        <div style={{position: 'absolute', left: 150, top: 120}}>
          <H size={110}>¿Y hoy?</H>
          <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 32, letterSpacing: 4, color: C.gray, marginTop: 4}}>PESOS POR DÓLAR (OFICIAL)</div>
        </div>
        <div style={{position: 'absolute', left: 260, top: 310}}>
          <LineChart pts={DOLAR} t={t} t0={tEn - 0.2} t1={tMil + 0.2} w={1450} h={560} xLabels={[2001, 2006, 2011, 2016, 2021, 2026]} yMax={1600} yTicks={[500, 1000, 1500]} color={C.red} endLabel="$1.535" />
        </div>
        <div style={{position: 'absolute', left: 290, top: 790, fontFamily: F.head, fontSize: 60, color: C.ink, opacity: prog(t, cue(s, 'un peso.'), 0.3), transform: `scale(${pop(t, cue(s, 'un peso.'))})`}}>$1</div>
        <Source t={t} t0={tEn} text="BCRA / BNA · valores aproximados de fin de año · 2026: septiembre" />
      </Beat>
      {/* Inflación anual */}
      <Beat t={t} t0={tLa - 0.05} t1={tCepo - 0.05} kind="fade">
        <div style={{position: 'absolute', left: 150, top: 120}}>
          <H size={100}>La inflación bajó</H>
        </div>
        <div style={{position: 'absolute', left: 420, top: 300}}>
          <BarsV
            t={t}
            t0={tLa}
            w={1080}
            h={520}
            max={220}
            valueSize={56}
            labelSize={40}
            data={[
              {label: '2023', value: 211.4, valueLabel: '211,4%', color: C.red},
              {label: '2024', value: 117.8, valueLabel: '117,8%', color: '#F08A5D'},
              {label: '2025', value: 31.5, valueLabel: '31,5%', color: C.green},
            ]}
            revealIdx={[tDosc - 0.3, tDosc + 0.9, tTreinta - 0.2]}
          />
        </div>
        <Source t={t} t0={tLa} text="Fuente: INDEC · inflación anual (dic./dic.)" />
      </Beat>
      {/* Cepo levantado */}
      <Beat t={t} t0={tCepo - 0.05} t1={tAhora - 0.05} kind="fade">
        <Center>
          <Padlock size={380} open={prog(t, tLev - 0.3, 0.6)} color={C.green} />
          <H size={110} style={{marginTop: 10}}>Cepo: <Mark t={t} t0={tLev} color={C.green}><span style={{color: C.white}}>levantado</span></Mark></H>
          <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 36, color: C.gray, marginTop: 14}}>para ahorristas · abril de 2025</div>
        </Center>
      </Beat>
      {/* Inocencia fiscal */}
      <Beat t={t} t0={tAhora - 0.05} t1={tPero - 0.05} kind="fade">
        <Photo src="congreso2.jpg" t={t} t0={tAhora} x={500} y={420} w={760} h={520} rot={-3} credit="Foto: Matías Profeta · CC BY-SA 4.0" tape />
        <div style={{position: 'absolute', left: 980, top: 180, width: 820}}>
          <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 32, letterSpacing: 6, color: C.red}}>LEY · SEPTIEMBRE 2026</div>
          <H size={110} style={{marginTop: 6}}>Inocencia Fiscal II</H>
        </div>
        <div style={{position: 'absolute', left: 980, top: 500, display: 'flex', alignItems: 'center', gap: 20}}>
          <Mattress size={300} bills={3} />
          <svg width="220" height="80" viewBox="0 0 220 80"><path d={`M10 40 L${10 + 180 * prog(t, tVuel - 0.3, 0.6)} 40`} stroke={C.ink} strokeWidth="10" strokeLinecap="round" /><path d="M170 15 L205 40 L170 65" fill="none" stroke={C.ink} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" opacity={prog(t, tVuel + 0.2, 0.2)} /></svg>
          <Bank size={300} />
        </div>
        <div style={{position: 'absolute', left: 980, top: 830, fontFamily: F.hand, fontSize: 56, opacity: prog(t, tVuel, 0.3)}}>que el colchón vuelva al banco</div>
      </Beat>
      {/* Pero... subieron */}
      <Beat t={t} t0={tPero - 0.05} kind="fade">
        <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center'}}>
          <div style={{display: 'inline-block', background: C.yellow, border: `5px solid ${C.ink}`, fontFamily: F.head, fontSize: 70, padding: '6px 30px', transform: `scale(${pop(t, tPero)}) rotate(-2deg)`}}>PERO MIRÁ ESTE DATO</div>
        </div>
        <div style={{position: 'absolute', left: 140, top: 300, width: 1640, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{opacity: prog(t, tPrimer - 0.4, 0.4)}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 34, letterSpacing: 4, color: C.gray}}>FIN DE 2025</div>
            <div style={{fontFamily: F.head, fontSize: 124, whiteSpace: 'nowrap'}}>US$ 218.217 M</div>
          </div>
          <div style={{fontFamily: F.head, fontSize: 150, color: C.red, opacity: prog(t, tPrimer, 0.3)}}>→</div>
          <div style={{opacity: prog(t, tPrimer, 0.4)}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 34, letterSpacing: 4, color: C.gray}}>MARZO 2026</div>
            <div style={{fontFamily: F.head, fontSize: 124, whiteSpace: 'nowrap', color: C.red}}>US$ 220.854 M</div>
          </div>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 620, textAlign: 'center'}}>
          {t < tSub - 0.1 ? (
            <div style={{fontFamily: F.head, fontSize: 130, opacity: prog(t, tNoBaj - 0.2, 0.3)}}><Strike t={t} t0={tNoBaj + 0.3}>BAJARON</Strike></div>
          ) : (
            <div style={{fontFamily: F.head, fontSize: 210, color: C.red, transform: `scale(${pop(t, tSub - 0.1)})`}}>SUBIERON ▲</div>
          )}
          <div style={{fontFamily: F.mono, fontWeight: 800, fontSize: 44, color: C.red, marginTop: 6, opacity: prog(t, tSub + 0.3, 0.3)}}>+US$ 2.637 millones en un trimestre</div>
        </div>
        <Source t={t} t0={tPero} text="Fuente: INDEC · posición de inversión internacional" />
      </Beat>
    </Paper>
  );
};

/* =====================================================================
   S12 — Cierre, suscripción y próximo video
   ===================================================================== */
const COLLAGE = ['cacerolazo.jpg', 'crisis_20dic.jpg', 'corralito_01.jpg', 'delarua_deja.jpg', 'billete_ley_500000.png', 'corralito_05.jpg', 'obelisco_20dic.jpg', 'billete_austral_10.png'];

export const S12: React.FC<P & {total: number}> = ({t, total}) => {
  const s = 's12';
  const tEl = cue(s, 'el dólar'), tSeg = cue(s, 'seguro.'), tRef = cue(s, 'refugio.'), tMem = cue(s, 'memoria'), tQue = cue(s, 'que aprendió,');
  const tTrece = cue(s, 'Trece'), tCinco = cue(s, 'Cinco'), tUn = cue(s, 'Un corralito.'), tLa = cue(s, 'La pregunta'), tLa2 = cue(s, 'La pregunta', 1);
  const tQueT = cue(s, '¿qué'), tPeso = cue(s, 'peso?'), tCont = cue(s, 'Contanos'), tSus = cue(s, 'suscribite.'), tPorq = cue(s, 'Porque en el');
  const tBanda = cue(s, 'banda'), tNota = cue(s, 'nota'), tGomon = cue(s, 'gomón'), tEnd = cue(s, 'alcantarillas.', 0, 'e');
  const subscribed = t > tSus + 0.25;
  const endT = tEnd + 0.4;
  return (
    <AbsoluteFill>
      {/* Reflexión */}
      {t < tTrece - 0.05 ? (
        <Dark>
          {COLLAGE.map((src, i) => (
            <div key={src} style={{position: 'absolute', left: (i % 4) * 500 - 60 + Math.sin(t * 0.2 + i) * 30, top: Math.floor(i / 4) * 560 - 40 + ((t * 12 + i * 40) % 80), width: 480, height: 520, opacity: 0.16, transform: `rotate(${(rnd(i) - 0.5) * 10}deg)`}}>
              <Img src={staticFile('img/' + src)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1)'}} />
            </div>
          ))}
          <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(17,17,19,0.55) 0%, rgba(17,17,19,0.95) 75%)'}} />
          <Center>
            <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 52, color: 'rgba(255,255,255,0.8)', opacity: prog(t, tEl - 0.2, 0.4)}}>En la Argentina, el dólar no es solo una moneda.</div>
            <div style={{display: 'flex', gap: 60, marginTop: 50}}>
              {[
                ['UN SEGURO', tSeg, C.white],
                ['UN REFUGIO', tRef, C.white],
                ['LA MEMORIA', tMem, C.yellow],
              ].map(([w, t0, c]) => (
                <div key={w as string} style={{fontFamily: F.head, fontSize: 120, color: c as string, opacity: t > (t0 as number) - 0.2 ? 1 : 0, transform: `translateY(${(1 - prog(t, (t0 as number) - 0.2, 0.4)) * 40}px)`}}>{w as string}</div>
              ))}
            </div>
            <div style={{fontFamily: F.quote, fontStyle: 'italic', fontWeight: 600, fontSize: 56, color: 'rgba(255,255,255,0.9)', marginTop: 50, opacity: prog(t, tQue - 0.2, 0.5), maxWidth: 1500}}>
              de un país que aprendió, a los golpes, que las promesas se rompen.
            </div>
          </Center>
        </Dark>
      ) : null}
      {/* Resumen 13 · 5 · 1 */}
      {t >= tTrece - 0.05 && t < tLa - 0.05 ? (
        <Paper>
          <AbsoluteFill style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 90}}>
            {[
              ['13', 'CEROS', tTrece],
              ['5', 'MONEDAS', tCinco],
              ['1', 'CORRALITO', tUn],
            ].map(([n, l, t0]) => (
              <div key={l as string} style={{textAlign: 'center', transform: `scale(${pop(t, t0 as number)})`, opacity: t > (t0 as number) ? 1 : 0}}>
                <div style={{fontFamily: F.head, fontSize: 330, lineHeight: 1, color: l === 'CORRALITO' ? C.red : C.ink}}>{n as string}</div>
                <div style={{fontFamily: F.head, fontSize: 80}}><Mark t={t} t0={(t0 as number) + 0.2}>{l as string}</Mark></div>
              </div>
            ))}
          </AbsoluteFill>
        </Paper>
      ) : null}
      {/* La pregunta */}
      {t >= tLa - 0.05 && t < tCont - 0.05 ? (
        <Paper>
          <Center>
            <div style={{fontFamily: F.head, fontSize: 96, color: C.gray, opacity: prog(t, tLa, 0.3)}}>
              <Strike t={t} t0={tLa2 - 0.1}>¿POR QUÉ LOS ARGENTINOS AMAN EL DÓLAR?</Strike>
            </div>
            <div style={{fontFamily: F.head, fontSize: 118, color: C.ink, marginTop: 50, maxWidth: 1600, lineHeight: 1.08, opacity: prog(t, tQueT - 0.1, 0.3), transform: `translateY(${(1 - prog(t, tQueT - 0.1, 0.5)) * 40}px)`}}>
              ¿QUÉ TENDRÍA QUE PASAR PARA QUE VUELVAN A CONFIAR EN EL <Mark t={t} t0={tPeso}>PESO</Mark>?
            </div>
          </Center>
        </Paper>
      ) : null}
      {/* Comentarios + suscripción */}
      {t >= tCont - 0.05 && t < tPorq - 0.05 ? (
        <Paper>
          <Center>
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 80}}>
              <div style={{transform: `scale(${pop(t, tCont)}) rotate(-4deg)`}}><Bubble size={300} /></div>
              <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 30, transform: `scale(${pop(t, tCont + 0.4) * (t > tSus && t < tSus + 0.2 ? 0.92 : 1)})`}}>
                <div style={{background: subscribed ? '#D8D3CA' : C.red, color: subscribed ? C.ink2 : C.white, fontFamily: F.body, fontWeight: 900, fontSize: 64, padding: '26px 60px', borderRadius: 60, letterSpacing: 2, boxShadow: '0 12px 24px rgba(0,0,0,0.25)'}}>
                  {subscribed ? 'SUSCRIPTO ✓' : 'SUSCRIBITE'}
                </div>
                <Bell size={130} swing={subscribed ? Math.sin((t - tSus) * 25) * 25 * Math.exp(-(t - tSus) * 2) : 0} />
              </div>
            </div>
            <div style={{fontFamily: F.hand, fontSize: 60, marginTop: 60, opacity: prog(t, tCont + 0.3, 0.3)}}>Contanos en los comentarios</div>
          </Center>
        </Paper>
      ) : null}
      {/* Próximo video */}
      {t >= tPorq - 0.05 && t < endT ? (
        <Dark glow="rgba(255,204,51,0.08)">
          <div style={{position: 'absolute', left: 120, top: 110}}>
            <div style={{display: 'inline-block', background: C.yellow, color: C.ink, fontFamily: F.head, fontSize: 52, padding: '4px 22px', transform: `scale(${pop(t, tPorq)})`}}>PRÓXIMO VIDEO</div>
            <H size={150} color={C.white} style={{marginTop: 20, opacity: prog(t, tBanda - 0.3, 0.4)}}>El robo del siglo</H>
            <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 38, color: 'rgba(255,255,255,0.7)', marginTop: 10, opacity: prog(t, cue(s, 'Acassuso,') - 0.2, 0.4)}}>Banco Río, Acassuso · enero de 2006</div>
          </div>
          <div style={{position: 'absolute', left: 170, top: 520, transform: `scale(${pop(t, tBanda)})`, opacity: t > tBanda ? 1 : 0}}>
            <Vault size={400} spin={t * 40} />
          </div>
          <div style={{position: 'absolute', left: 760, top: 470, opacity: prog(t, tNota - 0.2, 0.3)}}>
            <Note w={720} text="En barrio de ricachones, sin armas ni rencores, es sólo plata y no amores." p={prog(t, tNota - 0.1, 2.0, (x) => x)} />
          </div>
          {t > tGomon - 0.8 ? (
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 60, height: 140}}>
              <div style={{position: 'absolute', left: 0, right: 0, bottom: 20, height: 60, background: 'linear-gradient(180deg, #2b3a2a, #1c261c)', borderTop: '4px solid #4a5a3a'}} />
              <div style={{position: 'absolute', bottom: 40, left: -300 + clamp((t - tGomon + 0.8) / 2.2) * 2400}}>
                <Boat size={260} />
              </div>
            </div>
          ) : null}
        </Dark>
      ) : null}
      {/* Placa final */}
      {t >= endT ? (
        <AbsoluteFill style={{background: C.ink}}>
          <Grain opacity={0.16} />
          <Center>
            <div style={{display: 'flex', alignItems: 'center', gap: 24, transform: `scale(${0.9 + 0.1 * pop(t, endT)})`}}>
              <div style={{width: 60, height: 60, background: C.yellow, borderRadius: 10}} />
              <div style={{fontFamily: F.head, fontSize: 170, color: C.white, letterSpacing: 8}}>CONTEXTO</div>
            </div>
            <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 44, color: C.yellow, marginTop: 6, opacity: prog(t, endT + 0.3, 0.4)}}>Argentina, explicada.</div>
            <div style={{position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center', fontFamily: F.body, fontWeight: 500, fontSize: 21, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, opacity: prog(t, endT + 0.6, 0.5)}}>
              Fuentes: INDEC · BCRA · Infobae · La Nación · Ámbito · Chequeado · Wikipedia<br />
              Fotos: Wikimedia Commons (Barcex, Pepe Robles, Doncentu, PRFOTOBAIRES, Victor Buggé/Presidencia, Matías Profeta, Gastón Cuello y otros) · licencias CC y dominio público<br />
              Voz: ElevenLabs · Música: ElevenLabs Music
            </div>
          </Center>
          <AbsoluteFill style={{background: '#000', opacity: prog(t, total - 0.6, 0.6)}} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
