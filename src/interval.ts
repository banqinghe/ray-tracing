export class Interval {
    min: number;
    max: number;

    constructor(min?: number, max?: number) {
        // default interval is empty
        this.min = min ?? Infinity;
        this.max = max ?? -Infinity;
    }

    size() {
        return this.max - this.min;
    }

    contains(x: number) {
        return this.min <= x && x <= this.max;
    }

    surrounds(x: number) {
        return this.min < x && x < this.max;
    }

    clamp(x: number) {
        if (x < this.min) {
            return this.min;
        }
        if (x > this.max) {
            return this.max;
        };
        return x;
    }

    static empty = new Interval(Infinity, -Infinity);
    static universe = new Interval(-Infinity, Infinity);
}
