import type { RefObject } from "react";
import Arc from "./Arc";
import RaqueteBreakout from "./RaqueteBreakout";
import type Tijolo from "./Tijolo";
import type { Synth } from "tone";
import type { GameEvent } from "../../types/GameEvent";
import Particula from "./Particula";
import type Barreira from "./Barreira";
import type Rect from "./Rect";

class BolaBreakout extends Arc {
    protected isPresa = true;
    protected timer = 0;
    protected isSuperShot = false;
    protected isElevation = false;
    protected rastroParticulas: Particula[] = [];
    constructor(
        canvas: HTMLCanvasElement,
        x: number,
        y: number,
        raio: number,
        velocidadeX: number = 0,
        velocidadeY: number = 0,
        protected isCopy: boolean,
        cor: string = "white",
        protected jogador: RaqueteBreakout,
        protected tijolos: RefObject<Tijolo[]>,
        protected breakSynth?: () => void,
        protected hitSynth?: RefObject<Synth>,
        protected superShotFogo?: RefObject<Synth>
    ) {
        super(canvas, x, y, raio, velocidadeX, velocidadeY, cor);

        this.velocidadeY = -Math.abs(this.velocidadeY);
    }

    private colisaoParede() {
        if (this.x + this.raio > this.canvas.width) {
            this.x = this.canvas.width - this.raio;
            this.velocidadeX *= -1;
        } else if (this.x - this.raio < 0) {
            this.x = this.raio;
            this.velocidadeX *= -1;
        }

        if (this.y - this.raio < 0) {
            this.y = this.raio;
            this.velocidadeY *= -1;
        } else if (this.y + this.raio > this.canvas.height) {
            if (this.isCopy) return "copia_destruida";
            this.y = this.jogador.getY - this.raio * 1.1;
            this.x = this.jogador.getX + this.jogador.getWidth / 2 + this.raio;
            this.velocidadeY *= -1;
            this.velocidadeY = this._velocidadeY;
            this.isPresa = true;
            this.rastroParticulas = [];
            return "vida_perdida";
        }
    }

    private colisaoRaquete() {
        this.y = this.jogador.getY - this.raio * 1.1;
        this.velocidadeY *= -1;

        const deltaX =
            (this.x - (this.jogador.getX + this.jogador.getWidth / 2)) /
            (this.jogador.getWidth / 2);

        const velocidadeMaxima = Math.abs(this.velocidadeY) * 0.8;
        const deltaNormalizado = Math.max(-1, Math.min(1, deltaX));
        const fatorControle = 1;

        if (Math.abs(deltaNormalizado) < 0.1) {
            this.velocidadeX =
                0.1 * velocidadeMaxima * (Math.random() < 0.5 ? -1 : 1);
        } else {
            this.velocidadeX =
                this.velocidadeX * (1 - fatorControle) +
                velocidadeMaxima * deltaNormalizado * fatorControle;
        }
    }

    private isColisao(item: Rect) {
        const bolaTopo = this.y - this.raio;
        const bolaBase = this.y + this.raio;
        const bolaEsquerda = this.x - this.raio;
        const bolaDireita = this.x + this.raio;

        const itemTopo = item.getY;
        const itemBase = item.getY + item.getHeigth;
        const itemEsquerda = item.getX;
        const itemDireita = item.getX + item.getWidth;

        return !(
            bolaTopo > itemBase ||
            bolaBase < itemTopo ||
            bolaDireita < itemEsquerda ||
            bolaEsquerda > itemDireita
        );
    }

