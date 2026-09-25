import React from 'react';
import {AbsoluteFill} from 'remotion';
import {R, F2, cue, segWords} from './lib';
import {clamp, easeIn, easeInOut, easeOut, fmt, pop, prog, rnd, shake} from '../lib/anim';
import {Beat, Counter, Mark, Stamp} from '../components/base';
import {Zine, Halftone, Ransom, Typed, Bust, LineupWall, Placard, PoliceLights, Smoke, Check, RockPhoto, ToyGun, SafeGrid} from './rock';
import {CrossSection, HeistMap} from './section';
import {DollarBill} from '../components/art';

type P = {t: number};

/** Pie de foto / rótulo manuscrito con flecha */
const Scrawl: React.FC<{t: number; t0: number; x: number; y: number; text: string; rot?: number; size?: number; color?: string; arrow?: 'down' | 'left' | 'right' | 'up' | null}> = ({t, t0, x, y, text, rot = -4, size = 54, color = R.red, arrow = null}) => {
  if (t < t0) return null;
  const k = pop(t, t0, 1.2);
  const ar = {down: '↓', left: '←', right: '→', up: '↑'} as const;
  return (
    <div style={{position: 'absolute', left: x, top: y, fontFamily: F2.scrawl, fontSize: size, color, transform: `rotate(${rot}deg) scale(${k})`, transformOrigin: 'left center', whiteSpace: 'nowrap', textShadow: '2px 2px 0 rgba(255,255,255,0.35)'}}>
      {arrow === 'left' ? ar.left + ' ' : ''}
      {text}
      {arrow && arrow !== 'left' ? ' ' + ar[arrow] : ''}
    </div>
  );
};

/** Círculo dibujado a mano */
const HandCircle: React.FC<{t: number; t0: number; x: number; y: number; w: number; h: number; color?: string}> = ({t, t0, x, y, w, h, color = R.red}) => {
  const p = prog(t, t0, 0.6, easeInOut);
  const len = 2400;
  return (
    <svg width={w + 60} height={h + 60} style={{position: 'absolute', left: x - 30, top: y - 30, overflow: 'visible'}}>
      <path
        d={`M${w * 0.1 + 30} ${h * 0.15 + 30} C${w * 0.5} ${-h * 0.1 + 30}, ${w + 40} ${h * 0.1}, ${w + 20} ${h * 0.55 + 30} C${w} ${h + 40}, ${w * 0.2} ${h + 50}, ${20} ${h * 0.6 + 30} C${0} ${h * 0.3}, ${w * 0.3} ${10}, ${w * 0.62} ${24}`}
        fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)}
      />
    </svg>
  );
};

/* =====================================================================
   S01 — Cold open + TÍTULO
   ===================================================================== */
