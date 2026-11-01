/* Ep15 · vertical (1080×1920, 2:46) para Reels, TikTok, Shorts y Facebook: subtítulos quemados palabra por palabra,
   cortes más rápidos que el largo y una placa final que manda al documental completo en YouTube. Mismos planos 3D,
   fotos y mapas que el largo, reencuadrados para 9:16 (los textos grandes van arriba de los subtítulos). */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {V} from './lib';
import {useAssets15, SAT_CREDIT} from './three15';
import {K, F, FilmLook, Flash, Glitch, Photo, Credit, Slate, NameCard, Quote, Stamp, Filters, BigNumber, Captions, Logo, prog, clamp, mix, easeInOut, easeOut} from './kit';
import {Bokeh, TailLights, Polaroid, Stutter, YearRoll, Lines, Strike, FilmBeam, BigWord, Tag, TitleCard, PhotoCredit} from './kit2';
import {Map15, viewPath, PT, LUX, moveShape, squareKm, arcRoute, smoothRoute, type View} from './map15';
import {dolly, CabezaShot, PuebloShot, TierraShot, YateShot, CadenasShot, TamboresShot, PabellonShot, satPoint, type Cam} from './shots15';

const A = V.at, E = V.atE, S = V.start;
type Shot = {a: number; fi?: number; sat?: boolean; el: (t: number) => React.ReactNode};
const PK = satPoint('region', 'parque');
const HF: Cam = {pos: [0, -0.05, 6.4], look: [0, -0.1, 0], fov: 32};
const H34: Cam = {pos: [3.6, 0.3, 4.9], look: [0, -0.1, 0], fov: 32};
const HC: Cam = {pos: [0.9, 0.1, 3.9], look: [0, -0.05, 0.2], fov: 30};
const lux = moveShape(LUX, [-60.6, -24.55]);
const sq = squareKm([-60.6, -25.45], 50);
const TITLE_AT = A('v01', 'esta es');
const CTA = A('v05', 'la historia completa') - 0.2;

