/* Tiempos del reel 01: inicio de cada segmento de narración y momentos atados a las palabras (los mismos que usa
   tools/mix_reel01.py para los efectos). */
import words from '../data/reel01/words.json';
import timeline from '../data/reel01/timeline.json';

export const TL = timeline as unknown as {
  fps: number;
  starts: Record<string, number>;
  durations: Record<string, number>;
  inserts: Record<string, [number, number][]>;
  end: number;
  total: number;
};
export type Word = {w: string; s: number; e: number};
export const W = words as Record<string, Word[]>;
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

/** tiempo ABSOLUTO (s) en que se dice una frase del segmento; n = ocurrencia; which = inicio o fin. Compara sin
    espacios ni signos, así funciona también con las entradas del display que funden varias palabras («…») */
export const at = (seg: string, phrase: string, n = 0, which: 's' | 'e' = 's'): number => {
  const list = W[seg];
  const target = norm(phrase);
  let found = -1;
  for (let i = 0; i < list.length; i++) {
    let acc = '';
    for (let j = i; j < list.length && acc.length < target.length + 40; j++) {
      acc += norm(list[j].w);
      if (acc === target || (j === i && acc.startsWith(target))) {
        found++;
        if (found === n) return TL.starts[seg] + (which === 's' ? list[i].s : list[j].e);
        break;
      }
      if (!target.startsWith(acc)) break;
    }
  }
  throw new Error(`frase no encontrada: ${seg} "${phrase}" #${n}`);
};
export const atE = (seg: string, phrase: string, n = 0) => at(seg, phrase, n, 'e');
export const segStart = (seg: string) => TL.starts[seg];
export const segEnd = (seg: string) => TL.starts[seg] + TL.durations[seg];
export const TOTAL = TL.total;
