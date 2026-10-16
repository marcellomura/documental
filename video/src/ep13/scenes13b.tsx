/* Escenas 7 a 12 del episodio 13 (EL LOTE 31.202): la sanción que no llegó, la alarma interna («Sí, lo sé»), la
   trazabilidad y las nueve fetas alineadas, el hospital que se dio cuenta, el encubrimiento y la Justicia, el cierre
   con las fechas de cada agujero, el homenaje y la placa final. */
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {cue, cueE, TL, CARD_LEAD} from './lib';
import {
  K, F, gs, gm, mix, clamp, easeIn, easeInOut, easeOut, pop, prog, rnd, fadeIO, ClinicBg, PaperBg, Letterbox, Kicker, Title13, SyncWords, Quote13, Stat13, DateRoll,
  BarrierHUD, BarrierCard, Stamp13, Recreation, DocSheet, ChatPanel, NameCard13, Photo13, PhotoCard13, Source13, Odo13, ramp, Poll13, Dust, Vignette, BARRERAS, BurnAway,
  SliceGlyph,
} from './kit13';
import {DatesRail, Ampoules120k, TraceList, ArgMap13, TwelveAmpoules, EmailCard, GenomeMatch, PatientsLink, Autoclave2D, Destroyed, MissingKilos, Procesados13, CasePipeline, Boxes4M} from './viz13b';
import {StackView, travelZ, passed} from './stack13';
import {camPath, breathe, sliceZ, PATH_XY, lerpCam} from './three13';
import type {Cam} from './three13';
import {Layer} from './scenes13a';
import {LogoMark} from '../ep04/kit';

const D = TL.durations;

/* ================================================================== S07 · LA SANCIÓN */
export const S07: React.FC<{t: number}> = ({t}) => {
  const tDos = cue('s07', 'preparó dos cartas');
  const tRam = cue('s07', 'Una para Ramallo');
  const tHLB = cue('s07', 'Y otra para HLB');
  const tProh = cue('s07', 'prohibía comercializar');
  const tNunca = cue('s07', 'nunca se firmó');
  const tFirm = cue('s07', 'La de Ramallo se firmó');
  const tDiez = cue('s07', 'el diez de febrero');
  const tMedio = cue('s07', 'En el medio');
  const tBisio = cue('s07', 'Nélida Agustina Bisio');
  const tMant = cue('s07', 'Gabriela Mantecón Fumadó');
  const tDueno = cue('s07', 'se reunieron con');
  const t30 = cue('s07', 'El treinta de enero');
  const t8 = cue('s07', 'El ocho de febrero');
  const tPac = cue('s07', 'La paciente');
  const t12 = cue('s07', 'murió el doce');
  const end = D.s07;
  return (
    <AbsoluteFill>
      <ClinicBg t={t} light={0.65} />
      <Layer t={t} a={1.9} b={tMedio + 0.2}>
        <PaperBg />
        <Kicker t={t} t0={tDos - 0.1} text="El INAME prepara dos cartas de advertencia" x={960} y={110} color={K.redDeep} align="center" />
        <DocSheet t={t} t0={tRam - 0.2} x={620} y={590} w={540} rot={-2.5} title="CARTA DE ADVERTENCIA" to="Para: Laboratorios Ramallo S.A. · fabricaba" date="Buenos Aires, ___ de ________ de 20__" lines={8} seed={21} sign={prog(t, tFirm + 0.2, 1.2)}>
          <Recreation x={520} y={18} dark={false} />
        </DocSheet>
        <DocSheet
          t={t} t0={tHLB - 0.2} x={1300} y={590} w={540} rot={2} title="CARTA DE ADVERTENCIA" to="Para: HLB Pharma Group S.A. · vendía" date="Buenos Aires, ___ de ________ de 20__" seed={33}
          body={
            <div>
              <div style={{height: 7, width: '92%', background: 'rgba(11,20,22,0.5)', borderRadius: 2, marginBottom: 14}} />
              <div style={{height: 7, width: '84%', background: 'rgba(11,20,22,0.5)', borderRadius: 2, marginBottom: 18}} />
              <div style={{position: 'relative', fontFamily: F.doc, fontWeight: 700, fontSize: 25, color: K.ink, padding: '6px 8px', opacity: prog(t, tProh - 0.1, 0.4)}}>
                Se prohíbe comercializar todos sus productos.
                <span style={{position: 'absolute', left: 0, bottom: 2, height: 4, width: `${prog(t, tProh + 0.3, 0.6) * 100}%`, background: K.red}} />
              </div>
              <div style={{height: 7, width: '88%', background: 'rgba(11,20,22,0.5)', borderRadius: 2, margin: '18px 0 14px'}} />
              <div style={{height: 7, width: '60%', background: 'rgba(11,20,22,0.5)', borderRadius: 2}} />
            </div>
          }
          sign="empty"
        >
          <Recreation x={520} y={18} dark={false} />
        </DocSheet>
        <Stamp13 t={t} t0={tNunca + 0.45} text="NUNCA SE FIRMÓ" x={1330} y={820} rot={-8} size={64} />
        <Stamp13 t={t} t0={tDiez + 0.2} text="FIRMADA" sub="10 · 02 · 2025" x={640} y={850} rot={6} size={48} color="#1B2A6B" />
      </Layer>
      <Layer t={t} a={tMedio - 0.1} b={end + 2.3}>
        <DatesRail
          t={t} t0={tMedio - 0.1} d0={-3} d1={46} y={600}
          months={[[0, 'ENE 2025'], [31, 'FEB']]}
          focus={t > end + 0.3 ? 4 : -1}
          marks={[
            {day: 13, label: '14 ENE', sub: 'Reunión con el dueño del laboratorio', at: cue('s07', 'el catorce de enero'), color: K.amber, h: 80, up: false},
            {day: 29, label: '30 ENE', sub: 'El lote 31.202 sale a las droguerías', at: t30, color: K.bone, h: 230},
            {day: 38, label: '8 FEB', sub: 'Primera aplicación', at: t8, up: false, h: 60, color: K.bone, align: 'right'},
            {day: 40, label: '10 FEB', sub: 'Recién se firma la carta a Ramallo', at: t8 + 1.0, color: K.amber, h: 110, align: 'right'},
            {day: 42, label: '12 FEB', sub: 'Muere una paciente de 50 años', at: t12 - 0.2, up: false, color: K.red, big: true, h: 170, align: 'right'},
          ]}
        />
        <div style={{position: 'absolute', left: 0, top: 0, opacity: fadeIO(t, tBisio - 0.2, t30 - 0.2, 0.4)}}>
          <NameCard13 t={t} t0={tBisio - 0.2} name="Nélida Agustina Bisio" role="Titular de la ANMAT" x={110} y={250} size={60} statusColor={K.blue} />
          <NameCard13 t={t} t0={tMant - 0.2} name="Gabriela Mantecón Fumadó" role="Directora del INAME" x={900} y={250} size={60} statusColor={K.blue} />
        </div>
        <div style={{position: 'absolute', left: 110, top: 420, opacity: fadeIO(t, tDueno, t30 - 0.2, 0.4), ...gm(24, K.amber, 600, 0.16)}}>SE REÚNEN CON EL DUEÑO DEL LABORATORIO Y PARTE DE SU EQUIPO</div>
        <AbsoluteFill style={{background: `radial-gradient(ellipse 40% 50% at 78% 72%, rgba(255,59,48,${0.14 * prog(t, t12, 1.2)}) 0%, rgba(0,0,0,0) 70%)`}} />
      </Layer>
      <BarrierHUD t={t} t0={2.0} t1={end + 1.6} n={7} failedUpTo={6} light={prog(t, 1.9, 0.45) * (1 - prog(t, tMedio - 0.25, 0.45))} />
      <BarrierCard t={t} t0={-CARD_LEAD.s07} dur={CARD_LEAD.s07 + 1.9} n={7} sub="la carta que nunca llegó" />
    </AbsoluteFill>
  );
};

