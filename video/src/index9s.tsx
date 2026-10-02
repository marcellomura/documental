// Entrada aparte para el short del episodio 9 sin tocar la raíz del proyecto
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {ShortVaca, SHORT9_TOTAL} from './ep09/short9';
import './components/base';

const R: React.FC = () => <Composition id="ShortVaca" component={ShortVaca} durationInFrames={Math.ceil(SHORT9_TOTAL * 30)} fps={30} width={1080} height={1920} />;
registerRoot(R);
