/* Short vertical (1080x1920) "¿4 millones se van del conurbano?".
   Abre con el clip de Sturzenegger en Bloomberg Línea, la narración lo congela ("Pará, pará, pará") y después
   chequea el número con mapas y datos del censo. Tiempos en data/s4m/timeline.json (tools/timeline_s4m.py). */
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {F} from '../theme';
import {Grain} from '../components/base';
import {clamp, easeOut, fmt, pop, prog, rnd, shake} from '../lib/anim';
import {Flash, Frame, Headline, LogoMark, N, Num, Ocean} from '../ep04/kit';
import {TL, cue} from './lib';
import {
  ArgMap, Big, Building, Captions, Chip, Factory, Flow, HBar, K, Kick, MapTag, P, PeopleGrid, Pickaxe, Pin, Pumpjack,
  Src, Top, TopShade, VH, VW, VWipe, lerpArr, mapCam, ramp, win,
} from './kit';

const S = TL.starts;
const seg = (T: number) => {
  let cur = '';
  for (const k of Object.keys(S)) if (T >= S[k] - 0.2) cur = k;
  return cur;
};

/* =====================================================================
   Gancho: clip de Bloomberg Línea + "Pará, pará, pará"
   ===================================================================== */
const Hook: React.FC<{T: number}> = ({T}) => {
  const fz = TL.clip.freeze;
  const ts = T - S.s01;
  const paras = [0, 1, 2].map((i) => cue('s01', 'pará', i));
  const n = paras.filter((p) => ts >= p - 0.05).length;
  const punch = T < fz ? 1 : 1 + 0.07 * n - 0.03 * (1 - pop(ts, paras[Math.max(0, n - 1)] - 0.05, 1.6));
  const sh = n > 0 ? shake(ts, paras[n - 1] - 0.03, 16, 0.3) : {x: 0, y: 0};
  const gray = T < fz ? 0 : clamp(0.35 + 0.22 * n);
  const lt = win(T, 0.35, fz + 0.1, 0.4, 0.2);
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      <AbsoluteFill style={{filter: 'blur(38px) brightness(0.38) saturate(0.8)', transform: 'scale(1.2)'}}>
        <Img src={staticFile('s4m/freeze.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 0, top: 150, width: VW, height: 1156, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.6)'}}>
        <div style={{position: 'absolute', inset: 0, transform: `translate(${sh.x}px, ${sh.y}px) scale(${punch})`, transformOrigin: '50% 38%', filter: `grayscale(${gray}) contrast(${1 + 0.15 * gray})`}}>
          {T < fz ? (
            <OffthreadVideo src={staticFile('s4m/clip.mp4')} muted style={{width: '100%', height: '100%'}} />
          ) : (
            <Img src={staticFile('s4m/freeze.jpg')} style={{width: '100%', height: '100%'}} />
          )}
        </div>
        {T >= fz ? (
          <>
            {/* líneas de VHS y tinte rojo en cada "pará" */}
            <AbsoluteFill style={{background: 'repeating-linear-gradient(180deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 6px)'}} />
            <AbsoluteFill style={{background: N.red, mixBlendMode: 'multiply', opacity: 0.35 * (1 - prog(ts, paras[Math.max(0, n - 1)], 0.35))}} />
            <div style={{position: 'absolute', right: 60, top: 60, display: 'flex', gap: 16, transform: `scale(${pop(ts, paras[0] - 0.05)})`}}>
              <div style={{width: 34, height: 110, background: '#fff', boxShadow: '0 0 30px rgba(0,0,0,0.6)'}} />
              <div style={{width: 34, height: 110, background: '#fff', boxShadow: '0 0 30px rgba(0,0,0,0.6)'}} />
            </div>
            <div style={{position: 'absolute', left: 60, top: 70, fontFamily: F.mono, fontWeight: 700, fontSize: 40, color: '#fff', letterSpacing: 4, opacity: Math.floor(ts * 3) % 2 === 0 ? 1 : 0.4, textShadow: '0 4px 14px rgba(0,0,0,0.8)'}}>
              ❚❚ PAUSA
            </div>
          </>
        ) : null}
        {/* zócalo */}
        <div style={{position: 'absolute', left: 50, bottom: 70, opacity: lt, transform: `translateX(${(1 - lt) * -40}px)`}}>
          <div style={{display: 'inline-block', background: N.yellow, color: N.bg0, fontFamily: F.head, fontSize: 58, padding: '6px 22px', textTransform: 'uppercase'}}>Federico Sturzenegger</div>
          <div style={{background: 'rgba(4,10,17,0.88)', color: N.text, fontFamily: F.body, fontWeight: 800, fontSize: 28, letterSpacing: 3, padding: '10px 22px', display: 'inline-block', marginTop: 0}}>
            MINISTRO DE DESREGULACIÓN
          </div>
        </div>
      </div>
      <Src text="Entrevista de Bloomberg Línea" y={1236 + 76} o={win(T, 0.3, fz + 0.2)} />
    </AbsoluteFill>
  );
};

/* =====================================================================
   s01 · ¿4 millones?
   ===================================================================== */
