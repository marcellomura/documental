/* Escenas 1 a 6: la frase, Maddison, el número uno, la revisión, la máquina de 1900 y ¿rico para quién? */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {
  R, FONT, W, H, Night, Paper, Archive, Print, Quote, Meter, Stamp, Slam, Kicker, Words, GoldText, Num, Src, Pill, B, At, Cam, Dust, LightLeak, Vignette,
  clamp, easeInOut, easeOut, prog, pop, rnd, fmt,
} from './kit';
import {Board, Flag, NAME, People, RailFan, WorldArcs} from './charts';
import {c, at, end, IMG} from './lib';
import v2018 from '../data/rico/v2018.json';
import extra from '../data/rico/extra.json';
import rank from '../data/rico/rank.json';

const V18 = v2018 as {years: Record<string, {n: number; top: {iso: string; v: number}[]}>};
const RK = rank as {rows: {year: number; top5: {iso: string; value: number}[]; argValue: number; n: number}[]};
const EX = extra as {c1896: string[]; top1913: {iso: string; v: number}[]; down: number[]; downN: number; yearsN: number};
const row1896 = RK.rows.find((r) => r.year === 1896)!;
export const TOP18 = V18.years['1896'].top.slice(0, 6).map((r) => ({iso: r.iso, v: r.v}));
export const TOP23 = [...row1896.top5.map((r) => ({iso: r.iso, v: r.value})), {iso: 'ARG', v: row1896.argValue}];

