/* Escenas 1–5 del episodio 6 (La paradoja de la carne). t = segundos desde el inicio del segmento. */
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {F} from '../theme';
import {cue} from './lib';
import {
  Big, Chip, ChickenIcon, Count, CowIcon, Credit, Dial, Ember, FullPhoto, FullVideo, K, LinkTag, PersonIcon, PriceLabel, Sparks, SrcLine, Vig,
  clamp, easeIn, easeInOut, easeOut, fmt, pop, prog,
} from './kit6';
import {Balance, Cam, CUM, Diorama, Grid100, Group, STATION_NAMES, STX, ShadowFloor, Stage, Tray, TrayTower, camPath, colTop, lerpCam, project} from './three6';

type P = {t: number};
const between = (t: number, a: number, b: number) => t >= a && t < b;
const fadeIO = (t: number, a: number, b: number, d = 0.35) => Math.min(prog(t, a, d), 1 - prog(t, b - d, d, easeIn));

/** ángulo de la balanza: el asado la inclina, 3,5 bandejas de pollo la emparejan */
export const balAngle = (t: number, tA: number, tP: number[]) => {
  let a = 0.2 * easeOut(clamp((t - tA - 0.25) / 0.6));
  tP.forEach((x, i) => (a -= (i < 3 ? 0.2 / 3.5 : 0.1 / 3.5) * easeOut(clamp((t - x - 0.25) / 0.5))));
  return a + Math.sin(t * 2.2) * 0.004;
};

/* ---------- cámaras del diorama ---------- */
export const WIDE: Cam = {pos: [0, 14, 30.5], look: [0, 0.2, -1.4], fov: 40};
export const stCam = (i: number): Cam => ({pos: [STX[i] + 3.4, 4.8, 8.6], look: [STX[i] + 0.4, 1.2, -1.6], fov: 34});
export const DioStage: React.FC<{cam: Cam; children: React.ReactNode}> = ({cam, children}) => (
  <Stage cam={cam} shadow={30} key0={[10, 22, 14]} keyI={2.2}>
    {children}
    <ShadowFloor o={0.5} />
  </Stage>
);
/** rótulos de las estaciones proyectados desde el 3D */
export const StationLabels: React.FC<{cam: Cam; show: number[]; t: number; dim?: number[]; strike?: number[]}> = ({cam, show, dim = [], strike = []}) => (
  <>
    {STX.map((x, i) => {
      const o = clamp(show[i] ?? 0);
      if (o <= 0.01) return null;
      const [px, py] = project(cam, [x, -0.3, 2.0]);
      const st = clamp(strike[i] ?? 0);
      return (
        <div key={i} style={{position: 'absolute', left: px, top: py, transform: `translate(-50%,0) scale(${0.9 + 0.1 * o})`, opacity: o * (1 - (dim[i] ?? 0) * 0.6)}}>
          <div style={{position: 'relative', fontFamily: F.head, fontSize: 30, color: K.cream, background: 'rgba(11,8,6,0.8)', padding: '6px 14px 2px', borderRadius: 6, whiteSpace: 'nowrap', letterSpacing: 1, border: `1px solid ${K.line}`}}>
            {STATION_NAMES[i]}
            {st > 0 ? <div style={{position: 'absolute', left: -6, right: -6, top: '50%', height: 6, background: K.red, transformOrigin: 'left', transform: `scaleX(${easeOut(st)}) rotate(-4deg)`}} /> : null}
          </div>
        </div>
      );
    })}
  </>
);

/* ---------- grilla de $100 ---------- */
export const GRID_CAM: Cam = {pos: [6.5, 12.5, 13.5], look: [-3.2, 0.2, 0.4], fov: 34};
const gridCam = (t: number, a = 0): Cam => {
  const ang = 0.38 + a + Math.sin(t * 0.12) * 0.05;
  const R = 15.4;
  return {pos: [Math.sin(ang) * R, 12.2, Math.cos(ang) * R], look: [-3.3, 0.2, 0.3], fov: 34};
};
/** estado base de la grilla (lo que ya se repartió en escenas anteriores) */
export const G = {
  cria: (p = 1, o: Partial<Group> = {}): Group => ({n: 35, color: K.cria, p, ...o}),
  inv: (p = 1, o: Partial<Group> = {}): Group => ({n: 16, color: K.inv, p, ...o}),
  frig: (p = 1, o: Partial<Group> = {}): Group => ({n: 1, color: K.frig, p, ...o}),
  carn: (p = 1, o: Partial<Group> = {}): Group => ({n: 20, color: K.carn, p, ...o}),
  imp: (p = 1, o: Partial<Group> = {}): Group => ({n: 28, color: K.imp, p, ...o}),
};
export const GridShot: React.FC<{t: number; groups: Group[]; appear?: number; cam?: Cam; o?: number; dimRest?: number}> = ({t, groups, appear = 1, cam, o = 1, dimRest}) => (
  <AbsoluteFill style={{opacity: o}}>
    <Stage cam={cam ?? gridCam(t)} shadow={12} key0={[6, 14, 8]}>
      <Grid100 t={t} groups={groups} appear={appear} dimRest={dimRest} />
      <ShadowFloor o={0.5} />
    </Stage>
  </AbsoluteFill>
);
/** columna de texto a la izquierda: "$35 / PARA EL CRIADOR" */
export const ShareText: React.FC<{t: number; t0: number; value: number; label: string; color: string; t1?: number; sub?: string; y?: number}> = ({t, t0, value, label, color, t1 = Infinity, sub, y = 330}) => {
  if (t < t0) return null;
  const o = t1 === Infinity ? 1 : 1 - prog(t, t1 - 0.3, 0.3);
  const a = prog(t, t0, 0.5);
  return (
    <div style={{position: 'absolute', left: 110, top: y, opacity: o, transform: `translateY(${(1 - a) * 30}px)`}}>
      <div style={{fontFamily: F.head, fontSize: 250, lineHeight: 0.9, color, textShadow: '0 10px 40px rgba(0,0,0,0.6)'}}>
        $<Count t={t} t0={t0} dur={0.9} to={value} />
      </div>
      <div style={{fontFamily: F.head, fontSize: 64, color: K.cream, marginTop: 8, opacity: prog(t, t0 + 0.2, 0.4)}}>{label}</div>
      {sub ? <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 26, letterSpacing: 3, color: K.mute, marginTop: 12, opacity: prog(t, t0 + 0.35, 0.4)}}>{sub}</div> : null}
    </div>
  );
};
export const GridCaption: React.FC<{t: number; t0: number; t1?: number}> = ({t, t0, t1 = Infinity}) => (
  <div style={{position: 'absolute', left: 110, top: 185, opacity: Math.min(prog(t, t0, 0.5), t1 === Infinity ? 1 : 1 - prog(t, t1 - 0.3, 0.3))}}>
    <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 24, letterSpacing: 5, color: K.mute}}>DE CADA $100 QUE PAGÁS</div>
    <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 24, letterSpacing: 5, color: K.mute, marginTop: 6}}>POR UN KILO DE CARNE</div>
    <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, fontFamily: F.body, fontSize: 21, color: K.mute}}>
      <div style={{width: 22, height: 22, background: '#D9CCB2', borderRadius: 4}} /> = $1
    </div>
  </div>
);
export const FadaSrc: React.FC<{t: number; t0: number}> = ({t, t0}) => <SrcLine t={t} t0={t0} text="Fuente: FADA, cómo se forma el precio de los alimentos (abril 2026)" />;

