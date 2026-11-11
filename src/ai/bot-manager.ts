import * as THREE from 'three';
import type { CharacterPalette } from '../character/human-rig';
import type { BallisticsSystem, DamageableTarget } from '../combat/projectiles-bvh';
import { WEAPON_SPECS } from '../combat/weapons';
import { SeededRng } from '../core/rng';
import type { WeaponId } from '../types/game';
import type { PhysicsWorld } from '../world/physics-world';
import { BotAgent } from './bot-agent';

const BOT_CALLSIGNS = [
  'Vega', 'Solis', 'Marlin', 'Cortez', 'Biscayne', 'Reyes',
  'Palma', 'Coral', 'Navarro', 'Miramar', 'Tide', 'Ventura',
  'Delgado', 'Saffron', 'Castillo', 'Zephyr', 'brickell-9', 'KeyWest',
];

const SHIRT_COLORS = [0xff5e4d, 0xf59e0b, 0x8b5cf6, 0xec4899, 0x10b981, 0x3b82f6];
const PANTS_COLORS = [0x1e293b, 0x334155, 0x44403c, 0x0f172a];
const SKIN_COLORS = [0xe0ac8b, 0xc6865c, 0x8d5524, 0xf1c27d];
const WEAPON_POOL: readonly WeaponId[] = ['carbine', 'smg', 'shotgun', 'marksman'];

export interface DroppedLootCrate {
  id: string;
  position: THREE.Vector3;
  mesh: THREE.Mesh;
  collected: boolean;
}

export class BotManager {
  public readonly bots: BotAgent[] = [];
  public readonly lootDrops: DroppedLootCrate[] = [];
  private readonly rng = new SeededRng(0x2026b15c);

  constructor(private readonly scene: THREE.Scene) {}

  spawnMatchBots(count = 18): void {
    const landingRing: Array<{ x: number; z: number }> = [
      { x: 34, z: -42 }, { x: 34, z: -8 }, { x: 36, z: 30 }, { x: 50, z: 12 },
      { x: 52, z: -26 }, { x: -34, z: -40 }, { x: -58, z: -26 }, { x: -34, z: 32 },
      { x: -62, z: 38 }, { x: 18, z: -38 }, { x: 22, z: 42 }, { x: -48, z: -64 },
      { x: -48, z: 66 }, { x: 34, z: -64 }, { x: 34, z: 62 }, { x: -82, z: -38 },
      { x: -82, z: 38 }, { x: 46, z: 48 },
    ];

    for (let i = 0; i < count; i++) {
      const palette: CharacterPalette = {
        shirtHex: this.rng.pick(SHIRT_COLORS),
        pantsHex: this.rng.pick(PANTS_COLORS),
        skinHex: this.rng.pick(SKIN_COLORS),
        shoeHex: 0xf1f5f9,
        accentHex: 0x0ea5b7,
        hairHex: 0x1e1b18,
      };
      const weaponId = WEAPON_POOL[i % WEAPON_POOL.length];
      const dropDelay = 0.6 + i * 0.48;
      const goal = landingRing[i % landingRing.length];

      this.bots.push(
        new BotAgent(
          i + 1,
          BOT_CALLSIGNS[i % BOT_CALLSIGNS.length],
          palette,
          weaponId,
          dropDelay,
          goal,
          this.rng,
          this.scene,
        ),
      );
    }
  }

  spawnEliminationDrop(pos: THREE.Vector3): void {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.38, 0.55),
      new THREE.MeshStandardMaterial({
        color: 0x12b3c2,
        emissive: new THREE.Color(0x0ea5b7),
        emissiveIntensity: 1.4,
        roughness: 0.25,
      }),
    );
    mesh.position.set(pos.x, pos.y + 0.32, pos.z);
    mesh.castShadow = true;
    this.scene.add(mesh);
    this.lootDrops.push({
      id: `drop_${this.lootDrops.length}`,
      position: mesh.position.clone(),
      mesh,
      collected: false,
    });
  }

  collectNearbyDrops(playerPos: THREE.Vector3): number {
    let count = 0;
    for (const drop of this.lootDrops) {
      if (drop.collected) continue;
      if (playerPos.distanceTo(drop.position) < 2.4) {
        drop.collected = true;
        drop.mesh.visible = false;
        count++;
      }
    }
    return count;
  }

  getAliveCount(): number {
    let alive = 0;
    for (const b of this.bots) {
      if (b.alive) alive++;
    }
    return alive;
  }

  update(
    dt: number,
    timeSec: number,
    aircraftPos: THREE.Vector3,
    physics: PhysicsWorld,
    stormCenter: THREE.Vector2,
    stormRadius: number,
    playerTarget: DamageableTarget,
    ballistics: BallisticsSystem,
    onBotFiredAudio: (pos: THREE.Vector3, weaponId: WeaponId) => void,
  ): void {
    const allTargets: DamageableTarget[] = [playerTarget, ...this.bots];

    for (const bot of this.bots) {
      if (!bot.alive) continue;

      // Storm attrition on bots caught far outside squall circle
      const stormDist = Math.hypot(bot.position.x - stormCenter.x, bot.position.z - stormCenter.y);
      if (bot.phase !== 'aircraft' && stormDist > stormRadius) {
        const died = bot.applyDamage(3.5 * dt, bot.position, 'storm');
        if (died) this.spawnEliminationDrop(bot.position);
        continue;
      }

      bot.update(
        dt,
        timeSec,
        aircraftPos,
        physics,
        stormCenter,
        stormRadius,
        allTargets,
        (shooter, origin, dir) => {
          const spec = { ...WEAPON_SPECS[shooter.weaponId], damage: Math.max(6, Math.round(WEAPON_SPECS[shooter.weaponId].damage * 0.42)) };
          const res = ballistics.fireWeaponShot(
            shooter.id,
            origin,
            origin,
            dir,
            spec,
            physics,
            allTargets,
          );
          onBotFiredAudio(origin, shooter.weaponId);
          if (res.eliminatedTarget) {
            for (const b of this.bots) {
              if (!b.alive && !this.lootDrops.some((d) => d.position.distanceTo(b.position) < 1.2)) {
                this.spawnEliminationDrop(b.position);
              }
            }
          }
        },
      );
    }

    for (const drop of this.lootDrops) {
      if (!drop.collected) {
        drop.mesh.rotation.y = timeSec * 1.8;
      }
    }
  }
}