/* ---------- piezas chicas ---------- */
const Bubble: React.FC<{t: number; t0: number; x: number; y: number; who: string; text: string; rot?: number; scale?: number; tone?: string}> = ({t, t0, x, y, who, text, rot = 0, scale = 1, tone = R.cream}) => {
  if (t < t0) return null;
  const k = pop(t, t0, 1.4);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${k * scale})`}}>
      <div style={{background: tone, borderRadius: 34, padding: '22px 34px', boxShadow: '0 20px 50px rgba(0,0,0,0.4)', maxWidth: 560, position: 'relative'}}>
        <div style={{fontFamily: FONT.body, fontWeight: 900, fontSize: 22, letterSpacing: 4, color: R.celesteDeep, textTransform: 'uppercase'}}>{who}</div>
        <div style={{fontFamily: FONT.serif, fontWeight: 700, fontStyle: 'italic', fontSize: 38, color: R.ink, lineHeight: 1.15, marginTop: 6}}>{text}</div>
        <div style={{position: 'absolute', left: 60, bottom: -22, width: 0, height: 0, borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderTop: `26px solid ${tone}`}} />
      </div>
    </div>
  );
};

const Digits: React.FC<{t: number; o?: number}> = ({t, o = 1}) => (
  <AbsoluteFill style={{opacity: o, overflow: 'hidden'}}>
    {Array.from({length: 26}).map((_, i) => {
      const x = (i / 26) * W + 20;
      const sp = 90 + rnd(i) * 160;
      const y0 = ((t * sp + rnd(i * 3) * H * 2) % (H + 600)) - 600;
      const col = Array.from({length: 9}).map((__, j) => fmt(Math.floor(1000 + rnd(i * 31 + j + Math.floor(t * 4)) * 9000)));
      return (
        <div key={i} style={{position: 'absolute', left: x, top: y0, fontFamily: FONT.mono, fontSize: 22, lineHeight: 1.8, color: i % 5 === 0 ? R.goldHi : 'rgba(120,189,240,0.55)', textShadow: '0 0 10px rgba(120,189,240,0.5)'}}>
          {col.map((d, j) => <div key={j} style={{opacity: 1 - j * 0.09}}>{d}</div>)}
        </div>
      );
    })}
  </AbsoluteFill>
);

/* ================= S01 · LA FRASE ================= */
export const S01a: React.FC<{T: number}> = ({T}) => {
  const t0 = at('s01');
  const qEnd = c('s01', 'Lo dijo');
  return (
    <Night t={T} grid={0.3} glow="rgba(227,179,76,0.16)">
      <Cam t={T} punches={[c('s01', 'Davos,')]}>
        <At x={150} y={300}>
          <Quote t={T} t0={t0 + 0.05} text="En 35 años nos convertimos en la primera potencia mundial." who="Javier Milei" when="Davos, 17 de enero de 2024" hi={['primera', 'potencia', 'mundial.']} step={0.2} size={82} w={1060} />
        </At>
        <At x={1300} y={130}>
          <B t={T} t0={qEnd - 0.2} kind="right">
            <Print src={IMG.milei} t={T} t0={qEnd - 0.2} w={470} h={620} rot={4} ry={-8} caption="Foro Económico Mundial" focus="50% 25%" sepia={0.1} />
          </B>
        </At>
      </Cam>
      <Src t={T} t0={qEnd} text="Discurso oficial, casarosada.gob.ar · Foto: Casa Rosada / Vocería (CC BY 2.5 AR)" />
    </Night>
  );
};

export const S01b: React.FC<{T: number}> = ({T}) => {
  const t1 = c('s01', 'Lo repite');
  const tDogma = c('s01', 'dogma');
  const bubbles = [
    {who: 'Tu tío, en el asado', at: c('s01', 'tu tío'), x: 520, y: 330, rot: -4},
    {who: 'El taxista', at: c('s01', 'el taxista'), x: 1380, y: 300, rot: 3},
    {who: 'Las redes', at: c('s01', 'en redes:'), x: 980, y: 690, rot: -2},
  ];
  const extraN = 14;
  const coll = easeInOut(clamp((T - tDogma + 0.3) / 0.6));
  return (
    <Night t={T} grid={0} glow="rgba(120,189,240,0.18)">
      <Cam t={T} punches={bubbles.map((b) => b.at)}>
        <AbsoluteFill style={{transform: `scale(${1 - coll * 0.6})`, opacity: 1 - coll}}>
          {Array.from({length: extraN}).map((_, i) => (
            <Bubble key={i} t={T} t0={c('s01', 'en redes:') + 0.35 + i * 0.07} x={140 + rnd(i * 5) * 1640} y={120 + rnd(i * 9) * 840} who={['@usuario', 'comentario', 'posteo', 'reel'][i % 4]} text="«éramos el país más rico del mundo»" rot={(rnd(i) - 0.5) * 14} scale={0.55} tone={i % 3 === 0 ? R.goldHi : R.cream} />
          ))}
          {bubbles.map((b, i) => <Bubble key={'b' + i} t={T} t0={b.at} x={b.x} y={b.y} who={b.who} text="«Hace cien años éramos el país más rico del mundo»" rot={b.rot} />)}
        </AbsoluteFill>
        {T > tDogma - 0.3 ? (
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 10}}>
            <B t={T} t0={tDogma - 0.2} kind="blur"><div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 34, letterSpacing: 16, color: R.mute}}>CASI UN</div></B>
            <B t={T} t0={tDogma} kind="pop"><GoldText t={T} size={210} font={FONT.serif} style={{fontWeight: 900, letterSpacing: -4}}>DOGMA NACIONAL</GoldText></B>
          </AbsoluteFill>
        ) : null}
      </Cam>
    </Night>
  );
};

export const S01c: React.FC<{T: number}> = ({T}) => {
  const tQ = c('s01', '¿Es verdad?');
  const tNum = c('s01', 'Fuimos a buscar');
  const tRaro = c('s01', 'la misma base');
  const needle = T < tNum ? Math.sin((T - tQ) * 5) * 0.9 : T < tRaro ? Math.sin((T - tQ) * 2.2) * 0.35 : Math.sin((T - tRaro) * 8) * 0.9;
  const split = easeInOut(clamp((T - tRaro) / 0.6));
  return (
    <Night t={T} grid={0.5}>
      <Digits t={T} o={clamp((T - tNum) / 0.5) * 0.6 * (1 - split)} />
      <Cam t={T} punches={[tQ, tRaro, c('s01', 'también dice')]}>
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', transform: `translateX(${-split * 460}px) scale(${1 - split * 0.25})`}}>
          <Slam t={T} t0={tQ} size={190} color={R.cream}>¿ES VERDAD?</Slam>
          <div style={{marginTop: 30}}><B t={T} t0={tQ + 0.4} kind="up"><Meter t={T} value={needle} size={520} /></B></div>
        </AbsoluteFill>
        {split > 0 ? (
          <At x={1080} y={200}>
            <div style={{opacity: split, display: 'flex', gap: 34}}>
              {[{y: '2018', r: '#1', col: R.green}, {y: '2023', r: '#6', col: R.red}].map((v, i) => {
                const tt = tRaro + 0.3 + i * (c('s01', 'también dice') - tRaro - 0.2);
                return (
                  <B key={i} t={T} t0={tt} kind="flip">
                    <div style={{width: 330, height: 620, borderRadius: 26, background: R.night3, border: `3px solid ${v.col}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 50px ${v.col}55`}}>
                      <div style={{fontFamily: FONT.mono, fontSize: 26, color: R.mute, letterSpacing: 3}}>MADDISON</div>
                      <div style={{fontFamily: FONT.head, fontSize: 90, color: R.cream}}>{v.y}</div>
                      <div style={{marginTop: 30, display: 'flex', alignItems: 'center', gap: 16}}><Flag iso="ARG" w={70} /></div>
                      <div style={{fontFamily: FONT.head, fontSize: 230, color: v.col, lineHeight: 1}}>{v.r}</div>
                      <div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 24, color: R.mute, letterSpacing: 3}}>EN 1896</div>
                    </div>
                  </B>
                );
              })}
            </div>
          </At>
        ) : null}
      </Cam>
    </Night>
  );
};

/* ---------- placa de título (en la pausa antes de s02) ---------- */
export const TitleCard: React.FC<{T: number; t0: number; t1: number}> = ({T, t0, t1}) => {
  const t = T - t0;
  const out = clamp((T - (t1 - 0.5)) / 0.5);
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <Archive src={IMG.avmayo} t={T} t0={t0 - 0.5} span={t1 - t0 + 1} zoom={[1.25, 1.08]} dim={0.5} sepia={0.85} />
      <LightLeak t={T} o={0.5} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
        <div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 30, letterSpacing: 20, color: R.goldHi, opacity: prog(t, 0.1, 0.5)}}>CONTEXTO PRESENTA</div>
        <div style={{height: 26}} />
        <div style={{transform: `scale(${1.2 - 0.2 * easeOut(clamp(t / 1.2))})`, filter: `blur(${(1 - prog(t, 0.2, 0.8)) * 20}px)`, opacity: prog(t, 0.2, 0.6), textAlign: 'center'}}>
          <div style={{fontFamily: FONT.serif, fontStyle: 'italic', fontWeight: 600, fontSize: 70, color: R.cream, lineHeight: 1}}>¿Argentina fue</div>
          <GoldText t={T} size={190} font={FONT.serif} style={{fontWeight: 900, letterSpacing: -5, lineHeight: 1.05}}>el país más rico</GoldText>
          <div style={{fontFamily: FONT.serif, fontStyle: 'italic', fontWeight: 600, fontSize: 70, color: R.cream, lineHeight: 1}}>del mundo?</div>
        </div>
        <div style={{width: 820 * easeInOut(clamp((t - 0.7) / 0.8)), height: 3, background: R.gold, margin: '34px 0 18px'}} />
        <div style={{fontFamily: FONT.body, fontWeight: 700, fontSize: 28, letterSpacing: 10, color: 'rgba(255,247,230,0.85)', opacity: prog(t, 1.0, 0.6)}}>UNA INVESTIGACIÓN CON 150 AÑOS DE DATOS</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ================= S02 · MADDISON ================= */
export const S02a: React.FC<{T: number}> = ({T}) => {
  const t0 = at('s02');
  const tPbi = c('s02', 'PBI per');
  const tTodo = c('s02', 'todo lo');
  const tDiv = c('s02', 'dividido');
  const coins = 18;
  const k = clamp((T - tDiv) / 1.2);
  return (
    <Paper>
      <Cam t={T} punches={[tPbi, tDiv]}>
        <At x={0} y={120} w={W}><div style={{textAlign: 'center'}}><Kicker t={T} t0={t0} color={R.sepia} line={R.red}>¿Cómo se mide la riqueza?</Kicker></div></At>
        <At x={0} y={200} w={W}>
          <div style={{textAlign: 'center'}}><B t={T} t0={tPbi} kind="pop"><div style={{fontFamily: FONT.serif, fontWeight: 900, fontSize: 150, color: R.ink, letterSpacing: -3}}>PBI <span style={{color: R.red, fontStyle: 'italic'}}>per cápita</span></div></B></div>
        </At>
        {/* montaña de monedas que se reparte entre personas */}
        <At x={0} y={520} w={W}>
          <div style={{position: 'relative', height: 420}}>
            {Array.from({length: coins}).map((_, i) => {
              const a = prog(T, tTodo + i * 0.05, 0.5);
              const col = i % 6, row = Math.floor(i / 6);
              const x0 = 700 + (i % 6) * 55 + row * 26, y0 = 260 - row * 60 - (i % 2) * 14;
              const tx = 330 + col * 260, ty = 300;
              const x = x0 + (tx - x0) * easeInOut(k), y = y0 + (ty - y0) * easeInOut(k) - Math.sin(k * Math.PI) * 120;
              return <div key={i} style={{position: 'absolute', left: x, top: y - (1 - a) * 300, width: 64, height: 64, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, ${R.goldHi}, ${R.gold} 55%, ${R.goldDeep})`, border: `3px solid ${R.goldDeep}`, opacity: a, boxShadow: '0 6px 12px rgba(0,0,0,0.25)'}} />;
            })}
            {T > tDiv ? (
              <div style={{position: 'absolute', left: 300, top: 370, display: 'flex', gap: 196}}>
                {Array.from({length: 6}).map((_, i) => (
                  <svg key={i} width={70} height={90} viewBox="0 0 40 52" style={{opacity: prog(T, tDiv + i * 0.08, 0.4)}}>
                    <circle cx={20} cy={11} r={9} fill={R.ink} />
                    <path d="M4 50 Q4 24 20 24 Q36 24 36 50 Z" fill={R.ink} />
                  </svg>
                ))}
              </div>
            ) : null}
            <At x={0} y={0} w={W}>
              <div style={{display: 'flex', justifyContent: 'center', gap: 30, fontFamily: FONT.head, fontSize: 64, color: R.ink, alignItems: 'center'}}>
                <B t={T} t0={tTodo} kind="up"><span>TODO LO QUE SE PRODUCE</span></B>
                <B t={T} t0={tDiv} kind="pop"><span style={{color: R.red, fontSize: 90}}>÷</span></B>
                <B t={T} t0={tDiv + 0.2} kind="up"><span>HABITANTES</span></B>
              </div>
            </At>
          </div>
        </At>
      </Cam>
    </Paper>
  );
};

