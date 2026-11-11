import * as THREE from 'three';

export interface CharacterPalette {
  shirtHex: number;
  pantsHex: number;
  skinHex: number;
  shoeHex: number;
  accentHex: number;
  hairHex: number;
}

export const PLAYER_PALETTE: CharacterPalette = {
  shirtHex: 0x0ea5b7,
  pantsHex: 0x1e293b,
  skinHex: 0xd99b78,
  shoeHex: 0xf8fafc,
  accentHex: 0xff6b57,
  hairHex: 0x1c1917,
};

export const UPPER_LEG_LEN = 0.43;
export const LOWER_LEG_LEN = 0.41;
export const ANKLE_HEIGHT = 0.085;
export const HIP_HALF_WIDTH = 0.105;
export const HIP_REST_HEIGHT = UPPER_LEG_LEN + LOWER_LEG_LEN + ANKLE_HEIGHT; // ~0.925m

export const UPPER_ARM_LEN = 0.29;
export const LOWER_ARM_LEN = 0.27;
export const SHOULDER_HALF_WIDTH = 0.205;

export class HumanoidRig {
  public readonly root = new THREE.Group();
  public readonly pelvis = new THREE.Group();
  public readonly spineLower = new THREE.Group();
  public readonly spineUpper = new THREE.Group();
  public readonly neck = new THREE.Group();
  public readonly head = new THREE.Group();

  // Left & Right Legs (world-like root-space driven via analytical 2-bone IK)
  public readonly upperLegL = new THREE.Group();
  public readonly lowerLegL = new THREE.Group();
  public readonly footL = new THREE.Group();
  public readonly toeL = new THREE.Group();

  public readonly upperLegR = new THREE.Group();
  public readonly lowerLegR = new THREE.Group();
  public readonly footR = new THREE.Group();
  public readonly toeR = new THREE.Group();

  // Left & Right Clavicles + Arms + Hands
  public readonly clavicleL = new THREE.Group();
  public readonly upperArmL = new THREE.Group();
  public readonly lowerArmL = new THREE.Group();
  public readonly handL = new THREE.Group();

  public readonly clavicleR = new THREE.Group();
  public readonly upperArmR = new THREE.Group();
  public readonly lowerArmR = new THREE.Group();
  public readonly handR = new THREE.Group();
  public readonly weaponMount = new THREE.Group();
  public readonly packMesh: THREE.Mesh;

