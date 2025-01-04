import { dot, Vec3 } from './vec3';
import { Point3, Ray } from './ray';
import { Interval } from './interval';

export class HitRecord {
    p: Point3;
    normal: Vec3;
    t: number;
    /** determines whether the ray hits the object from the outside */
    frontFace: boolean;

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

    assign(record: HitRecord) {
        this.p = record.p;
        this.normal = record.normal;
        this.t = record.t;
        this.frontFace = record.frontFace;
    }
}

export abstract class Hittable {
    abstract hit(r: Ray, interval: Interval, rec: HitRecord): boolean;
}
