import CanvasObject from "./CanvasObjetc";

class Arc extends CanvasObject {
    protected _velocidadeX: number;
    protected _velocidadeY: number;
    constructor(
        canvas: HTMLCanvasElement,
        x: number,
        y: number,
        protected raio: number,
        protected velocidadeX: number = 0,
        protected velocidadeY: number = 0,
        cor: string = "white"
    ) {
        super(canvas, x, y, cor);
        this._velocidadeX = velocidadeX;
        this._velocidadeY = velocidadeY;
    }

    draw(any?: any) {
        super.draw();
        this.ctx.arc(this.x, this.y, this.raio, 0, Math.PI * 2);
        this.ctx.fill();
    }

    get getVelocidadeX(): number {
        return this.velocidadeX;
    }
    get getVelocidadeY(): number {
        return this.velocidadeY;
    }
    get getRaio(): number {
        return this.raio;
    }
}

export default Arc;
