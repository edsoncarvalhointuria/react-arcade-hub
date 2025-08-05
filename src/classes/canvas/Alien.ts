import Particula from "./Particula";
import Rect from "./Rect";

class Alien extends Rect {
    protected frameAtual = 0;
    protected frameTimer = 0.5;
    protected _frameTimer = this.frameTimer;
    protected particulas: Particula[] = [];
    constructor(
        canvas: HTMLCanvasElement,
        x: number,
        y: number,
        width: number,
        heigth: number,
        protected image: HTMLImageElement | null,
        protected frames: number,
        protected recortes: {
            sx: number;
            sy: number;
            sWidth: number;
            sHeight: number;
        }[],
        protected type: 1 | 2 | 3,
        velocidadeX: number = 500,
        velocidadeY: number = 0,
        cor: string | CanvasGradient = "white"
    ) {
        super(canvas, x, y, width, heigth, velocidadeX, velocidadeY, cor);
    }

    explodir() {
        const numeroDeParticulas = 8;
        const alguloFatia = (Math.PI * 2) / numeroDeParticulas;

        for (let i = 0; i < numeroDeParticulas; i++) {
            const angulo = i * alguloFatia;
            const velocidadeX = Math.cos(angulo) * 5;
            const velocidadeY = Math.sin(angulo) * 5;

            this.particulas.push(
                new Particula(
                    this.canvas,
                    this.x,
                    this.y,
                    3,
                    velocidadeX,
                    velocidadeY
                )
            );
        }

        return this.particulas;
    }

    nextFrame() {
        this.frameAtual = (this.frameAtual + 1) % this.frames;
    }

    update(deltaTime: number, velocidadeX: number, velocidadeY: number) {
        this.x += velocidadeX;
        this.y += velocidadeY;
        this.nextFrame();
        if (
            this.x + velocidadeX * 2 < 0 ||
            this.x + this.width + velocidadeX * 2 > this.canvas.width
        )
            return true;

        return false;
    }

    draw(): void {
        if (this.image) {
            this.ctx.drawImage(
                this.image,
                this.recortes[this.frameAtual].sx,
                this.recortes[this.frameAtual].sy,
                this.recortes[this.frameAtual].sWidth,
                this.recortes[this.frameAtual].sHeight,
                this.x,
                this.y,
                this.width,
                this.heigth
            );
        }
    }

    get getType() {
        return this.type;
    }
}

export default Alien;
