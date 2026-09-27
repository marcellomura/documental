/* Short vertical "¿Por qué ver a Messi cuesta $3 MILLONES?" (1080x1920, 1:27) para Shorts, Reels y TikTok.
   Misma noche de estadio que el video largo, subtítulos karaoke en el centro (fuera de la interfaz de las apps)
   y placa final que manda al video completo. Todo lo importante vive entre y=250 y y=1450. */
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import timeline from '../data/msv/timeline.json';
import words from '../data/msv/words.json';
import {
  M, FONT, FPS, img, clamp, easeIn, easeInOut, easeOut, pop, prog, rnd, makeCue, Word, Photo, B, At, Gold, Pill, Slam, Stamp, Num, Kicker, Ticket, Browser, Phone, Person, Bot, Glass, Cam, Stripes, Words,
} from '../msi/kit';
import {buildChunks} from '../reels/kit';

const W = 1080;
const H = 1920;
type TLV = {fps: number; segs: Record<string, {at: number; dur: number}>; endCard: number; total: number};
export const TLS = timeline as TLV;
const WS = words as Record<string, Word[]>;
const {c, at} = makeCue(TLS, WS);
/** un pelito antes de la palabra que motiva el corte */
const k = (seg: string, ph: string, pre = 0.12, n = 0) => c(seg, ph, n) - pre;

const CR = {
  bb: 'Foto: Bryan Berlin · CC BY-SA 4.0',
  river: 'Foto: Danirepe · CC BY-SA 3.0',
  mon: 'Foto: Dibumartinez23 · CC0',
  pano2: 'Foto: Innoverdrive · CC BY-SA 4.0',
  fest: 'Foto: Iro Bosero · CC BY-SA 4.0',
  kah: 'Foto: nrkbeta · CC BY-SA 2.0',
  oasis: 'Foto: Raph_PH · CC BY 4.0',
  ba: 'Foto: ProtoplasmaKid · CC BY-SA 4.0',
  ia: 'Recreación ilustrativa hecha con IA',
};

/* ---------- fondo: noche de estadio en vertical ---------- */
const Beam: React.FC<{x: number; ang: number; o: number; w?: number}> = ({x, ang, o, w = 380}) => (
  <div
    style={{
      position: 'absolute', left: x - w / 2, top: -140, width: w, height: 2300, transformOrigin: '50% 0%', transform: `rotate(${ang}deg)`,
      background: `linear-gradient(180deg, rgba(200,225,255,${o}) 0%, rgba(200,225,255,${o * 0.35}) 45%, rgba(200,225,255,0) 100%)`,
      clipPath: 'polygon(46% 0, 54% 0, 100% 100%, 0 100%)',
    }}
  />
);

const Motes: React.FC<{t: number; n?: number}> = ({t, n = 30}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    {Array.from({length: n}).map((_, i) => {
      const sp = 12 + rnd(i * 3.1) * 34;
      const x = (rnd(i) * W + Math.sin(t * 0.3 + i) * 40 + 4000) % W;
      const y = (((rnd(i * 7.7) * H - t * sp) % H) + H) % H;
      const s = 2 + rnd(i * 1.7) * 5;
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.6 + rnd(i) * 1.4) + i));
      return <div key={i} style={{position: 'absolute', left: x - s * 2, top: y - s * 2, width: s * 5, height: s * 5, borderRadius: '50%', background: `radial-gradient(circle, ${M.celesteHi} 0%, ${M.celesteHi} 18%, rgba(255,255,255,0) 60%)`, opacity: 0.45 * tw}} />;
    })}
  </AbsoluteFill>
);