const S01: React.FC<{ts: number}> = ({ts}) => {
  const s = 's01';
  const t4 = cue(s, 'Cuatro', 0), t4b = cue(s, 'Cuatro', 1), tPer = cue(s, 'personas'), tVan = cue(s, 'van'), tCon = cue(s, 'conurbano?');
  const tEso = cue(s, 'Eso'), tCba = cue(s, 'Córdoba.'), tProv = cue(s, 'provincia'), tDe = cue(s, 'De dónde'), tPuede = cue(s, 'puede');
  if (ts < tEso - 0.25) {
    const out = ramp(ts, tVan, tCon + 0.6);
    return (
      <AbsoluteFill style={{background: N.bg0}}>
        <Ocean glow="rgba(255,204,51,0.10)" grid={0.18} />
        <Top y={250}>
          <div style={{transform: `scale(${1.3 - 0.3 * pop(ts, t4 - 0.08, 1.2)})`, opacity: prog(ts, t4 - 0.1, 0.12)}}>
            <Big size={172} color={N.yellow}>
              <span style={{color: N.text}}>¿</span>4.000.000<span style={{color: N.text}}>?</span>
            </Big>
          </div>
          <div style={{marginTop: 16, opacity: prog(ts, tPer - 0.2, 0.3)}}>
            <Kick color={N.text}>de personas</Kick>
          </div>
        </Top>
        <svg width={VW} height={VH} style={{position: 'absolute', inset: 0}}>
          <g transform={`translate(${out * 700}, 0)`} opacity={1 - out * 0.9}>
            <PeopleGrid x={104} y={640} cols={20} rows={12} gap={46} p={ramp(ts, t4b - 0.1, tVan, easeOut)} t={ts} s={1.25} />
          </g>
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1190, textAlign: 'center', fontFamily: F.mono, fontSize: 22, color: N.mute, opacity: prog(ts, t4b + 0.4, 0.4) * (1 - out)}}>
          cada figura ≈ 16.700 personas
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', opacity: prog(ts, tCon - 0.3, 0.3)}}>
          <Chip t={ts} t0={tCon - 0.3} text="¿SE VAN DEL CONURBANO?" size={44} />
        </div>
      </AbsoluteFill>
    );
  }
  if (ts < tDe - 0.2) {
    const fills: Record<string, {c: string; o: number}> = {Córdoba: {c: N.yellow, o: prog(ts, tProv - 0.1, 0.5)}};
    return (
      <AbsoluteFill style={{background: N.bg0}}>
        <Ocean glow="rgba(78,168,222,0.14)" />
        <ArgMap cam={mapCam(1.18, [-64.5, -33.5], [540, 960])} W={VW} H={VH} fills={fills} t={ts}>
          {(proj) => (
            <>
              <Pin proj={proj} at={P.Cordoba} t={ts} t0={tCba - 0.1} color={N.yellow} label="3.978.984" sub="HABITANTES (CENSO 2022)" dx={-40} dy={150} align="middle" size={64} r={0.01} />
            </>
          )}
        </ArgMap>
        <TopShade h={620} />
        <Top y={240}>
          <Kick>4 millones es más que</Kick>
          <div style={{marginTop: 14}}>
            <Headline t={ts} t0={tEso + 0.3} size={110} text="toda la provincia de Córdoba" hl={['Córdoba']} style={{textAlign: 'center'}} />
          </div>
        </Top>
        <Src text="INDEC · Censo 2022, resultados definitivos" />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{background: N.yellow}}>
      <AbsoluteFill style={{background: 'repeating-linear-gradient(135deg, rgba(0,0,0,0.05) 0 30px, rgba(0,0,0,0) 30px 60px)'}} />
      <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, paddingBottom: 420}}>
        <div style={{transform: `scale(${1.15 - 0.15 * pop(ts, tDe - 0.2, 1.2)})`, textAlign: 'center'}}>
          <Big size={150} color={N.bg0} style={{lineHeight: 0.95}}>¿4 millones</Big>
          <Big size={150} color={N.bg0} style={{lineHeight: 0.95}}>se van del</Big>
          <Big size={150} color={N.bg0} style={{lineHeight: 0.95}}>conurbano?</Big>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, marginTop: 50}}>
          <Chip t={ts} t0={tDe} text="¿DE DÓNDE SALE?" color={N.bg0} dark={false} size={42} />
          <Chip t={ts} t0={tPuede - 0.1} text="¿PUEDE PASAR?" color={N.red} dark={false} size={42} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* =====================================================================
   Mapa de la proyección (s02 y comienzo de s03)
   ===================================================================== */
