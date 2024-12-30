/// <reference types="vite/client" />

interface Window {
    config: {
        canvas: HTMLCanvasElement;
        ctx: CanvasRenderingContext2D;
        imageData: ImageData;
    };
}
