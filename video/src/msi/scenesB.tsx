/* Escenas 6–11: los bots, el precio dinámico, las trampas, la ley, el veredicto y el cierre */
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {
  M, FONT, W, H, At, B, Bot, Browser, Cam, Credit, Glass, Gold, Kicker, Night, Num, Person, Phone, Photo, Pill, Sheet, Slam, Src, Stamp, Stripes, Ticket, Words,
  clamp, easeIn, easeInOut, easeOut, fmt, img, pop, prog, rnd,
} from './kit';
import {c, at, end, CR} from './lib';
import {SceneP, Bills} from './scenesA';

const big = (size: number, color: string = M.white): React.CSSProperties => ({fontFamily: FONT.head, fontSize: size, color, lineHeight: 0.95, letterSpacing: 1});
const body = (size: number, color: string = M.white, weight = 800): React.CSSProperties => ({fontFamily: FONT.body, fontWeight: weight, fontSize: size, color, lineHeight: 1.15});
const shadow = '0 6px 30px rgba(0,0,0,0.7)';

/** silueta del revendedor (gorra) */
const Reseller: React.FC<{w: number; color?: string}> = ({w, color = M.red}) => (
  <svg width={w} height={w * 1.15} viewBox="0 0 40 46"><circle cx="20" cy="13" r="10" fill={color} /><path d="M2 46 V38 a18 14 0 0 1 36 0 V46 Z" fill={color} /><rect x="9" y="1" width="22" height="5" rx="2" fill="#7A0A1A" /><rect x="5" y="5" width="30" height="3" rx="1.5" fill="#7A0A1A" /></svg>
);

/** entrada chiquita (ícono) */
const MiniTicket: React.FC<{w: number; color?: string}> = ({w, color = M.cream}) => (
  <div style={{width: w, height: w * 0.48, borderRadius: w * 0.08, background: color, position: 'relative', overflow: 'hidden', boxShadow: '0 10px 24px rgba(0,0,0,0.4)'}}>
    <Stripes w={w * 0.12} h={w * 0.48} n={3} style={{position: 'absolute', left: 0, top: 0}} />
    <div style={{position: 'absolute', right: w * 0.26, top: w * 0.05, bottom: w * 0.05, borderLeft: `${Math.max(2, w * 0.02)}px dashed rgba(20,30,60,0.3)`}} />
    <div style={{position: 'absolute', left: w * 0.2, top: w * 0.12, width: w * 0.4, height: w * 0.06, borderRadius: 3, background: M.celesteDeep}} />
    <div style={{position: 'absolute', left: w * 0.2, top: w * 0.25, width: w * 0.3, height: w * 0.05, borderRadius: 3, background: 'rgba(20,30,60,0.35)'}} />
  </div>
);

/* ============================== s06 · los bots ============================== */
export const S06a: React.FC<SceneP> = ({T, t0}) => {
  const tBar = c('s06', 'barata'), tEsc = c('s06', 'escasa,'), tGana = c('s06', 'la gana'), tM2 = c('s06', 'Y el más'), tCasi = c('s06', 'casi nunca'), tP = c('s06', 'persona.');
  const lanes = [0, 1, 2, 3, 4];
  const speed = [0.17, 0.13, 1.15, 0.11, 0.15]; // fracción de pista por segundo
  const WIN = 2;
  const X0 = 190, X1 = 1560;
  return (
    <Night t={T} beams={0.5} floor={false}>
      <Cam t={T} punches={[tGana, tM2 + 0.1, tP]}>
        {/* títulos que se reemplazan */}
        <At x={960} y={150} center>
          <B t={T} t0={t0 + 0.05} t1={tGana - 0.35} kind="fade"><Slam t={T} t0={t0 + 0.05} size={130}>PERO HAY UN PROBLEMA</Slam></B>
        </At>
        <At x={960} y={290} center>
          <div style={{display: 'flex', gap: 24, opacity: 1 - prog(T, tGana - 0.3, 0.3)}}>
            <B t={T} t0={tBar - 0.1} kind="pop"><Pill bg={M.gold} size={40}>BARATA</Pill></B>
            <B t={T} t0={tEsc - 0.1} kind="pop"><Pill bg={M.white} size={40}>+ ESCASA</Pill></B>
          </div>
        </At>
        <At x={960} y={170} center>
          <B t={T} t0={tGana - 0.05} t1={tM2 - 0.2} kind="fade"><Words t={T} t0={tGana - 0.05} text="LA GANA EL MÁS RÁPIDO" kind="slam" step={0.07} center hi={['RÁPIDO']} hiColor={M.gold} style={{...big(120), whiteSpace: 'nowrap'}} /></B>
        </At>
        <At x={960} y={170} center>
          {T > tM2 ? (
            <div style={{textAlign: 'center', whiteSpace: 'nowrap'}}>
              <Words t={T} t0={tCasi - 0.1} text="CASI NUNCA ES UNA PERSONA" kind="slam" step={0.07} center hi={['PERSONA']} hiColor={M.red} style={{...big(120)}} />
            </div>
          ) : null}
        </At>
        {/* pistas */}
        <div style={{position: 'absolute', left: X0 - 40, top: 400, width: X1 - X0 + 200, height: 560}}>
          {lanes.map((i) => (
            <div key={i} style={{position: 'absolute', left: 0, right: 0, top: i * 112 + 108, height: 2, background: 'rgba(182,220,255,0.18)'}} />
          ))}
          {/* llegada */}
          <div style={{position: 'absolute', left: X1 - X0 + 120, top: 0, width: 26, height: 560, backgroundImage: 'repeating-conic-gradient(#fff 0% 25%, #111 0% 50%)', backgroundSize: '26px 26px', opacity: 0.85}} />
          <div style={{position: 'absolute', left: X1 - X0 + 170, top: 250}}><MiniTicket w={130} /></div>
        </div>
        {lanes.map((i) => {
          const run = Math.max(0, T - tGana + 0.2);
          const p = clamp(run * speed[i]);
          const x = X0 + (X1 - X0) * easeOut(p);
          const bob = run > 0 && p < 1 ? -Math.abs(Math.sin(T * 16 + i * 1.3)) * 12 : Math.sin(T * 3 + i) * 3;
          const isBot = i === WIN && T > tM2 + 0.05;
          const flip = i === WIN ? clamp((T - tM2 - 0.05) / 0.25) : 0;
          const y = 400 + i * 112 - 4;
          return (
            <div key={i} style={{position: 'absolute', left: x, top: y + bob, opacity: prog(T, t0 + 0.2 + i * 0.06, 0.4)}}>
              {isBot ? (
                <div style={{transform: `scale(${0.6 + 0.4 * flip})`, filter: `drop-shadow(0 0 ${24 * flip}px ${M.red})`}}><Bot w={56} /></div>
              ) : (
                <Person w={56} color={i === WIN ? M.gold : M.celesteHi} />
              )}
            </div>
          );
        })}
        {T > tP - 0.1 ? (
          <At x={1180} y={640} center><Stamp t={T} t0={tP - 0.05} text="ES UN BOT" size={110} rot={-6} bg="rgba(5,10,23,0.7)" /></At>
        ) : null}
      </Cam>
    </Night>
  );
};

