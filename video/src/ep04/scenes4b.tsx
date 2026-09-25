import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {F} from '../theme';
import {cue} from './lib';
import {clamp, easeIn, easeInOut, easeOut, fmt, pop, prog, shake} from '../lib/anim';
import {Cloud, Flash, Frame, Headline, HeatText, Kicker, LogoMark, N, Num, Ocean, Rain, Src, Tag, Vignette} from './kit';
import {Globe} from './globe';
import {OniChart, SeasonLines, Stripes} from './charts';
import {ArgMap, ArgCam, PLACES} from './argmap';

type P = {t: number};
const ramp = (t: number, a: number, b: number, e = easeInOut) => e(clamp((t - a) / (b - a)));

/* =====================================================================
   S05 — Fuerte, súper, los tres de la historia, 2026 y la OMM
   ===================================================================== */
export const S05: React.FC<P> = ({t}) => {
  const s = 's05';
  const tFuerte = cue(s, 'fuerte'), tGrado = cue(s, 'grado y medio'), tSuper = cue(s, 'súper,'), tDos = cue(s, 'dos.'), tSet = cue(s, 'setenta');
  const tTres = cue(s, 'tres:'), t82 = cue(s, 'mil novecientos'), t97 = cue(s, 'noventa'), t15 = cue(s, 'dos mil quince.');
  const tEste = cue(s, 'Este año,'), tTresG = cue(s, 'tres grados,'), tTodavia = cue(s, 'todavía'), tSegun = cue(s, 'Según');
  const tOrg = cue(s, 'Organización'), tDirige = cue(s, 'dirige'), tArg = cue(s, 'argentina,'), tPodria = cue(s, 'podría'), tObs = cue(s, 'observado.');
  const oniO = 1 - prog(t, tEste - 0.5, 0.5);
  const linesO = Math.min(prog(t, tEste - 0.3, 0.5), 1 - prog(t, tSegun - 0.4, 0.5));
  const wmo = prog(t, tSegun - 0.3, 0.6);
  const quote = 'Podría ser más potente que todo lo observado';
  const qn = Math.round(quote.length * ramp(t, tPodria - 0.1, tObs - 0.1, (x) => x));
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      {oniO > 0 ? (
        <AbsoluteFill style={{opacity: oniO, transform: `translateX(${-prog(t, tEste - 0.5, 0.5) * 120}px)`}}>
          <Ocean grid={0.3} />
          <Kicker t={t} t0={-0.2} text="Índice oceánico El Niño (ONI) · 1950–2026" />
          <div style={{position: 'absolute', left: 110, top: 140, height: 90}}>
            {t < tTres - 0.1 ? (
              <Headline t={t} t0={0.1} size={66} text="¿Cuándo un Niño es súper?" hl={['súper?']} />
            ) : (
              <div style={{display: 'flex', alignItems: 'baseline', gap: 22}}>
                <div style={{fontFamily: F.head, fontSize: 120, lineHeight: 0.9, color: N.yellow, transform: `scale(${pop(t, tTres - 0.1)})`, transformOrigin: 'left bottom'}}>3</div>
                <Headline t={t} t0={tTres} size={66} text="súper Niños en 75 años" />
              </div>
            )}
          </div>
          <OniChart t={t} tAxes={0} tFuerte={tGrado - 0.1} tSuper={tSuper - 0.1} tDraw={[tSet - 0.6, tTres + 0.4]} peaks={[t82 - 0.1, t97 - 0.1, t15 - 0.1]} />
          <Src t={t} t0={0.3} text="NOAA CPC · ONI: promedio móvil de 3 meses de la anomalía en la región Niño 3.4" />
        </AbsoluteFill>
      ) : null}
      {linesO > 0 ? (
        <AbsoluteFill style={{opacity: linesO, transform: `translateX(${(1 - prog(t, tEste - 0.3, 0.6)) * 140}px)`}}>
          <Ocean grid={0.3} glow="rgba(255,90,54,0.12)" />
          <Kicker t={t} t0={tEste - 0.2} text="Pacífico central (Niño 3.4) · semana a semana" />
          <div style={{position: 'absolute', left: 110, top: 140}}>
            <Headline t={t} t0={tEste} size={66} text="Este año va adelantado" hl={['adelantado']} hlColor={N.hot} />
          </div>
          <SeasonLines t={t} t0={tEste - 0.2} tNow={tTresG + 0.2} tPeak={tTodavia} />
          <div style={{position: 'absolute', left: 1300, top: 170, width: 540, opacity: prog(t, tTodavia, 0.5), transform: `translateY(${(1 - prog(t, tTodavia, 0.5)) * 20}px)`}}>
            <div style={{fontFamily: F.head, fontSize: 50, color: N.yellow, lineHeight: 1.05}}>Y TODAVÍA NO LLEGÓ A SU PICO</div>
            <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 24, color: N.mute, marginTop: 8}}>Los otros súper Niños tocaron techo entre noviembre y enero (puntos)</div>
          </div>
          <Src t={t} t0={tEste} text="NOAA CPC · anomalía semanal Niño 3.4, 1982–2026 (base 1991-2020)" />
        </AbsoluteFill>
      ) : null}
      {wmo > 0 ? (
        <AbsoluteFill style={{opacity: wmo}}>
          <Ocean glow="rgba(116,172,223,0.18)" />
          <Frame src="img/ep04/saulo.jpg" t={t} t0={tSegun - 0.2} x={1420} y={520} w={640} h={820} focus="50% 28%" zoom={[1.02, 1.1]} enter="clip" credit="Celeste Saulo · Xavier Lejeune / © Unión Europea, 2025" />
          <Kicker t={t} t0={tSegun - 0.1} text="Organización Meteorológica Mundial (OMM)" />
          <div style={{position: 'absolute', left: 110, top: 190, width: 900}}>
            <div style={{fontFamily: F.head, fontSize: 60, lineHeight: 1.05, color: N.mute, marginBottom: 34, opacity: prog(t, tOrg - 0.2, 0.4)}}>
              LA DIRIGE UNA ARGENTINA:
            </div>
            <div style={{opacity: prog(t, tDirige - 0.2, 0.5), transform: `translateY(${(1 - prog(t, tDirige - 0.2, 0.5)) * 20}px)`}}>
              <div style={{fontFamily: F.head, fontSize: 96, color: N.text, lineHeight: 1}}>CELESTE SAULO</div>
              <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 14}}>
                <div style={{width: 60, height: 40, background: 'linear-gradient(180deg, #74ACDF 33%, #fff 33%, #fff 66%, #74ACDF 66%)', borderRadius: 4, transform: `scale(${pop(t, tArg - 0.2)})`}} />
                <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 32, color: N.mute}}>Argentina · secretaria general de la OMM</div>
              </div>
            </div>
            <div style={{marginTop: 70, fontFamily: F.quote, fontStyle: 'italic', fontWeight: 600, fontSize: 70, lineHeight: 1.12, color: N.text, minHeight: 250}}>
              {qn > 0 ? '«' : ''}
              {quote.slice(0, qn)}
              {qn >= quote.length ? '»' : t > tPodria - 0.2 ? <span style={{opacity: Math.floor(t * 3) % 2 ? 1 : 0, color: N.yellow}}>|</span> : null}
            </div>
            <div style={{marginTop: 30, fontFamily: F.body, fontWeight: 700, fontSize: 26, color: N.mute, opacity: prog(t, tObs, 0.5)}}>desde que empezó el monitoreo moderno</div>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* =====================================================================
   S06 — La última vez: 1998 en el Litoral y 2015 en Concordia
   ===================================================================== */
