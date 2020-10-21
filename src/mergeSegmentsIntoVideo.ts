import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

import { Resolutions } from './convertSegmentToCustomResolution';

const distPath = path.join(__dirname, '..', 'dist');

export async function mergeSegmentsIntoVideo(resolution: Resolutions) {
  const playlistPath = path.join(distPath, resolution, 'playlist.m3u8');
  const joinedVideoPath = path.join(distPath, 'merged', `${resolution}.mp4`);

  const joinSegmentsArgs = [
    `-i ${playlistPath}`,
    `-codec copy`,
    joinedVideoPath
  ].join(' ');

  execSync(`/usr/local/bin/ffmpeg ${joinSegmentsArgs}`);
};