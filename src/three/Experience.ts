import { Engine } from "./engine";
import { DebugController } from "./DebugController";
import { Config } from "./Config";
import { ParticlesManager } from "./ParticlesManager";
import * as THREE from "three";
import { MATH, NOISE } from "./lib";

export class Experience extends Engine {
  private static instance: Experience | null = null;

  public readonly config!: Config;
  public readonly debugController!: DebugController;

  constructor(domElement: HTMLElement) {
    if (Experience.instance) return Experience.instance;
    super({ domElement });
    Experience.instance = this;

    this.config = new Config();
    this.debugController = new DebugController();

    this.stats.activate();
    this.camera.position.set(0, 12, 12);
    this.controls.target.set(0, 6, 0);

    this.scene.background = new THREE.Color(0x87ceeb)
      .convertLinearToSRGB()
      .multiplyScalar(0.012);

    const particlesManager = new ParticlesManager(this.loader, this.viewport);
    this.scene.add(particlesManager.scene);

    this.time.events.on("tick", (time) => {
      particlesManager.update(time);
    });
    this.viewport.events.on("change", (viewport) => {
      particlesManager.resize(viewport);
    });

    this.loadModels();
    this.createLights();
  }

  private loadModels() {
    this.loader.loadGLTF({
      url: "/models/campfire-logs.glb",
      onLoad: (gltf) => {
        gltf.scene.children = gltf.scene.children.filter(
          (child) => !(child instanceof THREE.Group && child.isGroup)
        );
        this.scene.add(gltf.scene);
      },
    });
  }

  private createLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xf8b867, 100);
    pointLight.position.set(0, 4, 0);
    this.scene.add(pointLight);

    this.time.events.on("tick", ({ elapsed }) => {
      const noise = NOISE.noise1D(elapsed * 2);
      const intensity = MATH.remap(-1, 1, 15, 50, noise);
      pointLight.intensity = intensity;
    });
  }
}
