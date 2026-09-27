/* Miniaturas del video de Messi (1920x1080; YouTube las acepta así y pesan menos de 2 MB en JPG) */
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {M, FONT, Gold, Night, Stripes, Ticket, img} from './kit';

const T = 2.2; // instante "congelado" para los brillos

/** A: Messi mirando los números */
export const MsiMiniA: React.FC = () => (
  <AbsoluteFill style={{background: M.night, overflow: 'hidden'}}>
    <Img src={img('egy245.jpg')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.55)', transformOrigin: '0% 12%', filter: 'contrast(1.08) saturate(1.1)'}} />
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(5,10,23,0.96) 0%, rgba(5,10,23,0.85) 34%, rgba(5,10,23,0) 62%)'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 70% at 0% 50%, rgba(255,59,78,0.18), rgba(0,0,0,0) 70%)'}} />
    <div style={{position: 'absolute', left: 90, top: 170}}>
      <div><div style={{display: 'inline-block', background: M.red, color: M.white, fontFamily: FONT.body, fontWeight: 900, fontSize: 46, letterSpacing: 10, padding: '10px 30px', borderRadius: 14, transform: 'rotate(-3deg)'}}>REVENTA</div></div>
      <div style={{position: 'relative', display: 'inline-block', marginTop: 30, marginLeft: 6}}>
        <div style={{fontFamily: FONT.head, fontSize: 150, color: M.white, lineHeight: 1}}>$90.000</div>
        <div style={{position: 'absolute', left: -14, right: -14, top: 70, height: 16, background: M.red, borderRadius: 8, transform: 'rotate(-7deg)', boxShadow: '0 6px 20px rgba(0,0,0,0.5)'}} />
      </div>
      <div style={{fontFamily: FONT.head, fontSize: 90, color: M.celeste, lineHeight: 1, marginTop: 24}}>↓</div>
      <Gold t={T} size={215}>$3 MILLONES</Gold>
    </div>
    <Stripes w={1920} h={14} n={15} style={{position: 'absolute', left: 0, bottom: 0}} />
  </AbsoluteFill>
);

/** B: la entrada con la etiqueta de reventa */
export const MsiMiniB: React.FC = () => (
  <Night t={T} glow="rgba(255,59,78,0.3)" floor={false}>
    <div style={{position: 'absolute', left: 960, top: 400, transform: 'translate(-50%, -50%) scale(1.45)'}}>
      <Ticket t={T} t0={0} w={900} strikeAt={0} resale="$688.159" resaleAt={0.5} rot={-5} sway={0} />
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center'}}>
      <div style={{fontFamily: FONT.head, fontSize: 124, color: M.white, lineHeight: 1, textShadow: "0 10px 40px rgba(0,0,0,0.6)"}}>¿QUIÉN SE QUEDA <span style={{color: M.red}}>CON LA PLATA?</span></div>
    </div>
  </Night>
);
