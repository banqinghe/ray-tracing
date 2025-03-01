type Material = 'lambertian' | 'metal' | 'dielectric';

export interface SphereConfig {
    type: 'sphere';
    center: [number, number, number];
    radius: number;
    material: Material;
    color?: [number, number, number];
    fuzz?: number;
    refractionIndex?: number;
}

export type ShapeConfig = SphereConfig;

export type SceneConfig = Array<ShapeConfig>;
