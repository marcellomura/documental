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

/** tiempo (relativo al segmento) en que se dice una frase; n = ocurrencia. Compara sin espacios ni signos para que
    funcione también con nombres que la ortografía real funde en una sola "palabra" (Klebsiella pneumoniae) */
export const cue = (seg: string, phrase: string, n = 0, which: 's' | 'e' = 's'): number => {
  const list = W[seg];
  const target = norm(phrase);
  let found = -1;
  for (let i = 0; i < list.length; i++) {
    let acc = '';
    for (let j = i; j < list.length && acc.length < target.length; j++) {
      acc += norm(list[j].w);
      if (acc === target) {
        found++;
        if (found === n) return which === 's' ? list[i].s : list[j].e;
        break;
      }
      if (!target.startsWith(acc)) break;
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
/** cuánto antes de la locución entra la placa de cada barrera (cabe en el silencio que deja el segmento anterior) */
export const CARD_LEAD: Record<string, number> = {s04: 1.3, s05: 1.1, s06: 1.5, s07: 1.6, s08: 1.0, s09: 1.4};
