import React from 'react';
import {Composition, Still} from 'remotion';
import {Miniatura} from './Miniatura';
import {Documental} from './Documental';
import timeline from './data/timeline.json';
import short from './data/short.json';
import {Short} from './short/Short';
import {RoboDelSiglo} from './ep02/RoboDelSiglo';
import tl2 from './data/ep02/timeline.json';
import {Fmi} from './ep03/Fmi';
import tl3 from './data/ep03/timeline.json';
import {SuperNino} from './ep04/SuperNino';
import tl4 from './data/ep04/timeline.json';
import {ShortNino, SHORT_TOTAL} from './ep04/shorts';

export const RemotionRoot: React.FC = () => (
  <>
  <Composition
    id="Documental"
    component={Documental}
    durationInFrames={Math.ceil(timeline.total * timeline.fps)}
    fps={timeline.fps}
    width={1920}
    height={1080}
  />
    <Composition id="Short" component={Short} durationInFrames={Math.ceil(short.total * short.fps)} fps={short.fps} width={1080} height={1920} />
    <Composition id="RoboDelSiglo" component={RoboDelSiglo} durationInFrames={Math.ceil(tl2.total * tl2.fps)} fps={tl2.fps} width={1920} height={1080} />
    <Composition id="Fmi" component={Fmi} durationInFrames={Math.ceil(tl3.total * tl3.fps)} fps={tl3.fps} width={1920} height={1080} />
    <Composition id="SuperNino" component={SuperNino} durationInFrames={Math.ceil(tl4.total * tl4.fps)} fps={tl4.fps} width={1920} height={1080} defaultProps={{dpr: 1}} />
    <Composition id="ShortNinoYT" component={ShortNino} durationInFrames={Math.ceil(SHORT_TOTAL('yt') * 30)} fps={30} width={1080} height={1920} defaultProps={{kind: 'yt' as const}} />
    <Composition id="ShortNinoTT" component={ShortNino} durationInFrames={Math.ceil(SHORT_TOTAL('tt') * 30)} fps={30} width={1080} height={1920} defaultProps={{kind: 'tt' as const}} />
    <Still id="Miniatura" component={Miniatura} width={1280} height={720} />
  </>
);
