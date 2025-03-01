import { Interval } from './interval';
import { Vec3 } from './vec3';

export class Color extends Vec3 {};

function linearToGamma(linearComponent: number) {
    if (linearComponent > 0) {
        return Math.sqrt(linearComponent);
    }
    return 0;
}

export function writeColor(params: { i: number; j: number; pixelColor: Color; imageData: ImageData; imageWidth: number }) {
    const { i, j, pixelColor, imageData, imageWidth } = params;

    let r = pixelColor.x;
    let g = pixelColor.y;
    let b = pixelColor.z;

    // gamma correction
    r = linearToGamma(r);
    g = linearToGamma(g);
    b = linearToGamma(b);

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
