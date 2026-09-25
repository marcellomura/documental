import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Globe} from './globe';
import {FlatMap, RegionBox} from './flatmap';
import {N, Ocean, Tag, WaveWipe} from './kit';

export const Test4: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  if (f < 30) return (
    <Ocean>
      <Globe view={{lon: -120 + t * 20, lat: -5, r: 440, cx: 960, cy: 560}} tex="sst2026">
        {(proj, path) => <path d={path({type: 'Point', coordinates: [-58.4, -34.6]} as any) ?? ''} fill={N.yellow} />}
      </Globe>
    </Ocean>
  );
  return (
    <AbsoluteFill>
      <FlatMap cam={{lon: 215, lat: -2, deg: 150}} sst="2026">
        {(P) => <RegionBox P={P} lon0={-170} lon1={-120} lat0={-5} lat1={5} p={1} label="NIÑO 3.4" />}
      </FlatMap>
      <Tag t={2} t0={1} x={P0()} y={540} title="Niño 3.4" value="+3,0 °C" />
      <WaveWipe t={t} at={1.9} />
    </AbsoluteFill>
  );
};
const P0 = () => 960;