/* ================================================================== S08 · LA ALARMA INTERNA */
export const S08: React.FC<{t: number}> = ({t}) => {
  const t26 = cue('s08', 'El veintiséis de febrero');
  const tPel = cue('s08', 'es peligroso');
  const tPers = cue('s08', 'Una persona que reporte');
  const tExp = cue('s08', 'Según el expediente');
  const tGuita = cue('s08', 'es un montón de guita');
  const tSe = cue('s08', 'sí, lo sé');
  const tDos = cue('s08', 'Dos semanas más tarde');
  const tPart = cue('s08', 'ciento veinte mil');
  const tBis = cue('s08', 'Bisio le escribe');
  const tDecime = cue('s08', 'decime en dos palabras');
  const tMario = cue('s08', 'Ese Mario sería');
  const tCierre = cue('s08', 'El cierre recién llegó');
  const tMuertos = cue('s08', 'ya había muertos');
  const end = D.s08;
  return (
    <AbsoluteFill>
      <ClinicBg t={t} light={0.6} alarm={between(t, tSe, tDos) ? 0.7 : 0.15} />
      <Layer t={t} a={2.2} b={tDos - 0.1}>
        <DateRoll t={t} t0={t26 - 0.1} text="26.02.2025" label="UNA TÉCNICA DEL INAME" x={110} y={330} align="left" size={84} labelColor={K.amber} />
        <div style={{position: 'absolute', left: 110, top: 410, opacity: prog(t, t26 + 0.6, 0.5), ...gm(22, K.mute, 500, 0.16)}}>LE ESCRIBE A SU JEFA</div>
        <Kicker t={t} t0={tExp} text="Según el expediente" x={110} y={520} color={K.red} />
        <div style={{position: 'absolute', inset: 0, opacity: 1 - prog(t, tSe + 1.0, 0.5) * 0.8}}>
          <ChatPanel
            t={t} t0={t26 - 0.2} x={1250} y={560} w={820} h={700} title="Gabriela Mantecón Fumadó" sub="Directora del INAME · chat incorporado a la causa" avatar="G" date="26 de febrero de 2025"
            msgs={[
              {side: 'out', text: 'Es peligroso.', at: tPel},
              {side: 'out', text: 'Una persona que reporte evento adverso o se muera, es nuestra responsabilidad.', at: tPers},
              {side: 'in', text: 'Es un montón de guita que está en la calle.', at: tGuita},
              {side: 'in', text: 'Sí, lo sé.', at: tSe},
            ]}
            focus={t > tSe + 0.3 ? 3 : -1}
          />
          <Recreation />
        </div>
        <Quote13 t={t} t0={tSe + 1.0} t1={tDos - 0.15} text="Sí, lo sé." by="Gabriela Mantecón Fumadó · directora del INAME · según el expediente" x={960} y={560} size={170} accent={K.red} />
      </Layer>
      <Layer t={t} a={tDos - 0.2} b={tBis - 0.1}>
        <DateRoll t={t} t0={tDos} text="14.03.2025" label="DOS SEMANAS MÁS TARDE" x={430} y={262} align="left" size={70} />
        <div style={{position: 'absolute', left: 430, top: 335, opacity: prog(t, tDos + 1.0, 0.5), ...gs(40, 650, K.bone)}}>
          HLB entrega <span style={{color: K.red}}>otra partida</span> de fentanilo
        </div>
        <Ampoules120k t={t} t0={tPart - 0.6} y={718} dur={3.0} s={0.88} />
      </Layer>
      <Layer t={t} a={tBis - 0.2} b={tCierre - 0.1}>
        <Photo13 src="ep13/img/ministerio_salud.jpg" t={t} t0={tMario - 0.3} from={{s: 1.05, x: 0, y: -40}} to={{s: 1.14, x: 0, y: -80}} dur={5} focus="50% 35%" dim={0.6} credit="Elsapucai · Wikimedia Commons · dominio público" />
        <DateRoll t={t} t0={tBis - 0.1} t1={tMario - 0.2} text="26.03.2025" label="BISIO LE ESCRIBE A MANTECÓN" x={110} y={330} align="left" size={84} labelColor={K.amber} />
        <div style={{position: 'absolute', inset: 0, opacity: 1 - prog(t, tMario - 0.3, 0.5)}}>
          <ChatPanel
            t={t} t0={tBis - 0.1} x={1240} y={560} w={800} h={520} title="Gabriela Mantecón Fumadó" sub="chat incorporado a la causa" avatar="G" date="26 de marzo de 2025"
            msgs={[{side: 'out', text: 'Solo en dos palabras decime si esto da para cierre porque Mario pregunta', at: tDecime}]}
          />
          <Recreation />
        </div>
        <NameCard13 t={t} t0={tMario + 0.2} name="Mario Lugones" role="Ministro de Salud de la Nación" x={110} y={760} size={84} statusColor={K.blue} />
      </Layer>
      <Layer t={t} a={tCierre - 0.2} b={end + 1.95}>
        <DatesRail
          t={t} t0={tCierre - 0.2} d0={38} d1={142} y={660}
          months={[[31, 'FEB'], [59, 'MAR'], [90, 'ABR'], [120, 'MAY']]}
          band={{from: 42, to: 121, at: tMuertos - 0.1, label: 'PARA ENTONCES, YA HABÍA MUERTOS', color: K.red}}
          marks={[
            {day: 42, label: '12 FEB', sub: 'Muere una paciente', at: tCierre - 0.1, color: K.red, h: 120},
            {day: 56, label: '26 FEB', sub: '«Sí, lo sé»', at: tCierre + 0.1, color: K.amber, h: 220, up: false},
            {day: 72, label: '14 MAR', sub: '120.000 ampollas más', at: tCierre + 0.3, color: K.bone, h: 160},
            {day: 84, label: '26 MAR', sub: '«Mario pregunta»', at: tCierre + 0.5, color: K.amber, h: 220, up: false},
            {day: 121, label: 'MAYO', sub: 'Recién llega el cierre', at: tCierre + 0.8, color: K.teal, big: true, h: 200},
          ]}
        />
      </Layer>
      <BarrierHUD t={t} t0={2.0} t1={end + 1.6} n={8} failedUpTo={7} />
      <BarrierCard t={t} t0={-CARD_LEAD.s08} dur={CARD_LEAD.s08 + 2.4} n={8} sub="cuando adentro ya sabían" />
    </AbsoluteFill>
  );
};
const between = (t: number, a: number, b: number) => t >= a && t < b;

