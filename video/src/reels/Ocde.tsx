import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {geoArea, geoInterpolate} from 'd3-geo';
import tlj from '../data/ocd/timeline.json';
import words from '../data/ocd/words.json';
import countries from '../data/ep04/countries50.json';
import {C, F} from '../theme';
import {clamp, easeIn, easeInOut, easeOut, pop, prog, rnd, shake} from '../lib/anim';
import {Strike, SvgDefs, Grain} from '../components/base';
import {Globe5, subsolar, visible5, View5} from '../ep05/globe5';
import {
  At, B, Burst, Captions, Card3D, Cam, EndCard, Ext, FullBleed, Ico, Kicker, LiveBG, Num, Photo3D, Pill, SceneDef, Slam, Src, THEMES,
  TopBar, Transition, TL, Word, buildChunks, makeCue, themeAt,
} from './kit';

/* Reel vertical · "¿POR QUÉ MILEI QUIERE ENTRAR AL CLUB DE LOS PAÍSES RICOS?" (OCDE) */
const tl = tlj as TL;
const WS = words as Record<string, Word[]>;
const {c, at} = makeCue(tl, WS);
const NUMS: [string, string][] = [
  ['catorce', '14'], ['cuatrocientos', '400'], ['mil novecientos sesenta y uno,', '1961,'], ['treinta y ocho', '38'], ['dos mil veintidós.', '2022.'],
  ['dos mil veinticuatro.', '2024.'], ['dos mil veinticinco', '2025'], ['doscientas cuarenta', '240'], ['veinticinco', '25'], ['siete años.', '7 años.'],
  ['mil novecientos noventa y cuatro,', '1994,'], ['dos minutos.', '2 minutos.'],
];
const CHUNKS = buildChunks(tl, WS, NUMS);
const E = tl.endCard;

const Q = {
  semana: c('s01', 'Esta semana,'), paris: c('s01', 'París.'), catorce: c('s01', 'catorce'), ministros: c('s01', 'varios ministros'), cuatro: c('s01', 'cuatrocientos'),
  destino: c('s01', '¿El destino?'), castillo: c('s01', 'Un castillo.'), adentro: c('s01', 'Ahí adentro'), club: c('s01', 'el club de los países ricos.'),
  quees: c('s01', '¿Qué es,'), sirve: c('s01', 'para qué sirve?'),
  s2: at('s02'), org: c('s02', 'la Organización'), nacio: c('s02', 'Nació'), sesenta: c('s02', 'mil novecientos sesenta'), hoy: c('s02', 'y hoy tiene'),
  treinta: c('s02', 'treinta y ocho'), mitad: c('s02', 'casi la mitad'), eeuu: c('s02', 'Estados Unidos,'), alemania: c('s02', 'Alemania,'), japon: c('s02', 'Japón…'),
  latam: c('s02', 'Y de América Latina,'), mex: c('s02', 'México,'), chile: c('s02', 'Chile,'), col: c('s02', 'Colombia'), cr: c('s02', 'Costa Rica.'),
  pisa: c('s02', 'Sí:'), pisa2: c('s02', 'pruebas PISA.'),
  s3: at('s03'), fmi: c('s03', 'como el FMI.'), reglas: c('s03', 'Lo que hace'), imp: c('s03', 'impuestos,'), corr: c('s03', 'corrupción,'), inv: c('s03', 'inversores,'),
  est: c('s03', 'estadísticas.'), entrar: c('s03', 'Entrar es'), sello: c('s03', 'sello de calidad:'), mismas: c('s03', 'mismas reglas'),
  s4: at('s04'), despacio: c('s04', 'Despacio.'), invit: c('s04', 'La Argentina fue invitada'), ruta: c('s04', 'Su hoja de ruta'), nov: c('s04', 'En noviembre'),
  auto: c('s04', 'autoevaluaciones.'), comites: c('s04', 'Ahora la revisan'), final: c('s04', 'Y al final,'), votar: c('s04', 'votar que sí.'), todos: c('s04', 'Todos.'),
  colombia: c('s04', 'Colombia tardó'), costa: c('s04', 'Costa Rica,'),
  s5: at('s05'), favor: c('s05', 'Los que están a favor'), riesgo: c('s05', 'baja el riesgo'), atrae: c('s05', 'atrae inversiones.'), vidriera: c('s05', 'Por eso el Gobierno'),
  mineria: c('s05', 'la minería,'), energia: c('s05', 'la energía'), tecno: c('s05', 'la tecnología.'), dudan: c('s05', 'Los que dudan'), rico: c('s05', 'no te hace rico:'),
  mexico: c('s05', 'México está'), todavia: c('s05', 'todavía no'), reformas: c('s05', 'Y que las reformas'), populares: c('s05', 'no siempre son populares.'),
  s6: at('s06'), plata: c('s06', 'no te da plata.'), reput: c('s06', 'Te da reglas'), milei: c('s06', 'Milei va a París'), liga: c('s06', 'esa liga,'),
  anios: c('s06', 'va a llevar años.'), vos: c('s06', '¿Vos qué pensás:'), ricos: c('s06', 'club de ricos,'), reglas2: c('s06', 'club de reglas?'), contame: c('s06', 'Contame'),
  segui: c('s06', 'Y seguí'),
};

const SCENES: SceneDef[] = [
  {t: 0, theme: 'navy'},
  {t: Q.catorce - 0.15, theme: 'ink', wipe: 'stack'},
  {t: Q.destino - 0.1, theme: 'navy', wipe: 'iris'},
  {t: Q.s2 - 0.1, theme: 'yellow', wipe: 'iris'},
  {t: Q.nacio - 0.1, theme: 'navy', wipe: 'stack'},
  {t: Q.pisa - 0.1, theme: 'paper', wipe: 'blinds'},
  {t: Q.s3 - 0.1, theme: 'celeste', wipe: 'iris'},
  {t: Q.reglas - 0.1, theme: 'ink', wipe: 'stack'},
  {t: Q.entrar - 0.1, theme: 'yellow', wipe: 'slab'},
  {t: Q.s4 - 0.1, theme: 'paper', wipe: 'iris'},
  {t: Q.invit - 0.1, theme: 'navy', wipe: 'stack'},
  {t: Q.final - 0.1, theme: 'ink', wipe: 'blinds'},
  {t: Q.colombia - 0.1, theme: 'paper', wipe: 'stack'},
  {t: Q.s5 - 0.1, theme: 'yellow', wipe: 'iris'},
  {t: Q.favor - 0.1, theme: 'paper', wipe: 'stack'},
  {t: Q.dudan - 0.1, theme: 'red', wipe: 'slab'},
  {t: Q.s6 - 0.1, theme: 'navy', wipe: 'iris'},
  {t: Q.milei - 0.1, theme: 'ink', wipe: 'stack'},
  {t: Q.vos - 0.1, theme: 'yellow', wipe: 'blinds'},
];
const PUNCH = [Q.paris, Q.castillo, Q.club, Q.treinta, Q.fmi, Q.sello, Q.despacio, Q.todos, Q.rico, Q.plata, Q.anios];