export const S01: React.FC<P & {titleEnd: number}> = ({t, titleEnd}) => {
  const s = 's01';
  const tTrece = cue(s, 'trece'), tMedio = cue(s, 'Mediodía.'), tAcas = cue(s, 'Acassuso,'), tCasas = cue(s, 'Casas'), tArb = cue(s, 'árboles');
  const tBanco = cue(s, 'y un banco.'), tEn = cue(s, 'En unas'), tTres = cue(s, 'trescientos'), tFranco = cue(s, 'francotiradores'), tCam = cue(s, 'cámaras');
  const tAdentro = cue(s, 'Y adentro...'), tNadie = cue(s, 'nadie.'), tPorque = cue(s, 'Porque'), tPiso = cue(s, 'piso.'), tSin = cue(s, 'Sin disparar');
  const tEsta = cue(s, 'Esta es'), tSiglo = cue(s, 'siglo.'), tTitle = cue(s, 'siglo.', 0, 'e') + 0.15;
  // cámara del corte transversal
  const zk = prog(t, tPorque + 0.2, 1.4, easeInOut);
  const z = 1.7 - 0.7 * zk;
  const pan = 970 - 960 / z;
  const ty = (540 - 300 * z) * (1 - zk) + 0 * zk;
  return (
    <AbsoluteFill>
      {/* Fecha */}
      <Beat t={t} t0={-0.4} t1={tAcas - 0.05} kind="fade">
        <Zine dark>
          <Halftone color="#fff" opacity={0.07} id="h01" />
          <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontFamily: F2.type, fontSize: 64, color: '#fff', letterSpacing: 8}}>
              <Typed text="VIERNES" t={t} t0={0} cps={20} cursor={false} />
            </div>
            <div style={{fontFamily: F2.bungee, fontSize: 340, lineHeight: 1, color: R.red, transform: `scale(${pop(t, tTrece, 1.1)}) rotate(-3deg)`, opacity: t > tTrece ? 1 : 0, textShadow: `0 0 40px rgba(232,50,43,0.5)`}}>13</div>
            <div style={{fontFamily: F2.type, fontSize: 56, color: '#fff', letterSpacing: 8, opacity: prog(t, cue(s, 'enero'), 0.3)}}>ENERO · 2006</div>
            <div style={{marginTop: 40, fontFamily: F2.bungee, fontSize: 90, color: R.yellow, opacity: t > tMedio ? 1 : 0, transform: `scale(${pop(t, tMedio)})`, textShadow: '0 0 20px rgba(255,204,51,0.6)'}}>12:00</div>
          </AbsoluteFill>
        </Zine>
      </Beat>

      {/* Acassuso */}
      <Beat t={t} t0={tAcas - 0.05} t1={tEn - 0.05} kind="fade">
        <Zine>
          <RockPhoto src="img2/libertador.jpg" t={t} t0={tAcas} t1={tBanco} x={560} y={430} w={900} h={540} rot={-3} seed={2} credit="Av. del Libertador, Acassuso · Foto: Fma12 · CC BY-SA 4.0" />
          <RockPhoto src="img2/calle_peru.jpg" t={t} t0={tCasas} t1={tBanco} x={1350} y={640} w={900} h={500} rot={3} seed={5} credit="Calle Perú · Foto: F. Martello · CC BY-SA 4.0" />
          <Scrawl t={t} t0={tAcas + 0.2} x={80} y={770} text="ACASSUSO · ZONA NORTE" size={48} color={R.ink} />
          <Scrawl t={t} t0={tCasas + 0.1} x={1110} y={130} text="casas enormes" arrow="down" size={50} />
          <Scrawl t={t} t0={tArb} x={1290} y={230} text="árboles enormes" size={50} rot={-2} />
          {t > tBanco - 0.1 ? (
            <AbsoluteFill style={{background: R.paper}}>
              <RockPhoto src="img2/banco_acassuso.jpg" t={t} t0={tBanco - 0.1} x={960} y={520} w={1400} h={730} rot={-1.5} seed={8} credit="La sucursal, hoy (Av. del Libertador y Perú) · Foto: F. Martello · CC BY-SA 4.0" zoom={[1.02, 1.12]} focus="35% 50%" />
              <HandCircle t={t} t0={tBanco + 0.2} x={440} y={260} w={560} h={330} />
              <Scrawl t={t} t0={tBanco + 0.5} x={1060} y={210} text="ESTE BANCO" arrow="left" size={70} />
            </AbsoluteFill>
          ) : null}
        </Zine>
      </Beat>

      {/* 300 policías / francotiradores / en vivo */}
      <Beat t={t} t0={tEn - 0.05} t1={tAdentro - 0.05} kind="fade">
        <HeistMap t={t} route={0} cars={Math.floor(clamp((t - tEn) / 2.5) * 28)} />
        <PoliceLights t={t} amount={prog(t, tTres, 0.5)} />
        <div style={{position: 'absolute', left: 1080, top: 150, textAlign: 'left', opacity: prog(t, tTres - 0.2, 0.3)}}>
          <div style={{fontFamily: F2.bungee, fontSize: 200, lineHeight: 1, color: '#fff'}}><Counter t={t} t0={tTres - 0.2} t1={tTres + 0.8} to={300} /></div>
          <div style={{fontFamily: F2.head, fontSize: 90, color: R.yellow}}>POLICÍAS</div>
        </div>
        {t > tFranco ? (
          <div style={{position: 'absolute', left: 1080, top: 520, fontFamily: F2.head, fontSize: 70, color: R.red, transform: `scale(${pop(t, tFranco)})`, transformOrigin: 'left'}}>
            ⌖ FRANCOTIRADORES
          </div>
        ) : null}
        {t > tCam - 0.1 ? (
          <AbsoluteFill style={{background: 'rgba(0,0,0,0.55)', opacity: prog(t, tCam - 0.1, 0.25)}}>
            <div style={{position: 'absolute', left: 260, top: 130, width: 1400, height: 800, background: '#000', border: '18px solid #222', borderRadius: 30, overflow: 'hidden', transform: `scale(${0.9 + 0.1 * pop(t, tCam - 0.1)})`}}>
              <RockPhoto src="img2/banco_acassuso.jpg" t={t} t0={tCam - 0.1} x={700} y={380} w={1500} h={900} seed={11} zoom={[1.2, 1.3]} focus="35% 50%" />
              <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 2px, rgba(0,0,0,0) 2px 5px)'}} />
              <div style={{position: 'absolute', left: 30, top: 30, background: R.red, color: '#fff', fontFamily: F2.head, fontSize: 44, padding: '4px 18px', opacity: Math.floor(t * 2) % 2 ? 1 : 0.75}}>● EN VIVO</div>
              <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, background: R.yellow, padding: '12px 24px', fontFamily: F2.head, fontSize: 48, color: '#111'}}>
                URGENTE: TOMA DE REHENES EN UN BANCO DE ACASSUSO
              </div>
            </div>
          </AbsoluteFill>
        ) : null}
      </Beat>

      {/* Adentro nadie / por el piso */}
      <Beat t={t} t0={tAdentro - 0.05} t1={tSin - 0.05} kind="fade">
        <AbsoluteFill style={{background: R.paper, overflow: 'hidden'}}>
          <div style={{position: 'absolute', inset: 0, transform: `translateY(${ty}px)`}}>
            <CrossSection t={t} zoom={z} pan={pan} dig={1} cars={6} boats={t > tPiso - 0.6 ? 820 + (t - tPiso) * 140 : null} labels={0} />
          </div>
          <div style={{position: 'absolute', left: 90, top: 120, opacity: prog(t, tAdentro, 0.3) * (1 - prog(t, tPorque, 0.3))}}>
            <div style={{fontFamily: F2.type, fontSize: 40, color: '#111', background: R.yellow, padding: '6px 16px', display: 'inline-block'}}>ADENTRO:</div>
            <div style={{fontFamily: F2.head, fontSize: 150, color: '#111', opacity: prog(t, tNadie, 0.2)}}>NADIE.</div>
          </div>
          {t > tPiso - 0.3 ? (
            <div style={{position: 'absolute', left: 120, top: 560, fontFamily: F2.head, fontSize: 110, color: '#fff', textShadow: '0 6px 0 #111', transform: `scale(${pop(t, tPiso - 0.3)})`, transformOrigin: 'left'}}>
              SE VAN <span style={{color: R.yellow}}>POR EL PISO</span> ↓
            </div>
          ) : null}
        </AbsoluteFill>
      </Beat>

      {/* 0 tiros */}
      <Beat t={t} t0={tSin - 0.05} t1={tTitle} kind="fade">
        <Zine dark>
          <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 60, opacity: 1 - prog(t, tEsta, 0.3)}}>
              <div style={{fontFamily: F2.bungee, fontSize: 380, color: R.yellow, lineHeight: 1, transform: `scale(${pop(t, tSin)})`}}>0</div>
              <div style={{fontFamily: F2.head, fontSize: 130, color: '#fff', lineHeight: 1}}>TIROS<br /><span style={{fontSize: 60, color: 'rgba(255,255,255,0.6)'}}>DISPARADOS</span></div>
            </div>
            <div style={{position: 'absolute', fontFamily: F2.type, fontSize: 60, color: '#fff', opacity: prog(t, tEsta, 0.3), letterSpacing: 4}}>
              <Typed text="esta es la historia de..." t={t} t0={tEsta} cps={22} />
            </div>
          </AbsoluteFill>
        </Zine>
      </Beat>

      {/* TÍTULO */}
      {t >= tTitle ? (
        <AbsoluteFill style={{background: R.black}}>
          <Zine dark>
            <Halftone color={R.red} opacity={0.18} id="htT" size={18} />
            <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `translate(${shake(t, tTitle + 0.35, 14, 0.4).x}px, ${shake(t, tTitle + 0.35, 14, 0.4).y}px)`}}>
              <Ransom text="EL ROBO" t={t} t0={tTitle} size={170} stagger={0.05} seed={3} />
              <Ransom text="DEL SIGLO" t={t} t0={tTitle + 0.35} size={200} stagger={0.05} seed={9} style={{marginTop: 16}} />
              <div style={{marginTop: 40, fontFamily: F2.type, fontSize: 36, color: R.yellow, letterSpacing: 10, opacity: prog(t, tTitle + 0.9, 0.4)}}>CONTEXTO · EPISODIO 2</div>
            </AbsoluteFill>
          </Zine>
          <AbsoluteFill style={{background: '#fff', opacity: 1 - prog(t, tTitle, 0.15), pointerEvents: 'none'}} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* =====================================================================
   S02 — Track 01: La idea
   ===================================================================== */
