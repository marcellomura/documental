import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from '../theme';
import {cue, segWords} from '../lib/words';
import {clamp, easeIn, easeOut, fmt, pop, prog, rnd, shake} from '../lib/anim';
import {Beat, Center, ChapterCard, ChapterTag, Counter, Dark, Grain, H, LowerThird, Mark, Paper, Photo, Source, Stamp, Strike} from '../components/base';
import {Banknote, Bank, Calendar, DollarBill, Fence, Helicopter, Person, Scale} from '../components/art';
import {BarsV} from '../components/charts';

type P = {t: number};

/* Palabras que aparecen sincronizadas con la voz */
const SyncWords: React.FC<{t: number; seg: string; from: string; to: string; style?: React.CSSProperties; hi?: Record<string, string>; deco?: (key: string, el: React.ReactNode) => React.ReactNode}> = ({t, seg, from, to, style, hi = {}, deco}) => {
  const ws = segWords(seg);
  const a = cue(seg, from), b = cue(seg, to, 0, 'e');
  const list = ws.filter((w) => w.s >= a - 0.001 && w.e <= b + 0.001);
  return (
    <div style={style}>
      {list.map((w, i) => {
        const k = prog(t, w.s - 0.08, 0.25);
        const clean = w.w.replace(/[«»]/g, '');
        const key = clean.toLowerCase().replace(/[^a-záéíóúñü]/g, '');
        const el = <span style={{position: 'relative', display: 'inline-block'}}>{clean}</span>;
        return (
          <span key={i} style={{display: 'inline-block', marginRight: '0.28em', opacity: 0.15 + 0.85 * k, transform: `translateY(${(1 - k) * 20}px)`, color: hi[key] ?? 'inherit'}}>
            {deco ? deco(key, el) : el}
          </span>
        );
      })}
    </div>
  );
};

/* =====================================================================
   S05 — 1981: "El que apuesta al dólar, pierde"
   ===================================================================== */
