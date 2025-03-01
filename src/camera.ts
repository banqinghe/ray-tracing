import { HitRecord, Hittable } from './hittable';
import { Point3, Ray } from './ray';
import { add, multiply, randomUnitVector, subtract, unitVector, Vec3 } from './vec3';
import { Color, writeColor } from './color';
import { Interval } from './interval';

export interface CameraConfig {
    aspectRadio: number;
    imageWidth: number;
    imageHeight: number;
    samplesPerPixel: number;
    maxDepth: number;
}

export class Camera {
    /** radio of image width over height */
    aspectRadio: number;

    /** rendered image width */
    imageWidth: number;

    /** rendered image height */
    imageHeight: number;

    /** count of random samples for each pixel */
    samplesPerPixel: number;

    /** maximum number of ray bounces into scene */
    maxDepth: number;

    /** color scale factor for a sum of pixel samples */
    private pixelSamplesScale: number;

    /** camera center */
    private center: Point3;

    /** location of pixel 0, 0 */
    private pixel00Location: Point3;

    /** offset to pixel to the right */
    private pixelDeltaU: Vec3;

    /** offset to pixel below */
    private pixelDeltaV: Vec3;

    constructor(config: CameraConfig) {
        const { imageWidth, imageHeight, aspectRadio, samplesPerPixel, maxDepth } = config;
        this.imageWidth = imageWidth;
        this.imageHeight = imageHeight;
        this.aspectRadio = aspectRadio;
        this.samplesPerPixel = samplesPerPixel;
        this.pixelSamplesScale = 1 / samplesPerPixel;
        this.maxDepth = maxDepth;

        this.center = new Point3(0, 0, 0);

        // determine viewport dimensions.
        const focalLength = 1.0;
        const viewportHeight = 2.0;
        const viewportWidth = viewportHeight * (this.imageWidth / this.imageHeight);

        // calculate the vectors across the horizontal and down the vertical viewport edges
        const viewportU = new Vec3(viewportWidth, 0, 0);
        const viewportV = new Vec3(0, -viewportHeight, 0);

        // calculate then horizontal and vertical delta vectors from pixel to pixel
        this.pixelDeltaU = viewportU.divide(this.imageWidth);
        this.pixelDeltaV = viewportV.divide(this.imageHeight);

        // calculate the location of the upper left pixel
        const viewportUpperLeft = this.center
            .subtract(new Vec3(0, 0, focalLength))
            .subtract(viewportU.divide(2))
            .subtract(viewportV.divide(2));
        // center of the upper left pixel
        this.pixel00Location = viewportUpperLeft.add(
            this.pixelDeltaU.add(this.pixelDeltaV).multiply(0.5),
        );
    }

    render(world: Hittable) {
        const offscreenCanvas = new OffscreenCanvas(this.imageWidth, this.imageHeight);
        const ctx = offscreenCanvas.getContext('2d')!;
        const imageData = new ImageData(this.imageWidth, this.imageHeight);

        for (let j = 0; j < this.imageHeight; j++) {
            for (let i = 0; i < this.imageWidth; i++) {
                let pixelColor = new Color(0, 0, 0);

                for (let sample = 0; sample < this.samplesPerPixel; sample++) {
                    const ray = this.getRay(i, j);
                    pixelColor = add(pixelColor, this.rayColor(ray, this.maxDepth, world));
                }

                writeColor({
                    i,
                    j,
                    pixelColor: multiply(pixelColor, this.pixelSamplesScale),
                    imageData: imageData,
                    imageWidth: this.imageWidth,
                });
            }

            // paint offscreen canvas
            ctx.putImageData(imageData, 0, 0);
            // transform OffscreenCanvas to ImageBitmap and send to main thread
            const imageBitmap = offscreenCanvas.transferToImageBitmap();
            self.postMessage({ imageBitmap }, [imageBitmap]);
        }
    }

    rayColor(ray: Ray, depth: number, world: Hittable): Color {
        const hitRecord = new HitRecord();

        // prevent hit calculations after exceeding maxDepth times, directly return black
        if (depth <= 0) {
            return new Color(0, 0, 0);
        }

        // The origin interval is [0.001, Infinity) but [0, Infinity). This is because there will be errors
        // when calculating the intersection points, which may cause the starting point of the reflected light
        // to be inside the object, and this beam of light will hit the object again from within, resulting
        // in a darker color at the intersection point than expected.
        if (world.hit(ray, new Interval(0.001, Infinity), hitRecord)) {
            const scattered = new Ray();
            const attenuation = new Color();
            if (hitRecord.material.scatter(ray, hitRecord, attenuation, scattered)) {
                return multiply(attenuation, this.rayColor(scattered, depth - 1, world));
            }
            return new Color(0, 0, 0);
        }

        // background
        const unitDirection = unitVector(ray.direction);
        const a = 0.5 * (unitDirection.y + 1);
        return new Color(1, 1, 1).multiply(1 - a)
            .add(new Color(0.5, 0.7, 1).multiply(a));
    };

    sampleSquare(): Vec3 {
        return new Vec3(Math.random() - 0.5, Math.random() - 0.5, 0);
    }

    getRay(i: number, j: number): Ray {
        const offset = this.sampleSquare();
        const pixelSample = this.pixel00Location
            .add(multiply(this.pixelDeltaU, i + offset.x))
            .add(multiply(this.pixelDeltaV, j + offset.y));
        const rayOrigin = this.center;
        const rayDirection = subtract(pixelSample, rayOrigin);
        return new Ray(rayOrigin, rayDirection);
    }
}
