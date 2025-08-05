import Rect from "./Rect";

class GotaDeChuva extends Rect {
    update(deltaTime: number) {
        this.y += this.velocidadeY * deltaTime;
        this.x += this.velocidadeX * deltaTime;
        if (this.x > this.canvas.width) this.x = 0;
        if (this.y >= this.canvas.height) {
            this.y = 0;
            this.x = this._x;
        }
    }
}

export default GotaDeChuva;
