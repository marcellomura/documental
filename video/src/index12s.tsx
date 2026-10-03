// Entrada aparte para el short del episodio 12 sin tocar la raíz del proyecto
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {ShortSanJuan, SHORT12_TOTAL} from './ep12/short12';
import './components/base';

const R: React.FC = () => <Composition id="ShortSanJuan" component={ShortSanJuan} durationInFrames={Math.ceil(SHORT12_TOTAL * 30)} fps={30} width={1080} height={1920} />;
registerRoot(R);
