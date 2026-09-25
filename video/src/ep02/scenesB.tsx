import React from 'react';
import {AbsoluteFill} from 'remotion';
import {R, F2, cue, segWords} from './lib';
import {clamp, easeIn, easeInOut, easeOut, pop, prog, rnd, shake} from '../lib/anim';
import {Beat, Counter, LowerThird, Mark, Stamp} from '../components/base';
import {Zine, Halftone, Bust, PoliceLights, ToyGun, Phone, PizzaBox, Soda, Cake, SafeGrid, Van, Marquee, Check, RockPhoto, Typed, ClockHUD} from './rock';
import {CrossSection, HeistMap} from './section';

type P = {t: number};

/** hora interpolada entre marcas (minutos desde medianoche) */
export const hhmm = (min: number) => {
  const m = Math.floor(min);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

const Person: React.FC<{c?: string; s?: number}> = ({c = '#111', s = 1}) => (
  <svg width={46 * s} height={80 * s} viewBox="0 0 46 80">
    <circle cx="23" cy="14" r="11" fill={c} />
    <path d="M6 80 L6 40 Q6 28 23 28 Q40 28 40 40 L40 80 Z" fill={c} />
  </svg>
);

/* =====================================================================
   S05 — Track 04: El golpe
   ===================================================================== */
export const S05: React.FC<P> = ({t}) => {
  const s = 's05';
  const tEntra = cue(s, 'Entra'), tMed = cue(s, 'médico,'), tGuard = cue(s, 'guardapolvo'), tPel = cue(s, 'peluca.'), tOtro = cue(s, 'Entra otro'), tImp = cue(s, 'impecable.');
  const tSacan = cue(s, 'Sacan'), tVein = cue(s, 'veintitrés'), tLas = cue(s, 'Las armas...', 1), tJug = cue(s, 'juguete.'), tEnMin = cue(s, 'En minutos,'), tPatr = cue(s, 'patrulleros.');
  const tLlega = cue(s, 'Llega'), tFranco = cue(s, 'Francotiradores'), tTres = cue(s, 'Trescientos'), tYahi = cue(s, 'Y ahí'), tEstrella = cue(s, 'estrella'), tHombre = cue(s, 'el hombre');
  const toy = prog(t, tJug - 0.1, 0.35);
  const sh = shake(t, tJug, 10, 0.4);
  return (
    <AbsoluteFill>
      {/* Entrada: médico y traje gris */}
      <Beat t={t} t0={-0.2} t1={tSacan - 0.05} kind="fade">
        <Zine>
          <RockPhoto src="img2/banco_acassuso.jpg" t={t} t0={-0.1} t1={tEntra + 0.2} x={960} y={540} w={1500} h={800} seed={21} zoom={[1.05, 1.15]} focus="35% 50%" credit="Av. del Libertador y Perú · F. Martello · CC BY-SA 4.0" />
          {t > tEntra ? (
            <>
              <div style={{position: 'absolute', left: 200 - (1 - prog(t, tEntra, 0.5)) * 700, top: 180}}>
                <Bust role="medico" size={440} />
              </div>
              <div style={{position: 'absolute', left: 110, top: 150, fontFamily: F2.scrawl, fontSize: 46, color: R.red, opacity: prog(t, tPel - 0.1, 0.3), transform: 'rotate(-6deg)'}}>peluca ↘</div>
              <div style={{position: 'absolute', left: 90, top: 820, fontFamily: F2.scrawl, fontSize: 46, color: R.red, opacity: prog(t, tGuard - 0.1, 0.3), transform: 'rotate(-3deg)'}}>guardapolvo ↗</div>
              <div style={{position: 'absolute', left: 170, top: 900, fontFamily: F2.head, fontSize: 64, color: '#111', opacity: prog(t, tMed - 0.2, 0.3)}}>DISFRAZADO DE MÉDICO</div>
            </>
          ) : null}
          {t > tOtro - 0.1 ? (
            <>
              <div style={{position: 'absolute', left: 1240 + (1 - prog(t, tOtro - 0.1, 0.5)) * 800, top: 180}}>
                <Bust role="traje" size={440} />
              </div>
              <div style={{position: 'absolute', left: 1220, top: 900, fontFamily: F2.head, fontSize: 64, color: '#111', opacity: prog(t, tOtro, 0.3)}}>TRAJE GRIS, <span style={{color: R.red}}>IMPECABLE</span></div>
              {t > tImp ? ['✦', '✧', '✦'].map((c, i) => <div key={i} style={{position: 'absolute', left: 1320 + i * 150, top: 170 + (i % 2) * 90, fontSize: 60, color: R.yellow, transform: `scale(${pop(t, tImp + i * 0.1)}) rotate(${t * 90}deg)`}}>{c}</div>) : null}
            </>
          ) : null}
        </Zine>
      </Beat>

      {/* Armas + 23 rehenes + juguete */}
      <Beat t={t} t0={tSacan - 0.05} t1={tEnMin - 0.05} kind="fade">
        <Zine dark>
          <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px)`}}>
            <div style={{position: 'absolute', left: 60, top: 150, width: 900, height: 760, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,240,210,0.85) 0%, rgba(255,240,210,0.35) 40%, rgba(255,240,210,0) 70%)', opacity: prog(t, tSacan - 0.1, 0.3)}} />
            <div style={{position: 'absolute', left: 170, top: 300, transform: `scale(${pop(t, tSacan)}) rotate(${-8 + toy * 8}deg)`}}>
              <ToyGun size={620} toy={toy} flag={prog(t, tJug + 0.1, 0.4)} />
            </div>
            <div style={{position: 'absolute', left: 1080, top: 170, width: 700, opacity: t > tVein - 0.25 ? 1 : 0}}>
              <div style={{fontFamily: F2.head, fontSize: 80, color: '#fff'}}>
                <Counter t={t} t0={tVein - 0.2} t1={tVein + 0.6} to={23} /> REHENES
              </div>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20, width: 620}}>
                {Array.from({length: 23}).map((_, i) => (
                  <div key={i} style={{opacity: t > tVein - 0.2 + i * 0.03 ? 1 : 0, transform: `scale(${pop(t, tVein - 0.2 + i * 0.03)})`}}>
                    <Person c="#E9E3D2" s={1.1} />
                  </div>
                ))}
              </div>
            </div>
            {t > tLas ? (
              <div style={{position: 'absolute', left: 150, top: 110, fontFamily: F2.head, fontSize: 80, color: '#fff', opacity: prog(t, tLas, 0.3)}}>
                LAS ARMAS… {t > tJug - 0.1 ? <span style={{color: R.orange}}>ERAN DE JUGUETE</span> : null}
              </div>
            ) : null}
            <Stamp t={t} t0={tJug + 0.3} text="DE JUGUETE" x={560} y={800} size={120} rot={-8} blend={false} />
          </AbsoluteFill>
        </Zine>
      </Beat>

      {/* Patrulleros / Halcón / francotiradores / 300 */}
      <Beat t={t} t0={tEnMin - 0.05} t1={tYahi - 0.05} kind="fade">
        {t < tLlega ? (
          <HeistMap t={t} route={0} cars={Math.floor(clamp((t - tEnMin) / 2.2) * 30)} />
        ) : (
          <AbsoluteFill style={{background: R.paper, overflow: 'hidden'}}>
            <div style={{position: 'absolute', inset: 0, transform: 'translateY(160px)'}}>
              <CrossSection t={t} zoom={1.3} pan={970 - 960 / 1.3} cars={12} snipers={t > tFranco - 0.2} labels={0} hostages={10} />
            </div>
          </AbsoluteFill>
        )}
        <PoliceLights t={t} amount={0.9} />
        <div style={{position: 'absolute', left: 80, top: 80}}>
          <div style={{background: '#111', color: '#fff', fontFamily: F2.head, fontSize: 64, padding: '6px 22px', display: 'inline-block', opacity: prog(t, tPatr - 0.3, 0.3)}}>EN MINUTOS: PATRULLEROS</div>
          {t > tLlega ? <div style={{marginTop: 14, background: R.blue, color: '#fff', fontFamily: F2.head, fontSize: 64, padding: '6px 22px', display: 'inline-block', transform: `scale(${pop(t, tLlega)})`, transformOrigin: 'left'}}>+ GRUPO HALCÓN</div> : null}
          {t > tFranco ? <div style={{marginTop: 14, background: R.red, color: '#fff', fontFamily: F2.head, fontSize: 64, padding: '6px 22px', display: 'inline-block', transform: `scale(${pop(t, tFranco)})`, transformOrigin: 'left'}}>⌖ FRANCOTIRADORES EN LOS TECHOS</div> : null}
        </div>
        {t > tTres - 0.2 ? (
          <div style={{position: 'absolute', right: 90, top: 60, textAlign: 'right', transform: `scale(${pop(t, tTres - 0.2)})`, transformOrigin: 'right top'}}>
            <div style={{fontFamily: F2.bungee, fontSize: 190, color: '#fff', lineHeight: 1, textShadow: '0 8px 0 #111'}}><Counter t={t} t0={tTres - 0.2} t1={tTres + 0.7} to={300} /></div>
            <div style={{fontFamily: F2.head, fontSize: 80, color: R.yellow, textShadow: '0 5px 0 #111'}}>POLICÍAS</div>
          </div>
        ) : null}
      </Beat>

      {/* La estrella del show */}
      <Beat t={t} t0={tYahi - 0.05} kind="fade">
        <AbsoluteFill style={{background: '#0B0B0B'}}>
          <AbsoluteFill style={{background: `conic-gradient(from 160deg at 50% -10%, rgba(0,0,0,0) 0deg, rgba(255,240,200,${0.35 * prog(t, tEstrella, 0.4)}) 12deg, rgba(0,0,0,0) 26deg)`}} />
          <div style={{position: 'absolute', left: 960 - 230, top: 470, opacity: prog(t, tEstrella, 0.4)}}>
            <Bust role="traje" size={460} />
          </div>
          <div style={{position: 'absolute', left: 360, top: 50, transform: `scale(${pop(t, tHombre - 0.1)})`, opacity: t > tHombre - 0.1 ? 1 : 0}}>
            <Marquee t={t} text={'EL HOMBRE DEL\nTRAJE GRIS'} sub="FUNCIÓN ÚNICA · 13/01/2006" w={1200} h={390} size={96} />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: F2.scrawl, fontSize: 60, color: R.yellow, opacity: prog(t, tEstrella - 0.2, 0.3) * (1 - prog(t, tHombre - 0.2, 0.2))}}>la estrella del show…</div>
          {Array.from({length: 18}).map((_, i) => (
            <div key={i} style={{position: 'absolute', left: i * 110 - 20, bottom: -40 + (i % 2) * 20}}>
              <Person c="#1d1d1d" s={2.2} />
            </div>
          ))}
        </AbsoluteFill>
      </Beat>
    </AbsoluteFill>
  );
};

/* =====================================================================
   S06 — Track 05: El show del traje gris
   ===================================================================== */
export const S06: React.FC<P> = ({t}) => {
  const s = 's06';
  const tTel = cue(s, 'teléfono'), tTran = cue(s, 'Tranquilo.'), tAma = cue(s, 'Amable.'), tSin = cue(s, 'Sin apuro.'), tPed = cue(s, 'Pedía'), tLib = cue(s, 'liberaba'), tMas = cue(s, 'pedía más');
  const tPiz = cue(s, 'Pidió'), tCum = cue(s, 'Y hasta'), tFeliz = cue(s, 'feliz'), tAfu = cue(s, 'Afuera,'), tPero = cue(s, 'Pero en'), tShow = cue(s, 'show.');
  const tPorque = cue(s, 'Porque'), tAbajo = cue(s, 'abajo,'), tAbria = cue(s, 'abría'), tUna = cue(s, 'Una. Tras'), tTras1 = cue(s, 'Tras'), tTras2 = cue(s, 'Tras', 1), tCiento = cue(s, 'Ciento');
  const opened = t < tUna ? 0 : t < tTras1 ? 1 : t < tTras2 ? 2 : t < tCiento ? 3 : 3 + clamp((t - tCiento) / 1.2) * 47;
  const count = t < tUna ? 0 : t < tTras1 ? 1 : t < tTras2 ? 2 : t < tCiento ? 3 : Math.round(3 + clamp((t - tCiento) / 1.2) * 140);
  const split = prog(t, tAbajo - 0.3, 0.8, easeInOut);
  return (
    <AbsoluteFill>
      {/* Vitette al teléfono */}
      <Beat t={t} t0={-0.2} t1={tPiz - 0.05} kind="fade">
        <Zine>
          <Halftone opacity={0.08} id="h06" />
          <div style={{position: 'absolute', left: 140, top: 160}}><Bust role="traje" size={440} /></div>
          <div style={{position: 'absolute', left: 520, top: 360, transform: `rotate(-10deg) scale(${pop(t, tTel - 0.2)})`, opacity: t > tTel - 0.2 ? 1 : 0}}><Phone size={240} ring={t < tTel + 0.6 ? t : 0} /></div>
          <LowerThird t={t} t0={0.2} t1={tPed} name="Mario Vitette Sellanes" role="El negociador · el hombre del traje gris" x={120} y={860} />
          {[
            {t0: tTran, w: 'TRANQUILO', x: 900, y: 200, r: -6},
            {t0: tAma, w: 'AMABLE', x: 1250, y: 380, r: 4},
            {t0: tSin, w: 'SIN APURO', x: 950, y: 560, r: -3},
          ].map((b, i) =>
            t > b.t0 - 0.05 ? (
              <div key={i} style={{position: 'absolute', left: b.x, top: b.y, background: '#fff', border: '6px solid #111', borderRadius: 40, padding: '18px 40px', fontFamily: F2.head, fontSize: 84, color: '#111', transform: `rotate(${b.r}deg) scale(${pop(t, b.t0 - 0.05)})`, boxShadow: '10px 10px 0 #111', opacity: 1 - prog(t, tPed - 0.2, 0.3)}}>
                {b.w}
              </div>
            ) : null,
          )}
          {t > tPed - 0.2 ? (
            <div style={{position: 'absolute', left: 860, top: 180, width: 960, display: 'flex', flexDirection: 'column', gap: 30}}>
              {[
                {t0: tPed, txt: 'PIDE TIEMPO', c: '#111'},
                {t0: tLib, txt: 'LIBERA UN REHÉN', c: R.green},
                {t0: tMas, txt: 'PIDE MÁS TIEMPO', c: '#111'},
              ].map((r, i) => (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: 20, opacity: t > r.t0 - 0.1 ? 1 : 0, transform: `translateX(${(1 - prog(t, r.t0 - 0.1, 0.3)) * 60}px)`}}>
                  <div style={{fontFamily: F2.bungee, fontSize: 40, color: R.red}}>{['13:30', '14:00', '15:20'][i]}</div>
                  <div style={{fontFamily: F2.head, fontSize: 80, color: r.c}}>{r.txt}</div>
                </div>
              ))}
            </div>
          ) : null}
        </Zine>
      </Beat>

      {/* Pizzas y cumpleaños */}
      <Beat t={t} t0={tPiz - 0.05} t1={tAfu - 0.05} kind="fade">
        <Zine>
          {t < tCum ? (
            <AbsoluteFill>
              {[0, 1, 2, 3, 4].map((i) => {
                const t0 = tPiz + 0.1 + i * 0.12;
                const k = clamp((t - t0) / 0.35);
                return (
                  <div key={i} style={{position: 'absolute', left: 520 + (i % 2) * 30, top: -300 + easeOut(k) * (820 - i * 70), transform: `rotate(${(rnd(i) - 0.5) * 10}deg)`}}>
                    <PizzaBox w={420} />
                  </div>
                );
              })}
              {[0, 1, 2].map((i) => (
                <div key={i} style={{position: 'absolute', left: 1150 + i * 120, top: 470, transform: `scale(${pop(t, cue(s, 'gaseosas') + i * 0.1)})`, opacity: t > cue(s, 'gaseosas') + i * 0.1 ? 1 : 0}}>
                  <Soda h={260} />
                </div>
              ))}
              <div style={{position: 'absolute', left: 120, top: 120, fontFamily: F2.head, fontSize: 96, color: '#111'}}>
                PIZZAS <span style={{color: R.red}}>+</span> GASEOSAS
                <div style={{fontFamily: F2.scrawl, fontSize: 44, color: R.red}}>para todos</div>
              </div>
            </AbsoluteFill>
          ) : (
            <AbsoluteFill>
              <div style={{position: 'absolute', left: 960 - 230, top: 380, transform: `scale(${pop(t, tCum)})`}}><Cake size={460} t={t} /></div>
              <div style={{position: 'absolute', left: 0, right: 0, top: 130, textAlign: 'center', fontFamily: F2.scrawl, fontSize: 76, color: R.red, transform: `rotate(-2deg)`, opacity: prog(t, tFeliz - 0.2, 0.3)}}>
                ♪ que los cumplas feliz ♪
              </div>
              <div style={{position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center', fontFamily: F2.head, fontSize: 60, color: '#111', opacity: prog(t, cue(s, 'rehenes.') - 0.3, 0.3)}}>
                …A UNA DE LAS REHENES
              </div>
              {Array.from({length: 8}).map((_, i) => {
                const k = ((t - tCum) * 0.6 + i / 8) % 1;
                return <div key={i} style={{position: 'absolute', left: 300 + (i % 4) * 400 + Math.sin(t * 2 + i) * 30, top: 900 - k * 700, fontSize: 70, color: i % 2 ? R.red : R.blue, opacity: t > tCum ? 1 - k : 0}}>♪</div>;
              })}
            </AbsoluteFill>
          )}
        </Zine>
      </Beat>

      {/* Afuera la policía / en realidad un show */}
      <Beat t={t} t0={tAfu - 0.05} t1={tPorque - 0.05} kind="fade">
        <AbsoluteFill style={{background: '#0B0B0B'}}>
          {t < tPero ? (
            <AbsoluteFill>
              <HeistMap t={t} route={0} cars={30} />
              <PoliceLights t={t} amount={0.6} />
              <div style={{position: 'absolute', left: 90, top: 790, background: '#fff', border: '6px solid #111', padding: '14px 26px'}}>
                <div style={{fontFamily: F2.type, fontSize: 30, color: '#555'}}>LA POLICÍA CREÍA ESTAR MANEJANDO:</div>
                <div style={{fontFamily: F2.head, fontSize: 84, color: '#111'}}>“UNA TOMA DE REHENES”</div>
              </div>
            </AbsoluteFill>
          ) : (
            <AbsoluteFill>
              <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Marquee t={t} text="EL SHOW" sub="ENTRADA LIBRE · 300 ESPECTADORES DE UNIFORME" w={1200} h={330} size={150} />
              </AbsoluteFill>
              {[0, 1].map((k) => {
                const o = prog(t, tPero + 0.1, 0.9, easeInOut);
                return (
                  <div key={k} style={{position: 'absolute', top: 0, bottom: 0, [k ? 'right' : 'left']: 0, width: `${50 - 46 * o}%`, background: 'repeating-linear-gradient(90deg, #8E1414 0 40px, #B21E1E 40px 80px)', boxShadow: 'inset 0 0 80px rgba(0,0,0,0.6)'}} />
                );
              })}
              <div style={{position: 'absolute', left: 0, right: 0, top: 60, textAlign: 'center', fontFamily: F2.scrawl, fontSize: 54, color: R.yellow, opacity: prog(t, tShow - 0.2, 0.3)}}>en realidad, estaban viendo…</div>
            </AbsoluteFill>
          )}
        </AbsoluteFill>
      </Beat>

      {/* Split: arriba charla, abajo cajas */}
      <Beat t={t} t0={tPorque - 0.05} kind="fade">
        <AbsoluteFill style={{background: '#111'}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 540, transform: `translateY(${-split * 540}px)`}}>
            <Zine>
              <div style={{position: 'absolute', left: 80, top: 30, fontFamily: F2.type, fontSize: 30, color: '#111', background: R.yellow, padding: '4px 14px'}}>PLANTA BAJA · NEGOCIACIÓN</div>
              <div style={{position: 'absolute', left: 140, top: 90}}><Bust role="traje" size={340} /></div>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{position: 'absolute', left: 620 + i * 380, top: 160 + (i % 2) * 90, background: '#fff', border: '5px solid #111', borderRadius: 30, padding: '10px 26px', fontFamily: F2.scrawl, fontSize: 40, opacity: ((t * 1.4 + i * 0.33) % 1) < 0.7 ? 1 : 0}}>
                  bla bla bla
                </div>
              ))}
            </Zine>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 540 - split * 540, height: 540 + split * 540, overflow: 'hidden'}}>
            <Zine dark>
              <div style={{position: 'absolute', left: 80, top: 30, fontFamily: F2.type, fontSize: 30, color: '#111', background: R.red, padding: '4px 14px'}}><span style={{color: '#fff'}}>SUBSUELO · BÓVEDA</span></div>
              <div style={{position: 'absolute', left: 90, top: 110 + split * 190}}>
                <SafeGrid cols={10} rows={5} opened={opened} cell={128} dark />
              </div>
              {t > tUna - 0.1 ? (
                <div style={{position: 'absolute', right: 70, top: 40 + split * 150, textAlign: 'right'}}>
                  <div style={{fontFamily: F2.type, fontSize: 28, color: '#fff'}}>CAJAS ABIERTAS</div>
                  <div style={{fontFamily: F2.bungee, fontSize: t > tCiento ? 230 : 150, color: t > tCiento ? R.yellow : '#fff', lineHeight: 1, textShadow: '0 0 30px rgba(255,204,51,0.4)'}}>{count}</div>
                </div>
              ) : null}
              {t > tAbria ? <div style={{position: 'absolute', left: 90, bottom: 40, fontFamily: F2.scrawl, fontSize: 44, color: R.yellow, opacity: prog(t, tAbria, 0.3)}}>mientras tanto, abajo…</div> : null}
            </Zine>
          </div>
          <ClockHUD t={t} time={t > tCiento ? '16:30' : '15:50'} />
        </AbsoluteFill>
      </Beat>
    </AbsoluteFill>
  );
};

/* =====================================================================
   S07 — Track 06: La fuga
   ===================================================================== */
export const S07: React.FC<P> = ({t}) => {
  const s = 's07';
  const tCarg = cue(s, 'cargaron'), tBaj = cue(s, 'bajaron'), tDes = cue(s, 'desagüe.'), tAhi = cue(s, 'Ahí'), tMotor = cue(s, 'motor'), tIng = cue(s, 'Ingeniero.');
  const tYasi = cue(s, 'Y así,'), tPas = cue(s, 'pasaron'), tTres = cue(s, 'trescientos'), tSal = cue(s, 'salieron'), tAlc = cue(s, 'alcantarilla,'), tVar = cue(s, 'varias');
  const tArr = cue(s, 'Arriba,'), tCam = cue(s, 'camioneta'), tAguj = cue(s, 'agujero', 1), tEnc = cue(s, 'encima.'), tSub = cue(s, 'Subieron.'), tArr2 = cue(s, 'Arrancaron.'), tChau = cue(s, 'Chau.');
  // cámara del corte: bóveda -> desagüe -> recorrido
  const run = prog(t, tYasi, tSal - tYasi, (x) => x);
  const boatX = t < tAhi ? null : 1080 + run * 1650;
  const z = t < tYasi ? 1.45 : 1.45 - 0.45 * prog(t, tYasi, 1.2, easeInOut);
  const camCenter = t < tYasi ? 960 : 960 + run * 1650;
  const pan = Math.min(camCenter - 960 / z, 3400 - 1920 / z);
  const cy = t < tAhi ? 640 : 780;
  const ty = t < tYasi ? 540 - cy * z : (540 - 780 * 1.45) * (1 - prog(t, tYasi, 1.2, easeInOut));
  const bagY = clamp((t - tBaj) / 1.4);
  return (
    <AbsoluteFill>
      <Beat t={t} t0={-0.2} t1={tSal - 0.05} kind="fade">
        <AbsoluteFill style={{background: R.paper, overflow: 'hidden'}}>
          <div style={{position: 'absolute', inset: 0, transform: `translateY(${ty}px)`}}>
            <CrossSection t={t} zoom={z} pan={pan} dig={1} cars={12} boats={boatX} labels={0} vaultEmpty={t > tBaj} exit={prog(t, tPas, 0.5)} />
            {t > tCarg && t < tAhi + 0.4 ? (
              <div style={{position: 'absolute', left: (960 - pan) * z - 40, top: (560 + bagY * 280) * z, transform: `scale(${z})`, transformOrigin: '0 0'}}>
                {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: i * 28 - 20, top: -i * 40 * (1 - bagY), width: 40, height: 46, background: '#6B6B5A', border: '4px solid #111', borderRadius: '40% 40% 12px 12px'}} />)}
              </div>
            ) : null}
          </div>
          <div style={{position: 'absolute', left: 70, top: 70, display: 'flex', flexDirection: 'column', gap: 12}}>
            {[
              {t0: tCarg, x: 'CARGAN EL BOTÍN'},
              {t0: tBaj, x: 'BAJAN POR EL AGUJERO'},
              {t0: tDes - 0.3, x: 'AL DESAGÜE'},
            ].map((r, i) => (
              <div key={i} style={{background: '#111', color: '#fff', fontFamily: F2.head, fontSize: 52, padding: '4px 18px', display: t > r.t0 && t < tYasi ? 'inline-block' : 'none', alignSelf: 'flex-start', transform: `scale(${pop(t, r.t0)})`, transformOrigin: 'left'}}>
                {i + 1}. {r.x}
              </div>
            ))}
          </div>
          {t > tMotor && t < tYasi + 0.5 ? (
            <div style={{position: 'absolute', left: 1080, top: 250, background: R.yellow, border: '6px solid #111', padding: '10px 24px', transform: `rotate(-3deg) scale(${pop(t, tMotor)})`, boxShadow: '10px 10px 0 #111'}}>
              <div style={{fontFamily: F2.head, fontSize: 64, color: '#111'}}>2 BOTES INFLABLES</div>
              <div style={{fontFamily: F2.scrawl, fontSize: 38, color: R.red, opacity: prog(t, tIng - 0.3, 0.3)}}>motor casero: el Ingeniero</div>
            </div>
          ) : null}
          {t > tPas ? (
            <div style={{position: 'absolute', left: 70, top: 70}}>
              <div style={{background: R.blue, color: '#fff', fontFamily: F2.head, fontSize: 56, padding: '4px 18px', display: 'table'}}>ARRIBA: 300 POLICÍAS</div>
              <div style={{marginTop: 520, background: R.red, color: '#fff', fontFamily: F2.head, fontSize: 56, padding: '4px 18px', display: 'table', transform: `scale(${pop(t, tTres)})`, transformOrigin: 'left'}}>ABAJO: ELLOS ⛵</div>
            </div>
          ) : null}
        </AbsoluteFill>
      </Beat>

      {/* Mapa: salida a varias cuadras */}
      <Beat t={t} t0={tSal - 0.05} t1={tArr - 0.05} kind="fade">
        <HeistMap t={t} route={prog(t, tSal, tAlc + 0.8 - tSal, easeInOut)} cars={30} exitLabel={prog(t, tVar - 0.2, 0.4)} />
      </Beat>

      {/* La camioneta con el agujero */}
      <Beat t={t} t0={tArr - 0.05} kind="fade">
        <Zine>
          <Halftone opacity={0.08} id="h07" />
          {/* calle y tapa */}
          <div style={{position: 'absolute', left: 0, right: 0, top: 700, height: 40, background: R.asphalt}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 740, bottom: 0, background: R.soil}} />
          <div style={{position: 'absolute', left: 880, top: 700, width: 160, height: 380, background: '#2a2a2a', borderLeft: '6px solid #111', borderRight: '6px solid #111'}} />
          <div style={{position: 'absolute', left: 870, top: 694, width: 180, height: 12, background: '#666', transform: `translateX(${prog(t, tSub - 0.4, 0.3) * 190}px)`}} />
          {/* camioneta */}
          <div style={{position: 'absolute', left: 700 + easeIn(clamp((t - tArr2) / 1.2)) * 1600, top: 408, transform: `scale(${pop(t, tCam - 0.1)})`, transformOrigin: 'bottom center'}}>
            <Van w={520} wheelSpin={t > tArr2 ? (t - tArr2) * 900 : 0} />
          </div>
          {t > tAguj ? (
            <div style={{position: 'absolute', left: 1060, top: 740, fontFamily: F2.scrawl, fontSize: 44, color: R.yellow, transform: `rotate(-4deg) scale(${pop(t, tAguj)})`, opacity: 1 - prog(t, tArr2, 0.3)}}>← agujero en el piso</div>
          ) : null}
          {t > tEnc - 0.2 && t < tArr2 ? <div style={{position: 'absolute', left: 1060, top: 820, fontFamily: F2.scrawl, fontSize: 44, color: '#fff', transform: 'rotate(-2deg)'}}>justo encima de la tapa</div> : null}
          {/* bolsas subiendo */}
          {t > tSub - 0.3 && t < tArr2 ? [0, 1, 2].map((i) => {
            const k = clamp((t - tSub + 0.3 - i * 0.25) / 0.8);
            return <div key={i} style={{position: 'absolute', left: 930 + i * 12, top: 1000 - k * 300, width: 60, height: 70, background: '#6B6B5A', border: '5px solid #111', borderRadius: '40% 40% 14px 14px', opacity: k < 1 ? 1 : 0}} />;
          }) : null}
          <div style={{position: 'absolute', left: 80, top: 80, display: 'flex', gap: 30}}>
            {[
              {t0: tSub, x: 'SUBIERON.'},
              {t0: tArr2, x: 'ARRANCARON.'},
            ].map((r, i) => (
              <div key={i} style={{fontFamily: F2.head, fontSize: 90, color: '#111', opacity: t > r.t0 ? 1 : 0, transform: `scale(${pop(t, r.t0)})`}}>{r.x}</div>
            ))}
          </div>
          {t > tChau - 0.05 ? (
            <div style={{position: 'absolute', left: 1180, top: 190, fontFamily: F2.scrawl, fontSize: 220, color: R.red, transform: `rotate(-8deg) scale(${pop(t, tChau - 0.05)})`, textShadow: '8px 8px 0 #111'}}>¡CHAU!</div>
          ) : null}
          {t > tArr2 ? Array.from({length: 10}).map((_, i) => {
            const k = ((t - tArr2) * 1.5 + i / 10) % 1;
            return <div key={i} style={{position: 'absolute', left: 680 + easeIn(clamp((t - tArr2) / 1.2)) * 1600 - k * 200, top: 640 - k * 60, width: 60 + k * 90, height: 60 + k * 90, borderRadius: '50%', background: 'rgba(160,140,110,0.45)', opacity: 1 - k, filter: 'blur(6px)'}} />;
          }) : null}
        </Zine>
      </Beat>
    </AbsoluteFill>
  );
};

/* =====================================================================
   S08 — Track 07: El cartel
   ===================================================================== */
export const S08: React.FC<P> = ({t}) => {
  const s = 's08';
  const tPas = cue(s, 'Pasaron'), tSil = cue(s, 'Silencio.'), tCerca = cue(s, 'Cerca'), tEntro = cue(s, 'entró.'), tE1 = cue(s, 'Encontró'), tE2 = cue(s, 'Encontró', 1), tE3 = cue(s, 'Encontró', 2);
  const tYen = cue(s, 'Y en la'), tCartel = cue(s, 'cartel:'), tDe = cue(s, 'De los'), tNi = cue(s, 'ni rastro.');
  const qStart = cue(s, '«En barrio');
  const q = segWords(s).filter((w) => w.s >= qStart - 0.01 && w.s < tDe - 0.01);
  const minutes = t < tPas ? 17 * 60 : t < tCerca ? 17 * 60 + clamp((t - tPas) / (tCerca - tPas)) * 110 : 19 * 60;
  const dusk = clamp((minutes - 17 * 60) / 120);
  const lines = [
    {from: 0, to: 4},
    {from: 4, to: 8},
    {from: 8, to: q.length},
  ];
  const sh = shake(t, tEntro - 0.3, 18, 0.5);
  return (
    <AbsoluteFill>
      <Beat t={t} t0={-0.2} t1={tE1 - 0.05} kind="fade">
        <AbsoluteFill style={{background: R.paper, overflow: 'hidden', transform: `translate(${sh.x}px, ${sh.y}px)`}}>
          <div style={{position: 'absolute', inset: 0, transform: 'translateY(120px)'}}>
            <CrossSection t={t} zoom={1.2} pan={970 - 960 / 1.2} cars={12} snipers labels={0} dusk={dusk} vaultEmpty />
          </div>
          <PoliceLights t={t} amount={0.4} />
          <ClockHUD t={t} time={hhmm(minutes)} />
          <div style={{position: 'absolute', left: 80, top: 80}}>
            <div style={{fontFamily: F2.head, fontSize: 80, color: '#111', background: '#fff', padding: '6px 22px', display: 'inline-block'}}>AFUERA, ESPERAN…</div>
            {t > tSil - 0.1 ? <div style={{fontFamily: F2.type, fontSize: 64, color: '#fff', marginTop: 20, textShadow: '0 3px 0 #111', opacity: prog(t, tSil - 0.1, 0.4)}}>… silencio …</div> : null}
          </div>
          {t > tEntro - 0.35 ? (
            <AbsoluteFill style={{background: '#fff', opacity: 1 - prog(t, tEntro - 0.3, 0.35)}} />
          ) : null}
          {t > tEntro - 0.3 ? (
            <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', fontFamily: F2.bungee, fontSize: 130, color: '#fff', textShadow: '0 8px 0 #111', transform: `scale(${pop(t, tEntro - 0.3)})`}}>¡ENTRA EL HALCÓN!</div>
          ) : null}
        </AbsoluteFill>
      </Beat>

      <Beat t={t} t0={tE1 - 0.05} t1={tYen - 0.05} kind="fade">
        <Zine>
          <div style={{position: 'absolute', left: 260, top: 90, width: 1400, height: 900, background: '#FBF8EE', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', transform: 'rotate(-1deg)'}}>
            <div style={{position: 'absolute', left: 60, top: 50, fontFamily: F2.type, fontSize: 40, color: '#111'}}>
              <Typed text="ACTA POLICIAL · 13/01/2006 · 19:00 HS" t={t} t0={tE1 - 0.1} cps={40} />
            </div>
            <div style={{position: 'absolute', left: 60, top: 110, right: 60, height: 4, background: '#111'}} />
            <div style={{position: 'absolute', left: 80, top: 190, display: 'flex', flexDirection: 'column', gap: 70}}>
              <Check t={t} t0={tE1 + 0.2} text="Rehenes: sanos y salvos" size={70} />
              <Check t={t} t0={tE2 + 0.2} text="Armas: de juguete" size={70} />
              <Check t={t} t0={tE3 + 0.2} text="+ de 100 cajas: vacías" size={70} />
            </div>
            <div style={{position: 'absolute', right: 80, top: 330, transform: `rotate(-10deg) scale(${pop(t, tE2 + 0.3)})`, opacity: t > tE2 + 0.3 ? 1 : 0}}><ToyGun size={330} toy={1} /></div>
          </div>
        </Zine>
      </Beat>

      <Beat t={t} t0={tYen - 0.05} kind="fade">
        <AbsoluteFill style={{background: '#050505'}}>
          {/* linterna que ilumina el cartel */}
          <AbsoluteFill style={{background: `radial-gradient(circle at ${50 + Math.sin(t * 0.9) * 6}% ${48 + Math.cos(t * 0.7) * 4}%, rgba(255,245,210,${0.55 * prog(t, tYen, 0.5)}) 0%, rgba(0,0,0,0) ${38 + 20 * prog(t, tCartel, 0.6)}%)`}} />
          <div style={{position: 'absolute', left: 190, top: 170, width: 1540, height: 700, background: '#F4EEDC', boxShadow: '0 30px 60px rgba(0,0,0,0.8)', transform: `rotate(-2deg) scale(${0.9 + 0.1 * prog(t, tCartel - 0.3, 0.6)})`, opacity: prog(t, tCartel - 0.4, 0.5) * (1 - 0.6 * prog(t, tDe, 0.5)), display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 60px'}}>
            {lines.map((ln, li) => (
              <div key={li} style={{fontFamily: F2.hand, fontSize: 84, lineHeight: 1.3, color: '#15151a', textAlign: 'center', whiteSpace: 'nowrap'}}>
                {q.slice(ln.from, ln.to).map((w, i) => (
                  <span key={i} style={{opacity: prog(t, w.s - 0.05, 0.2), marginRight: '0.25em', display: 'inline-block'}}>{w.w.replace(/[«»]/g, '').toUpperCase()}</span>
                ))}
              </div>
            ))}
          </div>
          <div style={{position: 'absolute', left: 280, top: 110, fontFamily: F2.type, fontSize: 32, color: 'rgba(255,255,255,0.7)', opacity: prog(t, tCartel - 0.3, 0.4)}}>EN LA BÓVEDA, UN CARTEL:</div>
          {t > tNi - 0.1 ? <Stamp t={t} t0={tNi - 0.1} text="NI RASTRO" x={1320} y={860} size={120} rot={-7} blend={false} /> : null}
        </AbsoluteFill>
      </Beat>
    </AbsoluteFill>
  );
};
