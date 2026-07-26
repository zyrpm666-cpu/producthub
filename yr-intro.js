(function initializeYrIntro() {
  const intro = document.querySelector("#yr-intro");
  const skipButton = document.querySelector("#yr-intro-skip");
  const voiceButton = document.querySelector("#yr-intro-voice");
  const voiceLabel = voiceButton?.querySelector("b");
  const introTime = document.querySelector("#yr-intro-time");
  const status = document.querySelector("#yr-intro-status");
  const statusDetail = document.querySelector("#yr-intro-status-detail");

  if (!intro || !skipButton || !voiceButton || !voiceLabel) return;

  const greeting =
    "YR. It's great to see you. All systems are online. I hope everything goes smoothly for you today.";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const timers = [];
  let dismissed = false;
  let voiceStarted = false;
  let voiceFinished = false;
  let voiceAttempt = 0;
  let speechUtterance = null;

  document.body.classList.add("intro-running");

  function updateClock() {
    introTime.textContent = new Date().toLocaleTimeString("en-GB", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  function schedule(callback, delay) {
    const timer = window.setTimeout(callback, delay);
    timers.push(timer);
    return timer;
  }

  function setBootStatus(title, detail) {
    if (status) status.textContent = title;
    if (statusDetail) statusDetail.textContent = detail;
  }

  function selectEnglishVoice() {
    if (!("speechSynthesis" in window)) return null;

    const voices = window.speechSynthesis.getVoices();
    const preferredNames = [
      /daniel/i,
      /alex/i,
      /ryan/i,
      /guy/i,
      /google uk english male/i,
      /microsoft.*english/i,
      /samantha/i,
    ];

    for (const pattern of preferredNames) {
      const match = voices.find(
        (voice) => voice.lang.toLowerCase().startsWith("en") && pattern.test(voice.name),
      );
      if (match) return match;
    }

    return (
      voices.find((voice) => voice.lang.toLowerCase() === "en-gb") ||
      voices.find((voice) => voice.lang.toLowerCase() === "en-us") ||
      voices.find((voice) => voice.lang.toLowerCase().startsWith("en")) ||
      null
    );
  }

  function playBootChime() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const start = context.currentTime;
    const notes = [
      [174, 0, 0.52, 0.055],
      [261.63, 0.12, 0.62, 0.045],
      [392, 0.28, 0.78, 0.035],
      [783.99, 0.46, 0.66, 0.018],
    ];

    context.resume().then(() => {
      notes.forEach(([frequency, delay, duration, gain]) => {
        const oscillator = context.createOscillator();
        const volume = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, start + delay);
        oscillator.frequency.exponentialRampToValueAtTime(
          frequency * 1.015,
          start + delay + duration,
        );
        volume.gain.setValueAtTime(0.0001, start + delay);
        volume.gain.exponentialRampToValueAtTime(gain, start + delay + 0.05);
        volume.gain.exponentialRampToValueAtTime(0.0001, start + delay + duration);
        oscillator.connect(volume);
        volume.connect(context.destination);
        oscillator.start(start + delay);
        oscillator.stop(start + delay + duration + 0.04);
      });
      schedule(() => context.close(), 1600);
    });
  }

  function requestVoiceAttention() {
    if (dismissed || voiceStarted) return;
    intro.classList.add("needs-voice");
    voiceLabel.textContent = "Initialize voice";
    setBootStatus(
      "VOICE AUTHORIZATION REQUIRED",
      "Tap Initialize voice to hear your English AI briefing.",
    );
    voiceButton.focus({ preventScroll: true });
  }

  function speakGreeting({ withChime = false, userInitiated = false } = {}) {
    if (!("speechSynthesis" in window)) {
      voiceLabel.textContent = "Voice unavailable";
      voiceButton.disabled = true;
      setBootStatus("VOICE CHANNEL UNAVAILABLE", "Continue with Skip intro.");
      return false;
    }

    voiceAttempt += 1;
    intro.classList.remove("needs-voice");
    voiceButton.classList.add("is-connecting");
    voiceLabel.textContent = "Connecting voice";
    setBootStatus("OPENING VOICE CHANNEL", "Calibrating English AI assistant…");

    if (withChime) playBootChime();
    window.speechSynthesis.cancel();

    speechUtterance = new SpeechSynthesisUtterance(greeting);
    speechUtterance.lang = "en-GB";
    speechUtterance.rate = 0.82;
    speechUtterance.pitch = 0.68;
    speechUtterance.volume = 1;

    const selectedVoice = selectEnglishVoice();
    if (selectedVoice) {
      speechUtterance.voice = selectedVoice;
      speechUtterance.lang = selectedVoice.lang;
    }

    speechUtterance.onstart = () => {
      voiceStarted = true;
      voiceFinished = false;
      intro.classList.remove("needs-voice");
      voiceButton.classList.remove("is-connecting");
      voiceButton.classList.add("is-speaking");
      voiceLabel.textContent = "Voice online";
      setBootStatus("WELCOME PROTOCOL ACTIVE", "Cinematic English AI channel established.");
    };

    speechUtterance.onend = () => {
      voiceFinished = true;
      voiceButton.classList.remove("is-speaking");
      voiceLabel.textContent = "Replay voice";
      setBootStatus("ALL SYSTEMS NOMINAL", "Welcome complete. Opening your workspace…");
      schedule(() => dismissIntro(), prefersReducedMotion ? 250 : 950);
    };

    speechUtterance.onerror = () => {
      voiceStarted = false;
      voiceButton.classList.remove("is-connecting");
      voiceButton.classList.remove("is-speaking");
      if (!userInitiated) {
        requestVoiceAttention();
      } else {
        voiceLabel.textContent = "Try voice again";
        setBootStatus("VOICE CHANNEL INTERRUPTED", "Tap once more to retry the briefing.");
        intro.classList.add("needs-voice");
      }
    };

    window.speechSynthesis.speak(speechUtterance);

    schedule(() => {
      if (dismissed || voiceStarted || voiceFinished) return;
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      if (userInitiated && voiceAttempt < 3) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(speechUtterance);
      }
    }, 320);

    schedule(() => {
      if (!voiceStarted && !voiceFinished) requestVoiceAttention();
    }, userInitiated ? 1500 : 900);

    return true;
  }

  function dismissIntro({ cancelSpeech = false } = {}) {
    if (dismissed) return;
    dismissed = true;

    timers.forEach((timer) => window.clearTimeout(timer));
    if (cancelSpeech && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    intro.classList.add("is-leaving");
    document.body.classList.remove("intro-running");
    window.setTimeout(() => {
      intro.hidden = true;
    }, 760);
  }

  updateClock();
  const clockTimer = window.setInterval(updateClock, 1000);
  timers.push(clockTimer);

  schedule(
    () => setBootStatus("IDENTITY CONFIRMED", "Welcome, YR. Personal interface is ready."),
    prefersReducedMotion ? 120 : 1250,
  );
  schedule(
    () => setBootStatus("SYNCHRONIZING WORKSPACE", "Focus systems and live command modules online."),
    prefersReducedMotion ? 240 : 2850,
  );
  schedule(
    () => {
      if (!voiceStarted) {
        setBootStatus("VOICE CHANNEL STANDBY", "Awaiting English AI greeting…");
      }
    },
    prefersReducedMotion ? 360 : 4800,
  );

  schedule(() => {
    speakGreeting();
  }, prefersReducedMotion ? 80 : 1650);

  schedule(() => {
    if (!voiceStarted && !voiceFinished) requestVoiceAttention();
  }, prefersReducedMotion ? 700 : 6200);

  voiceButton.addEventListener("click", (event) => {
    event.stopPropagation();
    speakGreeting({ withChime: true, userInitiated: true });
  });

  skipButton.addEventListener("click", (event) => {
    event.stopPropagation();
    dismissIntro({ cancelSpeech: true });
  });

  intro.addEventListener(
    "pointerdown",
    (event) => {
      if (event.target.closest("button")) return;
      if (!voiceStarted) speakGreeting({ withChime: true, userInitiated: true });
    },
    { once: true },
  );

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !dismissed) {
      dismissIntro({ cancelSpeech: true });
    }
  });
})();
