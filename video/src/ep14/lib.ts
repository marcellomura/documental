import words from '../data/ep14/words.json';
import timeline from '../data/ep14/timeline.json';

export const TL = timeline as unknown as {
  fps: number;
  starts: Record<string, number>;
  durations: Record<string, number>;
  inserts: Record<string, [number, number][]>;
  end: number;
  total: number;
};

type Word = {w: string; s: number; e: number};
const W = words as Record<string, Word[]>;
const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

/** tiempo (relativo al segmento) en que se dice una frase; n = ocurrencia. Compara sin espacios ni signos para que
    funcione también con los nombres que la ortografía real funde en una sola "palabra" (Mexía de Miraval) */
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
export const ins = (seg: string, k: number) => segInserts(seg)[k][0];
export const insEnd = (seg: string, k: number) => segInserts(seg)[k][0] + segInserts(seg)[k][1];

/* momentos atados a la mezcla (tools/mix_ep14.py usa las mismas definiciones, en tiempo absoluto) */
const st = TL.starts;
export const TITLE = st.s01 + TL.durations.s01;   // termina el gancho
export const HIT = TITLE + 0.55;                  // el bólido arma el título
export const T_IMP = ins('s02', 1) + 0.1;         // relativo a s02: la lluvia de hierro toca el suelo
export const T_BLAST = ins('s04', 2) + 0.05;      // relativo a s04: la voladura, después de «Pólvora.»
export const T_ALG = ins('s06', 0);               // relativo a s06: «Y alguien la quiere.»
export const T_CAMION = ins('s06', 1) + 0.05;     // relativo a s06: «En el camión va el meteorito.»
export const T_GIG = cueE('s07', 'otro gigante:') + 0.05; // relativo a s07: el golpe de «gigante»