export const S05: React.FC<P> = ({t}) => {
  const s = 's05';
  const tMin = cue(s, 'El ministro'), tLor = cue(s, 'Lorenzo'), tFrase = cue(s, 'El que apuesta'), tDias = cue(s, 'Días'), tDev = cue(s, 'devaluó');
  const tTreinta = cue(s, 'treinta'), tLos = cue(s, 'Los que compraron'), tPerd = cue(s, 'perdieron.'), tGan = cue(s, 'Ganaron.');
  const tYlos = cue(s, 'Y los que'), tApr = cue(s, 'aprendieron.');
  const quoteOn = (t >= tFrase - 0.1 && t < tDias) || (t >= tLos - 0.1 && t < tYlos);
  return (
    <AbsoluteFill>
      <Paper>
        <ChapterTag t={t} t0={tMin} label="Capítulo 1 · 1981" />
        {/* Sigaut */}
        <Photo src="sigaut.jpg" t={t} t0={tMin - 0.3} t1={tDias} x={t < tFrase ? 1250 : 1480} y={500} w={t < tFrase ? 560 : 420} h={t < tFrase ? 700 : 530} rot={3} bw credit="Archivo · Dominio público" focus="50% 30%" tape />
        <LowerThird t={t} t0={tLor} t1={tFrase} name="Lorenzo Sigaut" role="Ministro de Economía · 1981" x={120} y={700} />
        <Beat t={t} t0={tMin} t1={tFrase - 0.1} kind="fade">
          <div style={{position: 'absolute', left: 120, top: 260, width: 800}}>
            <H size={96}>Quiso calmar<br />al mercado…</H>
          </div>
        </Beat>
        {/* La frase */}
        {quoteOn ? (
          <div style={{position: 'absolute', left: 110, top: 250, width: 1150}}>
            <div style={{fontFamily: F.quote, fontStyle: 'italic', fontWeight: 800, fontSize: 118, lineHeight: 1.08, color: C.ink}}>
              <span style={{color: C.red, fontSize: 160, lineHeight: 0}}>“</span>
              <SyncWords
                t={t}
                seg={s}
                from="El que apuesta"
                to="pierde»."
                style={{display: 'inline'}}
                deco={(key, el) =>
                  key === 'pierde' ? (
                    <span style={{position: 'relative', display: 'inline-block'}}>
                      {el}
                      {t > tPerd ? <span style={{position: 'absolute', left: -6, right: -6, top: '52%', height: 14, background: C.red, transformOrigin: 'left', transform: `scaleX(${prog(t, tPerd, 0.3)}) rotate(-4deg)`, borderRadius: 8}} /> : null}
                      {t > tGan - 0.1 ? <span style={{position: 'absolute', left: '112%', top: -30, fontFamily: F.hand, fontStyle: 'normal', fontSize: 140, color: C.green, whiteSpace: 'nowrap', transform: `rotate(-8deg) scale(${pop(t, tGan - 0.1)})`}}>GANA</span> : null}
                    </span>
                  ) : (
                    el
                  )
                }
              />
            </div>
            <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 34, color: C.gray, marginTop: 30, letterSpacing: 2}}>— LORENZO SIGAUT, 1981</div>
          </div>
        ) : null}
        {t >= tLos - 0.1 && t < tYlos ? (
          <div style={{position: 'absolute', left: 1300, top: 300, transform: `scale(${0.9 + 0.1 * pop(t, tLos)}) rotate(4deg)`, filter: `drop-shadow(0 0 ${20 + Math.sin(t * 8) * 10}px rgba(30,140,90,0.6))`}}>
            <DollarBill w={520} />
          </div>
        ) : null}
        {/* Devaluación */}
        <Beat t={t} t0={tDias - 0.05} t1={tLos - 0.15} kind="fade">
          <Center>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 40, letterSpacing: 8, color: C.gray, marginBottom: 30}}>DÍAS DESPUÉS…</div>
            <div style={{transform: `scale(${1 - 0.3 * prog(t, tDev, 0.8)})`, filter: `saturate(${1 - 0.6 * prog(t, tDev, 0.8)})`}}>
              <Banknote w={760} value="$ 10.000" name="PESO LEY 18.188" color="#E9C9A6" dark="#7A4A2A" />
            </div>
          </Center>
          <Stamp t={t} t0={tTreinta} text="−30%" sub="DEVALUACIÓN" x={1400} y={720} size={170} rot={-10} />
        </Beat>
        {/* Aprendieron */}
        <Beat t={t} t0={tYlos - 0.05} kind="fade">
          <Center>
            <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 52, color: C.ink2}}>Y los que le creyeron al ministro…</div>
            <div style={{fontFamily: F.head, fontSize: 250, marginTop: 20, opacity: prog(t, tApr - 0.1, 0.3), transform: `scale(${1.2 - 0.2 * prog(t, tApr - 0.1, 0.5)})`}}>
              <Mark t={t} t0={tApr + 0.1}>APRENDIERON.</Mark>
            </div>
          </Center>
        </Beat>
      </Paper>
      <ChapterCard t={t} t0={-0.85} t1={cue(s, 'El ministro') - 0.2} year="1981" title="La lección" num="CAPÍTULO 1" />
    </AbsoluteFill>
  );
};

/* =====================================================================
   S06 — 1989: Hiperinflación
   ===================================================================== */
const M89 = [
  ['ENE', 8.9], ['FEB', 9.6], ['MAR', 17.0], ['ABR', 33.4], ['MAY', 78.5], ['JUN', 114.5],
  ['JUL', 196.6], ['AGO', 37.9], ['SEP', 9.4], ['OCT', 5.6], ['NOV', 6.5], ['DIC', 40.1],
] as const;