const SHOTS: Shot[] = [
  /* ---------- v01 · el gancho ---------- */
  {a: 0, el: (t) => <CabezaShot t={t} cam={dolly(t, 0, A('v01', 'dicen'), HC, HF)} red={0.6} id={mix(0, 1, prog(t, 0.2, 1.2))} scatter={0.4 * Math.sin(Math.PI * clamp((t - 0.25) / 1.4))} proj={t > A('v01', 'se tino') ? {k: 1.0, mode: 'nombres', off: t * 0.012} : undefined} />},
  {a: A('v01', 'dicen') - 0.1, el: (t) => <CabezaShot t={t} cam={dolly(t, A('v01', 'dicen'), A('v01', 'cambio'), HF, HC)} red={0.35} key={0.4} proj={{k: 1.5, mode: 'huella', color: '#FF6A50'}} />},
  {a: A('v01', 'cambio') - 0.1, el: (t) => <CabezaShot t={t} cam={dolly(t, A('v01', 'cambio'), A('v01', 'y aun'), H34, HF)} red={0.5} proj={{k: 1.2, mode: 'nombres', off: t * 0.015}} id={mix(1, 2, prog(t, A('v01', 'pais'), 0.8))} rotY={-0.2} />},
  {a: A('v01', 'y aun') - 0.1, el: () => <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #1A1712 0%, #060504 80%)'}} />},
  {a: TITLE_AT - 0.1, el: (t) => <CabezaShot t={t} cam={{pos: [0, -0.05, 5.6], look: [0, -0.1, 0], fov: 32}} red={0.4} id={2} proj={{k: 0.6, mode: 'nombres', off: t * 0.012}} scatter={0.3 + 0.7 * prog(t, A('v01', 'el hombre'), 1.6)} />},
  {a: A('v01', 'y del crimen') - 0.15, fi: 0.4, sat: true, el: (t) => <TierraShot t={t} crop="region" outline={prog(t, A('v01', 'parque nacional') - 0.4, 1.6)} cam={dolly(t, A('v01', 'y del crimen') - 0.5, S('v02'), {pos: [PK[0] - 30, 300, PK[2] + 260], look: [PK[0], 0, PK[2] - 10], fov: 56}, {pos: [PK[0] - 20, 240, PK[2] + 190], look: [PK[0], 0, PK[2] - 20], fov: 56}, true)} />},

  /* ---------- v02 · Posadas, el Gusano, Paraguay 2004 ---------- */
  {a: S('v02') - 0.2, fi: 0.3, el: (t) => <Map15 t={t} view={viewPath(t, [[0, {lon: -57.4, lat: -27.0, scale: 3600}], [S('v02'), {lon: -55.95, lat: -27.35, scale: 9000}]], 1.6)} hi={['ARG']} hiProv={['Misiones']} pins={[{at: PT['Posadas'], label: 'POSADAS', sub: 'MISIONES · 1959', o: prog(t, A('v02', 'posadas'), 0.3), color: K.ember}]} />},
  {a: A('v02', 'en una de') - 0.1, fi: 0.3, el: (t) => <Photo file="yerba_secado.jpg" t={t} t0={A('v02', 'en una de') - 0.4} dur={7} from={[55, 50, 1.1]} to={[42, 52, 1.22]} grade="warm" shade={0.6} />},
  {a: A('v02', 'le decian') - 0.1, el: (t) => <CabezaShot t={t} cam={dolly(t, A('v02', 'le decian'), A('v02', 'en 2004'), {pos: [6, 0.05, 0.4], look: [0, -0.1, 0.15], fov: 30}, {pos: [5.2, 0.1, 2.0], look: [0, -0.05, 0.15], fov: 30})} red={0.3} proj={{k: 0.9, mode: 'nombres', off: t * 0.015}} />},
  {a: A('v02', 'y tartamudo') - 0.1, el: () => <AbsoluteFill style={{background: '#050607'}} />},
  {a: A('v02', 'en 2004') - 0.1, fi: 0.3, el: (t) => <Photo file="asuncion_palacio.jpg" t={t} t0={A('v02', 'en 2004') - 0.4} dur={5} from={[50, 50, 1.05]} to={[50, 45, 1.14]} grade="night" />},
  {a: A('v02', 'se subieron') - 0.1, fi: 0.3, el: (t) => <TailLights t={t} t0={A('v02', 'se subieron')} dur={2.6} />},
  {a: A('v02', 'once dias') - 0.1, fi: 0.3, el: (t) => <TamboresShot t={t} cam={dolly(t, A('v02', 'once dias') - 0.3, A('v02', 'el siempre'), {pos: [2.6, 1.4, 8.6], look: [0, 0.4, 2.8], fov: 46}, {pos: [1.3, 0.9, 6.0], look: [-0.05, 0.35, 2.8], fov: 44}, true)} />},
  {a: A('v02', 'el siempre') - 0.1, fi: 0.3, el: (t) => <Photo file="asuncion_cabildo.jpg" t={t} t0={A('v02', 'el siempre') - 1} dur={6} from={[45, 50, 1.2]} to={[48, 50, 1.3]} grade="noir" shade={0.85} />},
  {a: A('v02', 'cuando la') - 0.1, fi: 0.3, el: (t) => <Map15 t={t} view={viewPath(t, [[0, {lon: -57.6, lat: -25.3, scale: 30000}], [A('v02', 'cuando la'), {lon: -57.6, lat: -25.3, scale: 52000}]], 2.4)} hi={['PRY']} riverLabelsO={0} pins={[{at: PT['Asunción'], label: 'ASUNCIÓN', o: 1 - prog(t, A('v02', 'ya no') + 0.1, 0.25), color: K.blood}]} />},

  /* ---------- v03 · Hugo Jara, Nozzi, el Paraná ---------- */
  {a: S('v03') - 0.2, fi: 0.3, el: (t) => <CabezaShot t={t} cam={dolly(t, S('v03'), A('v03', 'se hizo'), HF, HC)} red={0.4} proj={{k: 1.1, mode: 'jara', off: t * 0.01}} />},
  {a: A('v03', 'se hizo') - 0.1, fi: 0.3, el: (t) => <FilmBeam t={t} />},
  {a: A('v03', 'y se subio') - 0.1, fi: 0.4, el: (t) => <YateShot t={t} cam={dolly(t, A('v03', 'y se subio') - 0.4, A('v03', 'el parana'), {pos: [-16, 2.4, 20], look: [0, 1.6, -2], fov: 46}, {pos: [-11, 1.8, 13], look: [0, 1.6, -2], fov: 44}, true)} />},
  {a: A('v03', 'el parana') - 0.1, fi: 0.4, el: (t) => <CadenasShot t={t} t0={A('v03', 'el parana') - 0.5} cam={dolly(t, A('v03', 'el parana') - 0.3, A('v03', 'la prefectura'), {pos: [0.5, 1.0, 9.6], look: [0, -0.6, 0], fov: 50}, {pos: [0.7, -1.2, 8.2], look: [0, -2.4, 0], fov: 50})} />},
  {a: A('v03', 'la prefectura') - 0.1, fi: 0.3, el: (t) => <Photo file="prefectura.jpg" t={t} t0={A('v03', 'la prefectura') - 0.4} dur={3} from={[45, 50, 1.08]} to={[55, 50, 1.16]} grade="cold" />},
  {a: A('v03', 'que era') - 0.1, el: (t) => <CabezaShot t={t} cam={dolly(t, A('v03', 'que era'), A('v03', 'pero el juicio'), {pos: [0.9, 0.45, 4.4], look: [0, 0.35, 0.2], fov: 30}, {pos: [0, 0.3, 6.6], look: [0, 0.3, 0], fov: 32})} red={0.6} proj={{k: 1.1, mode: 'nombres', off: t * 0.012}} scatter={0.35 * Math.sin(Math.PI * clamp((t - A('v03', 'que era') + 0.1) / 0.9))} />},
  {a: A('v03', 'pero el juicio') - 0.1, fi: 0.3, el: (t) => <PabellonShot t={t} cam={dolly(t, A('v03', 'pero el juicio'), S('v04'), {pos: [0, 1.6, 4], look: [0, 1.4, -30], fov: 56}, {pos: [0, 1.55, -10], look: [0.3, 1.3, -40], fov: 56}, true)} />},

  /* ---------- v04 · Roseo, La Fidelidad, la calle España, Berg ---------- */
  {a: S('v04') - 0.2, fi: 0.4, el: (t) => <Photo file="bermejo_chaco.jpg" t={t} t0={S('v04') - 0.6} dur={8} from={[50, 55, 1.05]} to={[50, 50, 1.16]} grade="warm" shade={0.7} />},
  {a: A('v04', 'era dueno') - 0.1, fi: 0.4, sat: true, el: (t) => <TierraShot t={t} crop="region" cam={dolly(t, A('v04', 'era dueno') - 0.4, A('v04', 'un campo'), {pos: [PK[0] - 40, 330, PK[2] + 280], look: [PK[0], 0, PK[2] - 20], fov: 56}, {pos: [PK[0] - 20, 220, PK[2] + 170], look: [PK[0] + 10, 0, PK[2] - 30], fov: 56}, true)} />},
  {a: A('v04', 'un campo') - 0.1, fi: 0.3, el: (t) => (
    <Map15 t={t} view={{lon: -60.6, lat: -25.0, scale: 26000}} provO={0.35} gridO={0.4} labelsO={0} riverLabelsO={0}
      areas={[{ring: sq, o: 1, p: prog(t, A('v04', 'un campo'), 0.7), label: '250.000 HA', labelAt: [-60.6, -25.75]}, {ring: lux, o: 1, p: prog(t, A('v04', 'luxemburgo') - 0.2, 0.7), stroke: K.steel, fill: 'rgba(141,176,195,0.14)', label: 'LUXEMBURGO', labelAt: [-60.6, -23.95]}]} />
  )},
  {a: A('v04', 'el 6') - 0.1, fi: 0.3, el: () => <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #1E1A15 0%, #080706 75%)'}} />},
  {a: A('v04', 'siete dias') - 0.1, fi: 0.3, el: (t) => (
    <PuebloShot t={t} cam={dolly(t, A('v04', 'siete dias') - 0.3, A('v04', 'buscaban'), {pos: [7.5, 1.7, 21], look: [-1.5, 1.7, 5], fov: 50}, {pos: [3.0, 1.55, 14], look: [-0.8, 1.5, 4.5], fov: 48}, true)}
      walkers={[{t0: A('v04', 'tres hombres') - 1.2, from: [-9, 0, 10.0], to: [-0.6, 0, 4.4], dur: 3.0, vanish: true}, {t0: A('v04', 'tres hombres') - 0.9, from: [-10, 0, 11.0], to: [-0.6, 0, 4.4], dur: 3.3, vanish: true}, {t0: A('v04', 'tres hombres') - 0.6, from: [-11, 0, 10.4], to: [-0.6, 0, 4.4], dur: 3.6, vanish: true}]}
      door={prog(t, A('v04', 'entraron'), 1.0)} />
  )},
  {a: A('v04', 'buscaban') - 0.1, fi: 0.2, el: () => <AbsoluteFill style={{background: '#0A0908'}} />},
  {a: A('v04', 'roseo y') - 0.1, el: () => <AbsoluteFill style={{background: '#000'}} />},
  {a: A('v04', 'un empleado') - 0.1, fi: 0.3, el: (t) => <Photo file="castelli_plaza.jpg" t={t} t0={A('v04', 'un empleado') - 0.4} dur={4} from={[55, 50, 1.15]} to={[50, 50, 1.25]} grade="noir" shade={0.8} />},
  {a: A('v04', 'y recordo') - 0.1, el: () => <AbsoluteFill style={{background: '#06070A'}} />},

  /* ---------- v05 · las condenas, el parque, Ezeiza, Netflix y el llamado ---------- */
  {a: S('v05') - 0.2, fi: 0.3, el: () => <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #1A1712 0%, #060504 80%)'}} />},
  {a: A('v05', 'y jura') - 0.1, fi: 0.3, el: (t) => <CabezaShot t={t} cam={dolly(t, A('v05', 'y jura'), A('v05', 'el campo'), {pos: [6, 0.05, 0.4], look: [0, -0.1, 0.15], fov: 30}, {pos: [5.4, 0.1, 1.6], look: [0, -0.05, 0.15], fov: 30})} red={0.3} key={0.7} />},
  {a: A('v05', 'el campo') - 0.1, fi: 0.4, sat: true, el: (t) => <TierraShot t={t} crop="region" outline={prog(t, A('v05', 'parque nacional') - 0.5, 2.2, easeInOut)} cam={dolly(t, A('v05', 'el campo') - 0.4, A('v05', 'en agosto'), {pos: [PK[0] - 20, 430, PK[2] + 360], look: [PK[0], 0, PK[2] - 10], fov: 58}, {pos: [PK[0] - 10, 380, PK[2] + 300], look: [PK[0], 0, PK[2] - 20], fov: 58}, true)} />},
  {a: A('v05', 'en agosto') - 0.1, fi: 0.3, el: (t) => (
    <Map15 t={t} view={{lon: -63.0, lat: -38.6, scale: 1500}} hi={['ARG']} hiProv={['Chubut', 'Buenos Aires']} riverLabelsO={0} labelsO={0.6}
      routes={[{pts: arcRoute(PT['Rawson'], PT['Ezeiza'], -0.12), p: prog(t, A('v05', 'lo trasladaron'), 1.4, easeInOut), color: K.blood}]}
      pins={[{at: PT['Rawson'], label: 'RAWSON', o: 1, size: 0.9, pulse: false}, {at: PT['Ezeiza'], label: 'EZEIZA', o: prog(t, A('v05', 'ezeiza'), 0.3), color: K.blood}]} />
  )},
  {a: A('v05', 'y su abogado') - 0.1, fi: 0.3, el: (t) => <FilmBeam t={t} k={0.8} />},
  {a: A('v05', 'la fuga') - 0.1, el: (t) => <Photo file="pilcomayo_clorinda.jpg" t={t} t0={A('v05', 'la fuga') - 0.3} dur={1.5} from={[50, 50, 1.1]} to={[55, 50, 1.18]} grade="warm" />},
  {a: A('v05', 'el yate') - 0.1, el: (t) => <YateShot t={t} cam={{pos: [-17, 2.3, 20], look: [0, 1.7, -2], fov: 48}} />},
  {a: A('v05', 'la herencia') - 0.1, sat: true, el: (t) => <TierraShot t={t} crop="rio" cam={dolly(t, A('v05', 'la herencia') - 0.2, CTA, {pos: [-30, 50, 90], look: [10, 0, -10], fov: 54}, {pos: [-20, 40, 70], look: [10, 0, -20], fov: 54}, true)} />},
  {a: CTA, fi: 0.4, el: () => <AbsoluteFill style={{background: '#050607'}} />},
];

/** placa final: el documental completo en YouTube */
const EndCTA: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  if (t < t0) return null;
  const a = prog(t, t0, 0.6);
  const pulse = 1 + 0.04 * Math.sin((t - t0) * 5);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: a}}>
      <div style={{position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}><Logo t={t} t0={t0 + 0.1} size={170} /></div>
      <div style={{fontFamily: F.mono, fontWeight: 500, fontSize: 34, letterSpacing: 10, color: K.ash, marginTop: 40, opacity: prog(t, t0 + 0.3, 0.5)}}>EL DOCUMENTAL COMPLETO</div>
      <div style={{fontFamily: F.title, fontSize: 118, lineHeight: 1.0, color: K.bone, textAlign: 'center', marginTop: 24, padding: '0 60px', opacity: prog(t, t0 + 0.45, 0.5)}}>EL HOMBRE DE LAS <span style={{color: K.blood}}>MIL</span> CARAS</div>
      <div style={{marginTop: 70, display: 'flex', alignItems: 'center', gap: 30, transform: `scale(${pulse})`, opacity: prog(t, t0 + 0.8, 0.5)}}>
        <div style={{width: 150, height: 104, borderRadius: 28, background: '#E0261B', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 60px rgba(224,38,27,0.45)'}}>
          <div style={{width: 0, height: 0, borderTop: '24px solid transparent', borderBottom: '24px solid transparent', borderLeft: '40px solid #FFF', marginLeft: 8}} />
        </div>
        <div style={{fontFamily: F.title, fontSize: 92, color: K.bone, letterSpacing: 2}}>YouTube</div>
      </div>
      <div style={{fontFamily: F.mono, fontWeight: 500, fontSize: 40, letterSpacing: 8, color: K.ember, marginTop: 64, opacity: prog(t, t0 + 1.1, 0.5)}}>BUSCÁ «CONTEXTO»</div>
      <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 44, color: K.ash, marginTop: 26, opacity: prog(t, t0 + 1.4, 0.5)}}>La fuga, el yate y la herencia en disputa</div>
    </AbsoluteFill>
  );
};