/* ---- globo ---- */
const MEMBERS = 'AUS AUT BEL CAN CHL COL CRI CZE DNK EST FIN FRA DEU GRC HUN ISL IRL ISR ITA JPN KOR LVA LTU LUX MEX NLD NZL NOR POL PRT SVK SVN ESP SWE CHE TUR GBR USA'.split(' ');
/* algunos polígonos vienen con el sentido invertido y d3 los pinta como "todo el mundo menos el país": se corrigen */
const fixWinding = (f: any) => {
  if (geoArea(f) <= 2 * Math.PI) return f;
  const g = f.geometry;
  const rev = (poly: any[]) => poly.map((ring: any[]) => [...ring].reverse());
  const coords = g.type === 'Polygon' ? rev(g.coordinates) : g.coordinates.map(rev);
  return {...f, geometry: {...g, coordinates: coords}};
};
const FEAT = ((countries as any).features as any[]).map(fixWinding);
const MEM_F = FEAT.filter((f) => MEMBERS.includes(f.properties.a3));
const ARG_F = FEAT.find((f) => f.properties.a3 === 'ARG');
const LATAM = ['MEX', 'CHL', 'COL', 'CRI'];
const BA: [number, number] = [-58.38, -34.6], PAR: [number, number] = [2.35, 48.86];
type K = {t: number; lon: number; lat: number; r: number; cy: number};
const lerpView = (ks: K[], t: number): View5 => {
  let a = ks[0], b = ks[0];
  for (let i = 0; i < ks.length; i++) if (t >= ks[i].t) { a = ks[i]; b = ks[Math.min(i + 1, ks.length - 1)]; }
  const k = b.t > a.t ? easeInOut(clamp((t - a.t) / Math.min(1.4, b.t - a.t))) : 0;
  let dl = b.lon - a.lon; if (dl > 180) dl -= 360; if (dl < -180) dl += 360;
  return {lon: a.lon + dl * k, lat: a.lat + (b.lat - a.lat) * k, r: a.r + (b.r - a.r) * k, cx: 540, cy: a.cy + (b.cy - a.cy) * k};
};

const GlobeArc: React.FC<{t: number}> = ({t}) => {
  const v = lerpView([{t: 0, lon: -58, lat: -20, r: 400, cy: 760}, {t: Q.paris - 1.2, lon: -30, lat: 10, r: 400, cy: 760}], t + (t > Q.paris ? 0 : 0));
  const k = easeInOut(clamp((t - Q.semana - 0.4) / 2.4));
  const ip = geoInterpolate(BA, PAR);
  const line = Array.from({length: 41}).map((_, i) => ip((i / 40) * k));
  const head = ip(k);
  return (
    <Globe5 view={v} sun={subsolar(270, 15)} W={1080} H={1920} dayOnly atmo={1.2}>
      {(proj, path) => {
        const pb = proj(BA), pp = proj(PAR), ph = proj(head);
        const ang = (() => { const a2 = proj(ip(Math.min(1, k + 0.01))), a1 = proj(ip(Math.max(0, k - 0.01))); return a1 && a2 ? (Math.atan2(a2[1] - a1[1], a2[0] - a1[0]) * 180) / Math.PI : 0; })();
        return (
          <>
            <path d={path(ARG_F) ?? ''} fill="rgba(116,172,223,0.55)" stroke="#fff" strokeWidth={3} />
            <path d={path({type: 'LineString', coordinates: line} as any) ?? ''} fill="none" stroke={C.yellow} strokeWidth={9} strokeLinecap="round" strokeDasharray="2 18" />
            {pb ? <circle cx={pb[0]} cy={pb[1]} r={14} fill={C.yellow} stroke={C.ink} strokeWidth={4} /> : null}
            {pp && k > 0.95 ? <circle cx={pp[0]} cy={pp[1]} r={16 * pop(t, Q.semana + 2.8)} fill={C.red} stroke="#fff" strokeWidth={4} /> : null}
            {ph && k > 0 && k < 1 ? (
              <g transform={`translate(${ph[0]} ${ph[1]}) rotate(${ang})`}>
                <path d="M-26 0 L10 -6 L24 0 L10 6 Z M-4 -4 L-14 -24 L-6 -24 L10 -4 Z M-4 4 L-14 24 L-6 24 L10 4 Z M-22 -2 L-30 -12 L-24 -12 L-16 -2 Z M-22 2 L-30 12 L-24 12 L-16 2 Z" fill="#fff" stroke={C.ink} strokeWidth={2.5} transform="scale(1.6)" />
              </g>
            ) : null}
          </>
        );
      }}
    </Globe5>
  );
};

