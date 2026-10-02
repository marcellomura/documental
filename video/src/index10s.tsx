// Entrada aparte para el short del episodio 10 sin tocar la raíz del proyecto
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {ShortCuadro, SHORT10_TOTAL} from './ep10/short10';
import './components/base';

const R: React.FC = () => <Composition id="ShortCuadro" component={ShortCuadro} durationInFrames={Math.ceil(SHORT10_TOTAL * 30)} fps={30} width={1080} height={1920} />;
registerRoot(R);
