/**
 * NEON SURGE | Cyber Velocity Arcade Engine v10.0
 * Global Cloud Leaderboards (3 Categories), Nimble Obstacle Sizing, Pilot Callsigns & Stacking Powerups.
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

  playMagnet() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
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
// 3. Dynamic Map Zones (Slaughterhouse at 200,000+ pts)
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
    name: 'SLAUGHTERHOUSE',
    threshold: 200000,
    rPrimary: 255, gPrimary: 0, bPrimary: 34,
    rSecondary: 255, gSecondary: 30, bSecondary: 30,
    rBgTop: 42, gBgTop: 0, bBgTop: 6,
    rBgBottom: 0, gBgBottom: 0, bBgBottom: 0,
    rGrid: 255, gGrid: 0, bGrid: 34, gridAlpha: 0.35,
    obstacleType: 'DEVIL_SLAUGHTER',
    isDevilMode: true
  }
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// ==========================================
// 4. Cloud Leaderboard Service
// ==========================================
const CLOUD_LEADERBOARD_ENDPOINT = 'https://api.restful-api.dev/objects/ff8081819ff5b11001a048fa7cb8553b';

class CloudLeaderboardService {
  constructor() {
    this.cachedData = {
      bestRunScores: [],
      lifetimePoints: [],
      totalCoins: []
    };
  }

  async fetchLeaderboard() {
    try {
      const res = await fetch(CLOUD_LEADERBOARD_ENDPOINT);
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          this.cachedData = json.data;
        }
      }
    } catch (e) {
      console.warn('Cloud fetch fallback to local cache:', e);
    }
    return this.cachedData;
  }

  async submitRun(pilotName, singleRunScore, lifetimePoints, totalCoins) {
    if (!pilotName) pilotName = 'PILOT';
    pilotName = pilotName.toUpperCase().slice(0, 14);

    try {
      const current = await this.fetchLeaderboard();
      const bestRunScores = current.bestRunScores || [];
      const lifetimePts = current.lifetimePoints || [];
      const totalCoinsArr = current.totalCoins || [];

      // 1. Single Run Best Score (The most points in ONE run)
      const existingScoreIdx = bestRunScores.findIndex(e => e.name === pilotName);
      if (existingScoreIdx >= 0) {
        if (singleRunScore > bestRunScores[existingScoreIdx].score) {
          bestRunScores[existingScoreIdx].score = singleRunScore;
        }
      } else if (singleRunScore > 0) {
        bestRunScores.push({ name: pilotName, score: singleRunScore });
      }
      bestRunScores.sort((a, b) => b.score - a.score);
      const topBestRuns = bestRunScores.slice(0, 10);

      // 2. Lifetime Total Points (Cumulative points across whole account existence)
      const existingLifeIdx = lifetimePts.findIndex(e => e.name === pilotName);
      if (existingLifeIdx >= 0) {
        if (lifetimePoints > lifetimePts[existingLifeIdx].points) {
          lifetimePts[existingLifeIdx].points = lifetimePoints;
        }
      } else if (lifetimePoints > 0) {
        lifetimePts.push({ name: pilotName, points: lifetimePoints });
      }
      lifetimePts.sort((a, b) => b.points - a.points);
      const topLifetimePts = lifetimePts.slice(0, 10);

      // 3. Total Lifetime Coins / Orbs Count
      const existingCoinIdx = totalCoinsArr.findIndex(e => e.name === pilotName);
      if (existingCoinIdx >= 0) {
        if (totalCoins > totalCoinsArr[existingCoinIdx].coins) {
          totalCoinsArr[existingCoinIdx].coins = totalCoins;
        }
      } else if (totalCoins > 0) {
        totalCoinsArr.push({ name: pilotName, coins: totalCoins });
      }
      totalCoinsArr.sort((a, b) => b.coins - a.coins);
      const topTotalCoins = totalCoinsArr.slice(0, 10);

      const payload = {
        name: 'NeonSurge_Leaderboards_v1',
        data: {
          bestRunScores: topBestRuns,
          lifetimePoints: topLifetimePts,
          totalCoins: topTotalCoins
        }
      };

      this.cachedData = payload.data;

      await fetch(CLOUD_LEADERBOARD_ENDPOINT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn('Cloud submission failed:', e);
    }
  }
}

// ==========================================
// 5. Main Game Engine
// ==========================================
class NeonSurgeGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.sound = new SoundEngine();
    this.cloudLB = new CloudLeaderboardService();

    // Game state
    this.state = 'MENU';
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('neonsurge_highscore') || '0', 10);
    this.lifetimeScore = parseInt(localStorage.getItem('neonsurge_lifetime_score') || '0', 10);
    this.totalOrbs = parseInt(localStorage.getItem('neonsurge_orbs') || '0', 10);
    this.unlockedShips = JSON.parse(localStorage.getItem('neonsurge_unlocked_ships') || '["apex_dart"]');
    this.currentShipId = localStorage.getItem('neonsurge_active_ship') || 'apex_dart';

    // Pilot name
    this.pilotName = localStorage.getItem('neonsurge_pilot_name') || `PILOT_${Math.floor(100 + Math.random() * 900)}`;

    this.runOrbs = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.maxCombo = 1;
    this.distance = 0;

    // Fast-paced baseline velocity
    this.speed = 8.0;
    this.baseSpeed = 8.0;
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
    this.devilModeFactor = 0;

    // Active Leaderboard Tab
    this.activeLeaderboardTab = 'bestRunScores';

    // Tight wave cadence
    this.spawnTimer = 0;
    this.spawnInterval = 0.54;

    // Stackable Power-up States
    this.powerupsState = {
      BOOST: { active: false, timer: 0, max: 3.5, label: '⚡ BOOST', class: 'boost' },
      SHIELD: { active: false, timer: 0, max: 6.5, label: '🛡️ SHIELD', class: 'shield' },
      MAGNET: { active: false, timer: 0, max: 7.5, label: '🧲 MAGNET', class: 'magnet' }
    };

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
    this.devilLightnings = [];

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
    this.initPilotProfile();
    this.initLeaderboardTabs();
    this.updateHUD();
    this.renderHangar();

    // Initial background cloud fetch
    this.cloudLB.fetchLeaderboard();

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  initPilotProfile() {
    const input = document.getElementById('pilotNameInput');
    if (input) {
      input.value = this.pilotName;
      input.addEventListener('input', (e) => {
        const val = e.target.value.trim().toUpperCase().slice(0, 14);
        if (val) {
          this.pilotName = val;
          localStorage.setItem('neonsurge_pilot_name', this.pilotName);
        }
      });
    }
  }

  initLeaderboardTabs() {
    const tabs = document.querySelectorAll('.lb-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeLeaderboardTab = tab.dataset.tab;
        this.renderLeaderboardList();
      });
    });

    document.getElementById('openLeaderboardBtn').addEventListener('click', () => this.openLeaderboard());
    document.getElementById('gameOverLeaderboardBtn').addEventListener('click', () => this.openLeaderboard());
    document.getElementById('closeLeaderboardBtn').addEventListener('click', () => this.closeLeaderboard());
    document.getElementById('closeLeaderboardBtn2').addEventListener('click', () => this.closeLeaderboard());
    document.getElementById('refreshLeaderboardBtn').addEventListener('click', async () => {
      document.getElementById('leaderboardList').innerHTML = '<div class="lb-loading">Refreshing cloud scores...</div>';
      await this.cloudLB.fetchLeaderboard();
      this.renderLeaderboardList();
    });
  }

  async openLeaderboard() {
    document.getElementById('leaderboardScreen').classList.add('active');
    document.getElementById('leaderboardList').innerHTML = '<div class="lb-loading">Syncing global scores from cloud...</div>';
    await this.cloudLB.fetchLeaderboard();
    this.renderLeaderboardList();
  }

  closeLeaderboard() {
    document.getElementById('leaderboardScreen').classList.remove('active');
  }

  renderLeaderboardList() {
    const listEl = document.getElementById('leaderboardList');
    const data = this.cloudLB.cachedData || {};
    const items = data[this.activeLeaderboardTab] || [];

    if (!items || items.length === 0) {
      listEl.innerHTML = '<div class="lb-loading">No scores recorded yet. Be the first!</div>';
      return;
    }

    let html = '';
    items.forEach((item, index) => {
      const rank = index + 1;
      const rankBadge = rank === 1 ? '🥇 #1' : rank === 2 ? '🥈 #2' : rank === 3 ? '🥉 #3' : `#${rank}`;
      const isYou = item.name === this.pilotName;
      
      let valFormatted = '0';
      if (this.activeLeaderboardTab === 'bestRunScores') {
        valFormatted = `${(item.score || 0).toLocaleString()} PTS`;
      } else if (this.activeLeaderboardTab === 'lifetimePoints') {
        valFormatted = `${(item.points || 0).toLocaleString()} PTS`;
      } else if (this.activeLeaderboardTab === 'totalCoins') {
        valFormatted = `${(item.coins || 0).toLocaleString()} 🪙`;
      }

      html += `
        <div class="lb-row top-${Math.min(3, rank)} ${isYou ? 'is-you' : ''}">
          <div class="lb-left">
            <span class="lb-rank">${rankBadge}</span>
            <span class="lb-name">${item.name} ${isYou ? '(YOU)' : ''}</span>
          </div>
          <span class="lb-value">${valFormatted}</span>
        </div>
      `;
    });

    listEl.innerHTML = html;
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
    for (let i = 0; i < 55; i++) {
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

    // Touch & Pointer Drag on Canvas
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
    this.spawnTimer = 0;
    this.devilModeFactor = 0;

    // Reset power-up states
    Object.keys(this.powerupsState).forEach(k => {
      this.powerupsState[k].active = false;
      this.powerupsState[k].timer = 0;
    });

    this.player.x = this.canvas.width / 2;
    this.player.targetX = this.canvas.width / 2;
    this.player.trail = [];

    this.obstacles = [];
    this.orbs = [];
    this.powerups = [];
    this.particles = [];
    this.floatingTexts = [];
    this.devilLightnings = [];

    document.getElementById('startScreen').classList.remove('active');
    document.getElementById('gameOverScreen').classList.remove('active');
    document.getElementById('shopScreen').classList.remove('active');
    document.getElementById('leaderboardScreen').classList.remove('active');
    document.getElementById('activePowerupsContainer').innerHTML = '';

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
    this.lifetimeScore += this.score;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('neonsurge_highscore', this.highScore.toString());
    }
    localStorage.setItem('neonsurge_lifetime_score', this.lifetimeScore.toString());
    localStorage.setItem('neonsurge_orbs', this.totalOrbs.toString());

    // Submit to Global Cloud Leaderboard
    this.cloudLB.submitRun(this.pilotName, this.highScore, this.lifetimeScore, this.totalOrbs);

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

    // Stackable Active Powerups HUD Badges
    const container = document.getElementById('activePowerupsContainer');
    let badgesHtml = '';
    Object.keys(this.powerupsState).forEach(type => {
      const p = this.powerupsState[type];
      if (p.active && p.timer > 0) {
        const pct = Math.max(0, Math.min(100, (p.timer / p.max) * 100));
        badgesHtml += `
          <div class="powerup-badge ${p.class}">
            <span>${p.label}</span>
            <div class="timer-track">
              <div class="timer-fill" style="width: ${pct}%"></div>
            </div>
          </div>
        `;
      }
    });
    container.innerHTML = badgesHtml;
  }

  // ==========================================
  // Stackable Powerup Triggers
  // ==========================================
  triggerHyperBoost() {
    this.powerupsState.BOOST.active = true;
    this.powerupsState.BOOST.timer = this.powerupsState.BOOST.max;
    this.sound.playBoost();
    this.createFloatingText('⚡ HYPER BOOST!', this.player.x, this.player.y - 40, '#00f0ff');
  }

  triggerShield() {
    this.powerupsState.SHIELD.active = true;
    this.powerupsState.SHIELD.timer = this.powerupsState.SHIELD.max;
    this.sound.playPowerup();
    this.createFloatingText('🛡️ SHIELD ONLINE!', this.player.x, this.player.y - 40, '#00ff66');
  }

  triggerMagnet() {
    this.powerupsState.MAGNET.active = true;
    this.powerupsState.MAGNET.timer = this.powerupsState.MAGNET.max;
    this.sound.playMagnet();
    this.createFloatingText('🧲 COIN MAGNET!', this.player.x, this.player.y - 40, '#ffaa00');
  }

  // ==========================================
  // Continuous Color Morphing & Intense Slaughterhouse Flashes
  // ==========================================
  updateZoneSmoothColors() {
    const exactZonePos = Math.max(0, Math.min(ZONES.length - 1, this.score / 50000));
    const baseIdx = Math.floor(exactZonePos);
    const nextIdx = Math.min(ZONES.length - 1, baseIdx + 1);
    const t = exactZonePos - baseIdx;

    const z1 = ZONES[baseIdx];
    const z2 = ZONES[nextIdx];

    this.devilModeFactor = Math.max(0, Math.min(1, (this.score - 170000) / 30000));

    let strobe = 1;
    if (this.devilModeFactor > 0) {
      strobe = 0.45 + Math.sin(Date.now() * 0.038) * 0.55;
    }

    const rP = Math.round(lerp(z1.rPrimary, z2.rPrimary, t) * strobe);
    const gP = Math.round(lerp(z1.gPrimary, z2.gPrimary, t) * (1 - this.devilModeFactor * 0.85));
    const bP = Math.round(lerp(z1.bPrimary, z2.bPrimary, t) * (1 - this.devilModeFactor * 0.85));
    this.activeColors.primary = `rgb(${rP}, ${gP}, ${bP})`;

    const rS = Math.round(lerp(z1.rSecondary, z2.rSecondary, t));
    const gS = Math.round(lerp(z1.gSecondary, z2.gSecondary, t));
    const bS = Math.round(lerp(z1.bSecondary, z2.bSecondary, t));
    this.activeColors.secondary = `rgb(${rS}, ${gS}, ${bS})`;

    const rBT = Math.round(lerp(z1.rBgTop, z2.rBgTop, t) * (1 + (this.devilModeFactor * (strobe - 0.5) * 1.5)));
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
    const alphaG = (lerp(z1.gridAlpha, z2.gridAlpha, t) * strobe).toFixed(3);
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
  // 6. Update Game Loop
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
    
    // Dynamic progressive velocity scaling + Devil mode speed surge!
    const devilSpeedBoost = 1 + (this.devilModeFactor * 0.45);
    this.baseSpeed = (8.0 + Math.min(13.0, Math.pow(this.distance / 2400, 0.82))) * devilSpeedBoost;

    // Handle Boost Speed Multiplier
    if (this.powerupsState.BOOST.active && this.powerupsState.BOOST.timer > 0) {
      this.speed = this.baseSpeed * 1.85;
    } else {
      this.speed = this.baseSpeed;
    }

    // Update continuous seamless zone colors & Slaughterhouse strobe
    this.updateZoneSmoothColors();

    // Combo Timer Decay
    if (this.combo > 1) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 1;
      }
    }

    // Update Stackable Powerup Timers
    Object.keys(this.powerupsState).forEach(k => {
      const p = this.powerupsState[k];
      if (p.active) {
        p.timer -= dt;
        if (p.timer <= 0) {
          p.active = false;
          p.timer = 0;
        }
      }
    });

    // Left/Right Movement (Agile responsive steering)
    if (this.keys.left) this.player.targetX -= 13;
    if (this.keys.right) this.player.targetX += 13;

    const wallMargin = 16;
    this.player.targetX = Math.max(wallMargin, Math.min(this.canvas.width - wallMargin, this.player.targetX));
    const dx = this.player.targetX - this.player.x;
    this.player.x += dx * 0.26;
    this.player.tilt = Math.max(-0.45, Math.min(0.45, dx * 0.03));

    // Player Trail
    this.player.trail.push({ x: this.player.x, y: this.player.y + 18, alpha: 0.8 });
    if (this.player.trail.length > 12) this.player.trail.shift();
    this.player.trail.forEach(t => t.alpha -= 0.06);

    // Wave Spawner Cadence
    const difficultyFactor = Math.min(1, this.score / 90000);
    this.spawnInterval = 0.54 - (difficultyFactor * 0.20);

    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnBalancedWave(difficultyFactor);
    }

    // Spawning Orbs
    if (Math.random() < 0.075) {
      this.orbs.push({
        x: Math.random() * (this.canvas.width - 60) + 30,
        y: -30,
        radius: 12,
        pulse: 0
      });
    }

    // Spawning Power-up Pickups (BOOST, SHIELD, or MAGNET)
    if (Math.random() < 0.015) {
      const randP = Math.random();
      let pType = 'MAGNET';
      if (randP < 0.35) pType = 'BOOST';
      else if (randP < 0.70) pType = 'SHIELD';

      this.powerups.push({
        x: Math.random() * (this.canvas.width - 60) + 30,
        y: -30,
        type: pType,
        radius: 16
      });
    }

    // Devil Zone High-Frequency Lightning Arcs
    if (this.devilModeFactor > 0 && Math.random() < 0.28 * this.devilModeFactor) {
      const lx = Math.random() * this.canvas.width;
      this.devilLightnings.push({
        x1: lx,
        y1: 0,
        x2: lx + (Math.random() * 80 - 40),
        y2: this.canvas.height,
        alpha: 1.0,
        decay: 0.15
      });
    }

    // Update Devil Lightnings
    for (let i = this.devilLightnings.length - 1; i >= 0; i--) {
      const l = this.devilLightnings[i];
      l.alpha -= l.decay;
      if (l.alpha <= 0) this.devilLightnings.splice(i, 1);
    }

    // Obstacles Collision & Movement
    const isInvulnerable = (this.powerupsState.SHIELD.active && this.powerupsState.SHIELD.timer > 0) ||
                           (this.powerupsState.BOOST.active && this.powerupsState.BOOST.timer > 0);

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.y += this.speed;
      obs.rotation += 0.06;
      obs.animPulse += 0.1;

      const hitMargin = obs.isBarrier ? 3 : 6;
      const pBox = { x: this.player.x - 11, y: this.player.y - 15, w: 22, h: 30 };
      const oBox = { x: obs.x + hitMargin, y: obs.y + hitMargin, w: obs.width - (hitMargin * 2), h: obs.height - (hitMargin * 2) };

      if (
        pBox.x < oBox.x + oBox.w &&
        pBox.x + pBox.w > oBox.x &&
        pBox.y < oBox.y + oBox.h &&
        pBox.y + pBox.h > oBox.y
      ) {
        if (isInvulnerable) {
          const zoneColor = this.activeColors.secondary;
          this.createExplosion(obs.x + obs.width / 2, obs.y + obs.height / 2, 24, zoneColor);
          this.obstacles.splice(i, 1);
          this.score += 250 * this.combo;

          const smashTitles = ['+250 LASER SMASH!', '+250 METEOR CRUSH!', '+250 CLAW SHRED!', '+250 VORTEX SHATTER!', '+250 SLAUGHTER!'];
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

    // Orbs Movement & Magnetic Attraction
    const isMagnetActive = this.powerupsState.MAGNET.active && this.powerupsState.MAGNET.timer > 0;
    const magnetRadius = 320;

    for (let i = this.orbs.length - 1; i >= 0; i--) {
      const orb = this.orbs[i];
      orb.y += this.speed;
      orb.pulse += 0.08;

      // 🧲 COIN MAGNET GRAVITATIONAL PULL
      if (isMagnetActive) {
        const mdx = this.player.x - orb.x;
        const mdy = this.player.y - orb.y;
        const mdist = Math.hypot(mdx, mdy);

        if (mdist < magnetRadius) {
          const pullForce = (1 - mdist / magnetRadius) * 20 + 8;
          orb.x += (mdx / mdist) * pullForce;
          orb.y += (mdy / mdist) * pullForce;

          if (Math.random() < 0.3) {
            this.particles.push({
              x: orb.x,
              y: orb.y,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
              radius: 2,
              color: '#ffaa00',
              alpha: 0.8,
              decay: 0.08
            });
          }
        }
      }

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
        if (p.type === 'MAGNET') this.triggerMagnet();

        const pColor = p.type === 'SHIELD' ? '#00ff66' : p.type === 'BOOST' ? '#00f0ff' : '#ffaa00';
        this.createExplosion(p.x, p.y, 20, pColor);
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
  // NIMBLE MULTI-HAZARD CLUSTER ARCHITECTURE (Slightly Smaller Footprints 28px-46px)
  // ==========================================
  spawnBalancedWave(difficultyFactor) {
    const canvasW = this.canvas.width;
    const type = this.activeObstacleType || 'CYBER_LASER';
    const currentZoneIdx = this.currentZoneIdx || 0;

    const randPattern = Math.random();

    // ----------------------------------------------------
    // FORMATION 1: ARROWHEAD SWARM CLUSTER (4 to 5 Hazards, Agile 28px-42px)
    // ----------------------------------------------------
    if (randPattern < 0.28) {
      const clusterCount = difficultyFactor > 0.35 ? 5 : 4;
      const safeOnLeft = Math.random() > 0.5;
      const startX = safeOnLeft ? canvasW * 0.32 : 0;
      const clusterWidth = canvasW * 0.68;

      for (let c = 0; c < clusterCount; c++) {
        const s = Math.floor(Math.random() * 14) + 28; // 28px to 42px
        const offsetX = (c / (clusterCount - 1)) * (clusterWidth - s);
        const posX = Math.max(0, Math.min(canvasW - s, startX + offsetX));
        const posY = -70 - (Math.abs(c - (clusterCount - 1) / 2) * 42);

        this.obstacles.push({
          x: posX,
          y: posY,
          width: s,
          height: s,
          type,
          isBarrier: false,
          zoneIndex: currentZoneIdx,
          rotation: Math.random() * Math.PI,
          animPulse: Math.random() * 5
        });
      }

      const orbX = safeOnLeft ? 22 : canvasW - 22;
      this.orbs.push({ x: orbX, y: -70, radius: 12, pulse: 0 });
      return;
    }

    // ----------------------------------------------------
    // FORMATION 2: DENSE SLALOM WEAVE CLUSTER (4 to 5 Staggered Hazards)
    // ----------------------------------------------------
    if (randPattern < 0.54) {
      const count = difficultyFactor > 0.3 ? 5 : 4;
      const lanes = [
        0,
        Math.floor(canvasW * 0.25),
        Math.floor(canvasW * 0.50),
        Math.floor(canvasW * 0.75),
        Math.floor(canvasW - 38)
      ];

      for (let i = 0; i < count; i++) {
        const laneIdx = (i * 2 + (Math.random() > 0.5 ? 0 : 1)) % lanes.length;
        const s = Math.floor(Math.random() * 12) + 30; // 30-42px
        const posX = Math.max(0, Math.min(canvasW - s, lanes[laneIdx]));

        this.obstacles.push({
          x: posX,
          y: -70 - (i * 42),
          width: s,
          height: s,
          type,
          isBarrier: false,
          zoneIndex: currentZoneIdx,
          rotation: Math.random() * Math.PI,
          animPulse: Math.random() * 5
        });
      }
      return;
    }

    // ----------------------------------------------------
    // FORMATION 3: DUAL WALL CLAMP + CENTER SWARM GAUNTLET
    // ----------------------------------------------------
    if (randPattern < 0.76) {
      const pincerW = Math.max(65, Math.min(canvasW * 0.26, 88));

      // Left Wall Block
      this.obstacles.push({
        x: 0,
        y: -70,
        width: pincerW,
        height: 22,
        type,
        isBarrier: true,
        zoneIndex: currentZoneIdx,
        rotation: 0,
        animPulse: 0
      });

      // Right Wall Block
      this.obstacles.push({
        x: canvasW - pincerW,
        y: -70,
        width: pincerW,
        height: 22,
        type,
        isBarrier: true,
        zoneIndex: currentZoneIdx,
        rotation: 0,
        animPulse: 0
      });

      // Staggered Center Hazards
      const cSize1 = 30;
      const cSize2 = 34;
      this.obstacles.push({
        x: canvasW * 0.42 - cSize1 / 2,
        y: -125,
        width: cSize1,
        height: cSize1,
        type,
        isBarrier: false,
        zoneIndex: currentZoneIdx,
        rotation: 0.6,
        animPulse: 0
      });

      this.obstacles.push({
        x: canvasW * 0.58 - cSize2 / 2,
        y: -175,
        width: cSize2,
        height: cSize2,
        type,
        isBarrier: false,
        zoneIndex: currentZoneIdx,
        rotation: -0.6,
        animPulse: 0
      });

      this.orbs.push({ x: canvasW / 2, y: -70, radius: 12, pulse: 0 });
      return;
    }

    // ----------------------------------------------------
    // FORMATION 4: WALL FORTRESS + MULTI-HAZARD ESCORT CLUSTER
    // ----------------------------------------------------
    const isLeftWall = Math.random() > 0.5;
    const fortressW = Math.max(70, Math.min(canvasW * 0.30, 95));

    this.obstacles.push({
      x: isLeftWall ? 0 : canvasW - fortressW,
      y: -70,
      width: fortressW,
      height: 24,
      type,
      isBarrier: true,
      zoneIndex: currentZoneIdx,
      rotation: 0,
      animPulse: 0
    });

    const openAreaStart = isLeftWall ? fortressW + 15 : 10;
    const openAreaW = canvasW - fortressW - 25;

    for (let h = 0; h < 3; h++) {
      const s = Math.floor(Math.random() * 12) + 28; // 28-40px
      const posX = openAreaStart + ((h / 2) * (openAreaW - s));

      this.obstacles.push({
        x: Math.max(0, Math.min(canvasW - s, posX)),
        y: -115 - (h * 46),
        width: s,
        height: s,
        type,
        isBarrier: false,
        zoneIndex: currentZoneIdx,
        rotation: Math.random() * Math.PI,
        animPulse: Math.random() * 5
      });
    }

    this.orbs.push({ x: isLeftWall ? canvasW - 22 : 22, y: -70, radius: 12, pulse: 0 });
  }

  // ==========================================
  // 7. Render Scene
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

    // Slaughterhouse Devil Atmosphere & High-Frequency Strobe Flashes
    if (this.devilModeFactor > 0) {
      this.ctx.save();
      if (Math.random() < 0.28 * this.devilModeFactor) {
        const isWhiteFlash = Math.random() < 0.3;
        this.ctx.fillStyle = isWhiteFlash
          ? `rgba(255, 255, 255, ${0.28 * this.devilModeFactor})`
          : `rgba(255, 0, 34, ${0.35 * this.devilModeFactor})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }

      // Devil Blood Lightnings
      this.devilLightnings.forEach(l => {
        this.ctx.strokeStyle = `rgba(255, 0, 40, ${l.alpha})`;
        this.ctx.shadowColor = '#ff0033';
        this.ctx.shadowBlur = 16;
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.moveTo(l.x1, l.y1);
        const midX = (l.x1 + l.x2) / 2 + (Math.random() * 40 - 20);
        const midY = this.canvas.height * 0.5;
        this.ctx.lineTo(midX, midY);
        this.ctx.lineTo(l.x2, l.y2);
        this.ctx.stroke();
      });

      this.ctx.restore();
    }

    // Stars / Blood Embers
    this.ctx.fillStyle = this.activeColors.primary;
    this.stars.forEach(star => {
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size * (1 + this.devilModeFactor * 0.6), 0, Math.PI * 2);
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
      const color = p.type === 'SHIELD' ? '#00ff66' : p.type === 'BOOST' ? '#00f0ff' : '#ffaa00';
      const icon = p.type === 'SHIELD' ? '🛡️' : p.type === 'BOOST' ? '⚡' : '🧲';

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
      this.ctx.fillText(icon, p.x, p.y);
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
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
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
        this.ctx.lineWidth = 2.5;
        this.ctx.strokeRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 4, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
      return;
    }

    // 2. METEORITE
    if (obs.type === 'METEORITE') {
      this.ctx.shadowColor = '#ff3300';
      this.ctx.shadowBlur = 18;

      if (obs.isBarrier) {
        this.ctx.fillStyle = 'rgba(255, 51, 0, 0.55)';
        this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        this.ctx.strokeStyle = '#ffe600';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

        this.ctx.fillStyle = '#ffe600';
        for (let lx = obs.x + 8; lx < obs.x + obs.width; lx += 18) {
          this.ctx.beginPath();
          this.ctx.arc(lx, cy + Math.sin(obs.animPulse + lx) * 3, 3, 0, Math.PI * 2);
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
        this.ctx.lineWidth = 2.5;
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
      this.ctx.shadowBlur = 16;

      if (obs.isBarrier) {
        this.ctx.fillStyle = 'rgba(0, 255, 102, 0.45)';
        this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        this.ctx.strokeStyle = '#aaff00';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

        this.ctx.fillStyle = '#aaff00';
        for (let bx = obs.x + 8; bx < obs.x + obs.width; bx += 16) {
          this.ctx.beginPath();
          this.ctx.moveTo(bx - 5, obs.y);
          this.ctx.lineTo(bx, obs.y - 8);
          this.ctx.lineTo(bx + 5, obs.y);
          this.ctx.closePath();
          this.ctx.fill();
        }
      } else {
        this.ctx.translate(cx, cy);
        this.ctx.rotate(obs.rotation * 0.4);

        const rad = obs.width / 2;

        this.ctx.fillStyle = '#051f0f';
        this.ctx.strokeStyle = '#00ff66';
        this.ctx.lineWidth = 3;

        this.ctx.beginPath();
        this.ctx.ellipse(0, 5, rad * 0.8, rad * 0.6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#aaff00';
        [-rad * 0.5, 0, rad * 0.5].forEach(offset => {
          this.ctx.beginPath();
          this.ctx.moveTo(offset - 4, 0);
          this.ctx.lineTo(offset, -rad * 1.05);
          this.ctx.lineTo(offset + 4, 0);
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
      this.ctx.shadowBlur = 20;

      if (obs.isBarrier) {
        this.ctx.fillStyle = 'rgba(157, 0, 255, 0.5)';
        this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        this.ctx.strokeStyle = '#00f0ff';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 7 + Math.sin(obs.animPulse) * 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.translate(cx, cy);
        this.ctx.rotate(obs.rotation * 1.6);

        const rad = obs.width / 2;

        this.ctx.fillStyle = '#06010a';
        this.ctx.strokeStyle = '#9d00ff';
        this.ctx.lineWidth = 3.5;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, rad, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.strokeStyle = '#00f0ff';
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, rad * 0.7, 0, Math.PI * 1.3);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.arc(0, 0, rad * 0.4, Math.PI, Math.PI * 2.3);
        this.ctx.stroke();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 4, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
      return;
    }

    // 5. DEVIL_SLAUGHTER
    if (obs.type === 'DEVIL_SLAUGHTER') {
      this.ctx.shadowColor = '#ff0022';
      this.ctx.shadowBlur = 22;

      if (obs.isBarrier) {
        this.ctx.fillStyle = 'rgba(255, 0, 34, 0.65)';
        this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        this.ctx.strokeStyle = '#ff3344';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

        this.ctx.fillStyle = '#ffffff';
        for (let sx = obs.x + 8; sx < obs.x + obs.width; sx += 14) {
          this.ctx.beginPath();
          this.ctx.moveTo(sx - 4, obs.y);
          this.ctx.lineTo(sx, obs.y - 7);
          this.ctx.lineTo(sx + 4, obs.y);
          this.ctx.closePath();
          this.ctx.fill();
        }
      } else {
        this.ctx.translate(cx, cy);
        this.ctx.rotate(obs.rotation * 2.2);

        const rad = obs.width / 2;

        this.ctx.fillStyle = '#ff0022';
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;

        const teeth = 8;
        this.ctx.beginPath();
        for (let i = 0; i < teeth * 2; i++) {
          const angle = (i * Math.PI) / teeth;
          const r = i % 2 === 0 ? rad * 1.15 : rad * 0.75;
          const tx = Math.cos(angle) * r;
          const ty = Math.sin(angle) * r;
          if (i === 0) this.ctx.moveTo(tx, ty);
          else this.ctx.lineTo(tx, ty);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#330005';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, rad * 0.45, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#ff0022';
        this.ctx.lineWidth = 2.5;
        this.ctx.stroke();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        this.ctx.fill();
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

    // Active Shield Visual Aura
    if (this.powerupsState.SHIELD.active && this.powerupsState.SHIELD.timer > 0) {
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
    if (this.powerupsState.BOOST.active && this.powerupsState.BOOST.timer > 0) {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 36, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // Active Magnet Magnetic Pulse Rings
    if (this.powerupsState.MAGNET.active && this.powerupsState.MAGNET.timer > 0) {
      this.ctx.save();
      const mPulse = (Date.now() * 0.005) % 1;
      this.ctx.strokeStyle = `rgba(255, 170, 0, ${1 - mPulse})`;
      this.ctx.shadowColor = '#ffaa00';
      this.ctx.shadowBlur = 14;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 24 + mPulse * 28, 0, Math.PI * 2);
      this.ctx.stroke();
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
