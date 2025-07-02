require('dotenv').config();

const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

let isPackaged = false;
try {
  isPackaged = process.defaultApp === undefined;
} catch {
  isPackaged = true;
}

const ffmpegPath = isPackaged
  ? path.join(process.resourcesPath, 'app.asar.unpacked', 'ffmpeg', 'ffmpeg.exe')
  : path.join(__dirname, 'ffmpeg', 'ffmpeg.exe');


ffmpeg.setFfmpegPath(ffmpegPath);

if (!fs.existsSync(ffmpegPath)) {
  console.error('❌ FFmpeg not found at:', ffmpegPath);
}

const silenceParams = process.env.SILENCE_FILTER || 'silenceremove=stop_periods=-1:stop_duration=0.5:stop_threshold=-35dB';
const supported = ['.mp3', '.mpg3', '.mpga', '.wav', '.ogg', '.mp4'];

function trimAllAudio(filePaths, outputDir, onLog = console.log, onError = console.error, onComplete = () => {}) {
  const fallbackDir = './trimmed_audio';
  const resolvedOutput = outputDir || fallbackDir;
  fs.mkdirSync(resolvedOutput, { recursive: true });

  const files = filePaths.filter(file => supported.includes(path.extname(file).toLowerCase()));

  if (files.length === 0) {
    onLog('❗ No supported audio files selected.');
    return;
  }

  let completed = 0;

  files.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    const base = path.basename(file, ext);
    const outputPath = path.join(resolvedOutput, `${base}.mp3`);

ffmpeg(file)
  .noVideo() // ✂️ Trim audio only
  .audioCodec('libmp3lame')
  .audioFilters(silenceParams)
  .audioBitrate('320k')  
  .outputOptions('-map_metadata', '-1')      // 🧹 Strip metadata
  .outputOptions('-write_xing', '0')         // 🎯 Fix MP3 duration estimation
  .on('end', () => {
    onLog(`✅ Trimmed: ${base}${ext}`);
    completed++;
    if (completed === files.length) {
      onComplete();
    }
  })
  .on('error', err => {
    onError(`❌ ${base}${ext}: ${err.message}`);
    completed++;
    if (completed === files.length) {
      onComplete();
    }
  })
  .outputOptions('-write_xing', '0') // For MP3: fixes duration estimate
  .save(outputPath);

  });
}

module.exports = { trimAllAudio };
