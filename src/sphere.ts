import { HitRecord, Hittable } from './hittable';
import { Interval } from './interval';
import { Point3, Ray } from './ray';
import { divide, dot, subtract } from './vec3';

export class Sphere implements Hittable {
    type = 'Sphere';
    center: Point3;
    radius: number;

    constructor(center: Point3, radius: number) {
        this.center = center;
        this.radius = Math.max(0, radius);
    }

    // Ray-sphere intersection
    // (C - P(t)) · (C - P(t)) = r²
    // (C - (Q + td)) · (C - (Q + td)) = r²
    // t = (-b ± √(b² - 4ac)) / 2a
    //   a = d · d
    //   b = -2d · (C - Q)
    //   c = (C - Q) · (C - Q) - r²
    hit(ray: Ray, interval: Interval, record: HitRecord) {
        // `center` is the center of the sphere, `ray` is the ray from camera to a point on the viewport
        // center = C
        // ray = P(t) = Q + td
        //   - Q is the position of camera
        //   - d is the direction of the ray
        //   - t is the parameter of the ray, which is the distance from the camera to the intersection point
        const oc = subtract(this.center, ray.origin); // C - Q

        // - original version
        // const a = dot(ray.direction, ray.direction);
        // const b = -2 * dot(oc, ray.direction);
        // const c = dot(oc, oc) - radius * radius;
        // const discriminant = b * b - 4 * a * c;

        // - simplified version:
        //   1. a · a = |a|²
        //   2. let b = -2h, so:
        //     b = -2h = -2d · (C - Q)
        //     h = d · (C - Q)
        //     t = (h ± √(h² - ac)) / a
        const a = ray.direction.lengthSquared();
        const h = dot(ray.direction, oc);
        const c = oc.lengthSquared() - this.radius * this.radius;

        const discriminant = h * h - a * c;
        if (discriminant < 0) {
            return false;
        }

        const sqrtd = Math.sqrt(discriminant);

        // find the root ∈ (rayTmin, rayTmax)
        // when repeatedly calling hit on multiple spheres, this operation allows us to always obtain, the minimum interval
        let root = (h - sqrtd) / a;
        if (!interval.surrounds(root)) {
            root = (h + sqrtd) / a;
            if (!interval.surrounds(root)) {
                return false;
            }
        }

        record.t = root;
        record.p = ray.at(record.t);
        const outwardNormal = divide(subtract(record.p, this.center), this.radius);
        record.setFaceNormal(ray, outwardNormal);

        return true;
    }
}
