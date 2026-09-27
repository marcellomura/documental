import words from '../data/rico/words.json';
import timeline from '../data/rico/timeline.json';
import {makeCue, TL as TLT, Word} from './kit';

export const TL = timeline as TLT;
export const WS = words as Record<string, Word[]>;
export const {c, at, end} = makeCue(TL, WS);

/** Fotos de archivo (video/public/rico). Si alguna falta, se usa la de respaldo. */
const IMG0: Record<string, string> = {
  milei: 'milei.jpg',
  puerto: 'puerto.jpg',
  barco: 'barco.jpg',
  inmigrantes: 'hotel_inmigrantes.jpg',
  hotel: 'hotel_inmigrantes.jpg',
  avmayo: 'avenida_de_mayo.jpg',
  plaza: 'plaza_de_mayo.jpg',
  cosecha: 'cosecha.jpg',
  ganado: 'ganado.jpg',
  frigorifico: 'frigorifico.jpg',
  tren: 'tren.jpg',
  subte: 'subte.jpg',
  colon: 'colon.jpg',
  palacio: 'palacio_b.jpg',
  paris: 'paris.jpg',
  conventillo: 'conventillo.jpg',
  conventillo2: 'conventillo2.jpg',
  huelga: 'huelga.jpg',
  centenario: 'centenario.jpg',
  golpe30: 'golpe1930.jpg',
  peron: 'peron.jpg',
  crisis: 'crisis2001.jpg',
  sydney: 'sydney.jpg',
  toronto: 'toronto.jpg',
  ba_hoy: 'ba_hoy.jpg',
  seul: 'seul.jpg',
};

// fotos que no se consiguieron en calidad suficiente → reemplazo más cercano
const ALIAS: Record<string, string> = {'puerto.jpg': 'puerto1.jpg', 'avenida_de_mayo.jpg': 'avmayo1.jpg', 'ganado.jpg': 'cosecha.jpg', 'frigorifico.jpg': 'barco.jpg', 'tren.jpg': 'cosecha.jpg', 'crisis2001.jpg': 'plaza_de_mayo.jpg', 'ba_hoy.jpg': 'avmayo1.jpg'};
export const IMG: Record<string, string> = Object.fromEntries(Object.entries(IMG0).map(([k, v]) => [k, ALIAS[v] ?? v]));
