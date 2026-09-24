import {Easing, interpolate} from 'remotion';

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.55, 0, 1, 0.45);

/** progreso 0→1 entre t0 y t0+dur con easing */
export const prog = (t: number, t0: number, dur = 0.5, ease = easeOut) =>
  ease(clamp((t - t0) / dur));

/** envolvente de entrada/salida: 0 antes de t0, 1 en el medio, 0 después de t1 */
export const env = (t: number, t0: number, t1: number, din = 0.35, dout = 0.3) => {
  const a = easeOut(clamp((t - t0) / din));
  const b = t1 === Infinity ? 1 : 1 - easeIn(clamp((t - (t1 - dout)) / dout));
  return Math.min(a, b);
};

/** rebote tipo spring sin depender del fps (amortiguado) */
export const pop = (t: number, t0: number, stiffness = 1) => {
  const x = (t - t0) * 7 * stiffness;
  if (x <= 0) return 0;
  return 1 - Math.exp(-x * 1.2) * Math.cos(x * 2.2);
};

export const range = (t: number, input: number[], output: number[], ease = easeInOut) =>
  interpolate(t, input, output, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

/** pseudo-aleatorio determinístico */
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** formato numérico es-AR (puntos de miles) */
export const fmt = (n: number, dec = 0) => {
  const s = n.toFixed(dec);
  const [i, d] = s.split('.');
  const ii = i.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return d ? `${ii},${d}` : ii;
};

/** temblor de cámara */
export const shake = (t: number, t0: number, amp = 14, dur = 0.5) => {
  const k = clamp((t - t0) / dur);
  if (k <= 0 || k >= 1) return {x: 0, y: 0};
  const a = amp * (1 - k) * (1 - k);
  return {x: Math.sin(t * 91) * a, y: Math.cos(t * 77) * a};
};
