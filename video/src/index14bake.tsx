// Entrada para hornear las texturas caras del episodio 14 (ver bake14.mjs): el monte (una composición por capa y clima,
// del tamaño exacto de la capa) y el ruido del pergamino, con fondo transparente
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {AbsoluteFill} from 'remotion';
import {LayerArt, LAYER_BOX, MOODS, type Mood} from './ep14/art14';
import {Defs14} from './ep14/kit14';

const Bake: React.FC<{L: number; mood: Mood}> = ({L, mood}) => (
  <div style={{position: 'absolute', left: -LAYER_BOX[L].x0, top: -LAYER_BOX[L].y0}}>
    <LayerArt L={L} color={MOODS[mood].layers[L]} />
  </div>
);
// manchas y fibras del pergamino (filtro parch14) a pantalla completa; las hojas usan el recorte de arriba a la izquierda
const Parch: React.FC = () => (
  <AbsoluteFill>
    <Defs14 />
    <AbsoluteFill style={{filter: 'url(#parch14)'}} />
  </AbsoluteFill>
);
const R: React.FC = () => (
  <>
    <Composition id="Parch" component={Parch} durationInFrames={1} fps={30} width={1920} height={1080} />
    {(Object.keys(MOODS) as Mood[]).flatMap((mood) =>
      [0, 1, 2, 3].map((L) => (
        <Composition key={mood + L} id={`Monte-${mood}-${L}`} component={Bake} durationInFrames={1} fps={30} width={LAYER_BOX[L].w} height={LAYER_BOX[L].h} defaultProps={{L, mood}} />
      )),
    )}
  </>
);
registerRoot(R);
