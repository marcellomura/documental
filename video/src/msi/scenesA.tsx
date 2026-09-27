/* Escenas 1–5: el gancho, el partido, la fila, la cuenta y por qué no la cobran más cara */
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {
  M, FONT, W, H, At, B, Cam, Glass, Gold, Kicker, Night, Num, Photo, Pill, Sheet, Slam, Src, Stamp, Stripes, Ticket, Browser, Phone, StadiumIcon, Words, Motes, Credit,
  clamp, easeInOut, easeOut, fmt, img, pop, prog, rnd,
} from './kit';
import {c, at, end, k, CR} from './lib';

export type SceneP = {T: number; t0: number};

const big = (size: number, color: string = M.white): React.CSSProperties => ({fontFamily: FONT.head, fontSize: size, color, lineHeight: 0.95, letterSpacing: 1});
const body = (size: number, color: string = M.white, weight = 800): React.CSSProperties => ({fontFamily: FONT.body, fontWeight: weight, fontSize: size, color, lineHeight: 1.15});

/* ============================== s01 · el gancho ============================== */
export const S01a: React.FC<SceneP> = ({T}) => (
  <Cam t={T} punches={[0.45]}>
    <Photo src="egy112.jpg" t={T} t0={0} span={3} zoom={[1.2, 1.08]} focus="50% 28%" dim={0.5} grade="cold" credit={CR.bb} />
    <At x={960} y={500} center>
      <Slam t={T} t0={0.42} size={300}><Gold t={T} size={300}>$90.000</Gold></Slam>
    </At>
    <At x={960} y={720} center>
      <B t={T} t0={1.05} kind="up"><div style={{...body(40), letterSpacing: 14, whiteSpace: 'nowrap', textShadow: '0 4px 20px rgba(0,0,0,0.6)'}}>LA ENTRADA MÁS BARATA</div></B>
    </At>
  </Cam>
);

export const S01b: React.FC<SceneP> = ({T, t0}) => {
  const t6 = c('s01', 'seiscientos'), t3 = c('s01', 'tres millones');
  return (
    <Night t={T}>
      <Cam t={T} punches={[t6, t3]}>
        <At x={960} y={150} center>
          <Kicker t={T} t0={c('s01', 'Messi') - 0.1} size={24}>Argentina vs Benín · el último partido de Messi</Kicker>
        </At>
        <At x={960} y={470} center>
          <Ticket t={T} t0={t0 + 0.05} w={900} strikeAt={t6 - 0.1} resale="$688.159" resaleAt={t6 + 0.15} rot={-3} />
        </At>
        <At x={960} y={790} center>
          <B t={T} t0={c('s01', 'Al día') - 0.05} t1={t3 - 0.3} kind="pop"><Pill bg={M.white} size={30}>24 HORAS DESPUÉS · EN VIAGOGO</Pill></B>
        </At>
        {T > t6 + 0.4 ? (
          <At x={1600} y={780} center>
            <B t={T} t0={t6 + 0.5} t1={t3 - 0.3} kind="pop"><div style={{...big(120, M.red), textShadow: '0 10px 40px rgba(255,59,78,0.4)'}}>×7,6</div></B>
          </At>
        ) : null}
        <At x={960} y={880} center>
          <B t={T} t0={t3 - 0.05} kind="up">
            <div style={{display: 'flex', alignItems: 'center', gap: 26, background: 'rgba(179,18,42,0.92)', padding: '18px 40px', borderRadius: 20, boxShadow: '0 30px 60px rgba(255,59,78,0.35)'}}>
              <div style={{...body(28), letterSpacing: 6}}>LAS MEJORES UBICACIONES</div>
              <Gold t={T} size={84}>+$3.300.000</Gold>
            </div>
          </B>
        </At>
      </Cam>
      <Src t={T} t0={t6} text="Precios oficiales: AFA/Deportick · Reventa: Viagogo, relevado por Voces Críticas (25/09/2026)" />
    </Night>
  );
};

export const S01d: React.FC<SceneP> = ({T, t0}) => {
  const q2 = c('s01', '¿Por');
  const dim1 = 1 - 0.55 * prog(T, q2, 0.4);
  return (
    <Cam t={T} punches={[c('s01', 'diferencia?'), c('s01', 'AFA')]}>
      <Photo src="mon_cc0.jpg" t={T} t0={t0} span={5} zoom={[1.08, 1.2]} dim={0.62} grade="cold" credit={CR.mon_cc0} />
      <At x={150} y={300} w={1620}>
        <div style={{opacity: dim1}}>
          <Words t={T} t0={t0 + 0.1} text="¿Quién se queda con esa diferencia?" hi={['diferencia?']} hiColor={M.gold} step={0.08} style={{...big(104)}} />
        </div>
        <div style={{height: 60}} />
        <Words t={T} t0={q2} text="¿Por qué la AFA no las cobró más caras?" hi={['AFA', 'caras?']} hiColor={M.celeste} step={0.08} style={{...big(104)}} />
      </At>
    </Cam>
  );
};

export const S01e: React.FC<SceneP> = ({T, t0}) => (
  <Cam t={T} punches={[c('s01', 'Spoiler:')]}>
    <Photo src="vid/celular.mp4" video t={T} t0={t0} span={5} zoom={[1.05, 1.12]} dim={0.3} grade="cold" credit={CR.ia} />
    <At x={140} y={260} w={1100}>
      <Words t={T} t0={t0 + 0.1} text="Y si vos te quedaste afuera…" step={0.07} style={{...body(56, M.celesteHi, 700)}} />
    </At>
    <At x={140} y={360} w={1300}>
      <Words t={T} t0={c('s01', '¿fue')} text="¿Fue mala suerte?" kind="slam" step={0.1} style={{...big(170)}} />
    </At>
    <At x={620} y={760} center>
      <Stamp t={T} t0={c('s01', 'no del') - 0.05} text="NO DEL TODO" sub="SPOILER" size={120} rot={-6} />
    </At>
  </Cam>
);

/* ------------------------------ título ------------------------------ */
export const Title: React.FC<SceneP> = ({T, t0}) => (
  <Cam t={T} punches={[t0 + 0.2]}>
    <Photo src="vid/estadio_aereo.mp4" video t={T} t0={t0} span={3.5} zoom={[1.06, 1.14]} focus="50% 65%" dim={0.55} credit={CR.ia} />
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
      <B t={T} t0={t0 + 0.1} kind="fade"><Stripes w={420} h={10} n={7} style={{borderRadius: 5, overflow: 'hidden', marginBottom: 34}} /></B>
      <Words t={T} t0={t0 + 0.15} text="¿POR QUÉ VER A MESSI" kind="slam" step={0.06} center style={{...big(150), textShadow: '0 10px 50px rgba(0,0,0,0.6)'}} />
      <div style={{display: 'flex', gap: 36, alignItems: 'baseline', marginTop: 12}}>
        <Words t={T} t0={t0 + 0.45} text="CUESTA" kind="slam" center style={{...big(150)}} />
        <Slam t={T} t0={t0 + 0.6} size={190}><Gold t={T} size={190}>$3 MILLONES?</Gold></Slam>
      </div>
    </AbsoluteFill>
  </Cam>
);

