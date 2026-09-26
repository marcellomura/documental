import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import tlj from '../data/rpb/timeline.json';
import words from '../data/rpb/words.json';
import {C, F} from '../theme';
import {clamp, easeInOut, easeOut, fmt, pop, prog, range, rnd, shake} from '../lib/anim';
import {Strike, SvgDefs, Grain} from '../components/base';
import {
  Arrow3D, At, B, Burst, Captions, Card3D, Cam, EndCard, Ext, Ico, Kicker, LiveBG, Num, Photo3D, Pill, Prism, SceneDef, Slam, Src, THEMES,
  TopBar, Transition, TL, Word, buildChunks, makeCue, themeAt,
} from './kit';

/* Reel vertical · "BAJA LA INFLACIÓN… ¿Y SUBE LA POBREZA?" */
const tl = tlj as TL;
const WS = words as Record<string, Word[]>;
const {c, at} = makeCue(tl, WS);
const NUMS: [string, string][] = [
  ['uno coma siete por ciento', '1,7 %'], ['treinta y dos por ciento', '32 %'], ['dos mil veintitrés', '2023'], ['veinticinco por ciento', '25 %'],
  ['once por ciento', '11 %'], ['un veinte', 'un 20 %'], ['un veintiuno', 'un 21 %'], ['un millón cuatrocientos mil pesos', '$1.400.000'],
  ['novecientos veinte mil', '$920.000'], ['cuarenta y dos por ciento', '42 %'], ['cuarenta y cuatro por ciento', '44 %'], ['cuatro puntos', '4 puntos'],
  ['Quince millones', '15 millones'],
];
const CHUNKS = buildChunks(tl, WS, NUMS);
const E = tl.endCard;

/* ---- cues principales ---- */
const Q = {
  infl: c('s01', 'La inflación'), pob: c('s01', 'la pobreza sube.'), como: c('s01', '¿Cómo puede ser?'), agosto: c('s01', 'En agosto,'),
  uno: c('s01', 'uno coma'), datos: c('s01', 'uno de los datos'), semana: c('s01', 'Pero esta semana,'), treinta: c('s01', 'treinta y dos'),
  quince: c('s01', 'Quince millones'), noera: c('s01', '¿No era'), bajaPob: c('s01', 'baja la pobreza?'),
  s2: at('s02'), qlaInfl: c('s02', 'que la inflación'), noQuiere: c('s02', 'no quiere decir'), preciosBajen: c('s02', 'los precios bajen.'),
  quiere: c('s02', 'Quiere decir'), despacio: c('s02', 'despacio.'), dic: c('s02', 'En diciembre'), veinti: c('s02', 'veinticinco'),
  ahora: c('s02', 'Ahora suben'), auto: c('s02', 'El auto'), pero2: c('s02', 'pero sigue'),
  s3: at('s03'), indec: c('s03', 'El INDEC arma'), canasta: c('s03', 'una canasta'), comida: c('s03', 'comida,'), ropa: c('s03', 'ropa,'),
  transp: c('s03', 'transporte,'), salud: c('s03', 'salud.'), sefija: c('s03', 'Y se fija'), alcanza: c('s03', 'alcanza para'), sino: c('s03', 'Si no alcanza,'),
  pobre: c('s03', 'sos pobre.'), importa: c('s03', 'Lo que importa'), carrera: c('s03', 'es la carrera'), ingreso: c('s03', 'tu ingreso'), esa: c('s03', 'esa canasta.'),
  s4: at('s04'), gano: c('s04', 'ganó la canasta.'), segun: c('s04', 'Según el INDEC,'), ingr: c('s04', 'los ingresos'), once: c('s04', 'once'),
  canas: c('s04', 'La canasta,'), veinte: c('s04', 'casi un veinte.'), comi: c('s04', 'Y la comida,'), veintiuno: c('s04', 'veintiuno.'),
  hogar: c('s04', 'Un hogar'), necesita: c('s04', 'necesita'), entran: c('s04', 'Le entran'), falta: c('s04', 'Le falta'),
  s5: at('s05'), anterior: c('s05', 'Contra el semestre anterior,'), cuatro: c('s05', 'cuatro puntos.'), mismo: c('s05', 'Contra el mismo'),
  menos: c('s05', 'menos de uno.'), gob: c('s05', 'El Gobierno'), cuarentaDos: c('s05', 'cuarenta y dos'), criticos: c('s05', 'Los críticos'),
  chicos: c('s05', 'entre los chicos'), cuarentaCuatro: c('s05', 'cuarenta y cuatro'),
  s6: at('s06'), infTe: c('s06', 'la inflación te dice'), pobTe: c('s06', 'La pobreza te dice'), plata: c('s06', 'si tu plata'), ayuda: c('s06', 'ayuda,'),
  noAlc: c('s06', 'pero no alcanza'), vos: c('s06', '¿Vos sentís'), contame: c('s06', 'Contame'), segui: c('s06', 'Y seguí'),
};

const SCENES: SceneDef[] = [
  {t: 0, theme: 'paper'},
  {t: Q.semana - 0.05, theme: 'ink', wipe: 'stack'},
  {t: Q.noera - 0.1, theme: 'paper', wipe: 'blinds'},
  {t: Q.s2 - 0.1, theme: 'yellow', wipe: 'iris'},
  {t: Q.dic - 0.1, theme: 'ink', wipe: 'stack'},
  {t: Q.auto - 0.1, theme: 'celeste', wipe: 'slab'},
  {t: Q.s3 - 0.1, theme: 'paper', wipe: 'iris'},
  {t: Q.importa - 0.1, theme: 'ink', wipe: 'stack'},
  {t: Q.s4 - 0.1, theme: 'paper', wipe: 'blinds'},
  {t: Q.hogar - 0.1, theme: 'yellow', wipe: 'stack'},
  {t: Q.s5 - 0.1, theme: 'celeste', wipe: 'iris'},
  {t: Q.criticos - 0.1, theme: 'ink', wipe: 'stack'},
  {t: Q.s6 - 0.1, theme: 'paper', wipe: 'iris'},
  {t: Q.vos - 0.1, theme: 'yellow', wipe: 'blinds'},
];
const next = (t0: number) => SCENES.find((s) => s.t > t0 + 0.01)?.t ?? E;
const PUNCH = [Q.como, Q.treinta, Q.quince, Q.preciosBajen, Q.veinti, Q.pobre, Q.gano, Q.falta, Q.cuatro, Q.cuarentaCuatro, Q.noAlc];

