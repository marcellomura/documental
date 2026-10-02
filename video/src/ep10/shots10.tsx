/* Tomas 3D reutilizables del episodio 10 (living, chalet, barco, cuaderno, galería, botín, campo de marcos, globo)
   y piezas 2D compartidas (celular con el aviso, cielo nocturno, círculo de marcador, tablero de corcho). */
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {F} from '../theme';
import {K, FT, clamp, easeInOut, easeOut, prog, rnd} from './kit10';
import {Cam, Chalet3D, ChaletState, FrameField, Gallery3D, Globe3D, Loot3D, Notebook3D, Room3D, RoomState, Route, ShipDeck3D, Stage, diamondPos, globePoint, globeRot, project} from './three10';
import type {V3} from './three10';

/* ---------- cámaras del living ---------- */
export const ROOM_WIDE: Cam = {pos: [0, 1.55, 6.4], look: [0, 1.45, 0], fov: 40};
export const ROOM_SOFA: Cam = {pos: [1.3, 1.05, 4.3], look: [-0.1, 1.05, 0.4], fov: 36};
export const ROOM_MID: Cam = {pos: [0.25, 1.75, 3.3], look: [0, 1.8, 0], fov: 36};
export const ROOM_PAINT: Cam = {pos: [0, 1.92, 1.85], look: [0, 1.92, 0], fov: 34};
export const RoomShot: React.FC<{cam: Cam; s: RoomState; o?: number; w?: number; h?: number}> = ({cam, s, o = 1, w, h}) => (
  <AbsoluteFill style={{opacity: o, background: '#0B0907'}}>
    <Stage cam={cam} keyI={0.7} fill={0.35} key0={[3, 6, 8]} exposure={1.0} shadow={8} w={w} h={h}>
      <Room3D s={s} />
    </Stage>
  </AbsoluteFill>
);

/* ---------- el chalet de noche ---------- */
export const CH_WIDE: Cam = {pos: [5.5, 2.6, 17.5], look: [0, 2.0, 0], fov: 36};
export const CH_NEAR: Cam = {pos: [3.6, 2.1, 12.5], look: [0, 1.9, 0], fov: 36};
export const CH_DOOR: Cam = {pos: [2.0, 1.75, 7.4], look: [1.1, 1.55, 3], fov: 36};
export const CH_WINDOW: Cam = {pos: [-0.6, 1.65, 7.6], look: [-1.6, 1.45, 3], fov: 32};
export const CH_SIGN: Cam = {pos: [-1.9, 1.45, 8.0], look: [-3.15, 1.25, 5.15], fov: 32};
export const NightSky: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg, #050913 0%, #0E1A30 55%, #1A2742 100%)'}}>
    <svg width={1920} height={1080}>
      {Array.from({length: 120}, (_, i) => (
        <circle key={i} cx={rnd(i) * 1920} cy={rnd(i + 50) * 560} r={0.6 + rnd(i + 9) * 1.4} fill="#fff" opacity={0.25 + 0.5 * rnd(i + 3) * (0.7 + 0.3 * Math.sin(t * 2 + i))} />
      ))}
      <circle cx={1780} cy={115} r={40} fill="#F3EBD6" opacity={0.9} />
      <circle cx={1780} cy={115} r={110} fill="#F3EBD6" opacity={0.06} />
    </svg>
  </AbsoluteFill>
);
export const ChaletShot: React.FC<{t: number; cam: Cam; s: ChaletState; o?: number; w?: number; h?: number}> = ({t, cam, s, o = 1, w, h}) => (
  <AbsoluteFill style={{opacity: o}}>
    <NightSky t={t} />
    <Stage cam={cam} keyI={0.28} fill={0.28} key0={[-8, 12, 10]} rimColor="#5F7FBF" shadow={14} exposure={1.05} w={w} h={h}>
      <Chalet3D s={s} />
    </Stage>
  </AbsoluteFill>
);

