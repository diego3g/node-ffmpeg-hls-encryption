import path from "path";
import { execSync } from "child_process";
import fs from 'fs';

const tmpPath = path.join(__dirname, "..", 'tmp');
const probeVideoDataPath = path.join(tmpPath, 'probeVideoData.json');

const ffprobePath = '/usr/local/bin/ffprobe';

interface VideInformation {
  streams: Array<{
    width: number;
    height: number;
  }>;
  format: {
    duration: string;
    size: string;
  }
}

export async function getVideoInformation(objectPath: string): Promise<VideInformation> {
  const command = `${ffprobePath} -v error -show_entries stream=width,height -show_entries format=size,duration -print_format json -i "${objectPath}" > "${probeVideoDataPath}"`;

  execSync(command);

  const probeData = await fs.promises.readFile(probeVideoDataPath);

  return JSON.parse(probeData.toString());
};