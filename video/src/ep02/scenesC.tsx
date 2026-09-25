import React from 'react';
import {AbsoluteFill} from 'remotion';
import {R, F2, cue} from './lib';
import {clamp, easeIn, easeInOut, easeOut, pop, prog, rnd, shake} from '../lib/anim';
import {Beat, Counter, Mark, Stamp, Strike} from '../components/base';
import {Zine, Halftone, Ransom, Typed, Bust, LineupWall, Placard, Heart, Clapper, Bars, Check, RockPhoto, SliceGlitch, Vinyl, Smoke} from './rock';
import {CREW} from './scenesA';
import {Bell, Bubble} from '../components/art';

type P = {t: number};

/* ---------- piezas chicas de este bloque ---------- */

/** Fajo de billetes (ladrillo) */
const Brick: React.FC<{w?: number}> = ({w = 170}) => (
  <div style={{position: 'relative', width: w, height: w * 0.42, background: `linear-gradient(180deg, ${R.bill}, #B9CFAA)`, border: '5px solid #111', borderRadius: 6, boxShadow: '0 6px 0 rgba(0,0,0,0.35)'}}>
    <div style={{position: 'absolute', left: w * 0.4, top: -5, bottom: -5, width: w * 0.2, background: R.yellow, borderLeft: '4px solid #111', borderRight: '4px solid #111'}} />
    <div style={{position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontFamily: F2.head, fontSize: w * 0.2, color: R.billDark}}>$</div>
    <div style={{position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontFamily: F2.head, fontSize: w * 0.2, color: R.billDark}}>100</div>
  </div>
);

/** Placa policial */
const Badge: React.FC<{size?: number}> = ({size = 360}) => (
  <svg width={size} height={size * 1.1} viewBox="0 0 300 330" style={{overflow: 'visible'}}>
    <path d="M150 10 L270 60 C270 190 230 270 150 320 C70 270 30 190 30 60 Z" fill="#D9B44A" stroke="#111" strokeWidth="8" strokeLinejoin="round" />
    <path d="M150 40 L245 80 C243 185 212 250 150 290 C88 250 57 185 55 80 Z" fill="#E9C85E" stroke="#111" strokeWidth="4" />
    <path d="M150 105 L165 142 L205 142 L173 166 L185 205 L150 181 L115 205 L127 166 L95 142 L135 142 Z" fill={R.blue} stroke="#111" strokeWidth="5" strokeLinejoin="round" />
    <rect x="80" y="222" width="140" height="34" rx="6" fill="#111" />
    <text x="150" y="247" textAnchor="middle" fontFamily="Anton" fontSize="26" fill="#fff" letterSpacing="3">POLICÍA</text>
  </svg>
);

/** Tribunales (edificio con columnas) */
const Tribunal: React.FC<{size?: number}> = ({size = 460}) => (
  <svg width={size} height={size * 0.9} viewBox="0 0 460 414" style={{overflow: 'visible'}}>
    <path d="M20 120 L230 20 L440 120 Z" fill="#F2EDE0" stroke="#111" strokeWidth="7" strokeLinejoin="round" />
    <rect x="40" y="120" width="380" height="34" fill="#E2DAC6" stroke="#111" strokeWidth="6" />
    {[70, 150, 230, 310, 390].map((x) => (
      <rect key={x} x={x - 18} y="154" width="36" height="200" fill="#F2EDE0" stroke="#111" strokeWidth="6" />
    ))}
    <rect x="20" y="354" width="420" height="30" fill="#E2DAC6" stroke="#111" strokeWidth="6" />
    <rect x="0" y="384" width="460" height="28" fill="#D2C9B2" stroke="#111" strokeWidth="6" />
    <text x="230" y="146" textAnchor="middle" fontFamily="Anton" fontSize="28" fill="#111" letterSpacing="8">JUSTICIA</text>
    <g transform="translate(230 84)">
      <line x1="-34" y1="0" x2="34" y2="0" stroke="#111" strokeWidth="4" />
      <line x1="0" y1="-18" x2="0" y2="14" stroke="#111" strokeWidth="4" />
      <path d="M-44 14 L-24 14 L-34 0 Z M24 14 L44 14 L34 0 Z" fill="#111" />
    </g>
  </svg>
);