/* ------------------------------ capítulos ------------------------------ */
export const Chapter: React.FC<{T: number; t0: number; t1: number; num: string; title: string; sub: string; bg: string}> = ({T, t0, t1, num, title, sub, bg}) => {
  const kk = prog(T, t0, 0.6);
  const out = clamp((T - (t1 - 0.3)) / 0.3);
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <Photo src={bg} t={T} t0={t0} span={t1 - t0 + 1} zoom={[1.12, 1.02]} dim={0.5} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(5,10,23,0.9) 0%, rgba(5,10,23,0.4) 60%, rgba(5,10,23,0.1) 100%)'}} />
      <div style={{position: 'absolute', left: 150, top: 330}}>
        <div style={{...body(30, M.celeste), letterSpacing: 18, opacity: kk, transform: `translateX(${(1 - kk) * -40}px)`}}>{num ? `CAPÍTULO ${num}` : 'FINAL'}</div>
        <div style={{width: 520 * easeInOut(clamp((T - t0 - 0.1) / 0.6)), height: 8, marginTop: 26, marginBottom: 26, overflow: 'hidden', borderRadius: 4}}>
          <Stripes w={520} h={8} n={7} />
        </div>
        <div style={{...big(230), opacity: prog(T, t0 + 0.15, 0.4), transform: `translateY(${(1 - prog(T, t0 + 0.15, 0.6)) * 60}px) scale(${1.06 - 0.06 * prog(T, t0 + 0.15, 1.4)})`, transformOrigin: 'left', whiteSpace: 'nowrap'}}>{title}</div>
        <div style={{...body(40, 'rgba(255,255,255,0.85)', 600), marginTop: 24, opacity: prog(T, t0 + 0.45, 0.5)}}>{sub}</div>
      </div>
    </AbsoluteFill>
  );
};

/* ============================== s02 · el partido ============================== */
const FlagARG: React.FC<{w: number}> = ({w}) => (
  <div style={{width: w, height: w * 0.63, borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.35)'}}>
    <div style={{flex: 1, background: M.celeste}} />
    <div style={{flex: 1, background: M.white, display: 'flex', justifyContent: 'center', alignItems: 'center'}}><div style={{width: w * 0.17, height: w * 0.17, borderRadius: '50%', background: '#F6B40E', boxShadow: '0 0 0 3px #85340A inset'}} /></div>
    <div style={{flex: 1, background: M.celeste}} />
  </div>
);
const FlagBEN: React.FC<{w: number}> = ({w}) => (
  <div style={{width: w, height: w * 0.63, borderRadius: 8, overflow: 'hidden', display: 'flex', boxShadow: '0 10px 30px rgba(0,0,0,0.35)'}}>
    <div style={{width: '40%', background: '#008751'}} />
    <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}><div style={{flex: 1, background: '#FCD116'}} /><div style={{flex: 1, background: '#E8112D'}} /></div>
  </div>
);

export const S02a: React.FC<SceneP> = ({T, t0}) => {
  const tMon = c('s02', 'Monumental.'), tArg = c('s02', 'Argentina'), tP = c('s02', 'puesto');
  return (
    <Cam t={T} punches={[at('s02'), tMon, tArg]}>
      <Photo src="mon_cc0.jpg" t={T} t0={t0} span={7} zoom={[1.04, 1.16]} dim={0.35} credit={CR.mon_cc0} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(5,10,23,0.75) 0%, rgba(5,10,23,0.1) 70%)'}} />
      <At x={130} y={200}>
        <Slam t={T} t0={at('s02')} size={170}>6 DE OCTUBRE</Slam>
        <div style={{height: 14}} />
        <B t={T} t0={tMon - 0.05} kind="left"><div style={{...big(120, M.celeste)}}>MONUMENTAL · 20 H</div></B>
      </At>
      <At x={130} y={560}>
        <B t={T} t0={tArg - 0.05} kind="up">
          <Glass w={1000} style={{display: 'flex', alignItems: 'center', gap: 34, padding: '30px 40px'}}>
            <FlagARG w={130} />
            <div style={{...big(84)}}>ARGENTINA</div>
            <div style={{...body(40, M.celeste, 900)}}>vs</div>
            <div style={{...big(84)}}>BENÍN</div>
            <FlagBEN w={130} />
          </Glass>
        </B>
      </At>
      <At x={130} y={790}>
        <B t={T} t0={tP - 0.1} kind="pop"><Pill bg={M.gold} size={34}>BENÍN · PUESTO 93 DEL RANKING FIFA</Pill></B>
      </At>
      <Src t={T} t0={tP} text="Ranking FIFA (septiembre 2026) · AFA" />
    </Cam>
  );
};

export const S02b: React.FC<SceneP> = ({T, t0}) => {
  const tN = c('s02', 'número'), tU = c('s02', 'último.');
  return (
    <Cam t={T} punches={[tN, tU]}>
      <Photo src="egy287.jpg" t={T} t0={t0} span={7} zoom={[1.1, 1.22]} focus="45% 35%" dim={0.25} credit={CR.bb} />
      <AbsoluteFill style={{background: 'linear-gradient(270deg, rgba(5,10,23,0.85) 0%, rgba(5,10,23,0.2) 60%)'}} />
      <At x={1180} y={180} w={660}>
        <Words t={T} t0={t0 + 0.1} text="El partido no es el partido." step={0.08} style={{...body(52, M.white, 800)}} />
      </At>
      <At x={1180} y={330}>
        <B t={T} t0={tN - 0.1} kind="zoom">
          <div style={{...big(330, M.white), textShadow: '0 20px 60px rgba(0,0,0,0.5)'}}><Num t={T} t0={tN - 0.1} dur={1.2} from={1} to={208} /></div>
          <div style={{...body(30, M.celeste), letterSpacing: 8, marginTop: 6}}>PARTIDOS CON LA SELECCIÓN</div>
        </B>
      </At>
      <At x={1500} y={880} center>
        <Stamp t={T} t0={tU - 0.05} text="Y EL ÚLTIMO" size={96} color={M.white} rot={-5} bg="rgba(255,59,78,0.85)" />
      </At>
    </Cam>
  );
};

