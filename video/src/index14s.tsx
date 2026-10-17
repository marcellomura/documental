// Entrada aparte para el short del episodio 14 sin tocar la raíz del proyecto
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {ShortCielo, SHORT14_TOTAL} from './ep14/short14';
import './components/base';

const R: React.FC = () => <Composition id="ShortCielo" component={ShortCielo} durationInFrames={Math.ceil(SHORT14_TOTAL * 30)} fps={30} width={1080} height={1920} />;
registerRoot(R);
