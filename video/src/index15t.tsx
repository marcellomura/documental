// Entrada de pruebas del ep15 (stills del 3D)
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Test15} from './ep15/test';
import './components/base';

const R: React.FC = () => (
  <>
    <Composition id="Test15" component={Test15} durationInFrames={600} fps={30} width={1920} height={1080} />
    <Composition id="Test15v" component={Test15} durationInFrames={600} fps={30} width={1080} height={1920} />
  </>
);
registerRoot(R);
