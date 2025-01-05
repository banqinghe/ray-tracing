import { Interval } from './interval';
import { Vec3 } from './vec3';

export class Color extends Vec3 {};

export function writeColor(params: { i: number; j: number; pixelColor: Color; imageData: ImageData; imageWidth: number }) {
    const { i, j, pixelColor, imageData, imageWidth } = params;

    const r = pixelColor.x;
    const g = pixelColor.y;
    const b = pixelColor.z;

    // translate the [0, 1] component values to the byte range [0, 255]
    const intensity = new Interval(0, 0.999); // (0, 0.999) but not (0, 1) to avoid 256 (which is out of range)
    const rByte = Math.floor(256 * intensity.clamp(r));
    const gByte = Math.floor(256 * intensity.clamp(g));
    const bByte = Math.floor(256 * intensity.clamp(b));

    imageData.data[(j * imageWidth + i) * 4 + 0] = rByte;
    imageData.data[(j * imageWidth + i) * 4 + 1] = gByte;
    imageData.data[(j * imageWidth + i) * 4 + 2] = bByte;
    imageData.data[(j * imageWidth + i) * 4 + 3] = 255;
}
