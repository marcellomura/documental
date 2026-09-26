/* Escenas 7 a 12: mitad, la caída, por qué, Kuznets, veredicto y cierre */
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {R, FONT, W, H, Night, Paper, Archive, Print, Meter, Stamp, Slam, Kicker, GoldText, Num, Src, Pill, B, At, Cam, LightLeak, clamp, easeInOut, easeOut, prog, pop, rnd, fmt} from './kit';
import {Board, Flag, LineRace, NAME, RankFall, val} from './charts';
import {c, at, end, IMG} from './lib';
import extra from '../data/rico/extra.json';

const EX = extra as {c1896: string[]; top1913: {iso: string; v: number}[]; down: number[]; downN: number; yearsN: number};

/* ================= S07 · MITAD ================= */
export const S07: React.FC<{T: number}> = ({T}) => {
  const t0 = at('s07');
  const tTop = c('s07', 'En mil');
  const tDel = c('s07', 'por delante');
  const tQ = c('s07', 'Y acá');
  const tPaso = c('s07', '¿qué nos');
  const top = EX.top1913.slice(0, 12).map((r) => ({iso: r.iso, v: r.v}));
  const lower = ['DEU', 'FRA', 'ITA', 'ESP'];
  if (T < tQ) {
    return (
      <Night t={T} grid={0.5}>
        <Cam t={T} punches={[tDel]}>
          <At x={110} y={100}><B t={T} t0={t0} kind="left"><div style={{fontFamily: FONT.serif, fontWeight: 900, fontSize: 76, color: R.cream}}>Rico, desigual… <span style={{color: R.goldHi, fontStyle: 'italic'}}>pero rico</span></div></B></At>
          <At x={1540} y={90}><B t={T} t0={tTop} kind="pop"><GoldText t={T} size={140}>1913</GoldText></B></At>
          <At x={180} y={250}>
            {T > tTop - 0.1 ? <Board t={T} t0={tTop} a={top.slice(6, 10)} max={10500} w={1200} rowH={96} n={4} /> : null}
          </At>
          {T > tDel - 0.1 ? (
            <At x={180} y={640}>
              <div style={{display: 'flex', gap: 22}}>
                {lower.map((iso, i) => (
                  <B key={iso} t={T} t0={tDel + i * 0.28} kind="flip">
                    <div style={{width: 360, padding: '20px 24px', borderRadius: 16, background: R.night3, border: '2px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', gap: 16}}>
                      <Flag iso={iso} w={70} />
                      <div>
                        <div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 30, color: R.cream}}>{NAME[iso]}</div>
                        <div style={{fontFamily: FONT.mono, fontSize: 24, color: R.mute}}>US$ {fmt(Math.round(val(iso, 1913) ?? 0))}</div>
                      </div>
                    </div>
                  </B>
                ))}
              </div>
              <B t={T} t0={tDel} kind="up"><div style={{marginTop: 22, fontFamily: FONT.body, fontWeight: 900, fontSize: 30, letterSpacing: 6, color: R.goldHi}}>▲ ARGENTINA ESTABA POR ENCIMA DE TODOS ESTOS</div></B>
            </At>
          ) : null}
        </Cam>
        <Src t={T} t0={tTop} text="Maddison Project Database 2023 · puestos 7 a 10 de 75 países con datos en 1913" />
      </Night>
    );
  }
  return (
    <Night t={T} grid={0.8} glow="rgba(228,72,59,0.22)">
      <Cam t={T} punches={[tPaso]}>
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 20}}>
          <B t={T} t0={tQ} kind="blur"><div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 40, letterSpacing: 14, color: R.mute}}>LA PREGUNTA DE VERDAD NO ES SI ÉRAMOS RICOS</div></B>
          <Slam t={T} t0={tPaso} size={250} color={R.red}>¿QUÉ NOS PASÓ?</Slam>
        </AbsoluteFill>
      </Cam>
    </Night>
  );
};

