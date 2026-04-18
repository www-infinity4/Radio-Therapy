/* ── Constants ───────────────────────────────────────────────── */
const C = 299_792_458; // speed of light, m/s

/* ── Utility helpers ─────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const fmt = (n, d = 3) => Number(n).toFixed(d);

/* ══════════════════════════════════════════════════════════════
   MOBILE NAV
══════════════════════════════════════════════════════════════ */
const navToggle = $('topbar') && document.querySelector('.nav-toggle');
const mobileMenu = $('mobile-menu');
if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!open));
    mobileMenu.hidden = open;
  });
  // Close when a link is clicked
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.hidden = true;
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   CALCULATOR 1 — Wavelength ↔ Frequency
══════════════════════════════════════════════════════════════ */
const c1Freq = $('c1-freq');
if (c1Freq) {
  const c1FreqDisp = $('c1-freq-disp');
  const c1Wl = $('c1-wl');
  function updateC1() {
    const fMHz = Number(c1Freq.value);
    const wl = C / (fMHz * 1e6);
    c1FreqDisp.textContent = fMHz.toFixed(1) + ' MHz';
    c1Wl.textContent = wl >= 1 ? fmt(wl) + ' m' : fmt(wl * 100, 2) + ' cm';
  }
  c1Freq.addEventListener('input', updateC1);
  updateC1();
}

/* ══════════════════════════════════════════════════════════════
   CALCULATOR 2 — Half-wave dipole
══════════════════════════════════════════════════════════════ */
const c2Freq = $('c2-freq');
if (c2Freq) {
  const c2FreqDisp = $('c2-freq-disp');
  const c2Len = $('c2-len');
  function updateC2() {
    const fMHz = Number(c2Freq.value);
    const len = 143 / fMHz; // metres, with 5% velocity factor
    c2FreqDisp.textContent = fMHz.toFixed(0) + ' MHz';
    c2Len.textContent = fmt(len) + ' m';
  }
  c2Freq.addEventListener('input', updateC2);
  updateC2();
}

/* ══════════════════════════════════════════════════════════════
   CALCULATOR 3 — Ohm's Law & Power
══════════════════════════════════════════════════════════════ */
const c3v = $('c3-v');
const c3i = $('c3-i');
if (c3v && c3i) {
  const c3p = $('c3-p');
  const c3r = $('c3-r');
  function updateC3() {
    const v = Math.max(0, Number(c3v.value) || 0);
    const i = Math.max(0, Number(c3i.value) || 0);
    c3p.textContent = fmt(v * i, 2) + ' W';
    c3r.textContent = i > 0 ? fmt(v / i, 2) + ' Ω' : '—';
  }
  c3v.addEventListener('input', updateC3);
  c3i.addEventListener('input', updateC3);
  updateC3();
}

/* ══════════════════════════════════════════════════════════════
   CALCULATOR 4 — dB ↔ Power ratio
══════════════════════════════════════════════════════════════ */
const c4db = $('c4-db');
if (c4db) {
  const c4DbDisp = $('c4-db-disp');
  const c4Ratio = $('c4-ratio');
  const c4Vratio = $('c4-vratio');
  function updateC4() {
    const db = Number(c4db.value);
    const pr = Math.pow(10, db / 10);
    const vr = Math.pow(10, db / 20);
    c4DbDisp.textContent = db.toFixed(1) + ' dB';
    c4Ratio.textContent = fmt(pr, 3) + '×';
    c4Vratio.textContent = fmt(vr, 3) + '×';
  }
  c4db.addEventListener('input', updateC4);
  updateC4();
}

/* ══════════════════════════════════════════════════════════════
   CALCULATOR 5 — Free-space path loss
══════════════════════════════════════════════════════════════ */
const c5d = $('c5-d');
const c5f = $('c5-f');
if (c5d && c5f) {
  const c5Fspl = $('c5-fspl');
  function updateC5() {
    const d = Math.max(1e-9, Number(c5d.value) || 1e-9);
    const f = Math.max(1e-9, Number(c5f.value) || 1e-9);
    // FSPL (dB) = 20·log10(d_km) + 20·log10(f_GHz) + 92.45
    const fspl = 20 * Math.log10(d) + 20 * Math.log10(f) + 92.45;
    c5Fspl.textContent = fmt(fspl, 1) + ' dB';
  }
  c5d.addEventListener('input', updateC5);
  c5f.addEventListener('input', updateC5);
  updateC5();
}

