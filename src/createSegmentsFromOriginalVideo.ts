import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process'

const ffmpegPath = '/usr/bin/ffmpeg';
const distPath = path.join(__dirname, '..', 'dist');

export async function createSegmentsFromOriginalVideo(objectPath: string) {
  console.time('Creating segments');

  await fs.promises.mkdir(path.join(distPath, 'original'));

  const segmentPath = path.join(distPath, 'original', 'chunk%05d.ts');
  const playlistName = path.join(distPath, 'original', 'playlist.m3u8');

  const createSegmentsArgs = [
    `-i ${objectPath}`, 
    '-vcodec copy',
    '-acodec copy',
    '-f segment',
    '-muxdelay 0',
    `-segment_list ${playlistName}`,
    segmentPath,
  ].join(' ');

  const createSegments = `${ffmpegPath} ${createSegmentsArgs}`;

  execSync(createSegments);

  console.timeEnd('Creating segments');

  const playlistFileContent = await fs.promises.readFile(playlistName);

  const chunkRegex = /chunk[0-9]{5}\.ts/g
  const chunksGenerated = ((playlistFileContent.toString() || '').match(chunkRegex) || []).length;

  return chunksGenerated;
};