export const S06b: React.FC<SceneP> = ({T, t0}) => {
  const tI = c('s06', 'Imperva,'), t4 = c('s06', 'cuatro'), tV = c('s06', 'visitas'), tB = c('s06', 'bots');
  const n = 10, fw = 96, gap = 52;
  const x0 = (W - (n * fw + (n - 1) * gap)) / 2;
  return (
    <Cam t={T} punches={[t4, tB]}>
      <Photo src="vid/servidores.mp4" video t={T} t0={t0} span={8} zoom={[1.05, 1.15]} dim={0.62} grade="cold" credit={CR.ia} />
      <At x={960} y={130} center>
        <B t={T} t0={tI - 0.2} kind="fade"><Kicker t={T} t0={tI - 0.2} size={26}>Imperva · empresa de ciberseguridad</Kicker></B>
      </At>
      <At x={960} y={280} center>
        <B t={T} t0={t4 - 0.08} kind="zoom">
          <div style={{...big(170), whiteSpace: 'nowrap', textShadow: shadow}}><span style={{color: M.red}}>4</span> DE CADA <span>10</span></div>
        </B>
      </At>
      {Array.from({length: n}).map((_, i) => {
        const bad = i < 4;
        const ti = t4 + 0.15 + i * 0.1;
        const f = bad ? clamp((T - ti) / 0.22) : 0;
        const appear = prog(T, t0 + 0.2 + i * 0.05, 0.4);
        return (
          <div key={i} style={{position: 'absolute', left: x0 + i * (fw + gap), top: 470, opacity: appear, transform: `translateY(${(1 - appear) * 40}px)`}}>
            <div style={{transform: `scaleX(${f < 0.5 ? 1 - f * 2 : (f - 0.5) * 2})`, filter: f >= 0.5 ? `drop-shadow(0 0 22px ${M.red})` : undefined}}>
              {f >= 0.5 ? <Bot w={fw} /> : <Person w={fw} color={M.celesteHi} />}
            </div>
          </div>
        );
      })}
      {/* corchete de los 4 bots */}
      <div style={{position: 'absolute', left: x0 - 10, top: 680, width: (4 * fw + 3 * gap + 20) * easeOut(clamp((T - t4 - 0.6) / 0.5)), height: 24, borderLeft: `5px solid ${M.red}`, borderRight: `5px solid ${M.red}`, borderBottom: `5px solid ${M.red}`, opacity: T > t4 + 0.6 ? 1 : 0}} />
      <At x={960} y={800} center>
        <B t={T} t0={tV - 0.1} kind="up"><div style={{...body(40), letterSpacing: 6, whiteSpace: 'nowrap', textShadow: shadow}}>VISITAS A SITIOS DE VENTA DE ENTRADAS</div></B>
      </At>
      <At x={960} y={900} center>
        <B t={T} t0={tB - 0.1} kind="pop"><Pill bg={M.red} fg={M.white} size={46}>SON BOTS MALICIOSOS</Pill></B>
      </At>
      <Src t={T} t0={tI} text="Imperva, «How Bots Affect Ticketing»: 39,9% del tráfico en 180 sitios de venta de entradas" />
    </Cam>
  );
};

export const S06c: React.FC<SceneP> = ({T, t0}) => {
  const t3 = c('s06', 'tres'), tC = c('s06', 'ciento'), tU = c('s06', 'usando');
  return (
    <Night t={T} glow="rgba(255,59,78,0.2)">
      <Cam t={T} punches={[t3, tC, tU]}>
        <At x={130} y={170}>
          <Kicker t={T} t0={t0 + 0.05} size={28}>Estados Unidos</Kicker>
        </At>
        <div style={{position: 'absolute', left: 150, top: 330, display: 'flex', gap: 40, alignItems: 'flex-end'}}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{transform: `translateY(${(1 - clamp(pop(T, t3 + i * 0.12, 1.3))) * 60}px) scale(${T < t3 + i * 0.12 ? 0 : 0.5 + 0.5 * clamp(pop(T, t3 + i * 0.12, 1.3))})`, filter: `drop-shadow(0 0 30px rgba(255,59,78,0.5))`}}>
              <Reseller w={170} />
            </div>
          ))}
        </div>
        <At x={150} y={560}>
          <B t={T} t0={t3 + 0.2} kind="left"><div style={{...big(84)}}>3 REVENDEDORES</div></B>
        </At>
        <At x={1000} y={300}>
          <B t={T} t0={tC - 0.15} kind="zoom">
            <div style={{...body(34, M.celeste), letterSpacing: 8}}>COMPRARON MÁS DE</div>
            <Gold t={T} size={210}><Num t={T} t0={tC - 0.1} dur={1.1} to={150000} /></Gold>
            <div style={{...big(80), marginTop: 6}}>ENTRADAS</div>
          </B>
        </At>
        <At x={1340} y={820} center>
          <Stamp t={T} t0={tU - 0.05} text="CON BOTS" sub="DENUNCIA DE LA FTC · 2021" size={110} rot={-6} />
        </At>
      </Cam>
      <Src t={T} t0={tC} text="FTC, Comisión Federal de Comercio de EE. UU. (22/01/2021): primeros casos por la ley BOTS" />
    </Night>
  );
};

export const S06d: React.FC<SceneP> = ({T, t0}) => {
  const tS = c('s06', 'Taylor'), tT = c('s06', 'Ticketmaster'), tN = c('s06', 'tres mil');
  return (
    <Cam t={T} punches={[tN]}>
      <Photo src="swift.jpg" t={T} t0={t0} span={7} zoom={[1.18, 1.05]} focus="30% 50%" dim={0.25} credit={CR.swift} />
      <AbsoluteFill style={{background: 'linear-gradient(270deg, rgba(5,10,23,0.9) 10%, rgba(5,10,23,0) 65%)'}} />
      <At x={880} y={200}>
        <B t={T} t0={tS - 0.1} kind="left"><Kicker t={T} t0={tS - 0.1} size={28} color={M.gold}>Taylor Swift · 2022</Kicker></B>
        <div style={{height: 36}} />
        <B t={T} t0={tT - 0.1} kind="up"><div style={{...body(42), textShadow: shadow}}>Ticketmaster recibió</div></B>
        <div style={{height: 14}} />
        <B t={T} t0={tN - 0.1} kind="zoom">
          <Gold t={T} size={150}><Num t={T} t0={tN - 0.1} dur={1.4} to={3500000000} /></Gold>
          <div style={{...big(72), marginTop: 10}}>SOLICITUDES</div>
        </B>
        <div style={{height: 34}} />
        <B t={T} t0={tN + 1.2} kind="pop"><Pill bg={M.white} size={36}>4 VECES SU RÉCORD</Pill></B>
      </At>
      <Src t={T} t0={tT} text="Ticketmaster, comunicado sobre la preventa de The Eras Tour (19/11/2022)" />
    </Cam>
  );
};

