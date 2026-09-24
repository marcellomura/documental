import words from '../data/words.json';

type Word = {w: string; s: number; e: number};
const W = words as Record<string, Word[]>;

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');

/**
 * Tiempo (segundos, relativo al inicio del segmento) en que se dice una palabra.
 * `phrase` puede tener varias palabras; `n` = ocurrencia (0 = primera).
 */
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
