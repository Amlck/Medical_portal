// ---------------------------------------------------------------------------
// Music Player
// ---------------------------------------------------------------------------
let musicTracks = [];
let musicIdx = -1;
let musicShuffleOn = false;
let musicLoopOn = false;
const MUSIC_VOL_KEY = 'music-volume';
const MUSIC_TRACK_KEY = 'music-track-idx';

async function loadMusicList() {
  try {
    const res = await fetch('api/music');
    musicTracks = await res.json();
  } catch (e) {
    musicTracks = [];
  }
  const nameEl = document.getElementById('music-track-name');
  if (!musicTracks.length) {
    nameEl.textContent = 'Add files → portal/static/music/';
    nameEl.className = 'music-track-name idle';
    document.getElementById('music-list-empty').innerHTML =
      'No tracks found.<br>Place MP3, OGG, or WAV files in<br><code style="font-size:0.55rem">portal/static/music/</code>';
    return;
  }
  const saved = parseInt(localStorage.getItem(MUSIC_TRACK_KEY) ?? '-1', 10);
  if (saved >= 0 && saved < musicTracks.length) loadTrack(saved, false);
}

function renderMusicListPanel() {
  const panel = document.getElementById('music-list-panel');
  if (!musicTracks.length) {
    panel.innerHTML = '<div class="music-empty" id="music-list-empty">' +
      'No tracks found.<br>Place MP3, OGG, or WAV files in<br>' +
      '<code style="font-size:0.55rem">portal/static/music/</code></div>';
    return;
  }
  panel.innerHTML = musicTracks.map((track, idx) => {
    const label = track.replace(/\.[^.]+$/, '');
    const active = idx === musicIdx;
    return `<div class="music-list-item${active ? ' active' : ''}" onclick="selectTrack(${idx})">${active ? '▶ ' : ''}${label}</div>`;
  }).join('');
}

function toggleMusicList() {
  const panel = document.getElementById('music-list-panel');
  const btn = document.getElementById('music-list-btn');
  const showing = panel.style.display !== 'none';
  if (!showing) renderMusicListPanel();
  panel.style.display = showing ? 'none' : '';
  btn.classList.toggle('active', !showing);
}

function loadTrack(idx, autoplay = true) {
  if (!musicTracks.length) return;
  musicIdx = ((idx % musicTracks.length) + musicTracks.length) % musicTracks.length;
  const track = musicTracks[musicIdx];
  const audio = document.getElementById('music-audio');
  audio.src = `/static/music/${encodeURIComponent(track)}`;
  audio.load();
  const nameEl = document.getElementById('music-track-name');
  nameEl.textContent = track.replace(/\.[^.]+$/, '');
  nameEl.className = 'music-track-name';
  document.getElementById('music-progress').style.display = '';
  localStorage.setItem(MUSIC_TRACK_KEY, musicIdx);
  if (autoplay) audio.play().catch(() => {});
}

function selectTrack(idx) {
  loadTrack(idx, true);
  document.getElementById('music-list-panel').style.display = 'none';
  document.getElementById('music-list-btn').classList.remove('active');
}

function togglePlay() {
  const audio = document.getElementById('music-audio');
  if (!audio.src || !musicTracks.length) {
    if (musicTracks.length) loadTrack(0);
    return;
  }
  if (audio.paused) audio.play().catch(() => {});
  else audio.pause();
}

function nextTrack() {
  if (!musicTracks.length) return;
  const next = musicShuffleOn
    ? Math.floor(Math.random() * musicTracks.length)
    : (musicIdx + 1) % musicTracks.length;
  loadTrack(next, true);
}

function prevTrack() {
  const audio = document.getElementById('music-audio');
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  const prev = musicShuffleOn
    ? Math.floor(Math.random() * musicTracks.length)
    : musicIdx - 1;
  loadTrack(prev, true);
}

function setMusicVolume(val) {
  document.getElementById('music-audio').volume = parseFloat(val);
  localStorage.setItem(MUSIC_VOL_KEY, val);
}

function toggleShuffle() {
  musicShuffleOn = !musicShuffleOn;
  document.getElementById('music-shuffle-btn').classList.toggle('active', musicShuffleOn);
}

function toggleLoop() {
  musicLoopOn = !musicLoopOn;
  document.getElementById('music-audio').loop = musicLoopOn;
  document.getElementById('music-loop-btn').classList.toggle('active', musicLoopOn);
}

(function initMusicPlayer() {
  const audio = document.getElementById('music-audio');
  const vol = parseFloat(localStorage.getItem(MUSIC_VOL_KEY) ?? '0.7');
  audio.volume = vol;
  document.getElementById('music-vol').value = vol;

  audio.addEventListener('play', () => { document.getElementById('music-play-btn').textContent = '⏸'; });
  audio.addEventListener('pause', () => { document.getElementById('music-play-btn').textContent = '▶'; });
  audio.addEventListener('ended', () => { if (!musicLoopOn) nextTrack(); });
  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const prog = document.getElementById('music-progress');
    if (prog !== document.activeElement) prog.value = audio.currentTime / audio.duration;
  });

  const prog = document.getElementById('music-progress');
  prog.addEventListener('input', () => {
    if (audio.duration) audio.currentTime = parseFloat(prog.value) * audio.duration;
  });

  loadMusicList();
})();