export const S06e: React.FC<SceneP> = ({T, t0}) => {
  const tQ = c('s06', '¿Pasó'), tN = c('s06', 'No hay'), tT = c('s06', 'tope'), tE = c('s06', 'justamente');
  return (
    <Cam t={T} punches={[tN, tT]}>
      <Photo src="egy245.jpg" t={T} t0={t0} span={7} zoom={[1.06, 1.16]} focus="35% 30%" dim={0.3} grade="cold" credit={CR.bb} />
      <AbsoluteFill style={{background: 'linear-gradient(270deg, rgba(5,10,23,0.92) 15%, rgba(5,10,23,0) 60%)'}} />
      <At x={1060} y={160}>
        <Words t={T} t0={tQ - 0.05} text="¿Y CON MESSI?" kind="slam" step={0.1} style={{...big(140)}} />
      </At>
      <At x={1400} y={430} center>
        <Stamp t={T} t0={tN - 0.03} text="SIN DATOS" sub="PÚBLICOS" size={110} rot={-5} color={M.gold} />
      </At>
      <At x={1060} y={620}>
        <B t={T} t0={tT - 0.15} kind="up">
          <Glass w={760} style={{padding: '30px 36px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
              <div style={{...big(120, M.gold)}}>4</div>
              <div>
                <div style={{...body(34), letterSpacing: 4}}>ENTRADAS POR CUENTA</div>
                <div style={{...body(26, M.mute, 700)}}>el tope de Deportick</div>
              </div>
            </div>
            <div style={{display: 'flex', gap: 14, marginTop: 20}}>
              {[0, 1, 2, 3].map((i) => <div key={i} style={{transform: `scale(${clamp(pop(T, tT + 0.2 + i * 0.1))})`}}><MiniTicket w={120} /></div>)}
            </div>
            <div style={{...body(30, M.celeste, 800), marginTop: 20, opacity: prog(T, tE - 0.1, 0.4)}}>Existe justamente para frenar a los bots</div>
          </Glass>
        </B>
      </At>
    </Cam>
  );
};

/* ============================== s07 · el precio dinámico ============================== */
export const S07a: React.FC<SceneP> = ({T, t0}) => {
  const tS = c('s07', 'sube'), tD = c('s07', 'demanda?');
  const X0 = 360, X1 = 1560, Y0 = 900, Y1 = 470;
  const kk = easeInOut(clamp((T - t0 - 0.1) / 2.4));
  const dem = (u: number) => Y0 - (Y0 - Y1) * (0.1 + 0.9 * Math.pow(u, 1.6) + 0.04 * Math.sin(u * 20));
  const pri = (u: number) => Y0 - (Y0 - Y1) * (0.1 + 0.9 * Math.pow(Math.floor(u * 6) / 6, 1.6)) + 30;
  const pd: string[] = [], pp: string[] = [];
  for (let u = 0; u <= kk; u += 0.01) { const x = X0 + (X1 - X0) * u; pd.push(`${x},${dem(u)}`); pp.push(`${x},${pri(u)}`); }
  return (
    <Sheet t={T}>
      <Cam t={T} punches={[tS]}>
        <At x={960} y={170} center>
          <B t={T} t0={t0 + 0.05} kind="fade"><div style={{...body(46, M.ink2, 700), whiteSpace: 'nowrap'}}>¿Y si el organizador sube el precio cuando hay más demanda?</div></B>
        </At>
        <At x={960} y={300} center>
          <Slam t={T} t0={tS - 0.05} size={150} color={M.ink}>PRECIO DINÁMICO</Slam>
        </At>
        <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
          <line x1={X0} y1={Y0} x2={X1 + 40} y2={Y0} stroke={M.ink} strokeWidth={4} />
          <line x1={X0} y1={Y0} x2={X0} y2={Y1 - 40} stroke={M.ink} strokeWidth={4} />
          {pd.length > 1 ? <polyline points={pd.join(' ')} fill="none" stroke={M.celesteDeep} strokeWidth={8} strokeLinecap="round" /> : null}
          {pp.length > 1 ? <polyline points={pp.join(' ')} fill="none" stroke={M.red} strokeWidth={8} strokeLinejoin="round" /> : null}
          {kk > 0.9 ? <text x={X1 + 20} y={dem(1) - 10} style={{fontFamily: FONT.head, fontSize: 38}} fill={M.celesteDeep}>DEMANDA</text> : null}
          {kk > 0.9 ? <text x={X1 + 20} y={pri(1) + 50} style={{fontFamily: FONT.head, fontSize: 38}} fill={M.red}>PRECIO</text> : null}
        </svg>
        <At x={X0 + 30} y={Y0 + 30}><B t={T} t0={tD - 0.2} kind="fade"><div style={{...body(26, M.ink2, 800), letterSpacing: 4}}>EL PRECIO SIGUE A LA DEMANDA, MINUTO A MINUTO</div></B></At>
      </Cam>
    </Sheet>
  );
};

/** etiqueta de precio colgante que se da vuelta */
const Tag: React.FC<{T: number; t0: number; label: string; a: string; b: string; tb: number; w?: number}> = ({T, t0, label, a, b, tb, w = 460}) => {
  const flip = clamp((T - tb) / 0.35);
  const showB = flip > 0.5;
  return (
    <div style={{transformOrigin: '50% 0%', transform: `rotate(${Math.sin(T * 1.6) * 5 * (1 - prog(T, t0, 1.5)) + Math.sin(T * 0.9) * 2.5}deg) scale(${clamp(pop(T, t0))})`}}>
      <div style={{width: 4, height: 70, background: 'rgba(255,255,255,0.7)', margin: '0 auto'}} />
      <div style={{width: w, padding: '28px 26px 34px', borderRadius: 20, background: showB ? M.red : M.gold, textAlign: 'center', transform: `rotateX(${Math.sin(flip * Math.PI) * 90}deg)`, boxShadow: '0 30px 60px rgba(0,0,0,0.45)', position: 'relative'}}>
        <div style={{position: 'absolute', left: '50%', top: 14, width: 24, height: 24, borderRadius: 12, background: M.night, transform: 'translateX(-50%)'}} />
        <div style={{...body(28, showB ? M.white : M.ink, 900), letterSpacing: 7, marginTop: 22}}>{label}</div>
        <div style={{...big(140, showB ? M.white : M.ink), whiteSpace: 'nowrap'}}>{showB ? b : a}</div>
      </div>
    </div>
  );
};

export const S07b: React.FC<SceneP> = ({T, t0}) => {
  const tO = c('s07', 'Oasis'), tH = c('s07', 'horas'), tV = c('s07', 'vio'), tC = c('s07', 'ciento'), t3 = c('s07', 'trescientas');
  const swap = prog(T, tV - 0.3, 0.5);
  return (
    <Cam t={T} punches={[tO, tH, t3]}>
      <Photo src="oasis.jpg" t={T} t0={t0} span={6} zoom={[1.05, 1.18]} focus="55% 40%" dim={0.35} credit={CR.oasis} />
      {swap > 0 ? (
        <AbsoluteFill style={{opacity: swap}}>
          <Photo src="oasis2.jpg" t={T} t0={tV - 0.3} span={6} zoom={[1.12, 1.02]} focus="45% 30%" dim={0.4} grade="cold" credit={CR.oasis} />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(5,10,23,0.85) 0%, rgba(5,10,23,0.1) 60%)'}} />
      <At x={130} y={180}>
        <B t={T} t0={t0 + 0.05} kind="left"><Kicker t={T} t0={t0 + 0.05} size={26} color={M.celesteHi}>Mirá lo que pasó con</Kicker></B>
        <div style={{height: 10}} />
        <Slam t={T} t0={tO - 0.05} size={250}>OASIS</Slam>
        <B t={T} t0={tO + 0.4} kind="left"><div style={{...body(40, M.celeste), letterSpacing: 10, marginTop: 6}}>LA VENTA DE 2024</div></B>
      </At>
      <At x={130} y={620}>
        <B t={T} t0={tH - 0.1} kind="up">
          <div style={{display: 'flex', alignItems: 'center', gap: 22, background: 'rgba(10,18,42,0.8)', border: '1.5px solid rgba(182,220,255,0.25)', padding: '18px 30px', borderRadius: 18}}>
            <svg width="64" height="64" viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="none" stroke={M.gold} strokeWidth="4" /><line x1="20" y1="20" x2="20" y2="9" stroke={M.gold} strokeWidth="4" strokeLinecap="round" transform={`rotate(${T * 300} 20 20)`} /><line x1="20" y1="20" x2="28" y2="20" stroke={M.gold} strokeWidth="4" strokeLinecap="round" transform={`rotate(${T * 25} 20 20)`} /></svg>
            <div><div style={{...big(60)}}>HORAS DE FILA</div><div style={{...body(26, M.mute, 700)}}>virtual, para comprar</div></div>
          </div>
        </B>
      </At>
      <At x={1230} y={120}>
        <B t={T} t0={tC - 0.2} kind="drop"><Tag T={T} t0={tC - 0.2} label="ENTRADA" a="£148,50" b="£355" tb={t3 - 0.1} /></B>
      </At>
      <At x={1460} y={760} center>
        {T > t3 + 0.3 ? <B t={T} t0={t3 + 0.3} kind="pop"><div style={{...big(130, M.red), textShadow: '0 10px 40px rgba(255,59,78,0.45)'}}>×2,4</div></B> : null}
      </At>
      <Src t={T} t0={tC} text="Al Jazeera (03/09/2024): entradas de £148,50 pasaron a £355 con el precio dinámico" />
    </Cam>
  );
};

export const S07c: React.FC<SceneP> = ({T, t0}) => {
  const tT = c('s07', 'Ticketmaster'), tC = c('s07', 'cambiar');
  return (
    <Cam t={T} punches={[tT, tC]}>
      <Photo src="ticketmaster.jpg" t={T} t0={t0} span={5} zoom={[1.04, 1.14]} focus="40% 40%" dim={0.35} grade="duo" credit={CR.ticketmaster} />
      <At x={960} y={220} center>
        <B t={T} t0={t0 + 0.05} kind="fade"><Kicker t={T} t0={t0 + 0.05} size={28} color={M.white}>El regulador británico (CMA)</Kicker></B>
      </At>
      <At x={960} y={420} center>
        <Words t={T} t0={c('s07', 'obligó') - 0.1} text="OBLIGÓ A TICKETMASTER" kind="slam" step={0.1} center style={{...big(140), whiteSpace: 'nowrap', textShadow: shadow}} />
      </At>
      <At x={960} y={700} center>
        <Stamp t={T} t0={tC - 0.05} text="A CAMBIAR LAS REGLAS" size={100} rot={-4} color={M.gold} bg="rgba(5,10,23,0.55)" />
      </At>
      <Src t={T} t0={tT} text="CMA, autoridad de competencia del Reino Unido (25/09/2025)" />
    </Cam>
  );
};

const FlagESP: React.FC<{w: number}> = ({w}) => (
  <div style={{width: w, height: w * 0.63, borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.35)'}}>
    <div style={{flex: 1, background: '#C60B1E'}} /><div style={{flex: 2, background: '#FFC400'}} /><div style={{flex: 1, background: '#C60B1E'}} />
  </div>
);
const FlagARGs: React.FC<{w: number}> = ({w}) => (
  <div style={{width: w, height: w * 0.63, borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.35)'}}>
    <div style={{flex: 1, background: M.celeste}} />
    <div style={{flex: 1, background: M.white, display: 'flex', justifyContent: 'center', alignItems: 'center'}}><div style={{width: w * 0.17, height: w * 0.17, borderRadius: '50%', background: '#F6B40E'}} /></div>
    <div style={{flex: 1, background: M.celeste}} />
  </div>
);

export const S07d: React.FC<SceneP> = ({T, t0}) => {
  const tA = c('s07', 'Argentina'), tR = c('s07', 'reventa oficial'), tL = c('s07', 'llegaron'), tN = c('s07', 'dos millones'), tC = c('s07', 'Cada');
  const dark = prog(T, tL, 0.8);
  return (
    <Cam t={T} punches={[tA, tN, tC]} push={[tL, tN + 0.5, 1, 1.06]}>
      <Photo src="esp305.jpg" t={T} t0={t0} span={10} zoom={[1.04, 1.2]} focus="70% 35%" dim={0.3} credit={CR.bb} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(5,10,23,0.9) 0%, rgba(5,10,23,0.15) 65%)'}} />
      {dark > 0 ? (
        <AbsoluteFill style={{opacity: dark}}>
          <Photo src="esp305_blur.jpg" t={T} t0={t0} span={10} zoom={[1.04, 1.2]} focus="70% 35%" dim={0.3} />
          <AbsoluteFill style={{background: 'rgba(5,10,23,0.62)'}} />
        </AbsoluteFill>
      ) : null}
      <div style={{opacity: 1 - dark}}>
        <At x={130} y={190}>
          <Kicker t={T} t0={t0 + 0.05} size={28} color={M.gold}>Final del Mundial 2026</Kicker>
          <div style={{height: 30}} />
          <B t={T} t0={tA - 0.1} kind="left">
            <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
              <FlagARGs w={120} /><div style={{...big(96)}}>ARGENTINA</div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 26, marginTop: 18}}>
              <FlagESP w={120} /><div style={{...big(96)}}>ESPAÑA</div>
            </div>
          </B>
          <div style={{height: 40}} />
          <B t={T} t0={tR - 0.1} kind="pop"><Pill bg={M.white} size={38}>REVENTA OFICIAL DE LA FIFA</Pill></B>
        </At>
      </div>
      <At x={960} y={300} center>
        <B t={T} t0={tL + 0.1} kind="fade"><div style={{...body(40, M.celesteHi, 700), whiteSpace: 'nowrap'}}>En la reventa oficial de la FIFA se publicaron entradas a</div></B>
      </At>
      <At x={960} y={520} center>
        <B t={T} t0={tN - 0.15} kind="zoom"><Gold t={T} size={230}><Num t={T} t0={tN - 0.15} dur={1.6} to={2299998} pre="US$ " /></Gold></B>
      </At>
      <At x={960} y={780} center>
        <Slam t={T} t0={tC - 0.05} size={170} color={M.red}>CADA UNA.</Slam>
      </At>
      <Src t={T} t0={tR} text="ESPN y Al Jazeera (18/07/2026): 4 entradas publicadas a US$ 2.299.998,85 cada una" />
    </Cam>
  );
};

/* ============================== s08 · la trampa ============================== */
const ShopMock: React.FC<{T: number; t0: number; banner?: number}> = ({T, t0, banner}) => (
  <AbsoluteFill style={{background: '#F3F6FB'}}>
    <div style={{height: 84, background: '#1E63AE', display: 'flex', alignItems: 'center', padding: '0 34px', gap: 18}}>
      <div style={{width: 44, height: 44, borderRadius: 10, background: M.white, opacity: 0.9}} />
      <div style={{...body(30, M.white, 800)}}>Entradas · Argentina vs Benín</div>
    </div>
    <div style={{position: 'absolute', left: 40, top: 130}}><Ticket t={T} t0={t0} w={560} sway={0.3} rot={0} /></div>
    <div style={{position: 'absolute', right: 40, top: 150, width: 300}}>
      <div style={{...body(24, M.ink2, 700)}}>Popular</div>
      <div style={{...big(64, M.ink)}}>$90.000</div>
      <div style={{marginTop: 20, height: 70, borderRadius: 14, background: M.green, display: 'flex', justifyContent: 'center', alignItems: 'center', ...body(30, M.white, 900)}}>COMPRAR</div>
    </div>
    {banner !== undefined && T > banner ? (
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 90, background: Math.floor(T * 4) % 2 ? M.red : '#FF6A3D', display: 'flex', justifyContent: 'center', alignItems: 'center', ...body(40, M.white, 900), letterSpacing: 6, transform: `translateY(${(1 - prog(T, banner, 0.3)) * 90}px)`}}>
        ¡PREVENTA EXCLUSIVA! ENTRÁ ANTES
      </div>
    ) : null}
  </AbsoluteFill>
);

