/**
 * NEON SURGE | Cyber Velocity Arcade Engine v5.0
 * Generous 120px Safe Gaps, Center Pillar Barriers (Rewarding Wall Play) & Balanced Flow.
 */

// ==========================================
// 1. Web Audio Synthesizer Engine
// ==========================================
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playOrb() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1174.66, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  }

  playPowerup() {
    if (!this.enabled || !this.ctx) return;
    try {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.04);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + (i + 1) * 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.04);
        osc.stop(this.ctx.currentTime + (i + 1) * 0.08);
      });
    } catch (e) {}
  }

  playCrash() {
    if (!this.enabled || !this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.35);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      whiteNoise.start();
    } catch (e) {}
  }

  playBoost() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, this.ctx.currentTime + 0.28);
      gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.28);
    } catch (e) {}
  }
}

// ==========================================
// 2. Ships & Custom Skins Data
// ==========================================
const SHIP_SKINS = [
  { id: 'apex_dart', name: 'APEX DART', color: '#00f0ff', accent: '#ff0077', cost: 0, desc: 'Balanced interceptor with dual plasma thrusters.' },
  { id: 'amongus', name: 'SUSSY CREWMATE', color: '#ff2255', accent: '#00f0ff', cost: 15, desc: 'Red impostor astronaut with cyan reflective visor.' },
  { id: 'benjamin', name: 'BENJAMIN', color: '#c48b4b', accent: '#ffd700', cost: 25, desc: 'Sophisticated cyber hound with golden monocle & chemistry thrusters.' },
  { id: 'bobik_dog', name: 'BOBIK THE DOG', color: '#ffe600', accent: '#ff8800', cost: 20, desc: 'Cyber-canine companion with floppy ears & paw laser trails.' },
  { id: 'otritzanie68', name: 'OTRITZANIE 68', color: '#00f0ff', accent: '#ffe600', cost: 35, desc: 'Legendary pilot cockpit powered by hyper-drive photo aura.', isCustomPhoto: true },
  { id: 'void_phantom', name: 'VOID PHANTOM', color: '#9d00ff', accent: '#ff00aa', cost: 50, desc: 'Stealth-crafted chassis with hyper-flux shielding.' },
  { id: 'solar_flare', name: 'SOLAR FLARE', color: '#ff4400', accent: '#ffe600', cost: 80, desc: 'Heavy particle radiator and magnetic intake aura.' },
  { id: 'matrix_core', name: 'MATRIX GHOST', color: '#00ff66', accent: '#00ffff', cost: 120, desc: 'High-frequency cyber rig engineered for maximum velocity.' }
];

