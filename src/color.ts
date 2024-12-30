import { Vec3 } from './vec3';
import { width } from './constants';

export class Color extends Vec3 {};

const { imageData } = window.config;

export function writeColor(i: number, j: number, pixelColor: Color) {
    const r = Math.floor(255.999 * pixelColor.x);
    const g = Math.floor(255.999 * pixelColor.y);
    const b = Math.floor(255.999 * pixelColor.z);

    imageData.data[(j * width + i) * 4 + 0] = r;
    imageData.data[(j * width + i) * 4 + 1] = g;
    imageData.data[(j * width + i) * 4 + 2] = b;
    imageData.data[(j * width + i) * 4 + 3] = 255;
}
