import { Canvas } from './Canvas';
import { Hittable } from './hittable';
import { Point3 } from './ray';
import { Vec3 } from './vec3';
import RenderWorker from './render.worker?worker';

export class Camera {
    /** radio of image width over height */
    aspectRadio = 1;

    /** rendered image width */
    imageWidth = 100;

    /** rendered image height */
    imageHeight!: number;

    /** count of random samples for each pixel */
    samplesPerPixel = 10;

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

    render(world: Hittable) {
        this.initialize();

        const canvas = new Canvas('#output', this.imageWidth, this.imageHeight);

        const renderWorker = new RenderWorker();
        renderWorker.postMessage({
            center: this.center,
            imageHeight: this.imageHeight,
            imageWidth: this.imageWidth,
            pixel00Location: this.pixel00Location,
            pixelDeltaU: this.pixelDeltaU,
            pixelDeltaV: this.pixelDeltaV,
            pixelSamplesScale: this.pixelSamplesScale,
            samplesPerPixel: this.samplesPerPixel,
            world,
        });

        // 接收从 Worker 返回的处理过的 ImageData
        renderWorker.onmessage = (event: MessageEvent<{ imageBitmap: ImageBitmap }>) => {
            const { imageBitmap } = event.data;
            canvas.ctx.drawImage(imageBitmap, 0, 0);
        };
    }

    private initialize() {
        // calculate the image height, and ensure that it's at least 1
        // (imageWidth and imageHeight are both integers, as in the C++ code, so we need to use Math.max)
        this.imageHeight = Math.max(this.imageWidth / this.aspectRadio, 1);

        this.pixelSamplesScale = 1 / this.samplesPerPixel;

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
}
