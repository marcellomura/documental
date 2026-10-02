/* Escenas 6–10 del episodio 10 (El cuadro del nazi). t = segundos desde el inicio del segmento. */
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {F} from '../theme';
import {LogoMark} from '../ep04/kit';
import {cue} from './lib';
import {
  Big, Chip, Count, Credit, DateCard, Dossier, FT, FlatMap, FullPhoto, GiltFrame, K, MapPin, MapRoute, MapView, Motes, MuseumLabel, NoirBg, PersonGlyph, PhotoCard, Place, SrcLine, Stamp, Typed, Vig, YearRoll,
  between, clamp, easeIn, easeInOut, easeOut, fadeIO, fmt, pop, prog, rnd,
} from './kit10';
import {Cam, camPath, project, PAINT_POS, SECOND_POS} from './three10';
import {CH_NEAR, CH_WIDE, CH_WINDOW, ChaletShot, Cork, FieldShot, GPin, GlobeShot, ListingPhone, MarkerCircle, NotebookShot, PHOTO_W, ROOM_MID, ROOM_PAINT, ROOM_WIDE, Recre, RedString, RoomShot} from './shots10';
import {BSAS, MDP} from './scenes10a';

type P = {t: number};
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/* =====================================================================================
   S06 · los peores: Eichmann, Mengele, Priebke. El Mossad en San Fernando.
   ===================================================================================== */
