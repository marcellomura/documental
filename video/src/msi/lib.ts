import words from '../data/msi/words.json';
import timeline from '../data/msi/timeline.json';
import {makeCue, TL as TLT, Word} from './kit';

export const TL = timeline as TLT;
export const WS = words as Record<string, Word[]>;
export const {c, at, end} = makeCue(TL, WS);

/** un pelito antes de la palabra que motiva el corte */
export const k = (seg: string, phrase: string, pre = 0.12, n = 0) => c(seg, phrase, n) - pre;
/** placa entre segmentos (capítulos): arranca apenas termina el anterior */
export const prevSeg = (seg: string) => 's' + String(Number(seg.slice(1)) - 1).padStart(2, '0');
export const gapStart = (seg: string) => end(prevSeg(seg)) + 0.15;

/** créditos cortos para las fotos (autor · licencia) */
export const CR: Record<string, string> = {
  bb: 'Foto: Bryan Berlin · CC BY-SA 4.0',
  mon_cc0: 'Foto: Dibumartinez23 · CC0',
  mon_pano2: 'Foto: Innoverdrive · CC BY-SA 4.0',
  river_avion: 'Foto: Danirepe · CC BY-SA 3.0',
  fest: 'Foto: Iro Bosero · CC BY-SA 4.0',
  kahneman: 'Foto: nrkbeta · CC BY-SA 2.0',
  krueger: 'Foto: Princeton University · CC BY-SA 4.0',
  springsteen: 'Foto: Raph_PH · CC BY 2.0',
  swift: 'Foto: Paolo V · CC BY 2.0',
  oasis: 'Foto: Raph_PH · CC BY 4.0',
  ticketmaster: 'Foto: Javier Pérez Montes · CC BY-SA 4.0',
  ia: 'Recreación ilustrativa (IA)',
};