const FloodDefs: React.FC<{t: number}> = ({t}) => (
  <defs>
    <pattern id="flood" width={40} height={16} patternUnits="userSpaceOnUse" patternTransform={`translate(${(t * 30) % 40},0)`}>
      <rect width={40} height={16} fill="#2E7FD0" />
      <path d="M0 8 Q10 2 20 8 T40 8" fill="none" stroke="#8CC8FF" strokeWidth={2} opacity={0.7} />
    </pattern>
  </defs>
);

export const S06: React.FC<P & {dur: number}> = ({t, dur}) => {
  const fo = 1 - prog(t, dur - 0.5, 0.45);
  const s = 's06';
  const tAnio = cue(s, 'mil novecientos'), tLit = cue(s, 'Litoral'), tInund = cue(s, 'inundó:'), tCiento = cue(s, 'ciento'), tDiec = cue(s, 'diecisiete');
  const tCuatro = cue(s, 'cuatro millones'), tBajo = cue(s, 'bajo el agua'), tSF = cue(s, 'Santa Fe.'), t15 = cue(s, 'dos mil quince,'), tUru = cue(s, 'Uruguay');
  const tTapo = cue(s, 'tapó'), tCuarto = cue(s, 'cuarto'), tConc = cue(s, 'Concordia.'), tVeinte = cue(s, 'Veinte mil personas'), tCasas = cue(s, 'casas.');
  const base: [number, number, number, number] = [120, 40, 900, 1040];
  const zLit = ramp(t, tAnio, tLit + 0.4);
  const zCon = ramp(t, t15 - 0.1, tUru + 0.3);
  const cam: ArgCam = zCon > 0
    ? {box: base, z: 2.4 + (7 - 2.4) * zCon, focus: [-60.7 + (PLACES.Concordia[0] + 60.7) * zCon, -30.8 + (PLACES.Concordia[1] + 30.8) * zCon], at: [520 + 0 * zCon, 520]}
    : {box: base, z: 1 + 1.4 * zLit, focus: [-64 + 3.3 * zLit, -38 + 7.2 * zLit], at: [510 + 10 * zLit, 540 - 20 * zLit]};
  const fl = prog(t, tInund - 0.3, 0.8) * (1 - zCon);
  const fills: Record<string, {c: string; o: number}> = {
    'Santa Fe': {c: 'url(#flood)', o: Math.max(fl, prog(t, tCuatro - 0.2, 0.4) * (1 - zCon))},
    'Entre Ríos': {c: 'url(#flood)', o: fl * 0.75},
    Corrientes: {c: 'url(#flood)', o: fl * 0.75},
    Chaco: {c: 'url(#flood)', o: fl * 0.6},
  };
  const q = prog(t, tQ(t), 0);
  const stat = (t0: number, big: React.ReactNode, lab: string, color = N.text) => (
    <div style={{opacity: prog(t, t0 - 0.2, 0.4) * (1 - zCon), transform: `translateX(${(1 - prog(t, t0 - 0.2, 0.5)) * 60}px)`, marginBottom: 34}}>
      <div style={{fontFamily: F.head, fontSize: 118, lineHeight: 1, color}}>{big}</div>
      <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 26, letterSpacing: 4, color: N.mute, marginTop: 6}}>{lab}</div>
    </div>
  );
  const sh = shake(t, tAnio, 8, 0.4);
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      <Ocean glow="rgba(46,127,208,0.16)" />
      <AbsoluteFill style={{opacity: prog(t, -0.3, 0.8), transform: `translate(${sh.x}px,${sh.y}px)`}}>
        <ArgMap cam={cam} fills={fills} rivers={prog(t, tLit, 1.0)} labels={{'Santa Fe': prog(t, tSF - 0.3, 0.4) * (1 - zCon), 'Entre Ríos': fl * (1 - zCon), Corrientes: fl * (1 - zCon), Chaco: fl * (1 - zCon)}} t={t}>
          {(proj) => {
            const [cx, cy] = proj(PLACES.Concordia)!;
            const a = prog(t, tUru - 0.2, 0.5);
            return (
              <>
                <FloodDefs t={t} />
                {zCon > 0 ? (
                  <g opacity={a}>
                    <circle cx={cx} cy={cy} r={12} fill={N.yellow} stroke="#000" strokeWidth={3} />
                    <text x={cx - 24} y={cy + 8} textAnchor="end" fill="#fff" fontFamily="Anton" fontSize={46} style={{paintOrder: 'stroke'}} stroke="rgba(4,10,17,0.9)" strokeWidth={8}>
                      CONCORDIA
                    </text>
                    <text x={cx + 90} y={cy - 170} fill="#9ED9FF" fontFamily="Inter" fontWeight={800} fontSize={24} letterSpacing={4}>
                      RÍO URUGUAY
                    </text>
                  </g>
                ) : null}
              </>
            );
          }}
        </ArgMap>
      </AbsoluteFill>
      {/* pregunta de apertura */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', opacity: 1 - prog(t, tAnio - 0.3, 0.4)}}>
        <Headline t={t} t0={-0.2} size={96} text="¿Y qué nos pasó la última vez?" style={{textShadow: '0 6px 30px rgba(0,0,0,0.6)'}} />
      </div>
      {/* 1998 */}
      <div style={{position: 'absolute', left: 1020, top: 110, width: 820, opacity: 1 - prog(t, t15 - 0.45, 0.3)}}>
        <div style={{fontFamily: F.head, fontSize: 210, lineHeight: 0.9, color: N.yellow, opacity: prog(t, tAnio - 0.1, 0.2) * (1 - zCon), transform: `scale(${1.3 - 0.3 * pop(t, tAnio - 0.1)})`, transformOrigin: 'left top'}}>1998</div>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: N.text, marginBottom: 40, opacity: prog(t, tLit, 0.4) * (1 - zCon)}}>EL LITORAL BAJO EL AGUA</div>
        {stat(tCiento, <Num t={t} t0={tCiento - 0.2} t1={tCiento + 0.8} to={120000} />, 'EVACUADOS')}
        {stat(tDiec, '17', 'MUERTOS', N.red)}
        {stat(tCuatro, <Num t={t} t0={tCuatro - 0.2} t1={tBajo + 0.2} to={4} suffix=" M ha" />, 'BAJO EL AGUA EN SANTA FE', '#8CC8FF')}
        <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 26, color: N.mute, marginTop: -16, opacity: prog(t, tSF, 0.4) * (1 - zCon)}}>≈ 30 % de la superficie de la provincia</div>
      </div>
      {/* 2015 · Concordia */}
      {zCon > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: fo}}>
          <div style={{position: 'absolute', left: 1060, top: 110, opacity: prog(t, t15 - 0.1, 0.3)}}>
            <div style={{fontFamily: F.head, fontSize: 210, lineHeight: 0.9, color: N.yellow, transform: `scale(${1.3 - 0.3 * pop(t, t15 - 0.1)})`, transformOrigin: 'left top'}}>2015</div>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: N.text}}>CRECE EL RÍO URUGUAY</div>
          </div>
          <CityBlocks t={t} t0={tTapo - 0.2} tFill={tCuarto} x={1070} y={420} />
          <div style={{position: 'absolute', left: 1070, top: 780, opacity: prog(t, tVeinte - 0.2, 0.4)}}>
            <div style={{fontFamily: F.head, fontSize: 96, color: N.text, lineHeight: 1}}>
              <Num t={t} t0={tVeinte - 0.2} t1={tVeinte + 0.7} to={20000} /> <span style={{fontSize: 48, color: N.mute}}>EVACUADOS</span>
            </div>
            <svg width={760} height={90} style={{marginTop: 10}}>
              {Array.from({length: 20}).map((_, i) => {
                const p = pop(t, tVeinte + 0.1 + i * 0.05);
                return (
                  <g key={i} transform={`translate(${20 + i * 37},${50}) scale(${Math.max(0, p)})`}>
                    <circle cx={0} cy={-26} r={9} fill={N.text} />
                    <path d="M-12 12 L-12 -6 Q0 -16 12 -6 L12 12 Z" fill={N.text} />
                  </g>
                );
              })}
            </svg>
            <div style={{fontFamily: F.mono, fontSize: 17, color: N.mute}}>cada figura = 1.000 personas</div>
          </div>
        </div>
      ) : null}
      <Src t={t} t0={tAnio} text={zCon > 0 ? 'Fuentes: Infobae, La Nación (2015-16)' : 'Fuentes: CEPAL; SINAE; registros de la inundación de 1998'} />
      <Vignette k={0.4} />
    </AbsoluteFill>
  );
};
const tQ = (t: number) => t;

