const todayText = document.querySelector("#today-text");
const heroTitle = document.querySelector("#hero-title");
const heroSubtitle = document.querySelector("#hero-subtitle");
const energyScore = document.querySelector("#energy-score");
const energyFill = document.querySelector("#energy-fill");
const energyNote = document.querySelector("#energy-note");

const SLOGAN_REFRESH_INTERVAL = 5 * 60 * 1000;
const ENERGY_REFRESH_INTERVAL = 30 * 1000;
const ENERGY_START_HOUR = 10;
const ENERGY_START_MINUTE = 0;
const ENERGY_END_HOUR = 21;
const ENERGY_END_MINUTE = 30;

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
    return "The day window is still fresh. Use this clear stretch for your most important work.";
  }

  if (score >= 65) {
    return "Plenty of time remains. Keep the pace steady and protect your attention.";
  }

  if (score >= 40) {
    return "The workday is moving. Choose one important thing and keep it in motion.";
  }

  if (score > 0) {
    return "The day is closing. Wrap the loose ends and leave tomorrow a clean starting point.";
  }

  return "The workday window is complete. Let the system cool down and protect your evening.";
}

function getTodayTime(hour, minute) {
  const time = new Date();
  time.setHours(hour, minute, 0, 0);
  return time;
}

function calculateTimeEnergy(now = new Date()) {
  const start = getTodayTime(ENERGY_START_HOUR, ENERGY_START_MINUTE);
  const end = getTodayTime(ENERGY_END_HOUR, ENERGY_END_MINUTE);

  if (now < start) {
    return 100;
  }

  if (now >= end) {
    return 0;
  }

  const totalWindow = end.getTime() - start.getTime();
  const remainingWindow = end.getTime() - now.getTime();
  return Math.max(0, Math.min(100, (remainingWindow / totalWindow) * 100));
}

function renderEnergy() {
  const roundedEnergy = Math.round(calculateTimeEnergy());

  energyScore.textContent = String(roundedEnergy);
  energyFill.style.width = `${roundedEnergy}%`;
  energyNote.textContent = energyNoteFor(roundedEnergy);
  document.documentElement.style.setProperty("--energy-level", `${roundedEnergy}%`);
  document.body.classList.toggle("low-energy", roundedEnergy < 45);
}

renderToday();
pickRandomSlogan();
renderEnergy();
window.setInterval(pickRandomSlogan, SLOGAN_REFRESH_INTERVAL);
window.setInterval(renderEnergy, ENERGY_REFRESH_INTERVAL);
