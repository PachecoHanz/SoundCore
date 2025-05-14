const grid = document.getElementById("launchpad-grid");
const tempoSlider = document.getElementById("tempo");
const tempoDisplay = document.getElementById("tempo-display");
const playButton = document.getElementById("toggle-play");
const volumeSlider = document.getElementById("volume");
const uploadInput = document.getElementById("upload");
const saveBtn = document.getElementById("save-pattern");
const loadBtn = document.getElementById("load-pattern");
const downloadBtn = document.getElementById("download-pattern");
const resetBtn = document.getElementById("reset-sounds");
const soundItems = document.querySelectorAll(".sound-item");

const rows = 7, cols = 8;
const buttons = [];
const buttonSounds = {}; // Custom sound per button
let defaultSounds = {};
let currentStep = 0;
let isPlaying = false;
let interval;
let tempo = 120;

const logo = document.createElement("div");
logo.id = "logo-header";
logo.innerHTML = `<img src="images/soundcorelogo.png" alt="SoundCore Logo">`;
document.body.insertBefore(logo, document.body.firstChild);

// Create buttons and enable drop targets
for (let row = 0; row < rows; row++) {
  buttons[row] = [];
  for (let col = 0; col < cols; col++) {
    const btn = document.createElement("button");
    btn.classList.add("btn");
    const id = `btn-${row}-${col}`;
    btn.id = id;
    btn.dataset.row = row;
    btn.dataset.col = col;

    btn.style.margin = "4px";
    btn.addEventListener("click", () => btn.classList.toggle("active"));

    btn.addEventListener("dragover", e => {
      e.preventDefault();
      btn.classList.add("drag-hover");
    });

    btn.addEventListener("dragleave", () => {
      btn.classList.remove("drag-hover");
    });

    btn.addEventListener("drop", e => {
      e.preventDefault();
      const src = e.dataTransfer.getData("text/plain");
      if (src) {
        buttonSounds[id] = new Audio(src);
        btn.classList.add("custom");
        const label = src.split('/').pop().split('.')[0];
        btn.textContent = label.length > 6 ? label.slice(0, 6) + "…" : label;
      }
      btn.classList.remove("drag-hover");
    });

    buttons[row][col] = btn;
    grid.appendChild(btn);
  }
}

// Drag start and preview from sound library
soundItems.forEach(item => {
  const preview = new Audio(item.dataset.src);

  item.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", item.dataset.src);
  });

  item.addEventListener("mouseenter", () => {
    preview.currentTime = 0;
    preview.volume = 0.7;
    preview.play();
  });

  item.addEventListener("mouseleave", () => {
    preview.pause();
    preview.currentTime = 0;
  });
});

function playStep() {
  for (let row = 0; row < rows; row++) {
    const btn = buttons[row][currentStep];
    const id = btn.id;

    if (btn.classList.contains("active")) {
      const audio = buttonSounds[id]?.cloneNode() || defaultSounds[id]?.cloneNode();
      if (audio) {
        audio.volume = volumeSlider.value;
        audio.play();
      }
    }

    buttons[row].forEach((b, i) => b.classList.toggle("playing", i === currentStep));
  }
  currentStep = (currentStep + 1) % cols;
}

function startSequencer() {
  clearInterval(interval);
  interval = setInterval(playStep, (60 / tempo) * 1000);
}

function stopSequencer() {
  clearInterval(interval);
}

playButton.addEventListener("click", () => {
  isPlaying = !isPlaying;
  playButton.textContent = isPlaying ? "Pause" : "Play";
  isPlaying ? startSequencer() : stopSequencer();
});

tempoSlider.addEventListener("input", e => {
  tempo = parseInt(e.target.value);
  tempoDisplay.textContent = tempo;
  if (isPlaying) {
    stopSequencer();
    startSequencer();
  }
});

uploadInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (file) {
    const audio = new Audio(URL.createObjectURL(file));
    buttonSounds["btn-0-0"] = audio;
    buttons[0][0].classList.add("custom");
    alert("Custom sample set to button 0-0!");
  }
});

saveBtn.addEventListener("click", () => {
  const pattern = buttons.map(row => row.map(btn => btn.classList.contains("active") ? 1 : 0));
  localStorage.setItem("soundcore-pattern", JSON.stringify(pattern));
  alert("Pattern saved!");
});

loadBtn.addEventListener("click", () => {
  const pattern = JSON.parse(localStorage.getItem("soundcore-pattern"));
  if (pattern) {
    pattern.forEach((row, r) => row.forEach((val, c) => {
      buttons[r][c].classList.toggle("active", val);
    }));
    alert("Pattern loaded!");
  }
});

downloadBtn.addEventListener("click", () => {
  const pattern = buttons.map(row => row.map(btn => btn.classList.contains("active") ? 1 : 0));
  const blob = new Blob([JSON.stringify(pattern)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "soundcore-pattern.json";
  link.click();
});

// Reset all sounds to default
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    Object.keys(buttonSounds).forEach(id => delete buttonSounds[id]);
    document.querySelectorAll(".btn.custom").forEach(btn => {
      btn.classList.remove("custom");
      btn.innerHTML = "";
    });
    alert("All button sounds have been reset to default.");
  });
}

// Assign default sound map
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const id = `btn-${row}-${col}`;
    const sampleName = ["kick", "snare", "hihat", "clap", "bass", "perc", "synth"][row % 7];
    defaultSounds[id] = new Audio(`sounds/${sampleName}.wav`);
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("closed");
}
