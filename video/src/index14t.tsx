// Entrada de pruebas del episodio 14
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Test14} from './ep14/test14';
import './components/base';

const R: React.FC = () => (
  <>
    {['monte', 'golden', 'blast', 'espacio', 'gigante'].map((w) => (
      <Composition key={w} id={'T14' + w} component={Test14} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{which: w}} />
    ))}
  </>
);
registerRoot(R);