/* ══════════════════════════════════════════════════════════════
   CALCULATOR 6 — Skin depth in copper
   δ = sqrt(ρ / (π·f·μ))  ρ_Cu = 1.72e-8 Ω·m, μ = 4π×10⁻⁷
══════════════════════════════════════════════════════════════ */
const c6Freq = $('c6-freq');
if (c6Freq) {
  const c6FreqDisp = $('c6-freq-disp');
  const c6Skin = $('c6-skin');
  const RHO_CU = 1.72e-8;
  const MU = 4 * Math.PI * 1e-7;
  function updateC6() {
    const fMHz = Number(c6Freq.value);
    const fHz = fMHz * 1e6;
    const delta = Math.sqrt(RHO_CU / (Math.PI * fHz * MU)); // metres
    c6FreqDisp.textContent = fMHz.toFixed(1) + ' MHz';
    c6Skin.textContent = fmt(delta * 1e6, 2) + ' μm';
  }
  c6Freq.addEventListener('input', updateC6);
  updateC6();
}

/* ══════════════════════════════════════════════════════════════
   HERO CANVAS — animated sine wave
══════════════════════════════════════════════════════════════ */
(function heroCanvas() {
  const canvas = $('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, raf;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = 300 * devicePixelRatio;
    canvas.style.height = '300px';
    w = canvas.width; h = canvas.height;
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, w, h);

    // Draw 3 offset sine waves with different colours/speeds
    const waves = [
      { color: 'rgba(57,232,255,0.7)', freq: 1.5, amp: 0.25, speed: 0.8, phase: 0 },
      { color: 'rgba(107,159,255,0.5)', freq: 2.5, amp: 0.15, speed: 1.2, phase: 1 },
      { color: 'rgba(168,127,255,0.4)', freq: 0.8, amp: 0.18, speed: 0.5, phase: 2 },
    ];

    waves.forEach(({ color, freq, amp, speed, phase }) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2 * devicePixelRatio;
      for (let x = 0; x <= w; x++) {
        const y = h / 2 + Math.sin((x / w) * Math.PI * 2 * freq + t * speed + phase) * (h * amp);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    // Centre glow
    const grd = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, h * 0.5);
    grd.addColorStop(0, 'rgba(57,232,255,0.08)');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    t += 0.025;
    raf = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); });
  resize();
  draw();
})();

/* ══════════════════════════════════════════════════════════════
   SPECTRUM CANVAS
══════════════════════════════════════════════════════════════ */
(function spectrumCanvas() {
  const canvas = $('spectrumCanvas');
  const tooltip = $('specTooltip');
  if (!canvas || !tooltip) return;
  const ctx = canvas.getContext('2d');

  const BANDS = [
    { label: 'ELF / VLF', range: '3 Hz – 30 kHz',  use: 'Submarine comms, power grid', color: '#4ade80' },
    { label: 'LF / MF',   range: '30 kHz – 3 MHz',  use: 'AM broadcast, maritime radio', color: '#86efac' },
    { label: 'HF',        range: '3 – 30 MHz',       use: 'Shortwave, amateur radio',     color: '#fbbf24' },
    { label: 'VHF',       range: '30 – 300 MHz',     use: 'FM radio, TV, aircraft ATC',   color: '#f97316' },
    { label: 'UHF',       range: '300 MHz – 3 GHz',  use: 'Mobile, Wi-Fi, TV, GPS',       color: '#ef4444' },
    { label: 'SHF',       range: '3 – 30 GHz',       use: 'Radar, satellite, 5G',         color: '#a855f7' },
    { label: 'EHF',       range: '30 – 300 GHz',     use: 'Millimetre wave, imaging',     color: '#ec4899' },
    { label: 'Infrared',  range: '300 GHz – 400 THz', use: 'Thermal imaging, remote controls', color: '#f43f5e' },
    { label: 'Visible',   range: '400 – 700 THz',    use: 'Light we can see',             color: 'linear-gradient(90deg,#f97316,#facc15,#4ade80,#38bdf8,#818cf8)' },
    { label: 'UV / X-ray / γ', range: '> 700 THz',  use: 'Medical imaging, sterilisation', color: '#818cf8' },
  ];

  let w, h;
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = 180 * devicePixelRatio;
    canvas.style.height = '180px';
    w = canvas.width; h = canvas.height;
    draw();
  }

  let hoverIdx = -1;

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const bw = w / BANDS.length;

    BANDS.forEach((b, i) => {
      const x = i * bw;
      // Fill
      if (b.color.startsWith('linear')) {
        const grd = ctx.createLinearGradient(x, 0, x + bw, 0);
        grd.addColorStop(0, '#f97316'); grd.addColorStop(0.2, '#facc15');
        grd.addColorStop(0.4, '#4ade80'); grd.addColorStop(0.7, '#38bdf8');
        grd.addColorStop(1, '#818cf8');
        ctx.fillStyle = grd;
      } else {
        ctx.fillStyle = b.color + (hoverIdx === i ? 'ff' : '99');
      }
      const barH = hoverIdx === i ? h * 0.82 : h * 0.65;
      const y = h - barH - h * 0.12;
      const radius = 6 * devicePixelRatio;
      ctx.beginPath();
      ctx.roundRect(x + 2, y, bw - 4, barH, radius);
      ctx.fill();

      // Label
      ctx.fillStyle = hoverIdx === i ? '#fff' : 'rgba(255,255,255,0.7)';
      ctx.font = `${hoverIdx === i ? 600 : 400} ${10 * devicePixelRatio}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(b.label, x + bw / 2, h - 4);
    });

    // Frequency arrow label
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = `${9 * devicePixelRatio}px Inter, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('← lower frequency / longer λ', 6, 4);
    ctx.textAlign = 'right';
    ctx.fillText('higher frequency / shorter λ →', w - 6, 4);
  }

  function getIdx(clientX) {
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width * BANDS.length;
    return Math.floor(Math.min(Math.max(x, 0), BANDS.length - 1));
  }

  function onMove(clientX) {
    hoverIdx = getIdx(clientX);
    const b = BANDS[hoverIdx];
    tooltip.textContent = `${b.label} · ${b.range} · ${b.use}`;
    draw();
  }

  canvas.addEventListener('mousemove', e => onMove(e.clientX));
  canvas.addEventListener('touchmove', e => { e.preventDefault(); onMove(e.touches[0].clientX); }, { passive: false });
  canvas.addEventListener('mouseleave', () => { hoverIdx = -1; tooltip.textContent = 'Hover a band for details'; draw(); });

  window.addEventListener('resize', resize);
  resize();
  tooltip.textContent = 'Hover a band for details';
})();

