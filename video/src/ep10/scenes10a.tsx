/* Escenas 1–5 del episodio 10 (El cuadro del nazi). t = segundos desde el inicio del segmento. */
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {F} from '../theme';
import {cue} from './lib';
import {
  Big, Chip, Count, Credit, DateCard, Dossier, FT, FlatMap, FullPhoto, GiltFrame, K, MapPin, MapRoute, MapView, Motes, NoirBg, PersonGlyph, PhotoCard, Place, SrcLine, Stamp, Typed, Vig, YearRoll,
  between, clamp, easeIn, easeInOut, easeOut, fadeIO, fmt, mapXY, pop, prog, rnd,
} from './kit10';
import {Cam, HATCH_Z, camPath, lerpCam, project, PAINT_POS, PAINT_W, PAINT_H} from './three10';
import {
  CH_DOOR, CH_NEAR, CH_SIGN, CH_WIDE, CH_WINDOW, ChaletShot, FieldShot, GPin, GalleryShot, GlobeShot, ListingPhone, LootShot, MarkerCircle, NotebookShot, PHOTO_CENTER_DY, PHOTO_W,
  ROOM_MID, ROOM_PAINT, ROOM_SOFA, ROOM_WIDE, Recre, RoomShot, ShipShot,
} from './shots10';

type P = {t: number};
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/* coordenadas */
export const AMS: [number, number] = [4.9, 52.37];
export const MDP: [number, number] = [-57.55, -38.0];
export const BSAS: [number, number] = [-58.38, -34.6];

/* =====================================================================================
   TÍTULO
   ===================================================================================== */
export const TitleCard: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  const k = t - t0;
  if (k < -0.05) return null;
  const a = prog(t, t0, 0.25);
  return (
    <AbsoluteFill style={{opacity: a}}>
      <NoirBg t={t} glow="rgba(214,175,92,0.22)" x={30} y={50} />
      <Motes t={t} n={40} o={0.7} />
      <div style={{position: 'absolute', left: 300 - 20 * k, top: 540, transform: `translate(-50%,-50%) scale(${0.62 + k * 0.01})`}}>
        <GiltFrame src="ep10/img/cuadro.jpg" w={430} h={580} />
      </div>
      <div style={{position: 'absolute', left: 690, top: 300}}>
        <div style={{fontFamily: F.head, fontSize: 190, lineHeight: 0.95, color: K.cream, letterSpacing: 4, transform: `translateX(${(1 - prog(t, t0, 0.5)) * 80}px)`, textShadow: '0 20px 60px rgba(0,0,0,0.8)'}}>EL CUADRO</div>
        <div style={{fontFamily: F.head, fontSize: 190, lineHeight: 0.95, color: K.red, letterSpacing: 4, transform: `translateX(${(1 - prog(t, t0 + 0.12, 0.5)) * 80}px)`, textShadow: '0 20px 60px rgba(0,0,0,0.8)'}}>DEL NAZI</div>
        <div style={{marginTop: 30}}>
          <Typed t={t} t0={t0 + 0.45} text="Un secreto de 80 años en Mar del Plata" size={44} color={K.gold} cps={34} />
        </div>
      </div>
      <Stamp t={t} t0={t0 + 0.9} text="CASO REAL" x={1650} y={850} rot={-10} size={62} />
      <Vig k={0.6} />
    </AbsoluteFill>
  );
};

/* =====================================================================================
   S01 · gancho: el timbre, el aviso, el sillón verde y el cuadro
   ===================================================================================== */
