import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from '../theme';
import {cue} from './lib';
import {clamp, easeIn, easeInOut, pop, prog, rnd, shake} from '../lib/anim';
import {Beat, ChapterCard, ChapterTag, Counter, Dark, Grain, H, LowerThird, Mark, Paper, Photo, Source, Stamp} from '../components/base';
import {Bank, Bell, Bubble, Person, PriceTag} from '../components/art';
import {BarsV, LineChart} from '../components/charts';
import {BallChain, Clip, CreditCard, Cuffs, Cycle, Exam, Folder, MoneyFlow, StampPile, SyncWords, Taximeter} from './art3';
import {CYCLE} from './scenes3a';

type P = {t: number};

/* =====================================================================
   S06 — Capítulo 2: 2018, el préstamo récord
   ===================================================================== */
const DOLAR_2018 = [19.4, 20.2, 20.2, 20.6, 25.0, 28.9, 27.3, 37.1, 41.2];

export const S06: React.FC<P> = ({t}) => {
  const s = 's06';
  const tDolar = cue(s, 'dólar'), tMacri = cue(s, 'Mauricio'), tGolpea = cue(s, 'golpea'), tFondo = cue(s, 'Fondo'), tLagarde = cue(s, 'Christine');
  const tMas = cue(s, 'más grande'), tCinc = cue(s, 'cincuenta'), tLlegan = cue(s, 'Llegan'), tQue = cue(s, '¿Y qué'), tEntro = cue(s, 'Entró...');
  const tSeFue = cue(s, 'se fue.'), tPropio = cue(s, 'propio'), tNo = cue(s, 'no cumplió'), tFuga = cue(s, 'fuga'), tLaPlata = cue(s, 'La plata se');
  const tLaDeuda = cue(s, 'La deuda'), tQuedo = cue(s, 'quedó.');
  const knock = [tGolpea, tGolpea + 0.25, tGolpea + 0.5];
  const sh = knock.reduce((a, k) => ({x: a.x + shake(t, k, 10, 0.2).x, y: a.y + shake(t, k, 10, 0.2).y}), {x: 0, y: 0});
  return (
    <AbsoluteFill>
      <Beat t={t} t0={1.3} t1={tFondo - 0.05} kind="fade">
        <Paper>
          <ChapterTag t={t} t0={1.4} label="Capítulo 2 · 2018" />
          <div style={{position: 'absolute', left: 110, top: 190, opacity: prog(t, tDolar - 0.3, 0.3)}}>
            <H size={80}>El dólar <span style={{color: C.red}}>se dispara</span></H>
            <div style={{marginTop: 40}}>
              <LineChart pts={DOLAR_2018.map((y, i) => ({x: i, y}))} t={t} t0={tDolar} t1={tDolar + 2.6} w={1000} h={500} yMax={45} yTicks={[20, 40]} yFmt={(v) => `$${v}`} endLabel="$41" />
            </div>
            <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 22, color: C.gray, marginTop: 70}}>Pesos por dólar, enero–septiembre 2018 (aprox.) · BCRA</div>
          </div>
          <div style={{transform: `translate(${sh.x}px, ${sh.y}px)`}}>
            <Photo src="ep03/macri.jpg" t={t} t0={tMacri - 0.3} x={1480} y={500} w={460} h={600} rot={3} tape credit="Mauricio Macri · Casa Rosada · CC BY 2.5 AR" focus="50% 25%" />
          </div>
          {t > tGolpea - 0.1 ? (
            <div style={{position: 'absolute', left: 1230, top: 860, fontFamily: F.head, fontSize: 80, color: C.ink, transform: `rotate(-4deg) scale(${pop(t, tGolpea)})`}}>
              TOC, TOC… <span style={{color: C.red}}>¿FMI?</span>
            </div>
          ) : null}
        </Paper>
      </Beat>

      <Beat t={t} t0={tFondo - 0.05} t1={tQue - 0.05} kind="fade">
        <Paper>
          <Photo src="ep03/macri_lagarde_onu.jpg" t={t} t0={tFondo - 0.2} x={560} y={430} w={860} h={560} rot={-2} tape credit="Macri y Lagarde, 2018 · CC BY 2.5 AR" />
          <LowerThird t={t} t0={tLagarde} t1={tLlegan} name="Christine Lagarde" role="Directora del FMI (2011–2019)" x={140} y={790} />
          <div style={{position: 'absolute', left: 1080, top: 130, width: 780}}>
            <H size={64} style={{opacity: prog(t, tMas - 0.3, 0.3)}}>El préstamo más grande de la historia del FMI</H>
            <div style={{fontFamily: F.head, fontSize: 130, lineHeight: 1.02, color: C.red, marginTop: 16, whiteSpace: 'nowrap', opacity: t > tCinc - 0.2 ? 1 : 0}}>
              <Counter t={t} t0={tCinc - 0.2} t1={tCinc + 1.2} to={57100} prefix="US$ " suffix=" M" />
            </div>
          </div>
          {t > tLlegan - 0.2 ? (
            <div style={{position: 'absolute', left: 1140, top: 540}}>
              <BarsV data={[{label: 'APROBADO', value: 57.1, color: C.gray, valueLabel: 'US$ 57.100 M'}, {label: 'LLEGÓ', value: 44.9, color: C.red, valueLabel: '~US$ 44.900 M'}]} t={t} t0={tLlegan - 0.2} w={620} h={300} max={60} valueSize={34} labelSize={28} />
            </div>
          ) : null}
          <Stamp t={t} t0={tMas + 0.4} text="RÉCORD" x={860} y={660} size={100} rot={-10} blend={false} />
        </Paper>
      </Beat>

      <Beat t={t} t0={tQue - 0.05} t1={tPropio - 0.05} kind="fade">
        <Paper>
          <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center'}}>
            <H size={110}>¿Y qué pasó con esa plata?</H>
          </div>
          <div style={{position: 'absolute', left: 960 - 190, top: 420}}><Bank size={380} label="ARGENTINA" /></div>
          <MoneyFlow t={t} t0={tEntro - 0.3} dur={1.0} from={[120, 700]} to={[900, 720]} n={7} arc={-60} />
          <MoneyFlow t={t} t0={tSeFue - 0.2} dur={1.0} from={[1020, 720]} to={[1850, 560]} n={9} arc={-200} />
          <div style={{position: 'absolute', left: 170, top: 870, fontFamily: F.head, fontSize: 90, color: C.green, opacity: prog(t, tEntro, 0.3)}}>ENTRÓ →</div>
          <div style={{position: 'absolute', right: 170, top: 870, fontFamily: F.head, fontSize: 90, color: C.red, opacity: prog(t, tSeFue, 0.3)}}>→ Y SE FUE</div>
        </Paper>
      </Beat>

      <Beat t={t} t0={tPropio - 0.05} t1={tLaPlata - 0.05} kind="fade">
        <Paper>
          <div style={{position: 'absolute', left: 120, top: 150, width: 980, background: '#FFFDF6', padding: '46px 54px', boxShadow: '0 20px 40px rgba(0,0,0,0.25)', transform: 'rotate(-1.5deg)'}}>
            <div style={{fontFamily: F.mono, fontWeight: 800, fontSize: 24, color: C.gray, letterSpacing: 2}}>FMI · EVALUACIÓN EX POST · DICIEMBRE 2021</div>
            <div style={{fontFamily: F.head, fontSize: 56, color: C.ink, marginTop: 12}}>Acuerdo Stand-By con Argentina (2018)</div>
            <div style={{fontFamily: F.quote, fontSize: 52, lineHeight: 1.3, color: C.ink, marginTop: 34}}>
              “El programa <Mark t={t} t0={tNo} color={C.yellow}>no cumplió con sus objetivos</Mark>”
            </div>
            <div style={{fontFamily: F.quote, fontSize: 52, lineHeight: 1.3, color: C.ink, marginTop: 24, opacity: prog(t, tFuga - 0.6, 0.3)}}>
              “…la <Mark t={t} t0={tFuga} color={C.yellow}>fuga de capitales</Mark> de residentes…”
            </div>
          </div>
          <Photo src="ep03/marcha_fmi_13.jpg" t={t} t0={tPropio + 0.3} x={1500} y={640} w={620} h={420} rot={4} tape credit="Marcha contra el FMI, 2018 · Gastón Cuello · CC BY-SA 4.0" />
          <Source t={t} t0={tNo} text="Fuente: FMI, evaluación ex post del acuerdo stand-by 2018 (22/12/2021)" />
        </Paper>
      </Beat>

      <Beat t={t} t0={tLaPlata - 0.05} kind="fade">
        <AbsoluteFill>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%', background: C.paper}}>
            <div style={{position: 'absolute', left: 0, right: 0, top: 140, textAlign: 'center'}}><H size={110}>La plata</H></div>
            <MoneyFlow t={t} t0={tLaPlata + 0.1} dur={1.2} from={[480, 620]} to={[380, -120]} n={10} arc={-80} />
            <div style={{position: 'absolute', left: 0, right: 0, top: 800, textAlign: 'center', fontFamily: F.head, fontSize: 110, color: C.green, opacity: prog(t, cue(s, 'fue.', 1) - 0.1, 0.3)}}>SE FUE ✈</div>
          </div>
          <div style={{position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%', background: C.ink}}>
            <div style={{position: 'absolute', left: 0, right: 0, top: 140, textAlign: 'center', opacity: prog(t, tLaDeuda - 0.2, 0.3)}}><H size={110} color={C.white}>La deuda</H></div>
            <div style={{position: 'absolute', left: 280, top: -400 + 700 * easeIn(clamp((t - tLaDeuda) / 0.4)), transform: `translate(${shake(t, tLaDeuda + 0.4, 14, 0.4).x}px, 0)`}}>
              <BallChain size={420} label="US$ 44.900 M" />
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, top: 800, textAlign: 'center', fontFamily: F.head, fontSize: 110, color: C.red, opacity: prog(t, tQuedo - 0.1, 0.3)}}>SE QUEDÓ</div>
          </div>
        </AbsoluteFill>
      </Beat>
      <ChapterCard t={t} t0={-0.95} t1={1.45} year="2018" title="El préstamo récord" num="CAPÍTULO 2" color={C.red} />
    </AbsoluteFill>
  );
};