/* ══════════════════════════════════════════════════════════════
   WAVEFORM CANVAS
══════════════════════════════════════════════════════════════ */
(function waveCanvas() {
  const canvas = $('waveCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h;

  const ampSlider  = $('wv-amp');
  const freqSlider = $('wv-freq');
  const typeSelect = $('wv-type');
  const ampVal     = $('wv-amp-val');
  const freqVal    = $('wv-freq-val');

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width * devicePixelRatio;
    canvas.height = 200 * devicePixelRatio;
    w = canvas.width; h = canvas.height;
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, w, h);

    const amp  = Number(ampSlider.value);
    const freq = Number(freqSlider.value);
    const type = typeSelect.value;

    // Centre line
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();

    // Wave
    ctx.beginPath();
    ctx.strokeStyle = '#39e8ff';
    ctx.lineWidth = 2.5 * devicePixelRatio;
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#39e8ff';

    const samples = w;
    for (let i = 0; i <= samples; i++) {
      const x = i;
      const phase = (i / samples) * Math.PI * 2 * freq + t;
      let y;
      switch (type) {
        case 'am': {
          const carrier = Math.sin(phase * 4);
          const mod = (1 + 0.6 * Math.sin(phase)) * 0.5 + 0.5;
          y = h / 2 - carrier * mod * amp * h * 0.35;
          break;
        }
        case 'fm': {
          const mod = Math.sin(phase * 0.5);
          y = h / 2 - Math.sin(phase + 2 * mod) * amp * h * 0.35;
          break;
        }
        case 'square': {
          y = h / 2 - (Math.sin(phase) >= 0 ? 1 : -1) * amp * h * 0.35;
          break;
        }
        default: // sine
          y = h / 2 - Math.sin(phase) * amp * h * 0.35;
      }
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    t += 0.04;
    requestAnimationFrame(draw);
  }

  function syncLabels() {
    ampVal.textContent  = Number(ampSlider.value).toFixed(1);
    freqVal.textContent = Number(freqSlider.value).toFixed(1) + '×';
  }

  if (ampSlider)  ampSlider.addEventListener('input', syncLabels);
  if (freqSlider) freqSlider.addEventListener('input', syncLabels);
  syncLabels();

  window.addEventListener('resize', () => { resize(); });
  resize();
  draw();
})();