export const S02c: React.FC<SceneP> = ({T, t0}) => (
  <Cam t={T} punches={[c('s02', '«Me')]} drift={0.6}>
    <Photo src="esp222.jpg" t={T} t0={t0} span={5} zoom={[1.08, 1.18]} focus="30% 60%" dim={0.45} grade="cold" credit={CR.bb} />
    <AbsoluteFill style={{background: 'linear-gradient(270deg, rgba(5,10,23,0.92) 10%, rgba(5,10,23,0.2) 70%)'}} />
    <At x={900} y={260} w={900}>
      <Kicker t={T} t0={t0 + 0.1} size={24}>31 de agosto de 2026</Kicker>
      <div style={{height: 40}} />
      <div style={{position: 'relative'}}>
        <div style={{position: 'absolute', left: -80, top: -90, fontFamily: FONT.serif, fontSize: 260, color: M.celeste, opacity: prog(T, c('s02', '«Me') - 0.2, 0.4)}}>“</div>
        <Words t={T} t0={c('s02', '«Me') - 0.05} text="Me vacié, ya no tengo más para dar." step={0.1} hi={['vacié,']} hiColor={M.celesteHi} style={{fontFamily: FONT.serif, fontStyle: 'italic', fontWeight: 700, fontSize: 92, color: M.white, lineHeight: 1.08}} />
      </div>
      <B t={T} t0={c('s02', 'dar».') - 0.2} kind="left">
        <div style={{...body(30, M.mute, 600), marginTop: 34}}><span style={{color: M.white, fontWeight: 800}}>Lionel Messi</span> · al anunciar su retiro de la Selección</div>
      </B>
    </At>
    <Src t={T} t0={t0 + 0.5} text="Carta de Messi en Instagram, citada por La Nación (31/08/2026)" />
  </Cam>
);

export const S02d: React.FC<SceneP> = ({T, t0}) => {
  const tE = c('s02', 'echaron');
  const lineK = easeInOut(clamp((T - t0 - 0.2) / 1.4));
  return (
    <Night t={T} beams={0.6}>
      <Cam t={T} punches={[tE]}>
        <At x={960} y={240} center>
          <Slam t={T} t0={t0 + 0.05} size={210}>20 AÑOS</Slam>
        </At>
        {/* línea de tiempo */}
        <div style={{position: 'absolute', left: 260, top: 560, width: 1400 * lineK, height: 6, background: `linear-gradient(90deg, ${M.red}, ${M.celeste})`, borderRadius: 3}} />
        {[
          {x: 260, y: '2005', txt: 'DEBUT · vs HUNGRÍA', col: M.red, t: t0 + 0.3},
          {x: 1660, y: '2026', txt: 'EL ÚLTIMO · vs BENÍN', col: M.celeste, t: t0 + 1.4},
        ].map((p) => (
          <div key={p.y} style={{position: 'absolute', left: p.x, top: 563, transform: 'translate(-50%, -50%)'}}>
            <div style={{width: 34, height: 34, borderRadius: 17, background: p.col, boxShadow: `0 0 30px ${p.col}`, transform: `scale(${pop(T, p.t)})`}} />
            <div style={{position: 'absolute', left: '50%', top: 50, transform: 'translateX(-50%)', textAlign: 'center', opacity: prog(T, p.t, 0.4), whiteSpace: 'nowrap'}}>
              <div style={{...big(96)}}>{p.y}</div>
              <div style={{...body(26, p.col), letterSpacing: 5, marginTop: 6}}>{p.txt}</div>
            </div>
          </div>
        ))}
        {/* tarjeta roja */}
        {T > tE - 0.1 ? (
          <div style={{position: 'absolute', left: 520, top: 350, transform: `rotate(${-12 + 6 * (1 - clamp(pop(T, tE - 0.1)))}deg) scale(${0.3 + 0.7 * clamp(pop(T, tE - 0.1, 1.3))})`}}>
            <div style={{width: 150, height: 210, background: M.red, borderRadius: 14, boxShadow: '0 30px 60px rgba(255,59,78,0.5)'}} />
          </div>
        ) : null}
        <At x={760} y={390}>
          <B t={T} t0={tE + 0.1} kind="left">
            <div style={{...body(38)}}>Expulsado a <span style={{color: M.red}}>menos de un minuto</span></div>
            <div style={{...body(38)}}>de haber entrado</div>
          </B>
        </At>
      </Cam>
      <Src t={T} t0={tE} text="Debut: 17/08/2005, Hungría 1 - Argentina 2 (Budapest)" />
    </Night>
  );
};

/* ============================== s03 · la fila ============================== */
const Clock: React.FC<{T: number; from: number; to: number; t0: number; t1: number; size?: number; color?: string}> = ({T, from, to, t0, t1, size = 260, color = M.white}) => {
  const m = from + (to - from) * easeInOut(clamp((T - t0) / (t1 - t0)));
  const hh = Math.floor(m / 60), mm = Math.floor(m % 60);
  const blink = Math.floor(T * 2) % 2 === 0;
  return (
    <div style={{fontFamily: FONT.mono, fontWeight: 800, fontSize: size, color, letterSpacing: -4, lineHeight: 1, textShadow: `0 0 40px ${color}55`, whiteSpace: 'nowrap'}}>
      {String(hh).padStart(2, '0')}<span style={{opacity: blink ? 1 : 0.25}}>:</span>{String(mm).padStart(2, '0')}
    </div>
  );
};