const PlanMap: React.FC<{ts: number; seg: 's02' | 's03'}> = ({ts, seg: sg}) => {
  const s = 's02';
  // en s03 todo ya está dibujado: se usa un tiempo "después del final" de s02
  const t2 = sg === 's02' ? ts : TL.durations.s02 + 1 + ts;
  const tCba = cue(s, 'Córdoba:'), tAmba = cue(s, 'AMBA'), tDos = cue(s, 'Dos'), tNq = cue(s, 'Neuquén'), tVaca = cue(s, 'Vaca');
  const tUno = cue(s, 'Uno'), tSj = cue(s, 'San Juan'), tCat = cue(s, 'Catamarca,'), tOtro = cue(s, 'otro'), tSa = cue(s, 'Salta'), tJu = cue(s, 'Jujuy,'), tMin = cue(s, 'minería.');
  const t30 = cue(s, 'treinta'), t4 = cue(s, 'cuatro millones');
  const zk = ramp(t2, tCba + 1.2, tDos - 0.3);
  const z = 1.05 - 0.13 * zk;
  const focus = lerpArr([-64, -33.5], [-64.3, -31.9], zk);
  const fills: Record<string, {c: string; o: number}> = {
    Neuquén: {c: K.energy, o: 0.75 * prog(t2, tNq - 0.1, 0.5)},
    'Río Negro': {c: K.energy, o: 0.75 * prog(t2, tNq + 0.4, 0.5)},
    'San Juan': {c: K.mine, o: 0.75 * prog(t2, tSj - 0.1, 0.5)},
    Catamarca: {c: K.mine, o: 0.75 * prog(t2, tCat - 0.1, 0.5)},
    Salta: {c: K.mine, o: 0.75 * prog(t2, tSa - 0.1, 0.5)},
    Jujuy: {c: K.mine, o: 0.75 * prog(t2, tJu - 0.1, 0.5)},
  };
  const f = (a: number, b: number) => ramp(t2, a, b, easeOut);
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      <Ocean glow="rgba(78,168,222,0.14)" />
      <ArgMap cam={mapCam(z, focus, [560, 890])} W={VW} H={VH} fills={fills} t={t2}>
        {(proj) => (
          <>
            <Flow proj={proj} from={P.AMBA} to={P.NqRn} p={f(tDos - 0.1, tNq + 0.4)} t={t2} color={K.energy} bend={-0.18} />
            <Flow proj={proj} from={P.AMBA} to={P.SjCat} p={f(tUno - 0.1, tSj + 0.3)} t={t2} color={K.mine} bend={-0.12} dots={4} />
            <Flow proj={proj} from={P.AMBA} to={P.SaJu} p={f(tOtro - 0.2, tSa + 0.3)} t={t2} color={K.mine} bend={-0.1} dots={4} />
            <MapTag proj={proj} at={P.NqRn} t={t2} t0={tDos} text="2 M" color={K.energy} dx={-200} dy={30} size={110} />
            <MapTag proj={proj} at={P.SjCat} t={t2} t0={tUno} text="1 M" color={K.mine} dx={-150} dy={20} />
            <MapTag proj={proj} at={P.SaJu} t={t2} t0={tOtro} text="1 M" color={K.mine} dx={-150} dy={20} />
            {t2 > tVaca - 0.3
              ? (() => {
                  const [x, y] = proj(P.Anelo)!;
                  const o = prog(t2, tVaca - 0.3, 0.4);
                  return (
                    <g>
                      <Pumpjack x={x - 60} y={y - 16} s={0.9} t={t2} o={o} />
                      <Pumpjack x={x + 10} y={y - 40} s={0.7} t={t2 + 1} o={o} />
                      <text x={x - 150} y={y - 110} fill={K.energy} fontFamily="Anton" fontSize={50} opacity={o} style={{paintOrder: 'stroke'}} stroke="rgba(4,10,17,0.9)" strokeWidth={9}>
                        VACA MUERTA
                      </text>
                    </g>
                  );
                })()
              : null}
            {t2 > tMin - 0.4
              ? [P.SjCat, P.SaJu].map((pt, i) => {
                  const [x, y] = proj(pt)!;
                  const o = prog(t2, tMin - 0.4 + i * 0.12, 0.35);
                  return <Pickaxe key={i} x={x + 70} y={y - 40} s={1.1} o={o} rot={-10 + 20 * Math.sin(t2 * 4 + i)} />;
                })
              : null}
            {t2 > tMin - 0.2 ? (
              (() => {
                const [x, y] = proj(P.SaJu)!;
                return (
                  <text x={x - 60} y={y - 95} fill={K.mine} fontFamily="Anton" fontSize={50} opacity={prog(t2, tMin - 0.2, 0.4)} style={{paintOrder: 'stroke'}} stroke="rgba(4,10,17,0.9)" strokeWidth={9}>
                    MINERÍA
                  </text>
                );
              })()
            ) : null}
            {t2 < t4 + 1.5 ? <g opacity={1 - prog(t2, t4 + 1, 0.4)}><Pin proj={proj} at={P.Cordoba} t={t2} t0={tCba - 0.1} color="#fff" label="CÓRDOBA" sub="ESTA SEMANA" dx={24} dy={-6} size={42} /></g> : null}
            <Pin proj={proj} at={P.AMBA} t={t2} t0={tAmba - 0.15} color={K.amba} label="AMBA" dx={24} dy={50} size={52} r={16} />
          </>
        )}
      </ArgMap>
      <TopShade h={500} />
      {sg === 's02' ? (
        <Top y={190}>
          <Kick>{t2 < t30 - 0.3 ? 'esta semana, en Córdoba' : 'la proyección de Sturzenegger'}</Kick>
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 24, marginTop: 6, whiteSpace: 'nowrap'}}>
            {t2 < t30 - 0.3 ? (
              <Big size={100} style={{opacity: prog(t2, tCba - 0.4, 0.3)}}>lo repitió</Big>
            ) : (
              <>
                <Big size={100} color={N.yellow} style={{opacity: prog(t2, t4 - 0.2, 0.2), transform: `scale(${pop(t2, t4 - 0.2)})`}}>4 millones</Big>
                <Big size={100} style={{opacity: prog(t2, t30 - 0.2, 0.2)}}>en 30 años</Big>
              </>
            )}
          </div>
        </Top>
      ) : (
        <Top y={190}>
          <Kick>la lógica</Kick>
          <div style={{marginTop: 6}}>
            <Headline t={ts} t0={0.1} size={84} text="la gente va a donde está el trabajo" hl={['trabajo']} style={{textAlign: 'center'}} />
          </div>
        </Top>
      )}
    </AbsoluteFill>
  );
};

const S02: React.FC<{ts: number}> = ({ts}) => {
  const s = 's02';
  const tFed = cue(s, 'Federico'), tMin = cue(s, 'ministro'), tEnt = cue(s, 'entrevista'), tY = cue(s, 'Y esta');
  if (ts < tY - 0.15) {
    return (
      <AbsoluteFill style={{background: N.bg0}}>
        <Ocean glow="rgba(78,168,222,0.16)" grid={0.15} />
        <Frame src="s4m/retrato.jpg" t={ts} t0={-0.2} x={540} y={640} w={900} h={860} zoom={[1.05, 1.18]} focus="50% 40%" enter="clip" radius={8} />
        <div style={{position: 'absolute', left: 90, top: 1000, opacity: prog(ts, tFed - 0.1, 0.3), transform: `translateX(${(1 - prog(ts, tFed - 0.1, 0.4)) * -30}px)`}}>
          <div style={{display: 'inline-block', background: N.yellow, color: N.bg0, fontFamily: F.head, fontSize: 76, padding: '4px 24px', textTransform: 'uppercase'}}>Federico Sturzenegger</div>
          <div style={{marginTop: 12, opacity: prog(ts, tMin - 0.1, 0.3)}}>
            <div style={{display: 'inline-block', background: 'rgba(4,10,17,0.9)', color: N.text, fontFamily: F.body, fontWeight: 800, fontSize: 34, letterSpacing: 4, padding: '10px 24px'}}>
              MINISTRO DE DESREGULACIÓN
            </div>
          </div>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center'}}>
          <Chip t={ts} t0={tEnt - 0.1} text="ENTREVISTA CON BLOOMBERG LÍNEA" size={32} />
        </div>
      </AbsoluteFill>
    );
  }
  return <PlanMap ts={ts} seg="s02" />;
};

/* =====================================================================
   s03 · la lógica, los US$ 90.000 M y el siglo XX al revés
   ===================================================================== */