const Plant: React.FC<{size?: number}> = ({size = 200}) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <path d="M60 150 L140 150 L128 196 L72 196 Z" fill="#B5652E" stroke="#111" strokeWidth="5" />
    <line x1="100" y1="150" x2="100" y2="70" stroke="#2F6B2A" strokeWidth="6" />
    {[-70, -40, -12, 12, 40, 70, 0].map((a, i) => (
      <path key={i} d="M100 80 Q108 40 100 6 Q92 40 100 80 Z" fill="#3E8C3A" stroke="#111" strokeWidth="3" transform={`rotate(${a} 100 80) scale(${i === 6 ? 1 : 0.85})`} style={{transformOrigin: '100px 80px'}} />
    ))}
  </svg>
);

export const S02: React.FC<P> = ({t}) => {
  const s = 's02';
  const tHumo = cue(s, 'humo.'), tFer = cue(s, 'Fernando'), tArt = cue(s, 'artista'), tKar = cue(s, 'profesor'), tMar = cue(s, 'cultivaba'), tOli = cue(s, 'Olivos.');
  const tDia = cue(s, 'Y un día,'), tViaje = cue(s, 'viaje,'), tComo = cue(s, '¿cómo'), tMenor = cue(s, 'menor'), tResp = cue(s, 'La respuesta:');
  const tSinA = cue(s, 'sin armas'), tSinV = cue(s, 'sin violencia...'), tSal = cue(s, 'y con una'), tAbajo = cue(s, 'Por abajo.');
  const qWords = segWords(s).filter((w) => w.s >= tComo - 0.01 && w.s < tResp - 0.01);
  const drop = prog(t, tAbajo, 0.8, easeIn);
  return (
    <AbsoluteFill>
      {/* Pregunta y humo */}
      <Beat t={t} t0={-0.2} t1={tFer - 0.05} kind="fade">
        <Zine dark>
          <Smoke t={t} x={960} y={900} n={12} scale={1.4} />
          <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontFamily: F2.scrawl, fontSize: 520, color: R.yellow, opacity: 0.2 + 0.8 * prog(t, 0.1, 0.5), transform: `rotate(${Math.sin(t * 2) * 4}deg)`, filter: `blur(${(1 - prog(t, tHumo, 0.6)) * 0 + (t > tHumo ? Math.sin(t * 3) * 1.5 + 1.5 : 0)}px)`}}>?</div>
          </AbsoluteFill>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 120, textAlign: 'center', fontFamily: F2.head, fontSize: 90, color: '#fff'}}>
            UNA PREGUNTA <span style={{opacity: prog(t, tHumo - 0.1, 0.3), color: 'rgba(220,220,210,0.9)'}}>… Y HUMO</span>
          </div>
        </Zine>
      </Beat>

      {/* Fernando Araujo */}
      <Beat t={t} t0={tFer - 0.05} t1={tDia - 0.05} kind="fade">
        <Zine>
          <Halftone opacity={0.08} id="h02" />
          <div style={{position: 'absolute', left: 180, top: 170, transform: `scale(${pop(t, tFer)})`, transformOrigin: 'bottom center'}}>
            <Bust role="cerebro" size={460} />
          </div>
          <div style={{position: 'absolute', left: 205, top: 720, opacity: prog(t, tFer + 0.1, 0.3)}}>
            <Placard name="Fernando Araujo" alias="el cerebro" role="IDEÓLOGO DEL GOLPE" w={420} />
          </div>
          {[
            {t0: tArt, text: 'ARTISTA PLÁSTICO'},
            {t0: tKar, text: 'PROFESOR DE KARATE'},
            {t0: tMar, text: 'CULTIVABA MARIHUANA'},
          ].map((c, i) => (
            <div key={i} style={{position: 'absolute', left: 820, top: 220 + i * 190, display: 'flex', alignItems: 'center', gap: 24, opacity: t > c.t0 - 0.05 ? 1 : 0, transform: `translateX(${(1 - prog(t, c.t0 - 0.05, 0.35)) * 80}px) rotate(${(i - 1) * 1.2}deg)`}}>
              <div style={{background: i === 2 ? R.green : '#111', color: '#fff', fontFamily: F2.head, fontSize: 72, padding: '8px 28px', boxShadow: `8px 8px 0 ${R.red}`}}>{c.text}</div>
              {i === 2 ? <div style={{transform: `scale(${pop(t, c.t0 + 0.2)})`}}><Plant size={150} /></div> : null}
            </div>
          ))}
          <div style={{position: 'absolute', left: 840, top: 820, fontFamily: F2.scrawl, fontSize: 46, color: R.red, opacity: prog(t, tOli - 0.3, 0.3), transform: 'rotate(-3deg)'}}>…en su depto de Olivos</div>
        </Zine>
      </Beat>

      {/* El viaje: póster psicodélico */}
      <Beat t={t} t0={tDia - 0.05} t1={tResp - 0.05} kind="fade">
        <AbsoluteFill style={{background: `conic-gradient(from ${t * 40}deg at 50% 55%, #FF7A1A, #E8322B, #8E3B8E, #2D6BFF, #1E8C5A, #FFCC33, #FF7A1A)`}}>
          <AbsoluteFill style={{background: `repeating-radial-gradient(circle at 50% 55%, rgba(0,0,0,0) 0 40px, rgba(0,0,0,0.18) 40px 80px)`, transform: `scale(${1 + ((t * 0.3) % 0.5)})`}} />
          <AbsoluteFill style={{background: 'rgba(17,17,17,0.45)'}} />
          <Halftone color="#000" opacity={0.25} id="h02b" size={16} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: F2.scrawl, fontSize: 60, color: '#fff', transform: `rotate(${Math.sin(t * 1.5) * 2}deg)`}}>
            {t > tViaje - 0.2 ? '~ en pleno viaje ~' : 'y un día…'}
          </div>
          <div style={{position: 'absolute', left: 140, right: 140, top: 320, textAlign: 'center', fontFamily: F2.quote, fontStyle: 'italic', fontWeight: 900, fontSize: 104, lineHeight: 1.12, color: '#fff', textShadow: '0 6px 24px rgba(0,0,0,0.5)'}}>
            {qWords.map((w, i) => {
              const k = prog(t, w.s - 0.08, 0.25);
              const hi = /menor|daño/.test(w.w);
              return (
                <span key={i} style={{display: 'inline-block', marginRight: '0.26em', opacity: 0.1 + 0.9 * k, transform: `translateY(${Math.sin(t * 3 + i) * 6}px)`, color: hi ? R.yellow : '#fff'}}>
                  {w.w}
                </span>
              );
            })}
          </div>
          {t > tMenor ? <div style={{position: 'absolute', right: 140, bottom: 120, fontFamily: F2.scrawl, fontSize: 48, color: R.yellow, transform: `rotate(-6deg) scale(${pop(t, tMenor)})`}}>¿un robo "amable"?</div> : null}
        </AbsoluteFill>
      </Beat>

      {/* La respuesta */}
      <Beat t={t} t0={tResp - 0.05} kind="fade">
        <Zine>
          <div style={{position: 'absolute', left: 150, top: 110, fontFamily: F2.head, fontSize: 110, color: '#111', transform: `translateY(${drop * 900}px)`}}>
            LA RESPUESTA:
          </div>
          <div style={{position: 'absolute', left: 160, top: 310, display: 'flex', flexDirection: 'column', gap: 40, transform: `translateY(${drop * 900}px) rotate(${drop * 8}deg)`}}>
            <Check t={t} t0={tSinA} text="Sin armas de verdad" size={78} />
            <Check t={t} t0={tSinV} text="Sin violencia" size={78} />
            <Check t={t} t0={tSal} text="Una salida que nadie vigila" size={78} />
          </div>
          {t > tAbajo - 0.1 ? (
            <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{fontFamily: F2.bungee, fontSize: 250, color: R.red, transform: `scale(${pop(t, tAbajo - 0.1)}) rotate(-4deg)`, textShadow: '10px 10px 0 #111'}}>POR ABAJO ↓</div>
            </AbsoluteFill>
          ) : null}
        </Zine>
      </Beat>
    </AbsoluteFill>
  );
};

