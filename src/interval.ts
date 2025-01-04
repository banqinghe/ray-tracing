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

    static empty = new Interval(Infinity, -Infinity);
    static universe = new Interval(-Infinity, Infinity);
}
