// Entrada aparte del ep15 (vertical 1080×1920): bundle propio y carpeta public reducida
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Vert} from './ep15/Vert';
import tl from './data/ep15v/timeline.json';
import './components/base';

const R: React.FC = () => <Composition id="Vert15" component={Vert} durationInFrames={Math.ceil(tl.total * tl.fps)} fps={tl.fps} width={1080} height={1920} />;
registerRoot(R);
