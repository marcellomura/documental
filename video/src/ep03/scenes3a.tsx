import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from '../theme';
import {cue} from './lib';
import {clamp, easeInOut, easeOut, pop, prog, rnd, shake} from '../lib/anim';
import {Beat, ChapterCard, ChapterTag, Counter, Dark, H, LowerThird, Mark, Paper, Photo, Source, Stamp} from '../components/base';
import {Bank, Calendar, DollarBill, House, Mattress} from '../components/art';
import {Clip, Cycle, Medal, MoneyFlow, Mousetrap, Phone, StampPile, SyncWords, Wallet} from './art3';

type P = {t: number};

/** tarjeta del episodio anterior (callback) */
const EpCard: React.FC<{t: number; t0: number; x: number; y: number; title: string; sub: string; rot?: number}> = ({t, t0, x, y, title, sub, rot = -4}) =>
  t < t0 ? null : (
    <div style={{position: 'absolute', left: x, top: y, width: 600, height: 330, background: C.yellow, border: `8px solid ${C.ink}`, boxShadow: `14px 14px 0 ${C.ink}`, transform: `rotate(${rot}deg) scale(${pop(t, t0)})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: F.head, fontSize: 140, lineHeight: 0.95, color: C.ink}}>{title}</div>
      <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 26, letterSpacing: 5, color: C.ink, marginTop: 10}}>{sub}</div>
    </div>
  );

/* =====================================================================
   S01 — Cold open: pagarle al Fondo con plata del Fondo + TÍTULO
   ===================================================================== */
export const S01: React.FC<P> = ({t}) => {
  const s = 's01';
  const tPago = cue(s, 'pagó'), tOch = cue(s, 'ochocientos'), tFondo = cue(s, 'Fondo'), tInt = cue(s, 'Internacional.'), tEsa = cue(s, 'Esa misma');
  const tRev = cue(s, 'revisaba'), tPresta = cue(s, 'presta...'), tCasi = cue(s, 'casi mil'), tSi = cue(s, 'Sí,', 1), tPara = cue(s, 'Para pagarle');
  const tY = cue(s, 'Y no'), tVan = cue(s, 'Van'), tTreinta = cue(s, 'treinta.'), tPor = cue(s, '¿Por qué'), tTitle = cue(s, 'volvemos?', 0, 'e') + 0.3;
  const nDocs = 29;
  return (
    <AbsoluteFill>
      {/* 1. El pago */}
      <Beat t={t} t0={-0.4} t1={tEsa - 0.05} kind="fade">
        <Paper>
          <div style={{position: 'absolute', left: 110, top: 190, transform: `scale(${0.5 + 0.5 * pop(t, -0.45)}) rotate(-4deg)`}}>
            <Calendar size={380} day="25" month="SEP" year="2026" />
          </div>
          <div style={{position: 'absolute', left: 560, top: 250, opacity: prog(t, tPago - 0.3, 0.3)}}>
            <H size={78}>La Argentina le pagó al FMI</H>
            <div style={{fontFamily: F.head, fontSize: 190, lineHeight: 1, color: C.ink, marginTop: 10, opacity: prog(t, tOch - 0.2, 0.3)}}>
              <Mark t={t} t0={tOch} color={C.yellow}>
                <Counter t={t} t0={tOch - 0.2} t1={tOch + 0.9} to={800} prefix="US$ " suffix=" M" />
              </Mark>
            </div>
            <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 34, color: C.ink2, marginTop: 6, opacity: prog(t, tOch + 0.6, 0.3)}}>ochocientos millones de dólares</div>
          </div>
          <Photo src="ep03/fmi_sede.jpg" t={t} t0={tFondo - 0.3} x={1580} y={790} w={500} h={440} rot={3} tape credit="Sede del FMI, Washington · APK · CC BY 4.0" />
          <MoneyFlow t={t} t0={tPago} from={[500, 860]} to={[1480, 800]} n={9} />
          <Stamp t={t} t0={tInt + 0.1} text="PAGADO" x={900} y={760} size={110} rot={-8} />
        </Paper>
      </Beat>

      {/* 2. La revisión y el nuevo desembolso */}
      <Beat t={t} t0={tEsa - 0.05} t1={tSi - 0.05} kind="fade">
        <Paper>
          <div style={{position: 'absolute', left: 130, top: 170, width: 700, height: 760, background: '#FFFDF6', boxShadow: '0 20px 40px rgba(0,0,0,0.25)', transform: 'rotate(-2deg)', padding: '46px 50px'}}>
            <div style={{fontFamily: F.mono, fontWeight: 800, fontSize: 24, color: C.gray, letterSpacing: 2}}>FONDO MONETARIO INTERNACIONAL</div>
            <div style={{fontFamily: F.head, fontSize: 64, color: C.ink, lineHeight: 1.05, marginTop: 12}}>MISIÓN · 3ª REVISIÓN</div>
            <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 28, color: C.ink2, marginTop: 6}}>Argentina · septiembre 2026</div>
            {Array.from({length: 9}).map((_, i) => (
              <div key={i} style={{height: 16, marginTop: 30, width: `${55 + rnd(i * 5) * 40}%`, background: C.ink, opacity: 0.8 * prog(t, tEsa + 0.3 + i * 0.12, 0.2)}} />
            ))}
            {/* lupa */}
            <div style={{position: 'absolute', left: 170 + Math.sin((t - tRev) * 2.2) * 200, top: 330 + Math.cos((t - tRev) * 1.6) * 150, width: 220, height: 220, borderRadius: '50%', border: `14px solid ${C.ink}`, background: 'rgba(116,172,223,0.25)', opacity: prog(t, tRev - 0.2, 0.3)}}>
              <div style={{position: 'absolute', left: 170, top: 190, width: 34, height: 130, background: C.ink, borderRadius: 12, transform: 'rotate(-45deg)'}} />
            </div>
          </div>
          <div style={{position: 'absolute', left: 950, top: 280, width: 860}}>
            <H size={96} style={{opacity: prog(t, tRev - 0.2, 0.3)}}>El FMI revisa las cuentas…</H>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 52, color: C.ink2, marginTop: 40, opacity: prog(t, tPresta - 0.6, 0.3)}}>¿y si nos presta…</div>
            <div style={{fontFamily: F.head, fontSize: 140, lineHeight: 1, color: C.green, marginTop: 10, whiteSpace: 'nowrap', opacity: t > tCasi - 0.1 ? 1 : 0, transform: `scale(${pop(t, tCasi - 0.1)})`, transformOrigin: 'left'}}>+US$ 1.000 M?</div>
            <div style={{fontFamily: F.hand, fontSize: 40, color: C.red, marginTop: 10, opacity: prog(t, tCasi + 0.6, 0.3)}}>(casi mil millones más)</div>
          </div>
        </Paper>
      </Beat>

      {/* 3. El círculo absurdo */}
      <Beat t={t} t0={tSi - 0.05} t1={tY - 0.05} kind="fade">
        <Paper>
          <div style={{position: 'absolute', left: 0, right: 0, top: 90, textAlign: 'center', fontFamily: F.hand, fontSize: 52, color: C.red, transform: 'rotate(-2deg)', opacity: prog(t, tSi, 0.3)}}>sí, escuchaste bien</div>
          <SyncWords t={t} seg={s} from="Para pagarle" to="Fondo." nTo={3} style={{position: 'absolute', left: 150, right: 150, top: 170, textAlign: 'center', fontFamily: F.head, fontSize: 96, lineHeight: 1.05, color: C.ink, textTransform: 'uppercase'}} hi={{fondo: C.red}} />
          {[{x: 420, label: 'ARGENTINA', bg: C.celeste}, {x: 1500, label: 'FMI', bg: C.ink}].map((b, i) => (
            <div key={i} style={{position: 'absolute', left: b.x - 190, top: 560, width: 380, height: 200, background: b.bg, border: `8px solid ${C.ink}`, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.head, fontSize: 80, color: i ? C.yellow : C.ink, boxShadow: `12px 12px 0 ${C.ink}`, transform: `scale(${pop(t, tSi + 0.1 + i * 0.15)})`}}>
              {b.label}
            </div>
          ))}
          <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
            <defs><marker id="ah1" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill={C.red} /></marker><marker id="ah2" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill={C.green} /></marker></defs>
            {t > tPara ? <path d="M620 560 Q960 400 1300 560" fill="none" stroke={C.red} strokeWidth="12" markerEnd={prog(t, tPara, 0.6) > 0.95 ? 'url(#ah1)' : undefined} strokeDasharray="900" strokeDashoffset={900 * (1 - prog(t, tPara, 0.6))} /> : null}
            {t > cue(s, 'pedimos') ? <path d="M1300 770 Q960 930 620 770" fill="none" stroke={C.green} strokeWidth="12" markerEnd={prog(t, cue(s, 'pedimos'), 0.6) > 0.95 ? 'url(#ah2)' : undefined} strokeDasharray="900" strokeDashoffset={900 * (1 - prog(t, cue(s, 'pedimos'), 0.6))} /> : null}
          </svg>
          <div style={{position: 'absolute', left: 810, top: 420, fontFamily: F.head, fontSize: 54, color: C.red, opacity: prog(t, tPara + 0.3, 0.3)}}>US$ 800 M</div>
          <div style={{position: 'absolute', left: 790, top: 860, fontFamily: F.head, fontSize: 54, color: C.green, opacity: prog(t, cue(s, 'pedimos') + 0.3, 0.3)}}>~US$ 1.000 M</div>
          <MoneyFlow t={t} t0={tPara + 0.2} from={[620, 560]} to={[1300, 560]} n={5} arc={-150} />
          <MoneyFlow t={t} t0={cue(s, 'pedimos') + 0.2} from={[1300, 770]} to={[620, 770]} n={5} arc={150} />
        </Paper>
      </Beat>

      {/* 4. Van casi treinta */}
      <Beat t={t} t0={tY - 0.05} t1={tPor - 0.05} kind="fade">
        <Paper>
          {Array.from({length: nDocs}).map((_, i) => {
            const ti = tY - 0.05 + (i / nDocs) * (tTreinta - tY);
            const col = i % 8, row = Math.floor(i / 8);
            return (
              <div key={i} style={{position: 'absolute', left: 120 + col * 215, top: 120 + row * 225, width: 180, height: 200, background: '#FFFDF6', border: `4px solid ${C.ink}`, boxShadow: '6px 6px 0 rgba(0,0,0,0.25)', opacity: t > ti ? 1 : 0, transform: `rotate(${(rnd(i) - 0.5) * 10}deg) scale(${pop(t, ti, 1.3)})`, padding: 12}}>
                <div style={{fontFamily: F.mono, fontWeight: 800, fontSize: 14, color: C.gray}}>ACUERDO</div>
                <div style={{fontFamily: F.head, fontSize: 38, color: C.ink}}>FMI</div>
                {[0, 1, 2].map((k) => <div key={k} style={{height: 8, marginTop: 12, width: `${60 + rnd(i + k) * 35}%`, background: C.ink, opacity: 0.6}} />)}
                <div style={{position: 'absolute', right: 8, bottom: 10, border: `4px solid ${C.red}`, color: C.red, fontFamily: F.head, fontSize: 22, padding: '0 6px', transform: 'rotate(-12deg)'}}>FIRMADO</div>
              </div>
            );
          })}
          {t > tVan - 0.1 ? (
            <div style={{position: 'absolute', right: 110, bottom: 90, background: C.red, color: '#fff', fontFamily: F.head, fontSize: 150, padding: '6px 40px', boxShadow: `14px 14px 0 ${C.ink}`, transform: `rotate(-3deg) scale(${pop(t, tVan - 0.1)})`}}>
              CASI 30
            </div>
          ) : null}
        </Paper>
      </Beat>

      {/* 5. La pregunta + TÍTULO */}
      <Beat t={t} t0={tPor - 0.05} kind="fade">
        <Dark>
          {t < tTitle ? (
            <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <SyncWords t={t} seg={s} from="¿Por" to="volvemos?" style={{fontFamily: F.head, fontSize: 150, color: C.white, textAlign: 'center', textTransform: 'uppercase', width: 1500, lineHeight: 1.05}} hi={{volvemos: C.yellow}} />
            </AbsoluteFill>
          ) : (
            <AbsoluteFill>
              <Clip src="ep03/vid/buenos_aires.mp4" from={27} t={t} t0={tTitle} t1={999} x={0} y={0} w={0} h={0} full dim={0.62} />
              <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `translate(${shake(t, tTitle, 12, 0.4).x}px, ${shake(t, tTitle, 12, 0.4).y}px)`}}>
                <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 12, color: C.yellow, opacity: prog(t, tTitle + 0.5, 0.4)}}>CONTEXTO · EPISODIO 3</div>
                <div style={{fontFamily: F.head, fontSize: 210, lineHeight: 1, color: C.white, marginTop: 10, transform: `scale(${0.9 + 0.1 * pop(t, tTitle)})`}}>
                  ARGENTINA Y EL <span style={{color: C.yellow}}>FMI</span>
                </div>
                <div style={{fontFamily: F.quote, fontStyle: 'italic', fontWeight: 800, fontSize: 80, color: C.white, marginTop: 14, opacity: prog(t, tTitle + 0.3, 0.4)}}>¿Por qué siempre volvemos?</div>
              </AbsoluteFill>
              <AbsoluteFill style={{background: '#fff', opacity: 1 - prog(t, tTitle, 0.18), pointerEvents: 'none'}} />
            </AbsoluteFill>
          )}
        </Dark>
      </Beat>
    </AbsoluteFill>
  );
};

/* =====================================================================
   S02 — La contradicción: un país lleno de dólares, un Estado que los pide
   ===================================================================== */
export const S02: React.FC<P> = ({t}) => {
  const s = 's02';
  const tVideo = cue(s, 'video'), tDosc = cue(s, 'doscientos'), tSist = cue(s, 'sistema.'), tUn = cue(s, 'Un país'), tY = cue(s, 'Y sin');
  const tEstado = cue(s, 'Estado'), tMayor = cue(s, 'mayor'), tPlaneta = cue(s, 'planeta.'), tLos = cue(s, 'Los argentinos', 1), tAhorran = cue(s, 'ahorran');
  const tEl = cue(s, 'El Estado...', 1), tPide = cue(s, 'pide');
  return (
    <AbsoluteFill>
      <Beat t={t} t0={-0.3} t1={tY - 0.05} kind="fade">
        <Paper>
          {t < tUn - 0.05 ? (
            <AbsoluteFill>
              <EpCard t={t} t0={-0.25} x={140} y={250} title="13 CEROS" sub="CONTEXTO · EPISODIO 1" />
              <div style={{position: 'absolute', left: 200, top: 640, fontFamily: F.hand, fontSize: 44, color: C.red, transform: 'rotate(-3deg)', opacity: prog(t, tVideo + 0.3, 0.3)}}>▶ el video anterior</div>
              <div style={{position: 'absolute', left: 900, top: 300}}>
                <div style={{fontFamily: F.head, fontSize: 170, lineHeight: 1, color: C.green, opacity: t > tDosc - 0.2 ? 1 : 0}}>
                  <Counter t={t} t0={tDosc - 0.2} t1={tDosc + 1.2} to={220000} prefix="US$ " />
                </div>
                <H size={84} style={{marginTop: 10, opacity: prog(t, tDosc + 0.8, 0.3)}}>millones de dólares</H>
                <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 44, color: C.ink2, marginTop: 16, opacity: prog(t, tSist - 0.6, 0.3)}}>
                  <Mark t={t} t0={tSist - 0.5}>fuera del sistema</Mark>
                </div>
              </div>
            </AbsoluteFill>
          ) : (
            <AbsoluteFill>
              <div style={{position: 'absolute', left: 960 - 260, top: 180, transform: `scale(${pop(t, tUn)})`}}><House size={520} /></div>
              {Array.from({length: 9}).map((_, i) => {
                const k = pop(t, tUn + 0.3 + i * 0.1);
                const a = (i / 9) * Math.PI * 2;
                return (
                  <div key={i} style={{position: 'absolute', left: 960 + Math.cos(a) * 470 - 110, top: 450 + Math.sin(a) * 300 - 40, transform: `scale(${k}) rotate(${(rnd(i) - 0.5) * 40}deg)`, opacity: t > tUn + 0.3 + i * 0.1 ? 1 : 0}}>
                    <DollarBill w={220} />
                  </div>
                );
              })}
              <div style={{position: 'absolute', left: 0, right: 0, bottom: 90, textAlign: 'center'}}>
                <H size={92}>Un país lleno de <Mark t={t} t0={cue(s, 'escondidos.') - 0.1}>dólares escondidos</Mark></H>
              </div>
            </AbsoluteFill>
          )}
        </Paper>
      </Beat>

      <Beat t={t} t0={tY - 0.05} t1={tLos - 0.05} kind="fade">
        <Paper>
          <div style={{position: 'absolute', left: 170, top: 70}}><Medal size={520} t={t} t0={tMayor - 0.2} label="DEUDOR" /></div>
          <div style={{position: 'absolute', left: 820, top: 200, width: 1040}}>
            <H size={84} style={{opacity: prog(t, tY, 0.3)}}>Y sin embargo…</H>
            <H size={96} style={{marginTop: 30, opacity: prog(t, tEstado - 0.2, 0.3)}}>el Estado argentino es el</H>
            <div style={{fontFamily: F.head, fontSize: 150, lineHeight: 1.02, color: C.ink, opacity: prog(t, tMayor - 0.2, 0.3)}}>
              <Mark t={t} t0={tMayor} color={C.red}><span style={{color: '#fff'}}>MAYOR DEUDOR</span></Mark>
            </div>
            <H size={84} style={{marginTop: 20, opacity: prog(t, tPlaneta - 0.4, 0.3)}}>del FMI en todo el planeta</H>
            <div style={{fontFamily: F.mono, fontWeight: 800, fontSize: 40, color: C.red, marginTop: 30, opacity: prog(t, tPlaneta, 0.3)}}>US$ 57.100 M adeudados (dic. 2025)</div>
          </div>
          <Source t={t} t0={tPlaneta} text="Fuente: Infobae con datos del FMI · 09/01/2026" />
        </Paper>
      </Beat>

      <Beat t={t} t0={tLos - 0.05} kind="fade">
        <AbsoluteFill>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%', background: C.paper}}>
            <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center'}}><H size={80}>Los argentinos</H></div>
            <div style={{position: 'absolute', left: 960 / 2 - 240, top: 240, transform: `scale(${pop(t, tLos)})`}}><Mattress size={480} bills={4} /></div>
            <div style={{position: 'absolute', left: 0, right: 0, top: 740, textAlign: 'center', opacity: prog(t, tAhorran - 0.1, 0.3)}}>
              <div style={{fontFamily: F.head, fontSize: 96, color: C.green}}>AHORRAN EN DÓLARES</div>
            </div>
          </div>
          <div style={{position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%', background: C.ink, opacity: prog(t, tEl - 0.3, 0.3)}}>
            <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center'}}><H size={80} color={C.white}>El Estado</H></div>
            <div style={{position: 'absolute', left: 960 / 2 - 170, top: 300, transform: `scale(${pop(t, tEl)})`}}><Bank size={340} label="ESTADO" fill={C.paper} /></div>
            <div style={{position: 'absolute', left: 960 / 2 - 160, top: 620, fontFamily: F.head, fontSize: 80, color: C.yellow, transform: `rotate(-6deg) scale(${pop(t, tPide)})`, opacity: t > tPide ? 1 : 0}}>“¿ME PRESTÁS?”</div>
            <div style={{position: 'absolute', left: 0, right: 0, top: 800, textAlign: 'center', opacity: prog(t, tPide - 0.1, 0.3)}}>
              <div style={{fontFamily: F.head, fontSize: 96, color: C.red}}>LOS PIDE PRESTADOS</div>
            </div>
          </div>
          <div style={{position: 'absolute', left: 955, top: 0, width: 10, height: `${100 * prog(t, tEl - 0.3, 0.4)}%`, background: C.yellow}} />
        </AbsoluteFill>
      </Beat>
    </AbsoluteFill>
  );
};

/* =====================================================================
   S03 — La billetera del Banco Central: reservas brutas y netas
   ===================================================================== */
export const S03: React.FC<P> = ({t}) => {
  const s = 's03';
  const tBill = cue(s, 'billetera'), tRes = cue(s, 'reservas,'), tDol = cue(s, 'dólares'), tPero = cue(s, 'Pero'), tTrampa = cue(s, 'trampa.');
  const tBrutas = cue(s, 'brutas'), tNetas = cue(s, 'netas,'), tRestas = cue(s, 'restás'), tPrest = cue(s, 'prestado.'), tSegun = cue(s, 'según');
  const tNetas2 = cue(s, 'netas', 1), tBajo = cue(s, 'bajo'), tSiete = cue(s, 'siete'), tLa = cue(s, 'La billetera', 2), tLlena = cue(s, 'llena...'), tAjena = cue(s, 'ajena.');
  const fly = prog(t, tPrest + 0.1, 0.9, easeInOut);
  const merc = prog(t, tBajo - 0.3, 1.4, easeInOut);
  return (
    <AbsoluteFill>
      <Beat t={t} t0={-0.3} t1={tPero - 0.05} kind="fade">
        <Paper>
          <Photo src="ep03/bcra_2016.jpg" t={t} t0={0} x={520} y={520} w={780} h={560} rot={-2} tape credit="Banco Central · Casa Rosada · CC BY 2.5 AR" />
          <div style={{position: 'absolute', left: 1030, top: 150, opacity: prog(t, tBill - 0.2, 0.3)}}>
            <H size={70}>La billetera del <Mark t={t} t0={cue(s, 'Banco')}>Banco Central</Mark></H>
          </div>
          <div style={{position: 'absolute', left: 1040, top: 330, transform: `scale(${pop(t, tBill)})`, opacity: t > tBill ? 1 : 0}}>
            <Wallet size={760} open={prog(t, tRes, 0.7)} bills={6} />
          </div>
          <div style={{position: 'absolute', left: 1060, top: 880, fontFamily: F.head, fontSize: 70, color: C.ink, opacity: prog(t, tRes, 0.3)}}>
            = LAS RESERVAS
            <div style={{fontFamily: F.hand, fontSize: 44, color: C.red, opacity: prog(t, tDol, 0.3)}}>(los dólares del país)</div>
          </div>
        </Paper>
      </Beat>

      <Beat t={t} t0={tPero - 0.05} t1={tBrutas - 0.15} kind="fade">
        <Paper>
          <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center'}}>
            <H size={120}>Pero hay una <span style={{color: C.red}}>trampa</span></H>
          </div>
          <div style={{position: 'absolute', left: 960 - 330, top: 480, transform: `translate(${shake(t, tTrampa + 0.25, 14, 0.4).x}px, ${shake(t, tTrampa + 0.25, 14, 0.4).y}px)`}}>
            <Mousetrap size={660} snap={prog(t, tTrampa + 0.2, 0.12)} />
          </div>
        </Paper>
      </Beat>

      <Beat t={t} t0={tBrutas - 0.15} t1={tSegun - 0.05} kind="fade">
        <Paper>
          <div style={{position: 'absolute', left: 90, top: 330, transform: `translateY(${fly * -40}px)`}}>
            <Wallet size={760} open={1} bills={6} labels={['PRESTADO', 'PRESTADO', '', 'PRESTADO', 'PRESTADO', 'PRESTADO']} labelK={prog(t, tRestas - 0.1, 0.4)} />
          </div>
          {/* los billetes prestados se van */}
          {fly > 0 ? [0, 1, 3, 4, 5].map((i) => (
            <div key={i} style={{position: 'absolute', left: 90 + (110 + i * 78) * (760 / 700), top: 200 - fly * 700, width: 120, height: 60, background: C.bill, border: `4px solid ${C.billDark}`, transform: `rotate(${fly * (i - 2) * 30}deg)`, opacity: 1 - fly}} />
          )) : null}
          <div style={{position: 'absolute', left: 980, top: 230, width: 860}}>
            <div style={{opacity: prog(t, tBrutas - 0.2, 0.3)}}>
              <div style={{fontFamily: F.head, fontSize: 110, color: C.ink}}>BRUTAS</div>
              <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 46, color: C.ink2}}>= todo lo que hay en la billetera</div>
            </div>
            <div style={{marginTop: 70, opacity: prog(t, tNetas - 0.2, 0.3)}}>
              <div style={{fontFamily: F.head, fontSize: 110, color: C.red}}>NETAS</div>
              <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 46, color: C.ink2}}>= lo que queda si <Mark t={t} t0={tRestas}>restás lo prestado</Mark></div>
            </div>
          </div>
        </Paper>
      </Beat>

      <Beat t={t} t0={tSegun - 0.05} t1={tLa - 0.05} kind="fade">
        <Paper>
          {/* termómetro */}
          <div style={{position: 'absolute', left: 260, top: 110, width: 120, height: 820}}>
            <div style={{position: 'absolute', left: 30, top: 0, width: 60, height: 700, background: '#fff', border: `7px solid ${C.ink}`, borderRadius: 30}} />
            <div style={{position: 'absolute', left: 0, top: 660, width: 120, height: 120, borderRadius: 60, background: C.celesteDark, border: `7px solid ${C.ink}`}} />
            <div style={{position: 'absolute', left: 44, width: 32, bottom: 110, top: 250 + merc * 330, background: merc > 0.4 ? C.celesteDark : C.red, borderRadius: 16}} />
            <div style={{position: 'absolute', left: -130, top: 330, width: 380, height: 6, background: C.ink}} />
            <div style={{position: 'absolute', left: -210, top: 300, fontFamily: F.head, fontSize: 60, color: C.ink}}>0</div>
          </div>
          <div style={{position: 'absolute', left: 620, top: 190, width: 1200}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 40, color: C.ink2, opacity: prog(t, tSegun, 0.3)}}>Según la cuenta del propio FMI…</div>
            <H size={96} style={{marginTop: 20, opacity: prog(t, tNetas2 - 0.2, 0.3)}}>las reservas netas están</H>
            <div style={{fontFamily: F.head, fontSize: 170, color: C.celesteDark, lineHeight: 1, opacity: prog(t, tBajo - 0.2, 0.3)}}>BAJO CERO</div>
            <div style={{fontFamily: F.head, fontSize: 190, color: C.red, lineHeight: 1, marginTop: 20, opacity: t > tSiete - 0.2 ? 1 : 0}}>
              <Counter t={t} t0={tSiete - 0.2} t1={tSiete + 1.2} to={7000} prefix="–US$ " suffix=" M" />
            </div>
          </div>
          <Source t={t} t0={tSiete} text="Reservas netas, metodología del FMI · sep. 2026 · Fuente: Infobae, 22/09/2026" />
        </Paper>
      </Beat>

      <Beat t={t} t0={tLa - 0.05} kind="fade">
        <Paper>
          <div style={{position: 'absolute', left: 580, top: 330, transform: `scale(${pop(t, tLa)})`}}>
            <Wallet size={760} open={1} bills={6} labels={['AJENA', 'AJENA', 'AJENA', 'AJENA', 'AJENA', 'AJENA']} labelK={prog(t, tAjena - 0.3, 0.3)} />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center'}}>
            <H size={110}>La billetera está llena…</H>
            <div style={{fontFamily: F.head, fontSize: 120, color: C.red, opacity: prog(t, tAjena - 0.5, 0.3)}}>…DE PLATA AJENA</div>
          </div>
          {t > tLlena ? <div style={{position: 'absolute', left: 1480, top: 560, fontFamily: F.hand, fontSize: 56, color: C.red, transform: 'rotate(-8deg)', opacity: prog(t, tLlena, 0.3)}}>¡llena!</div> : null}
        </Paper>
      </Beat>
    </AbsoluteFill>
  );
};

/* =====================================================================
   S04 — Prestamista de última instancia y el círculo vicioso
   ===================================================================== */
export const CYCLE = (s: string, n = 0) => {
  if (s === 's04') {
    return [
      {text: 'DESCONFIAMOS DEL PESO', t0: cue(s, 'desconfiamos')},
      {text: 'COMPRAMOS DÓLARES', t0: cue(s, 'compramos'), color: C.bill},
      {text: 'EL CENTRAL SE QUEDA SIN DÓLARES', t0: cue(s, 'Banco')},
      {text: 'LLAMAMOS AL FMI', t0: cue(s, 'llamamos'), color: C.celeste},
      {text: 'EL FMI PRESTA… Y PIDE AJUSTE', t0: cue(s, 'El Fondo presta,')},
      {text: 'EL AJUSTE TRAE CRISIS', t0: cue(s, 'ajuste', 1), color: '#F4B6B0'},
    ];
  }
  return [];
};

export const S04: React.FC<P> = ({t}) => {
  const s = 's04';
  const tPrest = cue(s, 'prestamista'), tAtiende = cue(s, 'atiende'), tNadie = cue(s, 'nadie'), tNueve = cue(s, 'nueve'), tCasi = cue(s, 'casi nadie');
  const tCirc = cue(s, 'círculo'), tPide = cue(s, 'pide'), tY = cue(s, 'Y la crisis'), tDesc2 = cue(s, 'desconfiar');
  const items = CYCLE(s);
  const spin = t > tY ? easeInOut(clamp((t - tY) / 2.4)) * 360 : 0;
  const hiIdx = items.reduce((a, it, i) => (t >= it.t0 ? i : a), -1);
  const phones = [
    {label: 'BANCOS', ok: false, t0: tNadie},
    {label: 'INVERSORES', ok: false, t0: tNadie + 0.35},
    {label: 'FMI', ok: true, t0: tAtiende},
  ];
  return (
    <AbsoluteFill>
      <Beat t={t} t0={-0.3} t1={tPrest - 0.25} kind="fade">
        <Paper>
          <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <SyncWords t={t} seg={s} from="¿Por" to="Fondo?" style={{fontFamily: F.head, fontSize: 140, lineHeight: 1.05, color: C.ink, textAlign: 'center', textTransform: 'uppercase', width: 1500}} hi={{fondo: C.red}} />
          </AbsoluteFill>
        </Paper>
      </Beat>
      <Beat t={t} t0={tPrest - 0.25} t1={tNueve - 0.1} kind="fade">
        <Paper>
          <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', opacity: prog(t, tPrest - 0.2, 0.3)}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 36, color: C.ink2, letterSpacing: 4}}>EL FMI ES EL</div>
            <H size={110}><Mark t={t} t0={tPrest}>prestamista de última instancia</Mark></H>
          </div>
          {phones.map((p, i) => {
            const x = 360 + i * 600;
            const ringing = t < p.t0;
            return (
              <div key={i} style={{position: 'absolute', left: x - 150, top: 440, width: 300, textAlign: 'center', opacity: prog(t, tPrest + 0.4 + i * 0.15, 0.3)}}>
                <Phone size={300} ring={ringing ? t : 0} color={p.ok ? C.green : C.red} />
                <div style={{fontFamily: F.head, fontSize: 56, color: C.ink, marginTop: 10}}>{p.label}</div>
                {t > p.t0 ? (
                  <div style={{marginTop: 10, fontFamily: F.head, fontSize: 48, color: p.ok ? C.green : C.red, transform: `scale(${pop(t, p.t0)})`}}>{p.ok ? '“¿HOLA?”' : 'NO ATIENDE'}</div>
                ) : null}
              </div>
            );
          })}
        </Paper>
      </Beat>

      <Beat t={t} t0={tNueve - 0.1} t1={tCirc - 0.1} kind="fade">
        <Dark>
          <StampPile t={t} t0={tNueve} t1={tNueve + 1.3} n={9} text="DEFAULT" dark />
          <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontFamily: F.head, fontSize: 330, lineHeight: 1, color: C.white, textShadow: '0 10px 0 #000'}}>
              <Counter t={t} t0={tNueve - 0.1} t1={tNueve + 0.6} to={9} /> <span style={{fontSize: 200}}>DEFAULTS</span>
            </div>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 56, color: C.yellow, marginTop: 20, opacity: prog(t, tCasi - 0.1, 0.3)}}>…casi nadie te atiende el teléfono</div>
          </AbsoluteFill>
        </Dark>
      </Beat>

      <Beat t={t} t0={tCirc - 0.1} kind="fade">
        <Paper>
          {t < items[0].t0 - 0.2 ? (
            <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <H size={110}>El círculo es <Mark t={t} t0={cue(s, 'siempre el mismo:')}>siempre el mismo</Mark></H>
            </AbsoluteFill>
          ) : null}
          <div style={{position: 'absolute', left: 70, top: 60, opacity: prog(t, items[0].t0 - 0.2, 0.3)}}>
            <H size={70}>El círculo</H>
            <div style={{fontFamily: F.hand, fontSize: 40, color: C.red}}>siempre el mismo</div>
          </div>
          <div style={{position: 'absolute', left: 960 - 500, top: 40}}>
            <Cycle t={t} items={items} r={380} spin={spin} hi={t > tDesc2 ? 0 : hiIdx} size={1000} closeAt={tY - 0.3} guide={prog(t, tCirc, 0.6)} />
          </div>
          <Clip src="ep03/vid/tarifazo.mp4" from={2} t={t} t0={tPide} t1={99} x={960} y={540} w={470} h={290} rot={-2} credit="Protesta, 2019 · Banfield · CC BY-SA 2.5 AR" />
        </Paper>
      </Beat>
    </AbsoluteFill>
  );
};

/* =====================================================================
   S05 — Capítulo 1: 1958, el primer acuerdo, y el "chau" de 2006
   ===================================================================== */
export const S05: React.FC<P> = ({t}) => {
  const s = 's05';
  const tFron = cue(s, 'Frondizi'), tFirmo = cue(s, 'firmó'), tSet = cue(s, 'setenta'), tHoy = cue(s, 'Hoy,'), tDiez = cue(s, 'diez días');
  const tDesde = cue(s, 'Desde'), tCada = cue(s, 'cada'), tHasta = cue(s, 'Hasta'), tNestor = cue(s, 'Néstor'), tCasi = cue(s, 'casi diez');
  const tSola = cue(s, 'sola'), tChau = cue(s, 'chau'), tDuro = cue(s, 'duró'), tDoce = cue(s, 'doce');
  const day = Math.min(10, Math.max(1, Math.floor((t - tHoy - 0.2) * 5) + 1));
  return (
    <AbsoluteFill>
      <Beat t={t} t0={tFron - 0.35} t1={tDesde - 0.05} kind="fade">
        <Paper>
          <ChapterTag t={t} t0={tFron} label="Capítulo 1 · 1958" />
          <Photo src="ep03/frondizi.jpg" t={t} t0={tFron - 0.3} x={520} y={540} w={520} h={700} rot={-3} bw tape credit="Arturo Frondizi · Dominio público" focus="50% 30%" />
          <LowerThird t={t} t0={tFirmo} t1={tHoy} name="Arturo Frondizi" role="Presidente · firmó el primer acuerdo (1958)" x={140} y={860} />
          {t < tHoy - 0.05 ? (
            <div style={{position: 'absolute', left: 950, top: 300}}>
              <H size={80} style={{opacity: prog(t, tFirmo, 0.3)}}>El primer acuerdo:</H>
              <div style={{fontFamily: F.head, fontSize: 210, lineHeight: 1, color: C.green, opacity: t > tSet - 0.2 ? 1 : 0}}>
                <Counter t={t} t0={tSet - 0.2} t1={tSet + 0.8} to={75} prefix="US$ " suffix=" M" />
              </div>
            </div>
          ) : (
            <div style={{position: 'absolute', left: 930, top: 170, width: 900}}>
              <H size={76}>Hoy, con eso…</H>
              <div style={{display: 'flex', alignItems: 'center', gap: 30, marginTop: 20}}>
                <div style={{transform: `rotate(${(day % 2) * 4 - 2}deg)`}}><Calendar size={330} day={String(day)} month="DÍAS" /></div>
                <div style={{fontFamily: F.head, fontSize: 90, lineHeight: 1.02, color: C.ink, opacity: prog(t, tDiez - 0.2, 0.3)}}>
                  NO ALCANZA NI PARA <Mark t={t} t0={tDiez} color={C.red}><span style={{color: '#fff'}}>10 DÍAS</span></Mark> DE INTERESES
                </div>
              </div>
            </div>
          )}
        </Paper>
      </Beat>

      <Beat t={t} t0={tDesde - 0.05} t1={tHasta - 0.05} kind="fade">
        <Paper>
          <div style={{position: 'absolute', left: 140, right: 140, top: 560, height: 10, background: C.ink, transformOrigin: 'left', transform: `scaleX(${prog(t, tDesde, 1.6)})`}} />
          <div style={{position: 'absolute', left: 110, top: 600, fontFamily: F.head, fontSize: 70, color: C.ink}}>1958</div>
          <div style={{position: 'absolute', right: 110, top: 600, fontFamily: F.head, fontSize: 70, color: C.ink, opacity: prog(t, tDesde + 1.5, 0.3)}}>2006</div>
          {Array.from({length: 18}).map((_, i) => {
            const ti = tDesde + 0.1 + i * 0.09;
            return (
              <div key={i} style={{position: 'absolute', left: 150 + i * 90, top: 420 - (i % 2) * 90, border: `6px solid ${C.red}`, color: C.red, fontFamily: F.head, fontSize: 44, padding: '0 10px', transform: `rotate(${(rnd(i) - 0.5) * 24}deg) scale(${pop(t, ti, 1.4)})`, opacity: t > ti ? 1 : 0, background: 'rgba(255,255,255,0.6)'}}>
                FMI
              </div>
            );
          })}
          <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', opacity: prog(t, tCada - 0.3, 0.3)}}>
            <H size={100}>Un acuerdo cada <Mark t={t} t0={tCada}>dos años y pico</Mark></H>
          </div>
        </Paper>
      </Beat>

      <Beat t={t} t0={tHasta - 0.05} kind="fade">
        <Paper>
          <ChapterTag t={t} t0={tHasta} label="2006" />
          <Photo src="ep03/nestor.jpg" t={t} t0={tNestor - 0.3} x={500} y={540} w={520} h={680} rot={2} tape credit="Néstor Kirchner · Casa Rosada · CC BY 2.5 AR" focus="50% 30%" />
          <LowerThird t={t} t0={tNestor + 0.2} t1={tDuro} name="Néstor Kirchner" role="Presidente · 3 de enero de 2006" x={130} y={870} />
          {t < tDuro - 0.05 ? (
            <div style={{position: 'absolute', left: 930, top: 220, width: 900}}>
              <H size={70} style={{opacity: prog(t, tNestor, 0.3)}}>Le paga todo al FMI:</H>
              <div style={{fontFamily: F.head, fontSize: 124, lineHeight: 1.02, color: C.green, whiteSpace: 'nowrap', opacity: t > tCasi - 0.2 ? 1 : 0}}>
                casi <Counter t={t} t0={tCasi - 0.2} t1={tCasi + 1} to={10000} prefix="US$ " suffix=" M" />
              </div>
              <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 48, color: C.ink2, opacity: prog(t, tSola - 0.3, 0.3)}}>en un solo pago</div>
              {t > tChau - 0.1 ? (
                <div style={{marginTop: 30, display: 'inline-block', background: C.yellow, border: `8px solid ${C.ink}`, padding: '10px 40px', fontFamily: F.head, fontSize: 130, color: C.ink, boxShadow: `12px 12px 0 ${C.ink}`, transform: `rotate(${-4 + Math.sin((t - tChau) * 12) * 3 * Math.exp(-(t - tChau) * 1.5)}deg) scale(${pop(t, tChau - 0.1)})`}}>
                  ¡CHAU, FMI! 👋
                </div>
              ) : null}
            </div>
          ) : (
            <div style={{position: 'absolute', left: 930, top: 250, width: 900}}>
              <div style={{fontFamily: F.head, fontSize: 90, color: C.ink, opacity: 0.35, transform: `rotate(-4deg) scale(${1 - 0.4 * prog(t, tDuro, 0.6)})`, textDecoration: 'line-through', textDecorationColor: C.red}}>¡CHAU, FMI! 👋</div>
              <H size={90} style={{marginTop: 30}}>El chau duró</H>
              <div style={{fontFamily: F.head, fontSize: 230, lineHeight: 1, color: C.red, transform: `scale(${pop(t, tDoce - 0.1)})`, transformOrigin: 'left', opacity: t > tDoce - 0.1 ? 1 : 0}}>12 AÑOS</div>
              <div style={{fontFamily: F.mono, fontWeight: 800, fontSize: 44, color: C.ink2, opacity: prog(t, tDoce + 0.3, 0.3)}}>2006 → 2018</div>
            </div>
          )}
        </Paper>
      </Beat>
      <ChapterCard t={t} t0={-0.95} t1={tFron - 0.2} year="1958" title="El primer acuerdo" num="CAPÍTULO 1" color={C.celeste} bg="#10283F" />
    </AbsoluteFill>
  );
};