/* ---------- el barco ---------- */
export const ShipShot: React.FC<{t: number; cam: Cam; o?: number; lantern?: number}> = ({t, cam, o = 1, lantern = 1}) => (
  <AbsoluteFill style={{opacity: o}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 40% 25%, #16233A 0%, #070B12 65%)'}} />
    <Stage cam={cam} keyI={0.12} fill={0.16} key0={[-8, 12, -20]} rimColor="#5F7FBF" shadow={10}>
      <ShipDeck3D t={t} lantern={lantern} />
    </Stage>
  </AbsoluteFill>
);

/* ---------- cuaderno, galería, botín, campo ---------- */
export const NotebookShot: React.FC<{cam: Cam; open: number; flip?: number; red?: boolean; o?: number}> = ({cam, open, flip, red, o = 1}) => (
  <AbsoluteFill style={{opacity: o, background: '#0B0907'}}>
    <Stage cam={cam} keyI={0.25} fill={0.22} key0={[3, 8, 4]} shadow={4}>
      <Notebook3D open={open} flip={flip} red={red} />
    </Stage>
  </AbsoluteFill>
);
export const GalleryShot: React.FC<{t: number; cam: Cam; taken?: number; reveal?: number; o?: number}> = ({t, cam, taken = 0, reveal = 1, o = 1}) => (
  <AbsoluteFill style={{opacity: o, background: '#0B0907'}}>
    <Stage cam={cam} keyI={0.3} fill={0.3} key0={[2, 8, 6]} shadow={12} target={[0, 0, -10]}>
      <Gallery3D t={t} taken={taken} reveal={reveal} />
    </Stage>
  </AbsoluteFill>
);
export const LootShot: React.FC<{t: number; cam: Cam; gold: number; diamonds: number; notes: number; o?: number}> = ({t, cam, gold, diamonds, notes, o = 1}) => (
  <AbsoluteFill style={{opacity: o, background: '#0B0907'}}>
    <Stage cam={cam} keyI={1.5} fill={0.35} key0={[3, 8, 5]} shadow={6}>
      <Loot3D t={t} gold={gold} diamonds={diamonds} notes={notes} />
      <pointLight position={[0.4, 2.2, 2.2]} intensity={6} distance={6} color="#CFE4FF" />
    </Stage>
    {/* destellos sobre los diamantes */}
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'screen'}}>
      {Array.from({length: 11}, (_, i) => {
        const k = clamp(diamonds * 2 - i * 0.08);
        if (k < 0.9) return null;
        const [x, y] = project(cam, diamondPos(i));
        const tw = Math.max(0, Math.sin(t * 3.1 + i * 1.7));
        const r = 18 + 26 * tw;
        return (
          <g key={i} opacity={0.35 + 0.65 * tw} transform={`translate(${x} ${y - 12}) rotate(${(t * 40 + i * 30) % 360})`}>
            <path d={`M0 ${-r} L${r * 0.12} ${-r * 0.12} L${r} 0 L${r * 0.12} ${r * 0.12} L0 ${r} L${-r * 0.12} ${r * 0.12} L${-r} 0 L${-r * 0.12} ${-r * 0.12} Z`} fill="#EAF4FF" />
            <circle r={5} fill="#fff" />
          </g>
        );
      })}
    </svg>
  </AbsoluteFill>
);
export const FieldShot: React.FC<{t: number; cam: Cam; build: number; missing: number; lift?: number; o?: number}> = ({t, cam, build, missing, lift, o = 1}) => (
  <AbsoluteFill style={{opacity: o}}>
    <Stage cam={cam} keyI={1.4} fill={0.45} key0={[3, 10, 6]} shadow={10}>
      <FrameField t={t} build={build} missing={missing} lift={lift} />
    </Stage>
  </AbsoluteFill>
);

