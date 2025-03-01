import { dot, Vec3 } from './vec3';
import { Point3, Ray } from './ray';
import { Interval } from './interval';
import { Material } from './material';

export class HitRecord {
    p: Point3;
    normal: Vec3;
    t: number;
    /** determines whether the ray hits the object from the outside */
    frontFace: boolean;
    /** material at hit point, assigned upon hitting */
    material!: Material;

    constructor(p?: Point3, normal?: Vec3, t?: number) {
        this.p = p || new Point3();
        this.normal = normal || new Vec3();
        this.t = t || 0;
        this.frontFace = false;
    }

    /**
     * sets the his record normal vector
     * if the ray is outside the sphere, the normal is outwardNormal, otherwise it is -outwardNormal
     * NOTE: the parameter `outwardNormal` is assumed to have unit length
     */
    setFaceNormal(ray: Ray, outwardNormal: Vec3) {
        // dot result < 0 means the ray is outside the sphere
        this.frontFace = dot(ray.direction, outwardNormal) < 0;
        this.normal = this.frontFace ? outwardNormal : outwardNormal.negate();
    }
}

export abstract class Hittable {
    type = 'Hittable';
    abstract hit(r: Ray, interval: Interval, rec: HitRecord): boolean;
}