const GlobeMembers: React.FC<{t: number}> = ({t}) => {
  const v = lerpView(
    [
      {t: Q.hoy - 0.3, lon: 0, lat: 35, r: 420, cy: 800},
      {t: Q.hoy + 0.2, lon: 10, lat: 40, r: 420, cy: 800},
      {t: Q.eeuu - 0.4, lon: -95, lat: 38, r: 440, cy: 800},
      {t: Q.alemania - 0.3, lon: 10, lat: 48, r: 460, cy: 800},
      {t: Q.japon - 0.3, lon: 138, lat: 36, r: 460, cy: 800},
      {t: Q.latam - 0.3, lon: -78, lat: -5, r: 470, cy: 790},
    ],
    t,
  );
  const lit = (f: any, i: number) => clamp((t - Q.treinta - rnd(i + 7) * 0.9) / 0.25);
  return (
    <Globe5 view={v} sun={subsolar(270, 12 - v.lon / 15)} W={1080} H={1920} dayOnly atmo={1.2}>
      {(proj, path) => (
        <>
          {MEM_F.map((f, i) => {
            const la = LATAM.includes(f.properties.a3);
            const hot = la && t > Q.latam;
            return (
              <path key={i} d={path(f) ?? ''} fill={hot ? C.yellow : 'rgba(255,204,51,0.78)'} fillOpacity={lit(f, i) * (t > Q.latam && !la ? 0.45 : 1)} stroke={hot ? C.ink : 'rgba(255,255,255,0.9)'} strokeWidth={hot ? 4 : 1.6} />
            );
          })}
          {t > Q.latam ? <path d={path(ARG_F) ?? ''} fill="rgba(116,172,223,0.35)" stroke="#fff" strokeWidth={4} strokeDasharray="10 8" /> : null}
          {t > Q.latam
            ? (
                [
                  {a3: 'MEX', lab: 'MÉXICO · 1994', t0: Q.mex, ll: [-102, 23], dx: 60, dy: -30},
                  {a3: 'CRI', lab: 'COSTA RICA · 2021', t0: Q.cr, ll: [-84, 10], dx: -330, dy: 10},
                  {a3: 'COL', lab: 'COLOMBIA · 2020', t0: Q.col, ll: [-73, 4], dx: 60, dy: 10},
                  {a3: 'CHL', lab: 'CHILE · 2010', t0: Q.chile, ll: [-71, -30], dx: -270, dy: 0},
                  {a3: 'ARG', lab: 'ARGENTINA · ¿?', t0: Q.cr + 0.6, ll: [-65, -36], dx: 50, dy: 30},
                ] as const
              ).map((m) => {
                const p = proj(m.ll as any);
                if (!p || t < m.t0 - 0.1) return null;
                const s = pop(t, m.t0 - 0.1);
                return (
                  <g key={m.a3} transform={`translate(${p[0]} ${p[1]})`}>
                    <circle r={10} fill={C.red} stroke="#fff" strokeWidth={3} />
                    <g transform={`translate(${m.dx} ${m.dy}) scale(${s})`}>
                      <rect x={-6} y={-30} width={m.lab.length * 21 + 12} height={50} rx={12} fill={m.a3 === 'ARG' ? C.celeste : C.yellow} stroke={C.ink} strokeWidth={4} />
                      <text x={0} y={8} fontFamily="Anton" fontSize={36} fill={C.ink}>{m.lab}</text>
                    </g>
                  </g>
                );
              })
            : null}
        </>
      )}
    </Globe5>
  );
};

/* ---- piezas ---- */
const Seal: React.FC<{t: number; size?: number}> = ({t, size = 460}) => {
  const d0 = t - Q.sello + 0.3;
  const ry = d0 < 0.9 ? 360 * (1 - easeOut(clamp(d0 / 0.9))) : Math.sin((d0 - 0.9) * 1.6) * 28;
  const face = Math.cos((ry * Math.PI) / 180);
  return (
    <div style={{perspective: 1200, width: size, height: size}}>
      <div style={{width: size, height: size, transform: `rotateY(${ry}deg)`, transformStyle: 'preserve-3d', position: 'relative'}}>
        {Array.from({length: 12}).map((_, i) => (
          <div key={i} style={{position: 'absolute', inset: 0, borderRadius: '50%', background: '#B8860B', transform: `translateZ(${-i * 2}px)`}} />
        ))}
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, #FFF3B0 0%, #F5C542 35%, #C9961A 100%)`, border: `10px solid ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', filter: `brightness(${0.75 + 0.35 * Math.abs(face)})`}}>
          <div style={{position: 'absolute', inset: 26, borderRadius: '50%', border: `6px dashed ${C.ink}`, opacity: 0.6}} />
          <div style={{fontFamily: F.body, fontWeight: 900, fontSize: size * 0.07, letterSpacing: 6, color: C.ink}}>SELLO DE</div>
          <div style={{fontFamily: F.head, fontSize: size * 0.2, color: C.ink, lineHeight: 1}}>CALIDAD</div>
          <div style={{fontFamily: F.head, fontSize: size * 0.1, color: C.ink}}>★ OCDE ★</div>
        </div>
      </div>
    </div>
  );
};

const Bill: React.FC<{w?: number}> = ({w = 260}) => (
  <svg width={w} height={w * 0.5} viewBox="0 0 260 130">
    <rect x={4} y={4} width={252} height={122} rx={10} fill={C.bill} stroke={C.ink} strokeWidth={7} />
    <circle cx={130} cy={65} r={34} fill="none" stroke={C.billDark} strokeWidth={7} />
    <text x={130} y={80} textAnchor="middle" fontFamily="Anton" fontSize={44} fill={C.billDark}>$</text>
  </svg>
);

const VelvetRope: React.FC<{t: number}> = ({t}) => (
  <svg width={1000} height={300} viewBox="0 0 1000 300">
    {[120, 880].map((x) => (
      <g key={x}>
        <rect x={x - 16} y={60} width={32} height={210} rx={10} fill="#D4AF37" stroke={C.ink} strokeWidth={6} />
        <circle cx={x} cy={52} r={26} fill="#F1D36B" stroke={C.ink} strokeWidth={6} />
        <rect x={x - 50} y={262} width={100} height={24} rx={8} fill="#D4AF37" stroke={C.ink} strokeWidth={6} />
      </g>
    ))}
    <path d={`M136 90 Q500 ${210 + Math.sin(t * 2) * 12} 864 90`} fill="none" stroke={C.ink} strokeWidth={34} strokeLinecap="round" />
    <path d={`M136 90 Q500 ${210 + Math.sin(t * 2) * 12} 864 90`} fill="none" stroke="#B3122E" strokeWidth={22} strokeLinecap="round" />
  </svg>
);