/* ══════════════════════════════════════════════════════════════
   MODULATION CANVAS
══════════════════════════════════════════════════════════════ */
(function modCanvas() {
  const canvas = $('modCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h;

  const typeSelect  = $('mod-type');
  const speedSlider = $('mod-speed');
  const speedVal    = $('mod-speed-val');
  const factEl      = $('modFact');

  const FACTS = {
    carrier: '💡 Pure carrier: constant amplitude and frequency — no information encoded.',
    am:      '💡 AM: the envelope (height) tracks the audio. Noise affects amplitude — hence AM sounds hissier than FM.',
    fm:      '💡 FM: cycles bunch together when the tone is high, spread when low. Noise does not affect frequency, so FM is cleaner.',
    pm:      '💡 PM: the phase (timing of zero-crossings) shifts with the signal. FM is essentially integrated PM.',
    bpsk:    '💡 BPSK: the wave flips 180° to encode a 0 or 1. Each flip = one bit. Carrier amplitude stays constant.',
  };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width * devicePixelRatio;
    canvas.height = 180 * devicePixelRatio;
    w = canvas.width; h = canvas.height;
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, w, h);
    const type  = typeSelect  ? typeSelect.value        : 'am';
    const speed = speedSlider ? Number(speedSlider.value) : 1;

    // Centre line
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, h/2); ctx.lineTo(w, h/2); ctx.stroke();

    // Ghost carrier
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i <= w; i++) {
      const y = h/2 - Math.sin((i/w)*Math.PI*2*4*speed + t) * h * 0.28;
      i === 0 ? ctx.moveTo(i, y) : ctx.lineTo(i, y);
    }
    ctx.stroke();

    // Modulated signal
    ctx.beginPath();
    ctx.strokeStyle = '#39e8ff';
    ctx.lineWidth = 2.5 * devicePixelRatio;
    ctx.shadowBlur = 10; ctx.shadowColor = '#39e8ff';

    for (let i = 0; i <= w; i++) {
      const x = i / w;
      const phase    = x * Math.PI * 2 * 4 * speed + t;
      const modPhase = x * Math.PI * 2 * speed + t * 0.3;
      let y;
      switch (type) {
        case 'carrier': y = h/2 - Math.sin(phase) * h * 0.28; break;
        case 'am': {
          const env = 0.5 + 0.45 * Math.sin(modPhase);
          y = h/2 - Math.sin(phase) * env * h * 0.52;
          break;
        }
        case 'fm': {
          const dev = Math.sin(modPhase) * 1.8 * speed;
          y = h/2 - Math.sin(x * Math.PI * 2 * 4 * (1 + dev) + t) * h * 0.28;
          break;
        }
        case 'pm': {
          y = h/2 - Math.sin(phase + Math.sin(modPhase) * Math.PI * speed) * h * 0.28;
          break;
        }
        case 'bpsk': {
          const bit = Math.floor(x * 8) % 2;
          y = h/2 - Math.sin(phase) * h * 0.28 * (bit === 0 ? 1 : -1);
          break;
        }
        default: y = h/2 - Math.sin(phase) * h * 0.28;
      }
      i === 0 ? ctx.moveTo(i, y) : ctx.lineTo(i, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    t += 0.03;
    requestAnimationFrame(draw);
  }

  if (speedSlider) speedSlider.addEventListener('input', () => {
    if (speedVal) speedVal.textContent = Number(speedSlider.value).toFixed(1) + '×';
  });
  if (typeSelect) typeSelect.addEventListener('change', () => {
    if (factEl) factEl.textContent = FACTS[typeSelect.value] || '';
  });

  window.addEventListener('resize', resize);
  resize(); draw();
})();