/* ---- piezas propias ---- */
const Gauge: React.FC<{v: number; max?: number; size?: number}> = ({v, max = 30, size = 700}) => {
  const a = -180 + (clamp(v / max) * 180);
  const R = 300;
  const arc = (a0: number, a1: number, col: string) => {
    const p = (a: number) => [350 + R * Math.cos((a * Math.PI) / 180), 350 + R * Math.sin((a * Math.PI) / 180)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return <path d={`M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}`} stroke={col} strokeWidth={70} fill="none" />;
  };
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 700 430">
      {arc(-180, -120, C.green)}
      {arc(-120, -60, C.yellow)}
      {arc(-60, 0, C.red)}
      <path d="M50 350 A300 300 0 0 1 650 350" stroke={C.ink} strokeWidth={8} fill="none" opacity={0.0} />
      {[0, 5, 10, 15, 20, 25, 30].map((k) => {
        const aa = ((-180 + (k / max) * 180) * Math.PI) / 180;
        return (
          <g key={k}>
            <line x1={350 + 250 * Math.cos(aa)} y1={350 + 250 * Math.sin(aa)} x2={350 + 222 * Math.cos(aa)} y2={350 + 222 * Math.sin(aa)} stroke="#fff" strokeWidth={6} />
            <text x={350 + 190 * Math.cos(aa)} y={362 + 190 * Math.sin(aa)} fill="#fff" fontFamily="Anton" fontSize={34} textAnchor="middle">{k}</text>
          </g>
        );
      })}
      <g transform={`rotate(${a} 350 350)`}>
        <polygon points="350,336 640,350 350,364" fill={C.white} stroke={C.ink} strokeWidth={4} />
      </g>
      <circle cx={350} cy={350} r={34} fill={C.yellow} stroke={C.ink} strokeWidth={6} />
    </svg>
  );
};

const Car: React.FC<{size?: number; t: number}> = ({size = 300, t}) => (
  <svg width={size} height={size * 0.55} viewBox="0 0 300 165">
    <path d="M20 110 L30 70 Q36 58 50 56 L95 52 L130 22 Q138 16 150 16 L215 16 Q228 16 236 26 L262 58 Q284 62 288 84 L290 110 Z" fill={C.red} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
    <path d="M110 54 L140 28 L178 28 L178 54 Z M190 28 L226 28 L248 54 L190 54 Z" fill="#CFE6F7" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    {[80, 232].map((x) => (
      <g key={x} transform={`rotate(${(t * 400) % 360} ${x} 118)`}>
        <circle cx={x} cy={118} r={30} fill={C.ink} />
        <circle cx={x} cy={118} r={12} fill="#ddd" />
        <rect x={x - 3} y={92} width={6} height={20} fill="#ddd" />
      </g>
    ))}
    <text x={150} y={96} fontFamily="Anton" fontSize={30} fill="#fff" textAnchor="middle">PRECIOS</text>
  </svg>
);

const Basket: React.FC<{size?: number}> = ({size = 560}) => (
  <svg width={size} height={size * 0.62} viewBox="0 0 560 350">
    <path d="M150 120 Q280 -20 410 120" fill="none" stroke={C.ink} strokeWidth={22} strokeLinecap="round" />
    <path d="M150 120 Q280 -20 410 120" fill="none" stroke={C.yellow} strokeWidth={10} strokeLinecap="round" />
    <path d="M40 120 H520 L480 330 H80 Z" fill="#C98A3C" stroke={C.ink} strokeWidth={9} strokeLinejoin="round" />
    <path d="M40 120 H520 L512 160 H48 Z" fill="#E3A652" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <line key={i} x1={100 + i * 60} y1={170} x2={110 + i * 57} y2={320} stroke={C.ink} strokeWidth={6} opacity={0.5} />
    ))}
    <text x={280} y={262} fontFamily="Anton" fontSize={54} fill={C.white} textAnchor="middle" stroke={C.ink} strokeWidth={3} paintOrder="stroke">CANASTA</text>
  </svg>
);

