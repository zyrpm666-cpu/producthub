const todayText = document.querySelector("#today-text");
const heroTitle = document.querySelector("#hero-title");
const heroSubtitle = document.querySelector("#hero-subtitle");
const startButton = document.querySelector("#start-button");
const dailyMantra = document.querySelector("#daily-mantra");
const energyScore = document.querySelector("#energy-score");
const energyFill = document.querySelector("#energy-fill");
const energyNote = document.querySelector("#energy-note");
const resetEnergyButton = document.querySelector("#reset-energy-button");

const SLOGAN_REFRESH_INTERVAL = 5 * 60 * 1000;
const ENERGY_DRAIN_INTERVAL = 60 * 1000;
const ENERGY_DRAIN_STEP = 1;
const ENERGY_RESET_BOOST = 8;

const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const mantras = [
  "I will move through today with clarity, steadiness, and action.",
  "Follow the main thread first. Less hesitation, more forward motion.",
  "Give your attention to what truly matters; clarity will come through action.",
  "It does not need to be perfect. It only needs to begin.",
];

const slogans = [
  {
    title: "New day. Fresh start.",
    subtitle: "Show up bright. Clear the noise. Move what matters with steady focus.",
  },
  {
    title: "Rise clear. Work bright.",
    subtitle: "Bring your best energy to the first meaningful step.",
  },
  {
    title: "Start light. Move strong.",
    subtitle: "A calm mind, a clean desk, and one priority in motion.",
  },
  {
    title: "Begin with intention.",
    subtitle: "Choose the signal over the noise and let momentum build.",
  },
  {
    title: "Fresh mind. Full power.",
    subtitle: "Step into the day awake, steady, and ready to create.",
  },
  {
    title: "One morning. One mission.",
    subtitle: "Protect your attention and give the day a clear direction.",
  },
];

let currentSloganIndex = -1;
let currentEnergy = 100;
let energyIntervalId = null;

function renderToday() {
  const now = new Date();
  const dateText = `${weekdayNames[now.getDay()]}, ${monthNames[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  todayText.textContent = `${dateText} · A fresh start`;
}

function pickRandomSlogan() {
  if (slogans.length === 0) return;

  let nextIndex = Math.floor(Math.random() * slogans.length);

  if (slogans.length > 1) {
    while (nextIndex === currentSloganIndex) {
      nextIndex = Math.floor(Math.random() * slogans.length);
    }
  }

  currentSloganIndex = nextIndex;
  heroTitle.textContent = slogans[nextIndex].title;
  heroSubtitle.textContent = slogans[nextIndex].subtitle;
}

function energyNoteFor(score) {
  if (score >= 85) {
    return "Fully charged. Use this clear window for your most important work.";
  }

  if (score >= 65) {
    return "Good energy. Keep the pace steady and protect your attention.";
  }

  if (score >= 40) {
    return "Energy is dipping. A short reset can help you return sharper.";
  }

  return "Low battery. Step away for a real break before pushing harder.";
}

function renderEnergy() {
  const roundedEnergy = Math.round(currentEnergy);

  energyScore.textContent = String(roundedEnergy);
  energyFill.style.width = `${roundedEnergy}%`;
  energyNote.textContent = energyNoteFor(roundedEnergy);
  document.documentElement.style.setProperty("--energy-level", `${roundedEnergy}%`);
  document.body.classList.toggle("low-energy", roundedEnergy < 45);
}

function drainEnergy() {
  currentEnergy = Math.max(20, currentEnergy - ENERGY_DRAIN_STEP);
  renderEnergy();
}

function pickDailyMantra() {
  const now = new Date();
  const index = now.getDate() % mantras.length;
  dailyMantra.textContent = mantras[index];
}

function startToday() {
  document.body.classList.add("is-started");
  startButton.textContent = "Working";
  startButton.disabled = true;
  currentEnergy = 100;
  renderEnergy();

  if (energyIntervalId !== null) {
    window.clearInterval(energyIntervalId);
  }

  energyIntervalId = window.setInterval(drainEnergy, ENERGY_DRAIN_INTERVAL);
  window.setTimeout(drainEnergy, 900);
}

function resetEnergy() {
  currentEnergy = Math.min(100, currentEnergy + ENERGY_RESET_BOOST);
  renderEnergy();
  energyNote.textContent = currentEnergy === 100
    ? "Back to full charge. Choose one priority and begin again."
    : "Nice reset. Take one breath, then return to the next clear step.";
}

startButton.addEventListener("click", startToday);
resetEnergyButton.addEventListener("click", resetEnergy);

renderToday();
pickRandomSlogan();
pickDailyMantra();
renderEnergy();
window.setInterval(pickRandomSlogan, SLOGAN_REFRESH_INTERVAL);
