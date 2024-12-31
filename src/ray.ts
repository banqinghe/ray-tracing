import { Vec3 } from './vec3';

export class Point3 extends Vec3 {}

export class Ray {
    origin: Point3;
    direction: Vec3;

    constructor(origin?: Point3, direction?: Vec3) {
        this.origin = origin || new Point3();
        this.direction = direction || new Vec3();
    }

    at(t: number) {
        return this.origin.add(this.direction.multiply(t));
    }
}
