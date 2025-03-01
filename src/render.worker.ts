/// <reference lib="webworker" />

import { Camera, CameraConfig } from './camera';
import { Color } from './color';
import { HittableList } from './hittable-list';
import { Material } from './material';
import { Point3 } from './ray';
import { SceneConfig } from './scene';
import { Sphere } from './sphere';

export interface WorkerMessageData {
    camera: CameraConfig;
    scene: SceneConfig;
}

self.onmessage = function (event: MessageEvent<WorkerMessageData>) {
    const { camera: cameraConfig, scene } = event.data;

    const world = new HittableList();
    for (const shape of scene) {
        if (shape.type === 'sphere') {
            world.add(new Sphere(
                new Point3(...shape.center),
                shape.radius,
                Material.create(shape.material, new Color(...shape.color), shape.fuzz),
            ));
        }
    }

    const camera = new Camera(cameraConfig);
    camera.render(world);
};
