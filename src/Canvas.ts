export class Canvas {
    el: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    constructor(selector: string, width: number, height: number) {
        this.el = document.querySelector(selector) as HTMLCanvasElement;
        this.el.width = width;
        this.el.height = height;
        this.el.style.display = 'block';

        this.ctx = this.el.getContext('2d') as CanvasRenderingContext2D;
    }
}
