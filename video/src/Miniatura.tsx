import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, F} from './theme';
import {Paper, SvgDefs} from './components/base';
import {DollarBill, Mattress} from './components/art';

/* Miniatura para YouTube (1280x720) */
export const Miniatura: React.FC = () => (
  <AbsoluteFill>
    <SvgDefs />
    <Paper>
      <div style={{position: 'absolute', right: -40, top: 150, width: 560, height: 300, transform: 'rotate(8deg)', background: '#FBF8F2', padding: 12, boxShadow: '0 20px 40px rgba(0,0,0,0.35)'}}>
        <Img src={staticFile('img/billete_mn_1000.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.1)'}} />
      </div>
      <div style={{position: 'absolute', right: 40, bottom: 20, transform: 'rotate(-6deg)'}}><Mattress size={360} bills={3} /></div>
      <div style={{position: 'absolute', right: 300, top: 40, transform: 'rotate(-12deg)'}}><DollarBill w={260} /></div>
      <div style={{position: 'absolute', left: 50, top: 40, fontFamily: F.head, fontSize: 92, color: C.ink, lineHeight: 1}}>1 PESO =</div>
      <div style={{position: 'absolute', left: 44, top: 140, fontFamily: F.head, fontSize: 250, color: C.red, lineHeight: 0.95, letterSpacing: -2}}>13</div>
      <div style={{position: 'absolute', left: 44, top: 370, fontFamily: F.head, fontSize: 170, color: C.ink, lineHeight: 0.95}}>CEROS</div>
      <div style={{position: 'absolute', left: 50, top: 560, background: C.yellow, border: `6px solid ${C.ink}`, boxShadow: `8px 8px 0 ${C.ink}`, fontFamily: F.head, fontSize: 64, padding: '4px 22px', transform: 'rotate(-2deg)'}}>¿POR QUÉ AMAMOS EL DÓLAR?</div>
      <div style={{position: 'absolute', left: 250, top: 190, fontFamily: F.hand, fontSize: 46, color: C.ink, transform: 'rotate(-5deg)', transformOrigin: 'left', lineHeight: 1.1}}>10.000.000.000.000<br /><span style={{fontSize: 32, color: C.red}}>pesos moneda nacional</span></div>
    </Paper>
  </AbsoluteFill>
);
