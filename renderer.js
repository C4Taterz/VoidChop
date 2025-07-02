let outputPath = null;
(async () => {
  const saved = await window.api?.getSavedDestination?.();
if (saved) {
  outputPath = saved;
  updateDestinationDisplay(saved); // 👈 new helper function below
}
})();

function updateFileBadge(count) {
  const badge = document.getElementById("fileBadge");
  if (!badge) return;
  badge.textContent = count;
  badge.style.animation = "none";
  void badge.offsetWidth;
  badge.style.animation = "badgePulse 0.4s ease";
}


function updateConvertedListVisibility() {
  let placeholder = document.getElementById('converted-placeholder');

  if (!placeholder) {
    placeholder = document.createElement('li');
    placeholder.id = 'converted-placeholder';
    placeholder.style.transition = 'opacity 0.3s ease';
    placeholder.style.opacity = '0.5';
    placeholder.style.fontStyle = 'italic';
    placeholder.style.pointerEvents = 'none';
    placeholder.style.position = 'relative';
    placeholder.style.zIndex = '0';

    placeholder.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span>➕ Add files to start trimming</span>
        <span id="placeholderBadgeSlot"></span>
      </div>
    `;

    fileList.appendChild(placeholder);

    const badge = document.getElementById("fileCounterBtn");
    const slot = document.getElementById("placeholderBadgeSlot");

    if (badge && slot) {
      slot.appendChild(badge);
      badge.style.display = "inline-flex";
      updateFileBadge(selectedPaths.length || 0);
    }
  }

  const realItems = Array.from(fileList.querySelectorAll('li')).filter(
    li => li.id !== 'converted-placeholder'
  );

  placeholder.style.opacity = realItems.length > 0 ? '0' : '0.5';
  placeholder.style.height = realItems.length > 0 ? '0' : 'auto';
  placeholder.style.marginBottom = realItems.length > 0 ? '0' : '4px';
}


function updateDestinationDisplay(fullPath) {
  const el = document.getElementById('destination-label');
  if (!el) return;

  // Truncate to first and last folder parts
  const parts = fullPath.split(/[/\\]/);
  if (parts.length <= 2) {
    el.textContent = fullPath;
  } else {
    el.textContent = `Output | ${parts[0]}\\...\\${parts[parts.length - 1]}`;
  }
el.title = fullPath;
}

const fileListContainer = document.getElementById('selectedFilesList');
const logBox = document.createElement('pre');
logBox.style.overflowY = 'auto';
logBox.style.maxHeight = '400px';
document.body.appendChild(logBox);

let selectedPaths = [];

const fileIcons = {
  mp3: '🎵',
  wav: '🔊',
  flac: '🎶',
  mp4: '🎬',
  mov: '📽️',
  avi: '🎞️',
  mkv: '🧊',
  webm: '🌐',
  png: '🖼️',
  jpg: '📸',
  jpeg: '📸',
  gif: '🎞️',
  default: '📁'
};

function renderSelectedFiles() {
  fileListContainer.innerHTML = '';

  selectedPaths.forEach(fullPath => {
    const name = fullPath.split(/[/\\]/).pop();
    const ext = name.split('.').pop().toLowerCase();
    const icon = fileIcons[ext] || fileIcons.default;

    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'center';
    li.style.marginBottom = '4px';

    const label = document.createElement('span');
    label.textContent = `${icon} ${name}`;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '✖';
    removeBtn.style.marginLeft = '10px';
    removeBtn.style.background = 'none';
    removeBtn.style.border = 'none';
    removeBtn.style.color = 'red';
    removeBtn.style.cursor = 'pointer';
    removeBtn.title = 'Remove file';

removeBtn.addEventListener('click', () => {
  selectedPaths = selectedPaths.filter(p => p !== fullPath);
  updateFileBadge(selectedPaths.length);
  renderSelectedFiles();

  // ✨ Rewrite logBox based on updated selectedPaths
  logBox.textContent = '';
  if (selectedPaths.length) {
    logBox.textContent += `📥 Current files:\n  • ${selectedPaths.map(p => {
      const name = p.split(/[/\\]/).pop();
      return name;
    }).join('\n  • ')}`;
  } else {
    logBox.textContent += '📥 No files currently selected.';
  }

  logBox.scrollTop = logBox.scrollHeight;
});

    li.appendChild(label);
    li.appendChild(removeBtn);
    fileListContainer.appendChild(li);
  });
}


document.getElementById('selectFilesBtn').addEventListener('click', async () => {
  selectedPaths = await window.api?.selectFiles?.();

  if (selectedPaths?.length) {
    updateFileBadge(selectedPaths.length);
    renderSelectedFiles();

    const names = selectedPaths.map(p => p.split(/[/\\]/).pop());
    logBox.textContent = `📥 Current files:\n  • ${names.join('\n  • ')}`;
  } else {
    logBox.textContent += `\n⚠️ No files selected.`;
    updateFileBadge(0);
  }

  logBox.scrollTop = logBox.scrollHeight;
});


document.getElementById('setDestinationBtn').addEventListener('click', async () => {
  const folder = await window.api?.setDestinationFolder?.();
  if (folder) {
    outputPath = folder;
    logBox.textContent += `\n📁 Destination set to:\n  ${folder}`;
    updateDestinationDisplay(folder);
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


function addConvertedFile(filename) {
  console.log('👀 addConvertedFile was called:', filename);
  const li = document.createElement('li');
  li.style.display = 'flex';
  li.style.justifyContent = 'space-between';
  li.style.alignItems = 'center';
  li.style.marginBottom = '4px';

  console.log('✅ fileList element:', fileList);

  const label = document.createElement('span');
  label.textContent = filename;

  const removeBtn = document.createElement('button');
  removeBtn.textContent = '✖';
  removeBtn.style.marginLeft = '10px';
  removeBtn.style.background = 'none';
  removeBtn.style.border = 'none';
  removeBtn.style.color = 'red';
  removeBtn.style.cursor = 'pointer';
  removeBtn.title = 'Remove from list';


  li.appendChild(label);
  li.appendChild(removeBtn); 

  fileList.appendChild(li); // 👈 make sure this is pointing to the correct UL element
  updateConvertedListVisibility();

  removeBtn.addEventListener('click', () => { 
  li.remove();
  updateConvertedListVisibility(); // 👈 now it hides placeholder when needed
});

}


window.addEventListener('ffmpeg-log', e => {
  const msg = e.detail;
  logBox.textContent += `\n${msg}`;
  logBox.scrollTop = logBox.scrollHeight;

  // Match completed file messages
const match = msg.match(/(?:Finished trimming|Trimmed:)\s*(.+\.(mp3|wav|ogg))/i);  if (match) {
    addConvertedFile(match[1]);
  }
});



window.addEventListener('DOMContentLoaded', async () => {
  updateConvertedListVisibility();

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


