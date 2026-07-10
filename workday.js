const todayText = document.querySelector("#today-text");
const startButton = document.querySelector("#start-button");
const dailyMantra = document.querySelector("#daily-mantra");
const energyScore = document.querySelector("#energy-score");
const energyNote = document.querySelector("#energy-note");

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

function renderToday() {
  const now = new Date();
  const dateText = `${weekdayNames[now.getDay()]}, ${monthNames[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  todayText.textContent = `${dateText} · A fresh start`;
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
pickDailyMantra();
