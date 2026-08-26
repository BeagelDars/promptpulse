/**
 * NEON SURGE | Cyber Velocity Arcade Engine (Mobile & Desktop Edition)
 * Responsive Canvas, Touch Controls, Web Audio Synthesizer & Skin Shop.
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
      const bufferSize = this.ctx.sampleRate * 0.3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.3);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

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
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {}
  }
}

// ==========================================
// 2. Ships Data & Skins
// ==========================================
const SHIP_SKINS = [
  { id: 'apex_dart', name: 'APEX DART', color: '#00f0ff', accent: '#ff0077', cost: 0, desc: 'Balanced interceptor with dual plasma thrusters.' },
  { id: 'void_phantom', name: 'VOID PHANTOM', color: '#9d00ff', accent: '#ff00aa', cost: 25, desc: 'Stealth-crafted chassis with hyper-flux shielding.' },
  { id: 'solar_flare', name: 'SOLAR FLARE', color: '#ffe600', accent: '#ff5500', cost: 60, desc: 'Heavy particle radiator and magnetic intake aura.' },
  { id: 'matrix_core', name: 'MATRIX GHOST', color: '#00ff66', accent: '#00ffff', cost: 120, desc: 'Legendary cyber rig engineered for maximum velocity.' }
];

// ==========================================
// 3. Main Game Engine
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
    this.speed = 7;
    this.baseSpeed = 7;
    this.screenShake = 0;

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
      if (e.code === 'Space' && this.state === 'PLAYING') {
        this.triggerHyperBoost();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = false;
    });

    // Touch & Pointer Drag on Canvas
    const setTargetFromPointer = (clientX) => {
      const rect = this.canvas.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      this.player.targetX = Math.max(25, Math.min(this.canvas.width - 25, relativeX));
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
    const btnBoost = document.getElementById('btnTouchBoost');

    // Left Button
    const startLeft = (e) => { e.preventDefault(); this.sound.init(); this.keys.left = true; };
    const endLeft = (e) => { e.preventDefault(); this.keys.left = false; };
    btnLeft.addEventListener('pointerdown', startLeft);
    btnLeft.addEventListener('pointerup', endLeft);
    btnLeft.addEventListener('pointerleave', endLeft);

    // Right Button
    const startRight = (e) => { e.preventDefault(); this.sound.init(); this.keys.right = true; };
    const endRight = (e) => { e.preventDefault(); this.keys.right = false; };
    btnRight.addEventListener('pointerdown', startRight);
    btnRight.addEventListener('pointerup', endRight);
    btnRight.addEventListener('pointerleave', endRight);

    // Boost Button
    btnBoost.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.sound.init();
      if (this.state === 'PLAYING') this.triggerHyperBoost();
    });
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

    this.createExplosion(this.player.x, this.player.y, 35, '#ff0077');
    this.createExplosion(this.player.x, this.player.y, 25, '#00f0ff');

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
      card.innerHTML = `
        <div class="ship-preview-box">
          <svg width="34" height="40" viewBox="0 0 40 46">
            <polygon points="20,2 38,40 20,32 2,40" fill="${skin.color}" stroke="${skin.accent}" stroke-width="2"/>
          </svg>
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
    
    const badge = document.getElementById('multiplierBadge');
    badge.textContent = `${this.combo}x`;
    if (this.combo > 1) {
      badge.style.color = '#00f0ff';
      badge.style.borderColor = '#00f0ff';
    } else {
      badge.style.color = '#ff0077';
      badge.style.borderColor = 'rgba(255, 0, 119, 0.3)';
    }
  }

  triggerHyperBoost() {
    if (this.activePowerup === 'BOOST') return;
    this.activePowerup = 'BOOST';
    this.powerupDuration = 3.5;
    this.powerupMaxDuration = 3.5;
    this.speed = this.baseSpeed * 2.2;
    this.sound.playBoost();
    this.createFloatingText('HYPER BOOST!', this.player.x, this.player.y - 40, '#00f0ff');
  }

  triggerShield() {
    this.activePowerup = 'SHIELD';
    this.powerupDuration = 6.0;
    this.powerupMaxDuration = 6.0;
    this.sound.playPowerup();
    this.createFloatingText('SHIELD READY!', this.player.x, this.player.y - 40, '#00ff66');
  }

  createExplosion(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3.5 + 1.5,
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
  // 4. Update Game Loop
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

    this.distance += this.speed * dt * 10;
    this.score += Math.round(this.speed * this.combo * 0.5);
    this.baseSpeed = 7 + Math.min(12, this.distance / 2500);

    if (this.combo > 1) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 1;
        this.updateHUD();
      }
    }

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

    // Left/Right Button Movement
    if (this.keys.left) this.player.targetX -= 10;
    if (this.keys.right) this.player.targetX += 10;

    this.player.targetX = Math.max(25, Math.min(this.canvas.width - 25, this.player.targetX));
    const dx = this.player.targetX - this.player.x;
    this.player.x += dx * 0.2;
    this.player.tilt = Math.max(-0.4, Math.min(0.4, dx * 0.025));

    // Trail
    this.player.trail.push({ x: this.player.x, y: this.player.y + 18, alpha: 0.8 });
    if (this.player.trail.length > 12) this.player.trail.shift();
    this.player.trail.forEach(t => t.alpha -= 0.06);

    // Spawning Obstacles
    if (Math.random() < 0.032 + (this.baseSpeed * 0.002)) {
      const type = Math.random() > 0.4 ? 'barrier' : 'spike';
      const width = type === 'barrier' ? Math.random() * 60 + 60 : 36;
      this.obstacles.push({
        x: Math.random() * (this.canvas.width - width - 20) + 10,
        y: -50,
        width,
        height: type === 'barrier' ? 16 : 36,
        type,
        rotation: 0
      });
    }

    // Spawning Orbs
    if (Math.random() < 0.05) {
      this.orbs.push({
        x: Math.random() * (this.canvas.width - 40) + 20,
        y: -30,
        radius: 11,
        pulse: 0
      });
    }

    // Spawning Power-ups
    if (Math.random() < 0.006 && !this.activePowerup) {
      const pType = Math.random() > 0.5 ? 'SHIELD' : 'BOOST';
      this.powerups.push({
        x: Math.random() * (this.canvas.width - 40) + 20,
        y: -30,
        type: pType,
        radius: 15
      });
    }

    // Obstacles Collision
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.y += this.speed;
      obs.rotation += 0.04;

      const pBox = { x: this.player.x - 14, y: this.player.y - 18, w: 28, h: 36 };
      if (
        pBox.x < obs.x + obs.width &&
        pBox.x + pBox.w > obs.x &&
        pBox.y < obs.y + obs.height &&
        pBox.y + pBox.h > obs.y
      ) {
        if (this.activePowerup === 'SHIELD' || this.activePowerup === 'BOOST') {
          this.createExplosion(obs.x + obs.width / 2, obs.y + obs.height / 2, 16, '#00f0ff');
          this.obstacles.splice(i, 1);
          this.score += 250 * this.combo;
          this.createFloatingText('+250 SMASH!', obs.x, obs.y, '#00f0ff');
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
        this.comboTimer = 3.0;
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

    // Power-ups Collision
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
  // 5. Render Scene
  // ==========================================
  draw() {
    this.ctx.save();

    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      this.ctx.translate(shakeX, shakeY);
    }

    this.ctx.fillStyle = '#070913';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawGrid();

    // Stars
    this.ctx.fillStyle = '#ffffff';
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

    // Power-ups
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

    // Obstacles
    this.obstacles.forEach(obs => {
      this.ctx.save();
      this.ctx.shadowColor = '#ff0055';
      this.ctx.shadowBlur = 14;

      if (obs.type === 'barrier') {
        this.ctx.fillStyle = 'rgba(255, 0, 85, 0.4)';
        this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        this.ctx.strokeStyle = '#ff0055';
        this.ctx.lineWidth = 2.5;
        this.ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
      } else {
        this.ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
        this.ctx.rotate(obs.rotation);
        this.ctx.fillStyle = '#ff0055';
        this.ctx.fillRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);
      }
      this.ctx.restore();
    });

    // Player Trail
    this.player.trail.forEach(t => {
      this.ctx.save();
      this.ctx.fillStyle = `rgba(0, 240, 255, ${t.alpha * 0.4})`;
      this.ctx.beginPath();
      this.ctx.arc(t.x, t.y, 5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    // Ship
    if (this.state === 'PLAYING' || this.state === 'MENU') {
      this.drawPlayerShip();
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

  drawGrid() {
    const horizon = this.canvas.height * 0.45;
    const gridOffset = (this.distance * 0.8) % 36;

    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
    this.ctx.lineWidth = 1;

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

  drawPlayerShip() {
    const currentSkin = SHIP_SKINS.find(s => s.id === this.currentShipId) || SHIP_SKINS[0];
    const px = this.player.x;
    const py = this.player.y;

    this.ctx.save();
    this.ctx.translate(px, py);
    this.ctx.rotate(this.player.tilt);

    if (this.activePowerup === 'SHIELD') {
      this.ctx.save();
      this.ctx.strokeStyle = '#00ff66';
      this.ctx.shadowColor = '#00ff66';
      this.ctx.shadowBlur = 18;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 32, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }

    if (this.activePowerup === 'BOOST') {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(0, 240, 255, 0.3)';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 34, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

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
