abstract class CanvasObject {
    protected ctx: CanvasRenderingContext2D;
    protected _x: number;
    protected _y: number;
    protected _cor: string | CanvasGradient;

    constructor(
        protected canvas: HTMLCanvasElement,
        protected x: number,
        protected y: number,
        protected cor: string | CanvasGradient
    ) {
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        this._x = x;
        this._y = y;
        this._cor = cor;
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.cor;
    }

    reset() {
        this.x = this._x;
        this.y = this._y;
    }

    get getX(): number {
        return this.x;
    }

    get getY(): number {
        return this.y;
    }

    get getCor(): string | CanvasGradient {
        return this.cor;
    }

    set setCor(newCor: string) {
        this.cor = newCor;
    }
}

export default CanvasObject;
