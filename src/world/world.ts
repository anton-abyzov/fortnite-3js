import { Group, type PerspectiveCamera, type Scene, type Vector3, type WebGLRenderer } from 'three';
import type { Settings } from '../core/settings';
import type { Physics } from '../physics/physics';
import { Materials } from '../render/materials';
import { Sky } from '../render/sky';
import { Water } from '../render/water';
import { buildBuildings, type CityBuild } from './buildings';
import { WorldField } from './field';
import { buildLayout, type Layout } from './layout';
import { buildProps, type PropBuild } from './props';
import { buildRoads } from './roads';
import { StreetLights } from './streetlights';
import { buildTerrain } from './terrain';

export type Progress = (fraction: number, label: string) => void;

/** The static city: everything that survives from one match to the next. */
export class World {
  readonly group = new Group();
  readonly layout: Layout;
  readonly field: WorldField;
  readonly materials: Materials;
  readonly sky: Sky;
  readonly water: Water;
  readonly city: CityBuild;
  readonly props: PropBuild;
  readonly streetLights: StreetLights;
  private lastTime = 0;

  private constructor(
    readonly seed: number,
    scene: Scene,
    renderer: WebGLRenderer,
    physics: Physics,
    settings: Settings,
    progress: Progress,
  ) {
    const q = settings.quality;
    this.group.name = 'world';
    progress(0.2, 'Surveying Marazul Bay');
    this.layout = buildLayout(seed);
    this.field = new WorldField(this.layout);
    this.materials = new Materials(q);
    this.sky = new Sky(renderer, scene, q);
    progress(0.32, 'Pouring streets and seawalls');
    this.group.add(buildTerrain(this.layout, this.materials, physics));
    const roads = buildRoads(this.layout, this.materials, physics);
    this.group.add(roads.group);
    progress(0.48, 'Raising the skyline');
    this.city = buildBuildings(this.layout, this.field, this.materials, physics);
    this.group.add(this.city.group);
    progress(0.62, 'Planting palms');
    this.props = buildProps(this.layout, this.field, roads.medians, this.materials, physics, q);
    this.group.add(this.props.group);
    this.streetLights = new StreetLights(scene, this.props.lamps, q.streetLights);
    progress(0.7, 'Filling the canals');
    this.water = new Water(scene, this.field, this.sky, q);
    scene.add(this.group);
    this.materials.setNight(this.sky.night);
  }

  static create(seed: number, scene: Scene, renderer: WebGLRenderer, physics: Physics, settings: Settings, progress: Progress): World {
    return new World(seed, scene, renderer, physics, settings, progress);
  }

  setHour(hour: number): void {
    this.sky.setHour(hour);
    this.materials.setNight(this.sky.night);
  }

  /** Per-frame visual update. `focus` is what the shadows should centre on. */
  update(time: number, camera: PerspectiveCamera, focus: Vector3, heightAboveGround: number): void {
    const dt = Math.min(0.25, Math.max(0, time - this.lastTime));
    this.lastTime = time;
    this.sky.update(time, camera, focus, heightAboveGround);
    this.streetLights.update(dt, focus, this.sky.night);
    this.water.update(time, camera);
    this.materials.flicker(time);
  }
}
