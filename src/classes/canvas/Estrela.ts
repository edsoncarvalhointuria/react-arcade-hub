import Arc from "./Arc";

class Estrela extends Arc {
    protected pulseAngle = Math.random() * Math.PI * 2;
    update(deltaTime: number) {
        this.y += this.velocidadeY * deltaTime;

        if (this.y >= this.canvas.height) this.y = 0;

        this.pulseAngle += deltaTime * 5;
    }

    draw(): void {
        const onda = Math.sin(this.pulseAngle);
        const opacidade = ((onda + 1) / 2) * 0.5 + 0.5;
        const brilho = ((onda + 1) / 2) * 5 + 5;
        this.ctx.save();
        this.ctx.globalAlpha = opacidade;
        this.ctx.shadowBlur = brilho;
        this.ctx.shadowColor = "cyan";
        super.draw();
        this.ctx.restore();
    }
}

export default Estrela;