/** manzanas de la ciudad; un cuarto se inunda desde el río (este) */
const CityBlocks: React.FC<{t: number; t0: number; tFill: number; x: number; y: number}> = ({t, t0, tFill, x, y}) => {
  const cols = 12, rows = 6, bw = 50, gap = 10;
  const a = prog(t, t0, 0.5);
  const f = easeOut(clamp((t - tFill + 0.2) / 1.2));
  const W = cols * (bw + gap);
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: a, transform: `translateY(${(1 - a) * 30}px)`}}>
      <svg width={W + 120} height={rows * (bw + gap) + 20}>
        {Array.from({length: rows * cols}).map((_, i) => {
          const c = i % cols, r = Math.floor(i / cols);
          const wet = c >= cols * (1 - 0.25 * f) - 0.01;
          return <rect key={i} x={c * (bw + gap)} y={r * (bw + gap)} width={bw} height={bw} rx={4} fill={wet ? 'url(#flood2)' : '#2A3A4D'} stroke={wet ? '#8CC8FF' : 'rgba(200,225,245,0.25)'} />;
        })}
        <rect x={W} y={-10} width={110} height={rows * (bw + gap) + 30} fill="#2E7FD0" opacity={0.85} />
        <defs>
          <pattern id="flood2" width={40} height={16} patternUnits="userSpaceOnUse" patternTransform={`translate(${(t * 30) % 40},0)`}>
            <rect width={40} height={16} fill="#2E7FD0" />
            <path d="M0 8 Q10 2 20 8 T40 8" fill="none" stroke="#8CC8FF" strokeWidth={2} opacity={0.7} />
          </pattern>
        </defs>
      </svg>
      <div style={{position: 'absolute', left: W * 0.75 - 10, top: -54, fontFamily: F.head, fontSize: 44, color: '#8CC8FF', opacity: prog(t, tFill, 0.4), whiteSpace: 'nowrap'}}>1/4 DE LA CIUDAD</div>
    </div>
  );
};

