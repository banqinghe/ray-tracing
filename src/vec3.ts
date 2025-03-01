import { random } from './utils';

export class Vec3 {
    e: [number, number, number];

    constructor(e0 = 0, e1 = 0, e2 = 0) {
        this.e = [e0, e1, e2];
    }

    get x() {
        return this.e[0];
    }

    get y() {
        return this.e[1];
    }

    get z() {
        return this.e[2];
    }

    negate() {
        return new Vec3(-this.e[0], -this.e[1], -this.e[2]);
    }

    get(i: number) {
        return this.e[i];
    }

    add(v: Vec3) {
        return new Vec3(this.e[0] + v.e[0], this.e[1] + v.e[1], this.e[2] + v.e[2]);
    }

    subtract(v: Vec3) {
        return new Vec3(this.e[0] - v.e[0], this.e[1] - v.e[1], this.e[2] - v.e[2]);
    }

    multiply(t: number | Vec3) {
        if (typeof t === 'number') {
            return new Vec3(this.e[0] * t, this.e[1] * t, this.e[2] * t);
        } else {
            return new Vec3(this.e[0] * t.e[0], this.e[1] * t.e[1], this.e[2] * t.e[2]);
        }
    }

    divide(t: number) {
        return this.multiply(1 / t);
    }

    dot(v: Vec3) {
        return this.e[0] * v.e[0] + this.e[1] * v.e[1] + this.e[2] * v.e[2];
    }

    cross(v: Vec3) {
        return new Vec3(
            this.e[1] * v.e[2] - this.e[2] * v.e[1],
            this.e[2] * v.e[0] - this.e[0] * v.e[2],
            this.e[0] * v.e[1] - this.e[1] * v.e[0],
        );
    }

    length() {
        return Math.sqrt(this.lengthSquared());
    }

    lengthSquared() {
        return this.e[0] * this.e[0] + this.e[1] * this.e[1] + this.e[2] * this.e[2];
    }

    /** return true if the vector is close to zero in all dimensions */
    nearZero(): boolean {
        const s = 1e-8;
        return Math.abs(this.e[0]) < s && Math.abs(this.e[1]) < s && Math.abs(this.e[2]) < s;
    }

    get [Symbol.toStringTag]() {
        return 'Vec3';
    }

    static random(min?: number, max?: number) {
        return new Vec3(random(min, max), random(min, max), random(min, max));
    }
}

export function add(v1: Vec3, v2: Vec3) {
    return v1.add(v2);
}

export function subtract(v1: Vec3, v2: Vec3) {
    return v1.subtract(v2);
}

export function multiply(v: Vec3, t: number | Vec3) {
    return v.multiply(t);
}

export function divide(v: Vec3, t: number) {
    return v.divide(t);
}

export function dot(v1: Vec3, v2: Vec3) {
    return v1.dot(v2);
}

export function cross(v1: Vec3, v2: Vec3) {
    return v1.cross(v2);
}

export function unitVector(v: Vec3) {
    return v.divide(v.length());
}

/** generate a random unitVector of a unit sphere  */
export function randomUnitVector(): Vec3 {
    while (true) {
        const p = Vec3.random(-1, 1);
        const lengthSquared = p.lengthSquared();
        // avoid division by zero, javascript number is 64-bit double, so 1e-160 is a good threshold
        if (lengthSquared > 1e-160 && lengthSquared <= 1) {
            return p.divide(Math.sqrt(lengthSquared));
        }
    }
}

/** generate a random unitVector of a unit sphere, but only in the hemisphere of the normal */
export function randomOnHemisphere(normal: Vec3) {
    const onUnitSphere = randomUnitVector();
    if (dot(onUnitSphere, normal) > 0.0) {
        return onUnitSphere;
    } else {
        return onUnitSphere.multiply(-1);
    }
}

/**
 * reflect a vector around a normal
 * @param v the incident vector
 * @param n the normal of the surface
 */
export function reflect(v: Vec3, n: Vec3) {
    return subtract(v, multiply(n, 2 * dot(v, n)));
}

/**
 * refract a vector through a surface
 * @param uv the incident vector
 * @param n the normal of the surface
 * @param etaInOverEtaOut 𝜂/𝜂′ the ratio of the indices of refraction
 */
export function refract(uv: Vec3, n: Vec3, etaInOverEtaOut: number) {
    // due to precision issues, use Math.min() to avoid calculation results slightly greater than 1
    const cosTheta = Math.min(dot(uv.negate(), n), 1);
    const rOutPerpendicular = n.multiply(cosTheta).add(uv).multiply(etaInOverEtaOut);
    const rOutParallel = n.multiply(-Math.sqrt(Math.abs(1 - rOutPerpendicular.lengthSquared())));
    return add(rOutPerpendicular, rOutParallel);
}