const ShopPage: React.FC<{T: number; t0: number; fake?: boolean; banner?: number}> = ({T, t0, fake, banner}) => (
  <AbsoluteFill style={{background: '#F3F6FB'}}>
    <div style={{height: 84, background: fake ? '#1C5FA8' : '#1E63AE', display: 'flex', alignItems: 'center', padding: '0 34px', gap: 18}}>
      <div style={{width: 44, height: 44, borderRadius: 10, background: M.white, opacity: 0.9}} />
      <div style={{...body(30, M.white, 800)}}>Entradas · Argentina vs Benín</div>
    </div>
    <div style={{position: 'absolute', left: 40, top: 130}}>
      <Ticket t={T} t0={t0} w={560} sway={0.3} rot={0} />
    </div>
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

export const S03a: React.FC<SceneP> = ({T, t0}) => {
  const tAbre = c('s03', 'Se abre'), tMax = c('s03', 'Máximo');
  return (
    <Night t={T}>
      <Cam t={T} punches={[tAbre, tMax]}>
        <At x={120} y={250}>
          <Kicker t={T} t0={t0 + 0.05} size={26}>Jueves 24 de septiembre</Kicker>
          <div style={{height: 26}} />
          <B t={T} t0={t0 + 0.1} kind="blur"><Clock T={T} from={17 * 60 + 59} to={18 * 60} t0={c('s03', 'seis') - 0.2} t1={c('s03', 'seis') + 0.1} size={190} /></B>
          <B t={T} t0={tAbre} kind="left"><div style={{...body(40, M.green, 900), letterSpacing: 8, marginTop: 20}}>● SE ABRE LA VENTA</div></B>
        </At>
        <At x={860} y={200}>
          <B t={T} t0={tAbre - 0.05} kind="up">
            <Browser url="deportick.com/argentina-benin" w={1000} h={560}>
              <ShopPage T={T} t0={tAbre + 0.2} />
            </Browser>
          </B>
        </At>
        <At x={1300} y={850} center>
          <B t={T} t0={tMax - 0.05} kind="pop">
            <div style={{display: 'flex', alignItems: 'center', gap: 22, background: M.gold, padding: '16px 34px', borderRadius: 18, boxShadow: '0 20px 50px rgba(255,200,61,0.35)'}}>
              <div style={{...big(56, M.ink)}}>MÁXIMO 4</div>
              <div style={{...body(28, M.ink, 900)}}>ENTRADAS POR CUENTA</div>
            </div>
          </B>
        </At>
      </Cam>
      <Src t={T} t0={t0 + 0.3} text="Infobae y La Nación (24/09/2026)" />
    </Night>
  );
};

const Spinner: React.FC<{T: number; size: number; color?: string}> = ({T, size, color = M.celesteDeep}) => (
  <div style={{width: size, height: size, borderRadius: '50%', border: `${size * 0.1}px solid rgba(47,121,194,0.2)`, borderTopColor: color, transform: `rotate(${T * 400}deg)`}} />
);

export const S03b: React.FC<SceneP> = ({T, t0}) => {
  const tH = c('s03', 'en más');
  const bar = 0.03 + 0.05 * clamp((T - t0) / 5);
  return (
    <Cam t={T} punches={[tH]}>
      <Photo src="vid/celular.mp4" video t={T} t0={t0} startFrom={1.5} span={5} zoom={[1.15, 1.25]} focus="40% 40%" dim={0.5} grade="cold" credit={CR.ia} />
      <At x={130} y={300} w={900}>
        <Words t={T} t0={t0 + 0.1} text="A los pocos minutos…" step={0.08} style={{...body(56, M.celesteHi, 700)}} />
        <div style={{height: 24}} />
        <Words t={T} t0={tH - 0.2} text="MÁS DE UNA HORA" kind="slam" step={0.08} style={{...big(150)}} />
        <B t={T} t0={tH + 0.2} kind="left"><div style={{...body(36, M.white, 600), marginTop: 18}}>de espera para entrar a la página</div></B>
      </At>
      <At x={1250} y={90}>
        <B t={T} t0={t0 + 0.15} kind="right">
          <Phone w={440}>
            <div style={{position: 'absolute', inset: 0, padding: '120px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
              <Spinner T={T} size={110} />
              <div style={{...body(34, M.ink, 900), textAlign: 'center'}}>Estás en la fila virtual</div>
              <div style={{width: '100%', height: 18, borderRadius: 9, background: '#DCE3EE', overflow: 'hidden'}}><div style={{width: `${bar * 100}%`, height: '100%', background: M.celesteDeep}} /></div>
              <div style={{...body(24, M.ink2, 600), textAlign: 'center'}}>Tiempo estimado de espera</div>
              <div style={{...big(56, T > tH ? M.red : M.ink), textAlign: 'center', transform: `scale(${T > tH ? 1 + 0.08 * Math.exp(-(T - tH) * 5) : 1})`}}>{T > tH ? '+1 HORA' : 'calculando…'}</div>
              <div style={{...body(20, M.mute, 600), textAlign: 'center'}}>No cierres ni actualices esta página</div>
            </div>
          </Phone>
        </B>
      </At>
    </Cam>
  );
};

export const S03c: React.FC<SceneP> = ({T, t0}) => {
  const tN = c('s03', 'no quedaba');
  return (
    <Night t={T} glow="rgba(255,59,78,0.25)" beams={0.5}>
      <Cam t={T} punches={[tN]}>
        <At x={960} y={250} center><Kicker t={T} t0={t0 + 0.05} size={28} color={M.gold}>En menos de dos horas</Kicker></At>
        <At x={960} y={500} center>
          <Clock T={T} from={18 * 60} to={19 * 60 + 30} t0={t0 + 0.1} t1={tN - 0.1} size={300} color={T > tN ? M.red : M.white} />
        </At>
        <At x={960} y={800} center>
          <Stamp t={T} t0={tN - 0.02} text="AGOTADO" size={170} rot={-7} />
        </At>
      </Cam>
      <Src t={T} t0={t0 + 0.2} text="OneFootball: «entradas agotadas en 90 minutos» · La Nación (24/09/2026)" />
    </Night>
  );
};

export const S03d: React.FC<SceneP> = ({T, t0}) => {
  const tN = c('s03', 'ochenta'), tP = c('s03', 'una parte'), tS = c('s03', 'sponsors');
  return (
    <Cam t={T} punches={[tN, tP]}>
      <Photo src="river_avion.jpg" t={T} t0={t0} span={9} zoom={[1.02, 1.25]} focus="42% 45%" dim={0.35} credit={CR.river_avion} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(5,10,23,0.85) 0%, rgba(5,10,23,0.2) 60%, rgba(5,10,23,0) 100%)'}} />
      <At x={120} y={220}>
        <Kicker t={T} t0={t0 + 0.1} size={26}>Estadio Más Monumental</Kicker>
        <div style={{height: 20}} />
        <B t={T} t0={tN - 0.1} kind="zoom"><Gold t={T} size={250}><Num t={T} t0={tN - 0.1} dur={1.1} to={85018} /></Gold></B>
        <B t={T} t0={tN + 0.3} kind="left"><div style={{...body(44), letterSpacing: 10, marginTop: 8}}>LUGARES</div></B>
      </At>
      <At x={120} y={720}>
        <B t={T} t0={tP - 0.05} kind="up">
          <Glass w={880} style={{padding: '28px 36px'}}>
            <div style={{...body(38)}}>Una parte <span style={{color: M.red}}>ni siquiera salió a la venta</span></div>
            <div style={{display: 'flex', gap: 16, marginTop: 20, opacity: prog(T, tS - 0.1, 0.4)}}>
              <Pill bg={M.white}>SPONSORS</Pill><Pill bg={M.white}>INVITADOS</Pill>
            </div>
          </Glass>
        </B>
      </At>
      <Src t={T} t0={tN} text="River Plate: capacidad oficial 85.018 (2025) · OneFootball y La Gaceta (reserva de lugares)" />
    </Cam>
  );
};

export const S03e: React.FC<SceneP> = ({T, t0}) => {
  const t46 = c('s03', 'cuarenta'), tI = c('s03', 'idea:'), tE = c('s03', 'estar');
  const N = 541, cols = 34;
  const cw = 1680 / cols, ch = cw * 0.72;
  const fade = 1 - 0.7 * prog(T, tE - 0.1, 0.4);
  return (
    <Night t={T} beams={0.4} floor={false}>
      <Cam t={T} punches={[t46, tE]}>
        <div style={{position: 'absolute', left: 120, top: 250, opacity: fade}}>
          {Array.from({length: N}).map((_, i) => {
            const cx = (i % cols) * cw, cy = Math.floor(i / cols) * ch;
            const ti = i === 0 ? t0 + 0.15 : t46 + 0.05 + (i / N) * 1.6 + rnd(i) * 0.15;
            const s = clamp(pop(T, ti, 1.4));
            if (T < ti) return null;
            return <div key={i} style={{position: 'absolute', left: cx, top: cy, transform: `scale(${s})`}}><StadiumIcon w={cw * 0.86} hot={i === 0} o={i === 0 ? 1 : 0.9} /></div>;
          })}
        </div>
        <At x={120} y={110}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 28, opacity: fade}}>
            <B t={T} t0={t0 + 0.1} kind="left"><div style={{...body(34, M.celeste), letterSpacing: 4}}>1 MONUMENTAL</div></B>
            <B t={T} t0={t46 - 0.05} kind="left"><div style={{...body(34), letterSpacing: 4}}>vs <span style={{...big(80, M.gold)}}><Num t={T} t0={t46 - 0.05} dur={1.4} to={46000000} /></span> DE ARGENTINOS</div></B>
          </div>
        </At>
        <At x={960} y={960} center>
          <B t={T} t0={tI - 0.3} kind="up"><div style={{...body(40), whiteSpace: 'nowrap', opacity: fade, textShadow: '0 4px 20px rgba(0,0,0,0.8)'}}>= <span style={{color: M.gold}}>541 Monumentales</span> llenos</div></B>
        </At>
        <At x={960} y={540} center>
          <Slam t={T} t0={tE - 0.05} size={240}>ESTAR AHÍ.</Slam>
        </At>
      </Cam>
      <Src t={T} t0={t46} text="INDEC, Censo 2022 (46 millones) · cálculo propio: 46.000.000 / 85.018" />
    </Night>
  );
};