const Overlays: React.FC<{t: number}> = ({t}) => (
  <>
    {/* v01 */}
    <Tag t={t} t0={A('v01', 'dicen')} text="Según un abogado que lo conocía" y={230} out={A('v01', 'cambio') - 0.1} />
    <Stamp t={t} t0={A('v01', 'dos perpetuas')} text="PERPETUA" x={540} y={560} rot={-8} size={120} out={TITLE_AT - 0.2} />
    <Stamp t={t} t0={A('v01', 'perpetuas') + 0.35} text="PERPETUA" x={560} y={860} rot={6} size={120} out={TITLE_AT - 0.2} />
    <TitleCard t={t} t0={TITLE_AT + 0.1} dur={A('v01', 'y del crimen') - TITLE_AT - 0.2} />
    <Glitch t={t} t0={A('v01', 'cara') - 0.1} d={0.4} seed={3} />
    <Glitch t={t} t0={A('v01', 'mil') - 0.1} d={0.5} seed={9} />
    {/* v02 */}
    <BigWord t={t} t0={A('v02', 'el gusano')} text="EL GUSANO" size={170} y={330} out={A('v02', 'alto') + 0.3} />
    <Lines t={t} x={90} y={300} items={[{text: 'Alto', at: A('v02', 'alto'), big: true}, {text: 'Flaco', at: A('v02', 'flaco'), big: true}]} out={A('v02', 'y tartamudo') - 0.2} size={56} />
    <Stutter t={t} t0={A('v02', 'tartamudo') - 0.5} word="TARTAMUDO" y={420} size={120} out={A('v02', 'en 2004') - 0.2} />
    <Slate t={t} t0={A('v02', 'en 2004')} lines={['PARAGUAY · 2004']} x={70} y={220} size={34} out={A('v02', 'se subieron') - 0.2} />
    <BigWord t={t} t0={A('v02', 'once dias')} text="+11 DÍAS" size={120} y={230} color={K.ember} out={A('v02', 'tambores') - 0.1} />
    <BigNumber t={t} t0={A('v02', 'tambores')} to={200} unit="litros" label="sellados con cemento" y={230} size={190} out={A('v02', 'el siempre') - 0.2} />
    <Stamp t={t} t0={A('v02', 'juzgaron')} text="NUNCA FUE JUZGADO" x={540} y={620} rot={-6} size={84} out={A('v02', 'cuando la') - 0.2} />
    <BigWord t={t} t0={A('v02', 'ya no') + 0.2} text="YA NO ESTABA" size={140} y={300} color={K.blood} out={S('v03') - 0.2} />
    {/* v03 */}
    <BigWord t={t} t0={A('v03', 'hugo jara')} text="HUGO JARA" size={170} y={230} out={A('v03', 'se hizo') - 0.1} />
    <NameCard t={t} t0={A('v03', 'claudio nozzi')} name="Claudio Nozzi" role="productor de cine" y={1000} out={A('v03', 'y se subio') - 0.1} />
    <Slate t={t} t0={A('v03', 'en marzo')} lines={['RÍO PARANÁ · MARZO DE 2005']} x={70} y={220} size={30} out={A('v03', 'la prefectura') - 0.2} />
    <Stamp t={t} t0={A('v03', 'detuvo')} text="DETENIDO" x={540} y={520} rot={-8} size={110} out={A('v03', 'que era') - 0.1} />
    <Strike t={t} t0={A('v03', 'que era')} text="HUGO JARA" strikeAt={A('v03', 'que era') + 0.2} y={230} size={130} out={A('v03', 'pero el juicio') - 0.2} />
    <Stamp t={t} t0={A('v03', 'interpol')} text="BUSCADO POR INTERPOL" x={540} y={1080} rot={-5} size={64} out={A('v03', 'pero el juicio') - 0.2} />
    <YearRoll t={t} t0={A('v03', 'en 2009') - 0.3} from={2005} to={2009} dur={1.0} label="4 AÑOS SIN CONDENA" y={320} out={S('v04') - 0.1} />
    <Stamp t={t} t0={A('v03', 'libre')} text="LIBRE" x={540} y={760} rot={-8} size={140} color={K.ember} out={S('v04') - 0.1} />
    {/* v04 */}
    <NameCard t={t} t0={A('v04', 'manuel roseo')} name="Manuel Roseo" role="75 años · vivía como un peón" y={1000} out={A('v04', 'era dueno') - 0.2} />
    <BigNumber t={t} t0={A('v04', '250000')} to={250000} unit="ha" label="en el Impenetrable" y={280} size={180} out={A('v04', 'un campo') - 0.2} />
    <Polaroid t={t} t0={A('v04', 'el 6')} file="castelli_plaza.jpg" caption="Castelli · 6/1/2011" flashAt={A('v04', 'foto')} rot={-4} y={330} out={A('v04', 'siete dias') - 0.2} />
    <PhotoCredit file="castelli_plaza.jpg" o={Math.min(prog(t, A('v04', 'el 6'), 0.3), 1 - prog(t, A('v04', 'siete dias') - 0.4, 0.3))} extra="Ilustración: no es la foto de la visita" />
    <Flash t={t} tc={A('v04', 'foto')} k={0.9} color="rgba(255,255,255,1)" />
    <BigWord t={t} t0={A('v04', 'siete dias')} text="+7 DÍAS" size={120} y={230} color={K.ember} out={A('v04', 'tres hombres') + 0.4} />
    <Lines t={t} align="center" x={0} w={1080} y={360} items={[{text: 'Una firma', at: A('v04', 'una firma'), big: true}, {text: 'Una huella', at: A('v04', 'una huella'), big: true}, {text: 'Las escrituras', at: A('v04', 'las escrituras'), big: true, red: true}]} size={70} out={A('v04', 'roseo y') - 0.2} />
    <BigWord t={t} t0={A('v04', 'roseo y') + 0.2} text="MANUEL ROSEO · NÉLIDA BARTOLOMÉ" size={70} y={520} color={K.ash} spacing={4} out={A('v04', 'un empleado') - 0.3} />
    <BigWord t={t} t0={A('v04', 'sobrevivio')} text="SOBREVIVIÓ" size={170} y={300} out={A('v04', 'y recordo') - 0.1} />
    <Stutter t={t} t0={A('v04', 'tartamudeo') - 0.5} word="TARTAMUDEO" y={420} size={120} out={S('v05') - 0.2} />
    {/* v05 */}
    <Stamp t={t} t0={A('v05', 'dos perpetuas')} text="PERPETUA" x={540} y={460} rot={-8} size={120} out={A('v05', 'y jura') - 0.1} />
    <Stamp t={t} t0={A('v05', 'perpetuas') + 0.3} text="PERPETUA" x={560} y={760} rot={6} size={120} out={A('v05', 'y jura') - 0.1} />
    <Tag t={t} t0={A('v05', 'y jura')} text="Su versión" y={230} out={A('v05', 'el campo') - 0.1} />
    <BigNumber t={t} t0={A('v05', 'parque nacional')} to={128000} unit="ha" label="Parque Nacional El Impenetrable" y={260} size={150} out={A('v05', 'en agosto') - 0.2} />
    <Tag t={t} t0={A('v05', 'y su abogado')} text="Según su abogado" y={230} out={A('v05', 'pero hay') - 0.1} />
    <BigWord t={t} t0={A('v05', 'netflix')} text="NETFLIX QUIERE CONTAR SU VIDA" size={96} y={340} spacing={2} out={A('v05', 'pero hay') - 0.1} />
    <Stamp t={t} t0={A('v05', 'vida') + 0.2} text="NO CONFIRMADO" x={540} y={760} rot={-5} size={84} out={A('v05', 'pero hay') - 0.1} />
    <BigWord t={t} t0={A('v05', 'pero hay')} text="HAY MUCHO MÁS" size={140} y={300} color={K.ember} out={A('v05', 'la fuga') - 0.05} />
    <EndCTA t={t} t0={CTA + 0.2} />
  </>
);

