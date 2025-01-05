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
