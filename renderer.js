const fileList = document.getElementById('fileList');
const fileListContainer = document.getElementById('selectedFilesList');

const logBox = document.createElement('pre');
logBox.style.overflowY = 'auto';
logBox.style.maxHeight = '400px';
logBox.style.marginTop = '0.8rem';

fileList.insertAdjacentElement('afterend', logBox); // Attach logBox just below list

let selectedPaths = []; // Important: should be declared globally


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
  const button = document.getElementById("fileCounterBtn");
  const clearBtn = document.getElementById('clearFilesBtn');
clearBtn.style.display = count > 0 ? 'inline-flex' : 'none';

document.getElementById('clearFilesBtn').addEventListener('click', () => {
selectedPaths = [];
updateFileBadge(0);
renderSelectedFiles();
updateConvertedListVisibility();
removeProcessingMenu();
logBox.textContent = '🧼 File list cleared.';
});


  if (!badge || !button) return;

  badge.textContent = count > 0 ? `${count} file${count > 1 ? 's' : ''}` : '0';


  // 👇 Trigger pulse animation
  badge.style.animation = "none";
  void badge.offsetWidth;
  badge.style.animation = "badgePulse 0.4s ease";

  // 👇 Toggle styles based on file presence
  badge.classList.toggle("active", count > 0);   // 🔄 this is where you apply a dark variant
  button.classList.toggle("active", count > 0);
}

function removeProcessingMenu() {
  const menu = document.getElementById('processing-menu');
  if (menu) menu.remove();
  fileListContainer.style.display = 'block';
}

function updateProcessingMenu(message) {
  const container = document.getElementById('processing-steps');
  if (!container) return;

  const lastMessage = container.lastElementChild?.textContent;
  if (lastMessage === message) return; // 👈 Skip repeated messages

  const step = document.createElement('div');
  step.textContent = message;
  step.style.padding = '2px 0';
  container.appendChild(step);
  container.scrollTop = container.scrollHeight;
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
        <span id="outputPathDisplay">Output // ...</span>
        <span id="placeholderBadgeSlot"></span>
      </div>
    `;

    fileList.appendChild(placeholder);
  }

  const outputEl = document.getElementById('outputPathDisplay');
  if (outputEl && outputPath) {
    const parts = outputPath.split(/[\\/]/);
    outputEl.textContent = `Output // ${parts[0]}\\...\\${parts[parts.length - 1]}`;
  }

  const badge = document.getElementById('fileCounterBtn');
  const slot = document.getElementById('placeholderBadgeSlot');
  if (badge && slot) {
    badge.appendChild(slot);
  }

  // ✅ Visibility logic
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

  const parts = fullPath.split(/[/\\]/);
  el.textContent = parts.length <= 2
    ? fullPath
    : `Output // ${parts[0]}\\...\\${parts[parts.length - 1]}`;
  el.title = fullPath;
}

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
    removeBtn.classList.add('remove-btn');

    removeBtn.addEventListener('click', () => {
      selectedPaths = selectedPaths.filter(p => p !== fullPath);
      updateFileBadge(selectedPaths.length);
      renderSelectedFiles();
      updateConvertedListVisibility();
      logBox.scrollTop = logBox.scrollHeight;
    });

    li.appendChild(label);
    li.appendChild(removeBtn);
    fileListContainer.appendChild(li);
  });

  // ✅ Centralized log message logic — always runs even if no files
  logBox.textContent = '';
  if (selectedPaths.length === 0) {
    logBox.textContent = '🔄 Start by selecting audio files to process.';
    logBox.style.display = 'block';
  } else {
    logBox.style.display = 'none';
  }
}


document.querySelectorAll('.ripple-container').forEach(el => {
  el.addEventListener('click', e => {
    const ripple = el.cloneNode(true);
    el.parentNode.replaceChild(ripple, el); // restart animation
  });
});


document.getElementById('selectFilesBtn').addEventListener('click', async () => {
  removeProcessingMenu(); // ✅ clears old "working" panel

  const newPaths = await window.api?.selectFiles?.();
  if (newPaths?.length) {
    const unique = newPaths.filter(p => !selectedPaths.includes(p));
    selectedPaths = [...selectedPaths, ...unique];

    updateFileBadge(selectedPaths.length);
    renderSelectedFiles();
  } else {
    updateFileBadge(0);
  }

  logBox.scrollTop = logBox.scrollHeight;
});



document.getElementById('trimBtn').addEventListener('click', () => {
  logBox.textContent = "🌀 Trimming started...\n";
  fileListContainer.style.display = 'none';

  const existingMenu = document.getElementById('processing-menu');
  if (!existingMenu) {
    const processingMenu = document.createElement('div');
    processingMenu.id = 'processing-menu';
    processingMenu.style.padding = '1rem';
    processingMenu.style.marginTop = '1rem';
    processingMenu.style.background = '#181818';
    processingMenu.style.border = '1px solid #444';
    processingMenu.style.borderRadius = '6px';
    processingMenu.style.color = '#ccc';
    processingMenu.style.textAlign = 'left';

    const stepLog = document.createElement('div');
    stepLog.id = 'processing-steps';
    stepLog.textContent = '🔄 Working... Your files are being trimmed.';
    processingMenu.appendChild(stepLog);

    fileList.insertAdjacentElement('afterend', processingMenu);
  }

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
  updateProcessingMenu(msg);

  if (msg.includes('All files finished trimming')) {

    fileListContainer.style.display = 'block';

    updateProcessingMenu('🎉 Trimming completed. All files processed.');

    selectedPaths = [];
    updateFileBadge(0);
    renderSelectedFiles();
    updateConvertedListVisibility();
  }

  const match = msg.match(/(?:Finished trimming|Trimmed:)\s*(.+\.(mp3|wav|ogg))/i);
  if (match) {
    addConvertedFile(match[1]);
  }
});




window.addEventListener('DOMContentLoaded', async () => {
  updateConvertedListVisibility();
  renderSelectedFiles(); // now it has access to the real logBox

  console.log('Startup selectedPaths:', selectedPaths);

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