export const S02b: React.FC<{T: number}> = ({T}) => {
  const tNo = c('s02', 'Pero en');
  const tAng = c('s02', 'Angus');
  const tAnio = c('s02', 'año por año,');
  const tGro = c('s02', 'Groningen,');
  const tTodos = c('s02', 'todos:');
  const yr = T < tAnio ? 2022 : Math.round(2022 - (2022 - 1) * easeInOut(clamp((T - tAnio) / 2.2)));
  const mapK = easeInOut(clamp((T - tGro + 0.3) / 1.2));
  return (
    <Paper tint="#EFE3C8">
      <Cam t={T} punches={[tAng, tGro, tTodos]}>
        {T < tGro ? (
          <>
            {/* libro de cuentas con signos de pregunta */}
            <At x={140} y={180}>
              <B t={T} t0={tNo} kind="left">
                <div style={{width: 700, height: 640, background: '#F7EFD9', borderRadius: 8, boxShadow: '0 30px 60px rgba(60,40,10,0.35)', padding: 40, transform: 'rotate(-3deg)', position: 'relative', overflow: 'hidden'}}>
                  <div style={{fontFamily: FONT.type, fontSize: 36, color: R.ink2, borderBottom: `2px solid ${R.sepia}`, paddingBottom: 12}}>ESTADÍSTICA NACIONAL · 1890</div>
                  {Array.from({length: 10}).map((_, i) => (
                    <div key={i} style={{display: 'flex', justifyContent: 'space-between', fontFamily: FONT.type, fontSize: 30, color: R.ink2, padding: '12px 0', borderBottom: '1px dashed rgba(110,82,48,0.35)', opacity: prog(T, tNo + 0.2 + i * 0.08, 0.3)}}>
                      <span>{['Producción', 'Trigo', 'Carne', 'Industria', 'Comercio', 'Servicios', 'Salarios', 'Precios', 'Población', 'TOTAL'][i]}</span>
                      <span style={{color: R.red, fontFamily: FONT.hand, fontSize: 40}}>¿?</span>
                    </div>
                  ))}
                </div>
              </B>
            </At>
            <At x={1000} y={200}>
              <B t={T} t0={tAng} kind="right">
                <div style={{width: 800}}>
                  <div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 26, letterSpacing: 8, color: R.red}}>EL HOMBRE QUE MIDIÓ 2.000 AÑOS</div>
                  <div style={{fontFamily: FONT.serif, fontWeight: 900, fontSize: 118, color: R.ink, lineHeight: 1, marginTop: 10}}>Angus Maddison</div>
                  <div style={{fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 40, color: R.ink2, marginTop: 10}}>Economista británico (1926–2010)</div>
                  <div style={{marginTop: 50, fontFamily: FONT.mono, fontSize: 30, color: R.sepia}}>ESTIMANDO EL AÑO</div>
                  <div style={{fontFamily: FONT.head, fontSize: 200, color: R.red, lineHeight: 1}}>{T < tAnio ? '····' : yr}</div>
                </div>
              </B>
            </At>
          </>
        ) : (
          <>
            <AbsoluteFill style={{opacity: 1}}>
              <Night t={T} grid={0} dust={0.5}>
                <AbsoluteFill style={{transform: `scale(${1 + mapK * 1.6})`, transformOrigin: '52% 30%'}}>
                  <WorldArcs t={T} t0={T + 99} arcs={[]} hi={{NLD: R.gold}} scale={330} center={[0, 20]} pulse={[[6.57, 53.22]]} />
                </AbsoluteFill>
              </Night>
            </AbsoluteFill>
            <At x={120} y={140}>
              <B t={T} t0={tGro + 0.2} kind="left">
                <div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 26, letterSpacing: 8, color: R.goldHi}}>MADDISON PROJECT DATABASE</div>
                <div style={{fontFamily: FONT.serif, fontWeight: 900, fontSize: 88, color: R.cream, lineHeight: 1.05}}>Universidad de<br />Groningen</div>
              </B>
            </At>
            <At x={120} y={700}>
              <div style={{display: 'flex', gap: 20}}>
                {['Historiadores', 'Periodistas', 'Presidentes'].map((p, i) => (
                  <B key={p} t={T} t0={tTodos + 0.2 + i * 0.45} kind="pop">
                    <Pill bg={i === 2 ? R.gold : R.cream} size={44}>{p}</Pill>
                  </B>
                ))}
              </div>
            </At>
          </>
        )}
      </Cam>
      <Src t={T} t0={tGro} dark={T > tGro} text="Maddison Project Database (Bolt y van Zanden, Univ. de Groningen)" />
    </Paper>
  );
};

