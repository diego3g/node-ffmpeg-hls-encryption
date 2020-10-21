import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const encKey = 'cda07fb0da0db4b75bd33d59dfa39609';
const iv = '438f731d8bd2c67fc79c6212a6cc8bee';

const encrypt = async () => {
  const keyFile = path.join(__dirname, '..', 'dist', 'enc.key');

  // const files = await fs.promises.readdir(path.join(__dirname, '..', 'dist', '1920x1080'));

  // files.forEach(file => {
  //   const inPath = path.join(__dirname, '..', 'dist', '1920x1080', file);
  //   const outPath = path.join(__dirname, '..', 'dist', 'encrypted', file);

  //   execSync(`/usr/bin/openssl aes-128-cbc -e -in ${inPath} -out ${outPath} -nosalt -K ${encKey} -iv ${iv}`);
  // });

  const objectPath = path.join(__dirname, '..', 'video.mkv');
  const segmentPath = path.join(__dirname, '..', 'dist', 'encrypted2', 'chunk%05d.ts');
  const playlistName = path.join(__dirname, '..', 'dist', 'encrypted2', 'playlist.m3u8');

  const createSegmentsArgs = [
    `-i ${objectPath}`, 
    // '-vcodec copy',
    // '-acodec copy',
    '-hls_time 4',
    `-hls_key_info_file ${keyFile}`,
    playlistName,
  ].join(' ');

  const createSegments = `/usr/local/bin/ffmpeg ${createSegmentsArgs}`;

  execSync(createSegments);

  // execSync(`/usr/bin/openssl aes-128-cbc -e -in ${inPath} -out ${outPath} -nosalt -iv ${iv} -K ${encKey}`);
}

const decrypt = async () => {
  const encryptedFilePath = path.join(__dirname, '..', 'dist', '1920x1080', 'chunk00000_enc.ts');
  const descryptedFilePath = path.join(__dirname, '..', 'dist', 'decrypted.mp4');

  // Encrypt segment
  execSync(`/usr/local/bin/ffmpeg -i ${encryptedFilePath} -decryption_key ${encKey} ${descryptedFilePath}`);
}

encrypt();

// decrypt();