const OLD_FROM: [number, number][] = [
  [-65.2, -26.8], [-64.3, -27.8], [-60.4, -26.6], [-58.2, -28.5], [-55.0, -27.1], [-59.4, -32.0], [-60.9, -30.6], [-63.9, -31.8],
  [-67.2, -29.9], [-66.8, -27.8], [-64.9, -24.2], [-65.6, -23.2], [-59.9, -24.9], [-68.5, -34.0], [-68.8, -30.9], [-66.0, -33.8],
];
const S03: React.FC<{ts: number}> = ({ts}) => {
  const s = 's03';
  const tSeg = cue(s, 'Según'), tDiez = cue(s, 'diez'), tEn = cue(s, 'energía'), tMin = cue(s, 'minería'), tNov = cue(s, 'noventa'), tPor = cue(s, 'por año.'), tDol = cue(s, 'dólares');
  const tSer = cue(s, 'Sería'), tSig = cue(s, 'siglo'), tMiles = cue(s, 'miles'), tFab = cue(s, 'fábricas'), tInt = cue(s, 'interior');
  if (ts < tSeg - 0.2) return <PlanMap ts={ts} seg="s03" />;
  if (ts < tSer - 0.2) {
    return (
      <AbsoluteFill style={{background: N.bg0}}>
        <Ocean glow="rgba(255,166,48,0.14)" grid={0.2} />
        <Top y={230}>
          <Chip t={ts} t0={tSeg} text="PROYECCIÓN DEL GOBIERNO" size={32} />
          <div style={{marginTop: 26, opacity: prog(ts, tDiez - 0.2, 0.3)}}>
            <Big size={110}>
              en <span style={{color: N.yellow}}>10 años</span>
            </Big>
          </div>
        </Top>
        <svg width={VW} height={VH} style={{position: 'absolute', inset: 0}}>
          <g opacity={prog(ts, tEn - 0.3, 0.3)}>
            <Pumpjack x={330} y={700} s={2.2} t={ts} />
            <text x={330} y={770} textAnchor="middle" fill={K.energy} fontFamily="Anton" fontSize={56}>ENERGÍA</text>
          </g>
          <text x={540} y={660} textAnchor="middle" fill={N.text} fontFamily="Anton" fontSize={90} opacity={prog(ts, tMin - 0.4, 0.3)}>+</text>
          <g opacity={prog(ts, tMin - 0.3, 0.3)}>
            <Pickaxe x={750} y={640} s={2.4} rot={-8 + 16 * Math.sin(ts * 3)} />
            <text x={750} y={770} textAnchor="middle" fill={K.mine} fontFamily="Anton" fontSize={56}>MINERÍA</text>
          </g>
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 850, textAlign: 'center'}}>
          <Kick o={prog(ts, tNov - 0.4, 0.3)}>podrían exportar</Kick>
          <Big size={170} color={N.yellow} style={{marginTop: 8, opacity: prog(ts, tNov - 0.25, 0.2)}}>
            US$ <Num t={ts} t0={tNov - 0.2} t1={tDol} to={90000} /> M
          </Big>
          <div style={{marginTop: 8, opacity: prog(ts, tPor - 0.2, 0.3), transform: `scale(${pop(ts, tPor - 0.2)})`}}>
            <Big size={80}>por año</Big>
          </div>
        </div>
        <Src text="Viceministro de Economía Daniel González · AmCham, abril de 2026" />
      </AbsoluteFill>
    );
  }
  // siglo XX: el camino al revés
  const oldIn = ramp(ts, tSer - 0.2, tSig);
  return (
    <AbsoluteFill style={{background: '#0B0906'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 70% at 55% 45%, rgba(201,165,107,0.16) 0%, rgba(11,9,6,0) 70%)'}} />
      <AbsoluteFill style={{filter: `sepia(${0.6 * oldIn})`}}>
        <ArgMap cam={mapCam(1.0, [-63.2, -31.4], [560, 900])} W={VW} H={VH} base="#231D14" stroke="rgba(230,210,170,0.45)" t={ts}>
          {(proj) => (
            <>
              {OLD_FROM.map((pt, i) => (
                <Flow key={i} proj={proj} from={pt} to={P.AMBA} p={ramp(ts, tMiles - 0.3 + (i % 8) * 0.12 + Math.floor(i / 8) * 0.9, tMiles + 0.5 + (i % 8) * 0.12 + Math.floor(i / 8) * 0.9, easeOut)} t={ts + rnd(i) * 3} color={K.old} bend={0.12 * (rnd(i + 3) > 0.5 ? 1 : -1)} width={6} dots={3} speed={0.6} />
              ))}
              {(() => {
                const [x, y] = proj(P.AMBA)!;
                return (
                  <g>
                    <circle cx={x} cy={y} r={30 + 30 * prog(ts, tInt, 1)} fill={K.old} opacity={0.25} />
                    <Factory x={x - 90} y={y + 120} s={1.8 * pop(ts, tFab - 0.2)} t={ts} o={prog(ts, tFab - 0.2, 0.2)} />
                    <text x={x - 20} y={y + 185} textAnchor="end" fill={K.old} fontFamily="Anton" fontSize={46} opacity={prog(ts, tFab, 0.3)} style={{paintOrder: 'stroke'}} stroke="rgba(11,9,6,0.9)" strokeWidth={8}>
                      FÁBRICAS DEL CONURBANO
                    </text>
                  </g>
                );
              })()}
            </>
          )}
        </ArgMap>
      </AbsoluteFill>
      <TopShade h={520} />
      <Top y={220}>
        <Kick color={K.old}>lo contrario de lo que pasó en el</Kick>
        <Big size={170} color={K.old} style={{marginTop: 6, opacity: prog(ts, tSig - 0.2, 0.2), transform: `scale(${1.2 - 0.2 * pop(ts, tSig - 0.2)})`}}>
          Siglo XX
        </Big>
      </Top>
      <Src text="Migraciones internas hacia el Gran Buenos Aires (esquema)" />
    </AbsoluteFill>
  );
};

/* =====================================================================
   s04 · 365 por día y Neuquén + Río Negro × 2,4
   ===================================================================== */