/* ================= S03 · NÚMERO UNO ================= */
export const S03a: React.FC<{T: number}> = ({T}) => {
  const t0 = at('s03');
  const tYear = c('s03', 'En mil ochocientos');
  const tBoard = c('s03', 'la Argentina tenía');
  const tUsa = c('s03', 'Más que Estados');
  const tGbr = c('s03', 'Más que Gran');
  const tOne = c('s03', 'Número uno.');
  const hi = T > tGbr ? 'GBR' : T > tUsa ? 'USA' : '';
  return (
    <Night t={T} grid={0.6} glow="rgba(227,179,76,0.18)">
      <Cam t={T} punches={[tBoard, tOne]}>
        <At x={110} y={110}>
          <B t={T} t0={t0} kind="left">
            <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
              <div style={{width: 60, height: 74, background: R.green, borderRadius: 6, position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.4)'}}>
                <div style={{position: 'absolute', left: 8, right: 8, top: 14, bottom: 14, backgroundImage: 'linear-gradient(rgba(255,255,255,0.7) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.7) 2px, transparent 2px)', backgroundSize: '14px 11px'}} />
              </div>
              <div>
                <div style={{fontFamily: FONT.mono, fontWeight: 700, fontSize: 30, color: R.cream}}>mpd2018.xlsx</div>
                <div style={{fontFamily: FONT.body, fontWeight: 700, fontSize: 22, color: R.mute, letterSpacing: 2}}>ACTUALIZACIÓN 2018 · {V18.years['1896'].n} PAÍSES CON DATOS EN 1896</div>
              </div>
            </div>
          </B>
        </At>
        <At x={1480} y={100}>
          <B t={T} t0={tYear} kind="pop"><GoldText t={T} size={150}>{T < c('s03', 'y mil') ? '1895' : '1896'}</GoldText></B>
        </At>
        <At x={180} y={330}>
          {T > tBoard - 0.1 ? <Board t={T} t0={tBoard} a={TOP18} max={6500} w={1300} rowH={105} /> : null}
        </At>
        {hi ? (
          <At x={180} y={330 + TOP18.findIndex((r) => r.iso === hi) * 105 - 6}>
            <div style={{width: 1330, height: 100, border: `4px solid ${R.red}`, borderRadius: 14, opacity: prog(T, hi === 'GBR' ? tGbr : tUsa, 0.3)}} />
          </At>
        ) : null}
        {T > tOne - 0.1 ? (
          <AbsoluteFill style={{background: `rgba(10,17,32,${0.75 * prog(T, tOne - 0.1, 0.3)})`, justifyContent: 'center', alignItems: 'center'}}>
            <Slam t={T} t0={tOne} size={520} color={R.goldHi}><GoldText t={T} size={520}>#1</GoldText></Slam>
            <div style={{marginTop: -20}}><B t={T} t0={tOne + 0.35} kind="up"><div style={{fontFamily: FONT.body, fontWeight: 900, fontSize: 40, letterSpacing: 14, color: R.cream}}>DEL MUNDO · SEGÚN MADDISON 2018</div></B></div>
          </AbsoluteFill>
        ) : null}
      </Cam>
      <Src t={T} t0={tBoard} text="Maddison Project Database 2018 · PBI per cápita (US$ de 2011, PPA)" />
    </Night>
  );
};

const Clip: React.FC<{t: number; t0: number; x: number; y: number; rot: number; head: string; tag: string}> = ({t, t0, x, y, rot, head, tag}) => {
  if (t < t0) return null;
  const k = pop(t, t0, 1.3);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 620, transform: `rotate(${rot}deg) scale(${0.4 + 0.6 * k})`, opacity: clamp((t - t0) * 6), background: '#F4EEDF', padding: '26px 30px', boxShadow: '0 24px 50px rgba(0,0,0,0.45)'}}>
      <div style={{fontFamily: FONT.body, fontWeight: 900, fontSize: 18, letterSpacing: 5, color: R.red}}>{tag}</div>
      <div style={{fontFamily: FONT.serif, fontWeight: 900, fontSize: 44, lineHeight: 1.05, color: R.ink, marginTop: 8}}>{head}</div>
      {Array.from({length: 4}).map((_, i) => <div key={i} style={{height: 9, background: 'rgba(23,19,14,0.18)', marginTop: 12, width: `${92 - i * 9}%`}} />)}
    </div>
  );
};

