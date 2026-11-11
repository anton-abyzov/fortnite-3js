import type { BotAgent } from '../ai/bot-agent';
import { WEAPON_SLOT_ORDER, WEAPON_SPECS, type WeaponInventory } from '../combat/weapons';
import type { ManagedVehicle } from '../vehicles/vehicle-manager';
import { MIAMI_BRIDGES, MIAMI_ISLANDS } from '../world/miami-layout';
import type { ShopDefinition } from '../types/game';
import type { TelemetrySnapshot, TimePreset } from '../types/game';

export interface HudCallbacks {
  onStartDrop: () => void;
  onSelectPreset: (preset: TimePreset) => void;
  onScrubHours: (hours: number) => void;
  onToggleTimelapse: () => void;
  onTogglePathTracer: () => void;
}

export class SunbreakHud {
  public readonly root: HTMLElement;
  private readonly radarCanvas: HTMLCanvasElement;
  private readonly radarCtx: CanvasRenderingContext2D;
  private readonly aliveEl: HTMLElement;
  private readonly elimEl: HTMLElement;
  private readonly compassBearingEl: HTMLElement;
  private readonly altitudeEl: HTMLElement;
  private readonly fpsEl: HTMLElement;
  private readonly districtEl: HTMLElement;
  private readonly clockEl: HTMLElement;
  private readonly timeSlider: HTMLInputElement;
  private readonly timelapseBtn: HTMLButtonElement;
  private readonly pathTraceBtn: HTMLButtonElement;
  private readonly pathTraceLabel: HTMLElement;
  private readonly presetBtns = new Map<TimePreset, HTMLButtonElement>();
  private readonly reticleEl: HTMLElement;
  private readonly interactPromptEl: HTMLElement;
  private readonly interactTextEl: HTMLElement;
  private readonly shieldFill: HTMLElement;
  private readonly shieldVal: HTMLElement;
  private readonly healthFill: HTMLElement;
  private readonly healthVal: HTMLElement;
  private readonly staminaFill: HTMLElement;
  private readonly staminaVal: HTMLElement;
  private readonly vehicleCard: HTMLElement;
  private readonly vehicleNameEl: HTMLElement;
  private readonly vehicleSpeedEl: HTMLElement;
  private readonly ammoMagEl: HTMLElement;
  private readonly ammoResEl: HTMLElement;
  private readonly weaponSlotEls: HTMLElement[] = [];
  private readonly briefingModal: HTMLElement;
  private readonly briefingTitle: HTMLElement;
  private readonly briefingLead: HTMLElement;
  private readonly briefingCta: HTMLButtonElement;
  private readonly toastFeed: HTMLElement;

  private hitFlashTimer = 0;