/** subtítulos: se ocultan en la placa del título y en la placa final */
const hideCaps = (t: number) => (t > TITLE_AT + 0.1 && t < A('v01', 'y del crimen') - 0.1) || t > CTA + 0.2;

export const Vert: React.FC = () => {
  const ok = useAssets15();
  const f = useCurrentFrame();
  const t = f / V.TL.fps;
  if (!ok) return null;
  const nodes: React.ReactNode[] = [];
  SHOTS.forEach((s, i) => {
    const end = i + 1 < SHOTS.length ? SHOTS[i + 1].a : V.TOTAL + 1;
    const start = s.a - (s.fi ?? 0);
    if (t < start || t >= end) return;
    const o = s.fi ? easeInOut(clamp((t - start) / s.fi)) : 1;
    nodes.push(<AbsoluteFill key={i} style={{opacity: o}}>{s.el(t)}</AbsoluteFill>);
  });
  const cur = SHOTS.reduce((k, s, i) => (t >= s.a ? i : k), 0);
  const satO = SHOTS[cur].sat ? Math.min(1, (t - SHOTS[cur].a) / 0.4) : 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Filters />
      {nodes}
      <FilmLook t={t} />
      <Overlays t={t} />
      <Captions t={t} words={WORDS} y={1290} hide={hideCaps} />
      {satO > 0 ? <div style={{opacity: satO}}><Credit text={SAT_CREDIT} side="left" /></div> : null}
    </AbsoluteFill>
  );
};
const WORDS = V.words();
