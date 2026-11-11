import * as THREE from 'three';
import type { WeaponId, WeaponSpec } from '../types/game';

export const WEAPON_SPECS: Record<WeaponId, WeaponSpec> = {
  carbine: {
    id: 'carbine',
    name: 'Coastal Carbine',
    rpm: 560,
    damage: 24,
    pellets: 1,
    spreadRad: 0.011,
    muzzleSpeed: 380,
    range: 195,
    magSize: 30,
    reloadSec: 1.75,
    recoilKick: 0.34,
    colorHex: 0x12b3c2,
  },
  shotgun: {
    id: 'shotgun',
    name: 'Breacher Shotgun',
    rpm: 88,
    damage: 13,
    pellets: 8,
    spreadRad: 0.068,
    muzzleSpeed: 260,
    range: 46,
    magSize: 8,
    reloadSec: 2.1,
    recoilKick: 0.78,
    colorHex: 0xff5e4d,
  },
  smg: {
    id: 'smg',
    name: 'Biscayne SMG',
    rpm: 840,
    damage: 16,
    pellets: 1,
    spreadRad: 0.026,
    muzzleSpeed: 310,
    range: 110,
    magSize: 36,
    reloadSec: 1.45,
    recoilKick: 0.22,
    colorHex: 0xa855f7,
  },
  marksman: {
    id: 'marksman',
    name: 'Reef Marksman',
    rpm: 135,
    damage: 58,
    pellets: 1,
    spreadRad: 0.0025,
    muzzleSpeed: 520,
    range: 280,
    magSize: 10,
    reloadSec: 2.0,
    recoilKick: 0.68,
    colorHex: 0xe8c170,
  },
};

export const WEAPON_SLOT_ORDER: readonly WeaponId[] = ['carbine', 'shotgun', 'smg', 'marksman'];

export class WeaponInventory {
  public unlocked = new Set<WeaponId>(['carbine']);
  public activeId: WeaponId = 'carbine';
  public magAmmo: Record<WeaponId, number> = {
    carbine: 30,
    shotgun: 8,
    smg: 36,
    marksman: 10,
  };
  public reserveAmmo = 120;
  public reloadRemainingSec = 0;

  private cooldownSec = 0;
  private muzzleFlashTimer = 0;
  public readonly weaponRoot = new THREE.Group();
  private readonly barrelMesh: THREE.Mesh;
  private readonly accentMesh: THREE.Mesh;
  private readonly flashMesh: THREE.Mesh;
  private readonly accentMat: THREE.MeshStandardMaterial;

  constructor(mountParent: THREE.Object3D) {
    this.weaponRoot.name = 'equipped_weapon';

    const gunMetal = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.34,
      metalness: 0.78,
    });
    this.accentMat = new THREE.MeshStandardMaterial({
      color: WEAPON_SPECS.carbine.colorHex,
      emissive: new THREE.Color(WEAPON_SPECS.carbine.colorHex),
      emissiveIntensity: 0.65,
      roughness: 0.28,
      metalness: 0.35,
    });

    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.11, 0.42), gunMetal);
    receiver.position.set(0, 0.02, -0.14);

    this.barrelMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.017, 0.36, 8), gunMetal);
    this.barrelMesh.rotation.x = Math.PI * 0.5;
    this.barrelMesh.position.set(0, 0.045, -0.44);

    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.15, 0.075), gunMetal);
    mag.position.set(0, -0.08, -0.16);
    mag.rotation.x = 0.22;

    this.accentMesh = new THREE.Mesh(new THREE.BoxGeometry(0.074, 0.032, 0.26), this.accentMat);
    this.accentMesh.position.set(0, 0.062, -0.18);

    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xfff0b3,
      transparent: true,
      opacity: 0.92,
    });
    this.flashMesh = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.22, 6), flashMat);
    this.flashMesh.rotation.x = -Math.PI * 0.5;
    this.flashMesh.position.set(0, 0.045, -0.68);
    this.flashMesh.visible = false;

    this.weaponRoot.add(receiver, this.barrelMesh, mag, this.accentMesh, this.flashMesh);
    mountParent.add(this.weaponRoot);
    this.syncWeaponVisual();
  }

  get spec(): WeaponSpec {
    return WEAPON_SPECS[this.activeId];
  }

  unlockAndEquip(id: WeaponId): void {
    this.unlocked.add(id);
    this.activeId = id;
    this.magAmmo[id] = WEAPON_SPECS[id].magSize;
    this.reserveAmmo += WEAPON_SPECS[id].magSize * 2;
    this.reloadRemainingSec = 0;
    this.syncWeaponVisual();
  }

  switchSlot(slotIndex1Based: number): boolean {
    const id = WEAPON_SLOT_ORDER[slotIndex1Based - 1];
    if (!id || !this.unlocked.has(id) || id === this.activeId) return false;
    this.activeId = id;
    this.reloadRemainingSec = 0;
    this.syncWeaponVisual();
    return true;
  }

  startReload(): boolean {
    const sp = this.spec;
    if (this.reloadRemainingSec > 0) return false;
    if (this.magAmmo[this.activeId] >= sp.magSize || this.reserveAmmo <= 0) return false;
    this.reloadRemainingSec = sp.reloadSec;
    return true;
  }

  tryFire(): WeaponSpec | null {
    if (this.reloadRemainingSec > 0 || this.cooldownSec > 0) return null;
    const sp = this.spec;
    if (this.magAmmo[this.activeId] <= 0) {
      this.startReload();
      return null;
    }

    this.magAmmo[this.activeId]--;
    this.cooldownSec = 60 / sp.rpm;
    this.muzzleFlashTimer = 0.045;
    this.flashMesh.visible = true;
    this.flashMesh.rotation.z = Math.random() * Math.PI * 2;

    if (this.magAmmo[this.activeId] === 0 && this.reserveAmmo > 0) {
      this.startReload();
    }
    return sp;
  }

  update(dt: number, visible: boolean): void {
    this.weaponRoot.visible = visible;
    if (this.cooldownSec > 0) {
      this.cooldownSec = Math.max(0, this.cooldownSec - dt);
    }
    if (this.muzzleFlashTimer > 0) {
      this.muzzleFlashTimer = Math.max(0, this.muzzleFlashTimer - dt);
      if (this.muzzleFlashTimer <= 0) {
        this.flashMesh.visible = false;
      }
    }
    if (this.reloadRemainingSec > 0) {
      this.reloadRemainingSec -= dt;
      if (this.reloadRemainingSec <= 0) {
        this.reloadRemainingSec = 0;
        const needed = this.spec.magSize - this.magAmmo[this.activeId];
        const loaded = Math.min(needed, this.reserveAmmo);
        this.magAmmo[this.activeId] += loaded;
        this.reserveAmmo -= loaded;
      }
    }
  }

  getMuzzleWorldPosition(out = new THREE.Vector3()): THREE.Vector3 {
    this.weaponRoot.updateMatrixWorld(true);
    return this.flashMesh.getWorldPosition(out);
  }

  private syncWeaponVisual(): void {
    const sp = this.spec;
    this.accentMat.color.setHex(sp.colorHex);
    this.accentMat.emissive.setHex(sp.colorHex);
    const barrelScale =
      sp.id === 'marksman' ? 1.45 : sp.id === 'smg' ? 0.68 : sp.id === 'shotgun' ? 1.12 : 1.0;
    this.barrelMesh.scale.set(1, barrelScale, 1);
  }
}
