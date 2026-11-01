// Entrada aparte del ep15 (largo): bundle propio y carpeta public reducida; se renderiza a 1440p por tramos
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Doc} from './ep15/Doc';
import tl from './data/ep15/timeline.json';
import './components/base';

const R: React.FC = () => <Composition id="Doc15" component={Doc} durationInFrames={Math.ceil(tl.total * tl.fps)} fps={tl.fps} width={1920} height={1080} />;
registerRoot(R);