const S04: React.FC<{ts: number}> = ({ts}) => {
  const s = 's04';
  const t4 = cue(s, 'Cuatro'), t30 = cue(s, 'treinta'), t365 = cue(s, 'trescientas'), tPers = cue(s, 'personas'), tDia = cue(s, 'día.'), tTodos = cue(s, 'Todos');
  const tNq = cue(s, 'Neuquén'), tJun = cue(s, 'juntas'), tMillon = cue(s, 'millón'), tDos = cue(s, 'dos millones'), tMult = cue(s, 'multiplicaría');
  if (ts < tNq - 0.25) {
    const days = tTodos > ts ? 1 : Math.floor(1 + 10957 * Math.pow(ramp(ts, tTodos, tNq - 0.3, (x) => x), 1.6));
    const cycle = ts > tTodos ? ((ts - tTodos) * 2.2) % 1 : 0;
    return (
      <AbsoluteFill style={{background: N.bg0}}>
        <Ocean glow="rgba(255,204,51,0.1)" grid={0.18} />
        <Top y={210}>
          <Kick>pongamos el número en perspectiva</Kick>
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 26, marginTop: 20}}>
            <Big size={96} style={{opacity: prog(ts, t4 - 0.2, 0.3)}}>4.000.000</Big>
            <Big size={96} color={N.mute} style={{opacity: prog(ts, t30 - 0.2, 0.3)}}>÷ 30 años</Big>
          </div>
          <div style={{marginTop: 18, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 24, opacity: prog(ts, t365 - 0.3, 0.2)}}>
            <Big size={190} color={N.yellow} style={{transform: `scale(${pop(ts, t365 - 0.3)})`}}>= 365</Big>
            <div style={{textAlign: 'left', opacity: prog(ts, tPers - 0.2, 0.3)}}>
              <Big size={64}>personas</Big>
              <Big size={64} color={N.yellow} style={{opacity: prog(ts, tDia - 0.3, 0.3)}}>por día</Big>
            </div>
          </div>
        </Top>
        <svg width={VW} height={VH} style={{position: 'absolute', inset: 0}}>
          <g opacity={ts > tTodos ? 1 - 0.8 * clamp((cycle - 0.8) / 0.2) : 1}>
            <PeopleGrid x={128} y={720} cols={25} rows={15} gap={34} p={ts < tTodos ? (ramp(ts, t365, tDia + 0.2, easeOut) * 365) / 375 : clamp(cycle / 0.75) * (365 / 375)} t={ts} s={0.95} color={K.people} />
          </g>
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1236 - 24, textAlign: 'center', opacity: prog(ts, tTodos - 0.2, 0.3)}}>
          <div style={{display: 'inline-flex', alignItems: 'center', gap: 20, background: 'rgba(4,10,17,0.85)', padding: '8px 26px', border: `3px solid ${N.yellow}`}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: N.text}}>TODOS LOS DÍAS · DÍA</div>
            <div style={{fontFamily: F.mono, fontWeight: 700, fontSize: 40, color: N.yellow, minWidth: 150, textAlign: 'left'}}>{fmt(days)}</div>
          </div>
        </div>
      </AbsoluteFill>
    );
  }
  // barras: hoy 1,47 M → con la proyección 3,47 M
  const hoy = 1472881, add = 2000000;
  const base = 1120, sc = 470 / (hoy + add);
  const hH = hoy * sc * prog(ts, tMillon - 0.3, 0.8);
  const aH = add * sc * prog(ts, tDos - 0.2, 0.9);
  const hH2 = hoy * sc * prog(ts, tDos - 0.5, 0.6);
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      <Ocean glow="rgba(255,166,48,0.12)" />
      <AbsoluteFill style={{opacity: 0.4}}>
        <ArgMap cam={mapCam(3.1, [-68.2, -39.6], [540, 900])} W={VW} H={VH} fills={{Neuquén: {c: K.energy, o: 0.5}, 'Río Negro': {c: K.energy, o: 0.5}}} neighbors={0.6} t={ts} />
      </AbsoluteFill>
      <TopShade h={620} />
      <Top y={210}>
        <Kick>Neuquén + Río Negro</Kick>
        <div style={{marginTop: 10}}>
          <Headline t={ts} t0={tNq} size={96} text="hoy: casi 1,5 millones" hl={['1,5']} style={{textAlign: 'center'}} />
        </div>
      </Top>
      <svg width={VW} height={VH} style={{position: 'absolute', inset: 0}}>
        <line x1={120} x2={960} y1={base} y2={base} stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
        {/* hoy */}
        <rect x={210} y={base - hH} width={220} height={hH} fill={K.amba} />
        <text x={320} y={base - hH - 20} textAnchor="middle" fill={N.text} fontFamily="Anton" fontSize={64} opacity={prog(ts, tMillon, 0.3)}>1,47 M</text>
        <text x={320} y={base + 50} textAnchor="middle" fill={N.mute} fontFamily="Inter" fontWeight={800} fontSize={28} letterSpacing={3} opacity={prog(ts, tJun, 0.3)}>HOY</text>
        {/* con la proyección */}
        <rect x={650} y={base - hH2} width={220} height={hH2} fill={K.amba} />
        <rect x={650} y={base - hH2 - aH} width={220} height={aH} fill={N.yellow} />
        <text x={760} y={base - hH2 - aH / 2 + 22} textAnchor="middle" fill={N.bg0} fontFamily="Anton" fontSize={64} opacity={prog(ts, tDos + 0.3, 0.3)}>+2 M</text>
        <text x={760} y={base + 50} textAnchor="middle" fill={N.mute} fontFamily="Inter" fontWeight={800} fontSize={28} letterSpacing={3} opacity={prog(ts, tDos - 0.2, 0.3)}>CON LA PROYECCIÓN</text>
      </svg>
      <div style={{position: 'absolute', left: 250, top: 470, opacity: prog(ts, tMult - 0.2, 0.2), transform: `scale(${pop(ts, tMult - 0.2)}) rotate(-6deg)`}}>
        <div style={{background: N.red, padding: '6px 26px', boxShadow: '0 12px 40px rgba(0,0,0,0.5)'}}>
          <Big size={110} color="#fff">× 2,4</Big>
        </div>
      </div>
      <Src text="INDEC · Censo 2022: Neuquén 710.814 + Río Negro 762.067 hab." o={prog(ts, tMillon, 0.4)} />
    </AbsoluteFill>
  );
};

/* =====================================================================
   s05 · qué dicen los datos (censos 2010 y 2022)
   ===================================================================== */
