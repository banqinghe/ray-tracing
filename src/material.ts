import { Color } from './color';
import { HitRecord } from './hittable';
import { Ray } from './ray';
import { dot, randomUnitVector, reflect, refract, unitVector } from './vec3';

export abstract class Material {
    abstract scatter(rayIn: Ray, hitRecord: HitRecord, attenuation: Color, scattered: Ray): boolean;

    static create(
        type: string,
        options: {
            color?: [number, number, number];
            fuzz?: number;
            refractionIndex?: number;
        },
    ): Material {
        const { color, fuzz, refractionIndex } = options;
        switch (type) {
            case 'lambertian':
                return new Lambertian(color ? new Color(...color) : new Color(0, 0, 0));
            case 'metal':
                return new Metal(color ? new Color(...color) : new Color(0, 0, 0), fuzz);
            case 'dielectric':
                return new Dielectric(refractionIndex || 1.5);
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

export class Dielectric extends Material {
    private refractionIndex: number;

    constructor(refractionIndex = 1.5) {
        super();
        this.refractionIndex = refractionIndex;
    }

    scatter(rayIn: Ray, hitRecord: HitRecord, attenuation: Color, scattered: Ray): boolean {
        Object.assign(attenuation, new Color(1, 1, 1));

        const ri = hitRecord.frontFace ? 1 / this.refractionIndex : this.refractionIndex;

        const unitDirection = unitVector(rayIn.direction);

        const cosTheta = Math.min(dot(unitDirection.negate(), hitRecord.normal), 1);
        const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);

        // when the angle of incidence is greater than the critical value, there's no refraction
        const cannotRefract = ri * sinTheta > 1;
        const direction = cannotRefract || Dielectric.reflectance(cosTheta, ri) > Math.random()
            ? reflect(unitDirection, hitRecord.normal)
            : refract(unitDirection, hitRecord.normal, ri);

        Object.assign(scattered, new Ray(hitRecord.p, direction));
        return true;
    }

    static reflectance(cos: number, refractionIndex: number) {
        // Schlick's approximation
        let r0 = (1 - refractionIndex) / (1 + refractionIndex);
        r0 = r0 * r0;
        return r0 + (1 - r0) * Math.pow(1 - cos, 5);
    }
}