export const S08a: React.FC<SceneP> = ({T, t0}) => {
  const tA = c('s08', 'aparece'), tM = c('s08', 'El mismo'), tCo = c('s08', 'copia'), tOf = c('s08', 'oficial:'), tNet = c('s08', 'net'), tCom = c('s08', 'com'), tMd = c('s08', 'Mismo diseño'), tS = c('s08', 'supuesta');
  const part2 = T >= tM - 0.12;
  if (!part2) {
    return (
      <Night t={T} glow="rgba(255,59,78,0.3)" beams={0.3}>
        <Cam t={T} punches={[tA]}>
          <At x={960} y={400} center>
            <Words t={T} t0={t0 + 0.1} text="Donde hay desesperación…" step={0.1} center style={{...body(66, M.celesteHi, 700), whiteSpace: 'nowrap'}} />
          </At>
          <At x={960} y={600} center>
            <Words t={T} t0={tA - 0.05} text="APARECE LA TRAMPA" kind="slam" step={0.1} center hi={['TRAMPA']} hiColor={M.red} style={{...big(170), whiteSpace: 'nowrap'}} />
          </At>
        </Cam>
      </Night>
    );
  }
  const netK = prog(T, tNet, 0.3), comK = prog(T, tCom, 0.3);
  const sc = 0.84;
  return (
    <Night t={T} beams={0.4} glow="rgba(255,59,78,0.18)">
      <Cam t={T} punches={[tNet, tCom, tMd, tS]} drift={0.5}>
        <At x={960} y={110} center>
          <B t={T} t0={tM} kind="fade"><Kicker t={T} t0={tM} size={26}>El mismo día de la venta circuló una copia</Kicker></B>
        </At>
        {/* oficial */}
        <div style={{position: 'absolute', left: 90, top: 250}}>
          <B t={T} t0={tOf - 0.35} kind="left">
            <div style={{marginBottom: 18, display: 'flex', alignItems: 'center', gap: 14}}><Pill bg={M.green} fg={M.night} size={30}>✓ OFICIAL</Pill></div>
            <div style={{transform: `scale(${sc})`, transformOrigin: '0 0', width: 1000, height: 560}}>
              <Browser url="deportick.com/argentina-benin" w={1000} h={560} hiFrom={9} hiLen={4} hiColor={M.green} hiK={comK}>
                <ShopMock T={T} t0={tOf} />
              </Browser>
            </div>
          </B>
        </div>
        {/* copia */}
        <div style={{position: 'absolute', left: 990, top: 250}}>
          <B t={T} t0={tCo - 0.1} kind="right">
            <div style={{marginBottom: 18, display: 'flex', alignItems: 'center', gap: 14, opacity: netK}}><Pill bg={M.red} fg={M.white} size={30}>✕ COPIA FALSA</Pill></div>
            <div style={{transform: `scale(${sc}) rotate(${netK * 0.8}deg)`, transformOrigin: '0 0', width: 1000, height: 560, boxShadow: netK > 0 ? `0 0 0 ${6 * netK}px ${M.red}` : undefined, borderRadius: 18}}>
              <Browser url="deportick.net/argentina-benin" w={1000} h={560} lock={netK < 0.5} hiFrom={9} hiLen={4} hiColor={M.red} hiK={netK}>
                <ShopMock T={T} t0={tCo} banner={tS + 0.1} />
              </Browser>
            </div>
          </B>
        </div>
        {/* lupa: el dominio ampliado debajo de cada navegador */}
        {[
          {x: 510, t1: tCom, dom: '.com', col: M.green, ink: '#159A5E'},
          {x: 1410, t1: tNet, dom: '.net', col: M.red, ink: M.red},
        ].map((l) => (T > l.t1 - 0.1 && T < tMd + 0.3 ? (
          <At key={l.dom} x={l.x} y={850} center>
            <div style={{opacity: 1 - prog(T, tMd - 0.05, 0.3), transform: `scale(${clamp(pop(T, l.t1 - 0.1))})`, padding: '14px 40px', borderRadius: 60, border: `6px solid ${l.col}`, background: 'rgba(255,255,255,0.96)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', whiteSpace: 'nowrap'}}>
              <span style={{...big(76, M.ink)}}>deportick</span><span style={{...big(76, l.ink)}}>{l.dom}</span>
            </div>
          </At>
        ) : null))}
        <At x={960} y={890} center>
          <B t={T} t0={tMd - 0.1} kind="up"><Pill bg={M.white} size={40}>MISMO DISEÑO · MISMAS FOTOS</Pill></B>
        </At>
        <At x={1400} y={620} center>
          {T > tS + 0.9 ? <Stamp t={T} t0={tS + 0.9} text="TRUCHA" size={120} rot={-8} /> : null}
        </At>
      </Cam>
      <Src t={T} t0={tNet} text="Canal C y medios nacionales (24/09/2026): alerta por el sitio falso deportick.net" />
    </Night>
  );
};