// ==========================================
// 3. Dynamic Map Zones (50,000 Point Milestones)
// ==========================================
const ZONES = [
  {
    id: 1,
    name: 'CYBER HORIZON',
    threshold: 0,
    rPrimary: 0, gPrimary: 240, bPrimary: 255,
    rSecondary: 255, gSecondary: 0, bSecondary: 119,
    rBgTop: 21, gBgTop: 26, bBgTop: 48,
    rBgBottom: 6, gBgBottom: 8, bBgBottom: 16,
    rGrid: 0, gGrid: 240, bGrid: 255, gridAlpha: 0.14,
    obstacleType: 'CYBER_LASER'
  },
  {
    id: 2,
    name: 'SOLAR INFERNO',
    threshold: 50000,
    rPrimary: 255, gPrimary: 230, bPrimary: 0,
    rSecondary: 255, gSecondary: 51, bSecondary: 0,
    rBgTop: 48, gBgTop: 21, bBgTop: 10,
    rBgBottom: 13, gBgBottom: 4, bBgBottom: 2,
    rGrid: 255, gGrid: 120, bGrid: 0, gridAlpha: 0.20,
    obstacleType: 'METEORITE'
  },
  {
    id: 3,
    name: 'TOXIC MATRIX',
    threshold: 100000,
    rPrimary: 0, gPrimary: 255, bPrimary: 102,
    rSecondary: 170, gSecondary: 255, bSecondary: 0,
    rBgTop: 8, gBgTop: 36, bBgTop: 20,
    rBgBottom: 2, gBgBottom: 13, bBgBottom: 6,
    rGrid: 0, gGrid: 255, bGrid: 102, gridAlpha: 0.18,
    obstacleType: 'CYBER_CLAW'
  },
  {
    id: 4,
    name: 'VOID ABYSS',
    threshold: 150000,
    rPrimary: 157, gPrimary: 0, bPrimary: 255,
    rSecondary: 0, gSecondary: 240, bSecondary: 255,
    rBgTop: 30, gBgTop: 10, bBgTop: 48,
    rBgBottom: 8, gBgBottom: 2, bBgBottom: 13,
    rGrid: 157, gGrid: 0, bGrid: 255, gridAlpha: 0.20,
    obstacleType: 'VOID_VORTEX'
  },
  {
    id: 5,
    name: 'QUANTUM OVERDRIVE',
    threshold: 200000,
    rPrimary: 255, gPrimary: 255, bPrimary: 255,
    rSecondary: 0, gSecondary: 240, bSecondary: 255,
    rBgTop: 32, gBgTop: 37, bBgTop: 56,
    rBgBottom: 5, gBgBottom: 7, bBgBottom: 13,
    rGrid: 255, gGrid: 255, bGrid: 255, gridAlpha: 0.22,
    obstacleType: 'RAINBOW_CRYSTAL'
  }
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// ==========================================
// 4. Main Game Engine
// ==========================================
class NeonSurgeGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.sound = new SoundEngine();

    // Game state
    this.state = 'MENU';
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('neonsurge_highscore') || '0', 10);
    this.totalOrbs = parseInt(localStorage.getItem('neonsurge_orbs') || '0', 10);
    this.unlockedShips = JSON.parse(localStorage.getItem('neonsurge_unlocked_ships') || '["apex_dart"]');
    this.currentShipId = localStorage.getItem('neonsurge_active_ship') || 'apex_dart';

    this.runOrbs = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.maxCombo = 1;
    this.distance = 0;
    this.speed = 6.6;
    this.baseSpeed = 6.6;
    this.screenShake = 0;

    // Continuous Smooth Color State
    this.activeColors = {
      primary: 'rgb(0, 240, 255)',
      secondary: 'rgb(255, 0, 119)',
      bgTop: 'rgb(21, 26, 48)',
      bgBottom: 'rgb(6, 8, 16)',
      grid: 'rgba(0, 240, 255, 0.14)'
    };
    this.currentZoneName = ZONES[0].name;

    // Spawning Cadence & Safe Path System
    this.spawnTimer = 0;
    this.spawnInterval = 1.25;

    // Power-up state
    this.activePowerup = null;
    this.powerupDuration = 0;
    this.powerupMaxDuration = 0;

    // Player position
    this.player = {
      x: 0,
      y: 0,
      targetX: 0,
      tilt: 0,
      trail: []
    };

    // World Entities
    this.stars = [];
    this.obstacles = [];
    this.orbs = [];
    this.powerups = [];
    this.particles = [];
    this.floatingTexts = [];

    // Preload Custom Photo (otritzanie68)
    this.pilotPhoto = new Image();
    this.pilotPhoto.src = 'assets/otritzanie68.jpg';
    this.pilotPhotoLoaded = false;
    this.pilotPhoto.onload = () => { this.pilotPhotoLoaded = true; };

    // Inputs
    this.keys = { left: false, right: false };
    this.isDragging = false;

    this.initCanvasSize();
    this.initEventListeners();
    this.initMobileButtons();
    this.initStars();
    this.updateHUD();
    this.renderHangar();

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  initCanvasSize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.player.x = this.canvas.width / 2;
    this.player.targetX = this.canvas.width / 2;
    this.player.y = this.canvas.height - 85;
  }

  initStars() {
    this.stars = [];
    for (let i = 0; i < 50; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 2 + 1
      });
    }
  }

  initEventListeners() {
    window.addEventListener('resize', () => this.initCanvasSize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.initCanvasSize(), 200));

    // Keyboard (Desktop)
    window.addEventListener('keydown', (e) => {
      this.sound.init();
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = true;
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = false;
    });

    // Touch & Pointer Drag on Canvas (Permits touching right up to walls!)
    const setTargetFromPointer = (clientX) => {
      const rect = this.canvas.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      this.player.targetX = Math.max(16, Math.min(this.canvas.width - 16, relativeX));
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      this.sound.init();
      this.isDragging = true;
      setTargetFromPointer(e.clientX);
    });

    window.addEventListener('pointermove', (e) => {
      if (this.isDragging && this.state === 'PLAYING') {
        setTargetFromPointer(e.clientX);
      }
    });

    window.addEventListener('pointerup', () => { this.isDragging = false; });
    window.addEventListener('pointercancel', () => { this.isDragging = false; });

    // UI Menu Buttons
    document.getElementById('startBtn').addEventListener('click', () => this.startGame());
    document.getElementById('restartBtn').addEventListener('click', () => this.startGame());
    document.getElementById('openShopBtn').addEventListener('click', () => this.openHangar());
    document.getElementById('gameOverShopBtn').addEventListener('click', () => this.openHangar());
    document.getElementById('closeShopBtn').addEventListener('click', () => this.closeHangar());

    // Sound toggle
    const soundBtn = document.getElementById('soundToggleBtn');
    soundBtn.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      soundBtn.textContent = this.sound.enabled ? '🔊' : '🔇';
    });
  }

  initMobileButtons() {
    const btnLeft = document.getElementById('btnTouchLeft');
    const btnRight = document.getElementById('btnTouchRight');

    const startLeft = (e) => { e.preventDefault(); this.sound.init(); this.keys.left = true; };
    const endLeft = (e) => { e.preventDefault(); this.keys.left = false; };
    btnLeft.addEventListener('pointerdown', startLeft);
    btnLeft.addEventListener('pointerup', endLeft);
    btnLeft.addEventListener('pointerleave', endLeft);

    const startRight = (e) => { e.preventDefault(); this.sound.init(); this.keys.right = true; };
    const endRight = (e) => { e.preventDefault(); this.keys.right = false; };
    btnRight.addEventListener('pointerdown', startRight);
    btnRight.addEventListener('pointerup', endRight);
    btnRight.addEventListener('pointerleave', endRight);
  }

  startGame() {
    this.sound.init();
    this.state = 'PLAYING';
    this.score = 0;
    this.runOrbs = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.maxCombo = 1;
    this.distance = 0;
    this.speed = this.baseSpeed;
    this.screenShake = 0;
    this.activePowerup = null;
    this.spawnTimer = 0;

    this.player.x = this.canvas.width / 2;
    this.player.targetX = this.canvas.width / 2;
    this.player.trail = [];

    this.obstacles = [];
    this.orbs = [];
    this.powerups = [];
    this.particles = [];
    this.floatingTexts = [];

    document.getElementById('startScreen').classList.remove('active');
    document.getElementById('gameOverScreen').classList.remove('active');
    document.getElementById('shopScreen').classList.remove('active');
    document.getElementById('activePowerupBar').style.display = 'none';

    this.updateHUD();
  }

  gameOver() {
    this.sound.playCrash();
    this.state = 'GAMEOVER';
    this.screenShake = 18;

    const currentSkin = SHIP_SKINS.find(s => s.id === this.currentShipId) || SHIP_SKINS[0];
    this.createExplosion(this.player.x, this.player.y, 40, currentSkin.accent);
    this.createExplosion(this.player.x, this.player.y, 30, currentSkin.color);

    this.totalOrbs += this.runOrbs;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('neonsurge_highscore', this.highScore.toString());
    }
    localStorage.setItem('neonsurge_orbs', this.totalOrbs.toString());

    document.getElementById('finalScore').textContent = this.score.toLocaleString();
    document.getElementById('finalOrbs').textContent = `+${this.runOrbs}`;
    document.getElementById('finalCombo').textContent = `${this.maxCombo}x`;
    document.getElementById('finalBestScore').textContent = this.highScore.toLocaleString();
    document.getElementById('gameOverScreen').classList.add('active');
    this.updateHUD();
  }

  openHangar() {
    this.renderHangar();
    document.getElementById('shopOrbsCount').textContent = this.totalOrbs;
    document.getElementById('shopScreen').classList.add('active');
  }

  closeHangar() {
    document.getElementById('shopScreen').classList.remove('active');
  }

  renderHangar() {
    const grid = document.getElementById('shipsGrid');
    grid.innerHTML = '';

    SHIP_SKINS.forEach(skin => {
      const isUnlocked = this.unlockedShips.includes(skin.id);
      const isEquipped = this.currentShipId === skin.id;

      const card = document.createElement('div');
      card.className = `ship-item ${isEquipped ? 'active' : ''}`;

      let previewHtml = '';
      if (skin.isCustomPhoto) {
        previewHtml = `<img src="assets/otritzanie68.jpg" class="ship-preview-img" alt="${skin.name}">`;
      } else if (skin.id === 'amongus') {
        previewHtml = `
          <svg width="40" height="44" viewBox="0 0 40 44">
            <rect x="2" y="14" width="8" height="18" rx="4" fill="#cc1144"/>
            <rect x="8" y="4" width="24" height="34" rx="12" fill="#ff2255" stroke="#990022" stroke-width="2"/>
            <rect x="18" y="10" width="16" height="10" rx="5" fill="#00f0ff" stroke="#ffffff" stroke-width="1.5"/>
            <rect x="10" y="32" width="7" height="10" rx="3" fill="#ff2255"/>
            <rect x="23" y="32" width="7" height="10" rx="3" fill="#ff2255"/>
          </svg>
        `;
      } else if (skin.id === 'benjamin') {
        previewHtml = `
          <svg width="44" height="44" viewBox="0 0 44 44">
            <ellipse cx="22" cy="22" rx="15" ry="16" fill="#c48b4b" stroke="#7a4f1a" stroke-width="2"/>
            <ellipse cx="9" cy="14" rx="4" ry="10" fill="#7a4f1a" transform="rotate(-15 9 14)"/>
            <ellipse cx="35" cy="14" rx="4" ry="10" fill="#7a4f1a" transform="rotate(15 35 14)"/>
            <circle cx="16" cy="18" r="4.5" fill="none" stroke="#ffd700" stroke-width="2"/>
            <circle cx="28" cy="18" r="4.5" fill="none" stroke="#ffd700" stroke-width="2"/>
            <line x1="20.5" y1="18" x2="23.5" y2="18" stroke="#ffd700" stroke-width="2"/>
            <circle cx="16" cy="18" r="2" fill="#000"/>
            <circle cx="28" cy="18" r="2" fill="#000"/>
            <polygon points="22,23 19,26 25,26" fill="#000"/>
          </svg>
        `;
      } else if (skin.id === 'bobik_dog') {
        previewHtml = `
          <svg width="44" height="44" viewBox="0 0 44 44">
            <ellipse cx="22" cy="22" rx="14" ry="16" fill="#ffe600" stroke="#ff8800" stroke-width="2"/>
            <ellipse cx="10" cy="14" rx="5" ry="10" fill="#ff8800" transform="rotate(-20 10 14)"/>
            <ellipse cx="34" cy="14" rx="5" ry="10" fill="#ff8800" transform="rotate(20 34 14)"/>
            <circle cx="17" cy="18" r="2.5" fill="#000"/>
            <circle cx="27" cy="18" r="2.5" fill="#000"/>
            <polygon points="22,22 19,25 25,25" fill="#000"/>
          </svg>
        `;
      } else {
        previewHtml = `
          <svg width="34" height="40" viewBox="0 0 40 46">
            <polygon points="20,2 38,40 20,32 2,40" fill="${skin.color}" stroke="${skin.accent}" stroke-width="2"/>
          </svg>
        `;
      }

      card.innerHTML = `
        <div class="ship-preview-box">
          ${previewHtml}
        </div>
        <span class="ship-name">${skin.name}</span>
        <span class="ship-desc">${skin.desc}</span>
        <button class="btn-ship-action ${isEquipped ? 'equipped' : isUnlocked ? 'equip' : 'buy'}" id="btn-ship-${skin.id}">
          ${isEquipped ? 'EQUIPPED' : isUnlocked ? 'EQUIP' : `UNLOCK (${skin.cost} 🟡)`}
        </button>
      `;

      grid.appendChild(card);

      const btn = card.querySelector(`#btn-ship-${skin.id}`);
      btn.addEventListener('click', () => {
        if (isEquipped) return;
        if (isUnlocked) {
          this.currentShipId = skin.id;
          localStorage.setItem('neonsurge_active_ship', skin.id);
          this.renderHangar();
        } else if (this.totalOrbs >= skin.cost) {
          this.totalOrbs -= skin.cost;
          this.unlockedShips.push(skin.id);
          this.currentShipId = skin.id;
          localStorage.setItem('neonsurge_orbs', this.totalOrbs.toString());
          localStorage.setItem('neonsurge_unlocked_ships', JSON.stringify(this.unlockedShips));
          localStorage.setItem('neonsurge_active_ship', skin.id);
          this.renderHangar();
        } else {
          alert('Not enough Orbs! Collect more during your runs.');
        }
      });
    });
  }

  updateHUD() {
    document.getElementById('currentScore').textContent = this.score.toLocaleString();
    document.getElementById('totalOrbs').textContent = (this.totalOrbs + this.runOrbs).toLocaleString();
    document.getElementById('menuHighScore').textContent = this.highScore.toLocaleString();
    
    // Combo badge
    const badge = document.getElementById('multiplierBadge');
    badge.textContent = `${this.combo}x COMBO`;
    if (this.combo > 1) {
      badge.style.color = '#00f0ff';
      badge.style.borderColor = '#00f0ff';
    } else {
      badge.style.color = '#ff0077';
      badge.style.borderColor = 'rgba(255, 0, 119, 0.3)';
    }

    // Zone Badge
    const zoneBadge = document.getElementById('hudZoneBadge');
    zoneBadge.textContent = this.currentZoneName;
    zoneBadge.style.color = this.activeColors.primary;
  }

  triggerHyperBoost() {
    this.activePowerup = 'BOOST';
    this.powerupDuration = 3.5;
    this.powerupMaxDuration = 3.5;
    this.speed = this.baseSpeed * 2.0;
    this.sound.playBoost();
    this.createFloatingText('⚡ HYPER BOOST!', this.player.x, this.player.y - 40, '#00f0ff');
  }

  triggerShield() {
    this.activePowerup = 'SHIELD';
    this.powerupDuration = 6.0;
    this.powerupMaxDuration = 6.0;
    this.sound.playPowerup();
    this.createFloatingText('🛡️ SHIELD ONLINE!', this.player.x, this.player.y - 40, '#00ff66');
  }

  // ==========================================
  // Continuous Real-Time Color Morphing
  // ==========================================
  updateZoneSmoothColors() {
    const exactZonePos = Math.max(0, Math.min(ZONES.length - 1, this.score / 50000));
    const baseIdx = Math.floor(exactZonePos);
    const nextIdx = Math.min(ZONES.length - 1, baseIdx + 1);
    const t = exactZonePos - baseIdx;

    const z1 = ZONES[baseIdx];
    const z2 = ZONES[nextIdx];

    const rP = Math.round(lerp(z1.rPrimary, z2.rPrimary, t));
    const gP = Math.round(lerp(z1.gPrimary, z2.gPrimary, t));
    const bP = Math.round(lerp(z1.bPrimary, z2.bPrimary, t));
    this.activeColors.primary = `rgb(${rP}, ${gP}, ${bP})`;

    const rS = Math.round(lerp(z1.rSecondary, z2.rSecondary, t));
    const gS = Math.round(lerp(z1.gSecondary, z2.gSecondary, t));
    const bS = Math.round(lerp(z1.bSecondary, z2.bSecondary, t));
    this.activeColors.secondary = `rgb(${rS}, ${gS}, ${bS})`;

    const rBT = Math.round(lerp(z1.rBgTop, z2.rBgTop, t));
    const gBT = Math.round(lerp(z1.gBgTop, z2.gBgTop, t));
    const bBT = Math.round(lerp(z1.bBgTop, z2.bBgTop, t));
    this.activeColors.bgTop = `rgb(${rBT}, ${gBT}, ${bBT})`;

    const rBB = Math.round(lerp(z1.rBgBottom, z2.rBgBottom, t));
    const gBB = Math.round(lerp(z1.gBgBottom, z2.gBgBottom, t));
    const bBB = Math.round(lerp(z1.bBgBottom, z2.bBgBottom, t));
    this.activeColors.bgBottom = `rgb(${rBB}, ${gBB}, ${bBB})`;

    const rG = Math.round(lerp(z1.rGrid, z2.rGrid, t));
    const gG = Math.round(lerp(z1.gGrid, z2.gGrid, t));
    const bG = Math.round(lerp(z1.bGrid, z2.bGrid, t));
    const alphaG = lerp(z1.gridAlpha, z2.gridAlpha, t).toFixed(3);
    this.activeColors.grid = `rgba(${rG}, ${gG}, ${bG}, ${alphaG})`;

    const currentZoneObj = t >= 0.5 ? z2 : z1;
    this.currentZoneName = `ZONE ${currentZoneObj.id} • ${currentZoneObj.name}`;
    this.activeObstacleType = currentZoneObj.obstacleType;
    this.currentZoneIdx = currentZoneObj.id - 1;
  }

  createExplosion(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 4 + 1.5,
        color,
        alpha: 1,
        decay: Math.random() * 0.03 + 0.02
      });
    }
  }

  createFloatingText(text, x, y, color = '#ffe600') {
    this.floatingTexts.push({
      text,
      x,
      y,
      vy: -1.5,
      alpha: 1,
      color
    });
  }

  // ==========================================
  // 5. Update Game Loop
  // ==========================================
  update(dt) {
    if (this.screenShake > 0) {
      this.screenShake -= dt * 30;
      if (this.screenShake < 0) this.screenShake = 0;
    }

    this.stars.forEach(star => {
      star.y += star.speed * (this.speed / 4);
      if (star.y > this.canvas.height) {
        star.y = 0;
        star.x = Math.random() * this.canvas.width;
      }
    });

    if (this.state !== 'PLAYING') return;

    // Progression
    this.distance += this.speed * dt * 10;
    this.score += Math.round(this.speed * this.combo * 0.5);
    
    // Smooth progressive speed scaling
    this.baseSpeed = 6.6 + Math.min(9.0, Math.pow(this.distance / 5000, 0.75));

    // Update continuous seamless zone colors
    this.updateZoneSmoothColors();

    // Combo Timer Decay
    if (this.combo > 1) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 1;
        this.updateHUD();
      }
    }

    // Power-up Timer
    if (this.activePowerup) {
      this.powerupDuration -= dt;
      const bar = document.getElementById('activePowerupBar');
      const fill = document.getElementById('powerupTimerFill');
      const name = document.getElementById('powerupName');
      bar.style.display = 'flex';
      name.textContent = `${this.activePowerup} ACTIVE`;
      fill.style.width = `${(this.powerupDuration / this.powerupMaxDuration) * 100}%`;

      if (this.powerupDuration <= 0) {
        this.activePowerup = null;
        this.speed = this.baseSpeed;
        bar.style.display = 'none';
      }
    }

    // Left/Right Movement (Player can comfortably touch/glide right against the walls!)
    if (this.keys.left) this.player.targetX -= 11;
    if (this.keys.right) this.player.targetX += 11;

    const wallMargin = 16;
    this.player.targetX = Math.max(wallMargin, Math.min(this.canvas.width - wallMargin, this.player.targetX));
    const dx = this.player.targetX - this.player.x;
    this.player.x += dx * 0.22;
    this.player.tilt = Math.max(-0.45, Math.min(0.45, dx * 0.03));

    // Player Trail
    this.player.trail.push({ x: this.player.x, y: this.player.y + 18, alpha: 0.8 });
    if (this.player.trail.length > 12) this.player.trail.shift();
    this.player.trail.forEach(t => t.alpha -= 0.06);

    // Obstacle Generator
    const difficultyFactor = Math.min(1, this.score / 120000);
    this.spawnInterval = 1.30 - (difficultyFactor * 0.55);

    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnBalancedWave(difficultyFactor);
    }

    // Spawning Orbs
    if (Math.random() < 0.048) {
      this.orbs.push({
        x: Math.random() * (this.canvas.width - 60) + 30,
        y: -30,
        radius: 12,
        pulse: 0
      });
    }

    // Spawning Power-up Pickups
    if (Math.random() < 0.009 && !this.activePowerup) {
      const pType = Math.random() > 0.5 ? 'BOOST' : 'SHIELD';
      this.powerups.push({
        x: Math.random() * (this.canvas.width - 60) + 30,
        y: -30,
        type: pType,
        radius: 16
      });
    }

    // Obstacles Collision & Movement
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.y += this.speed;
      obs.rotation += 0.04;
      obs.animPulse += 0.08;

      const hitMargin = obs.isBarrier ? 4 : 8;
      const pBox = { x: this.player.x - 12, y: this.player.y - 16, w: 24, h: 32 };
      const oBox = { x: obs.x + hitMargin, y: obs.y + hitMargin, w: obs.width - (hitMargin * 2), h: obs.height - (hitMargin * 2) };

      if (
        pBox.x < oBox.x + oBox.w &&
        pBox.x + pBox.w > oBox.x &&
        pBox.y < oBox.y + oBox.h &&
        pBox.y + pBox.h > oBox.y
      ) {
        if (this.activePowerup === 'SHIELD' || this.activePowerup === 'BOOST') {
          const zoneColor = this.activeColors.secondary;
          this.createExplosion(obs.x + obs.width / 2, obs.y + obs.height / 2, 22, zoneColor);
          this.obstacles.splice(i, 1);
          this.score += 250 * this.combo;

          const smashTitles = ['+250 LASER SMASH!', '+250 METEOR CRUSH!', '+250 CLAW SHRED!', '+250 VORTEX SHATTER!', '+250 PRISM BURST!'];
          const title = smashTitles[obs.zoneIndex] || '+250 SMASH!';
          this.createFloatingText(title, obs.x, obs.y, zoneColor);
          continue;
        } else {
          this.gameOver();
          return;
        }
      }

      if (obs.y > this.canvas.height + 100) {
        this.obstacles.splice(i, 1);
      }
    }

    // Orbs Collision
    for (let i = this.orbs.length - 1; i >= 0; i--) {
      const orb = this.orbs[i];
      orb.y += this.speed;
      orb.pulse += 0.08;

      const dist = Math.hypot(this.player.x - orb.x, this.player.y - orb.y);
      if (dist < orb.radius + 22) {
        this.sound.playOrb();
        this.runOrbs++;
        this.combo = Math.min(8, this.combo + 1);
        this.comboTimer = 3.2;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;

        const points = 100 * this.combo;
        this.score += points;

        this.createExplosion(orb.x, orb.y, 10, '#ffe600');
        this.createFloatingText(`+${points} (${this.combo}x)`, orb.x, orb.y, '#ffe600');

        this.orbs.splice(i, 1);
        this.updateHUD();
        continue;
      }

      if (orb.y > this.canvas.height + 50) {
        this.orbs.splice(i, 1);
      }
    }

    // Power-up Pickups
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      p.y += this.speed;

      const dist = Math.hypot(this.player.x - p.x, this.player.y - p.y);
      if (dist < p.radius + 22) {
        if (p.type === 'SHIELD') this.triggerShield();
        if (p.type === 'BOOST') this.triggerHyperBoost();
        this.createExplosion(p.x, p.y, 20, p.type === 'SHIELD' ? '#00ff66' : '#00f0ff');
        this.powerups.splice(i, 1);
        continue;
      }

      if (p.y > this.canvas.height + 50) {
        this.powerups.splice(i, 1);
      }
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }

    // Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.02;
      if (ft.alpha <= 0) this.floatingTexts.splice(i, 1);
    }

    this.updateHUD();
  }

  // ==========================================
  // Guaranteed Fair Obstacle Wave Generator (Generous 120px+ Gaps & Center Wall-Pillars)
  // ==========================================
  spawnBalancedWave(difficultyFactor) {
    const canvasW = this.canvas.width;
    const type = this.activeObstacleType || 'CYBER_LASER';
    const currentZoneIdx = this.currentZoneIdx || 0;

    const randPattern = Math.random();

    // ----------------------------------------------------
    // PATTERN 1: CENTER PILLAR / ISLAND (Makes wall hugging strategically fun!)
    // Blocks the middle ~40% of the screen, leaving BOTH the Left & Right walls wide open!
    // ----------------------------------------------------
    if (randPattern < 0.28) {
      const pillarWidth = Math.min(canvasW * 0.40, 160);
      const pillarX = (canvasW - pillarWidth) / 2;

      this.obstacles.push({
        x: pillarX,
        y: -70,
        width: pillarWidth,
        height: 26,
        type,
        isBarrier: true,
        zoneIndex: currentZoneIdx,
        rotation: 0,
        animPulse: 0
      });

      // Spawn bonus Orbs right along the left and right walls to reward wall hugs!
      if (Math.random() < 0.7) {
        const sideX = Math.random() > 0.5 ? 20 : canvasW - 20;
        this.orbs.push({ x: sideX, y: -70, radius: 12, pulse: 0 });
      }
      return;
    }

    // ----------------------------------------------------
    // PATTERN 2: GENEROUS SIDE BARRIER (Leaves at least 115px to 135px wide opening!)
    // ----------------------------------------------------
    if (randPattern < 0.58) {
      const generousPassageWidth = Math.max(115, Math.min(135, canvasW * 0.38));
      const spawnOnLeft = Math.random() > 0.5;

      const barrierWidth = canvasW - generousPassageWidth;
      const barrierX = spawnOnLeft ? 0 : generousPassageWidth;

      this.obstacles.push({
        x: barrierX,
        y: -70,
        width: barrierWidth,
        height: 24,
        type,
        isBarrier: true,
        zoneIndex: currentZoneIdx,
        rotation: 0,
        animPulse: 0
      });
      return;
    }

    // ----------------------------------------------------
    // PATTERN 3: STAGGERED CLUSTERS WITH 120px GUARANTEED WEAVE CORRIDOR
    // ----------------------------------------------------
    const minSafeCorridor = 115;
    const safeX = Math.random() * (canvasW - minSafeCorridor - 30) + 15;
    const safeEnd = safeX + minSafeCorridor;

    const clusterCount = Math.random() > 0.5 ? 3 : 2;

    for (let c = 0; c < clusterCount; c++) {
      const size = Math.floor(Math.random() * 22) + 38; // 38px to 60px
      let posX;

      if (Math.random() > 0.5 && safeX > size + 10) {
        // Spawn to the left of the safe corridor
        posX = Math.random() * (safeX - size);
      } else if (canvasW - safeEnd > size + 10) {
        // Spawn to the right of the safe corridor
        posX = safeEnd + Math.random() * (canvasW - safeEnd - size);
      } else {
        posX = Math.random() > 0.5 ? 5 : canvasW - size - 5;
      }

      this.obstacles.push({
        x: Math.max(0, Math.min(canvasW - size, posX)),
        y: -70 - (c * 60), // Staggered vertically for easy weaving
        width: size,
        height: size,
        type,
        isBarrier: false,
        zoneIndex: currentZoneIdx,
        rotation: Math.random() * Math.PI,
        animPulse: Math.random() * 5
      });
    }
  }

  // ==========================================
  // 6. Render Scene
  // ==========================================
  draw() {
    this.ctx.save();

    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      this.ctx.translate(shakeX, shakeY);
    }

    // Dynamic Seamless Background Gradient
    const bgGrad = this.ctx.createRadialGradient(
      this.canvas.width / 2, this.canvas.height * 0.3, 10,
      this.canvas.width / 2, this.canvas.height * 0.6, this.canvas.height
    );
    bgGrad.addColorStop(0, this.activeColors.bgTop);
    bgGrad.addColorStop(1, this.activeColors.bgBottom);
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Seamless Grid Floor
    this.drawGrid();

    // Stars
    this.ctx.fillStyle = this.activeColors.primary;
    this.stars.forEach(star => {
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Orbs
    this.orbs.forEach(orb => {
      const glow = Math.sin(orb.pulse) * 4;
      this.ctx.save();
      this.ctx.shadowColor = '#ffe600';
      this.ctx.shadowBlur = 14 + glow;
      this.ctx.fillStyle = '#ffe600';
      this.ctx.beginPath();
      this.ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(orb.x, orb.y, orb.radius * 0.4, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    // Power-up Pickups
    this.powerups.forEach(p => {
      const color = p.type === 'SHIELD' ? '#00ff66' : '#00f0ff';
      this.ctx.save();
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 16;
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.fillStyle = color;
      this.ctx.font = 'bold 12px Orbitron';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(p.type === 'SHIELD' ? '🛡️' : '⚡', p.x, p.y);
      this.ctx.restore();
    });

    // Obstacles Rendering
    this.obstacles.forEach(obs => {
      this.drawThematicObstacle(obs);
    });

    // Player Trail
    const currentSkin = SHIP_SKINS.find(s => s.id === this.currentShipId) || SHIP_SKINS[0];
    this.player.trail.forEach(t => {
      this.ctx.save();
      this.ctx.fillStyle = currentSkin.color;
      this.ctx.globalAlpha = t.alpha * 0.4;
      this.ctx.beginPath();
      this.ctx.arc(t.x, t.y, 5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    // Ship
    if (this.state === 'PLAYING' || this.state === 'MENU') {
      this.drawPlayerShip(currentSkin);
    }

    // Particles
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    // Floating Text
    this.floatingTexts.forEach(ft => {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, ft.alpha);
      this.ctx.font = 'bold 13px Orbitron';
      this.ctx.fillStyle = ft.color;
      this.ctx.shadowColor = ft.color;
      this.ctx.shadowBlur = 8;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(ft.text, ft.x, ft.y);
      this.ctx.restore();
    });

    this.ctx.restore();
  }

  // ==========================================
  // Custom Zone Thematic Obstacle Graphics
  // ==========================================
  drawThematicObstacle(obs) {
    const cx = obs.x + obs.width / 2;
    const cy = obs.y + obs.height / 2;

    this.ctx.save();

    // 1. CYBER_LASER
    if (obs.type === 'CYBER_LASER') {
      this.ctx.shadowColor = this.activeColors.secondary;
      this.ctx.shadowBlur = 16;

      if (obs.isBarrier) {
        this.ctx.fillStyle = 'rgba(255, 0, 119, 0.45)';
        this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        this.ctx.strokeStyle = '#ff0077';
        this.ctx.lineWidth = 3.5;
        this.ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.moveTo(obs.x, cy);
        this.ctx.lineTo(obs.x + obs.width, cy);
        this.ctx.stroke();
      } else {
        this.ctx.translate(cx, cy);
        this.ctx.rotate(obs.rotation);
        this.ctx.fillStyle = '#ff0077';
        this.ctx.fillRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);
        this.ctx.strokeStyle = '#00f0ff';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 5, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
      return;
    }

    // 2. METEORITE
    if (obs.type === 'METEORITE') {
      this.ctx.shadowColor = '#ff3300';
      this.ctx.shadowBlur = 20;

      if (obs.isBarrier) {
        this.ctx.fillStyle = 'rgba(255, 51, 0, 0.55)';
        this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        this.ctx.strokeStyle = '#ffe600';
        this.ctx.lineWidth = 3.5;
        this.ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

        this.ctx.fillStyle = '#ffe600';
        for (let lx = obs.x + 10; lx < obs.x + obs.width; lx += 20) {
          this.ctx.beginPath();
          this.ctx.arc(lx, cy + Math.sin(obs.animPulse + lx) * 4, 3.5, 0, Math.PI * 2);
          this.ctx.fill();
        }
      } else {
        this.ctx.translate(cx, cy);
        this.ctx.rotate(obs.rotation);

        const rad = obs.width / 2;

        this.ctx.fillStyle = '#ff9900';
        this.ctx.beginPath();
        this.ctx.arc(0, -rad * 0.8, rad * 0.5, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#ff2200';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, rad, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = '#ffe600';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        this.ctx.fillStyle = '#660000';
        this.ctx.beginPath();
        this.ctx.arc(-rad * 0.3, -rad * 0.2, rad * 0.25, 0, Math.PI * 2);
        this.ctx.arc(rad * 0.3, rad * 0.2, rad * 0.2, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
      return;
    }

    // 3. CYBER_CLAW
    if (obs.type === 'CYBER_CLAW') {
      this.ctx.shadowColor = '#00ff66';
      this.ctx.shadowBlur = 18;

      if (obs.isBarrier) {
        this.ctx.fillStyle = 'rgba(0, 255, 102, 0.45)';
        this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        this.ctx.strokeStyle = '#aaff00';
        this.ctx.lineWidth = 3.5;
        this.ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

        this.ctx.fillStyle = '#aaff00';
        for (let bx = obs.x + 8; bx < obs.x + obs.width; bx += 18) {
          this.ctx.beginPath();
          this.ctx.moveTo(bx - 6, obs.y);
          this.ctx.lineTo(bx, obs.y - 10);
          this.ctx.lineTo(bx + 6, obs.y);
          this.ctx.closePath();
          this.ctx.fill();
        }
      } else {
        this.ctx.translate(cx, cy);
        this.ctx.rotate(obs.rotation * 0.4);

        const rad = obs.width / 2;

        this.ctx.fillStyle = '#051f0f';
        this.ctx.strokeStyle = '#00ff66';
        this.ctx.lineWidth = 3.5;

        this.ctx.beginPath();
        this.ctx.ellipse(0, 6, rad * 0.8, rad * 0.6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#aaff00';
        [-rad * 0.5, 0, rad * 0.5].forEach(offset => {
          this.ctx.beginPath();
          this.ctx.moveTo(offset - 5, 0);
          this.ctx.lineTo(offset, -rad * 1.1);
          this.ctx.lineTo(offset + 5, 0);
          this.ctx.closePath();
          this.ctx.fill();
        });
      }
      this.ctx.restore();
      return;
    }

    // 4. VOID_VORTEX
    if (obs.type === 'VOID_VORTEX') {
      this.ctx.shadowColor = '#9d00ff';
      this.ctx.shadowBlur = 22;

      if (obs.isBarrier) {
        this.ctx.fillStyle = 'rgba(157, 0, 255, 0.5)';
        this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        this.ctx.strokeStyle = '#00f0ff';
        this.ctx.lineWidth = 3.5;
        this.ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 8 + Math.sin(obs.animPulse) * 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.translate(cx, cy);
        this.ctx.rotate(obs.rotation * 1.6);

        const rad = obs.width / 2;

        this.ctx.fillStyle = '#06010a';
        this.ctx.strokeStyle = '#9d00ff';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, rad, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.strokeStyle = '#00f0ff';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, rad * 0.7, 0, Math.PI * 1.3);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.arc(0, 0, rad * 0.4, Math.PI, Math.PI * 2.3);
        this.ctx.stroke();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 5, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
      return;
    }

    // 5. RAINBOW_CRYSTAL
    if (obs.type === 'RAINBOW_CRYSTAL') {
      this.ctx.shadowColor = '#ffffff';
      this.ctx.shadowBlur = 22;

      if (obs.isBarrier) {
        const grad = this.ctx.createLinearGradient(obs.x, obs.y, obs.x + obs.width, obs.y);
        grad.addColorStop(0, '#ff0055');
        grad.addColorStop(0.33, '#ffe600');
        grad.addColorStop(0.66, '#00ff66');
        grad.addColorStop(1, '#00f0ff');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3.5;
        this.ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
      } else {
        this.ctx.translate(cx, cy);
        this.ctx.rotate(obs.rotation);

        const rad = obs.width / 2;

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.strokeStyle = '#00f0ff';
        this.ctx.lineWidth = 3;

        this.ctx.beginPath();
        this.ctx.moveTo(0, -rad * 1.1);
        this.ctx.lineTo(rad * 0.9, 0);
        this.ctx.lineTo(0, rad * 1.1);
        this.ctx.lineTo(-rad * 0.9, 0);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.strokeStyle = '#ff0077';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(-rad * 0.9, 0);
        this.ctx.lineTo(rad * 0.9, 0);
        this.ctx.moveTo(0, -rad * 1.1);
        this.ctx.lineTo(0, rad * 1.1);
        this.ctx.stroke();
      }
      this.ctx.restore();
      return;
    }

    this.ctx.restore();
  }

  drawGrid() {
    const horizon = this.canvas.height * 0.45;
    const gridOffset = (this.distance * 0.8) % 36;

    this.ctx.save();
    this.ctx.strokeStyle = this.activeColors.grid;
    this.ctx.lineWidth = 1.2;

    for (let y = horizon; y < this.canvas.height; y += 22) {
      const curvedY = y + gridOffset;
      if (curvedY > this.canvas.height) continue;
      this.ctx.beginPath();
      this.ctx.moveTo(0, curvedY);
      this.ctx.lineTo(this.canvas.width, curvedY);
      this.ctx.stroke();
    }

    const centerX = this.canvas.width / 2;
    for (let x = -this.canvas.width; x < this.canvas.width * 2; x += 55) {
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, horizon);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawPlayerShip(currentSkin) {
    const px = this.player.x;
    const py = this.player.y;

    this.ctx.save();
    this.ctx.translate(px, py);
    this.ctx.rotate(this.player.tilt);

    // Active Shield
    if (this.activePowerup === 'SHIELD') {
      this.ctx.save();
      this.ctx.strokeStyle = '#00ff66';
      this.ctx.shadowColor = '#00ff66';
      this.ctx.shadowBlur = 18;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 34, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Active Boost Flame Aura
    if (this.activePowerup === 'BOOST') {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 36, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // 1. AMONG US SHIP
    if (currentSkin.id === 'amongus') {
      this.ctx.shadowColor = '#ff2255';
      this.ctx.shadowBlur = 14;

      this.ctx.fillStyle = '#cc1144';
      this.ctx.beginPath();
      this.ctx.roundRect(-22, -10, 8, 20, [4]);
      this.ctx.fill();

      this.ctx.fillStyle = '#ff2255';
      this.ctx.strokeStyle = '#990022';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.roundRect(-14, -24, 28, 40, [14, 14, 8, 8]);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = '#00f0ff';
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.roundRect(-2, -18, 18, 12, [6]);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      this.ctx.beginPath();
      this.ctx.ellipse(4, -15, 4, 2, 0, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#ff2255';
      this.ctx.fillRect(-12, 14, 9, 10);
      this.ctx.fillRect(3, 14, 9, 10);

      this.ctx.fillStyle = '#00f0ff';
      this.ctx.beginPath();
      this.ctx.moveTo(-6, 22);
      this.ctx.lineTo(0, 32 + Math.random() * 6);
      this.ctx.lineTo(6, 22);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.restore();
      return;
    }

    // 2. BENJAMIN SHIP
    if (currentSkin.id === 'benjamin') {
      this.ctx.shadowColor = '#ffd700';
      this.ctx.shadowBlur = 15;

      this.ctx.fillStyle = '#7a4f1a';
      this.ctx.beginPath();
      this.ctx.ellipse(-14, -10, 5, 12, -0.3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.ellipse(14, -10, 5, 12, 0.3, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#c48b4b';
      this.ctx.strokeStyle = '#7a4f1a';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, 18, 20, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.strokeStyle = '#ffd700';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(-7, -4, 5, 0, Math.PI * 2);
      this.ctx.arc(7, -4, 5, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(-2, -4);
      this.ctx.lineTo(2, -4);
      this.ctx.stroke();

      this.ctx.fillStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.arc(-7, -4, 2.5, 0, Math.PI * 2);
      this.ctx.arc(7, -4, 2.5, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#eed6b3';
      this.ctx.beginPath();
      this.ctx.ellipse(0, 6, 8, 6, 0, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.arc(0, 3, 3, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#ffd700';
      this.ctx.beginPath();
      this.ctx.moveTo(-6, 18);
      this.ctx.lineTo(0, 30 + Math.random() * 6);
      this.ctx.lineTo(6, 18);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.restore();
      return;
    }

    // 3. OTRITZANIE 68 SHIP
    if (currentSkin.id === 'otritzanie68') {
      this.ctx.fillStyle = currentSkin.color;
      this.ctx.shadowColor = currentSkin.color;
      this.ctx.shadowBlur = 15;
      this.ctx.beginPath();
      this.ctx.moveTo(0, -26);
      this.ctx.lineTo(24, 20);
      this.ctx.lineTo(0, 12);
      this.ctx.lineTo(-24, 20);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.strokeStyle = currentSkin.accent;
      this.ctx.lineWidth = 2.5;
      this.ctx.stroke();

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(0, -2, 16, 0, Math.PI * 2);
      this.ctx.clip();

      if (this.pilotPhotoLoaded) {
        this.ctx.drawImage(this.pilotPhoto, -16, -18, 32, 32);
      } else {
        this.ctx.fillStyle = '#00f0ff';
        this.ctx.fillRect(-16, -16, 32, 32);
      }
      this.ctx.restore();

      this.ctx.strokeStyle = '#ffe600';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(0, -2, 16, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.fillStyle = '#00f0ff';
      this.ctx.beginPath();
      this.ctx.moveTo(-10, 16);
      this.ctx.lineTo(0, 28 + Math.random() * 8);
      this.ctx.lineTo(10, 16);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.restore();
      return;
    }

    // 4. BOBIK THE DOG SHIP
    if (currentSkin.id === 'bobik_dog') {
      this.ctx.shadowColor = '#ffe600';
      this.ctx.shadowBlur = 15;

      this.ctx.fillStyle = '#ff8800';
      this.ctx.beginPath();
      this.ctx.ellipse(-14, -10, 6, 12, -0.4, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.ellipse(14, -10, 6, 12, 0.4, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#ffe600';
      this.ctx.strokeStyle = '#ff8800';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, 18, 20, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.arc(-7, -4, 3, 0, Math.PI * 2);
      this.ctx.arc(7, -4, 3, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.ellipse(0, 5, 8, 6, 0, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.arc(0, 2, 3, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#ff5500';
      this.ctx.beginPath();
      this.ctx.moveTo(-6, 18);
      this.ctx.lineTo(Math.sin(Date.now() * 0.02) * 8, 30);
      this.ctx.lineTo(6, 18);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.restore();
      return;
    }

    // 5. STANDARD SHIPS
    this.ctx.shadowColor = currentSkin.color;
    this.ctx.shadowBlur = 14;
    this.ctx.fillStyle = currentSkin.color;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -24);
    this.ctx.lineTo(18, 20);
    this.ctx.lineTo(0, 12);
    this.ctx.lineTo(-18, 20);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.strokeStyle = currentSkin.accent;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(0, -3, 3.5, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#ff0077';
    this.ctx.beginPath();
    this.ctx.moveTo(-8, 16);
    this.ctx.lineTo(0, 28 + Math.random() * 6);
    this.ctx.lineTo(8, 16);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }

  gameLoop(currentTime) {
    const dt = Math.min(0.05, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    this.update(dt);
    this.draw();

    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new NeonSurgeGame();
});