/* ---------- globo ---------- */
export const GLOBE_R = 3;
export type GlobeView = {lon: number; lat: number; dist: number; x?: number};
export const globeCam = (v: GlobeView): Cam => ({pos: [0, 0, v.dist], look: [0, 0, 0], fov: 32});
export const GlobeShot: React.FC<{t: number; v: GlobeView; routes?: Route[]; countries?: {a3: string; color: string; o: number}[]; o?: number; children?: (pt: (lon: number, lat: number) => [number, number]) => React.ReactNode}> = ({
  t, v, routes, countries, o = 1, children,
}) => {
  const rot = globeRot(v.lon, v.lat);
  const pos: V3 = [v.x ?? 0, 0, 0];
  const cam = globeCam(v);
  const pt = (lon: number, lat: number) => project(cam, globePoint(lon, lat, GLOBE_R, rot, pos));
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Stage cam={cam} shadow={6} key0={[6, 4, 10]} keyI={2.0} fill={0.9} exposure={1.1}>
        <Globe3D r={GLOBE_R} rot={rot} pos={pos} t={t} routes={routes} countries={countries} />
      </Stage>
      {children ? <AbsoluteFill>{children(pt)}</AbsoluteFill> : null}
    </AbsoluteFill>
  );
};
/** punto + rótulo sobre el globo (en píxeles ya proyectados) */
export const GPin: React.FC<{xy: [number, number]; label: string; o?: number; color?: string; side?: 'l' | 'r'; sub?: string}> = ({xy, label, o = 1, color = K.gold, side = 'r', sub}) =>
  o <= 0 ? null : (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: o}}>
      <circle cx={xy[0]} cy={xy[1]} r={10} fill={color} stroke="#000" strokeWidth={2} />
      <circle cx={xy[0]} cy={xy[1]} r={20 + 6 * Math.sin(o * 6)} fill="none" stroke={color} strokeWidth={2} opacity={0.6} />
      <text x={side === 'r' ? xy[0] + 26 : xy[0] - 26} y={xy[1] + 10} textAnchor={side === 'r' ? 'start' : 'end'} fontFamily={FT.type} fontSize={32} fill={K.cream} stroke="#000" strokeWidth={6} paintOrder="stroke">
        {label}
      </text>
      {sub ? (
        <text x={side === 'r' ? xy[0] + 26 : xy[0] - 26} y={xy[1] + 44} textAnchor={side === 'r' ? 'start' : 'end'} fontFamily={F.body} fontWeight={700} fontSize={22} fill={K.mute} stroke="#000" strokeWidth={4} paintOrder="stroke">
          {sub}
        </text>
      ) : null}
    </svg>
  );

/* ---------- círculo de marcador rojo dibujado a mano ---------- */
export const MarkerCircle: React.FC<{t: number; t0: number; x: number; y: number; rx: number; ry: number; color?: string; dur?: number; o?: number}> = ({t, t0, x, y, rx, ry, color = K.red, dur = 0.6, o = 1}) => {
  if (t < t0) return null;
  const k = easeOut(clamp((t - t0) / dur));
  const pts: string[] = [];
  const N = 80;
  for (let i = 0; i <= N * 1.12 * k; i++) {
    const a = (i / N) * Math.PI * 2 - 2.2;
    const wob = 1 + Math.sin(i * 0.4) * 0.025 + i / N * 0.05;
    pts.push(`${(x + Math.cos(a) * rx * wob).toFixed(1)},${(y + Math.sin(a) * ry * wob).toFixed(1)}`);
  }
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: o}}>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" opacity={0.92} />
    </svg>
  );
};

