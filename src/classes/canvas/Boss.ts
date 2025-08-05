import type Asteroid from "./Asteroid";
import Particula from "./Particula";
import Rect from "./Rect";
import Tiro from "./Tiro";
import TiroLaser from "./TiroLaser";

class Boss extends Rect {
    protected status: "entrando" | "lutando" | "morto" = "entrando";
    protected vida = 1;
    protected timerMoviment = 0.8;
    protected _timeMoviment: number;
    protected cooldownFire = 1;
    protected yCooldown = 0;
    protected timerShield = 2;
    protected escudoAtivo = false;
    protected anguloEscudo = 0;
    protected direcao: 1 | -1 = 1;
    protected tiros: Tiro[] = [];
    protected particulasExplosao: Particula[] = [];
    protected danoFlash = false;
    protected danoTimer = 0;
    protected laserStatus:
        | "desligado"
        | "iniciar"
        | "girarEsquerda"
        | "girarDireita" = "desligado";
    protected proximoGiro: "esquerda" | "direita" = "esquerda";
    protected raioLaser: TiroLaser | null = null;
    protected laserTimer = 0;
    protected anguloRotacao = 0;
    protected maxAnguloRotacao: number;
    constructor(
        canvas: HTMLCanvasElement,
        x: number,
        y: number,
        width: number,
        heigth: number,
        velocidadeX: number,
        velocidadey: number,
        protected level: 1 | 2 | 3 | 4 | 5,
        protected ufoImage: HTMLImageElement[] | null,
        cor: string | CanvasGradient = "white"
    ) {
        super(canvas, x, y, width, heigth, velocidadeX, velocidadey, cor);
        switch (level) {
            case 1:
            case 2:
            case 3:
                this.timerMoviment = 0.2;
                this.yCooldown = 0.8;
                this.vida = 1;
                break;
            case 4:
                this.timerMoviment = 0.4;
                this.yCooldown = 0.8;
                this.vida = 1;
                break;
            case 5:
                this.timerMoviment = 0.6;
                this.vida = 1.5;
                break;
            default:
                this.timerMoviment = 0.5;
        }

        this._timeMoviment = this.timerMoviment;
        const ladoAdjacente = this.canvas.height - this.centerY;
        const ladoOposto = this.canvas.width - this.centerX;
        const anguloMaximo = Math.atan(ladoOposto / ladoAdjacente);

        this.maxAnguloRotacao = anguloMaximo + 0.08;
    }

    private oneShot() {
        this.tiros.push(
            new Tiro(
                this.canvas,
                this.centerX,
                this.y + this.heigth,
                7,
                400,
                400,
                "alien"
            )
        );
    }

    private treeShot() {
        this.tiros.push(
            new Tiro(
                this.canvas,
                this.centerX,
                this.y + this.heigth,
                7,
                400,
                400,
                "alien"
            ),
            new Tiro(
                this.canvas,
                this.centerX,
                this.y + this.heigth,
                7,
                200,
                400,
                "alien",
                true
            ),
            new Tiro(
                this.canvas,
                this.centerX,
                this.y + this.heigth,
                7,
                200,
                400,
                "alien",
                false,
                true
            )
        );
    }

    verificarColisaoEDanificar(
        alvo: Asteroid | Rect,
        asteroid: null | Asteroid = null
    ) {
        const alvoCentroX = alvo.getX + alvo.getWidth / 2;
        const alvoCentroY = alvo.getY + alvo.getHeigth / 2;
        const dx = alvoCentroX - this.centerX;
        const dy = alvoCentroY - this.centerY;

        const alvoXLocal =
            dx * Math.cos(-this.anguloRotacao) -
            dy * Math.sin(-this.anguloRotacao);

        const alvoYLocal =
            dx * Math.sin(-this.anguloRotacao) +
            dy * Math.cos(-this.anguloRotacao);

        const raioTopo = this.raioLaser!.getY;
        const raioBase = this.raioLaser!.getY + this.raioLaser!.getHeigth;
        const raioEsquerda = this.raioLaser!.getX;
        const raioDireita = this.raioLaser!.getX + this.raioLaser!.getWidth;

        const alvoTopo = alvoYLocal - alvo.getHeigth / 2;
        const alvoBase = alvoYLocal + alvo.getHeigth / 2;
        const alvoEsquerda = alvoXLocal - alvo.getWidth / 2;
        const alvoDireita = alvoXLocal + alvo.getWidth / 2;

        const houveColisao = !(
            raioTopo > alvoBase ||
            raioBase < alvoTopo ||
            raioEsquerda > alvoDireita ||
            raioDireita < alvoEsquerda
        );

        if (asteroid && houveColisao) {
            const posXRelativa = this.raioLaser!.getX - alvoXLocal;
            const posYRelativa = this.raioLaser!.getY - alvoYLocal;
            const danoX = asteroid.getWidth / 2 + posXRelativa;
            const danoY = asteroid.getHeigth / 2 + posYRelativa;
            asteroid.receberDanoLaser(
                danoX,
                danoY,
                this.raioLaser!.getWidth,
                this.raioLaser!.getHeigth
            );
        }
        return houveColisao;
    }