/* ================================================================== S09 · TRAZABILIDAD Y ALINEACIÓN */
export const S09: React.FC<{t: number}> = ({t}) => {
  const tPoder = cue('s09', 'poder saber');
  const tOblig = cue('s09', 'para muchos remedios');
  const tNo = cue('s09', 'El fentanilo no estaba');
  const tAsi = cue('s09', 'Así que las ampollas');
  const places = ['Buenos Aires', 'Santa Fe', 'Córdoba', 'la Ciudad', 'Neuquén', 'Formosa', 'Jujuy'].map((p) => cue('s09', p));
  const tNadie = cue('s09', 'nadie podía');
  const tAlin = cue('s09', 'Las nueve fetas');
  const tEnt = cue('s09', 'Y entonces apareció');
  const tOrg = cue('s09', 'ningún organigrama');
  const N = 9;
  const zStart = sliceZ(0, N) - 1.6;
  const zTenth = sliceZ(N - 1, N) + 1.15 * 1.1;
  // la ampolla cruza las nueve (lento, durante el silencio), espera y choca contra la décima
  let z = zStart;
  if (t > tAlin) {
    const k = prog(t, tAlin + 0.2, 3.6, easeInOut);
    z = mix(zStart, sliceZ(N - 1, N) + 0.55, k);
    if (t > tEnt + 0.9) {
      const k2 = prog(t, tEnt + 0.9, 0.55, easeIn);
      z = mix(sliceZ(N - 1, N) + 0.55, zTenth - 0.36, k2);
      const hit = tEnt + 1.45;
      if (t > hit) z = zTenth - 0.36 - Math.abs(Math.sin((t - hit) * 9)) * 0.12 * Math.exp(-(t - hit) * 3.5);
    }
  }
  const cam: Cam = camPath(t, [
    [tAlin - 0.4, {pos: [7.2, 2.6, -9.4], look: [0, 0, -1.6], fov: 32}],
    [tAlin + 0.8, {pos: [3.4, 1.0, -6.2], look: [0.3, 0, -1.0], fov: 32}],
    [tAlin + 2.4, {pos: [2.8, 0.9, 1.0], look: [0.3, 0, 4.6], fov: 32}],
    [tEnt + 0.2, {pos: [4.6, 1.6, 2.4], look: [0.2, 0, 5.6], fov: 32}],
  ], 1.5);
  const tenthO = prog(t, tEnt + 0.15, 0.8, easeOut);
  return (
    <AbsoluteFill>
      <ClinicBg t={t} light={0.6} alarm={between(t, tAlin, tEnt) ? 0.5 : 0} />
      <Layer t={t} a={2.0} b={tAsi - 0.05}>
        <TraceList t={t} t0={tOblig - 0.4} tMiss={tNo} x={200} y={250} />
        <div style={{position: 'absolute', left: 1080, top: 330, width: 680, opacity: prog(t, tPoder, 0.5)}}>
          <div style={{...gm(22, K.teal, 600, 0.2)}}>TRAZABILIDAD</div>
          <div style={{...gs(58, 700, K.bone, -0.02), lineHeight: 1.1, marginTop: 10}}>poder saber en qué paciente terminó cada ampolla</div>
        </div>
      </Layer>
      <Layer t={t} a={tAsi - 0.2} b={tAlin + 0.1}>
        <ArgMap13 t={t} t0={tAsi - 0.2} at={places} lost={tNadie} />
        <div style={{position: 'absolute', left: 110, top: 330, width: 640}}>
          <Kicker t={t} t0={tAsi} text="Droguerías, clínicas y hospitales" x={0} y={0} color={K.red} />
          <div style={{...gs(64, 760, K.bone, -0.02), marginTop: 40, opacity: prog(t, tNadie, 0.5), lineHeight: 1.05}}>
            nadie podía seguirles
            <br />
            <span style={{color: K.amber}}>el rastro</span>
          </div>
        </div>
      </Layer>
      <Layer t={t} a={tAlin - 0.25} b={D.s09 + 1.9}>
        <StackView
          t={t} cam={breathe(cam, t, 0.4)} n={N}
          state={(i) => {
            const pz = sliceZ(i, N);
            const flash = z > pz ? Math.max(0, 1 - (t - (tAlin + 0.2 + ((i + 1) / (N + 1)) * 3.6)) / 0.8) : 0;
            return {o: 1, open: 1, align: 1, glow: 0.15 + flash * 0.9};
          }}
          traveler={{kind: 'ampoule', z, glow: 0.8, spin: t * 0.5}}
          tenth={{o: tenthO, glow: 0.35 + 0.65 * Math.max(0, 1 - Math.abs(t - (tEnt + 1.45)) / 0.6)}}
          overlay={() => (
            <>
              <SyncWords t={t} t1={tEnt - 0.2} y={960} size={60} words={[{w: 'Las', t: tAlin}, {w: 'nueve', t: tAlin + 0.2}, {w: 'fetas,', t: tAlin + 0.45}, {w: 'alineadas.', t: tAlin + 0.9, color: K.red}]} />
              <SyncWords t={t} y={960} size={54} words={[{w: 'Una', t: tEnt + 0.2}, {w: 'barrera', t: tEnt + 0.4}, {w: 'que', t: tEnt + 0.65}, {w: 'no', t: tEnt + 0.8}, {w: 'figuraba', t: tEnt + 0.95}, {w: 'en', t: tOrg - 0.15}, {w: 'ningún', t: tOrg}, {w: 'organigrama.', t: tOrg + 0.3, color: K.teal}]} />
            </>
          )}
        />
        <AbsoluteFill style={{background: K.teal, opacity: Math.max(0, 1 - Math.abs(t - (tEnt + 1.45)) / 0.18) * 0.25, mixBlendMode: 'screen'}} />
      </Layer>
      <BarrierHUD t={t} t0={2.0} t1={D.s09 + 1.6} n={9} failedUpTo={t > tAlin ? 9 : 8} hospital={tenthO} />
      <BarrierCard t={t} t0={-CARD_LEAD.s09} dur={CARD_LEAD.s09 + 2.2} n={9} sub="seguir cada ampolla" />
    </AbsoluteFill>
  );
};

