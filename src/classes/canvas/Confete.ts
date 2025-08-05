import Arc from "./Arc";

class Confete extends Arc {
    update() {
        this.y += this.velocidadeY;
        this.x += Math.random() * (this.velocidadeX * 2) - this.velocidadeX;

        if (this.y > this.canvas.height) this.y = 0;
    }
}

export default Confete;
