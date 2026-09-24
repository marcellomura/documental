import React from 'react';
import {Composition, Still} from 'remotion';
import {Miniatura} from './Miniatura';
import {Documental} from './Documental';
import timeline from './data/timeline.json';

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
    <Still id="Miniatura" component={Miniatura} width={1280} height={720} />
  </>
);
