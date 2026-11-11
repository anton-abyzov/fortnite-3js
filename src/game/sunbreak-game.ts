import * as THREE from 'three';
import { BotManager } from '../ai/bot-manager';
import { AssetLibrary } from '../assets/asset-loader';
import { DropAircraftController } from '../character/parachute-system';
import { PlayerController } from '../character/player-controller';
import { BallisticsSystem, type DamageableTarget } from '../combat/projectiles-bvh';
import { WeaponInventory } from '../combat/weapons';
import { TropicalStormZone } from '../gameplay/storm-zone';
import { createMiamiMaterialSet } from '../rendering/materials';
import { SunbreakPathTracer } from '../rendering/path-tracer';
import { SunbreakPostPipeline } from '../rendering/post-processing';
import { TimeOfDaySystem } from '../rendering/time-of-day';
import { WaterSystem } from '../rendering/water-system';
import { ProceduralSoundEngine } from '../audio/sound-engine';
import type {
  DropPhase,
  InputState,
  RenderMode,
  TelemetrySnapshot,
  TimePreset,
  WeaponId,
} from '../types/game';
import { SunbreakHud } from '../ui/hud';
import { VehicleManager } from '../vehicles/vehicle-manager';
import { buildMiamiWorld, type BuiltMiamiWorld } from '../world/miami-builder';
import { PhysicsWorld } from '../world/physics-world';

export interface SunbreakTestBridge {
  getSnapshot: () => TelemetrySnapshot;
  startMatchDrop: () => void;
  teleportPlayer: (x: number, y: number, z: number, phase?: DropPhase, yaw?: number) => void;
  setTimePreset: (preset: TimePreset) => void;
  setSolarHours: (hours: number) => void;
  setRenderMode: (mode: RenderMode) => void;
  interactNow: () => string | null;
  boardVehicleById: (id: string) => boolean;
  exitVehicle: () => void;
  equipWeapon: (id: WeaponId) => void;
  fireOnceAtWorldPoint: (x: number, y: number, z: number) => {
    hitTarget: boolean;
    eliminatedTarget: boolean;
  };
  getShopIds: () => string[];
  getVehicleIds: () => string[];
  getFirstAliveBotPosition: () => { x: number; y: number; z: number } | null;
  stepFrames: (frames: number, overrideInput?: Partial<InputState>) => void;
}

declare global {
  interface Window {
    __SUNBREAK__?: SunbreakTestBridge;
  }
}

export class SunbreakGame {
  public readonly renderer: THREE.WebGLRenderer;
  public readonly scene = new THREE.Scene();
  public readonly camera: THREE.PerspectiveCamera;

  private physics!: PhysicsWorld;
  private assets = new AssetLibrary();
  private timeOfDay!: TimeOfDaySystem;
  private water!: WaterSystem;
  private post!: SunbreakPostPipeline;
  private pathTracer!: SunbreakPathTracer;
  private world!: BuiltMiamiWorld;
  private aircraft!: DropAircraftController;
  private player!: PlayerController;
  private weapons!: WeaponInventory;
  private ballistics!: BallisticsSystem;
  private vehicles = new VehicleManager();
  private bots!: BotManager;
  private storm!: TropicalStormZone;
  private audio = new ProceduralSoundEngine();
  private hud!: SunbreakHud;

  private ready = false;
  private simTimeSec = 0;
  private eliminations = 0;
  private matchEnded = false;
  private victory = false;
  private fpsSmoothed = 60;
  private lastFrameMs = 0;

  private readonly keysDown = new Set<string>();
  private jumpQueued = false;
  private interactQueued = false;
  private reloadQueued = false;
  private slotQueued: number | null = null;
  private mouseLeftDown = false;
  private mouseRightDown = false;
  private accumYawDelta = 0;
  private accumPitchDelta = 0;
  private draggingLook = false;

