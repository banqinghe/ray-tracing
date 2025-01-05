/**
 * `PlainObject<T>` creates a type by excluding function properties from `T`,
 * retaining only non-function properties
 */
export type PlainObject<T> = {
    [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

export function degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

export function random(min?: number, max?: number): number {
    if (typeof min === 'undefined' && typeof max === 'undefined') {
        return Math.random();
    }

    if (typeof min === 'number' && typeof max === 'number') {
        return Math.random() * (max - min) + min;
    }

    throw new Error(`Invalid arguments: min=${min}, max=${max}`);
}
