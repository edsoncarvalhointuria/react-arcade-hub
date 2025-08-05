import Arc from "./Arc";

class Tiro extends Arc {
    constructor(
        canvas: HTMLCanvasElement,
        x: number,
        y: number,
        raio: number,
        velocidadeX: number,
        velocidadeY: number,
        protected type: "alien" | "nave" = "nave",
        protected isLeft = false,
        protected isRigth = false,
        protected isCopy = false,
        cor: string = "white"
    ) {
        super(canvas, x, y, raio, velocidadeX, velocidadeY, cor);
    }

    colisaoParede() {
        if (this.getX - this.raio <= 0) {
            this.velocidadeX *= -1;
            this.x = this.raio;
        } else if (this.getX + this.raio >= this.canvas.width) {
            this.velocidadeX *= -1;
            this.x = this.canvas.width - this.raio;
        }

        if (this.getY - this.raio <= 0) {
            this.velocidadeY *= -1;
            this.y = this.raio;
        }
    }

    update(deltaTime: number, isRecochetear = false) {
        this.y +=
            this.type === "nave"
                ? -(this.velocidadeY * deltaTime)
                : this.velocidadeY * deltaTime;
        if (this.isLeft || this.isRigth) {
            this.x +=
                (this.isLeft ? -this.velocidadeX : this.velocidadeX) *
                deltaTime;
        }

        if (isRecochetear) this.colisaoParede();
    }

    draw(isSuperShot = false): void {
        if (isSuperShot && this.type === "nave")
            this.cor = `hsl(${Math.random() * 60}, 100%, 50%)`;
        else this.cor = this._cor;

        super.draw();
    }

    get getType() {
        return this.type;
    }

    get getIsCopy() {
        return this.isCopy;
    }
}

export default Tiro;
