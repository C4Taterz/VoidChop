// trimmer.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = process.env.FFMPEG_PATH 
ffmpeg.setFfmpegPath(ffmpegPath);


const inputDir = './input_audio';
const outputDir = './trimmed_audio';
const silenceParams = process.env.SILENCE_FILTER || 'silenceremove=stop_periods=-1:stop_duration=0.5:stop_threshold=-35dB';
const supported = ['.mp3', '.mpg3', '.mpga', '.wav', '.ogg', '.mp4'];

function trimAllAudio(onLog = console.log, onError = console.error) {
  fs.mkdirSync(outputDir, { recursive: true });

  const files = fs.readdirSync(inputDir).filter(file => supported.includes(path.extname(file).toLowerCase()));

  if (files.length === 0) {
    onLog('No supported files found in input_audio/');
    return;
  }

  files.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    const base = path.basename(file, ext);
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, `${base}.mp3`);

    ffmpeg(inputPath)
      .audioFilters(silenceParams)
      .on('end', () => onLog(`✅ Trimmed: ${file}`))
      .on('error', err => onError(`❌ ${file}: ${err.message}`))
      .save(outputPath);
  });
}

module.exports = { trimAllAudio };
