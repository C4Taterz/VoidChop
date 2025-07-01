const logBox = document.createElement('pre');
logBox.style.overflowY = 'auto';
logBox.style.maxHeight = '400px';
document.body.appendChild(logBox);

document.getElementById('trimBtn').addEventListener('click', () => {
  logBox.textContent = "🌀 Trimming started...\n";

  if (window.api?.runTrimmer) {
    window.api.runTrimmer();
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

window.addEventListener('ffmpeg-log', e => {
  logBox.textContent += `\n${e.detail}`;
  logBox.scrollTop = logBox.scrollHeight;
});
window.addEventListener('ffmpeg-error', e => {
  logBox.textContent += `\n🚨 ${e.detail}`;
  logBox.scrollTop = logBox.scrollHeight;
});
