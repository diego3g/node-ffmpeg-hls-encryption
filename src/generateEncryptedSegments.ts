import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { Resolutions } from './convertSegmentToCustomResolution';

const distPath = path.join(__dirname, '..', 'dist');

export async function generateEncryptedSegments(resolution: Resolutions) {
  const encryptedResolutionPath = path.join(distPath, 'encrypted', resolution);

  const inputPath = path.join(distPath, 'merged', `${resolution}.mp4`);
  const segmentPath = path.join(encryptedResolutionPath, 'chunk%05d.ts');
  const playlistName = path.join(encryptedResolutionPath, 'playlist.m3u8');
  const encryptionKeyInfoPath = path.join(encryptedResolutionPath, 'encryption.keyinfo');
  
  const createSegmentsArgs = [
    `-i ${inputPath}`, 
    '-vcodec copy',
    '-acodec copy',
    '-muxdelay 0',
    '-hls_playlist_type vod',
    `-hls_key_info_file ${encryptionKeyInfoPath}`,
    `-hls_segment_filename ${segmentPath}`,
    playlistName,
  ].join(' ');

  execSync(`/usr/local/bin/ffmpeg ${createSegmentsArgs}`);
}