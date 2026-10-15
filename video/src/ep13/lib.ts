import words from '../data/ep13/words.json';
import timeline from '../data/ep13/timeline.json';

export const TL = timeline as unknown as {
  fps: number;
  starts: Record<string, number>;
  durations: Record<string, number>;
  inserts: Record<string, [number, number][]>;
  memorial: number;
  end: number;
  total: number;
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
/** fin de la frase (relativo al segmento) */
export const cueE = (seg: string, phrase: string, n = 0) => cue(seg, phrase, n, 'e');
export const segWords = (seg: string) => W[seg];
export const segStart = (seg: string) => TL.starts[seg];
/** silencios abiertos dentro del segmento: [inicio relativo, duración] */
export const segInserts = (seg: string) => TL.inserts[seg] ?? [];