export const S08c: React.FC<SceneP> = ({T, t0}) => {
  const tV = c('s08', '¿Y Viagogo,'), tPr = c('s08', 'precios millonarios?'), tAu = c('s08', 'En Australia'), tMu = c('s08', 'multaron'), tSi = c('s08', 'siete'), tIt = c('s08', 'Italia'), tDe = c('s08', 'decenas');
  const part2 = T >= tAu - 0.1;
  if (!part2) {
    return (
      <Night t={T} beams={0.6}>
        <Cam t={T} punches={[tV + 0.1, tPr]}>
          <At x={960} y={380} center><Slam t={T} t0={tV - 0.05} size={220}>¿Y VIAGOGO?</Slam></At>
          <At x={960} y={620} center>
            <B t={T} t0={c('s08', 'donde aparecen') - 0.1} kind="up"><div style={{...body(48, M.celesteHi, 700), whiteSpace: 'nowrap'}}>la página donde aparecen los</div></B>
          </At>
          <At x={960} y={760} center>
            <B t={T} t0={tPr - 0.1} kind="zoom"><Gold t={T} size={130}>PRECIOS MILLONARIOS</Gold></B>
          </At>
        </Cam>
      </Night>
    );
  }
  const card = (t1: number, country: string, amount: React.ReactNode, sub: string, bar: string[]) => (
    <B t={T} t0={t1 - 0.1} kind="up">
      <Glass w={780} style={{padding: '36px 44px', height: 470}}>
        <div style={{display: 'flex', height: 12, width: 180, borderRadius: 6, overflow: 'hidden', marginBottom: 22}}>{bar.map((b, i) => <div key={i} style={{flex: 1, background: b}} />)}</div>
        <div style={{...big(86)}}>{country}</div>
        <div style={{height: 26}} />
        {amount}
        <div style={{...body(32, M.mute, 700), marginTop: 18}}>{sub}</div>
      </Glass>
    </B>
  );
  return (
    <Night t={T} glow="rgba(255,200,61,0.16)">
      <Cam t={T} punches={[tAu, tSi, tIt]}>
        <At x={960} y={120} center><Kicker t={T} t0={tAu - 0.1} size={28} color={M.gold}>Viagogo · multas</Kicker></At>
        <div style={{position: 'absolute', left: 150, top: 260}}>
          {card(tAu, 'AUSTRALIA', <Gold t={T} size={110}>AU$ <Num t={T} t0={tSi - 0.1} dur={0.9} to={7} /> MILLONES</Gold>, 'por engañar a los compradores (2020)', ['#012169', '#FFFFFF', '#E4002B'])}
        </div>
        <At x={600} y={280} center>{T > tMu ? <Stamp t={T} t0={tMu} text="MULTADA" size={70} rot={8} /> : null}</At>
        <div style={{position: 'absolute', left: 990, top: 260}}>
          {card(tIt, 'ITALIA', <div style={{opacity: prog(T, tDe - 0.1, 0.3)}}><Gold t={T} size={84}>DECENAS DE MILLONES</Gold><div style={{...big(60, M.gold), marginTop: 8}}>DE EUROS</div></div>, 'acumulados en multas', ['#009246', '#FFFFFF', '#CE2B37'])}
        </div>
      </Cam>
      <Src t={T} t0={tAu} text="ACCC y Tribunal Federal de Australia (2020) · AGCOM, autoridad de comunicaciones de Italia" />
    </Night>
  );
};

