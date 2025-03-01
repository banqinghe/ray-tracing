type Material = 'lambertian' | 'metal';

export interface SphereConfig {
    type: 'sphere';
    center: [number, number, number];
    radius: number;
    material: Material;
    color: [number, number, number];
}

export type ShapeConfig = SphereConfig;

export type SceneConfig = Array<ShapeConfig>;
