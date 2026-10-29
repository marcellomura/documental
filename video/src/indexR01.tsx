// Entrada propia del reel 01 (LA MAESTRA QUE IBA A CABALLO, el caso Nanci Godoy): vertical, solo para Reels y TikTok
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {ReelGodoy, REEL_TOTAL} from './reel01/Reel';
import './components/base';

const R: React.FC = () => <Composition id="ReelGodoy" component={ReelGodoy} durationInFrames={Math.ceil(REEL_TOTAL * 30)} fps={30} width={1080} height={1920} />;
registerRoot(R);
