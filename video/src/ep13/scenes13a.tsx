/* Escenas 1 a 6 del episodio 13 (EL LOTE 31.202): el aviso de la inspección y el título, qué es el fentanilo, el
   modelo del queso suizo, las barreras 1 a 3 (fábrica, ensayo, liberación), 4 y 5 (historial, clausura) y 6 (la
   inspección avisada). t es el tiempo relativo al inicio de la locución de cada segmento. */
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {cue, cueE, TL, CARD_LEAD} from './lib';
import {
  K, F, gs, gm, mix, clamp, easeIn, easeInOut, easeOut, pop, prog, rnd, fadeIO, driftT, ClinicBg, PaperBg, Letterbox, Kicker, Title13, SyncWords, Quote13, Stat13, DateRoll,
  BarrierHUD, BarrierCard, Stamp13, Recreation, DocSheet, ChatPanel, NameCard13, Photo13, PhotoCard13, Source13, Odo13, ramp, Signature, Credit13, Vignette, Dust,
} from './kit13';
import {PotencyBars, LineIcon, IVDrip, Defenses, Microscope, PoolingDiagram, ReportsGrid, Vials23, Padlock, Checklist18, ActaSpan, SixLots} from './viz13a';
import {StackView, travelZ, passed, holeWorld} from './stack13';
import {Stage13, Lights13, Ampoule, CleanRoom, camPath, breathe, sliceZ, project} from './three13';
import type {Cam} from './three13';

const D = TL.durations;
const between = (t: number, a: number, b: number) => t >= a && t < b;
/** capa que entra y sale con fundido (para cambiar de plano dentro de una escena) */
const Layer: React.FC<{t: number; a: number; b: number; d?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t, a, b, d = 0.45, children, style}) => {
  const o = Math.min(prog(t, a, d), 1 - prog(t, b - d, d, easeIn));
  if (t < a - 0.01 || t > b + 0.01 || o <= 0) return null;
  return <AbsoluteFill style={{opacity: o, ...style}}>{children}</AbsoluteFill>;
};

