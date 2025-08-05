import type { Synth } from "tone";
import Arc from "./Arc";
import RaquetePong from "./RaquetePong";
import type { RefObject } from "react";

class BolaPong extends Arc {
    private score: "jogador" | "oponente" | "" = "";
    private velocidadeXMaxima = 1200;

    constructor(
        canvas: HTMLCanvasElement,
        x: number,
        y: number,
        raio: number,
        velocidadeX: number,
        velocidadeY: number,
        cor: string = "white",
        protected jogador: RaquetePong,
        protected oponente?: RaquetePong,
        private hitSynth?: RefObject<Synth>,
        private scoreSynth?: RefObject<Synth>
    ) {
        super(canvas, x, y, raio, velocidadeX, velocidadeY, cor);
    }

    private colisaoParede() {
        if (this.x - this.raio <= 0) {
            this.score = "oponente";
            this.x = this.raio;
            this.scoreSynth?.current?.triggerAttackRelease("G4", "8n");
            this.reset();
        } else if (this.y - this.raio <= 0) {
            this.y = this.raio;
            this.velocidadeY *= -1;
        }

        if (this.x + this.raio > this.canvas.width) {
            this.score = "jogador";
            this.x = this.canvas.width - this.raio;
            this.scoreSynth?.current?.triggerAttackRelease("G4", "8n");
            this.reset();
            this.velocidadeX *= -1;
        } else if (this.y + this.raio > this.canvas.height) {
            this.y = this.canvas.height - this.raio;
            this.velocidadeY *= -1;
        }
    }

    private colisaoRaquete(raquete: RaquetePong) {
        this.velocidadeX *= -1;

        const deltaY =
            (this.y - (raquete.getY + raquete.getHeigth / 2)) /
            (raquete.getHeigth / 2);
        const velocidadeMaxima = this.velocidadeX > 600 ? 600 : 400;
        const deltaNormalizado = Math.max(-1, Math.min(1, deltaY));
        this.velocidadeY = velocidadeMaxima * deltaNormalizado;
    }

    private isColisaoRaquete(raquete: RaquetePong) {
        const bolaTopo = this.y - this.raio;
        const bolaBase = this.y + this.raio;
        const bolaEsquerda = this.x - this.raio;
        const bolaDireita = this.x + this.raio;

        const raqueteTopo = raquete.getY;
        const raqueteBase = raquete.getY + raquete.getHeigth;
        const raqueteEsquerda = raquete.getX;
        const raqueteDireita = raquete.getX + raquete.getWidth;

        return !(
            bolaTopo > raqueteBase ||
            bolaBase < raqueteTopo ||
            bolaEsquerda > raqueteDireita ||
            bolaDireita < raqueteEsquerda
        );
    }

    pontoMarcado(reset = false) {
        if (reset) return (this.score = "");

        if (this.score === "jogador") return "jogador";
        else if (this.score === "oponente") return "oponente";
    }

    update(
        deltaTime: number,
        isSlow = false,
        isSuperShot = false,
        isSuperShotOponente = false
    ) {
        this.x += isSlow
            ? this.velocidadeX * deltaTime * 0.2
            : this.velocidadeX * deltaTime;
        this.y += isSlow
            ? this.velocidadeY * deltaTime * 0.2
            : this.velocidadeY * deltaTime;

        this.colisaoParede();

        if (this.isColisaoRaquete(this.jogador)) {
            this.velocidadeX *= 1.3;
            if (Math.abs(this.velocidadeX) > this.velocidadeXMaxima) {
                this.velocidadeX =
                    this.velocidadeXMaxima * Math.sign(this.velocidadeX);
            }
            this.colisaoRaquete(this.jogador);
            this.x = this.jogador.getX + this.jogador.getWidth + this.raio;
            this.hitSynth?.current?.triggerAttackRelease("C2", "8n");

            if (isSuperShot) {
                this.velocidadeX = this.velocidadeXMaxima * 2;
                this.velocidadeY = this.velocidadeXMaxima * 1.1;
                return "super-shot-complete";
            }
        } else if (this.oponente && this.isColisaoRaquete(this.oponente)) {
            this.velocidadeX *= 1.3;
            if (Math.abs(this.velocidadeX) > this.velocidadeXMaxima) {
                this.velocidadeX =
                    this.velocidadeXMaxima * Math.sign(this.velocidadeX);
            }
            this.colisaoRaquete(this.oponente);
            this.x = this.oponente.getX - this.raio;
            this.hitSynth?.current?.triggerAttackRelease("C2", "8n");

            if (isSuperShotOponente) {
                this.velocidadeX = this.velocidadeXMaxima * -2;
                this.velocidadeY =
                    this.velocidadeXMaxima *
                    1.1 *
                    (Math.random() > 0.5 ? 1 : -1);

                return "super-shot-complete";
            }
        }
    }

    reset(): void {
        super.reset();
        this.velocidadeX = this._velocidadeX;
        this.velocidadeY = this._velocidadeY;
    }

    draw(mode: string) {
        if (mode === "dark") {
            this.ctx.save();
            const tamanhoDoBrilho =
                20 + (Math.abs(this.velocidadeX) / this.velocidadeXMaxima) * 40;

            this.ctx.shadowBlur = tamanhoDoBrilho;
            this.ctx.shadowColor = "cyan";
            super.draw();
            this.ctx.restore();
        } else super.draw();
    }
}

export default BolaPong;