/* ================================================================== S10 · EL HOSPITAL */
export const S10: React.FC<{t: number}> = ({t}) => {
  const tBrote = cue('s10', 'empezó un brote');
  const tDos = cue('s10', 'Dos bacterias');
  const tKleb = cue('s10', 'Klebsiella pneumoniae');
  const tRal = cue('s10', 'y Ralstonia');
  const tNoEran = cue('s10', 'No eran bacterias');
  const tComun = cue('s10', 'Los pacientes infectados');
  const tTodos = cue('s10', 'a todos les habían');
  const tDoce = cue('s10', 'analizaron doce');
  const tDiez = cue('s10', 'Diez tenían');
  const tOtra = cue('s10', 'Las de otra marca');
  const tMayo = cue('s10', 'El dos de mayo');
  const tDai = cue('s10', 'Daiana Martínez');
  const tCorreo = cue('s10', 'mandó un correo');
  const tMal = cue('s10', 'Tiempo después');
  const tGen = cue('s10', 'la coincidencia genómica');
  const tBarr = cue('s10', 'La barrera que funcionó');
  const tEq = cue('s10', 'Fue un equipo');
  const cam: Cam = {pos: [3.0 - (t - tBarr) * 0.08, 1.2, 9.6 - (t - tBarr) * 0.12], look: [0, 0, 5.0], fov: 30};
  return (
    <AbsoluteFill>
      <ClinicBg t={t} light={0.8} />
      <Layer t={t} a={-0.6} b={tDos - 0.1}>
        <Photo13 src="ep13/img/hospital_italiano_lp.jpg" t={t} t0={-0.6} from={{s: 1.08, x: 0, y: 60}} to={{s: 1.18, x: 0, y: 20}} dur={7} focus="50% 45%" credit="Lmalena · Wikimedia Commons · CC BY-SA 4.0" />
        <Kicker t={t} t0={0.0} text="Abril de 2025 · La Plata" x={110} y={150} color={K.teal} plate />
        <Title13 t={t} t0={0.6} text={'Hospital Italiano\nde La Plata'} size={110} x={110} y={760} align="left" upper={false} g0={250} g1={760} />
        <SyncWords t={t} x={114} y={920} w={1200} align="left" size={52} words={[{w: 'empezó', t: tBrote}, {w: 'un', t: tBrote + 0.3}, {w: 'brote', t: tBrote + 0.45}, {w: 'extraño.', t: tBrote + 0.7, color: K.amber, serif: true}]} />
      </Layer>
      <Layer t={t} a={tDos - 0.2} b={tComun - 0.1}>
        <Kicker t={t} t0={tDos} text="Dos bacterias" x={960} y={130} color={K.red} align="center" />
        <PhotoCard13 src="ep13/img/kleb_01.png" t={t} t0={tKleb - 0.2} x={590} y={500} w={680} h={450} rot={-2} caption="Klebsiella pneumoniae · resistente a muchos antibióticos" credit="CDC · dominio público" grade="lab" />
        <PhotoCard13 src="ep13/img/ralstonia.png" t={t} t0={tRal - 0.2} x={1330} y={500} w={680} h={450} rot={2} caption="Ralstonia · suele vivir en el agua" credit="CDC / J. Noble-Wang, J. Carr · dominio público" grade="lab" />
        <SyncWords t={t} y={930} size={56} words={[{w: 'No', t: tNoEran}, {w: 'eran', t: tNoEran + 0.15}, {w: 'bacterias', t: tNoEran + 0.3}, {w: 'de', t: tNoEran + 0.75}, {w: 'ese', t: tNoEran + 0.85}, {w: 'hospital.', t: tNoEran + 1.0, color: K.amber}]} />
      </Layer>
      <Layer t={t} a={tComun - 0.2} b={tDoce - 0.1}>
        <PatientsLink t={t} t0={tComun - 0.1} tLink={tTodos} />
        <Kicker t={t} t0={tComun} text="Los pacientes infectados tenían algo en común" x={960} y={110} color={K.teal} align="center" />
      </Layer>
      <Layer t={t} a={tDoce - 0.2} b={tMayo - 0.1}>
        <TwelveAmpoules t={t} t0={tDoce - 0.1} tTen={tDiez} tOther={tOtra} y={430} />
      </Layer>
      <Layer t={t} a={tMayo - 0.2} b={tMal - 0.1}>
        <DateRoll t={t} t0={tMayo - 0.1} text="02.05.2025" label="EL AVISO" x={110} y={200} align="left" size={84} />
        <NameCard13 t={t} t0={tDai - 0.2} name="Daiana Martínez" role="Jefa de Farmacia · Hospital Italiano de La Plata" x={110} y={420} size={68} statusColor={K.teal} />
        <EmailCard t={t} t0={tMayo + 0.3} tSend={tCorreo + 1.2} x={1330} y={560} />
      </Layer>
      <Layer t={t} a={tMal - 0.2} b={tBarr - 0.1}>
        <Photo13 src="ep13/img/malbran_torre.jpg" t={t} t0={tMal - 0.2} from={{s: 1.05, x: 0, y: 0}} to={{s: 1.12, x: -20, y: 0}} dur={7} dim={0.75} credit="Roberto Fiadone · Wikimedia Commons · CC BY 4.0" />
        <Kicker t={t} t0={tMal} text="Instituto Malbrán" x={110} y={150} color={K.teal} plate />
        <GenomeMatch t={t} t0={tMal + 0.2} tMatch={tGen} x={1000} y={560} />
      </Layer>
      <Layer t={t} a={tBarr - 0.2} b={D.s10 + 2.4}>
        <StackView
          t={t} cam={cam} n={9}
          state={() => ({o: 0.55, open: 1, align: 1, glow: 0.1})}
          traveler={{kind: 'ampoule', z: sliceZ(8, 9) + 1.15 * 1.1 - 0.36, glow: 0.5, spin: 0.8}}
          tenth={{o: 1, glow: 0.4 + 0.25 * Math.sin(t * 2)}}
        />
        <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(4,10,11,0.85) 0%, rgba(4,10,11,0.4) 45%, rgba(4,10,11,0) 70%)'}} />
        <SyncWords t={t} x={110} y={420} w={900} align="left" size={56} weight={500} words={[{w: 'La', t: tBarr}, {w: 'barrera', t: tBarr + 0.15}, {w: 'que', t: tBarr + 0.4}, {w: 'funcionó', t: tBarr + 0.55}, {w: 'no', t: tBarr + 1.1, color: K.mute}, {w: 'fue', t: tBarr + 1.25, color: K.mute}, {w: 'un', t: tBarr + 1.4, color: K.mute}, {w: 'organismo', t: tBarr + 1.55, color: K.mute, strike: tEq - 0.1}, {w: 'de', t: tBarr + 1.9, color: K.mute, strike: tEq - 0.05}, {w: 'control.', t: tBarr + 2.05, color: K.mute, strike: tEq}]} />
        <SyncWords t={t} x={110} y={640} w={900} align="left" size={74} weight={760} words={[{w: 'Fue', t: tEq}, {w: 'un', t: tEq + 0.15}, {w: 'equipo', t: tEq + 0.3, color: K.teal}, {w: 'de', t: tEq + 0.55, color: K.teal}, {w: 'hospital', t: tEq + 0.65, color: K.teal}, {w: 'que', t: tEq + 1.0}, {w: 'se', t: tEq + 1.15}, {w: 'dio', t: tEq + 1.3}, {w: 'cuenta.', t: tEq + 1.45}]} />
      </Layer>
    </AbsoluteFill>
  );
};

