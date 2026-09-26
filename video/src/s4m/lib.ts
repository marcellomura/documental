import words from '../data/s4m/words.json';
import timeline from '../data/s4m/timeline.json';

export type Cap = {w: string; s: number; e: number; who: 'fs' | 'n'};
export const TL = timeline as unknown as {
  fps: number; clip: {src: number; dur: number; freeze: number}; starts: Record<string, number>; durations: Record<string, number>;
  endCard: number; total: number; caps: Cap[];
};

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
