import { CameraConfig } from './camera';
import { Canvas } from './Canvas';
import { SceneConfig } from './scene';
import RenderWorker from './render.worker?worker';
import { WorkerMessageData } from './render.worker';
import { Point3 } from './ray';
import { Color } from './color';
import { multiply } from './vec3';

function render(camera: CameraConfig, scene: SceneConfig) {
    const { imageWidth, imageHeight } = camera;

    const canvas = new Canvas('#output', imageWidth, imageHeight);

    const renderWorker = new RenderWorker();
    const messageData: WorkerMessageData = { camera, scene };
    renderWorker.postMessage(messageData);

    // receive the processed ImageData returned from Worker and draw it on the canvas
    renderWorker.onmessage = (event: MessageEvent<{ imageBitmap: ImageBitmap }>) => {
        const { imageBitmap } = event.data;
        canvas.ctx.drawImage(imageBitmap, 0, 0);
    };
}

function main() {
    const cameraConfig: CameraConfig = {
        aspectRadio: 16 / 9,
        imageWidth: 400,
        // calculate the image height, and ensure that it's at least 1
        // (imageWidth and imageHeight are both integers, as in the C++ code, so we need to use Math.max)
        imageHeight: Math.max(400 / (16 / 9), 1),
        samplesPerPixel: 100,
        maxDepth: 50,
        vFov: 20,
        lookFrom: [13, 2, 3],
        lookAt: [0, 0, 0],
        vup: [0, 1, 0],
        defocusAngle: 0.6,
        focusDistance: 10,
    };

    const sceneConfig: SceneConfig = [
        // ground
        {
            type: 'sphere',
            center: [0, -1000, 0],
            radius: 1000,
            material: 'lambertian',
            color: [0.5, 0.5, 0.5],
        },
        // three big sphere
        {
            type: 'sphere',
            center: [0, 1, 0],
            radius: 1,
            material: 'dielectric',
            refractionIndex: 1.5,
        },
        {
            type: 'sphere',
            center: [-4, 1, 0],
            radius: 1,
            material: 'lambertian',
            color: [0.4, 0.2, 0.1],
        },
        {
            type: 'sphere',
            center: [4, 1, 0],
            radius: 1,
            material: 'metal',
            color: [0.7, 0.6, 0.5],
            fuzz: 0.0,
        },
    ];

    // some random small spheres
    for (let i = -11; i < 11; i++) {
        for (let j = -11; j < 11; j++) {
            const chooseMaterial = Math.random();
            const center = [i + 0.9 * Math.random(), 0.2, j + 0.9 * Math.random()] as [number, number, number];
            const centerPoint3 = new Point3(...center);
            if (centerPoint3.subtract(new Point3(4, 0.2, 0)).length() < 0.9) {
                continue;
            }
            if (chooseMaterial < 0.8) {
                // diffuse
                const albedo = multiply(Color.random(), Color.random());
                sceneConfig.push({
                    type: 'sphere',
                    center,
                    radius: 0.2,
                    material: 'lambertian',
                    color: [albedo.x, albedo.y, albedo.z],
                });
            } else if (chooseMaterial < 0.95) {
                // metal
                const albedo = Color.random(0.5, 1);
                const fuzz = Math.random() * 0.5;
                sceneConfig.push({
                    type: 'sphere',
                    center,
                    radius: 0.2,
                    material: 'metal',
                    color: [albedo.x, albedo.y, albedo.z],
                    fuzz,
                });
            } else {
                // glass
                sceneConfig.push({
                    type: 'sphere',
                    center,
                    radius: 0.2,
                    material: 'dielectric',
                    refractionIndex: 1.5,
                });
            }
        }
    }

    render(cameraConfig, sceneConfig);
}

main();
