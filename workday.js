const todayText = document.querySelector("#today-text");
const heroTitle = document.querySelector("#hero-title");
const heroSubtitle = document.querySelector("#hero-subtitle");
const startButton = document.querySelector("#start-button");
const dailyMantra = document.querySelector("#daily-mantra");
const energyScore = document.querySelector("#energy-score");
const energyNote = document.querySelector("#energy-note");

const SLOGAN_REFRESH_INTERVAL = 5 * 60 * 1000;

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

function pickDailyMantra() {
  const now = new Date();
  const index = now.getDate() % mantras.length;
  dailyMantra.textContent = mantras[index];
}

function startToday() {
  document.body.classList.add("is-started");
  startButton.textContent = "You’re On";
  energyScore.textContent = "120";
  energyNote.textContent = "Your day is switched on. Pick the most important thing and move it forward for 25 minutes.";
}

startButton.addEventListener("click", startToday);

renderToday();
pickRandomSlogan();
pickDailyMantra();
window.setInterval(pickRandomSlogan, SLOGAN_REFRESH_INTERVAL);