/* ================================================================== S11 · EL ENCUBRIMIENTO Y LA JUSTICIA */
export const S11: React.FC<{t: number}> = ({t}) => {
  const tEntre = cue('s11', 'Entre el siete');
  const tSabian = cue('s11', 'cuando ya sabían');
  const tAuto = cue('s11', 'se esterilizaron');
  const tDom = cue('s11', 'El domingo once');
  const tEsos = cue('s11', 'En esos días');
  const tDig = cue('s11', 'información digital');
  const tDoc = cue('s11', 'documentación');
  const tCit = cue('s11', 'y el citrato');
  const tCat = cue('s11', 'El catorce de mayo');
  const tQuem = cue('s11', 'hoy quemamos todo');
  const tKilos = cue('s11', 'Casi cinco kilos');
  const tEmp = cue('s11', 'la empresa dice');
  const tJuez = cue('s11', 'el juez investiga');
  const tAgo = cue('s11', 'En agosto de dos mil veinticinco');
  const tAriel = cue('s11', 'Ariel García Furfaro');
  const t2002 = cue('s11', 'en dos mil dos');
  const tHoy = cue('s11', 'Hoy hay trece');
  const tRoles = cue('s11', 'dueños, gerentes');
  const tDef = cue('s11', 'Sus defensas');
  const tCasi = cue('s11', 'pasó algo que casi nunca pasa');
  const tDet = cue('s11', 'detuvieron a la extitular');
  const tSep = cue('s11', 'En septiembre');
  const tLug = cue('s11', 'Al ministro Lugones');
  const tGen = cue('s11', 'consideró que conocía');
  const tSent = cue('s11', 'iba en otro sentido');
  const [insQ] = TL.inserts.s11;
  // el fuego arranca cuando termina la frase (antes el mensaje no se llegaba a leer)
  const burn = clamp((t - (cueE('s11', 'hoy quemamos todo') + 0.05)) / 1.15);
  return (
    <AbsoluteFill>
      <ClinicBg t={t} light={0.55} alarm={t < tAgo ? 0.25 : 0} />
      <Layer t={t} a={-0.4} b={tEntre - 0.1}>
        <Title13 t={t} t0={-0.2} text="Lo que pasó después" size={120} y={480} upper={false} g0={200} g1={760} />
        <div style={{position: 'absolute', left: 960, top: 600, transform: 'translateX(-50%)', fontFamily: F.serif, fontStyle: 'italic', fontSize: 56, color: K.amber, opacity: prog(t, 1.2, 0.5)}}>parece de película</div>
      </Layer>
      <Layer t={t} a={tEntre - 0.2} b={tDom - 0.1}>
        <DateRoll t={t} t0={tEntre} text="7 — 9.05.2025" label="RAMALLO" x={110} y={200} align="left" size={80} />
        <div style={{position: 'absolute', left: 110, top: 330, width: 560, opacity: prog(t, tSabian, 0.5), borderLeft: `5px solid ${K.red}`, paddingLeft: 22}}>
          <div style={{...gm(20, K.red, 600, 0.18)}}>CUANDO YA SABÍAN</div>
          <div style={{...gs(44, 700, K.bone, -0.02), lineHeight: 1.1}}>que el fentanilo estaba contaminado</div>
        </div>
        <Autoclave2D t={t} t0={tAuto - 0.4} x={1230} y={540} />
      </Layer>
      <Layer t={t} a={tDom - 0.2} b={tEsos - 0.05}>
        <DateRoll t={t} t0={tDom} text="11.05.2025" label="DOMINGO" x={960} y={420} size={110} />
        <Title13 t={t} t0={tDom + 0.6} text="Vandalismo en HLB" size={90} y={620} upper={false} g0={300} g1={800} />
        <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: prog(t, tDom + 0.9, 0.15) * 0.8}}>
          {Array.from({length: 14}, (_, i) => {
            const a = (i / 14) * Math.PI * 2 + 0.3;
            const L = 300 + rnd(i) * 500;
            const pts = Array.from({length: 6}, (_, k) => `${1450 + Math.cos(a + Math.sin(k * 3 + i) * 0.12) * L * (k / 5)},${300 + Math.sin(a + Math.cos(k * 2 + i) * 0.12) * L * (k / 5)}`).join(' ');
            return <polyline key={i} points={pts} fill="none" stroke="rgba(236,243,241,0.7)" strokeWidth={2} />;
          })}
        </svg>
      </Layer>
      <Layer t={t} a={tEsos - 0.15} b={tCat - 0.1}>
        <Kicker t={t} t0={tEsos} text="En esos días se destruyeron" x={960} y={220} color={K.red} align="center" />
        <Destroyed t={t} t0={tEsos} at={[tDig - 0.1, tDoc - 0.1, tCit - 0.1]} y={560} />
      </Layer>
      <Layer t={t} a={tCat - 0.2} b={tKilos - 0.1}>
        <DateRoll t={t} t0={tCat} text="14.05.2025" label="UN EMPLEADO LE ESCRIBE A UNA COMPAÑERA" x={110} y={220} align="left" size={84} labelColor={K.amber} />
        <ChatPanel t={t} t0={tCat} x={1240} y={540} w={700} h={460} title="Compañera de trabajo" sub="chat incorporado a la causa" avatar="C" date="14 de mayo de 2025" msgs={[{side: 'out', text: 'Hoy quemamos todo', at: tQuem}]} focus={t > tQuem + 0.3 ? 0 : -1} />
        <Recreation />
        {/* el fuego se come la pantalla durante el silencio */}
        <BurnAway k={burn} t={t} />
      </Layer>
      <Layer t={t} a={tKilos - 0.2} b={tAgo - 0.1}>
        <MissingKilos t={t} t0={tKilos} tA={tEmp} tB={tJuez} />
        <Source13 t={t} t0={tKilos + 1} text="JUZGADO FEDERAL DE LA PLATA · HIPÓTESIS EN INVESTIGACIÓN" />
      </Layer>
      <Layer t={t} a={tAgo - 0.2} b={tHoy - 0.1}>
        {/* «En agosto de 2025 detuvieron al dueño»: la fecha llena el silencio visual y deja lugar a la ficha cuando se dice el nombre */}
        <DateRoll t={t} t0={tAgo} t1={tAriel - 0.3} text="08.2025" label="Detención del dueño" x={960} y={500} size={120} labelColor={K.red} />
        <NameCard13 t={t} t0={tAriel - 0.3} name="Ariel García Furfaro" role="Dueño de HLB Pharma y Laboratorios Ramallo" status="Detenido · agosto 2025" statusColor={K.red} x={110} y={330} size={96} />
        <DateRoll t={t} t0={t2002} text="2002" label="ANTECEDENTE" x={1500} y={430} size={120} labelColor={K.amber} sub="condenado por intentar matar a un empleado" />
      </Layer>
      <Layer t={t} a={tHoy - 0.2} b={tCasi - 0.1}>
        <Procesados13 t={t} t0={tHoy} tRoles={tRoles} />
        <div style={{position: 'absolute', left: 960, top: 880, transform: 'translateX(-50%)', width: 1300, textAlign: 'center', opacity: prog(t, tDef, 0.5)}}>
          <div style={{...gm(21, K.blue, 600, 0.2)}}>LAS DEFENSAS</div>
          <div style={{...gs(36, 560, K.bone, -0.01), marginTop: 8}}>piden anular las pericias y sostienen que los pacientes murieron por sus enfermedades</div>
        </div>
      </Layer>
      <Layer t={t} a={tCasi - 0.2} b={tLug - 0.1}>
        <Kicker t={t} t0={tCasi} text="Agosto de 2026 · algo que casi nunca pasa" x={110} y={160} color={K.amber} />
        <NameCard13 t={t} t0={tDet} name="Nélida Agustina Bisio" role="Extitular de la ANMAT" status={t < tSep ? 'Detenida · agosto 2026' : 'Procesada · sigue en libertad'} statusColor={t < tSep ? K.red : K.amber} x={110} y={380} size={78} />
        <NameCard13 t={t} t0={tDet + 0.6} name="Gabriela Mantecón Fumadó" role="Exdirectora del INAME" status={t < tSep ? 'Detenida · agosto 2026' : 'Procesada · sigue en libertad'} statusColor={t < tSep ? K.red : K.amber} x={1000} y={380} size={78} />
        <div style={{position: 'absolute', left: 960, top: 760, transform: 'translateX(-50%)', opacity: prog(t, tSep, 0.5), ...gm(24, K.mute, 500, 0.16)}}>SEPTIEMBRE 2026 · PROCESADAS, SIN PRISIÓN PREVENTIVA</div>
      </Layer>
      <Layer t={t} a={tLug - 0.2} b={D.s11 + 2.2}>
        <NameCard13 t={t} t0={tLug - 0.1} name="Mario Lugones" role="Ministro de Salud de la Nación" status="No imputado" statusColor={K.teal} x={110} y={300} size={96} />
        <div style={{position: 'absolute', left: 110, top: 620, width: 1500, opacity: prog(t, tGen, 0.5)}}>
          <div style={{...gm(22, K.teal, 600, 0.2)}}>SEGÚN EL JUEZ</div>
          <div style={{fontFamily: F.serif, fontSize: 58, color: K.bone, lineHeight: 1.15, marginTop: 8}}>
            conocía <span style={{fontStyle: 'italic', color: K.amber}}>«las generalidades»</span> del caso,
            <span style={{opacity: prog(t, tSent - 0.4, 0.5)}}>
              {' '}
              pero su intervención iba <span style={{fontStyle: 'italic', color: K.amber}}>«en otro sentido»</span>.
            </span>
          </div>
        </div>
      </Layer>
      <Letterbox k={1 - prog(t, 1.4, 1.0)} />
    </AbsoluteFill>
  );
};

