let outputPath = null;
(async () => {
  const saved = await window.api?.getSavedDestination?.();
  if (saved) {
    outputPath = saved;
    logBox.textContent += `📁 Restored destination folder:\n  ${saved}\n`;
  }
})();

const logBox = document.createElement('pre');
logBox.style.overflowY = 'auto';
logBox.style.maxHeight = '400px';
document.body.appendChild(logBox);

let selectedPaths = [];

document.getElementById('selectFilesBtn').addEventListener('click', async () => {
  selectedPaths = await window.api?.selectFiles?.();

  if (selectedPaths?.length) {
    logBox.textContent += `\n📥 Added files:\n  • ${selectedPaths.join('\n  • ')}`;
  } else {
    logBox.textContent += `\n⚠️ No files selected.`;
  }

  logBox.scrollTop = logBox.scrollHeight;
});

document.getElementById('setDestinationBtn').addEventListener('click', async () => {
  const folder = await window.api?.setDestinationFolder?.();
  if (folder) {
    outputPath = folder;
    logBox.textContent += `\n📁 Destination set to:\n  ${folder}`;
  } else {
    logBox.textContent += `\n⚠️ No folder selected.`;
  }
  logBox.scrollTop = logBox.scrollHeight;
});


document.getElementById('trimBtn').addEventListener('click', () => {
  logBox.textContent = "🌀 Trimming started...\n";

  if (!selectedPaths?.length) {
    logBox.textContent += `\n⚠️ No files to trim. Select some first.`;
  } else if (!outputPath) {
    logBox.textContent += `\n⚠️ Please set a destination folder first.`;
  } else if (window.api?.runTrimmer) {
    window.api.runTrimmer(selectedPaths, outputPath);
  } else {
    logBox.textContent += "\n⚠️ Trimmer function not found.\n";
  }

  logBox.scrollTop = logBox.scrollHeight;
});




// Set default theme on load (optional)
document.body.classList.add('dark');

// React to theme toggles from preload
window.addEventListener('theme-change', e => {
  const theme = e.detail;
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(theme);
});

// Create and reference the converted file list container
const fileList = document.getElementById('fileList');

function addConvertedFile(filename) {
  const li = document.createElement('li');
  li.textContent = filename;
  fileList.appendChild(li);
}

window.addEventListener('ffmpeg-log', e => {
  const msg = e.detail;
  logBox.textContent += `\n${msg}`;
  logBox.scrollTop = logBox.scrollHeight;

  // Match completed file messages
  const match = msg.match(/Finished trimming:\s*(.+\.(mp3|wav|ogg))/i);
  if (match) {
    addConvertedFile(match[1]);
  }
});

window.addEventListener('DOMContentLoaded', async () => {
  const el = document.getElementById('version-label');
  
  try {
    const version = await window.api.getAppVersion();
    el.textContent = `v${version}`;
  } catch (err) {
    console.warn('❗ Version fetch failed:', err);
    el.textContent = 'v—';
  }
});


window.addEventListener('ffmpeg-error', e => {
  logBox.textContent += `\n🚨 ${e.detail}`;
  logBox.scrollTop = logBox.scrollHeight;
});


