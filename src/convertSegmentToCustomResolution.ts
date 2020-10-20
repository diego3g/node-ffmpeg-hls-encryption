import path from "path";
import { execSync } from "child_process";

const ffmpegPath = '/usr/bin/ffmpeg';
const distPath = path.join(__dirname, '..', 'dist');

// const createSegmentsArgs = [
//   `-i ${objectPath}`, 
//   '-vcodec libx264',
//   '-acodec copy',
//   '-c:a aac',
//   '-ar 48000',
//   '-b:a 192k',
//   '-c:v h264',
//   '-profile:v main',
//   '-crf 20',
//   '-g 48',
//   '-b:v 2500k',
//   '-maxrate 4500k',
//   '-bufsize 5300k',
//   '-sc_threshold 0',
//   '-keyint_min 48',
//   '-hls_time 4',
//   '-f segment',
//   '-muxdelay 0',
//   '-hls_playlist_type vod',
//   `-segment_list ${playlistName} ${segmentPath}`
// ].join(' ');

export type Resolutions = '1920x1080' | '1280x720' | '640x480';
type Bitrate = {[key in Resolutions]: string}

const audioBitrate: Bitrate = {
  "640x480": '128k',
  "1280x720": '128k',
  "1920x1080": '192k',
}

const videoMinBitRate: Bitrate = {
  "640x480": '1400k',
  "1280x720": '2800k',
  "1920x1080": '4000k',
}

const videoMaxBitRate: Bitrate = {
  "640x480": '1498k',
  "1280x720": '2996k',
  "1920x1080": '4200k',
}

const videoBufferSize: Bitrate = {
  "640x480": '2100k',
  "1280x720": '4200k',
  "1920x1080": '7500k',
}

export function convertSegmentToCustomResolution(chunkName: string, resolution: Resolutions) {
  const segmentPath = path.join(distPath, 'original', chunkName);
  const destinationPath = path.join(distPath, resolution, chunkName);

  const convertSegmentArgs = [
    `-i ${segmentPath}`, 
    `-s ${resolution}`,
    '-vcodec libx264',
    '-acodec copy',
    '-c:a aac',
    '-ar 48000',
    `-b:a ${audioBitrate[resolution]}`,
    '-c:v h264',
    '-profile:v main',
    '-crf 20',
    `-b:v ${videoMinBitRate[resolution]}`,
    `-maxrate ${videoMaxBitRate[resolution]}`,
    `-bufsize ${videoBufferSize[resolution]}`,
    '-sc_threshold 0',
    '-keyint_min 48',
    '-muxdelay 0',
    '-copyts',
    destinationPath
  ].join(' ');

  console.log(convertSegmentArgs);

  const convertSegment = `${ffmpegPath} ${convertSegmentArgs}`;

  execSync(convertSegment);
}