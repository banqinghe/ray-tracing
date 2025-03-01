import { Color } from './color';
import { HitRecord } from './hittable';
import { Ray } from './ray';
import { dot, randomUnitVector, reflect, unitVector } from './vec3';

export abstract class Material {
    abstract scatter(rayIn: Ray, hitRecord: HitRecord, attenuation: Color, scattered: Ray): boolean;

    static create(type: string, color: Color, fuzz?: number): Material {
        switch (type) {
            case 'lambertian':
                return new Lambertian(color);
            case 'metal':
                return new Metal(color, fuzz);
            default:
                throw new Error(`Unknown material type: ${type}`);
        }
    }
}

export class Lambertian extends Material {
    private albedo: Color;

    constructor(albedo: Color) {
        super();
        this.albedo = albedo;
    }

    scatter(_rayIn: Ray, hitRecord: HitRecord, attenuation: Color, scattered: Ray): boolean {
        let scatterDirection = hitRecord.normal.add(randomUnitVector());

        // if the randomly generated unit vector is exactly opposite to hitRecord.normal, it will
        // result in scatterDirection being zero, which is invalid
        if (scatterDirection.nearZero()) {
            scatterDirection = hitRecord.normal;
        }

        Object.assign(scattered, new Ray(hitRecord.p, scatterDirection));
        Object.assign(attenuation, this.albedo);
        return true;
    }
}

export class Metal extends Material {
    private albedo: Color;
    private fuzz: number;

    constructor(albedo: Color, fuzz = 1) {
        super();
        this.albedo = albedo;
        this.fuzz = Math.min(fuzz, 1);
    }

    scatter(rayIn: Ray, hitRecord: HitRecord, attenuation: Color, scattered: Ray): boolean {
        // if there's no unitVector, the length of the incident light will also affect the
        // calculation results, but we only want fuzz to be the sole factor.
        const reflected = unitVector(reflect(rayIn.direction, hitRecord.normal))
            .add(randomUnitVector().multiply(this.fuzz));
        Object.assign(scattered, new Ray(hitRecord.p, reflected));
        Object.assign(attenuation, this.albedo);
        return dot(scattered.direction, hitRecord.normal) > 0;
    }
}