/* ================================================================== S01 · EL AVISO */
export const S01: React.FC<{t: number}> = ({t}) => {
  const tOut = cue('s01', 'es cierto');
  const tIn = cue('s01', 'Ella le contesta');
  const tWhy = cue('s01', 'Y le explica');
  const tNight = cue('s01', 'Esa misma noche');
  const tTasks = cue('s01', 'dieciocho tareas');
  const tHide = cue('s01', 'para que nadie vea');
  const t3 = cue('s01', 'Tres semanas después');
  const t90 = cue('s01', 'noventa muertes');
  const tVena = cue('s01', 'Para llegar');
  const t9 = cue('s01', 'nueve barreras');
  const tAll = cue('s01', 'Las atravesó todas');
  const tLot = cue('s01', 'Esta es la historia');
  const tFail = cue('s01', 'Y de cómo falló');
  const tEnd = D.s01; // fin de la locución (+ inserciones): empieza la secuencia de título
  const N = 9;
  // --- plano 3D de la pila
  const camStack = camPath(t, [
    [tVena - 0.3, {pos: [7.8, 3.4, -8.6], look: [0, 0, -0.6], fov: 32}],
    [tAll - 0.6, {pos: [3.6, 1.2, -9.2], look: [0.4, 0, -4.0], fov: 34}],
    [tAll + 0.5, {pos: [3.4, 0.9, 1.5], look: [0.4, 0, 5.2], fov: 34}],
    [tLot - 0.3, {pos: [1.0, 0.32, 7.1], look: [0.32, -0.05, 6.2], fov: 26}],
    [tFail - 0.1, {pos: [3.6, 2.3, 11.2], look: [0, 0, 0], fov: 34}],
  ], 1.3);
  const z = t < tAll ? travelZ(0, 0, 1, N) : travelZ(t, tAll + 0.05, 1.6, N);
  const pass = passed(z, N);
  const heroCam: Cam = {pos: [Math.sin(0.5 + (t - t3) * 0.09) * 2.6, 0.7, Math.cos(0.5 + (t - t3) * 0.09) * 2.6], look: [-0.28, 0.48, 0], fov: 32};
  return (
    <AbsoluteFill>
      <ClinicBg t={t} light={0.75} grid={0.6} alarm={between(t, t90, tVena) ? 0.5 : 0} />
      {/* ---------- el chat */}
      <Layer t={t} a={-1.4} b={t3 + 0.2}>
        <div style={{position: 'absolute', inset: 0, transform: `translateX(${-prog(t, tNight - 0.2, 0.9, easeInOut) * 560}px)`}}>
          <ChatPanel
            t={t} t0={-1.4} x={1160} y={560} w={780} h={560} scale={1.08} title="Funcionaria del Estado" sub="chat incorporado a la causa" avatar="F" date="27 de noviembre de 2024"
            msgs={[
              {side: 'out', text: 'Me comentaron que mañana van a ir a Ramallo', at: tOut},
              {side: 'in', text: 'Sí, es una inspección que deviene de reportes de productos', at: tIn + 0.1},
            ]}
            focus={t > tWhy ? 1 : -1}
          />
        </div>
        <DateRoll t={t} t0={-0.8} t1={tNight - 0.2} text="27.11.2024" x={110} y={420} align="left" size={84} label="LA NOCHE ANTERIOR" labelColor={K.amber} />
        <div style={{position: 'absolute', left: 110, top: 520, opacity: prog(t, 1.2, 0.5) * (1 - prog(t, tNight - 0.4, 0.4)), ...gm(22, K.mute, 500, 0.14), lineHeight: 1.7}}>
          <div>
            <span style={{color: K.bone}}>DE:</span> ALGUIEN DE UN LABORATORIO
          </div>
          <div>
            <span style={{color: K.bone}}>PARA:</span> UNA FUNCIONARIA DEL ESTADO
          </div>
        </div>
        {/* el grupo del laboratorio: dieciocho tareas, borroneadas */}
        <div style={{position: 'absolute', left: 1210, top: 170, width: 600, opacity: prog(t, tNight, 0.6), transform: `translateX(${(1 - prog(t, tNight, 0.8)) * 120}px)`}}>
          <div style={{...gm(22, K.amber, 600, 0.2)}}>ESA NOCHE · GRUPO DEL LABORATORIO</div>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 6}}>
            <Odo13 value={ramp(t, tTasks - 0.3, 18, 1.6)} size={150} color={K.bone} />
            <span style={{...gs(46, 700, K.bone)}}>tareas</span>
          </div>
          {Array.from({length: 7}, (_, i) => {
            const p = prog(t, tTasks + i * 0.22, 0.4);
            return (
              <div key={i} style={{marginTop: 14, opacity: p, transform: `translateY(${(1 - p) * 14}px)`, display: 'flex', justifyContent: i % 2 ? 'flex-end' : 'flex-start'}}>
                <div style={{background: i % 2 ? K.bubbleOut : K.bubbleIn, borderRadius: 18, padding: '14px 20px', width: 300 + rnd(i + 2) * 220, filter: `blur(${mix(0, 7, prog(t, tHide, 0.8))}px)`}}>
                  <div style={{height: 12, width: '86%', background: 'rgba(236,243,241,0.6)', borderRadius: 3}} />
                  <div style={{height: 12, width: `${40 + rnd(i) * 40}%`, background: 'rgba(236,243,241,0.4)', borderRadius: 3, marginTop: 8}} />
                </div>
              </div>
            );
          })}
        </div>
      </Layer>
      {/* ---------- la ampolla (héroe) */}
      <Layer t={t} a={t3 - 0.1} b={tVena + 0.35}>
        <Stage13 cam={heroCam} exposure={1.1} envKind="studio" env={1.0}>
          <Lights13 key0={[2, 5, 4]} keyI={2.4} rim={2.2} />
          <spotLight position={[0, 4, 0]} angle={0.5} penumbra={0.8} intensity={30} distance={10} color="#E9FFF9" />
          <Ampoule pos={[0, 0, 0]} rot={[0, t * 0.35, 0]} s={1} cloud={prog(t, t90, 1.2) * 0.35} glow={prog(t, t90, 1.0) * 0.4} studio />
        </Stage13>
        <Kicker t={t} t0={t3 + 0.2} text="Diciembre de 2024 · la planta de Ramallo" x={96} y={92} color={K.teal} size={22} />
        <Stat13 t={t} t0={t90 - 0.15} x={150} y={360} value={90} dur={1.0} label="Muertes que le atribuye la Justicia" color={K.red} valColor={K.red} size={230} w={700} />
      </Layer>
      {/* ---------- la pila: nueve barreras, las atravesó todas */}
      <Layer t={t} a={tVena - 0.25} b={tEnd + 0.3}>
        <StackView
          t={t} cam={breathe(camStack, t, 0.6)} n={N}
          state={(i) => {
            const appear = prog(t, tVena + 0.25 + i * 0.12, 0.5);
            const flash = i <= pass ? Math.max(0, 1 - (t - (tAll + 0.05 + ((i + 0.5) / N) * 1.6)) / 0.7) : 0;
            const seq = prog(t, tFail + 0.3 + i * 0.36, 0.3);
            return {o: appear, open: 1, align: 1, glow: Math.max(flash, seq * 0.5)};
          }}
          traveler={{kind: 'ampoule', z, glow: 0.7, spin: t * 0.6, o: prog(t, tVena, 0.5)}}
          overlay={(pj) => {
            const [ax, ay] = pj([0.32, -0.05, z]);
            return (
              <>
                <div style={{position: 'absolute', left: 96, top: 72, opacity: prog(t, t9 - 0.2, 0.4) * (1 - prog(t, tAll - 0.3, 0.3))}}>
                  <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
                    <Odo13 value={ramp(t, t9 - 0.2, 9, 0.8)} size={150} color={K.cheese} />
                    <span style={{...gs(56, 700, K.bone)}}>barreras</span>
                  </div>
                </div>
                {t > tLot - 0.2 && t < tFail + 0.4 ? (
                  // rótulo de evidencia sobre fondo oscuro (la feta clara se come el texto) con línea guía a la ampolla
                  <>
                    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: fadeIO(t, tLot + 0.2, tFail + 0.3, 0.35)}}>
                      <line x1={560} y1={348} x2={mix(560, ax, prog(t, tLot + 0.55, 0.7, easeInOut))} y2={mix(348, ay, prog(t, tLot + 0.55, 0.7, easeInOut))} stroke={K.red} strokeWidth={2.5} />
                      <circle cx={ax} cy={ay} r={14 * prog(t, tLot + 1.1, 0.4, easeOut)} fill="none" stroke={K.red} strokeWidth={2.5} />
                    </svg>
                    <div style={{position: 'absolute', left: 110, top: 150, width: 450, boxSizing: 'border-box', padding: '22px 30px 26px', background: 'rgba(4,10,11,0.8)', border: `1px solid ${K.line2}`, borderRadius: 6, opacity: fadeIO(t, tLot + 0.2, tFail + 0.3, 0.35)}}>
                      <div style={{...gm(24, K.mute, 600, 0.24)}}>LOTE</div>
                      <div style={{...gm(120, K.bone, 500, -0.02), lineHeight: 1}}>31.202</div>
                      <div style={{width: 300 * prog(t, tLot + 0.5, 0.8), height: 4, background: K.red, marginTop: 10}} />
                    </div>
                  </>
                ) : null}
                <SyncWords t={t} t1={tEnd + 0.1} y={930} size={58} words={[{w: 'Una', t: tFail + 0.45}, {w: 'por', t: tFail + 0.6}, {w: 'una.', t: tFail + 0.75, color: K.red}]} />
              </>
            );
          }}
        />
      </Layer>
      {/* ---------- título */}
      <Title01 t={t - tEnd} dur={TL.starts.s02 - TL.starts.s01 - tEnd} />
      <Letterbox k={1 - prog(t, -0.6, 1.2)} />
    </AbsoluteFill>
  );
};

