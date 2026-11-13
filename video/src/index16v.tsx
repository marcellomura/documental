// Entrada del ep16 (vertical 1080×1920): bundle propio y carpeta public reducida
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Vert, VertStills} from './ep16/Vert16';
import tl from './data/ep16v/timeline.json';
import './components/base';

const STILLS = (typeof process !== 'undefined' && process.env.REMOTION_STILLS ? process.env.REMOTION_STILLS : '5,14,20,24,27,33,38,43').split(',').map(Number);
const R: React.FC = () => (
  <>
    <Composition id="Vert16" component={Vert} durationInFrames={Math.ceil(tl.total * tl.fps)} fps={tl.fps} width={1080} height={1920} />
    <Composition id="Vert16Stills" component={VertStills} defaultProps={{times: STILLS}} durationInFrames={STILLS.length} fps={30} width={1080} height={1920} />
  </>
);
registerRoot(R);
