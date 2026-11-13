// Entrada del ep16 (largo): bundle propio y carpeta public reducida; se renderiza a 1440p por tramos
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Doc, DocStills} from './ep16/Doc16';
import tl from './data/ep16/timeline.json';
import './components/base';

const STILLS = (typeof process !== 'undefined' && process.env.REMOTION_STILLS ? process.env.REMOTION_STILLS : '2,13,18,20.5,23.5,24.8,27,33,38,42,45.5,50').split(',').map(Number);
const R: React.FC = () => (
  <>
    <Composition id="Doc16" component={Doc} durationInFrames={Math.ceil(tl.total * tl.fps)} fps={tl.fps} width={1920} height={1080} />
    <Composition id="Doc16Stills" component={DocStills} defaultProps={{times: STILLS}} durationInFrames={STILLS.length} fps={30} width={1920} height={1080} />
  </>
);
registerRoot(R);
