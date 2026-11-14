// Entrada de prueba del 3D del ep16
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Test16} from "./ep16/test16";
import {Test16b} from "./ep16/test16b";
import './components/base';

const R: React.FC = () => <><Composition id="Test16" component={Test16} durationInFrames={10} fps={30} width={1920} height={1080} /><Composition id="Test16b" component={Test16b} durationInFrames={3} fps={30} width={1920} height={1080} /></>;
registerRoot(R);