/* ================================================================== S12 · CADA AGUJERO TIENE UNA FECHA */
const FECHAS: [string, string][] = [
  ['2019', 'la clausura que nunca se ejecutó'],
  ['2023', 'la dexametasona contaminada'],
  ['27.11.2024', 'el aviso de la inspección'],
  ['16.12.2024', 'se fabrica con el acta abierta'],
  ['30.01.2025', 'el lote sale a las droguerías'],
  ['10.02.2025', 'la carta, firmada tarde'],
  ['26.02.2025', '«Sí, lo sé»'],
  ['14.03.2025', '120.000 ampollas más'],
  ['MAYO 2025', 'el cierre, con muertos'],
];
export const S12: React.FC<{t: number}> = ({t}) => {
  const t90 = cue('s12', 'noventa muertes');
  const t44 = cue('s12', 'cuarenta y cuatro');
  const tOtros = cue('s12', 'Otros relevamientos');
  const tCausa = cue('s12', 'La causa todavía');
  const tCam = cue('s12', 'la Cámara Federal');
  const tOct = cue('s12', 'Y en octubre');
  const tAut = cue('s12', 'autorizó');
  const tNueve = cue('s12', 'Las nueve barreras existían');
  const tLeyes = cue('s12', 'en las leyes');
  const tMan = cue('s12', 'en los manuales');
  const tOrg = cue('s12', 'en los organigramas');
  const tFall = cue('s12', 'Fallaron una por una');
  const tFecha = cue('s12', 'cada agujero tiene una fecha');
  const [, , insM] = TL.inserts.s12;
  const tMont = insM[0] + 0.15;
  const tQuien = cue('s12', '¿Quién tiene más culpa');
  const tLeo = cue('s12', 'Te leo en los comentarios');
  const tSirv = cue('s12', 'Y si este video');
  const tComp = cue('s12', 'compartilo');
  const N = 9;
  const step = (insM[1] - 0.4) / N;
  const mi = clamp(Math.floor((t - tMont) / step), 0, N - 1);
  // montaje: la cámara salta de agujero en agujero (cada feta, de frente y de costado, sin otra feta delante) y empuja lento
  const montPose = (i: number, u: number): Cam => ({pos: [2.25, 0.72 - 0.06 * u, sliceZ(i, N) - 1.3 + 0.24 * u], look: [0.32, -0.05, sliceZ(i, N) + 0.1], fov: 34});
  const camMont: Cam = (() => {
    if (t < tMont) {
      const c = camPath(t, [[tNueve - 0.4, {pos: [9.5, 3.8, -9.5], look: [0, 0, 0], fov: 32}], [tFall - 0.2, {pos: [7.0, 2.6, -7.8], look: [0, 0, -0.5], fov: 32}]], 1.6);
      return lerpCam(c, montPose(0, 0), easeInOut(clamp((t - (tMont - 1.5)) / 1.5)));
    }
    const local = (t - tMont) / step;
    const i = clamp(Math.floor(local), 0, N - 1);
    const u = clamp(local - i);
    return lerpCam(montPose(Math.max(0, i - 1), 1), montPose(i, u), easeInOut(clamp(u / 0.3)));
  })();
  return (
    <AbsoluteFill>
      <ClinicBg t={t} light={0.55} />
      <Layer t={t} a={-0.5} b={tCausa - 0.1}>
        <Kicker t={t} t0={0.0} text="Hoy · según la Justicia" x={960} y={200} color={K.mute} align="center" />
        <Stat13 t={t} t0={t90 - 0.3} x={560} y={300} value={90} dur={1.2} label="Muertes" color={K.red} valColor={K.red} size={240} align="center" w={700} />
        <Stat13 t={t} t0={t44 - 0.3} x={1360} y={300} value={44} dur={1.0} label="Pacientes con secuelas" color={K.amber} valColor={K.bone} size={240} align="center" w={700} />
        <div style={{position: 'absolute', left: 960, top: 820, transform: 'translateX(-50%)', opacity: prog(t, tOtros, 0.5), border: `2px dashed ${K.mute}`, borderRadius: 12, padding: '14px 30px', ...gs(40, 560, K.bone, -0.01), whiteSpace: 'nowrap'}}>
          otros relevamientos: <span style={{color: K.red, fontWeight: 800}}>más de 100 muertes</span>
        </div>
      </Layer>
      <Layer t={t} a={tCausa - 0.2} b={tOct - 0.1}>
        <CasePipeline t={t} t0={tCausa} tPend={tCam} y={600} />
      </Layer>
      <Layer t={t} a={tOct - 0.2} b={tNueve - 0.1}>
        {/* «Y en octubre de 2026, la Provincia…»: la fecha llena los 3 segundos hasta «autorizó» */}
        <DateRoll t={t} t0={tOct} t1={tAut - 0.3} text="10.2026" label="Provincia de Buenos Aires" x={960} y={500} size={120} labelColor={K.amber} />
        <Boxes4M t={t} t0={tAut - 0.3} />
      </Layer>
      <Layer t={t} a={tNueve - 0.3} b={tQuien - 0.1}>
        <StackView
          t={t} cam={breathe(camMont, t, 0.3)} n={N}
          state={(i) => {
            const fall = prog(t, tFall + i * 0.17, 0.35);
            const isNow = t > tMont && i === mi;
            return {o: 1, open: fall, align: 1, glow: isNow ? 0.32 : fall * 0.2};
          }}
          traveler={null}
          overlay={(pj) => (
            <>
              {t < tMont
                ? Array.from({length: N}, (_, i) => {
                    const [x, y] = pj([-1.6, 1.25, sliceZ(i, N)]);
                    const p = prog(t, tNueve + 0.3 + i * 0.12, 0.4);
                    const fall = prog(t, tFall + i * 0.17, 0.35);
                    return (
                      <div key={i} style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-100%)', opacity: p * (1 - prog(t, tMont - 0.4, 0.4)), whiteSpace: 'nowrap', ...gm(24, fall > 0.5 ? K.red : K.cheese, 600, 0.06)}}>
                        {String(i + 1).padStart(2, '0')}
                      </div>
                    );
                  })
                : null}
              <div style={{position: 'absolute', left: 110, top: 760, display: 'flex', gap: 40, opacity: fadeIO(t, tLeyes - 0.2, tFall + 0.3, 0.4)}}>
                {[
                  {w: 'leyes', at: tLeyes},
                  {w: 'manuales', at: tMan},
                  {w: 'organigramas', at: tOrg},
                ].map((it) => (
                  <span key={it.w} style={{...gs(54, 700, K.bone, -0.02), opacity: prog(t, it.at, 0.4)}}>{it.w}</span>
                ))}
              </div>
              <SyncWords t={t} t1={tFecha - 0.2} y={960} size={60} words={[{w: 'Fallaron', t: tFall}, {w: 'una', t: tFall + 0.45}, {w: 'por', t: tFall + 0.6}, {w: 'una.', t: tFall + 0.75, color: K.red}]} />
              <SyncWords t={t} t1={tMont + 0.6} y={960} size={60} words={[{w: 'Cada', t: tFecha}, {w: 'agujero', t: tFecha + 0.3}, {w: 'tiene', t: tFecha + 0.75}, {w: 'una', t: tFecha + 0.9}, {w: 'fecha.', t: tFecha + 1.05, color: K.red}]} />
              {t > tMont - 0.1 && t < insM[0] + insM[1] + 0.3
                ? (() => {
                    const [hx, hy] = pj([0.32, -0.05, sliceZ(mi, N)]);
                    const p = prog(t, tMont + mi * step, 0.3);
                    const out = 1 - prog(t, insM[0] + insM[1] - 0.2, 0.4);
                    const cardIn = prog(t, tMont - 0.1, 0.4, easeOut);
                    const lk = prog(t, tMont + mi * step, 0.25, easeOut);
                    return (
                      <>
                        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: cardIn * out}}>
                          <line x1={1180} y1={420} x2={mix(1180, hx, lk)} y2={mix(420, hy, lk)} stroke={K.red} strokeWidth={2.5} />
                          <circle cx={hx} cy={hy} r={16 * lk} fill="none" stroke={K.red} strokeWidth={3} />
                        </svg>
                        <div style={{position: 'absolute', left: 1180, top: 300, width: 600, boxSizing: 'border-box', padding: '26px 34px 30px', background: 'rgba(4,10,11,0.9)', borderLeft: `5px solid ${K.red}`, borderRadius: 6, opacity: cardIn * out, transform: `translateX(${(1 - cardIn) * 40}px)`}}>
                          <div style={{...gm(20, K.cheese, 600, 0.2), whiteSpace: 'nowrap'}}>
                            AGUJERO {mi + 1} / 9
                          </div>
                          <div style={{opacity: p, transform: `translateY(${(1 - p) * 12}px)`}}>
                            <div style={{...gm(80, K.bone, 500, -0.01), lineHeight: 1.05, marginTop: 10}}>{FECHAS[mi][0]}</div>
                            <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 46, color: K.amber, marginTop: 6}}>{FECHAS[mi][1]}</div>
                          </div>
                        </div>
                      </>
                    );
                  })()
                : null}
            </>
          )}
        />
      </Layer>
      {/* la encuesta sigue mientras se dice «Te leo en los comentarios» (antes la pantalla quedaba casi vacía casi 4 s) */}
      <Layer t={t} a={tQuien - 0.3} b={tLeo + 1.35}>
        <Poll13 t={t} t0={tQuien - 0.2} q="¿Quién tiene más culpa?" a="El laboratorio que lo fabricó" b="El Estado que no lo detuvo" />
      </Layer>
      <Layer t={t} a={tLeo + 1.0} b={D.s12 + 0.9}>
        {/* «Y si este video te sirvió…»: las nueve fetas agujereadas y la décima, la del hospital, como resumen */}
        <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          {Array.from({length: 10}, (_, i) => {
            const hosp = i === 9;
            const p = prog(t, tSirv + i * 0.09 + (hosp ? 0.3 : 0), 0.4, easeOut);
            return (
              <g key={i} opacity={p} transform={`translate(${625 + i * 70 + (hosp ? 40 : 0)},${300 + (1 - p) * 26}) scale(2.6)`}>
                {hosp ? <rect x={-14} y={-19} width={28} height={38} rx={7} fill={K.teal} opacity={0.22} /> : null}
                <SliceGlyph x={0} y={0} state={hosp ? 'hospital' : 'failed'} k={1} />
              </g>
            );
          })}
        </svg>
        <div style={{position: 'absolute', left: 960, top: 420, transform: 'translateX(-50%)', textAlign: 'center'}}>
          <div style={{...gm(26, K.teal, 600, 0.3), opacity: prog(t, tLeo + 1.35, 0.45)}}>TE LEO EN LOS COMENTARIOS</div>
          <div style={{...gs(110, 800, K.bone, -0.04), marginTop: 30, opacity: prog(t, tComp - 0.2, 0.5), transform: `scale(${0.95 + 0.05 * pop(t, tComp - 0.2)})`}}>Compartilo.</div>
          <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 52, color: K.mute, marginTop: 20, opacity: prog(t, tComp + 0.6, 0.6)}}>es la mejor forma de que no se olvide</div>
        </div>
      </Layer>
    </AbsoluteFill>
  );
};