/* =====================================================================
   S07 — El pronóstico para el verano
   ===================================================================== */
const STRONG = ['Misiones', 'Corrientes', 'Chaco', 'Formosa', 'Santa Fe', 'Entre Ríos'];
const MOD = ['Buenos Aires', 'Ciudad de Buenos Aires', 'Córdoba', 'La Pampa', 'San Luis', 'Mendoza', 'Neuquén', 'Río Negro'];
const DRY = ['Jujuy', 'Salta', 'Tucumán', 'Catamarca', 'Tierra del Fuego'];

export const S07: React.FC<P> = ({t}) => {
  const s = 's07';
  const tPron = cue(s, 'pronósticos'), tLluv = cue(s, 'Lluvias'), tGran = cue(s, 'gran parte'), tPar = cue(s, 'Paraná'), tVig = cue(s, 'vigilancia.');
  const tCambio = cue(s, 'En cambio,'), tNoa = cue(s, 'noroeste'), tSur = cue(s, 'extremo'), tMenos = cue(s, 'menos');
  const tProv = STRONG.map((p) => cue(s, p === 'Santa Fe' ? 'Santa Fe' : p === 'Entre Ríos' ? 'Entre Ríos.' : p + ','));
  // arranca con zoom desde Concordia (continuidad con S06) y abre a todo el país
  const zo = ramp(t, -0.4, 1.3);
  const box: [number, number, number, number] = [470, 30, 1250, 1050];
  const cam: ArgCam = {box, z: 7 - 6 * zo, focus: [PLACES.Concordia[0] * (1 - zo) + -64 * zo, PLACES.Concordia[1] * (1 - zo) + -38 * zo], at: [520 + (860 - 520) * zo, 520 + 20 * zo]};
  const fills: Record<string, {c: string; o: number}> = {};
  MOD.forEach((p, i) => (fills[p] = {c: '#3F86C9', o: 0.7 * prog(t, tGran - 0.4 + i * 0.05, 0.5)}));
  STRONG.forEach((p, i) => (fills[p] = {c: '#1F5FB4', o: Math.max(0.7 * prog(t, tGran - 0.4, 0.5), prog(t, tProv[i] - 0.15, 0.3))}));
  DRY.forEach((p, i) => (fills[p] = {c: N.dry, o: 0.9 * prog(t, (p === 'Tierra del Fuego' ? tSur : tNoa) - 0.2 + i * 0.05, 0.5)}));
  const labels: Record<string, number> = {};
  STRONG.forEach((p, i) => (labels[p] = prog(t, tProv[i] - 0.15, 0.3)));
  const nasa = Math.min(prog(t, tPar - 0.3, 0.5), 1 - prog(t, tCambio - 0.2, 0.4));
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      <Ocean glow="rgba(63,134,201,0.16)" />
      <ArgMap cam={cam} fills={fills} labels={labels} rivers={1} riverColor={t > tPar - 0.2 ? '#7FE0FF' : '#5CC8FF'} t={t}>
        {(proj) => {
          const [x0, y0] = proj([-62.5, -24])!;
          const [x1, y1] = proj([-53.5, -33.5])!;
          const rainO = prog(t, tProv[0] - 0.2, 0.6);
          return (
            <g opacity={rainO}>
              <Rain t={t} x={x0} y={y0} w={x1 - x0} h={y1 - y0} n={90} color="#A9D8FF" />
            </g>
          );
        }}
      </ArgMap>
      <Kicker t={t} t0={0.2} text="Pronóstico · primavera y verano 2026-27" />
      <div style={{position: 'absolute', left: 110, top: 140, width: 420}}>
        <Headline t={t} t0={tPron} size={70} text="Así pintan el mapa" />
      </div>
      {/* leyenda */}
      <div style={{position: 'absolute', left: 110, top: 420}}>
        {[
          ['#1F5FB4', 'Mucha más lluvia', tProv[0] - 0.3],
          ['#3F86C9', 'Más lluvia de lo normal', tGran - 0.3],
          ['#1C2A3A', 'Normal', tGran],
          [N.dry, 'Menos lluvia', tNoa - 0.2],
        ].map(([c, l, tt]) => (
          <div key={l as string} style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18, opacity: prog(t, tt as number, 0.4)}}>
            <div style={{width: 34, height: 34, borderRadius: 6, background: c as string, border: '2px solid rgba(210,230,245,0.5)'}} />
            <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 28, color: N.text}}>{l as string}</div>
          </div>
        ))}
      </div>
      <Tag t={t} t0={tPar + 0.2} t1={tCambio} x={1080} y={560} dx={170} dy={-120} size={58} title="Paraná y Uruguay" value="BAJO VIGILANCIA" color="#7FE0FF" dot={false} />
      {/* el último Súper Niño visto desde el espacio */}
      {nasa > 0 ? (
        <div style={{position: 'absolute', left: 1330, top: 560, opacity: nasa, transform: `translateY(${(1 - nasa) * 40}px)`}}>
          <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 18, letterSpacing: 3, color: N.mute, marginBottom: 10}}>EL ÚLTIMO SÚPER NIÑO, DESDE EL ESPACIO</div>
          <div style={{display: 'flex', gap: 12}}>
            {[
              ['nasa_paraguay_2014.jpg', 'ENE 2014'],
              ['nasa_paraguay_2016.jpg', 'ENE 2016'],
            ].map(([f, l], i) => (
              <div key={f} style={{position: 'relative', width: 250, height: 250, borderRadius: 6, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', clipPath: `inset(0 ${(1 - prog(t, tPar - 0.2 + i * 0.5, 0.6)) * 100}% 0 0)`}}>
                <Img src={staticFile(`ep04/img/${f}`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '40% 55%', transform: `scale(${i ? 1.05 : 1.35})`}} />
                <div style={{position: 'absolute', left: 8, top: 8, background: i ? N.hot : 'rgba(4,10,17,0.8)', color: '#fff', fontFamily: F.body, fontWeight: 800, fontSize: 18, padding: '3px 10px', letterSpacing: 2}}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{fontFamily: F.mono, fontSize: 15, color: 'rgba(210,225,238,0.6)', marginTop: 8}}>Río Paraguay, Asunción y Formosa · NASA EO-1 ALI</div>
        </div>
      ) : null}
      <Tag t={t} t0={tNoa} x={proj0(cam, [-65.5, -24.5])[0]} y={proj0(cam, [-65.5, -24.5])[1]} dx={380} dy={-150} size={46} title="Noroeste" value="MENOS LLUVIA" color={N.dry} />
      <Tag t={t} t0={tSur} x={proj0(cam, [-68.3, -54.2])[0]} y={proj0(cam, [-68.3, -54.2])[1]} dx={260} dy={-110} size={46} title="Extremo sur" value="MENOS LLUVIA" color={N.dry} />
      <Src t={t} t0={0.5} text="Fuentes: SMN, CRC-SAS, ECMWF (pronósticos trimestrales, sept. 2026). Mapa ilustrativo." />
      <Vignette k={0.35} />
    </AbsoluteFill>
  );
};
import {argProj} from './argmap';
const proj0 = (cam: ArgCam, p: [number, number]) => argProj(cam)(p) ?? [0, 0];

