let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audioCtx) {
    audioCtx = new AudioCtx();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playTasbihClick(isTargetReached = false): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  if (isTargetReached) {
    // Warm double harmonic chime for completing 33/99/100 dhikr cycle
    osc.type = "sine";
    osc.frequency.setValueAtTime(528, now);
    osc.frequency.exponentialRampToValueAtTime(792, now + 0.14);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.46);
  } else {
    // Subtle organic wood/pearl bead click
    osc.type = "triangle";
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.045);
    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.055);
  }
}

export function playAdhanPreviewTone(voiceId: string): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Maqam Hijaz / Rast inspired gentle resonant chime sequence
  const scaleMap: Record<string, number[]> = {
    mishary: [293.66, 311.13, 369.99, 392.0], // D4 Eb4 F#4 G4 (Hijaz)
    abdulbasit: [261.63, 293.66, 329.63, 392.0], // C4 D4 E4 G4 (Bayati/Rast warmth)
    makkah: [329.63, 349.23, 415.3, 440.0], // E4 F4 G#4 A4
    madinah: [293.66, 329.63, 369.99, 440.0],
  };
  const notes = scaleMap[voiceId] ?? scaleMap.mishary;
  const now = ctx.currentTime;

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + i * 0.24;
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.linearRampToValueAtTime(0.12, start + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.55);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.56);
  });
}

export function triggerHaptic(durationMs = 15): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(durationMs);
    } catch {
      // Ignore if vibration blocked by browser policy
    }
  }
}