    receberDano(multiplicador: number) {
        if (!this.escudoAtivo) {
            this.vida -= 0.01 * multiplicador;
            this.danoFlash = true;
            this.danoTimer = 0.3;
        }
    }

    explodir() {
        const qtd = 30;
        const fatia = (Math.PI * 2) / qtd;
        for (let i = 0; i < qtd; i++) {
            const angulo = fatia * i;
            const x = Math.cos(angulo);
            const y = Math.sin(angulo);

            this.particulasExplosao.push(
                new Particula(
                    this.canvas,
                    this.centerX,
                    this.centerY,
                    Math.random() * 5 + 3,
                    x,
                    y,
                    `hsl(${Math.random() * 60}, 100%, 50%)`
                )
            );
        }

        this.status = "morto";
    }

    update(deltaTime: number) {
        switch (this.status) {
            case "entrando":
                this.y += this.velocidadeY * deltaTime;
                if (this.y >= 30) this.status = "lutando";
                break;
            case "lutando":
                if (this.timerMoviment <= 0) {
                    if (this.laserStatus === "desligado") {
                        // ---- Voltando Tempo de Movimento ----
                        this.timerMoviment = this._timeMoviment;
                        // ---- Se movendo ----
                        this.x += this.velocidadeX * this.direcao;

                        // ---- Vendo se bateu na parede ----
                        if (
                            this.x + -this.velocidadeX < 0 ||
                            this.x + this.width + this.velocidadeX * 2 >=
                                this.canvas.width
                        ) {
                            this.y += this.heigth / 2;
                            this.direcao *= -1;
                            this.timerMoviment = this.yCooldown;

                            if (this.level === 3)
                                this.cooldownFire =
                                    this.cooldownFire > 0 ? -1 : 100000;
                            else if (this.level === 5)
                                this.laserStatus = "iniciar";
                        }
                    }
                    // ---- Tiros ----
                    switch (this.level) {
                        case 1:
                            if (this.cooldownFire <= 0) {
                                this.oneShot();
                                this.cooldownFire = 1;
                            }
                            break;
                        case 2:
                            if (this.cooldownFire <= 0) {
                                this.treeShot();
                                this.cooldownFire = 1;
                            }
                            break;
                        case 3:
                            if (this.cooldownFire <= 0) this.oneShot();
                            break;
                        case 4:
                            if (this.cooldownFire <= 0) {
                                this.treeShot();
                                this.cooldownFire = 1;
                            }
                            if (this.timerShield <= 0) {
                                this.escudoAtivo = !this.escudoAtivo;
                                if (this.escudoAtivo) this.timerShield = 3;
                                else this.timerShield = 5;
                            }
                            break;

                        case 5:
                            if (
                                this.laserStatus === "iniciar" &&
                                this.laserTimer <= 0
                            ) {
                                this.raioLaser = new TiroLaser(
                                    this.canvas,
                                    0,
                                    this.heigth / 2,
                                    this.width * 0.4,
                                    this.canvas.height,
                                    0,
                                    0,
                                    "cyan"
                                );

                                this.laserTimer = 2;
                            } else if (this.laserStatus === "girarEsquerda") {
                                this.anguloRotacao += 0.1 * deltaTime;
                            } else if (this.laserStatus === "girarDireita") {
                                this.anguloRotacao -= 0.1 * deltaTime;
                            } else if (this.laserStatus === "desligado") {
                                this.anguloRotacao = 0;
                            }
                            this.anguloRotacao = Math.min(
                                this.maxAnguloRotacao,
                                Math.max(
                                    -this.maxAnguloRotacao,
                                    this.anguloRotacao
                                )
                            );
                            break;
                    }
                }
        }

        if (this.status === "lutando") {
            if (this.timerMoviment > 0) {
                this.timerMoviment -= deltaTime;
            }
            if (this.cooldownFire > 0) {
                this.cooldownFire -= deltaTime;
            }
            if (this.danoTimer > 0) {
                this.danoTimer -= deltaTime;
                this.danoFlash = false;
            }
            if (this.timerShield > 0) {
                this.timerShield -= deltaTime;

                if (this.escudoAtivo) {
                    this.anguloEscudo += deltaTime * 5;
                }
            }
            if (this.laserTimer > 0) {
                this.laserTimer -= deltaTime;

                if (this.laserTimer <= 0) {
                    this.laserTimer = 4;

                    if (this.laserStatus === "iniciar")
                        this.laserStatus =
                            this.proximoGiro === "esquerda"
                                ? "girarEsquerda"
                                : "girarDireita";
                    else if (this.proximoGiro === "esquerda") {
                        if (this.laserStatus === "girarEsquerda") {
                            this.laserStatus = "girarDireita";
                            this.laserTimer = 6;
                        } else if (this.laserStatus === "girarDireita") {
                            this.laserStatus = "desligado";
                            this.laserTimer = 0;
                            this.raioLaser = null;
                            this.proximoGiro = "direita";
                        }
                    } else {
                        if (this.laserStatus === "girarDireita") {
                            this.laserStatus = "girarEsquerda";
                            this.laserTimer = 6;
                        } else if (this.laserStatus === "girarEsquerda") {
                            this.laserStatus = "desligado";
                            this.laserTimer = 0;
                            this.raioLaser = null;
                            this.proximoGiro = "esquerda";
                        }
                    }
                }
            }

            this.tiros = this.tiros.filter(
                (v) =>
                    v.getX >= 0 &&
                    v.getX <= this.canvas.width &&
                    v.getY >= 0 &&
                    v.getY <= this.canvas.height
            );
        }

        this.particulasExplosao.forEach((v) => v.update(0.01));
        this.tiros.forEach((v) => v.update(deltaTime));
        this.raioLaser?.update(deltaTime);
    }

