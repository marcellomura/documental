import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, F} from '../theme';
import {cue} from '../lib/words';
import {clamp, easeIn, easeOut, env, fmt, pop, prog, rnd, shake} from '../lib/anim';
import {Beat, Center, Counter, Dark, Grain, H, Mark, Paper, Photo, Source, Stamp, Strike, ChapterTag} from '../components/base';
import {Banknote, Book, CookieTin, DollarBill, Freezer, House, Mattress, Printer, PriceTag, Bank} from '../components/art';
import {HBars} from '../components/charts';

type P = {t: number};

/* =====================================================================
   S01 — GANCHO: los dólares escondidos
   ===================================================================== */
export const S01: React.FC<P> = ({t}) => {
  const s = 's01';
  const tLibro = cue(s, 'Adentro'), tLata = cue(s, 'lata'), tFreezer = cue(s, 'En el freezer'), tColchon = cue(s, 'Debajo');
  const tChiste = cue(s, 'Y no es'), tIndec = cue(s, 'INDEC,'), tNum = cue(s, 'doscientos'), tSist = cue(s, 'sistema.', 0, 'e');
  const tCinco = cue(s, 'Es más de cinco'), tVeces = cue(s, 'veces'), tHace = cue(s, 'Hace'), tAprobo = cue(s, 'aprobó');
  const tPero = cue(s, 'Pero la verdadera'), tPorque = cue(s, '¿por qué'), tMoneda = cue(s, 'su propia'), tNo = cue(s, 'no sirve');
  const tEnd = cue(s, 'ahorrar?', 0, 'e');

  const spots = [
    {t0: tLibro, label: 'UN LIBRO', icon: <Book size={300} />},
    {t0: tLata, label: 'LA LATA DE GALLETITAS', icon: <CookieTin size={300} />},
    {t0: tFreezer, label: 'EL FREEZER', icon: <Freezer size={300} />},
    {t0: tColchon, label: 'EL COLCHÓN', icon: <Mattress size={300} />},
  ];
  const active = spots.reduce((a, sp, i) => (t >= sp.t0 ? i : a), -1);

  return (
    <Paper>
      {/* 1. La casa */}
      <Beat t={t} t0={-0.4} t1={tLibro - 0.05} kind="fade">
        <Center>
          <div style={{transform: `scale(${0.85 + 0.15 * pop(t, -0.2)}) translateY(-40px)`, position: 'relative'}}>
            <House size={520} />
            {[0, 1, 2].map((i) => {
              const k = prog(t, cue(s, 'dólares') + i * 0.18, 0.7);
              const sx = [-700, 700, -500][i], sy = [-300, -200, 400][i];
              return (
                <div key={i} style={{position: 'absolute', left: 170 + sx * (1 - k), top: 250 + sy * (1 - k), opacity: k < 1 ? clamp(k * 4) : 1 - prog(t, cue(s, 'escondidos.') + 0.4, 0.3), transform: `rotate(${(1 - k) * 200 + i * 20}deg) scale(${1 - k * 0.6})`}}>
                  <DollarBill w={220} />
                </div>
              );
            })}
            {t > cue(s, 'escondidos.') + 0.3 ? (
              <div style={{position: 'absolute', left: 390, top: 20, fontFamily: F.hand, fontSize: 160, color: C.red, transform: `scale(${pop(t, cue(s, 'escondidos.') + 0.3)}) rotate(12deg)`}}>?</div>
            ) : null}
          </div>
          <div style={{fontFamily: F.hand, fontSize: 56, color: C.ink, marginTop: -30, opacity: prog(t, cue(s, 'viejos,'), 0.4), transform: `rotate(-3deg)`}}>
            (o la de tus viejos)
          </div>
        </Center>
      </Beat>

      {/* 2. Los escondites */}
      <Beat t={t} t0={tLibro - 0.1} t1={tChiste + 0.1} kind="fade">
        <AbsoluteFill style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 36}}>
          {spots.map((sp, i) => {
            const k = pop(t, sp.t0);
            const isA = i === active;
            const out = prog(t, tChiste - 0.1 + i * 0.05, 0.4, easeIn);
            return (
              <div key={i} style={{width: 400, height: 560, background: isA ? C.white : '#F7F3EB', borderRadius: 20, border: `5px solid ${C.ink}`, boxShadow: isA ? `12px 12px 0 ${C.ink}` : `6px 6px 0 ${C.ink}`, opacity: t < sp.t0 ? 0 : 1 - out, transform: `translateY(${(1 - k) * 120 - out * 500}px) scale(${isA ? 1.06 : 0.96}) rotate(${(i - 1.5) * 1.5}deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20}}>
                {sp.icon}
                <div style={{fontFamily: F.head, fontSize: i === 1 ? 40 : 52, color: C.ink, textAlign: 'center', padding: '0 20px', lineHeight: 1.05}}>
                  {isA ? <Mark t={t} t0={sp.t0 + 0.15}>{sp.label}</Mark> : sp.label}
                </div>
              </div>
            );
          })}
        </AbsoluteFill>
      </Beat>

      {/* 3. INDEC + contador */}
      <Beat t={t} t0={tChiste + 0.2} t1={tCinco} kind="fade">
        <Center>
          <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 40, letterSpacing: 8, color: C.ink2, opacity: prog(t, tIndec, 0.4)}}>
            SEGÚN EL <Mark t={t} t0={tIndec + 0.1}>INDEC</Mark>
          </div>
          <div style={{fontFamily: F.head, fontSize: 200, color: C.ink, marginTop: 30, whiteSpace: 'nowrap', opacity: prog(t, tNum - 0.3, 0.3), transform: `scale(${1 + clamp((t - tNum) / 4) * 0.05})`}}>
            <span style={{color: C.green}}>US$ </span>
            <Counter t={t} t0={tNum - 0.2} t1={tSist - 0.2} to={220854000000} />
          </div>
          <div style={{fontFamily: F.head, fontSize: 90, color: C.ink, marginTop: 10, opacity: prog(t, cue(s, 'fuera'), 0.3)}}>
            <Mark t={t} t0={cue(s, 'fuera')}>FUERA DEL SISTEMA</Mark>
          </div>
        </Center>
        <Source t={t} t0={tIndec} text="Fuente: INDEC · 1º trimestre 2026" />
      </Beat>

      {/* 4. Comparación con reservas */}
      <Beat t={t} t0={tCinco - 0.05} t1={tHace - 0.05} kind="up">
        <AbsoluteFill style={{padding: '170px 160px'}}>
          <HBars
            t={t}
            t0={tCinco + 0.1}
            stagger={0.9}
            w={1000}
            data={[
              {label: 'DÓLARES DE ARGENTINOS FUERA DEL SISTEMA', value: 220854, valueLabel: 'US$ 220.854 M', color: C.green},
              {label: 'RESERVAS BRUTAS DEL BANCO CENTRAL', value: 42052, valueLabel: 'US$ 42.052 M', color: C.ink},
            ]}
          />
          <div style={{position: 'absolute', right: 170, top: 560, fontFamily: F.hand, fontSize: 190, color: C.red, transform: `rotate(-8deg) scale(${pop(t, tVeces)})`, opacity: t > tVeces ? 1 : 0}}>×5</div>
          <div style={{position: 'absolute', right: 120, top: 800, fontFamily: F.hand, fontSize: 44, color: C.red, transform: 'rotate(-4deg)', opacity: prog(t, tVeces + 0.3, 0.3)}}>más de 5 veces</div>
          <Source t={t} t0={tCinco} text="INDEC y BCRA · 31/03/2026" />
        </AbsoluteFill>
      </Beat>

      {/* 5. La ley */}
      <Beat t={t} t0={tHace - 0.05} t1={tPero - 0.05} kind="fade">
        <Photo src="congreso2.jpg" t={t} t0={tHace} x={620} y={520} w={900} h={620} rot={-3} credit="Foto: Matías Profeta · CC BY-SA 4.0" tape />
        <div style={{position: 'absolute', left: 1130, top: 250, width: 680, opacity: prog(t, tHace + 0.3, 0.4), transform: `translateX(${(1 - prog(t, tHace + 0.3, 0.5)) * 60}px)`}}>
          <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: C.red}}>HACE UNA SEMANA</div>
          <H size={112} style={{marginTop: 14}}>Inocencia<br />Fiscal II</H>
          <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 36, color: C.ink2, marginTop: 24, lineHeight: 1.3}}>
            Ley para que los dólares <Mark t={t} t0={cue(s, 'salgan')}>salgan a la luz</Mark>
          </div>
        </div>
        <Stamp t={t} t0={tAprobo} text="APROBADA" sub="SENADO · 17/09/2026" x={1460} y={820} size={96} rot={-7} />
      </Beat>

      {/* 6. La pregunta */}
      <Beat t={t} t0={tPero - 0.05} kind="fade">
        <Center>
          <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 38, letterSpacing: 8, color: C.gray, opacity: prog(t, tPero, 0.4)}}>LA VERDADERA PREGUNTA</div>
          <div style={{fontFamily: F.head, fontSize: 210, color: C.ink, transform: `scale(${0.8 + 0.2 * pop(t, tPorque)})`, opacity: t > tPorque ? 1 : 0, marginTop: 10}}>
            ¿POR QUÉ?
          </div>
          <div style={{position: 'relative', height: 330, width: 1200, marginTop: 10}}>
            {t > tMoneda - 0.1 ? (
              <div style={{position: 'absolute', left: 340, top: 30, transform: `scale(${pop(t, tMoneda - 0.1)}) rotate(${-4 + prog(t, tNo, 0.6) * 25}deg) translateY(${easeIn(clamp((t - tNo - 0.2) / 1.0)) * 600}px) scaleY(${1 - prog(t, tNo, 0.3) * 0.25})`, filter: `grayscale(${prog(t, tNo, 0.4)})`}}>
                <Banknote w={520} value="$1" name="PESO ARGENTINO" color="#DCC7E8" dark="#4B2F66" />
              </div>
            ) : null}
            <div style={{position: 'absolute', left: 0, right: 0, top: 110, fontFamily: F.head, fontSize: 130, color: C.ink, opacity: prog(t, tNo, 0.3)}}>
              NO SIRVE PARA <Mark t={t} t0={cue(s, 'ahorrar?')} color={C.red}><span style={{color: t > cue(s, 'ahorrar?') + 0.2 ? C.white : C.ink}}>AHORRAR</span></Mark>
            </div>
          </div>
        </Center>
      </Beat>
    </Paper>
  );
};

/* =====================================================================
   S02 — TÍTULO: contar ceros
   ===================================================================== */
export const S02: React.FC<P & {titleEnd: number}> = ({t, titleEnd}) => {
  const s = 's02';
  const tContar = cue(s, 'contar'), tPorque = cue(s, 'Porque'), tTrece = cue(s, 'trece'), tDesap = cue(s, 'desaparecieron.');
  const tCada = cue(s, 'Y cada'), tRota = cue(s, 'rota.'), tTitle = cue(s, 'rota.', 0, 'e') + 0.25;
  const zeros = Array.from({length: 13});
  return (
    <AbsoluteFill>
      <Paper>
        {/* ceros que aparecen */}
        <Beat t={t} t0={-0.2} t1={tPorque} kind="fade">
          {Array.from({length: 26}).map((_, i) => {
            const t0 = tContar - 0.2 + i * 0.05;
            if (t < t0) return null;
            return (
              <div key={i} style={{position: 'absolute', left: 80 + rnd(i) * 1700, top: 60 + rnd(i + 50) * 860, fontFamily: F.head, fontSize: 90 + rnd(i + 9) * 160, color: i % 3 === 0 ? C.yellow : C.ink, opacity: 0.9, transform: `scale(${pop(t, t0)}) rotate(${(rnd(i + 3) - 0.5) * 40}deg)`}}>
                0
              </div>
            );
          })}
          <Center>
            <div style={{background: C.paper, padding: '10px 40px', boxShadow: `10px 10px 0 ${C.ink}`, border: `5px solid ${C.ink}`, transform: `scale(${pop(t, tContar)})`}}>
              <H size={120}>Hay que <Mark t={t} t0={tContar + 0.2}>contar ceros</Mark></H>
            </div>
          </Center>
        </Beat>
        {/* 1 y 13 ceros */}
        <Beat t={t} t0={tPorque} t1={tCada} kind="fade">
          <Center>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 40, letterSpacing: 8, color: C.gray, marginBottom: 20}}>LA HISTORIA DEL PESO ARGENTINO</div>
            <div style={{display: 'flex', fontFamily: F.head, fontSize: 190, color: C.ink, alignItems: 'flex-end'}}>
              <span>1</span>
              {zeros.map((_, i) => {
                const hi = t > tTrece + i * 0.07;
                const fall = clamp((t - (tDesap + 0.1 + (12 - i) * 0.07)) / 0.6);
                return (
                  <React.Fragment key={i}>
                    {i > 0 && (13 - i) % 3 === 0 ? <span style={{opacity: 1 - fall}}>.</span> : null}
                    <span style={{color: hi ? C.red : C.ink, display: 'inline-block', transform: `translateY(${easeIn(fall) * 700}px) rotate(${fall * (rnd(i) - 0.5) * 180}deg)`, opacity: 1 - fall * 0.8}}>0</span>
                  </React.Fragment>
                );
              })}
            </div>
            <div style={{fontFamily: F.head, fontSize: 80, marginTop: 30, color: C.ink, opacity: prog(t, tTrece, 0.3)}}>
              <Mark t={t} t0={tTrece}>13 CEROS</Mark> QUE DESAPARECIERON
            </div>
          </Center>
        </Beat>
        {/* el cero que se rompe */}
        <Beat t={t} t0={tCada} t1={tTitle + 0.1} kind="fade">
          <Center>
            {[0, 1].map((h) => {
              const k = prog(t, tRota, 0.6);
              const clip = h === 0 ? 'polygon(0 0, 54% 0, 47% 22%, 56% 40%, 45% 58%, 55% 78%, 48% 100%, 0 100%)' : 'polygon(54% 0, 100% 0, 100% 100%, 48% 100%, 55% 78%, 45% 58%, 56% 40%, 47% 22%)';
              return (
                <div key={h} style={{position: 'absolute', left: 960 - 230, top: 540 - 330, width: 460, height: 560, clipPath: clip, transform: `translate(${(h ? 1 : -1) * k * 110}px, ${k * 30}px) rotate(${(h ? 1 : -1) * k * 14}deg)`}}>
                  <svg width="460" height="560" viewBox="0 0 460 560"><ellipse cx="230" cy="280" rx="170" ry="235" fill="none" stroke={C.ink} strokeWidth="92" /></svg>
                </div>
              );
            })}
            <div style={{position: 'absolute', bottom: 110, fontFamily: F.head, fontSize: 84, color: C.ink, opacity: prog(t, cue(s, 'promesa'), 0.3)}}>
              CADA CERO: <Mark t={t} t0={cue(s, 'promesa') + 0.1} color={C.red}><span style={{color: C.white}}>UNA PROMESA ROTA</span></Mark>
            </div>
          </Center>
        </Beat>
      </Paper>

      {/* TÍTULO */}
      {t > tTitle ? (
        <AbsoluteFill style={{background: C.ink, clipPath: `circle(${easeOut(clamp((t - tTitle) / 0.5)) * 140}% at 50% 50%)`}}>
          <Grain opacity={0.16} />
          <Center>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 16, color: C.yellow, opacity: prog(t, tTitle + 0.2, 0.4)}}>CONTEXTO · ARGENTINA, EXPLICADA</div>
            <div style={{fontFamily: F.head, fontSize: 330, color: C.white, lineHeight: 1, marginTop: 10, transform: `scale(${1.3 - 0.3 * easeOut(clamp((t - tTitle) / 0.45)) + (t - tTitle) * 0.012})`, letterSpacing: 6}}>
              13 <span style={{color: C.yellow}}>CEROS</span>
            </div>
            <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 44, color: 'rgba(255,255,255,0.85)', marginTop: 20, opacity: prog(t, tTitle + 0.35, 0.5)}}>
              Por qué los argentinos no confían en su propia moneda
            </div>
          </Center>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* =====================================================================
   S03 — Los 13 ceros: cinco monedas
   ===================================================================== */
const CURRENCIES = [
  {year: '1881', name: 'PESO MONEDA NACIONAL', zeros: 0, img: 'billete_mn_1000.jpg', cueYear: null as null | string, cueZeros: null as null | string, cueName: null as null | string},
  {year: '1970', name: 'PESO LEY', zeros: 2, img: 'billete_ley_100.jpg', cueYear: 'mil novecientos setenta,', cueZeros: 'dos ceros:', cueName: 'nació'},
  {year: '1983', name: 'PESO ARGENTINO', zeros: 4, img: null, cueYear: 'ochenta y tres,', cueZeros: 'cuatro más:', cueName: 'el peso argentino.'},
  {year: '1985', name: 'AUSTRAL', zeros: 3, img: 'billete_austral_10.png', cueYear: 'ochenta y cinco,', cueZeros: 'tres más:', cueName: 'el austral.'},
  {year: '1992', name: 'PESO', zeros: 4, img: null, cueYear: 'noventa y dos,', cueZeros: 'otros cuatro:', cueName: 'el peso de hoy.'},
];

export const S03: React.FC<P> = ({t}) => {
  const s = 's03';
  const tStart = 0, tDiez = cue(s, 'diez billones.'), tUno = cue(s, 'Un uno,'), tTrece = cue(s, 'trece');
  const tTL = cue(s, 'En mil novecientos'), tCuatro = cue(s, 'Cuatro monedas'), tVeinti = cue(s, 'veintidós');
  const xs = [200, 560, 920, 1280, 1640];
  const times = CURRENCIES.map((c) => (c.cueYear ? cue(s, c.cueYear) : tTL - 0.2));
  const zt = CURRENCIES.map((c) => (c.cueZeros ? cue(s, c.cueZeros) : -99));
  let removed = 0;
  CURRENCIES.forEach((c, i) => {
    if (t > zt[i]) removed += c.zeros;
  });
  return (
    <Paper>
      <ChapterTag t={t} t0={0} label="Los 13 ceros" />
      {/* 1 peso = 10 billones m$n */}
      <Beat t={t} t0={-0.2} t1={tTL - 0.1} kind="fade">
        <div style={{position: 'absolute', left: 150, top: 200, transform: `scale(${pop(t, 0.1)}) rotate(-4deg)`}}>
          <Banknote w={560} value="$1" name="PESO (HOY)" color="#DCC7E8" dark="#4B2F66" />
          <div style={{fontFamily: F.head, fontSize: 54, marginTop: 20, textAlign: 'center'}}>1 PESO DE HOY</div>
        </div>
        <div style={{position: 'absolute', left: 890, top: 270, fontFamily: F.head, fontSize: 170, color: C.ink, opacity: prog(t, cue(s, 'moneda de'), 0.3)}}>=</div>
        <Photo src="billete_mn_1000.jpg" t={t} t0={cue(s, 'bisabuelos,') - 0.3} x={1440} y={330} w={620} h={330} rot={3} credit="Casa de Moneda · Dominio público" enter="right" zoom={[1, 1.04]} />
        <div style={{position: 'absolute', left: 1140, top: 530, width: 600, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 3, opacity: prog(t, cue(s, 'el peso moneda'), 0.4)}}>
          PESO MONEDA NACIONAL<br /><span style={{fontWeight: 600, color: C.gray}}>(la moneda de tus bisabuelos)</span>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center'}}>
          <div style={{fontFamily: F.head, fontSize: 170, color: C.ink, opacity: prog(t, tDiez - 0.2, 0.3), transform: `scale(${t > tUno ? 1 + prog(t, tUno, 0.6) * 0.12 : 1})`}}>
            {'10.000.000.000.000'.split('').map((ch, i) => {
              const zi = '10.000.000.000.000'.slice(0, i + 1).replace(/[^0]/g, '').length;
              const on = ch === '0' && t > tTrece + (zi - 1) * 0.06;
              return <span key={i} style={{color: on ? C.red : C.ink}}>{ch}</span>;
            })}
            <span style={{fontSize: 80, color: C.gray}}> m$n</span>
          </div>
          <div style={{fontFamily: F.hand, fontSize: 60, color: C.red, opacity: prog(t, tTrece + 0.4, 0.3), marginTop: -10}}>diez billones = un 1 y trece ceros</div>
        </div>
      </Beat>

      {/* Línea de tiempo de monedas */}
      <Beat t={t} t0={tTL - 0.1} kind="fade">
        <div style={{position: 'absolute', left: 120, top: 690, width: 1680 * prog(t, tTL - 0.1, 1.2), height: 8, background: C.ink, borderRadius: 4}} />
        {CURRENCIES.map((c, i) => {
          const t0 = times[i];
          if (t < t0 - 0.05) return null;
          const k = pop(t, t0);
          const on = i === CURRENCIES.reduce((a, _, j) => (t >= times[j] ? j : a), 0);
          return (
            <React.Fragment key={i}>
              <div style={{position: 'absolute', left: xs[i] - 26, top: 668, width: 52, height: 52, borderRadius: 26, background: on ? C.yellow : C.white, border: `7px solid ${C.ink}`, transform: `scale(${k})`}} />
              <div style={{position: 'absolute', left: xs[i] - 170, width: 340, top: 740, textAlign: 'center', opacity: clamp((t - t0) / 0.3)}}>
                <div style={{fontFamily: F.head, fontSize: 84, color: on ? C.ink : C.ink2}}>{c.year}</div>
                <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 25, letterSpacing: 1, color: C.ink, opacity: c.cueName ? prog(t, cue(s, c.cueName) - 0.2, 0.3) : 1}}>{c.name}</div>
                {c.zeros ? (
                  <div style={{display: 'inline-block', marginTop: 12, background: C.red, color: C.white, fontFamily: F.head, fontSize: 44, padding: '2px 18px', borderRadius: 8, transform: `scale(${pop(t, zt[i])}) rotate(-3deg)`, opacity: t > zt[i] ? 1 : 0}}>
                    −{c.zeros} CEROS
                  </div>
                ) : null}
              </div>
              <div style={{position: 'absolute', left: xs[i] - 160, top: 380 + (i % 2) * 40, transform: `translateY(${(1 - k) * 80}px) rotate(${(i % 2 ? 3 : -3)}deg) scale(${on ? 1.04 : 0.94})`, opacity: clamp((t - t0) / 0.2) * (on ? 1 : 0.8)}}>
                {c.img ? (
                  <div style={{width: 320, height: 160, background: '#FBF8F2', padding: 8, boxShadow: '0 12px 24px rgba(0,0,0,0.3)'}}>
                    <Img src={staticFile('img/' + c.img)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  </div>
                ) : i === 2 ? (
                  <Banknote w={320} value="$a 1000" name="PESO ARGENTINO" color="#CFE0EE" dark="#1F4E79" />
                ) : (
                  <Banknote w={320} value="$1" name="PESO" color="#DCC7E8" dark="#4B2F66" />
                )}
              </div>
            </React.Fragment>
          );
        })}
        <div style={{position: 'absolute', right: 90, top: 110, textAlign: 'right', opacity: prog(t, cue(s, 'dos ceros:'), 0.4)}}>
          <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 28, letterSpacing: 5, color: C.gray}}>CEROS ELIMINADOS</div>
          <div style={{fontFamily: F.head, fontSize: 190, color: C.red, lineHeight: 1}}>{removed}<span style={{color: C.ink, fontSize: 90}}>/13</span></div>
        </div>
        <div style={{position: 'absolute', left: 120, top: 120, opacity: prog(t, tCuatro, 0.4), transform: `translateY(${(1 - prog(t, tCuatro, 0.5)) * 30}px)`}}>
          <H size={110}>
            4 monedas nuevas
            <br />
            <span style={{fontSize: 90}}>en <Mark t={t} t0={tVeinti}>22 años</Mark></span>
          </H>
        </div>
      </Beat>
    </Paper>
  );
};

/* =====================================================================
   S04 — Qué es la inflación
   ===================================================================== */
export const S04: React.FC<P> = ({t}) => {
  const s = 's04';
  const tVersion = cue(s, 'Versión'), tCuando = cue(s, 'cuando'), tGasta = cue(s, 'gasta'), tRecauda = cue(s, 'recauda,');
  const tImpr = cue(s, 'imprimiendo'), tHay = cue(s, 'hay más'), tPrecios = cue(s, 'Y los precios'), tInfl = cue(s, 'inflación.');
  const tAsi = cue(s, 'Así,'), tGastar = cue(s, 'gastar.'), tDolar = cue(s, 'El dólar...'), tAhorrar = cue(s, 'ahorrar.');
  const prices = ['$100', '$130', '$180', '$260', '$390'];
  const pi = Math.min(prices.length - 1, Math.max(0, Math.floor((t - tPrecios - 0.1) / 0.28)));
  return (
    <Paper>
      <Beat t={t} t0={-0.2} t1={tCuando - 0.05} kind="fade">
        <Center>
          <H size={170}>¿Por qué pasa esto?</H>
          <div style={{marginTop: 40, background: C.yellow, border: `5px solid ${C.ink}`, fontFamily: F.head, fontSize: 64, padding: '8px 34px', transform: `scale(${pop(t, tVersion)}) rotate(-3deg)`, opacity: t > tVersion ? 1 : 0}}>VERSIÓN CORTA</div>
        </Center>
      </Beat>

      {/* Gasta más de lo que recauda + imprime */}
      <Beat t={t} t0={tCuando - 0.05} t1={tHay - 0.05} kind="fade">
        <div style={{position: 'absolute', left: 140, top: 240, transform: `scale(${pop(t, tCuando)})`}}>
          <Bank size={420} label="ESTADO" />
        </div>
        <div style={{position: 'absolute', left: 640, top: 180, display: 'flex', gap: 60, alignItems: 'flex-end', height: 560}}>
          {[
            {l: 'GASTA', v: 520, c: C.red, t0: tGasta},
            {l: 'RECAUDA', v: 330, c: C.ink, t0: tRecauda},
          ].map((b) => (
            <div key={b.l} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div style={{width: 170, height: b.v * prog(t, b.t0, 0.6), background: b.c, borderRadius: '6px 6px 0 0'}} />
              <div style={{fontFamily: F.head, fontSize: 52, marginTop: 12, opacity: prog(t, b.t0, 0.3)}}>{b.l}</div>
            </div>
          ))}
        </div>
        <div style={{position: 'absolute', left: 1080, top: 150, width: 700, height: 800}}>
          {t > tImpr - 0.2 ? (
            <>
              {Array.from({length: 22}).map((_, i) => {
                const t0 = tImpr + i * 0.07;
                const k = clamp((t - t0) / 1.1);
                if (k <= 0) return null;
                return (
                  <div key={i} style={{position: 'absolute', left: 230 + (rnd(i) - 0.5) * 520 * k, top: 430 - k * (380 + rnd(i + 4) * 200) + k * k * 260, transform: `rotate(${(rnd(i + 2) - 0.5) * 300 * k}deg)`, opacity: 1 - clamp((k - 0.85) / 0.15)}}>
                    <Banknote w={170} value="$" name="PESO" color="#DCC7E8" dark="#4B2F66" />
                  </div>
                );
              })}
              <div style={{position: 'absolute', left: 160, top: 400, transform: `scale(${pop(t, tImpr - 0.2)}) rotate(${Math.sin(t * 40) * 1.2}deg)`}}>
                <Printer size={360} />
              </div>
              <div style={{position: 'absolute', left: 60, top: 760, fontFamily: F.head, fontSize: 62, width: 600, textAlign: 'center'}}>
                <Mark t={t} t0={tImpr + 0.1}>IMPRIME BILLETES</Mark>
              </div>
            </>
          ) : null}
        </div>
      </Beat>

      {/* Más pesos, mismas cosas */}
      <Beat t={t} t0={tHay - 0.05} t1={tPrecios - 0.05} kind="fade">
        <div style={{position: 'absolute', left: 120, top: 110, width: 800}}>
          <H size={80}>Más pesos…</H>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 30, width: 780}}>
            {Array.from({length: 40}).map((_, i) => {
              const t0 = tHay + i * 0.04;
              return <div key={i} style={{transform: `scale(${pop(t, t0)}) rotate(${(rnd(i) - 0.5) * 20}deg)`, opacity: t > t0 ? 1 : 0}}><Banknote w={140} value="$" name="PESO" color="#DCC7E8" dark="#4B2F66" /></div>;
            })}
          </div>
        </div>
        <div style={{position: 'absolute', left: 1140, top: 110, width: 680}}>
          <H size={80} style={{opacity: prog(t, cue(s, 'las mismas'), 0.3)}}>…las mismas cosas</H>
          <div style={{display: 'flex', flexDirection: 'column', gap: 26, marginTop: 40}}>
            {['PAN', 'LECHE', 'ALQUILER'].map((g, i) => (
              <div key={g} style={{width: 420, background: C.white, border: `5px solid ${C.ink}`, boxShadow: `8px 8px 0 ${C.ink}`, fontFamily: F.head, fontSize: 64, padding: '14px 30px', transform: `scale(${pop(t, cue(s, 'las mismas') + i * 0.15)})`, opacity: t > cue(s, 'las mismas') + i * 0.15 ? 1 : 0}}>
                {g}
              </div>
            ))}
          </div>
        </div>
      </Beat>

      {/* Precios suben → inflación */}
      <Beat t={t} t0={tPrecios - 0.05} t1={tAsi - 0.05} kind="fade">
        <Center>
          <div style={{transform: `scale(${pop(t, tPrecios)}) rotate(${-6 + Math.sin(pi) * 3}deg)`}}>
            <PriceTag w={620} text={prices[pi]} color={pi > 2 ? '#FF8A5C' : C.yellow} />
          </div>
          <div style={{fontFamily: F.head, fontSize: 200, marginTop: 30, opacity: prog(t, tInfl - 0.1, 0.2)}}>
            <Mark t={t} t0={tInfl}>INFLACIÓN</Mark>
          </div>
        </Center>
      </Beat>

      {/* La regla */}
      <Beat t={t} t0={tAsi - 0.05} kind="fade">
        <div style={{position: 'absolute', top: 110, left: 0, right: 0, textAlign: 'center'}}>
          <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 34, letterSpacing: 10, color: C.gray}}>LA REGLA DE ORO ARGENTINA</div>
        </div>
        {[
          {x: 190, bill: <Banknote w={520} value="$" name="PESO" color="#DCC7E8" dark="#4B2F66" />, word: 'GASTAR', c: C.red, t0: cue(s, 'el peso'), tw: tGastar},
          {x: 1050, bill: <DollarBill w={520} />, word: 'AHORRAR', c: C.green, t0: tDolar, tw: tAhorrar},
        ].map((col, i) => (
          <div key={i} style={{position: 'absolute', left: col.x, top: 250, width: 680, textAlign: 'center', opacity: t > col.t0 ? 1 : 0}}>
            <div style={{transform: `scale(${pop(t, col.t0)}) rotate(${i ? 3 : -3}deg)`, display: 'inline-block'}}>{col.bill}</div>
            <div style={{fontFamily: F.head, fontSize: 70, marginTop: 30, color: C.ink}}>ES PARA</div>
            <div style={{fontFamily: F.head, fontSize: 170, color: col.c, lineHeight: 1, transform: `scale(${pop(t, col.tw - 0.1)})`, opacity: t > col.tw - 0.1 ? 1 : 0}}>{col.word}</div>
          </div>
        ))}
        <div style={{position: 'absolute', left: 955, top: 280, width: 8, height: 640, background: C.ink, opacity: 0.2}} />
      </Beat>
    </Paper>
  );
};