/* ================================================================== HOMENAJE Y PLACA FINAL */
export const Memorial: React.FC<{t: number; dur: number}> = ({t, dur}) => {
  const out = prog(t, dur - 0.8, 0.8, easeIn);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Dust t={t + 90} o={0.35} color="#E8E2D6" />
      <div style={{position: 'absolute', left: 960, top: 540, transform: 'translate(-50%,-50%)', textAlign: 'center', opacity: 1 - out}}>
        <div style={{...gs(96, 300, K.bone, -0.02), opacity: prog(t, 0.4, 1.0)}}>
          <span style={{color: K.red, fontWeight: 600}}>90</span> muertes.
        </div>
        <div style={{...gs(64, 300, K.bone, -0.02), marginTop: 18, opacity: prog(t, 1.3, 1.0)}}>
          <span style={{fontWeight: 600}}>44</span> pacientes con secuelas.
        </div>
        <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 50, color: K.mute, marginTop: 60, opacity: prog(t, 2.4, 1.2)}}>En memoria de las víctimas.</div>
      </div>
    </AbsoluteFill>
  );
};

export const EndCard13: React.FC<{t: number; total: number}> = ({t, total}) => {
  const bg = prog(t, 0, 0.6);
  const fadeOut = prog(t, total - 0.6, 0.6);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: K.void, opacity: bg}} />
      <AbsoluteFill style={{opacity: bg, background: `radial-gradient(circle at ${28 + 3 * Math.sin(t * 0.5)}% 50%, rgba(34,201,180,0.14) 0%, rgba(0,0,0,0) 50%)`}} />
      <Dust t={t} o={0.4 * bg} />
      <div style={{position: 'absolute', left: 230, top: 170, transform: `rotate(${Math.sin(t * 0.6) * 1.2}deg)`}}>
        <LogoMark size={300} t={t} t0={0.1} />
      </div>
      <div style={{position: 'absolute', left: 120, width: 560, top: 520, textAlign: 'center', ...gs(84, 800, '#fff', 0.06), opacity: prog(t, 0.5, 0.5)}}>CONTEXTO</div>
      <div style={{position: 'absolute', left: 210, top: 650, opacity: prog(t, 0.8, 0.3), transform: `scale(${pop(t, 0.8) * (1 + 0.025 * Math.sin(t * 4))})`}}>
        <div style={{width: 380, height: 84, background: K.red, borderRadius: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', ...gs(34, 800, '#fff', 0.1), boxShadow: '0 10px 30px rgba(255,59,48,0.45)'}}>SUSCRIBITE</div>
      </div>
      <div style={{position: 'absolute', left: 120, top: 800, width: 760, opacity: prog(t, 1.2, 0.6), ...gm(16, K.mute, 500, 0.08), lineHeight: 1.6}}>
        FUENTES: FISCALÍA FEDERAL N.º 1 DE LA PLATA (LÍNEA DE TIEMPO Y DICTAMEN) · JUZGADO FEDERAL DE LA PLATA · INFOBAE · LA NACIÓN · LA POLÍTICA ONLINE · ANMAT.
        <br />
        CHATS Y DOCUMENTOS: RECREACIONES A PARTIR DE LO PUBLICADO DE LA CAUSA. LOS PROCESADOS NO ESTÁN CONDENADOS.
      </div>
      <div style={{position: 'absolute', left: 1010, top: 170, opacity: prog(t, 0.4, 0.5)}}>
        <div style={{...gm(24, K.mute, 600, 0.3), marginBottom: 16}}>SEGUÍ MIRANDO</div>
        {[0, 1].map((i) => (
          <div key={i} style={{width: 760, height: 330, marginBottom: 40, borderRadius: 10, border: `3px solid rgba(255,255,255,${0.16 + 0.06 * Math.sin(t * 2 + i)})`, background: 'rgba(255,255,255,0.04)', transform: `translateX(${(1 - prog(t, 0.5 + i * 0.15, 0.6)) * 80}px)`}} />
        ))}
      </div>
      <AbsoluteFill style={{background: '#000', opacity: fadeOut}} />
    </AbsoluteFill>
  );
};
export {Img, staticFile, Vignette, PATH_XY, passed, travelZ, easeOut};