const NightV: React.FC<{t: number; glow?: string; children?: React.ReactNode}> = ({t, glow = 'rgba(116,185,240,0.24)', children}) => {
  const gx = 540 + Math.sin(t * 0.21) * 260, gy = 640 + Math.cos(t * 0.17) * 220;
  const sw = Math.sin(t * 0.35);
  return (
    <AbsoluteFill style={{background: M.night, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 42% at ${gx}px ${gy}px, ${glow} 0%, rgba(0,0,0,0) 70%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 75% 32% at ${1080 - gx * 0.6}px ${1500 - gy * 0.2}px, rgba(47,121,194,0.2) 0%, rgba(0,0,0,0) 70%)`}} />
      <Beam x={-40} ang={-26 + sw * 5} o={0.22} />
      <Beam x={1120} ang={26 - sw * 5} o={0.22} />
      <Beam x={380} ang={-8 + Math.sin(t * 0.5 + 1) * 4} o={0.1} w={260} />
      <Beam x={700} ang={8 + Math.sin(t * 0.43 + 2) * 4} o={0.1} w={260} />
      <AbsoluteFill
        style={{
          opacity: 0.5, backgroundImage: 'radial-gradient(rgba(170,205,255,0.22) 1.6px, transparent 1.8px)', backgroundSize: '44px 44px',
          backgroundPosition: `${(t * 6) % 44}px ${(t * 3) % 44}px`,
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 45%, black 30%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 45%, black 30%, transparent 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute', left: -500, right: -500, bottom: -160, height: 820, opacity: 0.45,
          backgroundImage: `linear-gradient(${M.line} 1.5px, transparent 1.5px), linear-gradient(90deg, ${M.line} 1.5px, transparent 1.5px)`,
          backgroundSize: '110px 110px', backgroundPosition: `0 ${(t * 26) % 110}px`,
          transform: 'perspective(900px) rotateX(66deg)', transformOrigin: '50% 0%',
          maskImage: 'linear-gradient(180deg, transparent 0%, black 50%)', WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 50%)',
        }}
      />
      <Motes t={t} />
      {children}
      <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse 95% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)'}} />
    </AbsoluteFill>
  );
};

/** crédito de foto arriba a la derecha (abajo lo tapa la interfaz de las apps) */
const Cr: React.FC<{text: string; y?: number}> = ({text, y = 228}) => (
  <div style={{position: 'absolute', right: 48, top: y, fontFamily: FONT.body, fontSize: 19, fontWeight: 600, color: 'rgba(255,255,255,0.72)', letterSpacing: 0.5, textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>{text}</div>
);
const Fuente: React.FC<{t: number; t0: number; text: string; y?: number}> = ({t, t0, text, y = 1120}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: prog(t, t0, 0.5), fontFamily: FONT.body, fontWeight: 700, fontSize: 21, letterSpacing: 1.5, color: 'rgba(235,242,255,0.7)', textTransform: 'uppercase', textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
    Fuente: {text}
  </div>
);
/** fila centrada horizontalmente en y */
const Row: React.FC<{y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({y, children, style}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', ...style}}>{children}</div>
);

/* ---------- transiciones verticales ---------- */
type TK = 'flash' | 'whip' | 'stripes' | 'iris' | 'glitch';
const TD: Record<TK, number> = {flash: 0.34, whip: 0.44, stripes: 0.66, iris: 0.64, glitch: 0.36};
const Transition: React.FC<{t: number; at: number; kind: TK}> = ({t, at: a, kind}) => {
  const D = TD[kind];
  const q = (t - (a - D / 2)) / D;
  if (q <= 0 || q >= 1) return null;
  const tri = q < 0.5 ? easeOut(q * 2) : 1 - easeIn((q - 0.5) * 2);
  if (kind === 'flash') return <AbsoluteFill style={{background: '#F4FAFF', opacity: tri * 0.95}} />;
  if (kind === 'glitch') {
    const f = Math.floor(t * 30);
    return (
      <AbsoluteFill>
        {Array.from({length: 12}).map((_, i) => {
          const r = rnd(f * 13 + i);
          return <div key={i} style={{position: 'absolute', left: (r - 0.5) * 200, top: rnd(f * 7 + i * 3) * H, width: W, height: 10 + r * 90, background: i % 3 === 0 ? M.celeste : i % 3 === 1 ? M.red : 'rgba(255,255,255,0.85)', opacity: 0.65}} />;
        })}
      </AbsoluteFill>
    );
  }
  if (kind === 'whip') {
    const y = (q * 2 - 1) * H * 1.3;
    return (
      <AbsoluteFill style={{overflow: 'hidden'}}>
        {Array.from({length: 12}).map((_, i) => (
          <div key={i} style={{position: 'absolute', top: -y - 1200 + rnd(i) * 600, left: (W / 12) * i, height: 2000 + rnd(i * 3) * 1000, width: W / 12 + 1, background: `linear-gradient(180deg, rgba(0,0,0,0), ${i % 4 === 0 ? M.celeste : M.night} 30%, ${M.night} 70%, rgba(0,0,0,0))`}} />
        ))}
      </AbsoluteFill>
    );
  }
  if (kind === 'stripes') {
    const n = 7;
    return (
      <AbsoluteFill style={{overflow: 'hidden'}}>
        {Array.from({length: n}).map((_, i) => {
          const kk = clamp(q * 1.45 - (i / n) * 0.45);
          const y = kk < 0.5 ? (1 - easeOut(kk * 2)) * 110 : -easeIn((kk - 0.5) * 2) * 110;
          return <div key={i} style={{position: 'absolute', left: (W / n) * i - 1, width: W / n + 2, top: 0, height: H, background: i % 2 ? M.white : M.celeste, transform: `translateY(${y}%)`}} />;
        })}
      </AbsoluteFill>
    );
  }
  const r = easeInOut(clamp(q * 1.7)) * 2400;
  const r2 = easeInOut(clamp(q * 1.7 - 0.14)) * 2400;
  return (
    <AbsoluteFill style={{opacity: 1 - clamp((q - 0.6) / 0.4)}}>
      <AbsoluteFill style={{background: M.celeste, clipPath: `circle(${r}px at 540px 700px)`}} />
      <AbsoluteFill style={{background: M.night, clipPath: `circle(${r2}px at 540px 700px)`}} />
    </AbsoluteFill>
  );
};

/* ---------- subtítulos karaoke ---------- */
const NUMS: [string, string][] = [
  ['Noventa mil pesos', '$90.000'], ['seiscientos ochenta y ocho mil', '$688.000'], ['tres millones', '$3 millones'], ['Seis', '6'], ['cuatro', '4'], ['dos horas', '2 horas'],
  ['Ochenta y cinco mil', '85.000'], ['mil novecientos ochenta y seis', '1986'], ['ochenta y dos por ciento', '82%'], ['diez', '10'], ['deportick punto net', 'deportick.net'],
  ['dos millones de dólares', 'US$2 millones'],
];
const CHUNKS = buildChunks({...TLS, endCard: TLS.endCard}, WS, NUMS);
const OUTLINE = [0, 45, 90, 135, 180, 225, 270, 315].map((a) => `${(Math.cos((a * Math.PI) / 180) * 5).toFixed(1)}px ${(Math.sin((a * Math.PI) / 180) * 5).toFixed(1)}px 0 #050A17`).join(',') + ', 0 14px 24px rgba(0,0,0,0.5)';
const Caps: React.FC<{t: number; y?: number}> = ({t, y = 1215}) => {
  const ch = CHUNKS.find((x) => t >= x.s - 0.05 && t < x.e);
  if (!ch) return null;
  const kk = clamp(pop(t, ch.s - 0.05, 1.5));
  const cur = ch.words.reduce((a, x, j) => (t >= x.s - 0.03 ? j : a), -1);
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: y, textAlign: 'center'}}>
      <div style={{transform: `translateY(${(1 - kk) * 26}px) scale(${0.9 + 0.1 * kk})`, transformOrigin: '50% 100%'}}>
        {ch.words.map((w, i) => {
          const on = i === cur;
          return (
            <span key={i} style={{position: 'relative', display: 'inline-block', margin: '0 9px'}}>
              {on ? <span style={{position: 'absolute', left: -12, right: -12, top: 8, bottom: 0, background: M.gold, borderRadius: 14, transform: `rotate(-2deg) scale(${0.92 + 0.08 * clamp(pop(t, w.s - 0.03, 2))})`, boxShadow: '0 10px 24px rgba(0,0,0,0.45)'}} /> : null}
              <span style={{position: 'relative', fontFamily: FONT.head, fontSize: 86, lineHeight: 1.22, textTransform: 'uppercase', color: on ? M.ink : M.white, textShadow: on ? 'none' : OUTLINE}}>
                {w.w.replace(/[«»]/g, '')}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** dorado como el del video largo, con aire arriba para las tildes (Ú, Á) */
const GoldV: React.FC<{children: React.ReactNode; size: number; t: number}> = ({children, size, t}) => {
  const sh = ((t * 45) % 300) - 100;
  const base: React.CSSProperties = {fontFamily: FONT.head, fontSize: size, lineHeight: 1.18, whiteSpace: 'nowrap', paddingTop: size * 0.06};
  return (
    <div style={{position: 'relative'}}>
      <div aria-hidden style={{...base, position: 'absolute', left: 0, top: Math.max(2, size * 0.025), color: '#5E3D06', textShadow: '0 10px 28px rgba(0,0,0,0.55), 0 0 30px rgba(255,200,61,0.3)'}}>{children}</div>
      <div style={{...base, position: 'relative', backgroundImage: `linear-gradient(100deg, rgba(255,255,255,0) ${sh - 22}%, rgba(255,255,255,0.8) ${sh}%, rgba(255,255,255,0) ${sh + 22}%), linear-gradient(180deg, ${M.goldHi} 0%, ${M.gold} 52%, #D08A12 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{children}</div>
    </div>
  );
};

/* =====================================================================
   ESCENAS
   ===================================================================== */
type SP = {T: number; t0: number};

/** gancho: $90.000 sobre Messi */
const H1: React.FC<SP> = ({T}) => (
  <AbsoluteFill>
    <Photo src="egy245.jpg" t={T} t0={0} span={7} zoom={[1.04, 1.14]} focus="47% 30%" dim={0.22} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,10,23,0) 45%, rgba(5,10,23,0.85) 62%, rgba(5,10,23,0.55) 100%)'}} />
    <Cam t={T} punches={[0.35]}>
      <Row y={830}><Kicker t={T} t0={2.4} color={M.celesteHi} size={30}>La más barata · Popular</Kicker></Row>
      <Row y={890}><Slam t={T} t0={0.3} size={250} color={M.white}>$90.000</Slam></Row>
    </Cam>
    <Cr text={CR.bb} />
  </AbsoluteFill>
);

/** la misma entrada, publicada en la reventa */
const H2: React.FC<SP> = ({T, t0}) => {
  const s = c('s01', 'seiscientos');
  return (
    <NightV t={T} glow="rgba(255,59,78,0.2)">
      <Cam t={T} punches={[s]}>
        <Row y={300}><Kicker t={T} t0={t0 + 0.1} color={M.red} size={30}>Un día después · Reventa</Kicker></Row>
        <At x={540} y={700} center><Ticket t={T} t0={t0 + 0.05} w={900} strikeAt={c('s01', 'se publicaba')} resale="$688.159" resaleAt={s} rot={-4} /></At>
      </Cam>
    </NightV>
  );
};

/** y las mejores, a más de $3 millones */
const H3: React.FC<SP> = ({T, t0}) => {
  const s = c('s01', 'tres millones.');
  return (
    <AbsoluteFill>
      <Photo src="mon_pano2.jpg" t={T} t0={t0} span={4} zoom={[1.15, 1.3]} focus="50% 50%" dim={0.5} />
      <Cam t={T} punches={[s]}>
        <Row y={330}><Kicker t={T} t0={t0 + 0.1} color={M.goldHi} size={30}>Las mejores ubicaciones</Kicker></Row>
        <Row y={450}><B t={T} t0={c('s01', 'a más de') - 0.05} kind="up"><div style={{fontFamily: FONT.head, fontSize: 90, color: M.white, letterSpacing: 2}}>MÁS DE</div></B></Row>
        <Row y={560}><B t={T} t0={s - 0.05} kind="pop"><Gold t={T} size={168}>$3 MILLONES</Gold></B></Row>
      </Cam>
      <Cr text={CR.pano2} />
    </AbsoluteFill>
  );
};

/** ¿quién se queda con esa plata? */
const H4: React.FC<SP> = ({T, t0}) => (
  <NightV t={T} glow="rgba(255,200,61,0.2)">
    <Cam t={T} punches={[c('s01', 'plata?')]}>
      <At x={540} y={640} center w={1000}>
        <Words t={T} t0={t0 + 0.1} step={0.12} kind="slam" center text="¿QUIÉN SE QUEDA CON ESA PLATA?" hi={['PLATA?']} hiColor={M.gold} style={{fontFamily: FONT.head, fontSize: 150, lineHeight: 1.02, color: M.white, textAlign: 'center'}} />
      </At>
    </Cam>
  </NightV>
);

/** 6 de octubre, Monumental */
const S2a: React.FC<SP> = ({T, t0}) => (
  <AbsoluteFill>
    <Photo src="river_avion.jpg" t={T} t0={t0} span={3} zoom={[1.25, 1.4]} focus="30% 45%" dim={0.35} />
    <Cam t={T} punches={[c('s02', 'Monumental:')]}>
      <Row y={320}><Kicker t={T} t0={t0 + 0.1} color={M.celesteHi} size={32}>Martes 6 de octubre</Kicker></Row>
      <Row y={410}><Slam t={T} t0={c('s02', 'Monumental:') - 0.05} size={170}>MONUMENTAL</Slam></Row>
      <Row y={620}><B t={T} t0={c('s02', 'Monumental:') + 0.35} kind="pop"><Pill bg={M.white} fg={M.ink} size={42}>ARGENTINA vs BENÍN</Pill></B></Row>
    </Cam>
    <Cr text={CR.river} />
  </AbsoluteFill>
);

/** el último partido */
const S2b: React.FC<SP> = ({T, t0}) => (
  <AbsoluteFill>
    <Photo src="egy226.jpg" t={T} t0={t0} span={3} zoom={[1.02, 1.1]} focus="24% 35%" dim={0.3} />
    <Cam t={T} punches={[c('s02', 'último')]}>
      <Row y={300}><B t={T} t0={c('s02', 'último') - 0.05} kind="pop"><GoldV t={T} size={190}>EL ÚLTIMO</GoldV></B></Row>
      <Row y={510}><B t={T} t0={c('s02', 'Selección.') - 0.1} kind="up"><Pill bg={M.celeste} fg={M.ink} size={36}>PARTIDO 208 DE MESSI CON LA SELECCIÓN</Pill></B></Row>
    </Cam>
    <Cr text={CR.bb} />
  </AbsoluteFill>
);

/** 4 por cuenta y agotadas en menos de 2 horas */
const S2c: React.FC<SP> = ({T, t0}) => {
  const q = c('s02', 'Cuatro');
  const fila = c('s02', 'menos');
  const ago = c('s02', 'ninguna.');
  const pf = clamp((T - fila) / (ago - fila));
  return (
    <NightV t={T}>
      <Cam t={T} punches={[ago]}>
        <At x={540} y={700} center>
          <B t={T} t0={t0 + 0.02} kind="up" din={0.45}>
            <Phone w={460}>
              <div style={{height: 118, background: '#0B1B3A', display: 'flex', alignItems: 'flex-end', padding: '0 26px 16px', fontFamily: FONT.body, fontWeight: 800, fontSize: 24, color: M.white}}>deportick.com</div>
              <div style={{padding: '26px 26px'}}>
                <div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 16, letterSpacing: 3, color: M.celesteDeep}}>SELECCIÓN ARGENTINA</div>
                <div style={{fontFamily: FONT.head, fontSize: 46, color: M.ink, lineHeight: 1.05, marginTop: 6}}>ARGENTINA vs BENÍN</div>
                <div style={{fontFamily: FONT.mono, fontWeight: 700, fontSize: 16, color: '#4B5263', marginTop: 6}}>MAR 06.10 · MONUMENTAL</div>
                <div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 19, letterSpacing: 2, color: M.ink2, marginTop: 34}}>MÁXIMO POR CUENTA</div>
                <div style={{display: 'flex', gap: 12, marginTop: 12}}>
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} style={{width: 72, height: 46, borderRadius: 8, overflow: 'hidden', position: 'relative', transform: `scale(${clamp(pop(T, q + 0.12 * i, 1.2))})`, boxShadow: '0 6px 14px rgba(0,0,0,0.2)'}}>
                      <Stripes w={72} h={46} n={5} />
                    </div>
                  ))}
                </div>
                <div style={{marginTop: 40, opacity: prog(T, fila - 0.1, 0.4)}}>
                  <div style={{fontFamily: FONT.body, fontWeight: 900, fontSize: 24, color: M.ink}}>Estás en la fila virtual</div>
                  <div style={{marginTop: 14, height: 18, borderRadius: 9, background: '#DCE3EE', overflow: 'hidden'}}>
                    <div style={{width: `${8 + pf * 84}%`, height: '100%', background: `linear-gradient(90deg, ${M.celesteDeep}, ${M.celeste})`}} />
                  </div>
                  <div style={{fontFamily: FONT.body, fontWeight: 600, fontSize: 18, color: '#4B5263', marginTop: 12}}>Tiempo estimado: más de 1 hora</div>
                </div>
              </div>
            </Phone>
          </B>
        </At>
        <At x={540} y={640} center><Stamp t={T} t0={ago - 0.05} text="AGOTADO" size={150} rot={-10} bg="rgba(5,10,23,0.55)" /></At>
      </Cam>
    </NightV>
  );
};

/** 85.000 lugares */
const S3a: React.FC<SP> = ({T, t0}) => (
  <AbsoluteFill>
    <Photo src="mon_cc0.jpg" t={T} t0={t0} span={3} zoom={[1.1, 1.22]} focus="50% 50%" dim={0.42} />
    <Cam t={T}>
      <Row y={380}><B t={T} t0={t0 + 0.05} kind="pop"><div style={{fontFamily: FONT.head, fontSize: 230, color: M.white, lineHeight: 1, textShadow: '0 12px 40px rgba(0,0,0,0.6)'}}><Num t={T} t0={t0 + 0.05} dur={1.0} to={85000} /></div></B></Row>
      <Row y={640}><B t={T} t0={c('s03', 'lugares') - 0.05} kind="up"><Pill bg={M.celeste} fg={M.ink} size={48}>LUGARES</Pill></B></Row>
    </Cam>
    <Cr text={CR.mon} />
  </AbsoluteFill>
);

/** para todo un país */
const S3b: React.FC<SP> = ({T, t0}) => (
  <AbsoluteFill>
    <Photo src="fest06.jpg" t={T} t0={t0} span={3} zoom={[1.05, 1.16]} focus="50% 40%" dim={0.4} />
    <Cam t={T} punches={[c('s03', 'país.')]}>
      <Row y={360}><Kicker t={T} t0={t0 + 0.1} color={M.goldHi} size={30}>Para un país de</Kicker></Row>
      <Row y={450}><B t={T} t0={c('s03', 'todo') - 0.05} kind="pop"><Gold t={T} size={170}>46 MILLONES</Gold></B></Row>
    </Cam>
    <Cr text={CR.fest} />
  </AbsoluteFill>
);

/** oferta rígida: precio oficial vs lo que la gente pagaría, y el revendedor en el medio */
const S3c: React.FC<SP> = ({T, t0}) => {
  const b1 = c('s03', 'el precio'), b2 = c('s03', 'debajo'), rv = c('s03', 'aparece'), cb = c('s03', 'compra barato'), vc = c('s03', 'vender caro.');
  const base = 1090;
  const h1 = 150 * easeOut(clamp((T - b1) / 0.6));
  const h2 = 540 * easeOut(clamp((T - b2) / 0.9));
  const gap = prog(T, rv, 0.5);
  const es = c('s03', 'escaso');
  return (
    <NightV t={T}>
      <Cam t={T} punches={[rv]}>
        <Row y={290}><Kicker t={T} t0={t0 + 0.1} color={M.celesteHi} size={28}>Oferta fija: 85.000 lugares</Kicker></Row>
        <Row y={560} style={{opacity: 1 - prog(T, b1 - 0.15, 0.3)}}><Slam t={T} t0={es - 0.05} size={210} color={M.red}>ESCASO</Slam></Row>
        {/* barras */}
        <div style={{position: 'absolute', left: 150, width: 260, top: base - h1, height: h1, background: `linear-gradient(180deg, ${M.celeste}, ${M.celesteDeep})`, borderRadius: '14px 14px 0 0'}} />
        <div style={{position: 'absolute', left: 670, width: 260, top: base - h2, height: h2, background: `linear-gradient(180deg, ${M.goldHi}, #D08A12)`, borderRadius: '14px 14px 0 0'}} />
        <div style={{position: 'absolute', left: 90, right: 90, top: base, height: 6, background: 'rgba(255,255,255,0.5)', borderRadius: 3}} />
        <div style={{position: 'absolute', left: 110, width: 340, top: base - h1 - 150, textAlign: 'center', opacity: prog(T, b1 + 0.2, 0.4)}}>
          <div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 24, letterSpacing: 2, color: M.celesteHi}}>PRECIO OFICIAL</div>
          <div style={{fontFamily: FONT.head, fontSize: 76, color: M.white}}>$90.000</div>
        </div>
        <div style={{position: 'absolute', left: 620, width: 360, top: base - h2 - 150, textAlign: 'center', opacity: prog(T, b2 + 0.4, 0.4)}}>
          <div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 24, letterSpacing: 2, color: M.goldHi}}>LO QUE PAGARÍAN</div>
          <div style={{fontFamily: FONT.head, fontSize: 76, color: M.white}}>¿$688.000?</div>
        </div>
        {/* la diferencia */}
        <div style={{position: 'absolute', left: 430, width: 220, top: base - 540, height: 390, opacity: gap, border: `5px dashed ${M.red}`, borderRadius: 18, background: 'rgba(255,59,78,0.12)'}} />
        <div style={{position: 'absolute', left: 430, width: 220, top: base - 540 + 50, textAlign: 'center', opacity: gap}}>
          <div style={{display: 'inline-block', transform: `scale(${clamp(pop(T, rv, 1.2))})`}}><Person w={70} color={M.red} /></div>
          <div style={{fontFamily: FONT.head, fontSize: 40, color: M.red, marginTop: 8, lineHeight: 1}}>REVEN&shy;DEDOR</div>
        </div>
        <Row y={base + 30}>
          <div style={{display: 'flex', gap: 40}}>
            <B t={T} t0={cb - 0.05} kind="pop"><Pill bg={M.celeste} fg={M.ink} size={34}>COMPRA BARATO</Pill></B>
            <B t={T} t0={vc - 0.05} kind="pop"><Pill bg={M.gold} fg={M.ink} size={34}>VENDE CARO</Pill></B>
          </div>
        </Row>
      </Cam>
    </NightV>
  );
};

/** ¿quién cobra la diferencia? */
const Tick: React.FC<{ok?: boolean}> = ({ok}) => (
  <svg width={86} height={86} viewBox="0 0 80 80">
    <circle cx="40" cy="40" r="36" fill={ok ? M.green : M.red} />
    {ok ? <path d="M22 41 L35 54 L59 28" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M26 26 L54 54 M54 26 L26 54" stroke="#fff" strokeWidth="9" strokeLinecap="round" />}
  </svg>
);
const S3d: React.FC<SP> = ({T, t0}) => {
  const rows: [string, number, boolean][] = [['LA AFA', c('s03', 'la AFA,'), false], ['MESSI', c('s03', 'ni Messi:'), false], ['EL REVENDEDOR', c('s03', 'el revendedor.'), true]];
  return (
    <NightV t={T} glow="rgba(255,200,61,0.18)">
      <Cam t={T} punches={[rows[2][1]]}>
        <Row y={290}><Kicker t={T} t0={t0 + 0.1} color={M.goldHi} size={28}>¿Quién cobra la diferencia?</Kicker></Row>
        {rows.map(([name, tt, ok], i) => (
          <div key={name} style={{position: 'absolute', left: 110, width: 860, top: 400 + i * 225}}>
            <B t={T} t0={tt - 0.1} kind="left">
              <Glass w={860} style={{padding: '30px 44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: ok ? `3px solid ${M.gold}` : undefined}}>
                {ok ? <Gold t={T} size={84}>{name}</Gold> : <div style={{fontFamily: FONT.head, fontSize: 84, color: M.white, lineHeight: 1}}>{name}</div>}
                <div style={{transform: `scale(${clamp(pop(T, tt + 0.1, 1.2))})`}}><Tick ok={ok} /></div>
              </Glass>
            </B>
          </div>
        ))}
      </Cam>
    </NightV>
  );
};

/** ¿por qué no más cara? */
const S4a: React.FC<SP> = ({T, t0}) => (
  <NightV t={T}>
    <Cam t={T} punches={[c('s04', 'horrible.')]}>
      <At x={540} y={560} center w={1000}>
        <Words t={T} t0={t0 + 0.1} step={0.1} kind="slam" center text="¿POR QUÉ NO LA COBRARON MÁS CARA?" hi={['CARA?']} hiColor={M.gold} style={{fontFamily: FONT.head, fontSize: 132, lineHeight: 1.02, color: M.white, textAlign: 'center'}} />
      </At>
      <At x={540} y={930} center><Stamp t={T} t0={c('s04', 'horrible.') - 0.05} text="QUEDA HORRIBLE" size={104} rot={-6} bg="rgba(5,10,23,0.6)" /></At>
    </Cam>
  </NightV>
);

/** el experimento de las palas */
const S4b: React.FC<SP> = ({T, t0}) => {
  const p = c('s04', 'ochenta y dos'), pal = c('s04', 'palas'), inj = c('s04', 'injusto.');
  return (
    <AbsoluteFill>
      <Photo src="vid/ferreteria.mp4" video t={T} t0={t0} span={10} zoom={[1.0, 1.06]} focus="50% 50%" dim={0.55} rate={0.48} />
      <Cam t={T} punches={[p, inj]}>
        <div style={{position: 'absolute', left: 90, right: 90, top: 290}}>
          <B t={T} t0={t0 + 0.05} kind="left">
            <Glass style={{padding: '22px 26px', display: 'flex', alignItems: 'center', gap: 26}}>
              <Img src={img('kahneman.jpg')} style={{width: 132, height: 132, borderRadius: 66, objectFit: 'cover', objectPosition: '40% 30%', border: `4px solid ${M.celeste}`}} />
              <div>
                <div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 22, letterSpacing: 3, color: M.celesteHi}}>EXPERIMENTO · 1986</div>
                <div style={{fontFamily: FONT.head, fontSize: 52, color: M.white, lineHeight: 1.05}}>KAHNEMAN, KNETSCH Y THALER</div>
                <div style={{fontFamily: FONT.body, fontSize: 16, color: 'rgba(255,255,255,0.6)', marginTop: 6}}>{CR.kah}</div>
              </div>
            </Glass>
          </B>
        </div>
        <Row y={560}><B t={T} t0={p - 0.05} kind="pop"><Gold t={T} size={260}><Num t={T} t0={p - 0.05} dur={0.9} to={82} suf="%" /></Gold></B></Row>
        <Row y={850}><B t={T} t0={pal - 0.1} kind="up"><Pill bg={M.white} fg={M.ink} size={34}>PALA PARA NIEVE: DE US$15 A US$20</Pill></B></Row>
        <At x={540} y={1030} center><Stamp t={T} t0={inj - 0.05} text="INJUSTO" size={120} rot={-8} bg="rgba(5,10,23,0.6)" /></At>
      </Cam>
      <Cr text={CR.ia} />
    </AbsoluteFill>
  );
};

/** gana el más rápido: 4 de cada 10 son bots */
const S5a: React.FC<SP> = ({T, t0}) => {
  const b0 = c('s05', 'cuatro de cada diez'), bots = c('s05', 'bots.');
  return (
    <NightV t={T} glow="rgba(255,59,78,0.16)">
      <Cam t={T} punches={[b0, bots]}>
        <Row y={290}><Kicker t={T} t0={c('s05', 'gana') - 0.1} color={M.celesteHi} size={30}>Gana el más rápido</Kicker></Row>
        <Row y={370} style={{opacity: prog(T, b0 - 0.1, 0.3)}}>
          <Gold t={T} size={130} red>4 DE CADA 10</Gold>
        </Row>
        {Array.from({length: 10}).map((_, i) => {
          const col = i % 5, row = Math.floor(i / 5);
          const x = 150 + col * 195, y = 560 + row * 270;
          const flip = i < 4 ? b0 + 0.25 * i : Infinity;
          const f = clamp((T - flip) / 0.25);
          const isBot = T >= flip + 0.12;
          return (
            <div key={i} style={{position: 'absolute', left: x - 55, top: y, transform: `scale(${clamp(pop(T, t0 + 0.1 + i * 0.06, 1.2))}) rotateY(${Math.sin(f * Math.PI) * 90}deg)`}}>
              {isBot ? <Bot w={110} /> : <Person w={110} color={M.celesteHi} />}
            </div>
          );
        })}
        <Row y={1100}><B t={T} t0={bots - 0.1} kind="pop"><Pill bg={M.red} fg={M.white} size={40}>SON BOTS</Pill></B></Row>
        <Fuente t={T} t0={b0} text="Imperva, tráfico en sitios de venta de entradas" y={1175} />
      </Cam>
    </NightV>
  );
};

/** la página trucha */
const S5b: React.FC<SP> = ({T, t0}) => {
  const tr = c('s05', 'trucha,'), dn = c('s05', 'deportick');
  return (
    <NightV t={T} glow="rgba(255,59,78,0.22)">
      <Cam t={T} punches={[tr, dn]}>
        <Row y={290}><Kicker t={T} t0={t0 + 0.1} color={M.red} size={30}>El día de la venta</Kicker></Row>
        <At x={540} y={640} center>
          <B t={T} t0={t0 + 0.05} kind="up">
            <Browser url="deportick.net/preventa" w={960} h={560} lock={false} hiFrom={9} hiLen={4} hiK={prog(T, dn, 0.3)}>
              <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0B1B3A, #15224A)', padding: 40}}>
                <div style={{fontFamily: FONT.body, fontWeight: 900, fontSize: 30, color: M.celesteHi, letterSpacing: 3}}>DEPORTICK</div>
                <div style={{fontFamily: FONT.head, fontSize: 72, color: M.white, lineHeight: 1.05, marginTop: 20}}>PREVENTA EXCLUSIVA</div>
                <div style={{fontFamily: FONT.body, fontWeight: 700, fontSize: 30, color: 'rgba(255,255,255,0.75)', marginTop: 10}}>Argentina vs Benín · Despedida de Messi</div>
                <div style={{display: 'inline-block', marginTop: 34, background: M.gold, color: M.ink, fontFamily: FONT.body, fontWeight: 900, fontSize: 32, padding: '16px 40px', borderRadius: 14}}>COMPRAR AHORA</div>
              </div>
            </Browser>
          </B>
        </At>
        <At x={540} y={700} center><Stamp t={T} t0={tr - 0.05} text="TRUCHA" size={150} rot={-10} bg="rgba(5,10,23,0.55)" /></At>
        <Row y={1010}><B t={T} t0={dn + 0.5} kind="pop"><Pill bg={M.green} fg={M.ink} size={34}>LA OFICIAL ERA DEPORTICK.COM</Pill></B></Row>
      </Cam>
    </NightV>
  );
};

/** contravención en la Ciudad */
const S5c: React.FC<SP> = ({T, t0}) => {
  const cv = c('s05', 'contravención.');
  return (
    <AbsoluteFill>
      <Photo src="ba_noche.jpg" t={T} t0={t0} span={4} zoom={[1.15, 1.3]} focus="100% 50%" dim={0.5} />
      <Cam t={T} punches={[cv]}>
        <Row y={300}><Kicker t={T} t0={t0 + 0.1} color={M.celesteHi} size={30}>Ciudad de Buenos Aires</Kicker></Row>
        <At x={540} y={500} center w={960}>
          <Words t={T} t0={c('s05', 'revender') - 0.1} step={0.1} center text="REVENDER PARA GANAR PLATA ES UNA" style={{fontFamily: FONT.head, fontSize: 100, lineHeight: 1.04, color: M.white, textAlign: 'center'}} />
        </At>
        <At x={540} y={820} center><Stamp t={T} t0={cv - 0.05} text="CONTRAVENCIÓN" size={108} rot={-5} bg="rgba(5,10,23,0.6)" /></At>
        <Fuente t={T} t0={cv} text="Código Contravencional de la Ciudad (Ley 1472)" y={1000} />
      </Cam>
      <Cr text={CR.ba} />
    </AbsoluteFill>
  );
};

/** lo que queda en el video completo */
const S6a: React.FC<SP> = ({T, t0}) => {
  const o = c('s06', 'Oasis,'), f = c('s06', 'la final'), e = c('s06', 'y cómo');
  return (
    <NightV t={T}>
      <Cam t={T} punches={[o, f, e]}>
        <Row y={270}><Kicker t={T} t0={t0 + 0.05} color={M.celesteHi} size={28}>En el video completo</Kicker></Row>
        <div style={{position: 'absolute', left: 90, width: 900, top: 340}}>
          <B t={T} t0={o - 0.1} kind="left">
            <div style={{position: 'relative', width: 900, height: 300, borderRadius: 24, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.5)'}}>
              <Img src={img('oasis2.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%'}} />
              <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(5,10,23,0.85) 0%, rgba(5,10,23,0.2) 70%)'}} />
              <div style={{position: 'absolute', left: 40, top: 60}}>
                <div style={{fontFamily: FONT.head, fontSize: 96, color: M.white, lineHeight: 1}}>OASIS</div>
                <div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 32, color: M.celesteHi, marginTop: 10}}>de £148 a £355 en plena fila</div>
              </div>
              <div style={{position: 'absolute', right: 20, bottom: 12, fontFamily: FONT.body, fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.75)'}}>{CR.oasis}</div>
            </div>
          </B>
        </div>
        <div style={{position: 'absolute', left: 90, width: 900, top: 670}}>
          <B t={T} t0={f - 0.1} kind="right">
            <Glass w={900} style={{padding: '28px 40px', border: `3px solid ${M.gold}`}}>
              <div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: M.goldHi}}>FINAL DEL MUNDIAL · REVENTA FIFA</div>
              <Gold t={T} size={104}>US$2.300.000</Gold>
            </Glass>
          </B>
        </div>
        <div style={{position: 'absolute', left: 90, width: 900, top: 930}}>
          <B t={T} t0={e - 0.1} kind="left">
            <Glass w={900} style={{padding: '26px 40px', border: `3px solid ${M.red}`}}>
              <div style={{fontFamily: FONT.head, fontSize: 70, color: M.white, lineHeight: 1.05}}>¿CÓMO NO CAER EN <span style={{color: M.red}}>UNA ESTAFA?</span></div>
            </Glass>
          </B>
        </div>
      </Cam>
    </NightV>
  );
};

/** placa final: el video completo */
const PlayBtn: React.FC = () => (
  <svg width={150} height={106} viewBox="0 0 150 106">
    <rect x="0" y="0" width="150" height="106" rx="30" fill="#FF0033" />
    <path d="M60 32 L102 53 L60 74 Z" fill="#fff" />
  </svg>
);
const End: React.FC<SP> = ({T, t0}) => {
  const lk = c('s06', 'Tocá'), bu = c('s06', 'buscá'), yv = c('s06', 'Y vos,');
  const bob = Math.sin((T - t0) * 5) * 10;
  return (
    <NightV t={T} glow="rgba(255,0,51,0.16)">
      <Row y={262}><B t={T} t0={t0 + 0.05} kind="drop"><Pill bg={M.red} fg={M.white} size={40}>VIDEO COMPLETO EN YOUTUBE</Pill></B></Row>
      <div style={{position: 'absolute', left: 60, width: 960, top: 360}}>
        <B t={T} t0={t0 + 0.15} kind="pop">
          <div style={{position: 'relative', width: 960, height: 540, borderRadius: 28, overflow: 'hidden', boxShadow: '0 40px 90px rgba(0,0,0,0.6), 0 0 0 3px rgba(255,255,255,0.18)'}}>
            <Img src={staticFile('msv/mini_a.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            <div style={{position: 'absolute', left: '50%', top: '84%', transform: `translate(-50%, -50%) scale(${0.8 + 0.05 * Math.sin((T - t0) * 4)})`}}><PlayBtn /></div>
            <div style={{position: 'absolute', right: 18, bottom: 16, background: 'rgba(0,0,0,0.8)', color: M.white, fontFamily: FONT.body, fontWeight: 800, fontSize: 26, padding: '4px 12px', borderRadius: 8}}>4:59</div>
          </div>
        </B>
      </div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 930, opacity: prog(T, t0 + 0.5, 0.4)}}>
        <div style={{fontFamily: FONT.body, fontWeight: 900, fontSize: 46, color: M.white, lineHeight: 1.2}}>¿Por qué ver a Messi cuesta $3 MILLONES?</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 18}}>
          <Img src={staticFile('brand/logo_transparente.png')} style={{width: 58, height: 58}} />
          <div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 32, color: M.celesteHi, letterSpacing: 2, transform: `scale(${1 + 0.08 * clamp(pop(T, bu, 1.2)) * (T < bu + 1.2 ? 1 : 0)})`, transformOrigin: '0% 50%'}}>CONTEXTO</div>
        </div>
      </div>
      {/* flecha al link del video relacionado (abajo a la izquierda en Shorts) */}
      <div style={{position: 'absolute', left: 90, top: 1440 + bob, opacity: prog(T, lk - 0.1, 0.3)}}>
        <svg width={120} height={150} viewBox="0 0 120 150"><path d="M42 0 H78 V92 H112 L60 150 L8 92 H42 Z" fill={M.gold} stroke={M.night} strokeWidth="6" strokeLinejoin="round" /></svg>
      </div>
      <Row y={1450} style={{opacity: prog(T, yv + 1.8, 0.3)}}><Pill bg={M.white} fg={M.ink} size={40}>¿CUÁNTO PAGARÍAS? COMENTÁ</Pill></Row>
    </NightV>
  );
};