/* ================= S08 · LA CAÍDA ================= */
export const S08a: React.FC<{T: number}> = ({T}) => {
  const t0 = at('s08');
  const tGem = c('s08', 'Australia y');
  const tTres = c('s08', 'Los tres');
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{flexDirection: 'row'}}>
        {[{src: IMG.avmayo, iso: 'ARG', city: 'Buenos Aires'}, {src: IMG.sydney, iso: 'AUS', city: 'Sídney'}, {src: IMG.toronto, iso: 'CAN', city: 'Toronto'}].map((p, i) => {
          const tt = i === 0 ? t0 : tGem + (i - 1) * 0.5;
          const k = easeOut(clamp((T - tt) / 0.6));
          return (
            <div key={i} style={{flex: 1, position: 'relative', overflow: 'hidden', clipPath: `inset(${(1 - k) * 100}% 0 0 0)`, borderRight: i < 2 ? `4px solid ${R.gold}` : undefined}}>
              <Archive src={p.src} t={T} t0={tt} span={8} zoom={[1.15, 1.3]} dim={0.35} sepia={0.8} damage={false} />
              <div style={{position: 'absolute', left: 0, right: 0, bottom: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
                <Flag iso={p.iso} w={90} />
                <div style={{fontFamily: FONT.serif, fontWeight: 900, fontSize: 64, color: R.cream, textShadow: '0 6px 20px rgba(0,0,0,0.7)'}}>{NAME[p.iso]}</div>
                <div style={{fontFamily: FONT.type, fontSize: 30, color: R.goldHi}}>{p.city} · c. 1910</div>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
      {T > tTres ? (
        <At x={0} y={80} w={W}>
          <div style={{display: 'flex', justifyContent: 'center', gap: 18}}>
            {['ENORMES', 'POCA GENTE', 'TIERRA FÉRTIL', 'INMIGRANTES', 'CAPITAL INGLÉS'].map((w, i) => (
              <B key={w} t={T} t0={tTres + 0.25 + i * 0.28} kind="pop"><Pill bg={R.cream} size={32}>{w}</Pill></B>
            ))}
          </div>
        </At>
      ) : null}
    </AbsoluteFill>
  );
};

export const S08b: React.FC<{T: number}> = ({T}) => {
  const t0 = c('s08', 'En mil');
  const marks: [number, number][] = [
    [t0, 1896],
    [c('s08', 'Ahora mirá.'), 1896],
    [c('s08', 'Mil novecientos treinta:'), 1930],
    [c('s08', 'Mil novecientos cincuenta:'), 1950],
    [c('s08', 'Mil novecientos setenta'), 1975],
    [c('s08', 'Dos mil uno:'), 2001],
    [c('s08', 'Hoy,'), 2022],
  ];
  let yr = 1870;
  if (T < marks[0][0]) yr = 1870 + (1896 - 1870) * easeOut(clamp((T - at('s08') - 5) / 2));
  else {
    yr = marks[marks.length - 1][1];
    for (let i = 0; i < marks.length - 1; i++) {
      if (T < marks[i + 1][0]) {
        const [ta, ya] = marks[i], [tb, yb] = marks[i + 1];
        yr = ya + (yb - ya) * easeInOut(clamp((T - ta) / Math.max(0.5, tb - ta)));
        break;
      }
    }
  }
  if (T < t0) yr = Math.max(1870, 1870 + (1896 - 1870) * easeOut(clamp((T - (t0 - 2.5)) / 2.2)));
  const ratio = (val('ARG', yr) ?? 0) / (val('AUS', yr) ?? 1);
  const tHoy = c('s08', 'Hoy,');
  return (
    <Night t={T} grid={0.35}>
      <Cam t={T} punches={marks.slice(2).map((m) => m[0])} drift={0.4}>
        <At x={200} y={200}>
          <LineRace t={T} t0={0} dur={1} isos={['AUS', 'CAN', 'ARG']} y0={1870} y1={2022} yearTo={yr} w={1250} h={660} vmax={60000}
            colors={{AUS: '#8FD1A8', CAN: '#F08A7E', ARG: R.gold}}
            events={[{y: 1930, label: 'Golpe de 1930'}, {y: 1975, label: 'Rodrigazo'}, {y: 2001, label: 'Crisis 2001'}]} />
        </At>
        <At x={1560} y={260}>
          <div style={{width: 320, padding: 26, borderRadius: 20, background: 'rgba(18,29,51,0.9)', border: `2px solid ${R.gold}`}}>
            <div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 20, letterSpacing: 3, color: R.mute}}>UN ARGENTINO PRODUCE</div>
            <div style={{fontFamily: FONT.head, fontSize: 120, color: ratio > 0.8 ? R.green : ratio > 0.5 ? R.goldHi : R.red, lineHeight: 1}}>{Math.round(ratio * 100)}%</div>
            <div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 20, letterSpacing: 3, color: R.mute}}>DE LO QUE PRODUCE UN AUSTRALIANO</div>
          </div>
        </At>
        {T > tHoy + 0.4 ? (
          <At x={1560} y={640}>
            <B t={T} t0={tHoy + 0.4} kind="pop">
              <div style={{display: 'flex', gap: 10, alignItems: 'flex-end'}}>
                {[0, 1, 2].map((i) => <div key={i} style={{width: 90, height: 90, borderRadius: '50%', background: i === 0 ? R.gold : 'rgba(143,209,168,0.8)', border: `4px solid ${i === 0 ? R.goldDeep : '#4E8D66'}`}} />)}
              </div>
              <div style={{fontFamily: FONT.hand, fontSize: 46, color: R.cream, marginTop: 10}}>1 de cada 3</div>
            </B>
          </At>
        ) : null}
      </Cam>
      <Src t={T} t0={at('s08') + 3} text="Maddison Project Database 2023 · PBI per cápita, US$ de 2011 (PPA), escala logarítmica" />
    </Night>
  );
};

