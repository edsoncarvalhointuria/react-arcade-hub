import CanvasObject from "./CanvasObjetc";

class Asteroid extends CanvasObject {
    protected vertices = { x: [] as number[], y: [] as number[] };
    protected canvasInterno: HTMLCanvasElement;
    protected ctxInterno: CanvasRenderingContext2D;

    constructor(
        canvas: HTMLCanvasElement,
        x: number,
        y: number,
        protected raioBase: number,
        protected variacao: number = 20,
        cor: string | CanvasGradient = "white"
    ) {
        super(canvas, x, y, cor);
        const c = document.createElement("canvas");
        c.width = (raioBase + variacao) * 2;
        c.height = (raioBase + variacao) * 2;
        this.canvasInterno = c;
        this.ctxInterno = c.getContext("2d", { willReadFrequently: true })!;

        const numVertices = 12;
        const fatia = (Math.PI * 2) / numVertices;

        for (let i = 0; i < numVertices; i++) {
            const angulo = fatia * i;
            const raioDesteVertice =
                raioBase + (Math.random() - 0.5) * variacao;
            const verticeX = Math.cos(angulo) * raioDesteVertice;
            const verticeY = Math.sin(angulo) * raioDesteVertice;

            this.vertices.x.push(verticeX);
            this.vertices.y.push(verticeY);
        }

        this.ctxInterno.beginPath();
        this.ctxInterno.moveTo(
            this.vertices.x[0] + this.canvasInterno.width / 2,
            this.vertices.y[0] + this.canvasInterno.height / 2
        );
        for (let i = 1; i < this.vertices.x.length; i++) {
            this.ctxInterno.lineTo(
                this.vertices.x[i] + this.canvasInterno.width / 2,
                this.vertices.y[i] + this.canvasInterno.height / 2
            );
        }
        this.ctxInterno.closePath();
        this.ctxInterno.fillStyle = cor;
        this.ctxInterno.fill();
    }

    receberDano(danoX: number, danoY: number, raioDoDano: number) {
        for (let i = 0; i < 20; i++) {
            const angulo = Math.random() * Math.PI * 2;
            const distancia = Math.random() * raioDoDano;
            const x = danoX + Math.cos(angulo) * distancia;
            const y = danoY + Math.sin(angulo) * distancia;
            this.ctxInterno.clearRect(x, y, 10, 10);
        }
    }

    receberDanoLaser(
        danoX: number,
        danoY: number,
        width: number,
        height: number
    ) {
        this.ctxInterno.clearRect(danoX - width / 2, danoY, width, height);
    }

    isPixel(x: number, y: number) {
        const pixel = this.ctxInterno.getImageData(x, y, 1, 1).data;
        return pixel[3] > 0;
    }

    draw(): void {
        this.ctx.drawImage(this.canvasInterno, this.x, this.y);
    }

    get getHeigth() {
        return this.canvasInterno.height;
    }
    get getWidth() {
        return this.canvasInterno.width;
    }
    get centerX() {
        return this.x + this.canvasInterno.width / 2;
    }
    get centerY() {
        return this.y + this.canvasInterno.height / 2;
    }
}

export default Asteroid;
