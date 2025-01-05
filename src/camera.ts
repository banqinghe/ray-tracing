import { Color, writeColor } from './color';
import { HitRecord, Hittable } from './hittable';
import { Interval } from './interval';
import { Point3, Ray } from './ray';
import { random } from './utils';
import { add, multiply, subtract, unitVector, Vec3 } from './vec3';

export class Camera {
    /** radio of image width over height */
    aspectRadio = 1;

    /** rendered image width */
    imageWidth = 100;

    /** count of random samples for each pixel */
    samplesPerPixel = 10;

    /** rendered image height */
    private imageHeight!: number;

    /** color scale factor for a sum of pixel samples */
    private pixelSamplesScale!: number;

    /** camera center */
    private center!: Point3;

    /** location of pixel 0, 0 */
    private pixel00Location!: Point3;

    /** offset to pixel to the right */
    private pixelDeltaU!: Vec3;

    /** offset to pixel below */
    private pixelDeltaV!: Vec3;

    private imageData!: ImageData;
    private ctx!: CanvasRenderingContext2D;

    render(world: Hittable) {
        this.initialize();

        for (let j = 0; j < this.imageHeight; j++) {
            this.updateProgress(j, this.imageHeight);
            for (let i = 0; i < this.imageWidth; i++) {
                let pixelColor = new Color(0, 0, 0);

                for (let sample = 0; sample < this.samplesPerPixel; sample++) {
                    const ray = this.getRay(i, j);
                    pixelColor = add(pixelColor, this.rayColor(ray, world));
                }

                writeColor({
                    i,
                    j,
                    pixelColor: multiply(pixelColor, this.pixelSamplesScale),
                    imageData: this.imageData,
                    imageWidth: this.imageWidth,
                });
            }
        }

        this.ctx.putImageData(this.imageData, 0, 0);
    }

    private initializeCanvas() {
        const canvas = document.getElementById('output') as HTMLCanvasElement;
        canvas.width = this.imageWidth;
        canvas.height = this.imageHeight;
        canvas.style.display = 'block';

        this.ctx = canvas.getContext('2d')!;
        this.imageData = this.ctx.createImageData(this.imageWidth, this.imageHeight);
    }

    private initialize() {
        // calculate the image height, and ensure that it's at least 1
        // (imageWidth and imageHeight are both integers, as in the C++ code, so we need to use Math.max)
        this.imageHeight = Math.max(this.imageWidth / this.aspectRadio, 1);

        this.pixelSamplesScale = 1 / this.samplesPerPixel;

        this.initializeCanvas();

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

    /**
     * construct a camera ray originating from the origin and directed at randomly sampled
     * point around then pixel location i, j
     */
    private getRay(i: number, j: number): Ray {
        const offset = this.sampleSquare();
        const pixelSample = this.pixel00Location
            .add(multiply(this.pixelDeltaU, i + offset.x))
            .add(multiply(this.pixelDeltaV, j + offset.y));

        const rayOrigin = this.center;
        const rayDirection = subtract(pixelSample, rayOrigin);
        return new Ray(rayOrigin, rayDirection);
    }

    /** returns the vector to a random point in the square [-0.5, -0.5] - [+0.5, +0.5] unit square */
    private sampleSquare(): Vec3 {
        return new Vec3(random() - 0.5, random() - 0.5, 0);
    }

    private rayColor(ray: Ray, world: Hittable): Color {
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

    private updateProgress(value: number, total: number) {
        const text = document.querySelector('#progress-indicator span') as HTMLSpanElement;
        text.innerText = `${value + 1}/${total}`;
    }
}