/* ---------- celular con el aviso inmobiliario (genérico, sin marca) ---------- */
export const PHONE_W = 470, PHONE_H = 940;
export const PHOTO_W = 430, PHOTO_H = 322;
const KitchenArt: React.FC = () => (
  <svg width={PHOTO_W} height={PHOTO_H} viewBox="0 0 430 322">
    <rect width={430} height={322} fill="#E9E1D0" />
    <rect y={220} width={430} height={102} fill="#B9A58A" />
    <rect x={20} y={40} width={390} height={70} fill="#F6F1E6" stroke="#C8BBA4" />
    {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={20 + i * 78} y1={40} x2={20 + i * 78} y2={110} stroke="#C8BBA4" />)}
    <rect x={20} y={150} width={390} height={80} fill="#F6F1E6" stroke="#C8BBA4" />
    <rect x={20} y={142} width={390} height={10} fill="#5A4A3A" />
    <rect x={160} y={60} width={110} height={70} fill="#9FC3D9" stroke="#fff" strokeWidth={6} />
  </svg>
);
const BedroomArt: React.FC = () => (
  <svg width={PHOTO_W} height={PHOTO_H} viewBox="0 0 430 322">
    <rect width={430} height={322} fill="#DCD4C4" />
    <rect y={230} width={430} height={92} fill="#8C6A4C" />
    <rect x={90} y={150} width={250} height={110} rx={10} fill="#F2EEE6" />
    <rect x={90} y={120} width={250} height={40} rx={8} fill="#7A5A44" />
    <rect x={110} y={160} width={80} height={30} rx={8} fill="#fff" />
    <rect x={240} y={160} width={80} height={30} rx={8} fill="#fff" />
    <rect x={300} y={40} width={90} height={80} fill="#A7C8DE" stroke="#fff" strokeWidth={6} />
  </svg>
);
export const ListingPhone: React.FC<{
  t: number; idx: number; x?: number; y?: number; scale?: number; tilt?: number; o?: number; photoFocus?: [number, number];
  ext: React.ReactNode; living: React.ReactNode;
}> = ({t, idx, x = 960, y = 540, scale = 1, tilt = 1, o = 1, ext, living}) => {
  const slides = [ext, <KitchenArt key="k" />, <BedroomArt key="b" />, living];
  const labels = ['Frente', 'Cocina', 'Dormitorio', 'Living'];
  const cur = Math.round(idx);
  return (
    <div style={{position: 'absolute', left: x - PHONE_W / 2, top: y - PHONE_H / 2, width: PHONE_W, height: PHONE_H, opacity: o, transform: `scale(${scale}) perspective(1400px) rotateY(${-10 * tilt}deg) rotateX(${5 * tilt}deg)`, transformOrigin: '50% 31%'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 62, background: '#0D0D0F', boxShadow: '0 50px 120px rgba(0,0,0,0.7), 0 0 0 3px #2A2A30, inset 0 0 0 2px #3A3A42'}} />
      <div style={{position: 'absolute', left: 20, top: 20, right: 20, bottom: 20, borderRadius: 46, overflow: 'hidden', background: '#F7F5F0'}}>
        <div style={{height: 54, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 30px 0', fontFamily: F.body, fontWeight: 700, fontSize: 20, color: '#222'}}>
          <span>23:41</span>
          <span style={{width: 110, height: 30, borderRadius: 16, background: '#0D0D0F'}} />
          <span>● 74%</span>
        </div>
        <div style={{padding: '8px 22px 12px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #E4E0D6'}}>
          <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 26, color: '#1C1611'}}>Propiedades</div>
          <div style={{flex: 1, height: 38, borderRadius: 19, background: '#ECE8DF', fontFamily: F.body, fontSize: 18, color: '#7A7368', display: 'flex', alignItems: 'center', paddingLeft: 16}}>Chalet · Mar del Plata</div>
        </div>
        {/* carrusel */}
        <div style={{position: 'relative', width: PHOTO_W, height: PHOTO_H, margin: '0 0', overflow: 'hidden', background: '#222'}}>
          <div style={{position: 'absolute', left: 0, top: 0, height: PHOTO_H, width: PHOTO_W * 4, display: 'flex', transform: `translateX(${-idx * PHOTO_W}px)`}}>
            {slides.map((s, i) => (
              <div key={i} style={{position: 'relative', width: PHOTO_W, height: PHOTO_H, overflow: 'hidden', flexShrink: 0}}>
                {Math.abs(i - idx) < 1.2 ? s : null}
              </div>
            ))}
          </div>
          <div style={{position: 'absolute', right: 12, top: 12, background: 'rgba(0,0,0,0.6)', color: '#fff', fontFamily: F.body, fontWeight: 700, fontSize: 17, padding: '4px 10px', borderRadius: 10}}>
            {cur + 1}/24 · {labels[cur]}
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 10, display: 'flex', justifyContent: 'center', gap: 7}}>
            {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} style={{width: 9, height: 9, borderRadius: 5, background: i === cur ? '#fff' : 'rgba(255,255,255,0.45)'}} />)}
          </div>
        </div>
        <div style={{padding: '18px 24px'}}>
          <div style={{display: 'inline-block', background: '#C8312C', color: '#fff', fontFamily: F.body, fontWeight: 800, fontSize: 18, padding: '4px 12px', borderRadius: 6, letterSpacing: 1}}>EN VENTA</div>
          <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 32, color: '#1C1611', marginTop: 12}}>Chalet de piedra con jardín</div>
          <div style={{fontFamily: F.body, fontWeight: 500, fontSize: 22, color: '#6E675C', marginTop: 6}}>Mar del Plata · 4 ambientes</div>
          <div style={{display: 'flex', gap: 10, marginTop: 18}}>
            {['3 dorm.', '2 baños', 'Jardín', 'Cochera'].map((x) => (
              <div key={x} style={{fontFamily: F.body, fontWeight: 600, fontSize: 18, color: '#3A342C', border: '1px solid #DCD6CA', borderRadius: 10, padding: '6px 10px'}}>{x}</div>
            ))}
          </div>
          <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 26, color: '#1C1611', marginTop: 22}}>Consultar precio</div>
          <div style={{marginTop: 22, height: 64, borderRadius: 14, background: '#1C1611', color: '#fff', fontFamily: F.body, fontWeight: 800, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Contactar</div>
        </div>
      </div>
    </div>
  );
};
/** posición en pantalla del centro de la foto del carrusel cuando el celular está en (x, y) sin escala */
export const PHOTO_CENTER_DY = -PHONE_H / 2 + 20 + 54 + 59 + PHOTO_H / 2;