/* ============================== s04 · la cuenta ============================== */
// curva de demanda: precio (y) según cantidad (x), en coordenadas de pantalla
const DX0 = 300, DX1 = 1520, OY = 900;
const demandY = (x: number) => 190 + 690 * Math.pow(clamp((x - DX0) / (DX1 - DX0)), 0.55);
const SX = 720; // oferta rígida
const PY = 830; // precio oficial
const EQY = demandY(SX);
const QX = DX0 + (DX1 - DX0) * Math.pow((PY - 190) / 690, 1 / 0.55); // demanda al precio oficial

const Chart: React.FC<{T: number}> = ({T}) => {
  const tO = c('s04', 'oferta'), tD = c('s04', 'Cuando'), tP = c('s04', 'precio queda'), tF = c('s04', 'fila'), tA = c('s04', 'aparece'), tV = c('s04', 'vender');
  const dK = easeInOut(clamp((T - tD) / 1.2));
  const pts: string[] = [];
  for (let x = DX0; x <= DX0 + (DX1 - DX0) * dK; x += 10) pts.push(`${x},${demandY(x)}`);
  const sK = easeOut(clamp((T - tO) / 0.7));
  const pK = easeOut(clamp((T - tP) / 0.7));
  const fK = easeOut(clamp((T - tF) / 0.8));
  const aK = easeOut(clamp((T - tA) / 0.6));
  const vK = easeOut(clamp((T - tV) / 0.6));
  const ink = M.ink, blue = M.celesteDeep;
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        <marker id="ar" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto"><path d="M0,0 L12,6 L0,12 Z" fill={ink} /></marker>
        <marker id="arr" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto"><path d="M0,0 L12,6 L0,12 Z" fill={M.red} /></marker>
      </defs>
      {/* ejes */}
      <line x1={DX0 - 40} y1={OY} x2={DX1 + 60} y2={OY} stroke={ink} strokeWidth={4} markerEnd="url(#ar)" />
      <line x1={DX0 - 40} y1={OY} x2={DX0 - 40} y2={150} stroke={ink} strokeWidth={4} markerEnd="url(#ar)" />
      <text x={DX1 + 40} y={OY + 50} textAnchor="end" style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 26, letterSpacing: 4}} fill={M.ink2}>ENTRADAS</text>
      <text x={DX0 - 60} y={170} textAnchor="end" style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 26, letterSpacing: 4}} fill={M.ink2}>PRECIO</text>
      {/* oferta rígida */}
      <line x1={SX} y1={OY} x2={SX} y2={OY - (OY - 170) * sK} stroke={blue} strokeWidth={10} strokeLinecap="round" />
      {sK > 0.5 ? <text x={SX - 20} y={210} textAnchor="end" style={{fontFamily: FONT.head, fontSize: 46}} fill={blue} opacity={sK}>OFERTA RÍGIDA</text> : null}
      {sK > 0.5 ? <text x={SX - 20} y={250} textAnchor="end" style={{fontFamily: FONT.body, fontWeight: 700, fontSize: 26}} fill={blue} opacity={sK}>85.018 butacas, ni una más</text> : null}
      {/* demanda */}
      {pts.length > 1 ? <polyline points={pts.join(' ')} fill="none" stroke={ink} strokeWidth={7} strokeLinecap="round" /> : null}
      {dK > 0.8 ? <text x={1150} y={demandY(1150) - 40} textAnchor="start" style={{fontFamily: FONT.head, fontSize: 40}} fill={ink} opacity={prog(T, tD + 1, 0.4)}>GENTE QUE QUIERE IR</text> : null}
      {/* precio oficial */}
      <line x1={DX0 - 40} y1={PY} x2={DX0 - 40 + (DX1 - DX0 + 80) * pK} y2={PY} stroke={M.celesteDeep} strokeWidth={5} strokeDasharray="18 12" />
      {pK > 0.3 ? <text x={DX0 - 20} y={PY - 18} style={{fontFamily: FONT.body, fontWeight: 900, fontSize: 28}} fill={M.celesteDeep} opacity={pK}>PRECIO OFICIAL · $90.000</text> : null}
      {/* la fila: demanda que sobra */}
      {fK > 0 ? (
        <g opacity={fK}>
          <rect x={SX} y={PY - 10} width={(QX - SX) * fK} height={20} fill={M.gold} opacity={0.85} rx={6} />
          <text x={(SX + QX) / 2} y={PY + 56} textAnchor="middle" style={{fontFamily: FONT.head, fontSize: 44}} fill="#A8741A">LA FILA</text>
        </g>
      ) : null}
      {/* la diferencia que cobra el revendedor */}
      {aK > 0 ? (
        <g>
          <rect x={SX + 8} y={EQY} width={60} height={(PY - EQY) * aK} fill={M.red} opacity={0.2} />
          <line x1={SX + 38} y1={PY - 6} x2={SX + 38} y2={PY - 6 - (PY - EQY - 20) * vK} stroke={M.red} strokeWidth={6} markerEnd={vK > 0.05 ? 'url(#arr)' : undefined} />
          <circle cx={SX} cy={EQY} r={14 * vK} fill={M.red} />
          <text x={SX + 90} y={PY - 30} style={{fontFamily: FONT.body, fontWeight: 900, fontSize: 30}} fill={M.red} opacity={aK}>compra barato</text>
          <text x={SX + 90} y={EQY + 10} style={{fontFamily: FONT.body, fontWeight: 900, fontSize: 30}} fill={M.red} opacity={vK}>vende caro · PRECIO REAL</text>
        </g>
      ) : null}
    </svg>
  );
};