  constructor(container: HTMLElement, callbacks: HudCallbacks) {
    this.root = document.createElement('div');
    this.root.className = 'hud-layer';
    this.root.innerHTML = `
      <div class="radar-panel">
        <canvas class="radar-canvas" width="192" height="192"></canvas>
        <div class="radar-meta">
          <span class="radar-alive" data-testid="alive-counter">19 Active</span>
          <span data-testid="elim-counter">0 Eliminated</span>
        </div>
      </div>

      <div class="top-compass">
        <div class="compass-pill">
          <span data-testid="compass-bearing">N 000°</span>
          <span data-testid="altitude-readout">ALT 142m</span>
          <span data-testid="fps-readout">60 FPS</span>
        </div>
        <div class="district-banner" data-testid="district-banner">Biscayne Flight Corridor</div>
      </div>

      <div class="lighting-studio">
        <div class="studio-row">
          <span class="studio-title">Miami Solar & GI Studio</span>
          <span class="studio-clock" data-testid="solar-clock">16:48</span>
        </div>
        <div class="studio-row">
          <div class="preset-group">
            <button type="button" class="studio-btn" data-preset="dawn">Dawn</button>
            <button type="button" class="studio-btn" data-preset="noon">Noon</button>
            <button type="button" class="studio-btn" data-preset="sunset">Sunset</button>
            <button type="button" class="studio-btn" data-preset="night">Night</button>
          </div>
        </div>
        <div class="studio-row">
          <input type="range" min="0" max="24" step="0.05" value="16.8" class="time-slider" aria-label="Solar time hours" />
        </div>
        <div class="studio-row">
          <button type="button" class="studio-btn" data-testid="timelapse-btn" style="width:100%">Solar Orbit [T]: Hold</button>
        </div>
        <div class="studio-row">
          <button type="button" class="studio-btn pathtrace-btn" data-testid="pathtrace-btn">
            <span>BVH Path-Trace GI [P]</span>
            <span data-testid="pathtrace-spp">Live 60Hz</span>
          </button>
        </div>
      </div>

      <div class="reticle-wrap">
        <div class="reticle-line top"></div>
        <div class="reticle-line bottom"></div>
        <div class="reticle-line left"></div>
        <div class="reticle-line right"></div>
      </div>

      <div class="toast-feed"></div>

      <div class="interact-prompt hidden" data-testid="interact-prompt">
        <span class="key-chip">E</span><span class="interact-text">Board Vehicle</span>
      </div>

      <div class="vitals-panel">
        <div class="bar-row">
          <div class="bar-header"><span>Coastal Shield</span><span class="bar-val" data-testid="shield-val">50</span></div>
          <div class="bar-track"><div class="bar-fill shield" style="width:50%"></div></div>
        </div>
        <div class="bar-row">
          <div class="bar-header"><span>Health</span><span class="bar-val" data-testid="health-val">100</span></div>
          <div class="bar-track"><div class="bar-fill health" style="width:100%"></div></div>
        </div>
        <div class="bar-row">
          <div class="bar-header"><span>Sprint & Swim Stamina</span><span class="bar-val" data-testid="stamina-val">100%</span></div>
          <div class="bar-track"><div class="bar-fill stamina" style="width:100%"></div></div>
        </div>
      </div>

      <div class="controls-strip">
        Space Jump · WASD Move · Shift Boost · C Crouch · E Board / Shop · P Path-Trace GI
      </div>

      <div class="arsenal-panel">
        <div class="vehicle-card hidden" data-testid="vehicle-card">
          <span class="vehicle-name">Miami Convertible</span>
          <span class="vehicle-speed">0 km/h</span>
        </div>
        <div class="ammo-readout">
          <span data-testid="ammo-mag">30</span> <span class="ammo-reserve">/ <span data-testid="ammo-reserve">120</span></span>
        </div>
        <div class="weapon-rack"></div>
      </div>

      <div class="briefing-modal" data-testid="briefing-modal">
        <div class="briefing-card">
          <h1 class="briefing-title">Sunbreak: Biscayne</h1>
          <p class="briefing-lead">
            Leap from the twin-turboprop jump plane over Miami’s Intracoastal canals, Ocean Drive storefronts, and Atlantic surf. Drive roadsters over Venetian bridges, carve canals on jet skis and speedboats, loot neighborhood shops, and outlast 18 drop rivals.
          </p>
          <div class="briefing-grid">
            <div><strong>Space</strong> Jump & Steer Canopy</div>
            <div><strong>WASD + Shift</strong> Sprint, Swim & Drive</div>
            <div><strong>E</strong> Enter Vehicles & Ring Shops</div>
            <div><strong>Click / Right-Click</strong> Fire & Sight Aim</div>
            <div><strong>1 - 4 / R</strong> Switch Weapons & Reload</div>
            <div><strong>P / [ ]</strong> GPU Path-Trace GI & Sun Time</div>
          </div>
          <button type="button" class="briefing-cta" data-testid="start-drop-btn">Drop Into Biscayne</button>
        </div>
      </div>
    `;

    container.appendChild(this.root);

    this.radarCanvas = this.root.querySelector('.radar-canvas') as HTMLCanvasElement;
    this.radarCtx = this.radarCanvas.getContext('2d')!;
    this.aliveEl = this.root.querySelector('[data-testid="alive-counter"]')!;
    this.elimEl = this.root.querySelector('[data-testid="elim-counter"]')!;
    this.compassBearingEl = this.root.querySelector('[data-testid="compass-bearing"]')!;
    this.altitudeEl = this.root.querySelector('[data-testid="altitude-readout"]')!;
    this.fpsEl = this.root.querySelector('[data-testid="fps-readout"]')!;
    this.districtEl = this.root.querySelector('[data-testid="district-banner"]')!;
    this.clockEl = this.root.querySelector('[data-testid="solar-clock"]')!;
    this.timeSlider = this.root.querySelector('.time-slider') as HTMLInputElement;
    this.timelapseBtn = this.root.querySelector('[data-testid="timelapse-btn"]') as HTMLButtonElement;
    this.pathTraceBtn = this.root.querySelector('[data-testid="pathtrace-btn"]') as HTMLButtonElement;
    this.pathTraceLabel = this.root.querySelector('[data-testid="pathtrace-spp"]')!;
    this.reticleEl = this.root.querySelector('.reticle-wrap')!;
    this.interactPromptEl = this.root.querySelector('[data-testid="interact-prompt"]')!;
    this.interactTextEl = this.root.querySelector('.interact-text')!;
    this.shieldFill = this.root.querySelector('.bar-fill.shield')!;
    this.shieldVal = this.root.querySelector('[data-testid="shield-val"]')!;
    this.healthFill = this.root.querySelector('.bar-fill.health')!;
    this.healthVal = this.root.querySelector('[data-testid="health-val"]')!;
    this.staminaFill = this.root.querySelector('.bar-fill.stamina')!;
    this.staminaVal = this.root.querySelector('[data-testid="stamina-val"]')!;
    this.vehicleCard = this.root.querySelector('[data-testid="vehicle-card"]')!;
    this.vehicleNameEl = this.root.querySelector('.vehicle-name')!;
    this.vehicleSpeedEl = this.root.querySelector('.vehicle-speed')!;
    this.ammoMagEl = this.root.querySelector('[data-testid="ammo-mag"]')!;
    this.ammoResEl = this.root.querySelector('[data-testid="ammo-reserve"]')!;
    this.briefingModal = this.root.querySelector('[data-testid="briefing-modal"]')!;
    this.briefingTitle = this.root.querySelector('.briefing-title')!;
    this.briefingLead = this.root.querySelector('.briefing-lead')!;
    this.briefingCta = this.root.querySelector('[data-testid="start-drop-btn"]') as HTMLButtonElement;
    this.toastFeed = this.root.querySelector('.toast-feed')!;

    const rack = this.root.querySelector('.weapon-rack')!;
    WEAPON_SLOT_ORDER.forEach((wid, idx) => {
      const slot = document.createElement('div');
      slot.className = 'weapon-slot';
      slot.innerHTML = `<div class="slot-key">[${idx + 1}]</div><div class="slot-name">${WEAPON_SPECS[wid].name}</div>`;
      rack.appendChild(slot);
      this.weaponSlotEls.push(slot);
    });

    this.root.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((btn) => {
      const preset = btn.dataset.preset as TimePreset;
      this.presetBtns.set(preset, btn);
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        callbacks.onSelectPreset(preset);
      });
    });

    this.timeSlider.addEventListener('input', (e) => {
      e.stopPropagation();
      callbacks.onScrubHours(Number.parseFloat(this.timeSlider.value));
    });

    this.timelapseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      callbacks.onToggleTimelapse();
    });

    this.pathTraceBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      callbacks.onTogglePathTracer();
    });

    this.briefingCta.addEventListener('click', (e) => {
      e.stopPropagation();
      this.hideBriefing();
      callbacks.onStartDrop();
    });
  }

  hideBriefing(): void {
    this.briefingModal.classList.add('hidden');
  }

  showMatchResult(victory: boolean, eliminations: number): void {
    this.briefingTitle.textContent = victory ? 'Biscayne Crown Secured' : 'Eliminated in Biscayne';
    this.briefingLead.textContent = victory
      ? `You outlasted all 18 coastal rivals across Miami’s canals and storefronts with ${eliminations} eliminations.`
      : `Match concluded with ${eliminations} eliminations. Drop back in aboard the next coastal flight.`;
    this.briefingCta.textContent = 'Launch New Coastal Drop';
    this.briefingModal.classList.remove('hidden');
  }

  triggerHitmarker(): void {
    this.hitFlashTimer = 0.14;
    this.reticleEl.classList.add('hit');
  }

  pushToast(text: string): void {
    const el = document.createElement('div');
    el.className = 'toast-item';
    el.textContent = text;
    this.toastFeed.appendChild(el);
    window.setTimeout(() => {
      el.remove();
    }, 3200);
  }

  update(
    dt: number,
    snap: TelemetrySnapshot,
    weapons: WeaponInventory,
    promptLabel: string | null,
    timelapseActive: boolean,
    shops: readonly ShopDefinition[],
    vehicles: readonly ManagedVehicle[],
    bots: readonly BotAgent[],
    stormCenter: { x: number; y: number },
    playerYaw: number,
  ): void {
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= dt;
      if (this.hitFlashTimer <= 0) {
        this.reticleEl.classList.remove('hit');
      }
    }

    const totalAlive = snap.aliveBots + (snap.health > 0 ? 1 : 0);
    this.aliveEl.textContent = `${totalAlive} Active`;
    this.elimEl.textContent = `${snap.eliminations} Eliminated`;

    const deg = (((Math.round((-playerYaw * 180) / Math.PI) % 360) + 360) % 360);
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const cardinal = dirs[Math.round(deg / 45) % 8];
    this.compassBearingEl.textContent = `${cardinal} ${String(deg).padStart(3, '0')}°`;
    this.altitudeEl.textContent = `ALT ${Math.max(0, Math.round(snap.playerPos.y))}m`;
    this.fpsEl.textContent = `${Math.round(snap.fps)} FPS`;

    // District or shop name
    if (snap.currentShopName) {
      this.districtEl.textContent = snap.currentShopName;
    } else if (snap.phase === 'aircraft') {
      this.districtEl.textContent = 'Jump Plane · Press Space to Drop';
    } else if (snap.phase === 'freefall') {
      this.districtEl.textContent = 'Freefall · Space Opens Ram-Air Canopy';
    } else if (snap.phase === 'canopy') {
      this.districtEl.textContent = 'Ram-Air Canopy Glide';
    } else if (snap.playerPos.x > 48) {
      this.districtEl.textContent = 'South Beach & Atlantic Surf';
    } else if (snap.playerPos.x > 6) {
      this.districtEl.textContent = 'Ocean Drive Art Deco Strip';
    } else if (snap.playerPos.x > -24) {
      this.districtEl.textContent = 'Intracoastal Waterway';
    } else {
      this.districtEl.textContent = 'Brickell & Venetian Canals';
    }

    // Solar clock HH:MM
    const wholeH = Math.floor(snap.timeHours);
    const mins = Math.floor((snap.timeHours - wholeH) * 60);
    this.clockEl.textContent = `${String(wholeH).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    if (document.activeElement !== this.timeSlider) {
      this.timeSlider.value = snap.timeHours.toFixed(2);
    }

    this.timelapseBtn.textContent = timelapseActive
      ? 'Solar Orbit [T]: Live'
      : 'Solar Orbit [T]: Hold';
    this.timelapseBtn.classList.toggle('active', timelapseActive);

    const isPT = snap.renderMode === 'pathtraced';
    this.pathTraceBtn.classList.toggle('active', isPT);
    this.pathTraceLabel.textContent = isPT ? `${snap.pathTracerSamples} SPP` : 'Live 60Hz';

    // Interaction prompt
    if (promptLabel) {
      this.interactPromptEl.classList.remove('hidden');
      this.interactTextEl.textContent = promptLabel;
    } else {
      this.interactPromptEl.classList.add('hidden');
    }

    // Vitals
    this.shieldFill.style.width = `${Math.round(snap.shield)}%`;
    this.shieldVal.textContent = String(Math.round(snap.shield));
    this.healthFill.style.width = `${Math.round(snap.health)}%`;
    this.healthVal.textContent = String(Math.round(snap.health));
    this.staminaFill.style.width = `${Math.round(snap.stamina)}%`;
    this.staminaVal.textContent =
      snap.speedBoostSec > 0 ? `CAFECITO ${snap.speedBoostSec.toFixed(0)}s` : `${Math.round(snap.stamina)}%`;

    // Vehicle speedometer card
    if (snap.activeVehicleKind) {
      this.vehicleCard.classList.remove('hidden');
      const names = {
        convertible: 'Miami Convertible',
        suv: 'Coastal Cruiser SUV',
        jetski: 'Biscayne Jet Ski',
        speedboat: 'Center-Console Speedboat',
      };
      this.vehicleNameEl.textContent = names[snap.activeVehicleKind];
      this.vehicleSpeedEl.textContent = `${Math.round(snap.activeVehicleSpeedKmh)} km/h`;
    } else {
      this.vehicleCard.classList.add('hidden');
    }

    // Arsenal
    this.ammoMagEl.textContent =
      weapons.reloadRemainingSec > 0 ? 'RLD' : String(snap.ammoInMag);
    this.ammoResEl.textContent = String(snap.reserveAmmo);
    WEAPON_SLOT_ORDER.forEach((wid, idx) => {
      const el = this.weaponSlotEls[idx];
      el.classList.toggle('unlocked', weapons.unlocked.has(wid));
      el.classList.toggle('active', weapons.activeId === wid);
    });

    this.drawRadar(snap, shops, vehicles, bots, stormCenter, playerYaw);
  }

  private drawRadar(
    snap: TelemetrySnapshot,
    shops: readonly ShopDefinition[],
    vehicles: readonly ManagedVehicle[],
    bots: readonly BotAgent[],
    stormCenter: { x: number; y: number },
    playerYaw: number,
  ): void {
    const ctx = this.radarCtx;
    const w = this.radarCanvas.width;
    const h = this.radarCanvas.height;
    const scale = w / 300; // maps [-150, +150] world meters -> [0, 192] px
    const toPxX = (wx: number) => w * 0.5 + wx * scale;
    const toPxY = (wz: number) => h * 0.5 + wz * scale;

    // Deep turquoise canal & Atlantic Ocean water base
    ctx.fillStyle = '#083a47';
    ctx.fillRect(0, 0, w, h);

    // Sandy South Beach strip
    ctx.fillStyle = '#d8c59d';
    ctx.fillRect(toPxX(47), toPxY(-72), 18 * scale, 144 * scale);

    // Miami islands
    ctx.fillStyle = '#263844';
    for (const isl of MIAMI_ISLANDS) {
      ctx.fillRect(
        toPxX(isl.minX),
        toPxY(isl.minZ),
        (isl.maxX - isl.minX) * scale,
        (isl.maxZ - isl.minZ) * scale,
      );
    }

    // Bridges
    ctx.fillStyle = '#94a3b8';
    for (const br of MIAMI_BRIDGES) {
      const sx = br.axis === 'x' ? br.spanLength + br.rampLength * 1.4 : br.width;
      const sz = br.axis === 'z' ? br.spanLength + br.rampLength * 1.4 : br.width;
      ctx.fillRect(toPxX(br.centerX - sx * 0.5), toPxY(br.centerZ - sz * 0.5), sx * scale, sz * scale);
    }

    // Enterable shops (brass squares)
    ctx.fillStyle = '#e8c170';
    for (const sh of shops) {
      ctx.fillRect(toPxX(sh.center.x) - 3, toPxY(sh.center.z) - 3, 6, 6);
    }

    // Vehicles & watercraft (cyan diamonds)
    ctx.fillStyle = '#12b3c2';
    for (const v of vehicles) {
      const vp = v.getPosition();
      ctx.fillRect(toPxX(vp.x) - 2, toPxY(vp.z) - 2, 4, 4);
    }

    // Nearby active bots (coral dots)
    ctx.fillStyle = '#ff5e4d';
    for (const b of bots) {
      if (!b.alive || b.phase === 'aircraft') continue;
      ctx.beginPath();
      ctx.arc(toPxX(b.position.x), toPxY(b.position.z), 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Storm safe circle
    ctx.strokeStyle = '#12b3c2';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(toPxX(stormCenter.x), toPxY(stormCenter.y), snap.stormRadius * scale, 0, Math.PI * 2);
    ctx.stroke();

    // Player arrow
    const px = toPxX(snap.playerPos.x);
    const py = toPxY(snap.playerPos.z);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-playerYaw);
    ctx.fillStyle = '#f6f2ea';
    ctx.beginPath();
    ctx.moveTo(0, -5.5);
    ctx.lineTo(4, 4.5);
    ctx.lineTo(-4, 4.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