  constructor(palette: CharacterPalette = PLAYER_PALETTE) {
    this.root.name = 'humanoid_rig';

    const skinMat = new THREE.MeshStandardMaterial({
      color: palette.skinHex,
      roughness: 0.62,
      metalness: 0.02,
    });
    const shirtMat = new THREE.MeshStandardMaterial({
      color: palette.shirtHex,
      roughness: 0.58,
      metalness: 0.05,
    });
    const pantsMat = new THREE.MeshStandardMaterial({
      color: palette.pantsHex,
      roughness: 0.7,
      metalness: 0.04,
    });
    const shoeMat = new THREE.MeshStandardMaterial({
      color: palette.shoeHex,
      roughness: 0.45,
      metalness: 0.08,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: palette.accentHex,
      roughness: 0.38,
      metalness: 0.18,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: palette.hairHex,
      roughness: 0.78,
      metalness: 0.02,
    });
    const visorMat = new THREE.MeshPhysicalMaterial({
      color: 0x0b1320,
      roughness: 0.08,
      metalness: 0.6,
      clearcoat: 1.0,
    });

    // Pelvis + Spine Hierarchy
    this.pelvis.position.set(0, HIP_REST_HEIGHT, 0);
    this.root.add(this.pelvis);

    const pelvisMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.19), pantsMat);
    this.pelvis.add(pelvisMesh);

    this.spineLower.position.set(0, 0.09, 0);
    this.pelvis.add(this.spineLower);

    const abdomenMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.135, 0.2, 10), shirtMat);
    abdomenMesh.scale.set(1.05, 1.0, 0.76);
    abdomenMesh.position.y = 0.1;
    this.spineLower.add(abdomenMesh);

    this.spineUpper.position.set(0, 0.2, 0);
    this.spineLower.add(this.spineUpper);

    const chestMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.145, 0.28, 12), shirtMat);
    chestMesh.scale.set(1.12, 1.0, 0.76);
    chestMesh.position.y = 0.14;
    this.spineUpper.add(chestMesh);

    // Compact coastal parachute / tactical harness pack
    this.packMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.29, 0.11), accentMat);
    this.packMesh.position.set(0, 0.15, 0.15);
    this.spineUpper.add(this.packMesh);

    // Neck & Head
    this.neck.position.set(0, 0.29, 0);
    this.spineUpper.add(this.neck);
    const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.062, 0.09, 8), skinMat);
    neckMesh.position.y = 0.04;
    this.neck.add(neckMesh);

    this.head.position.set(0, 0.08, 0);
    this.neck.add(this.head);
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.112, 14, 12), skinMat);
    skull.scale.set(0.92, 1.08, 0.98);
    skull.position.y = 0.1;
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.116, 12, 10), hairMat);
    hair.scale.set(0.95, 0.75, 1.02);
    hair.position.set(0, 0.145, 0.012);
    const shades = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.042, 0.05), visorMat);
    shades.position.set(0, 0.105, -0.095);
    this.head.add(skull, hair, shades);

    // Clavicles + Arms (attached to spineUpper so torso counter-rotation moves shoulders naturally)
    this.buildArmChain('L', -1, shirtMat, skinMat, accentMat);
    this.buildArmChain('R', 1, shirtMat, skinMat, accentMat);

    // Weapon mount socket inside right hand
    this.weaponMount.position.set(0, -0.05, -0.04);
    this.handR.add(this.weaponMount);

    // Legs placed under `root` so analytical IK positions hip -> knee -> ankle -> toe directly
    this.buildLegChain('L', pantsMat, skinMat, shoeMat, accentMat);
    this.buildLegChain('R', pantsMat, skinMat, shoeMat, accentMat);

    this.root.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  }

  private buildArmChain(
    side: 'L' | 'R',
    sign: -1 | 1,
    shirtMat: THREE.Material,
    skinMat: THREE.Material,
    accentMat: THREE.Material,
  ): void {
    const clavicle = side === 'L' ? this.clavicleL : this.clavicleR;
    const upperArm = side === 'L' ? this.upperArmL : this.upperArmR;
    const lowerArm = side === 'L' ? this.lowerArmL : this.lowerArmR;
    const hand = side === 'L' ? this.handL : this.handR;

    clavicle.position.set(sign * 0.06, 0.24, 0);
    this.spineUpper.add(clavicle);

    upperArm.position.set(sign * (SHOULDER_HALF_WIDTH - 0.06), 0, 0);
    clavicle.add(upperArm);

    const deltoid = new THREE.Mesh(new THREE.SphereGeometry(0.064, 10, 8), shirtMat);
    const bicep = new THREE.Mesh(
      new THREE.CylinderGeometry(0.052, 0.044, UPPER_ARM_LEN, 10),
      skinMat,
    );
    bicep.position.y = -UPPER_ARM_LEN * 0.5;
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.055, 0.13, 10), shirtMat);
    sleeve.position.y = -0.065;
    upperArm.add(deltoid, sleeve, bicep);

    lowerArm.position.set(0, -UPPER_ARM_LEN, 0);
    upperArm.add(lowerArm);

    const elbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.044, 8, 8), skinMat);
    const forearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.043, 0.034, LOWER_ARM_LEN, 10),
      skinMat,
    );
    forearm.position.y = -LOWER_ARM_LEN * 0.5;
    const wristband = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.035, 8), accentMat);
    wristband.position.y = -LOWER_ARM_LEN + 0.025;
    lowerArm.add(elbowJoint, forearm, wristband);

    hand.position.set(0, -LOWER_ARM_LEN, 0);
    lowerArm.add(hand);

    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.085, 0.068), skinMat);
    palm.position.set(0, -0.042, -0.005);
    const fingers = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.055, 0.062), skinMat);
    fingers.position.set(0, -0.095, -0.01);
    const thumb = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.045, 0.026), skinMat);
    thumb.position.set(-sign * 0.022, -0.045, -0.038);
    thumb.rotation.x = 0.4;
    hand.add(palm, fingers, thumb);
  }

  private buildLegChain(
    side: 'L' | 'R',
    pantsMat: THREE.Material,
    skinMat: THREE.Material,
    shoeMat: THREE.Material,
    accentMat: THREE.Material,
  ): void {
    const upperLeg = side === 'L' ? this.upperLegL : this.upperLegR;
    const lowerLeg = side === 'L' ? this.lowerLegL : this.lowerLegR;
    const foot = side === 'L' ? this.footL : this.footR;
    const toe = side === 'L' ? this.toeL : this.toeR;

    this.root.add(upperLeg);
    this.root.add(lowerLeg);
    this.root.add(foot);

    const hipCap = new THREE.Mesh(new THREE.SphereGeometry(0.078, 10, 8), pantsMat);
    const thigh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.076, 0.06, UPPER_LEG_LEN, 10),
      pantsMat,
    );
    thigh.position.y = -UPPER_LEG_LEN * 0.5;
    upperLeg.add(hipCap, thigh);

    const kneeCap = new THREE.Mesh(new THREE.SphereGeometry(0.058, 10, 8), pantsMat);
    const calfUpper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.058, 0.048, LOWER_LEG_LEN * 0.62, 10),
      pantsMat,
    );
    calfUpper.position.y = -LOWER_LEG_LEN * 0.31;
    const ankleLower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.046, 0.038, LOWER_LEG_LEN * 0.38, 10),
      skinMat,
    );
    ankleLower.position.y = -LOWER_LEG_LEN * 0.81;
    lowerLeg.add(kneeCap, calfUpper, ankleLower);

    // Heel + midfoot + articulated forefoot toe box (-Z is character forward)
    const heel = new THREE.Mesh(new THREE.BoxGeometry(0.096, 0.072, 0.14), shoeMat);
    heel.position.set(0, -ANKLE_HEIGHT + 0.038, 0.015);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.102, 0.022, 0.13), accentMat);
    stripe.position.set(0, -ANKLE_HEIGHT + 0.042, 0.01);
    foot.add(heel, stripe);

    toe.position.set(0, -ANKLE_HEIGHT + 0.028, -0.055);
    foot.add(toe);
    const toeBox = new THREE.Mesh(new THREE.BoxGeometry(0.094, 0.054, 0.115), shoeMat);
    toeBox.position.set(0, 0.004, -0.052);
    toe.add(toeBox);
  }
}