export const S01: React.FC<P & {dur: number}> = ({t, dur}) => {
  const c = (p: string, n = 0) => cue('s01', p, n);
  const tTimbre = c('timbre'), tNadie = c('Nadie'), tAlguien = c('alguien'), tJardin = c('En el jardín'), tVende = c('se vende.'), tNoche = c('Esa noche,'), tPasa = c('pasa');
  const tHasta = c('Hasta que'), tLiving = c('al living,'), tSillon = c('sillón'), tFrena = c('lo frena:'), tEse = c('¿ese'), tArriba = c('Arriba'), tRobaron = c('robaron');
  const tYque = c('y que'), tComo = c('¿Cómo'), tPara = c('Para entenderlo,'), tAms = c('Ámsterdam,'), tMayo = c('mayo');
  const tTitle = dur + 0.1;
  /* A · el chalet */
  const chCam = camPath(t, [
    [-1, CH_WIDE],
    [0.2, CH_NEAR],
    [tTimbre - 1.4, CH_DOOR],
    [tNadie + 0.4, CH_WINDOW],
    [tJardin - 0.1, CH_SIGN],
  ], 2.2);
  /* B · el celular */
  const swipe = (t0: number) => easeInOut(clamp((t - t0) / 0.4));
  const idx = swipe(tPasa + 0.25) + swipe(tPasa + 0.95) + swipe(tHasta + 0.45);
  const zoom = easeInOut(clamp((t - (tLiving + 0.15)) / 1.0));
  const phScale = mix(1, 1920 / PHOTO_W, zoom);
  const phY = mix(560, 540 - PHOTO_CENTER_DY * (1920 / PHOTO_W), zoom);
  /* C · el living */
  const roomCam = camPath(t, [
    [tLiving + 0.9, ROOM_WIDE],
    [tSillon - 0.2, ROOM_SOFA],
    [tFrena - 0.3, ROOM_MID],
    [tEse + 0.1, ROOM_PAINT],
  ], 1.6);
  const [px, py] = project(roomCam, PAINT_POS);
  const [, pTop] = project(roomCam, [0, PAINT_POS[1] + PAINT_H / 2 + 0.1, 0]);
  const [pR] = project(roomCam, [PAINT_W / 2 + 0.1, PAINT_POS[1], 0]);
  /* F · el globo vuelve a Ámsterdam */
  const gk = easeInOut(clamp((t - tPara) / (tAms + 0.6 - tPara)));
  const gv = {lon: mix(MDP[0] + 10, AMS[0] - 6, gk), lat: mix(MDP[1] + 8, AMS[1] - 14, gk), dist: mix(12.5, 14.5, Math.sin(Math.PI * gk))};
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {/* A · el chalet de noche */}
      {t < tNoche + 0.3 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tNoche, 0.3)}}>
          <ChaletShot t={t} cam={chCam} s={{t, mover: clamp((t - (tAlguien - 0.5)) / 1.9), lights: 1, porch: 1}} />
          <Place t={t} t0={0.15} t1={tTimbre - 0.2} a="MAR DEL PLATA" b="AGOSTO DE 2025" />
          <Chip t={t} t0={tAlguien - 0.1} t1={tJardin + 0.1} text="ADENTRO, ALGUIEN SE MUEVE" x={960} y={930} color={K.amber} size={38} />
          <Recre />
        </AbsoluteFill>
      ) : null}
      {/* B · el aviso en el celular */}
      {between(t, tNoche - 0.2, tLiving + 1.3) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tNoche - 0.2, 0.4), 1 - prog(t, tLiving + 1.0, 0.3))}}>
          <NoirBg t={t} glow="rgba(125,187,230,0.22)" x={50} y={45} />
          <Place t={t} t0={tNoche} t1={tLiving + 0.2} a="ESA NOCHE, EN EL HOTEL" b="EL AVISO DE LA CASA, EN INTERNET" color={K.blue} />
          <ListingPhone
            t={t} idx={idx} y={phY} scale={phScale * (0.92 + 0.08 * prog(t, tNoche, 0.6))} tilt={1 - zoom} o={prog(t, tNoche, 0.4)}
            ext={<ChaletShot t={t} cam={{pos: [3.2, 1.9, 13], look: [0, 1.9, 0], fov: 34}} s={{t, lights: 1}} w={PHOTO_W} h={322} />}
            living={idx > 2.2 ? <RoomShot cam={ROOM_WIDE} s={{t, painting: 1, tapestry: 0}} w={PHOTO_W} h={322} /> : null}
          />
        </AbsoluteFill>
      ) : null}
      {/* C · el living: el sillón verde y el cuadro */}
      {between(t, tLiving + 0.9, tArriba + 0.9) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tLiving + 0.9, 0.15), 1 - prog(t, tArriba + 0.6, 0.3))}}>
          <RoomShot cam={roomCam} s={{t, painting: 1, tapestry: 0}} />
          <Chip t={t} t0={tSillon + 0.3} t1={tFrena} text="UN SILLÓN DE TERCIOPELO VERDE" x={960} y={940} color={K.velvet} size={36} />
          <MarkerCircle t={t} t0={tEse - 0.1} x={px} y={py} rx={(pR - px) * 1.25} ry={(py - pTop) * 1.18} />
          {t > tEse ? (
            <div style={{position: 'absolute', left: Math.min(1500, pR + 60), top: py - 60, fontFamily: F.hand, fontSize: 64, color: K.red, transform: 'rotate(-6deg)', opacity: prog(t, tEse + 0.2, 0.3), textShadow: '0 3px 10px rgba(0,0,0,0.6)'}}>
              ¿ese no es<br />el cuadro?
            </div>
          ) : null}
          <Recre />
        </AbsoluteFill>
      ) : null}
      {/* D · el retrato robado en 1940 */}
      {between(t, tArriba + 0.5, tComo + 2.2) ? (
        <AbsoluteFill style={{opacity: prog(t, tArriba + 0.5, 0.4)}}>
          <NoirBg t={t} glow="rgba(214,175,92,0.2)" x={36} y={48} />
          <Motes t={t} n={30} o={0.6} />
          <div style={{position: 'absolute', left: 640, top: 540, transform: `translate(-50%,-50%) scale(${0.9 + 0.05 * clamp((t - tArriba) / 8)})`}}>
            <GiltFrame src="ep10/img/cuadro.jpg" w={560} h={756} />
          </div>
          <Stamp t={t} t0={tRobaron} t1={tComo - 0.1} text="ROBADO POR LOS NAZIS" sub="ÁMSTERDAM · 1940" x={1000} y={860} rot={-7} size={66} bg="rgba(11,9,7,0.7)" />
          {between(t, tYque - 0.3, tComo) ? (
            <AbsoluteFill style={{opacity: 1 - prog(t, tComo - 0.3, 0.3)}}>
              <YearRoll t={t} t0={tYque} from={1940} to={2025} dur={1.9} x={1400} y={470} size={240} color={K.cream} />
              <div style={{position: 'absolute', left: 1400, top: 640, transform: 'translateX(-50%)', fontFamily: F.head, fontSize: 84, color: K.gold, opacity: prog(t, c('ochenta') - 0.1, 0.3), whiteSpace: 'nowrap'}}>80 AÑOS SIN VERSE</div>
            </AbsoluteFill>
          ) : null}
          {t > tComo - 0.1 ? (
            <AbsoluteFill style={{background: `rgba(11,9,7,${0.55 * prog(t, tComo - 0.1, 0.3)})`}}>
              <Big t={t} t0={tComo} text="¿CÓMO LLEGÓ | HASTA MAR DEL PLATA?" size={130} x={1240} w={1250} y={540} hl={{PLATA: K.gold, MAR: K.gold, DEL: K.gold}} />
            </AbsoluteFill>
          ) : null}
          <Credit text="Retrato de una dama (siglo XVIII), dominio público" />
        </AbsoluteFill>
      ) : null}
      {/* F · el globo: de Mar del Plata a Ámsterdam */}
      {between(t, tPara - 0.3, tTitle + 0.2) ? (
        <AbsoluteFill style={{opacity: prog(t, tPara - 0.3, 0.4)}}>
          <NoirBg t={t} glow="rgba(125,187,230,0.12)" />
          <GlobeShot t={t} v={gv} routes={[{pts: [MDP, [-30, 0], [-15, 30], AMS], p: easeInOut(clamp((t - tPara - 0.2) / 2.6)), color: K.gold, h: 0.1}]}>
            {(pt) => (
              <>
                <GPin xy={pt(MDP[0], MDP[1])} label="MAR DEL PLATA" o={prog(t, tPara, 0.4) * (1 - prog(t, tAms, 0.4))} color={K.blue} />
                <GPin xy={pt(AMS[0], AMS[1])} label="ÁMSTERDAM" o={prog(t, tAms - 0.3, 0.4)} color={K.gold} side="l" />
              </>
            )}
          </GlobeShot>
          <YearRoll t={t} t0={tMayo - 0.4} from={2025} to={1940} dur={1.6} x={1450} y={820} size={200} color={K.gold} label="MAYO" />
        </AbsoluteFill>
      ) : null}
      {t > tTitle - 0.1 ? <TitleCard t={t} t0={tTitle} /> : null}
    </AbsoluteFill>
  );
};

/* =====================================================================================
   S02 · Jacques Goudstikker: la galería, la invasión, el barco y el cuaderno negro
   ===================================================================================== */