/* =====================================================================
   MONTAJE
   ===================================================================== */
type Shot = {from: number; C: React.FC<SP>; tr?: TK};
const SHOTS: Shot[] = [
  {from: 0, C: H1},
  {from: k('s01', 'Un día después,'), C: H2, tr: 'whip'},
  {from: k('s01', 'Y las mejores,'), C: H3, tr: 'flash'},
  {from: k('s01', '¿Quién se queda'), C: H4, tr: 'glitch'},
  {from: at('s02') - 0.1, C: S2a, tr: 'stripes'},
  {from: k('s02', 'el último partido'), C: S2b, tr: 'flash'},
  {from: k('s02', 'Cuatro entradas'), C: S2c, tr: 'whip'},
  {from: at('s03') - 0.1, C: S3a, tr: 'iris'},
  {from: k('s03', 'para todo'), C: S3b, tr: 'flash'},
  {from: k('s03', 'Cuando algo'), C: S3c, tr: 'whip'},
  {from: k('s03', 'Y esa diferencia'), C: S3d, tr: 'glitch'},
  {from: at('s04') - 0.1, C: S4a, tr: 'stripes'},
  {from: k('s04', 'En un experimento'), C: S4b, tr: 'whip'},
  {from: at('s05') - 0.1, C: S5a, tr: 'iris'},
  {from: k('s05', 'Encima,'), C: S5b, tr: 'glitch'},
  {from: k('s05', 'Y en la Ciudad,'), C: S5c, tr: 'whip'},
  {from: at('s06') - 0.1, C: S6a, tr: 'stripes'},
  {from: k('s06', 'está todo'), C: End, tr: 'iris'},
];
export const MSV_CUTS = SHOTS.slice(1).map((s) => ({t: s.from, kind: s.tr!}));

export const Msv: React.FC = () => {
  const frame = useCurrentFrame();
  const T = frame / FPS;
  let idx = 0;
  SHOTS.forEach((s, i) => { if (T >= s.from) idx = i; });
  const cur = SHOTS[idx];
  const Cur = cur.C;
  return (
    <AbsoluteFill style={{background: M.night}}>
      <AbsoluteFill><Cur T={T} t0={cur.from} /></AbsoluteFill>
      <Caps t={T} />
      {SHOTS.slice(1).map((s, i) => <Transition key={i} t={T} at={s.from} kind={s.tr!} />)}
    </AbsoluteFill>
  );
};
