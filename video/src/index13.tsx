// Entrada aparte para el episodio 13: permite renderizar parches de tramos con un bundle propio y una carpeta public
// reducida, sin cargar los demás episodios (algunos precargan texturas que no están en esa carpeta)
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Lote} from './ep13/Lote';
import tl13 from './data/ep13/timeline.json';
import './components/base';

const R: React.FC = () => <Composition id="Lote" component={Lote} durationInFrames={Math.ceil(tl13.total * tl13.fps)} fps={tl13.fps} width={1920} height={1080} />;
registerRoot(R);
