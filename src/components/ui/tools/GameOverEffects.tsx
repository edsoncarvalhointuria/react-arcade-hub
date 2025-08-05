import { useEffect, useRef } from "react";
import "./game-over-effects.scss";
import type { GameList } from "../../../types/GameList";
import Confete from "../../../classes/canvas/Confete";
import GotaDeChuva from "../../../classes/canvas/GotaDeChuva";
import BolaPong from "../../../classes/canvas/BolaPong";
import RaquetePong from "../../../classes/canvas/RaquetePong";
import Tijolo from "../../../classes/canvas/Tijolo";
import RaqueteBreakout from "../../../classes/canvas/RaqueteBreakout";
import Estrela from "../../../classes/canvas/Estrela";

function getDimencoesTijolo(canvas: HTMLCanvasElement) {
    const espacamento = 10;
    const colunas = 10;
    const espacoUtil = canvas.width - espacamento * (colunas - 1);
    const larguraTijolo = espacoUtil / colunas;
    const alturaTijolo = larguraTijolo * 0.3;
    const linhas = Math.ceil(canvas.height / (alturaTijolo + espacamento));

    return {
        linhas,
        colunas,
        espacamento,
        larguraTijolo,
        alturaTijolo,
    };
}

function GameOverEffects({
    type,
    state,
}: {
    type: GameList;
    state: "game-over-vitoria" | "game-over-derrota" | "ranking";
}) {
    const $canvas = useRef<HTMLCanvasElement>(null);
    const idAnimation = useRef<number>(0);
    const lastTimeAnimation = useRef<number>(0);
    const listaConfete = useRef<Confete[]>([]);
    const listaGotasDeChuva = useRef<GotaDeChuva[]>([]);
    const bola = useRef<BolaPong>(null);
    const pongP1 = useRef<RaquetePong>(null);
    const pongP2 = useRef<RaquetePong>(null);
    const tijolos = useRef<Tijolo[]>([]);
    const breakoutRaquete = useRef<RaqueteBreakout>(null);
    const dimensoesTijolo = useRef<{
        linhas: number;
        colunas: number;
        espacamento: number;
        larguraTijolo: number;
        alturaTijolo: number;
    }>(null);
    const estrelas = useRef<Estrela[]>([]);
    const QTD_CONFETES = 70;
    const QTD_GOTAS = 150;

    useEffect(() => {
        const canvas = $canvas.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) throw new Error("Canvas Não Encontrado");
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;

        const criarFileira = () => {
            let y = 0;
            if (tijolos.current.length)
                y = tijolos.current.reduce((prev, current) => {
                    if (current.getY < prev.getY) return current;
                    else return prev;
                }).getY;

            if (y > 0) y = 0;

            const espacamento = dimensoesTijolo.current!.espacamento;
            const colunas = dimensoesTijolo.current!.colunas;
            const larguraTijolo = dimensoesTijolo.current!.larguraTijolo;
            const alturaTijolo = dimensoesTijolo.current!.alturaTijolo;

            for (let coluna = 0; coluna < colunas; coluna++) {
                tijolos.current.push(
                    new Tijolo(
                        canvas,
                        (larguraTijolo + espacamento) * coluna,
                        y - alturaTijolo - espacamento,
                        larguraTijolo,
                        alturaTijolo,
                        20,
                        null,
                        `hsl(${Math.random() * 120 + 180}, 80%, 60%)`
                    )
                );
            }
        };

        const chuvaEstrelas = () => {
            estrelas.current = [];
            for (let i = 0; i < 150; i++) {
                const profundidade = Math.random();
                const raio = profundidade * 3;
                const velocidadeY = profundidade * 30;

                estrelas.current?.push(
                    new Estrela(
                        canvas,
                        Math.random() * canvas.width,
                        Math.random() * canvas.height,
                        raio,
                        velocidadeY,
                        velocidadeY
                    )
                );
            }
        };

        if (state === "game-over-vitoria")
            for (let i = 0; i < QTD_CONFETES; i++) {
                listaConfete.current.push(
                    new Confete(
                        canvas,
                        Math.random() * canvas.width,
                        Math.random() * canvas.height,
                        Math.random() * 5 + 1,
                        Math.random() + 1,
                        Math.random() + 1.3,
                        `hsl(${Math.random() * 360},50%, 50%)`
                    )
                );
            }
        else if (state === "game-over-derrota")
            for (let i = 0; i < QTD_GOTAS; i++) {
                listaGotasDeChuva.current.push(
                    new GotaDeChuva(
                        canvas,
                        Math.random() * canvas.width,
                        Math.random() * canvas.height,
                        Math.random() * 2,
                        Math.random() * 10 + 10,
                        50,
                        Math.random() * 300 + 300,
                        `rgba(255, 255, 255, 0.5)`
                    )
                );
            }
        else if (type === "Pong") {
            pongP1.current = new RaquetePong(
                canvas,
                0,
                canvas.height / 2,
                20,
                canvas.height / 3,
                false,
                "rgba(255, 255, 255,0)"
            );
            pongP2.current = new RaquetePong(
                canvas,
                canvas.width - 20,
                canvas.height / 2,
                20,
                canvas.height / 3,
                true,
                "rgba(255, 255, 255,0)"
            );

            bola.current = new BolaPong(
                canvas,
                pongP1.current.getX + 10,
                Math.random() * canvas.height,
                15,
                100,
                100,
                "rgba(255, 255, 255,0.1)",
                pongP1.current,
                pongP2.current
            );
        } else if (type === "Breakout") {
            tijolos.current = [];
            dimensoesTijolo.current = getDimencoesTijolo(canvas);

            breakoutRaquete.current = new RaqueteBreakout(
                canvas,
                canvas.width / 2,
                canvas.height,
                canvas.width,
                10,
                0,
                0,
                "rgba(0,0,0,0)"
            );

            for (let i = -2; i <= dimensoesTijolo.current.linhas; i++)
                criarFileira();
        } else if (type === "Invaders") {
            chuvaEstrelas();
        }

        const vitoria = () => {
            listaConfete.current.forEach((confete) => {
                confete.update();
                confete.draw();
            });
        };
        const derrota = (deltaTime: number) => {
            listaGotasDeChuva.current.forEach((gotas) => {
                gotas.update(deltaTime);
                gotas.draw();
            });
        };

        const PongEffect = (deltaTime: number) => {
            if (state === "game-over-vitoria") vitoria();
            else if (state === "game-over-derrota") derrota(deltaTime);
            else {
                pongP1.current?.update(bola.current!.getY, deltaTime);
                pongP2.current?.update(bola.current!.getY, deltaTime);
                bola.current?.update(deltaTime);

                pongP1.current?.draw(bola.current!, false, false, "");
                pongP2.current?.draw(bola.current!, false, false, "");
                bola.current?.draw("dark");
            }
        };

        const BreakoutEffect = (deltaTime: number) => {
            if (state === "game-over-vitoria") vitoria();
            else if (state === "game-over-derrota") derrota(deltaTime);
            else {
                let newLinha = false;
                for (let i = tijolos.current.length - 1; i >= 0; i--) {
                    const retorno = tijolos.current[i].update(
                        true,
                        deltaTime,
                        breakoutRaquete.current
                    );
                    tijolos.current[i].draw();

                    if (retorno) {
                        tijolos.current.splice(i, 1);
                        newLinha = true;
                    }
                }
                if (newLinha) criarFileira();
            }
        };

        const InvadersEffect = (deltaTime: number) => {
            estrelas.current?.forEach((v) => {
                v.update(deltaTime);
                v.draw();
            });
        };

        const render = (delta: number) => {
            if (state !== "ranking" || type === "Invaders") {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "black";
            } else ctx.fillStyle = `rgba(0, 0, 0, 0.1)`;

            ctx.fillRect(0, 0, canvas.width, canvas.height);

            let deltaTime = 0;
            if (lastTimeAnimation.current)
                deltaTime = (delta - lastTimeAnimation.current) / 1000;
            lastTimeAnimation.current = delta;

            switch (type) {
                case "Pong":
                    PongEffect(deltaTime);
                    break;
                case "Breakout":
                    BreakoutEffect(deltaTime);
                    break;
                case "Invaders":
                    InvadersEffect(deltaTime);
                    break;
            }

            idAnimation.current = requestAnimationFrame(render);
        };

        idAnimation.current = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(idAnimation.current);
        };
    }, []);

    return <canvas ref={$canvas} id="game-over-effects"></canvas>;
}

export default GameOverEffects;
