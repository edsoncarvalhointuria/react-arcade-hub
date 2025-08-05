import type BolaPong from "./BolaPong";
import Rect from "./Rect";

class RaquetePong extends Rect {
    protected dificuldade: number;
    protected _hasSuperShot = false;
    protected _hasShrink = false;

    constructor(
        canvas: HTMLCanvasElement,
        x: number,
        y: number,
        width: number,
        heigth: number,
        protected isOponente = false,
        cor: string | CanvasGradient = "white"
    ) {
        super(canvas, x, y, width, heigth);
        this.cor = cor;
        this._cor = cor;

        this.dificuldade = canvas.height * 0.7;
    }

    update(y: number, deltaTime: number, onShrink = false) {
        if (this.isOponente) {
            const distancia = y - (this.y + this.heigth / 2);
            const velocidade = this.dificuldade * deltaTime;
            this.y +=
                Math.min(Math.abs(distancia), velocidade) *
                    Math.sign(distancia) +
                (onShrink ? Math.random() * (40 * 2) - 40 : 0);
        } else {
            const altura = onShrink
                ? this.canvas.height - y + this.heigth
                : y - this.heigth;
            this.y = altura;
        }

        if (onShrink) this.heigth = this._heigth * 0.3;
        else this.heigth = this._heigth;
    }

    draw(
        bola: BolaPong,
        isSuperShot = false,
        isShrink = false,
        mode: string = ""
    ) {
        this.ctx.save();

        if (isSuperShot || this.hasSuperShot) {
            this.cor = "#E53935";
            this.ctx.shadowColor = "#E53935";
            this.ctx.shadowBlur = 20;
        } else this.cor = this._cor;

        if (mode === "dark") {
            const raioDeLuz = this.ctx.createRadialGradient(
                bola.getX,
                bola.getY,
                15,
                bola.getX,
                bola.getY,
                210
            );
            for (let i = 0; i <= 100; i++)
                raioDeLuz.addColorStop(
                    i * 0.01,
                    `rgba(255, 255, 255, ${100 - i}%)`
                );

            this.cor = raioDeLuz;
        }

        super.draw();
        if (isShrink) {
            for (let i = 0; i < 20; i++) {
                this.ctx.fillStyle = Math.random() > 0.5 ? "white" : "black";
                this.ctx.fillRect(
                    Math.random() * (this.width + 10) + (this.x - 5),
                    Math.random() * (this.heigth + 10) + (this.y - 5),
                    2,
                    2
                );
            }
        }

        this.ctx.restore();
    }

    modoFuria(pontos: number) {
        if (pontos) {
            this.cor = "crimson";
            //Depois adicionar a lógica certinho...
        } else {
            this.cor = "crimson";
        }
    }

    sairModoFuria() {
        this.cor = this._cor;
    }

    adicionarPower(power: "super-shot" | "shrink") {
        if (power === "shrink") this._hasShrink = true;
        if (power === "super-shot") this._hasSuperShot = true;
    }
    removerPower(power: "super-shot" | "shrink") {
        if (power === "shrink") this._hasShrink = false;
        if (power === "super-shot") this._hasSuperShot = false;
    }

    get hasSuperShot() {
        return this._hasSuperShot;
    }
    get hasShrink() {
        return this._hasShrink;
    }
}

export default RaquetePong;