export const S03b: React.FC<{T: number}> = ({T}) => {
  const tD = c('s03', 'El dato recorrió');
  const tDisc = c('s03', 'discursos');
  const tRedes = c('s03', 'redes,');
  const tPero = c('s03', 'Pero dos');
  const freeze = clamp((T - tPero) / 0.8);
  return (
    <Night t={T} grid={0} glow="rgba(120,189,240,0.2)">
      <AbsoluteFill style={{filter: `grayscale(${freeze}) brightness(${1 - freeze * 0.4})`, transform: `scale(${1 + freeze * 0.08}) rotate(${freeze * -1.5}deg)`}}>
        <Clip t={T} t0={tD} x={110} y={120} rot={-5} tag="DIARIOS" head="«Argentina tuvo el PBI per cápita más alto del mundo»" />
        <Clip t={T} t0={tDisc} x={1150} y={180} rot={4} tag="DISCURSOS" head="«Fuimos la primera potencia mundial»" />
        <Clip t={T} t0={tRedes} x={620} y={560} rot={-2} tag="REDES" head="«En 1895 éramos los más ricos del planeta»" />
        {Array.from({length: 10}).map((_, i) => {
          const t0 = tRedes + 0.3 + i * 0.12;
          if (T < t0) return null;
          const k = pop(T, t0, 1.4);
          return (
            <div key={i} style={{position: 'absolute', left: 80 + rnd(i * 7) * 1700, top: 80 + rnd(i * 13) * 900, transform: `scale(${k})`, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.95)', borderRadius: 40, padding: '10px 22px', fontFamily: FONT.body, fontWeight: 800, fontSize: 24, color: R.ink}}>
              <span style={{color: R.red}}>♥</span> {fmt(Math.floor(1000 + rnd(i * 3) * 90000))}
            </div>
          );
        })}
      </AbsoluteFill>
      {T > tPero ? (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <B t={T} t0={tPero + 0.2} kind="blur"><div style={{fontFamily: FONT.mono, fontSize: 40, color: R.red, letterSpacing: 10, background: 'rgba(0,0,0,0.6)', padding: '14px 30px'}}>◀◀ REBOBINAR · 2020</div></B>
        </AbsoluteFill>
      ) : null}
    </Night>
  );
};

/* ================= S04 · LA REVISIÓN ================= */
export const S04a: React.FC<{T: number}> = ({T}) => {
  const t0 = at('s04');
  const tFix = c('s04', 'corrigió');
  const tSwap = c('s04', 'se reacomodó.');
  const tSix = c('s04', 'al sexto.');
  const tNew = c('s04', 'En la versión');
  return (
    <Night t={T} grid={0.6} glow="rgba(228,72,59,0.16)">
      <Cam t={T} punches={[tSix]}>
        <At x={110} y={110}>
          <div style={{display: 'flex', gap: 24, alignItems: 'center'}}>
            <B t={T} t0={t0} kind="left"><Pill bg={R.red} fg={R.white} size={32}>2020 · REVISIÓN</Pill></B>
            <B t={T} t0={tNew} kind="left"><Pill bg={R.cream} size={32}>2023 · SE CONFIRMA</Pill></B>
          </div>
        </At>
        <At x={1500} y={100}><GoldText t={T} size={150}>1896</GoldText></At>
        <At x={180} y={330}>
          <Board t={T} t0={t0 - 1} a={TOP18} b={TOP23} tSwap={tSwap} max={7400} w={1300} rowH={105} />
        </At>
        {/* tachones de corrección */}
        {T > tFix && T < tSwap + 0.3 ? (
          <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
            {Array.from({length: 6}).map((_, i) => {
              const k = clamp((T - tFix - i * 0.12) / 0.3);
              const y = 380 + i * 105;
              return <path key={i} d={`M 1150 ${y} q 60 -20 120 0 t 120 0`} stroke={R.red} strokeWidth={7} fill="none" strokeDasharray={260} strokeDashoffset={260 * (1 - k)} strokeLinecap="round" />;
            })}
          </svg>
        ) : null}
        {T > tSix ? (
          <At x={1560} y={740}><Stamp t={T} t0={tSix} text="#6" size={150} color={R.red} rot={-10} sub="NO #1" /></At>
        ) : null}
      </Cam>
      <Src t={T} t0={t0} text="Maddison Project Database 2020 y 2023 · US$ de 2011, PPA" />
    </Night>
  );
};

export const S04b: React.FC<{T: number}> = ({T}) => {
  const tDet = c('s04', 'Y hay otro');
  const tCuarenta = c('s04', 'cuarenta y un');
  const tOsea = c('s04', 'O sea,');
  const tSe = c('s04', 'entre los que');
  const tMito = c('s04', 'Entonces, ¿es');
  const tLoc = c('s04', 'una locura.');
  const has = Object.fromEntries(EX.c1896.map((k) => [k, R.gold]));
  const mapO = 1 - clamp((T - tOsea + 0.2) / 0.5);
  return (
    <Night t={T} grid={0} dust={0.4}>
      {T < tMito ? (
        <>
          <AbsoluteFill style={{opacity: mapO}}>
            <WorldArcs t={T} t0={T + 99} arcs={[]} hi={T > tCuarenta ? has : {}} land="#26334D" scale={310} center={[10, 12]} />
            <At x={110} y={110}>
              <B t={T} t0={tDet} kind="left">
                <div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 26, letterSpacing: 8, color: R.goldHi}}>PAÍSES CON DATOS EN 1896</div>
                <div style={{fontFamily: FONT.head, fontSize: 170, color: R.cream, lineHeight: 1}}>{T > tCuarenta ? <Num t={T} t0={tCuarenta} to={41} dur={0.8} /> : '··'}</div>
              </B>
            </At>
            <At x={1330} y={820}>
              <B t={T} t0={tCuarenta + 1} kind="up">
                <div style={{display: 'flex', gap: 16, alignItems: 'center', fontFamily: FONT.body, fontWeight: 800, fontSize: 26, color: R.cream}}>
                  <span style={{width: 28, height: 28, background: R.gold, borderRadius: 4}} /> con datos
                  <span style={{width: 28, height: 28, background: '#26334D', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 4, marginLeft: 20}} /> sin datos
                </div>
              </B>
            </At>
          </AbsoluteFill>
          {T > tOsea - 0.2 ? (
            <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
              <B t={T} t0={tOsea} kind="blur">
                <div style={{fontFamily: FONT.serif, fontWeight: 900, fontSize: 110, color: R.cream, textAlign: 'center', lineHeight: 1.05}}>
                  «el más rico <span style={{position: 'relative', display: 'inline-block'}}>
                    del mundo
                    <span style={{position: 'absolute', left: -10, right: -10, top: '52%', height: 12, background: R.red, transform: `scaleX(${easeOut(clamp((T - tSe + 0.6) / 0.4))})`, transformOrigin: 'left'}} />
                  </span>»
                </div>
              </B>
              <div style={{height: 20}} />
              <B t={T} t0={tSe} kind="up"><div style={{fontFamily: FONT.hand, fontSize: 96, color: R.goldHi, transform: 'rotate(-3deg)'}}>…de los que se podían medir</div></B>
            </AbsoluteFill>
          ) : null}
        </>
      ) : (
        <Cam t={T} punches={[tLoc]}>
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 140}}>
            <B t={T} t0={tMito} kind="up"><Meter t={T} value={T < c('s04', 'Tampoco.') ? -0.8 + Math.sin(T * 6) * 0.1 : -0.8 + 0.95 * easeOut(clamp((T - c('s04', 'Tampoco.')) / 0.8))} size={560} label="EN EL MEDIO" /></B>
            {T > tLoc - 0.6 ? (
              <div style={{textAlign: 'center'}}>
                <B t={T} t0={tLoc - 0.6} kind="pop"><GoldText t={T} size={300}>6.º</GoldText></B>
                <B t={T} t0={tLoc} kind="up"><div style={{fontFamily: FONT.head, fontSize: 64, color: R.cream, letterSpacing: 2}}>EN EL MUNDO ES UNA LOCURA</div></B>
              </div>
            ) : null}
          </AbsoluteFill>
        </Cam>
      )}
      <Src t={T} t0={tDet} t1={tMito} text="Maddison Project Database 2023 · países con dato de PBI per cápita en 1896" />
    </Night>
  );
};

