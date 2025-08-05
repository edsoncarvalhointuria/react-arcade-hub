import Rect from "./Rect";

class Barreira extends Rect {
    protected hue = 0;

    update() {
        this.hue += 10;
        if (this.hue % 360 === 0) this.hue = 0;
    }

    draw(): void {
        const gradiente = this.ctx.createLinearGradient(
            this.x,
            this.y,
            this.x + this.width,
            this.y
        );
        for (let i = 0; i <= 6; i++) {
            gradiente.addColorStop(
                i * (1 / 6),
                `hsl(${(this.hue + i * 60) % 360}, 100%, 70%)`
            );
        }
        this.cor = gradiente;

        super.draw();
    }
}

export default Barreira;
