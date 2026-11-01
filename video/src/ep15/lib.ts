/* Tiempos del ep15 (EL HOMBRE DE LAS MIL CARAS): el largo (L, segmentos s01-s11) y el vertical (V, v01-v05). Cada
   plano se ata a las palabras de la locución: at() da el instante ABSOLUTO en que empieza (o termina) una frase. */
import wL from '../data/ep15/words.json';
import tL from '../data/ep15/timeline.json';
import wV from '../data/ep15v/words.json';
import tV from '../data/ep15v/timeline.json';

export type Word = {w: string; s: number; e: number};
export type TLData = {fps: number; starts: Record<string, number>; durations: Record<string, number>; inserts: Record<string, [number, number][]>; end: number; total: number};
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

export const makeTL = (TL: TLData, W: Record<string, Word[]>) => {
  /** tiempo ABSOLUTO (s) en que se dice una frase del segmento; n = ocurrencia; which = inicio o fin */
  const at = (seg: string, phrase: string, n = 0, which: 's' | 'e' = 's'): number => {
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
  return {
    TL, W, at,
    atE: (seg: string, phrase: string, n = 0) => at(seg, phrase, n, 'e'),
    start: (seg: string) => TL.starts[seg],
    end: (seg: string) => TL.starts[seg] + TL.durations[seg],
    TOTAL: TL.total,
    /** palabras con tiempo absoluto, para los subtítulos */
    words: () => Object.keys(W).sort().flatMap((k) => W[k].map((x) => ({w: x.w, s: TL.starts[k] + x.s, e: TL.starts[k] + x.e}))),
  };
};

export const L = makeTL(tL as unknown as TLData, wL as Record<string, Word[]>);
export const V = makeTL(tV as unknown as TLData, wV as Record<string, Word[]>);