/* =====================================================================
   S03 — Track 02: La banda (rueda de reconocimiento)
   ===================================================================== */
export const CREW: {role: any; name: string; alias?: string; job: string; cue?: string}[] = [
  {role: 'cerebro', name: 'Fernando Araujo', alias: 'el cerebro', job: 'LA IDEA'},
  {role: 'beto', name: 'Beto de la Torre', alias: 'el experimentado', job: 'LADRÓN CON OFICIO', cue: 'Beto'},
  {role: 'ingeniero', name: 'S. García Bolster', alias: 'el Ingeniero', job: 'LOS MOTORES', cue: 'Sebastián'},
  {role: 'traje', name: 'Mario Vitette', alias: 'el uruguayo', job: 'EL NEGOCIADOR', cue: 'Mario'},
  {role: 'chofer', name: 'El Paisa', alias: 'al volante', job: 'EL CHOFER', cue: 'El Paisa,'},
  {role: 'misterio', name: '¿?', alias: 'nunca atrapado', job: '???', cue: 'Y un par'},
  {role: 'misterio', name: '¿?', alias: 'nunca atrapado', job: '???', cue: 'Y un par'},
];

export const S03: React.FC<P> = ({t}) => {
  const s = 's03';
  const tBanda = cue(s, 'banda.'), tPeli = cue(s, 'película.'), tPar = cue(s, 'Y un par'), tNunca = cue(s, 'nunca');
  const times = CREW.map((c, i) => (c.cue ? cue(s, c.cue) + (i === 6 ? 0.35 : 0) : cue(s, 'Beto') - 0.9));
  // cámara que recorre la fila
  const SLOT = 400;
  const active = times.reduce((a, x, i) => (t >= x ? i : a), -1);
  const focus = active < 0 ? 0 : Math.min(active, 5);
  const camTarget = focus * SLOT - 760;
  const camX = clamp(camTarget, -200, 2800 - 1920);
  const zoomOut = prog(t, tPar + 1.2, 1.0, easeInOut);
  const scale = 1 - 0.36 * zoomOut;
  const camFinal = 960 / 0.64 - 1510;
  return (
    <AbsoluteFill>
      <Beat t={t} t0={-0.2} t1={times[0] + 0.05} kind="fade">
        <Zine dark>
          <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <Ransom text="LA BANDA" t={t} t0={tBanda - 0.2} size={160} stagger={0.05} seed={21} />
            <div style={{marginTop: 30, fontFamily: F2.type, fontSize: 48, color: R.yellow, letterSpacing: 6, opacity: prog(t, tPeli - 0.2, 0.3)}}>(DE PELÍCULA)</div>
          </AbsoluteFill>
          {[0, 1].map((k) => (
            <div key={k} style={{position: 'absolute', left: 0, right: 0, [k ? 'bottom' : 'top']: 40, height: 70, background: `repeating-linear-gradient(90deg, #fff 0 40px, transparent 40px 90px)`, opacity: 0.85 * prog(t, tPeli - 0.2, 0.3)}} />
          ))}
        </Zine>
      </Beat>
      {t >= times[0] ? (
        <LineupWall>
          <div style={{position: 'absolute', left: 0, top: 0, width: 2800, height: 1080, transform: `scale(${scale}) translateX(${-camX * (1 - zoomOut) + camFinal * zoomOut}px)`, transformOrigin: '0 50%'}}>
            {CREW.map((c, i) => {
              const x = 120 + i * SLOT;
              const on = t >= times[i];
              const flash = on ? 1 - prog(t, times[i], 0.25) : 0;
              return (
                <div key={i} style={{position: 'absolute', left: x, top: 215, width: 380, opacity: on ? 1 : 0}}>
                  <div style={{transform: `scale(${pop(t, times[i], 1.1)})`, transformOrigin: 'bottom center', display: 'flex', justifyContent: 'center'}}>
                    <Bust role={c.role} size={380} />
                  </div>
                  <div style={{marginTop: -22, display: 'flex', justifyContent: 'center', transform: `rotate(${(rnd(i) - 0.5) * 4}deg)`}}>
                    <Placard name={c.name} alias={c.alias} role={c.job} num={`N° ${String(i + 1).padStart(2, '0')} · 13/01/06`} w={360} />
                  </div>
                  <div style={{position: 'absolute', inset: -40, background: '#fff', opacity: flash * 0.9}} />
                </div>
              );
            })}
          </div>
          {t > tNunca ? <Stamp t={t} t0={tNunca + 0.1} text="NUNCA ATRAPADOS" x={1600} y={250} size={70} rot={-8} blend={false} /> : null}
        </LineupWall>
      ) : null}
    </AbsoluteFill>
  );
};

