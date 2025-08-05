import type {
    PowersBreakoutNamesType,
    PowersInvadersNamesType,
} from "../../types/Powers";
import Rect from "./Rect";

class PowerUpDrop extends Rect {
    constructor(
        canvas: HTMLCanvasElement,
        x: number,
        y: number,
        width: number,
        heigth: number,
        velocidadeX: number = 0,
        velocidadeY: number = 0,
        protected type: PowersBreakoutNamesType | PowersInvadersNamesType,
        protected imagem: HTMLImageElement,
        cor: string | CanvasGradient = "white"
    ) {
        super(canvas, x, y, width, heigth, velocidadeX, velocidadeY, cor);
    }

    update(deltaTime: number) {
        this.y += this.getVelocidadeY * deltaTime;
    }

    draw(): void {
        super.draw();
        this.ctx.drawImage(
            this.imagem,
            this.x,
            this.y,
            this.width,
            this.heigth
        );
    }

    get getType() {
        return this.type;
    }
}

export default PowerUpDrop;