export const S08c: React.FC<{T: number}> = ({T}) => {
  const t0 = c('s08', 'Y en el ranking');
  return (
    <Night t={T} grid={0.4} glow="rgba(228,72,59,0.2)">
      <At x={250} y={160}>
        <RankFall t={T} t0={t0 + 0.2} step={0.62} w={1450} h={700}
          stops={[{year: 1896, rank: 6, n: 41}, {year: 1913, rank: 10, n: 75}, {year: 1950, rank: 19, n: 146}, {year: 1975, rank: 28, n: 153}, {year: 2000, rank: 45, n: 169}, {year: 2022, rank: 67, n: 169}]} />
      </At>
      <At x={110} y={70}><B t={T} t0={t0} kind="left"><Kicker t={T} t0={t0}>Puesto mundial en PBI per cápita</Kicker></B></At>
      <Src t={T} t0={t0} text="Maddison Project Database 2023 · la cantidad de países con datos cambia con los años" />
    </Night>
  );
};

/* ================= S09 · POR QUÉ ================= */
const Reason: React.FC<{T: number; t0: number; n: string; title: string; children: React.ReactNode; color?: string}> = ({T, t0, n, title, children, color = R.gold}) => {
  const k = easeOut(clamp((T - t0) / 0.7));
  return (
    <div style={{perspective: 1800}}>
      <div style={{transform: `rotateY(${(1 - k) * 70}deg) translateX(${(1 - k) * 200}px)`, opacity: clamp(k * 1.5), width: 1500, minHeight: 640, borderRadius: 30, background: 'linear-gradient(160deg, #16233D, #0E1729)', border: `2px solid ${color}55`, boxShadow: '0 40px 90px rgba(0,0,0,0.5)', padding: '50px 70px', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', right: 40, top: -60, fontFamily: FONT.head, fontSize: 420, color: `${color}22`, lineHeight: 1}}>{n}</div>
        <div style={{fontFamily: FONT.body, fontWeight: 900, fontSize: 28, letterSpacing: 10, color}}>MOTIVO {n}</div>
        <div style={{fontFamily: FONT.serif, fontWeight: 900, fontSize: 86, color: R.cream, lineHeight: 1.05, marginTop: 6}}>{title}</div>
        <div style={{marginTop: 40}}>{children}</div>
      </div>
    </div>
  );
};

export const S09: React.FC<{T: number}> = ({T}) => {
  const t0 = at('s09');
  const t1 = c('s09', 'Uno:');
  const t2 = c('s09', 'Dos:');
  const t3 = c('s09', 'Tres:');
  const t4 = c('s09', 'Y cuatro:');
  const tAcc = c('s09', 'Ningún factor');
  const coups = [1930, 1943, 1955, 1962, 1966, 1976];
  if (T < t1) {
    return (
      <Night t={T} grid={0.5}>
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 30}}>
          <Slam t={T} t0={t0} size={260} color={R.cream}>¿POR QUÉ?</Slam>
          <B t={T} t0={c('s09', 'culpable')} kind="up">
            <div style={{display: 'flex', gap: 18}}>
              {['🗳️ Los políticos', '🏭 El modelo', '🌎 El mundo', '💸 La deuda', '🪖 Los militares'].map((p, i) => (
                <div key={p} style={{opacity: prog(T, c('s09', 'culpable') + i * 0.12, 0.3), transform: `rotate(${(i - 2) * 3}deg)`}}><Pill bg={R.night3} fg={R.cream} size={30}>{p}</Pill></div>
              ))}
            </div>
          </B>
        </AbsoluteFill>
      </Night>
    );
  }
  const cur = T < t2 ? 1 : T < t3 ? 2 : T < t4 ? 3 : 4;
  const tc = [t1, t2, t3, t4][cur - 1];
  if (T < tAcc) {
    return (
      <Night t={T} grid={0.3} dust={0.4}>
        <At x={210} y={170}>
          {cur === 1 ? (
            <Reason T={T} t0={tc} n="1" title="Un motor que dependía de afuera">
              <div style={{display: 'flex', alignItems: 'center', gap: 50}}>
                <div style={{display: 'flex', gap: 14}}>{['🌾', '🐄', '🌽'].map((e, i) => <div key={i} style={{fontSize: 90, transform: `translateX(${Math.max(0, (T - c('s09', 'cuando el')) * 180 * (1 - i * 0.1))}px)`, opacity: 1 - clamp((T - c('s09', 'cerró')) / 0.8)}}>{e}</div>)}</div>
                <div style={{width: 140, height: 260, background: T > c('s09', 'cerró') ? R.red : 'rgba(255,255,255,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.head, fontSize: 40, color: R.cream, transform: `scaleY(${T > c('s09', 'cerró') ? easeOut(clamp((T - c('s09', 'cerró')) / 0.3)) : 0.2})`}}>🔒</div>
                <div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 38, color: R.mute, width: 500}}>Después de 1930, el mundo levanta barreras y se frena el comercio.</div>
              </div>
            </Reason>
          ) : cur === 2 ? (
            <Reason T={T} t0={tc} n="2" title="Seis golpes de Estado" color={R.red}>
              <div style={{position: 'relative', height: 200, width: 1340}}>
                <div style={{position: 'absolute', left: 0, right: 0, top: 90, height: 6, background: 'rgba(255,255,255,0.2)'}} />
                {coups.map((y, i) => {
                  const x = ((y - 1925) / (1980 - 1925)) * 1300;
                  const tt = c('s09', 'hubo seis') + i * 0.22;
                  return (
                    <div key={y} style={{position: 'absolute', left: x - 50, top: 40, width: 100, textAlign: 'center', opacity: prog(T, tt, 0.3), transform: `scale(${0.6 + 0.4 * pop(T, tt)})`}}>
                      <div style={{width: 60, height: 60, margin: '0 auto', borderRadius: '50%', background: R.red, boxShadow: `0 0 30px ${R.red}`}} />
                      <div style={{fontFamily: FONT.head, fontSize: 44, color: R.cream, marginTop: 14}}>{y}</div>
                    </div>
                  );
                })}
              </div>
              <B t={T} t0={c('s09', 'Las reglas')} kind="up"><div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 36, color: R.mute}}>Reglas que cambian cada pocos años = nadie invierte a largo plazo.</div></B>
            </Reason>
          ) : cur === 3 ? (
            <Reason T={T} t0={tc} n="3" title="La inflación crónica" color={R.goldHi}>
              <div style={{display: 'flex', gap: 80, alignItems: 'flex-end'}}>
                <B t={T} t0={c('s09', 'el Rodrigazo')} kind="pop"><div><div style={{fontFamily: FONT.head, fontSize: 90, color: R.cream}}>1975</div><div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 30, color: R.mute}}>Rodrigazo</div></div></B>
                <B t={T} t0={c('s09', 'la hiperinflación')} kind="pop">
                  <div>
                    <div style={{fontFamily: FONT.head, fontSize: 200, color: R.red, lineHeight: 1}}><Num t={T} t0={c('s09', 'de más')} to={3079} dur={1.2} suf="%" /></div>
                    <div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 30, color: R.mute}}>inflación de 1989 en un año (INDEC)</div>
                  </div>
                </B>
              </div>
            </Reason>
          ) : (
            <Reason T={T} t0={tc} n="4" title="Crisis en serie" color={R.celeste}>
              <div style={{display: 'flex', gap: 70}}>
                <div>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: 10, width: 520}}>
                    {[1827, 1890, 1951, 1956, 1982, 1989, 2001, 2014, 2020].map((y, i) => (
                      <div key={y} style={{opacity: prog(T, c('s09', 'Nueve') + i * 0.1, 0.2), transform: `rotate(${(rnd(i) - 0.5) * 12}deg) scale(${0.5 + 0.5 * pop(T, c('s09', 'Nueve') + i * 0.1)})`, border: `3px solid ${R.red}`, color: R.red, fontFamily: FONT.head, fontSize: 34, padding: '4px 12px', borderRadius: 6}}>DEFAULT {y}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(12, 44px)', gap: 6}}>
                    {Array.from({length: 72}).map((_, i) => {
                      const y = 1951 + i;
                      const bad = EX.down.includes(y);
                      const tt = c('s09', 'según el') + i * 0.025;
                      return <div key={y} style={{width: 44, height: 44, borderRadius: 6, background: T > tt ? (bad ? R.red : 'rgba(255,255,255,0.12)') : 'rgba(255,255,255,0.04)'}} />;
                    })}
                  </div>
                  <div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 24, color: R.mute, marginTop: 14, width: 620}}>
                    <span style={{color: R.red}}>■</span> {EX.downN} de {EX.yearsN} años con caída del PBI por persona (1951–2022)
                  </div>
                </div>
              </div>
            </Reason>
          )}
        </At>
        <Src t={T} t0={t1} text={cur === 4 ? 'Banco Mundial · Maddison Project Database 2023 · defaults según Reinhart y Rogoff y prensa' : cur === 3 ? 'INDEC, IPC 1989' : 'Gerchunoff y Llach; Della Paolera y Taylor; Glaeser, Di Tella y Llach'} />
      </Night>
    );
  }
  // acumulación: las cuatro tarjetas se apilan
  return (
    <Night t={T} grid={0.4}>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        {['DEPENDENCIA', 'INESTABILIDAD', 'INFLACIÓN', 'CRISIS'].map((w, i) => {
          const tt = tAcc + i * 0.18;
          const k = easeOut(clamp((T - tt) / 0.5));
          return (
            <div key={w} style={{position: 'absolute', left: 960 - 380, top: 560 - i * 120 - (1 - k) * 500, width: 760, height: 110, borderRadius: 14, background: [R.gold, R.red, R.goldHi, R.celeste][i], opacity: k, transform: `rotate(${(rnd(i) - 0.5) * 6 + Math.sin(T * 2) * 1.5 * i}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.head, fontSize: 70, color: R.ink, boxShadow: '0 20px 40px rgba(0,0,0,0.4)'}}>{w}</div>
          );
        })}
        <At x={0} y={760} w={W}><div style={{textAlign: 'center'}}><B t={T} t0={c('s09', 'Es la')} kind="up"><div style={{fontFamily: FONT.serif, fontStyle: 'italic', fontWeight: 800, fontSize: 90, color: R.cream}}>Es la acumulación.</div></B></div></At>
      </AbsoluteFill>
    </Night>
  );
};

/* ================= S10 · KUZNETS ================= */
export const S10: React.FC<{T: number}> = ({T}) => {
  const t0 = at('s10');
  const tCuatro = c('s10', 'Existen');
  const cells = [
    {k: 'los desarrollados,', label: 'DESARROLLADOS', icon: '▲', col: R.green},
    {k: 'los subdesarrollados,', label: 'SUBDESARROLLADOS', icon: '▼', col: R.mute},
    {k: 'Japón…', label: 'JAPÓN', iso: 'JPN', col: R.goldHi, arrow: 'pobre → rico'},
    {k: 'y Argentina.', label: 'ARGENTINA', iso: 'ARG', col: R.red, arrow: 'rica → ¿?'},
  ];
  const tNadie = c('s10', 'Nadie');
  return (
    <Night t={T} grid={0.3} glow="rgba(227,179,76,0.14)">
      <At x={110} y={90}>
        <B t={T} t0={t0} kind="left">
          <div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 26, letterSpacing: 8, color: R.goldHi}}>FRASE ATRIBUIDA A SIMON KUZNETS · NOBEL DE ECONOMÍA 1971</div>
        </B>
      </At>
      <At x={210} y={190}>
        <div style={{display: 'grid', gridTemplateColumns: '740px 740px', gap: 26}}>
          {cells.map((cl, i) => {
            const tt = c('s10', cl.k);
            const k = easeOut(clamp((T - tt) / 0.5));
            const big = i === 3 && T > c('s10', 'Argentina, porque');
            return (
              <div key={i} style={{height: 330, borderRadius: 24, background: 'rgba(18,29,51,0.95)', border: `3px solid ${k > 0 ? cl.col : 'rgba(255,255,255,0.08)'}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 16, transform: `scale(${0.9 + 0.1 * k + (big ? 0.04 : 0)})`, opacity: 0.25 + 0.75 * k, boxShadow: big ? `0 0 60px ${R.red}88` : 'none'}}>
                {cl.iso ? <Flag iso={cl.iso} w={120} /> : <div style={{fontSize: 90, color: cl.col, lineHeight: 1}}>{cl.icon}</div>}
                <div style={{fontFamily: FONT.head, fontSize: 70, color: cl.col}}>{cl.label}</div>
                {cl.arrow && T > c('s10', i === 2 ? 'Japón, porque' : 'Argentina, porque') ? <div style={{fontFamily: FONT.hand, fontSize: 50, color: R.cream}}>{cl.arrow}</div> : null}
              </div>
            );
          })}
        </div>
      </At>
      {T > tNadie ? (
        <At x={1440} y={870}><Stamp t={T} t0={tNadie} text="SIN FUENTE ORIGINAL" size={46} rot={-6} color={R.goldHi} /></At>
      ) : null}
      <Src t={T} t0={tCuatro} text="Cita apócrifa: no se encontró su origen (Slate; Chequeado)" />
    </Night>
  );
};

