import { CameraConfig } from './camera';
import { Canvas } from './Canvas';
import { SceneConfig } from './scene';
import RenderWorker from './render.worker?worker';
import { WorkerMessageData } from './render.worker';

function render(camera: CameraConfig, scene: SceneConfig) {
    const { aspectRadio, imageWidth } = camera;

    // calculate the image height, and ensure that it's at least 1
    // (imageWidth and imageHeight are both integers, as in the C++ code, so we need to use Math.max)
    const imageHeight = Math.max(imageWidth / aspectRadio, 1);

    const canvas = new Canvas('#output', imageWidth, imageHeight);

    const renderWorker = new RenderWorker();
    const messageData: WorkerMessageData = {
        camera: { ...camera, imageHeight },
        scene,
    };
    renderWorker.postMessage(messageData);

    // receive the processed ImageData returned from Worker and draw it on the canvas
    renderWorker.onmessage = (event: MessageEvent<{ imageBitmap: ImageBitmap }>) => {
        const { imageBitmap } = event.data;
        canvas.ctx.drawImage(imageBitmap, 0, 0);
    };
}

function main() {
    const cameraConfig = {
        aspectRadio: 16 / 9,
        imageWidth: 400,
        samplesPerPixel: 100,
    };

    const sceneConfig: SceneConfig = [
        { type: 'sphere', center: [0, 0, -1], radius: 0.5 },
        { type: 'sphere', center: [0, -100.5, -1], radius: 100 },
    ];

    render(cameraConfig, sceneConfig);
}

main();
