import Particula from "./Particula";
import Rect from "./Rect";
import type RaqueteBreakout from "./RaqueteBreakout";
import type { PowersBreakoutNamesType } from "../../types/Powers";

class Tijolo extends Rect {
    protected status: "inteiro" | "quebrando" | "quebrado" = "inteiro";
    protected particulas: Particula[] = [];
    protected blur = 25;
    protected direction = -5;

    constructor(
        canvas: HTMLCanvasElement,
        x: number,
        y: number,
        width: number,
        heigth: number,
        velocidadeY: number,
        protected powerUpType: PowersBreakoutNamesType | null,
        cor: string | CanvasGradient = "white"
    ) {
        super(canvas, x, y, width, heigth, 0, velocidadeY, cor);
    }

    update(
        isInfinite: boolean,
        deltaTime: number,
        raquete: RaqueteBreakout | null
    ) {
        if (isInfinite) {
            this.y += this.velocidadeY * deltaTime;
            if (raquete && this.y > raquete.getY - raquete.getHeigth)
                return "tijolo_chegou_no_fim";
            if (this.powerUpType) {
                this.blur += this.direction * deltaTime;
                if (this.blur < 5) this.direction = 10;
                else if (this.blur > 30) this.direction = -10;
            }
        }
        if (this.status === "quebrando")
            this.particulas.forEach((v) => v.update());
        if (this.particulas.length)
            if (this.particulas.every((v) => v.getVida < 0)) {
                this.status = "quebrado";
                this.particulas = [];
            }
    }

    draw(): void {
        if (this.status === "quebrado") return;

        if (this.status === "inteiro") {
            this.ctx.save();

            if (this.powerUpType) {
                this.ctx.shadowBlur = this.blur;
                this.ctx.shadowColor = "blue";
            }

            super.draw();
            this.ctx.restore();
        } else if (this.status === "quebrando")
            this.particulas.forEach((v) => v.draw());
    }

    break() {
        if (this.status !== "inteiro") return;
        for (let i = 0; i < 50; i++) {
            this.particulas.push(
                new Particula(
                    this.canvas,
                    Math.random() * this.width + this.x,
                    Math.random() * this.heigth + this.y,
                    Math.random() + 1,
                    Math.random() + 1 - 1.5,
                    Math.random() + 1 - 1.5,
                    this.cor as string
                )
            );
        }
        this.status = "quebrando";
    }

    get getStatus() {
        return this.status;
    }

    get getPowerUpType() {
        return this.powerUpType;
    }
}

export default Tijolo;
