import Particula from "./Particula";
import Rect from "./Rect";

class Nave extends Rect {
    protected particulas: Particula[] = [];
    protected isExplosao = false;
    constructor(
        canvas: HTMLCanvasElement,
        x: number,
        y: number,
        width: number,
        heigth: number,
        protected image: HTMLImageElement | null,
        velocidadeX: number = 500,
        velocidadeY: number = 0,
        cor: string | CanvasGradient = "white"
    ) {
        super(canvas, x, y, width, heigth, velocidadeX, velocidadeY, cor);
    }

    explodir() {
        const qtd = 16;
        const fatia = (Math.PI * 2) / qtd;

        for (let i = 0; i < qtd; i++) {
            const angulo = fatia * i;
            const velocidadeX = Math.cos(angulo);
            const velocidadeY = Math.sin(angulo);
            this.particulas.push(
                new Particula(
                    this.canvas,
                    this.centerX,
                    this.centerY,
                    Math.random() * 4 + 2,
                    velocidadeX,
                    velocidadeY,
                    `hsl(${Math.random() * 60}, 100%, 50%)`
                )
            );
        }
        this.isExplosao = true;
    }

    update(deltaTime: number, isLeft: boolean, isRigth: boolean) {
        if (this.isExplosao)
            return this.particulas.forEach((v) => v.update(0.01));

        if (isLeft) this.x -= this.velocidadeX * deltaTime;
        else if (isRigth) this.x += this.velocidadeX * deltaTime;

        if (this.x <= 0) {
            this.x = 0;
        } else if (this.x + this.width >= this.canvas.width) {
            this.x = this.canvas.width - this.width;
        }
    }

    draw(isLeft = false, isRigth = false): void {
        this.ctx.beginPath();
        if (this.image && !this.isExplosao)
            if (isLeft || isRigth) {
                this.ctx.save();
                this.ctx.translate(this.centerX, this.centerY);
                this.ctx.rotate(isLeft ? -0.2 : 0.2);
                this.ctx.drawImage(
                    this.image,
                    -this.width / 2,
                    -this.heigth / 2,
                    this.width,
                    this.heigth
                );
                this.ctx.restore();
            } else
                this.ctx.drawImage(
                    this.image,
                    this.x,
                    this.y,
                    this.width,
                    this.heigth
                );
        else this.particulas.forEach((v) => v.draw());
    }

    get centerX() {
        return this.x + this.width / 2;
    }
    get centerY() {
        return this.y + this.heigth / 2;
    }
}

export default Nave;
