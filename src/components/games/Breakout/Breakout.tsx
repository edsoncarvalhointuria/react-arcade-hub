import { useEffect, useRef, useState, type RefObject } from "react";
import type { GameProps } from "../../../types/GameProps";
import "./breakout.scss";
import Tijolo from "../../../classes/canvas/Tijolo";
import RaqueteBreakout from "../../../classes/canvas/RaqueteBreakout";
import BolaBreakout from "../../../classes/canvas/BolaBreakout";
import Lifes from "../../ui/tools/Lifes";
import { useToneContext } from "../../../contexts/AudioContext";
import type {
    PowersBreakoutNamesType,
    PowersBreakoutActiveType,
    PowersBreakoutTimeType,
} from "../../../types/Powers";
import PowerUpDrop from "../../../classes/canvas/PowerUpDrop";
import type Rect from "../../../classes/canvas/Rect";
import PowersActiveComponent from "../../ui/tools/PowersActiveComponent";
import Barreira from "../../../classes/canvas/Barreira";
import { powersIconsComponents } from "../../../config/powerUpAssets";
import type { Synth } from "tone";
import { criarSVG } from "../../../utils/criarSvg";
import { isMobileDevice } from "../../../utils/device";
import ButtonClick from "../../ui/tools/ButtonClick";

//------ Funções Auxiliares --------
function getDimencoesTijolo(canvas: HTMLCanvasElement, mode: string) {
    const IS_MOBILE = isMobileDevice();
    const linhas = IS_MOBILE ? 12 : 8;
    const colunas = IS_MOBILE ? 6 : 8;
    const espacamento = IS_MOBILE ? 4 : 8;
    const margemSuperior =
        mode === "infinite" ? 0 : Math.floor(canvas.width * 0.015) * 2;
    const margemLateral = Math.floor(canvas.width * 0.015) * 2;

    //calculando a largura
    const larguraUtil = canvas.width - margemLateral * 2;
    const totalEspacamentoHorizontal = espacamento * (colunas - 1);
    const larguraTijolo = (larguraUtil - totalEspacamentoHorizontal) / colunas;

    //calculando a altura
    const alturaUtil = canvas.height / 2.5 - margemSuperior * 2;
    const totalEspacamentoVertical = espacamento * (linhas - 1);
    const alturaTijolo = (alturaUtil - totalEspacamentoVertical) / linhas;

    return {
        linhas,
        colunas,
        espacamento,
        margemSuperior,
        margemLateral,
        larguraTijolo,
        alturaTijolo,
    };
}