export const S04a: React.FC<SceneP> = ({T, t0}) => (
  <Sheet t={T}>
    <Cam t={T} punches={[c('s04', 'oferta'), c('s04', 'precio queda')]} drift={0.5}>
      <At x={130} y={70}><Kicker t={T} t0={t0 + 0.05} size={26} color={M.celesteDeep}>Y acá entra la economía</Kicker></At>
      <Chart T={T} />
      <At x={1530} y={120} center>
        <B t={T} t0={c('s04', 'pasan') - 0.1} kind="pop"><Pill bg={M.ink} fg={M.white} size={32}>PASAN DOS COSAS</Pill></B>
      </At>
    </Cam>
  </Sheet>
);

export const S04h: React.FC<SceneP> = ({T, t0}) => (
  <Cam t={T} punches={[t0 + 0.15]}>
    <Photo src="vid/hinchas.mp4" video t={T} t0={t0} span={2} zoom={[1.08, 1.15]} dim={0.35} grade="duo" credit={CR.ia} />
    <At x={960} y={540} center><Slam t={T} t0={t0 + 0.1} size={150}>UNA FILA GIGANTE</Slam></At>
  </Cam>
);

export const S04b: React.FC<SceneP> = ({T, t0}) => (
  <Sheet t={T}>
    <Cam t={T} punches={[c('s04', 'compra'), c('s04', 'vender')]} push={[t0, t0 + 3, 1.0, 1.12]} ox={40} oy={75}>
      <Chart T={T} />
    </Cam>
  </Sheet>
);

export const S04c: React.FC<SceneP> = ({T, t0}) => {
  const tS = c('s04', 'Son la'), tO = c('s04', 'oficial'), tR = c('s04', 'real.');
  const L = 1300;
  const b1 = easeOut(clamp((T - t0 - 0.2) / 0.7)) * L * (90 / 688.159);
  const b2 = easeOut(clamp((T - t0 - 0.5) / 1.0)) * L;
  return (
    <Night t={T} beams={0.5}>
      <Cam t={T} punches={[tS]}>
        <At x={960} y={170} center><Words t={T} t0={t0 + 0.1} text="No es magia." kind="slam" step={0.1} style={{...big(120)}} /></At>
        <div style={{position: 'absolute', left: 300, top: 380}}>
          <div style={{...body(28, T > tO ? M.celeste : M.mute), letterSpacing: 6, marginBottom: 12}}>PRECIO OFICIAL</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
            <div style={{width: b1, height: 90, background: M.celeste, borderRadius: 10}} />
            <div style={{...big(70)}}>$90.000</div>
          </div>
          <div style={{...body(28, T > tR ? M.red : M.mute), letterSpacing: 6, marginTop: 50, marginBottom: 12}}>PRECIO REAL (LO QUE ALGUIEN PAGA)</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
            <div style={{width: b2, height: 90, background: `linear-gradient(90deg, ${M.celeste} ${(90 / 688.159) * 100}%, ${M.red} ${(90 / 688.159) * 100}%)`, borderRadius: 10}} />
          </div>
          <div style={{...big(70), marginTop: 14, marginLeft: L - 300}}>$688.159</div>
        </div>
        {/* corchete de la diferencia */}
        {T > tS ? (
          <div style={{position: 'absolute', left: 300 + L * (90 / 688.159), top: 830, width: (L - L * (90 / 688.159)) * easeOut(clamp((T - tS) / 0.6)), borderTop: `5px solid ${M.red}`, borderLeft: `5px solid ${M.red}`, borderRight: `5px solid ${M.red}`, height: 26}}>
            <div style={{position: 'absolute', left: '50%', top: 34, transform: 'translateX(-50%)', whiteSpace: 'nowrap', opacity: prog(T, tS + 0.3, 0.4)}}>
              <span style={{...body(34, M.red, 900), letterSpacing: 4}}>LA DIFERENCIA · </span><span style={{...big(60, M.red)}}>$598.159</span>
            </div>
          </div>
        ) : null}
      </Cam>
    </Night>
  );
};

