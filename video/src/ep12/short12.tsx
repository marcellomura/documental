/* Short vertical (1080×1920) del episodio 12 (ARA San Juan): el micrófono que escuchó al submarino, la presión y el
   colapso, la grabación real de la implosión del Titan, el hallazgo a 907 metros y el cierre al video completo
   (ver tools/short_ep12.py). Mismo sistema visual que el episodio: Archivo variable, Instrument Serif y Plex Mono. */
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Grain} from '../components/base';
import {LogoMark} from '../ep04/kit';
import short from '../data/ep12/short.json';
import words from '../data/ep12/words.json';
import wordsX from '../data/ep12/words_short.json';
import {cue as cueMain} from './lib';
import {K, F12, vf, mono, clamp, easeIn, easeInOut, prog, pop, between, fadeIO, AbyssBg, MarineSnow, Vignette, Scanlines, KTitle, SerifLine, Odo, ramp, DataCard, MonoTag, Timecode, Photo, Clip, Credit12, Rings, DepthGauge, Defs12} from './kit12';
import {Stage12, HullRing, Water, Wreck} from './three12';
import type {Cam} from './three12';
import {LiveTrace, Spectro} from './viz12';

const VW = 1080, VH = 1920;
type Part = {id: string; seg: string; from: number; to: number; at: number};
const TL = short as unknown as {fps: number; parts: Part[]; cta: number; total: number; titan: number};
type Wd = {w: string; s: number; e: number};
const WS = {...(words as Record<string, Wd[]>), ...(wordsX as Record<string, Wd[]>)};
const P = Object.fromEntries(TL.parts.map((p) => [p.id, p])) as Record<string, Part>;
const cue = (seg: string, phrase: string, n = 0) => (seg === 'x01' ? WS.x01.find((w) => w.w.toLowerCase().startsWith(phrase.toLowerCase()))!.s : cueMain(seg, phrase, n));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/* ---------- subtítulos palabra por palabra (con cifras) ---------- */
const NUMS: [string, string][] = [
  ['cuarenta y cuatro', '44'], ['dos mil diecisiete,', '2017,'], ['dos mil veintitrés,', '2023,'], ['novecientos siete', '907'],
  ['trescientos', '300'], ['cuatrocientos,', '400,'], ['quince', '15'], ['diecisiete', '17'],
];
const key = (w: string) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
const mergeNums = (ws: Wd[]) => {
  const out: Wd[] = [];
  for (let i = 0; i < ws.length; ) {
    const hit = NUMS.find(([a]) => {
      const toks = a.split(' ');
      return i + toks.length <= ws.length && toks.every((tk, k) => key(ws[i + k].w) === key(tk));
    });
    if (hit) {
      const n = hit[0].split(' ').length;
      const last = ws[i + n - 1].w;
      const punct = /[.,:;?!]$/.test(last) && !/[.,:;?!]$/.test(hit[1]) ? last.slice(-1) : '';
      out.push({w: hit[1] + punct, s: ws[i].s, e: ws[i + n - 1].e});
      i += n;
    } else out.push(ws[i++]);
  }
  return out;
};
const CHUNKS = (() => {
  const list: Wd[] = [];
  for (const p of TL.parts) for (const w of mergeNums(WS[p.seg])) if (w.s >= p.from - 0.01 && w.e <= p.to + 0.05) list.push({w: w.w, s: p.at + w.s - p.from, e: p.at + w.e - p.from});
  const out: {words: Wd[]; s: number; e: number}[] = [];
  let cur: Wd[] = [];
  list.forEach((w, i) => {
    cur.push(w);
    const txt = cur.map((x) => x.w).join(' ');
    if (cur.length >= 3 || /[.,:?!]$/.test(w.w) || txt.length > 15 || i === list.length - 1) {
      out.push({words: cur, s: cur[0].s, e: cur[cur.length - 1].e});
      cur = [];
    }
  });
  out.forEach((c, i) => (c.e = i < out.length - 1 ? Math.min(out[i + 1].s, c.e + 0.35) : c.e + 0.3));
  return out;
})();
const Captions: React.FC<{T: number; y: number}> = ({T, y}) => {
  const c = CHUNKS.find((x) => T >= x.s - 0.05 && T < x.e);
  if (!c) return null;
  const k = pop(T, c.s - 0.05, 1.4);
  const s = '#01050A';
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: y, textAlign: 'center', transform: `scale(${0.88 + 0.12 * k})`}}>
      {c.words.map((w, i) => {
        const on = T >= w.s - 0.03 && T < w.e + 0.15;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block', margin: '0 12px', fontSize: 94, lineHeight: 1.12, textTransform: 'uppercase', color: on ? K.cyan : '#fff', ...vf(84, 880),
              textShadow: `5px 5px 0 ${s}, -5px -5px 0 ${s}, 5px -5px 0 ${s}, -5px 5px 0 ${s}, 0 5px 0 ${s}, 5px 0 0 ${s}, -5px 0 0 ${s}, 0 -5px 0 ${s}, 0 16px 30px rgba(0,0,0,0.6)`,
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

/** foto vertical (recorte 9:16) con movimiento */
const VPhoto: React.FC<{src: string; t: number; t0: number; t1?: number; focus?: string; s0?: number; s1?: number; credit?: string; video?: boolean; from?: number; grade?: string}> = ({
  src, t, t0, t1 = Infinity, focus = '50% 50%', s0 = 1.05, s1 = 1.18, credit, video, from = 0, grade = 'saturate(0.75) contrast(1.12) brightness(0.9)',
}) => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const o = fadeIO(t, t0, t1, 0.35);
  if (o <= 0) return null;
  const span = t1 === Infinity ? 6 : t1 - t0;
  const sc = mix(s0, s1, easeInOut(clamp((t - t0) / span)));
  const st: React.CSSProperties = {width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, transform: `scale(${sc})`, transformOrigin: focus, filter: grade};
  return (
    <AbsoluteFill style={{opacity: o, overflow: 'hidden'}}>
      {video ? (
        <Sequence from={frame - Math.round((t - t0) * fps)} layout="none">
          <OffthreadVideo src={staticFile(src)} muted trimBefore={Math.round(from * fps)} style={st} />
        </Sequence>
      ) : (
        <Img src={staticFile(src)} style={st} />
      )}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(1,5,10,0.75) 0%, rgba(1,5,10,0.05) 30%, rgba(1,5,10,0.1) 60%, rgba(1,5,10,0.85) 100%)'}} />
      {credit ? <Credit12 text={credit} y={1880} x={40} /> : null}
    </AbsoluteFill>
  );
};

/* ---------- 1 · el micrófono ---------- */
const Gancho: React.FC<{s: number}> = ({s}) => {
  const c = (p: string, n = 0) => cue('s01', p, n);
  const tMic = c('micrófono.'), tCol = c('Está'), tBomb = c('escuchar'), tDate = c('El quince'), tReg = c('registró'), tNo = c('No era'), tEra = c('Era un'), t44 = c('cuarenta');
  return (
    <AbsoluteFill>
      {s < tMic + 0.2 ? (
        <>
          <VPhoto src="ep12/img/ha10_01.jpg" t={s} t0={-0.3} t1={tMic + 0.2} focus="40% 75%" s0={1.15} s1={1.3} credit="CTBTO · CC BY 2.0" />
          <KTitle t={s} t0={0.1} text={'UNA ISLA\nEN MEDIO\nDEL ATLÁNTICO'} size={120} x={540} y={380} maxW={1000} />
        </>
      ) : null}
      {between(s, tMic - 0.2, tBomb - 0.1) ? (
        <>
          <VPhoto src="ep12/img/hyd_01.jpg" t={s} t0={tMic - 0.2} t1={tBomb - 0.1} focus="50% 40%" s0={1.08} s1={1.25} credit="CTBTO · CC BY 2.0" />
          <KTitle t={s} t0={tMic} text={'UN\nMICRÓFONO'} size={150} x={540} y={360} maxW={1000} color={K.cyan} />
          <Rings t={s} t0={tCol} x={540} y={900} every={1.0} maxR={700} />
        </>
      ) : null}
      {between(s, tBomb - 0.3, tDate) ? (
        <>
          <VPhoto src="ep11/vid/ivy_bola.mp4" video t={s} t0={tBomb - 0.3} t1={tDate} s0={1.0} s1={1.08} grade="contrast(1.05)" credit="Ivy Mike, 1952 · Departamento de Energía de EE. UU." />
          <KTitle t={s} t0={c('bombas')} text={'PARA ESCUCHAR\nBOMBAS ATÓMICAS'} size={110} x={540} y={380} maxW={1000} />
        </>
      ) : null}
      {between(s, tDate - 0.2, tEra) ? (
        <AbsoluteFill style={{opacity: fadeIO(s, tDate - 0.2, tEra, 0.3)}}>
          <AbyssBg t={s} light={0.4} deep={0.6} />
          <Timecode t={s} t0={tDate - 0.1} text="15.11.2017" label="ESTACIÓN HA10 · ISLA ASCENSIÓN" x={540} y={420} size={130} />
          <LiveTrace t={s} t0={tDate + 0.4} spikeAt={tReg + 1.0} x={60} w={960} y={880} amp={150} label="REPRESENTACIÓN" />
          <KTitle t={s} t0={tNo} text={'NO ERA\nUNA BOMBA'} size={130} x={540} y={1180} maxW={1000} color={K.amber} />
        </AbsoluteFill>
      ) : null}
      {s >= tEra - 0.15 ? (
        <>
          <VPhoto src="ep12/img/sj_06.jpg" t={s} t0={tEra - 0.15} focus="62% 50%" s0={1.08} s1={1.2} credit="Juan Kulichevsky · CC BY-SA 2.0" />
          <KTitle t={s} t0={tEra + 0.1} text={'UN SUBMARINO\nARGENTINO'} size={118} x={540} y={330} maxW={1000} />
          <DataCard t={s} t0={t44 - 0.15} x={540} y={760} value={44} dur={0.8} label="PERSONAS A BORDO" size={260} color={K.amber} align="center" w={900} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- 2 · la presión ---------- */
const Presion: React.FC<{s: number}> = ({s}) => {
  const c = (p: string, n = 0) => cue('s06', p, n);
  const tCasco = c('El casco'), tTresc = c('trescientos'), tSeg = c('Según'), tCed = c('cedió.'), tColap = c('El colapso'), tParp = c('un parpadeo.');
  const depth = s < tSeg ? 300 * easeInOut(clamp((s - tCasco + 0.3) / (tTresc + 0.8 - tCasco))) : 300 + 88 * easeInOut(clamp((s - tSeg) / (tCed - tSeg)));
  const b = easeIn(clamp((s - tCed) / 0.45));
  const flash = s >= tCed + 0.4 ? Math.max(0, 1 - (s - tCed - 0.4) * 2.5) : 0;
  const cam: Cam = {pos: [Math.sin(s * 0.25) * 2.6 + 0.8, 1.8, 6.4], look: [0, 0, 0], fov: 46};
  return (
    <AbsoluteFill style={{background: '#02070D'}}>
      <Stage12 cam={cam} bg="#02070D" fog={['#02070D', 0.05]} w={VW} h={VH}>
        <HullRing b={b} press={clamp((depth - 280) / 108)} t={s} flash={flash} />
        <Water s={{t: s, depth: 380, rays: 0, snow: 0.8}} />
      </Stage12>
      <DepthGauge depth={depth} design={300} collapse={388} x={740} y={560} h={700} o={1 - prog(s, tCed + 0.3, 0.4)} atm={false} />
      <KTitle t={s} t0={tCasco} t1={tSeg - 0.1} text="DISEÑADO PARA ≈ 300 m" upper={false} size={84} x={540} y={300} maxW={1000} color={K.amber} />
      <KTitle t={s} t0={tSeg} t1={tColap - 0.1} text="A CASI 400 m, CEDIÓ" upper={false} size={92} x={540} y={300} maxW={1000} color={K.red} />
      <KTitle t={s} t0={tParp - 0.2} text={'MENOS QUE\nUN PARPADEO'} size={120} x={540} y={330} maxW={1000} />
      <AbsoluteFill style={{background: '#FFFFFF', opacity: flash * flash * 0.7}} />
      <Credit12 text="RECREACIÓN 3D" y={1880} x={40} />
    </AbsoluteFill>
  );
};

/* ---------- 3 · el Titan (sonido real) ---------- */
const Titan: React.FC<{s: number; T: number}> = ({s, T}) => {
  const c = (p: string, n = 0) => cue('s06', p, n);
  const tTitanic = c('Titanic.');
  const audioAt = TL.titan; // en tiempo del short
  return (
    <AbsoluteFill>
      {s < tTitanic + 0.6 ? (
        <>
          <VPhoto src="ep12/vid/titan_fondo.mp4" video t={s} t0={c('En dos') - 0.2} t1={tTitanic + 0.6} focus="55% 50%" s0={1.35} s1={1.42} grade="contrast(1.05)" credit="U.S. Coast Guard / Pelagic Research Services · dominio público" />
          <KTitle t={s} t0={c('En dos')} text={'TITAN\n2023'} size={150} x={540} y={360} maxW={1000} color={K.amber} />
          <MonoTag t={s} t0={c('Titan,') + 0.3} text="RESTOS A ≈ 3.800 m" x={540 - 220} y={620} />
        </>
      ) : null}
      {s >= tTitanic + 0.4 ? (
        <AbsoluteFill style={{opacity: prog(s, tTitanic + 0.4, 0.3), background: '#01040A'}}>
          <KTitle t={s} t0={tTitanic + 0.5} text={'EL SONIDO\nREAL'} size={150} x={540} y={380} maxW={1000} color={K.cyan} />
          <Spectro t={T} t0={audioAt} dur={14.4} x={60} y={820} w={960} h={420} />
          <MonoTag t={s} t0={tTitanic + 0.8} text="HIDRÓFONO DE LA NOAA · 18.06.2023" x={540 - 330} y={1330} color={K.amber} size={22} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- 4 · el hallazgo ---------- */
const Hallazgo: React.FC<{s: number}> = ({s}) => {
  const c = (p: string, n = 0) => cue('s08', p, n);
  const tDoce = c('A las doce'), tAno = c('un año'), tARA = c('El ARA'), t907 = c('novecientos');
  const k = easeInOut(clamp((s - tDoce) / (P.hallazgo.to - tDoce)));
  const cam: Cam = {pos: [mix(7, 2.4, k), mix(2.4, 1.0, k), mix(10, 4.6, k)], look: [mix(0, -0.5, k), -0.35, 0], fov: 52};
  const dist2 = (cam.pos[0] - cam.look[0]) ** 2 + (cam.pos[1] - cam.look[1]) ** 2 + (cam.pos[2] - cam.look[2]) ** 2;
  return (
    <AbsoluteFill style={{background: '#010407'}}>
      <Stage12 cam={cam} bg="#010407" fog={['#010407', 0.075]} w={VW} h={VH}>
        <ambientLight intensity={0.14} color="#9FC8E0" />
        <Wreck t={s} />
        <spotLight position={[cam.pos[0], cam.pos[1] + 0.3, cam.pos[2]]} intensity={5.5 * dist2 * (0.5 + 0.5 * prog(s, tARA - 0.5, 1))} distance={40} angle={0.5} penumbra={0.7} color="#E6F5FF">
          <object3D attach="target" position={cam.look} />
        </spotLight>
        <Water s={{t: s, depth: 907, rays: 0, snow: 1.4}} center={cam.look} />
      </Stage12>
      <Scanlines o={0.1} />
      <Timecode t={s} t0={tDoce} t1={tARA} text="17.11.2018" label="00:30 · MADRUGADA" x={540} y={330} size={120} />
      <KTitle t={s} t0={tAno - 0.1} t1={tARA} text={'UN AÑO\nY DOS DÍAS\nDESPUÉS'} size={110} x={540} y={640} maxW={1000} color={K.amber} />
      <KTitle t={s} t0={t907 - 0.1} text={'907\nMETROS'} size={170} x={540} y={420} maxW={1000} />
      <Credit12 text="RECREACIÓN 3D" y={1880} x={40} />
    </AbsoluteFill>
  );
};

/* ---------- 5 · cierre ---------- */
const Cta: React.FC<{T: number; t0: number}> = ({T, t0}) => {
  const t = T - t0;
  const bob = Math.sin(t * 5) * 14;
  return (
    <AbsoluteFill>
      <AbyssBg t={t} light={0.3} deep={0.7} />
      <Rings t={t} t0={0.1} x={540} y={620} every={1.4} maxR={800} color={K.cyan} o={0.5} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', transform: `scale(${pop(t, 0.1, 1)})`}}>
        <div style={{width: 820, padding: '40px 44px', background: 'rgba(1,6,12,0.85)', border: `1px solid ${K.line}`, borderRadius: 24, boxShadow: '0 40px 90px rgba(0,0,0,0.6)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 28}}>
            <LogoMark size={150} t={t} t0={0.1} />
            <div>
              <div style={{...mono(22, K.cyan, 600), letterSpacing: '0.24em'}}>VIDEO COMPLETO</div>
              <div style={{fontSize: 92, color: K.bone, lineHeight: 0.95, ...vf(80, 880)}}>907 METROS</div>
              <div style={{fontFamily: F12.serif, fontStyle: 'italic', fontSize: 40, color: K.mute}}>Qué le pasó al ARA San Juan</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', opacity: prog(t, cue('x01', 'Tocá') - 0.2 - 0, 0.3)}}>
        <div style={{display: 'inline-block', background: K.cyan, color: K.abyss, fontSize: 66, padding: '16px 40px 10px', borderRadius: 14, ...vf(84, 880)}}>TOCÁ EL ENLACE DE ABAJO</div>
        <div style={{fontSize: 200, color: K.cyan, lineHeight: 1, transform: `translateY(${bob}px)`, marginTop: 10, ...vf(100, 800)}}>↓</div>
      </div>
    </AbsoluteFill>
  );
};

export const ShortSanJuan: React.FC = () => {
  const frame = useCurrentFrame();
  const T = frame / TL.fps;
  const segT = (id: string) => T - P[id].at + P[id].from;
  const nextAt = (i: number) => (i + 1 < TL.parts.length ? TL.parts[i + 1].at : TL.total + 1);
  return (
    <AbsoluteFill style={{background: K.abyss}}>
      <Defs12 />
      {TL.parts.map((p, i) => {
        const a = p.at - 0.25, b = nextAt(i) - 0.1;
        if (T < a || T >= b) return null;
        const s = segT(p.id);
        const enter = i ? prog(T, a, 0.35) : 1;
        return (
          <AbsoluteFill key={p.id} style={{clipPath: i ? `circle(${enter * 1200}px at 50% 50%)` : undefined}}>
            {p.id === 'gancho' ? <Gancho s={s} /> : p.id === 'presion' ? <Presion s={s} /> : p.id === 'titan' ? <Titan s={s} T={T} /> : p.id === 'hallazgo' ? <Hallazgo s={s} /> : <Cta T={T} t0={p.at} />}
          </AbsoluteFill>
        );
      })}
      <Vignette k={0.4} />
      {T < TL.cta - 0.1 ? <Captions T={T} y={1440} /> : null}
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};
export const SHORT12_TOTAL = TL.total;
