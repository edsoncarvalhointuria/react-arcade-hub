import Arc from "./Arc";

class Particula extends Arc {
    protected vida = 1;

    update(percent = 0.05, isShrink = false) {
        this.vida -= percent;
        this.x += this.velocidadeX;
        this.y += this.velocidadeY;

        if (isShrink) {
            this.raio *= 0.95;
        }
    }

    draw(any?: any): void {
        if (this.vida > 0) super.draw();
    }

    get getVida() {
        return this.vida;
    }
}

export default Particula;
