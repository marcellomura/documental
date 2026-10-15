// Entrada aparte para el short del episodio 5 (YouTube Shorts, Reels y TikTok) sin tocar la raíz del proyecto
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {ShortReloj, SHORT05} from './ep05/short5';
import './components/base';

const R: React.FC = () => (
  <>
    <Composition id="ShortRelojYT" component={ShortReloj} defaultProps={{v: 'yt' as const}} durationInFrames={Math.ceil(SHORT05.yt.total * 30)} fps={30} width={1080} height={1920} />
    <Composition id="ShortRelojIG" component={ShortReloj} defaultProps={{v: 'ig' as const}} durationInFrames={Math.ceil(SHORT05.ig.total * 30)} fps={30} width={1080} height={1920} />
    <Composition id="ShortRelojTT" component={ShortReloj} defaultProps={{v: 'tt' as const}} durationInFrames={Math.ceil(SHORT05.tt.total * 30)} fps={30} width={1080} height={1920} />
  </>
);
registerRoot(R);
