const DURATIONS = {
  focus: 25 * 60,
  break: 5 * 60,
  nap: 15 * 60,
};

const MODE_COPY = {
  focus: {
    start: "开始专注",
    idle: "选择一件重要的事，然后开始。",
    running: "保持专注，你正在推进重要的事。",
  },
  break: {
    start: "开始休息",
    idle: "短暂休息，是下一轮专注的准备。",
    running: "离开屏幕，伸展一下。",
  },
  nap: {
    start: "开始小憩",
    idle: "闭上眼睛，让大脑安静一会儿。",
    running: "放下屏幕，享受 15 分钟小憩。",
  },
};

const CIRCUMFERENCE = 2 * Math.PI * 106;
const STORAGE_KEY = "focus-tomato-daily-rounds";

const timeElement = document.querySelector("#time");
const statusElement = document.querySelector("#status");
const roundsElement = document.querySelector("#rounds");
const dotsElement = document.querySelector("#tomato-dots");
const toggleButton = document.querySelector("#toggle-button");
const resetButton = document.querySelector("#reset-button");
const stopAlarmButton = document.querySelector("#stop-alarm-button");
const modeButtons = document.querySelectorAll(".mode-button");
const progressCircle = document.querySelector(".progress-value");

let mode = "focus";
let remainingSeconds = DURATIONS.focus;
let isRunning = false;
let intervalId = null;
let targetTime = null;
let rounds = loadTodayRounds();
let audioContext = null;
let alarmIntervalId = null;
let activeAlarmSources = [];
let isAlarming = false;
let alarmMessage = "";

progressCircle.style.strokeDasharray = String(CIRCUMFERENCE);

function todayKey() {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

function loadTodayRounds() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return stored?.date === todayKey() ? Number(stored.rounds) || 0 : 0;
  } catch {
    return 0;
  }
}

function saveTodayRounds() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayKey(), rounds }));
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function renderDots() {
  dotsElement.replaceChildren();
  const visibleRounds = Math.min(rounds, 10);

  for (let index = 0; index < visibleRounds; index += 1) {
    const dot = document.createElement("span");
    dot.className = "tomato-dot";
    dotsElement.append(dot);
  }
}

function render() {
  const formattedTime = formatTime(remainingSeconds);
  const duration = DURATIONS[mode];
  const progress = remainingSeconds / duration;

  timeElement.textContent = formattedTime;
  roundsElement.textContent = String(rounds);
  progressCircle.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - progress));
  document.title = isAlarming
    ? "⏰ 时间到 · Focus Tomato"
    : isRunning
      ? `${formattedTime} · Focus Tomato`
      : "Focus Tomato";
  document.body.classList.toggle("break-mode", mode !== "focus");

  modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === mode;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
    button.disabled = isAlarming;
  });

  toggleButton.hidden = isAlarming;
  resetButton.hidden = isAlarming;
  stopAlarmButton.hidden = !isAlarming;

  if (isAlarming) {
    statusElement.textContent = alarmMessage;
    renderDots();
    return;
  }

  if (isRunning) {
    toggleButton.textContent = "暂停";
    statusElement.textContent = MODE_COPY[mode].running;
  } else {
    toggleButton.textContent = remainingSeconds === DURATIONS[mode]
      ? MODE_COPY[mode].start
      : "继续";
    statusElement.textContent = MODE_COPY[mode].idle;
  }

  renderDots();
}

function stopTimer() {
  if (intervalId !== null) {
    window.clearInterval(intervalId);
    intervalId = null;
  }
  isRunning = false;
  targetTime = null;
}

function ensureAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;

  if (!audioContext || audioContext.state === "closed") {
    audioContext = new AudioContext();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function playAlarmMelody() {
  const context = ensureAudioContext();
  if (!context) return;

  const notes = [523.25, 659.25, 783.99, 659.25];
  const melodyStart = context.currentTime + 0.02;

  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const noteStart = melodyStart + index * 0.32;
    const noteEnd = noteStart + 0.72;

    oscillator.type = index % 2 === 0 ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(frequency, noteStart);
    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.exponentialRampToValueAtTime(0.16, noteStart + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(noteStart);
    oscillator.stop(noteEnd);
    activeAlarmSources.push(oscillator);
    oscillator.addEventListener("ended", () => {
      activeAlarmSources = activeAlarmSources.filter((source) => source !== oscillator);
    });
  });
}

function startAlarm(message) {
  if (isAlarming) return;
  isAlarming = true;
  alarmMessage = `${message} 点击“停止响铃”后铃声才会停止。`;
  playAlarmMelody();
  alarmIntervalId = window.setInterval(playAlarmMelody, 2500);
  render();
}

function stopAlarm() {
  if (alarmIntervalId !== null) {
    window.clearInterval(alarmIntervalId);
    alarmIntervalId = null;
  }

  activeAlarmSources.forEach((source) => {
    try {
      source.stop();
    } catch {
      // The note may already have ended.
    }
  });
  activeAlarmSources = [];
  isAlarming = false;
  alarmMessage = "";

  if (audioContext && audioContext.state !== "closed") {
    audioContext.close();
  }
  audioContext = null;
  render();
}

function completeCurrentMode() {
  const completedMode = mode;
  stopTimer();

  if (completedMode === "focus") {
    rounds += 1;
    saveTodayRounds();
    switchMode("break");
    startAlarm("完成一个番茄，现在休息 5 分钟。");
  } else {
    switchMode("focus");
    startAlarm(completedMode === "nap"
      ? "小憩结束，精神满格，准备下一轮专注。"
      : "休息结束，准备下一轮专注。");
  }
}

function updateTimer() {
  remainingSeconds = Math.max(0, Math.ceil((targetTime - Date.now()) / 1000));
  render();

  if (remainingSeconds === 0) {
    completeCurrentMode();
  }
}

function startTimer() {
  if (isRunning) return;
  ensureAudioContext();
  isRunning = true;
  targetTime = Date.now() + remainingSeconds * 1000;
  intervalId = window.setInterval(updateTimer, 250);
  render();
}

function pauseTimer() {
  if (!isRunning) return;
  remainingSeconds = Math.max(0, Math.ceil((targetTime - Date.now()) / 1000));
  stopTimer();
  render();
}

function resetTimer() {
  stopTimer();
  remainingSeconds = DURATIONS[mode];
  render();
}

function switchMode(nextMode) {
  stopTimer();
  mode = nextMode;
  remainingSeconds = DURATIONS[mode];
  render();
}

toggleButton.addEventListener("click", () => {
  if (isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
});

resetButton.addEventListener("click", resetTimer);
stopAlarmButton.addEventListener("click", stopAlarm);

modeButtons.forEach((button) => {
  button.addEventListener("click", () => switchMode(button.dataset.mode));
});

document.addEventListener("visibilitychange", () => {
  if (isRunning && document.visibilityState === "visible") {
    updateTimer();
  }
});

render();