  constructor(private readonly container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
      stencil: false,
      preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.className = 'sunbreak-canvas';
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      64,
      window.innerWidth / Math.max(1, window.innerHeight),
      0.15,
      2800,
    );
  }

  async init(): Promise<void> {
    const [physics] = await Promise.all([PhysicsWorld.create(), this.assets.preloadAll()]);
    this.physics = physics;

    const materials = createMiamiMaterialSet();
    this.timeOfDay = new TimeOfDaySystem(this.scene, this.renderer);
    this.water = new WaterSystem(this.scene);
    this.world = buildMiamiWorld(this.scene, this.physics, materials);
    this.aircraft = new DropAircraftController(this.scene, this.assets);
    this.player = new PlayerController(this.scene);
    this.weapons = new WeaponInventory(this.player.rig.weaponMount);
    this.ballistics = new BallisticsSystem(this.scene);
    this.vehicles.spawnMiamiFleet(this.scene, this.physics, this.assets);
    this.bots = new BotManager(this.scene);
    this.bots.spawnMatchBots(18);
    this.storm = new TropicalStormZone(this.scene);

    this.post = new SunbreakPostPipeline(this.renderer, this.scene, this.camera);
    this.pathTracer = new SunbreakPathTracer(
      this.renderer,
      this.scene,
      this.camera,
      this.timeOfDay,
      this.water,
    );

    this.hud = new SunbreakHud(this.container, {
      onStartDrop: () => {
        this.audio.unlock();
        if (this.matchEnded) {
          window.location.reload();
          return;
        }
        if (this.player.phase === 'aircraft') {
          this.jumpQueued = true;
        }
        this.requestPointerLockSafe();
      },
      onSelectPreset: (preset) => {
        this.timeOfDay.setPreset(preset, this.player.position);
        this.pathTracer.notifyLightingChanged();
      },
      onScrubHours: (hours) => {
        this.timeOfDay.setHours(hours, this.player.position, true);
        this.pathTracer.notifyLightingChanged();
      },
      onToggleTimelapse: () => {
        const next = this.timeOfDay.getTimelapseRate() === 0 ? 0.65 : 0;
        this.timeOfDay.setTimelapseRate(next);
      },
      onTogglePathTracer: () => {
        this.setRenderMode(this.pathTracer.isActive() ? 'realtime' : 'pathtraced');
      },
    });

    this.bindEvents();
    this.installTestBridge();

    // Settle initial vehicle suspension / watercraft buoyancy for 15 substeps
    const idleInput = this.buildInputState(1 / 60);
    for (let i = 0; i < 15; i++) {
      this.vehicles.update(1 / 60, 0, this.physics, this.player, idleInput);
      this.physics.step(1 / 60);
    }

    this.ready = true;
    this.lastFrameMs = performance.now();
    requestAnimationFrame(this.onAnimationFrame);
  }

  private setRenderMode(mode: RenderMode): void {
    if (mode === 'pathtraced') {
      this.pathTracer.enable(this.simTimeSec);
      this.hud.pushToast('BVH GPU Path Tracer active: accumulating multi-bounce GI');
    } else {
      this.pathTracer.disable();
    }
  }

  private requestPointerLockSafe(): void {
    try {
      if (document.pointerLockElement !== this.renderer.domElement) {
        const maybePromise = this.renderer.domElement.requestPointerLock?.() as unknown as Promise<void> | undefined;
        maybePromise?.catch?.(() => {});
      }
    } catch {
      // Headless browsers without user gesture ignore pointer lock safely
    }
  }

  private bindEvents(): void {
    window.addEventListener('resize', () => {
      const w = window.innerWidth;
      const h = Math.max(1, window.innerHeight);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
      this.post.setSize(w, h);
      this.pathTracer.notifyCameraMoved();
    });

    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      this.audio.unlock();
      this.keysDown.add(e.code);

      if (e.code === 'Space') {
        this.jumpQueued = true;
        this.hud.hideBriefing();
      } else if (e.code === 'KeyE') {
        this.interactQueued = true;
      } else if (e.code === 'KeyR') {
        this.reloadQueued = true;
      } else if (e.code === 'Digit1') {
        this.slotQueued = 1;
      } else if (e.code === 'Digit2') {
        this.slotQueued = 2;
      } else if (e.code === 'Digit3') {
        this.slotQueued = 3;
      } else if (e.code === 'Digit4') {
        this.slotQueued = 4;
      } else if (e.code === 'KeyP') {
        this.setRenderMode(this.pathTracer.isActive() ? 'realtime' : 'pathtraced');
      } else if (e.code === 'KeyT') {
        const next = this.timeOfDay.getTimelapseRate() === 0 ? 0.65 : 0;
        this.timeOfDay.setTimelapseRate(next);
      } else if (e.code === 'BracketLeft') {
        this.timeOfDay.setHours(this.timeOfDay.getHours() - 0.75, this.player.position, true);
        this.pathTracer.notifyLightingChanged();
      } else if (e.code === 'BracketRight') {
        this.timeOfDay.setHours(this.timeOfDay.getHours() + 0.75, this.player.position, true);
        this.pathTracer.notifyLightingChanged();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysDown.delete(e.code);
    });

    this.renderer.domElement.addEventListener('mousedown', (e) => {
      this.audio.unlock();
      if (e.button === 0) {
        this.mouseLeftDown = true;
        this.draggingLook = true;
        this.requestPointerLockSafe();
      } else if (e.button === 2) {
        this.mouseRightDown = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.mouseLeftDown = false;
        this.draggingLook = false;
      } else if (e.button === 2) {
        this.mouseRightDown = false;
      }
    });

    window.addEventListener('contextmenu', (e) => e.preventDefault());

    window.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === this.renderer.domElement || this.draggingLook) {
        this.accumYawDelta += e.movementX * 0.0024;
        this.accumPitchDelta += e.movementY * 0.0021;
        this.pathTracer.notifyCameraMoved();
      }
    });
  }

  private buildInputState(dt: number, override?: Partial<InputState>): InputState {
    const forward =
      (this.keysDown.has('KeyW') || this.keysDown.has('ArrowUp') ? 1 : 0) -
      (this.keysDown.has('KeyS') || this.keysDown.has('ArrowDown') ? 1 : 0);
    const right =
      (this.keysDown.has('KeyD') ? 1 : 0) - (this.keysDown.has('KeyA') ? 1 : 0);

    const arrowYaw =
      ((this.keysDown.has('ArrowRight') ? 1 : 0) - (this.keysDown.has('ArrowLeft') ? 1 : 0)) *
      1.85 *
      dt;

    const state: InputState = {
      forward,
      right,
      jump: this.keysDown.has('Space'),
      jumpJustPressed: this.jumpQueued,
      sprint: this.keysDown.has('ShiftLeft') || this.keysDown.has('ShiftRight'),
      crouch: this.keysDown.has('KeyC') || this.keysDown.has('ControlLeft'),
      interactJustPressed: this.interactQueued,
      fire: this.mouseLeftDown,
      aim: this.mouseRightDown,
      reloadJustPressed: this.reloadQueued,
      handbrake: this.keysDown.has('Space'),
      weaponSlot: this.slotQueued,
      yawDelta: this.accumYawDelta + arrowYaw,
      pitchDelta: this.accumPitchDelta,
    };

    this.jumpQueued = false;
    this.interactQueued = false;
    this.reloadQueued = false;
    this.slotQueued = null;
    this.accumYawDelta = 0;
    this.accumPitchDelta = 0;

    return override ? { ...state, ...override } : state;
  }

  private handleContextualInteraction(): string | null {
    // 1. Exit vehicle if currently driving
    if (this.vehicles.activeVehicle) {
      const kind = this.vehicles.activeVehicle.getKind();
      this.vehicles.exitActiveVehicle(this.scene, this.player, this.physics, this.simTimeSec);
      this.hud.pushToast(`Exited ${kind}`);
      return `exited_${kind}`;
    }

    if (this.player.phase !== 'grounded' && this.player.phase !== 'swimming') {
      return null;
    }

    // 2. Shop item / cash register pickup if inside or beside a shop item
    const shopHit = this.world.shops.findNearestInteractable(this.player.position, 3.2);
    if (shopHit) {
      const item = shopHit.item;
      if (item.kind === 'register') {
        item.collected = true;
        this.player.shield = Math.min(100, this.player.shield + 35);
        this.weapons.reserveAmmo += 45;
        this.player.speedBoostSec = Math.max(this.player.speedBoostSec, 10);
        this.audio.playPickupChime(true);
        this.hud.pushToast(`${shopHit.shop.name}: +35 Shield, +45 Ammo & Cafecito Boost`);
        return item.id;
      }

      const collected = this.world.shops.markItemCollected(item.id);
      if (collected) {
        if (collected.kind === 'weapon' && collected.weaponId) {
          this.weapons.unlockAndEquip(collected.weaponId);
        } else if (collected.kind === 'medkit') {
          this.player.health = Math.min(100, this.player.health + 50);
        } else if (collected.kind === 'shield') {
          this.player.shield = Math.min(100, this.player.shield + 50);
        } else if (collected.kind === 'cafecito') {
          this.player.speedBoostSec = 14;
          this.player.stamina = 100;
        } else if (collected.kind === 'ammo') {
          this.weapons.reserveAmmo += 60;
        }
        this.audio.playPickupChime(false);
        this.hud.pushToast(`Collected ${collected.label}`);
        return collected.id;
      }
    }

    // 3. Board nearby Car, Jet Ski, or Speedboat
    const boardable = this.vehicles.findNearestBoardable(this.player.position, 5.0);
    if (boardable) {
      this.vehicles.boardVehicle(boardable, this.player);
      this.hud.pushToast(`Driving ${boardable.id.replace(/_/g, ' ')}`);
      return boardable.id;
    }

    return null;
  }

  private computeInteractionPromptLabel(): string | null {
    if (this.vehicles.activeVehicle) {
      return 'Exit Vehicle';
    }
    if (this.player.phase !== 'grounded' && this.player.phase !== 'swimming') {
      return null;
    }
    const shopHit = this.world.shops.findNearestInteractable(this.player.position, 3.2);
    if (shopHit) {
      return shopHit.item.label;
    }
    const boardable = this.vehicles.findNearestBoardable(this.player.position, 5.0);
    if (boardable) {
      const labels = {
        convertible: 'Drive Miami Convertible',
        suv: 'Drive Coastal SUV',
        jetski: 'Ride Biscayne Jet Ski',
        speedboat: 'Helm Center-Console Speedboat',
      };
      return labels[boardable.getKind()];
    }
    return null;
  }

  private stepSimulation(dt: number, inputOverride?: Partial<InputState>): void {
    const safeDt = Math.min(Math.max(dt, 1 / 240), 0.05);
    const input = this.buildInputState(safeDt, inputOverride);

    // If user starts actively moving/firing while in static Path-Tracer photo mode, auto-return to 60Hz!
    if (
      this.pathTracer.isActive() &&
      (Math.abs(input.forward) > 0.1 || Math.abs(input.right) > 0.1 || input.jumpJustPressed || input.fire)
    ) {
      this.pathTracer.disable();
    }

    // Pause world motion while progressive GPU Path Tracer accumulates multi-bounce GI rays
    if (this.pathTracer.isActive()) {
      this.hud.update(
        safeDt,
        this.captureSnapshot(),
        this.weapons,
        null,
        this.timeOfDay.getTimelapseRate() !== 0,
        this.world.shops.shops,
        this.vehicles.vehicles,
        this.bots.bots,
        this.storm.center,
        this.player.yaw,
      );
      return;
    }

    this.simTimeSec += safeDt;

    const flight = this.aircraft.update(safeDt);
    this.timeOfDay.update(safeDt, this.player.position);
    this.water.update(this.simTimeSec, this.timeOfDay.state);
    this.world.foliage.update(this.simTimeSec);
    this.world.shops.update(this.simTimeSec);

    if (input.weaponSlot !== null) {
      this.weapons.switchSlot(input.weaponSlot);
    }
    if (input.reloadJustPressed) {
      this.weapons.startReload();
    }
    if (input.interactJustPressed) {
      this.handleContextualInteraction();
    }

    if (!this.vehicles.activeVehicle) {
      const moveRes = this.player.update(
        safeDt,
        this.simTimeSec,
        input,
        this.physics,
        this.aircraft,
      );
      if (moveRes.stepSoundMaterial) {
        this.audio.playFootstep(moveRes.stepSoundMaterial);
      }
      if (moveRes.deployedCanopyNow) {
        this.audio.playCanopyDeploy();
      }
    } else {
      this.player.yaw -= input.yawDelta;
      this.player.pitch = Math.max(-1.1, Math.min(1.0, this.player.pitch - input.pitchDelta));
    }

    this.vehicles.update(safeDt, this.simTimeSec, this.physics, this.player, input);
    this.physics.step(safeDt);

    const activeVeh = this.vehicles.activeVehicle;
    this.audio.updateVehicleEngine(
      activeVeh !== null,
      this.vehicles.getActiveSpeedKmh(),
      activeVeh ? activeVeh.getKind() === 'jetski' || activeVeh.getKind() === 'speedboat' : false,
    );

    // Update camera (orbiting vehicle when driving, over-shoulder when on foot)
    if (activeVeh) {
      const dist = activeVeh.getKind() === 'speedboat' ? 10.5 : activeVeh.getKind() === 'jetski' ? 6.4 : 7.4;
      this.player.updateThirdPersonCamera(safeDt, this.camera, this.physics, activeVeh.getPosition(), dist);
    } else {
      this.player.updateThirdPersonCamera(safeDt, this.camera, this.physics);
    }

    // Weapons & Firing
    const weaponVisible = this.player.phase === 'grounded';
    this.weapons.update(safeDt, weaponVisible);

    const playerDamageTarget: DamageableTarget = {
      id: 'player',
      position: this.player.position,
      radius: 0.44,
      height: 1.8,
      alive: this.player.health > 0 && this.player.phase !== 'aircraft',
      applyDamage: (amount: number) => {
        if (this.matchEnded) return false;
        let rem = amount;
        if (this.player.shield > 0) {
          const s = Math.min(this.player.shield, rem);
          this.player.shield -= s;
          rem -= s;
        }
        this.player.health = Math.max(0, this.player.health - rem);
        if (this.player.health <= 0 && !this.matchEnded) {
          this.matchEnded = true;
          this.victory = false;
          this.hud.showMatchResult(false, this.eliminations);
          return true;
        }
        return false;
      },
    };

    if (input.fire && weaponVisible && !this.matchEnded) {
      const firedSpec = this.weapons.tryFire();
      if (firedSpec) {
        this.player.addWeaponRecoil(firedSpec.recoilKick);
        this.audio.playWeaponFire(firedSpec.id, 1.0);
        const aimOrigin = this.camera.position.clone();
        const aimDir = new THREE.Vector3();
        this.camera.getWorldDirection(aimDir);
        const muzzle = this.weapons.getMuzzleWorldPosition();

        const shotRes = this.ballistics.fireWeaponShot(
          'player',
          muzzle,
          aimOrigin,
          aimDir,
          firedSpec,
          this.physics,
          this.bots.bots,
        );
        if (shotRes.hitTarget) {
          this.hud.triggerHitmarker();
        }
        if (shotRes.eliminatedTarget) {
          this.eliminations++;
          this.hud.pushToast(`Eliminated rival (${this.eliminations})`);
          for (const b of this.bots.bots) {
            if (!b.alive && !this.bots.lootDrops.some((d) => d.position.distanceTo(b.position) < 1.2)) {
              this.bots.spawnEliminationDrop(b.position);
            }
          }
        }
      }
    }

    // Bots & Loot drops
    this.bots.update(
      safeDt,
      this.simTimeSec,
      flight.position,
      this.physics,
      this.storm.center,
      this.storm.radius,
      playerDamageTarget,
      this.ballistics,
      (botPos, wid) => {
        const dist = botPos.distanceTo(this.player.position);
        if (dist < 75) {
          this.audio.playWeaponFire(wid, Math.max(0, 1 - dist / 75) * 0.45);
        }
      },
    );

    const pickedDrops = this.bots.collectNearbyDrops(this.player.position);
    if (pickedDrops > 0) {
      this.player.shield = Math.min(100, this.player.shield + 25 * pickedDrops);
      this.weapons.reserveAmmo += 30 * pickedDrops;
      this.audio.playPickupChime(true);
      this.hud.pushToast('Recovered rival supply pack (+25 Shield, +30 Ammo)');
    }

    this.ballistics.update(safeDt);

    // Storm Zone shrink & outside tick
    this.storm.update(safeDt, this.player.phase !== 'aircraft');
    if (
      this.player.phase !== 'aircraft' &&
      !this.matchEnded &&
      this.storm.isOutside(this.player.position.x, this.player.position.z)
    ) {
      playerDamageTarget.applyDamage(2.5 * safeDt, this.player.position, 'storm');
    }

    // Check Victory Condition
    if (!this.matchEnded && this.player.health > 0 && this.bots.getAliveCount() === 0) {
      this.matchEnded = true;
      this.victory = true;
      this.hud.showMatchResult(true, this.eliminations);
    }

    this.hud.update(
      safeDt,
      this.captureSnapshot(),
      this.weapons,
      this.computeInteractionPromptLabel(),
      this.timeOfDay.getTimelapseRate() !== 0,
      this.world.shops.shops,
      this.vehicles.vehicles,
      this.bots.bots,
      this.storm.center,
      this.player.yaw,
    );
  }

  private renderFrame(dt: number): void {
    if (this.pathTracer.isActive()) {
      this.pathTracer.renderSample();
    } else {
      this.post.render(dt);
    }
  }

  private onAnimationFrame = (nowMs: number): void => {
    const dt = Math.min(0.05, Math.max(0.001, (nowMs - this.lastFrameMs) / 1000));
    this.lastFrameMs = nowMs;
    const instFps = 1 / dt;
    this.fpsSmoothed = this.fpsSmoothed * 0.92 + instFps * 0.08;

    this.stepSimulation(dt);
    this.renderFrame(dt);
    requestAnimationFrame(this.onAnimationFrame);
  };

  public captureSnapshot(): TelemetrySnapshot {
    const shop = this.world.shops.findShopContaining(this.player.position);
    return {
      ready: this.ready,
      phase: this.player.phase,
      renderMode: this.pathTracer.isActive() ? 'pathtraced' : 'realtime',
      pathTracerSamples: this.pathTracer.getSamples(),
      timeHours: this.timeOfDay.getHours(),
      sunElevationDeg: this.timeOfDay.state.elevationDeg,
      fps: this.fpsSmoothed,
      playerPos: {
        x: Number(this.player.position.x.toFixed(3)),
        y: Number(this.player.position.y.toFixed(3)),
        z: Number(this.player.position.z.toFixed(3)),
      },
      playerVel: {
        x: Number(this.player.velocity.x.toFixed(3)),
        y: Number(this.player.velocity.y.toFixed(3)),
        z: Number(this.player.velocity.z.toFixed(3)),
      },
      health: this.player.health,
      shield: this.player.shield,
      stamina: this.player.stamina,
      speedBoostSec: this.player.speedBoostSec,
      activeWeapon: this.weapons.activeId,
      ammoInMag: this.weapons.magAmmo[this.weapons.activeId],
      reserveAmmo: this.weapons.reserveAmmo,
      aliveBots: this.bots.getAliveCount(),
      eliminations: this.eliminations,
      activeVehicleId: this.vehicles.activeVehicle?.id ?? null,
      activeVehicleKind: this.vehicles.getActiveKind(),
      activeVehicleSpeedKmh: this.vehicles.getActiveSpeedKmh(),
      currentShopId: shop?.id ?? null,
      currentShopName: shop?.name ?? null,
      stormRadius: this.storm.radius,
      outsideStorm: this.storm.isOutside(this.player.position.x, this.player.position.z),
      matchEnded: this.matchEnded,
      victory: this.victory,
      gaitCadenceHz: this.player.animator.telemetry.cadenceHz,
      leftFootPlanted: this.player.animator.telemetry.leftFootPlanted,
      rightFootPlanted: this.player.animator.telemetry.rightFootPlanted,
    };
  }

  private installTestBridge(): void {
    window.__SUNBREAK__ = {
      getSnapshot: () => this.captureSnapshot(),
      startMatchDrop: () => {
        this.hud.hideBriefing();
        if (this.player.phase === 'aircraft') {
          this.jumpQueued = true;
        }
      },
      teleportPlayer: (x, y, z, phase = 'grounded', yaw) => {
        if (this.vehicles.activeVehicle) {
          this.vehicles.exitActiveVehicle(this.scene, this.player, this.physics, this.simTimeSec);
        }
        this.hud.hideBriefing();
        this.player.teleportTo(x, y, z, phase);
        if (phase === 'grounded') {
          this.player.pitch = -0.14;
        }
        if (yaw !== undefined) {
          this.player.yaw = yaw;
        }
        this.player.updateThirdPersonCamera(1 / 60, this.camera, this.physics);
        this.pathTracer.notifyCameraMoved();
      },
      setTimePreset: (preset) => {
        this.timeOfDay.setPreset(preset, this.player.position);
        this.water.update(this.simTimeSec, this.timeOfDay.state);
        this.pathTracer.notifyLightingChanged();
      },
      setSolarHours: (hours) => {
        this.timeOfDay.setHours(hours, this.player.position, true);
        this.water.update(this.simTimeSec, this.timeOfDay.state);
        this.pathTracer.notifyLightingChanged();
      },
      setRenderMode: (mode) => {
        this.setRenderMode(mode);
      },
      interactNow: () => this.handleContextualInteraction(),
      boardVehicleById: (id) => {
        const v = this.vehicles.vehicles.find((item) => item.id === id);
        if (!v) return false;
        this.hud.hideBriefing();
        this.vehicles.boardVehicle(v, this.player);
        return true;
      },
      exitVehicle: () => {
        this.vehicles.exitActiveVehicle(this.scene, this.player, this.physics, this.simTimeSec);
      },
      equipWeapon: (id) => {
        this.weapons.unlockAndEquip(id);
      },
      fireOnceAtWorldPoint: (x, y, z) => {
        const origin = new THREE.Vector3(
          this.player.position.x,
          this.player.position.y + 1.48,
          this.player.position.z,
        );
        const dir = new THREE.Vector3(x, y, z).sub(origin).normalize();
        const spec = this.weapons.spec;
        const res = this.ballistics.fireWeaponShot(
          'player',
          origin,
          origin,
          dir,
          spec,
          this.physics,
          this.bots.bots,
        );
        if (res.eliminatedTarget) {
          this.eliminations++;
        }
        return { hitTarget: res.hitTarget, eliminatedTarget: res.eliminatedTarget };
      },
      getShopIds: () => this.world.shops.shops.map((s) => s.id),
      getVehicleIds: () => this.vehicles.vehicles.map((v) => v.id),
      getFirstAliveBotPosition: () => {
        const b = this.bots.bots.find((bot) => bot.alive && bot.phase !== 'aircraft');
        return b ? { x: b.position.x, y: b.position.y, z: b.position.z } : null;
      },
      stepFrames: (frames, overrideInput) => {
        for (let i = 0; i < frames; i++) {
          this.stepSimulation(1 / 60, overrideInput);
          if (this.pathTracer.isActive() || i === frames - 1) {
            this.renderFrame(1 / 60);
          }
        }
      },
    };
  }
}
