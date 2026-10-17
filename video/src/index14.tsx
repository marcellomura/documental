// Entrada aparte para el episodio 14: permite renderizar por tramos con un bundle propio y una carpeta public reducida
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Cielo} from './ep14/Cielo';
import tl14 from './data/ep14/timeline.json';
import './components/base';

const R: React.FC = () => <Composition id="Cielo" component={Cielo} durationInFrames={Math.ceil(tl14.total * tl14.fps)} fps={tl14.fps} width={1920} height={1080} />;
registerRoot(R);