export const S08d: React.FC<SceneP> = ({T, t0}) => {
  const tL = c('s08', 'lo que ves'), tP = c('s08', 'pedidos.'), tN = c('s08', 'Nadie');
  const prices = [688159, 813000, 1007894, 2698511, 3370000];
  return (
    <Night t={T} beams={0.4}>
      <Cam t={T} punches={[tP, tN]}>
        <At x={960} y={130} center><Words t={T} t0={t0 + 0.05} text="OJO CON OTRA COSA" kind="slam" step={0.08} center style={{...big(110), whiteSpace: 'nowrap'}} /></At>
        <div style={{position: 'absolute', left: 460, top: 260, width: 1000}}>
          {prices.map((p, i) => {
            const ti = tL + i * 0.12;
            const a = prog(T, ti, 0.4);
            return (
              <div key={i} style={{position: 'relative', height: 108, marginBottom: 18, borderRadius: 18, background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', padding: '0 34px', gap: 24, opacity: a, transform: `translateX(${(1 - a) * 120}px)`, boxShadow: '0 20px 40px rgba(0,0,0,0.35)'}}>
                <MiniTicket w={96} />
                <div style={{...body(28, M.ink2, 700)}}>1 entrada · Argentina vs Benín</div>
                <div style={{flex: 1}} />
                <div style={{...big(64, M.ink)}}>${fmt(p)}</div>
                {T > tP - 0.1 + i * 0.06 ? (
                  <div style={{position: 'absolute', right: -40, top: -18, transform: `rotate(6deg) scale(${clamp(pop(T, tP - 0.1 + i * 0.06))})`}}><Pill bg={M.gold} size={22}>PRECIO PEDIDO</Pill></div>
                ) : null}
                {T > tN + 0.3 + i * 0.1 ? (
                  <div style={{position: 'absolute', left: -150, top: 22, ...big(56, M.red), transform: `scale(${clamp(pop(T, tN + 0.3 + i * 0.1))})`}}>¿?</div>
                ) : null}
              </div>
            );
          })}
        </div>
        <At x={960} y={935} center>
          <B t={T} t0={tN - 0.1} kind="up"><div style={{...big(76), whiteSpace: 'nowrap', textShadow: shadow}}>NADIE SABE <span style={{color: M.red}}>CUÁNTAS SE VENDEN</span></div></B>
        </At>
      </Cam>
      <Src t={T} t0={tL} text="Publicaciones en Viagogo relevadas por Voces Críticas (25/09/2026)" />
    </Night>
  );
};

/* ============================== s09 · ¿es legal? ============================== */
export const S09a: React.FC<SceneP> = ({T, t0}) => {
  const tC = c('s09', 'Ciudad'), tG = c('s09', 'ganar plata'), tCv = c('s09', 'contravención:'), tM = c('s09', 'multar'), tA = c('s09', 'arrestar.');
  return (
    <Sheet t={T}>
      <Cam t={T} punches={[t0 + 0.2, tCv, tA]}>
        <At x={130} y={130}><Slam t={T} t0={c('s09', '¿Y es') - 0.05} size={170} color={M.ink}>¿ES LEGAL?</Slam></At>
        <At x={130} y={380}>
          <B t={T} t0={tC - 0.1} kind="flip">
            <div style={{width: 1000, background: '#FFFFFF', borderRadius: 10, padding: '40px 50px', boxShadow: '0 40px 80px rgba(20,30,60,0.25)', borderTop: `10px solid ${M.celesteDeep}`}}>
              <div style={{...body(24, M.celesteDeep, 900), letterSpacing: 5}}>CÓDIGO CONTRAVENCIONAL</div>
              <div style={{...big(56, M.ink), marginTop: 6}}>CIUDAD DE BUENOS AIRES</div>
              <div style={{height: 3, background: 'rgba(20,30,60,0.1)', margin: '24px 0'}} />
              <div style={{...body(38, M.ink, 700), lineHeight: 1.35}}>
                Revender entradas de espectáculos masivos{' '}
                <span style={{position: 'relative', display: 'inline-block'}}>
                  <span style={{position: 'absolute', left: -6, right: -6, top: 4, bottom: 0, background: M.gold, opacity: 0.6, transform: `scaleX(${easeOut(clamp((T - tG) / 0.4))})`, transformOrigin: 'left', borderRadius: 4}} />
                  <span style={{position: 'relative'}}>para ganar plata</span>
                </span>
              </div>
              <div style={{...body(26, M.ink2, 600), marginTop: 14}}>Ley 1472 · resumen</div>
            </div>
          </B>
        </At>
        <At x={1480} y={420} center>
          <Stamp t={T} t0={tCv - 0.05} text="CONTRAVENCIÓN" size={70} rot={-6} color={M.celesteDeep} />
        </At>
        <div style={{position: 'absolute', left: 1230, top: 600, display: 'flex', flexDirection: 'column', gap: 26}}>
          <B t={T} t0={tM - 0.1} kind="pop"><Pill bg={M.ink} fg={M.white} size={52}>MULTA</Pill></B>
          <B t={T} t0={tA - 0.1} kind="pop"><Pill bg={M.red} fg={M.white} size={52}>O ARRESTO</Pill></B>
        </div>
      </Cam>
      <Src t={T} t0={tC} dark={false} text="Código Contravencional de la Ciudad de Buenos Aires (Ley 1472), capítulo de espectáculos masivos" />
    </Sheet>
  );
};

export const S09b: React.FC<SceneP> = ({T, t0}) => {
  const tP = c('s09', 'para este'), tC = c('s09', 'compra'), tTu = c('s09', 'turno'), tE = c('s09', 'entrada física,'), tD = c('s09', 'deja');
  const steps = [
    {t: tC, top: 'PASO 1', label: 'COMPRA', sub: 'online', col: M.celeste},
    {t: tTu, top: 'PASO 2', label: 'TURNO', sub: 'para retirarla', col: M.gold},
    {t: tE, top: 'PASO 3', label: 'ENTRADA FÍSICA', sub: 'en mano', col: M.green},
  ];
  return (
    <Cam t={T} punches={[tTu, tD]}>
      <Photo src="vid/molinete.mp4" video t={T} t0={t0} span={7} zoom={[1.04, 1.14]} dim={0.55} grade="cold" credit={CR.ia} />
      <At x={960} y={160} center>
        <B t={T} t0={t0 + 0.05} kind="fade"><Kicker t={T} t0={t0 + 0.05} size={28}>Un detalle</Kicker></B>
      </At>
      <At x={960} y={270} center>
        <Words t={T} t0={tP - 0.05} text="PARA ESTE PARTIDO" kind="slam" step={0.08} center style={{...big(110), whiteSpace: 'nowrap', textShadow: shadow}} />
      </At>
      <div style={{position: 'absolute', left: 160, top: 450, display: 'flex', alignItems: 'center', gap: 30}}>
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            {i > 0 ? <div style={{...big(80, M.white), opacity: prog(T, s.t - 0.1, 0.3)}}>→</div> : null}
            <B t={T} t0={s.t - 0.1} kind="pop">
              <div style={{width: 460, height: 250, borderRadius: 26, background: 'rgba(10,18,42,0.85)', border: `3px solid ${s.col}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8, boxShadow: `0 0 50px ${s.col}33`}}>
                <div style={{...body(22, s.col, 900), letterSpacing: 6}}>{s.top}</div>
                <div style={{...big(s.label.length > 8 ? 62 : 80), whiteSpace: 'nowrap'}}>{s.label}</div>
                <div style={{...body(28, M.mute, 700)}}>{s.sub}</div>
              </div>
            </B>
          </React.Fragment>
        ))}
      </div>
      <At x={1350} y={830} center>
        <B t={T} t0={tD - 0.15} kind="up"><Pill bg={M.green} fg={M.night} size={46}>✓ ES LA QUE TE DEJA PASAR</Pill></B>
      </At>
      <Src t={T} t0={tTu} text="La Nación (24/09/2026): la compra online asigna un turno para retirar la entrada física" />
    </Cam>
  );
};

export const S09c: React.FC<SceneP> = ({T, t0}) => {
  const tAl = c('s09', 'alguien'), tPdf = c('s09', 'PDF'), tCap = c('s09', 'captura'), tD = c('s09', 'desconfiá.');
  const bubble = (t1: number, children: React.ReactNode, me = false) => (
    <div style={{alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: 300, background: me ? '#D9F2E3' : '#FFFFFF', borderRadius: 18, padding: '12px 16px', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', opacity: prog(T, t1, 0.25), transform: `translateY(${(1 - prog(T, t1, 0.35)) * 20}px)`}}>{children}</div>
  );
  const fileCard = (t1: number, name: string, kind: string) => (
    <div style={{position: 'relative'}}>
      {bubble(t1, (
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <div style={{width: 54, height: 66, borderRadius: 8, background: kind === 'PDF' ? '#E5484D' : '#5B8DEF', display: 'flex', justifyContent: 'center', alignItems: 'center', ...body(16, M.white, 900)}}>{kind}</div>
          <div><div style={{...body(20, M.ink, 800)}}>{name}</div><div style={{...body(16, M.mute, 600)}}>{kind === 'PDF' ? '1 página · 212 KB' : 'imagen · 480 KB'}</div></div>
        </div>
      ))}
      {T > t1 + 0.35 ? (
        <div style={{position: 'absolute', left: 90, top: -8, ...big(96, M.red), transform: `scale(${clamp(pop(T, t1 + 0.35, 1.4))})`, textShadow: '0 4px 14px rgba(0,0,0,0.3)'}}>✕</div>
      ) : null}
    </div>
  );
  return (
    <Night t={T} glow="rgba(255,59,78,0.22)" beams={0.4}>
      <Cam t={T} punches={[tPdf, tCap, tD]}>
        <div style={{position: 'absolute', left: 250, top: 90}}>
          <B t={T} t0={t0 + 0.05} kind="up">
            <Phone w={440}>
              <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 120, background: '#1F2C34', display: 'flex', alignItems: 'flex-end', padding: '0 24px 16px', gap: 14}}>
                <div style={{width: 46, height: 46, borderRadius: 23, background: '#8E9BB8'}} />
                <div><div style={{...body(22, M.white, 800)}}>Vendo entradas</div><div style={{...body(15, '#9FB3C0', 600)}}>en línea</div></div>
              </div>
              <div style={{position: 'absolute', left: 0, right: 0, top: 120, bottom: 0, background: '#ECE5DD', padding: '24px 18px', display: 'flex', flexDirection: 'column', gap: 16}}>
                {bubble(tAl - 0.2, <div style={{...body(21, M.ink, 600)}}>Tengo 2 para Argentina-Benín. Te paso el PDF</div>)}
                {fileCard(tPdf - 0.1, 'entrada_argentina.pdf', 'PDF')}
                {fileCard(tCap - 0.1, 'captura_entrada.jpg', 'JPG')}
              </div>
            </Phone>
          </B>
        </div>
        <At x={880} y={250}>
          <Words t={T} t0={tAl - 0.1} text="¿Te ofrecen un PDF o una captura?" step={0.08} hi={['PDF', 'captura?']} hiColor={M.gold} style={{...big(100), width: 900}} />
        </At>
        <At x={1320} y={760} center>
          <Stamp t={T} t0={tD - 0.05} text="DESCONFIÁ" size={150} rot={-6} />
        </At>
      </Cam>
    </Night>
  );
};

/* ============================== s10 · el veredicto ============================== */
const MONTAGE = ['fest01.jpg', 'egy178.jpg', 'fest03.jpg', 'isl2018.jpg', 'laplata.jpg', 'egy302.jpg', 'fest05.jpg', 'esp090.jpg'];

export const S10a: React.FC<SceneP> = ({T, t0}) => {
  const t8 = c('s10', 'ochenta'), tNo = c('s10', 'no alcanzan'), tV = c('s10', 'veinte');
  if (T < tV - 0.15) {
    return (
      <Cam t={T} punches={[t8, tNo]}>
        <Photo src="mon_pano2.jpg" t={T} t0={t0} span={6} zoom={[1.1, 1.22]} focus="50% 55%" dim={0.45} credit={CR.mon_pano2} />
        <At x={960} y={250} center>
          <Words t={T} t0={t0 + 0.1} text="¿Por qué ver a Messi cuesta 3 millones?" step={0.07} center hi={['3', 'millones?']} hiColor={M.gold} style={{...big(96), whiteSpace: 'nowrap', textShadow: shadow}} />
        </At>
        <At x={960} y={560} center>
          <B t={T} t0={t8 - 0.1} kind="zoom"><div style={{display: 'flex', alignItems: 'baseline', gap: 30}}><Gold t={T} size={220}><Num t={T} t0={t8 - 0.1} dur={1} to={85000} /></Gold><div style={{...big(90)}}>LUGARES</div></div></B>
        </At>
        <At x={960} y={800} center>
          <Stamp t={T} t0={tNo - 0.05} text="NO ALCANZAN" size={110} rot={-4} />
        </At>
      </Cam>
    );
  }
  const d = T - (tV - 0.15);
  const idx = Math.min(MONTAGE.length - 1, Math.floor(d / 0.19));
  return (
    <AbsoluteFill style={{background: M.night}}>
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <Img src={img(MONTAGE[idx])} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.12 - ((d % 0.19) / 0.19) * 0.06})`, filter: 'contrast(1.08) saturate(1.1)'}} />
        <AbsoluteFill style={{background: 'rgba(5,10,23,0.35)'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <Slam t={T} t0={tV - 0.1} size={200}><span style={{textShadow: '0 10px 60px rgba(0,0,0,0.8)'}}>20 AÑOS</span></Slam>
        <B t={T} t0={tV + 0.3} kind="up"><div style={{...big(96, M.celesteHi), textShadow: shadow, marginTop: 10}}>DE RECUERDOS</div></B>
      </AbsoluteFill>
      <Credit text="Fotos: Iro Bosero, Bryan Berlin, Voltmetro, Mikelzubi · CC BY-SA 4.0" />
    </AbsoluteFill>
  );
};

export const S10b: React.FC<SceneP> = ({T, t0}) => {
  const tO = c('s10', 'El precio'), tA = c('s10', 'AFA.'), tR = c('s10', 'La reventa'), tM = c('s10', 'millones'), tG = c('s10', 'gracias');
  const col = (t1: number, children: React.ReactNode, border: string) => (
    <B t={T} t0={t1} kind="up">
      <div style={{width: 760, height: 560, borderRadius: 30, background: 'rgba(10,18,42,0.82)', border: `3px solid ${border}`, padding: '46px 50px', boxShadow: '0 40px 90px rgba(0,0,0,0.5)'}}>{children}</div>
    </B>
  );
  return (
    <Cam t={T} punches={[tR, tG]} drift={0.6}>
      <Photo src="fest04_blur.jpg" t={T} t0={t0} span={9} zoom={[1.05, 1.12]} dim={0.55} />
      <div style={{position: 'absolute', left: 150, top: 250}}>
        {col(tO - 0.15, (
          <>
            <div style={{...body(30, M.celeste), letterSpacing: 8}}>PRECIO OFICIAL</div>
            <div style={{...big(150), marginTop: 20}}>$90.000</div>
            <div style={{height: 4, width: 120, background: M.celeste, margin: '34px 0'}} />
            <div style={{...body(42, M.white, 700), opacity: prog(T, c('s10', 'cuánto decidió') - 0.1, 0.4)}}>Lo que decidió cobrar <span style={{color: M.celeste}}>la AFA</span></div>
          </>
        ), M.celeste)}
      </div>
      <div style={{position: 'absolute', left: 1010, top: 250}}>
        {col(tR - 0.15, (
          <>
            <div style={{...body(30, M.red), letterSpacing: 8}}>REVENTA</div>
            <div style={{...body(42, M.white, 700), marginTop: 26}}>Lo que vale, para <span style={{color: M.gold, opacity: prog(T, tM - 0.1, 0.3)}}>millones de argentinos</span>,</div>
            <div style={{...body(42, M.white, 700), marginTop: 8, opacity: prog(T, c('s10', 'decirle') - 0.1, 0.3)}}>decirle</div>
            <div style={{marginTop: 18}}>{T > tG - 0.1 ? <Slam t={T} t0={tG - 0.1} size={140}><Gold t={T} size={140}>GRACIAS</Gold></Slam> : null}</div>
            <div style={{...body(42, M.white, 700), marginTop: 10, opacity: prog(T, c('s10', 'en persona.') - 0.05, 0.3)}}>en persona.</div>
          </>
        ), M.red)}
      </div>
      {T > tA ? (
        <At x={960} y={530} center>
          <svg width="90" height="90" viewBox="0 0 90 90" style={{opacity: prog(T, tR - 0.2, 0.3), filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.7))'}}>
            <rect x="10" y="26" width="70" height="10" rx="5" fill={M.white} /><rect x="10" y="54" width="70" height="10" rx="5" fill={M.white} />
            <rect x="40" y="6" width="10" height="78" rx="5" fill={M.red} transform="rotate(30 45 45)" />
          </svg>
        </At>
      ) : null}
      <Credit text={CR.fest} />
    </Cam>
  );
};

export const S10c: React.FC<SceneP> = ({T, t0}) => {
  const tT = c('s10', 'termina'), tB = c('s10', 'bolsillo'), tE = c('s10', 'equivocado.');
  return (
    <Night t={T} glow="rgba(255,59,78,0.3)" beams={0.4}>
      <Cam t={T} punches={[tB, tE]}>
        <At x={960} y={170} center>
          <Words t={T} t0={t0 + 0.05} text="Y esa diferencia, casi siempre…" step={0.08} center style={{...body(60, M.celesteHi, 700), whiteSpace: 'nowrap'}} />
        </At>
        <div style={{position: 'absolute', left: 260, top: 420}}>
          <B t={T} t0={t0 + 0.1} kind="left"><Ticket t={T} t0={t0 + 0.1} w={560} rot={-4} sway={0.4} /></B>
        </div>
        <div style={{position: 'absolute', left: 1330, top: 360, filter: 'drop-shadow(0 0 40px rgba(255,59,78,0.6))', transform: `scale(${0.6 + 0.4 * clamp(pop(T, t0 + 0.4))})`}}>
          <Reseller w={300} />
        </div>
        <Bills T={T} t0={t0 + 0.6} x0={700} y0={520} x1={1430} y1={520} n={14} />
        <At x={960} y={900} center>
          {T > tT - 0.1 ? (
            <div style={{display: 'flex', alignItems: 'baseline', gap: 28, whiteSpace: 'nowrap'}}>
              <Words t={T} t0={tT - 0.1} text="TERMINA EN EL BOLSILLO" kind="slam" step={0.07} style={{...big(96)}} />
              <Slam t={T} t0={tE - 0.05} size={120} color={M.red}>EQUIVOCADO</Slam>
            </div>
          ) : null}
        </At>
      </Cam>
    </Night>
  );
};

/* ============================== s11 · cierre ============================== */
const Cursor: React.FC<{size?: number}> = ({size = 60}) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 20 28"><path d="M2 2 L2 22 L7 17 L11 26 L14 25 L10 16 L17 16 Z" fill="#FFFFFF" stroke="#000" strokeWidth="1.6" strokeLinejoin="round" /></svg>
);

export const S11: React.FC<SceneP> = ({T, t0}) => {
  const tQ = c('s11', '¿cuánto'), tD = c('s11', 'Dejalo'), tS = c('s11', 'suscribite'), tC = c('s11', 'Contexto:'), tA = c('s11', 'acá');
  const total = end('s11') + 5.5;
  const click = tS + 0.45;
  const subbed = T > click;
  const cx = 1500 + (1290 - 1500) * easeInOut(clamp((T - tS + 0.2) / 0.6)), cy = 1000 + (830 - 1000) * easeInOut(clamp((T - tS + 0.2) / 0.6));
  const outro = prog(T, tA + 2.4, 0.8);
  const typed = 'Yo pagaría lo que sea por verlo una vez más';
  const nType = Math.floor(clamp((T - tD - 0.3) / 1.6) * typed.length);
  const fadeOut = clamp((T - (total - 1.0)) / 1.0);
  return (
    <AbsoluteFill style={{background: M.night}}>
      <AbsoluteFill style={{opacity: 1 - fadeOut}}>
        <Cam t={T} push={[t0, total, 1.0, 1.1]} ox={60} oy={40}>
          <Photo src="egy218.jpg" t={T} t0={t0} span={total - t0} zoom={[1.02, 1.08]} focus="60% 40%" dim={0.35 + 0.3 * outro} credit={CR.bb} />
          <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(5,10,23,0.9) 0%, rgba(5,10,23,0.1) 60%)', opacity: 1 - outro}} />
          <div style={{opacity: 1 - outro}}>
            <At x={130} y={170} w={900}>
              <Words t={T} t0={t0 + 0.1} text="Y vos," step={0.1} style={{...body(56, M.celesteHi, 700)}} />
              <div style={{height: 10}} />
              <Words t={T} t0={tQ - 0.05} text="¿cuánto pagarías por estar el 6 de octubre?" step={0.07} hi={['6', 'octubre?']} hiColor={M.gold} style={{...big(104)}} />
            </At>
            <At x={130} y={640}>
              <B t={T} t0={tD - 0.1} kind="up">
                <div style={{width: 820, background: 'rgba(255,255,255,0.96)', borderRadius: 20, padding: '22px 28px', display: 'flex', gap: 20, alignItems: 'center', boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}}>
                  <div style={{width: 64, height: 64, borderRadius: 32, background: M.celesteDeep, flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', ...big(34, M.white)}}>A</div>
                  <div style={{flex: 1}}>
                    <div style={{...body(20, M.ink2, 800)}}>Agregá un comentario…</div>
                    <div style={{...body(30, M.ink, 600), marginTop: 4, minHeight: 36}}>{typed.slice(0, nType)}<span style={{opacity: Math.floor(T * 3) % 2 ? 1 : 0, color: M.celesteDeep}}>|</span></div>
                  </div>
                </div>
              </B>
            </At>
            <At x={1150} y={790}>
              <B t={T} t0={tS - 0.3} kind="pop">
                <div style={{display: 'flex', alignItems: 'center', gap: 18, background: subbed ? '#E3E6EC' : '#FF0033', color: subbed ? M.ink : M.white, padding: '20px 40px', borderRadius: 40, ...body(40, subbed ? M.ink : M.white, 900), letterSpacing: 2, transform: `scale(${T > click && T < click + 0.2 ? 0.92 : 1})`, boxShadow: '0 20px 40px rgba(0,0,0,0.4)'}}>
                  {subbed ? '✓ SUSCRIPTO' : 'SUSCRIBITE'}
                </div>
              </B>
            </At>
            {T > tS - 0.2 && T < tC + 1.2 ? <div style={{position: 'absolute', left: cx + 30, top: cy + 20}}><Cursor /></div> : null}
          </div>
        </Cam>
        {/* logo y firma */}
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', opacity: outro}}>
          <Img src={staticFile('brand/logo_transparente.png')} style={{height: 220, transform: `scale(${0.9 + 0.1 * outro})`}} />
          <div style={{...body(40, M.white, 700), marginTop: 30, letterSpacing: 2}}>Lo que está pasando, sin vueltas.</div>
          <Stripes w={360} h={8} n={7} style={{borderRadius: 4, overflow: 'hidden', marginTop: 30}} />
        </AbsoluteFill>
        {T > tC - 0.1 && outro < 1 ? (
          <At x={1560} y={220} center>
            <div style={{opacity: prog(T, tC - 0.1, 0.4) * (1 - outro), transform: `scale(${0.7 + 0.3 * clamp(pop(T, tC - 0.1))})`}}>
              <Img src={staticFile('brand/logo_transparente.png')} style={{height: 150}} />
            </div>
          </At>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