export const S06: React.FC<P> = ({t}) => {
  const s = 's06';
  const tEn = cue(s, 'En mil'), tHiper = cue(s, 'hiperinflación.'), tSolo = cue(s, 'Solo'), tDosc = cue(s, 'doscientos');
  const tMes = cue(s, 'En un mes.'), tImag = cue(s, 'Imaginate:'), tMitad = cue(s, 'mitad.'), tVale = cue(s, 'vale');
  const tEse = cue(s, 'Ese año,'), tSupero = cue(s, 'superó'), tEnd = cue(s, 'ciento.', 1, 'e');
  const sh = shake(t, tEnd - 0.2, 16, 0.6);
  return (
    <AbsoluteFill>
      <Dark glow="rgba(226,59,46,0.10)">
        <Beat t={t} t0={-0.8} t1={tEn - 0.1} kind="fade">
          <Center>
            <H size={130} color={C.white}>Lo peor estaba<br /><span style={{color: C.red}}>por venir</span></H>
          </Center>
        </Beat>
        <ChapterTag t={t} t0={tSolo} label="Capítulo 2 · 1989" dark />
        {/* Barras mensuales */}
        <Beat t={t} t0={tSolo - 0.3} t1={tImag - 0.05} kind="fade">
          <div style={{position: 'absolute', left: 150, top: 120, fontFamily: F.body, fontWeight: 800, fontSize: 36, letterSpacing: 5, color: 'rgba(255,255,255,0.8)'}}>INFLACIÓN MENSUAL · 1989</div>
          <div style={{position: 'absolute', left: 150, top: 230}}>
            <BarsV
              dark
              t={t}
              t0={tSolo - 0.2}
              w={1620}
              h={600}
              max={200}
              barColor="rgba(255,255,255,0.55)"
              valueSize={30}
              data={M89.map(([m, v]) => ({label: m, value: v, color: m === 'JUL' ? C.red : undefined, valueLabel: fmt(v, 1) + '%'}))}
              revealIdx={M89.map((_, i) => (i === 6 ? tDosc - 0.4 : tSolo - 0.2 + i * 0.14 + (i > 6 ? 1.0 : 0)))}
            />
          </div>
          <div style={{position: 'absolute', left: 1130, top: 250, fontFamily: F.head, fontSize: 96, lineHeight: 1, color: C.red, opacity: prog(t, tMes - 0.1, 0.25), transform: `scale(${pop(t, tMes - 0.1)})`, transformOrigin: 'left'}}>
            ← ¡EN UN<br />SOLO MES!
          </div>
          <Source t={t} t0={tSolo} text="Fuente: INDEC · IPC" dark />
        </Beat>
        {/* El sueldo que se evapora */}
        <Beat t={t} t0={tImag - 0.05} t1={tEse - 0.05} kind="fade">
          <Center>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 40, letterSpacing: 8, color: 'rgba(255,255,255,0.7)'}}>COBRÁS EL SUELDO…</div>
            <div style={{position: 'relative', marginTop: 50, height: 400, width: 900}}>
              <div style={{position: 'absolute', left: 70, top: 0, clipPath: `inset(0 ${prog(t, tVale, 1.0) * 50}% 0 0)`, transform: `scale(${pop(t, cue(s, 'cobrás'))})`}}>
                <Banknote w={760} value="₳ 10.000" name="AUSTRAL" color="#CFE0EE" dark="#1F4E79" />
              </div>
              {t > tVale ? (
                <div style={{position: 'absolute', left: 450, top: -40, fontFamily: F.head, fontSize: 300, color: C.red, transform: `rotate(-6deg) scale(${pop(t, tMitad - 0.2)})`, opacity: t > tMitad - 0.2 ? 1 : 0}}>½</div>
              ) : null}
            </div>
            <div style={{fontFamily: F.head, fontSize: 80, color: C.white, opacity: prog(t, tVale, 0.3)}}>…Y A LOS POCOS DÍAS VALE LA MITAD</div>
          </Center>
        </Beat>
        {/* 3079% */}
        <Beat t={t} t0={tEse - 0.05} kind="fade">
          <Center style={{transform: `translate(${sh.x}px, ${sh.y}px)`}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 44, letterSpacing: 10, color: 'rgba(255,255,255,0.75)'}}>INFLACIÓN DE 1989</div>
            <div style={{fontFamily: F.head, fontSize: 380, color: C.red, lineHeight: 1, marginTop: 10}}>
              <Counter t={t} t0={tSupero - 0.2} t1={tEnd - 0.2} to={3079.5} dec={1} suffix="%" />
            </div>
          </Center>
          <Source t={t} t0={tEse} text="INDEC · variación promedio anual" dark />
        </Beat>
      </Dark>
      <ChapterCard t={t} t0={cue(s, 'En mil') - 0.1} t1={tSolo - 0.25} year="1989" title="Hiperinflación" num="CAPÍTULO 2" color={C.red} />
    </AbsoluteFill>
  );
};

