import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';
import {Luka, FPS, SRC_DUR} from './Luka';
export const Root: React.FC = () => (
  <>
    <Composition id="Main" component={Main} durationInFrames={963} fps={30} width={1080} height={1920} />
    <Composition id="Luka" component={Luka} durationInFrames={Math.floor(SRC_DUR * FPS)} fps={FPS} width={1080} height={1920} />
  </>
);
