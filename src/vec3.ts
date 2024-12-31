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

    length() {
        return Math.sqrt(this.lengthSquared());
    }

    lengthSquared() {
        return this.e[0] * this.e[0] + this.e[1] * this.e[1] + this.e[2] * this.e[2];
    }

    get [Symbol.toStringTag]() {
        return 'Vec3';
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
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

export function cross(v1: Vec3, v2: Vec3) {
    return new Vec3(
        v1.y * v2.z - v1.z * v2.y,
        v1.z * v2.x - v1.x * v2.z,
        v1.x * v2.y - v1.y * v2.x,
    );
}

export function unitVector(v: Vec3) {
    return v.divide(v.length());
}