/* =====================================================================
   S04 — Track 03: El túnel
   ===================================================================== */
export const S04: React.FC<P> = ({t}) => {
  const s = 's04';
  const tPor = cue(s, 'Por ahí'), tDes = cue(s, 'desagüe'), tDur = cue(s, 'Durante'), tOsc = cue(s, 'oscuras,'), tCav = cue(s, 'cavando'), tBanco = cue(s, 'banco.');
  const tBov = cue(s, 'Justo abajo'), tCajas = cue(s, 'Justo abajo', 1), tSi = cue(s, 'Sí:'), tVideo = cue(s, 'video'), tGuardan = cue(s, 'guardan'), tConf = cue(s, 'confían');
  const tDol = cue(s, 'Dólares.'), tJoy = cue(s, 'Joyas.'), tAho = cue(s, 'Ahorros');
  const dig = clamp((t - tCav) / (tBanco + 0.5 - tCav));
  const dark = prog(t, tOsc, 0.6) * (1 - prog(t, tBov, 0.5));
  // cámara: calle -> desagüe -> bóveda
  const z = 1 + 0.25 * prog(t, tPor, 1.2, easeInOut) - 0.25 * prog(t, tDur, 1, easeInOut) + 0.7 * prog(t, tBov, 1.0, easeInOut);
  const cx = 960 + (prog(t, tBov, 1, easeInOut)) * 10;
  const cy = 420 + 380 * prog(t, tPor, 1.2, easeInOut) - 120 * prog(t, tDur, 1, easeInOut) - 230 * prog(t, tBov, 1, easeInOut);
  const pan = cx - 960 / z;
  const ty = 540 - cy * z;
  return (
    <AbsoluteFill>
      <Beat t={t} t0={-0.2} t1={tSi - 0.05} kind="fade">
        <AbsoluteFill style={{background: R.paper, overflow: 'hidden'}}>
          <div style={{position: 'absolute', inset: 0, transform: `translateY(${ty}px)`}}>
            <CrossSection t={t} zoom={z} pan={pan} dig={dig} cars={0} workers={t > tDur && t < tBanco + 1} boxesGlow={prog(t, tCajas, 0.5)} labels={prog(t, tPor, 0.4)} />
          </div>
          <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 60%, rgba(0,0,0,0) 20%, rgba(0,0,0,${0.85 * dark}) 70%)`}} />
          <RockPhoto src="img2/calle_peru.jpg" t={t} t0={0.1} t1={tPor + 0.2} x={1560} y={270} w={560} h={300} rot={3} seed={14} credit="Calle Perú, Acassuso · F. Martello · CC BY-SA 4.0" />
          <div style={{position: 'absolute', left: 60, top: 60, opacity: 1 - prog(t, tPor, 0.3), background: R.paper, padding: '10px 26px 16px', boxShadow: '8px 8px 0 #111', border: '5px solid #111'}}>
            <div style={{fontFamily: F2.head, fontSize: 100, color: '#111', lineHeight: 1.05}}>EL SECRETO…</div>
            <div style={{fontFamily: F2.scrawl, fontSize: 50, color: R.red, opacity: prog(t, cue(s, 'abajo') - 0.1, 0.3)}}>…estaba abajo ↓</div>
          </div>
          {t > tDur - 0.1 && t < tBov ? (
            <div style={{position: 'absolute', left: 80, top: 80}}>
              <div style={{background: R.red, color: '#fff', fontFamily: F2.head, fontSize: 64, padding: '4px 22px', transform: `scale(${pop(t, tDur)})`, transformOrigin: 'left'}}>DURANTE MESES</div>
              <div style={{fontFamily: F2.type, fontSize: 36, color: '#fff', marginTop: 12, opacity: prog(t, tOsc, 0.3)}}>a oscuras · bajo tierra</div>
            </div>
          ) : null}
          {t > tBov ? (
            <div style={{position: 'absolute', left: 80, top: 890}}>
              <div style={{fontFamily: F2.head, fontSize: 80, color: '#fff', background: '#111', padding: '4px 26px', display: 'inline-block', boxShadow: `8px 8px 0 ${R.red}`, transform: `scale(${pop(t, tBov)})`, transformOrigin: 'left'}}>JUSTO ABAJO DE <span style={{color: R.yellow}}>{t > tCajas ? 'LAS CAJAS' : 'LA BÓVEDA'}</span></div>
            </div>
          ) : null}
        </AbsoluteFill>
      </Beat>

      <Beat t={t} t0={tSi - 0.05} t1={tDol - 0.1} kind="fade">
        <Zine>
          <div style={{position: 'absolute', left: 120, top: 150, width: 640, height: 360, background: R.yellow, border: '8px solid #111', boxShadow: `14px 14px 0 #111`, transform: `rotate(-4deg) scale(${pop(t, tSi)})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontFamily: F2.head, fontSize: 150, lineHeight: 0.95, color: '#111'}}>13 <span style={{color: R.red}}>CEROS</span></div>
            <div style={{fontFamily: F2.type, fontSize: 28, color: '#111', marginTop: 10}}>CONTEXTO · EPISODIO 1</div>
          </div>
          <div style={{position: 'absolute', left: 170, top: 540, fontFamily: F2.scrawl, fontSize: 44, color: R.red, opacity: prog(t, tVideo, 0.3), transform: 'rotate(-3deg)'}}>▶ el video anterior</div>
          <div style={{position: 'absolute', left: 900, top: 200, width: 900}}>
            <div style={{fontFamily: F2.head, fontSize: 84, color: '#111', lineHeight: 1.05, opacity: prog(t, tGuardan - 0.3, 0.3)}}>
              LO QUE LOS ARGENTINOS <Mark t={t} t0={tConf}>NO SE ANIMAN</Mark> A DEJAR EN EL BANCO…
            </div>
            <div style={{fontFamily: F2.head, fontSize: 84, color: R.red, lineHeight: 1.05, marginTop: 30, opacity: prog(t, tConf + 0.6, 0.3)}}>…LO GUARDAN EN EL BANCO.</div>
            <div style={{fontFamily: F2.scrawl, fontSize: 40, color: '#111', marginTop: 20, opacity: prog(t, tConf + 1.0, 0.3)}}>(en una caja de seguridad)</div>
          </div>
        </Zine>
      </Beat>

      <Beat t={t} t0={tDol - 0.1} kind="fade">
        <Zine dark>
          <div style={{position: 'absolute', left: 124, top: 190}}>
            <SafeGrid cols={10} rows={4} opened={t < tDol ? 0 : t < tJoy ? 3 : t < tAho ? 7 : 12 + (t - tAho) * 20} cell={160} dark />
          </div>
          {[
            {t0: tDol, text: 'DÓLARES', c: R.green},
            {t0: tJoy, text: 'JOYAS', c: R.yellow},
            {t0: tAho, text: 'AHORROS DE TODA UNA VIDA', c: '#fff'},
          ].map((w, i) => (
            <div key={i} style={{position: 'absolute', left: 124 + i * 470, top: 760, fontFamily: F2.head, fontSize: i === 2 ? 64 : 96, color: w.c, opacity: t > w.t0 ? 1 : 0, transform: `scale(${pop(t, w.t0)})`, transformOrigin: 'left', whiteSpace: 'nowrap'}}>
              {w.text}
            </div>
          ))}
        </Zine>
      </Beat>
    </AbsoluteFill>
  );
};