/* ══════════════════════════════════════════════════════════════
   dB SCALE CANVAS
══════════════════════════════════════════════════════════════ */
(function dbVis() {
  const canvas = $('dbCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h;
  const slider = $('c4-db');

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width * devicePixelRatio;
    canvas.height = 90 * devicePixelRatio;
    w = canvas.width; h = canvas.height;
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const db    = slider ? Number(slider.value) : 0;
    const ratio = Math.pow(10, db / 10);
    const maxW  = w - 8;
    const refW  = maxW * 0.5;
    const sigW  = db >= 0
      ? Math.min(maxW, refW * Math.min(ratio, 1) + (ratio > 1 ? refW * Math.log10(Math.min(ratio, 10000)) / 4 : 0))
      : refW * Math.max(0.01, ratio);
    const bH = h * 0.3;
    const y1 = h * 0.08, y2 = h * 0.52;

    // Reference
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath(); ctx.roundRect(4, y1, refW, bH, 4); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = `${9 * devicePixelRatio}px Inter, sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillText('Reference (0 dB)', 8, y1 + bH + 3);

    // Signal
    const col = db >= 0 ? '#39e8ff' : '#f97316';
    ctx.fillStyle = col + '40';
    ctx.beginPath(); ctx.roundRect(4, y2, sigW, bH, 4); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(4, y2, sigW, bH, 4); ctx.stroke();
    ctx.fillStyle = col;
    const ratioStr = ratio >= 1000 ? ratio.toFixed(0) + '×' : ratio.toFixed(3) + '×';
    ctx.fillText(`${db >= 0 ? '+' : ''}${db.toFixed(1)} dB = ${ratioStr} power`, 8, y2 + bH + 3);
  }

  if (slider) slider.addEventListener('input', draw);
  window.addEventListener('resize', () => { resize(); draw(); });
  resize(); draw();
})();

/* ══════════════════════════════════════════════════════════════
   LC RESONANT FREQUENCY
══════════════════════════════════════════════════════════════ */
function setupLC(lId, cId, outId) {
  const lIn = $(lId), cIn = $(cId), out = $(outId);
  if (!lIn || !cIn || !out) return;
  function u() {
    const L = Math.max(1e-20, Number(lIn.value) || 1e-20) * 1e-6;
    const C = Math.max(1e-20, Number(cIn.value) || 1e-20) * 1e-12;
    const f = 1 / (2 * Math.PI * Math.sqrt(L * C));
    out.textContent = f >= 1e9 ? (f/1e9).toFixed(3)+' GHz'
                    : f >= 1e6 ? (f/1e6).toFixed(3)+' MHz'
                    : f >= 1e3 ? (f/1e3).toFixed(1)+' kHz'
                    : f.toFixed(1)+' Hz';
  }
  lIn.addEventListener('input', u); cIn.addEventListener('input', u); u();
}
setupLC('lc-l',  'lc-c',  'lc-f0');
setupLC('lc2-l', 'lc2-c', 'lc2-f0');

/* ══════════════════════════════════════════════════════════════
   DUPLICATE CALCULATOR INSTANCES
══════════════════════════════════════════════════════════════ */
function setupDipole(sliderId, dispId, lenId, armId) {
  const s = $(sliderId);
  if (!s) return;
  function u() {
    const f = Number(s.value), l = 142.5 / f;
    const d = $(dispId), le = $(lenId), ar = $(armId);
    if (d)  d.textContent  = f.toFixed(0) + ' MHz';
    if (le) le.textContent = fmt(l) + ' m';
    if (ar) ar.textContent = fmt(l/2) + ' m';
  }
  s.addEventListener('input', u); u();
}
setupDipole('c2b-freq', 'c2b-freq-disp', 'c2b-len', null);

function setupDB2(sliderId, dispId, ratioId, vratioId) {
  const s = $(sliderId);
  if (!s) return;
  function u() {
    const db = Number(s.value);
    const d = $(dispId), r = $(ratioId), v = $(vratioId);
    if (d) d.textContent = db.toFixed(1) + ' dB';
    if (r) r.textContent = fmt(Math.pow(10, db/10), 3) + '×';
    if (v) v.textContent = fmt(Math.pow(10, db/20), 3) + '×';
  }
  s.addEventListener('input', u); u();
}
setupDB2('c4b-db', 'c4b-db-disp', 'c4b-ratio', 'c4b-vratio');

function setupFSPL(dId, fId, outId) {
  const dIn = $(dId), fIn = $(fId), out = $(outId);
  if (!dIn || !fIn || !out) return;
  function u() {
    const d = Math.max(1e-9, Number(dIn.value)||1e-9);
    const f = Math.max(1e-9, Number(fIn.value)||1e-9);
    out.textContent = fmt(20*Math.log10(d)+20*Math.log10(f)+92.45, 1)+' dB';
  }
  dIn.addEventListener('input', u); fIn.addEventListener('input', u); u();
}
setupFSPL('c5b-d', 'c5b-f', 'c5b-fspl');

function setupOhms2(vId, iId, pId, rId) {
  const v = $(vId), i = $(iId);
  if (!v || !i) return;
  function u() {
    const V = Math.max(0, Number(v.value)||0), I = Math.max(0, Number(i.value)||0);
    const p = $(pId), r = $(rId);
    if (p) p.textContent = fmt(V*I,2)+' W';
    if (r) r.textContent = I>0 ? fmt(V/I,2)+' Ω' : '—';
  }
  v.addEventListener('input', u); i.addEventListener('input', u); u();
}
setupOhms2('c3b-v', 'c3b-i', 'c3b-p', 'c3b-r');