/* ================= S05 · LA MÁQUINA DE 1900 ================= */
export const S05a: React.FC<{T: number}> = ({T}) => {
  const t0 = at('s05');
  const tBarcos = c('s05', 'llenos de');
  return (
    <AbsoluteFill>
      <Archive src={IMG.puerto} t={T} t0={t0 - 0.5} span={tBarcos - t0 + 4} zoom={[1.08, 1.26]} pan={[0, 0, -40, -20]} dim={0.2} />
      <At x={110} y={820}>
        <B t={T} t0={t0 + 0.1} kind="left">
          <div style={{fontFamily: FONT.type, fontSize: 64, color: R.cream, textShadow: '0 4px 20px rgba(0,0,0,0.6)'}}>BUENOS AIRES · 1900</div>
        </B>
      </At>
    </AbsoluteFill>
  );
};

export const S05b: React.FC<{T: number}> = ({T}) => {
  const tMap = c('s05', 'llenos de');
  const tUno = c('s05', 'casi uno');
  const people = T > tUno - 0.3;
  const BA: [number, number] = [-58.38, -34.6];
  return (
    <Night t={T} grid={0} dust={0.4} glow="rgba(227,179,76,0.12)">
      <AbsoluteFill style={{opacity: 1 - clamp((T - tUno + 0.3) / 0.4), transform: `scale(${1 + clamp((T - tMap) / 6) * 0.15})`}}>
        <WorldArcs t={T} t0={tMap} scale={560} center={[-20, 5]} land="#2A3656"
          arcs={[
            {from: [12.5, 41.9], to: BA, at: c('s05', 'italianos') - tMap, color: R.gold, n: 4},
            {from: [8.9, 44.4], to: BA, at: c('s05', 'italianos') - tMap + 0.3, color: R.gold, n: 3},
            {from: [-8.4, 43.3], to: BA, at: c('s05', 'españoles') - tMap, color: R.celeste, n: 4},
            {from: [-3.7, 40.4], to: BA, at: c('s05', 'españoles') - tMap + 0.3, color: R.celeste, n: 3},
          ]}
          hi={{ARG: R.celesteDeep, ITA: '#5A4A22', ESP: '#224A6A'}} pulse={[BA]}
        />
        <At x={110} y={110}><B t={T} t0={c('s05', 'italianos')} kind="left"><Pill bg={R.gold} size={36}>ITALIANOS</Pill></B></At>
        <At x={110} y={190}><B t={T} t0={c('s05', 'españoles')} kind="left"><Pill bg={R.celeste} size={36}>ESPAÑOLES</Pill></B></At>
      </AbsoluteFill>
      {people ? (
        <Paper>
          <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 110}}>
            <People t={T} t0={tUno - 0.2} n={30} cols={6} size={82} />
            <div style={{width: 640}}>
              <B t={T} t0={tUno + 0.6} kind="up"><div style={{fontFamily: FONT.head, fontSize: 230, color: R.red, lineHeight: 0.9}}><Num t={T} t0={tUno + 0.6} to={29.9} dec={1} suf="%" /></div></B>
              <B t={T} t0={tUno + 0.9} kind="up"><div style={{fontFamily: FONT.serif, fontWeight: 800, fontSize: 52, color: R.ink, lineHeight: 1.1}}>de los habitantes había nacido en otro país</div></B>
              <B t={T} t0={tUno + 1.2} kind="up"><div style={{marginTop: 18, fontFamily: FONT.type, fontSize: 32, color: R.sepia}}>Censo Nacional de 1914</div></B>
            </div>
          </AbsoluteFill>
        </Paper>
      ) : null}
      <Src t={T} t0={tUno} dark={false} text="Tercer Censo Nacional (1914), vía INDEC" />
    </Night>
  );
};

