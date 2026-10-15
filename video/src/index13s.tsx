// Entrada aparte para el short del episodio 13 sin tocar la raíz del proyecto
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {ShortLote, SHORT13_TOTAL} from './ep13/short13';
import './components/base';

const R: React.FC = () => <Composition id="ShortLote" component={ShortLote} durationInFrames={Math.ceil(SHORT13_TOTAL * 30)} fps={30} width={1080} height={1920} />;
registerRoot(R);
