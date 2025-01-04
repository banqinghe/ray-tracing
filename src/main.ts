import { Color, writeColor } from './color';
import { HitRecord, Hittable } from './hittable';
import { HittableList } from './hittable-list';
import { Interval } from './interval';
import { Point3, Ray } from './ray';
import { Sphere } from './sphere';
import { add, unitVector, Vec3 } from './vec3';

function updateProgress(value: number, total: number) {
    const text = document.querySelector('#progress-indicator span') as HTMLSpanElement;
    text.innerText = `${value + 1}/${total}`;
}

function rayColor(ray: Ray, world: Hittable): Color {
    const hitRecord = new HitRecord();

    if (world.hit(ray, new Interval(0, Infinity), hitRecord)) {
        return add(hitRecord.normal, new Color(1, 1, 1)).multiply(0.5);
    }

    // background
    const unitDirection = unitVector(ray.direction);
    const a = 0.5 * (unitDirection.y + 1);
    return new Color(1, 1, 1).multiply(1 - a)
        .add(new Color(0.5, 0.7, 1).multiply(a));
}

function main() {
    // Image

    const aspectRadio = 16 / 9;
    const imageWidth = 400;

    // calculate the image height, and ensure that it's at least 1
    // (imageWidth and imageHeight are both integers, as in the C++ code, so we need to use Math.max)
    const imageHeight = Math.max(imageWidth / aspectRadio, 1);

    const { canvas, ctx } = window.config;
    canvas.width = imageWidth;
    canvas.height = imageHeight;
    canvas.style.display = 'block';
    const imageData = ctx.createImageData(imageWidth, imageHeight);
    window.config.imageData = imageData;
    window.config.imageWidth = imageWidth;
    window.config.imageHeight = imageHeight;

    // World

    const world: HittableList = new HittableList();
    world.add(new Sphere(new Point3(0, 0, -1), 0.5));
    world.add(new Sphere(new Point3(0, -100.5, -1), 100));

    // Camera

    const focalLength = 1.0;
    const viewportHeight = 2.0;
    const viewportWidth = viewportHeight * (imageWidth / imageHeight);
    const cameraCenter = new Point3(0, 0, 0);

    // calculate the vectors across the horizontal and down the vertical viewport edges
    const viewportU = new Vec3(viewportWidth, 0, 0);
    const viewportV = new Vec3(0, -viewportHeight, 0);

    // calculate then horizontal and vertical delta vectors from pixel to pixel
    const pixelDeltaU = viewportU.divide(imageWidth);
    const pixelDeltaV = viewportV.divide(imageHeight);

    // calculate the location of the upper left pixel
    const viewportUpperLeft = cameraCenter
        .subtract(new Vec3(0, 0, focalLength))
        .subtract(viewportU.divide(2))
        .subtract(viewportV.divide(2));
    // center of the upper left pixel
    const pixel00Location = viewportUpperLeft.add(
        pixelDeltaU.add(pixelDeltaV).multiply(0.5),
    );

    for (let j = 0; j < imageHeight; j++) {
        updateProgress(j, imageHeight);
        for (let i = 0; i < imageWidth; i++) {
            const pixelCenter = pixel00Location
                .add(pixelDeltaU.multiply(i))
                .add(pixelDeltaV.multiply(j));
            const rayDirection = pixelCenter.subtract(cameraCenter);
            const ray = new Ray(cameraCenter, rayDirection);

            const pixelColor = rayColor(ray, world);
            writeColor(i, j, pixelColor);
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

main();
