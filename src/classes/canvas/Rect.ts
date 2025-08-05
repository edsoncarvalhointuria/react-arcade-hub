import CanvasObject from "./CanvasObjetc";

class Rect extends CanvasObject {
    protected _velocidadeX: undefined | number;
    protected _velocidadeY: undefined | number;
    protected _width: number;
    protected _heigth: number;
    constructor(
        canvas: HTMLCanvasElement,
        x: number,
        y: number,
        protected width: number,
        protected heigth: number,
        protected velocidadeX: number = 0,
        protected velocidadeY: number = 0,
        protected cor: string | CanvasGradient = "white"
    ) {
        super(canvas, x, y, cor);
        this._velocidadeX = velocidadeX;
        this._velocidadeY = velocidadeY;
        this._width = width;
        this._heigth = heigth;
    }

    draw(any?: any): void {
        super.draw();
        this.ctx.fillRect(this.x, this.y, this.width, this.heigth);
    }

    get getWidth(): number {
        return this.width;
    }
    get getHeigth(): number {
        return this.heigth;
    }

    get getVelocidadeX(): number {
        return this.velocidadeX;
    }
    get getVelocidadeY(): number {
        return this.velocidadeY;
    }
}

export default Rect;
