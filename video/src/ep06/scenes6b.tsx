/* Escenas 6–10 del episodio 6 (La paradoja de la carne). t = segundos desde el inicio del segmento. */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {F} from '../theme';
import {LogoMark} from '../ep04/kit';
import {cue} from './lib';
import {
  Big, Chip, ChickenIcon, Count, CowIcon, Ember, FullPhoto, FullVideo, K, LINKS, Panel, PriceLabel, Sparks, SrcLine, Ticket, TimeBar, Vig,
  clamp, easeIn, easeInOut, easeOut, fmt, pop, prog,
} from './kit6';
import {Balance, Cam, Diorama, Globe3D, STX, ShadowFloor, Stage, Tray, TrayTower, camPath, globePoint, globeRot, project} from './three6';
import {Consumo, DioStage, FadaSrc, G, GridShot, StationLabels, WIDE, balAngle} from './scenes6a';
import {shake} from '../lib/anim';

type P = {t: number};
const between = (t: number, a: number, b: number) => t >= a && t < b;
const fadeIO = (t: number, a: number, b: number, d = 0.35) => Math.min(prog(t, a, d), 1 - prog(t, b - d, d, easeIn));

/** sello de impuesto */
const TaxStamp: React.FC<{t: number; t0: number; text: string; x: number; y: number; rot?: number; size?: number}> = ({t, t0, text, x, y, rot = -6, size = 92}) => {
  if (t < t0) return null;
  const k = clamp((t - t0) / 0.16);
  const s = 2.2 - 1.2 * easeIn(k) + (k >= 1 ? Math.exp(-(t - t0 - 0.16) * 12) * 0.05 * Math.sin((t - t0) * 60) : 0);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: clamp(k * 3)}}>
      <div style={{border: `${size / 11}px solid ${K.red}`, color: K.red, background: 'rgba(11,8,6,0.7)', padding: `${size * 0.08}px ${size * 0.28}px 0`, fontFamily: F.head, fontSize: size, lineHeight: 1.1, borderRadius: size * 0.08, whiteSpace: 'nowrap', letterSpacing: 2}}>
        {text}
      </div>
    </div>
  );
};

/* =====================================================================================
   S06 · el socio que cobra en cada paso: el Estado (28 de cada 100)
   ===================================================================================== */