/* =====================================================================
   S07 — Capítulo 3: 2022, refinanciar (y 2025, otro más)
   ===================================================================== */
export const S07: React.FC<P> = ({t}) => {
  const s = 's07';
  const tRef = cue(s, 'refinanciar.', 0, 'e'), tAlberto = cue(s, 'Alberto'), tNo = cue(s, 'no podía'), tSol = cue(s, '¿La solución?'), tUn = cue(s, 'Un acuerdo');
  const tEs = cue(s, 'Es como'), tOtra = cue(s, 'otra'), tY = cue(s, 'Y en'), tMilei = cue(s, 'Javier'), tOtro = cue(s, 'otro'), tVeinte = cue(s, 'veinte');
  const tTres = cue(s, 'Tres gobiernos.'), tDisc = cue(s, 'discursos.'), tMismo = cue(s, 'mismo');
  const swipe = prog(t, tOtra, 1.1, easeInOut);
  const pics = [
    {src: 'ep03/macri.jpg', cr: 'Casa Rosada · CC BY 2.5 AR', y: '2018'},
    {src: 'ep03/alberto.jpg', cr: 'Casa Rosada · CC BY 2.5 AR', y: '2022'},
    {src: 'ep03/milei.jpg', cr: 'argentina.gob.ar · CC BY 4.0', y: '2025'},
  ];
  return (
    <AbsoluteFill>
      <Beat t={t} t0={tRef + 0.2} t1={tSol - 0.05} kind="fade">
        <Paper>
          <ChapterTag t={t} t0={tRef + 0.3} label="Capítulo 3 · 2022" />
          <Photo src="ep03/alberto.jpg" t={t} t0={tRef + 0.3} x={520} y={520} w={480} h={640} rot={-3} tape credit="Alberto Fernández · Casa Rosada · CC BY 2.5 AR" focus="50% 25%" />
          <LowerThird t={t} t0={tAlberto} t1={tSol} name="Alberto Fernández" role="Presidente (2019–2023)" x={140} y={860} />
          <div style={{position: 'absolute', left: 1000, top: 300, width: 820}}>
            <H size={96} style={{opacity: prog(t, tRef + 0.5, 0.3)}}>El préstamo de 2018…</H>
            <div style={{fontFamily: F.hand, fontSize: 48, color: C.red, marginTop: 16, opacity: prog(t, tAlberto, 0.3)}}>…le tocó a otro gobierno</div>
          </div>
          <Stamp t={t} t0={tNo + 0.1} text="NO SE PUEDE PAGAR" x={1400} y={620} size={80} rot={-7} />
        </Paper>
      </Beat>

      <Beat t={t} t0={tSol - 0.05} t1={tEs - 0.05} kind="fade">
        <Paper>
          <Photo src="ep03/guzman_georgieva.jpg" t={t} t0={tSol - 0.1} x={560} y={500} w={780} h={580} rot={-2} tape credit="Guzmán y Georgieva, 2021 · argentina.gob.ar · CC BY 4.0" />
          <div style={{position: 'absolute', left: 1030, top: 170, width: 800}}>
            <H size={74} style={{opacity: prog(t, tSol, 0.3)}}>¿La solución?</H>
            <SyncWords t={t} seg={s} from="Un" to="Fondo." nTo={1} style={{fontFamily: F.head, fontSize: 100, lineHeight: 1.05, color: C.ink, textTransform: 'uppercase', marginTop: 20}} hi={{fondo: C.red}} />
            <div style={{marginTop: 30, display: 'flex', alignItems: 'center', gap: 20, fontFamily: F.head, fontSize: 64, color: C.ink, opacity: prog(t, cue(s, 'para pagarle'), 0.3)}}>
              FMI <span style={{color: C.red, fontSize: 90, display: 'inline-block', transform: `rotate(${(t - tUn) * 180}deg)`}}>⟳</span> FMI
            </div>
          </div>
        </Paper>
      </Beat>

      <Beat t={t} t0={tEs - 0.05} t1={tY - 0.05} kind="fade">
        <Paper>
          <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center'}}>
            <H size={92}>Pagar la tarjeta… <span style={{color: C.red, opacity: prog(t, tOtra - 0.2, 0.3)}}>con otra tarjeta</span></H>
          </div>
          <div style={{position: 'absolute', left: 1120, top: 420, transform: `rotate(4deg) scale(${pop(t, tEs)})`}}>
            <CreditCard w={560} color={C.red} label="DEUDA 2018" num="5700 0000 0000 2018" />
            <div style={{position: 'absolute', left: 60, top: 80, fontFamily: F.head, fontSize: 120, color: C.yellow, opacity: prog(t, tOtra + 0.9, 0.3), transform: 'rotate(-10deg)'}}>¡PAGADA!</div>
          </div>
          <div style={{position: 'absolute', left: 200 + swipe * 700, top: 430, transform: `rotate(${-6 + swipe * 10}deg) scale(${pop(t, tOtra - 0.3)})`, opacity: t > tOtra - 0.3 ? 1 - prog(t, tOtra + 1.2, 0.3) * 0.2 : 0}}>
            <CreditCard w={560} color={C.celesteDark} label="DEUDA 2022" num="4500 0000 0000 2022" />
          </div>
          <div style={{position: 'absolute', left: 240, top: 880, fontFamily: F.hand, fontSize: 48, color: C.red, opacity: prog(t, tOtra + 1.1, 0.3)}}>…y la deuda nueva queda ahí ↑</div>
        </Paper>
      </Beat>

      <Beat t={t} t0={tY - 0.05} t1={tTres - 0.05} kind="fade">
        <Paper>
          <Photo src="ep03/milei_georgieva.jpg" t={t} t0={tY} x={620} y={470} w={900} h={520} rot={-2} tape credit="Milei y Georgieva, 2024 · argentina.gob.ar · CC BY 4.0" />
          <LowerThird t={t} t0={tMilei} t1={tTres} name="Javier Milei y Kristalina Georgieva" role="Presidente · Directora del FMI" x={140} y={820} />
          <div style={{position: 'absolute', left: 1180, top: 230, width: 680}}>
            <div style={{fontFamily: F.head, fontSize: 110, color: C.ink, opacity: prog(t, tY, 0.3)}}>2025</div>
            <H size={70} style={{opacity: prog(t, tOtro - 0.2, 0.3)}}>Otro acuerdo más:</H>
            <div style={{fontFamily: F.head, fontSize: 124, lineHeight: 1.02, color: C.red, whiteSpace: 'nowrap', opacity: t > tVeinte - 0.2 ? 1 : 0}}>
              <Counter t={t} t0={tVeinte - 0.2} t1={tVeinte + 0.9} to={20000} prefix="US$ " suffix=" M" />
            </div>
          </div>
        </Paper>
      </Beat>

      <Beat t={t} t0={tTres - 0.05} kind="fade">
        <Paper>
          {pics.map((p, i) => (
            <React.Fragment key={i}>
              <Photo src={p.src} t={t} t0={tTres + i * 0.2} x={400 + i * 560} y={430} w={400} h={500} rot={(i - 1) * 3} credit={p.cr} focus="50% 25%" />
              {t > tDisc - 0.1 + i * 0.15 ? (
                <div style={{position: 'absolute', left: 400 + i * 560 + 90, top: 120, transform: `scale(${pop(t, tDisc - 0.1 + i * 0.15)})`}}>
                  <Bubble size={170} />
                </div>
              ) : null}
              <div style={{position: 'absolute', left: 400 + i * 560 - 100, top: 700, width: 200, textAlign: 'center', fontFamily: F.head, fontSize: 60, color: C.ink, opacity: prog(t, tTres + i * 0.2, 0.3)}}>{p.y}</div>
            </React.Fragment>
          ))}
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', opacity: prog(t, tMismo - 0.3, 0.3)}}>
            <div style={{display: 'inline-block', background: C.ink, color: C.yellow, fontFamily: F.head, fontSize: 130, padding: '6px 50px', transform: `scale(${pop(t, tMismo - 0.3)})`}}>EL MISMO FONDO</div>
          </div>
          <div style={{position: 'absolute', left: 90, top: 820, fontFamily: F.head, fontSize: 60, color: C.ink2, opacity: prog(t, tTres, 0.3) * (1 - prog(t, tMismo - 0.4, 0.2))}}>3 gobiernos · 3 discursos</div>
        </Paper>
      </Beat>
      <ChapterCard t={t} t0={-0.95} t1={tRef + 0.35} year="2022" title="Refinanciar" num="CAPÍTULO 3" color={C.yellow} />
    </AbsoluteFill>
  );
};

