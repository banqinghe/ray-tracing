export interface SphereConfig {
    type: 'sphere';
    center: [number, number, number];
    radius: number;
}

export type ShapeConfig = SphereConfig;

export type SceneConfig = Array<ShapeConfig>;