/* =====================================================================
   S07 — 1991: Convertibilidad
   ===================================================================== */
export const S07: React.FC<P> = ({t}) => {
  const s = 's07';
  const tEn = cue(s, 'En mil'), tDom = cue(s, 'Domingo'), tConv = cue(s, 'Convertibilidad:'), tPor = cue(s, 'por ley,');
  const tUno = cue(s, 'Uno a uno.'), tLa = cue(s, 'La inflación'), tDes = cue(s, 'desplomó,'), tYpor = cue(s, 'y por fin,');
  const tConf = cue(s, 'confiaron'), tDep = cue(s, 'Depositaron'), tEnD = cue(s, 'En dólares.'), tSpo = cue(s, 'Spoiler:'), tNo = cue(s, 'no terminó');
  const frozen = t > tSpo;
  const glitch = t > tSpo && t < tSpo + 0.25;
  const wob = clamp((t - cue(s, 'un dólar.')) / 1.6);
  const tilt = t < cue(s, 'un dólar.') ? (t > cue(s, 'un peso') ? -0.5 * prog(t, cue(s, 'un peso'), 0.4) : 0) : -0.5 * Math.cos(wob * Math.PI * 3) * (1 - wob);
  const dyS = Math.sin((tilt * 12 * Math.PI) / 180) * 250;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{filter: frozen ? `grayscale(${prog(t, tSpo, 0.3)}) contrast(1.1)` : undefined, transform: glitch ? `translateX(${Math.sin(t * 300) * 18}px)` : undefined}}>
      <Paper tint="#E8EEF3">
        <ChapterTag t={t} t0={tEn} label="Capítulo 3 · 1991" />
        {/* Cavallo */}
        <Photo src="cavallo2001.png" t={t} t0={tEn - 0.2} t1={tPor - 0.1} x={1360} y={520} w={560} h={740} rot={3} credit="Min. de Hacienda · CC BY 2.5" focus="50% 25%" tape />
        <LowerThird t={t} t0={tDom} t1={tPor - 0.1} name="Domingo Cavallo" role="Ministro de Economía · 1991–1996" x={120} y={720} />
        <Beat t={t} t0={tEn} t1={tPor - 0.1} kind="fade">
          <div style={{position: 'absolute', left: 120, top: 250, width: 900}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 36, letterSpacing: 6, color: C.celesteDark}}>UNA IDEA “MÁGICA”</div>
            <H size={124} style={{marginTop: 10}}>Ley de<br /><Mark t={t} t0={tConv} color={C.celeste}>Convertibilidad</Mark></H>
          </div>
        </Beat>
        {/* 1 = 1 */}
        <Beat t={t} t0={tPor - 0.1} t1={tLa - 0.05} kind="fade">
          <div style={{position: 'absolute', left: 560, top: 380}}>
            <Scale size={800} tilt={tilt} />
          </div>
          <div style={{position: 'absolute', left: 560 + 150 - 165, top: 380 + 250 - 150 - dyS, transform: `scale(${pop(t, cue(s, 'un peso'))})`}}>
            <Banknote w={330} value="$1" name="PESO" color="#DCC7E8" dark="#4B2F66" />
          </div>
          <div style={{position: 'absolute', left: 560 + 650 - 165, top: 380 + 250 - 138 + dyS, transform: `scale(${pop(t, cue(s, 'un dólar.'))})`}}>
            <DollarBill w={330} value="1" />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', fontFamily: F.head, fontSize: 200, color: C.ink, transform: `scale(${pop(t, tUno)})`, opacity: t > tUno ? 1 : 0}}>
            $1 <span style={{color: C.celesteDark}}>=</span> US$1
          </div>
        </Beat>
        {/* Inflación se desploma + bancos */}
        <Beat t={t} t0={tLa - 0.05} t1={tSpo + 1.6} kind="fade">
          <div style={{position: 'absolute', left: 120, top: 160, width: 700}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 34, letterSpacing: 6, color: C.gray}}>INFLACIÓN</div>
            <svg width="640" height="420" viewBox="0 0 640 420" style={{overflow: 'visible'}}>
              <path d={`M20 30 C 160 40, 200 300, 300 360 S 520 380, 620 385`} fill="none" stroke={C.red} strokeWidth="14" strokeLinecap="round" strokeDasharray="1000" strokeDashoffset={1000 * (1 - prog(t, tLa, 1.2))} />
              <path d="M20 400 L630 400" stroke={C.ink} strokeWidth="5" />
            </svg>
            <div style={{fontFamily: F.head, fontSize: 96, color: C.red, marginTop: -40, opacity: prog(t, tDes, 0.3)}}>SE DESPLOMÓ ↓</div>
          </div>
          <div style={{position: 'absolute', left: 1040, top: 160, opacity: prog(t, tYpor - 0.2, 0.4)}}>
            <Bank size={560} />
            {Array.from({length: 10}).map((_, i) => {
              const t0 = tDep + i * 0.12;
              const k = clamp((t - t0) / 0.9);
              if (k <= 0 || k >= 1) return null;
              return (
                <div key={i} style={{position: 'absolute', left: -380 + k * 560 + rnd(i) * 40, top: 240 + (rnd(i + 3) - 0.5) * 300 * (1 - k) + 60, transform: `rotate(${(1 - k) * 90}deg) scale(${1 - k * 0.5})`, opacity: 1 - k * 0.8}}>
                  <DollarBill w={200} />
                </div>
              );
            })}
            <div style={{position: 'absolute', left: 0, width: 560, top: 590, textAlign: 'center', fontFamily: F.head, fontSize: 70, opacity: prog(t, tConf, 0.3)}}>
              <Mark t={t} t0={tConf} color={C.celeste}>CONFIANZA</Mark>
            </div>
            <div style={{position: 'absolute', left: 0, width: 560, top: 690, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 34, opacity: prog(t, tEnD, 0.3)}}>DEPÓSITOS… EN DÓLARES</div>
          </div>
        </Beat>
      </Paper>
      </AbsoluteFill>
      {t > tSpo ? (
        <>
          <AbsoluteFill style={{background: `rgba(17,17,19,${0.6 * prog(t, tSpo, 0.2)})`}} />
          <Stamp t={t} t0={tSpo} text="SPOILER" x={960} y={430} size={190} rot={-6} blend={false} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily: F.head, fontSize: 120, color: C.white, opacity: prog(t, tNo, 0.25), transform: `translateY(${(1 - prog(t, tNo, 0.4)) * 30}px)`}}>
            NO TERMINÓ BIEN
          </div>
        </>
      ) : null}
      <ChapterCard t={t} t0={-0.8} t1={tEn - 0.2} year="1991" title="El uno a uno" num="CAPÍTULO 3" color={C.celeste} bg="#10283F" />
    </AbsoluteFill>
  );
};

