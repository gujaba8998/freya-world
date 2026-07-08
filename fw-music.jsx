/* fw-music.jsx — cute music-box background loop, generated with WebAudio (no audio files)
   A gentle original lullaby in C pentatonic, 84 BPM, soft triangle "music box" plucks. */
(function () {
  const N = {
    C3: 130.81, F3: 174.61, G3: 196.00, A3: 220.00,
    C4: 261.63, E4: 329.63, G4: 392.00, A4: 440.00,
    C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.00,
  };
  // ---- Song library (32 eighth-note steps per loop) ----
  const TRACKS = [
    {
      id: 'lullaby', th: 'กล่องดนตรี', emoji: '🌙', bpm: 84,
      melody: [
        N.C5, null, N.E5, null, N.G5, null, N.A5, N.G5,
        N.E5, null, N.C5, null, N.D5, null, N.E5, null,
        N.G5, null, N.E5, null, N.D5, null, N.C5, N.D5,
        N.E5, null, N.D5, null, N.C5, null, null, null,
      ],
      bass: { 0: N.C3, 8: N.A3, 16: N.F3, 24: N.G3 },
      chime: { 4: N.G4, 12: N.C4, 20: N.A4, 28: N.E4 },
    },
    {
      id: 'twinkle', th: 'ดาวระยิบ', emoji: '⭐', bpm: 96,
      melody: [
        N.C5, N.C5, N.G5, N.G5, N.A5, N.A5, N.G5, null,
        N.F3+N.C4-N.C4, null, null, null, null, null, null, null, // placeholder cleaned below
        N.E5, N.E5, N.D5, N.D5, N.C5, null, null, null,
        N.G5, N.G5, N.E5, N.E5, N.D5, N.D5, N.C5, null,
      ],
      bass: { 0: N.C3, 8: N.F3, 16: N.C3, 24: N.G3 },
      chime: { 6: N.E4, 14: N.A4, 22: N.G4, 30: N.C4 },
    },
    {
      id: 'waltz', th: 'วอลทซ์น้อย', emoji: '🌸', bpm: 120,
      melody: [
        N.E5, null, null, N.G5, null, N.C5, null, null,
        N.A4, null, null, N.C5, null, N.E5, null, null,
        N.D5, null, null, N.G4, null, N.D5, null, null,
        N.C5, null, null, N.E5, null, null, N.G5, null,
      ],
      bass: { 0: N.C3, 6: N.G3, 12: N.A3, 18: N.G3, 24: N.C3 },
      chime: { 3: N.C4, 15: N.G4, 27: N.E4 },
    },
  ];
  // clean twinkle placeholder
  TRACKS[1].melody[8] = null;

  let trackIdx = 0;
  let MELODY = TRACKS[0].melody, BASS = TRACKS[0].bass, CHIME = TRACKS[0].chime;
  let STEP = 60 / TRACKS[0].bpm / 2;

  function applyTrack(i) {
    trackIdx = ((i % TRACKS.length) + TRACKS.length) % TRACKS.length;
    const T = TRACKS[trackIdx];
    MELODY = T.melody; BASS = T.bass; CHIME = T.chime; STEP = 60 / T.bpm / 2;
  }

  let ctx = null, master = null, timer = null, step = 0, nextT = 0, on = false;
  const LEVEL = 0.14;
  let stopTimer = null;   // hard-stops the oscillator graph after the fade completes
  let voices = [];        // currently scheduled note voices (so we can silence them on stop/switch)

  function ensure() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
  }

  // music-box pluck: triangle + quiet octave sine, fast attack, long soft decay
  function pluck(freq, t, vol, dur) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = freq;
    const o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine'; o2.frequency.value = freq * 2; g2.gain.value = 0.35;
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(master);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur + 0.05);
    o2.start(t); o2.stop(t + dur + 0.05);
    const v = { o, o2, g };
    voices.push(v);
    o.onended = () => { const k = voices.indexOf(v); if (k > -1) voices.splice(k, 1); };
  }

  // immediately silence every ringing/pending note (prevents overlap on stop or track switch)
  function killVoices() {
    const t = ctx ? ctx.currentTime : 0;
    voices.forEach(({ o, o2, g }) => {
      try {
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
        o.stop(t + 0.1); o2.stop(t + 0.1);
      } catch (e) { /* already stopped */ }
    });
    voices = [];
  }

  function tick() {
    if (!on) return;
    while (nextT < ctx.currentTime + 0.6) {
      const i = step % 32;
      const m = MELODY[i]; if (m) pluck(m, nextT, 0.30, 1.4);
      const b = BASS[i];   if (b) pluck(b, nextT, 0.16, 2.2);
      const c = CHIME[i];  if (c) pluck(c, nextT, 0.10, 1.6);
      nextT += STEP; step++;
    }
  }

  function musicStart() {
    try {
      ensure();
      if (stopTimer) { clearTimeout(stopTimer); stopTimer = null; }
      if (on) return;          // already playing — never stack a second loop
      if (timer) { clearInterval(timer); timer = null; }
      killVoices();            // clear any leftover ringing notes from a recent stop
      on = true;
      step = 0; nextT = ctx.currentTime + 0.1;
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(0.0001, t);
      master.gain.exponentialRampToValueAtTime(LEVEL, t + 1.2); // gentle fade-in
      timer = setInterval(tick, 250);
      tick();
    } catch (e) { /* WebAudio unavailable */ }
  }

  function musicStop() {
    if (!ctx || !master) return;
    on = false;
    clearInterval(timer); timer = null;   // stop scheduling NEW notes
    const t = ctx.currentTime;
    // deterministic fade: hold current level, then linear ramp to silence in 0.8s
    master.gain.cancelScheduledValues(t);
    if (master.gain.cancelAndHoldAtTime) master.gain.cancelAndHoldAtTime(t);
    else master.gain.setValueAtTime(LEVEL, t);
    master.gain.linearRampToValueAtTime(0.0001, t + 0.8);
    if (stopTimer) clearTimeout(stopTimer);
    stopTimer = setTimeout(() => {
      if (!on && ctx) {
        killVoices();
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(0.0001, ctx.currentTime);
        ctx.suspend();   // hard-guarantee: whole audio graph goes silent
      }
      stopTimer = null;
    }, 900);
  }

  // Switch song; if playing, restart the loop seamlessly on the new track
  function musicSetTrack(i) {
    applyTrack(i);
    if (on && ctx) { killVoices(); step = 0; nextT = ctx.currentTime + 0.05; }
  }

  window.musicStart = musicStart;
  window.musicStop = musicStop;
  window.musicSetTrack = musicSetTrack;
  window.musicTracks = TRACKS.map(t => ({ id: t.id, th: t.th, emoji: t.emoji }));
})();