const Runner: React.FC<{label: string; col: string; t: number}> = ({label, col, t}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${Math.abs(Math.sin(t * 9)) * -14}px)`}}>
    <div style={{width: 120, height: 120, borderRadius: '50%', background: col, border: `7px solid ${C.ink}`, boxShadow: `6px 8px 0 ${C.ink}`}} />
    <Pill bg={col} fg={C.ink} size={36} style={{border: `4px solid ${C.ink}`, marginTop: 10}}>{label}</Pill>
  </div>
);

/* ============================================================ */
export const Pobreza: React.FC = () => {
  const T = useCurrentFrame() / tl.fps;
  const th = themeAt(SCENES, T);
  const fg = THEMES[th].fg;
  const sk = shake(T, Q.como, 18, 0.5);
  const sk2 = shake(T, Q.falta, 14, 0.45);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <SvgDefs />
      <LiveBG theme={th} t={T} />
      <Cam t={T} punches={PUNCH}>
        {/* ===================== S01 ===================== */}
        {/* gancho: flechas 3D */}
        <B t={T} t0={0} t1={Q.agosto} kind="fade">
          <div style={{position: 'absolute', inset: 0, transform: `translate(${sk.x}px, ${sk.y}px)`}}>
            <At x={290} y={600}>
              <div style={{transform: `scale(${pop(T, Q.infl)}) translateY(${Math.sin(T * 2.2) * 14 + prog(T, Q.infl + 0.2, 1.2) * 60}px)`}}>
                <Arrow3D up={false} color={C.green} size={300} />
              </div>
            </At>
            <At x={790} y={600}>
              <div style={{transform: `scale(${pop(T, Q.pob)}) translateY(${Math.sin(T * 2.2 + 1) * 14 - prog(T, Q.pob + 0.2, 1.2) * 60}px)`}}>
                <Arrow3D up color={C.red} size={300} />
              </div>
            </At>
            <At x={290} y={960}><div style={{opacity: prog(T, Q.infl, 0.3)}}><Ext size={92} t={T}>INFLACIÓN</Ext></div></At>
            <At x={790} y={960}><div style={{opacity: prog(T, Q.pob, 0.3)}}><Ext size={92} t={T} color={C.red}>POBREZA</Ext></div></At>
            <At x={540} y={1150}><Slam t={T} t0={Q.como} size={100} rot={-5}>¿CÓMO PUEDE SER?</Slam></At>
          </div>
        </B>

        {/* agosto: 1,7 % */}
        <B t={T} t0={Q.agosto - 0.05} t1={next(Q.agosto - 0.1)} kind="flip">
          <At x={540} y={440}>
            <Card3D t={T} w={420} h={250} pad={0} seed={2}>
              <div style={{background: C.red, height: 80, borderRadius: '18px 18px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.head, fontSize: 52, color: C.white, letterSpacing: 4}}>AGOSTO</div>
              <div style={{textAlign: 'center', fontFamily: F.head, fontSize: 120, lineHeight: '150px'}}>2026</div>
            </Card3D>
          </At>
          <At x={540} y={800}>
            <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
              <div style={{transform: `scale(${pop(T, Q.uno)})`}}><Arrow3D up={false} color={C.green} size={130} /></div>
              <Ext size={250} color={C.green} side="#0b4a2d" t={T} style={{opacity: prog(T, Q.uno - 0.1, 0.2)}}><Num t={T} t0={Q.uno} to={1.7} dec={1} suf="%" /></Ext>
            </div>
          </At>
          <At x={540} y={1010}><div style={{opacity: prog(T, Q.uno + 0.3, 0.4), fontFamily: F.body, fontWeight: 900, fontSize: 40, letterSpacing: 4}}>INFLACIÓN DEL MES</div></At>
          <At x={540} y={1110} w={900}>
            <div style={{textAlign: 'center', transform: `scale(${pop(T, Q.datos)})`}}>
              <Pill bg={C.ink} fg={C.yellow} size={40}>DE LAS MÁS BAJAS DESDE QUE ASUMIÓ MILEI</Pill>
            </div>
          </At>
          <Src t={T} t0={Q.uno} text="INDEC · IPC agosto 2026" y={1200} />
        </B>

        {/* INDEC: pobreza 32,3 % */}
        <B t={T} t0={Q.semana - 0.05} t1={Q.quince} kind="rise">
          <At x={540} y={500}>
            <Photo3D src="indec2.jpg" t={T} t0={Q.semana} w={800} h={500} credit="INDEC · Wikimedia Commons" rot={-2} span={4} />
          </At>
          <At x={540} y={830}><Kicker t={T} t0={Q.semana + 0.3} color={C.white}>POBREZA · 1.er SEMESTRE 2026</Kicker></At>
          <At x={540} y={1010}>
            <div style={{transform: `scale(${0.6 + 0.4 * pop(T, Q.treinta - 0.1)})`, opacity: prog(T, Q.treinta - 0.15, 0.15)}}>
              <Ext size={250} color={C.red} side="#5a0f0a" t={T}><Num t={T} t0={Q.treinta - 0.1} to={32.3} dec={1} suf="%" /></Ext>
            </div>
          </At>
          <Src t={T} t0={Q.treinta} text="INDEC · EPH 24/9/2026" y={1200} color="rgba(255,255,255,0.55)" />
        </B>

        {/* 15 millones: grilla de personas */}
        <B t={T} t0={Q.quince - 0.05} t1={next(Q.quince)} kind="zoom">
          <At x={540} y={330}>
            <div style={{transform: `scale(${pop(T, Q.quince)})`}}><Ext size={120} color={C.white} side="#000" t={T}>15 MILLONES</Ext></div>
          </At>
          <div style={{position: 'absolute', left: 115, top: 430, width: 850, display: 'flex', flexWrap: 'wrap', gap: '6px 0'}}>
            {Array.from({length: 100}).map((_, i) => {
              const red = i < 32;
              const on = T > Q.quince + 0.1 + i * 0.012;
              return (
                <div key={i} style={{width: 85, height: 76, display: 'flex', justifyContent: 'center', transform: `scale(${on ? pop(T, Q.quince + 0.1 + i * 0.012, 1.4) : 0})`}}>
                  <Ico.person size={44} color={red ? C.red : 'rgba(255,255,255,0.22)'} />
                </div>
              );
            })}
          </div>
          <At x={540} y={1225}><div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, opacity: prog(T, Q.quince + 1, 0.4)}}>CADA FIGURA = 1 % DE LA POBLACIÓN</div></At>
        </B>

        {/* ¿no era que...? */}
        <B t={T} t0={Q.noera - 0.1} t1={Q.s2 - 0.1} kind="swing">
          <At x={540} y={520}><Card3D t={T} pad="16px 40px" seed={1}><Ext size={120} tilt={false}>INFLACIÓN <span style={{color: C.green}}>↓</span></Ext></Card3D></At>
          <At x={540} y={720}><div style={{fontFamily: F.head, fontSize: 170, transform: `scale(${pop(T, Q.noera + 0.8)})`}}>=</div></At>
          <At x={540} y={920}><div style={{transform: `scale(${pop(T, Q.bajaPob - 0.2)})`}}><Card3D t={T} pad="16px 40px" seed={3}><Ext size={120} tilt={false}>POBREZA <span style={{color: C.green}}>↓</span></Ext></Card3D></div></At>
          <At x={900} y={680}><div style={{fontFamily: F.hand, fontSize: 300, color: C.red, transform: `rotate(${12 + Math.sin(T * 4) * 8}deg) scale(${pop(T, Q.bajaPob + 0.3)})`}}>?</div></At>
        </B>

        {/* ===================== S02 ===================== */}
        <B t={T} t0={Q.s2 - 0.1} t1={Q.quiere} kind="fade">
          <At x={540} y={330}><div style={{transform: `scale(${pop(T, Q.s2)}) rotate(-3deg)`}}><Pill size={56} bg={C.ink} fg={C.yellow}>TRAMPA #1</Pill></div></At>
          <At x={540} y={560}><div style={{opacity: prog(T, Q.qlaInfl, 0.3), transform: `translateY(${(1 - prog(T, Q.qlaInfl, 0.5)) * 60}px)`}}><Ext size={130} t={T}>INFLACIÓN BAJA</Ext></div></At>
          <At x={540} y={760}><div style={{fontFamily: F.head, fontSize: 200, color: C.red, transform: `scale(${pop(T, Q.noQuiere)})`}}>≠</div></At>
          <At x={540} y={960}>
            <div style={{opacity: prog(T, Q.preciosBajen, 0.3), transform: `scale(${pop(T, Q.preciosBajen)})`}}>
              <Card3D t={T} bg={C.white} pad="10px 36px" seed={4}><Ext size={120} tilt={false}>PRECIOS QUE BAJAN</Ext></Card3D>
            </div>
          </At>
        </B>

        {/* escalera: suben más despacio */}
        <B t={T} t0={Q.quiere - 0.05} t1={next(Q.quiere)} kind="rise">
          <At x={540} y={420} w={1000}><Ext size={110} t={T}>SUBEN MÁS <span style={{background: C.ink, color: C.yellow, padding: '0 16px'}}>DESPACIO</span></Ext></At>
          {(() => {
            const steps = [90, 170, 235, 285, 322, 348, 366];
            const k = clamp((T - Q.quiere - 0.3) / 3.2);
            const pos = k * (steps.length - 1);
            const i0 = Math.floor(pos), f = pos - i0;
            const hh = steps[i0] + (steps[Math.min(i0 + 1, steps.length - 1)] - steps[i0]) * easeInOut(f);
            return (
              <div style={{position: 'absolute', left: 90, top: 560, width: 900, height: 620}}>
                {steps.map((h, i) => (
                  <div key={i} style={{position: 'absolute', left: i * 120, bottom: 0, opacity: prog(T, Q.quiere + i * 0.08, 0.3), transform: `translateY(${(1 - prog(T, Q.quiere + i * 0.08, 0.4)) * 60}px)`}}>
                    <Prism w={110} h={h} d={40} color={i < 3 ? C.red : i < 5 ? '#F08A3E' : C.yellow} />
                  </div>
                ))}
                <div style={{position: 'absolute', left: pos * 120 + 12, bottom: hh + 50, transform: `rotate(${-8 + Math.sin(T * 6) * 3}deg)`}}>
                  <Pill bg={C.white} fg={C.ink} size={38} style={{border: `5px solid ${C.ink}`, boxShadow: `5px 5px 0 ${C.ink}`}}>$</Pill>
                </div>
                <div style={{position: 'absolute', left: 0, bottom: -60, fontFamily: F.body, fontWeight: 900, fontSize: 30, letterSpacing: 3}}>MES A MES →</div>
              </div>
            );
          })()}
        </B>

        {/* velocímetro */}
        <B t={T} t0={Q.dic - 0.1} t1={Q.auto - 0.1} kind="zoom">
          <At x={540} y={330}><Kicker t={T} t0={Q.dic} color={C.white}>INFLACIÓN EN UN SOLO MES</Kicker></At>
          <At x={540} y={660}>
            <Gauge v={T < Q.ahora ? 25.5 * easeOut(clamp((T - Q.dic) / 1.2)) + Math.sin(T * 30) * 0.3 : 25.5 + (1.7 - 25.5) * easeInOut(clamp((T - Q.ahora) / 1.1))} size={860} />
          </At>
          <At x={540} y={1020}>
            <div style={{display: 'flex', gap: 30}}>
              <div style={{opacity: prog(T, Q.veinti - 0.2, 0.3), transform: `scale(${pop(T, Q.veinti - 0.2)})`}}>
                <Card3D t={T} bg={C.red} border={C.ink} pad="14px 26px" seed={1}>
                  <div style={{fontFamily: F.body, fontWeight: 900, fontSize: 28, color: C.white}}>DIC 2023</div>
                  <div style={{fontFamily: F.head, fontSize: 96, color: C.white, lineHeight: 1}}>25,5%</div>
                </Card3D>
              </div>
              <div style={{opacity: prog(T, Q.ahora, 0.3), transform: `scale(${pop(T, Q.ahora)})`}}>
                <Card3D t={T} bg={C.green} border={C.ink} pad="14px 26px" seed={2}>
                  <div style={{fontFamily: F.body, fontWeight: 900, fontSize: 28, color: C.white}}>AGO 2026</div>
                  <div style={{fontFamily: F.head, fontSize: 96, color: C.white, lineHeight: 1}}>1,7%</div>
                </Card3D>
              </div>
            </div>
          </At>
          <Src t={T} t0={Q.dic} text="INDEC · IPC mensual" y={1200} color="rgba(255,255,255,0.55)" />
        </B>

        {/* el auto frenó pero sigue */}
        <B t={T} t0={Q.auto - 0.1} t1={Q.s3 - 0.1} kind="fade">
          {(() => {
            const d = T - Q.auto;
            const x = 60 + 560 * (1 - Math.exp(-d * 1.6)) + d * 55;
            const road = (xx: number) => 1060 - xx * 0.42;
            const speed = Math.exp(-d * 1.6) * 1.6 + 0.12;
            return (
              <>
                <At x={540} y={380}>
                  <Ext size={120} t={T} style={{whiteSpace: 'nowrap'}}>EL AUTO FRENÓ…</Ext>
                </At>
                <At x={540} y={530}><div style={{opacity: prog(T, Q.pero2, 0.3), transform: `scale(${pop(T, Q.pero2)})`}}><Ext size={84} color={C.red} side="#5a0f0a" t={T} style={{whiteSpace: 'nowrap'}}>…PERO SIGUE SUBIENDO</Ext></div></At>
                <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
                  <polygon points={`0,${road(0) + 70} 1080,${road(1080) + 70} 1080,${road(1080) + 190} 0,${road(0) + 190}`} fill="#3A3733" stroke={C.ink} strokeWidth={6} />
                  <polygon points={`0,${road(0) + 190} 1080,${road(1080) + 190} 1080,1920 0,1920`} fill="rgba(22,21,19,0.12)" />
                  {Array.from({length: 12}).map((_, i) => {
                    const xx = i * 110 - ((d * 30) % 110);
                    return <line key={i} x1={xx} y1={road(xx) + 130} x2={xx + 55} y2={road(xx + 55) + 130} stroke={C.yellow} strokeWidth={8} />;
                  })}
                </svg>
                <div style={{position: 'absolute', left: x, top: road(x + 150) - 90, transform: `rotate(-22.8deg)`, transformOrigin: '150px 120px'}}>
                  {Array.from({length: 4}).map((_, i) => (
                    <div key={i} style={{position: 'absolute', left: -40 - i * 50 * speed, top: 40 + i * 22, width: 60 * speed + 10, height: 8, background: C.ink, opacity: clamp(speed - 0.2) * 0.8, borderRadius: 4}} />
                  ))}
                  <Car t={T * speed} size={300} />
                </div>
              </>
            );
          })()}
        </B>

        {/* ===================== S03 ===================== */}
        <B t={T} t0={Q.s3 - 0.1} t1={Q.indec} kind="flip">
          <At x={540} y={380}><div style={{transform: `scale(${pop(T, Q.s3)}) rotate(3deg)`}}><Pill size={56} bg={C.ink} fg={C.yellow}>TRAMPA #2</Pill></div></At>
          <At x={540} y={760} w={1000}><Ext size={150} t={T}>¿CÓMO SE MIDE LA <span style={{color: C.red}}>POBREZA</span>?</Ext></At>
        </B>

        {/* la canasta */}
        <B t={T} t0={Q.indec - 0.05} t1={Q.sefija} kind="rise">
          <At x={540} y={320}><Kicker t={T} t0={Q.canasta}>LA CANASTA BÁSICA TOTAL</Kicker></At>
          <At x={540} y={440}><div style={{fontFamily: F.hand, fontSize: 58, color: C.red, whiteSpace: 'nowrap', opacity: prog(T, Q.canasta + 0.4, 0.3), transform: 'rotate(-3deg)'}}>lo mínimo para vivir</div></At>
          <At x={540} y={1010}><div style={{transform: `scale(${pop(T, Q.canasta)})`}}><Basket size={620} /></div></At>
          {[
            {t0: Q.comida, el: <Ico.bread size={150} />, l: 'COMIDA', x: 220},
            {t0: Q.ropa, el: <Ico.shirt size={150} />, l: 'ROPA', x: 420},
            {t0: Q.transp, el: <Ico.bus size={150} />, l: 'TRANSPORTE', x: 640},
            {t0: Q.salud, el: <Ico.health size={150} />, l: 'SALUD', x: 860},
          ].map((it, i) => {
            const p = pop(T, it.t0 - 0.1, 0.9);
            if (T < it.t0 - 0.15) return null;
            return (
              <At key={i} x={it.x} y={740}>
                <div style={{transform: `translateY(${(1 - Math.min(p, 1)) * -500}px) rotate(${Math.sin(T * 2 + i) * 6}deg)`, textAlign: 'center'}}>
                  {it.el}
                  <div style={{fontFamily: F.head, fontSize: 36, marginTop: -6}}>{it.l}</div>
                </div>
              </At>
            );
          })}
        </B>

        {/* línea de pobreza */}
        <B t={T} t0={Q.sefija - 0.05} t1={Q.importa - 0.1} kind="rise">
          <At x={540} y={400} w={1000}><Ext size={100} t={T}>¿TU INGRESO ALCANZA?</Ext></At>
          {(() => {
            const lineY = 700;
            const bars = [
              {x: 300, h: 560, col: C.green, t0: Q.sefija + 0.3, lbl: 'HOGAR A'},
              {x: 700, h: 330, col: T > Q.sino ? C.red : '#9AA0A6', t0: Q.alcanza, lbl: 'HOGAR B'},
            ];
            return (
              <>
                {bars.map((b, i) => {
                  const hh = b.h * easeOut(clamp((T - b.t0) / 0.9));
                  return (
                    <div key={i} style={{position: 'absolute', left: b.x - 110, top: 1180 - hh - 30}}>
                      <Prism w={200} h={Math.max(hh, 4)} d={44} color={b.col} />
                      <div style={{position: 'absolute', left: 30, top: hh + 46, width: 180, textAlign: 'center'}}><Ico.house size={110} /></div>
                    </div>
                  );
                })}
                <div style={{position: 'absolute', left: 60, right: 60, top: lineY, height: 0, borderTop: `9px dashed ${C.red}`, transformOrigin: 'left', transform: `scaleX(${prog(T, Q.sefija, 0.8)})`}} />
                <div style={{position: 'absolute', left: 60, top: lineY + 16, fontFamily: F.head, fontSize: 44, color: C.red, opacity: prog(T, Q.sefija + 0.3, 0.3)}}>LÍNEA DE POBREZA = LA CANASTA</div>
                <At x={300} y={500}><div style={{transform: `scale(${pop(T, Q.alcanza + 0.3)})`}}><Ico.check size={90} /></div></At>
                <At x={700} y={760}><div style={{transform: `scale(${pop(T, Q.sino)})`}}><Ico.cross size={90} /></div></At>
                <At x={700} y={1260}><div style={{opacity: 0}} /></At>
                <At x={760} y={540}><Slam t={T} t0={Q.pobre} size={74} rot={-6}>DEBAJO = POBRE</Slam></At>
              </>
            );
          })()}
        </B>

        {/* la carrera (pista en perspectiva) */}
        <B t={T} t0={Q.importa - 0.1} t1={Q.segun - 0.1} kind="fade">
          <At x={540} y={440} w={1000}>
            <div style={{fontFamily: F.head, fontSize: 90, color: C.white, textAlign: 'center', lineHeight: 1.05}}>
              NO ES LA <Strike t={T} t0={Q.importa + 1.0}>INFLACIÓN</Strike>
              <div style={{opacity: prog(T, Q.carrera, 0.3), transform: `scale(${pop(T, Q.carrera)})`, color: C.yellow}}>ES LA CARRERA</div>
            </div>
          </At>
          {(() => {
            const d = T - Q.ingreso;
            const win = Q.gano;
            const xa = 0.1 + clamp(d / 12) * 0.55 + (T > win ? 0 : 0);
            const xb = 0.1 + clamp(d / 12) * 0.55 + clamp((T - Q.s4) / 2.5) * 0.3;
            return (
              <div style={{position: 'absolute', left: 0, right: 0, top: 560, height: 700, perspective: 900, opacity: prog(T, Q.ingreso - 0.2, 0.4)}}>
                <div style={{position: 'absolute', left: -60, right: -60, top: 60, height: 600, transform: 'rotateX(52deg)', transformOrigin: '50% 100%', background: '#B5452E', border: `8px solid ${C.ink}`, borderRadius: 30}}>
                  {[1, 2].map((k) => <div key={k} style={{position: 'absolute', left: 0, right: 0, top: k * 200 - 4, height: 8, background: 'rgba(255,255,255,0.8)'}} />)}
                  <div style={{position: 'absolute', right: 120, top: 0, bottom: 0, width: 40, backgroundImage: 'repeating-linear-gradient(0deg, #fff 0 40px, #111 40px 80px)', backgroundSize: '40px 80px'}} />
                </div>
                <div style={{position: 'absolute', left: `${xa * 100}%`, top: 150}}><Runner label="TU INGRESO" col={C.celeste} t={T} /></div>
                <div style={{position: 'absolute', left: `${xb * 100}%`, top: 380, opacity: prog(T, Q.esa - 0.3, 0.3)}}><Runner label="LA CANASTA" col={C.yellow} t={T + 0.2} /></div>
              </div>
            );
          })()}
          <At x={540} y={1150}><Slam t={T} t0={Q.gano} size={90} rot={-4} color={C.yellow}>GANÓ LA CANASTA</Slam></At>
          <Burst t={T} t0={Q.gano + 0.1} x={760} y={900} />
        </B>

        {/* ===================== S04 ===================== */}
        {/* prismas 3D: ingresos vs canasta vs comida */}
        <B t={T} t0={Q.segun - 0.1} t1={Q.hogar - 0.1} kind="rise">
          <At x={540} y={320}><Kicker t={T} t0={Q.segun}>CUÁNTO SUBIÓ EN EL SEMESTRE</Kicker></At>
          <div style={{position: 'absolute', left: 90, top: 400, width: 900, height: 800, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between'}}>
            {[
              {l: 'INGRESOS', v: 11.5, col: C.celeste, t0: Q.ingr},
              {l: 'CANASTA', v: 19.6, col: C.yellow, t0: Q.canas},
              {l: 'COMIDA', v: 21.4, col: C.red, t0: Q.comi},
            ].map((b) => {
              const hh = (b.v / 21.4) * 560 * easeOut(clamp((T - b.t0) / 0.9));
              return (
                <div key={b.l} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: 280}}>
                  <div style={{fontFamily: F.head, fontSize: 96, opacity: prog(T, b.t0 + 0.2, 0.3), transform: `scale(${pop(T, b.t0 + 0.2)})`}}>
                    +<Num t={T} t0={b.t0} to={b.v} dec={1} suf="%" />
                  </div>
                  <div style={{opacity: prog(T, b.t0 - 0.1, 0.15)}}><Prism w={200} h={Math.max(hh, 4)} d={50} color={b.col} /></div>
                  <div style={{fontFamily: F.head, fontSize: 52, marginTop: 12, opacity: prog(T, b.t0, 0.3)}}>{b.l}</div>
                </div>
              );
            })}
          </div>
          <Src t={T} t0={Q.segun} text="INDEC · 1.er semestre 2026 · ingreso per cápita familiar y canastas CBT y CBA" y={1235} />
        </B>

        {/* hogar pobre promedio: lo que falta */}
        <B t={T} t0={Q.hogar - 0.1} t1={Q.s5 - 0.1} kind="flip">
          <div style={{position: 'absolute', inset: 0, transform: `translate(${sk2.x}px, ${sk2.y}px)`}}>
            <At x={540} y={320}><Kicker t={T} t0={Q.hogar}>UN HOGAR POBRE PROMEDIO · POR MES</Kicker></At>
            <At x={540} y={560}>
              <Card3D t={T} w={900} pad="24px 40px" seed={2}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', opacity: prog(T, Q.necesita, 0.3)}}>
                  <span style={{fontFamily: F.body, fontWeight: 900, fontSize: 40}}>NECESITA</span>
                  <span style={{fontFamily: F.head, fontSize: 96}}><Num t={T} t0={Q.necesita} to={1440395} pre="$" /></span>
                </div>
                <div style={{height: 4, background: C.ink, opacity: 0.2, margin: '6px 0'}} />
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', opacity: prog(T, Q.entran, 0.3)}}>
                  <span style={{fontFamily: F.body, fontWeight: 900, fontSize: 40}}>LE ENTRAN</span>
                  <span style={{fontFamily: F.head, fontSize: 96, color: C.green}}><Num t={T} t0={Q.entran} to={922755} pre="$" /></span>
                </div>
              </Card3D>
            </At>
            <div style={{position: 'absolute', left: 90, top: 860, width: 900, height: 150, border: `7px solid ${C.ink}`, borderRadius: 18, background: '#fff', overflow: 'hidden', boxShadow: `10px 12px 0 ${C.ink}`, opacity: prog(T, Q.necesita, 0.3)}}>
              <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${64.06 * easeOut(clamp((T - Q.entran) / 1))}%`, background: C.green}} />
              <div style={{position: 'absolute', right: 0, top: 0, bottom: 0, width: '35.94%', backgroundImage: `repeating-linear-gradient(45deg, ${C.red} 0 18px, #fff 18px 36px)`, opacity: prog(T, Q.falta - 0.1, 0.3)}} />
            </div>
            <At x={860} y={1100}><div style={{transform: `scale(${pop(T, Q.falta)})`}}><Pill bg={C.red} size={60} style={{border: `5px solid ${C.ink}`}}>FALTA 36%</Pill></div></At>
            <At x={330} y={1100}><div style={{opacity: prog(T, Q.entran + 0.6, 0.3)}}><Pill bg={C.ink} fg={C.white} size={44}>TIENE 64%</Pill></div></At>
            <Src t={T} t0={Q.hogar} text="INDEC · ingreso total familiar y CBT promedio de los hogares pobres" y={1215} />
          </div>
        </B>

        {/* ===================== S05 ===================== */}
        <B t={T} t0={Q.s5 - 0.1} t1={Q.anterior - 0.05} kind="zoom">
          <At x={540} y={560}><div style={{transform: `scale(${pop(T, Q.s5)})`}}><Ico.eye size={420} t={T} /></div></At>
          <At x={540} y={900} w={1000}><Ext size={120} t={T}>OJO CON LA COMPARACIÓN</Ext></At>
        </B>

        {/* gráfico de semestres */}
        <B t={T} t0={Q.anterior - 0.05} t1={Q.criticos - 0.1} kind="rise">
          {(() => {
            const pts = [
              {l: '2.º S 23', v: 41.7}, {l: '1.º S 24', v: 52.9}, {l: '2.º S 24', v: 38.1}, {l: '1.º S 25', v: 31.6}, {l: '2.º S 25', v: 28.2}, {l: '1.º S 26', v: 32.3},
            ];
            const X = (i: number) => 90 + i * 150, Y = (v: number) => 690 - (v - 20) * 14;
            const draw = clamp((T - Q.anterior + 0.2) / 1.4);
            const hlPrev = T > Q.anterior + 0.4 && T < Q.mismo;
            const hlSame = T > Q.mismo && T < Q.gob;
            const hlGob = T > Q.gob;
            const pathD = pts.map((p, i) => `${i ? 'L' : 'M'}${X(i)} ${Y(p.v)}`).join(' ');
            return (
              <>
                <At x={540} y={310}><Kicker t={T} t0={Q.anterior}>POBREZA POR SEMESTRE · %</Kicker></At>
                <div style={{position: 'absolute', left: 40, top: 380}}>
                  <Card3D t={T} w={1000} h={820} pad={0} seed={3} sway={0.5}>
                    <svg width={988} height={808} style={{position: 'absolute', left: 0, top: 0}}>
                      <path d={pathD} fill="none" stroke={C.ink} strokeWidth={10} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
                      {pts.map((p, i) => {
                        const on = draw > i / (pts.length - 1) - 0.02;
                        const hot = (hlPrev && i >= 4) || (hlSame && (i === 3 || i === 5)) || (hlGob && i === 0);
                        return (
                          <g key={i} opacity={on ? 1 : 0}>
                            <circle cx={X(i)} cy={Y(p.v)} r={hot ? 26 : 18} fill={hot ? C.red : C.yellow} stroke={C.ink} strokeWidth={6} />
                            <text x={X(i)} y={Y(p.v) - 40} fontFamily="Anton" fontSize={52} textAnchor="middle" fill={C.ink}>{fmt(p.v, 1)}</text>
                            <text x={X(i)} y={770} fontFamily="Inter" fontWeight={800} fontSize={26} textAnchor="middle" fill="rgba(22,21,19,0.6)">{p.l}</text>
                          </g>
                        );
                      })}
                    </svg>
                    {hlPrev ? (
                      <div style={{position: 'absolute', left: 560, top: 640, transform: `scale(${pop(T, Q.anterior + 0.4)})`}}><Pill bg={C.red} size={52} style={{border: `4px solid ${C.ink}`}}>+4,1 PUNTOS</Pill></div>
                    ) : null}
                    {hlSame ? (
                      <div style={{position: 'absolute', left: 500, top: 640, transform: `scale(${pop(T, Q.mismo + 0.2)})`}}><Pill bg={C.ink} size={52}>+0,7 PUNTOS</Pill></div>
                    ) : null}
                    {hlGob ? (
                      <div style={{position: 'absolute', left: 40, top: 640, transform: `scale(${pop(T, Q.gob + 0.1)})`}}>
                        <Pill bg={C.celesteDark} size={40}>GOBIERNO: ERA 41,7% A FINES DE 2023</Pill>
                      </div>
                    ) : null}
                  </Card3D>
                </div>
                <Src t={T} t0={Q.anterior} text="INDEC · EPH, 31 aglomerados urbanos" y={1235} />
              </>
            );
          })()}
        </B>

        {/* los críticos */}
        <B t={T} t0={Q.criticos - 0.1} t1={Q.s6 - 0.1} kind="rise">
          <At x={540} y={320}><Kicker t={T} t0={Q.criticos} color={C.white}>LOS CRÍTICOS</Kicker></At>
          <At x={540} y={560}>
            <div style={{transform: `scale(${pop(T, Q.criticos + 0.4)})`}}>
              <Card3D t={T} pad="22px 40px" seed={1}>
                <div style={{fontFamily: F.head, fontSize: 96, textAlign: 'center', whiteSpace: 'nowrap'}}>INGRESOS <span style={{color: C.red}}>&lt;</span> PRECIOS</div>
              </Card3D>
            </div>
          </At>
          <At x={540} y={940}>
            <div style={{opacity: prog(T, Q.chicos, 0.3), transform: `scale(${pop(T, Q.chicos)})`}}>
              <Card3D t={T} pad="22px 40px" bg={C.red} seed={2}>
                <div style={{fontFamily: F.body, fontWeight: 900, fontSize: 38, color: C.white, textAlign: 'center', letterSpacing: 3}}>POBREZA EN CHICOS DE 0 A 14</div>
                <div style={{fontFamily: F.head, fontSize: 190, color: C.white, textAlign: 'center', lineHeight: 1}}><Num t={T} t0={Q.chicos} dur={1.6} to={44.5} dec={1} suf="%" /></div>
              </Card3D>
            </div>
          </At>
          <Src t={T} t0={Q.chicos} text="INDEC · 1.er semestre 2026" y={1215} color="rgba(255,255,255,0.55)" />
        </B>

        {/* ===================== S06 ===================== */}
        <B t={T} t0={Q.s6 - 0.1} t1={Q.vos - 0.1} kind="rise">
          <At x={540} y={320}><Kicker t={T} t0={Q.s6}>EN RESUMEN</Kicker></At>
          {[
            {t0: Q.infTe, a: 'INFLACIÓN', b: 'qué tan rápido suben los precios', col: C.celeste, y: 520},
            {t0: Q.pobTe, a: 'POBREZA', b: 'si tu plata llega a fin de mes', col: C.red, y: 800},
          ].map((r, i) => (
            <At key={i} x={540} y={r.y}>
              <div style={{opacity: prog(T, r.t0, 0.3), transform: `translateX(${(1 - prog(T, r.t0, 0.5)) * (i ? 300 : -300)}px)`}}>
                <Card3D t={T} w={920} pad="18px 32px" seed={i + 1}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
                    <Pill bg={r.col} fg={i ? C.white : C.ink} size={56} style={{border: `4px solid ${C.ink}`}}>{r.a}</Pill>
                    <span style={{fontFamily: F.hand, fontSize: 46, lineHeight: 1.05}}>{r.b}</span>
                  </div>
                </Card3D>
              </div>
            </At>
          ))}
          <At x={540} y={1070}>
            <div style={{display: 'flex', gap: 26, alignItems: 'center'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 12, opacity: prog(T, Q.ayuda - 0.2, 0.3), transform: `scale(${pop(T, Q.ayuda - 0.2)})`}}>
                <Ico.check size={80} /><span style={{fontFamily: F.head, fontSize: 64}}>AYUDA</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 12, opacity: prog(T, Q.noAlc, 0.3), transform: `scale(${pop(T, Q.noAlc)})`}}>
                <Ico.cross size={80} /><span style={{fontFamily: F.head, fontSize: 64, whiteSpace: 'nowrap'}}>NO ALCANZA</span>
              </div>
            </div>
          </At>
        </B>

        <B t={T} t0={Q.vos - 0.1} t1={E} kind="swing">
          <At x={540} y={520} w={980}><Ext size={130} t={T}>¿TU SUELDO LE GANA A LOS PRECIOS?</Ext></At>
          {[
            {txt: 'Sí, por poco', x: 280, y: 880, t0: Q.contame, r: -5},
            {txt: 'Ni cerca', x: 780, y: 950, t0: Q.contame + 0.35, r: 4},
            {txt: 'Empatamos', x: 470, y: 1080, t0: Q.contame + 0.7, r: -2},
          ].map((b, i) => (
            <At key={i} x={b.x} y={b.y + Math.sin(T * 2 + i) * 10}>
              <div style={{transform: `scale(${pop(T, b.t0)}) rotate(${b.r}deg)`}}>
                <div style={{background: C.white, border: `5px solid ${C.ink}`, borderRadius: 30, padding: '14px 30px', fontFamily: F.body, fontWeight: 800, fontSize: 44, boxShadow: `6px 6px 0 ${C.ink}`, whiteSpace: 'nowrap'}}>💬 {b.txt}</div>
              </div>
            </At>
          ))}
          <At x={540} y={1210}><div style={{opacity: prog(T, Q.segui, 0.3), transform: `scale(${pop(T, Q.segui)})`}}><Pill size={50}>SEGUÍ A CONTEXTO</Pill></div></At>
        </B>
      </Cam>

      {/* transiciones */}
      {SCENES.slice(1).map((s, i) => (
        <Transition key={i} t={T} at={s.t} kind={s.wipe} to={s.theme} from={SCENES[i].theme} dir={i % 2 ? -1 : 1} />
      ))}

      <TopBar t={T} total={E} label="CONTEXTO · INFLACIÓN Y POBREZA" theme={th} marks={[at('s02'), at('s03'), at('s04'), at('s05'), at('s06')]} />
      <Captions t={T} chunks={CHUNKS} />
      <EndCard t={T} E={E} title="¿la inflación baja y la pobreza sube?" sub="Temas complejos, explicados simple" />
      <Grain opacity={0.07} />
    </AbsoluteFill>
  );
};
