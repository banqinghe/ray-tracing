import { Camera } from './camera';
import { HittableList } from './hittable-list';
import { Point3 } from './ray';
import { Sphere } from './sphere';

function main() {
    const world = new HittableList();

    world.add(new Sphere(new Point3(0, 0, -1), 0.5));
    world.add(new Sphere(new Point3(0, -100.5, -1), 100));

    const camera = new Camera();

    camera.aspectRadio = 16 / 9;
    camera.imageWidth = 400;

    camera.render(world);
}

main();