/* =====================================================================
   S08 — 2001: El corralito
   ===================================================================== */
const PRES = [
  ['Fernando de la Rúa', 'hasta el 20/12'],
  ['Ramón Puerta', '21/12'],
  ['Adolfo Rodríguez Saá', '23/12'],
  ['Eduardo Camaño', '31/12'],
  ['Eduardo Duhalde', '1/1/2002'],
];

export const S08: React.FC<P> = ({t}) => {
  const s = 's08';
  const tPara = cue(s, 'Para'), tEnd1 = cue(s, 'endeudó.'), tEnd2 = cue(s, 'endeudó.', 1), tEnd3 = cue(s, 'endeudó', 2), tMas = cue(s, 'más.');
  const tA = cue(s, 'A fines'), tCorr = cue(s, 'corrida'), tPrim = cue(s, 'Y el primero'), tCorral = cue(s, 'corralito:'), tSolo = cue(s, 'solo podías');
  const t250 = cue(s, 'doscientos'), tTu = cue(s, 'Tu plata'), tYa = cue(s, 'ya no'), tDiec = cue(s, 'Diecinueve'), tEst = cue(s, 'estalló.');
  const tSaq = cue(s, 'Saqueos,'), tCac = cue(s, 'cacerolazos,'), tRep = cue(s, 'represión.'), tTreinta = cue(s, 'Treinta');
  const tDe = cue(s, 'De la Rúa'), tHeli = cue(s, 'helicóptero.'), tEnMenos = cue(s, 'En menos'), tCinco = cue(s, 'cinco');
  const debtH = 90 + (t > tEnd1 ? 110 : 0) + (t > tEnd2 ? 130 : 0) + (t > tEnd3 ? 150 : 0) + (t > tMas ? 90 : 0);
  const sh = shake(t, tEst, 22, 0.7);
  const day = t < tDiec ? 1 : Math.min(20, 1 + Math.floor(clamp((t - tDiec) / 1.2) * 19));
  return (
    <AbsoluteFill>
      <Paper>
        <ChapterTag t={t} t0={tPara} label="Capítulo 4 · 2001" />
        {/* Deuda */}
        <Beat t={t} t0={tPara - 0.1} t1={tA - 0.05} kind="fade">
          <div style={{position: 'absolute', left: 140, top: 230, width: 800}}>
            <H size={96}>Para sostener<br />el 1 a 1…</H>
            <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 44, color: C.ink2, marginTop: 30, opacity: prog(t, cue(s, 'hacían'), 0.3)}}>…hacían falta <Mark t={t} t0={cue(s, 'dólares.')} color={C.bill}>dólares</Mark>.</div>
          </div>
          <div style={{position: 'absolute', left: 1180, bottom: 170, width: 460, display: 'flex', flexDirection: 'column-reverse', alignItems: 'center'}}>
            <div style={{width: 380, height: debtH, background: `repeating-linear-gradient(180deg, ${C.red} 0 38px, #C22B20 38px 44px)`, border: `6px solid ${C.ink}`, borderRadius: 8, transition: 'none', boxShadow: `10px 10px 0 ${C.ink}`, transform: `scaleY(${0.9 + 0.1 * pop(t, [tEnd1, tEnd2, tEnd3, tMas].filter((x) => t > x).pop() ?? 0)})`, transformOrigin: 'bottom'}} />
            <div style={{fontFamily: F.head, fontSize: 90, marginBottom: 16, opacity: prog(t, tEnd1 - 0.2, 0.3)}}>DEUDA</div>
          </div>
          {[tEnd1, tEnd2, tEnd3].map((x, i) => (t > x ? <div key={i} style={{position: 'absolute', left: 1640, bottom: 190 + i * 130, fontFamily: F.hand, fontSize: 56, color: C.red, transform: `scale(${pop(t, x)}) rotate(-6deg)`}}>+ deuda</div> : null))}
        </Beat>
        {/* Corrida bancaria */}
        <Beat t={t} t0={tA - 0.05} t1={tPrim - 0.05} kind="fade">
          <div style={{position: 'absolute', left: 1180, top: 250}}>
            <Bank size={560} />
          </div>
          {Array.from({length: 16}).map((_, i) => {
            const t0 = tA + 0.4 + rnd(i) * 1.6;
            const k = clamp((t - t0) / 2.2);
            if (k <= 0) return null;
            return (
              <div key={i} style={{position: 'absolute', left: 1300 - k * (900 + rnd(i + 7) * 300), top: 640 + (i % 4) * 40, transform: `translateY(${Math.abs(Math.sin(t * 14 + i)) * -14}px)`}}>
                <Person size={54} color={i % 3 ? C.ink : C.ink2} />
                <div style={{position: 'absolute', left: 30, top: 38, width: 40, height: 20, background: C.bill, border: `3px solid ${C.billDark}`, transform: 'rotate(-10deg)'}} />
              </div>
            );
          })}
          <div style={{position: 'absolute', left: 140, top: 200}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 36, letterSpacing: 6, color: C.gray}}>FINES DE 2001</div>
            <H size={130} style={{marginTop: 10}}><Mark t={t} t0={tCorr}>Corrida</Mark><br />bancaria</H>
          </div>
        </Beat>
        {/* Corralito */}
        <Beat t={t} t0={tPrim - 0.05} t1={tTu - 0.05} kind="fade">
          <div style={{position: 'absolute', left: 120, top: 210, transform: `scale(${pop(t, tPrim)}) rotate(-5deg)`}}>
            <Calendar size={380} day="1" month="DIC" year="2001" />
          </div>
          <div style={{position: 'absolute', left: 620, top: 170, opacity: prog(t, tCorral - 0.2, 0.3)}}>
            <H size={150}>El corralito</H>
          </div>
          <div style={{position: 'absolute', left: 700, top: 420}}>
            <div style={{position: 'absolute', left: 140, top: 60, transform: 'rotate(-6deg)'}}><DollarBill w={380} /></div>
            <div style={{position: 'absolute', left: 60, top: 130}}><Banknote w={380} value="$100" name="PESO" color="#DCC7E8" dark="#4B2F66" /></div>
            <div style={{position: 'absolute', left: -20, top: 40}}><Fence size={720} p={prog(t, tCorral, 0.9)} /></div>
          </div>
          <div style={{position: 'absolute', left: 1420, top: 480, width: 460, textAlign: 'center', opacity: prog(t, tSolo, 0.3)}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 32, letterSpacing: 4}}>PODÍAS RETIRAR</div>
            <div style={{fontFamily: F.head, fontSize: 170, color: C.red, lineHeight: 1}}><Counter t={t} t0={t250 - 0.1} t1={t250 + 0.8} from={0} to={250} prefix="$" /></div>
            <div style={{fontFamily: F.head, fontSize: 64}}>POR SEMANA</div>
          </div>
        </Beat>
        {/* Tu plata ya no era tuya */}
        <Beat t={t} t0={tTu - 0.05} t1={tDiec - 0.05} kind="fade">
          <Photo src="corralito_14.jpg" t={t} t0={tTu - 0.05} x={1340} y={540} w={640} h={900} rot={2} credit="Foto: Barcex · CC BY-SA 3.0" focus="50% 40%" zoom={[1.05, 1.18]} />
          <div style={{position: 'absolute', left: 130, top: 300, width: 800}}>
            <H size={110}>Tu plata estaba<br />en el banco…</H>
            <div style={{fontFamily: F.head, fontSize: 130, marginTop: 30, color: C.white, opacity: prog(t, tYa - 0.1, 0.25)}}>
              <Mark t={t} t0={tYa} color={C.red}>YA NO ERA TUYA</Mark>
            </div>
          </div>
        </Beat>
      </Paper>

      {/* Estallido (oscuro) */}
      {t >= tDiec - 0.05 && t < tTreinta - 0.05 ? (
        <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px)`}}>
          <Dark>
            {t < tEst ? (
              <Center>
                <div style={{transform: `scale(${pop(t, tDiec)})`}}><Calendar size={440} day={String(day)} month="DIC" year="2001" /></div>
                <div style={{fontFamily: F.head, fontSize: 70, color: C.white, marginTop: 20}}>19 DÍAS DESPUÉS</div>
              </Center>
            ) : null}
            {t >= tEst && t < tSaq ? <Photo src="obelisco_20dic.jpg" t={t} t0={tEst} x={960} y={540} w={1700} h={960} border={0} enter="fade" focus="50% 70%" zoom={[1.15, 1.3]} /> : null}
            {t >= tSaq && t < tCac ? <Photo src="obelisco_20dic.jpg" t={t} t0={tSaq} x={960} y={540} w={1700} h={960} border={0} enter="fade" focus="50% 40%" zoom={[1.3, 1.4]} dim={0.3} /> : null}
            {t >= tCac && t < tRep ? <Photo src="cacerolazo.jpg" t={t} t0={tCac} x={960} y={540} w={1700} h={960} border={0} enter="fade" zoom={[1.05, 1.15]} /> : null}
            {t >= tRep ? <Photo src="crisis_20dic.jpg" t={t} t0={tRep} x={960} y={540} w={1700} h={960} border={0} enter="fade" zoom={[1.05, 1.12]} /> : null}
            {t >= tEst ? (
              <div style={{position: 'absolute', left: 110, bottom: 120, zIndex: 10}}>
                <div style={{background: C.red, color: C.white, fontFamily: F.head, fontSize: 60, padding: '6px 26px', display: 'inline-block'}}>20 DE DICIEMBRE DE 2001</div>
                <div style={{fontFamily: F.head, fontSize: 150, color: C.white, textShadow: '0 6px 30px rgba(0,0,0,0.8)', marginTop: 10}}>
                  {t < tSaq ? 'EL PAÍS ESTALLÓ' : t < tCac ? 'SAQUEOS' : t < tRep ? 'CACEROLAZOS' : 'REPRESIÓN'}
                </div>
              </div>
            ) : null}
            <div style={{position: 'absolute', right: 40, bottom: 40, zIndex: 10, fontFamily: F.body, fontSize: 18, color: 'rgba(255,255,255,0.7)'}}>
              {t < tCac ? 'Foto: Doncentu · CC0' : t < tRep ? 'Foto: Pepe Robles · CC BY-SA 3.0' : 'Foto: PRFOTOBAIRES · CC BY 2.5'}
            </div>
          </Dark>
        </AbsoluteFill>
      ) : null}

      {/* 39 muertos */}
      {t >= tTreinta - 0.05 && t < tDe - 0.1 ? (
        <AbsoluteFill style={{background: '#050505'}}>
          <Center>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 110, color: C.white, opacity: prog(t, tTreinta, 0.5)}}>39 muertos</div>
          </Center>
        </AbsoluteFill>
      ) : null}

      {/* De la Rúa y el helicóptero */}
      {t >= tDe - 0.1 && t < tEnMenos - 0.05 ? (
        <AbsoluteFill>
          <Dark>
            <Photo src="delarua_deja.jpg" t={t} t0={tDe - 0.1} x={1180} y={560} w={1150} h={830} rot={-2} credit="Foto: Victor Buggé / Presidencia · CC BY 2.5 AR" zoom={[1.02, 1.1]} />
            <LowerThird t={t} t0={tDe} name="Fernando de la Rúa" role="Presidente · renunció el 20/12/2001" x={90} y={760} />
            {t > tHeli - 0.6 ? (
              <div style={{position: 'absolute', zIndex: 10, left: -400 + clamp((t - tHeli + 0.6) / 2.2) * 2600, top: 150 - clamp((t - tHeli + 0.6) / 2.2) * 120, transform: 'scale(0.9)'}}>
                <Helicopter size={420} spin={t * 30} />
              </div>
            ) : null}
          </Dark>
        </AbsoluteFill>
      ) : null}

      {/* 5 presidentes */}
      {t >= tEnMenos - 0.05 ? (
        <AbsoluteFill>
          <Paper>
            <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center'}}>
              <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 38, letterSpacing: 8, color: C.gray}}>EN MENOS DE DOS SEMANAS</div>
              <H size={150} style={{marginTop: 6}}><Mark t={t} t0={tCinco}>5 presidentes</Mark></H>
            </div>
            <div style={{position: 'absolute', left: 90, right: 90, top: 470, display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
              {PRES.map(([n, d], i) => {
                const t0 = tEnMenos + 0.2 + i * 0.3;
                return (
                  <div key={n} style={{width: 320, height: 380, background: C.white, border: `5px solid ${C.ink}`, boxShadow: `8px 8px 0 ${C.ink}`, borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 34, transform: `scale(${pop(t, t0)}) rotate(${(i - 2) * 1.5}deg)`, opacity: t > t0 ? 1 : 0}}>
                    <div style={{width: 130, height: 130, borderRadius: 65, background: C.paper2, border: `5px solid ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.head, fontSize: 70}}>{i + 1}</div>
                    <div style={{fontFamily: F.head, fontSize: 44, textAlign: 'center', marginTop: 26, lineHeight: 1.05, padding: '0 16px'}}>{n.toUpperCase()}</div>
                    <div style={{fontFamily: F.mono, fontWeight: 700, fontSize: 26, color: C.red, marginTop: 14}}>{d}</div>
                  </div>
                );
              })}
            </div>
          </Paper>
        </AbsoluteFill>
      ) : null}
      <ChapterCard t={t} t0={-0.85} t1={tPara + 1.9} year="2001" title="El corralito" num="CAPÍTULO 4" color={C.red} />
    </AbsoluteFill>
  );
};