const S05: React.FC<{ts: number}> = ({ts}) => {
  const s = 's05';
  const tPor = cue(s, 'Por ahora,'), tEntre = cue(s, 'Entre'), tAmba = cue(s, 'AMBA'), tSumo = cue(s, 'sumó'), tLo = cue(s, 'Lo que');
  const tNq = cue(s, 'Neuquén'), tSl = cue(s, 'San Luis,'), tCiu = cue(s, 'Ciudad,'), tCon = cue(s, 'conurbano,');
  const t2010 = cue(s, 'dos mil diez'), t2022 = cue(s, 'dos mil veintidós,');
  if (ts < tLo - 0.2) {
    const a10 = 12806866, a22 = 13986889;
    const base = 1150, sc = 520 / a22;
    const h10 = a10 * sc * prog(ts, t2010 - 0.2, 0.7), h22 = a22 * sc * prog(ts, t2022 - 0.2, 0.7);
    return (
      <AbsoluteFill style={{background: N.bg0}}>
        <Ocean glow="rgba(78,168,222,0.14)" grid={0.15} />
        <Top y={210}>
          <Chip t={ts} t0={0.0} text="¿QUÉ DICEN LOS DATOS?" size={34} />
          <div style={{marginTop: 20, opacity: prog(ts, tPor - 0.1, 0.3)}}>
            <Big size={112}>
              el éxodo <span style={{color: N.red}}>no se ve</span>
            </Big>
          </div>
        </Top>
        <div style={{position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center', opacity: prog(ts, tEntre - 0.2, 0.3)}}>
          <Kick color={N.text}>AMBA · Ciudad + 24 partidos</Kick>
        </div>
        <svg width={VW} height={VH} style={{position: 'absolute', inset: 0}}>
          <line x1={140} x2={940} y1={base} y2={base} stroke="rgba(255,255,255,0.5)" strokeWidth={3} opacity={prog(ts, tEntre - 0.2, 0.3)} />
          <rect x={220} y={base - h10} width={230} height={h10} fill={K.amba} opacity={0.65} />
          <rect x={630} y={base - h22} width={230} height={h22} fill={K.amba} />
          <text x={335} y={base - h10 - 22} textAnchor="middle" fill={N.text} fontFamily="Anton" fontSize={62} opacity={prog(ts, t2010, 0.3)}>12,8 M</text>
          <text x={745} y={base - h22 - 22} textAnchor="middle" fill={N.text} fontFamily="Anton" fontSize={62} opacity={prog(ts, t2022, 0.3)}>14,0 M</text>
          <text x={335} y={base + 52} textAnchor="middle" fill={N.mute} fontFamily="Anton" fontSize={46} opacity={prog(ts, t2010, 0.3)}>2010</text>
          <text x={745} y={base + 52} textAnchor="middle" fill={N.mute} fontFamily="Anton" fontSize={46} opacity={prog(ts, t2022, 0.3)}>2022</text>
        </svg>
        <div style={{position: 'absolute', left: 380, top: 780, opacity: prog(ts, tSumo - 0.2, 0.2), transform: `scale(${pop(ts, tSumo - 0.2)}) rotate(-5deg)`}}>
          <div style={{background: N.yellow, padding: '6px 22px', boxShadow: '0 12px 40px rgba(0,0,0,0.5)'}}>
            <Big size={80} color={N.bg0}>+1,18 M</Big>
          </div>
        </div>
        <div style={{position: 'absolute', left: 150, top: 640, opacity: prog(ts, tAmba + 0.3, 0.3) * (1 - prog(ts, tSumo - 0.3, 0.2))}}>
          <Big size={60} color={N.red}>NO PERDIÓ GENTE</Big>
        </div>
        <Src text="INDEC · Censos 2010 y 2022 (resultados definitivos)" o={prog(ts, tEntre, 0.4)} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      <Ocean glow="rgba(255,166,48,0.12)" grid={0.15} />
      <Top y={220}>
        <Kick>crecimiento entre 2010 y 2022</Kick>
        <div style={{marginTop: 12}}>
          <Headline t={ts} t0={tLo + 0.1} size={104} text="el interior crece más rápido" hl={['interior']} style={{textAlign: 'center'}} />
        </div>
      </Top>
      <div style={{position: 'absolute', left: 30, top: 600, transform: 'scale(1.06)', transformOrigin: '0 0'}}>
        <HBar t={ts} t0={tNq - 0.1} label="Neuquén" value={28.9} max={32} text="+28,9 %" color={K.energy} w={560} />
        <HBar t={ts} t0={tSl - 0.1} label="San Luis" value={25.4} max={32} text="+25,4 %" color={N.yellow} w={560} />
        <HBar t={ts} t0={tCiu - 0.1} label="Ciudad" sub="DE BUENOS AIRES" value={8.0} max={32} text="+8,0 %" color={K.amba} w={560} />
        <HBar t={ts} t0={tCon - 0.1} label="Conurbano" sub="24 PARTIDOS" value={9.6} max={32} text="+9,6 %" color={K.amba} w={560} />
      </div>
      <Src text="INDEC · Censos 2010 y 2022 (resultados definitivos)" />
    </AbsoluteFill>
  );
};

/* =====================================================================
   s06 · Neuquén hoy, el doble, y Añelo
   ===================================================================== */
const S06: React.FC<{ts: number}> = ({ts}) => {
  const s = 's06';
  const t30 = cue(s, 'treinta', 0), tPers = cue(s, 'personas'), tPara = cue(s, 'Para'), tDoble = cue(s, 'doble,'), tTodos = cue(s, 'todos');
  const tNo = cue(s, 'Y no'), tAn = cue(s, 'Añelo,'), tVaca = cue(s, 'Vaca'), tInt = cue(s, 'intendente'), tEsc = cue(s, 'escuelas'), tHos = cue(s, 'hospitales'), tAbasto = cue(s, 'no daban');
  if (ts < tNo - 0.2) {
    const hoy = 32500, need = 2000000 / 30;
    const bars = ts > tPara - 0.2;
    return (
      <AbsoluteFill style={{background: N.bg0}}>
        <Ocean glow="rgba(255,166,48,0.14)" grid={0.15} />
        <Top y={220}>
          <Kick>Neuquén hoy recibe</Kick>
          <Big size={150} color={N.yellow} style={{marginTop: 10, opacity: prog(ts, t30 - 0.25, 0.2)}}>
            <Num t={ts} t0={t30 - 0.2} t1={t30 + 0.6} to={30000} /> – <Num t={ts} t0={t30 + 0.5} t1={tPers} from={30000} to={35000} />
          </Big>
          <Kick o={prog(ts, tPers - 0.2, 0.3)} color={N.text}>personas por año</Kick>
        </Top>
        {!bars ? (
          <svg width={VW} height={VH} style={{position: 'absolute', inset: 0}}>
            <PeopleGrid x={170} y={700} cols={17} rows={8} gap={44} p={ramp(ts, t30, tPers + 0.4, easeOut)} t={ts} s={1.1} color={K.energy} />
          </svg>
        ) : (
          <div style={{position: 'absolute', left: 40, top: 690}}>
            <HBar t={ts} t0={tPara} label="Hoy" sub="NEUQUÉN" value={hoy} max={70000} text="30-35 mil" color={K.energy} w={520} />
            <HBar t={ts} t0={tDoble - 0.6} label="Hace falta" sub="NQN + RÍO NEGRO" value={need} max={70000} text="≈ 67 mil" color={N.yellow} w={520} />
            <div style={{marginTop: 20, textAlign: 'center', width: 1000, opacity: prog(ts, tDoble - 0.2, 0.2), transform: `scale(${pop(ts, tDoble - 0.2)})`}}>
              <div style={{display: 'inline-block', background: N.red, padding: '6px 28px', transform: 'rotate(-3deg)'}}>
                <Big size={96} color="#fff">el doble</Big>
              </div>
              <div style={{marginTop: 18, opacity: prog(ts, tTodos - 0.2, 0.3)}}>
                <Kick color={N.text}>todos los años, durante 30 años</Kick>
              </div>
            </div>
          </div>
        )}
        <Src text={bars ? '2.000.000 ÷ 30 años ≈ 67.000 por año · Gobierno de Neuquén' : 'Gobierno de Neuquén (estimación 2026)'} />
      </AbsoluteFill>
    );
  }
  const g = ramp(ts, tNo - 0.2, tAn + 0.3);
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      <Ocean glow="rgba(255,166,48,0.14)" />
      <ArgMap cam={mapCam(2.2 + 3.2 * g, lerpArr([-66, -38], P.Anelo, g), [540, 900])} W={VW} H={VH} fills={{Neuquén: {c: K.energy, o: 0.35}}} labels={{Neuquén: 1 - g}} labelSize={34} t={ts}>
        {(proj) => {
          const [x, y] = proj(P.Anelo)!;
          const o = prog(ts, tVaca - 0.3, 0.4);
          return (
            <g>
              {[[-190, 60, 0.9], [170, 40, 1.0], [-110, -120, 0.7], [220, -140, 0.75], [30, 180, 0.8], [-260, -40, 0.65]].map(([dx, dy, sc], i) => (
                <Pumpjack key={i} x={x + dx} y={y + dy} s={sc * 1.3} t={ts + i} o={o * 0.85} />
              ))}
              <Pin proj={proj} at={P.Anelo} t={ts} t0={tAn - 0.1} color={N.yellow} label="AÑELO" sub="CORAZÓN DE VACA MUERTA" dx={28} dy={14} size={60} r={16} />
            </g>
          );
        }}
      </ArgMap>
      <TopShade h={520} />
      <Top y={220}>
        <Headline t={ts} t0={tNo + 0.05} size={100} text="no alcanza con el trabajo" hl={['trabajo']} style={{textAlign: 'center'}} />
      </Top>
      {/* cita del intendente */}
      <div style={{position: 'absolute', left: 60, right: 60, top: 560, opacity: win(ts, tInt - 0.1, 99), transform: `translateY(${(1 - prog(ts, tInt - 0.1, 0.5)) * 40}px)`}}>
        <div style={{background: 'rgba(4,10,17,0.92)', borderLeft: `10px solid ${N.yellow}`, padding: '26px 34px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)'}}>
          <div style={{fontFamily: F.quote, fontStyle: 'italic', fontSize: 64, lineHeight: 1.1, color: N.text}}>“Les pido a las familias que no vengan”</div>
          <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: N.yellow, marginTop: 16}}>FERNANDO BANDERET · INTENDENTE DE AÑELO · JUNIO 2026</div>
        </div>
      </div>
      <svg width={VW} height={VH} style={{position: 'absolute', inset: 0}}>
        <g opacity={prog(ts, tEsc - 0.3, 0.3)}>
          <Building x={320} y={1090} s={1.4 * pop(ts, tEsc - 0.3)} kind="school" />
        </g>
        <g opacity={prog(ts, tHos - 0.3, 0.3)}>
          <Building x={760} y={1090} s={1.4 * pop(ts, tHos - 0.3)} kind="hospital" />
        </g>
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1085, textAlign: 'center', opacity: prog(ts, tAbasto - 0.1, 0.15), transform: `scale(${1.4 - 0.4 * pop(ts, tAbasto - 0.1)}) rotate(-7deg)`}}>
        <div style={{display: 'inline-block', border: `8px solid ${N.red}`, padding: '4px 30px', background: 'rgba(4,10,17,0.6)'}}>
          <Big size={100} color={N.red}>no dan abasto</Big>
        </div>
      </div>
      <Src text="Infobae y La Nación, 18/6/2026" o={prog(ts, tInt, 0.4)} />
    </AbsoluteFill>
  );
};

