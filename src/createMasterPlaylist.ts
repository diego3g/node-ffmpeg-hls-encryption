import path from "path";
import fs from "fs";
import HLS from 'hls-parser'; 

const distPath = path.join(__dirname, '..', 'dist');

const { MasterPlaylist, Variant } = HLS.types;

const resolutions = [
  "640x480",
  "1280x720",
  "1920x1080",
];

export async function createMasterPlaylist() {
  const variants = resolutions.map((resolution) => {
    const playlistPath = path.join(distPath, 'encrypted', resolution, 'playlist.m3u8');
    const playlistContent = fs.readFileSync(playlistPath, { encoding: 'utf8' });
  
    const { segments } = HLS.parse(playlistContent) as HLS.types.MediaPlaylist;
    const segment = segments[0];
    const segmentPath = path.join(distPath, resolution, segment.uri);
    const { size } = fs.statSync(segmentPath);
  
    const bandwidth = size * 8 / segment.duration;
  
    const [width, height] = resolution.split('x').map(Number);

    return new Variant({
      uri: `${resolution}/playlist.m3u8`,
      bandwidth: Math.ceil(bandwidth),
      resolution: {
        width, 
        height,
      }
    });
  });
  
  const masterPlaylist = new MasterPlaylist({
    variants,
  })

  await fs.promises.writeFile(
    path.join(distPath, 'encrypted', 'master.m3u8'),
    HLS.stringify(masterPlaylist),
  );
}