    draw(): void {
        if (this.status !== "morto") {
            this.ctx.beginPath();
            if (this.ufoImage) {
                this.ctx.save();
                if (this.danoFlash) this.ctx.globalAlpha = 0.5;
                else this.ctx.globalAlpha = 1;

                if (this.laserStatus !== "desligado") {
                    this.ctx.translate(this.centerX, this.centerY);
                    this.ctx.rotate(this.anguloRotacao);
                    this.ctx.drawImage(
                        this.ufoImage[this.level - 1],
                        -this.width / 2,
                        -this.heigth / 2,
                        this.width,
                        this.heigth
                    );
                    this.raioLaser?.draw();
                } else
                    this.ctx.drawImage(
                        this.ufoImage[this.level - 1],
                        this.x,
                        this.y,
                        this.width,
                        this.heigth
                    );

                if (this.escudoAtivo) {
                    const raioBase = this.width / 2 + 10;
                    const pulsacao = Math.sin(this.anguloEscudo) * 5;
                    const raioFinal = raioBase + pulsacao;
                    this.ctx.fillStyle = "blue";
                    this.ctx.shadowBlur = 10;
                    this.ctx.shadowColor = "cyan";
                    this.ctx.arc(
                        this.centerX,
                        this.centerY,
                        raioFinal,
                        0,
                        Math.PI * 2
                    );
                    this.ctx.stroke();
                }
                this.ctx.restore();
            }
        } else this.particulasExplosao.forEach((v) => v.draw());

        this.tiros.forEach((v) => v.draw());
    }

    get centerX() {
        return this.x + this.width / 2;
    }
    get centerY() {
        return this.y + this.heigth / 2;
    }

    get getTiros() {
        return this.tiros;
    }

    get getVida() {
        return this.vida;
    }

    get getStatus() {
        return this.status;
    }

    get getRaioLaser() {
        return this.raioLaser;
    }
}

export default Boss;