/* =====================================================================
   S08 — Lo bueno y lo malo: campo, nieve en Cuyo, dengue
   ===================================================================== */
export const S08: React.FC<P> = ({t}) => {
  const s = 's08';
  const tNo = cue(s, 'No todo'), tSeq = cue(s, 'sequía histórica'), t23 = cue(s, 'veintitrés,'), tAgua = cue(s, 'el agua'), tCampo = cue(s, 'campo.');
  const tCuyo = cue(s, 'Cuyo,'), tNieve = cue(s, 'nieve'), tAliv = cue(s, 'aliviar'), tDec = cue(s, 'década.'), tPero = cue(s, 'Pero');
  const tLluvia = cue(s, 'más lluvia'), tCalor = cue(s, 'más calor'), tMosq = cue(s, 'mosquitos.'), tEllos = cue(s, 'con ellos,'), tDengue = cue(s, 'dengue.');
  // carrusel de 3 paneles
  const p1 = ramp(t, tCuyo - 0.6, tCuyo + 0.1);
  const p2 = ramp(t, tPero - 0.5, tPero + 0.2);
  const off = -(p1 + p2) * 1920;
  const panel = (i: number, node: React.ReactNode) => (
    <AbsoluteFill style={{transform: `translateX(${off + i * 1920}px)`}}>{node}</AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{background: N.bg0, overflow: 'hidden'}}>
      {panel(
        0,
        <AbsoluteFill>
          <Ocean glow="rgba(57,208,200,0.12)" />
          <Kicker t={t} t0={-0.2} text="Lo que puede traer de bueno" color={N.teal} />
          <div style={{position: 'absolute', left: 110, top: 150}}>
            <Headline t={t} t0={-0.1} size={96} text="No todo es malo" />
          </div>
          <div style={{position: 'absolute', left: 110, top: 330, width: 820}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 28, letterSpacing: 4, color: N.mute, opacity: prog(t, tSeq - 0.2, 0.4)}}>DESPUÉS DE LA SEQUÍA HISTÓRICA DE</div>
            <div style={{fontFamily: F.head, fontSize: 150, lineHeight: 1, color: N.dry, opacity: prog(t, t23 - 0.2, 0.3), transform: `scale(${0.8 + 0.2 * pop(t, t23 - 0.2)})`, transformOrigin: 'left'}}>2022-23</div>
            <div style={{marginTop: 40, opacity: prog(t, tAgua - 0.2, 0.4), display: 'flex', alignItems: 'center', gap: 20}}>
              <svg width={90} height={90} viewBox="-45 -45 90 90">
                <circle r={42} fill={N.teal} />
                <path d="M-18 2 L-5 15 L20 -14" stroke={N.bg0} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div style={{fontFamily: F.head, fontSize: 64, color: N.text, lineHeight: 1}}>
                EL AGUA ES UNA
                <br />
                <span style={{color: N.teal}}>GRAN NOTICIA PARA EL CAMPO</span>
              </div>
            </div>
          </div>
          <Frame src="img/ep04/sequia_nasa.jpg" t={t} t0={0.25} x={1380} y={500} w={760} h={760} focus="50% 50%" zoom={[1, 1.06]} enter="clip" credit="Pampa húmeda: sept. 2018 vs. sept. 2022 · Copernicus Sentinel-2">
            <div style={{position: 'absolute', left: 16, top: 16, background: 'rgba(4,10,17,0.8)', color: '#fff', fontFamily: F.body, fontWeight: 800, fontSize: 20, padding: '4px 12px', letterSpacing: 2}}>2018</div>
            <div style={{position: 'absolute', left: 16, top: 396, background: N.dry, color: '#fff', fontFamily: F.body, fontWeight: 800, fontSize: 20, padding: '4px 12px', letterSpacing: 2}}>2022 · SEQUÍA</div>
          </Frame>
        </AbsoluteFill>,
      )}
      {panel(
        1,
        <AbsoluteFill>
          <Frame src="img/ep04/andes_mendoza.jpg" t={t} t0={tCuyo - 1} x={960} y={540} w={1920} h={1080} radius={0} zoom={[1.2, 1.32]} focus="50% 40%" enter="fade" grade="linear-gradient(180deg, rgba(4,10,17,0.55) 0%, rgba(4,10,17,0.1) 40%, rgba(4,10,17,0.8) 100%)" />
          <Snow t={t} a={prog(t, tNieve - 0.3, 0.6)} />
          <Kicker t={t} t0={tCuyo - 0.2} text="Cuyo · Mendoza y San Juan" color={N.text} />
          <div style={{position: 'absolute', left: 110, top: 150}}>
            <Headline t={t} t0={tNieve - 0.3} size={110} text="Más nieve en la cordillera" hl={['nieve']} hlColor="#BFE6FF" />
          </div>
          <div style={{position: 'absolute', left: 110, bottom: 130, width: 1100, opacity: prog(t, tAliv - 0.3, 0.4)}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 28, letterSpacing: 4, color: N.text, marginBottom: 14}}>PODRÍA ALIVIAR UNA SEQUÍA DE MÁS DE UNA DÉCADA</div>
            <div style={{position: 'relative', height: 20, background: 'rgba(255,255,255,0.18)', borderRadius: 10}}>
              <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${ramp(t, tAliv, tDec + 0.3) * 100}%`, background: N.dry, borderRadius: 10}} />
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 20, color: N.text, marginTop: 8}}>
              <span>2010</span>
              <span>2026</span>
            </div>
          </div>
          <Src t={t} t0={tCuyo} text="Foto: Itsmemarttin · CC BY-SA 3.0" x={1810} align="right" />
        </AbsoluteFill>,
      )}
      {panel(
        2,
        <AbsoluteFill>
          <Frame src="img/ep04/aedes.jpg" t={t} t0={tPero - 1} x={960} y={540} w={1920} h={1080} radius={0} zoom={[1.08, 1.3]} focus="62% 40%" enter="fade" grade="linear-gradient(90deg, rgba(4,10,17,0.92) 0%, rgba(4,10,17,0.6) 45%, rgba(4,10,17,0) 75%)" />
          <Kicker t={t} t0={tPero - 0.1} text="Lo que preocupa" color={N.red} />
          <div style={{position: 'absolute', left: 110, top: 180, width: 900}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 22, fontFamily: F.head, fontSize: 84, color: N.text, lineHeight: 1}}>
              <span style={{opacity: prog(t, tLluvia - 0.2, 0.3), color: N.rain}}>+ LLUVIA</span>
              <span style={{opacity: prog(t, tCalor - 0.2, 0.3), color: N.hot}}>+ CALOR</span>
            </div>
            <div style={{fontFamily: F.head, fontSize: 150, color: N.yellow, marginTop: 14, opacity: prog(t, tMosq - 0.3, 0.3), transform: `scale(${0.85 + 0.15 * pop(t, tMosq - 0.3)})`, transformOrigin: 'left'}}>= MOSQUITOS</div>
            <div
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 20, marginTop: 36, background: N.red, padding: '14px 30px', opacity: prog(t, tDengue - 0.6, 0.3),
                transform: `scale(${pop(t, tDengue - 0.6)})`, transformOrigin: 'left', boxShadow: `0 0 ${30 + 20 * Math.sin(t * 8)}px rgba(226,59,46,0.7)`,
              }}
            >
              <svg width={64} height={58} viewBox="0 0 64 58">
                <path d="M32 3 L62 55 L2 55 Z" fill="#fff" />
                <rect x={29} y={20} width={6} height={20} fill={N.red} />
                <rect x={29} y={44} width={6} height={6} fill={N.red} />
              </svg>
              <div style={{fontFamily: F.head, fontSize: 76, color: '#fff'}}>RIESGO DE DENGUE</div>
            </div>
          </div>
          <Src t={t} t0={tPero} text="Aedes aegypti · James Gathany, CDC · dominio público" x={1810} align="right" />
        </AbsoluteFill>,
      )}
    </AbsoluteFill>
  );
};

const Snow: React.FC<{t: number; a: number}> = ({t, a}) =>
  a <= 0 ? null : (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: a}}>
      {Array.from({length: 90}).map((_, i) => {
        const rx = ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;
        const ph = ((Math.sin(i * 78.233) * 12345.678) % 1 + 1) % 1;
        const sp = 0.05 + ph * 0.06;
        const y = (((t * sp + ph) % 1) + 1) % 1 * 1140 - 30;
        const x = rx * 1920 + Math.sin(t * 1.3 + i) * 20;
        return <circle key={i} cx={x} cy={y} r={2 + (i % 3)} fill="#fff" opacity={0.8} />;
      })}
    </svg>
  );

/* =====================================================================
   S09 — Algo más grande: océanos recalentados y el récord
   ===================================================================== */
export const S09: React.FC<P> = ({t}) => {
  const s = 's09';
  const tSuma = cue(s, 'suma calor'), tRecal = cue(s, 'recalentado.'), tTemp = cue(s, 'temperatura'), tRec = cue(s, 'récord:'), tVein = cue(s, 'veintiún'), tDec = cue(s, 'décimo.');
  const tSup = cue(s, 'Súper Niño'), tCient = cue(s, 'científicos'), tNuevos = cue(s, 'nuevos'), tCalor = cue(s, 'calor.', 1);
  const shrink = ramp(t, tTemp - 0.4, tTemp + 0.6);
  const stripeH = 1080 - 820 * shrink;
  const stripeY = 820 * shrink;
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      <Stripes t={t} t0={-0.3} tLine={tRecal - 0.6} h={stripeH} y={stripeY} />
      <AbsoluteFill style={{opacity: 1 - shrink, pointerEvents: 'none'}}>
        <div style={{position: 'absolute', left: 110, top: 110}}>
          <div style={{position: 'absolute', left: -30, top: -24, width: 1000, height: 250, background: 'radial-gradient(ellipse at 30% 50%, rgba(4,10,17,0.55), rgba(4,10,17,0) 70%)'}} />
          <Kicker t={t} t0={-0.1} x={0} y={0} text="Temperatura de los océanos · 1850–2026" color="#fff" />
          <div style={{marginTop: 70}}>
            <Headline t={t} t0={tSuma - 0.2} size={100} text="Un planeta recalentado" style={{textShadow: '0 4px 30px rgba(0,0,0,0.6)'}} />
          </div>
        </div>
        <div style={{position: 'absolute', left: 30, bottom: 40, fontFamily: F.head, fontSize: 60, color: '#fff', opacity: prog(t, 0.6, 0.4)}}>1850</div>
        <div style={{position: 'absolute', right: 30, bottom: 40, fontFamily: F.head, fontSize: 60, color: '#fff', opacity: prog(t, 2.4, 0.4)}}>2026</div>
      </AbsoluteFill>
      {shrink > 0 ? (
        <AbsoluteFill style={{opacity: shrink}}>
          <Globe view={{lon: -130 + t * 6, lat: 5, r: 330, cx: 1460, cy: 420}} tex="sst2026" />
          <Kicker t={t} t0={tTemp - 0.2} text="Temperatura promedio de la superficie del mar" />
          <div style={{position: 'absolute', left: 110, top: 170}}>
            <div style={{fontFamily: F.head, fontSize: 290, lineHeight: 1, color: N.text, fontVariantNumeric: 'tabular-nums'}}>
              <Num t={t} t0={tVein - 0.6} t1={tDec + 0.2} from={20.4} to={21.1} dec={1} />
              <span style={{fontSize: 150, color: N.hot}}>°C</span>
            </div>
            <div style={{display: 'inline-block', marginTop: 6, background: N.hot, color: N.bg0, fontFamily: F.head, fontSize: 64, padding: '2px 22px', transform: `scale(${pop(t, tRec - 0.1)}) rotate(-3deg)`, transformOrigin: 'left'}}>RÉCORD</div>
          </div>
          <div style={{position: 'absolute', left: 110, top: 600, display: 'flex', alignItems: 'center', gap: 24, fontFamily: F.head, fontSize: 70, color: N.text}}>
            <span style={{opacity: prog(t, tSup - 0.3, 0.3)}}>+ SÚPER NIÑO</span>
            <span style={{opacity: prog(t, tNuevos - 0.2, 0.3), color: N.yellow}}>= NUEVOS RÉCORDS</span>
          </div>
          <Src t={t} t0={tTemp} text="NOAA NCEI (anomalía anual del océano, base 1901-2000; 2026 = ene-ago) · La Nación / OMM" y={782} />
        </AbsoluteFill>
      ) : null}
      {/* franja del futuro */}
      {t > tNuevos - 0.3 ? (
        <div
          style={{
            position: 'absolute', right: 0, top: stripeY, width: 28, height: stripeH, background: '#FF2A2A',
            boxShadow: `0 0 ${40 + 30 * Math.sin(t * 7)}px #FF2A2A`, opacity: prog(t, tNuevos - 0.3, 0.3),
          }}
        />
      ) : null}
      <Flash t={t} at={tCalor} color={N.hot} max={0.25} />
    </AbsoluteFill>
  );
};

