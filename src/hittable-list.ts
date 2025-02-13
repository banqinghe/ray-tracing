import { HitRecord, Hittable } from './hittable';
import { Interval } from './interval';
import { Ray } from './ray';
import { Sphere } from './sphere';
import { PlainObject } from './utils';

export class HittableList extends Hittable {
    type = 'HittableList';

    objects: Hittable[];

    constructor(object?: Hittable | Hittable[]) {
        super();
        if (Array.isArray(object)) {
            this.objects = [...object];
        } else {
            this.objects = object ? [object] : [];
        }
    }

    clear() {
        this.objects.length = 0;
    }

    add(object: Hittable) {
        this.objects.push(object);
    }

    hit(ray: Ray, interval: Interval, hitRecord: HitRecord) {
        const tempHitRecord = new HitRecord();
        let hitAnything = false;
        let closestSoFar = interval.max;

        for (const object of this.objects) {
            // update tempHitRecord in object.hit()
            if (object.hit(ray, new Interval(interval.min, closestSoFar), tempHitRecord)) {
                hitAnything = true;
                closestSoFar = tempHitRecord.t;
                hitRecord.assign(tempHitRecord);
            }
        }

        return hitAnything;
    }

    static fromPlainObject(json: PlainObject<HittableList>) {
        const parsedObjects = [];
        for (const object of json.objects) {
            if (object.type === 'Sphere') {
                parsedObjects.push(Sphere.fromPlainObject(object as Sphere));
            }
        }
        return new HittableList(parsedObjects);
    }
}
