// Banco de pruebas de los decorados 3D del episodio 10 (cuadro N → escena N)
import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import './components/base';
import {Chalet3D, Gallery3D, Loot3D, Notebook3D, Room3D, ShipDeck3D, FrameField, Stage, HATCH_Z} from './ep10/three10';

const T: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const bg = {background: 'radial-gradient(ellipse at 50% 30%, #1B2740 0%, #070A12 70%)'};
  if (f === 0)
    return (
      <AbsoluteFill style={{background: '#0B0907'}}>
        <Stage cam={{pos: [0, 1.55, 6.4], look: [0, 1.45, 0], fov: 40}} keyI={0.7} fill={0.35} key0={[3, 6, 8]} exposure={1.0}>
          <Room3D s={{t, painting: 1, tapestry: 0, lamp: 1}} />
        </Stage>
      </AbsoluteFill>
    );
  if (f === 1)
    return (
      <AbsoluteFill style={{background: '#0B0907'}}>
        <Stage cam={{pos: [0, 1.9, 1.9], look: [0, 1.9, 0], fov: 34}} keyI={0.7} fill={0.35} key0={[3, 6, 8]}>
          <Room3D s={{t, painting: 0, tapestry: 1, ghost: 1, lamp: 1, police: 1}} />
        </Stage>
      </AbsoluteFill>
    );
  if (f === 2)
    return (
      <AbsoluteFill style={bg}>
        <Stage cam={{pos: [4.5, 2.2, 15], look: [0, 2.0, 0], fov: 36}} keyI={0.25} fill={0.25} key0={[-8, 12, 10]} rimColor="#5F7FBF" shadow={14}>
          <Chalet3D s={{t, mover: 0.5}} />
        </Stage>
      </AbsoluteFill>
    );
  if (f === 3)
    return (
      <AbsoluteFill style={bg}>
        <Stage cam={{pos: [0.8, 1.65, -3], look: [0, 0.6, HATCH_Z], fov: 42}} keyI={0.15} fill={0.18} key0={[-8, 12, -20]} rimColor="#5F7FBF">
          <ShipDeck3D t={t} />
        </Stage>
      </AbsoluteFill>
    );
  if (f === 4)
    return (
      <AbsoluteFill style={{background: '#0B0907'}}>
        <Stage cam={{pos: [0.2, 2.6, 2.0], look: [0, 0, 0], fov: 38}} keyI={0.3} fill={0.25} key0={[3, 8, 4]}>
          <Notebook3D open={1} flip={0.5} />
        </Stage>
      </AbsoluteFill>
    );
  if (f === 5)
    return (
      <AbsoluteFill style={{background: '#0B0907'}}>
        <Stage cam={{pos: [0, 1.7, 4], look: [0, 1.6, -12], fov: 42}} keyI={0.3} fill={0.3} key0={[2, 8, 6]}>
          <Gallery3D t={t} taken={0.3} reveal={1} />
        </Stage>
      </AbsoluteFill>
    );
  if (f === 6)
    return (
      <AbsoluteFill style={{background: '#0B0907'}}>
        <Stage cam={{pos: [0, 3.2, 5.5], look: [0, 0.3, 0], fov: 36}} keyI={1.6} fill={0.4} key0={[3, 8, 5]}>
          <Loot3D t={t} gold={1} diamonds={1} notes={1} />
        </Stage>
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{background: '#0B0907'}}>
      <Stage cam={{pos: [0, 7, 9], look: [0, 0, 0], fov: 38}} keyI={1.4} fill={0.45} key0={[3, 10, 6]}>
        <FrameField t={t} build={1} missing={1} lift={0.5} />
      </Stage>
    </AbsoluteFill>
  );
};
const Rt: React.FC = () => <Composition id="T10" component={T} durationInFrames={10} fps={30} width={1920} height={1080} />;
registerRoot(Rt);
