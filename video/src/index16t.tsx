// Entrada de prueba del 3D del ep16
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Test16} from './ep16/test16';
import './components/base';

const R: React.FC = () => <Composition id="Test16" component={Test16} durationInFrames={10} fps={30} width={1920} height={1080} />;
registerRoot(R);