export const S05c: React.FC<{T: number}> = ({T}) => {
  const tV = c('s05', 'Los capitales');
  const tKm = c('s05', 'más de');
  const tAb = c('s05', 'Las líneas');
  const tTrigo = c('s05', 'el trigo,');
  return (
    <Paper tint="#EFE2C4">
      <Cam t={T} drift={0.5}>
        <RailFan t={T} t0={tV + 0.3} dur={tTrigo - tV} box={[640, 40, 1320, 1040]} />
        {/* bolsas de trigo, maíz y carne que bajan por las vías */}
        {T > tTrigo
          ? ['TRIGO', 'MAÍZ', 'CARNE'].map((p, i) => (
              <At key={p} x={120} y={560 + i * 120}>
                <B t={T} t0={c('s05', ['el trigo,', 'el maíz', 'la carne.'][i])} kind="left"><Pill bg={[R.gold, '#E9C46A', R.red][i]} fg={i === 2 ? R.white : R.ink} size={44}>{p}</Pill></B>
              </At>
            ))
          : null}
        <At x={110} y={130}>
          <B t={T} t0={tV} kind="left">
            <div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 26, letterSpacing: 8, color: R.red}}>VÍAS DE TREN EN 1914</div>
            <div style={{fontFamily: FONT.head, fontSize: 170, color: R.ink, lineHeight: 1}}>{T > tKm ? <Num t={T} t0={tKm} to={33500} dur={1.4} /> : '0'}</div>
            <div style={{fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 44, color: R.ink2}}>kilómetros</div>
          </B>
        </At>
        <At x={1400} y={900}><B t={T} t0={tAb} kind="up"><div style={{fontFamily: FONT.hand, fontSize: 54, color: R.sepia, transform: 'rotate(-4deg)'}}>todo termina en el puerto →</div></B></At>
      </Cam>
      <Src t={T} t0={tKm} dark={false} text="Historia de los ferrocarriles argentinos (Ministerio de Transporte / CNRT) · trazado aproximado" />
    </Paper>
  );
};

export const S05d: React.FC<{T: number}> = ({T}) => {
  const tFri = c('s05', 'Con los');
  const tGran = c('s05', 'Somos el');
  const BA: [number, number] = [-58.38, -34.6];
  return (
    <AbsoluteFill>
      {T < tGran ? (
        <Night t={T} grid={0} dust={0.3} glow="rgba(120,189,240,0.25)">
          <WorldArcs t={T} t0={tFri} scale={430} center={[-25, 8]} land="#2A3656" arcs={[{from: BA, to: [-0.12, 51.5], color: R.celeste, n: 5}]} hi={{ARG: R.celesteDeep, GBR: '#3E5580'}} pulse={[[-0.12, 51.5]]} />
          <At x={110} y={110}><B t={T} t0={tFri + 0.3} kind="left"><Pill bg={R.celeste} size={36}>❄ CARNE CONGELADA → LONDRES</Pill></B></At>
        </Night>
      ) : (
        <>
          <Archive src={IMG.cosecha} t={T} t0={tGran - 0.3} span={5} zoom={[1.05, 1.22]} dim={0.3} sepia={0.7} />
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
            <B t={T} t0={tGran + 0.2} kind="blur"><div style={{fontFamily: FONT.serif, fontWeight: 900, fontSize: 150, color: R.cream, textAlign: 'center', lineHeight: 0.95, textShadow: '0 10px 40px rgba(0,0,0,0.6)'}}>EL GRANERO<br /><span style={{color: R.goldHi, fontStyle: 'italic'}}>del mundo</span></div></B>
          </AbsoluteFill>
        </>
      )}
    </AbsoluteFill>
  );
};

export const S05e: React.FC<{T: number}> = ({T}) => {
  const tSub = c('s05', 'En mil novecientos trece,');
  const tMad = c('s05', 'seis años');
  const tPar = c('s05', 'Y en París');
  const tFrase = c('s05', 'rico como');
  return (
    <AbsoluteFill>
      {T < tPar ? (
        <Paper>
          <At x={100} y={150}><Print src={IMG.subte} t={T} t0={tSub} w={1000} h={640} rot={-3} caption="Línea A, 1913" /></At>
          <At x={1200} y={230}>
            <B t={T} t0={tSub + 0.4} kind="right">
              <div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 26, letterSpacing: 6, color: R.red}}>PRIMER SUBTE DE AMÉRICA LATINA</div>
              <div style={{display: 'flex', gap: 40, marginTop: 30, alignItems: 'flex-end'}}>
                <div><div style={{fontFamily: FONT.head, fontSize: 150, color: R.ink, lineHeight: 1}}>1913</div><div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 30}}>Buenos Aires</div></div>
                {T > tMad ? <div style={{opacity: prog(T, tMad, 0.4)}}><div style={{fontFamily: FONT.head, fontSize: 110, color: 'rgba(23,19,14,0.4)', lineHeight: 1}}>1919</div><div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 30, color: 'rgba(23,19,14,0.5)'}}>Madrid</div></div> : null}
              </div>
            </B>
          </At>
        </Paper>
      ) : (
        <>
          <Archive src={IMG.paris} t={T} t0={tPar - 0.3} span={5} zoom={[1.1, 1.22]} dim={0.45} sepia={0.8} />
          <LightLeak t={T} o={0.4} />
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
            <B t={T} t0={tFrase - 0.4} kind="blur"><div style={{fontFamily: FONT.serif, fontStyle: 'italic', fontWeight: 700, fontSize: 130, color: R.goldHi, textShadow: '0 10px 40px rgba(0,0,0,0.6)'}}>«Riche comme un Argentin»</div></B>
            <B t={T} t0={tFrase + 0.6} kind="up"><div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 32, letterSpacing: 10, color: R.cream}}>RICO COMO UN ARGENTINO · PARÍS, 1910s</div></B>
          </AbsoluteFill>
        </>
      )}
    </AbsoluteFill>
  );
};