/** secuencia de título: EDICIÓN ESPECIAL · EL LOTE 31.202 · NUEVE BARRERAS, NOVENTA MUERTES */
const Title01: React.FC<{t: number; dur: number}> = ({t, dur}) => {
  if (t < -0.1) return null;
  const o = Math.min(prog(t, 0, 0.35), 1 - prog(t, dur - 0.9, 0.7, easeIn));
  const flash = Math.max(0, 1 - Math.abs(t - 0.55) / 0.25);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbsoluteFill style={{background: K.void}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 50% at 50% 55%, rgba(255,59,48,${0.16 + 0.05 * Math.sin(t * 2)}) 0%, rgba(0,0,0,0) 70%)`}} />
      <Dust t={t + 40} o={0.6} color="#FFD9D4" />
      <div style={{position: 'absolute', left: 960, top: 300, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 22, opacity: prog(t, 0.2, 0.5)}}>
        <span style={{width: 60 * prog(t, 0.3, 0.7), height: 2, background: K.red}} />
        <span style={{...gm(30, K.red, 600, 0.5)}}>EDICIÓN ESPECIAL</span>
        <span style={{width: 60 * prog(t, 0.3, 0.7), height: 2, background: K.red}} />
      </div>
      <Title13 t={t} t0={0.45} text="EL LOTE 31.202" size={190} y={470} g0={150} g1={820} stagger={0.045} dur={1.0} track0={0.2} track1={-0.03} />
      <div style={{position: 'absolute', left: 960, top: 640, transform: 'translateX(-50%)', whiteSpace: 'nowrap', opacity: prog(t, 1.6, 0.6), letterSpacing: `${mix(0.4, 0.22, prog(t, 1.6, 1.4))}em`, ...gm(40, K.bone, 500, 0.22)}}>
        NUEVE BARRERAS, <span style={{color: K.red}}>NOVENTA MUERTES</span>
      </div>
      <div style={{position: 'absolute', left: 960, top: 760, transform: 'translateX(-50%)', opacity: prog(t, 2.4, 0.6) * 0.8, ...gm(20, K.mute, 500, 0.3)}}>CONTEXTO · EPISODIO 13</div>
      <AbsoluteFill style={{background: '#FFF', opacity: flash * 0.5, mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};

/* ================================================================== S02 · QUÉ ES EL FENTANILO */
export const S02: React.FC<{t: number}> = ({t}) => {
  const tOp = cue('s02', 'El fentanilo es');
  const tPot = cue('s02', 'cincuenta y cien');
  const tStreet = cue('s02', 'En la calle');
  const tHosp = cue('s02', 'En un hospital');
  const tCir = cue('s02', 'cirugías');
  const tUti = cue('s02', 'terapia intensiva');
  const tDolor = cue('s02', 'aliviar el dolor');
  const tIntub = cue('s02', 'intubados');
  const tVein = cue('s02', 'Se inyecta');
  const tSteril = cue('s02', 'tiene que ser estéril');
  const tZero = cue('s02', 'ni una sola bacteria');
  const tSana = cue('s02', 'Una persona sana');
  const tUti2 = cue('s02', 'Un paciente en terapia');
  const tVict = cue('s02', 'Las víctimas');
  const tInt = cue('s02', 'Eran pacientes internados');
  const tConf = cue('s02', 'que confiaban');
  return (
    <AbsoluteFill>
      <ClinicBg t={t} light={0.8} />
      <Layer t={t} a={-0.4} b={tStreet - 0.1}>
        <Kicker t={t} t0={-0.2} text="Primero" x={150} y={150} color={K.teal} />
        <Title13 t={t} t0={0.0} text="¿Qué es el fentanilo?" size={110} x={150} y={250} align="left" upper={false} g0={250} g1={760} track1={-0.035} />
        <div style={{position: 'absolute', left: 154, top: 340, opacity: prog(t, tOp + 0.6, 0.5), ...gm(26, K.bone, 500, 0.16)}}>
          UN <span style={{color: K.teal}}>ANALGÉSICO OPIOIDE</span>
        </div>
        <PotencyBars t={t} t0={tPot - 0.6} y={520} />
      </Layer>
      <Layer t={t} a={tStreet - 0.15} b={tVein - 0.1}>
        {/* dos mundos */}
        <div style={{position: 'absolute', left: 0, top: 0, width: 1920 * mix(1, 0.5, prog(t, tHosp - 0.2, 0.7, easeInOut)), height: 1080, background: 'linear-gradient(180deg, rgba(60,8,10,0.75), rgba(10,4,4,0.9))', overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 120, top: 380}}>
            <Kicker t={t} t0={tStreet} text="En la calle" x={0} y={0} color={K.red} size={26} />
            <SyncWords t={t} x={0} y={110} w={700} align="left" size={84} words={[{w: 'una', t: tStreet + 0.7}, {w: 'droga', t: tStreet + 0.95}, {w: 'que', t: tStreet + 1.2}, {w: 'mata.', t: tStreet + 1.4, color: K.red}]} />
          </div>
        </div>
        <div style={{position: 'absolute', right: 0, top: 0, width: 960 * prog(t, tHosp - 0.2, 0.7, easeInOut), height: 1080, background: 'linear-gradient(180deg, rgba(10,60,56,0.55), rgba(4,14,14,0.9))', overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 120, top: 200, width: 760}}>
            <Kicker t={t} t0={tHosp + 0.1} text="En un hospital" x={0} y={0} color={K.teal} size={26} />
            <div style={{...gs(78, 760, K.bone, -0.03), marginTop: 40, opacity: prog(t, tHosp + 0.6, 0.5)}}>indispensable</div>
            <div style={{display: 'flex', gap: 46, marginTop: 70}}>
              {[
                {k: 'quirofano' as const, l: 'CIRUGÍAS', at: tCir},
                {k: 'uti' as const, l: 'TERAPIA INTENSIVA', at: tUti},
                {k: 'intubado' as const, l: 'PACIENTES INTUBADOS', at: tIntub - 0.4},
              ].map((it) => (
                <div key={it.l} style={{textAlign: 'center', opacity: prog(t, it.at - 0.1, 0.4), width: 210}}>
                  <LineIcon kind={it.k} size={150} p={prog(t, it.at - 0.1, 1.0)} />
                  <div style={{...gm(18, K.bone, 600, 0.14), marginTop: 10}}>{it.l}</div>
                </div>
              ))}
            </div>
            <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 44, color: K.mint, marginTop: 50, opacity: prog(t, tDolor, 0.5)}}>sedar y aliviar el dolor de pacientes graves</div>
          </div>
        </div>
      </Layer>
      <Layer t={t} a={tVein - 0.2} b={tSana - 0.1}>
        <IVDrip t={t} t0={tVein - 0.2} x={1260} y={130} />
        <div style={{position: 'absolute', left: 150, top: 300}}>
          <SyncWords t={t} x={0} y={0} w={900} align="left" size={74} words={[{w: 'Se', t: tVein}, {w: 'inyecta', t: tVein + 0.15}, {w: 'directo', t: tVein + 0.45}, {w: 'en', t: tVein + 0.7}, {w: 'la', t: tVein + 0.8}, {w: 'sangre.', t: tVein + 0.95, color: K.red}]} />
          <div style={{position: 'absolute', left: 0, top: 120, opacity: prog(t, tSteril, 0.5)}}>
            <div style={{...gm(24, K.teal, 600, 0.22)}}>TIENE QUE SER</div>
            <div style={{...gs(130, 800, K.bone, -0.04)}}>ESTÉRIL</div>
          </div>
        </div>
        <Microscope t={t} t0={tZero - 0.3} x={600} y={830} r={190} n={0} focus={prog(t, tZero - 0.3, 1.0)} seed={3} />
        <div style={{position: 'absolute', left: 840, top: 800, opacity: prog(t, tZero, 0.5)}}>
          <div style={{...gs(120, 800, K.teal, -0.04), lineHeight: 1}}>0</div>
          <div style={{...gm(22, K.bone, 600, 0.18)}}>BACTERIAS</div>
        </div>
      </Layer>
      <Layer t={t} a={tSana - 0.2} b={tVict - 0.05}>
        <Defenses t={t} t0={tSana - 0.1} t2={tUti2} y={540} />
      </Layer>
      <Layer t={t} a={tVict - 0.15} b={D.s02 + 1.5}>
        <IVDrip t={t} t0={tVict - 0.15} x={1420} y={110} tint={K.mint} />
        <Quote13 t={t} t0={tVict} text="no buscaban ninguna droga." by="" x={150} y={380} w={1100} align="left" size={86} accent={K.teal} />
        <div style={{position: 'absolute', left: 150, top: 560, width: 1100, opacity: prog(t, tInt, 0.6)}}>
          <div style={{...gm(24, K.teal, 600, 0.22)}}>LAS VÍCTIMAS DE ESTA HISTORIA</div>
          <div style={{...gs(72, 760, K.bone, -0.03), marginTop: 10}}>eran pacientes internados</div>
          <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 50, color: K.mint, marginTop: 18, opacity: prog(t, tConf, 0.6)}}>que confiaban en lo que les entraba por la vena</div>
        </div>
      </Layer>
    </AbsoluteFill>
  );
};

/* ================================================================== S03 · EL MODELO DEL QUESO SUIZO */
export const S03: React.FC<{t: number}> = ({t}) => {
  const tAcc = cue('s03', 'accidentes de avión');
  const tErr = cue('s03', 'errores médicos');
  const tModel = cue('s03', 'el modelo del queso suizo');
  const tNone = cue('s03', 'Ninguna barrera');
  const tHoles = cue('s03', 'Cada una tiene agujeros');
  const tSev = cue('s03', 'Por eso se ponen varias');
  const tEsc = cue('s03', 'lo que se escapa');
  const tFrena = cue('s03', 'lo frena la feta siguiente');
  const tDis = cue('s03', 'El desastre ocurre');
  const tAlign = cue('s03', 'se alinean');
  const tThru = cue('s03', 'y algo atraviesa');
  const tNine = cue('s03', 'En esta historia hubo nueve fetas');
  const tGo = cue('s03', 'Vamos a recorrerlas');
  const N = tNine - 0.4 < t ? 9 : 4;
  // --- 3D
  const cam: Cam = camPath(t, [
    [tNone - 0.5, {pos: [0.5, 0.3, -6.9], look: [0, 0, -1.7], fov: 34}],
    [tSev - 0.3, {pos: [6.6, 2.4, -6.4], look: [0, 0, 0.2], fov: 34}],
    [tDis, {pos: [5.2, 1.8, -7.4], look: [0.2, 0, 0.5], fov: 33}],
    [tNine - 0.5, {pos: [10.5, 4.4, -10.5], look: [0, 0, 0], fov: 32}],
    [tGo + 0.2, {pos: [1.6, 0.6, -7.4], look: [0, 0, -4.6], fov: 30}],
  ], 1.3);
  // la esfera: primero se frena en la segunda feta; después, con los agujeros alineados, atraviesa todo
  const z4s = sliceZ(0, 4) - 1.6;
  const zStop = sliceZ(1, 4) - 0.2;
  let sz = z4s, so = 0;
  if (t > tEsc - 0.3 && t < tDis + 0.4) {
    const k = prog(t, tEsc - 0.2, 1.5, easeInOut);
    sz = mix(z4s, zStop, k) - Math.max(0, Math.sin(clamp((t - tFrena + 0.2) * 3) * Math.PI)) * 0.25;
    so = Math.min(prog(t, tEsc - 0.3, 0.3), 1 - prog(t, tDis + 0.1, 0.3));
  } else if (t >= tDis + 0.4) {
    sz = travelZ(t, tThru, 1.6, 4, 1.6);
    so = Math.min(prog(t, tDis + 0.4, 0.3), 1 - prog(t, tThru + 2.6, 0.4));
  }
  const align = N === 4 ? prog(t, tDis + 0.2, 2.2, easeInOut) : 1;
  return (
    <AbsoluteFill>
      <ClinicBg t={t} light={0.7} grid={0.5} />
      <Layer t={t} a={-0.3} b={tNone - 0.1}>
        <Kicker t={t} t0={0.2} text="Modelo de James Reason · 1990" x={150} y={180} color={K.cheese} />
        <div style={{position: 'absolute', left: 150, top: 260, display: 'flex', gap: 80}}>
          {[
            {k: 'avion' as const, l: 'ACCIDENTES DE AVIÓN', at: tAcc},
            {k: 'hospital' as const, l: 'ERRORES MÉDICOS', at: tErr},
          ].map((it) => (
            <div key={it.l} style={{opacity: prog(t, it.at - 0.2, 0.5), textAlign: 'center'}}>
              <LineIcon kind={it.k} size={190} color={K.bone} p={prog(t, it.at - 0.2, 1.0)} />
              <div style={{...gm(20, K.bone, 600, 0.16), marginTop: 10}}>{it.l}</div>
            </div>
          ))}
        </div>
        <Title13 t={t} t0={tModel - 0.1} text={'El modelo\ndel queso suizo'} size={120} x={150} y={760} align="left" upper={false} g0={250} g1={780} />
      </Layer>
      <Layer t={t} a={tNone - 0.3} b={D.s03 + 1.6}>
        <StackView
          t={t} cam={breathe(cam, t, 0.5)} n={N}
          state={(i) => {
            if (N === 4) {
              const appear = i === 0 ? prog(t, tNone - 0.3, 0.6) : prog(t, tSev + (i - 1) * 0.25, 0.5);
              const holes = prog(t, tHoles, 0.6);
              return {o: appear, open: holes, align, glow: 0, scale: i === 0 ? 1 : 1};
            }
            const appear = prog(t, tNine - 0.4 + i * 0.08, 0.5);
            return {o: appear, open: 0.75, align: 0, glow: 0};
          }}
          traveler={so > 0 ? {kind: 'sphere', z: sz, o: so} : null}
          overlay={(pj) => (
            <>
              <SyncWords t={t} t1={tHoles - 0.2} x={960} y={940} size={58} words={[{w: 'Ninguna', t: tNone}, {w: 'barrera', t: tNone + 0.35}, {w: 'es', t: tNone + 0.7}, {w: 'perfecta.', t: tNone + 0.85, color: K.cheese}]} />
              <SyncWords t={t} t1={tSev - 0.1} x={960} y={940} size={58} words={[{w: 'Cada', t: tHoles}, {w: 'una', t: tHoles + 0.2}, {w: 'tiene', t: tHoles + 0.35}, {w: 'agujeros.', t: tHoles + 0.55, color: K.red}]} />
              <SyncWords t={t} t1={tDis - 0.1} x={960} y={940} size={52} words={[{w: 'Lo', t: tEsc}, {w: 'que', t: tEsc + 0.1}, {w: 'se', t: tEsc + 0.2}, {w: 'escapa', t: tEsc + 0.3}, {w: 'lo', t: tFrena}, {w: 'frena', t: tFrena + 0.15, color: K.teal}, {w: 'la', t: tFrena + 0.4}, {w: 'siguiente.', t: tFrena + 0.6, color: K.teal}]} />
              <SyncWords t={t} t1={tNine - 0.3} x={960} y={940} size={52} words={[{w: 'Cuando', t: tDis + 0.6}, {w: 'los', t: tDis + 0.8}, {w: 'agujeros', t: tDis + 1.0}, {w: 'se', t: tAlign - 0.1}, {w: 'alinean…', t: tAlign, color: K.red}]} />
              {N === 9
                ? Array.from({length: 9}, (_, i) => {
                    const [x, y] = pj([-1.75, 1.25, sliceZ(i, 9)]);
                    const p = prog(t, tNine + 0.2 + i * 0.1, 0.4) * (1 - prog(t, tGo + 0.4, 0.5));
                    return (
                      <div key={i} style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-100%)', opacity: p, textAlign: 'center'}}>
                        <div style={{...gm(30, K.cheese, 600, 0.04)}}>{i + 1}</div>
                      </div>
                    );
                  })
                : null}
              <div style={{position: 'absolute', left: 120, top: 120, opacity: fadeIO(t, tNine, tGo + 0.6, 0.4)}}>
                <div style={{display: 'flex', alignItems: 'baseline', gap: 16}}>
                  <Odo13 value={ramp(t, tNine, 9, 0.8)} size={140} color={K.cheese} />
                  <span style={{...gs(54, 700, K.bone)}}>fetas</span>
                </div>
              </div>
            </>
          )}
        />
        <AbsoluteFill style={{background: '#FF3B30', opacity: Math.max(0, 1 - Math.abs(t - (tThru + 1.55)) / 0.25) * 0.35, mixBlendMode: 'screen'}} />
      </Layer>
    </AbsoluteFill>
  );
};

/* ================================================================== S04 · BARRERAS 1 A 3 */
export const S04: React.FC<{t: number}> = ({t}) => {
  const tSalas = cue('s04', 'salas limpias');
  const tAire = cue('s04', 'aire filtrado');
  const tRopa = cue('s04', 'ropa especial');
  const tAgua = cue('s04', 'agua purificada');
  const tPlanta = cue('s04', 'En la planta');
  const tHLB = cue('s04', 'que fabricaba para');
  const tAreas = cue('s04', 'producción en áreas');
  const tLimp = cue('s04', 'limpiezas de apenas');
  const tArs = cue('s04', 'agua para inyectables');
  const tVeces = cue('s04', 'seis a siete veces');
  const [ins2, ins3] = TL.inserts.s04;
  const tMuestra = cue('s04', 'se toma una muestra');
  const tMix = cue('s04', 'mezclaban');
  const tCon = cue('s04', 'Con esa mezcla');
  const tNeg = cue('s04', 'el ensayo da negativo');
  const tSale = cue('s04', 'y el lote sale');
  const tFirma = cue('s04', 'alguien de control de calidad');
  const tAjeno = cue('s04', 'esas firmas las ponía');
  const tReg = cue('s04', 'los registros se completaban');
  const cam: Cam = camPath(t, [
    [-0.5, {pos: [-6.5, 2.6, 6.2], look: [-1.5, 1.0, 0], fov: 38}],
    [tPlanta - 0.4, {pos: [-1.8, 2.0, 4.2], look: [0.2, 1.1, 0], fov: 34}],
    [tArs - 0.5, {pos: [3.6, 1.0, 3.2], look: [0.4, 0.5, -0.8], fov: 36}],
  ], 2.4);
  const red = prog(t, tAreas, 1.2) * 0.6 + prog(t, tArs, 1.0) * 0.4;
  const fail = (txt: string, at: number, y: number, big?: React.ReactNode) => (
    <div style={{position: 'absolute', right: 110, top: y, width: 720, opacity: fadeIO(t, at, ins2[0] + 0.2, 0.35), transform: `translateX(${(1 - prog(t, at, 0.5)) * 60}px)`, borderLeft: `4px solid ${K.red}`, paddingLeft: 24, background: 'linear-gradient(90deg, rgba(4,10,11,0.82), rgba(4,10,11,0.4))', paddingTop: 12, paddingBottom: 14}}>
      <div style={{...gm(20, K.red, 600, 0.18)}}>SEGÚN LA INVESTIGACIÓN</div>
      <div style={{...gs(40, 650, K.bone, -0.015), lineHeight: 1.12, marginTop: 4}}>{txt}</div>
      {big}
    </div>
  );
  return (
    <AbsoluteFill>
      <ClinicBg t={t} light={0.7} />
      {/* ---------- 1 · la fábrica: sala limpia en 3D */}
      <Layer t={t} a={-0.6} b={ins2[0] + 0.5}>
        <Stage13 cam={breathe(cam, t, 0.8)} bg="#DCE6E3" fog={['#DCE6E3', 9, 26]} exposure={1.0}>
          <Lights13 key0={[2, 8, 5]} keyI={1.8} fill={0.9} rim={0.6} rimColor="#FFFFFF" />
          <CleanRoom t={t} red={red} arsenic={prog(t, tArs, 1.0)} dirty={prog(t, tAreas, 2) * 0.5} />
        </Stage13>
        <AbsoluteFill style={{background: `rgba(255,59,48,${0.12 * red})`, mixBlendMode: 'multiply'}} />
        <Vignette k={0.55} />
        <div style={{position: 'absolute', left: 110, top: 300, opacity: fadeIO(t, tSalas - 0.2, tPlanta, 0.4)}}>
          <div style={{...gm(22, K.tealDeep, 700, 0.2)}}>UN INYECTABLE SE PRODUCE EN</div>
          <div style={{...gs(86, 800, K.ink, -0.03)}}>salas limpias</div>
          {[
            {l: 'AIRE FILTRADO', at: tAire},
            {l: 'ROPA ESPECIAL', at: tRopa},
            {l: 'AGUA PURIFICADA', at: tAgua},
          ].map((it, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 18, opacity: prog(t, it.at, 0.4)}}>
              <span style={{width: 34, height: 34, borderRadius: 17, background: K.tealDeep, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22}}>✓</span>
              <span style={{...gm(26, K.ink, 700, 0.14)}}>{it.l}</span>
            </div>
          ))}
        </div>
        <div style={{position: 'absolute', left: 110, top: 760, opacity: fadeIO(t, tPlanta, ins2[0] + 0.3, 0.4), background: 'rgba(4,10,11,0.85)', padding: '20px 28px', borderRadius: 12}}>
          <div style={{...gm(20, K.amber, 600, 0.2)}}>RAMALLO · PROVINCIA DE BUENOS AIRES</div>
          <div style={{...gs(54, 760, K.bone, -0.02)}}>Laboratorios Ramallo</div>
          <div style={{...gs(30, 500, K.mute), opacity: prog(t, tHLB, 0.5)}}>
            fabricaba para <span style={{color: K.bone, fontWeight: 700}}>HLB Pharma</span>
          </div>
        </div>
        {fail('Producción en áreas no habilitadas', tAreas, 250)}
        {fail('Limpiezas de apenas 2 o 3 horas entre un lote y otro', tLimp, 440)}
        {fail('Agua para inyectables con arsénico', tArs, 660, (
          <div style={{display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 6, opacity: prog(t, tVeces, 0.4)}}>
            <span style={{...gs(84, 800, K.red, -0.03)}}>6 a 7×</span>
            <span style={{...gm(20, K.bone, 600, 0.14)}}>POR ENCIMA DEL LÍMITE</span>
          </div>
        ))}
      </Layer>
      {/* ---------- 2 · el ensayo de esterilidad */}
      <Layer t={t} a={ins2[0] + 0.9} b={ins3[0] + 0.4}>
        <PoolingDiagram t={t} t0={ins2[0] + 0.9} tPool={tMix - 0.2} tDilute={tCon + 0.4} tNeg={tNeg} tOut={tSale} />
        <div style={{position: 'absolute', left: 300, top: 160, opacity: fadeIO(t, tMuestra, tMix - 0.3, 0.4)}}>
          <div style={{...gm(22, K.teal, 600, 0.2)}}>ANTES DE VENDER UN LOTE</div>
          <div style={{...gs(54, 700, K.bone, -0.02)}}>se toma una muestra y se cultiva</div>
          <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 40, color: K.mint}}>para ver si crece algo</div>
        </div>
        <Source13 t={t} t0={tMix} text="FISCALÍA FEDERAL N.º 1 DE LA PLATA · DICTAMEN (AGOSTO 2026)" />
      </Layer>
      {/* ---------- 3 · la liberación */}
      <Layer t={t} a={ins3[0] + 0.9} b={D.s04 + 1.3}>
        <PaperBg />
        <DocSheet
          t={t} t0={ins3[0] + 0.9} x={700} y={560} w={600} rot={-2} head="LABORATORIO · CONTROL DE CALIDAD" title="PROTOCOLO DE LIBERACIÓN DE LOTE" to="Producto: inyectable · Lote: ———" lines={8} seed={4}
          sign={prog(t, tAjeno + 0.3, 1.1)} signLabel="Control de calidad"
        >
          <Recreation x={590} y={20} dark={false} />
        </DocSheet>
        <div style={{position: 'absolute', left: 1080, top: 300, width: 700}}>
          <div style={{opacity: prog(t, tFirma, 0.5)}}>
            <div style={{...gm(22, K.tealDeep, 700, 0.2)}}>LA TERCERA BARRERA</div>
            <div style={{...gs(54, 760, K.ink, -0.02), lineHeight: 1.1}}>alguien de control de calidad firma que el lote está en condiciones</div>
          </div>
          <div style={{marginTop: 40, opacity: prog(t, tAjeno, 0.5), borderLeft: `5px solid ${K.red}`, paddingLeft: 22}}>
            <div style={{...gm(20, K.redDeep, 700, 0.18)}}>SEGÚN LA INVESTIGACIÓN</div>
            <div style={{...gs(42, 700, K.ink, -0.015), lineHeight: 1.12}}>firmaba personal que no participaba del control de calidad</div>
          </div>
          <div style={{marginTop: 34, opacity: prog(t, tReg, 0.5)}}>
            <svg width={680} height={120}>
              <rect x={0} y={30} width={300 * prog(t, tReg, 0.6)} height={50} rx={8} fill={K.tealDeep} />
              <text x={16} y={63} fontFamily={F.mono} fontWeight={700} fontSize={20} fill="#fff" opacity={prog(t, tReg + 0.3, 0.3)}>FABRICACIÓN</text>
              <rect x={330} y={30} width={300 * prog(t, tReg + 0.8, 0.6)} height={50} rx={8} fill={K.redDeep} />
              <text x={346} y={63} fontFamily={F.mono} fontWeight={700} fontSize={20} fill="#fff" opacity={prog(t, tReg + 1.1, 0.3)}>REGISTROS</text>
              <text x={330} y={110} fontFamily={F.mono} fontSize={18} fill={K.redDeep} opacity={prog(t, tReg + 1.2, 0.4)} letterSpacing="0.12em">SE COMPLETABAN DESPUÉS</text>
            </svg>
          </div>
        </div>
      </Layer>
      <BarrierHUD
        t={t} t0={2.0} t1={D.s04 + 2} n={t < ins2[0] + 0.3 ? 1 : t < ins3[0] + 0.3 ? 2 : 3} failedUpTo={t < ins2[0] + 0.3 ? 0 : t < ins3[0] + 0.3 ? 1 : 2}
        light={1 - prog(t, ins2[0] + 0.05, 0.45) + prog(t, ins3[0] + 0.9, 0.45)}
      />
      <BarrierCard t={t} t0={-CARD_LEAD.s04} dur={CARD_LEAD.s04 + 1.7} n={1} sub="donde se fabrica el remedio" />
      <BarrierCard t={t} t0={ins2[0] - 0.15} dur={ins2[1] + 1.55} n={2} sub="la prueba antes de vender" />
      <BarrierCard t={t} t0={ins3[0] - 0.15} dur={ins3[1] + 1.55} n={3} sub="la firma que dice «está en condiciones»" />
    </AbsoluteFill>
  );
};

/* ================================================================== S05 · BARRERAS 4 Y 5 */
export const S05: React.FC<{t: number}> = ({t}) => {
  const tRep = cue('s05', 'Cuando un remedio falla');
  const tAnmat = cue('s05', 'el organismo que controla');
  const t118 = cue('s05', 'ciento dieciocho');
  const tMay = cue('s05', 'la gran mayoría');
  const t38 = cue('s05', 'treinta y ocho');
  const tDexa = cue('s05', 'En dos mil veintitrés');
  const tRal = cue('s05', 'contaminada con Ralstonia');
  const tUna = cue('s05', 'analizaron una');
  const tNo = cue('s05', 'Y no se tomaron medidas');
  const [ins5] = TL.inserts.s05;
  const t2019 = cue('s05', 'En dos mil diecinueve');
  const tCerrar = cue('s05', 'ordenado cerrar');
  const tNunca = cue('s05', 'nunca se ejecutó');
  return (
    <AbsoluteFill>
      <ClinicBg t={t} light={0.7} />
      <Layer t={t} a={1.5} b={t118 - 0.2}>
        <Photo13 src="ep13/img/anmat_edificio.jpg" t={t} t0={1.5} from={{s: 1.05, x: 0, y: 0}} to={{s: 1.16, x: -30, y: -10}} dur={9} credit="Roberto Fiadone · Wikimedia Commons · dominio público" />
        <NameCard13 t={t} t0={tAnmat - 0.6} name="ANMAT" role="El organismo que controla los medicamentos" x={110} y={760} size={90} statusColor={K.teal} />
        <Kicker t={t} t0={tRep} text="Médicos y farmacéuticos reportan las fallas" x={110} y={690} color={K.teal} plate />
      </Layer>
      <Layer t={t} a={t118 - 0.4} b={tDexa - 0.1}>
        <ReportsGrid t={t} t0={t118 - 0.4} tConf={tMay} tRecall={t38} x={360} y={250} />
        <Source13 t={t} t0={t118} text="FISCALÍA FEDERAL N.º 1 DE LA PLATA · LÍNEA DE TIEMPO DE LA CAUSA" />
      </Layer>
      <Layer t={t} a={tDexa - 0.2} b={ins5[0] + 0.4}>
        <DateRoll t={t} t0={tDexa - 0.1} text="2023" label="DEXAMETASONA · MISMA EMPRESA" x={230} y={300} align="left" size={120} />
        <div style={{position: 'absolute', left: 230, top: 400, opacity: prog(t, tRal, 0.5), ...gs(46, 650, K.bone)}}>
          contaminada con <span style={{color: K.red, fontStyle: 'italic', fontFamily: F.serif, fontSize: 56}}>Ralstonia</span>
        </div>
        <Vials23 t={t} t0={tRal + 0.6} tOne={tUna - 0.2} y={620} />
        <Stamp13 t={t} t0={tNo + 0.15} text="SIN MEDIDAS" x={1440} y={330} rot={-6} size={70} dark />
      </Layer>
      <Layer t={t} a={ins5[0] + 0.9} b={D.s05 + 1.7}>
        <PaperBg />
        <DateRoll t={t} t0={t2019 - 0.1} text="2019" label="UNA INSPECCIÓN ORDENA" x={150} y={340} align="left" size={140} color={K.ink} labelColor={K.redDeep} />
        <div style={{position: 'absolute', left: 150, top: 460, opacity: prog(t, tCerrar, 0.5), ...gs(64, 760, K.ink, -0.02), lineHeight: 1.08}}>
          cerrar la planta
          <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 44, color: K.inkSoft, fontWeight: 400}}>por fallas graves en la producción</div>
        </div>
        <DocSheet t={t} t0={t2019 + 0.3} x={1060} y={560} w={520} rot={3} head="MINISTERIO DE SALUD · ANMAT" title="ORDEN DE CLAUSURA" to="Laboratorios Ramallo S.A." lines={7} seed={9} sign={1} signLabel="Firma y sello">
          <Recreation x={500} y={18} dark={false} />
        </DocSheet>
        <Padlock t={t} t0={t2019 + 0.6} tTry={tNunca - 0.5} x={1660} y={600} s={0.85} />
        <Stamp13 t={t} t0={tNunca + 0.1} text="NUNCA SE EJECUTÓ" x={1180} y={760} rot={-9} size={76} />
      </Layer>
      <BarrierHUD t={t} t0={2.0} t1={D.s05 + 2} n={t < ins5[0] + 0.3 ? 4 : 5} failedUpTo={t < ins5[0] + 0.3 ? 3 : 4} light={prog(t, ins5[0] + 0.9, 0.45)} />
      <BarrierCard t={t} t0={-CARD_LEAD.s05} dur={CARD_LEAD.s05 + 1.7} n={4} sub="las señales que ya existían" />
      <BarrierCard t={t} t0={ins5[0] - 0.15} dur={ins5[1] + 1.55} n={5} sub="la orden que ya estaba firmada" />
    </AbsoluteFill>
  );
};

/* ================================================================== S06 · LA INSPECCIÓN AVISADA */
export const S06: React.FC<{t: number}> = ({t}) => {
  const tDec = cue('s06', 'A fines de');
  const tInsp = cue('s06', 'decidió inspeccionar');
  const tVuelve = cue('s06', 'Y acá vuelve');
  const tJavier = cue('s06', 'Javier Tchukrán');
  const tMe = cue('s06', 'me comentaron');
  const tSi = cue('s06', 'sí, es una inspección');
  const tNoche = cue('s06', 'Esa noche');
  const tMas = cue('s06', 'masillar paredes');
  const tSacar = cue('s06', 'sacar la materia');
  const tCart = cue('s06', 'poner carteles');
  const tPlan = cue('s06', 'completar planillas');
  const tTirar = cue('s06', 'tirar reactivos');
  const tDia = cue('s06', 'Las inspectoras');
  const tDef = cue('s06', 'deficiencias críticas');
  const tActa = cue('s06', 'Pero el acta');
  const tDic = cue('s06', 'el dieciséis de diciembre');
  const tSeis = cue('s06', 'Seis lotes');
  const tUno = cue('s06', 'Uno de ellos');
  return (
    <AbsoluteFill>
      <ClinicBg t={t} light={0.7} />
      <Layer t={t} a={1.6} b={tVuelve + 0.3}>
        <Photo13 src="ep13/img/ramallo_centro.jpg" t={t} t0={1.6} from={{s: 1.04, x: 0, y: 0}} to={{s: 1.15, x: 20, y: 0}} dur={8} credit="Mushii · Wikimedia Commons · CC BY-SA 3.0" />
        <Kicker t={t} t0={tDec} text="Fines de 2024 · por los reportes acumulados" x={110} y={672} color={K.amber} plate />
        <Title13 t={t} t0={tInsp - 0.4} text={'La ANMAT decide\ninspeccionar Ramallo'} size={96} x={110} y={820} align="left" upper={false} g0={250} g1={760} />
      </Layer>
      <Layer t={t} a={tVuelve - 0.1} b={tNoche + 0.2}>
        <DateRoll t={t} t0={tVuelve + 0.2} text="27.11.2024" label="EL MENSAJE DEL PRINCIPIO" x={110} y={330} align="left" size={86} />
        <NameCard13 t={t} t0={tJavier - 0.1} name="Javier Tchukrán" role="HLB Pharma" x={110} y={560} size={74} statusColor={K.amber} />
        <div style={{position: 'absolute', left: 110, top: 780, opacity: prog(t, tJavier + 1.6, 0.5), ...gm(21, K.mute, 500, 0.14), lineHeight: 1.6}}>
          LE ESCRIBE A UNA FUNCIONARIA DEL <span style={{color: K.bone}}>INAME</span>,
          <br />
          EL INSTITUTO TÉCNICO DE LA <span style={{color: K.bone}}>ANMAT</span>
        </div>
        <ChatPanel
          t={t} t0={tVuelve} x={1300} y={560} w={780} h={560} scale={1.08} title="Funcionaria del INAME" sub="chat incorporado a la causa" avatar="I" date="27 de noviembre de 2024"
          msgs={[
            {side: 'out', text: 'Me comentaron que mañana van a ir a Ramallo', at: tMe},
            {side: 'in', text: 'Sí, es una inspección que deviene de reportes de productos', at: tSi},
          ]}
        />
        <Recreation />
      </Layer>
      <Layer t={t} a={tNoche - 0.1} b={tDia}>
        <div style={{position: 'absolute', left: 110, top: 300, width: 760}}>
          <Kicker t={t} t0={tNoche} text="Esa misma noche" x={0} y={0} color={K.amber} size={26} />
          <div style={{...gs(84, 800, K.bone, -0.03), marginTop: 50, opacity: prog(t, tNoche + 0.3, 0.5), lineHeight: 1.02}}>
            18 tareas
            <br />
            <span style={{color: K.amber}}>antes de la inspección</span>
          </div>
        </div>
        <Checklist18
          t={t} t0={tNoche + 0.2} tCount={tNoche + 0.4} x={980} y={220}
          items={[
            {text: 'Masillar paredes', at: tMas},
            {text: 'Sacar la materia prima rechazada', at: tSacar},
            {text: 'Carteles de «fuera de uso» en las máquinas', at: tCart},
            {text: 'Completar planillas', at: tPlan},
            {text: 'Tirar reactivos vencidos', at: tTirar},
          ]}
        />
      </Layer>
      <Layer t={t} a={tDia - 0.2} b={tSeis - 0.05}>
        <ActaSpan t={t} t0={tDia - 0.2} tDay={tDia} tOpen={tActa} tFab={tDic - 0.2} y={700} />
        <Stamp13 t={t} t0={tDef} text="DEFICIENCIAS CRÍTICAS" x={560} y={300} rot={-5} size={58} color={K.amber} dark />
      </Layer>
      <Layer t={t} a={tSeis - 0.15} b={D.s06 + 2.0}>
        <Kicker t={t} t0={tSeis - 0.1} text="La tanda de fentanilo · diciembre 2024" x={960} y={330} color={K.red} align="center" />
        <Title13 t={t} t0={tSeis} text="Seis lotes" size={110} y={440} upper={false} g0={250} g1={760} />
        <SixLots t={t} t0={tSeis - 0.1} tPick={tUno + 0.6} y={640} />
      </Layer>
      <BarrierHUD t={t} t0={2.0} t1={D.s06 + 2} n={6} failedUpTo={5} />
      <BarrierCard t={t} t0={-CARD_LEAD.s06} dur={CARD_LEAD.s06 + 1.9} n={6} sub="la visita que no fue sorpresa" />
    </AbsoluteFill>
  );
};
export {Layer};
