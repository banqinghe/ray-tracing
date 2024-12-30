import './style.css';

function updateProgress(value: number) {
    const container = document.getElementById('progress-indicator');
    const progress = container.children[0];
    const text = container.children[1];
    progress.value = value;
    text.innerText = `${value}/256`;
}

function main() {
    const width = 256;
    const height = 256;

    const canvas = document.getElementById('output') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.createImageData(width, height);

    for (let j = 0; j < height; j++) {
        updateProgress(j);
        for (let i = 0; i < width; i++) {
            const r = i / (width - 1);
            const g = j / (height - 1);
            const b = 0;

            const ir = Math.floor(255.999 * r);
            const ig = Math.floor(255.999 * g);
            const ib = Math.floor(255.999 * b);

            imageData.data[(j * width + i) * 4 + 0] = ir;
            imageData.data[(j * width + i) * 4 + 1] = ig;
            imageData.data[(j * width + i) * 4 + 2] = ib;
            imageData.data[(j * width + i) * 4 + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

main();