/* =====================================================================================
   S01 · gancho: más vacas que personas, el asado, 1 kg de asado = 3,5 kg de pollo
   ===================================================================================== */
export const S01: React.FC<P & {dur: number}> = ({t, dur}) => {
  const c = (p: string, n = 0) => cue('s01', p, n);
  const tCows = c('Cincuenta'), tArg = c('cuarenta'), tAsado = c('Somos'), tBal = c('Y sin embargo'), tPollo = c('Y los argentinos');
  const tComo = c('¿Cómo'), tQuien = c('¿Quién'), tViaje = c('Vamos'), tGustar = c('Y lo que'), tTitle = dur + 0.1;
  // --- balanza
  const tA = c('kilo de asado'), tP = [c('tres kilos'), c('kilos y medio'), c('medio de pollo'), c('pollo.')];
  const angle = balAngle(t, tA, tP);
  const drop = (t0: number) => {
    const k = clamp((t - t0) / 0.4);
    return (1 - easeIn(k)) * 3.2;
  };
  // --- diorama
  const dCam = camPath(t, [
    [tViaje - 0.4, {pos: [-6, 24, 40], look: [0, 0, -1], fov: 38}],
    [tViaje - 0.3, WIDE],
    [tGustar - 0.2, {pos: [STX[0] - 2, 6.5, 12.5], look: [STX[0] + 1, 1, -1], fov: 36}],
  ], 2.6);
  const show = STX.map((_, i) => clamp((t - tViaje - 0.2 - i * 0.28) / 0.6));
  const labels = STX.map((_, i) => clamp((t - c('desde') - i * 0.3) / 0.4));
  const tokenX = t > c('kilo de carne') ? -21 + 5 * easeOut(clamp((t - c('kilo de carne')) / 2.2)) : null;
  const red = prog(t, tGustar + 0.9, 1.4);
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {/* A · feedlot al atardecer */}
      {t < tCows + 0.6 ? <FullVideo src="ep06/vid/feedlot_b.mp4" t={t} t0={-0.3} t1={tCows + 0.6} zoom={[1.08, 1.02]} dim={0.3} credit="Feedlot · SAFE, CC BY-SA 3.0" /> : null}
      {t < tCows + 0.3 ? <Big t={t} t0={0.05} t1={tCows + 0.3} text="HAY MÁS VACAS | QUE PERSONAS" size={128} y={780} hl={{VACAS: K.yellow}} /> : null}
      {/* B · pictogramas */}
      {between(t, tCows, tAsado + 0.2) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tCows, tAsado + 0.2, 0.3)}}>
          <FullVideo src="ep06/vid/feedlot_c.mp4" t={t} t0={tCows} t1={tAsado + 0.2} dim={1.1} fade={0.01} />
          <AbsoluteFill style={{background: 'rgba(11,8,6,0.55)'}} />
          <Pictos t={t} tCows={tCows} tArg={tArg} tExtra={c('argentinos.') + 0.2} />
          <SrcLine t={t} t0={tCows + 0.5} text="Fuentes: SENASA, stock bovino · INDEC, Censo 2022" />
        </AbsoluteFill>
      ) : null}
      {/* C · el asado */}
      {between(t, tAsado - 0.1, tBal + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tAsado - 0.1, tBal + 0.3, 0.3)}}>
          <FullPhoto src="ep06/asado3.jpg" t={t} t0={tAsado - 0.1} t1={c('parrilla,') + 0.2} zoom={[1.05, 1.16]} dim={0.3} credit="Aleposta, GFDL" />
          <FullPhoto src="ep06/asado2.jpg" t={t} t0={c('parrilla,') - 0.2} t1={c('del', 1) + 0.2} zoom={[1.12, 1.02]} focus="40% 40%" dim={0.25} credit="Maxd2, CC BY-SA 4.0" />
          <FullPhoto src="ep06/asado1.jpg" t={t} t0={c('del', 1) - 0.2} t1={tBal + 0.4} zoom={[1.03, 1.14]} dim={0.3} credit="felixion, CC BY-SA 2.0" />
          <Sparks t={t} o={0.9} />
          <Big t={t} t0={tAsado + 0.1} text="EL PAÍS DEL ASADO" size={150} y={840} hl={{ASADO: K.yellow}} />
        </AbsoluteFill>
      ) : null}
      {/* D · la balanza */}
      {between(t, tBal, tPollo + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tBal, tPollo + 0.3, 0.3)}}>
          <Ember glow="rgba(210,110,40,0.3)" y={56} />
          <Stage cam={{pos: [0, 3.4 - 0.2 * prog(t, tBal, 6), 11.5 - 0.8 * prog(t, tBal, 6)], look: [0, 2.0, 0], fov: 38}} shadow={8} key0={[4, 10, 8]}>
            <Balance
              angle={angle}
              left={t > tA - 0.4 ? <Tray kind="asado" s={1.25} pos={[0, drop(tA - 0.4), 0]} rot={[0, 0.2, 0]} /> : null}
              right={
                <group>
                  {[[-0.3, 0, -0.2], [0.32, 0.02, 0.18], [-0.05, 0.25, 0.05]].map((p, i) =>
                    t > tP[i] - 0.4 ? <Tray key={i} kind="pollo" s={0.95} pos={[p[0], p[1] + drop(tP[i] - 0.4), p[2]]} rot={[0, (i - 1) * 0.3, 0]} /> : null,
                  )}
                  {t > tP[3] - 0.4 ? <Tray kind="pollo" s={0.95} half pos={[0.28, 0.5 + drop(tP[3] - 0.4), -0.05]} rot={[0, -0.4, 0]} /> : null}
                </group>
              }
            />
            <ShadowFloor o={0.55} />
          </Stage>
          <Chip t={t} t0={tA} text="1 KG DE ASADO" x={560} y={860} color={K.red} size={42} />
          <Chip t={t} t0={c('tres kilos')} text="3,5 KG DE POLLO" x={1360} y={860} color={K.pollo} size={42} />
          <Big t={t} t0={c('medio de pollo') + 0.3} text="LA MISMA PLATA" size={84} y={150} color={K.yellow} />
        </AbsoluteFill>
      ) : null}
      {/* E · pollo > vaca */}
      {between(t, tPollo, tComo + 0.25) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tPollo, tComo + 0.25, 0.3)}}>
          <FullPhoto src="ep06/pollo.jpg" t={t} t0={tPollo} t1={tComo + 0.3} dim={1.2} zoom={[1.1, 1.18]} fade={0.01} blur={3} />
          <Consumo t={t} tP={c('pollo', 1)} tV={c('carne de vaca')} t0={tPollo} />
        </AbsoluteFill>
      ) : null}
      {/* F · ¿quién se queda con la plata? */}
      {between(t, tComo - 0.1, tViaje + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tComo - 0.1, tViaje + 0.3, 0.25)}}>
          <FullPhoto src="ep06/carniceria.jpg" t={t} t0={tComo - 0.1} t1={tViaje + 0.3} dim={1.3} zoom={[1.18, 1.05]} fade={0.01} credit="Dolapeart, CC BY-SA 4.0" />
          <Big t={t} t0={tComo} t1={tQuien - 0.05} text="¿CÓMO PUEDE SER?" size={150} y={540} />
          <Big t={t} t0={tQuien} text="¿QUIÉN SE QUEDA | CON LA PLATA?" size={150} y={540} hl={{PLATA: K.yellow}} />
        </AbsoluteFill>
      ) : null}
      {/* G · el viaje (diorama) */}
      {between(t, tViaje - 0.3, tTitle) ? (
        <AbsoluteFill style={{opacity: prog(t, tViaje - 0.3, 0.4)}}>
          <Ember glow="rgba(190,90,40,0.22)" y={58} />
          <DioStage cam={dCam}>
            <Diorama s={{t, show, tokenX}} />
          </DioStage>
          <StationLabels cam={dCam} show={labels.map((l) => l * (1 - prog(t, tGustar - 0.4, 0.5)))} t={t} />
          <Big t={t} t0={tViaje + 0.2} t1={tGustar - 0.1} text="DEL CAMPO A TU MESA" size={96} y={130} />
          <Big t={t} t0={tGustar + 0.1} text="Y NO TE VA A GUSTAR" size={110} y={150} color={K.cream} hl={{GUSTAR: K.red}} />
          <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 60%, rgba(0,0,0,0) 30%, rgba(120,10,5,${0.55 * red}) 100%)`}} />
        </AbsoluteFill>
      ) : null}
      {/* H · título */}
      {t >= tTitle - 0.05 ? (
        <AbsoluteFill>
          <FullPhoto src="ep06/niebla.jpg" t={t} t0={tTitle - 0.05} zoom={[1.02, 1.1]} dim={0.55} fade={0.01} credit="Oscar Fava, CC BY 3.0" />
          <Sparks t={t} n={30} o={0.6} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 26, letterSpacing: 10, color: K.cream, opacity: prog(t, tTitle + 0.2, 0.5)}}>
            CONTEXTO · EPISODIO 6
          </div>
          <Big t={t} t0={tTitle + 0.1} text="LA PARADOJA | DE LA CARNE" size={200} y={560} stagger={0.12} hl={{PARADOJA: K.red}} lh={0.95} />
        </AbsoluteFill>
      ) : null}
      <Vig k={0.5} />
    </AbsoluteFill>
  );
};

/** 51 vacas contra 46 personas (1 ícono = 1 millón) */
const Pictos: React.FC<{t: number; tCows: number; tArg: number; tExtra: number}> = ({t, tCows, tArg, tExtra}) => {
  const cowRow = (i: number) => {
    const r = Math.floor(i / 17), c = i % 17;
    return [560 + c * 77, 165 + r * 64];
  };
  const perRow = (i: number) => {
    const r = Math.floor(i / 16), c = i % 16;
    return [560 + c * 80, 590 + r * 88];
  };
  return (
    <>
      <div style={{position: 'absolute', left: 110, top: 170, opacity: prog(t, tCows, 0.4)}}>
        <div style={{fontFamily: F.head, fontSize: 96, color: K.cream, lineHeight: 1}}>
          <Count t={t} t0={tCows} dur={1.4} to={51} /> MILLONES
        </div>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 28, letterSpacing: 6, color: K.yellow, marginTop: 6}}>DE VACAS</div>
      </div>
      {Array.from({length: 51}, (_, i) => {
        const [x, y] = cowRow(i);
        const a = pop(t, tCows + i * 0.028, 1.2);
        const extra = i >= 46 ? prog(t, tExtra, 0.4) : 0;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, transform: `scale(${Math.max(0, a)})`, filter: extra ? `drop-shadow(0 0 12px ${K.yellow})` : undefined}}>
            <CowIcon size={70} color={extra ? K.yellow : K.cream} />
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 110, top: 610, opacity: prog(t, tArg, 0.4)}}>
        <div style={{fontFamily: F.head, fontSize: 96, color: K.cream, lineHeight: 1}}>
          <Count t={t} t0={tArg} dur={1.4} to={46} /> MILLONES
        </div>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 28, letterSpacing: 6, color: K.celeste, marginTop: 6}}>DE ARGENTINOS</div>
      </div>
      {Array.from({length: 46}, (_, i) => {
        const [x, y] = perRow(i);
        const a = pop(t, tArg + i * 0.03, 1.2);
        return (
          <div key={i} style={{position: 'absolute', left: x + 16, top: y, transform: `scale(${Math.max(0, a)})`}}>
            <PersonIcon size={70} />
          </div>
        );
      })}
      <Chip t={t} t0={tExtra} text="+5 MILLONES DE VACAS" x={1560} y={500} color={K.yellow} size={34} />
      <div style={{position: 'absolute', left: 110, top: 900, fontFamily: F.body, fontSize: 22, color: K.mute, opacity: prog(t, tCows + 1, 0.5)}}>Cada ícono = 1 millón</div>
    </>
  );
};

/** consumo por habitante: pollo ≈49 kg contra vaca 46 kg */
export const Consumo: React.FC<{t: number; t0: number; tP: number; tV: number}> = ({t, t0, tP, tV}) => {
  const row = (y: number, t1: number, kg: number, color: string, label: string, icon: React.ReactNode, lead: boolean) => {
    const k = easeOut(clamp((t - t1) / 0.9));
    const w = 1050 * (kg / 50) * k;
    return (
      <div style={{position: 'absolute', left: 170, top: y, opacity: prog(t, t1 - 0.2, 0.3)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
          <div style={{width: 150, display: 'flex', justifyContent: 'center'}}>{icon}</div>
          <div style={{width: w, height: 110, background: color, borderRadius: 8, boxShadow: lead ? `0 0 40px ${color}88` : undefined}} />
          <div style={{fontFamily: F.head, fontSize: 96, color: K.cream, whiteSpace: 'nowrap'}}>
            {lead ? '≈' : ''}
            <Count t={t} t0={t1} dur={0.9} to={kg} /> KG
          </div>
        </div>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 24, letterSpacing: 5, color, marginLeft: 172, marginTop: 10}}>{label}</div>
      </div>
    );
  };
  return (
    <>
      <div style={{position: 'absolute', left: 170, top: 150, fontFamily: F.body, fontWeight: 800, fontSize: 28, letterSpacing: 6, color: K.mute, opacity: prog(t, t0, 0.4)}}>
        KILOS POR HABITANTE, POR AÑO
      </div>
      {row(290, tP, 49, K.pollo, 'POLLO', <ChickenIcon size={130} />, true)}
      {row(590, tV, 46, K.red, 'CARNE VACUNA', <CowIcon size={140} color={K.red} />, false)}
      <SrcLine t={t} t0={t0 + 0.5} text="Fuentes: CEPA (pollo, 2025) · CICCRA (vaca, 12 meses a agosto de 2026)" />
    </>
  );
};

/* =====================================================================================
   S02 · de dónde venimos: 1956 contra hoy, y la suba de precios
   ===================================================================================== */
export const S02: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s02', p, n);
  const t56 = c('En mil'), tHoy = c('Hoy'), tMitad = c('Menos'), tBajo = c('Es el'), tSuba = c('En el');
  const cam: Cam = camPath(t, [
    [t56 - 0.5, {pos: [-1.5, 4.2, 13.5], look: [-0.8, 2.6, 0], fov: 38}],
    [t56 + 1.0, {pos: [1.8, 4.8, 15.5], look: [0.6, 2.9, 0], fov: 38}],
    [tMitad, {pos: [3.5, 4.2, 14.5], look: [0.4, 2.5, 0], fov: 38}],
  ], 4);
  const p56 = easeInOut(clamp((t - t56 - 0.3) / 3.2));
  const pHoy = easeInOut(clamp((t - tHoy - 0.1) / 1.6));
  const top56 = project(cam, [-2.2, 6.4, 0]);
  const topHoy = project(cam, [2.2, 11.5 * 0.245 + 0.4 + 0.2, 0]);
  const half = project(cam, [-3.4, 12.5 * 0.245, 0.4]);
  const half2 = project(cam, [3.4, 12.5 * 0.245, 0.4]);
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {/* A · archivo */}
      {t < t56 + 0.4 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, t56, 0.4)}}>
          <FullPhoto src="ep06/carniceria1915.jpg" t={t} t0={-0.3} t1={1.9} bw zoom={[1.02, 1.12]} dim={0.35} credit="Carnicería del frigorífico The River Plate Fresh Meat, 1915 · dominio público" />
          <FullPhoto src="ep06/marcando1910.jpg" t={t} t0={1.6} t1={t56 + 0.4} bw zoom={[1.12, 1.02]} dim={0.35} credit="Marcando ganado, Argentina, 1910 · dominio público" />
          <Big t={t} t0={c('hay')} text="DE DÓNDE VENIMOS" size={140} y={860} />
        </AbsoluteFill>
      ) : null}
      {/* B · torres de bandejas */}
      {between(t, t56 - 0.2, tSuba + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, t56 - 0.2, tSuba + 0.3, 0.35)}}>
          <Ember glow="rgba(200,90,40,0.24)" y={62} />
          <Stage cam={cam} shadow={9} key0={[5, 12, 8]}>
            <TrayTower n={100} p={p56} pos={[-2.2, 0, 0]} />
            <TrayTower n={46} p={pHoy} pos={[2.2, 0, 0]} />
            <ShadowFloor o={0.55} />
          </Stage>
          <PriceLabel x={top56[0]} y={top56[1] - 10} value={100} prefix="+" color={K.cream} o={prog(t, t56 + 1.2, 0.5)} title="1956 · KILOS POR PERSONA" size={60} />
          <PriceLabel x={topHoy[0]} y={topHoy[1] - 10} value={46} prefix="" color={K.red} o={prog(t, tHoy + 0.6, 0.4)} title="HOY" size={60} />
          {t > tMitad ? (
            <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
              <line x1={half[0]} y1={half[1]} x2={half[0] + (half2[0] - half[0]) * prog(t, tMitad, 0.6)} y2={half[1] + (half2[1] - half[1]) * prog(t, tMitad, 0.6)} stroke={K.yellow} strokeWidth={5} strokeDasharray="18 12" />
            </svg>
          ) : null}
          <Chip t={t} t0={tMitad} text="MENOS DE LA MITAD" x={half2[0] + 230} y={half2[1]} color={K.yellow} size={40} />
          <div style={{position: 'absolute', left: 96, top: 900, opacity: prog(t, t56, 0.5)}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 24, letterSpacing: 5, color: K.mute}}>CARNE VACUNA POR PERSONA, POR AÑO</div>
            <div style={{fontFamily: F.body, fontSize: 21, color: K.mute, marginTop: 8}}>1 bandeja = 1 kilo</div>
          </div>
          {t > tBajo ? <LowStamp t={t} t0={tBajo} /> : null}
          <SrcLine t={t} t0={t56 + 1} text="Fuente: CICCRA, serie histórica de consumo por habitante" />
        </AbsoluteFill>
      ) : null}
      {/* C · la suba */}
      {t >= tSuba ? (
        <AbsoluteFill style={{opacity: prog(t, tSuba, 0.35)}}>
          <FullPhoto src="ep06/carniceria.jpg" t={t} t0={tSuba} zoom={[1.1, 1.2]} dim={1.4} fade={0.01} blur={4} />
          <Suba t={t} tC={c('un cincuenta')} tP={c('treinta.')} t0={tSuba} />
        </AbsoluteFill>
      ) : null}
      <Vig k={0.5} />
    </AbsoluteFill>
  );
};

const LowStamp: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  const k = clamp((t - t0) / 0.2);
  const s = 1.8 - 0.8 * easeIn(k);
  return (
    <div style={{position: 'absolute', right: 150, top: 200, transform: `rotate(-8deg) scale(${s})`, opacity: clamp(k * 3), border: `8px solid ${K.red}`, borderRadius: 10, padding: '10px 26px 4px', color: K.red, fontFamily: F.head, fontSize: 64, textAlign: 'center', lineHeight: 1.05, background: 'rgba(11,8,6,0.6)'}}>
      EL NIVEL MÁS BAJO
      <br />
      EN 20 AÑOS
    </div>
  );
};

const Suba: React.FC<{t: number; t0: number; tC: number; tP: number}> = ({t, t0, tC, tP}) => {
  const col = (x: number, t1: number, pct: number, color: string, label: string, text: string) => {
    const k = easeOut(clamp((t - t1) / 0.9));
    const h = 560 * (pct / 55) * k;
    return (
      <div style={{position: 'absolute', left: x, bottom: 170, width: 300, textAlign: 'center', opacity: prog(t, t1 - 0.3, 0.3)}}>
        <div style={{fontFamily: F.head, fontSize: 110, color: K.cream, lineHeight: 1, marginBottom: 14}}>{text}</div>
        <div style={{height: h, background: `linear-gradient(180deg, ${color}, ${color}AA)`, borderRadius: '10px 10px 0 0', boxShadow: `0 0 50px ${color}55`}} />
        <div style={{fontFamily: F.head, fontSize: 52, color, marginTop: 14}}>{label}</div>
      </div>
    );
  };
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 96, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: K.mute, opacity: prog(t, t0, 0.4)}}>
        CUÁNTO SUBIÓ EN EL ÚLTIMO AÑO
      </div>
      {col(560, tC - 0.2, 50, K.red, 'CARNE VACUNA', '+50%')}
      {col(1060, tP - 0.4, 26, K.pollo, 'POLLO', '< 30%')}
      <SrcLine t={t} t0={t0 + 0.6} text="Precios al consumidor, variación interanual · INDEC e IPCVA, 2026" />
    </>
  );
};

/* =====================================================================================
   S03 · eslabón 1: el criador
   ===================================================================================== */
export const S03: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s03', p, n);
  const tCampo = c('Todo'), tNace = c('Ahí'), tTarda = c('Tarda'), tCasi = c('Casi'), tEse = c('Ese'), t35 = c('treinta');
  const dCam = camPath(t, [
    [-0.4, WIDE],
    [0.0, stCam(0)],
  ], 1.6);
  const months = (x: number, y: number) => {
    const g9 = clamp((t - tTarda - 0.2) / 1.3), g7 = clamp((t - c('otros') - 0.1) / 1.4);
    return (
      <div style={{position: 'absolute', left: x, top: y}}>
        <div style={{display: 'flex', gap: 8}}>
          {Array.from({length: 16}, (_, i) => {
            const on = i < 9 ? clamp(g9 * 9 - i) : clamp(g7 * 7 - (i - 9));
            const col = i < 9 ? K.cria : K.inv;
            return <div key={i} style={{width: 62, height: 62, borderRadius: 8, background: col, opacity: 0.12 + 0.88 * on, transform: `scale(${0.8 + 0.2 * easeOut(on)})`}} />;
          })}
        </div>
        <div style={{display: 'flex', marginTop: 16, fontFamily: F.head, fontSize: 44, color: K.cream}}>
          <div style={{width: 9 * 70, opacity: g9}}>9 MESES DE GESTACIÓN</div>
          <div style={{opacity: g7}}>+6 A 7 HASTA EL DESTETE</div>
        </div>
      </div>
    );
  };
  const kg = 180 * easeInOut(clamp((t - c('ciento') + 0.2) / 1.6));
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {t < tCampo + 0.3 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tCampo, 0.3)}}>
          <Ember glow="rgba(190,90,40,0.22)" y={58} />
          <DioStage cam={dCam}>
            <Diorama s={{t: t + 30, tokenX: STX[0] - 1.4 + 0.8 * prog(t, 0, 1.5)}} />
          </DioStage>
        </AbsoluteFill>
      ) : null}
      {between(t, tCampo, tNace + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tCampo, tNace + 0.3, 0.3)}}>
          <FullVideo src="ep06/vid/pastura.mp4" t={t} t0={tCampo} t1={tNace + 0.3} dim={0.35} credit="USDA NRCS · dominio público" />
          <Chip t={t} t0={c('campo')} text="CAMPO DE CRÍA" x={960} y={760} color={K.cria} size={60} />
          <Chip t={t} t0={c('tierras') + 0.1} text="TIERRAS DONDE NO SE PUEDE SEMBRAR" x={960} y={870} color={K.cream} size={34} />
        </AbsoluteFill>
      ) : null}
      {between(t, tNace, tCasi + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tNace, tCasi + 0.3, 0.3)}}>
          <FullPhoto src="ep06/vacaternero.jpg" t={t} t0={tNace} t1={tCasi + 0.3} zoom={[1.02, 1.15]} focus="45% 60%" dim={t > tTarda ? 0.35 + 0.6 * prog(t, tTarda, 0.5) : 0.35} fade={0.01} credit="Gervacio Rosales, CC BY 3.0" />
          <Big t={t} t0={tNace + 0.1} t1={tTarda + 0.1} text="NACE UN TERNERO" size={140} y={860} />
          {t > tTarda - 0.1 ? months(260, 420) : null}
        </AbsoluteFill>
      ) : null}
      {between(t, tCasi, tEse + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tCasi, tEse + 0.3, 0.3)}}>
          <FullPhoto src="ep06/cordoba.jpg" t={t} t0={tCasi} t1={tEse + 0.3} dim={1.0} zoom={[1.05, 1.12]} focus="50% 70%" fade={0.01} credit="Kevin Degirmenci, CC BY 3.0" />
          <div style={{position: 'absolute', left: 1040, top: 190, transform: `scale(${0.9 + 0.1 * pop(t, tCasi, 0.8)})`, opacity: prog(t, tCasi, 0.3)}}>
            <Dial kg={kg} max={500} size={660} label="KG · TERNERO" />
          </div>
          <div style={{position: 'absolute', left: 130, top: 330}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 28, letterSpacing: 6, color: K.mute, opacity: prog(t, tCasi, 0.4)}}>CASI UN AÑO DE TRABAJO</div>
            <div style={{fontFamily: F.head, fontSize: 220, color: K.cream, lineHeight: 1, opacity: prog(t, c('ciento'), 0.3)}}>
              <Count t={t} t0={c('ciento') - 0.2} dur={1.6} to={180} /> KG
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
      {t >= tEse ? (
        <AbsoluteFill style={{opacity: prog(t, tEse, 0.35)}}>
          <Ember glow="rgba(125,179,86,0.16)" x={62} y={55} />
          <GridShot t={t} appear={clamp((t - tEse) / 1.1)} groups={[G.cria(clamp((t - t35 + 0.1) / 0.9), {lift: 0.35, glow: prog(t, t35 + 0.8, 0.5)})]} />
          <GridCaption t={t} t0={tEse + 0.3} t1={t35 - 0.1} />
          <Big t={t} t0={c('Y es')} t1={t35 - 0.1} text="EL QUE MÁS SE LLEVA" size={90} x={110} y={560} align="left" w={900} />
          <ShareText t={t} t0={t35} value={35} label="PARA EL CRIADOR" color={K.cria} />
          <FadaSrc t={t} t0={tEse + 0.5} />
        </AbsoluteFill>
      ) : null}
      <LinkTag t={t} t0={0.25} t1={tCampo + 0.1} n="1" name="EL CRIADOR" color={K.cria} />
      <LinkTag t={t} t0={tEse + 0.1} n="1" name="EL CRIADOR" color={K.cria} />
      <Vig k={0.45} />
    </AbsoluteFill>
  );
};

/* =====================================================================================
   S04 · eslabón 2: el invernador y la primera trampa (2 kg vivos = 1 kg de carne)
   ===================================================================================== */
export const S04: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s04', p, n);
  const tFeed = c('El ternero'), tOtro = c('Otro'), tEse = c('Ese'), tTrampa = c('Y acá'), tPara = c('para tener'), tHoy = c('Hoy,'), tAsi = c('Así');
  const dCam = camPath(t, [
    [-0.3, stCam(0)],
    [0.0, stCam(1)],
  ], 1.6);
  const kg = 180 + 240 * easeInOut(clamp((t - c('cuatrocientos') + 0.3) / 1.2));
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {t < tFeed + 0.3 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tFeed, 0.3)}}>
          <Ember glow="rgba(190,90,40,0.22)" y={58} />
          <DioStage cam={dCam}>
            <Diorama s={{t: t + 60, cols: [1, 0, 0, 0, 0], tokenX: STX[0] + 0.5 + (STX[1] - STX[0] - 1) * easeInOut(clamp(t / 1.6))}} />
          </DioStage>
        </AbsoluteFill>
      ) : null}
      {between(t, tFeed, tEse + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tFeed, tEse + 0.3, 0.3)}}>
          <FullVideo src="ep06/vid/feedlot_a.mp4" t={t} t0={tFeed} t1={tEse + 0.3} dim={0.35} credit="Feedlot · SAFE, CC BY-SA 3.0" />
          <Chip t={t} t0={c('invernada')} text="INVERNADA" x={620} y={200} color={K.inv} size={46} />
          <Chip t={t} t0={c('feedlot,')} text="FEEDLOT" x={1000} y={200} color={K.inv} size={46} />
          <Chip t={t} t0={c('pasto,')} text="PASTO" x={520} y={880} color={K.cria} size={48} />
          <Chip t={t} t0={c('maíz')} text="MAÍZ" x={800} y={880} color={K.yellow} size={48} />
          <Chip t={t} t0={c('balanceado')} text="BALANCEADO" x={1130} y={880} color={K.carn} size={48} />
          <div style={{position: 'absolute', right: 110, top: 150, opacity: prog(t, c('hasta'), 0.4), transform: `scale(${0.85 + 0.15 * pop(t, c('hasta'), 0.8)})`, transformOrigin: 'top right'}}>
            <Dial kg={kg} max={500} size={400} label="KG" />
          </div>
          <Big t={t} t0={tOtro} text="OTRO AÑO. A VECES, MÁS." size={110} y={560} />
        </AbsoluteFill>
      ) : null}
      {between(t, tEse, tTrampa + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tEse, tTrampa + 0.3, 0.3)}}>
          <Ember glow="rgba(227,179,65,0.16)" x={62} y={55} />
          <GridShot t={t} groups={[G.cria(1, {dim: 0.25 * prog(t, c('dieciséis'), 0.5)}), G.inv(clamp((t - c('dieciséis') + 0.1) / 0.7), {lift: 0.35, glow: prog(t, c('dieciséis') + 0.7, 0.5)})]} />
          <GridCaption t={t} t0={tEse} />
          <ShareText t={t} t0={c('dieciséis')} value={16} label="PARA EL INVERNADOR" color={K.inv} />
          <FadaSrc t={t} t0={tEse + 0.3} />
        </AbsoluteFill>
      ) : null}
      {between(t, tTrampa, tHoy + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tTrampa, tHoy + 0.3, 0.2)}}>
          <Ember glow="rgba(226,59,46,0.22)" />
          <Big t={t} t0={tTrampa + 0.1} t1={tPara + 0.1} text="LA PRIMERA TRAMPA" size={170} y={540} color={K.cream} hl={{TRAMPA: K.red}} />
          {t > tPara - 0.1 ? <Rinde t={t} c={c} /> : null}
        </AbsoluteFill>
      ) : null}
      {between(t, tHoy, tAsi + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tHoy, tAsi + 0.3, 0.3)}}>
          <FullPhoto src="ep06/liniers.jpg" t={t} t0={tHoy} t1={tAsi + 0.3} zoom={[1.02, 1.12]} focus="50% 35%" dim={0.6} fade={0.01} credit="Mercado de Hacienda de Liniers, hoy en Cañuelas · Palomo318, CC BY-SA 4.0" />
          <Chip t={t} t0={c('Mercado')} text="MERCADO AGROGANADERO DE CAÑUELAS" x={960} y={200} color={K.cream} size={40} />
          <Board t={t} t0={c('kilo de novillo')} tv={c('cuatro')} />
          <SrcLine t={t} t0={c('kilo de novillo')} text="Precio del novillo en pie: Mercado Agroganadero de Cañuelas, septiembre de 2026" y={1034} />
        </AbsoluteFill>
      ) : null}
      {t >= tAsi ? (
        <AbsoluteFill style={{opacity: prog(t, tAsi, 0.3)}}>
          <FullPhoto src="ep06/anden.jpg" t={t} t0={tAsi} zoom={[1.02, 1.1]} dim={1.1} fade={0.01} credit="Julián A. Lell, CC BY-SA 4.0" />
          <Equation t={t} t0={tAsi} tv={c('nueve')} />
        </AbsoluteFill>
      ) : null}
      <LinkTag t={t} t0={0.2} t1={tFeed + 0.1} n="2" name="EL INVERNADOR" color={K.inv} />
      <LinkTag t={t} t0={tEse} t1={tTrampa + 0.1} n="2" name="EL INVERNADOR" color={K.inv} />
      <Vig k={0.45} />
    </AbsoluteFill>
  );
};

/** vaca partida: mitad carne, mitad hueso/grasa/cuero/vísceras */
const Rinde: React.FC<{t: number; c: (p: string, n?: number) => number}> = ({t, c}) => {
  const t2 = c('dos kilos'), tResto = c('El resto');
  const split = easeInOut(clamp((t - tResto) / 0.8));
  const a = prog(t, c('para tener') - 0.1, 0.5);
  const parts = ['HUESO', 'GRASA', 'CUERO', 'VÍSCERAS'];
  const pt = [c('hueso,'), c('grasa,'), c('cuero'), c('vísceras.')];
  return (
    <AbsoluteFill style={{opacity: a}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', fontFamily: F.head, fontSize: 92, color: K.cream, opacity: prog(t, t2, 0.4)}}>
        2 KG DE VACA VIVA <span style={{color: K.mute}}>=</span> <span style={{color: K.red}}>1 KG DE CARNE</span>
      </div>
      <div style={{position: 'absolute', left: 360, top: 300, width: 1200, height: 745}}>
        <svg width={1200} height={745} viewBox="0 0 100 62" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <defs>
            <clipPath id="cowL"><rect x={0} y={-10} width={50} height={90} /></clipPath>
            <clipPath id="cowR"><rect x={50} y={-10} width={60} height={90} /></clipPath>
          </defs>
        </svg>
        <div style={{position: 'absolute', inset: 0, clipPath: 'inset(0 50% 0 0)', transform: `translateX(${-split * 90}px)`}}>
          <CowIcon size={1200} color={K.red} />
        </div>
        <div style={{position: 'absolute', inset: 0, clipPath: 'inset(0 0 0 50%)', transform: `translateX(${split * 90}px)`, opacity: 1 - 0.55 * split}}>
          <CowIcon size={1200} color="#8C8078" />
        </div>
      </div>
      <Chip t={t} t0={c('un kilo')} text="1 KG DE CARNE" x={620} y={290} color={K.red} size={46} />
      {parts.map((p, i) => (
        <Chip key={p} t={t} t0={pt[i]} text={p} x={1300 + (i % 2) * 260} y={520 + Math.floor(i / 2) * 110} color="#B5A89B" size={42} />
      ))}
    </AbsoluteFill>
  );
};

/** pizarra LED del mercado */
const Board: React.FC<{t: number; t0: number; tv: number}> = ({t, t0, tv}) => {
  if (t < t0 - 0.2) return null;
  const a = pop(t, t0 - 0.2, 0.9);
  return (
    <div style={{position: 'absolute', left: 960, top: 560, transform: `translate(-50%,-50%) scale(${Math.max(0, a)})`}}>
      <div style={{background: '#0A0A0A', border: '10px solid #2A2A2A', borderRadius: 14, padding: '26px 60px', boxShadow: '0 30px 80px rgba(0,0,0,0.7)', textAlign: 'center'}}>
        <div style={{fontFamily: F.mono, fontWeight: 700, fontSize: 34, color: '#FFB84D', letterSpacing: 4}}>NOVILLO · KG VIVO</div>
        <div style={{fontFamily: F.mono, fontWeight: 800, fontSize: 150, color: '#FFB020', textShadow: '0 0 24px rgba(255,160,20,0.8)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1}}>
          $<Count t={t} t0={tv} dur={1.2} to={4600} />
        </div>
      </div>
    </div>
  );
};

const Equation: React.FC<{t: number; t0: number; tv: number}> = ({t, t0, tv}) => (
  <>
    <div style={{position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: K.mute, opacity: prog(t, t0, 0.4)}}>
      ANTES DE SALIR DEL CAMPO
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: F.head, fontSize: 130, color: K.cream, opacity: prog(t, t0 + 0.3, 0.4)}}>
      2 KG <span style={{color: K.mute}}>×</span> $4.600
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center', fontFamily: F.head, fontSize: 260, color: K.yellow, lineHeight: 1, opacity: prog(t, tv - 0.3, 0.3), textShadow: '0 0 60px rgba(255,204,51,0.35)'}}>
      = $<Count t={t} t0={tv - 0.4} dur={0.9} to={9200} />
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 830, textAlign: 'center', fontFamily: F.head, fontSize: 56, color: K.cream, opacity: prog(t, tv + 0.4, 0.4)}}>
      Y TODAVÍA NO SALIÓ DEL CAMPO
    </div>
  </>
);

/* =====================================================================================
   S05 · eslabón 3 (frigorífico: $1) y eslabón 4 (carnicería: $20)
   ===================================================================================== */
export const S05: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s05', p, n);
  const tFaena = c('Faena,'), tSorpresa = c('Y acá'), tEl = c('El frigorífico,', 1), tUno = c('Uno.'), tSu = c('Su'), tCuarto = c('Cuarto'), tDesp = c('Desposta'), tSe = c('Se lleva');
  const dCam = camPath(t, [
    [-0.3, stCam(1)],
    [0.0, stCam(2)],
  ], 1.8);
  const dCam2 = camPath(t, [
    [tCuarto - 0.3, stCam(2)],
    [tCuarto, stCam(3)],
  ], 1.6);
  // cámara que se acerca al cubo del frigorífico (columna 5, fila 1 → índice 51)
  const cubeX = (5 - 4.5), cubeZ = (1 - 4.5);
  const zoom = easeInOut(clamp((t - c('un peso') + 0.6) / 1.6));
  const gCam = lerpCam({pos: [6.5, 12.2, 13.5], look: [-3.3, 0.2, 0.3], fov: 34}, {pos: [cubeX + 2.2, 2.6, cubeZ + 3.4], look: [cubeX, 0.9, cubeZ], fov: 34}, zoom);
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {t < tFaena + 0.3 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tFaena, 0.3)}}>
          <Ember glow="rgba(127,182,230,0.16)" y={58} />
          <DioStage cam={dCam}>
            <Diorama s={{t: t + 90, cols: [1, 1, 0, 0, 0], tokenX: STX[1] + 0.5 + (STX[2] - STX[1] - 1.5) * easeInOut(clamp(t / 1.8))}} />
          </DioStage>
        </AbsoluteFill>
      ) : null}
      {between(t, tFaena, tSorpresa + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tFaena, tSorpresa + 0.3, 0.25)}}>
          <FullVideo src="ep06/vid/wh_medias.mp4" t={t} t0={tFaena} t1={c('corta') + 0.2} dim={0.4} credit="A Mark of Wholesome Meat, USDA 1964 · dominio público" />
          <FullVideo src="ep06/vid/wh_desposte.mp4" t={t} t0={c('corta') - 0.1} t1={c('manda') + 0.1} dim={0.4} from={1} credit="A Mark of Wholesome Meat, USDA 1964 · dominio público" />
          <FullPhoto src="ep06/swift1929.jpg" t={t} t0={c('manda') - 0.1} t1={tSorpresa + 0.3} bw dim={0.4} zoom={[1.06, 1.14]} fade={0.2} credit="Frigorífico Swift, Rosario, 1929 · dominio público" />
          {['FAENA', 'ENFRÍA', 'CORTA LA MEDIA RES', 'CAMIÓN'].map((w, i) => (
            <Chip key={w} t={t} t0={[tFaena, c('enfría,'), c('corta'), c('camión.')][i]} text={w} x={[330, 640, 1030, 1450][i]} y={900} color={K.frig} size={44} />
          ))}
        </AbsoluteFill>
      ) : null}
      {between(t, tSorpresa, tEl + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tSorpresa, tEl + 0.3, 0.25)}}>
          <FullPhoto src="ep06/swift1920.jpg" t={t} t0={tSorpresa} t1={tEl + 0.3} bw dim={0.9} zoom={[1.15, 1.25]} fade={0.01} credit="Frigorífico Swift, La Plata, 1920 · dominio público" />
          <Big t={t} t0={tSorpresa + 0.2} text="LA SORPRESA" size={170} y={540} color={K.frig} />
        </AbsoluteFill>
      ) : null}
      {between(t, tEl, tSu + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tEl, tSu + 0.3, 0.3)}}>
          <Ember glow="rgba(127,182,230,0.18)" x={62} y={55} />
          <GridShot t={t} cam={gCam} groups={[G.cria(1, {dim: 0.45}), G.inv(1, {dim: 0.45}), G.frig(clamp((t - c('un peso')) / 0.3), {lift: 0.9, glow: 1.3})]} dimRest={0.2} />
          {t < c('un peso') ? <Big t={t} t0={c('al que')} text="AL QUE MUCHOS LE ECHAN LA CULPA" size={70} x={110} y={330} align="left" w={760} /> : null}
          <ShareText t={t} t0={c('un peso') - 0.1} value={1} label="PARA EL FRIGORÍFICO" color={K.frig} sub="DE CADA $100" />
          {t > tUno ? (
            <div style={{position: 'absolute', right: 150, top: 150, fontFamily: F.head, fontSize: 200, color: K.frig, transform: `scale(${pop(t, tUno, 1.2)})`, textShadow: '0 0 50px rgba(127,182,230,0.6)'}}>UNO.</div>
          ) : null}
          <FadaSrc t={t} t0={tEl + 0.3} />
        </AbsoluteFill>
      ) : null}
      {between(t, tSu, tCuarto + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tSu, tCuarto + 0.3, 0.3)}}>
          <FullPhoto src="ep06/terminales.jpg" t={t} t0={tSu} t1={tCuarto + 0.3} dim={1.0} zoom={[1.04, 1.14]} fade={0.01} credit="Terminales Río de la Plata · Dennis G. Jarvis, CC BY-SA 2.0" />
          <Big t={t} t0={tSu + 0.05} text="SU NEGOCIO ESTÁ EN OTRO LADO" size={84} y={200} />
          <Chip t={t} t0={c('cuero,')} text="EL CUERO" x={480} y={560} color={K.frig} size={56} />
          <Chip t={t} t0={c('subproductos')} text="LOS SUBPRODUCTOS" x={960} y={560} color={K.frig} size={56} />
          <Chip t={t} t0={c('exportación.')} text="LA EXPORTACIÓN" x={960} y={760} color={K.yellow} size={100} />
        </AbsoluteFill>
      ) : null}
      {between(t, tCuarto - 0.2, tDesp + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tCuarto - 0.2, tDesp + 0.3, 0.3)}}>
          <Ember glow="rgba(240,138,93,0.18)" y={58} />
          <DioStage cam={dCam2}>
            <Diorama s={{t: t + 90, cols: [1, 1, 1, 0, 0], truckX: 3 * easeInOut(clamp((t - tCuarto + 0.2) / 1.8)), tokenX: STX[2] + 1 + (STX[3] - STX[2] - 1.2) * easeInOut(clamp((t - tCuarto + 0.2) / 1.8))}} />
          </DioStage>
        </AbsoluteFill>
      ) : null}
      {between(t, tDesp, tSe + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tDesp, tSe + 0.3, 0.3)}}>
          <FullPhoto src="ep06/carniceria.jpg" t={t} t0={tDesp} t1={c('sueldos,') + 0.1} zoom={[1.02, 1.12]} dim={0.45} fade={0.01} credit="Carnicería en un mercado porteño · Dolapeart, CC BY-SA 4.0" />
          <FullVideo src="ep06/vid/wh_carnicero.mp4" t={t} t0={c('sueldos,') - 0.2} t1={tSe + 0.3} dim={0.45} fade={0.2} credit="A Mark of Wholesome Meat, USDA 1964 · dominio público" />
          <Chip t={t} t0={tDesp} text="DESPOSTA" x={330} y={220} color={K.carn} size={50} />
          {['ALQUILER', 'LUZ DE LAS CÁMARAS', 'SUELDOS', 'LO QUE NO SE VENDE'].map((w, i) => (
            <Chip key={w} t={t} t0={[c('alquiler,'), c('luz'), c('sueldos,'), c('lo que')][i]} text={w} x={[330, 760, 1190, 1560][i]} y={900} color={K.carn} size={42} />
          ))}
        </AbsoluteFill>
      ) : null}
      {t >= tSe ? (
        <AbsoluteFill style={{opacity: prog(t, tSe, 0.3)}}>
          <Ember glow="rgba(240,138,93,0.16)" x={62} y={55} />
          <GridShot t={t} groups={[G.cria(1, {dim: 0.3}), G.inv(1, {dim: 0.3}), G.frig(1, {dim: 0.3}), G.carn(clamp((t - c('veinte') + 0.1) / 0.8), {lift: 0.35, glow: prog(t, c('veinte') + 0.8, 0.5)})]} />
          <ShareText t={t} t0={c('veinte')} value={20} label="PARA LA CARNICERÍA" color={K.carn} />
          <FadaSrc t={t} t0={tSe + 0.3} />
        </AbsoluteFill>
      ) : null}
      <LinkTag t={t} t0={0.2} t1={tSu + 0.1} n="3" name="EL FRIGORÍFICO" color={K.frig} />
      <LinkTag t={t} t0={tCuarto + 0.1} n="4" name="LA CARNICERÍA" color={K.carn} />
      <Vig k={0.45} />
    </AbsoluteFill>
  );
};

export {CUM, colTop, fmt, Img, staticFile, Credit};