/** Entrada de cine */
const Ticket: React.FC<{w?: number; children: React.ReactNode}> = ({w = 620, children}) => (
  <div style={{position: 'relative', width: w, background: R.yellow, border: '6px solid #111', borderRadius: 14, padding: '18px 30px 18px 110px', boxShadow: '10px 10px 0 #111'}}>
    <div style={{position: 'absolute', left: 80, top: 8, bottom: 8, borderLeft: '5px dashed #111'}} />
    <div style={{position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%) rotate(-90deg)', fontFamily: F2.type, fontSize: 22, color: '#111', letterSpacing: 3}}>ADMIT ONE</div>
    {children}
  </div>
);

/** Caja de seguridad abierta y vacía (grande) */
const EmptyBox: React.FC<{w?: number; open?: number}> = ({w = 560, open = 1}) => (
  <div style={{position: 'relative', width: w, height: w * 0.62, perspective: 900}}>
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#1a1a1a,#0c0c0c)', border: '8px solid #2a2a2a', boxShadow: 'inset 0 30px 60px rgba(0,0,0,0.9)'}} />
    <div
      style={{
        position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#9AA0A8,#62686F)', border: '6px solid #2a2a2a', transformOrigin: 'left center',
        transform: `rotateY(${-105 * open}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px',
      }}
    >
      <span style={{fontFamily: F2.mono, fontWeight: 800, fontSize: w * 0.1, color: '#222'}}>Nº 087</span>
      <span style={{width: w * 0.1, height: w * 0.1, borderRadius: '50%', background: '#222', display: 'inline-block'}} />
    </div>
  </div>
);

/* =====================================================================
   S09 — Track 08: Los celos
   ===================================================================== */
export const S09: React.FC<P> = ({t}) => {
  const s = 's09';
  const tDiec = cue(s, 'diecinueve'), tEl = cue(s, 'El plan'), tPerf = cue(s, 'perfecto.'), tCasi = cue(s, 'Casi.'), tPorque = cue(s, 'Porque');
  const tAtrapo = cue(s, 'atrapó'), tAtrap = cue(s, 'atraparon...'), tCelos = cue(s, 'celos.'), tLa = cue(s, 'La pareja'), tConv = cue(s, 'convencida');
  const tOtra = cue(s, 'otra,'), tJus = cue(s, 'Justicia'), tConto = cue(s, 'contó'), tNom = cue(s, 'Nombres.'), tDir = cue(s, 'Direcciones.'), tTodo = cue(s, 'Todo.', 1);
  const tEn = cue(s, 'En pocos'), tCay = cue(s, 'cayeron'), tCasiT = cue(s, 'casi todos.');
  const glitch = t > tCasi - 0.05 && t < tCasi + 0.45 ? 1 - prog(t, tCasi, 0.45) : 0;
  const shCasi = shake(t, tCasi, 16, 0.4);
  const crack = prog(t, tCelos + 0.05, 0.5, easeOut);
  const SLOT = 262;
  return (
    <AbsoluteFill>
      {/* ¿Cuánto se llevaron? */}
      <Beat t={t} t0={-0.2} t1={tEl - 0.05} kind="fade">
        <Zine dark>
          <Halftone color={R.bill} opacity={0.08} id="h09a" />
          <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: F2.head, fontSize: 110, color: '#fff', transform: `scale(${pop(t, 0)})`}}>¿CUÁNTO SE LLEVARON?</div>
          {/* pila de fajos */}
          {Array.from({length: 26}).map((_, i) => {
            const row = i < 7 ? 0 : i < 13 ? 1 : i < 18 ? 2 : i < 22 ? 3 : i < 25 ? 4 : 5;
            const inRow = [0, 7, 13, 18, 22, 25][row];
            const k = i - inRow;
            const n = [7, 6, 5, 4, 3, 1][row];
            const x = 960 - (n * 180) / 2 + k * 180 + 5;
            const y = 960 - row * 78;
            const t0 = tDiec - 0.6 + i * 0.05;
            const f = easeIn(clamp((t - t0) / 0.3));
            return (
              <div key={i} style={{position: 'absolute', left: x, top: -200 + f * (y + 200), opacity: t > t0 ? 1 : 0, transform: `rotate(${(1 - f) * (rnd(i) - 0.5) * 60 + (rnd(i + 9) - 0.5) * 4}deg)`}}>
                <Brick w={170} />
              </div>
            );
          })}
          {t > tDiec - 0.2 ? (
            <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', transform: `scale(${pop(t, tDiec - 0.2)})`}}>
              <div style={{fontFamily: F2.bungee, fontSize: 170, color: R.yellow, lineHeight: 1, textShadow: '0 8px 0 #111, 0 0 40px rgba(255,204,51,0.35)'}}>
                <Counter t={t} t0={tDiec - 0.2} t1={tDiec + 1.1} to={19000000} prefix="US$ " />
              </div>
              <div style={{fontFamily: F2.scrawl, fontSize: 40, color: '#fff', marginTop: 16, opacity: prog(t, tDiec + 1.1, 0.3)}}>(estimado)</div>
            </div>
          ) : null}
        </Zine>
      </Beat>

      {/* El plan era perfecto. Casi. */}
      <Beat t={t} t0={tEl - 0.05} t1={tPorque - 0.05} kind="fade">
        <SliceGlitch amount={glitch} t={t}>
          <Zine>
            <Halftone opacity={0.08} id="h09b" />
            <AbsoluteFill style={{transform: `translate(${shCasi.x}px, ${shCasi.y}px)`}}>
              <div style={{position: 'absolute', left: 0, right: 0, top: 210, textAlign: 'center', fontFamily: F2.head, fontSize: 120, color: '#111'}}>EL PLAN ERA…</div>
              <div style={{transform: t > tCasi ? `translate(${prog(t, tCasi, 0.3) * -60}px, ${prog(t, tCasi, 0.3) * 30}px) rotate(${-prog(t, tCasi, 0.3) * 9}deg)` : 'none', position: 'absolute', inset: 0}}>
                <Stamp t={t} t0={tPerf - 0.05} text="PERFECTO" color={R.green} x={960} y={560} size={190} rot={-6} blend={false} />
              </div>
              {t > tCasi - 0.05 ? (
                <div style={{position: 'absolute', left: 1140, top: 640, fontFamily: F2.scrawl, fontSize: 180, color: R.red, transform: `rotate(-10deg) scale(${pop(t, tCasi - 0.05, 1.3)})`, textShadow: '6px 6px 0 rgba(0,0,0,0.2)'}}>¿casi?</div>
              ) : null}
            </AbsoluteFill>
          </Zine>
        </SliceGlitch>
      </Beat>

      {/* No los atrapó la policía… los atraparon los celos */}
      <Beat t={t} t0={tPorque - 0.05} t1={tLa - 0.05} kind="fade">
        <Zine dark>
          <Halftone color={R.red} opacity={0.1} id="h09c" size={18} />
          {t < tAtrap - 0.05 ? (
            <AbsoluteFill>
              <div style={{position: 'absolute', left: 960 - 190, top: 250, transform: `scale(${pop(t, tPorque)})`}}>
                <Badge size={380} />
              </div>
              {t > tAtrapo ? (
                <svg width="600" height="600" viewBox="0 0 600 600" style={{position: 'absolute', left: 660, top: 190}}>
                  <path d="M80 80 L520 520" stroke={R.red} strokeWidth="44" strokeLinecap="round" strokeDasharray="640" strokeDashoffset={640 * (1 - prog(t, tAtrapo, 0.25))} />
                  <path d="M520 80 L80 520" stroke={R.red} strokeWidth="44" strokeLinecap="round" strokeDasharray="640" strokeDashoffset={640 * (1 - prog(t, tAtrapo + 0.2, 0.25))} />
                </svg>
              ) : null}
              <div style={{position: 'absolute', left: 0, right: 0, top: 80, textAlign: 'center', fontFamily: F2.head, fontSize: 90, color: '#fff', opacity: prog(t, tPorque + 0.3, 0.3)}}>
                A ESTA BANDA <Mark t={t} t0={cue(s, 'no la')} color={R.red}>NO</Mark> LA ATRAPÓ LA POLICÍA
              </div>
            </AbsoluteFill>
          ) : (
            <AbsoluteFill>
              <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: F2.type, fontSize: 56, color: 'rgba(255,255,255,0.8)'}}>la atraparon…</div>
              <div style={{position: 'absolute', left: 960 - 230, top: 200, transform: `scale(${pop(t, tAtrap) * (1 + 0.06 * Math.max(0, Math.sin(t * 9)) * (1 - crack))})`}}>
                <Heart size={460} crack={crack} />
              </div>
              {t > tCelos - 0.1 ? (
                <div style={{position: 'absolute', left: 0, right: 0, top: 690}}>
                  <Ransom text="LOS CELOS" t={t} t0={tCelos - 0.1} size={150} stagger={0.05} seed={31} />
                </div>
              ) : null}
            </AbsoluteFill>
          )}
        </Zine>
      </Beat>

      {/* La pareja de Beto fue a la Justicia */}
      <Beat t={t} t0={tLa - 0.05} t1={tNom - 0.1} kind="fade">
        <Zine>
          <Halftone opacity={0.08} id="h09d" />
          <div style={{position: 'absolute', left: 90, top: 230}}>
            <Bust role="beto" size={400} />
            <div style={{marginTop: -24, display: 'flex', justifyContent: 'center'}}><Placard name="Beto de la Torre" role="LADRÓN CON OFICIO" w={360} /></div>
          </div>
          <div style={{position: 'absolute', left: 560 + easeInOut(clamp((t - tJus + 0.3) / 1.0)) * 360, top: 230, transform: `scale(${pop(t, tLa)})`, opacity: t > tLa ? 1 : 0, transformOrigin: 'bottom center'}}>
            <Bust role="mujer" size={400} />
            <div style={{marginTop: -24, display: 'flex', justifyContent: 'center'}}><Placard name="Su pareja" role="LA QUE SABÍA TODO" num="TESTIGO CLAVE" w={360} /></div>
          </div>
          {/* burbuja de pensamiento */}
          {t > tConv && t < tJus ? (
            <div style={{position: 'absolute', left: 900, top: 60, transform: `scale(${pop(t, tConv)})`, transformOrigin: 'left bottom'}}>
              <div style={{background: '#fff', border: '6px solid #111', borderRadius: 60, padding: '26px 44px', boxShadow: '10px 10px 0 #111'}}>
                <div style={{fontFamily: F2.scrawl, fontSize: 46, color: '#111', lineHeight: 1.4}}>“me va a dejar</div>
                <div style={{fontFamily: F2.scrawl, fontSize: 46, color: '#111', lineHeight: 1.4}}>
                  por <span style={{color: R.red, fontSize: 64, opacity: t > tOtra - 0.05 ? 1 : 0}}>OTRA</span>”
                </div>
              </div>
              {[0, 1].map((i) => <div key={i} style={{position: 'absolute', left: 60 - i * 40, top: 230 + i * 50, width: 40 - i * 14, height: 40 - i * 14, borderRadius: '50%', background: '#fff', border: '5px solid #111'}} />)}
            </div>
          ) : null}
          {t > tJus - 0.3 ? (
            <div style={{position: 'absolute', left: 1360 + (1 - prog(t, tJus - 0.3, 0.5)) * 700, top: 420}}>
              <Tribunal size={500} />
            </div>
          ) : null}
          {t > tConto - 0.05 ? (
            <div style={{position: 'absolute', left: 1080, top: 150, background: R.red, color: '#fff', fontFamily: F2.head, fontSize: 96, padding: '6px 30px', transform: `rotate(-3deg) scale(${pop(t, tConto - 0.05)})`, boxShadow: '10px 10px 0 #111'}}>
              …Y CONTÓ TODO
            </div>
          ) : null}
        </Zine>
      </Beat>

      {/* Nombres. Direcciones. Todo. */}
      <Beat t={t} t0={tNom - 0.1} t1={tEn - 0.05} kind="fade">
        <Zine>
          <div style={{position: 'absolute', left: 300, top: 80, width: 1320, height: 920, background: '#FBF8EE', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', transform: 'rotate(1deg)'}}>
            <div style={{position: 'absolute', left: 60, top: 50, fontFamily: F2.type, fontSize: 40, color: '#111'}}>
              <Typed text="DECLARACIÓN TESTIMONIAL · CAUSA BANCO RÍO" t={t} t0={tNom - 0.2} cps={60} />
            </div>
            <div style={{position: 'absolute', left: 60, top: 110, right: 60, height: 4, background: '#111'}} />
            <div style={{position: 'absolute', left: 90, top: 210, display: 'flex', flexDirection: 'column', gap: 80}}>
              <Check t={t} t0={tNom} text="Nombres" size={100} />
              <Check t={t} t0={tDir} text="Direcciones" size={100} />
              <Check t={t} t0={tTodo} text="Todo" size={100} />
            </div>
            <div style={{position: 'absolute', right: 70, top: 260, width: 420, opacity: prog(t, tNom + 0.2, 0.3)}}>
              {Array.from({length: 9}).map((_, i) => (
                <div key={i} style={{height: 18, marginBottom: 26, background: '#111', width: `${60 + rnd(i * 3) * 40}%`, opacity: t > tNom + 0.2 + i * 0.2 ? 1 : 0}} />
              ))}
            </div>
            <Stamp t={t} t0={tTodo + 0.2} text="CONFIDENCIAL" x={1000} y={780} size={80} rot={-10} />
          </div>
        </Zine>
      </Beat>

      {/* Cayeron casi todos */}
      <Beat t={t} t0={tEn - 0.05} kind="fade">
        <LineupWall>
          <div style={{position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', fontFamily: F2.head, fontSize: 84, color: '#111', zIndex: 5}}>
            EN POCOS MESES, CAYERON <Mark t={t} t0={tCasiT} color={R.yellow}>CASI</Mark> TODOS
          </div>
          {CREW.map((c, i) => {
            const x = 960 - (CREW.length * SLOT) / 2 + i * SLOT;
            const caught = c.role !== 'misterio';
            const tk = tCay + i * 0.14;
            const hide = !caught ? prog(t, tCasiT + 0.2, 0.6) : 0;
            return (
              <div key={i} style={{position: 'absolute', left: x, top: 360, width: SLOT - 12}}>
                <div style={{display: 'flex', justifyContent: 'center', opacity: 1 - hide, transform: `translateY(${hide * 40}px)`}}>
                  <Bust role={c.role} size={250} />
                </div>
                <div style={{marginTop: -14, display: 'flex', justifyContent: 'center', opacity: 1 - hide}}>
                  <Placard name={c.name} role={c.job} num={`N° ${String(i + 1).padStart(2, '0')}`} w={240} />
                </div>
                {caught ? <Stamp t={t} t0={tk} text="DETENIDO" x={(SLOT - 12) / 2} y={205} size={40} rot={-14 + rnd(i) * 10} blend={false} /> : null}
                {!caught && t > tCasiT + 0.3 ? (
                  <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', fontFamily: F2.scrawl, fontSize: 100, color: R.red, transform: `rotate(-6deg) scale(${pop(t, tCasiT + 0.3)})`}}>¿?</div>
                ) : null}
              </div>
            );
          })}
        </LineupWall>
      </Beat>
    </AbsoluteFill>
  );
};

/* =====================================================================
   S10 — Track 09: Bonus track (condenas y película)
   ===================================================================== */
export const S10: React.FC<P> = ({t}) => {
  const s = 's10';
  const tEntre = cue(s, 'entre'), tA = cue(s, 'A Vitette,'), tPor = cue(s, 'por este'), tVein = cue(s, 'veintiuno.'), tHoy = cue(s, 'Hoy'), tLibres = cue(s, 'libres.');
  const tY = cue(s, 'Y la historia'), tSolo = cue(s, 'solo'), tAca = cue(s, 'acá:'), tVeinte = cue(s, 'veinte'), tEstreno = cue(s, 'estrenó');
  const tGui = cue(s, 'Guillermo'), tDiego = cue(s, 'Diego'), tDos = cue(s, 'dos millones'), tQuien = cue(s, '¿Y quién'), tMism = cue(s, 'mismísimo'), tAra = cue(s, 'Araujo.');
  const caught = CREW.filter((c) => c.role !== 'misterio');
  const SLOT = 330;
  const barsP = prog(t, 0.3, 0.7, easeIn);
  const lift = prog(t, tLibres - 0.2, 0.7, easeInOut);
  const focusV = prog(t, tA - 0.1, 0.5, easeInOut) * (1 - prog(t, tHoy - 0.2, 0.4));
  const clap = t < tEstreno - 0.25 ? 0 : t < tEstreno ? prog(t, tEstreno - 0.25, 0.25, easeIn) : 1;
  const shClap = shake(t, tEstreno, 10, 0.3);
  return (
    <AbsoluteFill>
      {/* Condenas y libertad */}
      <Beat t={t} t0={-0.2} t1={tY - 0.05} kind="fade">
        <LineupWall>
          {caught.map((c, i) => {
            const x = 960 - (caught.length * SLOT) / 2 + i * SLOT;
            const isV = c.role === 'traje';
            const dim = isV ? 1 : 1 - 0.6 * focusV;
            return (
              <div key={i} style={{position: 'absolute', left: x, top: 290, width: SLOT - 20, opacity: dim, transform: `scale(${isV ? 1 + 0.12 * focusV : 1})`, transformOrigin: 'bottom center'}}>
                <div style={{display: 'flex', justifyContent: 'center'}}><Bust role={c.role} size={280} /></div>
                <div style={{marginTop: -16, display: 'flex', justifyContent: 'center'}}><Placard name={c.name} role={c.job} num="CONDENADO · 2010" w={300} /></div>
              </div>
            );
          })}
          <Bars p={barsP} lift={lift} />
          {/* títulos arriba de las rejas */}
          <div style={{position: 'absolute', left: 70, top: 50, zIndex: 10, display: 'flex', alignItems: 'center', gap: 26}}>
            <div style={{fontFamily: F2.bungee, fontSize: 110, color: R.red, background: '#111', padding: '0 24px', transform: `scale(${pop(t, 0)})`}}>2010</div>
            {t > tEntre - 0.1 && t < tHoy - 0.1 ? (
              <div style={{background: '#fff', border: '6px solid #111', padding: '6px 24px', fontFamily: F2.head, fontSize: 72, color: '#111', transform: `scale(${pop(t, tEntre - 0.1)})`, transformOrigin: 'left'}}>
                CONDENAS: DE 9 A 15 AÑOS
              </div>
            ) : null}
            {t > tHoy - 0.1 ? (
              <div style={{background: R.yellow, border: '6px solid #111', padding: '6px 24px', fontFamily: F2.head, fontSize: 72, color: '#111', transform: `scale(${pop(t, tHoy - 0.1)})`, transformOrigin: 'left'}}>
                HOY: TODOS LIBRES
              </div>
            ) : null}
          </div>
          {t > tPor - 0.1 && t < tHoy - 0.1 ? (
            <div style={{position: 'absolute', left: 1330, top: 190, zIndex: 10, background: '#111', color: '#fff', border: `6px solid ${R.red}`, padding: '10px 26px', transform: `rotate(4deg) scale(${pop(t, tPor - 0.1)})`, textAlign: 'center'}}>
              <div style={{fontFamily: F2.type, fontSize: 28, color: R.yellow}}>MARIO VITETTE</div>
              <div style={{fontFamily: F2.bungee, fontSize: 130, color: R.red, lineHeight: 1}}>{t > tVein - 0.1 ? <Counter t={t} t0={tVein - 0.1} t1={tVein + 0.5} from={15} to={21} /> : '??'}</div>
              <div style={{fontFamily: F2.head, fontSize: 44}}>AÑOS</div>
              <div style={{fontFamily: F2.scrawl, fontSize: 24, color: '#ddd', marginTop: 6}}>por este y otros robos</div>
            </div>
          ) : null}
          {t > tLibres ? <Stamp t={t} t0={tLibres} text="LIBRES" x={960} y={720} size={170} rot={-8} color={R.green} blend={false} /> : null}
        </LineupWall>
      </Beat>

      {/* Solo podía pasar acá */}
      <Beat t={t} t0={tY - 0.05} t1={tEstreno - 0.35} kind="fade">
        <AbsoluteFill style={{background: '#fff'}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 360, background: '#74ACDF'}} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 360, background: '#74ACDF'}} />
          <Halftone opacity={0.1} id="h10b" />
          <svg width="300" height="300" viewBox="-150 -150 300 300" style={{position: 'absolute', left: 810, top: 390, transform: `rotate(${t * 20}deg)`, opacity: 0.9}}>
            {Array.from({length: 32}).map((_, i) => (
              <path key={i} d={i % 2 ? 'M-8 -60 L0 -128 L8 -60 Z' : 'M-10 -60 Q-16 -95 0 -128 Q16 -95 10 -60 Z'} fill="#F6B40E" stroke="#85340A" strokeWidth="2" transform={`rotate(${(i * 360) / 32})`} />
            ))}
            <circle r="62" fill="#F6B40E" stroke="#85340A" strokeWidth="3" />
          </svg>
          <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: F2.head, fontSize: 78, color: '#fff', textShadow: '0 5px 0 #111'}}>UN FINAL QUE SOLO PODÍA PASAR…</div>
          {t > tSolo - 0.1 ? (
            <div style={{position: 'absolute', left: 0, right: 0, top: 420}}>
              <Ransom text="ACÁ" t={t} t0={tAca - 0.15} size={220} stagger={0.06} seed={41} />
            </div>
          ) : null}
          {t > tVeinte - 0.5 ? (
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 90, textAlign: 'center', fontFamily: F2.bungee, fontSize: 150, color: '#111', lineHeight: 1, transform: `scale(${pop(t, tVeinte - 0.5)})`}}>2020</div>
          ) : null}
        </AbsoluteFill>
      </Beat>

      {/* La película */}
      <Beat t={t} t0={tEstreno - 0.35} t1={tQuien - 0.05} kind="fade">
        <AbsoluteFill style={{background: '#0B0B0B', transform: `translate(${shClap.x}px, ${shClap.y}px)`}}>
          <AbsoluteFill style={{background: `conic-gradient(from 150deg at 30% -10%, rgba(0,0,0,0) 0deg, rgba(255,240,200,0.16) 14deg, rgba(0,0,0,0) 30deg), conic-gradient(from 190deg at 75% -10%, rgba(0,0,0,0) 0deg, rgba(255,240,200,0.14) 12deg, rgba(0,0,0,0) 26deg)`}} />
          <Halftone color="#fff" opacity={0.05} id="h10c" />
          <div style={{position: 'absolute', left: 70, top: 120, transform: `rotate(-6deg) scale(${pop(t, tEstreno - 0.35)})`}}>
            <Clapper size={560} clap={clap} />
          </div>
          <div style={{position: 'absolute', left: 90, top: 60, fontFamily: F2.type, fontSize: 36, color: R.yellow, letterSpacing: 6, opacity: prog(t, tEstreno, 0.3)}}>ESTRENO · ENERO 2020</div>
          <RockPhoto src="img2/francella.jpg" t={t} t0={tGui - 0.1} x={1060} y={430} w={440} h={560} rot={-3} seed={51} focus="50% 25%" zoom={[1.05, 1.12]} />
          <RockPhoto src="img2/peretti.jpg" t={t} t0={tDiego - 0.1} x={1570} y={430} w={440} h={560} rot={3} seed={57} focus="50% 20%" zoom={[1.05, 1.12]} />
          {t > tGui ? (
            <div style={{position: 'absolute', left: 840, top: 740, width: 440, textAlign: 'center', opacity: prog(t, tGui, 0.3)}}>
              <div style={{fontFamily: F2.head, fontSize: 52, color: '#fff'}}>GUILLERMO FRANCELLA</div>
              <div style={{fontFamily: F2.scrawl, fontSize: 32, color: R.yellow}}>como Vitette</div>
              <div style={{fontFamily: F2.type, fontSize: 15, color: 'rgba(255,255,255,0.5)', marginTop: 6}}>Foto: Canal22 · CC BY 3.0</div>
            </div>
          ) : null}
          {t > tDiego ? (
            <div style={{position: 'absolute', left: 1350, top: 740, width: 440, textAlign: 'center', opacity: prog(t, tDiego, 0.3)}}>
              <div style={{fontFamily: F2.head, fontSize: 52, color: '#fff'}}>DIEGO PERETTI</div>
              <div style={{fontFamily: F2.scrawl, fontSize: 32, color: R.yellow}}>como Araujo</div>
              <div style={{fontFamily: F2.type, fontSize: 15, color: 'rgba(255,255,255,0.5)', marginTop: 6}}>Foto: Prensa TV Pública · CC BY 2.0</div>
            </div>
          ) : null}
          {t > tDos - 0.5 ? (
            <div style={{position: 'absolute', left: 90, top: 720, transform: `rotate(-4deg) scale(${pop(t, tDos - 0.5)})`}}>
              <Ticket w={640}>
                <div style={{fontFamily: F2.bungee, fontSize: 76, color: '#111', lineHeight: 1}}>
                  <Counter t={t} t0={tDos - 0.4} t1={tDos + 0.9} to={2000000} prefix="+" />
                </div>
                <div style={{fontFamily: F2.head, fontSize: 40, color: '#111'}}>ESPECTADORES EN CINES</div>
              </Ticket>
            </div>
          ) : null}
        </AbsoluteFill>
      </Beat>

      {/* ¿Quién escribió el guion? */}
      <Beat t={t} t0={tQuien - 0.05} kind="fade">
        <AbsoluteFill style={{background: '#0B0B0B'}}>
          <Halftone color={R.yellow} opacity={0.06} id="h10d" size={18} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', fontFamily: F2.type, fontSize: 70, color: '#fff'}}>
            <Typed text="¿Y quién escribió el guion?" t={t} t0={tQuien} cps={26} />
          </div>
          {t > tMism - 0.2 ? (
            <>
              <AbsoluteFill style={{background: `radial-gradient(circle at 30% 62%, rgba(255,230,160,${0.3 * prog(t, tMism - 0.2, 0.4)}) 0%, rgba(0,0,0,0) 35%)`}} />
              <div style={{position: 'absolute', left: 400, top: 330, transform: `scale(${pop(t, tMism - 0.2)})`, transformOrigin: 'bottom center'}}>
                <Bust role="cerebro" size={400} />
              </div>
              <div style={{position: 'absolute', left: 900, top: 380, opacity: prog(t, tMism, 0.4), transform: `translateX(${(1 - prog(t, tMism, 0.5)) * 60}px)`}}>
                <div style={{fontFamily: F2.type, fontSize: 32, color: 'rgba(255,255,255,0.7)', letterSpacing: 8}}>GUION</div>
                <div style={{fontFamily: F2.head, fontSize: 80, color: '#fff', lineHeight: 1.05}}>ALEX ZITO</div>
                <div style={{fontFamily: F2.type, fontSize: 40, color: 'rgba(255,255,255,0.7)'}}>y</div>
                <div style={{fontFamily: F2.head, fontSize: 116, color: R.yellow, lineHeight: 1.05}}>
                  <Mark t={t} t0={tAra - 0.1} color={R.red}>FERNANDO ARAUJO</Mark>
                </div>
              </div>
              <Stamp t={t} t0={tAra + 0.35} text="EL LADRÓN" sub="ESCRIBIÓ SU PROPIA PELÍCULA" x={1330} y={860} size={96} rot={-7} blend={false} />
            </>
          ) : null}
        </AbsoluteFill>
      </Beat>
    </AbsoluteFill>
  );
};

/* =====================================================================
   S11 — Cierre + pantalla final
   ===================================================================== */
export const S11: React.FC<P & {total: number}> = ({t, total}) => {
  const s = 's11';
  const tSinT = cue(s, 'Sin tiros.'), tSinH = cue(s, 'Sin heridos.'), tCon = cue(s, 'Con un'), tPero = cue(s, 'Pero del'), tHubo = cue(s, 'hubo'), tAhorros = cue(s, 'ahorros');
  const tPorque = cue(s, 'Porque'), tPlata = cue(s, 'la plata'), tBanco = cue(s, 'banco...'), tNi = cue(s, 'ni abajo'), tSi = cue(s, 'Si te'), tSus = cue(s, 'suscribite,');
  const tCont = cue(s, 'contanos'), tNos = cue(s, 'Nos vemos');
  const subscribed = t > tSus + 0.3;
  return (
    <AbsoluteFill>
      {/* ¿Fue el robo perfecto? */}
      <Beat t={t} t0={-0.3} t1={tPero - 0.05} kind="fade">
        <Zine>
          <Halftone opacity={0.08} id="h11a" />
          <div style={{position: 'absolute', left: 130, top: 90, fontFamily: F2.head, fontSize: 118, color: '#111', transform: `scale(${pop(t, -0.1)})`, transformOrigin: 'left'}}>
            ¿FUE EL ROBO <Mark t={t} t0={cue(s, 'perfecto?') - 0.1} color={R.yellow}>PERFECTO</Mark>?
          </div>
          <div style={{position: 'absolute', left: 150, top: 330, display: 'flex', flexDirection: 'column', gap: 60}}>
            <Check t={t} t0={tSinT} text="Sin tiros" size={90} />
            <Check t={t} t0={tSinH} text="Sin heridos" size={90} />
            <Check t={t} t0={tCon} text="Cartel de despedida + fuga en gomón" size={90} />
          </div>
          <div style={{position: 'absolute', right: 150, top: 300, transform: `rotate(8deg) scale(${pop(t, tCon + 0.3)})`, opacity: t > tCon + 0.3 ? 1 : 0}}>
            <Vinyl size={380} spin={t * 120} sub="ÉXITO" color={R.red} />
          </div>
        </Zine>
      </Beat>

      {/* Del otro lado */}
      <Beat t={t} t0={tPero - 0.05} t1={tPorque - 0.05} kind="fade" din={0.8}>
        <AbsoluteFill style={{background: '#1C1C1C'}}>
          <Halftone color="#fff" opacity={0.04} id="h11b" />
          <div style={{position: 'absolute', left: 150, top: 300}}>
            <EmptyBox w={620} open={prog(t, tPero + 0.2, 1.4, easeInOut)} />
            <Smoke t={t} x={460} y={420} n={5} color="rgba(200,200,190,0.18)" scale={0.5} />
            <div style={{marginTop: 30, fontFamily: F2.type, fontSize: 36, color: 'rgba(255,255,255,0.5)', letterSpacing: 6, opacity: prog(t, tPero + 1.2, 0.5)}}>CAJA DE SEGURIDAD · VACÍA</div>
          </div>
          <div style={{position: 'absolute', left: 900, top: 250, width: 900}}>
            <div style={{fontFamily: F2.type, fontSize: 48, color: 'rgba(255,255,255,0.65)', opacity: prog(t, tPero, 0.5)}}>Pero del otro lado…</div>
            <div style={{fontFamily: F2.head, fontSize: 84, color: '#E9E3D2', lineHeight: 1.1, marginTop: 30, opacity: prog(t, tHubo - 0.1, 0.5)}}>
              HUBO GENTE QUE PERDIÓ
            </div>
            <div style={{fontFamily: F2.head, fontSize: 96, color: '#E9E3D2', lineHeight: 1.1, marginTop: 10, opacity: prog(t, tAhorros - 0.1, 0.5)}}>
              LOS AHORROS DE <span style={{color: R.red}}>TODA SU VIDA</span>
            </div>
          </div>
        </AbsoluteFill>
      </Beat>

      {/* Ni abajo del banco */}
      <Beat t={t} t0={tPorque - 0.05} t1={tSi - 0.05} kind="fade">
        <Zine>
          <Halftone opacity={0.08} id="h11c" />
          <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', fontFamily: F2.head, fontSize: 84, color: '#111', opacity: prog(t, tPorque, 0.3)}}>
            EN LA ARGENTINA, LA PLATA <span style={{opacity: prog(t, tPlata + 0.4, 0.3)}}>NO ESTÁ SEGURA…</span>
          </div>
          <div style={{position: 'absolute', left: 260, top: 320, display: 'flex', flexDirection: 'column', gap: 70}}>
            {[
              {t0: tBanco - 0.1, x: 'EN EL BANCO', sub: '(ver episodio 1: el corralito)'},
              {t0: tNi - 0.1, x: 'NI ABAJO DEL BANCO', sub: '(ver este episodio)'},
            ].map((r, i) => (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 40, opacity: t > r.t0 ? 1 : 0, transform: `translateX(${(1 - prog(t, r.t0, 0.35)) * -60}px)`}}>
                <div style={{fontFamily: F2.scrawl, fontSize: 150, color: R.red, width: 150, transform: `scale(${pop(t, r.t0 + 0.2)})`, lineHeight: 1}}>✗</div>
                <div>
                  <div style={{fontFamily: F2.head, fontSize: 130, color: '#111', lineHeight: 1}}>
                    <Strike t={t} t0={r.t0 + 0.4} width={14}>{r.x}</Strike>
                  </div>
                  <div style={{fontFamily: F2.scrawl, fontSize: 32, color: R.red, marginTop: 10, opacity: prog(t, r.t0 + 0.5, 0.3)}}>{r.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </Zine>
      </Beat>

      {/* Pantalla final */}
      <Beat t={t} t0={tSi - 0.05} kind="fade">
        <Zine dark>
          <Halftone color={R.red} opacity={0.1} id="h11d" size={18} />
          <div style={{position: 'absolute', left: 110, top: 150}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 22, transform: `scale(${0.9 + 0.1 * pop(t, tSi)})`, transformOrigin: 'left'}}>
              <div style={{width: 56, height: 56, background: R.yellow, borderRadius: 10}} />
              <div style={{fontFamily: F2.head, fontSize: 150, color: '#fff', letterSpacing: 8, lineHeight: 1}}>CONTEXTO</div>
            </div>
            <div style={{fontFamily: F2.body, fontWeight: 600, fontSize: 40, color: R.yellow, marginTop: 8, opacity: prog(t, tSi + 0.3, 0.4)}}>Argentina, explicada.</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 26, marginTop: 70, transform: `scale(${pop(t, tSus - 0.3) * (t > tSus && t < tSus + 0.2 ? 0.92 : 1)})`, transformOrigin: 'left', opacity: t > tSus - 0.3 ? 1 : 0}}>
              <div style={{background: subscribed ? '#3A3A3A' : R.red, color: '#fff', fontFamily: F2.body, fontWeight: 900, fontSize: 56, padding: '22px 54px', borderRadius: 60, letterSpacing: 2, boxShadow: '0 12px 24px rgba(0,0,0,0.4)'}}>
                {subscribed ? 'SUSCRIPTO ✓' : 'SUSCRIBITE'}
              </div>
              <Bell size={110} swing={subscribed ? Math.sin((t - tSus) * 25) * 25 * Math.exp(-(t - tSus) * 2) : 0} />
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 50, opacity: prog(t, tCont - 0.1, 0.4)}}>
              <Bubble size={130} />
              <div style={{fontFamily: F2.scrawl, fontSize: 38, color: '#fff', lineHeight: 1.5, width: 560}}>¿Qué caso querés que contemos? Dejalo en los comentarios</div>
            </div>
          </div>
          {/* zona para los elementos de pantalla final de YouTube */}
          <div style={{position: 'absolute', left: 1120, top: 170, opacity: prog(t, tSi + 0.4, 0.5)}}>
            <div style={{fontFamily: F2.type, fontSize: 28, color: R.yellow, letterSpacing: 5, marginBottom: 14}}>MIRÁ EL EPISODIO 1</div>
            <div style={{position: 'relative', width: 680, height: 382, background: '#161513', border: '6px solid #fff', boxShadow: '12px 12px 0 ' + R.red, overflow: 'hidden'}}>
              <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                <div style={{fontFamily: F2.head, fontSize: 140, color: '#fff', lineHeight: 1}}>13 CEROS</div>
                <div style={{fontFamily: F2.type, fontSize: 26, color: 'rgba(255,255,255,0.7)', marginTop: 10}}>la historia del peso argentino</div>
              </div>
            </div>
          </div>
          {t > tNos - 0.1 ? (
            <div style={{position: 'absolute', left: 1180, top: 640, fontFamily: F2.scrawl, fontSize: 64, color: R.red, transform: `rotate(-5deg) scale(${pop(t, tNos - 0.1)})`}}>¡nos vemos!</div>
          ) : null}
          <div style={{position: 'absolute', bottom: 40, left: 60, right: 60, textAlign: 'center', fontFamily: F2.body, fontWeight: 500, fontSize: 19, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, opacity: prog(t, tSi + 0.8, 0.5)}}>
            Fuentes: La Nación · Infobae · Perfil · TN · Ultracine · Wikipedia<br />
            Fotos: Fernando Martello y Fma12 (CC BY-SA 4.0) · Canal22 (CC BY 3.0) · Prensa TV Pública (CC BY 2.0) — Wikimedia Commons<br />
            Música: “Surf Inspector”, “Dead Drop”, “Hotrock”, “Welcome to the Show”, “Cold Funk”, “Raw”, “Sax, Rock, and Roll” — Kevin MacLeod (incompetech.com), CC BY 4.0<br />
            Voz: ElevenLabs · Música adicional y efectos: ElevenLabs
          </div>
          <AbsoluteFill style={{background: '#000', opacity: prog(t, total - 0.6, 0.6)}} />
        </Zine>
      </Beat>
    </AbsoluteFill>
  );
};
