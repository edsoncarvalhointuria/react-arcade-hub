import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../../../types/GameProps";
import "./invaders.scss";
import Nave from "../../../classes/canvas/Nave";
import NaveIcon from "../../ui/Icons/NaveIcon";
import Tiro from "../../../classes/canvas/Tiro";
import Alien from "../../../classes/canvas/Alien";
import type Rect from "../../../classes/canvas/Rect";
import Arc from "../../../classes/canvas/Arc";
import Particula from "../../../classes/canvas/Particula";
import Lifes from "../../ui/tools/Lifes";
import Asteroid from "../../../classes/canvas/Asteroid";
import Boss from "../../../classes/canvas/Boss";
import UFOIcon from "../../ui/Icons/UFOIcon";
import PowerUpDrop from "../../../classes/canvas/PowerUpDrop";
import type {
    PowersInvadersActiveType,
    PowersInvadersNamesType,
} from "../../../types/Powers";
import { criarSVG } from "../../../utils/criarSvg";
import { powersIconsComponents } from "../../../config/powerUpAssets";
import PowersActiveComponent from "../../ui/tools/PowersActiveComponent";
import { useToneContext } from "../../../contexts/AudioContext";
import { isMobileDevice } from "../../../utils/device";
import ButtonClick from "../../ui/tools/ButtonClick";