const NORTH_SEA: MapView = {lon: 3.2, lat: 52.2, scale: 260};
export const S02: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s02', p, n);
  const tJudio = c('Era judío,'), tMil = c('mil cien'), tMaestros = c('maestros'), tDiez = c('El diez'), tInvade = c('Alemania invade'), tCuatro = c('Cuatro días'), tMujer = c('su mujer'), tBebe = c('un bebé,');
  const tBarcos = c('últimos barcos'), tIng = c('Inglaterra.'), tSegunda = c('La segunda'), tEscot = c('escotilla'), tCae = c('cae'), tTenia = c('Tenía cuarenta'), tBolsillo = c('En el bolsillo'), tCuad = c('cuadernito'), tLista = c('la lista,'), tCxC = c('cuadro por');
  const gCam = camPath(t, [
    [tJudio, {pos: [0, 1.7, 5.5], look: [0, 1.6, -12], fov: 44}],
    [tJudio + 0.5, {pos: [0.4, 1.6, -3], look: [-0.3, 1.7, -16], fov: 42}],
  ], 5.0);
  const shipCam = camPath(t, [
    [tSegunda - 0.6, {pos: [0.9, 1.7, 0.2], look: [0.1, 0.7, HATCH_Z], fov: 44}],
    [tSegunda + 0.3, {pos: [0.5, 1.62, -5.6], look: [0, 0.3, HATCH_Z], fov: 42}],
    [tCae - 0.15, {pos: [0.05, 0.3, HATCH_Z + 0.3], look: [0, -3.5, HATCH_Z - 0.05], fov: 50}],
  ], 2.4);
  const nbCam = camPath(t, [
    [tBolsillo, {pos: [1.2, 2.2, 2.4], look: [0.5, 0, 0], fov: 36}],
    [tCuad + 0.3, {pos: [0.62, 2.85, 1.3], look: [0.55, 0, 0.05], fov: 38}],
  ], 2.0);
  const open = easeInOut(clamp((t - tCuad - 0.2) / 1.3));
  const flip = clamp((t - tCxC) / 0.55) + clamp((t - tCxC - 0.6) / 0.55) + clamp((t - tCxC - 1.2) / 0.55);
  const route = easeInOut(clamp((t - tBarcos) / 2.6));
  const [ijx, ijy] = mapXY(NORTH_SEA, 4.55, 52.46);
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {/* A · Jacques Goudstikker */}
      {t < tJudio + 0.9 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tJudio + 0.6, 0.3)}}>
          <FullPhoto src="ep10/img/herengracht458.jpg" t={t} t0={-0.4} t1={tJudio + 0.9} zoom={[1.08, 1.0]} dim={1.4} blur={5} focus="50% 40%" />
          <PhotoCard t={t} t0={-0.2} src="ep10/img/goudstikker.jpg" x={560} y={500} w={480} h={620} rot={-3} caption="Jacques Goudstikker, 1938" credit="Dominio público" focus="40% 30%" />
          <div style={{position: 'absolute', left: 930, top: 330}}>
            <div style={{fontFamily: F.head, fontSize: 120, color: K.cream, lineHeight: 1, transform: `translateX(${(1 - prog(t, 0.1, 0.5)) * 60}px)`, opacity: prog(t, 0.1, 0.4)}}>JACQUES</div>
            <div style={{fontFamily: F.head, fontSize: 120, color: K.gold, lineHeight: 1, transform: `translateX(${(1 - prog(t, 0.25, 0.5)) * 60}px)`, opacity: prog(t, 0.25, 0.4)}}>GOUDSTIKKER</div>
            <div style={{marginTop: 26}}>
              <Typed t={t} t0={c('galerista') - 0.2} text={'El galerista más importante\nde Holanda'} size={40} cps={40} />
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
      {/* B · la galería: más de 1.100 cuadros */}
      {between(t, tJudio + 0.4, tDiez + 0.4) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tJudio + 0.4, tDiez + 0.4, 0.4)}}>
          <GalleryShot t={t} cam={gCam} reveal={clamp((t - tJudio) / 2.2)} />
          <Place t={t} t0={tJudio + 0.6} a="GALERÍA GOUDSTIKKER" b="HERENGRACHT 458 · ÁMSTERDAM" />
          {t > tMil - 0.3 ? (
            <div style={{position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', opacity: prog(t, tMil - 0.3, 0.3)}}>
              <div style={{fontFamily: F.head, fontSize: 200, color: K.cream, lineHeight: 1, textShadow: '0 16px 50px rgba(0,0,0,0.85)'}}>
                +<Count t={t} t0={tMil - 0.3} dur={1.0} from={0} to={1100} />
              </div>
              <div style={{fontFamily: F.head, fontSize: 56, color: K.gold, letterSpacing: 3, opacity: prog(t, tMaestros, 0.3), textShadow: '0 4px 20px #000'}}>CUADROS DE MAESTROS HOLANDESES E ITALIANOS</div>
            </div>
          ) : null}
          <Recre />
        </AbsoluteFill>
      ) : null}
      {/* C · 10 de mayo de 1940 */}
      {between(t, tDiez, tCuatro + 0.4) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tDiez, tCuatro + 0.4, 0.3)}}>
          <FullPhoto src="ep10/img/amsterdam_tropas.jpg" t={t} t0={tDiez} t1={tCuatro + 0.4} zoom={[1.03, 1.14]} dim={0.7} bw focus="55% 45%" credit="Bundesarchiv, Bild 183-L23001, CC BY-SA 3.0 DE" fade={0.01} />
          <DateCard t={t} t0={tDiez + 0.1} d={10} m={5} y={1940} x={300} yPos={330} />
          <Big t={t} t0={tInvade} text="ALEMANIA INVADE HOLANDA" size={130} y={880} x={1100} w={1500} hl={{HOLANDA: K.red}} />
          <Chip t={t} t0={tDiez + 0.6} text="TROPAS ALEMANAS EN ÁMSTERDAM, 1940" x={1460} y={110} color={K.mute} size={26} />
        </AbsoluteFill>
      ) : null}
      {/* D · el escape: el último barco a Inglaterra */}
      {between(t, tCuatro, tSegunda + 0.4) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tCuatro, tSegunda + 0.4, 0.35)}}>
          <FlatMap v={NORTH_SEA} hl={{NLD: '#5A221C', DEU: '#3A1A16', BEL: '#3A1A16', GBR: '#39352A'}}>
            <MapRoute v={NORTH_SEA} pts={[[4.55, 52.46], [3.0, 52.15], [1.75, 51.55]]} p={route} color={K.gold} curve={0.05} width={6} />
            <MapPin v={NORTH_SEA} lon={4.9} lat={52.37} label="ÁMSTERDAM" o={prog(t, tCuatro, 0.4)} side="r" />
            <MapPin v={NORTH_SEA} lon={1.0} lat={51.3} label="INGLATERRA" o={prog(t, tIng - 0.3, 0.4)} side="l" color={K.cream} />
            <text x={1430} y={300} fontFamily={F.head} fontSize={64} fill="#8A3A30" opacity={0.85 * prog(t, tCuatro + 0.2, 0.5)}>HOLANDA OCUPADA</text>
          </FlatMap>
          <DateCard t={t} t0={tCuatro + 0.1} d={14} m={5} y={1940} x={1680} yPos={640} size={0.8} />
          {route > 0.05 ? (
            <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
              <text x={ijx - 120} y={ijy + 90} fontFamily={FT.type} fontSize={30} fill={K.gold} opacity={prog(t, tBarcos + 0.4, 0.4)} textAnchor="end">SS BODEGRAVEN</text>
            </svg>
          ) : null}
          <PhotoCard t={t} t0={tMujer - 0.2} src="ep10/img/desi.jpg" x={420} y={330} w={300} h={340} rot={-4} caption="Dési, su mujer" credit="Anefo, CC0" focus="50% 25%" capSize={24} />
          <Chip t={t} t0={tBebe - 0.1} text="Y EDO, SU HIJO: UN BEBÉ" x={430} y={640} color={K.cream} size={30} />
        </AbsoluteFill>
      ) : null}
      {/* E · la segunda noche, la escotilla */}
      {between(t, tSegunda - 0.3, tTenia + 0.2) ? (
        <AbsoluteFill style={{opacity: prog(t, tSegunda - 0.3, 0.4)}}>
          <ShipShot t={t} cam={shipCam} />
          <Place t={t} t0={tSegunda} t1={tEscot + 0.6} a="LA SEGUNDA NOCHE" b="EN ALTA MAR, 1940" />
          <Chip t={t} t0={tEscot + 0.1} t1={tCae} text="UNA ESCOTILLA ABIERTA" x={960} y={930} color={K.amber} size={38} />
          <AbsoluteFill style={{background: '#000', opacity: prog(t, tCae + 0.15, 0.35)}} />
          <Recre />
        </AbsoluteFill>
      ) : null}
      {/* F · tenía 42 años */}
      {between(t, tCae + 0.4, tBolsillo + 0.5) ? (
        <AbsoluteFill style={{opacity: Math.min(prog(t, tCae + 0.4, 0.5), 1 - prog(t, tBolsillo + 0.1, 0.4))}}>
          <AbsoluteFill style={{background: '#000'}} />
          <PhotoCard t={t} t0={tCae + 0.5} src="ep10/img/goudstikker.jpg" x={760} y={520} w={420} h={540} rot={2} tape={false} dim={0.25} focus="40% 30%" from="up" />
          <div style={{position: 'absolute', left: 1100, top: 360}}>
            <div style={{fontFamily: FT.type, fontSize: 44, color: K.mute, opacity: prog(t, tCae + 0.8, 0.4)}}>1897 – 1940</div>
            <div style={{fontFamily: F.head, fontSize: 150, color: K.cream, lineHeight: 1, marginTop: 14, opacity: prog(t, tTenia, 0.3)}}>
              {t > tTenia ? <Count t={t} t0={tTenia} dur={0.9} from={0} to={42} /> : '0'} AÑOS
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
      {/* G · el cuaderno negro */}
      {t > tBolsillo - 0.2 ? (
        <AbsoluteFill style={{opacity: prog(t, tBolsillo - 0.2, 0.5)}}>
          <NotebookShot cam={nbCam} open={open} flip={flip} />
          <Place t={t} t0={tBolsillo + 0.4} a="EL CUADERNO NEGRO" b="LA LISTA DE TODA LA GALERÍA" />
          {t > tLista ? (
            <div style={{position: 'absolute', right: 120, top: 760, textAlign: 'right', opacity: prog(t, tLista, 0.3)}}>
              <div style={{fontFamily: F.head, fontSize: 130, color: K.cream, lineHeight: 1, textShadow: '0 10px 40px #000'}}>
                <Count t={t} t0={tLista} dur={1.6} from={1} to={1113} />
              </div>
              <div style={{fontFamily: FT.type, fontSize: 36, color: K.gold}}>obras anotadas, una por una</div>
            </div>
          ) : null}
          <Recre />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* =====================================================================================
   S03 · Göring: la venta forzada y el saqueo con papeles
   ===================================================================================== */
const DocSheet: React.FC<{x: number; y: number; rot: number; t: number; t0: number; title: string; lines: number; seed: number}> = ({x, y, rot, t, t0, title, lines, seed}) => {
  if (t < t0) return null;
  const a = prog(t, t0, 0.45);
  return (
    <div style={{position: 'absolute', left: x - 300, top: y - 390, width: 600, height: 780, background: K.paper, boxShadow: '0 30px 60px rgba(0,0,0,0.55)', transform: `translateY(${(1 - a) * -220}px) rotate(${rot + (1 - a) * 8}deg)`, opacity: a}}>
      <Img src={staticFile('tex/paper.png')} style={{position: 'absolute', width: '100%', height: '100%', mixBlendMode: 'multiply', opacity: 0.6}} />
      <div style={{position: 'absolute', left: 50, top: 50, fontFamily: FT.type, fontSize: 30, color: K.ink}}>{title}</div>
      {Array.from({length: lines}, (_, i) => (
        <div key={i} style={{position: 'absolute', left: 50, top: 130 + i * 38, height: 12, width: 380 + rnd(seed + i) * 120, background: 'rgba(28,22,17,0.55)', borderRadius: 2}} />
      ))}
    </div>
  );
};
export const S03: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s03', p, n);
  const tApar = c('apareció'), tHermann = c('Hermann'), tNum = c('el número'), tObses = c('obsesionado'), tJulio = c('En julio'), tInter = c('intermediarios'), tDos = c('dos millones'), tFrac = c('una fracción');
  const tHolanda = c('En la Holanda'), tNadie = c('nadie'), tAsi = c('Así funcionaba'), tPapeles = c('papeles,'), tFirmas = c('firmas'), tAmen = c('amenazas.'), tLes = c('Les robaron'), tSeis = c('seiscientas'), tCien = c('Cien mil');
  const gCam = camPath(t, [
    [tJulio, {pos: [0, 1.8, 4.5], look: [0, 1.7, -12], fov: 46}],
    [tJulio + 0.4, {pos: [0, 2.4, 6.5], look: [0, 1.6, -10], fov: 46}],
  ], 6);
  const fCam = camPath(t, [
    [tLes - 0.4, {pos: [0, 9.5, 8.5], look: [0, 0, 0.5], fov: 40}],
    [tCien - 0.2, {pos: [0, 6.2, 7.6], look: [0, 0.9, 0], fov: 44}],
  ], 2.2);
  // firma: una línea que se dibuja
  const sig = clamp((t - tFirmas) / 0.9);
  const sigPts: string[] = [];
  for (let i = 0; i <= 120 * sig; i++) {
    const k = i / 120;
    sigPts.push(`${(700 + k * 520).toFixed(1)},${(820 + Math.sin(k * 26) * 26 * (1 - k * 0.6) + Math.sin(k * 7) * 12).toFixed(1)}`);
  }
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {/* A · el comprador más temido: Göring llega a Holanda */}
      {t < tObses + 0.4 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tObses, 0.4)}}>
          <FullPhoto src="ep10/img/goring_waalhaven.jpg" t={t} t0={-0.4} t1={tObses + 0.4} zoom={[1.18, 1.04]} focus="35% 55%" dim={0.9} bw credit="Ministerie van Defensie (Países Bajos), CC0" />
          <Chip t={t} t0={0.3} text="GÖRING EN ROTTERDAM, MAYO DE 1940" x={1460} y={110} color={K.mute} size={26} />
          <Big t={t} t0={tApar} t1={tHermann - 0.05} text="EL COMPRADOR MÁS TEMIDO DE EUROPA" size={92} y={860} />
          <Big t={t} t0={tHermann} text="HERMANN GÖRING" size={160} y={800} hl={{GÖRING: K.red}} />
          <Chip t={t} t0={tNum} text="EL NÚMERO DOS DE HITLER" x={960} y={950} color={K.red} size={40} />
        </AbsoluteFill>
      ) : null}
      {/* B · obsesionado con el arte: Göring en la galería Goudstikker */}
      {between(t, tObses - 0.1, tJulio + 0.5) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tObses - 0.1, tJulio + 0.5, 0.35)}}>
          <NoirBg t={t} />
          <PhotoCard t={t} t0={tObses - 0.1} src="ep10/img/goring_galeria.jpg" x={760} y={500} w={980} h={735} rot={-1.5} caption="Göring sale de la galería Goudstikker, Ámsterdam, 1941" credit="Dominio público" focus="50% 50%" capSize={28} />
          <Typed t={t} t0={c('colecciones') - 0.1} text={'Quería una de las\nmayores colecciones\nde arte de Europa'} size={44} cps={40} style={{position: 'absolute', left: 1360, top: 380, width: 520}} />
        </AbsoluteFill>
      ) : null}
      {/* C · julio de 1940: se quedan con toda la galería */}
      {between(t, tJulio, tHolanda + 0.4) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tJulio, tHolanda + 0.4, 0.35)}}>
          <GalleryShot t={t} cam={gCam} taken={clamp((t - tInter) / 5.2)} />
          <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(11,9,7,0.85) 0%, rgba(11,9,7,0) 45%)'}} />
          <DateCard t={t} t0={tJulio + 0.1} d={13} m={7} y={1940} x={260} yPos={300} size={0.85} />
          <Chip t={t} t0={tInter + 0.2} text="LA GALERÍA ENTERA, PARA GÖRING" x={960} y={130} color={K.red} size={36} />
          {t > tDos - 0.2 ? (
            <div style={{position: 'absolute', left: 0, right: 0, top: 780, textAlign: 'center', opacity: prog(t, tDos - 0.2, 0.3)}}>
              <div style={{fontFamily: F.head, fontSize: 150, color: K.cream, lineHeight: 1}}>
                <Count t={t} t0={tDos - 0.2} dur={0.9} from={0} to={2000000} /> <span style={{fontSize: 80, color: K.gold}}>FLORINES</span>
              </div>
            </div>
          ) : null}
          <Stamp t={t} t0={tFrac + 0.1} text="VENTA FORZADA" sub="UNA FRACCIÓN DE SU VALOR" x={1530} y={560} rot={-9} size={64} bg="rgba(11,9,7,0.6)" />
          <Recre />
        </AbsoluteFill>
      ) : null}
      {/* D · papeles, firmas y amenazas */}
      {between(t, tHolanda, tLes + 0.4) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tHolanda, tLes + 0.4, 0.35)}}>
          <NoirBg t={t} glow="rgba(200,49,44,0.14)" />
          <Big t={t} t0={tNadie - 0.1} t1={tAsi + 0.2} text="NADIE PODÍA DECIRLE QUE NO" size={120} y={540} hl={{NO: K.red}} />
          {t > tAsi ? (
            <AbsoluteFill style={{opacity: prog(t, tAsi, 0.3)}}>
              <Big t={t} t0={tAsi} text="ASÍ FUNCIONABA EL SAQUEO NAZI" size={80} y={110} />
              <DocSheet t={t} t0={tPapeles - 0.15} x={620} y={600} rot={-8} title="Kaufvertrag · 1940" lines={14} seed={3} />
              <DocSheet t={t} t0={tPapeles + 0.15} x={960} y={620} rot={3} title="Inventar Nr. 1–1113" lines={15} seed={33} />
              <DocSheet t={t} t0={tPapeles + 0.45} x={1300} y={600} rot={9} title="Vollmacht · Amsterdam" lines={13} seed={63} />
              <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
                <polyline points={sigPts.join(' ')} fill="none" stroke="#1C2A55" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <Stamp t={t} t0={tAmen} text="BESCHLAGNAHMT" sub="CONFISCADO" x={980} y={560} rot={-12} size={92} />
              <div style={{position: 'absolute', left: 0, right: 0, top: 960, textAlign: 'center', fontFamily: F.head, fontSize: 60, color: K.cream, letterSpacing: 2}}>
                <span style={{opacity: prog(t, tPapeles, 0.3)}}>PAPELES · </span>
                <span style={{opacity: prog(t, tFirmas, 0.3)}}>FIRMAS · </span>
                <span style={{opacity: prog(t, tAmen, 0.3), color: K.red}}>AMENAZAS</span>
              </div>
            </AbsoluteFill>
          ) : null}
        </AbsoluteFill>
      ) : null}
      {/* E · 600.000 obras robadas, 100.000 sin aparecer */}
      {t > tLes - 0.2 ? (
        <AbsoluteFill style={{opacity: prog(t, tLes - 0.2, 0.4)}}>
          <NoirBg t={t} glow="rgba(214,175,92,0.12)" y={60} />
          <FieldShot t={t} cam={fCam} build={clamp((t - tLes) / 2.2)} missing={clamp((t - tCien) / 0.8)} lift={easeInOut(clamp((t - tCien - 0.4) / 1.6)) * 0.9} />
          {t > tSeis - 0.2 ? (
            <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', opacity: prog(t, tSeis - 0.2, 0.3)}}>
              <div style={{fontFamily: F.head, fontSize: 150, color: K.cream, lineHeight: 1, textShadow: '0 10px 40px #000'}}>
                <Count t={t} t0={tSeis - 0.2} dur={1.2} from={0} to={600000} />
              </div>
              <div style={{fontFamily: F.head, fontSize: 48, color: K.gold, letterSpacing: 2, textShadow: '0 4px 20px #000'}}>OBRAS DE ARTE ROBADAS A LOS JUDÍOS DE EUROPA</div>
            </div>
          ) : null}
          {t > tCien - 0.1 ? (
            <div style={{position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', opacity: prog(t, tCien - 0.1, 0.3)}}>
              <span style={{fontFamily: F.head, fontSize: 110, color: K.red, textShadow: '0 8px 30px #000'}}>100.000</span>
              <span style={{fontFamily: F.head, fontSize: 64, color: K.cream, marginLeft: 26, textShadow: '0 8px 30px #000'}}>TODAVÍA NO APARECIERON</span>
            </div>
          ) : null}
          <div style={{position: 'absolute', left: 96, top: 1010, fontFamily: FT.type, fontSize: 22, color: K.mute, opacity: prog(t, tSeis, 0.4)}}>cada marco = 1.000 obras</div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* =====================================================================================
   S04 · Friedrich Kadgien, «la Serpiente», y la huida a la Argentina
   ===================================================================================== */
const BERLIN: [number, number] = [13.4, 52.52], ZURICH: [number, number] = [8.54, 47.37], RIO: [number, number] = [-43.2, -22.9];
export const S04: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s04', p, n);
  const tAbog = c('abogado'), tFried = c('Friedrich'), tTrab = c('Su trabajo'), tOro = c('oro,'), tDiam = c('diamantes'), tDiv = c('divisas'), tAliados = c('Los aliados'), tSerp = c('la Serpiente.');
  const tEn44 = c('En mil'), tRetrato = c('el retrato'), tManos = c('manos.'), tYcuando = c('Y cuando'), tDerr = c('se derrumbó,'), tEscapo = c('escapó.'), tPrimero = c('Primero'), tSuiza = c('Suiza,'), tBrasil = c('Brasil,');
  const tArg = c('Argentina.'), tConD = c('Con diamantes,'), tJoyas = c('joyas,'), tDos = c('dos cuadros');
  const lootCam = camPath(t, [
    [tOro - 0.6, {pos: [-1.6, 2.0, 3.6], look: [-2.2, 0.2, -0.1], fov: 36}],
    [tDiam - 0.1, {pos: [0.6, 1.6, 3.0], look: [0.3, 0.3, 0.5], fov: 36}],
    [tDiv - 0.1, {pos: [0, 3.2, 5.4], look: [0, 0.2, 0], fov: 38}],
  ], 0.9);
  // ruta de escape: Berlín → Zúrich → Río → Buenos Aires
  const seg = (a: number, b: number) => easeInOut(clamp((t - a) / Math.max(0.4, b - a)));
  const rp = 0.25 * seg(tPrimero - 0.2, tSuiza + 0.2) + 0.45 * seg(tSuiza + 0.2, tBrasil + 0.3) + 0.3 * seg(tBrasil + 0.3, tArg + 0.3);
  const head = rp < 0.25 ? [mix(BERLIN[0], ZURICH[0], rp / 0.25), mix(BERLIN[1], ZURICH[1], rp / 0.25)] : rp < 0.7 ? [mix(ZURICH[0], RIO[0], (rp - 0.25) / 0.45), mix(ZURICH[1], RIO[1], (rp - 0.25) / 0.45)] : [mix(RIO[0], BSAS[0], (rp - 0.7) / 0.3), mix(RIO[1], BSAS[1], (rp - 0.7) / 0.3)];
  const gv = {lon: head[0] + 4, lat: head[1] * 0.75 - 4, dist: 10.8, x: -1.4};
  const kRow = [
    {k: 'PROFESIÓN', v: 'Abogado', t0: tAbog},
    {k: 'CARGO', v: 'SS · asesor financiero de Göring', t0: tAbog + 0.6},
    {k: 'NACIÓ', v: '1907, Alemania', t0: tFried + 0.7},
    {k: 'TAREA', v: 'Convertir el saqueo en plata', t0: tTrab + 0.2},
  ];
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {/* A · el expediente */}
      {t < tOro - 0.1 || between(t, tAliados - 0.3, tYcuando + 0.4) ? (
        <AbsoluteFill style={{opacity: t < tOro - 0.1 ? 1 - prog(t, tOro - 0.4, 0.3) : fadeIO(t, tAliados - 0.3, tYcuando + 0.4, 0.35)}}>
          <NoirBg t={t} />
          <Motes t={t} n={24} o={0.5} />
          <Dossier
            t={t} t0={-0.3} x={960} y={560} title="FRIEDRICH KADGIEN" noPhoto
            rows={[...kRow, ...(t > tAliados - 0.3 ? [{k: 'APODO', v: '«La Serpiente»', t0: tSerp - 0.2, color: K.red}] : []), ...(t > tEn44 - 0.2 ? [{k: '1944', v: 'Recibe el retrato de la dama', t0: tRetrato - 0.1}] : [])]}
          />
          {t > tAliados - 0.3 && t < tEn44 ? (
            <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
              {(() => {
                const k = clamp((t - tAliados) / 1.4);
                const pts: string[] = [];
                for (let i = 0; i <= 200 * k; i++) {
                  const u = i / 200;
                  pts.push(`${(260 + u * 1400).toFixed(1)},${(940 + Math.sin(u * 14) * 34 * (0.4 + u)).toFixed(1)}`);
                }
                return <polyline points={pts.join(' ')} fill="none" stroke={K.red} strokeWidth={10} strokeLinecap="round" opacity={0.9} />;
              })()}
            </svg>
          ) : null}
          {t > tEn44 - 0.2 ? (
            <div style={{position: 'absolute', left: 1500, top: 300, transform: `translate(-50%,-50%) scale(${0.36 * prog(t, tEn44, 0.6)}) rotate(4deg)`, opacity: prog(t, tEn44, 0.3)}}>
              <GiltFrame src="ep10/img/cuadro.jpg" w={430} h={580} />
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}
      {/* B · el botín: oro, diamantes y divisas */}
      {between(t, tOro - 0.5, tAliados + 0.1) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tOro - 0.5, tAliados + 0.1, 0.3)}}>
          <LootShot t={t} cam={lootCam} gold={clamp((t - tOro + 0.3) / 1.2)} diamonds={clamp((t - tDiam + 0.2) / 1.2)} notes={clamp((t - tDiv + 0.2) / 1.2)} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 900, textAlign: 'center', fontFamily: F.head, fontSize: 84, letterSpacing: 3}}>
            <span style={{color: '#E2B64A', opacity: prog(t, tOro, 0.25)}}>ORO · </span>
            <span style={{color: '#CFE4FF', opacity: prog(t, tDiam, 0.25)}}>DIAMANTES · </span>
            <span style={{color: '#B9CFA8', opacity: prog(t, tDiv, 0.25)}}>DIVISAS</span>
          </div>
          <Recre />
        </AbsoluteFill>
      ) : null}
      {/* C · Alemania se derrumba: escapó */}
      {between(t, tYcuando, tPrimero + 0.4) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tYcuando, tPrimero + 0.4, 0.3)}}>
          <FullPhoto src="ep10/img/monuments.png" t={t} t0={tYcuando} t1={tPrimero + 0.4} zoom={[1.04, 1.14]} dim={0.9} bw credit="Foto de 1945, dominio público (Wikimedia Commons)" fade={0.01} />
          <Chip t={t} t0={tYcuando + 0.4} text="1945: SOLDADOS ALIADOS RECUPERAN ARTE ROBADO" x={960} y={110} color={K.mute} size={28} />
          <Big t={t} t0={c('hizo')} t1={tEscapo} text="HIZO LO MISMO QUE MUCHOS JERARCAS NAZIS" size={78} y={860} />
          <Big t={t} t0={tEscapo} text="ESCAPÓ" size={260} y={540} color={K.red} />
        </AbsoluteFill>
      ) : null}
      {/* D · la ruta: Suiza, Brasil, Argentina */}
      {t > tPrimero - 0.1 ? (
        <AbsoluteFill style={{opacity: prog(t, tPrimero - 0.1, 0.4)}}>
          <NoirBg t={t} glow="rgba(125,187,230,0.1)" x={40} />
          <GlobeShot t={t} v={gv} routes={[{pts: [BERLIN, ZURICH, [-10, 30], RIO, BSAS], p: rp, color: K.red, h: 0.06}]} countries={[{a3: 'ARG', color: '#7DBBE6', o: prog(t, tArg - 0.2, 0.5)}]}>
            {(pt) => (
              <>
                <GPin xy={pt(ZURICH[0], ZURICH[1])} label="SUIZA" o={prog(t, tSuiza - 0.1, 0.3)} color={K.red} side="l" />
                <GPin xy={pt(RIO[0], RIO[1])} label="BRASIL" o={prog(t, tBrasil - 0.1, 0.3)} color={K.red} />
                <GPin xy={pt(BSAS[0], BSAS[1])} label="ARGENTINA" o={prog(t, tArg - 0.1, 0.3)} color={K.blue} side="l" />
              </>
            )}
          </GlobeShot>
          <div style={{position: 'absolute', left: 1270, top: 300, width: 560}}>
            {[
              {t0: tConD, label: 'DIAMANTES', icon: '◆', color: '#CFE4FF'},
              {t0: tJoyas, label: 'JOYAS', icon: '✦', color: '#E2B64A'},
              {t0: tDos, label: 'DOS CUADROS ROBADOS', icon: '▣', color: K.red},
            ].map((r, i) => (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, marginBottom: 26, opacity: prog(t, r.t0 - 0.1, 0.3), transform: `translateX(${(1 - prog(t, r.t0 - 0.1, 0.4)) * 60}px)`}}>
                <div style={{width: 92, height: 92, borderRadius: 46, background: 'rgba(241,231,211,0.08)', border: `3px solid ${r.color}`, color: r.color, fontSize: 50, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{r.icon}</div>
                <div style={{fontFamily: F.head, fontSize: 58, color: K.cream, letterSpacing: 1}}>{r.label}</div>
              </div>
            ))}
            {t > tDos ? (
              <div style={{display: 'flex', gap: 26, marginTop: 10, opacity: prog(t, tDos + 0.3, 0.4)}}>
                <div style={{transform: 'scale(0.42)', transformOrigin: '0 0', width: 220, height: 280}}>
                  <GiltFrame src="ep10/img/cuadro.jpg" w={430} h={580} />
                </div>
                <div style={{transform: 'scale(0.42)', transformOrigin: '0 0', width: 220, height: 280}}>
                  <GiltFrame w={430} h={580} dark>
                    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.head, fontSize: 300, color: '#4A4036'}}>?</div>
                  </GiltFrame>
                </div>
              </div>
            ) : null}
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* =====================================================================================
   S05 · las rutas de las ratas: los Alpes, la Cruz Roja, Génova y la Argentina de Perón
   ===================================================================================== */
