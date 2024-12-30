import { Color, writeColor } from './color';
import { width, height } from './constants';

function updateProgress(value: number) {
    const container = document.getElementById('progress-indicator')!;
    const progress = container.children[0] as HTMLProgressElement;
    const text = container.children[1] as HTMLSpanElement;
    progress.value = value;
    text.innerText = `${value + 1}/256`;
}

function main() {
    for (let j = 0; j < height; j++) {
        updateProgress(j);
        for (let i = 0; i < width; i++) {
            const pixelColor = new Color(i / (width - 1), j / (height - 1), 0);
            writeColor(i, j, pixelColor);
        }
    }

    const { ctx, imageData } = window.config;
    ctx.putImageData(imageData, 0, 0);
}

main();
