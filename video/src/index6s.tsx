// Entrada aparte para probar el short del episodio 6 sin tocar la raíz del proyecto
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {ShortCarne, SHORT6_TOTAL} from './ep06/short6';
import './components/base';

const R: React.FC = () => <Composition id="ShortCarne" component={ShortCarne} durationInFrames={Math.ceil(SHORT6_TOTAL * 30)} fps={30} width={1080} height={1920} />;
registerRoot(R);
