import { HitRecord, Hittable } from './hittable';
import { Point3, Ray } from './ray';
import { add, cross, multiply, randomInUnitDisk, subtract, unitVector, Vec3 } from './vec3';
import { Color, writeColor } from './color';
import { Interval } from './interval';
import { degreesToRadians } from './utils';

export interface CameraConfig {
    aspectRadio: number;
    imageWidth: number;
    imageHeight: number;
    samplesPerPixel: number;
    maxDepth: number;
    vFov: number;
    lookFrom: [number, number, number];
    lookAt: [number, number, number];
    vup: [number, number, number];
    defocusAngle: number;
    focusDistance: number;
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

    /** vertical field of view */
    vFov: number;

    /** point camera is looking from */
    lookFrom: Point3;

    /** point camera is looking at */
    lookAt: Point3;

    /** camera-relative "up" direction */
    vup: Vec3;

    /** the angle of the cone with apex at viewport center and base (defocus disk) at the camera center */
    defocusAngle: number;

    /** distance from camera lookFrom to plane of perfect focus */
    focusDistance: number;

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

    /** orthonormal basis right - u */
    private u: Vec3;

    /** orthonormal basis up - v */
    private v: Vec3;

    /** orthonormal basis forward - w */
    private w: Vec3;

    /** defocus disk horizontal radius */
    private defocusDiskU: Vec3;

    /** defocus disk vertical radius */
    private defocusDiskV: Vec3;

    constructor(config: CameraConfig) {
        this.imageWidth = config.imageWidth;
        this.imageHeight = config.imageHeight;
        this.aspectRadio = config.aspectRadio;
        this.samplesPerPixel = config.samplesPerPixel;
        this.pixelSamplesScale = 1 / config.samplesPerPixel;
        this.maxDepth = config.maxDepth;
        this.vFov = config.vFov;
        this.lookFrom = new Point3(...config.lookFrom);
        this.lookAt = new Point3(...config.lookAt);
        this.vup = new Vec3(...config.vup);
        this.defocusAngle = config.defocusAngle;
        this.focusDistance = config.focusDistance;

        this.center = this.lookFrom;

        // determine viewport dimensions
        // const focalLength = subtract(this.lookFrom, this.lookAt).length();
        const theta = degreesToRadians(this.vFov);
        const halfViewHeight = Math.tan(theta / 2);
        const viewportHeight = 2 * halfViewHeight * this.focusDistance;
        const viewportWidth = viewportHeight * (this.imageWidth / this.imageHeight);

        // calculate the u,v,w unit basis
        this.w = unitVector(subtract(this.lookFrom, this.lookAt));
        this.u = unitVector(cross(this.vup, this.w));
        this.v = cross(this.w, this.u);

        // calculate the vectors across the horizontal and down the vertical viewport edges
        const viewportU = this.u.multiply(viewportWidth);
        const viewportV = this.v.negate().multiply(viewportHeight);

        // calculate then horizontal and vertical delta vectors from pixel to pixel
        this.pixelDeltaU = viewportU.divide(this.imageWidth);
        this.pixelDeltaV = viewportV.divide(this.imageHeight);

        // calculate the location of the upper left pixel
        const viewportUpperLeft = this.center
            .subtract(this.w.multiply(this.focusDistance))
            .subtract(viewportU.divide(2))
            .subtract(viewportV.divide(2));
        // center of the upper left pixel
        this.pixel00Location = viewportUpperLeft.add(
            this.pixelDeltaU.add(this.pixelDeltaV).multiply(0.5),
        );

        // calculate the camera defocus disk basis vectors
        const defocusRadius = this.focusDistance * Math.tan(degreesToRadians(this.defocusAngle) / 2);
        this.defocusDiskU = this.u.multiply(defocusRadius);
        this.defocusDiskV = this.v.multiply(defocusRadius);
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
        // construct a camera ray originating from the defocus disk and directed at a randomly
        // sampled point around the pixel location i, j

        const offset = this.sampleSquare();
        const pixelSample = this.pixel00Location
            .add(multiply(this.pixelDeltaU, i + offset.x))
            .add(multiply(this.pixelDeltaV, j + offset.y));
        const rayOrigin = this.defocusAngle <= 0 ? this.center : this.defocusDiskSample();
        const rayDirection = subtract(pixelSample, rayOrigin);
        return new Ray(rayOrigin, rayDirection);
    }

    /** sample a point on the defocus disk */
    defocusDiskSample(): Point3 {
        const p = randomInUnitDisk();
        return this.center.add(
            add(
                this.defocusDiskU.multiply(p.x),
                this.defocusDiskV.multiply(p.y),
            ),
        );
    }
}