/* ============================================================ */
export const Ocde: React.FC = () => {
  const T = useCurrentFrame() / tl.fps;
  const th = themeAt(SCENES, T);
  const sk = shake(T, Q.todos, 16, 0.5);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <SvgDefs />
      <LiveBG theme={th} t={T} />
      <Cam t={T} punches={PUNCH}>
        {/* ===================== S01 ===================== */}
        <B t={T} t0={0} t1={Q.catorce - 0.15} kind="fade">
          <GlobeArc t={T} />
          <At x={540} y={330} w={1000}>
            <div style={{transform: `scale(${pop(T, Q.semana)})`}}><Kicker t={T} t0={Q.semana} color={C.white}>ESTA SEMANA · 30/9 AL 2/10</Kicker></div>
          </At>
          <At x={860} y={720}>
            <div style={{transform: `scale(${pop(T, Q.semana + 0.5)}) rotate(4deg)`}}>
              <Photo3D src="milei.jpg" t={T} t0={Q.semana} w={290} h={370} focus="50% 25%" credit="Casa Blanca · DP" seed={3} />
            </div>
          </At>
          <At x={540} y={1240} w={1000}>
            <div style={{transform: `scale(${pop(T, Q.paris - 0.1)})`}}><Ext size={130} color={C.white} side="#000" t={T}>MILEI <span style={{color: C.yellow}}>→</span> PARÍS</Ext></div>
          </At>
        </B>

        <B t={T} t0={Q.catorce - 0.15} t1={Q.destino - 0.1} kind="rise">
          <At x={540} y={320}><Kicker t={T} t0={Q.catorce} color={C.white}>LA COMITIVA</Kicker></At>
          {[
            {t0: Q.catorce, n: 14, l: 'GOBERNADORES', col: C.yellow, y: 520, icons: 14},
            {t0: Q.ministros, n: 0, l: 'VARIOS MINISTROS', col: C.celeste, y: 790, icons: 5},
            {t0: Q.cuatro, n: 400, l: 'EMPRESARIOS', col: C.white, y: 1060, icons: 40},
          ].map((r, i) => (
            <At key={i} x={540} y={r.y}>
              <div style={{opacity: prog(T, r.t0 - 0.1, 0.2), transform: `translateX(${(1 - prog(T, r.t0 - 0.1, 0.5)) * (i % 2 ? 400 : -400)}px)`}}>
                <Card3D t={T} w={940} pad="16px 30px" bg={C.dark2} border={r.col} seed={i}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
                    {r.n ? <div style={{fontFamily: F.head, fontSize: 130, color: r.col, lineHeight: 1, minWidth: 250}}><Num t={T} t0={r.t0} to={r.n} dur={0.8} /></div> : null}
                    <div>
                      <div style={{fontFamily: F.head, fontSize: 60, color: C.white}}>{r.l}</div>
                      <div style={{display: 'flex', flexWrap: 'wrap', width: r.n ? 560 : 800, gap: 2}}>
                        {Array.from({length: r.icons}).map((_, k) => (
                          <div key={k} style={{transform: `scale(${T > r.t0 + k * 0.03 ? pop(T, r.t0 + k * 0.03, 1.5) : 0})`}}><Ico.person size={r.icons > 20 ? 20 : 30} color={r.col} /></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card3D>
              </div>
            </At>
          ))}
          <Src t={T} t0={Q.catorce} text="Casa Rosada · Infobae 19/9/2026 (≈400 empresarios confirmados)" y={1220} color="rgba(255,255,255,0.55)" />
        </B>

        {/* el castillo */}
        <B t={T} t0={Q.destino - 0.1} t1={Q.s2 - 0.1} kind="fade">
          <FullBleed src="muette.jpg" t={T} t0={Q.destino} span={9} dim={0.3} focus="50% 50%" zoom={[1.1, 1.3]} />
          <At x={540} y={380}><div style={{transform: `scale(${pop(T, Q.castillo)})`}}><Ext size={150} color={C.white} side="#000" t={T} style={{whiteSpace: 'nowrap'}}>UN CASTILLO</Ext></div></At>
          <At x={540} y={500}><div style={{opacity: prog(T, Q.castillo + 0.4, 0.3)}}><Pill bg={C.yellow} fg={C.ink} size={38}>CHÂTEAU DE LA MUETTE · PARÍS · SEDE DE LA OCDE</Pill></div></At>
          <At x={540} y={860}>
            <div style={{opacity: prog(T, Q.adentro, 0.3), transform: `translateY(${(1 - prog(T, Q.adentro, 0.6)) * 200}px)`}}><VelvetRope t={T} /></div>
          </At>
          <At x={540} y={740}>
            <div style={{transform: `scale(${pop(T, Q.club - 0.2)}) rotate(-3deg)`}}>
              <Card3D t={T} bg="#141417" border="#D4AF37" pad="22px 44px" seed={2}>
                <div style={{fontFamily: F.body, fontWeight: 900, fontSize: 30, letterSpacing: 10, color: '#D4AF37', textAlign: 'center'}}>★ VIP ★</div>
                <div style={{fontFamily: F.head, fontSize: 84, color: C.white, textAlign: 'center', lineHeight: 1.02, whiteSpace: 'nowrap'}}>CLUB DE LOS<br /><span style={{color: '#F1D36B'}}>PAÍSES RICOS</span></div>
              </Card3D>
            </div>
          </At>
          <At x={300} y={1140}><Slam t={T} t0={Q.quees} size={84} rot={-6} color={C.yellow}>¿QUÉ ES?</Slam></At>
          <At x={740} y={1170}><Slam t={T} t0={Q.sirve} size={70} rot={4} color={C.white}>¿PARA QUÉ SIRVE?</Slam></At>
          <div style={{position: 'absolute', right: 40, top: 262, fontFamily: F.body, fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.7)'}}>Foto: Wikimedia Commons</div>
        </B>

        {/* ===================== S02 ===================== */}
        <B t={T} t0={Q.s2 - 0.1} t1={Q.nacio - 0.1} kind="fade">
          <At x={540} y={620}>
            <div style={{display: 'flex', gap: 10}}>
              {'OCDE'.split('').map((l, i) => (
                <div key={i} style={{transform: `translateY(${(1 - Math.min(1, pop(T, Q.s2 + 0.25 + i * 0.12, 0.9))) * -700}px)`}}>
                  <Ext size={300} color={C.ink} side="#7a5a00" depth={16} t={T + i}>{l}</Ext>
                </div>
              ))}
            </div>
          </At>
          <At x={540} y={1010} w={960}>
            <div style={{fontFamily: F.head, fontSize: 64, lineHeight: 1.1, textAlign: 'center'}}>
              {[
                ['O', 'RGANIZACIÓN PARA LA'],
                ['C', 'OOPERACIÓN Y EL'],
                ['D', 'ESARROLLO'],
                ['E', 'CONÓMICOS'],
              ].map(([a, b], i) => (
                <div key={i} style={{opacity: prog(T, Q.org + i * 0.45, 0.3), transform: `translateX(${(1 - prog(T, Q.org + i * 0.45, 0.4)) * -80}px)`}}>
                  <span style={{background: C.ink, color: C.yellow, padding: '0 10px'}}>{a}</span>{b}
                </div>
              ))}
            </div>
          </At>
        </B>

        {/* 1961 */}
        <B t={T} t0={Q.nacio - 0.1} t1={Q.hoy - 0.2} kind="zoom">
          <At x={540} y={660}><Ext size={330} color={C.yellow} side="#000" depth={18} t={T}>1961</Ext></At>
          <At x={540} y={900}><div style={{transform: `scale(${pop(T, Q.sesenta + 0.8)})`}}><Pill bg={C.white} fg={C.ink} size={52}>20 PAÍSES FUNDADORES</Pill></div></At>
        </B>

        {/* globo con los 38 */}
        <B t={T} t0={Q.hoy - 0.2} t1={Q.pisa - 0.1} kind="zoom">
          <GlobeMembers t={T} />
          <At x={540} y={345} w={1000}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, opacity: prog(T, Q.treinta - 0.1, 0.3)}}>
              <span style={{fontFamily: F.head, fontSize: 150, color: C.yellow, lineHeight: 1, textShadow: '6px 8px 0 #000'}}><Num t={T} t0={Q.treinta - 0.1} to={38} dur={1} /></span>
              <span style={{fontFamily: F.head, fontSize: 64, color: C.white, lineHeight: 1}}>PAÍSES<br />MIEMBROS</span>
            </div>
          </At>
          <At x={540} y={1250} w={1000}>
            <div style={{opacity: prog(T, Q.mitad, 0.3) * (1 - prog(T, Q.eeuu - 0.2, 0.3)), transform: `scale(${pop(T, Q.mitad)})`}}>
              <Pill bg={C.yellow} fg={C.ink} size={44}>≈ LA MITAD DE LA ECONOMÍA MUNDIAL</Pill>
            </div>
          </At>
          {[
            {t0: Q.eeuu, l: 'ESTADOS UNIDOS', t1: Q.alemania},
            {t0: Q.alemania, l: 'ALEMANIA', t1: Q.japon},
            {t0: Q.japon, l: 'JAPÓN', t1: Q.latam},
            {t0: Q.latam, l: 'AMÉRICA LATINA: SOLO 4', t1: Q.pisa},
          ].map((r, i) =>
            T > r.t0 - 0.1 && T < r.t1 - 0.05 ? (
              <At key={i} x={540} y={1250}><div style={{transform: `scale(${pop(T, r.t0 - 0.1)})`}}><Pill bg={i === 3 ? C.red : C.white} fg={i === 3 ? C.white : C.ink} size={58} style={{border: `5px solid ${C.ink}`}}>{r.l}</Pill></div></At>
            ) : null,
          )}
          <Src t={T} t0={Q.mitad} text="OCDE · Infobae 11/11/2025" y={1190} color="rgba(255,255,255,0.5)" />
        </B>

        {/* PISA */}
        <B t={T} t0={Q.pisa - 0.1} t1={Q.s3 - 0.1} kind="flip">
          <At x={540} y={700}>
            <div style={{transform: 'rotate(-4deg)'}}>
              <Card3D t={T} w={720} h={760} pad="36px 44px" seed={3}>
                <div style={{fontFamily: F.head, fontSize: 90, textAlign: 'center'}}>PRUEBAS PISA</div>
                <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 28, textAlign: 'center', letterSpacing: 3, color: C.gray, marginBottom: 30}}>MATEMÁTICA · LECTURA · CIENCIAS</div>
                {[0, 1, 2, 3, 4].map((k) => (
                  <div key={k} style={{display: 'flex', alignItems: 'center', gap: 20, margin: '18px 0'}}>
                    <div style={{width: 46, height: 46, border: `5px solid ${C.ink}`, borderRadius: 8, position: 'relative'}}>
                      {T > Q.pisa + 0.3 + k * 0.25 ? <div style={{position: 'absolute', left: 4, top: -14, fontFamily: F.hand, fontSize: 56, color: C.red}}>✓</div> : null}
                    </div>
                    <div style={{height: 14, borderRadius: 7, background: '#ddd', width: 420 - (k % 2) * 90}} />
                  </div>
                ))}
              </Card3D>
            </div>
          </At>
          <At x={780} y={1030}><Slam t={T} t0={Q.pisa2} size={80} rot={-10}>OCDE</Slam></At>
        </B>

        {/* ===================== S03 ===================== */}
        <B t={T} t0={Q.s3 - 0.1} t1={Q.reglas - 0.1} kind="rise">
          <At x={540} y={360}><Ext size={96} t={T} style={{whiteSpace: 'nowrap'}}>¿PRESTA PLATA?</Ext></At>
          {[
            {l: 'FMI', ok: true, x: 290, t0: Q.fmi - 0.2, col: C.celesteDark},
            {l: 'OCDE', ok: false, x: 790, t0: Q.s3 + 0.5, col: C.ink},
          ].map((cd, i) => (
            <At key={i} x={cd.x} y={760}>
              <div style={{opacity: prog(T, cd.t0, 0.2), transform: `scale(${pop(T, cd.t0)})`}}>
                <Card3D t={T} w={420} h={560} pad="26px 20px" seed={i * 2}>
                  <div style={{fontFamily: F.head, fontSize: 110, textAlign: 'center', color: cd.col}}>{cd.l}</div>
                  <div style={{position: 'relative', height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 10}}>
                    {[0, 1, 2].map((k) => (
                      <div key={k} style={{position: 'absolute', transform: `translate(${(k - 1) * 14}px, ${(k - 1) * -18}px) rotate(${(k - 1) * 6}deg)`}}><Bill w={260} /></div>
                    ))}
                    {!cd.ok ? <div style={{position: 'absolute', transform: `scale(${pop(T, cd.t0 + 0.3)})`}}><Ico.cross size={170} /></div> : null}
                  </div>
                  <div style={{textAlign: 'center', marginTop: 30}}>{cd.ok ? <Ico.check size={100} /> : null}</div>
                  <div style={{fontFamily: F.head, fontSize: 48, textAlign: 'center', color: cd.ok ? C.green : C.red}}>{cd.ok ? 'PRESTA' : 'NO PRESTA'}</div>
                </Card3D>
              </div>
            </At>
          ))}
        </B>

        {/* reglas */}
        <B t={T} t0={Q.reglas - 0.1} t1={Q.entrar - 0.1} kind="flip">
          <At x={540} y={330}><Ext size={110} color={C.white} side="#000" t={T} style={{whiteSpace: 'nowrap'}}>PONE <span style={{color: C.yellow}}>REGLAS</span></Ext></At>
          <At x={540} y={800}>
            <Card3D t={T} w={880} pad="30px 40px" bg="#FBF8F2" seed={1}>
              <div style={{fontFamily: F.body, fontWeight: 900, fontSize: 30, letterSpacing: 6, color: C.gray, marginBottom: 10}}>MANUAL DEL BUEN ALUMNO</div>
              {[
                {t0: Q.imp, l: 'IMPUESTOS'}, {t0: Q.corr, l: 'CORRUPCIÓN'}, {t0: Q.inv, l: 'INVERSORES'}, {t0: Q.est, l: 'ESTADÍSTICAS'},
              ].map((r, i) => (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: 24, margin: '14px 0', opacity: T > r.t0 - 0.2 ? 1 : 0.18, transform: `translateX(${T > r.t0 - 0.2 ? 0 : 20}px)`}}>
                  <div style={{transform: `scale(${T > r.t0 - 0.2 ? pop(T, r.t0 - 0.2) : 1})`}}>{T > r.t0 - 0.2 ? <Ico.check size={90} /> : <div style={{width: 90, height: 90, borderRadius: '50%', border: `6px solid ${C.ink}`}} />}</div>
                  <div style={{fontFamily: F.head, fontSize: 92}}>{r.l}</div>
                </div>
              ))}
            </Card3D>
          </At>
        </B>

        {/* sello */}
        <B t={T} t0={Q.entrar - 0.1} t1={Q.s4 - 0.1} kind="zoom">
          <At x={540} y={640}><div style={{transform: `scale(${pop(T, Q.sello - 0.3)})`}}><Seal t={T} size={500} /></div></At>
          <Burst t={T} t0={Q.sello} x={540} y={640} />
          <At x={540} y={1060} w={980}>
            <div style={{opacity: prog(T, Q.mismas - 0.3, 0.3), transform: `scale(${pop(T, Q.mismas - 0.3)})`}}>
              <Ext size={84} t={T}>MISMAS REGLAS QUE LOS DESARROLLADOS</Ext>
            </div>
          </At>
        </B>

        {/* ===================== S04 ===================== */}
        <B t={T} t0={Q.s4 - 0.1} t1={Q.invit - 0.1} kind="rise">
          <At x={540} y={480}><Ext size={130} t={T}>¿CÓMO SE ENTRA?</Ext></At>
          <At x={540} y={780}>
            <div style={{opacity: prog(T, Q.despacio - 0.1, 0.2)}}>
              <div style={{width: 820, height: 110, border: `7px solid ${C.ink}`, borderRadius: 60, background: '#fff', overflow: 'hidden', position: 'relative', boxShadow: `8px 10px 0 ${C.ink}`}}>
                <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${3 + clamp((T - Q.despacio) / 3) * 6}%`, background: C.yellow, borderRight: `6px solid ${C.ink}`}} />
                <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.head, fontSize: 56}}>CARGANDO… {Math.floor(3 + clamp((T - Q.despacio) / 3) * 6)}%</div>
              </div>
            </div>
          </At>
          <At x={540} y={1000}><Slam t={T} t0={Q.despacio} size={110} rot={-5}>DESPACIO</Slam></At>
        </B>

        {/* línea de tiempo */}
        <B t={T} t0={Q.invit - 0.1} t1={Q.final - 0.1} kind="rise">
          <At x={540} y={320}><Kicker t={T} t0={Q.invit} color={C.white}>EL CAMINO DE LA ARGENTINA</Kicker></At>
          <div style={{position: 'absolute', left: 170, top: 400, width: 10, height: 800 * prog(T, Q.invit, Q.comites - Q.invit + 1, easeInOut), background: C.yellow, borderRadius: 5}} />
          {[
            {t0: Q.invit, y: 430, a: 'ENE 2022', b: 'INVITACIÓN'},
            {t0: Q.ruta, y: 620, a: 'MAR 2024', b: 'HOJA DE RUTA'},
            {t0: Q.nov, y: 810, a: 'NOV 2025', b: '+240 AUTOEVALUACIONES'},
            {t0: Q.comites, y: 1000, a: 'HOY', b: '25 COMITÉS REVISAN'},
          ].map((m, i) => (
            <div key={i} style={{position: 'absolute', left: 140, top: m.y, display: 'flex', alignItems: 'center', gap: 30, opacity: prog(T, m.t0 - 0.1, 0.2), transform: `translateX(${(1 - prog(T, m.t0 - 0.1, 0.5)) * 200}px)`}}>
              <div style={{width: 70, height: 70, borderRadius: '50%', background: i === 3 ? C.red : C.yellow, border: `6px solid ${C.white}`, transform: `scale(${pop(T, m.t0 - 0.1)})`}} />
              <Card3D t={T} pad="10px 26px" bg={C.dark2} border={i === 3 ? C.red : C.yellow} seed={i}>
                <div style={{fontFamily: F.body, fontWeight: 900, fontSize: 30, color: i === 3 ? C.red : C.yellow, letterSpacing: 3}}>{m.a}</div>
                <div style={{fontFamily: F.head, fontSize: 60, color: C.white, whiteSpace: 'nowrap'}}>{m.b}</div>
              </Card3D>
            </div>
          ))}
          <div style={{position: 'absolute', left: 250, top: 1140, display: 'flex', gap: 8, flexWrap: 'wrap', width: 760}}>
            {Array.from({length: 25}).map((_, i) => (
              <div key={i} style={{width: 22, height: 22, borderRadius: 5, background: T > Q.comites + 0.2 + i * 0.05 ? (i < 2 ? C.green : 'rgba(255,255,255,0.35)') : 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.5)'}} />
            ))}
          </div>
          <Src t={T} t0={Q.invit} text="OCDE · Cancillería · Infobae 11/11/2025" y={1215} color="rgba(255,255,255,0.5)" />
        </B>

        {/* 38 votos: todos */}
        <B t={T} t0={Q.final - 0.1} t1={Q.colombia - 0.1} kind="zoom">
          <div style={{position: 'absolute', inset: 0, transform: `translate(${sk.x}px, ${sk.y}px)`}}>
            <At x={540} y={340}><Ext size={100} color={C.white} side="#000" t={T}>38 VOTOS</Ext></At>
            <div style={{position: 'absolute', left: 120, top: 450, width: 840, display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center'}}>
              {Array.from({length: 38}).map((_, i) => {
                const t0 = Q.final + 0.4 + i * 0.045;
                const on = T > t0;
                return (
                  <div key={i} style={{width: 96, height: 96, borderRadius: 16, background: on ? C.green : 'rgba(255,255,255,0.1)', border: `5px solid ${on ? C.white : 'rgba(255,255,255,0.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.head, fontSize: 40, color: C.white, transform: `scale(${on ? pop(T, t0, 1.4) : 0.8})`}}>
                    {on ? 'SÍ' : ''}
                  </div>
                );
              })}
            </div>
            <At x={540} y={1140}><Slam t={T} t0={Q.todos} size={130} rot={-6} color={C.yellow}>TODOS</Slam></At>
          </div>
        </B>

        {/* cuánto tardaron */}
        <B t={T} t0={Q.colombia - 0.1} t1={Q.s5 - 0.1} kind="rise">
          <At x={540} y={330}><Kicker t={T} t0={Q.colombia}>CUÁNTO TARDARON</Kicker></At>
          {[
            {l: 'COLOMBIA', v: 7, lab: '7 AÑOS', t0: Q.colombia, col: C.yellow, y: 540},
            {l: 'COSTA RICA', v: 10, lab: '≈ 10 AÑOS', t0: Q.costa, col: C.celeste, y: 780},
            {l: 'ARGENTINA', v: 4.7, lab: '2022 → ¿?', t0: Q.costa + 1.0, col: '#ddd', y: 1020},
          ].map((r, i) => (
            <div key={i} style={{position: 'absolute', left: 90, top: r.y, opacity: prog(T, r.t0 - 0.1, 0.2)}}>
              <div style={{fontFamily: F.head, fontSize: 56, marginBottom: 8}}>{r.l}</div>
              <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
                <div style={{height: 100, width: 80 * r.v * easeOut(clamp((T - r.t0) / 1)), background: r.col, border: `6px solid ${C.ink}`, borderRadius: 14, boxShadow: `8px 8px 0 ${C.ink}`, backgroundImage: i === 2 ? `repeating-linear-gradient(45deg, #ccc 0 16px, #eee 16px 32px)` : undefined}} />
                <div style={{fontFamily: F.head, fontSize: 64, opacity: prog(T, r.t0 + 0.6, 0.3), whiteSpace: 'nowrap'}}>{r.lab}</div>
              </div>
            </div>
          ))}
          <Src t={T} t0={Q.colombia} text="El País (Cali) · France 24" y={1215} />
        </B>

        {/* ===================== S05 ===================== */}
        <B t={T} t0={Q.s5 - 0.1} t1={Q.favor - 0.1} kind="zoom">
          <At x={540} y={700}><Ext size={260} depth={16} t={T}>¿Y SIRVE?</Ext></At>
        </B>

        <B t={T} t0={Q.favor - 0.1} t1={Q.dudan - 0.1} kind="rise">
          <At x={540} y={320}><div style={{transform: `scale(${pop(T, Q.favor)})`}}><Pill bg={C.green} size={56} style={{border: `5px solid ${C.ink}`}}>A FAVOR</Pill></div></At>
          <At x={540} y={480}>
            <div style={{display: 'flex', gap: 24}}>
              {[{t0: Q.riesgo, l: '↓ RIESGO'}, {t0: Q.atrae, l: '↑ INVERSIONES'}].map((r, i) => (
                <div key={i} style={{opacity: prog(T, r.t0, 0.2), transform: `scale(${pop(T, r.t0)})`}}>
                  <Card3D t={T} pad="14px 26px" seed={i}><div style={{fontFamily: F.head, fontSize: 72, color: C.green, whiteSpace: 'nowrap'}}>{r.l}</div></Card3D>
                </div>
              ))}
            </div>
          </At>
          {/* vidriera */}
          <At x={540} y={900}>
            <div style={{opacity: prog(T, Q.vidriera, 0.3), transform: `translateY(${(1 - prog(T, Q.vidriera, 0.5)) * 200}px)`}}>
              <div style={{width: 900, height: 470, border: `10px solid ${C.ink}`, borderRadius: 20, background: 'linear-gradient(160deg, #EAF4FC 0%, #BFDDF3 100%)', position: 'relative', boxShadow: `12px 14px 0 ${C.ink}`, overflow: 'hidden'}}>
                <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 90, background: `repeating-linear-gradient(90deg, ${C.red} 0 60px, #fff 60px 120px)`, borderBottom: `8px solid ${C.ink}`}} />
                <div style={{position: 'absolute', left: -200, top: 90, width: 180, height: 400, background: 'rgba(255,255,255,0.5)', transform: `translateX(${((T * 300) % 1400)}px) skewX(-20deg)`}} />
                <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', fontFamily: F.head, fontSize: 44, letterSpacing: 4}}>VIDRIERA ARGENTINA · PARÍS</div>
                <div style={{position: 'absolute', left: 30, right: 30, top: 200, display: 'flex', justifyContent: 'space-around'}}>
                  {[
                    {t0: Q.mineria, e: '⛏️', l: 'MINERÍA'}, {t0: Q.energia, e: '⚡', l: 'ENERGÍA'}, {t0: Q.tecno, e: '💻', l: 'TECNOLOGÍA'},
                  ].map((it, i) => (
                    <div key={i} style={{textAlign: 'center', transform: `scale(${pop(T, it.t0 - 0.1)}) translateY(${Math.sin(T * 2 + i) * 6}px)`}}>
                      <div style={{fontSize: 120}}>{it.e}</div>
                      <Pill bg={C.ink} size={36}>{it.l}</Pill>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </At>
        </B>

        <B t={T} t0={Q.dudan - 0.1} t1={Q.s6 - 0.1} kind="rise">
          <At x={540} y={320}><div style={{transform: `scale(${pop(T, Q.dudan)})`}}><Pill bg={C.ink} fg={C.white} size={56}>LOS QUE DUDAN</Pill></div></At>
          <At x={540} y={500} w={980}><div style={{opacity: prog(T, Q.rico - 0.3, 0.2), transform: `scale(${pop(T, Q.rico - 0.3)})`}}><Ext size={96} color={C.white} side="#5a0f0a" t={T}>ENTRAR NO TE HACE RICO</Ext></div></At>
          <At x={540} y={790}>
            <div style={{opacity: prog(T, Q.mexico - 0.1, 0.2), transform: `scale(${pop(T, Q.mexico - 0.1)})`}}>
              <Card3D t={T} w={880} pad="20px 34px" seed={2}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>
                    <div style={{fontFamily: F.head, fontSize: 84}}>MÉXICO</div>
                    <div style={{fontFamily: F.body, fontWeight: 900, fontSize: 30, letterSpacing: 2}}>EN LA OCDE DESDE <span style={{background: C.yellow, padding: '0 8px'}}>1994</span></div>
                  </div>
                  <div style={{textAlign: 'center', opacity: prog(T, Q.todavia, 0.2), transform: `scale(${pop(T, Q.todavia)})`}}>
                    <div style={{fontFamily: F.body, fontWeight: 900, fontSize: 24}}>¿DESARROLLADO?</div>
                    <div style={{fontFamily: F.head, fontSize: 70, color: C.red}}>TODAVÍA NO</div>
                  </div>
                </div>
              </Card3D>
            </div>
          </At>
          <At x={540} y={1090}>
            <div style={{display: 'flex', alignItems: 'center', gap: 20, opacity: prog(T, Q.reformas, 0.2), transform: `translateY(${(1 - prog(T, Q.reformas, 0.4)) * 80}px)`}}>
              <Ico.hourglass size={190} t={T} />
              <div>
                <div style={{fontFamily: F.head, fontSize: 70, color: C.white, whiteSpace: 'nowrap'}}>REFORMAS = AÑOS</div>
                <div style={{opacity: prog(T, Q.populares - 0.4, 0.3)}}><Pill bg={C.yellow} fg={C.ink} size={40}>Y NO SIEMPRE POPULARES</Pill></div>
              </div>
            </div>
          </At>
        </B>

        {/* ===================== S06 ===================== */}
        <B t={T} t0={Q.s6 - 0.1} t1={Q.milei - 0.1} kind="rise">
          <At x={540} y={320}><Kicker t={T} t0={Q.s6} color={C.white}>EN RESUMEN</Kicker></At>
          <At x={540} y={600}>
            <div style={{opacity: prog(T, Q.plata - 0.6, 0.2), transform: `scale(${pop(T, Q.plata - 0.6)})`, display: 'flex', alignItems: 'center', gap: 30}}>
              <div style={{position: 'relative'}}><Bill w={280} /><div style={{position: 'absolute', left: 60, top: -10}}><Ico.cross size={150} /></div></div>
              <Ext size={100} color={C.white} side="#000" t={T}>NO DA<br />PLATA</Ext>
            </div>
          </At>
          <At x={540} y={1000}>
            <div style={{opacity: prog(T, Q.reput, 0.2), transform: `scale(${pop(T, Q.reput)})`}}>
              <Card3D t={T} pad="18px 40px" bg={C.yellow} seed={1}><div style={{fontFamily: F.head, fontSize: 90, whiteSpace: 'nowrap'}}>REGLAS + REPUTACIÓN</div></Card3D>
            </div>
          </At>
        </B>

        <B t={T} t0={Q.milei - 0.1} t1={Q.vos - 0.1} kind="fade">
          <FullBleed src="eiffel.mp4" video t={T} t0={Q.milei - 0.1} span={8} dim={0.35} startFrom={1} zoom={[1.0, 1.08]} />
          <At x={540} y={420} w={1000}><div style={{transform: `scale(${pop(T, Q.milei)})`}}><Ext size={110} color={C.white} side="#000" t={T}>¿JUGAR EN ESA LIGA?</Ext></div></At>
          <At x={540} y={880}>
            <div style={{opacity: prog(T, Q.anios - 0.8, 0.3), transform: `scale(${pop(T, Q.anios - 0.8)})`}}>
              <Card3D t={T} w={520} pad={0} seed={2}>
                <div style={{background: C.red, height: 80, borderRadius: '18px 18px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.head, fontSize: 48, color: C.white, letterSpacing: 4}}>INGRESO A LA OCDE</div>
                <div style={{height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.head, fontSize: 150, overflow: 'hidden'}}>
                  {2026 + Math.min(6, Math.floor(clamp((T - Q.anios + 0.6) / 1.8) * 7))}{T > Q.anios + 1.2 ? '+' : ''}
                </div>
              </Card3D>
            </div>
          </At>
          <At x={540} y={1150}><Slam t={T} t0={Q.anios} size={90} rot={-4} color={C.yellow}>VA A LLEVAR AÑOS</Slam></At>
          <div style={{position: 'absolute', right: 40, top: 262, fontFamily: F.body, fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.7)'}}>Video: the Dronalist · CC BY</div>
        </B>

        <B t={T} t0={Q.vos - 0.1} t1={E} kind="swing">
          <At x={540} y={400} w={1000}><Ext size={120} t={T}>¿VOS QUÉ PENSÁS?</Ext></At>
          {[
            {l: 'CLUB DE RICOS', t0: Q.ricos, y: 640, col: '#D4AF37', v: 0.55},
            {l: 'CLUB DE REGLAS', t0: Q.reglas2, y: 860, col: C.celeste, v: 0.45},
          ].map((o, i) => (
            <At key={i} x={540} y={o.y}>
              <div style={{opacity: prog(T, o.t0 - 0.1, 0.2), transform: `scale(${pop(T, o.t0 - 0.1)})`}}>
                <div style={{width: 880, height: 150, border: `7px solid ${C.ink}`, borderRadius: 30, background: C.white, position: 'relative', overflow: 'hidden', boxShadow: `8px 10px 0 ${C.ink}`}}>
                  <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${o.v * 100 * easeOut(clamp((T - Q.contame) / 1.2))}%`, background: o.col}} />
                  <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', paddingLeft: 40, fontFamily: F.head, fontSize: 76}}>{o.l}</div>
                </div>
              </div>
            </At>
          ))}
          <At x={540} y={1070}><div style={{opacity: prog(T, Q.contame, 0.3), fontFamily: F.hand, fontSize: 60, transform: 'rotate(-3deg)'}}>¡contame en los comentarios!</div></At>
          <At x={540} y={1210}><div style={{opacity: prog(T, Q.segui, 0.3), transform: `scale(${pop(T, Q.segui)})`}}><Pill size={50}>SEGUÍ A CONTEXTO</Pill></div></At>
        </B>
      </Cam>

      {SCENES.slice(1).map((s, i) => (
        <Transition key={i} t={T} at={s.t} kind={s.wipe} to={s.theme} from={SCENES[i].theme} dir={i % 2 ? -1 : 1} />
      ))}

      <TopBar t={T} total={E} label="CONTEXTO · ARGENTINA Y LA OCDE" theme={th} marks={[at('s02'), at('s03'), at('s04'), at('s05'), at('s06')]} />
      <Captions t={T} chunks={CHUNKS} />
      <EndCard t={T} E={E} title="¿club de ricos o club de reglas?" sub="Temas complejos, explicados simple" />
      <Grain opacity={0.07} />
    </AbsoluteFill>
  );
};