const BA: MapView = {lon: -58.5, lat: -34.53, scale: 1500};
const SAN_FERNANDO: [number, number] = [-58.56, -34.44];
export const S06: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s06', p, n);
  const tAdolf = c('Adolf'), tOrg = c('organizadores'), tEntro = c('entró'), tRicardo = c('como Ricardo'), tMerc = c('Mercedes'), tJosef = c('Josef'), tMedico = c('el médico'), tVivio = c('vivió diez'), tErich = c('Erich');
  const tBari = c('Bariloche.'), tAEich = c('A Eichmann'), tComando = c('comando'), tMossad = c('Mossad'), tSesenta = c('sesenta,'), tCalle = c('calle'), tSanF = c('San Fernando.'), tPero = c('Pero la mayoría'), tYlo = c('Y lo que');
  // cámara sobre el tablero
  const focus = (x: number, y: number, s: number) => ({x, y, s});
  const keys: [number, {x: number; y: number; s: number}][] = [
    [-1, focus(960, 540, 1.0)],
    [tAdolf - 0.3, focus(560, 520, 1.45)],
    [tJosef - 0.3, focus(1030, 520, 1.45)],
    [tErich - 0.3, focus(1460, 520, 1.45)],
    [tBari + 0.2, focus(960, 540, 1.0)],
  ];
  let f = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const k = easeInOut(clamp((t - keys[i][0]) / 0.9));
    if (k > 0) f = {x: mix(f.x, keys[i][1].x, k), y: mix(f.y, keys[i][1].y, k), s: mix(f.s, keys[i][1].s, k)};
  }
  const tx = Math.min(0, Math.max(1920 - 1920 * f.s, 960 - f.x * f.s)), ty = Math.min(0, Math.max(1080 - 1080 * f.s, 540 - f.y * f.s));
  const board = (
    <AbsoluteFill style={{transform: `translate(${tx}px, ${ty}px) scale(${f.s})`, transformOrigin: '0 0'}}>
      <Cork />
      <RedString a={[430, 210]} b={[960, 960]} p={prog(t, tAdolf + 0.3, 0.8)} />
      <RedString a={[1030, 210]} b={[960, 960]} p={prog(t, tJosef + 0.3, 0.8)} />
      <RedString a={[1490, 210]} b={[960, 960]} p={prog(t, tErich + 0.3, 0.8)} />
      {/* Eichmann */}
      <PhotoCard t={t} t0={tAdolf - 0.1} src="ep10/img/eichmann_1942.jpg" x={430} y={430} w={290} h={380} rot={-3} caption="ADOLF EICHMANN" focus="50% 25%" capSize={28} tape={false} />
      <Typed t={t} t0={tOrg - 0.1} text="Organizador del Holocausto" size={26} cps={40} color={K.cream} cursor={false} style={{position: 'absolute', left: 260, top: 690, width: 360, textShadow: '0 2px 6px #000'}} />
      <PhotoCard t={t} t0={tRicardo - 0.1} src="ep10/img/eichmann_cr.jpg" x={700} y={560} w={200} h={250} rot={5} caption="«Ricardo Klement»" focus="50% 30%" capSize={22} tape from="right" />
      <Chip t={t} t0={tEntro} t1={tJosef + 0.2} text="LLEGA EN 1950" x={430} y={170} color={K.red} size={28} />
      <Chip t={t} t0={tMerc - 0.1} t1={tJosef + 0.2} text="TRABAJÓ EN MERCEDES-BENZ" x={520} y={790} color={K.cream} size={26} />
      {/* Mengele */}
      <PhotoCard t={t} t0={tJosef - 0.1} src="ep10/img/mengele_auschwitz.jpg" x={1030} y={430} w={290} h={380} rot={2} caption="JOSEF MENGELE" focus="50% 25%" capSize={28} tape={false} />
      <Typed t={t} t0={tMedico} text="El médico de Auschwitz" size={26} cps={40} color={K.cream} cursor={false} style={{position: 'absolute', left: 880, top: 690, width: 360, textShadow: '0 2px 6px #000'}} />
      <Chip t={t} t0={tVivio} t1={tErich + 0.2} text="10 AÑOS EN EL GRAN BUENOS AIRES" x={1030} y={790} color={K.cream} size={26} />
      {/* Priebke */}
      <PhotoCard t={t} t0={tErich - 0.1} src="ep10/img/priebke_cr.png" x={1490} y={430} w={290} h={380} rot={-2} caption="ERICH PRIEBKE" focus="50% 30%" capSize={28} tape={false} />
      <Chip t={t} t0={c('décadas')} text="DÉCADAS EN BARILOCHE" x={1490} y={700} color={K.cream} size={26} />
      {/* la Argentina */}
      <div style={{position: 'absolute', left: 960 - 170, top: 920, width: 340, padding: '14px 0', textAlign: 'center', background: K.paper, fontFamily: F.head, fontSize: 52, color: K.ink, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', transform: 'rotate(-1deg)', opacity: prog(t, tAdolf + 0.6, 0.4)}}>ARGENTINA</div>
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {t < tAEich + 0.4 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tAEich, 0.4), overflow: 'hidden'}}>
          {board}
          <Big t={t} t0={0.0} t1={tAdolf - 0.1} text="LLEGARON ALGUNOS DE LOS PEORES" size={110} y={540} hl={{PEORES: K.red}} />
          <Credit text="Fotos: dominio público (Wikimedia Commons)" />
          <Vig k={0.5} />
        </AbsoluteFill>
      ) : null}
      {/* el Mossad en San Fernando */}
      {between(t, tAEich - 0.2, tPero + 0.5) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tAEich - 0.2, tPero + 0.5, 0.4)}}>
          <FlatMap v={BA} hl={{ARG: '#2C2822', URY: '#211E1A'}} sea="#0E1820">
            <MapPin v={BA} lon={SAN_FERNANDO[0]} lat={SAN_FERNANDO[1]} label="SAN FERNANDO" sub="CALLE GARIBALDI" o={prog(t, tCalle - 0.4, 0.4)} color={K.red} side="r" />
            <MapPin v={BA} lon={-58.38} lat={-34.6} label="BUENOS AIRES" o={prog(t, tAEich, 0.4)} color={K.cream} side="l" size={26} />
          </FlatMap>
          <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
            {(() => {
              const [x, y] = [mapX(SAN_FERNANDO), mapY(SAN_FERNANDO)];
              return [0, 1, 2].map((i) => {
                const ph = (t * 0.8 + i / 3) % 1;
                return <circle key={i} cx={x} cy={y} r={20 + ph * 120} fill="none" stroke={K.red} strokeWidth={4} opacity={(1 - ph) * prog(t, tSanF - 0.3, 0.4)} />;
              });
            })()}
          </svg>
          <DateCard t={t} t0={tSesenta - 0.6} d={11} m={5} y={1960} x={260} yPos={300} size={0.85} />
          <Chip t={t} t0={tComando} text="UN COMANDO DEL MOSSAD" x={600} y={860} color={K.blue} size={40} />
          <PhotoCard t={t} t0={tMossad + 0.3} src="ep10/img/eichmann_juicio.jpg" x={1470} y={460} w={460} h={580} rot={2.5} caption="Juzgado en Israel en 1961" credit="Oficina de Prensa del Gobierno de Israel, dominio público" focus="50% 30%" capSize={24} from="right" />
        </AbsoluteFill>
      ) : null}
      {/* la mayoría nunca fue juzgada; lo que trajeron nunca se devolvió */}
      {t > tPero ? (
        <AbsoluteFill style={{opacity: prog(t, tPero, 0.4)}}>
          <NoirBg t={t} glow="rgba(200,49,44,0.12)" />
          <div style={{position: 'absolute', left: 260, top: 160, width: 1400, display: 'flex', flexWrap: 'wrap', gap: 6, opacity: 0.9 * (1 - prog(t, tYlo, 0.4))}}>
            {Array.from({length: 180}, (_, i) => (
              <PersonGlyph key={i} size={34} color={K.red} o={prog(t, tPero + i * 0.004, 0.2)} />
            ))}
          </div>
          <Big t={t} t0={tPero + 0.2} t1={tYlo} text="LA MAYORÍA NUNCA FUE JUZGADA" size={110} y={840} />
          {t > tYlo - 0.1 ? (
            <AbsoluteFill style={{opacity: prog(t, tYlo - 0.1, 0.4)}}>
              <div style={{position: 'absolute', left: 560, top: 540, transform: `translate(-50%,-50%) scale(${0.62 + 0.03 * clamp((t - tYlo) / 3)})`, filter: 'brightness(0.55)'}}>
                <GiltFrame src="ep10/img/cuadro.jpg" w={430} h={580} />
              </div>
              <Big t={t} t0={tYlo} text="Y LO QUE TRAJERON, | NUNCA SE DEVOLVIÓ" size={104} x={1300} w={1100} y={540} hl={{DEVOLVIÓ: K.red, NUNCA: K.red}} />
            </AbsoluteFill>
          ) : null}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
const mapX = (p: [number, number]) => 960 + (p[0] - BA.lon) * BA.scale * Math.cos((BA.lat * Math.PI) / 180);
const mapY = (p: [number, number]) => 540 - (p[1] - BA.lat) * BA.scale;

/* =====================================================================================
   S07 · la investigación, la comparación, el allanamiento y el tapiz
   ===================================================================================== */
export const S07: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s07', p, n);
  const tSet = c('setenta'), tHijas = c('Sus dos hijas'), tCasas = c('casas'), tLoQue = c('lo que había'), tPer = c('Unos periodistas'), tHol = c('holandés'), tDiez = c('casi diez'), tHasta = c('hasta llegar');
  const tCuando = c('Cuando vieron'), tComp = c('compararon'), tFotos = c('fotos de archivo'), tMismo = c('Era el mismo.'), tPubl = c('Lo publicaron'), tVein = c('veinticinco'), tDos = c('Dos días'), tAllan = c('allanó');
  const tYel = c('Y el cuadro'), tNo = c('no estaba.'), tMisma = c('En la misma'), tTapiz = c('tapiz');
  const chCam = camPath(t, [
    [tHijas - 0.4, CH_WIDE],
    [tHijas + 0.3, CH_NEAR],
    [tLoQue - 0.3, CH_WINDOW],
  ], 2.4);
  const raidCam = camPath(t, [
    [tDos - 0.3, {pos: [6.5, 2.0, 16.5], look: [0, 1.6, 2], fov: 36}],
    [tDos + 0.3, {pos: [3.5, 1.7, 13], look: [0, 1.6, 2], fov: 36}],
  ], 3.0);
  const roomCam = camPath(t, [
    [tYel - 0.4, ROOM_MID],
    [tMisma, {pos: [0.4, 1.85, 2.6], look: [0, 1.85, 0], fov: 38}],
  ], 2.0);
  const scan = ((t - tComp) / 1.6) % 1;
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {/* A · murió en 1978 */}
      {t < tHijas + 0.4 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tHijas, 0.4)}}>
          <NoirBg t={t} />
          <Dossier t={t} t0={-0.6} x={960} y={560} title="FRIEDRICH KADGIEN" noPhoto rows={[{k: 'NACIÓ', v: '1907, Alemania', t0: -1}, {k: 'APODO', v: '«La Serpiente»', t0: -1, color: K.red}, {k: 'MURIÓ', v: '1978, en la Argentina', t0: tSet - 0.3}]} />
          <Stamp t={t} t0={tSet + 0.2} text="† 1978" x={1450} y={300} rot={-8} size={84} />
        </AbsoluteFill>
      ) : null}
      {/* B · las hijas heredan casas en Mar del Plata */}
      {between(t, tHijas - 0.2, tPer + 0.4) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tHijas - 0.2, tPer + 0.4, 0.35)}}>
          <ChaletShot t={t} cam={chCam} s={{t, lights: 1}} />
          <Place t={t} t0={tHijas} a="MAR DEL PLATA" b="LA HERENCIA DE SUS DOS HIJAS" />
          <Chip t={t} t0={tLoQue} text="Y LO QUE HABÍA ADENTRO" x={960} y={930} color={K.amber} size={40} />
          <Recre />
        </AbsoluteFill>
      ) : null}
      {/* C · casi diez años de investigación */}
      {between(t, tPer - 0.2, tCuando + 0.4) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tPer - 0.2, tCuando + 0.4, 0.35)}}>
          <NoirBg t={t} glow="rgba(125,187,230,0.16)" />
          <Place t={t} t0={tPer} a="LA INVESTIGACIÓN" b="PERIODISTAS DEL DIARIO NEERLANDÉS AD" color={K.blue} />
          {(() => {
            const k = easeInOut(clamp((t - tDiez + 0.3) / 2.2));
            const x0 = 260, x1 = 1660;
            return (
              <>
                <div style={{position: 'absolute', left: x0, top: 560, width: (x1 - x0) * k, height: 8, background: K.blue, boxShadow: `0 0 20px ${K.blue}`}} />
                {Array.from({length: 10}, (_, i) => {
                  const x = x0 + ((x1 - x0) * i) / 9;
                  const on = k * 9 >= i - 0.01;
                  return (
                    <div key={i} style={{position: 'absolute', left: x - 50, top: 590, width: 100, textAlign: 'center', fontFamily: FT.type, fontSize: 30, color: on ? K.cream : 'rgba(241,231,211,0.2)'}}>
                      <div style={{width: 18, height: 18, borderRadius: 9, background: on ? K.blue : '#333', margin: '-46px auto 20px'}} />
                      {2016 + i}
                    </div>
                  );
                })}
                <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: F.head, fontSize: 120, color: K.cream, opacity: prog(t, tDiez - 0.2, 0.3)}}>CASI 10 AÑOS</div>
                <div style={{position: 'absolute', left: x1 - 40, top: 470, opacity: prog(t, tHasta, 0.3), transform: `scale(${pop(t, tHasta)})`}}>
                  <div style={{fontFamily: F.head, fontSize: 64, color: K.red}}>2025</div>
                </div>
                <Typed t={t} t0={tHasta} text="…hasta la casa de una de las hijas, en Mar del Plata." size={36} cps={42} style={{position: 'absolute', left: 260, top: 760, width: 1400}} />
              </>
            );
          })()}
        </AbsoluteFill>
      ) : null}
      {/* D · la comparación: el aviso contra la foto de archivo */}
      {between(t, tCuando - 0.2, tPubl + 0.4) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tCuando - 0.2, tPubl + 0.4, 0.35)}}>
          <NoirBg t={t} />
          <div style={{position: 'absolute', left: 0, top: 0, width: 960, height: 1080, overflow: 'hidden'}}>
            <RoomShot cam={{pos: [0, 1.92, 2.3], look: [0, 1.92, 0], fov: 34}} s={{t, painting: 1, tapestry: 0}} w={960} h={1080} />
          </div>
          <div style={{position: 'absolute', left: 958, top: 0, width: 4, height: 1080, background: K.cream, opacity: 0.6}} />
          <PhotoCard t={t} t0={tFotos - 0.4} src="ep10/img/cuadro_rce_crop.jpg" x={1440} y={520} w={540} h={726} rot={1.5} focus="50% 50%" tape={false} credit="Rijksdienst voor het Cultureel Erfgoed (RCE), dominio público" from="right" />
          <Chip t={t} t0={tCuando} text="EL AVISO · 2025" x={480} y={80} color={K.blue} size={34} />
          <Chip t={t} t0={tFotos - 0.2} text="ARCHIVO GOUDSTIKKER" x={1440} y={80} color={K.gold} size={34} />
          {between(t, tComp, tMismo) ? (
            <AbsoluteFill>
              <div style={{position: 'absolute', left: 0, width: 1920, top: 140 + scan * 800, height: 3, background: K.blue, boxShadow: `0 0 18px ${K.blue}`, opacity: 0.85}} />
              <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
                {[[480, 330, 1440, 300], [470, 560, 1430, 560], [520, 760, 1470, 790]].map(([x1, y1, x2, y2], i) => (
                  <g key={i} opacity={prog(t, tFotos + i * 0.4, 0.3)}>
                    <circle cx={x1} cy={y1} r={26} fill="none" stroke={K.blue} strokeWidth={4} />
                    <circle cx={x2} cy={y2} r={26} fill="none" stroke={K.gold} strokeWidth={4} />
                    <line x1={x1 + 26} y1={y1} x2={x2 - 26} y2={y2} stroke={K.cream} strokeWidth={2} strokeDasharray="8 8" />
                  </g>
                ))}
              </svg>
            </AbsoluteFill>
          ) : null}
          <Stamp t={t} t0={tMismo} text="ES EL MISMO" x={960} y={540} rot={-8} size={110} color={K.red} bg="rgba(11,9,7,0.5)" />
          <Recre x={980} />
        </AbsoluteFill>
      ) : null}
      {/* E · 25 de agosto: sale publicado */}
      {between(t, tPubl - 0.2, tDos + 0.4) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tPubl - 0.2, tDos + 0.4, 0.3)}}>
          <NoirBg t={t} glow="rgba(125,187,230,0.16)" />
          <DateCard t={t} t0={tVein - 0.4} d={25} m={8} y={2025} x={960} yPos={480} label="SE PUBLICA LA INVESTIGACIÓN" color={K.blue} />
        </AbsoluteFill>
      ) : null}
      {/* F · el allanamiento */}
      {between(t, tDos - 0.2, tYel + 0.4) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tDos - 0.2, tYel + 0.4, 0.3)}}>
          <ChaletShot t={t} cam={raidCam} s={{t, lights: 0.6, police: prog(t, tAllan - 0.6, 0.3), sign: 1}} />
          <DateCard t={t} t0={tDos} d={27} m={8} y={2025} x={250} yPos={250} size={0.75} color={K.blue} />
          <Big t={t} t0={tAllan} text="ALLANAMIENTO" size={150} y={900} />
          <Recre />
        </AbsoluteFill>
      ) : null}
      {/* G · el cuadro ya no estaba: un tapiz de caballos */}
      {t > tYel - 0.2 ? (
        <AbsoluteFill style={{opacity: prog(t, tYel - 0.2, 0.3)}}>
          <RoomShot cam={roomCam} s={{t, painting: 0, tapestry: easeOut(clamp((t - tTapiz + 0.6) / 1.0)), ghost: 1 - prog(t, tTapiz - 0.4, 0.8), lamp: 0.8}} />
          <Big t={t} t0={tNo - 0.3} t1={tMisma + 0.3} text="EL CUADRO YA NO ESTABA" size={120} y={900} hl={{ESTABA: K.red, NO: K.red}} />
          <Chip t={t} t0={tTapiz} text="EN SU LUGAR: UN TAPIZ DE CABALLOS" x={960} y={950} color={K.gold} size={40} />
          <Recre />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* =====================================================================================
   S08 · la noticia, la entrega, Ceruti, el fallo y la devolución
   ===================================================================================== */
const HEADLINES = [
  {text: 'Cuadro robado por los nazis aparece en Mar del Plata', lang: 'ES', x: 420, y: 200},
  {text: 'Nazi-looted painting found in Argentina', lang: 'EN', x: 1480, y: 260},
  {text: 'Door nazi’s geroofd schilderij duikt op', lang: 'NL', x: 380, y: 820},
  {text: 'Raubkunst in Argentinien entdeckt', lang: 'DE', x: 1500, y: 860},
  {text: 'Tableau volé par les nazis retrouvé', lang: 'FR', x: 1450, y: 560},
];
export const S08: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s08', p, n);
  const tHija = c('La hija'), tArresto = c('arresto'), tTres = c('y el tres'), tEntrego = c('entregó'), tAut = c('Era auténtico:'), tGiac = c('Giacomo'), tTresc = c('trescientos'), tVal = c('valuado'), tDosc = c('doscientos');
  const tCuatro = c('Y el cuatro'), tJusticia = c('la Justicia federal'), tCerro = c('cerró'), tPareja = c('la pareja'), tRen = c('renunció'), tYret = c('y el retrato'), tNuera = c('nuera'), tOch = c('ochenta'), tPrim = c('Es la primera'), tDev = c('devuelve');
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {/* A · la noticia da la vuelta al mundo */}
      {t < tHija + 0.4 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tHija, 0.4)}}>
          <NoirBg t={t} glow="rgba(125,187,230,0.12)" />
          <GlobeShot t={t} v={{lon: -20 + t * 40, lat: 10, dist: 11}} countries={[{a3: 'ARG', color: '#7DBBE6', o: 0.8}, {a3: 'NLD', color: '#D6AF5C', o: 0.8}]} />
          {HEADLINES.map((h, i) => (
            <div key={i} style={{position: 'absolute', left: h.x, top: h.y, transform: `translate(-50%,-50%) scale(${Math.min(1, pop(t, 0.15 + i * 0.25))})`, background: K.paper, padding: '14px 22px', boxShadow: '0 12px 30px rgba(0,0,0,0.5)', maxWidth: 560}}>
              <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 16, color: K.red, letterSpacing: 2}}>{h.lang}</div>
              <div style={{fontFamily: F.quote, fontWeight: 700, fontSize: 30, color: K.ink, lineHeight: 1.15}}>{h.text}</div>
            </div>
          ))}
        </AbsoluteFill>
      ) : null}
      {/* B · arresto domiciliario y entrega */}
      {between(t, tHija - 0.2, tAut + 0.4) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tHija - 0.2, tAut + 0.4, 0.35)}}>
          <NoirBg t={t} />
          <DateCard t={t} t0={tArresto - 0.2} d={2} m={9} y={2025} x={560} yPos={430} label="ARRESTO DOMICILIARIO PARA LA HIJA Y SU MARIDO" color={K.blue} />
          <DateCard t={t} t0={tTres} d={3} m={9} y={2025} x={1360} yPos={430} label="SU ABOGADO ENTREGA EL CUADRO" color={K.blue} />
        </AbsoluteFill>
      ) : null}
      {/* C · auténtico: Giacomo Ceruti, 250.000 euros */}
      {between(t, tAut - 0.2, tCuatro + 0.4) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tAut - 0.2, tCuatro + 0.4, 0.35)}}>
          <NoirBg t={t} glow="rgba(214,175,92,0.22)" x={34} />
          <Motes t={t} n={30} o={0.6} />
          <div style={{position: 'absolute', left: 600, top: 540, transform: `translate(-50%,-50%) scale(${0.86 + 0.04 * clamp((t - tAut) / 8)})`}}>
            <GiltFrame src="ep10/img/cuadro.jpg" w={560} h={756} />
          </div>
          <Stamp t={t} t0={tAut + 0.1} text="AUTÉNTICO" x={860} y={820} rot={-8} size={84} color={K.red} bg="rgba(11,9,7,0.7)" />
          <MuseumLabel t={t} t0={tGiac - 0.3} x={1120} y={300} w={640} lines={[
            {text: 'Giacomo Ceruti', t0: tGiac - 0.2, style: {fontWeight: 800, fontSize: 46}},
            {text: 'Milán, 1698 – 1767', t0: tGiac + 0.3, style: {fontSize: 26, color: '#6E6352'}},
            {text: 'Retrato de una dama', t0: tTresc - 0.6, style: {fontStyle: 'italic', marginTop: 14}},
            {text: 'Óleo sobre tela · siglo XVIII', t0: tTresc, style: {fontSize: 26, color: '#6E6352'}},
          ]} />
          {t > tVal - 0.2 ? (
            <div style={{position: 'absolute', left: 1120, top: 640, opacity: prog(t, tVal - 0.2, 0.3)}}>
              <div style={{fontFamily: FT.type, fontSize: 32, color: K.mute}}>valuado en</div>
              <div style={{fontFamily: F.head, fontSize: 150, color: K.gold, lineHeight: 1}}>
                € <Count t={t} t0={tDosc - 0.2} dur={1.2} from={0} to={250000} />
              </div>
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}
      {/* D · el fallo: 4 de septiembre de 2026 */}
      {between(t, tCuatro - 0.2, tYret + 0.4) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tCuatro - 0.2, tYret + 0.4, 0.35)}}>
          <NoirBg t={t} glow="rgba(125,187,230,0.14)" />
          <DateCard t={t} t0={tCuatro} d={4} m={9} y={2026} x={330} yPos={380} color={K.blue} />
          <div style={{position: 'absolute', left: 640, top: 250, width: 1150}}>
            <div style={{fontFamily: FT.type, fontSize: 36, color: K.mute, opacity: prog(t, tJusticia, 0.3)}}>Justicia federal de Mar del Plata</div>
            <div style={{fontFamily: F.head, fontSize: 120, color: K.cream, lineHeight: 1.0, opacity: prog(t, tCerro - 0.1, 0.3), transform: `translateY(${(1 - prog(t, tCerro - 0.1, 0.4)) * 30}px)`}}>CASO CERRADO</div>
            <div style={{marginTop: 40, opacity: prog(t, tPareja, 0.3)}}>
              <Typed t={t} t0={tRen - 0.2} text={'La pareja renuncia al cuadro\ny así evita ir a juicio.'} size={44} cps={40} />
            </div>
          </div>
          {/* martillo */}
          <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: prog(t, tJusticia - 0.3, 0.3)}}>
            <ellipse cx={420} cy={812} rx={120} ry={22} fill="#2E1F14" />
            <rect x={300} y={772} width={240} height={40} rx={8} fill="#5A3C24" />
            <ellipse cx={420} cy={772} rx={120} ry={22} fill="#7A5434" />
            {(() => {
              const ang = t < tCerro ? -38 * prog(t, tCerro - 0.7, 0.5) : -38 * (1 - Math.min(1, pop(t, tCerro - 0.04, 2.2)));
              return (
                <g transform={`translate(170 690) rotate(${ang})`}>
                  <rect x={0} y={-11} width={230} height={22} rx={10} fill="#6B4A2A" />
                  <rect x={-14} y={-15} width={26} height={30} rx={8} fill="#4A3220" />
                  <rect x={210} y={-56} width={84} height={112} rx={16} fill="#8A5E34" />
                  <rect x={210} y={-56} width={84} height={18} rx={8} fill="#C9A24A" />
                  <rect x={210} y={38} width={84} height={18} rx={8} fill="#C9A24A" />
                </g>
              );
            })()}
          </svg>
        </AbsoluteFill>
      ) : null}
      {/* E · vuelve a la nuera de Goudstikker */}
      {between(t, tYret - 0.2, tPrim + 0.4) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tYret - 0.2, tPrim + 0.4, 0.35)}}>
          <NoirBg t={t} glow="rgba(214,175,92,0.2)" />
          <div style={{position: 'absolute', left: 520, top: 520, transform: `translate(-50%,-50%) scale(${0.62 + 0.04 * clamp((t - tYret) / 5)})`}}>
            <GiltFrame src="ep10/img/cuadro.jpg" w={430} h={580} />
          </div>
          <div style={{position: 'absolute', left: 900, top: 290, width: 900}}>
            <div style={{fontFamily: F.head, fontSize: 96, color: K.cream, lineHeight: 1, opacity: prog(t, tYret, 0.3)}}>VUELVE A LA FAMILIA</div>
            <div style={{fontFamily: F.head, fontSize: 70, color: K.gold, marginTop: 24, opacity: prog(t, tNuera - 0.1, 0.3)}}>MAREI VON SAHER</div>
            <div style={{opacity: prog(t, tNuera + 0.3, 0.3)}}>
              <Typed t={t} t0={tNuera + 0.3} text={'Nuera de Goudstikker: viuda de Edo,\nel bebé que iba en el barco.'} size={38} cps={44} />
            </div>
            <div style={{fontFamily: F.head, fontSize: 60, color: K.cream, marginTop: 24, opacity: prog(t, tOch - 0.2, 0.3)}}>HOY TIENE MÁS DE 80 AÑOS</div>
          </div>
        </AbsoluteFill>
      ) : null}
      {/* F · la primera vez */}
      {t > tPrim - 0.2 ? (
        <AbsoluteFill style={{opacity: prog(t, tPrim - 0.2, 0.35)}}>
          <NoirBg t={t} glow="rgba(214,175,92,0.28)" />
          <Motes t={t} n={40} o={0.8} />
          <div style={{position: 'absolute', left: 960, top: 380, transform: `translate(-50%,-50%) scale(${0.5 + 0.03 * clamp((t - tPrim) / 5)})`}}>
            <GiltFrame src="ep10/img/cuadro.jpg" w={430} h={580} />
          </div>
          <Big t={t} t0={tPrim} text="LA PRIMERA VEZ" size={150} y={780} color={K.gold} />
          <Typed t={t} t0={tDev - 0.4} text="que la Justicia argentina devuelve una obra robada por los nazis" size={40} cps={46} style={{position: 'absolute', left: 260, width: 1400, top: 880, textAlign: 'center'}} cursor={false} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* =====================================================================================
   S09 · el segundo cuadro, el cuaderno, las 100.000 obras que faltan
   ===================================================================================== */
export const S09: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s09', p, n);
  const tInv = c('Los investigadores'), tSeg = c('un segundo'), tNat = c('una naturaleza'), tFoto = c('foto'), tHasta = c('Hasta hoy,'), tEntr = c('entregó.'), tYdel = c('Y del cuaderno'), tFaltan = c('faltan'), tCientos = c('cientos');
  const tMundo = c('En el mundo,'), tCien = c('cien mil'), tEsperan = c('esperan'), tMuseo = c('En un museo,'), tRemate = c('remate,'), tArriba = c('arriba de un');
  const roomCam = camPath(t, [
    [-1, ROOM_WIDE],
    [tSeg - 0.6, {pos: [2.0, 1.75, 2.9], look: [SECOND_POS[0], SECOND_POS[1], 0], fov: 36}],
  ], 2.0);
  const nbCam: Cam = {pos: [0.1, 2.75, 1.3], look: [0, 0, 0.05], fov: 38};
  const fCam = camPath(t, [
    [tMundo - 0.3, {pos: [0, 4.0, 8.5], look: [0, 0.5, 0], fov: 44}],
    [tEsperan, {pos: [0, 7.5, 8.0], look: [0, 0, 0], fov: 44}],
  ], 3);
  const panels = [
    {t0: tMuseo - 0.15, label: 'EN UN MUSEO'},
    {t0: tRemate - 0.15, label: 'EN UN REMATE'},
    {t0: tArriba - 0.15, label: 'O ARRIBA DE UN SILLÓN'},
  ];
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {/* A · un segundo cuadro */}
      {t < tNat + 0.4 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tNat, 0.4)}}>
          <RoomShot cam={roomCam} s={{t, painting: 0, tapestry: 1, second: prog(t, tSeg - 0.4, 0.6), secondReveal: 0, lamp: 0.8}} />
          <Big t={t} t0={0} t1={tInv} text="PERO LA HISTORIA NO TERMINÓ" size={110} y={540} />
          <Chip t={t} t0={tSeg} text="UN SEGUNDO CUADRO DE GOUDSTIKKER" x={960} y={940} color={K.gold} size={38} />
          <Recre />
        </AbsoluteFill>
      ) : null}
      {/* B · la naturaleza muerta, sin entregar */}
      {between(t, tNat - 0.2, tYdel + 0.4) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tNat - 0.2, tYdel + 0.4, 0.35)}}>
          <NoirBg t={t} />
          <PhotoCard t={t} t0={tNat - 0.2} src="ep10/img/mignon.png" x={700} y={500} w={520} h={700} rot={-2} caption="Abraham Mignon · naturaleza muerta" credit="Foto de archivo (Países Bajos), dominio público" focus="50% 50%" capSize={26} />
          <Typed t={t} t0={tFoto - 0.2} text={'Apareció alguna vez\nen una foto de la familia.'} size={40} cps={40} style={{position: 'absolute', left: 1140, top: 330, width: 680}} />
          <Stamp t={t} t0={tHasta} text="PARADERO DESCONOCIDO" x={1410} y={640} rot={-8} size={56} />
          <Stamp t={t} t0={tEntr} text="NADIE LO ENTREGÓ" x={1410} y={800} rot={6} size={56} />
        </AbsoluteFill>
      ) : null}
      {/* C · del cuaderno negro faltan cientos */}
      {between(t, tYdel - 0.2, tMundo + 0.4) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tYdel - 0.2, tMundo + 0.4, 0.35)}}>
          <NotebookShot cam={nbCam} open={1} flip={clamp((t - tYdel) / 0.6) + clamp((t - tYdel - 0.7) / 0.6)} red={t > tFaltan} />
          <Big t={t} t0={tCientos - 0.2} text="FALTAN CIENTOS DE OBRAS" size={110} y={950} hl={{FALTAN: K.red}} />
          <Recre />
        </AbsoluteFill>
      ) : null}
      {/* D · 100.000 obras esperan */}
      {between(t, tMundo - 0.2, tMuseo + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tMundo - 0.2, tMuseo + 0.3, 0.3)}}>
          <NoirBg t={t} glow="rgba(200,49,44,0.12)" y={60} />
          <FieldShot t={t} cam={fCam} build={1} missing={1} lift={0.3 + 0.25 * Math.sin(t * 1.2)} />
          {t > tCien - 0.2 ? (
            <div style={{position: 'absolute', left: 0, right: 0, top: 80, textAlign: 'center', opacity: prog(t, tCien - 0.2, 0.3)}}>
              <div style={{fontFamily: F.head, fontSize: 160, color: K.red, lineHeight: 1, textShadow: '0 10px 40px #000'}}>100.000</div>
              <div style={{fontFamily: F.head, fontSize: 52, color: K.cream, textShadow: '0 4px 20px #000', opacity: prog(t, tEsperan - 0.1, 0.3)}}>OBRAS ROBADAS ESPERAN QUE ALGUIEN LAS RECONOZCA</div>
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}
      {/* E · en un museo, en un remate, o arriba de un sillón */}
      {t > tMuseo - 0.3 ? (
        <AbsoluteFill style={{opacity: prog(t, tMuseo - 0.3, 0.3)}}>
          <NoirBg t={t} />
          {panels.map((p, i) => {
            const a = prog(t, p.t0, 0.35);
            return (
              <div key={i} style={{position: 'absolute', left: 90 + i * 590, top: 200, width: 560, height: 620, overflow: 'hidden', background: '#16120E', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', opacity: a, transform: `translateY(${(1 - a) * 80}px)`}}>
                {i === 0 ? (
                  <svg width={560} height={620}>
                    <rect width={560} height={620} fill="#E6E1D6" />
                    <rect y={470} width={560} height={150} fill="#B8AE9C" />
                    {[100, 280, 460].map((x, j) => <rect key={j} x={x - 60} y={200} width={120} height={150} fill={j === 1 ? '#3A2A1C' : '#7A6A54'} stroke="#C9A24A" strokeWidth={10} />)}
                    <rect x={210} y={380} width={140} height={14} fill="#999" />
                  </svg>
                ) : i === 1 ? (
                  <svg width={560} height={620}>
                    <rect width={560} height={620} fill="#3A1F1C" />
                    <rect x={170} y={150} width={220} height={270} fill="#2A2018" stroke="#C9A24A" strokeWidth={12} />
                    {Array.from({length: 7}, (_, j) => <circle key={j} cx={70 + j * 70} cy={560} r={28} fill="#1A100E" />)}
                    <g transform="translate(450 470) rotate(-30)">
                      <rect x={-8} y={0} width={16} height={110} fill="#C9A24A" />
                      <circle cx={0} cy={-6} r={34} fill="#F1E7D3" />
                      <text x={0} y={6} textAnchor="middle" fontFamily={F.head} fontSize={34} fill="#1C1611">27</text>
                    </g>
                  </svg>
                ) : (
                  <RoomShot cam={{pos: [0, 1.5, 4.2], look: [0, 1.45, 0], fov: 42}} s={{t, painting: 1, tapestry: 0}} w={560} h={620} />
                )}
                <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: '18px 0', textAlign: 'center', background: 'rgba(11,9,7,0.8)', fontFamily: F.head, fontSize: 44, color: i === 2 ? K.gold : K.cream, letterSpacing: 1}}>{p.label}</div>
              </div>
            );
          })}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* =====================================================================================
   S10 · cierre: 85 años después
   ===================================================================================== */
export const S10: React.FC<P & {total: number}> = ({t, total}) => {
  const c = (p: string, n = 0) => cue('s10', p, n);
  const tFoto = c('una foto'), tDest = c('destapó'), tYnos = c('Y nos'), tDur = c('durante'), tEsc = c('escondites'), tAlg = c('Algunos'), tCuel = c('cuelgan'), tEsp = c('esperando'), tMire = c('mire');
  const tCont = c('Contanos'), tSab = c('¿sabías'), tSi = c('Si te'), tNos = c('Nos vemos');
  const roomCam = camPath(t, [
    [tAlg - 0.3, ROOM_WIDE],
    [tCuel, ROOM_MID],
    [tMire - 0.4, {pos: [0, 1.92, 1.5], look: [0, 1.92, 0], fov: 34}],
  ], 2.6);
  const ARG_PLACES: {p: [number, number]; label: string; sub: string; t0: number; side?: 'l' | 'r'}[] = [
    {p: BSAS, label: 'BUENOS AIRES', sub: 'Eichmann · Mengele', t0: tEsc - 0.6, side: 'l'},
    {p: [-71.3, -41.13], label: 'BARILOCHE', sub: 'Priebke', t0: tEsc - 0.2, side: 'l'},
    {p: MDP, label: 'MAR DEL PLATA', sub: 'el cuadro', t0: tEsc + 0.2},
  ];
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {/* A · 85 años después, una foto de inmobiliaria */}
      {t < tYnos + 0.4 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tYnos, 0.4)}}>
          <NoirBg t={t} glow="rgba(125,187,230,0.2)" x={30} />
          <ListingPhone t={t} idx={3} x={560} y={560} scale={0.95} tilt={0.6} o={prog(t, -0.2, 0.5)} ext={null} living={<RoomShot cam={ROOM_WIDE} s={{t, painting: 1, tapestry: 0}} w={PHOTO_W} h={322} />} />
          <YearRoll t={t} t0={0.1} from={1940} to={2025} dur={1.8} x={1340} y={420} size={220} color={K.cream} />
          <div style={{position: 'absolute', left: 1340, top: 590, transform: 'translateX(-50%)', fontFamily: F.head, fontSize: 80, color: K.gold, whiteSpace: 'nowrap', opacity: prog(t, 1.6, 0.3)}}>85 AÑOS DESPUÉS</div>
          <Typed t={t} t0={tDest - 0.2} text={'una foto de inmobiliaria\ndestapó el secreto'} size={42} cps={40} style={{position: 'absolute', left: 1080, top: 720, width: 560, textAlign: 'center'}} />
        </AbsoluteFill>
      ) : null}
      {/* B · la Argentina, escondite favorito */}
      {between(t, tYnos - 0.2, tAlg + 0.4) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tYnos - 0.2, tAlg + 0.4, 0.35)}}>
          <NoirBg t={t} glow="rgba(125,187,230,0.12)" />
          <GlobeShot t={t} v={{lon: -58 + 6 * (1 - prog(t, tYnos, 3)), lat: -30, dist: 8.6, x: -1.0}} countries={[{a3: 'ARG', color: '#7DBBE6', o: prog(t, tDur - 0.3, 0.6)}]}>
            {(pt) => (
              <>
                {ARG_PLACES.map((p, i) => (
                  <GPin key={i} xy={pt(p.p[0], p.p[1])} label={p.label} sub={p.sub} o={prog(t, p.t0, 0.3)} color={i === 2 ? K.gold : K.red} side={p.side ?? 'r'} />
                ))}
              </>
            )}
          </GlobeShot>
          <div style={{position: 'absolute', left: 1180, top: 300, width: 650}}>
            <div style={{fontFamily: FT.type, fontSize: 38, color: K.mute, opacity: prog(t, tYnos, 0.3)}}>Algo incómodo:</div>
            <div style={{fontFamily: F.head, fontSize: 100, color: K.cream, lineHeight: 1.0, marginTop: 10, opacity: prog(t, tDur, 0.3)}}>
              DURANTE DÉCADAS, <span style={{color: K.blue}}>LA ARGENTINA</span> FUE UNO DE SUS <span style={{color: K.red}}>ESCONDITES FAVORITOS</span>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
      {/* C · secretos que todavía cuelgan de una pared */}
      {between(t, tAlg - 0.2, tCont + 0.4) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tAlg - 0.2, tCont + 0.4, 0.35)}}>
          <RoomShot cam={roomCam} s={{t, painting: 0, tapestry: 0, ghost: 1, lamp: 0.75}} />
          <Big t={t} t0={tCuel - 0.2} t1={tEsp + 0.4} text="TODAVÍA CUELGAN DE UNA PARED" size={104} y={900} />
          <Big t={t} t0={tEsp + 0.4} text="ESPERANDO QUE ALGUIEN MIRE CON ATENCIÓN" size={84} y={900} hl={{ATENCIÓN: K.gold}} />
          <Recre />
        </AbsoluteFill>
      ) : null}
      {/* D · la pregunta para los comentarios */}
      {between(t, tCont - 0.2, tSi + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tCont - 0.2, tSi + 0.3, 0.3)}}>
          <NoirBg t={t} />
          <div style={{position: 'absolute', left: 360, top: 330, width: 1200, padding: '40px 50px', background: '#1E1913', border: `3px solid ${K.gold}`, borderRadius: 26, boxShadow: '0 30px 70px rgba(0,0,0,0.6)', transform: `scale(${Math.min(1, pop(t, tCont))})`}}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 34, color: K.gold, letterSpacing: 3}}>💬 CONTANOS EN LOS COMENTARIOS</div>
            <div style={{fontFamily: F.head, fontSize: 92, color: K.cream, lineHeight: 1.05, marginTop: 20, opacity: prog(t, tSab - 0.1, 0.3)}}>¿SABÍAS QUE EICHMANN VIVIÓ EN SAN FERNANDO?</div>
          </div>
        </AbsoluteFill>
      ) : null}
      {t > tSi - 0.5 ? <EndCard t={t} t0={tSi - 0.2} tSusc={c('suscribite')} tComp={c('compartilo')} tNos={tNos} total={total} /> : null}
      <Vig k={0.45} />
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{t: number; t0: number; tSusc: number; tComp: number; tNos: number; total: number}> = ({t, t0, tSusc, tComp, tNos, total}) => {
  const move = easeInOut(clamp((t - (tNos - 1.6)) / 1.0));
  const size = 380 - 110 * move;
  const lx = 960 - size / 2 - 560 * move;
  const ly = 250 - 90 * move;
  const bg = prog(t, t0 - 0.3, 0.6);
  const fadeOut = prog(t, total - 0.6, 0.6);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: K.bg0, opacity: bg}} />
      <AbsoluteFill style={{opacity: bg * 0.8, background: 'radial-gradient(ellipse at 30% 55%, rgba(214,175,92,0.16) 0%, rgba(0,0,0,0) 60%)'}} />
      <Motes t={t} n={30} o={0.5 * bg} />
      <div style={{position: 'absolute', left: lx, top: ly}}>
        <LogoMark size={size} t={t} t0={t0} />
      </div>
      <div style={{position: 'absolute', left: -560 * move, right: 560 * move, top: 680 - 220 * move, textAlign: 'center', opacity: prog(t, t0 + 0.5, 0.5)}}>
        <div style={{fontFamily: F.head, fontSize: 110 - 30 * move, color: '#fff', letterSpacing: 6}}>CONTEXTO</div>
      </div>
      <div style={{position: 'absolute', left: 960 - 190 - 560 * move, top: 830 - 240 * move, opacity: prog(t, tSusc - 0.2, 0.3), transform: `scale(${pop(t, tSusc - 0.2)})`}}>
        <div style={{width: 380, height: 84, background: K.red, borderRadius: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 34, letterSpacing: 3, color: '#fff', boxShadow: '0 10px 30px rgba(200,49,44,0.45)'}}>
          SUSCRIBITE
        </div>
      </div>
      <div style={{position: 'absolute', left: 960 - 380 - 560 * move, top: 945 - 240 * move, width: 760, textAlign: 'center', opacity: prog(t, tComp - 0.2, 0.3), fontFamily: F.body, fontWeight: 700, fontSize: 28, color: K.mute}}>
        Compartilo con alguien que ame las historias de detectives
      </div>
      <div style={{position: 'absolute', left: 1010, top: 170, opacity: prog(t, tNos - 0.6, 0.5)}}>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 26, letterSpacing: 6, color: K.mute, marginBottom: 16}}>SEGUÍ MIRANDO</div>
        {[0, 1].map((i) => (
          <div key={i} style={{width: 760, height: 330, marginBottom: 40, borderRadius: 10, border: '3px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.04)', transform: `translateX(${(1 - prog(t, tNos - 0.5 + i * 0.15, 0.6)) * 80}px)`}} />
        ))}
      </div>
      <div style={{position: 'absolute', left: 50, top: 850, width: 700, textAlign: 'center', opacity: prog(t, tNos, 0.5), fontFamily: F.head, fontSize: 56, color: '#fff'}}>NOS VEMOS EN EL PRÓXIMO VIDEO</div>
      <AbsoluteFill style={{background: '#000', opacity: fadeOut}} />
    </AbsoluteFill>
  );
};
