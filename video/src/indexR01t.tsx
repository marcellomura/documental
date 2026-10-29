// Entrada de pruebas del reel 01 (stills del 3D)
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {TestR01} from './reel01/test';
import './components/base';

const R: React.FC = () => <Composition id="TestR01" component={TestR01} durationInFrames={300} fps={30} width={1080} height={1920} defaultProps={{shot: 'ride', t: 0}} />;
registerRoot(R);
