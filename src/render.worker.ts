/// <reference lib="webworker" />

import { Color, writeColor } from './color';
import { HitRecord, Hittable } from './hittable';
import { HittableList } from './hittable-list';
import { Interval } from './interval';
import { Point3, Ray } from './ray';
import { PlainObject } from './utils';
import { add, multiply, subtract, unitVector, Vec3 } from './vec3';

export interface WorkerMessageData {
    center: PlainObject<Point3>;
    imageHeight: number;
    imageWidth: number;
    pixel00Location: PlainObject<Point3>;
    pixelDeltaU: PlainObject<Vec3>;
    pixelDeltaV: PlainObject<Vec3>;
    pixelSamplesScale: number;
    samplesPerPixel: number;
    world: PlainObject<HittableList>;
}

/** after structured clone, the class methods are lost, so we need to recreate the objects */
function initializeMessageData(data: WorkerMessageData) {
    return {
        ...data,
        center: new Point3(data.center.e[0], data.center.e[1], data.center.e[2]),
        pixel00Location: new Point3(data.pixel00Location.e[0], data.pixel00Location.e[1], data.pixel00Location.e[2]),
        pixelDeltaU: new Vec3(data.pixelDeltaU.e[0], data.pixelDeltaU.e[1], data.pixelDeltaU.e[2]),
        pixelDeltaV: new Vec3(data.pixelDeltaV.e[0], data.pixelDeltaV.e[1], data.pixelDeltaV.e[2]),
        world: HittableList.fromPlainObject(data.world),
    };
}

self.onmessage = function (event: MessageEvent<WorkerMessageData>) {
    const {
        imageHeight,
        imageWidth,
        pixelSamplesScale,
        samplesPerPixel,
        center,
        pixel00Location,
        pixelDeltaU,
        pixelDeltaV,
        world,
    } = initializeMessageData(event.data);

    const rayColor = (ray: Ray, world: Hittable): Color => {
        const hitRecord = new HitRecord();

        if (world.hit(ray, new Interval(0, Infinity), hitRecord)) {
            return add(hitRecord.normal, new Color(1, 1, 1)).multiply(0.5);
        }

        // background
        const unitDirection = unitVector(ray.direction);
        const a = 0.5 * (unitDirection.y + 1);
        return new Color(1, 1, 1).multiply(1 - a)
            .add(new Color(0.5, 0.7, 1).multiply(a));
    };

    const sampleSquare = (): Vec3 => {
        return new Vec3(Math.random() - 0.5, Math.random() - 0.5, 0);
    };

    /**
     * construct a camera ray originating from the origin and directed at randomly sampled
     * point around then pixel location i, j
     */
    const getRay = (i: number, j: number): Ray => {
        const offset = sampleSquare();
        const pixelSample = pixel00Location
            .add(multiply(pixelDeltaU, i + offset.x))
            .add(multiply(pixelDeltaV, j + offset.y));
        const rayOrigin = center;
        const rayDirection = subtract(pixelSample, rayOrigin);
        return new Ray(rayOrigin, rayDirection);
    };

    const offscreenCanvas = new OffscreenCanvas(imageWidth, imageHeight);
    const ctx = offscreenCanvas.getContext('2d')!;
    const imageData = new ImageData(imageWidth, imageHeight);

    for (let j = 0; j < imageHeight; j++) {
        for (let i = 0; i < imageWidth; i++) {
            let pixelColor = new Color(0, 0, 0);

            for (let sample = 0; sample < samplesPerPixel; sample++) {
                const ray = getRay(i, j);
                pixelColor = add(pixelColor, rayColor(ray, world));
            }

            writeColor({
                i,
                j,
                pixelColor: multiply(pixelColor, pixelSamplesScale),
                imageData: imageData,
                imageWidth: imageWidth,
            });
        }

        // paint offscreen canvas
        ctx.putImageData(imageData, 0, 0);
        // transform OffscreenCanvas to ImageBitmap and send to main thread
        const imageBitmap = offscreenCanvas.transferToImageBitmap();
        self.postMessage({ imageBitmap }, [imageBitmap]);
    }
};
