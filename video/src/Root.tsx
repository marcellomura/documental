import React from 'react';
import {Composition, Still} from 'remotion';
import {Miniatura} from './Miniatura';
import {Documental} from './Documental';
import timeline from './data/timeline.json';
import short from './data/short.json';
import {Short} from './short/Short';
import {RoboDelSiglo} from './ep02/RoboDelSiglo';
import tl2 from './data/ep02/timeline.json';

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
    <Still id="Miniatura" component={Miniatura} width={1280} height={720} />
  </>
);