/* ================= S11 · VEREDICTO ================= */
export const S11: React.FC<{T: number}> = ({T}) => {
  const t0 = at('s11');
  const tSi = c('s11', 'Según una');
  const tNo = c('s11', 'Según las');
  const tInd = c('s11', 'Lo indiscutible');
  const tCayo = c('s11', 'Y que');
  const tMito = c('s11', 'El mito');
  const tTodos = c('s11', 'Está en');
  let v = Math.sin(T * 4) * 0.2;
  if (T > tSi) v = 0.85;
  if (T > tNo) v = -0.4;
  if (T > tInd) v = 0.1;
  const vs = v + Math.sin(T * 7) * 0.03;
  if (T < tMito) {
    return (
      <Night t={T} grid={0.5}>
        <Cam t={T} punches={[tSi, tNo, tInd]}>
          <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 120}}>
            <B t={T} t0={t0} kind="up"><Meter t={T} value={vs} size={620} label="EL VEREDICTO" /></B>
            <div style={{width: 700}}>
              <B t={T} t0={tSi} kind="left"><div style={{display: 'flex', gap: 20, alignItems: 'center', fontFamily: FONT.body, fontWeight: 800, fontSize: 38, color: R.cream, marginBottom: 22}}><Pill bg={R.green} fg={R.ink} size={30}>2018</Pill> #1 en 1895 y 1896</div></B>
              <B t={T} t0={tNo} kind="left"><div style={{display: 'flex', gap: 20, alignItems: 'center', fontFamily: FONT.body, fontWeight: 800, fontSize: 38, color: R.cream, marginBottom: 22}}><Pill bg={R.red} fg={R.white} size={30}>2020-23</Pill> #6 en 1896</div></B>
              <B t={T} t0={tInd} kind="left"><div style={{display: 'flex', gap: 20, alignItems: 'center', fontFamily: FONT.body, fontWeight: 800, fontSize: 38, color: R.cream, marginBottom: 22}}><Pill bg={R.gold} size={30}>SEGURO</Pill> Top 10 hasta 1913</div></B>
              <B t={T} t0={tCayo} kind="left"><div style={{display: 'flex', gap: 20, alignItems: 'center', fontFamily: FONT.body, fontWeight: 800, fontSize: 38, color: R.cream}}><Pill bg={R.cream} size={30}>ÚNICO</Pill> Casi nadie de ese grupo cayó tanto</div></B>
            </div>
          </AbsoluteFill>
          <At x={620} y={820}><Stamp t={T} t0={tCayo + 1.2} text="VERDAD A MEDIAS" size={110} rot={-6} color={R.goldHi} /></At>
        </Cam>
      </Night>
    );
  }
  return (
    <AbsoluteFill>
      <Archive src={IMG.conventillo2} t={T} t0={tMito - 0.4} span={6} zoom={[1.2, 1.05]} dim={0.55} sepia={0.8} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 40, padding: 160}}>
        <B t={T} t0={tMito} kind="blur"><div style={{fontFamily: FONT.serif, fontWeight: 800, fontSize: 80, color: R.cream, textAlign: 'center', lineHeight: 1.1}}>El mito no está en haber sido ricos.</div></B>
        <B t={T} t0={tTodos} kind="blur"><div style={{fontFamily: FONT.serif, fontStyle: 'italic', fontWeight: 800, fontSize: 92, color: R.goldHi, textAlign: 'center', lineHeight: 1.1}}>Está en creer que aquella riqueza era de todos.</div></B>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ================= S12 · CIERRE ================= */