const ALPS: MapView = {lon: 10.5, lat: 46.4, scale: 120};
const ATL: MapView = {lon: -25, lat: 5, scale: 11};
const GENOA: [number, number] = [8.93, 44.41];
export const S05: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s05', p, n);
  const tDesp = c('Después de la guerra,'), tRutas = c('rutas de las ratas:'), tCruz = c('cruzaban'), tAlpes = c('Alpes,'), tConv = c('conventos,'), tPasap = c('pasaportes'), tFalsos = c('nombres falsos,'), tEmb = c('se embarcaban'), tGen = c('Génova.');
  const tOtro = c('Del otro lado'), tPeron = c('la Argentina de Perón,'), tTec = c('técnicos'), tMil = c('militares'), tNo = c('no hacía'), tUna = c('Una comisión'), tCiento = c('ciento ochenta'), tOtras = c('Otras'), tMiles = c('hablan de miles.');
  const ratP = (d: number) => easeInOut(clamp((t - tCruz - d) / 3.0));
  const atl = easeInOut(clamp((t - tOtro) / 3.2));
  // íconos de personas: 180 llenos y después miles fantasma
  const icons = 180 + Math.round(1620 * easeInOut(clamp((t - tOtras) / 2.2)));
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {/* A + B · el mapa de los Alpes */}
      {t < tOtro + 0.5 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tOtro + 0.1, 0.4)}}>
          <FlatMap v={ALPS} hl={{DEU: '#3A1A16', AUT: '#3A1A16', ITA: '#2E2A22', CHE: '#2A2620'}}>
            {/* sombreado de los Alpes */}
            <ellipse cx={mapXY(ALPS, 10.5, 46.6)[0]} cy={mapXY(ALPS, 10.5, 46.6)[1]} rx={520} ry={110} fill="#E9DDC3" opacity={0.08 * prog(t, tAlpes - 0.3, 0.5)} transform={`rotate(-8 ${mapXY(ALPS, 10.5, 46.6)[0]} ${mapXY(ALPS, 10.5, 46.6)[1]})`} />
            <MapRoute v={ALPS} pts={[[11.6, 48.1], [11.4, 47.27], [11.5, 47.0], [10.9, 45.4], GENOA]} p={ratP(0)} color={K.red} width={6} curve={0.04} />
            <MapRoute v={ALPS} pts={[[13.0, 47.8], [12.3, 46.6], [11.3, 46.5], [9.2, 45.5], GENOA]} p={ratP(0.4)} color={K.red} width={5} curve={0.05} />
            <MapRoute v={ALPS} pts={[[16.37, 48.2], [14.3, 46.6], [12.3, 45.4], [10.3, 44.8], GENOA]} p={ratP(0.8)} color={K.red} width={5} curve={0.05} />
            <MapPin v={ALPS} lon={11.5} lat={47.0} label="LOS ALPES" o={prog(t, tAlpes - 0.2, 0.3)} color={K.cream} side="r" sub="PASO DEL BRENNERO" />
            <MapPin v={ALPS} lon={GENOA[0]} lat={GENOA[1]} label="GÉNOVA" o={prog(t, tGen - 0.4, 0.3)} color={K.gold} side="l" sub="EL PUERTO" />
          </FlatMap>
          <AbsoluteFill style={{background: `rgba(11,9,7,${0.55 * (1 - prog(t, tCruz - 0.4, 0.5))})`}} />
          <Big t={t} t0={tRutas - 0.2} t1={tCruz + 0.2} text="LAS RUTAS DE LAS RATAS" size={170} y={540} hl={{RATAS: K.red}} />
          <Chip t={t} t0={tDesp} t1={tRutas - 0.1} text="DESPUÉS DE LA GUERRA · MILES DE NAZIS ESCAPAN" x={960} y={540} color={K.cream} size={40} />
          <Chip t={t} t0={tConv} t1={tGen + 0.5} text="SE ESCONDÍAN EN CONVENTOS" x={560} y={940} color={K.cream} size={34} />
          <PhotoCard t={t} t0={tPasap - 0.1} t1={tEmb + 0.2} src="ep10/img/eichmann_pasaporte.jpg" x={1490} y={470} w={460} h={660} rot={3} caption="Pasaporte de la Cruz Roja" credit="Dominio público" focus="50% 50%" bw={false} capSize={26} from="right" />
          <Stamp t={t} t0={tFalsos} t1={tEmb + 0.2} text="NOMBRE FALSO" sub="«RICARDO KLEMENT»" x={1490} y={620} rot={-10} size={54} bg="rgba(233,221,195,0.25)" />
          <Place t={t} t0={tCruz} t1={tOtro} a="1945 – 1950" b="DE ALEMANIA Y AUSTRIA A ITALIA" color={K.red} />
        </AbsoluteFill>
      ) : null}
      {/* C · el océano: la Argentina de Perón */}
      {between(t, tOtro - 0.2, tUna + 0.4) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tOtro - 0.2, tUna + 0.4, 0.35)}}>
          <FlatMap v={ATL} hl={{ARG: '#2C4A63', ITA: '#3A2A22'}}>
            <MapRoute v={ATL} pts={[GENOA, [-6, 36], [-25, 15], [-38, -10], BSAS]} p={atl} color={K.gold} width={6} curve={0.04} />
            <MapPin v={ATL} lon={GENOA[0]} lat={GENOA[1]} label="GÉNOVA" o={1 - prog(t, tPeron, 0.4)} color={K.gold} side="r" />
            <MapPin v={ATL} lon={BSAS[0]} lat={BSAS[1]} label="BUENOS AIRES" o={prog(t, tOtro + 2.4, 0.4)} color={K.blue} side="r" />
          </FlatMap>
          <PhotoCard t={t} t0={tPeron - 0.1} src="ep10/img/peron.jpg" x={1460} y={470} w={400} h={540} rot={2.5} caption="Juan Domingo Perón" credit="Dominio público (CC0)" focus="50% 25%" capSize={26} from="right" />
          <div style={{position: 'absolute', left: 1240, top: 840, width: 600}}>
            <Chip t={t} t0={tTec - 0.1} text="BUSCABA TÉCNICOS" x={220} y={0} color={K.blue} size={34} />
            <Chip t={t} t0={tMil - 0.1} text="Y MILITARES ALEMANES" x={220} y={70} color={K.blue} size={34} />
          </div>
          <Big t={t} t0={tNo} text="SIN DEMASIADAS PREGUNTAS" size={86} x={620} w={1100} y={170} hl={{PREGUNTAS: K.red}} />
        </AbsoluteFill>
      ) : null}
      {/* D · 180 criminales de guerra… o miles */}
      {t > tUna - 0.1 ? (
        <AbsoluteFill style={{opacity: prog(t, tUna - 0.1, 0.4)}}>
          <NoirBg t={t} glow="rgba(200,49,44,0.12)" />
          <div style={{position: 'absolute', left: 140, top: 250, width: 1640, display: 'flex', flexWrap: 'wrap', gap: 4, alignContent: 'flex-start'}}>
            {Array.from({length: Math.min(icons, 1800)}, (_, i) => {
              const solid = i < 180;
              const a = solid ? prog(t, tCiento - 0.3 + i * 0.006, 0.2) : 0.32 * prog(t, tOtras + (i - 180) * 0.0012, 0.2);
              return <PersonGlyph key={i} size={solid ? 30 : 30} color={solid ? K.red : K.mute} o={a} />;
            })}
          </div>
          <div style={{position: 'absolute', left: 140, top: 70, opacity: prog(t, tUna, 0.3)}}>
            <div style={{fontFamily: FT.type, fontSize: 34, color: K.mute}}>Una comisión oficial (CEANA, 1999) contó:</div>
            <div style={{fontFamily: F.head, fontSize: 120, color: K.cream, lineHeight: 1, opacity: prog(t, tCiento - 0.3, 0.25)}}>
              {t > tCiento - 0.3 ? <Count t={t} t0={tCiento - 0.3} dur={1.1} from={0} to={180} /> : '0'}
              <span style={{fontSize: 56, color: K.red, marginLeft: 20}}>CRIMINALES DE GUERRA</span>
            </div>
          </div>
          {t > tOtras ? (
            <div style={{position: 'absolute', right: 120, bottom: 70, textAlign: 'right', opacity: prog(t, tOtras, 0.3)}}>
              <div style={{fontFamily: FT.type, fontSize: 32, color: K.mute}}>otras estimaciones:</div>
              <div style={{fontFamily: F.head, fontSize: 170, color: K.cream, lineHeight: 1, textShadow: '0 10px 40px #000', transform: `scale(${0.9 + 0.1 * prog(t, tMiles, 0.4)})`, transformOrigin: 'right'}}>MILES</div>
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