/* =====================================================================
   s07 · proyección, no hecho · ¿te mudarías?
   ===================================================================== */
const S07: React.FC<{ts: number}> = ({ts}) => {
  const s = 's07';
  const tProy = cue(s, 'proyección'), tHecho = cue(s, 'hecho.'), tTend = cue(s, 'tendencia'), tPero = cue(s, 'pero'), tLenta = cue(s, 'lenta.');
  const tVos = cue(s, 'Y vos,'), tNq = cue(s, 'Neuquén,'), tSj = cue(s, 'San Juan'), tSa = cue(s, 'Salta,'), tMud = cue(s, 'mudarías?'), tCont = cue(s, 'Contame');
  if (ts < tVos - 0.2) {
    const strike = prog(ts, tHecho - 0.05, 0.35);
    const lowA = ts > tTend - 0.3;
    return (
      <AbsoluteFill style={{background: N.bg0}}>
        <Ocean glow="rgba(255,204,51,0.1)" grid={0.18} />
        <Top y={250}>
          <div style={{opacity: prog(ts, tProy - 0.2, 0.2), transform: `scale(${pop(ts, tProy - 0.2)})`}}>
            <Big size={140} color={N.yellow}>una proyección</Big>
            <Kick color={N.text}>a 30 años</Kick>
          </div>
          <div style={{position: 'relative', display: 'inline-block', marginTop: 30, opacity: prog(ts, tHecho - 0.5, 0.2)}}>
            <Big size={120} color={N.mute}>no un hecho</Big>
            <div style={{position: 'absolute', left: -10, top: '52%', height: 16, width: `${strike * 105}%`, background: N.red, transform: 'rotate(-3deg)'}} />
          </div>
        </Top>
        {lowA ? (
          <div style={{position: 'absolute', left: 90, right: 90, top: 820, opacity: prog(ts, tTend - 0.3, 0.3)}}>
            <div style={{fontFamily: F.head, fontSize: 64, color: N.text, textTransform: 'uppercase'}}>
              la tendencia <span style={{color: '#5BD28A'}}>existe ✓</span>
            </div>
            {[
              {label: 'LO QUE PIDE LA PROYECCIÓN · NQN + RN', v: 1, c: N.yellow, txt: '≈ 67 mil/año'},
              {label: 'LO QUE LLEGA HOY · NEUQUÉN', v: 32500 / 66667, c: K.amba, txt: '30-35 mil/año'},
            ].map((r, i) => {
              const x = r.v * prog(ts, tPero + i * 0.35, 1.1);
              return (
                <div key={i} style={{marginTop: 36, opacity: prog(ts, tPero - 0.2 + i * 0.35, 0.3)}}>
                  <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: N.mute}}>{r.label}</div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 10}}>
                    <div style={{position: 'relative', height: 40, width: 560, background: 'rgba(255,255,255,0.08)'}}>
                      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${x * 100}%`, background: r.c}} />
                    </div>
                    <div style={{fontFamily: F.head, fontSize: 48, color: r.c, whiteSpace: 'nowrap', opacity: prog(ts, tPero + i * 0.35 + 0.6, 0.3)}}>{r.txt}</div>
                  </div>
                </div>
              );
            })}
            <div style={{marginTop: 30, opacity: prog(ts, tLenta - 0.3, 0.3)}}>
              <Big size={72} color={K.amba}>mucho más lenta</Big>
            </div>
          </div>
        ) : null}
      </AbsoluteFill>
    );
  }
  if (ts < tCont - 0.2) {
    return (
      <AbsoluteFill style={{background: N.bg0}}>
        <Ocean glow="rgba(78,168,222,0.14)" />
        <ArgMap cam={mapCam(0.92, [-64.3, -31.9], [560, 890])} W={VW} H={VH} t={ts}
          fills={{Neuquén: {c: K.energy, o: 0.6 * prog(ts, tNq - 0.1, 0.4)}, 'San Juan': {c: K.mine, o: 0.6 * prog(ts, tSj - 0.1, 0.4)}, Salta: {c: K.mine, o: 0.6 * prog(ts, tSa - 0.1, 0.4)}}}>
          {(proj) => (
            <>
              <Pin proj={proj} at={P.Neuquen} t={ts} t0={tNq - 0.1} color={K.energy} label="NEUQUÉN" size={50} />
              <Pin proj={proj} at={P.SanJuan} t={ts} t0={tSj - 0.1} color={K.mine} label="SAN JUAN" size={50} />
              <Pin proj={proj} at={P.Salta} t={ts} t0={tSa - 0.1} color={K.mine} label="SALTA" size={50} />
              <Pin proj={proj} at={P.AMBA} t={ts} t0={0} color="#fff" label="VOS" dx={24} dy={50} size={48} />
            </>
          )}
        </ArgMap>
        <TopShade h={500} />
        <Top y={190}>
          <Kick>si tuvieras trabajo en…</Kick>
          <div style={{marginTop: 10, opacity: prog(ts, tMud - 0.2, 0.2), transform: `scale(${1.25 - 0.25 * pop(ts, tMud - 0.2)})`}}>
            <Big size={124} color={N.yellow}>¿te mudarías?</Big>
          </div>
        </Top>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      <Ocean glow="rgba(255,204,51,0.14)" grid={0.18} />
      <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 330}}>
        <div style={{transform: `scale(${pop(ts, tCont - 0.2)})`, position: 'relative'}}>
          <svg width={760} height={560} viewBox="0 0 760 560">
            <path d="M60 30 H700 Q730 30 730 60 V380 Q730 410 700 410 H300 L180 520 L200 410 H60 Q30 410 30 380 V60 Q30 30 60 30 Z" fill={N.yellow} />
          </svg>
          <div style={{position: 'absolute', left: 0, right: 0, top: 90, textAlign: 'center'}}>
            <Big size={120} color={N.bg0}>¿sí o no?</Big>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 34, letterSpacing: 4, color: N.bg0, marginTop: 14}}>CONTAME EN LOS COMENTARIOS</div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- placa final ---------- */
const EndCard: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: '#0B0B0C', opacity: prog(t, 0, 0.35)}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(255,204,51,0.12) 0%, rgba(0,0,0,0) 60%)'}} />
    <div style={{position: 'absolute', left: 540 - 190, top: 360}}>
      <LogoMark size={380} t={t} t0={0.05} />
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', opacity: prog(t, 0.4, 0.4)}}>
      <Big size={130} color="#fff" style={{letterSpacing: 6}}>Contexto</Big>
    </div>
    <div style={{position: 'absolute', left: 60, right: 60, top: 1010, textAlign: 'center', opacity: prog(t, 0.9, 0.4), transform: `translateY(${(1 - prog(t, 0.9, 0.5)) * 30}px)`}}>
      <div style={{fontFamily: F.head, fontSize: 84, color: N.yellow, lineHeight: 1.05}}>SEGUINOS</div>
      <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 40, color: N.text, marginTop: 16}}>para entender la Argentina sin vueltas</div>
    </div>
  </AbsoluteFill>
);

const SCENES: Record<string, React.FC<{ts: number}>> = {s01: S01, s02: S02, s03: S03, s04: S04, s05: S05, s06: S06, s07: S07};
const WIPES = ['s02', 's04', 's05', 's06', 's07'];

export const CuatroMillones: React.FC = () => {
  const T = useCurrentFrame() / TL.fps;
  const sg = seg(T);
  const hook = T < S.s01 + cue('s01', 'Cuatro', 0) - 0.15;
  const end = T >= TL.endCard;
  let body: React.ReactNode;
  if (end) body = <EndCard t={T - TL.endCard} />;
  else if (hook) body = <Hook T={T} />;
  else {
    const Sc = SCENES[sg];
    body = <Sc ts={T - S[sg]} />;
  }
  return (
    <AbsoluteFill style={{background: N.bg0}}>
      <AbsoluteFill key={end ? 'end' : hook ? 'hook' : sg} style={{isolation: 'isolate'}}>{body}</AbsoluteFill>
      <Captions T={T} />
      {!end ? (
        <div style={{position: 'absolute', left: 60, top: 40, display: 'flex', alignItems: 'center', gap: 14, opacity: 0.95}}>
          <Img src={staticFile('brand/logo_transparente.png')} style={{width: 60, height: 60, objectFit: 'contain'}} />
          <div style={{fontFamily: F.head, fontSize: 38, color: '#fff', letterSpacing: 3, textShadow: '0 3px 12px rgba(0,0,0,0.7)'}}>CONTEXTO</div>
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 0, top: 0, height: 10, width: `${clamp(T / TL.endCard) * 100}%`, background: N.yellow}} />
      {WIPES.map((k) => <VWipe key={k} t={T} at={S[k] - 0.2} />)}
      <Flash t={T} at={S.s01 + cue('s01', 'Cuatro', 0) - 0.15} color={N.yellow} max={0.6} dur={0.45} />
      <Flash t={T} at={S.s01 + cue('s01', 'De dónde') - 0.2} color="#fff" max={0.7} dur={0.4} />
      <Grain opacity={0.04} />
    </AbsoluteFill>
  );
};

export const S4M_TOTAL = TL.total;
