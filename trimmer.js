require('dotenv').config();
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

const ffmpegPath = process.env.FFMPEG_PATH;
ffmpeg.setFfmpegPath(ffmpegPath);

const silenceParams = process.env.SILENCE_FILTER || 'silenceremove=stop_periods=-1:stop_duration=0.5:stop_threshold=-35dB';
const supported = ['.mp3', '.mpg3', '.mpga', '.wav', '.ogg', '.mp4'];

function trimAllAudio(filePaths, outputDir, onLog = console.log, onError = console.error) {  fs.mkdirSync(outputDir, { recursive: true });

const files = filePaths.filter(file => supported.includes(path.extname(file).toLowerCase()));

const fallbackDir = './trimmed_audio';
const resolvedOutput = outputDir || fallbackDir;
fs.mkdirSync(resolvedOutput, { recursive: true });

  if (files.length === 0) {
    onLog('❗ No supported audio files selected.');
    return;
  }

  files.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    const base = path.basename(file, ext);
    const outputPath = path.join(outputDir, `${base}.mp3`);

    ffmpeg(file)
      .audioFilters(silenceParams)
      .on('end', () => onLog(`✅ Trimmed: ${base}${ext}`))
      .on('error', err => onError(`❌ ${base}${ext}: ${err.message}`))
      .save(outputPath);
  });
}

module.exports = { trimAllAudio };