//------ Componente Principal --------
function Breakout({ visible, gameState, mode, onGameOver }: GameProps) {
    //------ Constantes --------
    const IS_MOBILE = isMobileDevice();
    const TIMER_ADD_TIJOLOS = IS_MOBILE ? 3 : 7;
    const GAME_DIMENSIONS = {
        canvasHeigth: window.innerHeight,
        canvasWidth: window.innerWidth - window.innerWidth / 3.5,
    };
    const VELOCIDADE_TIJOLO = IS_MOBILE ? 8 : 5;
    const POWERS = [
        "raquete_gigante",
        "super_shot",
        "multiball",
        "mais_vida",
        "explosao",
        "barreira",
    ] as const satisfies readonly PowersBreakoutNamesType[];

    //------ States --------
    const [lifes, setLifes] = useState(4);
    const [score, setScore] = useState(0);
    const [powersActive, setPowersActive] = useState<PowersBreakoutActiveType>(
        Object.fromEntries(
            POWERS.map((v) => [v, false])
        ) as PowersBreakoutActiveType
    );

    //------ Refs --------
    ////------ Powers --------
    const powersActiveRef = useRef(powersActive);
    const powersActiveTime = useRef<PowersBreakoutTimeType>(
        Object.fromEntries(POWERS.map((v) => [v, 0])) as PowersBreakoutTimeType
    );
    const powerUpImgs = useRef<Partial<
        Record<PowersBreakoutNamesType, HTMLImageElement>
    > | null>(null);
    ////------ Objetos Atores --------
    const $canvas = useRef<HTMLCanvasElement>(null);
    const tijolos = useRef<Tijolo[]>([]);
    const powerUps = useRef<PowerUpDrop[]>([]);
    const raquete = useRef<RaqueteBreakout>(null);
    const barreira = useRef<Barreira>(null);
    const bola = useRef<BolaBreakout>(null);
    const bolasExtras = useRef<BolaBreakout[]>([]);
    ////------ Auxiliares --------
    const dimencoesTijolo = useRef<{
        linhas: number;
        colunas: number;
        espacamento: number;
        margemSuperior: number;
        margemLateral: number;
        larguraTijolo: number;
        alturaTijolo: number;
    }>(null);
    const timerTijolos = useRef(TIMER_ADD_TIJOLOS);
    const explosao = useRef({
        ativa: false,
        raio: 0,
        raioMax: 200,
        velocidade: 250,
    });
    const mouse = useRef({
        x: 0,
        y: 0,
    });
    ////------ Limpeza --------
    const idAnimation = useRef(0);
    const lastTimeAnimation = useRef(0);

    //------ Sons --------
    const {
        brickBreakSynth,
        hitSynth,
        explosionSynth,
        bigPaddleSynth,
        powerUpDropSynth,
        extraLifeSynth,
        multiballSynth,
        barrierSynth,
        superShotApontar,
        superShotFogo,
    } = useToneContext();

    useEffect(() => {
        powersActiveRef.current = powersActive;
    }, [powersActive]);

    useEffect(() => {
        if (lifes <= 0) {
            onGameOver(false, score);
        }
    }, [lifes]);

    useEffect(() => {
        //------ pegando canvas e ctx --------
        const canvas = $canvas.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) throw new Error("Canvas não encontrado");

        //------ limpando os tijolos --------
        tijolos.current = [];
        //------ definindo o tamanho dos tijolos --------
        dimencoesTijolo.current = getDimencoesTijolo(canvas, mode);

        //------ definindo o tamanho do canvas --------
        canvas.height = GAME_DIMENSIONS.canvasHeigth;
        canvas.width = GAME_DIMENSIONS.canvasWidth;

        //------ definindo imagens dos poderes --------
        if (mode === "infinite") {
            (async () => {
                const promises = Object.values(powersIconsComponents).map((v) =>
                    criarSVG(v)
                );
                const loadPromises = await Promise.all(promises);
                const imgs = (
                    Object.keys(
                        powersIconsComponents
                    ) as PowersBreakoutNamesType[]
                ).reduce((prev, current, i) => {
                    return {
                        ...prev,
                        [current]: loadPromises[i],
                    };
                }, {});

                powerUpImgs.current = imgs;
            })();
        }

        //------ Funções para criar Tijolos --------
        let poweUpType: PowersBreakoutNamesType | null = null;
        const criarFileira = () => {
            //------ Pegando uma cor para fileira --------
            const cor = Math.random() * 360;

            //------ Vendo a posição Y que a nova fileira será desenhada --------
            let y = 0;
            if (tijolos.current.length)
                y = tijolos.current.reduce((prev, current) => {
                    if (prev.getY < current.getY) return prev;
                    else return current;
                }).getY;
            if (y > 0) y = 0;

            //------ Vendo se essa fileira terá um poder --------
            poweUpType = null;
            if (Math.random() < 0.3) {
                const indexPower = Math.floor(Math.random() * POWERS.length);

                poweUpType = POWERS[indexPower];
            }
            const indexTijolo = Math.floor(
                Math.random() * dimencoesTijolo.current!.colunas
            );

            //------ Criando fileira --------
            if (dimencoesTijolo.current)
                for (
                    let coluna = 0;
                    coluna < dimencoesTijolo.current.colunas;
                    coluna++
                ) {
                    tijolos.current.push(
                        new Tijolo(
                            canvas,
                            (dimencoesTijolo.current.larguraTijolo +
                                dimencoesTijolo.current.espacamento) *
                                coluna +
                                dimencoesTijolo.current.margemLateral,
                            y -
                                dimencoesTijolo.current.alturaTijolo -
                                dimencoesTijolo.current.espacamento,
                            dimencoesTijolo.current.larguraTijolo,
                            dimencoesTijolo.current.alturaTijolo,
                            VELOCIDADE_TIJOLO,
                            indexTijolo === coluna ? poweUpType : null,
                            `hsl(${cor}, 50%, 50%)`
                        )
                    );
                }
        };

        const criarTijolos = () => {
            //------ Criando os tijolos --------
            if (dimencoesTijolo.current)
                //------ Linhas --------
                for (
                    let linha = 0;
                    linha < dimencoesTijolo.current?.linhas;
                    linha++
                ) {
                    // const cor = Math.random() * 360;
                    //------ Vendo se essa linha terá um super poder --------
                    if (Math.random() < 1 && mode === "infinite") {
                        // const indexPower = Math.floor(
                        //     Math.random() * POWERS.length - 1
                        // );
                        //Na primeira linha, teremos poderes em todos as linhas
                        poweUpType = POWERS[linha % POWERS.length];
                    }
                    const indexTijolo = Math.floor(
                        Math.random() * dimencoesTijolo.current.colunas
                    );

                    //------ Colunas --------
                    for (
                        let coluna = 0;
                        coluna < dimencoesTijolo.current.colunas;
                        coluna++
                    ) {
                        tijolos.current.push(
                            new Tijolo(
                                canvas,
                                (dimencoesTijolo.current.larguraTijolo +
                                    dimencoesTijolo.current.espacamento) *
                                    coluna +
                                    dimencoesTijolo.current.margemLateral,
                                (dimencoesTijolo.current.alturaTijolo +
                                    dimencoesTijolo.current.espacamento) *
                                    linha +
                                    dimencoesTijolo.current.margemSuperior,
                                dimencoesTijolo.current.larguraTijolo,
                                dimencoesTijolo.current.alturaTijolo,
                                VELOCIDADE_TIJOLO,
                                indexTijolo === coluna ? poweUpType : null,
                                `hsl(${linha * 500}, 50%, 50%)`
                            )
                        );
                    }

                    poweUpType = null;
                }

            if (mode === "infinite") criarFileira();
        };

        //------ Função para verificar colisão entre dois objetos no canvas --------
        const isColisao = (item1: Rect, item2: Rect) => {
            const item1Topo = item1.getY;
            const item1Base = item1.getY + item1.getHeigth;
            const item1Esquerda = item1.getX;
            const item1Direita = item1.getX + item1.getWidth;

            const item2Topo = item2.getY;
            const item2Base = item2.getY + item2.getHeigth;
            const item2Esquerda = item2.getX;
            const item2Direita = item2.getX + item2.getWidth;

            return !(
                item1Topo > item2Base ||
                item1Base < item2Topo ||
                item1Direita < item2Esquerda ||
                item1Esquerda > item2Direita
            );
        };

        //------ Raquete --------
        raquete.current = new RaqueteBreakout(
            canvas,
            canvas.width / 2,
            canvas.height - canvas.height * 0.025 - (IS_MOBILE ? 40 : 10),
            canvas.width * (IS_MOBILE ? 0.25 : 0.15),
            canvas.height * 0.025
        );

        //------ Bola --------
        bola.current = new BolaBreakout(
            canvas,
            raquete.current.getX + raquete.current.getWidth / 2,
            raquete.current.getY,
            Math.floor(canvas.width * 0.015),
            200,
            200,
            false,
            "white",
            raquete.current,
            tijolos,
            brickBreakSynth,
            hitSynth as RefObject<Synth>,
            superShotFogo as RefObject<Synth>,
            IS_MOBILE
        );

        //------ Tijolos --------
        criarTijolos();

        //------ Lógica do power up bomba --------
        const detonarBomba = () => {
            let pontos = 0;
            tijolos.current.forEach((tijolo) => {
                const centroX = tijolo.getX + tijolo.getWidth / 2;
                const centroY = tijolo.getY + tijolo.getHeigth / 2;

                const dx = Math.abs(centroX - bola.current!.getX);
                const dy = Math.abs(centroY - bola.current!.getY);

                const distanciaReal = Math.sqrt(dx ** 2 + dy ** 2);

                if (distanciaReal <= explosao.current.raioMax) {
                    tijolo.break();
                    ++pontos;
                }
            });

            explosao.current.ativa = true;
            return pontos;
        };

        //------ Função de evento de teclado --------
        const keydown = (evt: KeyboardEvent) => {
            if (evt.key === " ") {
                if (bola.current?.getIsPresa) bola.current?.lancar();
                else if (
                    powersActiveRef.current.explosao &&
                    !explosao.current.ativa
                ) {
                    explosionSynth.current?.triggerAttackRelease("8n");
                    const pontos = detonarBomba();
                    if (pontos) setScore((v) => v + pontos);
                    bola.current?.freeze();
                }
            }
        };
        window.addEventListener("keydown", keydown);

        //------ Update do jogo --------
        const update = (deltaTime: number) => {
            //------ Lógicas exclusivas do modo infinito --------
            if (mode === "infinite") {
                //------ Timer para adicionar os tijolos --------
                timerTijolos.current = timerTijolos.current - deltaTime;
                if (timerTijolos.current <= 0) {
                    timerTijolos.current = TIMER_ADD_TIJOLOS;
                    criarFileira();
                }

                //------ Atualizando PowerUp --------
                for (let i = powerUps.current.length - 1; i >= 0; i--) {
                    powerUps.current[i].update(deltaTime);

                    if (isColisao(raquete.current!, powerUps.current[i])) {
                        const type = powerUps.current[i].getType;
                        powerUps.current.splice(i, 1);

                        switch (type) {
                            case "raquete_gigante":
                                bigPaddleSynth.current?.triggerAttackRelease(
                                    "C3",
                                    "8n"
                                );
                                raquete.current?.activeBig();
                                setPowersActive((v) => ({
                                    ...v,
                                    [type]: true,
                                }));
                                powersActiveTime.current[type] = 10;
                                break;
                            case "mais_vida":
                                setLifes((v) => (v !== 10 ? v + 1 : v));
                                extraLifeSynth.current?.triggerAttackRelease(
                                    "A5",
                                    "0.5s"
                                );
                                break;
                            case "multiball":
                                bolasExtras.current.push(
                                    new BolaBreakout(
                                        canvas,
                                        bola.current!.getX,
                                        bola.current!.getY,
                                        bola.current!.getRaio,
                                        Math.random() < 0.5 ? 200 : -200,
                                        Math.random() < 0.5 ? 200 : -200,
                                        true,
                                        `hsl(${Math.random() * 360}, 75%, 75%)`,
                                        raquete.current!,
                                        tijolos,
                                        brickBreakSynth
                                    )
                                );
                                multiballSynth.current?.triggerAttackRelease(
                                    "C5",
                                    "8n"
                                );
                                break;
                            case "super_shot":
                                raquete.current?.activeSuperShot();
                                superShotApontar.current?.triggerAttackRelease(
                                    "C2",
                                    "0.5s"
                                );
                                break;
                            case "barreira":
                                barreira.current = new Barreira(
                                    canvas,
                                    0,
                                    canvas.height - 5,
                                    canvas.width,
                                    5
                                );
                                setPowersActive((v) => ({
                                    ...v,
                                    [type]: true,
                                }));
                                powersActiveTime.current["barreira"] = 15;
                                barrierSynth.current?.triggerAttackRelease(
                                    "C3",
                                    "1s"
                                );
                                break;
                            case "explosao":
                                setPowersActive((v) => ({
                                    ...v,
                                    [type]: true,
                                }));
                                break;
                            default:
                                console.log("Nada");
                        }
                    } else if (powerUps.current[i].getY > canvas.height)
                        powerUps.current.splice(i, 1);
                }

                //------ Lógica do timer dos powerUps --------
                (
                    Object.keys(
                        powersActiveTime.current
                    ) as PowersBreakoutNamesType[]
                ).forEach((v) => {
                    const power = powersActiveTime.current;
                    if (power[v] > 0) {
                        power[v] -= deltaTime;

                        if (power[v] <= 0) {
                            setPowersActive((powers) => ({
                                ...powers,
                                [v]: false,
                            }));

                            if (v === "barreira") barreira.current = null;
                        }
                    }
                });

                //------ Atualizando Bolas extras --------
                for (let i = bolasExtras.current.length - 1; i >= 0; i--) {
                    const retorno = bolasExtras.current[i].update(
                        deltaTime,
                        barreira.current
                    );

                    if (retorno?.evento === "copia_destruida") {
                        bolasExtras.current.splice(i, 1);
                    }
                }

                //------ Atualizando Barreira --------
                barreira.current?.update();

                //------ Atualizando Animação da Explosão --------
                if (explosao.current.ativa) {
                    explosao.current.raio +=
                        explosao.current.velocidade * deltaTime;

                    if (explosao.current.raio > explosao.current.raioMax) {
                        explosao.current.ativa = false;
                        explosao.current.raio = 0;
                        bola.current?.prender();
                        setPowersActive((v) => ({ ...v, explosao: false }));
                    }
                }
            }

            //------ Atualizando Tijolos --------
            tijolos.current.forEach((tijolo) => {
                const retorno = tijolo.update(
                    mode === "infinite",
                    deltaTime,
                    raquete.current
                );
                if (retorno === "tijolo_chegou_no_fim") setLifes(0);
            });

            //------ Atualizando Raquete --------
            raquete.current?.update(mouse.current.x, deltaTime);

            //------ Atualizando Bola --------
            const retorno = bola.current?.update(deltaTime, barreira.current);

            //------ Lógica para remover uma vida, inserir pontos, power up --------
            if (retorno)
                switch (retorno.evento) {
                    case "vida_perdida":
                        setLifes((v) => v - 1);
                        break;
                    case "tijolo_quebrado":
                        setScore((v) => (mode === "infinite" ? v + 1 : v + 10));
                        break;
                    case "power_up":
                        const largura =
                            dimencoesTijolo.current!.larguraTijolo / 2;
                        const altura =
                            dimencoesTijolo.current!.alturaTijolo / 2;

                        powerUps.current.push(
                            new PowerUpDrop(
                                canvas,
                                retorno.infos?.posX + largura,
                                retorno.infos?.posY + altura,
                                largura * (IS_MOBILE ? 1 : 0.5),
                                largura * (IS_MOBILE ? 1 : 0.5),
                                10,
                                Math.random() * 100 + 100,
                                retorno.infos?.type,
                                powerUpImgs.current![retorno.infos.type]!
                            )
                        );
                        powerUpDropSynth.current?.triggerAttackRelease(
                            ["C4", "E4", "G4", "C5"],
                            "16n"
                        );
                        break;
                    case "super_shot_active":
                        setPowersActive((v) => ({ ...v, super_shot: true }));
                        powersActiveTime.current = {
                            ...powersActiveTime.current,
                            super_shot: 7,
                        };
                        break;
                    default:
                        console.log("nada");
                }

            //------ Lógica de vitória no modo clássico --------
            if (mode !== "infinite")
                if (tijolos.current.every((v) => v.getStatus === "quebrado"))
                    onGameOver(true);
        };

        //------ draw do jogo --------
        const draw = () => {
            if (mode === "infinite") {
                //------ Power Ups --------
                powerUps.current?.forEach((v) => v.draw());

                //------ Bolas extras --------
                bolasExtras.current.forEach((v) => v.draw());

                //------ Barreira --------
                barreira.current?.draw();

                //------ Explosão --------
                if (explosao.current.ativa) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(
                        bola.current!.getX,
                        bola.current!.getY,
                        explosao.current.raio,
                        0,
                        Math.PI * 2
                    );
                    const progresso =
                        explosao.current.raio / explosao.current.raioMax;

                    ctx.lineWidth = 5 * (1 - progresso);
                    ctx.strokeStyle = `rgba(218, 165, 32, ${1 - progresso})`;
                    ctx.stroke();
                    ctx.restore();
                }
            }

            tijolos.current.forEach((tijolo) => {
                tijolo.draw();
            });
            raquete.current?.draw();
            bola.current?.draw();
        };

        const render = (time: number) => {
            //------ Atualizando DeltaTime --------
            let deltaTime = 0;
            if (lastTimeAnimation.current) {
                deltaTime = (time - lastTimeAnimation.current) / 1000;
            }
            lastTimeAnimation.current = time;

            //------ Lógica do Update --------
            if (gameState.current === "play") update(deltaTime);

            //------ Limpando lista de tijolos --------
            const novaListaTijolos = tijolos.current.filter(
                (v) => v.getStatus !== "quebrado"
            );
            tijolos.current = novaListaTijolos;

            //------ Limpando tela do canvas --------
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgba(13, 13, 13, 0.5)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            //------ Lógica do Draw --------
            draw();

            idAnimation.current = requestAnimationFrame(render);
        };

        idAnimation.current = requestAnimationFrame(render);

        return () => {
            if (idAnimation.current) cancelAnimationFrame(idAnimation.current);
            window.removeEventListener("keydown", keydown);
        };
    }, [mode]);

    return (
        <div className={`${visible ? "" : "hidden"} breakout`}>
            <Lifes
                qtd={lifes}
                game="breakout"
                position={
                    (window.innerWidth - GAME_DIMENSIONS.canvasWidth) / 4 - 5
                }
            />

            <div
                className="breakout__score"
                style={{
                    left:
                        (window.innerWidth - GAME_DIMENSIONS.canvasWidth) / 4 -
                        (IS_MOBILE ? 2 : 5),
                }}
            >
                <p className="breakout__score--title">SCORE</p>
                <p className="breakout__score--score">{score}</p>
            </div>

            <PowersActiveComponent
                positionLeft={
                    (window.innerWidth - GAME_DIMENSIONS.canvasWidth) / 4
                }
                powersActive={powersActive}
            />

            {IS_MOBILE ? <ButtonClick type="space" /> : <></>}

            <canvas
                ref={$canvas}
                className="breakout__canvas"
                onMouseMove={(evt) => {
                    mouse.current.x = evt.nativeEvent.offsetX;
                }}
                onTouchMove={(evt) => {
                    const canvas = evt.currentTarget;
                    const rect = canvas.getBoundingClientRect();
                    const touche = evt.nativeEvent.touches[0];
                    const x = touche.clientX - rect.left;
                    mouse.current.x = x - 10;
                }}
            ></canvas>
        </div>
    );
}

export default Breakout;