/* ---------- tablero de corcho con hilos rojos ---------- */
export const Cork: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: '#7A5A3A'}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(170,120,70,0.5) 0%, rgba(30,18,8,0.75) 100%)'}} />
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: 0.5}}>
      {Array.from({length: 900}, (_, i) => (
        <circle key={i} cx={rnd(i) * 1920} cy={rnd(i + 999) * 1080} r={1 + rnd(i + 7) * 2.5} fill={rnd(i + 3) < 0.5 ? '#4A3020' : '#B08A5A'} opacity={0.5} />
      ))}
    </svg>
    {children}
  </AbsoluteFill>
);
export const RedString: React.FC<{a: [number, number]; b: [number, number]; p: number}> = ({a, b, p}) => {
  if (p <= 0) return null;
  const k = clamp(p);
  const mx = (a[0] + b[0]) / 2, my = Math.max(a[1], b[1]) + 60;
  const x = a[0] + (b[0] - a[0]) * k, y = a[1] + (b[1] - a[1]) * k;
  const cx = a[0] + (mx - a[0]) * k, cy = a[1] + (my - a[1]) * k;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      <path d={`M${a[0]} ${a[1]} Q${cx} ${cy} ${x} ${y}`} fill="none" stroke="#B3201B" strokeWidth={4} />
      <circle cx={a[0]} cy={a[1]} r={9} fill="#D9302A" stroke="#5A0E0C" strokeWidth={2} />
      {k >= 1 ? <circle cx={b[0]} cy={b[1]} r={9} fill="#D9302A" stroke="#5A0E0C" strokeWidth={2} /> : null}
    </svg>
  );
};

export const Recre: React.FC<{o?: number; x?: number; y?: number}> = ({o = 1, x = 60, y = 1020}) => (
  <div style={{position: 'absolute', right: x, top: y, fontFamily: F.mono, fontSize: 16, color: 'rgba(241,231,211,0.6)', opacity: o, letterSpacing: 1}}>RECREACIÓN 3D</div>
);

export {Img, staticFile, easeInOut};