export const S12: React.FC<{T: number}> = ({T}) => {
  const t0 = at('s12');
  const t75 = c('s12', 'En mil');
  const tHoy = c('s12', 'Hoy produce');
  const tHist = c('s12', 'La historia');
  const tSub = c('s12', 'Si este');
  const yr = T < t75 ? 1950 : T < tHoy ? 1950 + 25 * easeInOut(clamp((T - t75) / 1.5)) : 1975 + 47 * easeInOut(clamp((T - tHoy) / 2));
  if (T < tSub) {
    const hist = T > tHist;
    return (
      <Night t={T} grid={0.35} glow="rgba(76,195,138,0.16)">
        <AbsoluteFill style={{opacity: 1 - clamp((T - tHist) / 0.4)}}>
          <At x={110} y={90}><Kicker t={T} t0={t0}>Un dato que da esperanza</Kicker></At>
          <At x={220} y={230}>
            <LineRace t={T} t0={0} dur={1} isos={['KOR', 'ARG']} y0={1950} y1={2022} yearTo={yr} w={1150} h={620} vmax={60000} colors={{KOR: '#8FB8FF', ARG: R.gold}} />
          </At>
          <At x={1560} y={300}>
            <div style={{width: 300, padding: 24, borderRadius: 20, background: 'rgba(18,29,51,0.9)', border: '2px solid #8FB8FF'}}>
              <div style={{display: 'flex', gap: 12, alignItems: 'center'}}><Flag iso="KOR" w={50} /><span style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 22, color: R.mute}}>vs</span><Flag iso="ARG" w={50} /></div>
              <div style={{fontFamily: FONT.head, fontSize: 110, color: '#8FB8FF', lineHeight: 1, marginTop: 10}}>{((val('KOR', yr) ?? 0) / (val('ARG', yr) ?? 1)).toFixed(2).replace('.', ',')}×</div>
              <div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 20, letterSpacing: 2, color: R.mute}}>LO QUE PRODUCE UN COREANO RESPECTO DE UN ARGENTINO</div>
            </div>
          </At>
        </AbsoluteFill>
        {hist ? (
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 20}}>
            <B t={T} t0={tHist} kind="blur"><div style={{fontFamily: FONT.serif, fontWeight: 900, fontSize: 130, color: R.cream}}>La historia no es destino</div></B>
            <div style={{display: 'flex', gap: 80}}>
              <B t={T} t0={c('s12', 'se puede subir…')} kind="pop"><div style={{fontFamily: FONT.head, fontSize: 90, color: R.green}}>▲ SUBIR</div></B>
              <B t={T} t0={c('s12', 'también se')} kind="pop"><div style={{fontFamily: FONT.head, fontSize: 90, color: R.red}}>▼ BAJAR</div></B>
            </div>
          </AbsoluteFill>
        ) : null}
        <Src t={T} t0={t75} t1={tHist} text="Maddison Project Database 2023 · PBI per cápita, US$ de 2011 (PPA)" />
      </Night>
    );
  }
  return <EndCard T={T} t0={tSub} />;
};