/* ================= S06 · ¿RICO PARA QUIÉN? ================= */
export const S06a: React.FC<{T: number}> = ({T}) => {
  const t0 = at('s06');
  const tProm = c('s06', 'El PBI');
  const tEsc = c('s06', 'esconden');
  // 10 personas: 1 con una montaña de riqueza, el resto con poco; la línea del promedio queda lejos de casi todos
  const vals = [2, 3, 2.5, 3, 2, 3.5, 2.5, 3, 2, 26];
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const k = easeOut(clamp((T - tProm) / 1.2));
  const hk = easeInOut(clamp((T - tEsc) / 0.8));
  return (
    <Paper>
      {T < tProm ? (
        <>
          <Archive src={IMG.palacio} t={T} t0={t0 - 0.3} span={5} zoom={[1.05, 1.18]} dim={0.3} sepia={0.6} />
          <At x={110} y={840}><B t={T} t0={t0 + 0.2} kind="left"><Pill bg={R.gold} size={40}>LA ÉLITE, NO EL PROMEDIO</Pill></B></At>
        </>
      ) : (
        <AbsoluteFill style={{padding: '140px 200px'}}>
          <Kicker t={T} t0={tProm} color={R.red} line={R.red}>Cómo engaña un promedio</Kicker>
          <div style={{position: 'relative', marginTop: 40, height: 700}}>
            {vals.map((v, i) => (
              <div key={i} style={{position: 'absolute', left: i * 150, bottom: 100, width: 100, height: v * 22 * k, background: i === 9 ? R.gold : R.sepia, borderRadius: '8px 8px 0 0'}} />
            ))}
            {vals.map((_, i) => (
              <svg key={'p' + i} width={70} height={90} viewBox="0 0 40 52" style={{position: 'absolute', left: i * 150 + 15, bottom: 0}}>
                <circle cx={20} cy={11} r={9} fill={i === 9 ? R.goldDeep : R.ink} />
                <path d="M4 50 Q4 24 20 24 Q36 24 36 50 Z" fill={i === 9 ? R.goldDeep : R.ink} />
              </svg>
            ))}
            <div style={{position: 'absolute', left: -30, width: 1560, bottom: 100 + avg * 22 * k, borderTop: `5px dashed ${R.red}`, opacity: prog(T, tProm + 1, 0.4)}}>
              <span style={{position: 'absolute', right: 0, top: -58, fontFamily: FONT.head, fontSize: 44, color: R.red}}>PROMEDIO</span>
            </div>
            <div style={{position: 'absolute', left: 0, width: 1340, bottom: 90, height: 200, border: `4px solid ${R.red}`, borderRadius: 20, opacity: hk}}>
              <span style={{position: 'absolute', left: 20, top: -56, fontFamily: FONT.hand, fontSize: 48, color: R.red}}>casi todos quedan abajo</span>
            </div>
          </div>
        </AbsoluteFill>
      )}
    </Paper>
  );
};

export const S06b: React.FC<{T: number}> = ({T}) => {
  const tConv = c('s06', 'Mientras las');
  const tPieza = c('s06', 'una sola');
  const tHuelga = c('s06', 'En mil novecientos siete,');
  const tEsc = c('s06', 'escobas.');
  const tAnalf = c('s06', 'Uno de');
  const tCent = c('s06', 'Y en mil');
  const tSitio = c('s06', 'estado de sitio.');
  if (T < tHuelga) {
    return (
      <AbsoluteFill>
        <Archive src={IMG.conventillo} t={T} t0={tConv - 0.3} span={tHuelga - tConv + 1} zoom={[1.2, 1.05]} dim={0.3} sepia={0.6} />
        <At x={110} y={820}><B t={T} t0={tPieza} kind="left"><div style={{fontFamily: FONT.type, fontSize: 58, color: R.cream, textShadow: '0 4px 20px rgba(0,0,0,0.7)'}}>CONVENTILLO · FAMILIAS ENTERAS EN UNA PIEZA</div></B></At>
      </AbsoluteFill>
    );
  }
  if (T < tAnalf) {
    return (
      <Paper>
        <At x={110} y={130}><Print src={IMG.huelga} t={T} t0={tHuelga} w={1050} h={700} rot={-2} caption="Huelga de inquilinos, 1907" /></At>
        <At x={1380} y={350}><Stamp t={T} t0={tEsc} text="HUELGA" sub="DE LAS ESCOBAS · 1907" size={110} rot={8} /></At>
      </Paper>
    );
  }
  if (T < tCent) {
    return (
      <Paper>
        <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 110}}>
          <People t={T} t0={tAnalf - 0.2} n={33} cols={11} size={62} hiEvery={3} hiColor={R.ink} color="rgba(23,19,14,0.22)" />
          <div style={{width: 560}}>
            <B t={T} t0={tAnalf + 0.3} kind="up"><div style={{fontFamily: FONT.head, fontSize: 210, color: R.ink, lineHeight: 0.9}}><Num t={T} t0={tAnalf + 0.3} to={35.9} dec={1} suf="%" /></div></B>
            <B t={T} t0={tAnalf + 0.6} kind="up"><div style={{fontFamily: FONT.serif, fontWeight: 800, fontSize: 48, color: R.ink, lineHeight: 1.1}}>no sabía leer ni escribir</div></B>
            <B t={T} t0={tAnalf + 0.9} kind="up"><div style={{marginTop: 14, fontFamily: FONT.type, fontSize: 30, color: R.sepia}}>Mayores de 10 años · Censo 1914</div></B>
          </div>
        </AbsoluteFill>
        <Src t={T} t0={tAnalf} dark={false} text="Tercer Censo Nacional (1914)" />
      </Paper>
    );
  }
  return (
    <AbsoluteFill>
      <Archive src={IMG.centenario} t={T} t0={tCent - 0.3} span={5} zoom={[1.06, 1.2]} dim={0.3} sepia={0.6} />
      <At x={110} y={110}><B t={T} t0={tCent + 0.2} kind="left"><div style={{fontFamily: FONT.type, fontSize: 60, color: R.cream, textShadow: '0 4px 20px rgba(0,0,0,0.7)'}}>CENTENARIO · MAYO DE 1910</div></B></At>
      <At x={1150} y={560}><Stamp t={T} t0={tSitio} text="ESTADO DE SITIO" size={96} rot={-8} /></At>
    </AbsoluteFill>
  );
};

export {Vignette, Dust, H};
