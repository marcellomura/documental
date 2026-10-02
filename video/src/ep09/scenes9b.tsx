/* Escenas 6–10 del episodio 9 (Vaca Muerta). */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {K} from './kit9';
type P = {t: number};
export const S06: React.FC<P> = () => <AbsoluteFill style={{background: K.bg1}} />;
export const S07: React.FC<P> = () => <AbsoluteFill style={{background: K.bg1}} />;
export const S08: React.FC<P> = () => <AbsoluteFill style={{background: K.bg1}} />;
export const S09: React.FC<P> = () => <AbsoluteFill style={{background: K.bg1}} />;
export const S10: React.FC<P & {total: number}> = () => <AbsoluteFill style={{background: K.bg1}} />;
