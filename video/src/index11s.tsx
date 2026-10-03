// Entrada aparte para el short del episodio 11 sin tocar la raíz del proyecto
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {ShortSol, SHORT11_TOTAL} from './ep11/short11';
import './components/base';

const R: React.FC = () => <Composition id="ShortSol" component={ShortSol} durationInFrames={Math.ceil(SHORT11_TOTAL * 30)} fps={30} width={1080} height={1920} />;
registerRoot(R);