/* =====================================================================
   S08 — Capítulo 4: la revisión de hoy
   ===================================================================== */
export const S08: React.FC<P> = ({t}) => {
  const s = 's08';
  const tControla = cue(s, 'controla'), tCumplio = cue(s, 'cumplió'), tMaestra = cue(s, 'maestra'), tSpoiler = cue(s, 'Spoiler:'), tMeta = cue(s, 'meta');
  const tPerdon = cue(s, 'perdón.'), tPorque = cue(s, '¿Y por qué'), tPista = cue(s, 'pista:'), tCinc = cue(s, 'cincuenta'), tMayor = cue(s, 'mayor');
  const tSi = cue(s, 'Si a'), tMal = cue(s, 'mal...'), tTamb = cue(s, 'también.');
  return (
    <AbsoluteFill>
      <Beat t={t} t0={1.2} t1={tPorque - 0.05} kind="fade">
        <Paper>
          <ChapterTag t={t} t0={1.3} label="Capítulo 4 · Hoy" />
          <div style={{position: 'absolute', left: 140, top: 180}}>
            <Exam w={900} t={t} t0={1.3} items={[
              {text: 'Pagar los vencimientos', ok: true, t0: tCumplio + 0.2},
              {text: 'Meta fiscal del 1er semestre', ok: false, t0: tCumplio + 0.7},
              {text: 'Meta de reservas', ok: false, t0: tMeta},
            ]} />
          </div>
          <div style={{position: 'absolute', left: 1140, top: 200, width: 700}}>
            <div style={{fontFamily: F.mono, fontWeight: 800, fontSize: 26, color: C.gray, opacity: prog(t, tControla - 0.2, 0.3)}}>MISIÓN DEL FMI · SEPTIEMBRE 2026</div>
            <H size={84} style={{marginTop: 12, opacity: prog(t, tControla, 0.3)}}>¿Cumplió lo que prometió?</H>
            <div style={{fontFamily: F.hand, fontSize: 52, color: C.red, marginTop: 30, transform: 'rotate(-3deg)', opacity: prog(t, tMaestra - 0.2, 0.3)}}>como una maestra que corrige la tarea ✎</div>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 40, color: C.ink2, marginTop: 50, opacity: prog(t, tSpoiler - 0.1, 0.3)}}>
              <span style={{background: C.ink, color: C.yellow, padding: '2px 12px'}}>SPOILER</span> la meta de reservas nunca se cumplió sin un…
            </div>
          </div>
          <Stamp t={t} t0={tPerdon - 0.1} text="PERDONADO" sub="(“WAIVER”)" x={620} y={620} size={130} rot={-10} />
          <Source t={t} t0={tMeta} text="Fuentes: Infobae, 20 y 22/09/2026" />
        </Paper>
      </Beat>

      <Beat t={t} t0={tPorque - 0.05} t1={tSi - 0.05} kind="fade">
        <Paper>
          <Photo src="ep03/georgieva.jpg" t={t} t0={tPorque} x={1480} y={520} w={480} h={640} rot={3} tape credit="Kristalina Georgieva · World Bank/Grant Ellis · CC BY-SA 4.0" focus="50% 25%" />
          <LowerThird t={t} t0={tPorque + 0.4} t1={tSi} name="Kristalina Georgieva" role="Directora del FMI" x={1180} y={880} />
          <div style={{position: 'absolute', left: 120, top: 170, width: 980}}>
            <H size={96}>¿Por qué es tan comprensivo?</H>
            <div style={{fontFamily: F.hand, fontSize: 56, color: C.red, marginTop: 20, opacity: prog(t, tPista - 0.2, 0.3)}}>hay una pista…</div>
            <div style={{fontFamily: F.head, fontSize: 170, lineHeight: 1, color: C.red, marginTop: 20, opacity: t > tCinc - 0.2 ? 1 : 0}}>
              <Counter t={t} t0={tCinc - 0.2} t1={tCinc + 1.2} to={57100} prefix="US$ " suffix=" M" />
            </div>
            <div style={{marginTop: 30, opacity: prog(t, tMayor - 0.2, 0.3)}}>
              <span style={{background: C.yellow, border: `6px solid ${C.ink}`, fontFamily: F.head, fontSize: 84, padding: '4px 26px', color: C.ink}}>#1 · SU MAYOR DEUDOR</span>
            </div>
          </div>
        </Paper>
      </Beat>

      <Beat t={t} t0={tSi - 0.05} kind="fade">
        <Paper>
          <div style={{position: 'absolute', left: 960 - 330, top: 400, transform: `scale(${pop(t, tSi)})`}}><Cuffs w={660} /></div>
          <div style={{position: 'absolute', left: 250, top: 750, fontFamily: F.head, fontSize: 90, color: C.celesteDark}}>ARGENTINA</div>
          <div style={{position: 'absolute', right: 380, top: 750, fontFamily: F.head, fontSize: 90, color: C.ink}}>FMI</div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center'}}>
            <H size={96}>Si a la Argentina le va mal…</H>
            <div style={{fontFamily: F.head, fontSize: 110, color: C.red, opacity: prog(t, tTamb - 0.6, 0.3)}}>…AL FONDO TAMBIÉN</div>
          </div>
          {t > tMal ? <div style={{position: 'absolute', left: 890, top: 680, fontFamily: F.hand, fontSize: 56, color: C.red, opacity: prog(t, tMal, 0.3)}}>atados</div> : null}
        </Paper>
      </Beat>
      <ChapterCard t={t} t0={-0.95} t1={1.25} year="HOY" title="La revisión" num="CAPÍTULO 4" color={C.yellow} bg={C.red} />
    </AbsoluteFill>
  );
};

