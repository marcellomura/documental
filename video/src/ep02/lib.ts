import words from '../data/ep02/words.json';
import timeline from '../data/ep02/timeline.json';

/* Paleta y tipografías del episodio 2 (misma marca, espíritu rockero) */
export const R = {
  black: '#111111',
  ink: '#161513',
  paper: '#ECE3D0',
  paper2: '#E2D6BE',
  red: '#E8322B',
  yellow: '#FFCC33',
  blue: '#2D6BFF',
  white: '#FFFFFF',
  grey: '#8F8A80',
  concrete: '#9C9A94',
  water: '#2B7A78',
  soil: '#7A5A3A',
  soil2: '#654A30',
  asphalt: '#3A3A3C',
  green: '#1E8C5A',
  bill: '#CFE0C3',
  billDark: '#3F6B4A',
  orange: '#FF7A1A',
};

export const F2 = {
  type: '"Special Elite", "JetBrains Mono", monospace',
  scrawl: '"Rock Salt", cursive',
  bungee: 'Bungee, Anton, sans-serif',
  head: 'Anton, Impact, sans-serif',
  body: 'Inter, Helvetica, Arial, sans-serif',
  mono: '"JetBrains Mono", monospace',
  quote: '"Playfair Display", Georgia, serif',
  hand: '"Permanent Marker", cursive',
  black: '"Archivo Black", Anton, sans-serif',
};

export const TL = timeline as {fps: number; starts: Record<string, number>; durations: Record<string, number>; total: number};

type Word = {w: string; s: number; e: number};
const W = words as Record<string, Word[]>;
const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

/** tiempo (relativo al segmento) en que se dice una frase; n = ocurrencia */
export const cue = (seg: string, phrase: string, n = 0, which: 's' | 'e' = 's'): number => {
  const list = W[seg];
  const target = phrase.split(/\s+/).map(norm);
  let found = -1;
  for (let i = 0; i <= list.length - target.length; i++) {
    if (target.every((t, k) => norm(list[i + k].w) === t)) {
      found++;
      if (found === n) return which === 's' ? list[i].s : list[i + target.length - 1].e;
    }
  }
  throw new Error(`cue no encontrado: ${seg} "${phrase}" #${n}`);
};
export const segWords = (seg: string) => W[seg];