/* =====================================================================
   S10 — Cierre: del océano a tu techo, ¿vamos a estar preparados? + LOGO
   ===================================================================== */
export const S10: React.FC<P & {total: number}> = ({t, total}) => {
  const s = 's10';
  const tCont = cue(s, 'continente'), tSentir = cue(s, 'sentir'), tTecho = cue(s, 'techo,'), tCosecha = cue(s, 'cosecha'), tFactura = cue(s, 'factura');
  const tYa = cue(s, 'El Súper Niño'), tPreg = cue(s, 'La pregunta'), tPrep = cue(s, 'preparados.'), tSi = cue(s, 'Si te'), tSusc = cue(s, 'suscribite');
  const tComp = cue(s, 'compartilo'), tLit = cue(s, 'Litoral.'), tNos = cue(s, 'Nos vemos');
  const cards = Math.min(prog(t, tSentir - 0.3, 0.4), 1 - prog(t, tYa - 0.4, 0.4));
  const endC = prog(t, tSi - 0.4, 0.8);
  const gz = ramp(t, -0.5, tCont + 0.5);
  const view = {lon: -140 + t * 4, lat: 0, r: 520 - 120 * endC + 40 * gz, cx: 960, cy: 560};
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      <Ocean glow="rgba(30,90,150,0.3)" />
      <AbsoluteFill style={{opacity: 1 - endC * 0.85, filter: cards > 0 || t > tYa ? `blur(${Math.max(cards, prog(t, tYa, 0.4) * (1 - endC)) * 6}px)` : undefined}}>
        <Globe view={view} tex="sst2026">
          {(proj, path) => (
            <path
              d={path({type: 'Polygon', coordinates: [[[-180, -8], [-80, -8], [-80, 8], [-180, 8], [-180, -8]]]} as any) ?? ''}
              fill="none" stroke={N.yellow} strokeWidth={4} strokeDasharray="10 8" opacity={Math.min(prog(t, tCont - 0.4, 0.5), 1 - cards)}
            />
          )}
        </Globe>
      </AbsoluteFill>
      <Tag t={t} t0={tCont - 0.3} t1={tSentir - 0.1} x={960} y={420} dx={260} dy={-190} size={64} title="Un pedazo de océano" value="DEL TAMAÑO DE UN CONTINENTE" dot={false} />
      {/* tres tarjetas */}
      {cards > 0 ? (
        <AbsoluteFill style={{opacity: cards, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 60}}>
          {[
            ['TU TECHO', tTecho, <HouseIcon key="h" t={t} />],
            ['LA COSECHA', tCosecha, <WheatIcon key="w" />],
            ['TU FACTURA DE LUZ', tFactura, <BillIcon key="b" />],
          ].map(([l, tt, ic]) => (
            <div key={l as string} style={{width: 440, height: 480, background: 'rgba(14,34,54,0.92)', border: `2px solid ${N.line}`, borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `translateY(${(1 - pop(t, tt as number)) * 80}px) scale(${0.85 + 0.15 * clamp(pop(t, tt as number))})`, opacity: clamp((t - (tt as number)) / 0.15), boxShadow: '0 30px 60px rgba(0,0,0,0.5)'}}>
              {ic as React.ReactNode}
              <div style={{fontFamily: F.head, fontSize: 56, color: N.text, marginTop: 30, textAlign: 'center'}}>{l as string}</div>
            </div>
          ))}
        </AbsoluteFill>
      ) : null}
      {/* ya está acá / ¿preparados? */}
      {t > tYa - 0.2 && endC < 1 ? (
        <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 1 - endC}}>
          <div style={{opacity: 1 - prog(t, tPreg - 0.3, 0.4), transform: `scale(${1.1 - 0.1 * prog(t, tYa - 0.2, 0.8)})`, position: 'absolute'}}>
            <HeatText text="Ya está acá" size={230} t={t} />
          </div>
          <div style={{opacity: prog(t, tPreg - 0.2, 0.4), position: 'absolute', textAlign: 'center'}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 34, letterSpacing: 10, color: N.text, marginBottom: 30, textShadow: '0 2px 16px rgba(0,0,0,0.9)'}}>LA PREGUNTA ES</div>
            <Headline t={t} t0={tPreg + 0.2} size={120} text="¿Esta vez vamos a estar preparados?" hl={['preparados?']} style={{maxWidth: 1500, textAlign: 'center'}} />
          </div>
        </AbsoluteFill>
      ) : null}
      {/* placa final con el logo */}
      {t > tSi - 0.5 ? <EndCard t={t} t0={tSi - 0.2} tSusc={tSusc} tComp={tComp} tNos={tNos} total={total} /> : null}
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{t: number; t0: number; tSusc: number; tComp: number; tNos: number; total: number}> = ({t, t0, tSusc, tComp, tNos, total}) => {
  // 1) el logo (variante transparente) aterriza sobre el globo; 2) se arma la pantalla final sobre fondo oscuro
  const move = ramp(t, tNos - 1.6, tNos - 0.6);
  const size = 380 - 110 * move;
  const lx = 960 - size / 2 - 560 * move;
  const ly = 330 - 130 * move;
  const bg = prog(t, tNos - 1.6, 0.8);
  const fadeOut = prog(t, total - 0.6, 0.6);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: '#0B0B0C', opacity: bg}} />
      <AbsoluteFill style={{opacity: bg * 0.5, background: 'radial-gradient(ellipse at 30% 50%, rgba(255,204,51,0.10) 0%, rgba(0,0,0,0) 60%)'}} />
      <div style={{position: 'absolute', left: lx, top: ly}}>
        <LogoMark size={size} t={t} t0={t0} />
      </div>
      <div style={{position: 'absolute', left: -560 * move, right: 560 * move, top: 760 - 270 * move, textAlign: 'center', opacity: prog(t, t0 + 0.5, 0.5)}}>
        <div style={{fontFamily: F.head, fontSize: 110 - 30 * move, color: '#fff', letterSpacing: 6}}>CONTEXTO</div>
      </div>
      {/* botón suscribirse */}
      <div style={{position: 'absolute', left: 960 - 190 - 560 * move, top: 890 - 240 * move, opacity: prog(t, tSusc - 0.2, 0.3), transform: `scale(${pop(t, tSusc - 0.2)})`}}>
        <div style={{width: 380, height: 84, background: N.red, borderRadius: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 34, letterSpacing: 3, color: '#fff', boxShadow: '0 10px 30px rgba(226,59,46,0.45)'}}>
          SUSCRIBITE
        </div>
      </div>
      {/* compartir */}
      <div style={{position: 'absolute', left: 960 - 330 - 560 * move, top: 1000 - 240 * move, width: 660, textAlign: 'center', opacity: prog(t, tComp - 0.2, 0.3) * (1 - move * 0.2), fontFamily: F.body, fontWeight: 700, fontSize: 28, color: N.mute}}>
        Compartilo con alguien del Litoral
      </div>
      {/* pantalla final: espacios para los videos sugeridos */}
      <div style={{position: 'absolute', left: 1010, top: 170, opacity: prog(t, tNos - 0.6, 0.5)}}>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 26, letterSpacing: 6, color: N.mute, marginBottom: 16}}>SEGUÍ MIRANDO</div>
        {[0, 1].map((i) => (
          <div key={i} style={{width: 760, height: 330, marginBottom: 40, borderRadius: 10, border: '3px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.04)', transform: `translateX(${(1 - prog(t, tNos - 0.5 + i * 0.15, 0.6)) * 80}px)`}} />
        ))}
      </div>
      <div style={{position: 'absolute', left: 50, top: 850, width: 700, textAlign: 'center', opacity: prog(t, tNos, 0.5), fontFamily: F.head, fontSize: 56, color: '#fff'}}>NOS VEMOS EN EL PRÓXIMO VIDEO</div>
      <AbsoluteFill style={{background: '#000', opacity: fadeOut}} />
    </AbsoluteFill>
  );
};