/* =====================================================================
   S09 — La bronca
   ===================================================================== */
export const S09: React.FC<P> = ({t}) => {
  const s = 's09';
  const tBronca = cue(s, 'bronca.'), tSept = cue(s, 'septiembre,'), tArch = cue(s, 'archivó'), tDec = cue(s, 'decisión'), tDelito = cue(s, 'delito.');
  const tNadie = cue(s, 'nadie'), tPero = cue(s, 'Pero'), tDeuda = cue(s, 'deuda'), tSolo = cue(s, 'Solo'), tInt = cue(s, 'intereses,');
  const tDol = cue(s, 'dólares.'), tCasi = cue(s, 'Casi'), tTresc = cue(s, 'trescientos'), tIncl = cue(s, 'Incluso'), tDebe = cue(s, 'debe'), tPor = cue(s, 'Por una');
  const glow = 'rgba(226,59,46,0.16)';
  const meter = 13500000000 * clamp((t - tInt) / (tDol + 0.4 - tInt));
  return (
    <AbsoluteFill>
      <Beat t={t} t0={-0.3} t1={tSept - 0.05} kind="fade">
        <Dark glow={glow}>
          <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translate(${shake(t, tBronca, 16, 0.5).x}px, ${shake(t, tBronca, 16, 0.5).y}px)`}}>
            <div style={{textAlign: 'center'}}>
              <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 44, color: 'rgba(255,255,255,0.7)', letterSpacing: 8}}>AHORA…</div>
              <div style={{fontFamily: F.head, fontSize: 200, lineHeight: 1, color: C.red, transform: `scale(${pop(t, tBronca - 0.1)})`, opacity: t > tBronca - 0.1 ? 1 : 0}}>LA PARTE QUE DA BRONCA</div>
            </div>
          </AbsoluteFill>
        </Dark>
      </Beat>

      <Beat t={t} t0={tSept - 0.05} t1={tPero - 0.05} kind="fade">
        <Dark glow={glow}>
          <div style={{position: 'absolute', left: 120, top: 170, transform: 'rotate(-2deg)'}}>
            <Folder w={800} title="CAUSA: EL PRÉSTAMO DEL FMI DE 2018" lines={['Cámara Federal · 04/09/2026']} />
          </div>
          <Stamp t={t} t0={tArch} text="ARCHIVADA" x={520} y={560} size={140} rot={-12} blend={false} />
          <div style={{position: 'absolute', left: 1060, top: 220, width: 780}}>
            <div style={{fontFamily: F.quote, fontStyle: 'italic', fontWeight: 800, fontSize: 70, lineHeight: 1.15, color: C.white, opacity: prog(t, tDec - 0.2, 0.3)}}>“Fue una decisión política”</div>
            <div style={{fontFamily: F.quote, fontStyle: 'italic', fontWeight: 800, fontSize: 70, lineHeight: 1.15, color: C.white, marginTop: 30, opacity: prog(t, tDelito - 0.3, 0.3)}}>“No hubo delito”</div>
            <div style={{marginTop: 60, opacity: prog(t, tNadie - 0.2, 0.3)}}>
              <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 40, color: C.yellow, letterSpacing: 4}}>RESPONSABLES</div>
              <div style={{fontFamily: F.head, fontSize: 220, lineHeight: 1, color: C.red, transform: `scale(${pop(t, tNadie)})`, transformOrigin: 'left'}}>0</div>
            </div>
          </div>
          <Source t={t} t0={tArch} text="Fuente: La Nación, 04/09/2026" dark />
        </Dark>
      </Beat>

      <Beat t={t} t0={tPero - 0.05} t1={tCasi - 0.05} kind="fade">
        <Dark glow={glow}>
          <div style={{position: 'absolute', left: 120, top: -420 + 680 * easeIn(clamp((t - tDeuda) / 0.4)), transform: `translate(${shake(t, tDeuda + 0.4, 18, 0.5).x}px, 0)`}}>
            <BallChain size={440} label="US$ 57.100 M" />
          </div>
          <div style={{position: 'absolute', left: 140, top: 760, fontFamily: F.head, fontSize: 90, color: C.white, opacity: prog(t, cue(s, 'sigue') - 0.2, 0.3)}}>LA DEUDA SIGUE AHÍ</div>
          {t > tSolo - 0.2 ? (
            <div style={{position: 'absolute', left: 820, top: 240, transform: `scale(${pop(t, tSolo - 0.2)})`}}>
              <Taximeter w={960} value={`US$ ${Math.round(meter).toLocaleString('es-AR')}`} label="INTERESES AL FMI · 2026–2030" />
              <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 40, color: C.yellow, marginTop: 30, opacity: prog(t, tDol, 0.3)}}>MÁS DE US$ 13.000 MILLONES, SOLO EN INTERESES</div>
            </div>
          ) : null}
          <Source t={t} t0={tSolo} text="Fuente: Infobae con datos del FMI, 09/01/2026" dark />
        </Dark>
      </Beat>

      <Beat t={t} t0={tCasi - 0.05} t1={tIncl - 0.05} kind="fade">
        <Dark glow={glow}>
          {Array.from({length: 96}).map((_, i) => {
            const col = i % 16, row = Math.floor(i / 16);
            const on = t > tTresc + 0.4 + (col + row) * 0.04;
            return (
              <div key={i} style={{position: 'absolute', left: 150 + col * 102, top: 330 + row * 108}}>
                <Person size={50} color={on ? C.red : 'rgba(255,255,255,0.35)'} />
              </div>
            );
          })}
          <div style={{position: 'absolute', left: 0, right: 0, top: 90, textAlign: 'center'}}>
            <div style={{fontFamily: F.head, fontSize: 150, lineHeight: 1, color: C.white}}>
              CASI <span style={{color: C.red}}>US$ 300</span>
            </div>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 48, color: C.yellow, marginTop: 10, opacity: prog(t, cue(s, 'cada') - 0.2, 0.3)}}>POR CADA ARGENTINO · SOLO DE INTERESES</div>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, textAlign: 'center', fontFamily: F.mono, fontSize: 24, color: 'rgba(255,255,255,0.6)'}}>US$ 13.500 millones ÷ ~47 millones de habitantes ≈ US$ 287 por persona</div>
        </Dark>
      </Beat>

      <Beat t={t} t0={tIncl - 0.05} kind="fade">
        <Dark>
          <Photo src="ep03/bebe.jpg" t={t} t0={tIncl - 0.05} x={960} y={500} w={1240} h={760} bw credit="Janko Ferlič · Unsplash (CC0)" enter="fade" zoom={[1.0, 1.12]} />
          {t > tDebe - 0.1 ? (
            <div style={{position: 'absolute', left: 1180, top: 540, transform: `rotate(${10 + Math.sin((t - tDebe) * 3) * 4}deg) scale(${pop(t, tDebe - 0.1)})`, transformOrigin: 'left center'}}>
              <PriceTag w={420} text="US$ 287" color={C.red} />
            </div>
          ) : null}
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 60, textAlign: 'center'}}>
            <div style={{display: 'inline-block', background: 'rgba(17,17,19,0.85)', padding: '10px 40px', fontFamily: F.head, fontSize: 80, color: C.white}}>
              {t < tPor - 0.1 ? 'INCLUSO EL BEBÉ QUE NACE HOY' : <span style={{color: C.red}}>POR UNA PLATA QUE NUNCA VIO</span>}
            </div>
          </div>
        </Dark>
      </Beat>
    </AbsoluteFill>
  );
};

/* =====================================================================
   S10 — Cierre y pantalla final
   ===================================================================== */
export const S10: React.FC<P & {total: number}> = ({t, total}) => {
  const s = 's10';
  const tPocos = cue(s, 'pocos.'), tLa = cue(s, 'La cuenta'), tTodos = cue(s, 'todos.'), tPorque = cue(s, '¿Por qué'), tNunca = cue(s, 'nunca');
  const tY = cue(s, 'Y la próxima'), tAcord = cue(s, 'acordate:'), tTreinta = cue(s, 'treinta'), tUlt = cue(s, 'últimas'), tSi = cue(s, 'Si te');
  const tBronca = cue(s, 'bronca,'), tSus = cue(s, 'Suscribite'), tAlguna = cue(s, '¿alguna'), tNos = cue(s, 'Nos vemos');
  const subscribed = t > tSus + 0.3;
  const items = CYCLE('s04').map((it) => ({...it, t0: -99}));
  return (
    <AbsoluteFill>
      <Beat t={t} t0={-0.3} t1={tLa - 0.05} kind="fade">
        <Dark glow="rgba(226,59,46,0.14)">
          <div style={{position: 'absolute', left: 0, right: 0, top: 160, textAlign: 'center'}}>
            <H size={110} color={C.white}>Las decisiones las tomaron</H>
            <div style={{fontFamily: F.head, fontSize: 150, color: C.yellow, opacity: prog(t, tPocos - 0.3, 0.3)}}>UNOS POCOS</div>
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{position: 'absolute', left: 780 + i * 130, top: 640, transform: `scale(${pop(t, 0.3 + i * 0.15)})`}}><Person size={110} color={C.white} /></div>
          ))}
          <div style={{position: 'absolute', left: 720, top: 800, width: 480, height: 26, background: '#8C6A4A', border: `5px solid ${C.ink}`}} />
        </Dark>
      </Beat>

      <Beat t={t} t0={tLa - 0.05} t1={tPorque - 0.05} kind="fade">
        <AbsoluteFill style={{background: C.ink}}>
          <Clip src="ep03/vid/tarifazo.mp4" from={9} t={t} t0={tLa - 0.05} t1={tPorque + 0.2} x={0} y={0} w={0} h={0} full dim={0.5} credit="Protesta, 2019 · Banfield · CC BY-SA 2.5 AR" />
          <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{textAlign: 'center'}}>
              <H size={130} color={C.white}>La cuenta la pagamos</H>
              <div style={{fontFamily: F.head, fontSize: 230, lineHeight: 1, color: C.red, transform: `scale(${pop(t, tTodos - 0.2)})`, opacity: t > tTodos - 0.2 ? 1 : 0, textShadow: '0 8px 0 #000'}}>TODOS</div>
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      </Beat>

      <Beat t={t} t0={tPorque - 0.05} t1={tY - 0.05} kind="fade">
        <Paper>
          <div style={{position: 'absolute', left: 960 - 400, top: 140, transform: 'scale(0.8)', transformOrigin: 'top left'}}>
            <Cycle t={t} items={items} r={370} spin={(t - tPorque) * 40} size={1000} />
          </div>
          <div style={{position: 'absolute', left: 70, top: 60}}>
            <H size={70}>¿Por qué siempre volvemos?</H>
          </div>
          <Stamp t={t} t0={tNunca + 0.2} text="NUNCA LO ARREGLAMOS" x={960} y={560} size={100} rot={-8} blend={false} />
        </Paper>
      </Beat>

      <Beat t={t} t0={tY - 0.05} t1={tSi - 0.05} kind="fade">
        <Paper>
          <StampPile t={t} t0={tAcord - 0.3} t1={tUlt + 0.3} n={28} text="ÚLTIMA VEZ" />
          <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', zIndex: 5}}>
            <div style={{display: 'inline-block', background: C.ink, padding: '20px 50px', transform: 'rotate(-2deg)'}}>
              <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 44, color: 'rgba(255,255,255,0.75)'}}>“Esta es la última vez”… ya van</div>
              <div style={{fontFamily: F.head, fontSize: 200, lineHeight: 1, color: C.yellow, transform: `scale(${t > tTreinta - 0.2 ? pop(t, tTreinta - 0.2) : 1})`}}>
                {t > tTreinta - 0.2 ? 'CASI 30' : Math.max(1, Math.round(28 * Math.pow(clamp((t - tAcord + 0.3) / (tTreinta - tAcord + 0.1)), 1 / 1.6)))}
              </div>
            </div>
          </div>
        </Paper>
      </Beat>

      <Beat t={t} t0={tSi - 0.05} kind="fade">
        <AbsoluteFill style={{background: C.ink}}>
          <Grain opacity={0.16} />
          <div style={{position: 'absolute', left: 110, top: 150}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 22, transform: `scale(${0.9 + 0.1 * pop(t, tSi)})`, transformOrigin: 'left'}}>
              <div style={{width: 56, height: 56, background: C.yellow, borderRadius: 10}} />
              <div style={{fontFamily: F.head, fontSize: 150, color: C.white, letterSpacing: 8, lineHeight: 1}}>CONTEXTO</div>
            </div>
            <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 40, color: C.yellow, marginTop: 8}}>Argentina, explicada.</div>
            <div style={{fontFamily: F.head, fontSize: 64, color: C.red, marginTop: 50, opacity: prog(t, tBronca - 0.2, 0.3)}}>SI TE DIO BRONCA, COMPARTILO</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 26, marginTop: 40, transform: `scale(${pop(t, tSus - 0.3) * (t > tSus && t < tSus + 0.2 ? 0.92 : 1)})`, transformOrigin: 'left', opacity: t > tSus - 0.3 ? 1 : 0}}>
              <div style={{background: subscribed ? '#3A3A3A' : C.red, color: '#fff', fontFamily: F.body, fontWeight: 900, fontSize: 56, padding: '22px 54px', borderRadius: 60, letterSpacing: 2}}>{subscribed ? 'SUSCRIPTO ✓' : 'SUSCRIBITE'}</div>
              <Bell size={110} swing={subscribed ? Math.sin((t - tSus) * 25) * 25 * Math.exp(-(t - tSus) * 2) : 0} />
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 40, opacity: prog(t, tAlguna - 0.2, 0.3)}}>
              <Bubble size={120} />
              <div style={{fontFamily: F.hand, fontSize: 44, color: C.white, width: 560}}>¿Alguna vez vamos a salir del Fondo?</div>
            </div>
          </div>
          <div style={{position: 'absolute', left: 1130, top: 140, opacity: prog(t, tSi + 0.4, 0.5)}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 26, color: C.yellow, letterSpacing: 5, marginBottom: 12}}>MIRÁ TAMBIÉN</div>
            {[{a: '13 CEROS', b: 'por qué no confiamos en el peso'}, {a: 'EL ROBO DEL SIGLO', b: 'el golpe al Banco Río'}].map((e, i) => (
              <div key={i} style={{width: 660, height: 330, marginBottom: 40, background: '#1d1c1a', border: `6px solid ${C.white}`, boxShadow: `12px 12px 0 ${i ? C.red : C.yellow}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                <div style={{fontFamily: F.head, fontSize: 84, color: C.white, lineHeight: 1, whiteSpace: 'nowrap'}}>{e.a}</div>
                <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 26, color: 'rgba(255,255,255,0.7)', marginTop: 10}}>{e.b}</div>
              </div>
            ))}
          </div>
          {t > tNos - 0.1 ? <div style={{position: 'absolute', left: 120, top: 900, fontFamily: F.hand, fontSize: 56, color: C.yellow, transform: `rotate(-4deg) scale(${pop(t, tNos - 0.1)})`}}>¡nos vemos!</div> : null}
          <div style={{position: 'absolute', bottom: 22, left: 60, right: 60, textAlign: 'center', fontFamily: F.body, fontWeight: 500, fontSize: 17, color: 'rgba(255,255,255,0.5)', lineHeight: 1.55, opacity: prog(t, tSi + 0.8, 0.5)}}>
            Fuentes: FMI · Infobae · La Nación · Chequeado · El Cronista · Ámbito · Noticias Argentinas<br />
            Fotos y videos: Casa Rosada y argentina.gob.ar (CC BY) · Gastón Cuello, APK, Neoredacturus (CC BY-SA 4.0) · Banfield (CC BY-SA 2.5 AR) · World Bank/Grant Ellis · Unsplash — Wikimedia Commons · Voz, música y efectos: ElevenLabs
          </div>
          <AbsoluteFill style={{background: '#000', opacity: prog(t, total - 0.7, 0.7)}} />
        </AbsoluteFill>
      </Beat>
    </AbsoluteFill>
  );
};
