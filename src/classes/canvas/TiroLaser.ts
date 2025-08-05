import Rect from "./Rect";

class TiroLaser extends Rect {
    protected anguloLaser = 0;
    protected hue = 0;
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
        super(canvas, x, y, width, heigth, velocidadeX, velocidadeY, cor);
    }

    update(deltaTime: number) {
        this.anguloLaser += deltaTime * 10;
        this.hue += 10;
        this.hue = this.hue % 360;

        const pulsacao = Math.sin(this.anguloLaser) * 5;
        this.width = this._width + pulsacao;
    }
    draw(): void {
        const cantoX = this.x - this.width / 2;
        // const cantoY = this.y - this.heigth / 2;
        this.ctx.beginPath();
        const gradiente = this.ctx.createLinearGradient(
            this.x,
            this.y,
            this.x + this.width,
            this.y + this.heigth
        );
        for (let i = 0; i <= 6; i++) {
            gradiente.addColorStop(
                i * (1 / 6),
                `hsl(${(this.hue + i * 60) % 360}, 100%, 70%)`
            );
        }
        this.ctx.fillStyle = gradiente;
        this.ctx.fillRect(cantoX, this.y, this.width, this.heigth);
    }
}

export default TiroLaser;