const Who: React.FC<{T: number; t0: number; ok: boolean; title: string; children: React.ReactNode}> = ({T, t0, ok, title, children}) => (
  <B t={T} t0={t0} kind="pop">
    <div style={{width: 470, height: 540, borderRadius: 30, background: ok ? 'rgba(179,18,42,0.35)' : 'rgba(10,18,42,0.8)', border: `3px solid ${ok ? M.red : 'rgba(182,220,255,0.2)'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, position: 'relative', boxShadow: ok ? '0 0 80px rgba(255,59,78,0.35)' : undefined}}>
      {children}
      <div style={{...big(58)}}>{title}</div>
      <div style={{position: 'absolute', top: -40, right: -30, width: 100, height: 100, borderRadius: 50, background: ok ? M.green : M.red, display: 'flex', justifyContent: 'center', alignItems: 'center', ...big(64, M.white), transform: `scale(${clamp(pop(T, t0 + 0.35))})`}}>{ok ? '$' : '✕'}</div>
    </div>
  </B>
);

export const S04d: React.FC<SceneP> = ({T, t0}) => {
  const tA = c('s04', 'AFA.'), tM = c('s04', 'Tampoco'), tR = c('s04', 'La cobra');
  return (
    <Night t={T}>
      <Cam t={T} punches={[tA, tM, tR]}>
        <At x={960} y={150} center><Words t={T} t0={t0 + 0.1} text="¿Quién cobra la diferencia?" step={0.07} style={{...big(80)}} /></At>
        <div style={{position: 'absolute', left: 135, top: 320, display: 'flex', gap: 70}}>
          <Who T={T} t0={tA - 0.1} ok={false} title="LA AFA">
            <div style={{width: 200, height: 200, borderRadius: 100, background: M.celeste, display: 'flex', justifyContent: 'center', alignItems: 'center', ...big(80, M.night)}}>AFA</div>
          </Who>
          <Who T={T} t0={tM - 0.1} ok={false} title="MESSI">
            <div style={{width: 220, height: 220, borderRadius: 110, overflow: 'hidden', border: `4px solid ${M.celeste}`}}>
              <Img src={img('egy245.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 20%', transform: 'scale(1.6)', transformOrigin: '50% 20%'}} />
            </div>
          </Who>
          <Who T={T} t0={tR - 0.1} ok title="EL REVENDEDOR">
            <div style={{width: 220, height: 220, borderRadius: 110, background: 'rgba(255,59,78,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', overflow: 'hidden'}}>
              <svg width="170" height="190" viewBox="0 0 40 46"><circle cx="20" cy="13" r="10" fill={M.red} /><path d="M2 46 V38 a18 14 0 0 1 36 0 V46 Z" fill={M.red} /><rect x="9" y="1" width="22" height="5" rx="2" fill="#7A0A1A" /><rect x="5" y="5" width="30" height="3" rx="1.5" fill="#7A0A1A" /></svg>
            </div>
          </Who>
        </div>
        <Bills T={T} t0={tR + 0.2} x0={1500} y0={900} x1={1500} y1={560} n={10} />
      </Cam>
    </Night>
  );
};

/** billetes que vuelan de un punto a otro */
export const Bills: React.FC<{T: number; t0: number; x0: number; y0: number; x1: number; y1: number; n?: number}> = ({T, t0, x0, y0, x1, y1, n = 10}) => (
  <>
    {Array.from({length: n}).map((_, i) => {
      const ti = t0 + i * 0.09;
      const kk = clamp((T - ti) / 0.9);
      if (kk <= 0 || kk >= 1) return null;
      const e = easeInOut(kk);
      const x = x0 + (x1 - x0) * e + Math.sin(kk * 6 + i) * 60 + (rnd(i) - 0.5) * 200;
      const y = y0 + (y1 - y0) * e - Math.sin(kk * Math.PI) * 180;
      return (
        <div key={i} style={{position: 'absolute', left: x, top: y, width: 120, height: 58, borderRadius: 6, background: 'linear-gradient(135deg, #8FD6A8, #3FA06A)', border: '3px solid #2E7A50', transform: `rotate(${(rnd(i * 3) - 0.5) * 80 + kk * 200}deg)`, opacity: 1 - clamp((kk - 0.85) / 0.15), display: 'flex', justifyContent: 'center', alignItems: 'center', ...big(30, '#1C4F33')}}>$</div>
      );
    })}
  </>
);

/* ============================== s05 · ¿por qué no la cobran más cara? ============================== */
export const S05a: React.FC<SceneP> = ({T, t0}) => {
  const t6 = c('s05', 'seiscientos');
  const p = 90000 + (600000 - 90000) * easeInOut(clamp((T - t6) / 0.8));
  return (
    <Night t={T}>
      <Cam t={T} punches={[t6]}>
        <At x={960} y={180} center>
          <Words t={T} t0={t0 + 0.2} text="¿Y si la cobraban $600.000?" step={0.08} hi={['$600.000?']} hiColor={M.gold} style={{...big(100)}} />
        </At>
        <At x={960} y={590} center>
          <Ticket t={T} t0={t0} w={880} price={'$' + fmt(Math.round(p / 1000) * 1000)} rot={2} seed={4} />
        </At>
      </Cam>
    </Night>
  );
};

export const S05b: React.FC<SceneP> = ({T, t0}) => {
  const tK = c('s05', 'Daniel'), tQ = c('s05', 'pregunta');
  return (
    <Sheet t={T}>
      <Cam t={T} punches={[t0 + 0.1, tK]}>
        <At x={140} y={180}>
          <Slam t={T} t0={t0 + 0.1} size={300} color={M.ink}>1986</Slam>
          <B t={T} t0={c('s05', 'tres economistas') - 0.1} kind="left"><div style={{...body(44, M.ink2), marginTop: 10}}>Tres economistas y una pregunta</div></B>
          <B t={T} t0={tQ - 0.1} kind="pop"><div style={{marginTop: 34}}><Pill bg={M.celesteDeep} fg={M.white} size={34}>UNA PREGUNTA SIMPLE</Pill></div></B>
        </At>
        <At x={1180} y={140}>
          <B t={T} t0={tK - 0.15} kind="right">
            <div style={{width: 560, background: M.white, padding: 20, paddingBottom: 30, borderRadius: 8, boxShadow: '0 40px 80px rgba(20,30,60,0.3)', transform: `rotate(${2 + Math.sin(T * 0.6)}deg)`}}>
              <div style={{width: 520, height: 600, overflow: 'hidden', background: '#ccc'}}>
                <Img src={img('kahneman.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 25%', filter: 'grayscale(0.2) contrast(1.05)'}} />
              </div>
              <div style={{...big(52, M.ink), marginTop: 18}}>DANIEL KAHNEMAN</div>
              <div style={{...body(24, M.ink2, 600)}}>Nobel de Economía 2002 · con Jack Knetsch y Richard Thaler</div>
            </div>
          </B>
        </At>
      </Cam>
      <Credit text={CR.kahneman} dark={false} />
    </Sheet>
  );
};

const PriceTag: React.FC<{T: number; t0: number; a: string; b: string; tb: number}> = ({T, t0, a, b, tb}) => {
  const flip = clamp((T - tb) / 0.35);
  const showB = flip > 0.5;
  const sw = Math.sin(T * 1.6) * 6;
  return (
    <div style={{transformOrigin: '50% 0%', transform: `rotate(${sw * (1 - prog(T, t0, 1.5)) + Math.sin(T * 0.9) * 3}deg) scale(${clamp(pop(T, t0))})`}}>
      <div style={{width: 4, height: 90, background: 'rgba(255,255,255,0.7)', margin: '0 auto'}} />
      <div style={{width: 420, padding: '30px 30px 36px', borderRadius: 20, background: showB ? M.red : M.gold, textAlign: 'center', transform: `rotateX(${Math.sin(flip * Math.PI) * 90}deg)`, boxShadow: '0 30px 60px rgba(0,0,0,0.45)', position: 'relative'}}>
        <div style={{position: 'absolute', left: '50%', top: 14, width: 26, height: 26, borderRadius: 13, background: M.night, transform: 'translateX(-50%)'}} />
        <div style={{...body(30, showB ? M.white : M.ink, 900), letterSpacing: 8, marginTop: 24}}>PALA PARA NIEVE</div>
        <div style={{...big(150, showB ? M.white : M.ink)}}>{showB ? b : a}</div>
      </div>
    </div>
  );
};

export const S05c: React.FC<SceneP> = ({T, t0}) => {
  const tQ = c('s05', 'quince'), tC = c('s05', 'Cae'), tV = c('s05', 'veinte.');
  return (
    <Cam t={T} punches={[tV]}>
      <Photo src="vid/ferreteria.mp4" video t={T} t0={t0} span={6} zoom={[1.02, 1.1]} dim={0.25} credit={CR.ia} />
      {T > tC ? <Motes t={T * 1.6} n={70} color="#FFFFFF" o={0.7 * prog(T, tC, 0.8)} /> : null}
      <At x={120} y={160} w={900}>
        <Kicker t={T} t0={t0 + 0.1} size={26} color={M.white}>El experimento</Kicker>
        <div style={{height: 20}} />
        <Words t={T} t0={t0 + 0.15} text="Una ferretería vende palas para la nieve" step={0.08} style={{...big(90)}} />
        <B t={T} t0={tC - 0.05} kind="left"><div style={{...body(48, M.celesteHi), marginTop: 30}}>Cae una tormenta…</div></B>
      </At>
      <At x={1420} y={140}>
        <B t={T} t0={tQ - 0.2} kind="drop"><PriceTag T={T} t0={tQ - 0.2} a="US$15" b="US$20" tb={tV - 0.1} /></B>
      </At>
    </Cam>
  );
};

export const S05d: React.FC<SceneP> = ({T, t0}) => {
  const t8 = c('s05', 'El ochenta');
  const b1 = easeOut(clamp((T - t8) / 0.9)), b2 = easeOut(clamp((T - t8 - 0.2) / 0.9));
  return (
    <Sheet t={T}>
      <Cam t={T} punches={[t8]}>
        <At x={960} y={170} center><Words t={T} t0={t0 + 0.05} text="¿Está bien?" kind="slam" step={0.1} style={{...big(140, M.ink)}} /></At>
        <div style={{position: 'absolute', left: 260, top: 380}}>
          {[
            {l: 'INJUSTO', v: 82, col: M.red, k: b1},
            {l: 'ACEPTABLE', v: 18, col: '#9AA3B5', k: b2},
          ].map((r) => (
            <div key={r.l} style={{display: 'flex', alignItems: 'center', gap: 30, marginBottom: 60}}>
              <div style={{width: 300, textAlign: 'right', ...body(44, M.ink, 900), letterSpacing: 4}}>{r.l}</div>
              <div style={{width: 1000 * (r.v / 82) * r.k, height: 130, background: r.col, borderRadius: 12}} />
              <div style={{...big(120, r.col), opacity: r.k}}>{Math.round(r.v * r.k)}%</div>
            </div>
          ))}
        </div>
      </Cam>
      <Src t={T} t0={t8} dark={false} text="Kahneman, Knetsch y Thaler (1986), American Economic Review · encuesta telefónica, 107 personas" />
    </Sheet>
  );
};

export const S05e: React.FC<SceneP> = ({T, t0}) => {
  const tA = c('s05', 'Alan'), tB = c('s05', 'Bruce'), tQ = c('s05', 'no quiere');
  const split = easeInOut(clamp((T - tB + 0.2) / 0.6));
  return (
    <Cam t={T} punches={[tQ]} drift={0.6}>
      <AbsoluteFill style={{background: M.night}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: 960 + 960 * (1 - split), height: H, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H}}><Photo src="krueger.jpg" t={T} t0={t0} span={6} zoom={[1.12, 1.2]} focus="55% 30%" dim={0.3} /></div>
      </div>
      <div style={{position: 'absolute', left: 960 + 960 * (1 - split), top: 0, width: 960, height: H, overflow: 'hidden', borderLeft: `6px solid ${M.celeste}`}}>
        <div style={{position: 'absolute', left: -480, top: 0, width: W, height: H}}><Photo src="springsteen.jpg" t={T} t0={tB} span={5} zoom={[1.05, 1.15]} dim={0.35} grade="warm" /></div>
      </div>
      <At x={70} y={120}><B t={T} t0={tA - 0.1} kind="left"><div style={{background: M.white, padding: '14px 26px', borderRadius: 12}}><div style={{...big(52, M.ink)}}>ALAN KRUEGER</div><div style={{...body(22, M.ink2, 700)}}>Economista, Universidad de Princeton</div></div></B></At>
      <At x={1030} y={120}><B t={T} t0={tB} kind="right"><div style={{background: M.gold, padding: '14px 26px', borderRadius: 12}}><div style={{...big(52, M.ink)}}>BRUCE SPRINGSTEEN</div></div></B></At>
      <At x={960} y={760} center w={1500}>
        <B t={T} t0={tQ - 0.1} kind="up">
          <Glass w={1500} style={{padding: '34px 50px', textAlign: 'center'}}>
            <Words t={T} t0={tQ} center text="«No quiere ganarse la fama de sacarle la plata a sus fans»" step={0.07} hi={['plata']} hiColor={M.gold} style={{fontFamily: FONT.serif, fontStyle: 'italic', fontWeight: 700, fontSize: 60, color: M.white, lineHeight: 1.1}} />
          </Glass>
        </B>
      </At>
      <Src t={T} t0={tQ} text="Alan Krueger en Freakonomics Radio (2017) · Connolly y Krueger, «Rockonomics» (2006)" />
      <Credit text={`${CR.krueger} · ${CR.springsteen}`} />
    </Cam>
  );
};

export const S05f: React.FC<SceneP> = ({T, t0}) => {
  const tR = c('s05', 'Una reventa'), tO = c('s05', 'otro.');
  return (
    <Night t={T}>
      <Cam t={T} punches={[tR, tO]}>
        <At x={500} y={330} center>
          <B t={T} t0={t0 + 0.05} kind="up">
            <Ticket t={T} t0={t0} w={620} price="$$$" rot={-3} seed={7} sway={0.5} />
          </B>
        </At>
        <At x={500} y={660} center w={760}>
          <B t={T} t0={t0 + 0.3} kind="up"><div style={{textAlign: 'center'}}><div style={{...big(64)}}>ENTRADA CARA</div><div style={{...body(38, M.celeste)}}>la cobra el organizador</div></div></B>
        </At>
        <At x={1420} y={330} center>
          <B t={T} t0={tR - 0.1} kind="up">
            <Ticket t={T} t0={tR - 0.1} w={620} price="$90.000" resale="$$$" resaleAt={tR + 0.3} rot={3} seed={9} sway={0.5} />
          </B>
        </At>
        <At x={1420} y={660} center w={760}>
          <B t={T} t0={tR + 0.1} kind="up"><div style={{textAlign: 'center'}}><div style={{...big(64, M.red)}}>REVENTA CARA</div><div style={{...body(38, M.white)}}>la cobra <span style={{color: M.red}}>otro</span></div></div></B>
        </At>
        <div style={{position: 'absolute', left: 1380, top: 820, opacity: prog(T, tO - 0.1, 0.4)}}>
          <svg width="120" height="140" viewBox="0 0 40 46"><circle cx="20" cy="13" r="10" fill={M.red} /><path d="M2 46 V38 a18 14 0 0 1 36 0 V46 Z" fill={M.red} /><rect x="9" y="1" width="22" height="5" rx="2" fill="#7A0A1A" /><rect x="5" y="5" width="30" height="3" rx="1.5" fill="#7A0A1A" /></svg>
        </div>
        <Bills T={T} t0={tO - 0.1} x0={1450} y0={380} x1={1440} y1={860} n={9} />
      </Cam>
    </Night>
  );
};