function Invaders({ visible, mode, gameState, onGameOver }: GameProps) {
    // --- Constantes ------
    const GAME_DIMENSIONS = {
        canvasHeigth: window.innerHeight,
        canvasWidth: window.innerWidth - window.innerWidth / 3.5,
    };
    const POWERS = [
        "multi_shot",
        "super_shot",
        "explosive_shot",
        "ricochetear",
        "shield",
        "mais_vida",
    ] as const satisfies readonly PowersInvadersNamesType[];
    const NAVE_COOLDOWN_PADRAO = 0.3;
    const IS_MOBILE = isMobileDevice();
    // --- States ------
    const [isImages, setIsImages] = useState(false);
    const [lifes, setLifes] = useState(3);
    const [shield, setShield] = useState(3);
    const [score, setScore] = useState(0);
    const [powersActive, setPowersActive] = useState<PowersInvadersActiveType>(
        Object.fromEntries(
            POWERS.map((v) => [v, false])
        ) as PowersInvadersActiveType
    );
    const [bossLevel, setBossLevel] = useState<1 | 2 | 3 | 4 | 5>(1);
    const [isComming, setIsComming] = useState(false);
    // ---- Refs ----
    const $canvas = useRef<HTMLCanvasElement>(null);
    const nave = useRef<Nave>(null);
    const ufo = useRef<Boss>(null);
    const asteroids = useRef<Asteroid[]>([]);
    const tiros = useRef<Tiro[]>([]);
    const aliens = useRef<Alien[][]>([[]]);
    const powersUp = useRef<PowerUpDrop[]>([]);
    const particulas = useRef<Particula[]>([]);

    const aliensSprites = useRef<HTMLImageElement>(null);
    const ufoImages = useRef<HTMLImageElement[]>([]);
    const powersImages =
        useRef<Record<PowersInvadersNamesType, HTMLImageElement>>(null);
    const naveSprite = useRef<HTMLImageElement>(null);

    const movimentoNave = useRef({ left: false, right: false });
    const frota = useRef({
        timer: 0.8,
        movendo: 0,
        y: 0,
        descendo: false,
        velocidade: 50,
        direcao: 1 as 1 | -1,
    });
    const powersActiveRef = useRef(powersActive);
    const currentNaveCooldown = useRef(NAVE_COOLDOWN_PADRAO);
    const shieldRef = useRef(shield);
    const idAnimation = useRef(0);
    const lastTimeAnimation = useRef(0);
    const fireNaveCooldown = useRef(0);
    const fireAlienCooldown = useRef(1);
    const dificuldadeTimer = useRef(1);
    const fase = useRef<"invasao" | "boss_fight">("invasao");
    const efeitoAplicado = useRef(false);
    // ---- Sons do jogo ----
    const {
        playerShootSynth,
        bossAppearanceSynth,
        alienExplosionSound,
        bigExplosionSound,
        powerUpDropSynth,
    } = useToneContext();

    useEffect(() => {
        powersActiveRef.current = powersActive;
    }, [powersActive]);

    useEffect(() => {
        shieldRef.current = shield;
        if (shield <= 0) {
            setPowersActive((v) => ({ ...v, shield: false }));
        }
    }, [shield]);

    useEffect(() => {
        if (lifes <= 0) {
            nave.current!.explodir();
            bigExplosionSound();
            setTimeout(() => onGameOver(false, score), 1500); //Adicionar pontos depois
        }
    }, [lifes]);

    useEffect(() => {
        // ---- Pegando Sprites ----
        (async () => {
            const aliensImage = new Image();
            aliensImage.src = "./space_invaders_sprite_sheet.png";

            await new Promise((res) => {
                aliensImage.onload = () => {
                    aliensSprites.current = aliensImage;
                    res("Foi");
                };
            });

            const nave = (await criarSVG(<NaveIcon />)) as HTMLImageElement;
            naveSprite.current = nave;

            const svgsUfos = [
                "#FF0000",
                "#FFFF00",
                "#FF00FF",
                "#00FFFF",
                "#DC143C",
            ].map(
                (v) =>
                    criarSVG(<UFOIcon fill={v} />) as Promise<HTMLImageElement>
            );
            ufoImages.current = await Promise.all(svgsUfos);

            const powersPromises = POWERS.map((v) =>
                criarSVG(powersIconsComponents[v]!)
            );
            const powers = await Promise.all(powersPromises);
            powersImages.current = Object.fromEntries(
                POWERS.map((v, i) => [v, powers[i]])
            ) as Record<PowersInvadersNamesType, HTMLImageElement>;

            setIsImages(true);
        })();
    }, []);

    useEffect(() => {
        const canvas = $canvas.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) throw new Error("Canvas não encontrado");

        canvas.width = GAME_DIMENSIONS.canvasWidth;
        canvas.height = GAME_DIMENSIONS.canvasHeigth;

        frota.current.velocidade = canvas.width * 0.015;
        frota.current.y = canvas.width * 0.03;

        // ---- Nave ----
        const naveD = {
            largura: canvas.width * 0.06,
            altura: canvas.width * 0.06,
        };
        nave.current = new Nave(
            canvas,
            canvas.width / 2 - naveD.largura,
            canvas.height - naveD.altura - 10,
            naveD.largura,
            naveD.altura,
            naveSprite.current,
            IS_MOBILE ? 300 : 500
        );

        // ---- UFO ----
        const ufoD = {
            width: canvas.width * 0.2,
            height: canvas.width * 0.1,
            velocidadeX: canvas.width * 0.02,
            velocidadeY: canvas.width * 0.09,
        };
        ufo.current = new Boss(
            canvas,
            canvas.width / 2 - ufoD.width / 2,
            -ufoD.height,
            ufoD.width,
            ufoD.height,
            ufoD.velocidadeX,
            ufoD.velocidadeY,
            bossLevel,
            ufoImages.current
        );

        // ---- Aliens ----
        const recortesAliens = {
            alien1: [
                { sx: 400, sy: 477, sWidth: 64, sHeight: 64 },
                { sx: 502, sy: 478, sWidth: 64, sHeight: 64 },
            ],
            alien2: [
                { sx: 387, sy: 581, sWidth: 88, sHeight: 64 },
                { sx: 491, sy: 581, sWidth: 88, sHeight: 64 },
            ],
            alien3: [
                { sx: 374, sy: 688, sWidth: 96, sHeight: 64 },
                { sx: 488, sy: 689, sWidth: 96, sHeight: 64 },
            ],
        };
        const invasao = () => {
            aliens.current = [];
            const linhas = IS_MOBILE ? 8 : 5;
            const colunas = 11;
            const margemSuperior = 30;
            const margemLateral = IS_MOBILE ? 5 : 10;
            const espacamento = IS_MOBILE ? 13 : 25;

            // const espacoUtil = canvas.width - margemLateral * 2;
            // const totalEspacamento = espacamento * (colunas - 1);
            const tamanho = canvas.width * (IS_MOBILE ? 0.03 : 0.025);

            for (let linha = 0; linha < linhas; linha++) {
                let personagem;
                let type: 1 | 2 | 3 = 1;
                switch (linha) {
                    case 0:
                        personagem = recortesAliens["alien1"];
                        type = 3;
                        break;
                    case 1:
                    case 2:
                        personagem = recortesAliens["alien2"];
                        type = 2;
                        break;
                    default:
                        personagem = recortesAliens["alien3"];
                        type = 1;
                }
                const array = [];
                for (let coluna = 0; coluna < colunas; coluna++) {
                    array.push(
                        new Alien(
                            canvas,
                            (tamanho + espacamento) * coluna + margemLateral,
                            (tamanho + espacamento / 2) * linha +
                                margemSuperior,
                            tamanho,
                            tamanho,
                            aliensSprites.current,
                            2,
                            personagem,
                            type
                        )
                    );
                }
                aliens.current.push(array);
            }
        };
        invasao();
        frota.current.movendo = aliens.current.length - 1;
        const quantidadeAliensInicial: number = aliens.current.reduce(
            (total, current) => total + current.length,
            0
        );

        // ---- Asteroids ----
        const addAsteroids = () => {
            asteroids.current = [];
            const qtd = IS_MOBILE ? 4 : 5;
            for (let i = 0; i < qtd; i++) {
                asteroids.current.push(
                    new Asteroid(
                        canvas,
                        (canvas.width / qtd) * i + 10,
                        canvas.height / 2,
                        IS_MOBILE ? 20 : 40,
                        IS_MOBILE ? 10 : 20,
                        `hsl(0, 0%, ${Math.random() * 40 + 20}%)`
                    )
                );
            }
        };
        addAsteroids();

        //------ Função para verificar colisão dos tiros nos objetos canvas --------
        const isColisaoTiro = (item1: Arc, item2: Rect | Asteroid) => {
            const item1Topo = item1.getY - item1.getRaio;
            const item1Base = item1.getY + item1.getRaio;
            const item1Esquerda = item1.getX - item1.getRaio;
            const item1Direita = item1.getX + item1.getRaio;

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
        const isColisaoRect = (item1: Rect, item2: Rect | Asteroid) => {
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

        // ---- Função para pegar os aliens que podem atira ----
        const getShotAliens = (aliensList: Alien[][]) => {
            const atiradores: Map<number, Alien> = new Map();

            aliensList.forEach((v) => {
                v.forEach((alien) => {
                    const coluna = alien.getX;
                    atiradores.set(coluna, alien);
                });
            });

            return atiradores;
        };

        // ---- Função para pegar um power up ----
        const dropPowerName = (): PowersInvadersNamesType => {
            const random = Math.random();

            if (random < 0.2) return "super_shot";
            else if (random < 0.35) return "explosive_shot";
            else if (random < 0.45) return "ricochetear";
            else if (random < 0.55) return "multi_shot";
            else if (random < 0.65) return "shield";
            else return "mais_vida";
        };

        // ---- Função que cria uma explosão de tiros ----
        const criarExplosao = (qtd: number, x: number, y: number) => {
            const fatia = (Math.PI * 2) / qtd;
            const tirosList: Tiro[] = [];
            for (let i = 0; i < qtd; i++) {
                const angulo = i * fatia;
                const velocidadeX = Math.cos(angulo) * 100;
                const velocidadeY = Math.sin(angulo) * 100;

                tirosList.push(
                    new Tiro(
                        canvas,
                        x,
                        y,
                        IS_MOBILE ? 2 : 3,
                        velocidadeX,
                        velocidadeY,
                        "nave",
                        true,
                        true,
                        true,
                        `hsl(${Math.random() * 60}, 100%, 50%)`
                    )
                );
            }

            tiros.current.push(...tirosList);
        };

        // ---- Função de Event Keyboard ----
        const keydown = (evt: KeyboardEvent) => {
            if (evt.key === "ArrowLeft") movimentoNave.current.left = true;
            else if (evt.key === "ArrowRight")
                movimentoNave.current.right = true;

            if (
                evt.key === " " &&
                fireNaveCooldown.current <= 0 &&
                !efeitoAplicado.current
            ) {
                if (powersActiveRef.current.multi_shot)
                    tiros.current.push(
                        new Tiro(
                            canvas,
                            nave.current!.centerX,
                            nave.current!.centerY,
                            IS_MOBILE ? 2 : 3,
                            400,
                            400,
                            "nave"
                        ),
                        new Tiro(
                            canvas,
                            nave.current!.centerX,
                            nave.current!.centerY,
                            IS_MOBILE ? 2 : 3,
                            100,
                            400,
                            "nave",
                            true
                        ),
                        new Tiro(
                            canvas,
                            nave.current!.centerX,
                            nave.current!.centerY,
                            IS_MOBILE ? 2 : 3,

                            100,
                            400,
                            "nave",
                            false,
                            true
                        )
                    );
                else
                    tiros.current.push(
                        new Tiro(
                            canvas,
                            nave.current!.centerX,
                            nave.current!.centerY,
                            IS_MOBILE ? 2 : 3,
                            400,
                            400,
                            "nave",
                            movimentoNave.current.left,
                            movimentoNave.current.right
                        )
                    );

                playerShootSynth.current?.triggerAttackRelease("C2", "16n");
                fireNaveCooldown.current = currentNaveCooldown.current;
            }
        };
        const keyup = (evt: KeyboardEvent) => {
            if (evt.key === "ArrowLeft") movimentoNave.current.left = false;

            if (evt.key === "ArrowRight") movimentoNave.current.right = false;
        };

        window.addEventListener("keydown", keydown);
        window.addEventListener("keyup", keyup);

        const powerD = {
            width: canvas.width * (IS_MOBILE ? 0.06 : 0.03),
            height: canvas.width * (IS_MOBILE ? 0.06 : 0.03),
            velocidade: 150,
        };

        // ------------------- UPDATE -------------------
        const update = (deltaTime: number) => {
            // ---- colldown tiros ----
            if (fireNaveCooldown.current > 0) {
                fireNaveCooldown.current -= deltaTime;
            }
            // ---- timer movimento aliens ----
            if (frota.current.timer > 0) {
                frota.current.timer -= deltaTime;
            }
            // ---- colldown tiros aliens ----
            if (fireAlienCooldown.current > 0) {
                fireAlienCooldown.current -= deltaTime;
            }

            // ---- Nave ----
            nave.current?.update(
                deltaTime,
                movimentoNave.current.left,
                movimentoNave.current.right
            );

            // ---- Aliens ----
            if (frota.current.timer <= 0 && fase.current === "invasao") {
                // ---- Pegando Velocidade X ----
                const velocidadeX =
                    frota.current.direcao * frota.current.velocidade;

                // ---- Atualizando apenas uma linha dos aliens ----
                aliens.current[frota.current.movendo].forEach((v) => {
                    const retorno = v.update(deltaTime, velocidadeX, 0);
                    if (v.getY + v.getHeigth >= nave.current!.getY)
                        setLifes(-1);
                    if (retorno) frota.current.descendo = true;
                });

                // ---- Atualizando o indice para a próxima linha ----
                frota.current.movendo =
                    (frota.current.movendo - 1 + aliens.current.length) %
                    aliens.current.length;

                // ---- Se os aliens chegarem na parede ----
                if (
                    frota.current.descendo &&
                    frota.current.movendo === aliens.current.length - 1
                ) {
                    frota.current.direcao *= -1;
                    aliens.current.forEach((v) =>
                        v.forEach((alien) =>
                            alien.update(deltaTime, 0, frota.current.y)
                        )
                    );
                    frota.current.descendo = false;
                }

                // ---- Aumentando a velocidade conforme a quantidade de aliens ----
                const dificuldade =
                    aliens.current.reduce(
                        (total, current) => current.length + total,
                        0
                    ) / quantidadeAliensInicial;

                // ---- timer para dar o delay no movimento dos aliens ----
                if (frota.current.movendo === aliens.current.length - 1) {
                    frota.current.timer = -0.1 * dificuldade;

                    // ---- Tiro dos Aliens ----
                    if (fireAlienCooldown.current <= 0) {
                        const atiradores = Array.from(
                            getShotAliens(aliens.current).values()
                        );
                        const atirador =
                            atiradores[
                                Math.floor(Math.random() * atiradores.length)
                            ];
                        tiros.current.push(
                            new Tiro(
                                canvas,
                                atirador.getX + atirador.getWidth / 2,
                                atirador.getY + atirador.getHeigth / 2,
                                IS_MOBILE ? 2 : 3,
                                10,
                                100,
                                "alien"
                            )
                        );
                        fireAlienCooldown.current =
                            1 * dificuldadeTimer.current;
                    }
                } else
                    frota.current.timer =
                        0.08 * dificuldade * dificuldadeTimer.current;
            }

            // ---- UFO ----
            if (fase.current === "boss_fight") {
                ufo.current?.update(deltaTime);
                if (
                    ufo.current!.getY + ufo.current!.getHeigth >=
                    nave.current!.getY
                )
                    setLifes(-1);

                // ---- Aplicando Efeito de Entrada ----
                if (
                    !efeitoAplicado.current &&
                    ufo.current?.getStatus === "entrando"
                ) {
                    setIsComming(true);
                    efeitoAplicado.current = true;
                } else if (
                    efeitoAplicado.current &&
                    ufo.current?.getStatus !== "entrando"
                ) {
                    efeitoAplicado.current = false;
                    setIsComming(false);
                }

                if (ufo.current?.getRaioLaser) {
                    // const raioLaser = ufo.current.getRaioLaser;
                    if (
                        !powersActiveRef.current.shield &&
                        ufo.current.verificarColisaoEDanificar(nave.current!)
                    ) {
                        setLifes(-10);
                    }

                    for (let i = 0; i < asteroids.current.length; i++) {
                        const asteroid = asteroids.current[i];

                        ufo.current.verificarColisaoEDanificar(
                            asteroid,
                            asteroid
                        );
                    }
                }
            }

            // ---- Alien colidindo com o asteroid ----
            aliens.current.forEach((v) =>
                v.forEach((alien) => {
                    for (let i = 0; i < asteroids.current.length; i++) {
                        const asteroid = asteroids.current[i];
                        if (isColisaoRect(alien, asteroid)) {
                            const x = alien.getX - asteroid.getX;
                            const y = alien.getY - asteroid.getY;

                            asteroid.receberDano(x, y, alien.getHeigth * 1.5);
                            break;
                        }
                    }
                })
            );

            // ---- UFO colidindo com o asteroid ----
            for (let i = 0; i < asteroids.current.length; i++) {
                const asteroid = asteroids.current[i];
                if (isColisaoRect(ufo.current!, asteroid)) {
                    const x = ufo.current!.centerX - asteroid.getX;
                    const y =
                        ufo.current!.getY +
                        ufo.current!.getHeigth -
                        asteroid.getY;

                    asteroid.receberDano(x, y, ufo.current!.getWidth * 0.4);
                    break;
                }
            }

            // ---- Particulas de Explosão Alien ----
            for (let i = particulas.current.length - 1; i >= 0; i--) {
                particulas.current[i].update(0.1);

                if (particulas.current[i].getVida < 0)
                    particulas.current.splice(i, 1);
            }

            // ---- Lógica dos tiros ----
            for (let tiro = tiros.current.length - 1; tiro >= 0; tiro--) {
                const tiroObj = tiros.current[tiro];
                tiroObj.update(deltaTime, powersActiveRef.current.ricochetear);
                let isBreak = false;

                // --- Tiros Asteroids ----
                for (let i = 0; i < asteroids.current.length; i++) {
                    const asteroid = asteroids.current[i];
                    if (isColisaoTiro(tiroObj, asteroid)) {
                        const x = tiroObj.getX - asteroid.getX;
                        const y = tiroObj.getY - asteroid.getY;

                        // ---- Apenas se for uma parte pintada da imagem ----
                        if (asteroid.isPixel(x, y)) {
                            asteroid.receberDano(x, y, tiroObj.getRaio * 4);
                            tiros.current.splice(tiro, 1);
                            isBreak = true;
                            break;
                        }
                        continue;
                    }
                }
                if (isBreak) break;

                if (tiroObj.getType === "nave") {
                    // ---- Tiros Aliens ----
                    for (const array of aliens.current) {
                        isBreak = false;
                        for (
                            let alien = array.length - 1;
                            alien >= 0;
                            alien--
                        ) {
                            if (
                                fase.current === "invasao" &&
                                isColisaoTiro(tiroObj, array[alien])
                            ) {
                                isBreak = true;
                                const type = array[alien].getType;

                                // ---- Adicionando um power up na tela -----
                                if (
                                    Math.random() < 0.1 &&
                                    !powersUp.current.length
                                ) {
                                    const power = dropPowerName();
                                    powersUp.current.push(
                                        new PowerUpDrop(
                                            canvas,
                                            array[alien].getX,
                                            array[alien].getY,
                                            powerD.width,
                                            powerD.height,
                                            powerD.velocidade,
                                            powerD.velocidade,
                                            power,
                                            powersImages.current![power]!
                                        )
                                    );
                                    powerUpDropSynth.current?.triggerAttackRelease(
                                        ["C4", "E4", "G4", "C5"],
                                        "16n"
                                    );
                                }

                                // ---- Criando Explosão -----
                                if (
                                    powersActiveRef.current.explosive_shot &&
                                    !tiroObj.getIsCopy
                                )
                                    criarExplosao(
                                        6,
                                        tiroObj.getX,
                                        tiroObj.getY
                                    );

                                // ---- Removendo Tiro ----
                                if (
                                    !powersActiveRef.current.super_shot ||
                                    tiroObj.getIsCopy
                                )
                                    tiros.current.splice(tiro, 1);

                                // ---- Adicionando Pontos ----
                                setScore((v) => type + v);

                                // ---- Lógica de explosão do alien ----
                                particulas.current.push(
                                    ...array[alien].explodir()
                                );

                                // ---- Removendo Alien ----
                                array.splice(alien, 1);
                                alienExplosionSound();

                                // ---- Troca de fase para o BOSS ----
                                if (
                                    !aliens.current.reduce(
                                        (p, c) => p + c.length,
                                        0
                                    )
                                ) {
                                    fase.current = "boss_fight";
                                    const power =
                                        POWERS[
                                            Math.floor(
                                                Math.random() * POWERS.length
                                            )
                                        ];
                                    powersUp.current.push(
                                        new PowerUpDrop(
                                            canvas,
                                            canvas.width / 2 - powerD.width,
                                            canvas.height / 2 - powerD.height,
                                            powerD.width,
                                            powerD.height,
                                            powerD.velocidade,
                                            powerD.velocidade,
                                            power,
                                            powersImages.current![power]!
                                        )
                                    );
                                    powerUpDropSynth.current?.triggerAttackRelease(
                                        ["C4", "E4", "G4", "C5"],
                                        "16n"
                                    );
                                    tiros.current = [];
                                    bossAppearanceSynth.current?.triggerAttackRelease(
                                        "A1",
                                        "2s"
                                    );
                                }
                                break;
                            }
                        }
                        if (isBreak) break;
                    }
                    if (isBreak) break;

                    // ---- Tiros no boss ----
                    if (
                        fase.current === "boss_fight" &&
                        isColisaoTiro(tiroObj, ufo.current!)
                    ) {
                        // ---- Criando Explosão -----
                        if (
                            powersActiveRef.current.explosive_shot &&
                            !tiroObj.getIsCopy
                        )
                            criarExplosao(6, tiroObj.getX, tiroObj.getY + 10);

                        // ---- removendo tiro ----
                        tiros.current.splice(tiro, 1);

                        // ---- lógica de aumentar dano -----
                        let dano = 1;
                        if (
                            powersActiveRef.current.super_shot &&
                            powersActiveRef.current.explosive_shot
                        )
                            dano = 2.5;
                        else if (powersActiveRef.current.super_shot) dano = 3.5;

                        // ---- dando dano no boss ----
                        ufo.current?.receberDano(dano);

                        // ----- Lógica de trocar de fase ----
                        if (
                            ufo.current!.getVida <= 0 &&
                            ufo.current!.getStatus !== "morto"
                        ) {
                            ufo.current?.explodir();
                            bigExplosionSound();
                            // ---- adicionando power up -----
                            Array.from({ length: 2 }).forEach(() => {
                                const power =
                                    POWERS[
                                        Math.floor(
                                            Math.random() * POWERS.length
                                        )
                                    ];
                                powersUp.current.push(
                                    new PowerUpDrop(
                                        canvas,
                                        canvas.width * Math.random(),
                                        canvas.height / 2 - powerD.height,
                                        powerD.width,
                                        powerD.height,
                                        powerD.velocidade,
                                        powerD.velocidade,
                                        power,
                                        powersImages.current![power]!
                                    )
                                );
                            });
                            powerUpDropSynth.current?.triggerAttackRelease(
                                ["C4", "E4", "G4", "C5"],
                                "16n"
                            );
                            setScore((v) => v + 100);
                            setTimeout(() => {
                                setBossLevel((v) => {
                                    if (v + 1 === 6) {
                                        dificuldadeTimer.current -=
                                            dificuldadeTimer.current > 0.8
                                                ? 0.05
                                                : 0;
                                        return 1;
                                    } else return (v + 1) as 1 | 2 | 3 | 4 | 5;
                                });
                                fase.current = "invasao";
                                tiros.current = [];
                            }, 3000);
                        }

                        break;
                    }
                } else if (isColisaoTiro(tiroObj, nave.current!)) {
                    // ---- Tiro dos aliesn no playes ----
                    tiros.current.splice(tiro, 1);
                    if (powersActiveRef.current.shield && shieldRef.current > 0)
                        setShield((v) => v - 1);
                    else {
                        setLifes((v) => v - 1);
                        setPowersActive(
                            () =>
                                Object.fromEntries(
                                    POWERS.map((key) => [key, false])
                                ) as PowersInvadersActiveType
                        );
                        currentNaveCooldown.current = NAVE_COOLDOWN_PADRAO;
                    }
                    break;
                }
            }

            // ---- Lógica dos tiros UFO ----
            for (
                let tiro = ufo.current!.getTiros.length - 1;
                tiro >= 0;
                tiro--
            ) {
                let tiroObj = ufo.current!.getTiros[tiro];
                let isBreak = false;

                if (isColisaoTiro(tiroObj, nave.current!)) {
                    ufo.current!.getTiros.splice(tiro, 1);
                    if (powersActiveRef.current.shield && shieldRef.current > 0)
                        setShield((v) => v - 1);
                    else {
                        setLifes((v) => v - 2);
                        setPowersActive(
                            () =>
                                Object.fromEntries(
                                    POWERS.map((key) => [key, false])
                                ) as PowersInvadersActiveType
                        );
                        currentNaveCooldown.current = NAVE_COOLDOWN_PADRAO;
                    }
                    break;
                } else {
                    for (let i = 0; i < asteroids.current.length; i++) {
                        const asteroid = asteroids.current[i];
                        if (isColisaoTiro(tiroObj, asteroid)) {
                            const x = tiroObj.getX - asteroid.getX;
                            const y = tiroObj.getY - asteroid.getY;
                            if (asteroid.isPixel(x, y)) {
                                asteroid.receberDano(x, y, tiroObj.getRaio * 4);
                                ufo.current!.getTiros.splice(tiro, 1);
                                isBreak = true;
                                break;
                            }
                        }
                    }
                }
                if (isBreak) break;
            }

            // ---- Powers Up ----
            for (let i = powersUp.current.length - 1; i >= 0; i--) {
                const power = powersUp.current[i];
                power.update(deltaTime);

                if (isColisaoRect(power, nave.current!)) {
                    const powerName = power.getType as PowersInvadersNamesType;
                    switch (powerName) {
                        case "mais_vida":
                            setLifes((v) => (v + 1 < 11 ? v + 1 : 10));
                            break;
                        case "multi_shot":
                        case "ricochetear":
                            setPowersActive((v) => ({
                                ...v,
                                [powerName]: true,
                            }));
                            break;
                        case "explosive_shot":
                        case "super_shot":
                            setPowersActive((v) => ({
                                ...v,
                                [powerName]: true,
                            }));
                            tiros.current = tiros.current.filter(
                                (v) => v.getType === "alien" || v.getIsCopy
                            );
                            currentNaveCooldown.current = 1.3;
                            break;
                        case "shield":
                            setShield(3);
                            setPowersActive((v) => ({
                                ...v,
                                [powerName]: true,
                            }));
                            break;
                    }

                    powersUp.current.splice(i, 1);
                    break;
                }
            }
        };

        const draw = () => {
            // ---- Nave ----
            nave.current?.draw(
                movimentoNave.current.left,
                movimentoNave.current.right
            );

            // ---- Aliens ----
            if (fase.current === "invasao")
                aliens.current?.forEach((v) =>
                    v.forEach((alien) => alien.draw())
                );
            // ---- UFO ----
            if (fase.current === "boss_fight") ufo.current?.draw();

            // ---- Outros ----
            particulas.current.forEach((v) => v.draw());
            tiros.current.forEach((v) =>
                v.draw(powersActiveRef.current.super_shot)
            );
            asteroids.current.forEach((v) => v.draw());
            powersUp.current.forEach((v) => v.draw());
        };

        const render = (time: number) => {
            let deltaTime = 0;
            if (lastTimeAnimation.current)
                deltaTime = (time - lastTimeAnimation.current) / 1000;
            lastTimeAnimation.current = time;

            if (gameState.current === "play") update(deltaTime);

            // ---- Removendo Tiros que sairam da tela ----
            tiros.current = tiros.current.filter(
                (v) =>
                    v.getY >= 0 &&
                    v.getX >= 0 &&
                    v.getX <= canvas.width &&
                    v.getY <= canvas.height
            );

            // ---- Removendo PowersUp que sairam da tela ----
            powersUp.current = powersUp.current.filter(
                (v) => v.getY < canvas.height
            );

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            draw();

            idAnimation.current = requestAnimationFrame(render);
        };

        idAnimation.current = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(idAnimation.current);
            window.removeEventListener("keydown", keydown);
            window.removeEventListener("keyup", keyup);
        };
    }, [mode, isImages, bossLevel]);
    return (
        <div
            className={`${visible ? "" : "hidden"} ${
                isComming ? "invaders--boss-comming" : ""
            } invaders`}
        >
            <div
                className="invaders__score"
                style={{
                    left: (window.innerWidth - GAME_DIMENSIONS.canvasWidth) / 4,
                }}
            >
                <p className="invaders__score--title">Score</p>
                <p className="invaders__score--pontos">{score}</p>
            </div>
            <Lifes
                game="invaders"
                qtd={lifes}
                position={(window.innerWidth - GAME_DIMENSIONS.canvasWidth) / 4}
            />
            <PowersActiveComponent
                positionLeft={
                    (window.innerWidth - GAME_DIMENSIONS.canvasWidth) / 4
                }
                powersActive={powersActive}
                shieldInvaders={shield}
            />

            {IS_MOBILE ? (
                <div className="invaders__buttons">
                    <ButtonClick type="left" moveInvaders={movimentoNave} />
                    <ButtonClick type="right" moveInvaders={movimentoNave} />
                    <ButtonClick type="space" />
                </div>
            ) : (
                <></>
            )}
            <canvas ref={$canvas}></canvas>
        </div>
    );
}

export default Invaders;