export const EndCard: React.FC<{T: number; t0: number}> = ({T, t0}) => (
  <Night t={T} grid={0.4} glow="rgba(227,179,76,0.22)">
    <LightLeak t={T} o={0.25} />
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 30}}>
      <B t={T} t0={t0} kind="pop"><Img src={staticFile('brand/logo_transparente.png')} style={{height: 150}} /></B>
      <B t={T} t0={t0 + 0.4} kind="up">
        <div style={{display: 'flex', gap: 24, alignItems: 'center'}}>
          <div style={{background: R.red, color: R.white, fontFamily: FONT.body, fontWeight: 900, fontSize: 44, padding: '18px 44px', borderRadius: 14, transform: `scale(${1 + 0.04 * Math.sin(T * 5)})`}}>SUSCRIBITE</div>
          <div style={{fontSize: 60}}>🔔</div>
        </div>
      </B>
      <B t={T} t0={c('s12', 'dejanos')} kind="up">
        <div style={{marginTop: 20, padding: '26px 40px', borderRadius: 24, background: R.cream, maxWidth: 1100, textAlign: 'center'}}>
          <div style={{fontFamily: FONT.body, fontWeight: 900, fontSize: 24, letterSpacing: 5, color: R.celesteDeep}}>💬 EN LOS COMENTARIOS</div>
          <div style={{fontFamily: FONT.serif, fontWeight: 800, fontSize: 56, color: R.ink}}>¿Qué otro mito argentino investigamos?</div>
        </div>
      </B>
    </AbsoluteFill>
  </Night>
);

export {Paper, Print, H, Archive};
