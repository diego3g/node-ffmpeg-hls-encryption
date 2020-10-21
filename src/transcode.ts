import path from 'path';
import fs from 'fs';

import { getVideoInformation } from './getVideoInformation';
import { createSegmentsFromOriginalVideo } from './createSegmentsFromOriginalVideo';
import { convertSegmentToCustomResolution, Resolutions } from './convertSegmentToCustomResolution';
import { createMasterPlaylist } from './createMasterPlaylist';
import { mergeSegmentsIntoVideo } from './mergeSegmentsIntoVideo';
import { generateEncryptedSegments } from './generateEncryptedSegments';
import { generateEncryptionKey } from './generateEncryptionKey';

const inputPath = path.join(__dirname, '..', 'video.mkv');
const distPath = path.join(__dirname, '..', 'dist');

const main = async () => {
  const info = await getVideoInformation(inputPath);

  const has1080Resolution = info.streams.some(stream => {
    return stream.width === 1920 && stream.height === 1080;
  });

  if (!has1080Resolution) {
    throw new Error('Incorrect video resolution, pease use 1920x1080.');
  }

  const numberOfChunks = await createSegmentsFromOriginalVideo(inputPath);

  const resolutions: Resolutions[] = [
    '1920x1080',
    '1280x720',
    '640x480'
  ];

  await fs.promises.mkdir(path.join(distPath, 'merged'));

  await Promise.all(resolutions.map(async (resolution) => {
    console.time(`${resolution}p`);

    const convertSegmentsPromises = [];

    const destinationPath = path.join(distPath, resolution);

    await fs.promises.mkdir(destinationPath);

    for (let i = 0; i < numberOfChunks; i++) {
      const convertSegmentPromise = convertSegmentToCustomResolution(
        `chunk${String(i).padStart(5, '0')}.ts`,
        resolution
      );

      convertSegmentsPromises.push(convertSegmentPromise)
    }

    await Promise.all(convertSegmentsPromises);

    await fs.promises.copyFile(
      path.join(distPath, 'original', 'playlist.m3u8'),
      path.join(destinationPath, 'playlist.m3u8')
    );

    await fs.promises.mkdir(path.join(distPath, 'encrypted', resolution), { 
      recursive: true 
    });

    await generateEncryptionKey(resolution);

    await mergeSegmentsIntoVideo(resolution);

    await generateEncryptedSegments(resolution);

    console.timeEnd(`${resolution}p`);
  }));

  await createMasterPlaylist();
}

main();