    private colisaoTijolo() {
        for (let tijolo of this.tijolos.current) {
            if (tijolo.getStatus === "inteiro" && this.isColisao(tijolo)) {
                const distanciaXMax = this.raio + tijolo.getWidth / 2;
                const distanciaYMax = this.raio + tijolo.getHeigth / 2;

                const offsetX = this.x - (tijolo.getX + tijolo.getWidth / 2);
                const offsetY = this.y - (tijolo.getY + tijolo.getHeigth / 2);

                const overlapX = distanciaXMax - Math.abs(offsetX);
                const overlapY = distanciaYMax - Math.abs(offsetY);

                // if (Math.abs(overlapY) < Math.abs(overlapX)) {
                //     this.velocidadeY *= -1;
                //     if (Math.sign(offsetY) <= 0) {
                //         this.y = tijolo.getY - this.raio;
                //     } else {
                //         this.y = tijolo.getY + tijolo.getHeigth + this.raio;
                //     }
                // }

                // Esse é o impede o samba = if (
                //     this.x >= tijolo.getX &&
                //     this.x <= tijolo.getX + tijolo.getWidth
                // )
                if (Math.abs(overlapY) < Math.abs(overlapX)) {
                    if (this.isSuperShot) {
                        if (this.isElevation) this.velocidadeY *= 0.8;

                        if (Math.abs(this.velocidadeY) < 200) {
                            this.isElevation = false;
                            this.velocidadeY = 100;
                        }
                    } else this.velocidadeY *= -1;

                    if (Math.sign(offsetY) <= 0) {
                        this.y = tijolo.getY - this.raio;
                    } else {
                        this.y = tijolo.getY + tijolo.getHeigth + this.raio;
                    }
                } else {
                    if (!this.isSuperShot) this.velocidadeX *= -1;

                    if (Math.sign(offsetX) <= 0) {
                        this.x = tijolo.getX - this.raio;
                    } else {
                        this.x = tijolo.getX + tijolo.getWidth + this.raio;
                    }
                }

                tijolo.break();
                if (this.breakSynth) this.breakSynth();

                if (tijolo.getPowerUpType)
                    return {
                        evento: "power_up",
                        infos: {
                            type: tijolo.getPowerUpType,
                            posX: tijolo.getX,
                            posY: tijolo.getY,
                        },
                    } as GameEvent;
                else return "tijolo_quebrado";
            }
        }
    }

    private activeSuperShot() {
        this.jogador.desactiveSuperShot();
        this.isSuperShot = true;
        this.timer = 7;
    }

    freeze() {
        this.velocidadeX = 0;
        this.velocidadeY = 0;
    }

    prender() {
        this.isPresa = true;
    }

    lancar() {
        this.isPresa = false;
        this.velocidadeY = -Math.abs(this._velocidadeY);
        this.velocidadeX = Math.abs(this._velocidadeX);
    }

    update(
        deltaTime: number,
        barreira: Barreira | null
    ): GameEvent | undefined {
        if (this.isPresa && !this.isCopy) {
            this.x = this.jogador.getX + this.jogador.getWidth / 2;
            this.y = this.jogador.getY - this.raio;
        } else {
            this.x += this.velocidadeX * deltaTime;
            this.y += this.velocidadeY * deltaTime;

            if (this.isSuperShot) {
                this.rastroParticulas.push(
                    new Particula(
                        this.canvas,
                        this.x,
                        this.y,
                        this.raio,
                        1 * Math.sign(this.velocidadeX),
                        1 * Math.sign(this.velocidadeY),
                        `hsl(${Math.random() * 60}, 100%, 50%)`
                    )
                );
                if (!this.isElevation && Math.abs(this.velocidadeY) < 500)
                    this.velocidadeY *= 1.1;
                for (let i = this.rastroParticulas.length - 1; i >= 0; i--) {
                    const particula = this.rastroParticulas[i];
                    particula.update(0.1, true);

                    if (particula.getVida <= 0) {
                        this.rastroParticulas.splice(i, 1);
                    }
                }

                this.timer -= deltaTime;
                if (this.timer <= 0) {
                    this.isSuperShot = false;
                    this.rastroParticulas = [];
                }
            }

            if (barreira && this.isColisao(barreira)) {
                this.velocidadeY *= -1;
                this.y = barreira.getY - this.raio * 2;
            }

            const vida = this.colisaoParede();
            if (vida) return { evento: vida };

            if (this.isColisao(this.jogador)) {
                if (!this.isCopy && this.jogador.getIsSuperShot) {
                    this.activeSuperShot();
                    return { evento: "super_shot_active" };
                }

                this.colisaoRaquete();
                this.hitSynth?.current.triggerAttackRelease("C2", "10n");

                this.velocidadeY *= 1.3;

                if (this.isSuperShot) {
                    this.isElevation = true;
                    this.superShotFogo?.current.triggerAttackRelease(
                        "C6",
                        "0.4s"
                    );
                }

                if (this.isSuperShot || Math.abs(this.velocidadeY) > 700) {
                    this.velocidadeY = 700 * Math.sign(this.velocidadeY);
                }
            }

            const tijolo = this.colisaoTijolo();

            if (tijolo && tijolo === "tijolo_quebrado")
                return { evento: tijolo };
            else return tijolo;
        }
    }

    draw(): void {
        if (!this.isCopy && this.isSuperShot) {
            this.ctx.save();
            this.ctx.shadowColor = "cyan";
            this.ctx.shadowBlur = 30;
            this.cor = "crimson";
            super.draw();
            this.ctx.restore();

            this.rastroParticulas.forEach((v) => v.draw());
        } else {
            this.cor = this._cor;
            super.draw();
        }
    }

    get getIsPresa() {
        return this.isPresa;
    }
}

export default BolaBreakout;
