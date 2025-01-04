import { Vec3 } from './vec3';

export class Color extends Vec3 {};

export function writeColor(params: { i: number; j: number; pixelColor: Color; imageData: ImageData; imageWidth: number }) {
    const { i, j, pixelColor, imageData, imageWidth } = params;

    const r = Math.floor(255.999 * pixelColor.x);
    const g = Math.floor(255.999 * pixelColor.y);
    const b = Math.floor(255.999 * pixelColor.z);

    imageData.data[(j * imageWidth + i) * 4 + 0] = r;
    imageData.data[(j * imageWidth + i) * 4 + 1] = g;
    imageData.data[(j * imageWidth + i) * 4 + 2] = b;
    imageData.data[(j * imageWidth + i) * 4 + 3] = 255;
}