export const S06: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s06', p, n);
  const tUno = c('Uno que'), tCobra = c('pero cobra'), tEstado = c('Estado.'), tIva = c('IVA,'), tTotal = c('En total,'), t28 = c('veintiocho'), tMas = c('Más de'), tY = c('Y es');
  const dCam = camPath(t, [
    [tUno - 0.3, {pos: [0, 15, 27], look: [0, 1, -1.2], fov: 40}],
    [tCobra - 0.2, {pos: [-19, 3.4, 6.5], look: [-6, 1.3, -1.2], fov: 42}],
  ], 2.0);
  const strike = [c('cría,'), c('engorda,'), c('faena'), c('corta,')].map((x) => clamp((t - x) / 0.35));
  const tolls = [0, 1, 2, 3].map((i) => clamp((t - tCobra - 0.1 - i * 0.22) / 0.7));
  const sh = shake(t, t28 + 0.35, 16, 0.7);
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {t < tUno + 0.3 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tUno, 0.3)}}>
          <Ember glow="rgba(226,59,46,0.14)" x={62} y={55} />
          <GridShot t={t + 40} groups={[G.cria(1, {dim: 0.45}), G.inv(1, {dim: 0.45}), G.frig(1, {dim: 0.45}), G.carn(1, {dim: 0.45}), G.imp(0)]} />
          <Big t={t} t0={0.05} text="PERO FALTA | UN SOCIO" size={120} x={110} y={420} align="left" w={900} hl={{SOCIO: K.red}} />
        </AbsoluteFill>
      ) : null}
      {between(t, tUno, tIva + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tUno, tIva + 0.3, 0.3)}}>
          <Ember glow="rgba(190,70,40,0.22)" y={58} />
          <DioStage cam={dCam}>
            <Diorama s={{t, cols: [1, 1, 1, 1, 0], tolls}} />
          </DioStage>
          <StationLabels cam={dCam} show={[1, 1, 1, 1, 0].map((v) => v * (1 - prog(t, tCobra - 0.3, 0.4)))} t={t} strike={strike} />
          <Big t={t} t0={tUno + 0.05} t1={tCobra} text="NO CRÍA, NO ENGORDA, | NO FAENA, NO CORTA" size={80} y={140} />
          {t > tCobra ? (
            <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', opacity: prog(t, tCobra, 0.3)}}>
              <div style={{fontFamily: F.head, fontSize: 80, color: K.cream}}>PERO COBRA EN CADA PASO</div>
              <div style={{fontFamily: F.head, fontSize: 190, color: K.red, lineHeight: 1, transform: `scale(${t > tEstado ? pop(t, tEstado, 1) : 0})`, textShadow: '0 0 60px rgba(226,59,46,0.5)'}}>EL ESTADO</div>
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}
      {between(t, tIva, tTotal + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tIva, tTotal + 0.3, 0.25)}}>
          <FullPhoto src="ep06/afip.jpg" t={t} t0={tIva} t1={tTotal + 0.3} dim={1.0} zoom={[1.02, 1.14]} fade={0.01} credit="Sede de la AFIP (hoy ARCA) · Sking, CC BY-SA 3.0" />
          <TaxStamp t={t} t0={tIva} text="IVA" x={520} y={330} rot={-8} size={130} />
          <TaxStamp t={t} t0={c('Ganancias,')} text="GANANCIAS" x={1330} y={300} rot={5} size={100} />
          <TaxStamp t={t} t0={c('Ingresos')} text="INGRESOS BRUTOS" x={700} y={620} rot={4} size={100} />
          <TaxStamp t={t} t0={c('tasas')} text="TASAS MUNICIPALES" x={1250} y={820} rot={-5} size={90} />
        </AbsoluteFill>
      ) : null}
      {between(t, tTotal, tY + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tTotal, tY + 0.3, 0.3)}}>
          <Ember glow="rgba(226,59,46,0.2)" x={62} y={55} />
          <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px)`}}>
            <GridShot t={t + 40} groups={[G.cria(1, {dim: 0.5}), G.inv(1, {dim: 0.5}), G.frig(1, {dim: 0.5}), G.carn(1, {dim: 0.5}), G.imp(1, {drop: clamp((t - t28 + 0.5) / 0.8), glow: 0.5 + 0.5 * prog(t, tMas, 0.5), lift: 0.3 * prog(t, t28 + 0.6, 0.4)})]} />
          </AbsoluteFill>
          <ShareTextBig t={t} t0={t28} />
          {t > tMas ? (
            <div style={{position: 'absolute', left: 110, top: 780, fontFamily: F.head, fontSize: 60, color: K.cream, opacity: prog(t, tMas, 0.4), lineHeight: 1.05}}>
              MÁS DE UN CUARTO DEL PRECIO
              <br />
              <span style={{color: K.red}}>SON IMPUESTOS</span>
            </div>
          ) : null}
          <FadaSrc t={t} t0={tTotal + 0.3} />
        </AbsoluteFill>
      ) : null}
      {t >= tY ? (
        <AbsoluteFill style={{opacity: prog(t, tY, 0.3)}}>
          <Ember glow="rgba(226,59,46,0.16)" />
          <VersusBars t={t} t0={tY} tTax={tY + 0.2} tGan={c('las ganancias')} tVal={c('veintiuno.')} />
          <FadaSrc t={t} t0={tY + 0.3} />
        </AbsoluteFill>
      ) : null}
      <Vig k={0.45} />
    </AbsoluteFill>
  );
};

const ShareTextBig: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  if (t < t0) return null;
  return (
    <div style={{position: 'absolute', left: 110, top: 290, opacity: prog(t, t0, 0.3)}}>
      <div style={{fontFamily: F.head, fontSize: 280, lineHeight: 0.9, color: K.red, textShadow: '0 0 70px rgba(226,59,46,0.45)'}}>
        $<Count t={t} t0={t0} dur={0.8} to={28} />
      </div>
      <div style={{fontFamily: F.head, fontSize: 70, color: K.cream, marginTop: 6}}>DE IMPUESTOS</div>
      <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 26, letterSpacing: 3, color: K.mute, marginTop: 8}}>IVA · GANANCIAS · INGRESOS BRUTOS · TASAS</div>
    </div>
  );
};

/** impuestos (28) contra las ganancias de toda la cadena (21) */
const VersusBars: React.FC<{t: number; t0: number; tTax: number; tGan: number; tVal: number}> = ({t, t0, tTax, tGan, tVal}) => {
  const bar = (y: number, t1: number, v: number, color: string, title: string) => {
    const k = easeOut(clamp((t - t1) / 0.9));
    return (
      <div style={{position: 'absolute', left: 130, top: y, opacity: prog(t, t1 - 0.2, 0.3)}}>
        <div style={{fontFamily: F.head, fontSize: 58, color: K.cream, marginBottom: 12}}>{title}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
          <div style={{width: 1300 * (v / 30) * k, height: 130, background: color, borderRadius: 10, boxShadow: `0 0 50px ${color}66`}} />
          <div style={{fontFamily: F.head, fontSize: 130, color, lineHeight: 1}}>${Math.round(v * k)}</div>
        </div>
      </div>
    );
  };
  return (
    <>
      <div style={{position: 'absolute', left: 130, top: 100, fontFamily: F.body, fontWeight: 800, fontSize: 28, letterSpacing: 6, color: K.mute, opacity: prog(t, t0, 0.4)}}>
        DE CADA $100 DEL KILO DE CARNE
      </div>
      {bar(210, tTax, 28, K.red, 'IMPUESTOS')}
      {bar(560, tGan, 21, K.yellow, 'GANANCIAS DE TODA LA CADENA JUNTA')}
      {t > tVal + 0.6 ? <Chip t={t} t0={tVal + 0.6} text="EL ESTADO GANA MÁS QUE TODOS" x={1380} y={930} color={K.red} size={44} /> : null}
    </>
  );
};

/* =====================================================================================
   S07 · el ticket del viaje completo y la escalera de precios
   ===================================================================================== */
export const S07: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s07', p, n);
  const tKilo = c('Un kilo'), t185 = c('dieciocho');
  const tl = [c('Seis'), c('Tres'), c('Menos'), c('Tres', 1), c('Y más')];
  const lines = LINKS.map((l, i) => ({label: l.id === 'inv' ? 'ENGORDE' : l.name, value: l.amount, t0: tl[i], color: l.id === 'imp' ? K.red : undefined, strong: l.id === 'imp'}));
  const tTotal = c('impuestos.') + 0.7;
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      <Ember glow="rgba(200,90,40,0.2)" x={40} y={40} />
      <Ticket t={t} t0={0.1} lines={lines} total={{t0: tTotal, value: 18500}} x={520} y={80} w={640} circle={{t0: c('impuestos.') - 0.1, line: 4}} />
      <Waterfall t={t} tl={tl} tTotal={tTotal} tHead={t185} />
      <div style={{position: 'absolute', left: 1010, top: 90, opacity: prog(t, tKilo, 0.4)}}>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 24, letterSpacing: 5, color: K.mute}}>1 KG DE CARNE EN EL MOSTRADOR</div>
        <div style={{fontFamily: F.head, fontSize: 120, color: K.yellow, lineHeight: 1, opacity: prog(t, t185 - 0.15, 0.25)}}>
          $<Count t={t} t0={t185} dur={1.2} to={18500} from={9000} />
        </div>
      </div>
      <SrcLine t={t} t0={1} text="Reparto: FADA (abril 2026) aplicado a un precio promedio de $18.500 por kilo (IPCVA, AMBA)" x={1010} y={1030} />
      <Vig k={0.4} />
    </AbsoluteFill>
  );
};

/** escalera: cómo sube el precio en cada eslabón */
const Waterfall: React.FC<{t: number; tl: number[]; tTotal: number; tHead: number}> = ({t, tl, tTotal, tHead}) => {
  const x0 = 1010, base = 930, H = 560, bw = 118, gap = 26;
  const sc = H / 18500;
  let cum = 0;
  const cols = LINKS.map((l, i) => {
    const from = cum;
    cum += l.amount;
    const k = easeOut(clamp((t - tl[i]) / 0.6));
    const x = x0 + i * (bw + gap);
    const h = Math.max(3, l.amount * sc * k);
    return (
      <div key={l.id} style={{opacity: t > tl[i] - 0.1 ? 1 : 0}}>
        <div style={{position: 'absolute', left: x, top: base - from * sc - h, width: bw, height: h, background: l.color, borderRadius: 4, boxShadow: `0 0 26px ${l.color}55`}} />
        {i < 4 ? <div style={{position: 'absolute', left: x + bw, top: base - cum * sc, width: gap, height: 0, borderTop: `3px dashed ${K.line}`, opacity: k}} /> : null}
        <div style={{position: 'absolute', left: x - 20, width: bw + 40, top: base - cum * sc - 62, textAlign: 'center', fontFamily: F.head, fontSize: 34, color: K.cream, opacity: k}}>${fmt(l.amount)}</div>
        <div style={{position: 'absolute', left: x - 20, width: bw + 40, top: base + 14, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 15, letterSpacing: 1, color: l.color, opacity: k}}>{l.short}</div>
      </div>
    );
  });
  const tk = easeOut(clamp((t - tTotal) / 0.7));
  return (
    <>
      <div style={{position: 'absolute', left: x0 - 10, top: base, width: 5 * (bw + gap) + 10, height: 3, background: K.line, opacity: prog(t, tHead, 0.4)}} />
      {cols}
      {/* marca del total */}
      <div style={{position: 'absolute', left: x0 - 10, top: base - 18500 * sc - 2, width: 5 * (bw + gap) * tk, borderTop: `4px solid ${K.yellow}`, opacity: tk}} />
    </>
  );
};

/* =====================================================================================
   S08 · por qué la vaca vale tanto: exportación, precios en dólares, menos vacas
   ===================================================================================== */
const BA: [number, number] = [-57.9, -34.9];
const TO_CHINA: [number, number][] = [BA, [-45, -37], [-15, -38], [18, -36.5], [45, -30], [75, -12], [96, -2], [104.5, 1.8], [112, 12], [121.8, 30.8]];
const TO_USA: [number, number][] = [BA, [-44, -24], [-34, -6], [-44, 14], [-62, 28], [-74, 39.6]];
export const S08: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s08', p, n);
  const tPorque = c('Porque'), tCasi = c('Casi'), tChina = c('China,'), tUsa = c('Estados Unidos.'), tMundo = c('Y el mundo'), tPrecio = c('y el precio'), tCuando = c('Cuando'), tEncima = c('Y encima'), tAgosto = c('y en agosto');
  // globo: mira a la Argentina, gira al Atlántico, a las Américas y después a Australia
  const keys: [number, number, number, number][] = [
    [0, -64, -30, 1],
    [tChina - 0.8, -22, -8, 1.6],
    [c('Estados', 1) - 0.5, -78, 8, 1.1],
    [c('Australia') - 0.55, 134, -26, 1.2],
  ];
  let lon = keys[0][1], lat = keys[0][2];
  for (let i = 1; i < keys.length; i++) {
    const [tk, lo, la, d] = keys[i];
    const k = easeInOut(clamp((t - tk) / d));
    lon += (lo - lon) * k;
    lat += (la - lat) * k;
  }
  const rot = globeRot(lon, lat);
  const gCam: Cam = {pos: [0, 0, 11.5 - 0.8 * prog(t, tPorque, 8)], look: [0, 0, 0], fov: 36};
  const R = 3.4;
  const gp = (lo: number, la: number): [number, number, boolean] => {
    const P = globePoint(lo, la, R, rot);
    const [x, y] = project(gCam, P);
    return [x, y, P[2] > R * 0.15];
  };
  const hl = (t0: number, t1 = 999) => Math.min(prog(t, t0, 0.5), 1 - prog(t, t1, 0.5));
  const exportPrice = (x: number) => x;
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {t < tPorque + 0.3 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tPorque, 0.3)}}>
          <Ember glow="rgba(125,179,86,0.16)" x={62} y={55} />
          <GridShot t={t + 80} groups={[G.cria(1, {lift: 0.5, glow: 0.8}), G.inv(1, {lift: 0.5, glow: 0.8}), G.frig(1, {dim: 0.6}), G.carn(1, {dim: 0.6}), G.imp(1, {dim: 0.6})]} />
          <Big t={t} t0={0.05} text="¿POR QUÉ LA VACA | VALE TANTO?" size={110} x={110} y={330} align="left" w={900} hl={{VACA: K.yellow}} />
          <Chip t={t} t0={c('vaca')} text="LA VACA = $51 DE CADA $100" x={480} y={640} color={K.cria} size={40} />
        </AbsoluteFill>
      ) : null}
      {between(t, tPorque, tPrecio + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tPorque, tPrecio + 0.3, 0.35)}}>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #0E1A26 0%, #06090D 70%)'}} />
          <Stars />
          <Stage cam={gCam} key0={[-8, 6, 10]} keyI={2.6} fill={0.6} rimColor="#4A7FB0" exposure={1.15}>
            <Globe3D
              r={R} rot={rot} t={t}
              countries={[
                {a3: 'ARG', color: '#FFCC33', o: hl(tPorque + 0.3)},
                {a3: 'CHN', color: '#FF5A36', o: hl(tChina - 0.2, tMundo + 0.5)},
                {a3: 'USA', color: t > c('Estados', 1) ? '#FF5A36' : '#74ACDF', o: hl(tUsa - 0.2)},
                {a3: 'BRA', color: '#FF5A36', o: hl(c('Brasil') - 0.1)},
                {a3: 'AUS', color: '#FF5A36', o: hl(c('Australia') - 0.1)},
              ]}
              routes={[
                {pts: TO_CHINA, p: easeInOut(clamp((t - tChina + 0.6) / 2.2)) * (1 - prog(t, tMundo, 0.5)), color: '#FFCC33'},
                {pts: TO_USA, p: easeInOut(clamp((t - tUsa + 0.3) / 1.3)) * (1 - prog(t, tMundo, 0.5)), color: '#FFCC33'},
              ]}
            />
          </Stage>
          <Big t={t} t0={tPorque + 0.1} t1={tCasi} text="YA NO SE VENDE SOLO | EN LA ARGENTINA" size={84} y={130} />
          {between(t, tCasi, tMundo) ? <ExportShare t={t} t0={tCasi} /> : null}
          {t > tChina && t < tMundo ? (
            <>
              <Chip t={t} t0={tChina + 0.3} text="CHINA · 60% DE LO EXPORTADO" x={1500} y={330} color="#FF5A36" size={36} />
              <Chip t={t} t0={tUsa + 0.3} text="EE. UU. · 16%" x={1500} y={430} color={K.celeste} size={36} />
              <SrcLine t={t} t0={tChina + 0.3} text="Destinos: Consorcio ABC, enero a julio de 2026" />
            </>
          ) : null}
          {t > tMundo ? (
            <>
              <Big t={t} t0={tMundo + 0.05} text="EL MUNDO TIENE | HAMBRE DE CARNE" size={96} y={140} hl={{HAMBRE: K.red}} />
              {[['EE. UU.', 'USA', c('Estados', 1)], ['BRASIL', 'BRA', c('Brasil')], ['AUSTRALIA', 'AUS', c('Australia')]].map(([n, a3, t0], i) => {
                const [x, y, vis] = gp(...({USA: [-98, 39], BRA: [-52, -10], AUS: [134, -25]} as Record<string, [number, number]>)[a3 as string]);
                if (!vis) return null;
                return <Chip key={a3 as string} t={t} t0={(t0 as number) + 0.1} t1={tPrecio + 0.4} text={n as string} x={Math.min(1760, Math.max(160, x))} y={Math.min(900, Math.max(300, y))} color="#FF5A36" size={38} />;
              })}
              <Chip t={t} t0={c('problemas')} text="PROBLEMAS PARA PRODUCIR" x={960} y={960} color={K.cream} size={40} />
            </>
          ) : null}
        </AbsoluteFill>
      ) : null}
      {between(t, tPrecio, tCuando + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tPrecio, tCuando + 0.3, 0.3)}}>
          <FullPhoto src="ep06/puerto.jpg" t={t} t0={tPrecio} t1={tCuando + 0.3} dim={1.3} blur={3} zoom={[1.05, 1.12]} fade={0.01} />
          <ExportPrice t={t} t0={tPrecio} tv={c('treinta')} fmtp={exportPrice} />
        </AbsoluteFill>
      ) : null}
      {between(t, tCuando, tEncima + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tCuando, tEncima + 0.3, 0.3)}}>
          <FullPhoto src="ep06/bovinos05.jpg" t={t} t0={tCuando} t1={tEncima + 0.3} dim={1.1} zoom={[1.04, 1.12]} fade={0.01} credit="Natifuzz, CC BY-SA 4.0" />
          <Dollarize t={t} tA={c('afuera,')} tD={c('adentro')} tUsd={c('dólares.')} />
        </AbsoluteFill>
      ) : null}
      {between(t, tEncima, tAgosto + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tEncima, tAgosto + 0.3, 0.3)}}>
          <FullVideo src="ep06/vid/pastura.mp4" t={t} t0={tEncima} t1={tAgosto + 0.3} dim={0.7} fade={0.01} credit="USDA NRCS · dominio público" />
          <AbsoluteFill style={{background: 'rgba(120,70,20,0.35)', mixBlendMode: 'multiply'}} />
          <Big t={t} t0={tEncima + 0.1} text="MENOS VACAS" size={170} y={330} />
          <Chip t={t} t0={c('sequía')} text="SEQUÍA DE 2023" x={700} y={620} color={K.yellow} size={60} />
          <Chip t={t} t0={c('terneros,')} text="MENOS TERNEROS" x={1250} y={620} color={K.red} size={60} />
        </AbsoluteFill>
      ) : null}
      {t >= tAgosto ? (
        <AbsoluteFill style={{opacity: prog(t, tAgosto, 0.3)}}>
          <Ember glow="rgba(226,59,46,0.16)" />
          <Faena t={t} t0={tAgosto} tv={c('trece')} />
        </AbsoluteFill>
      ) : null}
      <Vig k={0.45} />
    </AbsoluteFill>
  );
};

const Stars: React.FC = () => (
  <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
    {Array.from({length: 140}, (_, i) => {
      const x = (Math.sin(i * 91.7) * 0.5 + 0.5) * 1920, y = (Math.sin(i * 37.3 + 2) * 0.5 + 0.5) * 1080;
      return <circle key={i} cx={x} cy={y} r={0.6 + (i % 5) * 0.25} fill="#fff" opacity={0.15 + (i % 7) * 0.05} />;
    })}
  </svg>
);

/** 3 de cada 10 kilos se exportan */
const ExportShare: React.FC<{t: number; t0: number}> = ({t, t0}) => (
  <div style={{position: 'absolute', left: 90, top: 300, opacity: prog(t, t0, 0.4)}}>
    <div style={{fontFamily: F.head, fontSize: 64, color: K.cream, lineHeight: 1.05, marginBottom: 20}}>
      CASI <span style={{color: K.yellow}}>3 DE CADA 10</span>
      <br />
      KILOS SE EXPORTAN
    </div>
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 92px)', gap: 12}}>
      {Array.from({length: 10}, (_, i) => {
        const on = i >= 7;
        const k = pop(t, t0 + 0.2 + i * 0.07, 1.2);
        const fly = on ? easeInOut(clamp((t - t0 - 1.4 - (i - 7) * 0.15) / 0.8)) : 0;
        return (
          <div key={i} style={{width: 92, height: 62, borderRadius: 8, background: on ? K.yellow : 'rgba(244,236,221,0.2)', border: `2px solid ${on ? K.yellow : 'rgba(244,236,221,0.35)'}`, transform: `scale(${Math.max(0, k)}) translate(${fly * 700}px, ${-fly * 80}px)`, opacity: 1 - fly * 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.head, fontSize: 26, color: on ? K.bg0 : K.cream}}>
            1 KG
          </div>
        );
      })}
    </div>
  </div>
);

/** precio de exportación: julio 2025 → julio 2026 */
const ExportPrice: React.FC<{t: number; t0: number; tv: number; fmtp: (x: number) => number}> = ({t, t0, tv}) => {
  const bar = (x: number, t1: number, v: number, label: string, color: string) => {
    const k = easeOut(clamp((t - t1) / 0.8));
    return (
      <div style={{position: 'absolute', left: x, bottom: 190, width: 360, textAlign: 'center', opacity: prog(t, t1 - 0.2, 0.3)}}>
        <div style={{fontFamily: F.head, fontSize: 76, color: K.cream, marginBottom: 10}}>US$ {fmt(Math.round(v * k))}</div>
        <div style={{height: 560 * (v / 7500) * k, background: color, borderRadius: '10px 10px 0 0'}} />
        <div style={{fontFamily: F.head, fontSize: 48, color: K.mute, marginTop: 12}}>{label}</div>
      </div>
    );
  };
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 90, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 28, letterSpacing: 5, color: K.mute, opacity: prog(t, t0, 0.4)}}>
        PRECIO PROMEDIO DE EXPORTACIÓN · POR TONELADA
      </div>
      {bar(520, t0 + 0.4, 5587, 'JULIO 2025', 'rgba(244,236,221,0.45)')}
      {bar(1040, t0 + 1.0, 7123, 'JULIO 2026', K.yellow)}
      <div style={{position: 'absolute', left: 1450, top: 300, fontFamily: F.head, fontSize: 150, color: K.yellow, transform: `scale(${t > tv ? pop(t, tv, 1) : 0})`, textShadow: '0 0 50px rgba(255,204,51,0.4)'}}>+27,5%</div>
      <SrcLine t={t} t0={t0 + 0.5} text="Fuente: Consorcio ABC (carne bovina refrigerada y congelada), agosto de 2026" />
    </>
  );
};

/** la misma vaca: afuera en dólares → adentro también */
const Dollarize: React.FC<{t: number; tA: number; tD: number; tUsd: number}> = ({t, tA, tD, tUsd}) => {
  const flip = easeInOut(clamp((t - tUsd + 0.1) / 0.5));
  const tag = (x: number, t0: number, title: string, sym: string, color: string, flipK = 0) => (
    <div style={{position: 'absolute', left: x, top: 250, transform: `translate(-50%,0) scale(${Math.max(0, pop(t, t0, 1))})`, textAlign: 'center'}}>
      <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: K.cream, marginBottom: 12}}>{title}</div>
      <div style={{background: color, color: K.bg0, fontFamily: F.head, fontSize: 150, lineHeight: 1, padding: '20px 40px 8px', borderRadius: 16, transform: `scaleX(${Math.max(0.02, Math.abs(Math.cos(Math.PI * flipK)))})`, boxShadow: '0 20px 50px rgba(0,0,0,0.5)'}}>{sym}</div>
    </div>
  );
  return (
    <>
      <div style={{position: 'absolute', left: 660, top: 520, opacity: prog(t, tA - 0.4, 0.4)}}>
        <CowIcon size={600} color={K.cream} />
      </div>
      {tag(470, tA, 'AFUERA', 'US$', K.yellow)}
      {tag(1450, tD, 'ADENTRO', flip > 0.5 ? 'US$' : '$', flip > 0.5 ? K.yellow : K.celeste, flip)}
      <Big t={t} t0={tUsd + 0.2} text="SE PAGA EN DÓLARES" size={96} y={960} color={K.yellow} />
    </>
  );
};

/** faena de agosto: −12,9% */
const Faena: React.FC<{t: number; t0: number; tv: number}> = ({t, t0, tv}) => {
  const bar = (y: number, t1: number, v: number, label: string, color: string) => {
    const k = easeOut(clamp((t - t1) / 0.8));
    return (
      <div style={{position: 'absolute', left: 150, top: y, opacity: prog(t, t1 - 0.2, 0.3)}}>
        <div style={{fontFamily: F.head, fontSize: 48, color: K.mute, marginBottom: 10}}>{label}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
          <div style={{width: 1250 * (v / 1200) * k, height: 110, background: color, borderRadius: 8}} />
          <div style={{fontFamily: F.head, fontSize: 80, color: K.cream, whiteSpace: 'nowrap'}}>{fmt(Math.round(v * k))} MIL</div>
        </div>
      </div>
    );
  };
  return (
    <>
      <div style={{position: 'absolute', left: 150, top: 110, fontFamily: F.body, fontWeight: 800, fontSize: 28, letterSpacing: 5, color: K.mute, opacity: prog(t, t0, 0.4)}}>
        VACAS FAENADAS EN AGOSTO (CABEZAS)
      </div>
      {bar(230, t0 + 0.2, 1161, 'AGOSTO 2025', 'rgba(244,236,221,0.45)')}
      {bar(520, t0 + 0.8, 1011, 'AGOSTO 2026', K.red)}
      <div style={{position: 'absolute', right: 160, top: 760, fontFamily: F.head, fontSize: 170, color: K.red, transform: `scale(${t > tv ? pop(t, tv, 1) : 0})`, textShadow: '0 0 50px rgba(226,59,46,0.45)'}}>−12,9%</div>
      <SrcLine t={t} t0={t0 + 0.5} text="Fuente: CICCRA, informe de agosto de 2026" />
    </>
  );
};

/* =====================================================================================
   S09 · el pollo juega otro partido
   ===================================================================================== */
export const S09: React.FC<P> = ({t}) => {
  const c = (p: string, n = 0) => cue('s09', p, n);
  const tUn = c('Un pollo'), tCon = c('Con menos'), tPor = c('Por eso hoy'), tY = c('Y por eso');
  const tA = c('kilo de asado'), tP = [c('tres kilos'), c('kilos y medio'), c('medio de pollo'), c('pollo.', 4)];
  const drop = (t0: number) => (1 - easeIn(clamp((t - t0) / 0.4))) * 3.2;
  const weeks = 156;
  const W = 1500;
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {t < tUn + 0.3 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tUn, 0.3)}}>
          <FullPhoto src="ep06/pollo.jpg" t={t} t0={-0.2} t1={tUn + 0.3} dim={0.45} zoom={[1.02, 1.12]} credit="Horacio Cambeiro, CC BY-SA 4.0" />
          <Big t={t} t0={c('El pollo juega')} text="EL POLLO JUEGA | OTRO PARTIDO" size={140} y={760} hl={{POLLO: K.pollo}} />
        </AbsoluteFill>
      ) : null}
      {between(t, tUn, tCon + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tUn, tCon + 0.3, 0.3)}}>
          <FullVideo src="ep06/vid/granja.mp4" t={t} t0={tUn} t1={tCon + 0.3} dim={1.1} fade={0.01} credit="Granja avícola · Ishiai, CC BY-SA 4.0" />
          <div style={{position: 'absolute', left: 150, top: 150, fontFamily: F.body, fontWeight: 800, fontSize: 28, letterSpacing: 5, color: K.mute}}>CUÁNTO TARDA EN ESTAR LISTO</div>
          <TimeBar x={150} y={260} w={W} p={(7 / weeks) * easeOut(clamp((t - c('siete') + 0.2) / 0.5))} color={K.pollo} label="POLLO" value="7 SEMANAS" h={80} vo={prog(t, c('siete'), 0.4)} />
          <TimeBar x={150} y={520} w={W} p={(130 / weeks) * easeInOut(clamp((t - c('Una vaca,')) / 1.6))} color={K.red} label="VACA" value="2 A 3 AÑOS" h={80} vo={prog(t, c('dos o tres'), 0.4)} />
          <div style={{position: 'absolute', left: 150, top: 800, display: 'flex', gap: 0, opacity: prog(t, c('Una vaca,'), 0.4)}}>
            {[0, 1, 2, 3].map((y) => (
              <div key={y} style={{width: (W * 52) / weeks, borderLeft: `2px solid ${K.line}`, paddingLeft: 10, fontFamily: F.mono, fontSize: 20, color: K.mute}}>{y === 0 ? 'HOY' : `AÑO ${y}`}</div>
            ))}
          </div>
        </AbsoluteFill>
      ) : null}
      {between(t, tCon, tPor + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tCon, tPor + 0.3, 0.3)}}>
          <FullPhoto src="ep06/pollo.jpg" t={t} t0={tCon} t1={tPor + 0.3} dim={1.3} blur={4} zoom={[1.1, 1.16]} fade={0.01} />
          <Feed t={t} t0={tCon} tv={c('kilo de pollo')} />
        </AbsoluteFill>
      ) : null}
      {between(t, tPor, tY + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tPor, tY + 0.3, 0.3)}}>
          <Ember glow="rgba(210,110,40,0.3)" y={56} />
          <Stage cam={{pos: [0, 3.3, 11.2], look: [0, 2.0, 0], fov: 38}} shadow={8} key0={[4, 10, 8]}>
            <Balance
              angle={balAngle(t, tA, tP)}
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
          <Chip t={t} t0={tP[0]} text="3,5 KG DE POLLO" x={1360} y={860} color={K.pollo} size={42} />
          <Big t={t} t0={tPor + 0.1} text="POR ESO" size={90} y={140} color={K.yellow} />
        </AbsoluteFill>
      ) : null}
      {t >= tY ? (
        <AbsoluteFill style={{opacity: prog(t, tY, 0.3)}}>
          <FullPhoto src="ep06/pollo.jpg" t={t} t0={tY} dim={1.3} zoom={[1.1, 1.2]} fade={0.01} blur={3} />
          <Consumo t={t} t0={tY} tP={c('come')} tV={c('que vaca.')} />
        </AbsoluteFill>
      ) : null}
      <Vig k={0.45} />
    </AbsoluteFill>
  );
};

const Feed: React.FC<{t: number; t0: number; tv: number}> = ({t, t0, tv}) => {
  const sack = (x: number, k: number, half = false) => (
    <div style={{position: 'absolute', left: x, top: 420, transform: `scale(${Math.max(0, k)})`, transformOrigin: '50% 100%'}}>
      <svg width={half ? 110 : 180} height={240} viewBox={`0 0 ${half ? 60 : 100} 130`}>
        <path d={half ? 'M6 20 Q30 10 54 20 L58 120 Q30 128 2 120 Z' : 'M10 20 Q50 8 90 20 L96 120 Q50 130 4 120 Z'} fill="#D9C193" stroke="#8A7550" strokeWidth={3} />
        <text x={half ? 30 : 50} y={80} textAnchor="middle" fontFamily="Anton" fontSize={half ? 18 : 26} fill="#6B5635">{half ? '½' : '1 KG'}</text>
      </svg>
    </div>
  );
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: F.head, fontSize: 84, color: K.cream, opacity: prog(t, t0, 0.4)}}>
        MENOS DE <span style={{color: K.yellow}}>2 KG DE ALIMENTO</span>
      </div>
      {sack(360, pop(t, t0 + 0.3, 1))}
      {sack(570, pop(t, t0 + 0.5, 1))}
      <div style={{position: 'absolute', left: 820, top: 480, fontFamily: F.head, fontSize: 150, color: K.yellow, opacity: prog(t, tv - 0.8, 0.4)}}>→</div>
      <div style={{position: 'absolute', left: 1100, top: 380, transform: `scale(${t > tv - 0.5 ? pop(t, tv - 0.5, 1) : 0})`}}>
        <ChickenIcon size={380} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 830, textAlign: 'center', fontFamily: F.head, fontSize: 84, color: K.cream, opacity: prog(t, tv, 0.4)}}>
        = <span style={{color: K.pollo}}>1 KG DE POLLO VIVO</span>
      </div>
    </>
  );
};

/* =====================================================================================
   S10 · quién se queda con la plata (y la bronca)
   ===================================================================================== */
export const S10: React.FC<P & {total: number}> = ({t, total}) => {
  const c = (p: string, n = 0) => cue('s10', p, n);
  const tMitad = c('La mitad'), tQuinto = c('Un quinto'), tFrig = c('El frigorífico,'), tGan = c('Las ganancias'), tImp = c('Los impuestos,'), tMientras = c('Y mientras');
  const tVacas = c('Las vacas'), tProx = c('La próxima'), tDe = c('de cada cien', 1), tSon = c('Son impuestos.'), tCont = c('Contanos'), tSi = c('Si te'), tNos = c('Nos vemos');
  const lift = (t0: number, h = 0.7) => h * easeOut(clamp((t - t0) / 0.6));
  const dim = (t0: number) => 0.55 * prog(t, t0, 0.5);
  const sh = shake(t, tSon + 0.05, 18, 0.7);
  const rows = [
    {t0: tMitad, label: 'LA VACA (EN DÓLARES)', v: 51, color: K.cria},
    {t0: tQuinto, label: 'LA CARNICERÍA', v: 20, color: K.carn},
    {t0: tFrig, label: 'EL FRIGORÍFICO', v: 1, color: K.frig},
    {t0: c('veintiún'), label: 'GANANCIAS DE TODA LA CADENA', v: 21, color: K.yellow},
    {t0: c('veintiocho.'), label: 'IMPUESTOS', v: 28, color: K.red},
  ];
  return (
    <AbsoluteFill style={{background: K.bg0}}>
      {t < tMientras + 0.3 ? (
        <AbsoluteFill style={{opacity: 1 - prog(t, tMientras, 0.3)}}>
          <Ember glow="rgba(226,59,46,0.14)" x={62} y={55} />
          <GridShot
            t={t + 120}
            cam={{pos: [Math.sin(0.38 + t * 0.01) * 15.4, 12.2, Math.cos(0.38 + t * 0.01) * 15.4], look: [-5.2, 0.2, 0.3], fov: 34}}
            groups={[
              G.cria(1, {lift: lift(tMitad) * (1 - prog(t, tQuinto, 0.5)) + 0.15, dim: t > tQuinto ? dim(tQuinto) : 0}),
              G.inv(1, {lift: lift(tMitad) * (1 - prog(t, tQuinto, 0.5)) + 0.15, dim: t > tQuinto ? dim(tQuinto) : 0}),
              G.frig(1, {lift: lift(tFrig, 1), glow: prog(t, tFrig, 0.4) * (1 - prog(t, tGan, 0.4)), dim: t > tGan ? dim(tGan) : 0}),
              G.carn(1, {lift: lift(tQuinto) * (1 - prog(t, tFrig, 0.5)), dim: t > tFrig ? dim(tFrig) : 0}),
              G.imp(1, {lift: lift(tImp, 1.4), glow: prog(t, tImp + 0.6, 0.5) * 1.2}),
            ]}
          />
          <Big t={t} t0={0.05} t1={tMitad} text="¿QUIÉN SE QUEDA | CON LA PLATA?" size={100} x={110} y={380} align="left" w={900} hl={{PLATA: K.yellow}} />
          <Panel x={80} y={240} w={700} h={580} o={prog(t, tMitad - 0.2, 0.4)}>
            <div style={{padding: '30px 36px'}}>
              <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 22, letterSpacing: 5, color: K.mute, marginBottom: 16}}>DE CADA $100</div>
              {rows.map((r, i) => (
                <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', height: 92, opacity: prog(t, r.t0, 0.35), borderTop: i === 3 ? `2px solid ${K.line}` : undefined, paddingTop: i === 3 ? 6 : 0}}>
                  <span style={{fontFamily: F.head, fontSize: i === 4 ? 50 : 40, color: i >= 3 ? r.color : K.cream}}>{r.label}</span>
                  <span style={{fontFamily: F.head, fontSize: i === 4 ? 86 : 64, color: r.color}}>${r.v}</span>
                </div>
              ))}
            </div>
          </Panel>
          <FadaSrc t={t} t0={tMitad} />
        </AbsoluteFill>
      ) : null}
      {between(t, tMientras, tVacas + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tMientras, tVacas + 0.3, 0.35)}}>
          <Ember glow="rgba(200,90,40,0.22)" y={62} />
          <Stage cam={{pos: [2.5, 4.4, 15], look: [0.4, 2.7, 0], fov: 38}} shadow={9} key0={[5, 12, 8]}>
            <TrayTower n={100} p={1} pos={[-2.2, 0, 0]} />
            <TrayTower n={46} p={easeOut(clamp((t - c('come menos')) / 1))} pos={[2.2, 0, 0]} />
            <ShadowFloor o={0.55} />
          </Stage>
          <Big t={t} t0={c('un país')} text="MÁS VACAS QUE PERSONAS" size={80} y={120} />
          <Big t={t} t0={c('come menos')} text="Y COMEMOS MENOS DE LA MITAD | QUE NUESTROS ABUELOS" size={64} y={960} hl={{MITAD: K.red}} />
        </AbsoluteFill>
      ) : null}
      {between(t, tVacas, tProx + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tVacas, tProx + 0.3, 0.4)}}>
          <FullPhoto src="ep06/niebla.jpg" t={t} t0={tVacas} t1={tProx + 0.3} zoom={[1.0, 1.08]} dim={0.6} fade={0.01} credit="Oscar Fava, CC BY 3.0" />
          <Big t={t} t0={tVacas + 0.1} text="LAS VACAS SIGUEN ESTANDO." size={110} y={420} />
          <Big t={t} t0={c('Lo que cambió')} text="LO QUE CAMBIÓ ES | QUIÉN PUEDE PAGARLAS." size={96} y={680} hl={{PAGARLAS: K.yellow}} />
        </AbsoluteFill>
      ) : null}
      {between(t, tProx, tCont + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tProx, tCont + 0.3, 0.35), transform: `translate(${sh.x}px, ${sh.y}px)`}}>
          <FullPhoto src="ep06/asado2.jpg" t={t} t0={tProx} t1={tCont + 0.3} zoom={[1.06, 1.22]} focus="38% 45%" dim={t > tDe ? 0.6 + 0.6 * prog(t, tDe, 0.5) : 0.35} fade={0.01} credit="Maxd2, CC BY-SA 4.0" />
          <Sparks t={t} n={60} o={1} />
          <Big t={t} t0={tProx + 0.1} t1={tDe} text="LA PRÓXIMA VEZ QUE PRENDAS EL FUEGO" size={84} y={860} />
          {t > tDe - 0.1 ? (
            <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center'}}>
              <div style={{fontFamily: F.head, fontSize: 96, color: K.cream, opacity: prog(t, tDe, 0.3)}}>DE CADA $100,</div>
              <div style={{fontFamily: F.head, fontSize: 250, lineHeight: 1, color: K.red, opacity: prog(t, c('veintiocho', 1), 0.2), transform: `scale(${t > c('veintiocho', 1) ? pop(t, c('veintiocho', 1), 1) : 0})`, textShadow: '0 0 70px rgba(226,59,46,0.5)'}}>
                $28
              </div>
              <div style={{fontFamily: F.head, fontSize: 110, color: K.cream, opacity: prog(t, c('no son'), 0.3)}}>NO SON CARNE.</div>
              {t > tSon - 0.05 ? (
                <div style={{fontFamily: F.head, fontSize: 170, color: K.cream, background: K.red, display: 'inline-block', padding: '10px 40px 0', marginTop: 16, transform: `scale(${pop(t, tSon - 0.05, 1.3)}) rotate(-2deg)`}}>SON IMPUESTOS.</div>
              ) : null}
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}
      {between(t, tCont, tSi + 0.3) ? (
        <AbsoluteFill style={{opacity: fadeIO(t, tCont, tSi + 0.3, 0.3)}}>
          <FullPhoto src="ep06/asado3.jpg" t={t} t0={tCont} t1={tSi + 0.3} dim={1.2} blur={5} zoom={[1.1, 1.16]} fade={0.01} />
          <CommentCard t={t} t0={tCont} tv={c('pagaste')} />
        </AbsoluteFill>
      ) : null}
      {t > tSi - 0.5 ? <EndCard t={t} t0={tSi - 0.2} tSusc={c('suscribite')} tComp={c('compartilo')} tNos={tNos} total={total} /> : null}
      <Vig k={0.45} />
    </AbsoluteFill>
  );
};

const CommentCard: React.FC<{t: number; t0: number; tv: number}> = ({t, t0, tv}) => {
  const typed = '$ 18.900 el kilo en Morón';
  const n = Math.floor(clamp((t - tv - 0.3) / 1.6) * typed.length);
  return (
    <div style={{position: 'absolute', left: 960, top: 540, transform: `translate(-50%,-50%) scale(${pop(t, t0, 0.9)})`}}>
      <div style={{width: 1180, background: '#FBF8F2', borderRadius: 22, padding: '44px 54px', boxShadow: '0 40px 90px rgba(0,0,0,0.6)'}}>
        <div style={{fontFamily: F.head, fontSize: 64, color: K.bg0, lineHeight: 1.05}}>¿CUÁNTO PAGASTE EL KILO DE ASADO ESTA SEMANA?</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 30}}>
          <div style={{width: 64, height: 64, borderRadius: 32, background: K.yellow, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.head, fontSize: 36}}>C</div>
          <div style={{flex: 1, borderBottom: '3px solid #26221E', fontFamily: F.body, fontSize: 40, fontWeight: 600, color: '#26221E', paddingBottom: 8}}>
            {typed.slice(0, n)}
            <span style={{opacity: Math.floor(t * 2.5) % 2 ? 1 : 0}}>|</span>
          </div>
        </div>
        <div style={{marginTop: 26, fontFamily: F.body, fontWeight: 800, fontSize: 26, letterSpacing: 4, color: '#6A625A'}}>DEJALO EN LOS COMENTARIOS ↓</div>
      </div>
    </div>
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
      <AbsoluteFill style={{opacity: bg * 0.8, background: 'radial-gradient(ellipse at 30% 55%, rgba(255,106,43,0.16) 0%, rgba(0,0,0,0) 60%)'}} />
      <Sparks t={t} n={30} o={0.5 * bg} />
      <div style={{position: 'absolute', left: lx, top: ly}}>
        <LogoMark size={size} t={t} t0={t0} />
      </div>
      <div style={{position: 'absolute', left: -560 * move, right: 560 * move, top: 680 - 220 * move, textAlign: 'center', opacity: prog(t, t0 + 0.5, 0.5)}}>
        <div style={{fontFamily: F.head, fontSize: 110 - 30 * move, color: '#fff', letterSpacing: 6}}>CONTEXTO</div>
      </div>
      <div style={{position: 'absolute', left: 960 - 190 - 560 * move, top: 830 - 240 * move, opacity: prog(t, tSusc - 0.2, 0.3), transform: `scale(${pop(t, tSusc - 0.2)})`}}>
        <div style={{width: 380, height: 84, background: K.red, borderRadius: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 34, letterSpacing: 3, color: '#fff', boxShadow: '0 10px 30px rgba(226,59,46,0.45)'}}>
          SUSCRIBITE
        </div>
      </div>
      <div style={{position: 'absolute', left: 960 - 380 - 560 * move, top: 945 - 240 * move, width: 760, textAlign: 'center', opacity: prog(t, tComp - 0.2, 0.3), fontFamily: F.body, fontWeight: 700, fontSize: 28, color: K.mute}}>
        Compartilo con el que siempre pone la plata para el asado
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

export {Diorama, STX, WIDE, StationLabels, DioStage, PriceLabel, ShadowFloor, camPath, easeInOut};
