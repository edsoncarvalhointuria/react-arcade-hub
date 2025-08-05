import { useEffect, useRef, useState, type RefObject } from "react";
import type { GameProps } from "../../../types/GameProps";
import "./pong.scss";
import RaquetePong from "../../../classes/canvas/RaquetePong";
import BolaPong from "../../../classes/canvas/BolaPong";
import PowerUps from "../../ui/tools/PowerUps";
import type { PowersPongType } from "../../../types/Powers";
import Lifes from "../../ui/tools/Lifes";
import { useToneContext } from "../../../contexts/AudioContext";
import type { AMSynth, NoiseSynth, Synth } from "tone";
import { isMobileDevice } from "../../../utils/device";

function gameConfigs(canvas: HTMLCanvasElement) {
    const raqueteWidth = canvas.width * 0.015;
    const raqueteHeigth = canvas.height * 0.15;
    const raqueteY = canvas.height / 2 - raqueteHeigth / 2;

    const bolaRaio = Math.floor(canvas.width * 0.012);

    return {
        raqueteWidth,
        raqueteHeigth,
        raqueteY,
        bolaRaio,
    };
}

function Pong({ visible, gameState, mode, onGameOver }: GameProps) {
    // -------- Use States -------------
    const [powers, setPowerUp] = useState<PowersPongType>({
        shrinkPower: { ativo: false, carga: 1, tempoAnimacao: 5000 },
        slowPower: { ativo: false, carga: 1, tempoAnimacao: 5000 },
        superShotPower: { status: "preparar", carga: 1 },
    });
    const [powersOponente, setPowerOponente] = useState({
        isShrink: false,
        isSuperShot: false,
    });
    const [score, setScore] = useState({ jogador: 0, oponente: 0 });
    const [quemPontuou, setQuemPontuou] = useState<
        "jogador" | "oponente" | null
    >(null);
    // -------- Use Refs -------------
    const isPowerUp = useRef(powers);
    const modeRef = useRef(mode);
    const $canvas = useRef<HTMLCanvasElement>(null);
    const idAnimation = useRef<number>(0);
    const idTimeout = useRef<ReturnType<typeof setTimeout>>(null);
    const lastTime = useRef<number>(0);
    const jogador = useRef<RaquetePong>(null);
    const oponente = useRef<RaquetePong>(null);
    const bola = useRef<BolaPong>(null);
    const mouse = useRef({
        x: null as number | null,
        y: null as number | null,
    });
    // -------- Variaveis -------------
    const IS_MOBILE = isMobileDevice();
    const GAME_DIMENSIONS = IS_MOBILE
        ? {
              canvasHeigth: window.innerWidth - window.innerWidth / 6,
              canvasWidth: window.innerHeight - window.innerHeight / 8,
          }
        : {
              canvasHeigth: window.innerHeight - window.innerHeight / 8,
              canvasWidth: window.innerWidth - window.innerWidth / 6,
          };
    const PONTOS_PARA_VENCER = 7;
    const {
        hitSynth,
        scoreSynth,
        shrinkSynth,
        slowSynth,
        superShotApontar,
        superShotFogo,
    } = useToneContext();

    // -------- Atualizando o modo -------------
    useEffect(() => {
        modeRef.current = mode;
    }, [mode]);
    // -------- UseEffect dos pontos -------------
    useEffect(() => {
        if (mode === "challenge" || mode === "dark") {
            if (score.jogador >= PONTOS_PARA_VENCER) return onGameOver(true);
            else if (score.oponente >= PONTOS_PARA_VENCER)
                return onGameOver(false);

            // -------- Dando um Shrink para o oponente -------------
            if (score.jogador === 5 && quemPontuou === "jogador") {
                oponente.current?.adicionarPower("shrink");
                (shrinkSynth.current as NoiseSynth)?.triggerAttack("0.5s");
                setPowerOponente((current) => ({ ...current, isShrink: true }));
            }
            // -------- Dando um super Shot para o oponente -------------
            if (score.jogador === 6 && quemPontuou === "jogador") {
                oponente.current?.adicionarPower("super-shot");
                (superShotApontar.current as AMSynth)?.triggerAttackRelease(
                    "C2",
                    "0.5s"
                );
                setPowerOponente((current) => ({
                    ...current,
                    isSuperShot: true,
                }));
            }
            // -------- Dando um poder de cada para o jogador -------------
            if (score.oponente === 6 && quemPontuou === "oponente") {
                setPowerUp((current) => ({
                    ...current,
                    shrinkPower: {
                        ...current.shrinkPower,
                        carga: current.shrinkPower.carga + 1,
                    },
                    slowPower: {
                        ...current.slowPower,
                        carga: current.slowPower.carga + 1,
                    },
                    superShotPower: {
                        ...current.superShotPower,
                        carga: current.superShotPower.carga + 1,
                    },
                }));
            }
        } else if (mode === "infinite") {
            // -------- Lógica de fim de jogo -------------
            if (score.oponente >= 3) return onGameOver(false, score.jogador);

            //----------- Dando um poder aleatório para o oponente -----------
            if (score.jogador > 0) {
                if (score.jogador % 3 === 0 && quemPontuou === "jogador") {
                    const random = Math.random();
                    oponente.current?.adicionarPower(
                        random > 0.5 ? "super-shot" : "shrink"
                    );
                    const power = random > 0.5 ? "isSuperShot" : "isShrink";
                    setPowerOponente((current) => ({
                        ...current,
                        [power]: true,
                    }));
                }
            }
        }

        if (score.jogador > 0) {
            //----------- Aplicando Poder SUPER-SHOT -----------
            if (score.jogador % 3 === 0 && quemPontuou === "jogador") {
                setPowerUp((current) => ({
                    ...current,
                    superShotPower: {
                        carga: current.superShotPower.carga + 1,
                        status: current.superShotPower.status,
                    },
                }));
            }
            //----------- Aplicando os outros poderes -----------
            if (score.jogador % 2 === 0 && quemPontuou === "jogador") {
                setPowerUp((current) => ({
                    ...current,
                    shrinkPower: {
                        ...current.shrinkPower,
                        carga: current.shrinkPower.carga + 1,
                    },
                    slowPower: {
                        ...current.slowPower,
                        carga: current.slowPower.carga + 1,
                    },
                }));
            }
        }
    }, [score]);
    // -------- Atualização do Ref power para o valor mais recente -------------
    useEffect(() => {
        isPowerUp.current = powers;
    }, [powers]);
    // -------- Criação da lógica do jogo -------------
    useEffect(() => {
        const canvas = $canvas.current;
        const ctx = canvas?.getContext("2d");

        if (!canvas || !ctx) return;

        canvas.height = GAME_DIMENSIONS.canvasHeigth;
        canvas.width = GAME_DIMENSIONS.canvasWidth;

        const gameConfig = gameConfigs(canvas);

        jogador.current = new RaquetePong(
            canvas,
            gameConfig.raqueteWidth,
            gameConfig.raqueteY,
            gameConfig.raqueteWidth,
            gameConfig.raqueteHeigth
        );
        oponente.current = new RaquetePong(
            canvas,
            canvas.width - gameConfig.raqueteWidth * 2,
            gameConfig.raqueteY,
            gameConfig.raqueteWidth,
            gameConfig.raqueteHeigth,
            true
        );
        bola.current = new BolaPong(
            canvas,
            canvas.width / 2,
            canvas.height / 2,
            gameConfig.bolaRaio,
            200,
            200,
            "white",
            jogador.current,
            oponente.current,
            hitSynth as RefObject<Synth>,
            scoreSynth as RefObject<Synth>
        );

        // -------- Evento para de teclado para aplicar os poderes -------------
        const keydown = (evt: KeyboardEvent) => {
            // ---- Slow
            if (
                evt.key === "w" &&
                !isPowerUp.current.slowPower.ativo &&
                isPowerUp.current.slowPower.carga > 0
            ) {
                setPowerUp((current) => ({
                    ...current,
                    slowPower: {
                        ativo: true,
                        carga: current.slowPower.carga - 1,
                        tempoAnimacao: 5000,
                    },
                }));
                (slowSynth.current as Synth)?.triggerAttack("C2");

                idTimeout.current = setTimeout(() => {
                    setPowerUp((current) => ({
                        ...current,
                        slowPower: {
                            ativo: false,
                            carga: current.slowPower.carga,
                            tempoAnimacao: 5000,
                        },
                    }));
                    (slowSynth.current as Synth)?.triggerRelease();
                }, isPowerUp.current.slowPower.tempoAnimacao)!;
            }

            // --- Shrink
            if (
                evt.key === "q" &&
                !isPowerUp.current.shrinkPower.ativo &&
                isPowerUp.current.shrinkPower.carga > 0
            ) {
                setPowerUp((current) => ({
                    ...current,
                    shrinkPower: {
                        ativo: true,
                        carga: current.shrinkPower.carga - 1,
                        tempoAnimacao: 5000,
                    },
                }));

                (shrinkSynth.current as NoiseSynth)?.triggerAttack();

                idTimeout.current = setTimeout(() => {
                    setPowerUp((current) => ({
                        ...current,
                        shrinkPower: {
                            ativo: false,
                            carga: current.shrinkPower.carga,
                            tempoAnimacao: 5000,
                        },
                    }));
                    (shrinkSynth.current as NoiseSynth)?.triggerRelease();
                }, isPowerUp.current.shrinkPower.tempoAnimacao);
            }

            // ---- Super Shot
            if (
                evt.key === "e" &&
                isPowerUp.current.superShotPower.status === "preparar" &&
                isPowerUp.current.superShotPower.carga > 0
            ) {
                setPowerUp((current) => ({
                    ...current,
                    superShotPower: {
                        status: "apontar",
                        carga: current.superShotPower.carga - 1,
                    },
                }));

                (superShotApontar.current as AMSynth)?.triggerAttackRelease(
                    "C2",
                    "0.5s"
                );
            }
        };
        window.addEventListener("keydown", keydown);

        // -------- Aplicar update e lógica pós update -------------
        const update = (time: number) => {
            if (!jogador.current || !oponente.current || !bola.current)
                throw new Error("Erro");

            const deltaTime = (time - lastTime.current) / 1000;
            lastTime.current = time;

            if (gameState.current === "play") {
                //Jogador
                if (mouse.current.y)
                    jogador.current.update(
                        mouse.current.y,
                        deltaTime,
                        oponente.current.hasShrink
                    );
                //Oponente
                oponente.current.update(
                    bola.current.getY,
                    deltaTime,
                    isPowerUp.current.shrinkPower.ativo
                );
                //Bola
                const bolaReturn = bola.current.update(
                    deltaTime,
                    isPowerUp.current.slowPower.ativo,
                    isPowerUp.current.superShotPower.status === "apontar",
                    oponente.current.hasSuperShot
                );

                // ---- Vendo quem fez os pontos ----------
                if (bola.current.pontoMarcado() === "jogador") {
                    setScore((current) => ({
                        ...current,
                        jogador: current.jogador + 1,
                    }));
                    bola.current.pontoMarcado(true);
                    setQuemPontuou(() => {
                        setTimeout(() => setQuemPontuou(null), 3000);
                        return "jogador";
                    });

                    if (modeRef.current === "infinite") {
                        if (oponente.current.hasShrink) {
                            oponente.current.removerPower("shrink");
                            setPowerOponente((current) => ({
                                ...current,
                                isShrink: false,
                            }));
                        }
                        if (oponente.current.hasSuperShot) {
                            oponente.current.removerPower("super-shot");
                            setPowerOponente((current) => ({
                                ...current,
                                isSuperShot: false,
                            }));
                        }
                    }
                } else if (bola.current.pontoMarcado() === "oponente") {
                    setScore((current) => ({
                        ...current,
                        oponente: current.oponente + 1,
                    }));
                    bola.current.pontoMarcado(true);
                    setQuemPontuou(() => {
                        setTimeout(() => setQuemPontuou(null), 3000);
                        return "oponente";
                    });
                    if (oponente.current.hasShrink) {
                        oponente.current.removerPower("shrink");
                        (shrinkSynth.current as NoiseSynth)?.triggerRelease();
                        setPowerOponente((current) => ({
                            ...current,
                            isShrink: false,
                        }));
                    }
                    if (oponente.current.hasSuperShot) {
                        oponente.current.removerPower("super-shot");
                        setPowerOponente((current) => ({
                            ...current,
                            isSuperShot: false,
                        }));
                    }
                }

                // ---- Vendo se o super-shot foi aplicado ----------
                if (bolaReturn === "super-shot-complete") {
                    (superShotFogo.current as Synth)?.triggerAttackRelease(
                        "C6",
                        "0.4s"
                    );
                    setPowerUp((current) => ({
                        ...current,
                        superShotPower: {
                            status: "fogo",
                            carga: current.superShotPower.carga,
                        },
                    }));
                }
            }
        };
        // -------- Aplicar draws e lógica pós draw -------------
        const draw = () => {
            if (!jogador.current || !oponente.current || !bola.current)
                throw new Error("Erro");

            //Jogador
            jogador.current.draw(
                bola.current,
                isPowerUp.current.superShotPower.status === "apontar",
                oponente.current.hasShrink,
                modeRef.current
            );
            //Oponente
            oponente.current.draw(
                bola.current,
                false,
                isPowerUp.current.shrinkPower.ativo,
                modeRef.current
            );
            //Bola
            bola.current.draw(modeRef.current);
        };

        // -------- lógica de renderização -------------
        const render = (time: number) => {
            if (!jogador.current || !oponente.current || !bola.current)
                throw new Error("Erro");

            update(time);

            if (modeRef.current !== "dark") {
                const rastro = isPowerUp.current.slowPower.ativo ? 0.05 : 0.4;
                ctx.fillStyle = `rgba(13, 13, 13, ${rastro})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else {
                ctx.fillStyle = `#000`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            draw();

            idAnimation.current = requestAnimationFrame(render);
        };

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        idAnimation.current = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(idAnimation.current);

            if (idTimeout) clearTimeout(idTimeout.current || 0);
            window.removeEventListener("keydown", keydown);
        };
    }, []);

    return (
        <div
            className={`${visible ? "" : "hidden"} pong ${
                IS_MOBILE ? "pong--mobile" : ""
            } ${powers.slowPower.ativo ? "slow-effect" : ""} ${
                powers.shrinkPower.ativo || powersOponente.isShrink
                    ? "shrink-effect"
                    : ""
            } ${
                powers.superShotPower.status !== "preparar"
                    ? `super-shot-effect--${powers.superShotPower.status}`
                    : ""
            }`}
            onAnimationEnd={() => {
                if (
                    powers.superShotPower.status === "fogo" ||
                    oponente.current?.hasSuperShot
                )
                    setPowerUp((current) => ({
                        ...current,
                        superShotPower: {
                            status: "preparar",
                            carga: current.superShotPower.carga,
                        },
                    }));
            }}
        >
            <PowerUps
                powers={powers}
                isDarkMode={mode === "dark"}
                height={IS_MOBILE ? GAME_DIMENSIONS.canvasHeigth : "100%"}
                isMobile={IS_MOBILE}
            />
            {mode === "infinite" ? (
                <Lifes
                    pontosOponente={score}
                    qtd={3}
                    game="pong"
                    isMobile={IS_MOBILE}
                />
            ) : (
                <></>
            )}
            <div className="pong__canvas">
                <div
                    className={`pong__score--jogador pong__score--${mode} ${
                        quemPontuou === "jogador" ? "score-flash" : ""
                    }`}
                    style={{
                        top: IS_MOBILE
                            ? GAME_DIMENSIONS.canvasWidth * 0.4
                            : GAME_DIMENSIONS.canvasHeigth * 0.15,
                        left: IS_MOBILE
                            ? GAME_DIMENSIONS.canvasWidth / 4
                            : GAME_DIMENSIONS.canvasWidth * 0.35,
                        fontSize: IS_MOBILE
                            ? GAME_DIMENSIONS.canvasHeigth * 0.1
                            : GAME_DIMENSIONS.canvasHeigth * 0.08,
                    }}
                >
                    {score.jogador}
                </div>
                <div
                    className={`pong__score--oponente pong__score--${mode} ${
                        quemPontuou === "oponente" ? "score-flash" : ""
                    }`}
                    style={{
                        top: IS_MOBILE
                            ? GAME_DIMENSIONS.canvasWidth * 0.4
                            : GAME_DIMENSIONS.canvasHeigth * 0.15,
                        right: IS_MOBILE
                            ? -GAME_DIMENSIONS.canvasWidth / 3.6
                            : GAME_DIMENSIONS.canvasWidth * 0.35,
                        fontSize: IS_MOBILE
                            ? GAME_DIMENSIONS.canvasHeigth * 0.1
                            : GAME_DIMENSIONS.canvasHeigth * 0.08,
                    }}
                >
                    {score.oponente}
                </div>
                <canvas
                    ref={$canvas}
                    onMouseMove={(evt) => (mouse.current.y = evt.clientY)}
                    onTouchMove={(evt) => {
                        const touch = evt.touches[0];
                        mouse.current.y =
                            GAME_DIMENSIONS.canvasHeigth + 50 - touch.clientX;
                    }}
                ></canvas>
            </div>
        </div>
    );
}

export default Pong;