/* ---------- íconos de cierre ---------- */
const HouseIcon: React.FC<{t: number}> = ({t}) => (
  <svg width={220} height={200} viewBox="-110 -110 220 200">
    <Cloud x={10} y={-70} s={0.9} color="#DCE8F2" />
    <Rain t={t} x={-50} y={-50} w={110} h={60} n={10} />
    <path d="M-70 10 L0 -40 L70 10" fill="none" stroke={N.text} strokeWidth={10} strokeLinejoin="round" />
    <rect x={-52} y={8} width={104} height={72} fill="none" stroke={N.text} strokeWidth={10} />
    <rect x={-14} y={36} width={28} height={44} fill={N.text} />
  </svg>
);
const WheatIcon: React.FC = () => (
  <svg width={220} height={200} viewBox="-110 -110 220 200">
    {[-40, 0, 40].map((x, j) => (
      <g key={j} transform={`translate(${x},0) rotate(${j * 10 - 10})`}>
        <line x1={0} y1={-80} x2={0} y2={80} stroke={N.yellow} strokeWidth={6} />
        {[-70, -48, -26, -4].map((y) => (
          <g key={y}>
            <ellipse cx={-10} cy={y} rx={8} ry={14} transform={`rotate(-30 -10 ${y})`} fill={N.yellow} />
            <ellipse cx={10} cy={y} rx={8} ry={14} transform={`rotate(30 10 ${y})`} fill={N.yellow} />
          </g>
        ))}
      </g>
    ))}
  </svg>
);
const BillIcon: React.FC = () => (
  <svg width={220} height={200} viewBox="-110 -110 220 200">
    <rect x={-64} y={-90} width={128} height={170} rx={8} fill="none" stroke={N.text} strokeWidth={8} />
    {[-60, -40, -20].map((y) => (
      <line key={y} x1={-40} y1={y} x2={40} y2={y} stroke={N.mute} strokeWidth={6} />
    ))}
    <path d="M8 -2 L-22 42 L0 42 L-10 76 L26 26 L4 26 L16 -2 Z" fill={N.yellow} />
  </svg>
);
